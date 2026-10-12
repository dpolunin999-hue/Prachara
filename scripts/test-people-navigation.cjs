const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const now=new Date('2026-10-12T12:00:00+05:00').getTime();
class FixedDate extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
const people=[
 {id:1,first:'Митя',visits:1,recentVisits:1,lastVisit:'2026-10-11T12:00:00+05:00',rec:{type:'feedback',priority:'medium',dueAt:'2026-10-11T16:00:00+05:00'}},
 {id:2,first:'Елизавета',visits:8,recentVisits:3,lastVisit:'2026-10-01T12:00:00+05:00',rec:{type:'individual',priority:'high'}},
 {id:3,first:'Давний участник',visits:40,recentVisits:0,lastVisit:'2026-08-01T12:00:00+05:00',rec:{type:'reactivation',priority:'low'}},
 {id:4,first:'Новый контакт',visits:0,recentVisits:0,lastVisit:'2026-10-12T12:00:00+05:00',rec:{type:'new_contact',priority:'high'}},
 {id:5,first:'После встречи',visits:1,recentVisits:1,lastVisit:'2026-10-12T11:00:00+05:00',rec:{type:'feedback',priority:'medium',dueAt:'2026-10-12T15:00:00+05:00'}},
];
const state={people,events:[{date:'2026-10-11T12:00:00+05:00',newPersonIds:[1,1,5]},{date:'2026-09-20T12:00:00+05:00',newPersonIds:[2]},{date:'2026-11-01T12:00:00+05:00',newPersonIds:[3]}]};
const nodes=new Map(),opened=[];const select=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',open:false,showModal(){this.open=true}});return nodes.get(id)};
const context=vm.createContext({Date:FixedDate,DAY:864e5,state,$:select,careRecommendation:p=>p.rec||null,showProfile:id=>opened.push(id),toast:text=>{throw Error(text)},avatarMarkup:()=>'',h:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')});
const app=fs.readFileSync('app/app.js','utf8');
vm.runInContext(app.split(/\r?\n/).filter(line=>/^function (lastAttendanceTime|attendanceOrder|carePriorityGroup|careRecommendations)\(/.test(line)).join('\n'),context);
vm.runInContext(fs.readFileSync('app/people-navigation.js','utf8'),context);
const ids=expression=>Array.from(vm.runInContext(expression,context),p=>p.id);
assert.deepEqual(ids('[...state.people].sort(attendanceOrder)'),[5,1,2,3,4],'last attendance beats historical visit count and creation date');
assert.deepEqual(ids('peopleForMetric("visited")'),[1,2,5],'only visitors inside the last 30 days');
assert.deepEqual(ids('peopleForMetric("regular")'),[2],'regular visitors');
assert.deepEqual(ids('peopleForMetric("new")'),[1,5],'calendar month and unique people');
assert.deepEqual(ids('careRecommendations().map(x=>x.p)'),[2,1,4,3],'actual visitor tasks first, premature feedback excluded');
select('#newcomerMonthLabel').textContent='новеньких в октябре';
vm.runInContext('showMetricPeople("new")',context);
assert.equal(select('#attendeeDetailsMeta').textContent,'2 человек');
assert.equal((select('#attendeeDetailsList').innerHTML.match(/onclick="openAttendeeProfile/g)||[]).length,2);
context.click={stopPropagation(){this.stopped=true}};vm.runInContext('openAttendeeProfile(click,1)',context);
assert.deepEqual(opened,[1]);assert.equal(context.click.stopped,true);assert.equal(select('#attendanceDetailsDialog').open,true,'participant list stays under the profile');
assert.match(app,/Был \$\{new Date\(p.lastVisit\).toLocaleDateString\("ru-RU"\)\}/,'date visible on collapsed person card');
console.log('People navigation checks passed: dates, sorting, care, metric lists and profile links.');
