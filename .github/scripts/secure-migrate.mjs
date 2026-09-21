import fs from "node:fs";
import crypto from "node:crypto";

const envelope = JSON.parse(process.env.MIGRATION_ENVELOPE || "{}");
if (!envelope.encryptedKey || !envelope.iv || !envelope.ciphertext) {
  throw new Error("Encrypted migration payload is missing");
}

const subtle = crypto.webcrypto.subtle;
const pem = fs.readFileSync(".migration-key/private.pem", "utf8");
const der = Buffer.from(
  pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, ""),
  "base64"
);
const privateKey = await subtle.importKey(
  "pkcs8",
  der,
  { name: "RSA-OAEP", hash: "SHA-256" },
  false,
  ["decrypt"]
);
const rawAesKey = await subtle.decrypt(
  { name: "RSA-OAEP" },
  privateKey,
  Buffer.from(envelope.encryptedKey, "base64")
);
const aesKey = await subtle.importKey(
  "raw",
  rawAesKey,
  { name: "AES-GCM" },
  false,
  ["decrypt"]
);
const clear = await subtle.decrypt(
  { name: "AES-GCM", iv: Buffer.from(envelope.iv, "base64") },
  aesKey,
  Buffer.from(envelope.ciphertext, "base64")
);
const payload = JSON.parse(Buffer.from(clear).toString("utf8"));

const base = payload.supabaseUrl.replace(/\/$/, "");
const anonKey = payload.anonKey;
const email =
  "migration-" + Date.now() + "-" + crypto.randomBytes(6).toString("hex") + "@example.com";
const password = crypto.randomBytes(36).toString("base64url") + "aA1!";

const signupResponse = await fetch(base + "/auth/v1/signup", {
  method: "POST",
  headers: {
    apikey: anonKey,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email,
    password,
    data: { name: "Служебный перенос данных" }
  })
});
const signupText = await signupResponse.text();
if (!signupResponse.ok) {
  throw new Error("Supabase signup failed with HTTP " + signupResponse.status);
}
const signup = JSON.parse(signupText);
if (!signup.access_token || !signup.user?.id) {
  throw new Error("Supabase did not issue a session. Disable email confirmation and retry.");
}
const token = signup.access_token;
const userId = signup.user.id;

async function rest(table, params = {}, options = {}) {
  const query = new URLSearchParams(params).toString();
  const url = base + "/rest/v1/" + table + (query ? "?" + query : "");
  const headers = {
    apikey: anonKey,
    Authorization: "Bearer " + token
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.prefer) headers.Prefer = options.prefer;
  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      (options.method || "GET") + " " + table + " failed with HTTP " + response.status +
      (text ? ": " + text.slice(0, 300) : "")
    );
  }
  return text ? JSON.parse(text) : null;
}

let profile = [];
for (let attempt = 0; attempt < 10; attempt += 1) {
  profile = await rest("profiles", { select: "id,role", id: "eq." + userId });
  if (profile.length) break;
  await new Promise(resolve => setTimeout(resolve, 500));
}
if (!profile.length) throw new Error("Profile trigger did not create a profile");

const cities = await rest("cities", { select: "id,name" });
const cityByName = new Map(cities.map(city => [city.name, city.id]));
for (const required of ["Тюмень", "Златоуст"]) {
  if (!cityByName.has(required)) throw new Error("Required city is missing: " + required);
}

async function selectCity(cityId) {
  const rows = await rest(
    "profiles",
    { id: "eq." + userId, select: "id,preferred_city_id" },
    {
      method: "PATCH",
      body: { preferred_city_id: cityId },
      prefer: "return=representation"
    }
  );
  if (!rows?.length) throw new Error("Could not select migration city");
}

function normalized(value) {
  return String(value || "").trim().toLocaleLowerCase("ru");
}
function personKey(row) {
  return normalized(row.first_name) + "|" + normalized(row.last_name);
}
function later(a, b) {
  if (!a) return b || null;
  if (!b) return a || null;
  return new Date(a) >= new Date(b) ? a : b;
}
function earlierDate(a, b) {
  if (!a) return b || null;
  if (!b) return a || null;
  return a <= b ? a : b;
}
function mergedNote(current, incoming) {
  const a = String(current || "").trim();
  const b = String(incoming || "").trim();
  if (!b) return a;
  if (!a) return b;
  if (normalized(a).includes(normalized(b))) return a;
  return a + "\n" + b;
}

