(function () {
  "use strict";

  // 独立 storage key，确保与旧版数据完全隔离
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

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

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

      const h = document.createElement("h3");
      h.textContent = n.title || "未命名";

      const p = document.createElement("p");
      p.textContent = n.content;

      const t = document.createElement("span");
      t.className = "time";
      t.textContent = fmtTime(n.ts);

      const del = document.createElement("button");
      del.className = "del";
      del.textContent = "×";
      del.setAttribute("aria-label", "删除");
      del.addEventListener("click", () => {
        notes = notes.filter(x => x.id !== n.id);
        save();
        render();
        toastShow("已删除");
      });

      card.appendChild(h);
      card.appendChild(p);
      card.appendChild(t);
      card.appendChild(del);
      listEl.appendChild(card);
    });
  }

  function addNote() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!content) {
      toastShow("内容不能为空");
      contentInput.focus();
      return;
    }
    notes.unshift({ id: uid(), title, content, ts: Date.now() });
    save();
    render();
    titleInput.value = "";
    contentInput.value = "";
    contentInput.focus();
    toastShow("已保存 ✅");
  }

  saveBtn.addEventListener("click", addNote);

  contentInput.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      addNote();
    }
  });

  clearBtn.addEventListener("click", () => {
    titleInput.value = "";
    contentInput.value = "";
    titleInput.focus();
  });

  render();
})();
