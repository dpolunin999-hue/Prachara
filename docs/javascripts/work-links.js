(() => {
  "use strict";
  const panel = document.querySelector("[data-work-links]");
  if (!panel) return;
  const article = document.querySelector(".md-content__inner");
  const hub = article?.querySelector(".role-hub");
  const guide = article?.querySelector(".care-guide, .program-guide, .ads-guide, .content-guide");
  if (hub) hub.querySelector(".role-setup")?.after(panel);
  else if (guide) {
    const intro = [...guide.children].find(el => el.tagName === "P" && !el.querySelector(".care-return"));
    if (intro) intro.after(panel);
  } else article?.querySelector("p")?.after(panel);
  const key = "prachar-work-links-v1";
  const names = {calendar:"Календарь",signup:"Запись на встречу",registrations:"Ответы регистрации",inquiries:"Учёт обращений",chat:"Рабочий чат"};
  const appUrl = "https://dpolunin999-hue.github.io/Prachara/app/";
  const form = panel.querySelector("form");
  const status = panel.querySelector('[role="status"]');
  const edit = panel.querySelector(".work-links__edit");
  const copy = panel.querySelector(".work-links__copy");
  let saved = {};
  function safeUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      if (!["https:","http:"].includes(url.protocol) || url.username || url.password) return "";
      return url.href;
    } catch { return ""; }
  }
  function clean(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const result = {city:typeof data.city === "string" ? data.city.slice(0,80) : ""};
    Object.keys(names).forEach(name => {result[name] = safeUrl(typeof data[name] === "string" ? data[name] : "");});
    return result;
  }
  function load() {try {saved = clean(JSON.parse(localStorage.getItem(key) || "{}"));} catch {saved = {};}}
  function editor(open, field) {
    form.hidden = !open;
    edit.setAttribute("aria-expanded",String(open));
    if (open) {
      form.elements.city.value = saved.city || "";
      Object.keys(names).forEach(name => {form.elements[name].value = saved[name] || "";});
      form.elements[field || "city"].focus();
    } else edit.focus({preventScroll:true});
  }
  const toolLinks = [...document.querySelectorAll("[data-work-key]")];
  const originalLabels = new Map(toolLinks.map(a=>[a,a.textContent]));
  function render() {
    panel.querySelector(".work-city-name").textContent = saved.city ? " · " + saved.city : "";
    const shortcuts = panel.querySelector(".work-links__shortcuts");
    shortcuts.replaceChildren();
    for (const [name,label] of Object.entries({...names,app:"Приложение заботы"})) {
      const url = name === "app" ? appUrl : saved[name];
      if (!url) continue;
      const link = document.createElement("a");
      link.href = url;link.textContent = label;link.className = "work-links__tool";
      if (name !== "app") {link.target="_blank";link.rel="noopener noreferrer";link.title="Открыть в новой вкладке";}
      shortcuts.append(link);
    }
    const hasLinks = Object.keys(names).some(name=>saved[name]);
    panel.querySelector(".work-links__empty").hidden = hasLinks;
    copy.hidden = !hasLinks;
    edit.textContent = hasLinks ? "Изменить ссылки" : "Добавить ссылки";
    toolLinks.forEach(link => {
      const url = saved[link.dataset.workKey];
      link.textContent = url ? originalLabels.get(link) : "Добавить ссылку: " + (names[link.dataset.workKey] || "инструмент").toLocaleLowerCase("ru");
      if (url) {link.href=url;link.target="_blank";link.rel="noopener noreferrer";}
      else {link.removeAttribute("target");link.removeAttribute("rel");link.href="#work-links-form";}
    });
  }
  toolLinks.forEach(link=>link.addEventListener("click",event=>{
    if (saved[link.dataset.workKey]) return;
    event.preventDefault();panel.open=true;editor(true,link.dataset.workKey);
    panel.scrollIntoView({block:"center"});
  }));
  edit.addEventListener("click",()=>editor(form.hidden));
  panel.querySelector(".work-links__cancel").addEventListener("click",()=>editor(false));
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const next = {city:form.elements.city.value.trim()};
    for (const name of Object.keys(names)) {
      const field=form.elements[name];const raw=field.value.trim();const url=safeUrl(raw);
      if (raw && !url) {status.textContent="Введите полную ссылку http:// или https:// без логина и пароля.";field.focus();return;}
      next[name]=url;
    }
    saved=next;let persisted=true;
    try {localStorage.setItem(key,JSON.stringify(saved));} catch {persisted=false;}
    render();editor(false);
    status.textContent=persisted ? "Ссылки сохранены в этом браузере." : "Браузер не сохранил ссылки. Они доступны до обновления страницы; скопируйте их для команды.";
  });
  copy.addEventListener("click",async()=>{
    const text=[saved.city ? "Рабочие ссылки · " + saved.city : "Рабочие ссылки города",...Object.entries(names).filter(([name])=>saved[name]).map(([name,label])=>label+": "+saved[name]),"Приложение заботы: "+appUrl].join("\n");
    try {await navigator.clipboard.writeText(text);status.textContent="Скопировано. Можно закрепить в рабочем чате.";}
    catch {status.textContent="Не удалось скопировать. Откройте настройку и скопируйте нужные ссылки из полей.";}
  });
  window.addEventListener("storage",event=>{if(event.key===key){load();render();}});
  load();render();
})();
