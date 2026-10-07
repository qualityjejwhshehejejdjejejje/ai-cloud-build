(function () {
  "use strict";

  // 使用独立的 storage key，确保即使与旧版混淆也不会读取到旧数据
  const STORAGE_KEY = "notes.v1.0.1.ag";
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
