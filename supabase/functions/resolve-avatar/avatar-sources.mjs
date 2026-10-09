// Resolve only explicitly supplied social profiles; never guess an identity by name.
export function avatarSources(contact = "") {
  const raw = String(contact), sources = [];
  const telegram = raw.match(/(?:^|[\s,;(<])(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([a-z0-9_]{3,32})(?=[/?#\s,;)]|$)/i)
    || raw.match(/(?:^|[\s,;])@([a-z0-9_]{3,32})(?=[\s,;]|$)/i);
  if (telegram && !["share", "joinchat", "addstickers", "proxy"].includes(telegram[1].toLowerCase())) {
    sources.push({ provider: "telegram", page: `https://t.me/${telegram[1]}`, direct: `https://t.me/i/userpic/320/${telegram[1]}.jpg` });
  }
  /** @type {Array<[string, RegExp, string]>} */
  const networks = [
    ["vk", /(?:^|[\s,;(<])(?:https?:\/\/)?(?:www\.)?(?:vk\.com|vk\.ru)\/([a-z0-9_.-]+)(?=[/?#\s,;)]|$)/ig, "https://vk.com/"],
    ["max", /(?:^|[\s,;(<])(?:https?:\/\/)?(?:web\.)?max\.ru\/([a-z0-9_.-]+)(?=[/?#\s,;)]|$)/ig, "https://max.ru/"],
  ];
  for (const [provider, pattern, base] of networks) {
    for (const match of raw.matchAll(pattern)) sources.push({ provider, page: base + match[1] });
  }
  return sources;
}

export function publicImageUrl(value, base) {
  try {
    const url = new URL(String(value).replaceAll("&amp;", "&"), base);
    const allowed = ["t.me", "telegram.org", "telesco.pe", "telegram-cdn.org", "vk.com", "vk.ru", "userapi.com", "vkuserphoto.ru", "vkuser.net", "max.ru", "okcdn.ru"];
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return "";
    if (!allowed.some(host => url.hostname === host || url.hostname.endsWith("." + host))) return "";
    if (/(?:t_logo|telegram_logo|no[_-]?photo|blank|camera|default_avatar|\/logo[./_-])/i.test(url.pathname)) return "";
    return url.href;
  } catch { return ""; }
}

export function profileImages(html, base) {
  const found = [];
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attributes = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(match => [match[1].toLowerCase(), match[2]]));
    if (/^(og:image(?::secure_url)?|twitter:image)$/i.test(attributes.property || attributes.name || "")) {
      const url = publicImageUrl(attributes.content, base);
      if (url && !found.includes(url)) found.push(url);
    }
  }
  return found;
}
