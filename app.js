const $=id=>document.getElementById(id);
let token='',role='',tickets=[],users=[];
const labels={open:'Aberto',progress:'Em atendimento',resolved:'Resolvido',low:'Baixa',normal:'Normal',high:'Alta',urgent:'Urgente'};
function notify(s){$('message').textContent=s;setTimeout(()=>{$('message').textContent=''},5000)}
async function api(path,method='GET',body){
 const r=await fetch('/api/'+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:body===undefined?undefined:JSON.stringify(body)});
 if(!r.ok){if(r.status===401&&token)logout();throw Error('Operação não concluída ('+r.status+')');}
 return r.status===204?null:r.json();
}
function logout(){token='';role='';tickets=[];users=[];$('rows').replaceChildren();$('workspace').hidden=true;$('login').hidden=false;$('loginForm').reset();document.querySelectorAll('dialog[open]').forEach(d=>d.close())}
function safe(fn){return async e=>{try{await fn(e)}catch(err){notify(err.message)}}}
$('loginForm').onsubmit=safe(async e=>{e.preventDefault();const u=await api('login','POST',Object.fromEntries(new FormData(e.target)));token=u.token;role=u.role;$('welcome').textContent='Bem-vindo, '+u.name;$('login').hidden=true;$('workspace').hidden=false;$('newUser').hidden=role!=='admin';e.target.reset();await load()});
async function load(){[tickets,users]=await Promise.all([api('tickets'),api('users')]);render()}
function render(){
 $('metrics').replaceChildren();
 for(const [label,n] of [['Abertos',tickets.filter(t=>t.status==='open').length],['Em atendimento',tickets.filter(t=>t.status==='progress').length],['Resolvidos',tickets.filter(t=>t.status==='resolved').length],['Urgentes ativos',tickets.filter(t=>t.priority==='urgent'&&t.status!=='resolved').length]]){
 const d=document.createElement('div');d.className='metric';d.textContent=label;const s=document.createElement('strong');s.textContent=n;d.append(s);$('metrics').append(d)}
 $('rows').replaceChildren();const q=$('search').value.toLowerCase(),f=$('filter').value;
 for(const t of tickets.filter(t=>(!f||t.status===f)&&[t.id,t.title,t.customer].join(' ').toLowerCase().includes(q))){
 const tr=document.createElement('tr');for(const v of [t.id,t.title,t.customer,labels[t.priority],labels[t.status],t.technician||'Não atribuído']){const td=document.createElement('td');td.textContent=v;tr.append(td)}
 const td=document.createElement('td'),b=document.createElement('button');b.textContent='Editar';b.onclick=()=>edit(t);td.append(b);
 if(role==='admin'){const del=document.createElement('button');del.textContent='Excluir';del.onclick=safe(async()=>{if(confirm('Excluir chamado?')){await api('tickets/'+t.id,'DELETE');await load()}});td.append(del)}tr.append(td);$('rows').append(tr)}
}
function edit(t={}){const f=$('ticketForm');f.reset();$('assignee').replaceChildren(new Option('Não atribuído',''));for(const u of users)$('assignee').add(new Option(u.name,u.id));for(const k of ['id','title','customer','description','priority','status','assigned_to'])if(t[k]!=null)f.elements[k].value=t[k];$('ticketDialog').showModal()}
$('ticketForm').onsubmit=safe(async e=>{e.preventDefault();const t=Object.fromEntries(new FormData(e.target)),id=t.id;delete t.id;t.assigned_to=t.assigned_to?Number(t.assigned_to):null;await api('tickets'+(id?'/'+id:''),id?'PUT':'POST',t);$('ticketDialog').close();await load();notify('Chamado salvo')});
$('userForm').onsubmit=safe(async e=>{e.preventDefault();await api('users','POST',Object.fromEntries(new FormData(e.target)));e.target.reset();$('userDialog').close();await load();notify('Técnico cadastrado')});
$('newTicket').onclick=()=>edit();$('newUser').onclick=()=>$('userDialog').showModal();$('logout').onclick=logout;$('refresh').onclick=safe(load);$('home').onclick=safe(load);$('search').oninput=render;$('filter').onchange=render;document.querySelectorAll('.cancel').forEach(b=>b.onclick=()=>b.closest('dialog').close());
