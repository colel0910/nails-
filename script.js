const c=window.STUDIO;
const safe=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
document.title=`${c.name} | Book Your Set`;
document.getElementById('headerBrand').innerHTML=safe(c.name).toUpperCase();
document.getElementById('footerBrand').textContent=c.name.toUpperCase();
document.getElementById('copyrightBrand').textContent=c.name;
document.getElementById('year').textContent=new Date().getFullYear();
document.getElementById('aboutText').textContent=c.about;
document.getElementById('serviceGrid').innerHTML=c.services.map((s,i)=>`<article class="service-card"><div class="service-icon">${safe(s.icon||'✧')}</div><div class="service-number">0${i+1}</div><h3>${safe(s.name)}</h3><p>${safe(s.description)}</p><div class="service-bottom"><strong>${safe(s.price)}</strong><small>${safe(s.duration)}</small></div><a href="#booking" aria-label="Book ${safe(s.name)}" class="service-link">Book this service ↗</a></article>`).join('');
document.getElementById('galleryGrid').innerHTML=c.gallery.map((g,i)=>{const hasImg=typeof g.src==='string'&&g.src.trim()!=='';return `<figure class="gallery-item gallery-${i%6}">${hasImg?`<a href="${safe(g.src)}" class="gallery-photo-link" data-full="${safe(g.src)}" data-caption="${safe(g.caption)}" aria-label="Enlarge ${safe(g.caption)}"><img loading="lazy" src="${safe(g.src)}" alt="${safe(g.caption)}"></a>`:`<div class="gallery-placeholder"><span class="flower">${['✿','✧','❀','✦','♡','✳'][i%6]}</span><span>YOUR NAIL PHOTO HERE</span></div>`}<figcaption>${safe(g.caption)} <span>↗</span></figcaption></figure>`}).join('');
if(c.instagram&&/^https:\/\//.test(c.instagram)){for(const id of ['instagramGallery','instagramFooter']){let a=document.getElementById(id);a.href=c.instagram;a.target='_blank';a.rel='noopener noreferrer'}}else{document.getElementById('instagramGallery').textContent='Add your Instagram in config.js ↗';document.getElementById('instagramFooter').textContent='Instagram coming soon'}
if(c.email){document.getElementById('emailFooter').href='mailto:'+encodeURIComponent(c.email)}else document.getElementById('emailFooter').textContent='Email coming soon';
if(c.bookingUrl&&/^https:\/\//.test(c.bookingUrl)){
  const box=document.getElementById('bookingBox');box.innerHTML='';
  const heading=document.createElement('h3');heading.textContent='Book with Kara ♡';box.appendChild(heading);
  const intro=document.createElement('p');intro.textContent='Choose a nail service, then pick an available appointment on Kara’s Google Calendar.';box.appendChild(intro);
  const label=document.createElement('label');label.className='booking-label';label.htmlFor='nailService';label.textContent='What service would you like?';box.appendChild(label);
  const select=document.createElement('select');select.id='nailService';select.className='booking-select';select.required=true;
  select.appendChild(new Option('Select a service…',''));
  c.services.forEach((service,index)=>select.appendChild(new Option(service.name+' — '+service.price,String(index))));
  box.appendChild(select);
  const price=document.createElement('p');price.className='selected-service';price.setAttribute('aria-live','polite');price.textContent='Choose a service to see the price.';box.appendChild(price);
  const button=document.createElement('a');button.className='btn primary booking-next';button.href=c.bookingUrl;button.target='_blank';button.rel='noopener noreferrer';button.textContent='Choose Appointment Time ↗';button.setAttribute('aria-disabled','true');button.tabIndex=-1;box.appendChild(button);
  const note=document.createElement('p');note.className='booking-fine-print';note.textContent='After selecting a time, enter your chosen service in the Google booking form. Selecting it here does not automatically send it to Google Calendar. Gems are an add-on ($2 per hand). Your booking is confirmed only when you finish the Google form.';box.appendChild(note);
  select.addEventListener('change',()=>{
    const selected=c.services[Number(select.value)];
    if(select.value!==''&&selected){
      price.textContent='Selected: '+selected.name+' · '+selected.price;
      button.setAttribute('aria-disabled','false');button.tabIndex=0;
    }else{
      price.textContent='Choose a service to see the price.';
      button.setAttribute('aria-disabled','true');button.tabIndex=-1;
    }
  });
  button.addEventListener('click',event=>{if(button.getAttribute('aria-disabled')==='true')event.preventDefault()});
  document.querySelectorAll('.service-link').forEach((link,index)=>link.addEventListener('click',()=>{
    select.value=String(index);select.dispatchEvent(new Event('change'));
  }));
}
const b=document.getElementById('menuBtn'),n=document.getElementById('nav');b.addEventListener('click',()=>{let open=n.classList.toggle('open');b.setAttribute('aria-expanded',String(open))});n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false')}));

// Accessible enlarged photo viewer, with click-outside and Escape to close.
const viewer=document.createElement('dialog'); viewer.className='photo-lightbox'; viewer.innerHTML='<button type="button" class="close-photo" aria-label="Close enlarged photo">×</button><img alt=""><p></p>';document.body.appendChild(viewer);
document.querySelectorAll('.gallery-photo-link').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();viewer.querySelector('img').src=a.dataset.full;viewer.querySelector('img').alt=a.dataset.caption;viewer.querySelector('p').textContent=a.dataset.caption;viewer.showModal()}));
viewer.querySelector('button').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
