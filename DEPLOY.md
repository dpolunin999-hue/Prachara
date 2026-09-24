# Запуск и публикация сайта

Сайт собирается из Markdown в `docs/`. Папка `site/` создаётся автоматически и не отправляется в Git.


## Где работает текущая версия

- Исходники: публичный репозиторий [dpolunin999-hue/Prachara](https://github.com/dpolunin999-hue/Prachara), основная ветка `main`.
- Публикация: GitHub Pages на домене `dpolunin999-hue.github.io`.
- Приложение: `https://dpolunin999-hue.github.io/Prachara/app/`.
- Автоматическая сборка: `.github/workflows/deploy.yml`. Каждый коммит в `main` запускает GitHub Actions, собирает MkDocs, копирует папку `app/` и публикует результат.
- Интерфейс PWA: исходники находятся в `app/`; манифест — `app/manifest.webmanifest`, офлайн-кэш — `app/sw.js`.
- Авторизация и данные: Supabase, проект `cxqrrynltflfmfotlhdu`.
- Панель базы: `https://supabase.com/dashboard/project/cxqrrynltflfmfotlhdu`.
- Адрес API базы: `https://cxqrrynltflfmfotlhdu.supabase.co`.
- Схема таблиц и политик доступа: `app/supabase-schema.sql`.
- Публичный ключ приложения хранится в `app/supabase-adapter.js`. Это publishable-ключ; секретный service-role key нельзя помещать в GitHub или код приложения.
- Старый адрес `ryadom-practices.dpolunin999.chatgpt.site` — прежний прототип и резервный источник старых данных, а не текущая рабочая версия.

У приложения нет отдельного сервера на компьютере владельца. Телефоны открывают интерфейс с GitHub Pages, а общие данные читаются и записываются непосредственно в Supabase. Установленная PWA — это ярлык и локальный кэш той же веб-версии, а не отдельная копия базы.

## Что должен сохранить владелец

1. Доступ к GitHub-аккаунту `dpolunin999-hue`, резервные коды и двухфакторную авторизацию.
2. Доступ к Supabase-аккаунту, в котором находится проект `cxqrrynltflfmfotlhdu`.
3. Локальную копию репозитория и регулярные выгрузки базы.
4. Адрес рабочего приложения и ссылку на панель Supabase.
5. Понимание, что удаление репозитория остановит сайт, а удаление проекта Supabase уничтожит авторизацию и рабочую базу.

Запланированные резервные копии сохраняются на компьютере в папку
`C:\Users\Lenovo\Desktop\ИИ\Дхармапрачара 2.0\app Учёт\Backups\Ananda Prachar\YYYY-MM-DD`.
Автоматизация зависит от включённого компьютера и действующего входа Supabase CLI, поэтому папку нужно периодически проверять вручную.

## Если что-то перестало работать

1. Если сайт не открывается — проверить вкладку **Actions** в GitHub и настройки **Settings → Pages**.
2. Если сайт открывается, но данные не загружаются — открыть Supabase Dashboard, проверить состояние проекта и таблицы `people`, `events`, `attendance`.
3. Если не приходит письмо восстановления — проверить **Authentication → URL Configuration**, разрешённый адрес GitHub Pages, почтовую папку «Спам» и ограничения отправки писем.
4. Если телефон показывает старую версию — полностью закрыть PWA, открыть сайт в браузере с новым параметром версии и снова запустить приложение.
5. Перед удалением таблиц, проекта, репозитория или ключей сначала сделать резервную копию.

## Локальный запуск

Нужен Python и Git. В PowerShell из корня проекта:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
mkdocs serve
```

Откройте адрес, который покажет MkDocs (обычно `http://127.0.0.1:8000/`). Для проверки перед публикацией:

```powershell
mkdocs build --strict
```

Если PowerShell блокирует активацию окружения, выполните команды напрямую:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m mkdocs serve
```

## Создать GitHub-репозиторий

1. На [GitHub](https://github.com/new) создайте пустой репозиторий без README, `.gitignore` и лицензии.
2. В корне проекта выполните команды ниже, заменив `USERNAME` и `REPOSITORY` своими значениями.

```powershell
git add .
git commit -m "Сайт базы знаний на MkDocs Material"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Git уже инициализирован в этой папке. Если Git попросит имя и почту, задайте их командами `git config user.name "Ваше имя"` и `git config user.email "you@example.com"`, затем повторите коммит. Для отправки в GitHub может потребоваться вход через браузер или менеджер учётных данных Git.

После изменений публикуйте новую версию так:

```powershell
mkdocs build --strict
git add .
git commit -m "Обновить базу знаний"
git push
```

## Настроить Cloudflare Pages

1. В [Cloudflare Dashboard](https://dash.cloudflare.com/) откройте **Workers & Pages** → **Create application** → **Pages** → **Import an existing Git repository**.
2. Подключите GitHub и выберите созданный репозиторий.
3. Укажите корневую папку проекта `/` и систему сборки **v3**. Файл `.python-version` задаёт Python 3.13.3.
4. В настройках сборки задайте ровно:

| Параметр | Значение |
| --- | --- |
| Production branch | `main` |
| Build command | `pip install -r requirements.txt && mkdocs build --strict` |
| Build output directory | `site` |

5. Нажмите **Save and Deploy**. После успешной сборки Cloudflare выдаст адрес `*.pages.dev`. Новые коммиты в `main` будут запускать сборку автоматически.

Не загружайте `site/` вручную: Cloudflare собирает её из Markdown при каждом развёртывании.

Официальные инструкции: [Cloudflare Pages для MkDocs](https://developers.cloudflare.com/pages/framework-guides/deploy-an-mkdocs-site/) и [версии языков в Pages](https://developers.cloudflare.com/pages/configuration/build-image/).
