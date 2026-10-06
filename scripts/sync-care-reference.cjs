"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app/app.js"), "utf8");
function definition(prefix) {
  const line = app.split(/\r?\n/).find(line => line.startsWith(prefix));
  if (!line) throw new Error("Care reference: missing " + prefix);
  return line;
}
const definitions = ["const careStateLabels=", "const defaultCareTemplates=", "const careCfg=", "function visitPattern(", "function computedCareState(", "function attendanceStatus("].map(definition).join("\n");
const result = vm.runInNewContext(`
 const DAY=864e5,state={careSettings:{}};
 const days=t=>Math.max(0,Math.floor((Date.now()-new Date(t).getTime())/DAY));
 ${definitions}
 const cfg=careCfg(), now=Date.now(), at=n=>new Date(now-n*DAY).toISOString();
 const person=(visits,absence,extra={})=>({visits,lastVisit:at(absence),careEvents:[],...extra});
 const samples=[
 ["new",person(0,0)], ["first_visit",person(1,0)], ["active",person(2,0)],
 ["dropping",person(2,cfg.firstAbsenceDays)], ["dropped",person(2,cfg.secondAbsenceDays)],
 ["returned",person(2,0,{visitDates:[at(cfg.secondAbsenceDays+1),at(0)]})],
 ["repeat_dropout",person(2,cfg.firstAbsenceDays,{visitDates:[at(cfg.secondAbsenceDays+cfg.firstAbsenceDays+1),at(cfg.firstAbsenceDays)]})],
 ["inactive",person(2,0,{careEvents:[{type:"not_now",date:at(0)}]})],
 ["invite_only",person(2,cfg.reactivationDays+1,{careEvents:[{type:"reactivation",date:at(0)}]})]
 ];
 JSON.stringify({cfg,labels:careStateLabels,templates:defaultCareTemplates,
 states:samples.map(([key,p])=>({key,actual:computedCareState(p)})),
 attendance:[attendanceStatus({visits:1,recentVisits:1}),attendanceStatus({visits:2,recentVisits:2}),attendanceStatus({visits:3,recentVisits:3})]});
`, {}, {timeout:1000});
const data=JSON.parse(result);
for(const row of data.states) if(row.actual!==row.key) throw new Error(`Care rule changed: ${row.key} -> ${row.actual}. Review the handbook.`);
const c=data.cfg;
const descriptions={
 new:["Контакт есть, посещений ещё нет", "Познакомьтесь и пригласите на ближайшую встречу", "new_contact"],
 first_visit:["Первое посещение, без длительного перерыва", "Спросите впечатления; предложите следующую встречу", "feedback"],
 active:["От двух посещений, без перерыва и особых условий возврата", "Предложите чат и поддерживайте живой контакт", null],
 dropping:[`${c.firstAbsenceDays}–${c.secondAbsenceDays-1} дней после последнего посещения`, "Мягко узнайте, как дела и нужна ли помощь", "first_absence"],
 dropped:[`От ${c.secondAbsenceDays} дней после последнего посещения`, "Поймите препятствие и желание продолжать", "second_absence"],
 returned:[`Пришёл после перерыва от ${c.secondAbsenceDays} дней; после возврата менее ${c.activeReturnVisits} посещений`, "Поддержите возвращение без упрёка", "returned"],
 repeat_dropout:[`После возврата было 1–2 посещения, затем перерыв от ${c.firstAbsenceDays} дней`, "Уточните, что мешает продолжать", "repeat_dropout"],
 inactive:["Человек сообщил, что пока не хочет продолжать, или состояние выбрано вручную", "Остановите активные приглашения", null],
 invite_only:[`Прошло от ${c.reactivationDays} дней, после последнего посещения уже была реактивация; либо состояние выбрано вручную`, "Пишите только по подходящему поводу", "invite_only"]
};
const message=(key)=>`\n??? example "Сообщение — скопировать"\n\n    \`\`\`text\n    ${data.templates[key]}\n    \`\`\`\n`;
let md=`---\nhide:\n  - toc\n---\n\n# Статусы и сообщения\n\n<div class="care-guide" markdown="1">\n\n[← В инструменты заботы](tools.md){ .care-return }\n\n**Статус помогает выбрать поддержку, а не оценить человека.** Сроки ниже — стандартные настройки; в вашем городе они могут быть изменены. Ручной выбор состояния имеет приоритет.\n\n## Состояние заботы\n\n`;
for(const [key,[condition,action,template]] of Object.entries(descriptions)) {
 md+=`<details markdown="1" class="care-action" id="state-${key}">\n<summary>${data.labels[key]}</summary>\n\n**Когда:** ${condition}.\n\n**Что сделать:** ${action}.\n`;
 if(template) md+=message(template);
 md+='\n</details>\n\n';
}
md+=`## Если не приходит ${c.reactivationDays} дней { #reactivation }\n\nЭто повод для мягкой реактивации, а не автоматический статус «Неактивный». Обычно состояние остаётся «Выпал»; после зафиксированной реактивации может стать «Приглашать по подходящему поводу». Возврат и повторное выпадение учитываются отдельно.\n\n**Зачем:** оставить человеку удобную возможность вернуться. Напишите один раз и зафиксируйте результат.\n${message("reactivation")}\n`;
md+=`<details markdown="1" class="care-action" id="diagnostic">\n<summary>Если перерывы повторяются</summary>\n\n**Зачем:** понять интерес и реальное препятствие; уменьшить лишние сообщения.\n${message("diagnostic")}\n</details>\n\n`;
md+=`## Посещения и домашняя практика\n\n- После первого прихода: **«${data.attendance[0].text}»**.\n- После второго: **«${data.attendance[1].text}»**.\n- От трёх посещений за последние 30 дней: **«${data.attendance[2].text}»**.\n\nПри большом числе посещений и одном–двух недавних приходах приложение может показывать «Иногда приходит». Это отдельная характеристика посещений, а не состояние заботы.\n\nДомашняя практика записывается со слов человека: пока неизвестно → не практикует → иногда → ежедневно → дважды в день → дважды в день и хочет инициацию. Не выводите её из посещаемости.\n\n## Напоминания приложения\n\n- О подтверждённой встрече — в пределах **${c.reminderHours} часов** до начала.\n- Обратная связь после первого посещения — через **${c.feedbackHours} часа**, если её ещё не записали.\n- Для контакта через 1–2 месяца — назначьте свою дату следующей связи.\n\n[Как работать с приложением](application.md) · [Если человек перестал приходить](journey.md#care-step-6)\n\n</div>\n`;
const target=path.join(root,"docs/start/care/statuses.md");
if(process.argv.includes("--check")) {
 if(!fs.existsSync(target)||fs.readFileSync(target,"utf8").replace(/\r\n/g,"\n")!==md)throw new Error("Care reference is out of date: run node scripts/sync-care-reference.cjs");
} else {fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,md);}
console.log("Care reference agrees with app: "+Object.values(data.labels).length+" states; "+c.firstAbsenceDays+"/"+c.secondAbsenceDays+"/"+c.reactivationDays+" days");
