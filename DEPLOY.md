# Запуск и публикация сайта

Сайт собирается из Markdown в `docs/`. Папка `site/` создаётся автоматически и не отправляется в Git.

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
