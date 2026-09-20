# Система Прачары

Статический сайт-база знаний на MkDocs Material. Содержимое сайта хранится в Markdown-файлах папки `docs/`; главная страница — `docs/index.md`. Исходный обзор системы сохранён в [базе знаний](docs/11_База_знаний/Обзор_системы.md).

## Структура

- `mkdocs.yml` — тема, поиск, расширения Markdown и навигация.
- `docs/` — все страницы и исходные материалы.
- `docs/start/` — короткие маршруты по ролям.
- `docs/assets/images/` — будущие изображения и инфографики.
- `docs/stylesheets/extra.css` — оформление сайта.
- `site/` — результат сборки; создаётся автоматически и не хранится в Git.

## Быстрый запуск

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
mkdocs serve
```

Строгая проверка: `mkdocs build --strict`. Подробные шаги для GitHub и Cloudflare Pages — в [DEPLOY.md](DEPLOY.md). Правила редактирования базы — в [AGENTS.md](AGENTS.md).
\n\n## Приложение Ananda Prachar\n\nPWA находится в `app/` и публикуется вместе с MkDocs по адресу `https://dpolunin999-hue.github.io/Prachara/app/`. Данные и авторизация работают через Supabase. Схема базы находится в `app/supabase-schema.sql`.\n