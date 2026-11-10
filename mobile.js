'use strict';
(() => {
  const menu=document.getElementById('mobileMenu');
  const sidebar=document.querySelector('aside');
  function setOpen(open){sidebar.dataset.menuOpen=String(open);menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰';}
  menu.onclick=()=>setOpen(sidebar.dataset.menuOpen!=='true');
  sidebar.querySelector('nav').addEventListener('click',e=>{if(e.target.closest('button'))setOpen(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.dataset.menuOpen==='true'){setOpen(false);menu.focus();}});
})();
