(function(){
"use strict";
var STORAGE_KEY="agnotesnotes.v1.0.1";
var titleInput=document.getElementById("title");
var contentInput=document.getElementById("content");
var saveBtn=document.getElementById("saveBtn");
var clearBtn=document.getElementById("clearBtn");
var listEl=document.getElementById("list");
var countEl=document.getElementById("count");
var toast=document.getElementById("toast");
var notes=load();
function load(){try{var raw=localStorage.getItem(STORAGE_KEY);var a=raw?JSON.parse(raw):[];return Array.isArray(a)?a:[]}catch(e){return[]}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(notes))}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function fmtTime(ts){var d=new Date(ts);var p=function(n){return String(n).padStart(2,"0")};return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+" "+p(d.getHours())+":"+p(d.getMinutes())}
function toastShow(m){toast.textContent=m;toast.classList.add("show");clearTimeout(toastShow._t);toastShow._t=setTimeout(function(){toast.classList.remove("show")},1600)}
function render(){
countEl.textContent=String(notes.length);listEl.innerHTML="";
if(notes.length===0){var e=document.createElement("div");e.className="empty";e.textContent="还没有便签，写一条试试看吧 ✍️";listEl.appendChild(e);return}
notes.forEach(function(n){
var c=document.createElement("div");c.className="card";
var h=document.createElement("h3");h.textContent=n.title||"未命名";
var p=document.createElement("p");p.textContent=n.content;
var t=document.createElement("span");t.className="time";t.textContent=fmtTime(n.ts);
var del=document.createElement("button");del.className="del";del.textContent="×";
del.onclick=function(){notes=notes.filter(function(x){return x.id!==n.id});save();render();toastShow("已删除")};
c.appendChild(h);c.appendChild(p);c.appendChild(t);c.appendChild(del);listEl.appendChild(c);
});
}
function addNote(){
var title=titleInput.value.trim();var content=contentInput.value.trim();
if(!content){toastShow("内容不能为空");contentInput.focus();return}
notes.unshift({id:uid(),title:title,content:content,ts:Date.now()});
save();render();titleInput.value="";contentInput.value="";contentInput.focus();toastShow("已保存 ✅");
}
saveBtn.onclick=addNote;
contentInput.addEventListener("keydown",function(e){if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();addNote()}});
clearBtn.onclick=function(){titleInput.value="";contentInput.value="";titleInput.focus()};
render();
})();
