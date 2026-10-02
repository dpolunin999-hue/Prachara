(() => {
  "use strict";
  const article = document.querySelector(".md-content__inner");
  if (!article) return;
  document.documentElement.classList.add("prachar-js");
  const finder = article.querySelector(".task-finder");
  const group = finder?.dataset.taskGroup;

  function wrapSection(heading, kind = "instruction-section") {
    if (!heading || heading.parentElement !== article) return null;
    const details = document.createElement("details");
    details.className = kind;
    const summary = document.createElement("summary");
    const body = document.createElement("div");
    body.className = "instruction-section__body";
    let next = heading.nextElementSibling;
    article.insertBefore(details, heading);
    summary.append(heading);
    details.append(summary, body);
    while (next && next.tagName !== "H2" && next !== finder && !next.classList.contains("back-button")) {
      const following = next.nextElementSibling;
      body.append(next);
      next = following;
    }
    return details;
  }

  if (group && group !== "home") {

    const intro = article.querySelector(".direction-intro");
    const minimum = article.querySelector(".direction-start");
    if (intro) {
      const brief = document.createElement("section");
      brief.className = "direction-brief";
      brief.setAttribute("aria-labelledby", "direction-mission-title");
      const label = document.createElement("h2");
      label.id = "direction-mission-title";
      label.textContent = "Ваша главная задача";
      const mission = document.createElement("p");
      mission.className = "direction-mission";
      // The role's purpose stays in the Markdown source shared with Word.
      mission.textContent = intro.querySelector("h2")?.nextElementSibling?.textContent || "";
      const begin = document.createElement("a");
      begin.className = "md-button md-button--primary direction-begin";
      begin.href = "#direction-step-1";
      begin.textContent = "Начать с первого шага →";
      intro.before(brief);
      brief.append(label, mission, begin);
      const context = document.createElement("details");
      context.className = "direction-context";
      const summary = document.createElement("summary");
      summary.textContent = "Какой результат должен получиться";
      brief.append(context);
      context.append(summary, intro);
    }

    if (minimum) {
      const titles = {
        ads: ["Уточнить ближайшую встречу", "Оформить группу ВКонтакте", "Опубликовать объявление Avito", "Наладить ответы на обращения"],
        programs: ["Выбрать формат и пользу встречи", "Определить ведущего, место и время", "Собрать сценарий и команду", "Провести встречу и передать заботнику"],
        care: ["Подготовить учёт и общий чат", "Ответить и выбрать следующий шаг", "Помочь человеку прийти впервые", "Продолжить контакт после встречи"],
        secretary: ["Распределить ответственность", "Согласовать ближайшую программу", "Записать задачи и сроки", "Разобрать результат с командой"]
      };
      const heading = minimum.querySelector("h2");
      if (heading) heading.firstChild.textContent = "С чего начать ";
      const list = minimum.querySelector(":scope > ol");
      if (list) {
        list.classList.add("start-route");
        [...list.children].forEach((item, index) => {
          const detail = document.createElement("details");
          detail.className = "start-route__step";
          detail.id = "direction-step-" + (index + 1);
          detail.open = index === 0;
          const summary = document.createElement("summary");
          const number = document.createElement("span");
          number.className = "start-route__number";
          number.textContent = String(index + 1).padStart(2, "0");
          const title = document.createElement("span");
          title.textContent = titles[group]?.[index] || "Шаг " + (index + 1);
          summary.append(number, title);
          const body = document.createElement("div");
          body.className = "start-route__body";
          while (item.firstChild) body.append(item.firstChild);
          body.querySelectorAll("a").forEach(link => {
            link.textContent = link.textContent.replace(/^Инструкция:\s*/, "");
            link.classList.add("start-route__link");
          });
          detail.append(summary, body);
          item.append(detail);
        });
      }
      const roadmap = minimum.querySelector(".direction-roadmap");
      if (roadmap) {
        const headings = [...roadmap.querySelectorAll(":scope > h3")];
        headings.forEach((heading, index) => {
          const detail = document.createElement("details");
          detail.className = "direction-stage";
          detail.id = index === 0 ? "direction-routine" : "direction-development";
          const summary = document.createElement("summary");
          summary.textContent = heading.textContent.replace("¶", "").trim();
          if (heading.id) {
            const anchor = document.createElement("span");
            anchor.id = heading.id;
            anchor.setAttribute("aria-hidden", "true");
            summary.prepend(anchor);
          }
          const body = document.createElement("div");
          body.className = "direction-stage__body";
          let next = heading.nextElementSibling;
          while (next && next.tagName !== "H3") {
            const following = next.nextElementSibling;
            body.append(next); next = following;
          }
          detail.append(summary, body);
          roadmap.before(detail);
        });
        roadmap.remove();
      }
      const stages = document.createElement("nav");
      stages.className = "direction-stage-nav";
      stages.setAttribute("aria-label", "Этапы работы в направлении");
      const routes = [["direction-minimum", "1", "С чего начать"], ["direction-routine", "2", "Регулярная работа"], ["direction-development", "3", "Развитие"]];
      routes.forEach(([id, number, title]) => {
        const link = document.createElement("a");
        link.href = "#" + id;
        const index = document.createElement("span");
        index.textContent = number; index.className = "direction-stage-nav__number";
        const text = document.createElement("span"); text.textContent = title;
        link.append(index, text); stages.append(link);
      });
      minimum.prepend(stages);
      const updateStage = id => stages.querySelectorAll("a").forEach(link => {
        if (link.hash === "#" + id) link.setAttribute("aria-current", "step");
        else link.removeAttribute("aria-current");
      });
      updateStage("direction-minimum");
      stages.addEventListener("click", event => {
        const link = event.target.closest("a");
        if (link) updateStage(link.hash.slice(1));
      });
      addEventListener("hashchange", () => {
        const id = location.hash.slice(1);
        if (routes.some(route => route[0] === id)) updateStage(id);
        else if (id.startsWith("direction-step-")) updateStage("direction-minimum");
      });
    }

    const sections = [...article.querySelectorAll(":scope > h2")];
    for (const heading of sections) {
      const title = heading.textContent.replace("¶", "").trim();
      const isOverview = /^(Этапы пути|Рабочий порядок инструментов)/.test(title);
      const isInstruction = group === "ads" && /^[1-6]\./.test(title)
        || group === "programs" && /^(Забота на самой встрече|Small talk|Библиотека интерактивов|Виды программ|Базовый маршрут подготовки|Вопросы для полного)/.test(title)
        || group === "secretary" && /^(Карта системы|Основные области работы|Целевые действия|Созвон команды)/.test(title);
      if (isOverview || isInstruction) wrapSection(heading, isOverview ? "instruction-section instruction-section--overview" : "instruction-section");
    }
    article.classList.add("direction-page");
  }

  if (finder) {
    const intro = article.querySelector(".direction-intro, .prachar-hero");
    if (intro) (article.querySelector(".direction-start") || intro.closest(".direction-context") || intro).after(finder);
    else article.querySelector("h1")?.after(finder);
    const query = finder.querySelector("input");
    const rows = [...finder.querySelectorAll(".task-results > li")];
    const showAll = finder.querySelector(".finder-show-all");
    const count = finder.querySelector(".finder-count");
    const empty = finder.querySelector(".task-finder__empty");
    let expanded = false;
    const normalize = value => value.toLocaleLowerCase("ru").replaceAll("ё", "е").trim();
    function renderTasks() {
      const words = normalize(query.value).split(/\s+/).filter(Boolean);
      const candidates = rows.filter(row => group === "home" || row.dataset.taskCategory === group);
      const matched = candidates.filter(row => words.every(word => normalize(row.textContent + " " + row.dataset.taskKeywords).includes(word)));
      const shown = words.length || expanded || (group !== "care" && group !== "home")
        ? matched : matched.filter(row => group === "home" ? row.dataset.featured === "true" : ["care-step-1","care-step-2","care-step-3","care-step-4","care-step-6","care-step-9","care-resources"].some(id => row.querySelector("a").hash === "#" + id));
      rows.forEach(row => { row.hidden = !shown.includes(row); });
      count.textContent = words.length ? "Найдено действий: " + matched.length : "Показано " + shown.length + " из " + candidates.length;
      empty.hidden = matched.length !== 0;
      showAll.hidden = Boolean(words.length) || candidates.length === shown.length && !expanded;
      showAll.textContent = expanded ? "Показать основные действия" : "Все действия (" + candidates.length + ")";
      showAll.setAttribute("aria-expanded", String(expanded));
    }
    query.addEventListener("input", renderTasks);
    showAll.addEventListener("click", () => {
      expanded = !expanded; renderTasks();
      if (!expanded) finder.scrollIntoView({block:"start"});
    });
    const collapse = finder.querySelector(".finder-collapse");
    collapse.hidden = !article.querySelector("details");
    collapse.addEventListener("click", () => {
      article.querySelectorAll("details[open]").forEach(detail => { detail.open = false; });
      finder.scrollIntoView({block:"start"});
      collapse.focus({preventScroll:true});
    });
    renderTasks();
  }

  const library = article.querySelector(".library-directory");
  if (library) {
    const firstParagraph = article.querySelector(":scope > p");
    if (firstParagraph) firstParagraph.after(library);
    const table = article.querySelector(":scope > table, :scope > .md-typeset__scrollwrap");
    if (table) {
      const details = document.createElement("details");
      details.className = "instruction-section";
      const summary = document.createElement("summary");
      summary.textContent = "Быстрый справочник по темам";
      table.before(details);
      details.append(summary, table);
    }
    const input = library.querySelector("input");
    const groups = [...library.querySelectorAll(".library-group")];
    const count = library.querySelector(".library-count");
    const empty = library.querySelector(".library-empty");
    const initialStates = new Map();
    let searching = false;
    function filterLibrary() {
      const terms = input.value.toLocaleLowerCase("ru").replaceAll("ё","е").trim().split(/\s+/).filter(Boolean);
      if (terms.length && !searching) groups.forEach(section => initialStates.set(section, section.open));
      let total = 0;
      for (const section of groups) {
        const links = [...section.querySelectorAll("a")];
        let hits = 0;
        const heading = section.querySelector("summary")?.textContent ?? "";
        for (const link of links) {
          const text = (heading + " " + link.textContent).toLocaleLowerCase("ru").replaceAll("ё","е");
          const matches = terms.every(term => text.includes(term));
          link.closest("li").hidden = !matches;
          if (matches) hits++;
        }
        section.hidden = hits === 0;
        if (section.tagName === "DETAILS") {
          if (terms.length) section.open = hits > 0;
          else if (searching) section.open = initialStates.get(section) ?? false;
        }
        total += hits;
      }
      searching = terms.length > 0;
      count.textContent = terms.length ? "Найдено материалов: " + total : "В каталоге " + total + " материалов";
      empty.hidden = total !== 0;
    }
    input.addEventListener("input", filterLibrary);
    filterLibrary();
  }

  // Preserve Markdown and reveal ancestors for task links, shared URLs,
  // browser history, and search results pointing inside collapsed instructions.
  function revealHash(focus = false) {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    for (let parent = target; parent && parent !== article; parent = parent.parentElement) {
      if (parent.tagName === "DETAILS") parent.open = true;
    }
    const scrollTarget = target.parentElement?.tagName === "SUMMARY"
      ? target.parentElement.parentElement : target;
    requestAnimationFrame(() => {
      scrollTarget.scrollIntoView({block:"start"});
      if (focus) {
        const focusTarget = scrollTarget.tagName === "DETAILS"
          ? scrollTarget.querySelector("summary") : scrollTarget;
        if (!focusTarget.matches("a,button,input,summary")) focusTarget.setAttribute("tabindex","-1");
        focusTarget.focus({preventScroll:true});
      }
    });
  }
  const updateOffset = () => {
    const header = document.querySelector(".md-header");
    const nav = document.querySelector(".site-nav");
    const offset = (header?.offsetHeight ?? 48) + (nav?.offsetHeight ?? 0) + 20;
    document.documentElement.style.setProperty("--prachar-scroll-offset", offset + "px");
  };
  updateOffset();
  addEventListener("resize", updateOffset);
  addEventListener("hashchange", () => revealHash(true));
  article.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.pathname === location.pathname && url.hash && url.hash === location.hash) {
      event.preventDefault(); revealHash(true);
    }
  });
  document.querySelectorAll(".finder-full-search").forEach(button => {
    button.addEventListener("click", () => {
      const toggle = document.querySelector("#__search");
      const input = document.querySelector('[data-md-component="search-query"]');
      if (toggle && input) {
        toggle.checked = true;
        input.value = finder?.querySelector("input")?.value || library?.querySelector("input")?.value || "";
        input.dispatchEvent(new Event("input", {bubbles:true}));
        input.focus();
      }
    });
  });
  document.querySelectorAll('[data-md-component="search-query"]').forEach(input => {
    input.addEventListener("input", () => input.dispatchEvent(new KeyboardEvent("keyup", {bubbles:true})));
    input.placeholder = "Поиск по всей базе знаний";
    input.setAttribute("aria-label", "Поиск по всей базе знаний");
  });
  article.querySelectorAll(".md-clipboard").forEach(button => {
    button.setAttribute("aria-label", "Скопировать шаблон");
    button.title = "Скопировать шаблон";
  });

  // Copy the reusable artifact itself, leaving titles and interface labels out.
  function addCopy(container, getText, label) {
    const tools = document.createElement("div");
    tools.className = "template-tools";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "template-copy";
    button.textContent = label;
    const status = document.createElement("span");
    status.setAttribute("role","status");
    status.setAttribute("aria-live","polite");
    tools.append(button, status);
    const summary = container.querySelector(":scope > summary");
    if (summary) summary.after(tools);
    else container.prepend(tools);
    button.addEventListener("click", async () => {
      const text = getText().trim();
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = "Скопировано";
        setTimeout(() => {status.textContent = "";}, 2500);
      } catch {
        const code = container.querySelector("code");
        const selection = getSelection();
        if (code && selection) {
          const range = document.createRange();
          range.selectNodeContents(code);
          selection.removeAllRanges(); selection.addRange(range);
          status.textContent = "Текст выделен. Скопируйте его через меню устройства.";
        } else status.textContent = "Выделите и скопируйте текст ниже.";
      }
    });
  }
  article.querySelectorAll(".highlight").forEach(block => {
    const code = block.querySelector("pre code");
    if (!code) return;
    block.querySelectorAll(".md-clipboard").forEach(button => {button.hidden = true;});
    addCopy(block, () => code.textContent, group === "care" ? "Скопировать сообщение" : "Скопировать текст");
  });
  article.querySelectorAll("details.example").forEach(detail => {
    const title = detail.querySelector(":scope > summary")?.textContent ?? "";
    if (detail.querySelector("code") || !/Промпт|шаблон|Готовая структура/i.test(title)) return;
    addCopy(detail, () => [...detail.children]
      .filter(child => child.tagName !== "SUMMARY" && !child.classList.contains("template-tools"))
      .map(child => child.innerText).join("\n\n"), "Скопировать промпт");
  });

  article.querySelectorAll(".resource-link").forEach(row => {
    const link = row.querySelector("a");
    if (!link) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "template-copy resource-copy";
    button.textContent = "Копировать ссылку";
    button.setAttribute("aria-label", "Скопировать ссылку: " + link.textContent);
    const status = document.createElement("span");
    status.className = "resource-status";
    status.setAttribute("role", "status");
    row.append(button, status);
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(link.href);
        status.textContent = "Скопировано";
        setTimeout(() => { status.textContent = ""; }, 2500);
      } catch {
        let fallback = row.querySelector("input");
        if (!fallback) {
          fallback = document.createElement("input");
          fallback.type = "text";
          fallback.readOnly = true;
          fallback.className = "resource-fallback";
          fallback.setAttribute("aria-label", "Адрес для ручного копирования");
          fallback.value = link.href;
          row.append(fallback);
        }
        fallback.focus(); fallback.select();
        status.textContent = "Адрес выделен — скопируйте через меню устройства.";
      }
    });
  });

  revealHash();
  if (document.readyState !== "complete") addEventListener("load", () => setTimeout(() => revealHash(), 100), {once:true});
})();
