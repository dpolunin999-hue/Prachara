(() => {
  "use strict";
  const article = document.querySelector(".md-content__inner");
  if (!article) return;
  document.documentElement.classList.add("prachar-js");
  const finder = article.querySelector(".task-finder");
  const group = finder?.dataset.taskGroup;
  let activateCarePanel = null;

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
    if (activateCarePanel) activateCarePanel(target);
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
    const copyText = code.textContent;
    if (group === "care" && /https?:\/\//.test(copyText)) {
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
    addCopy(block, () => copyText, group === "care" ? "Скопировать сообщение" : "Скопировать текст");
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


  if (group === "care") {
    article.classList.add("care-workspace-page");
    const workspace = document.createElement("section");
    workspace.className = "care-workspace";
    const nav = document.createElement("div");
    nav.className = "care-branch-nav"; nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "Что нужно сделать в заботе");
    const definitions = [
      ["start", "Начать", "Первый запуск заботы", "Четыре действия, чтобы начать сопровождать людей."],
      ["people", "Сопровождать", "Что происходит с человеком?", "Выберите ситуацию — откроется только нужная инструкция."],
      ["tools", "Инструменты", "Инструменты заботы", "Приложение, чат, материалы и готовые сообщения."],
      ["review", "Проверить работу", "Всё ли работает?", "Проверка договорённостей, общения и границ заботы."]
    ];
    const panels = new Map(); const tabs = new Map(); const roots = new Map();
    for (const [key, label, title, description] of definitions) {
      const tab = document.createElement("button");
      tab.type = "button"; tab.id = "care-tab-" + key; tab.textContent = label;
      tab.setAttribute("role", "tab"); tab.setAttribute("aria-controls", "care-panel-" + key);
      const panel = document.createElement("section");
      panel.id = "care-panel-" + key; panel.className = "care-panel";
      panel.setAttribute("role", "tabpanel"); panel.setAttribute("aria-labelledby", tab.id);
      const h = document.createElement("h2"); h.textContent = title;
      const p = document.createElement("p"); p.className = "care-panel-intro"; p.textContent = description;
      const back = document.createElement("button"); back.type = "button";
      back.className = "care-back"; back.textContent = "← К списку"; back.hidden = true;
      panel.append(h, p, back); panels.set(key, panel); tabs.set(key, tab); roots.set(key, []);
      nav.append(tab); workspace.append(panel);
    }
    workspace.prepend(nav);
    article.querySelector(".direction-brief").after(workspace);
    const minimum = article.querySelector(".direction-start");
    minimum.querySelector(".direction-stage-nav")?.remove();
    panels.get("start").append(minimum);
    const find = document.createElement("details"); find.className = "care-search";
    const findTitle = document.createElement("summary"); findTitle.textContent = "Найти действие по слову";
    find.append(findTitle, finder); nav.after(find);
    function addRoot(key, detail) {
      if (!detail) return;
      if (!detail.id) detail.id = "care-item-" + key + "-" + roots.get(key).length;
      detail.classList.add("care-branch-item"); detail.open = false;
      roots.get(key).push(detail); panels.get(key).append(detail);
    }
    for (let i = 1; i <= 14; i++) addRoot(i <= 8 ? "people" : [9, 10, 12].includes(i) ? "tools" : "review", article.querySelector("#care-step-" + i));
    article.querySelectorAll(".care-stack > details").forEach(detail => addRoot("people", detail));
    const headingBy = text => [...article.querySelectorAll(":scope > h2")].find(h => h.textContent.startsWith(text));
    const resources = wrapSection(headingBy("Полезные ссылки"));
    if (resources) {
      resources.id = "care-materials";
      resources.querySelector("summary h2").firstChild.textContent = "Материалы для отправки ";
      resources.querySelectorAll("details").forEach(d => {d.open = false;});
      addRoot("tools", resources);
    }
    const formula = wrapSection(headingBy("Итоговая формула")); addRoot("review", formula);
    const full = wrapSection(headingBy("Полный маршрут заботы")); addRoot("tools", full);
    const overview = article.querySelector(".instruction-section--overview"); addRoot("people", overview);
    const oldTitle = headingBy("Подробный путь заботника");
    if (oldTitle) { oldTitle.hidden = true; panels.get("people").append(oldTitle); }
    article.querySelector(".care-stack")?.remove();
    // Show the tools in the order in which a caretaker needs them.
    for (const id of ["care-step-9", "care-step-10", "care-materials", "care-step-12"]) {
      const detail = article.querySelector("#" + id); if (detail) panels.get("tools").append(detail);
    }
    if (full) panels.get("tools").append(full);
    const labels = {"care-step-9":"Вести людей в приложении", "care-step-10":"Создать и поддерживать чат", "care-step-12":"Готовые сообщения и передача запроса"};
    for (const [id, label] of Object.entries(labels)) {
      const title = article.querySelector("#" + id + " > summary strong"); if (title) title.textContent = label;
    }
    let current = {key:"start", leaf:null, scroll:0}; const trail = [];
    function showState(next, remember = false) {
      if (remember && (current.key !== next.key || current.leaf !== next.leaf)) trail.push({...current, scroll:window.scrollY});
      current = {...next};
      panels.forEach((panel, key) => {
        panel.hidden = key !== current.key;
        const tab = tabs.get(key); tab.setAttribute("aria-selected", String(key === current.key));
        tab.tabIndex = key === current.key ? 0 : -1;
        const back = panel.querySelector(".care-back"); back.hidden = !current.leaf;
        back.textContent = trail.length && trail[trail.length - 1].leaf ? "← Назад к предыдущему шагу" : "← К списку";
        roots.get(key).forEach(detail => {
          detail.hidden = key === current.key && Boolean(current.leaf) && detail.id !== current.leaf;
          detail.open = key === current.key && detail.id === current.leaf;
        });
      });
    }
    activateCarePanel = target => {
      const panel = target.closest(".care-panel");
      if (!panel) return;
      const key = [...panels].find(([, value]) => value === panel)[0];
      const root = target.closest(".care-branch-item");
      showState({key, leaf:root?.id ?? null}, true);
    };
    tabs.forEach((tab, key) => tab.addEventListener("click", () => {
      trail.length = 0; showState({key, leaf:null});
      history.replaceState(null, "", "#care-panel-" + key);
      workspace.scrollIntoView({block:"start"});
    }));
    nav.addEventListener("keydown", event => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault(); const buttons = [...tabs.values()]; let i = buttons.indexOf(document.activeElement);
      i = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (i + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[i].click(); buttons[i].focus({preventScroll:true});
    });
    panels.forEach((panel, key) => {
      panel.querySelector(".care-back").addEventListener("click", () => {
        const old = trail.pop() || {key, leaf:null};
        showState(old); history.replaceState(null, "", "#" + (old.leaf || "care-panel-" + old.key));
        if (Number.isFinite(old.scroll)) window.scrollTo({top:old.scroll, behavior:"instant"});
        else workspace.scrollIntoView({block:"start"});
        (old.leaf ? document.getElementById(old.leaf).querySelector("summary") : tabs.get(old.key)).focus({preventScroll:true});
      });
      roots.get(key).forEach(detail => detail.addEventListener("toggle", () => {
        if (detail.open && (current.key !== key || current.leaf !== detail.id)) showState({key, leaf:detail.id}, true);
        else if (!detail.open && current.key === key && current.leaf === detail.id) showState({key, leaf:null});
      }));
    });
    workspace.querySelectorAll("a[href]").forEach(link => {
      const url = new URL(link.href, location.href);
      if (url.origin === location.origin && url.pathname !== location.pathname) {
        link.target = "_blank"; link.rel = "noopener";
        link.title = "Открыть подробный материал в новой вкладке";
      }
    });
    showState(current); updateOffset();
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
