document.addEventListener("DOMContentLoaded",()=>{
  const button=document.querySelector(".menu-button");
  const nav=document.querySelector(".nav");
  if(!button||!nav)return;
  const close=()=>{nav.classList.remove("open");button.setAttribute("aria-expanded","false")};
  button.addEventListener("click",()=>{
    const open=nav.classList.toggle("open");
    button.setAttribute("aria-expanded",String(open));
  });
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  document.addEventListener("click",e=>{
    if(nav.classList.contains("open")&&!nav.contains(e.target)&&!button.contains(e.target))close();
  });
});
