(() => {
  "use strict";

  const STORAGE_KEY = "dailyLog.tasks.v1";
  const THEME_KEY = "dailyLog.theme";
  const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
  const MONTHS = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY",
    "AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

  const CATEGORIES = {
    work:     { label: "Work",     color: "var(--cat-work)" },
    personal: { label: "Personal", color: "var(--cat-personal)" },
    urgent:   { label: "Urgent",   color: "var(--cat-urgent)" },
    health:   { label: "Health",   color: "var(--cat-health)" },
    errands:  { label: "Errands",  color: "var(--cat-errands)" },
    other:    { label: "Other",    color: "var(--cat-other)" },
  };
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const RING_CIRCUMFERENCE = 2 * Math.PI * 27;

  // ---------- State ----------
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth(); // 0-11
  let selectedDate = toDateKey(today);
  let tasks = loadTasks();
  let calendarOpen = true;
  let insightsOpen = false;
  let searchQuery = "";
  let activeCategories = new Set();
  let sortMode = "time";
  let editingTask = null;
  let editingDateKey = null;
  let modalSubtasks = [];

  // ---------- Elements ----------
  const el = {
    monthLabel: document.getElementById("monthLabel"),
    yearLabel: document.getElementById("yearLabel"),
    prevMonth: document.getElementById("prevMonth"),
    nextMonth: document.getElementById("nextMonth"),
    monthYearBtn: document.getElementById("monthYearBtn"),
    themeToggle: document.getElementById("themeToggle"),
    calendarGrid: document.getElementById("calendarGrid"),
    calendarSection: document.getElementById("calendarSection"),
    calendarToggle: document.getElementById("calendarToggle"),
    insightsPanel: document.getElementById("insightsPanel"),
    insightsToggle: document.getElementById("insightsToggle"),
    insightRingValue: document.getElementById("insightRingValue"),
    insightRingPct: document.getElementById("insightRingPct"),
    insightStreak: document.getElementById("insightStreak"),
    insightSparkline: document.getElementById("insightSparkline"),
    searchInput: document.getElementById("searchInput"),
    categoryChips: document.getElementById("categoryChips"),
    sortSelect: document.getElementById("sortSelect"),
    punchlist: document.querySelector(".punchlist"),
    sheetDate: document.getElementById("sheetDate"),
    sheetDay: document.getElementById("sheetDay"),
    sheetStatus: document.getElementById("sheetStatus"),
    taskList: document.getElementById("taskList"),
    emptyState: document.getElementById("emptyState"),
    addTaskBtn: document.getElementById("addTaskBtn"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalTitle: document.getElementById("modalTitle"),
    taskForm: document.getElementById("taskForm"),
    taskTitle: document.getElementById("taskTitle"),
    taskCategory: document.getElementById("taskCategory"),
    taskPriority: document.getElementById("taskPriority"),
    taskTime: document.getElementById("taskTime"),
    taskRepeat: document.getElementById("taskRepeat"),
    taskReminder: document.getElementById("taskReminder"),
    taskNotes: document.getElementById("taskNotes"),
    subtaskList: document.getElementById("subtaskList"),
    subtaskInput: document.getElementById("subtaskInput"),
    addSubtaskBtn: document.getElementById("addSubtaskBtn"),
    cancelTask: document.getElementById("cancelTask"),
    confirmOverlay: document.getElementById("confirmOverlay"),
    confirmMessage: document.getElementById("confirmMessage"),
    confirmActions: document.getElementById("confirmActions"),
    reminderBanner: document.getElementById("reminderBanner"),
    reminderText: document.getElementById("reminderText"),
    dismissReminder: document.getElementById("dismissReminder"),
    notifyPill: document.getElementById("notifyPill"),
    installBtn: document.getElementById("installBtn"),
  };

  // ---------- Helpers ----------
  function toDateKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function parseDateKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ---------- Persistence & migration ----------
  function migrateTask(t) {
    if (t.repeat !== undefined) return t;
    return {
      id: t.id,
      title: t.title,
      category: t.category || "other",
      priority: t.priority || "medium",
      time: t.time || "",
      reminder: !!t.reminder,
      notes: t.notes || "",
      subtasks: t.subtasks || [],
      repeat: "none",
      startDate: t.date,
      done: !!t.done,
      notified: !!t.notified,
      completions: {},
      notifiedDates: {},
      skipped: {},
      order: Date.now() + Math.random(),
    };
  }
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return parsed.map(migrateTask);
    } catch (e) {
      console.error("Could not read saved tasks", e);
      return [];
    }
  }
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("Could not save tasks", e);
    }
  }

  // ---------- Occurrence logic (supports recurring tasks) ----------
  function matchesRepeat(task, dateObj) {
    const startObj = parseDateKey(task.startDate);
    if (dateObj < startObj) return false;
    if (task.repeat === "daily") return true;
    if (task.repeat === "weekdays") { const wd = dateObj.getDay(); return wd >= 1 && wd <= 5; }
    if (task.repeat === "weekly") return dateObj.getDay() === startObj.getDay();
    return false;
  }
  function occursOn(task, dateKey) {
    if (task.repeat === "none") return task.startDate === dateKey;
    if (task.skipped && task.skipped[dateKey]) return false;
    return matchesRepeat(task, parseDateKey(dateKey));
  }
  function isDoneOn(task, dateKey) {
    return task.repeat === "none" ? !!task.done : !!(task.completions && task.completions[dateKey]);
  }
  function setDoneOn(task, dateKey, value) {
    if (task.repeat === "none") {
      task.done = value;
    } else {
      task.completions = task.completions || {};
      if (value) task.completions[dateKey] = true;
      else delete task.completions[dateKey];
    }
  }
  function isNotifiedOn(task, dateKey) {
    return task.repeat === "none" ? !!task.notified : !!(task.notifiedDates && task.notifiedDates[dateKey]);
  }
  function setNotifiedOn(task, dateKey) {
    if (task.repeat === "none") task.notified = true;
    else { task.notifiedDates = task.notifiedDates || {}; task.notifiedDates[dateKey] = true; }
  }
  function tasksForDate(dateKey) {
    return tasks.filter((t) => occursOn(t, dateKey));
  }

  // ---------- Confirm dialog ----------
  function showConfirm(message, buttons) {
    el.confirmMessage.textContent = message;
    el.confirmActions.innerHTML = "";
    buttons.forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = b.label;
      if (b.danger) btn.classList.add("confirm-danger");
      if (b.cancel) btn.classList.add("confirm-cancel");
      btn.addEventListener("click", () => {
        el.confirmOverlay.hidden = true;
        if (b.onClick) b.onClick();
      });
      el.confirmActions.appendChild(btn);
    });
    el.confirmOverlay.hidden = false;
  }
  el.confirmOverlay.addEventListener("click", (e) => {
    if (e.target === el.confirmOverlay) el.confirmOverlay.hidden = true;
  });

  function requestDelete(task, dateKey) {
    if (task.repeat === "none") {
      showConfirm(`Remove "${task.title}" from the sheet?`, [
        { label: "Delete", danger: true, onClick: () => { tasks = tasks.filter((t) => t.id !== task.id); saveTasks(); renderAll(); } },
        { label: "Cancel", cancel: true },
      ]);
    } else {
      showConfirm(`"${task.title}" repeats. What do you want to remove?`, [
        { label: "Just this occurrence", onClick: () => {
            task.skipped = task.skipped || {};
            task.skipped[dateKey] = true;
            saveTasks(); renderAll();
          } },
        { label: "Entire series", danger: true, onClick: () => { tasks = tasks.filter((t) => t.id !== task.id); saveTasks(); renderAll(); } },
        { label: "Cancel", cancel: true },
      ]);
    }
  }

  // ---------- Theme ----------
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    el.themeToggle.textContent = theme === "light" ? "☀️" : "🌙";
    el.themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  }
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || ((window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark");
    applyTheme(theme);
  }
  el.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // ---------- Calendar rendering ----------
  function renderCalendar() {
    el.monthLabel.textContent = MONTHS[viewMonth];
    el.yearLabel.textContent = String(viewYear);
    el.calendarGrid.innerHTML = "";

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const blank = document.createElement("div");
      blank.className = "cal-day blank";
      el.calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(viewYear, viewMonth, day);
      const key = toDateKey(dateObj);
      const btn = document.createElement("button");
      btn.className = "cal-day";
      btn.type = "button";
      if (key === toDateKey(today)) btn.classList.add("today");
      if (key === selectedDate) btn.classList.add("selected");

      const num = document.createElement("span");
      num.textContent = String(day);
      btn.appendChild(num);

      if (tasksForDate(key).length > 0) {
        const dot = document.createElement("span");
        dot.className = "dot";
        btn.appendChild(dot);
      }

      btn.addEventListener("click", () => {
        selectedDate = key;
        renderAll();
      });
      el.calendarGrid.appendChild(btn);
    }
  }

  // ---------- Filtering / sorting ----------
  function isManualSort() { return sortMode === "manual"; }

  function getVisibleTasks(dateKey) {
    let list = tasksForDate(dateKey);
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.notes || "").toLowerCase().includes(q));
    if (activeCategories.size) list = list.filter((t) => activeCategories.has(t.category));

    list = list.slice();
    switch (sortMode) {
      case "priority":
        list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || (a.time || "99:99").localeCompare(b.time || "99:99"));
        break;
      case "alpha":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "status":
        list.sort((a, b) => Number(isDoneOn(a, dateKey)) - Number(isDoneOn(b, dateKey)) || (a.time || "99:99").localeCompare(b.time || "99:99"));
        break;
      case "manual":
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        break;
      default: // time
        list.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
    }
    return list;
  }

  function renderCategoryChips() {
    el.categoryChips.innerHTML = "";
    Object.entries(CATEGORIES).forEach(([key, info]) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (activeCategories.has(key) ? " active" : "");
      const dot = document.createElement("span");
      dot.className = "chip-dot";
      dot.style.background = info.color;
      chip.append(dot, document.createTextNode(info.label));
      chip.addEventListener("click", () => {
        if (activeCategories.has(key)) activeCategories.delete(key);
        else activeCategories.add(key);
        chip.classList.toggle("active");
        renderSheet();
      });
      el.categoryChips.appendChild(chip);
    });
  }

  // ---------- Punch-list / sheet rendering ----------
  function renderSheet() {
    const dateObj = parseDateKey(selectedDate);
    el.sheetDate.textContent =
      String(dateObj.getMonth() + 1).padStart(2, "0") + "." +
      String(dateObj.getDate()).padStart(2, "0") + "." +
      dateObj.getFullYear();
    el.sheetDay.textContent = ["SUN","MON","TUE","WED","THU","FRI","SAT"][dateObj.getDay()];

    const allDayTasks = tasksForDate(selectedDate);
    const doneCount = allDayTasks.filter((t) => isDoneOn(t, selectedDate)).length;
    el.sheetStatus.textContent = `${doneCount}/${allDayTasks.length} DONE`;

    const visibleTasks = getVisibleTasks(selectedDate);

    el.taskList.innerHTML = "";
    el.punchlist.classList.toggle("manual-sort", isManualSort());

    if (allDayTasks.length === 0) {
      el.emptyState.innerHTML = 'No items logged for this sheet.<br>Tap <strong>+ LOG ITEM</strong> to add one.';
      el.emptyState.style.display = "block";
    } else if (visibleTasks.length === 0) {
      el.emptyState.innerHTML = "No tasks match your search or filters.";
      el.emptyState.style.display = "block";
    } else {
      el.emptyState.style.display = "none";
    }

    visibleTasks.forEach((task, index) => {
      el.taskList.appendChild(buildTaskRow(task, selectedDate, index));
    });
  }

  function buildTaskRow(task, dateKey, index) {
    const done = isDoneOn(task, dateKey);

    const wrap = document.createElement("div");
    wrap.className = "task-row-wrap";

    const actions = document.createElement("div");
    actions.className = "task-row-actions";
    const completeHint = document.createElement("div");
    completeHint.className = "task-swipe-hint complete";
    completeHint.textContent = done ? "↺ UNDO" : "✓ DONE";
    const deleteHint = document.createElement("div");
    deleteHint.className = "task-swipe-hint delete";
    deleteHint.textContent = "DELETE 🗑";
    actions.append(completeHint, deleteHint);

    const row = document.createElement("div");
    row.className = "task-row cat-" + (CATEGORIES[task.category] ? task.category : "other") + (done ? " done" : "");
    row.draggable = isManualSort();

    const no = document.createElement("span");
    no.className = "task-no";
    no.textContent = String(index + 1).padStart(2, "0");

    const check = document.createElement("button");
    check.type = "button";
    check.className = "task-check";
    check.setAttribute("aria-checked", done ? "true" : "false");
    check.textContent = done ? "✓" : "";
    check.addEventListener("click", (e) => { e.stopPropagation(); toggleDone(task.id, dateKey); });

    const main = document.createElement("div");
    main.className = "task-main";

    const titleRow = document.createElement("div");
    titleRow.className = "task-title-row";
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    titleRow.appendChild(title);
    if (task.repeat !== "none") {
      const rep = document.createElement("span");
      rep.className = "task-repeat-icon";
      rep.textContent = "🔁";
      titleRow.appendChild(rep);
    }
    main.appendChild(titleRow);

    if (task.notes) {
      const notes = document.createElement("div");
      notes.className = "task-notes";
      notes.textContent = task.notes;
      main.appendChild(notes);
    }

    const meta = document.createElement("div");
    meta.className = "task-meta";
    const catInfo = CATEGORIES[task.category] || CATEGORIES.other;
    const catChip = document.createElement("span");
    catChip.className = "task-cat-chip";
    catChip.style.background = catInfo.color;
    catChip.textContent = catInfo.label;
    meta.appendChild(catChip);

    const pri = document.createElement("span");
    pri.className = "task-priority";
    const priDot = document.createElement("span");
    priDot.className = "task-priority-dot " + task.priority;
    pri.append(priDot, document.createTextNode(task.priority));
    meta.appendChild(pri);

    if (task.subtasks && task.subtasks.length) {
      const subDone = task.subtasks.filter((s) => s.done).length;
      const subProg = document.createElement("span");
      subProg.className = "task-subtask-progress";
      subProg.textContent = `☑ ${subDone}/${task.subtasks.length}`;
      meta.appendChild(subProg);
    }
    main.appendChild(meta);

    if (task.subtasks && task.subtasks.length) {
      const bar = document.createElement("div");
      bar.className = "subtask-progress-bar";
      const fill = document.createElement("span");
      const pct = Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100);
      fill.style.width = pct + "%";
      bar.appendChild(fill);
      main.appendChild(bar);
    }

    main.addEventListener("click", () => {
      if (row.dataset.suppressClick === "1") return;
      openEditModal(task, dateKey);
    });

    const time = document.createElement("span");
    time.className = "task-time";
    if (task.time) {
      time.textContent = task.time;
      if (!done && isDueSoon(dateKey, task.time)) time.classList.add("due");
    } else {
      time.textContent = "—";
    }

    row.append(no, check, main, time);
    wrap.append(actions, row);

    attachSwipe(row, task, dateKey);
    attachDrag(row, task);

    return wrap;
  }

  function attachSwipe(row, task, dateKey) {
    let startX = 0, startY = 0, dx = 0, dragging = false, decided = false, isHorizontal = false;
    const THRESH = 64;

    row.addEventListener("pointerdown", (e) => {
      if (isManualSort()) return;
      if (e.target.closest(".task-check")) return;
      startX = e.clientX; startY = e.clientY; dx = 0;
      dragging = true; decided = false; isHorizontal = false;
    });
    row.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dxRaw = e.clientX - startX;
      const dyRaw = e.clientY - startY;
      if (!decided) {
        if (Math.abs(dxRaw) > 8 || Math.abs(dyRaw) > 8) {
          decided = true;
          isHorizontal = Math.abs(dxRaw) > Math.abs(dyRaw);
        } else return;
      }
      if (!isHorizontal) return;
      dx = Math.max(-100, Math.min(100, dxRaw));
      row.style.transform = `translateX(${dx}px)`;
      row.dataset.suppressClick = "1";
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      row.style.transform = "";
      if (isHorizontal && Math.abs(dx) > THRESH) {
        if (dx > 0) toggleDone(task.id, dateKey);
        else requestDelete(task, dateKey);
      }
      setTimeout(() => { row.dataset.suppressClick = "0"; }, 50);
    }
    row.addEventListener("pointerup", end);
    row.addEventListener("pointercancel", end);
  }

  function attachDrag(row, task) {
    row.addEventListener("dragstart", (e) => {
      if (!isManualSort()) { e.preventDefault(); return; }
      row.classList.add("dragging");
      e.dataTransfer.setData("text/plain", task.id);
      e.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragend", () => row.classList.remove("dragging"));
    row.addEventListener("dragover", (e) => {
      if (!isManualSort()) return;
      e.preventDefault();
    });
    row.addEventListener("drop", (e) => {
      if (!isManualSort()) return;
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      if (draggedId === task.id) return;
      reorderTasks(draggedId, task.id);
    });
  }

  function reorderTasks(draggedId, targetId) {
    const list = tasksForDate(selectedDate).sort((a, b) => (a.order || 0) - (b.order || 0));
    const draggedIdx = list.findIndex((t) => t.id === draggedId);
    const targetIdx = list.findIndex((t) => t.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;
    const [item] = list.splice(draggedIdx, 1);
    list.splice(targetIdx, 0, item);
    list.forEach((t, i) => { t.order = i; });
    saveTasks();
    renderSheet();
  }

  function isDueSoon(dateKey, time) {
    const now = new Date();
    if (dateKey !== toDateKey(now)) return false;
    const [h, m] = time.split(":").map(Number);
    const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const diffMin = (due - now) / 60000;
    return diffMin <= 15 && diffMin >= -30;
  }

  function toggleDone(id, dateKey) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setDoneOn(t, dateKey, !isDoneOn(t, dateKey));
    saveTasks();
    renderAll();
  }

  // ---------- Insights ----------
  function computeStreak() {
    const todayKey = toDateKey(today);
    const todayList = tasksForDate(todayKey);
    const todayComplete = todayList.length > 0 && todayList.every((t) => isDoneOn(t, todayKey));
    const cursor = new Date(today);
    if (!todayComplete) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const key = toDateKey(cursor);
      const dayList = tasksForDate(key);
      if (dayList.length === 0) break;
      if (!dayList.every((t) => isDoneOn(t, key))) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    if (todayComplete) streak++;
    return streak;
  }

  function renderSparkline() {
    el.insightSparkline.innerHTML = "";
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const list = tasksForDate(key);
      const done = list.filter((t) => isDoneOn(t, key)).length;
      const pct = list.length ? Math.round((done / list.length) * 100) : 0;
      const bar = document.createElement("div");
      bar.className = "spark-bar" + (i === 0 ? " is-today" : "");
      bar.title = `${key}: ${pct}%`;
      const fill = document.createElement("span");
      fill.style.height = Math.max(pct, 4) + "%";
      bar.appendChild(fill);
      el.insightSparkline.appendChild(bar);
    }
  }

  function updateInsights() {
    const todayKey = toDateKey(today);
    const todayList = tasksForDate(todayKey);
    const done = todayList.filter((t) => isDoneOn(t, todayKey)).length;
    const pct = todayList.length ? Math.round((done / todayList.length) * 100) : 0;
    const offset = RING_CIRCUMFERENCE * (1 - pct / 100);
    el.insightRingValue.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    el.insightRingValue.style.strokeDashoffset = String(offset);
    el.insightRingPct.textContent = pct + "%";
    el.insightStreak.textContent = String(computeStreak());
    renderSparkline();
  }

  function renderAll() {
    renderCalendar();
    renderSheet();
    updateInsights();
  }

  // ---------- Toolbar ----------
  el.searchInput.addEventListener("input", () => {
    searchQuery = el.searchInput.value;
    renderSheet();
  });
  el.sortSelect.addEventListener("change", () => {
    sortMode = el.sortSelect.value;
    renderSheet();
  });

  // ---------- Subtasks (modal) ----------
  function renderSubtaskList() {
    el.subtaskList.innerHTML = "";
    modalSubtasks.forEach((s, idx) => {
      const item = document.createElement("div");
      item.className = "subtask-item";
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = !!s.done;
      check.addEventListener("change", () => { s.done = check.checked; });
      const span = document.createElement("span");
      span.textContent = s.title;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "✕";
      removeBtn.setAttribute("aria-label", "Remove subtask");
      removeBtn.addEventListener("click", () => { modalSubtasks.splice(idx, 1); renderSubtaskList(); });
      item.append(check, span, removeBtn);
      el.subtaskList.appendChild(item);
    });
  }
  function addSubtaskFromInput() {
    const val = el.subtaskInput.value.trim();
    if (!val) return;
    modalSubtasks.push({ id: uid(), title: val, done: false });
    el.subtaskInput.value = "";
    renderSubtaskList();
    el.subtaskInput.focus();
  }
  el.addSubtaskBtn.addEventListener("click", addSubtaskFromInput);
  el.subtaskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSubtaskFromInput(); }
  });

  // ---------- Modal ----------
  function openCreateModal() {
    editingTask = null;
    editingDateKey = null;
    el.taskForm.reset();
    modalSubtasks = [];
    renderSubtaskList();
    el.modalTitle.textContent = "Log Item";
    el.taskCategory.value = "work";
    el.taskPriority.value = "medium";
    el.taskRepeat.value = "none";
    el.taskReminder.checked = true;
    el.modalOverlay.hidden = false;
    setTimeout(() => el.taskTitle.focus(), 50);
  }
  function openEditModal(task, dateKey) {
    editingTask = task;
    editingDateKey = dateKey;
    el.taskTitle.value = task.title;
    el.taskCategory.value = task.category;
    el.taskPriority.value = task.priority;
    el.taskTime.value = task.time || "";
    el.taskRepeat.value = task.repeat;
    el.taskReminder.checked = task.reminder;
    el.taskNotes.value = task.notes || "";
    modalSubtasks = (task.subtasks || []).map((s) => ({ ...s }));
    renderSubtaskList();
    el.modalTitle.textContent = "Edit Item";
    el.modalOverlay.hidden = false;
    setTimeout(() => el.taskTitle.focus(), 50);
  }
  function closeModal() {
    el.modalOverlay.hidden = true;
  }
  el.addTaskBtn.addEventListener("click", openCreateModal);
  el.cancelTask.addEventListener("click", closeModal);
  el.modalOverlay.addEventListener("click", (e) => {
    if (e.target === el.modalOverlay) closeModal();
  });
  el.taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = el.taskTitle.value.trim();
    if (!title) return;
    const category = el.taskCategory.value;
    const priority = el.taskPriority.value;
    const time = el.taskTime.value || "";
    const reminder = time ? el.taskReminder.checked : false;
    const notes = el.taskNotes.value.trim();
    const repeat = el.taskRepeat.value;
    const subtasks = modalSubtasks.map((s) => ({ id: s.id, title: s.title, done: !!s.done }));

    if (editingTask) {
      Object.assign(editingTask, { title, category, priority, time, reminder, notes, repeat, subtasks });
    } else {
      tasks.push({
        id: uid(),
        title, category, priority, time, reminder, notes, subtasks,
        repeat,
        startDate: selectedDate,
        done: false,
        notified: false,
        completions: {},
        notifiedDates: {},
        skipped: {},
        order: Date.now(),
      });
    }
    saveTasks();
    closeModal();
    renderAll();
  });

  // ---------- Calendar nav ----------
  el.prevMonth.addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  el.nextMonth.addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });
  el.monthYearBtn.addEventListener("click", () => {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    selectedDate = toDateKey(today);
    renderAll();
  });
  el.calendarToggle.addEventListener("click", () => {
    calendarOpen = !calendarOpen;
    el.calendarSection.style.display = calendarOpen ? "" : "none";
    el.calendarToggle.textContent = calendarOpen ? "Hide calendar ▲" : "Show calendar ▼";
  });
  el.insightsToggle.addEventListener("click", () => {
    insightsOpen = !insightsOpen;
    el.insightsPanel.hidden = !insightsOpen;
    el.insightsToggle.textContent = insightsOpen ? "Hide insights ▲" : "Show insights ▾";
  });

  // ---------- Reminders / alarm ----------
  let audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 250);
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        osc2.type = "square";
        osc2.frequency.value = 880;
        osc2.connect(gain);
        osc2.start();
        setTimeout(() => osc2.stop(), 250);
      }, 350);
    } catch (e) {
      console.warn("Audio alarm unavailable", e);
    }
  }

  function showReminderBanner(text) {
    el.reminderText.textContent = text;
    el.reminderBanner.hidden = false;
  }
  el.dismissReminder.addEventListener("click", () => { el.reminderBanner.hidden = true; });

  function checkReminders() {
    const now = new Date();
    const nowKey = toDateKey(now);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    let changed = false;

    tasks.forEach((t) => {
      if (!t.reminder || !t.time) return;
      if (!occursOn(t, nowKey)) return;
      if (isDoneOn(t, nowKey)) return;
      if (isNotifiedOn(t, nowKey)) return;
      const [h, m] = t.time.split(":").map(Number);
      if (h * 60 + m <= nowMin) {
        setNotifiedOn(t, nowKey);
        changed = true;
        beep();
        showReminderBanner(`${t.title} — ${t.time}`);
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Daily Log reminder", { body: t.title, tag: t.id + nowKey });
          } catch (e) { console.warn("Notification failed", e); }
        }
        if (nowKey === selectedDate) renderSheet();
      }
    });
    if (changed) saveTasks();
  }
  setInterval(checkReminders, 20000);
  checkReminders();

  // ---------- Notification permission ----------
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      el.notifyPill.hidden = false;
    }
    el.notifyPill.addEventListener("click", async () => {
      const perm = await Notification.requestPermission();
      el.notifyPill.hidden = perm !== "default";
    });
  } else {
    el.notifyPill.hidden = true;
  }

  // ---------- PWA install ----------
  let deferredInstallEvent = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallEvent = e;
    el.installBtn.hidden = false;
  });
  el.installBtn.addEventListener("click", async () => {
    if (!deferredInstallEvent) return;
    deferredInstallEvent.prompt();
    await deferredInstallEvent.userChoice;
    deferredInstallEvent = null;
    el.installBtn.hidden = true;
  });
  window.addEventListener("appinstalled", () => { el.installBtn.hidden = true; });

  // ---------- Service worker ----------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch((e) => {
        console.warn("Service worker registration failed", e);
      });
    });
  }

  // ---------- Init ----------
  initTheme();
  renderCategoryChips();
  renderAll();
})();
