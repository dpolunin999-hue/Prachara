(() => {
  "use strict";
  const article = document.querySelector(".md-content__inner");
  if (!article) return;
  document.documentElement.classList.add("prachar-js");
  const finder = article.querySelector(".task-finder");
  const group = finder?.dataset.taskGroup || article.querySelector(".direction-guide")?.dataset.directionGroup;
  const isCarePage = Boolean(article.querySelector(".care-hub, .care-guide"));
  if (article.querySelector(".direction-stages-menu") && location.hash) {
    const stages = {"direction-minimum":"first-steps", "direction-routine":"routine", "direction-development":"development", "ads-regular":"routine", "secretary-month":"development"};
    const id = location.hash.slice(1);
    const stage = stages[id] || (/^direction-step-[1-4]$/.test(id) ? "first-steps" : null);
    if (stage) {
      const url = new URL("../" + group + "/" + stage + "/", location.href);
      if (id.startsWith("direction-step-")) url.hash = id;
      location.replace(url); return;
    }
  }
  if (article.querySelector(".ads-hub") && location.hash) {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ""; }
    const routes = {"avito-tool":"avito/", "personal-brand":"personal-brand/", "social-packaging":"landing/", "site-visibility":"site/", "business-cards":"offline/#business-cards", "event-announcement":"../programs/announcement/", "poster":"../programs/announcement/", "ad-channels":"methods/", "ad-tools":"methods/", "ad-landing-pages":"landing/", "ad-free-methods":"methods/#free-methods", "ad-paid-methods":"paid/", "city-groups":"city-groups/", "ad-experiment":"hypotheses/#ad-experiment", "ad-parsing":"parsing/", "ads-regular":"routine/", "direction-minimum":"first-steps/", "direction-routine":"routine/", "direction-development":"development/"};
    const route = routes[id] || (/^direction-step-[1-4]$/.test(id) ? "first-steps/" : null);
    if (route) { location.replace(new URL("../ads/" + route, location.href)); return; }
  }
  if (article.querySelector(".program-hub") && location.hash) {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ""; }
    const routes = {"program-types":"formats/", "program-preparation":"first-steps/", "program-rhythm":"routine/#program-rhythm", "program-month":"routine/#program-month", "care-during-program":"hospitality/", "small-talk":"hospitality/", "interactives":"hospitality/#interactives", "program-questionnaire":"quality/#review-material", "direction-minimum":"first-steps/", "direction-routine":"routine/", "direction-development":"development/", "direction-step-1":"first-steps/", "direction-step-2":"first-steps/#program-preparation", "direction-step-3":"first-steps/#expected-attendance", "direction-step-4":"first-steps/#attendance-complete"};
    if (routes[id]) { location.replace(new URL(routes[id], location.href)); return; }
  }
  // Old shared care URLs still open the corresponding new instruction page.
  if (article.querySelector(".care-hub") && location.hash) {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ""; }
    const routes = {
      "care-step-9":"application/#care-step-9", "care-app":"application/#care-app",
      "care-step-10":"chat/#care-step-10", "care-step-11":"routine/#care-step-11",
      "care-step-12":"tools/#care-step-12", "care-step-13":"tools/#care-step-13", "care-step-14":"tools/#care-step-14",
      "care-resources":"resources/", "care-materials":"resources/", "person-wrote":"journey/#care-step-1",
      "care-month":"routine/#care-month", "care-panel-start":"first-steps/", "care-panel-people":"journey/",
      "care-panel-tools":"tools/", "care-panel-review":"routine/", "direction-minimum":"first-steps/",
      "direction-step-1":"first-steps/", "direction-step-2":"journey/#care-step-1",
      "direction-step-3":"journey/#care-step-2", "direction-step-4":"journey/#care-step-4",
      "direction-routine":"routine/", "direction-development":"routine/#care-month"
    };
    const route = routes[id] || (/^care-step-[1-8]$/.test(id) ? "journey/#" + id : null);
    if (route) { location.replace(new URL("../care/" + route, location.href)); return; }
  }

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
      begin.href = group === "care" ? "#direction-step-1" : new URL("../" + group + "/first-steps/", location.href).href;
      begin.textContent = "Начать с первого шага →";
      intro.before(brief);
      const focus = document.createElement("aside");
      focus.className = "direction-focus";
      focus.setAttribute("aria-labelledby", label.id);
      label.textContent = "Главная задача · " + article.querySelector("h1").textContent.replace("¶", "").trim();
      focus.append(label, mission);
      const responsibilities = article.querySelector(".direction-responsibilities");
      if (responsibilities) {
        responsibilities.querySelector("h2")?.remove();
        responsibilities.setAttribute("aria-label", "Регулярные задачи ответственного");
        focus.append(responsibilities);
      }
      brief.before(focus);
      const scope = article.querySelector(".direction-scope");
      const essentials = article.querySelector(".direction-essentials");
      if (scope) brief.append(scope);
      if (essentials) brief.append(essentials);
      brief.append(begin);
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
        || group === "programs" && /^(Ритм программ|Забота на самой встрече|Small talk|Библиотека интерактивов|Виды программ|Базовый маршрут подготовки|Вопросы для полного)/.test(title)
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
    if (group !== "home") {
      const searchPanel = document.createElement("details"); searchPanel.className = "direction-search";
      const summary = document.createElement("summary"); summary.textContent = "Найти действие по слову";
      finder.before(searchPanel); searchPanel.append(summary, finder);
    }
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
          ? scrollTarget.querySelector("summary") : scrollTarget.classList.contains("care-panel")
            ? document.querySelector(`[aria-controls="${scrollTarget.id}"]`) : scrollTarget;
        if (!focusTarget.matches("a,button,input,summary")) focusTarget.setAttribute("tabindex","-1");
        focusTarget.focus({preventScroll:true});
      }
    });
  }
  const updateOffset = () => {
    const header = document.querySelector(".md-header");
    const nav = document.querySelector(".site-nav");
    const navBottom = (header?.offsetHeight ?? 48) + (nav?.offsetHeight ?? 0);
    document.documentElement.style.setProperty("--prachar-nav-bottom", navBottom + "px");
    const focusHeight = article.querySelector(".direction-focus")?.offsetHeight ?? 0;
    document.documentElement.style.setProperty("--prachar-focus-height", focusHeight + "px");
    const offset = navBottom + focusHeight + (article.querySelector(".care-branch-nav")?.offsetHeight ?? 0) + 20;
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

  // A compact prompt card copies the source file without a long page preview.
  article.querySelectorAll("[data-copy-prompt]").forEach(button => {
    const card = button.closest(".content-plan");
    const status = card?.querySelector('[role="status"]');
    const fallback = card?.querySelector("[data-prompt-fallback]");
    let promptText;
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      if (status) status.textContent = "Копируем…";
      if (fallback) fallback.hidden = true;
      try {
        if (!promptText) {
          const response = await fetch(new URL(button.dataset.copyPrompt, document.baseURI));
          if (!response.ok) throw new Error("Prompt unavailable");
          promptText = (await response.text()).trim();
          if (!promptText) throw new Error("Prompt is empty");
        }
        let copied = false;
        try {
          await navigator.clipboard.writeText(promptText);
          copied = true;
        } catch {
          const field = document.createElement("textarea");
          field.value = promptText;
          field.setAttribute("readonly", "");
          field.style.cssText = "position:fixed;left:0;top:0;opacity:0";
          document.body.append(field);
          try {
            field.focus(); field.select();
            copied = document.execCommand("copy");
          } finally {
            field.remove(); button.focus();
          }
        }
        if (!copied) throw new Error("Clipboard unavailable");
        if (status) status.textContent = "Скопировано. Вставьте в ChatGPT или другой ИИ-сервис.";
      } catch {
        if (status) status.textContent = "Не удалось скопировать. Откройте текст промпта по ссылке ниже.";
        if (fallback) fallback.hidden = false;
      } finally {
        button.disabled = false;
        button.removeAttribute("aria-busy");
      }
    });
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
        const code = container.querySelector("code") || (container.matches("blockquote") ? container.querySelector("p") : null);
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
    const copyText = code.textContent;
    if (isCarePage && /https?:\/\//.test(copyText)) {
      // Keep the real URL in the copied message; show a short link in the preview.
      const parts = copyText.split(/(https?:\/\/[^\s<>]+)/g);
      code.replaceChildren();
      parts.forEach(part => {
        if (/^https?:\/\//.test(part)) {
          const link = document.createElement("a"); link.href = part;
          link.textContent = "Открыть материал ↗"; link.title = part;
          code.append(link);
        } else code.append(document.createTextNode(part));
      });
    }
    addCopy(block, () => copyText, block.closest(".avito-title") ? "Скопировать заголовок" : block.closest(".avito-description") ? "Скопировать описание" : block.closest(".program-prompt") ? "Скопировать промпт" : block.closest(".ads-template") ? "Скопировать заготовку" : block.closest(".ads-message") ? "Скопировать сообщение" : isCarePage ? "Скопировать сообщение" : "Скопировать текст");
    const download = block.closest(".program-prompt")?.querySelector("[data-prompt-download]");
    if (download) {
      const parent = download.parentElement;
      const toolbar = block.querySelector(".template-tools");
      const preview = block.closest(".site-only-prompt");
      if (preview) preview.before(toolbar);
      toolbar.insertBefore(download, toolbar.querySelector('[role="status"]'));
      if (parent.tagName === "P" && !parent.textContent.trim()) parent.remove();
    }
  });
  article.querySelectorAll(".sito-script-step blockquote").forEach(block => {
    const message = block.cloneNode(true);
    message.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
    const copyText = message.textContent.replace(/\n[ \t]*\n/g, "\n").trim();
    addCopy(block, () => copyText, "Скопировать реплику");
    block.append(block.querySelector(".template-tools"));
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
    async function copyResource(text) {
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = "Скопировано";
        setTimeout(() => { status.textContent = ""; }, 2500);
      } catch {
        let fallback = row.querySelector("textarea");
        if (!fallback) {
          fallback = document.createElement("textarea");
          fallback.readOnly = true;
          fallback.className = "resource-fallback";
          fallback.setAttribute("aria-label", "Текст для ручного копирования");
          row.append(fallback);
        }
        fallback.value = text;
        fallback.focus(); fallback.select();
        status.textContent = "Текст выделен — скопируйте через меню устройства.";
      }
    }
    button.addEventListener("click", () => copyResource(link.href));
    if (row.classList.contains("resource-link--compact")) {
      const message = document.createElement("button");
      message.type = "button";
      message.className = "template-copy resource-copy resource-message-copy";
      message.textContent = "Скопировать сообщение";
      message.setAttribute("aria-label", "Скопировать сообщение: " + link.textContent);
      row.insertBefore(message, status);
      message.addEventListener("click", () => copyResource(
        "Здравствуйте! Вы спрашивали про " + (row.dataset.shareTopic || "эту тему") +
        ". Вот материал по вашему запросу («" + link.textContent + "»):\n" + link.href +
        "\n\nЕсли появятся вопросы — напишите."
      ));
    }
  });


  const formatSearch = article.querySelector(".program-format-search input");
  if (formatSearch) {
    const rows = [...article.querySelectorAll(".program-format-list li")];
    const sections = [...article.querySelectorAll(".program-action")];
    const originalOpen = new Map();
    formatSearch.addEventListener("input", () => {
      const words = formatSearch.value.toLocaleLowerCase("ru").replaceAll("ё", "е").trim().split(/\s+/).filter(Boolean);
      rows.forEach(row => { row.hidden = !words.every(word => row.textContent.toLocaleLowerCase("ru").replaceAll("ё", "е").includes(word)); });
      article.querySelectorAll(".program-format-list").forEach(list => { list.hidden = ![...list.querySelectorAll("li")].some(row => !row.hidden); });
      sections.forEach(section => {
        if (!originalOpen.has(section)) originalOpen.set(section, section.open);
        section.hidden = ![...section.querySelectorAll("li")].some(row => !row.hidden);
        section.open = words.length ? !section.hidden : originalOpen.get(section);
      });
      article.querySelector(".program-format-empty").hidden = rows.some(row => !row.hidden);
    });
  }
  if (isCarePage) {
    const search = article.querySelector(".care-resource-search input");
    const topics = [...article.querySelectorAll(".resource-topic")];
    if (search) search.addEventListener("input", () => {
      const words = search.value.toLocaleLowerCase("ru").replaceAll("ё", "е").trim().split(/\s+/).filter(Boolean);
      topics.forEach(topic => {
        const text = topic.textContent.toLocaleLowerCase("ru").replaceAll("ё", "е");
        topic.hidden = !words.every(word => text.includes(word));
      });
      article.querySelector(".care-resource-empty").hidden = topics.some(topic => !topic.hidden);
    });
    const from = new URLSearchParams(location.search).get("from");
    if (article.querySelector(".care-resource-search") && /^care-step-[1-8]$/.test(from || "")) {
      const names = {"care-step-1":"первый контакт", "care-step-2":"перед встречей", "care-step-3":"первая встреча", "care-step-4":"после первой встречи", "care-step-5":"второй приход", "care-step-6":"перерыв", "care-step-7":"регулярная практика", "care-step-8":"углубление практики"};
      const back = article.querySelector(".care-return");
      back.href = new URL("../journey/#" + from, location.href).href;
      back.textContent = "← К шагу: " + names[from];
    }
  }

  // Keep the ordinary Sito script visible; the optional tool opens separately.
  const sitoLinks = article.querySelectorAll(".sito-script-launch, .sito-inline-tool");
  const sitoLaunch = sitoLinks[0];
  let sitoReturnTo = sitoLaunch;
  if (sitoLaunch && typeof HTMLDialogElement !== "undefined") {
    const dialog = document.createElement("dialog");
    dialog.className = "sito-dialog";
    dialog.id = "sito-script-dialog";
    dialog.setAttribute("aria-labelledby", "sito-dialog-title");
    const header = document.createElement("div");
    header.className = "sito-dialog__header";
    const title = document.createElement("strong");
    title.id = "sito-dialog-title";
    title.textContent = "Интерактивный скрипт Сито";
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "Закрыть";
    close.autofocus = true;
    close.setAttribute("aria-label", "Закрыть интерактивный скрипт");
    const frame = document.createElement("iframe");
    frame.title = "Интерактивный сценарий общения Сито";
    // Keyboard events in the embedded document do not reach the parent dialog.
    frame.addEventListener("load", () => {
      try {
        frame.contentDocument?.addEventListener("keydown", event => {
          if (event.key === "Escape" && dialog.open) {
            event.preventDefault();
            dialog.close();
          }
        });
      } catch { /* The close button remains available if the frame changes origin. */ }
    });
    header.append(title, close);
    dialog.append(header, frame);
    document.body.append(dialog);
    sitoLinks.forEach(link => {
      link.setAttribute("aria-controls", dialog.id);
      link.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (typeof dialog.showModal !== "function") return;
      event.preventDefault();
      sitoReturnTo = link;
      if (!frame.hasAttribute("src")) frame.src = link.href;
      dialog.showModal();
      document.documentElement.classList.add("sito-modal-open");
      });
    });
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("sito-modal-open");
      sitoReturnTo.focus({preventScroll:true});
    });
    dialog.addEventListener("click", event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  }

  if (article.querySelector(".direction-focus")) {
    const resize = new ResizeObserver(updateOffset);
    resize.observe(article.querySelector(".direction-focus"));
    const siteNav = document.querySelector(".site-nav");
    if (siteNav) resize.observe(siteNav);
  }
  updateOffset();
  revealHash();
  if (document.readyState !== "complete") addEventListener("load", () => setTimeout(() => revealHash(), 100), {once:true});
})();
