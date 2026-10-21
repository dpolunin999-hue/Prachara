// Read-only catalogue: opening or copying a template never records a contact.
function careActionDefinitions(){const c=careCfg();return[
 {key:"new_contact",title:"Первое знакомство",when:"Новый контакт без посещений и без отмеченного общения. Старые импортированные контакты исключены.",mode:"Автоматически"},
 {key:"feedback",title:"После первого занятия",when:`Через ${c.feedbackHours} ч. после первого посещения, до ${c.firstAbsenceDays} дней отсутствия; если после занятия ещё не связывались.`,mode:"Автоматически"},
 {key:"community",title:"Ссылки на сообщества",when:"После первого посещения, если ссылки ещё не отправляли и человек не подписан.",mode:"Автоматически, один раз"},
 {key:"course",title:"Предложить видеокурс",when:"После второго посещения, если курс ещё не предлагали.",mode:"Автоматически, один раз"},
 {key:"chat_invite",title:"Приглашение в чат",when:`От двух посещений; последнее — менее ${c.firstAbsenceDays} дней назад. Не приглашали и не добавляли в чат ранее.`,mode:"Автоматически, один раз"},
 {key:"reminder",title:"Напоминание о встрече",when:`После подтверждения участия — за ${c.reminderHours} ч. до встречи.`,mode:"Автоматически по подтверждению"},
 {key:"no_show",title:"Пропустил занятие",when:"Подтверждённая встреча прошла без посещения либо человек отсутствует 7 дней; отдельного дублирующего обращения нет.",mode:"Автоматически"},

 {key:"second_absence",title:"Повторный контакт",when:`Через 14 дней после первого сообщения, если человек не вернулся.`,mode:"Автоматически"},
 {key:"reactivation",title:"Мягкое приглашение вернуться",when:`После второго контакта — пауза 21 день, затем 30 дней между дальнейшими обращениями.`,mode:"Автоматически"},
 {key:"returned",title:"Поддержать возвращение",when:`Первое посещение после перерыва от ${c.secondAbsenceDays} дней; через ${c.feedbackHours} ч., если после него ещё не связывались.`,mode:"Автоматически"},
 {key:"repeat_dropout",title:"Повторный перерыв",when:`После возвращения — 1–2 посещения, затем от ${c.firstAbsenceDays} дней без посещений. Можно обсудить лично; автоматическое обращение использует общий текст о пропуске.`,mode:"По ситуации"},
 {key:"diagnostic",title:"Понять, что мешает",when:"Шаблон для личного разговора о препятствиях. Отдельная автоматическая задача сейчас не создаётся.",mode:"По ситуации"},
 {key:"review",title:"Отзыв о результатах",when:"Не ранее 45 дней с первого посещения и минимум 6 посещений. Если посещений меньше — ждём шестого.",mode:"Автоматически, один раз"},
 {key:"long_pause",title:"Уточнить интерес",when:"Через 30 дней после предыдущего сообщения, если человек не вернулся и не отказался от общения.",mode:"Автоматически"}

]}
function renderCareActionCatalog(p){const current=careRecommendation(p);return `<details class="profile-section profile-disclosure care-action-catalog"><summary><span><b>Все действия заботы</b><small>Когда писать и что предложить</small></span></summary><div class="profile-disclosure-body"><p class="muted">Это справочник, не список обязательных сообщений. Копирование не отмечает отправку. Личная договорённость и пауза в общении имеют приоритет.</p>${careActionDefinitions().map(a=>`<details class="care-guidance"><summary>${h(a.title)}${current?.template===a.key?" · Сейчас рекомендовано":""}</summary><p><b>${h(a.mode)}</b> · ${h(a.when)}</p><blockquote style="white-space:pre-wrap">${h(careTemplate(a.key,p))}</blockquote><div class="recommended-buttons"><button type="button" onclick="copyCareActionMessage(${Number(p.id)},'${a.key}')">Скопировать</button>${messengerButtons(p)}<button type="button" onclick="startCatalogContact(${Number(p.id)},\'${a.key}\')">Написал</button></div></details>`).join("")}</div></details>`}
function copyCareActionMessage(id,key){const p=state.people.find(p=>Number(p.id)===Number(id));if(!p||!careActionDefinitions().some(a=>a.key===key))return;copyText(careTemplate(key,p),"Сообщение скопировано")}
function startCatalogContact(id,key){const p=state.people.find(p=>Number(p.id)===Number(id));if(!p||!careActionDefinitions().some(a=>a.key===key))return;pendingCareRecommendation={type:key,sourceKey:"care:"+key,message:careTemplate(key,p)};openContact(id)}
