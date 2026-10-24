(()=>{
'use strict';
const get=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const services=['Full Set','Refills','Manicure Without Color Polish','Manicure With Color Polish','Gems','Other'];
let rows=[];
let nextId=1;
const now=new Date();
const localDate=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
get('date').value=localDate;
get('month').value=localDate.slice(0,7);
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T12:00:00').toISOString().slice(0,10)===s;
const validRow=r=>r&&validDate(String(r.date))&&services.includes(String(r.service))&&Number.isFinite(Number(r.amount))&&Number(r.amount)>=0&&Number(r.amount)<=100000;
function notify(msg){get('feedback').textContent=msg;}
function buildBars(element,items,format){
  element.replaceChildren();
  if(items.length===0){const p=document.createElement('p');p.textContent='No completed services recorded yet.';element.appendChild(p);return;}
  const maximum=Math.max(...items.map(x=>x.value),1);
  for(const item of items){
    const line=document.createElement('div');line.className='chartrow';
    const name=document.createElement('span');name.className='chartname';name.textContent=item.label;
    const bg=document.createElement('div');bg.className='barbg';
    const bar=document.createElement('div');bar.className='bar';bar.style.width=(item.value/maximum*100)+'%';
    const value=document.createElement('span');value.className='chartvalue';value.textContent=format(item.value);
    bg.appendChild(bar);line.append(name,bg,value);element.appendChild(line);
  }
}
function redraw(){
 const month=get('month').value;const monthly=rows.filter(r=>r.date.slice(0,7)===month);
 const total=rows.reduce((sum,r)=>sum+r.amount,0),selected=monthly.reduce((sum,r)=>sum+r.amount,0);
 get('total').textContent=money(total);
 get('monthTotal').textContent=money(selected);
 get('count').textContent=String(rows.length);
 get('average').textContent=money(rows.length?total/rows.length:0);
 const byService=services.map(name=>({label:name,value:monthly.filter(r=>r.service===name).reduce((s,r)=>s+r.amount,0)})).filter(x=>x.value>0);
 buildBars(get('serviceBreakdown'),byService,money);
 const byMonth=new Map();
 for(const r of rows){const key=r.date.slice(0,7);byMonth.set(key,(byMonth.get(key)||0)+r.amount);}
 buildBars(get('monthlyChart'),Array.from(byMonth).sort((a,b)=>a[0].localeCompare(b[0])).slice(-12).map(([label,value])=>({label,value})),money);
 const tbody=get('entries');tbody.replaceChildren();
 const display=[...rows].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
 for(const r of display){
   const tr=document.createElement('tr');
   for(const t of [r.date,r.service,money(r.amount)]){const td=document.createElement('td');td.textContent=t;tr.appendChild(td);}
   const td=document.createElement('td');const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Remove';button.setAttribute('aria-label','Remove '+r.service+' on '+r.date);button.addEventListener('click',()=>{rows=rows.filter(x=>x.id!==r.id);redraw();notify('Entry removed from this tab.');});td.appendChild(button);tr.appendChild(td);tbody.appendChild(tr);
 }
 get('tableInfo').textContent=display.length+' completed service'+(display.length===1?'':'s')+' recorded in this tab.';
 get('export').disabled=rows.length===0;
}
get('add').addEventListener('click',()=>{
 const row={date:get('date').value,service:get('service').value,amount:Number(get('amount').value)};
 if(get('amount').value.trim()===''||!validRow(row)){notify('Please enter a valid date, service and amount from $0 to $100,000.');return;}
 rows.push({...row,id:nextId++});
 get('month').value=row.date.slice(0,7);
 get('amount').value='';redraw();notify('Completed service added to this tab. Export CSV to save your records.');
});
get('month').addEventListener('change',redraw);
function csvEscape(s){const str=String(s);return /[",\r\n]/.test(str)?'"'+str.replace(/"/g,'""')+'"':str;}
get('export').addEventListener('click',()=>{
 if(rows.length===0)return;
 const csv='date,service,amount\r\n'+rows.map(r=>[r.date,r.service,r.amount.toFixed(2)].map(csvEscape).join(',')).join('\r\n')+'\r\n';
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='nails-by-kara-revenue-'+localDate+'.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 notify('CSV download started. Save the file somewhere private.');
});
get('import').addEventListener('click',()=>get('csvfile').click());
function parseCSV(text){
 const lines=[];let line=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){const ch=text[i];if(quoted){if(ch==='"'&&text[i+1]==='"'){field+='"';i++;}else if(ch==='"'){quoted=false;}else{field+=ch;}}
 else if(ch==='"'){quoted=true;}else if(ch===','){line.push(field);field='';}else if(ch==='\n'){line.push(field.replace(/\r$/,''));lines.push(line);line=[];field='';}else{field+=ch;}}
 if(quoted)throw Error('Unclosed CSV quote');
 if(field||line.length){line.push(field.replace(/\r$/,''));lines.push(line);}
 return lines;
}
get('csvfile').addEventListener('change',async event=>{
 const file=event.target.files&&event.target.files[0];
 if(!file)return;
 try{
  if(file.size>2_000_000)throw Error('The CSV exceeds the 2 MB limit.');
  const parsed=parseCSV((await file.text()).replace(/^\uFEFF/,''));
  if(!parsed.length||parsed[0].join(',')!=='date,service,amount')throw Error('Expected CSV header: date,service,amount');
  const incoming=parsed.slice(1).filter(r=>r.some(s=>s.trim()!==''));
  if(incoming.length>10000)throw Error('Too many records.');
  const verified=incoming.map(row=>{if(row.length!==3||row[2].trim()===''||!/^\d+(?:\.\d{1,2})?$/.test(row[2]))throw Error('Invalid row format');const candidate={date:row[0],service:row[1],amount:Number(row[2])};if(!validRow(candidate))throw Error('Invalid date, service, or amount in CSV');return candidate;});
  if(rows.length&&!confirm('Replace the current unsaved entries with '+verified.length+' imported records?'))return;
  rows=verified.map(row=>({...row,id:nextId++}));redraw();notify('Imported '+rows.length+' records into this tab only.');
 }catch(err){notify('Import failed: '+err.message);}
 finally{get('csvfile').value='';}
});
get('clear').addEventListener('click',()=>{
 if(!rows.length)return;
 if(confirm('Clear all revenue entries from this browser tab? Export a CSV first if you want to keep them.')){rows=[];redraw();notify('This tab has been cleared.');}
});
redraw();
})();