const importedPeople = new Map();
for (const cityName of ["Тюмень", "Златоуст"]) {
  const cityId = cityByName.get(cityName);
  await selectCity(cityId);
  const current = await rest("people", { select: "*", city_id: "eq." + cityId });
  const currentByKey = new Map(current.map(person => [personKey(person), person]));

  for (const incoming of payload.people.filter(person => person.city_name === cityName)) {
    const key = personKey(incoming);
    let person = currentByKey.get(key);
    if (!person) {
      const inserted = await rest(
        "people",
        { select: "*" },
        {
          method: "POST",
          body: {
            city_id: cityId,
            first_name: incoming.first_name,
            last_name: incoming.last_name || "",
            contact: incoming.contact || "",
            note: incoming.note || "",
            source: incoming.source || "unknown",
            acquaintance_date: incoming.acquaintance_date || null,
            photo_url: incoming.photo_url || "",
            practice_status: incoming.practice_status || "unknown",
            last_visit: incoming.last_visit || null,
            last_contact: incoming.last_contact || null,
            visits: Number(incoming.visits || 0),
            created_by: userId,
            created_at: incoming.created_at
          },
          prefer: "return=representation"
        }
      );
      person = inserted[0];
      currentByKey.set(key, person);
    } else {
      const changes = {
        contact: person.contact || incoming.contact || "",
        note: mergedNote(person.note, incoming.note),
        source:
          !person.source || person.source === "unknown"
            ? incoming.source || "unknown"
            : person.source,
        acquaintance_date: earlierDate(
          person.acquaintance_date,
          incoming.acquaintance_date
        ),
        photo_url: person.photo_url || incoming.photo_url || "",
        practice_status:
          !person.practice_status || person.practice_status === "unknown"
            ? incoming.practice_status || "unknown"
            : person.practice_status,
        last_visit: later(person.last_visit, incoming.last_visit),
        last_contact: later(person.last_contact, incoming.last_contact),
        visits: Math.max(Number(person.visits || 0), Number(incoming.visits || 0))
      };
      const updated = await rest(
        "people",
        { id: "eq." + person.id, select: "*" },
        {
          method: "PATCH",
          body: changes,
          prefer: "return=representation"
        }
      );
      person = updated[0];
      currentByKey.set(key, person);
    }
    importedPeople.set(cityName + "|" + key, person);
  }
}

const eventData = payload.event;
const eventCityId = cityByName.get(eventData.city_name);
await selectCity(eventCityId);
const cityEvents = await rest("events", {
  select: "*",
  city_id: "eq." + eventCityId
});
const targetDate = eventData.event_date.slice(0, 10);
function dateInYekaterinburg(value) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Yekaterinburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return values.year + "-" + values.month + "-" + values.day;
}
let event = cityEvents.find(item =>
  item.title === eventData.title &&
  dateInYekaterinburg(item.event_date) === targetDate
);
if (!event) {
  const inserted = await rest(
    "events",
    { select: "*" },
    {
      method: "POST",
      body: {
        city_id: eventCityId,
        title: eventData.title,
        event_date: eventData.event_date,
        created_by: userId,
        created_at: eventData.created_at
      },
      prefer: "return=representation"
    }
  );
  event = inserted[0];
}

let eventAttendance = await rest("attendance", {
  select: "*",
  event_id: "eq." + event.id
});
for (const mark of eventData.attendance) {
  const person = importedPeople.get(
    eventData.city_name + "|" + personKey(mark)
  );
  if (!person) throw new Error("Attendance person was not imported");
  const existing = eventAttendance.find(row => row.person_id === person.id);
  if (existing && existing.is_new !== mark.is_new) {
    await rest("attendance", { id: "eq." + existing.id }, { method: "DELETE" });
    eventAttendance = eventAttendance.filter(row => row.id !== existing.id);
  }
  if (!eventAttendance.some(row => row.person_id === person.id)) {
    const inserted = await rest(
      "attendance",
      { select: "*" },
      {
        method: "POST",
        body: {
          event_id: event.id,
          person_id: person.id,
          is_new: mark.is_new
        },
        prefer: "return=representation"
      }
    );
    eventAttendance.push(inserted[0]);
  }
}

for (const schedule of payload.schedules) {
  const cityId = cityByName.get(schedule.city_name);
  await selectCity(cityId);
  const rows = await rest("city_schedules", {
    select: "id",
    city_id: "eq." + cityId,
    weekday: "eq." + schedule.weekday,
    event_type: "eq." + schedule.event_type
  });
  if (!rows.length) {
    await rest(
      "city_schedules",
      {},
      {
        method: "POST",
        body: {
          city_id: cityId,
          weekday: schedule.weekday,
          event_type: schedule.event_type,
          created_by: userId
        },
        prefer: "return=minimal"
      }
    );
  }
}

if (importedPeople.size !== 6) {
  throw new Error("Imported people verification failed");
}
const verifiedAttendance = await rest("attendance", {
  select: "id",
  event_id: "eq." + event.id
});
if (verifiedAttendance.length < 3) {
  throw new Error("Attendance verification failed");
}
for (const schedule of payload.schedules) {
  const cityId = cityByName.get(schedule.city_name);
  const rows = await rest("city_schedules", {
    select: "id",
    city_id: "eq." + cityId,
    weekday: "eq." + schedule.weekday,
    event_type: "eq." + schedule.event_type
  });
  if (!rows.length) throw new Error("Schedule verification failed");
}

await rest(
  "profiles",
  { id: "eq." + userId },
  {
    method: "PATCH",
    body: { preferred_city_id: null, city_id: null },
    prefer: "return=minimal"
  }
);

console.log("MIGRATION_OK people=6 events=1 attendance=3 schedules=4");
