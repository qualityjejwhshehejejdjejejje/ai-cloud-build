(function () {
  "use strict";
  const STORAGE_KEY = "agnotes.v1.0.1";
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const listEl = document.getElementById("list");
  const countEl = document.getElementById("count");
  const toast = document.getElementById("toast");

  let notes = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function fmtTime(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function toastShow(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastShow._t);
    toastShow._t = setTimeout(() => toast.classList.remove("show"), 1600);
  }
  function render() {
    countEl.textContent = String(notes.length);
    listEl.innerHTML = "";
    if (notes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "还没有便签，写一条试试看吧 ✍️";
      listEl.appendChild(empty);
      return;
    }
    notes.forEach(n => {
      const card = document.createElement("div");
      card.className = "card";
      const h = document.createElement
