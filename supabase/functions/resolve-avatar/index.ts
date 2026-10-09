import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { avatarSources, profileImages, publicImageUrl } from "./avatar-sources.mjs";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const bucket = "person-avatars", maximumBytes = 1024 * 1024;

async function socialFetch(raw: string): Promise<Response | null> {
  let url = publicImageUrl(raw, raw);
  for (let redirects = 0; url && redirects < 5; redirects++) {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(4500), headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html,image/*" } });
    if (response.status >= 300 && response.status < 400) {
      const next = publicImageUrl(response.headers.get("location") || "", url);
      await response.body?.cancel(); url = next; continue;
    }
    if (response.ok) return response;
    await response.body?.cancel(); return null;
  }
  return null;
}

async function readLimited(response: Response, limit: number): Promise<Uint8Array | null> {
  if (Number(response.headers.get("content-length")) > limit) { await response.body?.cancel(); return null; }
  const reader = response.body?.getReader(); if (!reader) return null;
  const chunks: Uint8Array[] = []; let total = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    total += value.length; if (total > limit) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

async function imageFrom(url: string) {
  try {
    const response = await socialFetch(url); if (!response) return null;
    const type = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
    if (!["image/jpeg", "image/png", "image/webp"].includes(type)) { await response.body?.cancel(); return null; }
    const bytes = await readLimited(response, maximumBytes);
    if (!bytes || bytes.length < 100) return null;
    const valid = type === "image/jpeg" ? bytes[0] === 255 && bytes[1] === 216 : type === "image/png" ? bytes[0] === 137 && bytes[1] === 80 : new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    return valid ? { bytes, type, extension: type === "image/jpeg" ? "jpg" : type.slice(6) } : null;
  } catch { return null; }
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return reply({ error: "method_not_allowed" }, 405);
  try {
    const authorization = request.headers.get("Authorization") || "";
    if (!authorization.startsWith("Bearer ")) return reply({ error: "auth_required" }, 401);
    const projectUrl = Deno.env.get("SUPABASE_URL")!, anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const db = createClient(projectUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return reply({ error: "auth_required" }, 401);
    const { personId } = await request.json();
    if (!Number.isSafeInteger(personId) || personId < 1) return reply({ error: "invalid_person" }, 400);
    const { data: person, error } = await db.from("people").select("id,city_id,contact,photo_url").eq("id", personId).single();
    if (error || !person) return reply({ error: "person_unavailable" }, 404);
    const { data: allowed, error: permissionError } = await db.rpc("can_manage_city", { target: person.city_id });
    if (permissionError || !allowed) return reply({ error: "permission_denied" }, 403);
    // A manual upload or URL always wins over automatic discovery.
    if (person.photo_url && !/^(https?:\/\/)?t\.me\/i\/userpic\//i.test(person.photo_url)) return reply({ status: "existing", photoUrl: person.photo_url });
    const sources = avatarSources(person.contact); if (!sources.length) return reply({ status: "no_source" });
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(person.contact)))].map(x => x.toString(16).padStart(2, "0")).join("");
    const admin = createClient(projectUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    // Shared cooldown prevents different devices repeatedly fetching the same closed profile.
    const marker = `checks/${personId}.json`;
    const { data: previous } = await admin.storage.from(bucket).download(marker);
    if (previous) {
      const check = JSON.parse(await previous.text());
      if (check.hash === hash && Date.now() - check.at < 24 * 60 * 60 * 1000) return reply({ status: "recently_checked" });
    }
    let found = null, provider = "";
    for (const source of sources) {
      try {
        const response = await socialFetch(source.page);
        if (response) {
          const bytes = await readLimited(response, 512 * 1024);
          if (bytes) for (const url of profileImages(new TextDecoder().decode(bytes), source.page)) {
            found = await imageFrom(url); if (found) break;
          }
        }
        if (!found && source.direct) found = await imageFrom(source.direct);
        if (found) { provider = source.provider; break; }
      } catch { /* Try the next explicitly supplied social profile. */ }
    }
    const { error: bucketError } = await admin.storage.createBucket(bucket, { public: true, fileSizeLimit: maximumBytes, allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/json"] });
    if (bucketError && !/already exists|duplicate/i.test(bucketError.message)) throw bucketError;
    // Store a hash rather than the actual social contact in the public cooldown object.
    await admin.storage.from(bucket).upload(marker, JSON.stringify({ hash, at: Date.now() }), { contentType: "application/json", upsert: true });
    if (!found) return reply({ status: "not_found" });
    const path = `photos/${personId}-${hash.slice(0, 12)}.${found.extension}`;
    const { error: uploadError } = await admin.storage.from(bucket).upload(path, found.bytes, { contentType: found.type, cacheControl: "31536000", upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl: photoUrl } } = admin.storage.from(bucket).getPublicUrl(path);
    // Optimistic update: do not overwrite a photo/contact changed while fetching the profile.
    const { data: changed, error: updateError } = await db.from("people").update({ photo_url: photoUrl }).eq("id", personId).eq("contact", person.contact).eq("photo_url", person.photo_url || "").select("id").maybeSingle();
    if (updateError) throw updateError;
    if (!changed) return reply({ status: "changed_in_parallel" });
    return reply({ status: "updated", photoUrl, source: provider });
  } catch (error) {
    console.error("Avatar resolution failed:", error instanceof Error ? error.message : "unknown");
    return reply({ error: "avatar_unavailable" }, 503);
  }
});
