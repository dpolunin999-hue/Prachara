import test from "node:test";
import assert from "node:assert/strict";
import { avatarSources, profileImages, publicImageUrl } from "./avatar-sources.mjs";

test("explicit contacts use Telegram, VK, MAX priority regardless of input order", () => {
  const sources = avatarSources("https://max.ru/anna https://vk.ru/id123 @Anna_123");
  assert.deepEqual(sources.map(x => x.provider), ["telegram", "vk", "max"]);
  assert.equal(sources[0].page, "https://t.me/Anna_123");
  assert.equal(sources[1].page, "https://vk.com/id123");
});
test("names, phones, email addresses and Telegram service links are not guessed", () => {
  for (const contact of ["Анна", "+79991234567", "anna@example.com", "https://t.me/share?url=hello", "https://evil.t.me/anna", "https://vk.com.evil.test/id123"]) {
    assert.deepEqual(avatarSources(contact), [], contact);
  }
});
test("public image URLs reject untrusted hosts, unsafe schemes and platform placeholders", () => {
  for (const value of ["http://127.0.0.1/photo", "https://localhost/a", "https://userapi.com.evil.test/a", "data:image/svg+xml,a", "https://telegram.org/img/t_logo.png", "https://u:p@t.me/a", "https://t.me:8080/a"]) {
    assert.equal(publicImageUrl(value, "https://t.me/anna"), "", value);
  }
  assert.equal(publicImageUrl("https://cdn4.telesco.pe/file/photo.jpg?a=1&amp;b=2", "https://t.me/anna"), "https://cdn4.telesco.pe/file/photo.jpg?a=1&b=2");
});
test("metadata supports either attribute order and deduplicates avatar URLs", () => {
  const html = `<meta content='https://sun1.userapi.com/a.jpg' property='og:image'><meta property="og:image" content="https://sun1.userapi.com/a.jpg"><meta name="twitter:image" content="https://evil.test/a.jpg">`;
  assert.deepEqual(profileImages(html, "https://vk.com/id123"), ["https://sun1.userapi.com/a.jpg"]);
});
