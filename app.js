(() => {
  "use strict";

  const STORAGE_KEY = "dailyLog.tasks.v1";
  const THEME_KEY = "dailyLog.theme";
  const TEMPLATES_KEY = "dailyLog.templates.v1";
  const MONTHS = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY",
    "AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
  const DAY_NAMES = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const FULL_DAY_NAMES = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];

  const CATEGORIES = {
    work:     { label: "Work",     color: "var(--cat-work)" },
    personal: { label: "Personal", color: "var(--cat-personal)" },
    urgent:   { label: "Urgent",   color: "var(--cat-urgent)" },
    health:   { label: "Health",   color: "var(--cat-health)" },
    errands:  { label: "Errands",  color: "var(--cat-errands)" },
    other:    { label: "Other",    color: "var(--cat-other)" },
  };
  const PRIORITIES = {
    high:   { label: "High",   color: "var(--red)" },
    medium: { label: "Medium", color: "var(--amber)" },
    low:    { label: "Low",    color: "var(--accent-2)" },
  };
  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const RING_CIRCUMFERENCE = 2 * Math.PI * 27;
  const SNOOZE_MS = 10 * 60000;
  const CLOCK_SIZE = 200;
  const CLOCK_R = 76;

  // ---------- State ----------
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth(); // 0-11
  let selectedDate = toDateKey(today);
  let tasks = loadTasks();
  let templates = loadTemplates();
  let calendarOpen = true;
  let insightsOpen = false;
  let searchQuery = "";
  let activeCategories = new Set();
  let activePriorities = new Set();
  let sortMode = "time";
  let currentView = "day"; // 'day' | 'week' | 'timeline'
  let editingTask = null;
  let editingDateKey = null;
  let modalSubtasks = [];
  let pendingUndo = null;
  let snackbarTimer = null;
  let activeReminderTask = null;
  let activeReminderDateKey = null;
  let dpViewYear = viewYear, dpViewMonth = viewMonth;
  let tpMode = "hour";
  let tpHour24 = null;
  let tpMinute = 0;
  let tpAmPm = "AM";
  let dayDetailDateKey = null;

  // ---------- Elements ----------
  const el = {
    prevMonth: document.getElementById("prevMonth"),
    nextMonth: document.getElementById("nextMonth"),
    monthSelect: document.getElementById("monthSelect"),
    yearSelect: document.getElementById("yearSelect"),
    todayBtn: document.getElementById("todayBtn"),
    sheetDateFull: document.getElementById("sheetDateFull"),
    themeToggle: document.getElementById("themeToggle"),
    moreMenuBtn: document.getElementById("moreMenuBtn"),
    moreMenu: document.getElementById("moreMenu"),
    menuWeeklyReview: document.getElementById("menuWeeklyReview"),
    menuPrint: document.getElementById("menuPrint"),
    menuExportJson: document.getElementById("menuExportJson"),
    menuExportCsv: document.getElementById("menuExportCsv"),
    menuImport: document.getElementById("menuImport"),
    importFileInput: document.getElementById("importFileInput"),
    viewTabs: document.getElementById("viewTabs"),
    viewStatusBadge: document.getElementById("viewStatusBadge"),
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
    priorityChips: document.getElementById("priorityChips"),
    sortSelect: document.getElementById("sortSelect"),
    punchlist: document.querySelector(".punchlist"),
    dayView: document.getElementById("dayView"),
    weekView: document.getElementById("weekView"),
    timelineView: document.getElementById("timelineView"),
    printDate: document.getElementById("printDate"),
    taskList: document.getElementById("taskList"),
    emptyState: document.getElementById("emptyState"),
    addTaskBtn: document.getElementById("addTaskBtn"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalTitle: document.getElementById("modalTitle"),
    taskForm: document.getElementById("taskForm"),
    templateRow: document.getElementById("templateRow"),
    templateSelect: document.getElementById("templateSelect"),
    saveTemplateBtn: document.getElementById("saveTemplateBtn"),
    deleteTemplateBtn: document.getElementById("deleteTemplateBtn"),
    taskTitle: document.getElementById("taskTitle"),
    taskDate: document.getElementById("taskDate"),
    taskDateBtn: document.getElementById("taskDateBtn"),
    taskDateDisplay: document.getElementById("taskDateDisplay"),
    datePickerPopover: document.getElementById("datePickerPopover"),
    dpPrev: document.getElementById("dpPrev"),
    dpNext: document.getElementById("dpNext"),
    dpMonthYear: document.getElementById("dpMonthYear"),
    dpGrid: document.getElementById("dpGrid"),
    taskCategory: document.getElementById("taskCategory"),
    taskPriority: document.getElementById("taskPriority"),
    taskTime: document.getElementById("taskTime"),
    taskTimeBtn: document.getElementById("taskTimeBtn"),
    taskTimeDisplay: document.getElementById("taskTimeDisplay"),
    timePickerPopover: document.getElementById("timePickerPopover"),
    tpHourDisplay: document.getElementById("tpHourDisplay"),
    tpMinuteDisplay: document.getElementById("tpMinuteDisplay"),
    tpAmpmButtons: Array.from(document.querySelectorAll(".tp-ampm-btn")),
    tpClock: document.getElementById("tpClock"),
    tpHand: document.getElementById("tpHand"),
    tpClear: document.getElementById("tpClear"),
    tpDone: document.getElementById("tpDone"),
    taskRepeat: document.getElementById("taskRepeat"),
    taskReminder: document.getElementById("taskReminder"),
    taskNotes: document.getElementById("taskNotes"),
    subtaskFieldProgress: document.getElementById("subtaskFieldProgress"),
    subtaskList: document.getElementById("subtaskList"),
    subtaskInput: document.getElementById("subtaskInput"),
    addSubtaskBtn: document.getElementById("addSubtaskBtn"),
    cancelTask: document.getElementById("cancelTask"),
    confirmOverlay: document.getElementById("confirmOverlay"),
    confirmMessage: document.getElementById("confirmMessage"),
    confirmActions: document.getElementById("confirmActions"),
    reportOverlay: document.getElementById("reportOverlay"),
    reportBody: document.getElementById("reportBody"),
    closeReport: document.getElementById("closeReport"),
    dayDetailOverlay: document.getElementById("dayDetailOverlay"),
    dayDetailTitle: document.getElementById("dayDetailTitle"),
    dayDetailBody: document.getElementById("dayDetailBody"),
    closeDayDetail: document.getElementById("closeDayDetail"),
    dayDetailViewFull: document.getElementById("dayDetailViewFull"),
    snackbar: document.getElementById("snackbar"),
    snackbarText: document.getElementById("snackbarText"),
    snackbarUndo: document.getElementById("snackbarUndo"),
    reminderBanner: document.getElementById("reminderBanner"),
    reminderText: document.getElementById("reminderText"),
    snoozeReminder: document.getElementById("snoozeReminder"),
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
  function getWeekStart(dateKey) {
    const d = parseDateKey(dateKey);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }
  function formatHour(h) {
    const period = h >= 12 ? "PM" : "AM";
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12}${period}`;
  }
  function formatDateDisplay(key) {
    const d = parseDateKey(key);
    return `${DAY_NAMES[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
  }
  function formatTimeDisplay(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    let h12 = h % 12; if (h12 === 0) h12 = 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
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
  function loadTemplates() {
    try {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Could not read templates", e);
      return [];
    }
  }
  function saveTemplates() {
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error("Could not save templates", e);
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
  function clearNotifiedOn(task, dateKey) {
    if (task.repeat === "none") task.notified = false;
    else if (task.notifiedDates) delete task.notifiedDates[dateKey];
  }
  function getSnoozeUntil(task, dateKey) {
    if (task.repeat === "none") return task.snoozeUntil || 0;
    return (task.snoozeDates && task.snoozeDates[dateKey]) || 0;
  }
  function setSnoozeUntil(task, dateKey, ts) {
    if (task.repeat === "none") task.snoozeUntil = ts;
    else { task.snoozeDates = task.snoozeDates || {}; task.snoozeDates[dateKey] = ts; }
  }
  function tasksForDate(dateKey) {
    return tasks.filter((t) => occursOn(t, dateKey));
  }
  function computeDayCompletion(dateKey) {
    const list = tasksForDate(dateKey);
    if (list.length === 0) return null;
    let sum = 0;
    list.forEach((t) => {
      if (t.subtasks && t.subtasks.length) sum += t.subtasks.filter((s) => s.done).length / t.subtasks.length;
      else sum += isDoneOn(t, dateKey) ? 1 : 0;
    });
    return Math.round((sum / list.length) * 100);
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
        { label: "Delete", danger: true, onClick: () => {
            const idx = tasks.indexOf(task);
            tasks = tasks.filter((t) => t.id !== task.id);
            saveTasks(); renderAll();
            showSnackbar(`"${task.title}" deleted`, () => {
              tasks.splice(Math.min(idx, tasks.length), 0, task);
              saveTasks(); renderAll();
            });
          } },
        { label: "Cancel", cancel: true },
      ]);
    } else {
      showConfirm(`"${task.title}" repeats. What do you want to remove?`, [
        { label: "Just this occurrence", onClick: () => {
            task.skipped = task.skipped || {};
            task.skipped[dateKey] = true;
            saveTasks(); renderAll();
            showSnackbar("Removed this occurrence", () => {
              delete task.skipped[dateKey];
              saveTasks(); renderAll();
            });
          } },
        { label: "Entire series", danger: true, onClick: () => {
            tasks = tasks.filter((t) => t.id !== task.id);
            saveTasks(); renderAll();
            showSnackbar(`"${task.title}" series deleted`, () => {
              tasks.push(task);
              saveTasks(); renderAll();
            });
          } },
        { label: "Cancel", cancel: true },
      ]);
    }
  }

  // ---------- Snackbar (undo) ----------
  function showSnackbar(text, undoAction) {
    clearTimeout(snackbarTimer);
    el.snackbarText.textContent = text;
    el.snackbarUndo.hidden = !undoAction;
    pendingUndo = undoAction || null;
    el.snackbar.hidden = false;
    snackbarTimer = setTimeout(hideSnackbar, 5000);
  }
  function hideSnackbar() {
    el.snackbar.hidden = true;
    pendingUndo = null;
  }
  el.snackbarUndo.addEventListener("click", () => {
    if (pendingUndo) pendingUndo();
    hideSnackbar();
  });

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

  // ---------- More menu ----------
  function openMoreMenu() {
    el.moreMenu.hidden = false;
    el.moreMenuBtn.setAttribute("aria-expanded", "true");
  }
  function closeMoreMenu() {
    el.moreMenu.hidden = true;
    el.moreMenuBtn.setAttribute("aria-expanded", "false");
  }
  el.moreMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (el.moreMenu.hidden) openMoreMenu(); else closeMoreMenu();
  });
  document.addEventListener("click", (e) => {
    // Use composedPath() instead of e.target.closest(): handlers below can
    // remove/replace e.target's own DOM node synchronously (e.g. rebuilding
    // the clock face), which would detach it before this bubbled listener
    // runs and make closest() unreliable. composedPath() is a snapshot
    // captured at dispatch time, so it stays valid either way.
    const path = e.composedPath();
    if (!el.moreMenu.hidden && !path.includes(el.moreMenuBtn) && !path.includes(el.moreMenu)) closeMoreMenu();
    if (!el.datePickerPopover.hidden && !path.includes(el.taskDateBtn) && !path.includes(el.datePickerPopover)) closeDatePicker();
    if (!el.timePickerPopover.hidden && !path.includes(el.taskTimeBtn) && !path.includes(el.timePickerPopover)) closeTimePicker();
  });

  // ---------- View tabs (Day / Week / Timeline) ----------
  function setView(view) {
    currentView = view;
    el.viewTabs.querySelectorAll(".view-tab").forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    el.dayView.hidden = view !== "day";
    el.weekView.hidden = view !== "week";
    el.timelineView.hidden = view !== "timeline";
    updateViewStatusBadge();
    renderCurrentView();
  }
  el.viewTabs.querySelectorAll(".view-tab").forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });
  function renderCurrentView() {
    if (currentView === "week") renderWeekView();
    else if (currentView === "timeline") renderTimelineView();
    else renderSheet();
  }

  // ---------- Month / year navigation ----------
  function populateMonthYearSelects() {
    el.monthSelect.innerHTML = "";
    MONTHS.forEach((m, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = m;
      el.monthSelect.appendChild(opt);
    });
    el.yearSelect.innerHTML = "";
    const startY = today.getFullYear() - 5, endY = today.getFullYear() + 5;
    for (let y = startY; y <= endY; y++) {
      const opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      el.yearSelect.appendChild(opt);
    }
  }
  el.monthSelect.addEventListener("change", () => {
    viewMonth = Number(el.monthSelect.value);
    renderCalendar();
  });
  el.yearSelect.addEventListener("change", () => {
    viewYear = Number(el.yearSelect.value);
    renderCalendar();
  });
  el.todayBtn.addEventListener("click", () => {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    selectedDate = toDateKey(today);
    renderAll();
  });

  // ---------- Calendar rendering ----------
  function renderCalendar() {
    el.monthSelect.value = String(viewMonth);
    el.yearSelect.value = String(viewYear);
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
    if (activePriorities.size) list = list.filter((t) => activePriorities.has(t.priority));

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

  function renderChipGroup(container, options, activeSet, onChange) {
    container.innerHTML = "";
    const allChip = document.createElement("button");
    allChip.type = "button";
    allChip.className = "chip" + (activeSet.size === 0 ? " active" : "");
    allChip.textContent = "All";
    allChip.addEventListener("click", () => {
      activeSet.clear();
      container.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      allChip.classList.add("active");
      onChange();
    });
    container.appendChild(allChip);

    options.forEach(({ key, label, color }) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (activeSet.has(key) ? " active" : "");
      const dot = document.createElement("span");
      dot.className = "chip-dot";
      dot.style.background = color;
      chip.append(dot, document.createTextNode(label));
      chip.addEventListener("click", () => {
        if (activeSet.has(key)) activeSet.delete(key);
        else activeSet.add(key);
        chip.classList.toggle("active");
        allChip.classList.toggle("active", activeSet.size === 0);
        onChange();
      });
      container.appendChild(chip);
    });
  }
  function renderCategoryChips() {
    const opts = Object.entries(CATEGORIES).map(([key, info]) => ({ key, label: info.label, color: info.color }));
    renderChipGroup(el.categoryChips, opts, activeCategories, renderCurrentView);
  }
  function renderPriorityChips() {
    const opts = Object.entries(PRIORITIES).map(([key, info]) => ({ key, label: info.label, color: info.color }));
    renderChipGroup(el.priorityChips, opts, activePriorities, renderCurrentView);
  }

  // ---------- Sheet header (date/status), shared across views ----------
  function updateSheetHeader() {
    const dateObj = parseDateKey(selectedDate);
    const fullDateStr = `${FULL_DAY_NAMES[dateObj.getDay()]}, ${MONTHS[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
    el.sheetDateFull.textContent = fullDateStr;
    el.printDate.textContent = fullDateStr;
    updateViewStatusBadge();
  }
  function updateViewStatusBadge() {
    if (currentView === "week") {
      const weekStart = getWeekStart(selectedDate);
      let total = 0, done = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart); d.setDate(d.getDate() + i);
        const key = toDateKey(d);
        tasksForDate(key).forEach((t) => { total++; if (isDoneOn(t, key)) done++; });
      }
      el.viewStatusBadge.textContent = `${done}/${total} done this week`;
    } else {
      const list = tasksForDate(selectedDate);
      const done = list.filter((t) => isDoneOn(t, selectedDate)).length;
      el.viewStatusBadge.textContent = `${done}/${list.length} done today`;
    }
  }

  // ---------- Day view (punch-list) ----------
  function renderSheet() {
    const allDayTasks = tasksForDate(selectedDate);
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

  // ---------- Week view ----------
  function renderWeekView() {
    el.weekView.innerHTML = "";
    const weekStart = getWeekStart(selectedDate);

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const key = toDateKey(d);

      const card = document.createElement("div");
      card.className = "week-day-card" +
        (key === toDateKey(today) ? " is-today" : "") +
        (key === selectedDate ? " is-selected" : "");

      const head = document.createElement("div");
      head.className = "week-day-head";
      const title = document.createElement("span");
      title.className = "week-day-title";
      title.textContent = `${DAY_NAMES[i]} ${d.getMonth() + 1}/${d.getDate()}`;
      if (key === toDateKey(today)) {
        const badge = document.createElement("span");
        badge.className = "is-today-badge";
        badge.textContent = "• TODAY";
        title.appendChild(badge);
      }
      head.appendChild(title);

      const allDay = tasksForDate(key);
      const pct = computeDayCompletion(key);
      const metaWrap = document.createElement("div");
      metaWrap.className = "week-day-meta";
      if (pct != null) {
        const pctEl = document.createElement("span");
        pctEl.className = "week-day-pct";
        pctEl.textContent = pct + "%";
        metaWrap.appendChild(pctEl);
      }
      const doneCount = allDay.filter((t) => isDoneOn(t, key)).length;
      const count = document.createElement("span");
      count.className = "week-day-count";
      count.textContent = allDay.length ? `${doneCount}/${allDay.length}` : "";
      metaWrap.appendChild(count);
      head.appendChild(metaWrap);
      card.appendChild(head);

      if (pct != null) {
        const bar = document.createElement("div");
        bar.className = "week-day-bar";
        const fill = document.createElement("span");
        fill.style.width = pct + "%";
        bar.appendChild(fill);
        card.appendChild(bar);
      }

      const dayTasks = getVisibleTasks(key);
      const list = document.createElement("div");
      list.className = "week-day-tasks";
      if (dayTasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "week-day-empty";
        empty.textContent = allDay.length ? "No tasks match filters" : "No tasks";
        list.appendChild(empty);
      } else {
        dayTasks.slice(0, 6).forEach((t) => {
          const row = document.createElement("div");
          row.className = "week-task-row" + (isDoneOn(t, key) ? " done" : "");
          const dot = document.createElement("span");
          dot.className = "week-task-cat-dot";
          dot.style.background = (CATEGORIES[t.category] || CATEGORIES.other).color;
          const ttl = document.createElement("span");
          ttl.className = "week-task-title";
          ttl.textContent = t.title;
          const time = document.createElement("span");
          time.className = "week-task-time";
          time.textContent = t.time || "";
          row.append(dot, ttl, time);
          list.appendChild(row);
        });
        if (dayTasks.length > 6) {
          const more = document.createElement("div");
          more.className = "week-day-empty";
          more.textContent = `+${dayTasks.length - 6} more`;
          list.appendChild(more);
        }
      }
      card.appendChild(list);

      card.addEventListener("click", () => {
        selectedDate = key;
        renderCalendar();
        if (allDay.length > 0) openDayDetail(key);
        else setView("day");
      });
      el.weekView.appendChild(card);
    }
  }

  // ---------- Day detail popup (from Week view) ----------
  function openDayDetail(dateKey) {
    dayDetailDateKey = dateKey;
    renderDayDetail();
    el.dayDetailOverlay.hidden = false;
  }
  function closeDayDetail() {
    el.dayDetailOverlay.hidden = true;
    dayDetailDateKey = null;
  }
  function renderDayDetail() {
    const dateObj = parseDateKey(dayDetailDateKey);
    el.dayDetailTitle.textContent = `${DAY_NAMES[dateObj.getDay()]}, ${MONTHS[dateObj.getMonth()].slice(0, 3)} ${dateObj.getDate()}`;
    el.dayDetailBody.innerHTML = "";
    const list = tasksForDate(dayDetailDateKey).sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
    if (list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "day-detail-empty";
      empty.textContent = "No tasks logged for this day.";
      el.dayDetailBody.appendChild(empty);
      return;
    }
    list.forEach((task) => el.dayDetailBody.appendChild(buildDayDetailCard(task, dayDetailDateKey)));
  }
  function buildDayDetailCard(task, dateKey) {
    const done = isDoneOn(task, dateKey);
    const card = document.createElement("div");
    card.className = "day-detail-card cat-" + (CATEGORIES[task.category] ? task.category : "other");

    const head = document.createElement("div");
    head.className = "day-detail-card-head";
    const title = document.createElement("span");
    title.className = "day-detail-card-title" + (done ? " done" : "");
    title.textContent = task.title;
    head.appendChild(title);
    if (task.time) {
      const time = document.createElement("span");
      time.className = "day-detail-card-time";
      time.textContent = task.time;
      head.appendChild(time);
    }
    card.appendChild(head);

    const meta = document.createElement("div");
    meta.className = "day-detail-card-meta";
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
    card.appendChild(meta);

    if (task.subtasks && task.subtasks.length) {
      const subWrap = document.createElement("div");
      subWrap.className = "day-detail-subtasks";
      task.subtasks.forEach((s) => {
        const row = document.createElement("div");
        row.className = "day-detail-subtask-row" + (s.done ? " done" : "");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!s.done;
        cb.addEventListener("change", () => {
          s.done = cb.checked;
          saveTasks();
          renderAll();
        });
        const span = document.createElement("span");
        span.textContent = s.title;
        row.append(cb, span);
        subWrap.appendChild(row);
      });
      card.appendChild(subWrap);
    }

    const actions = document.createElement("div");
    actions.className = "day-detail-card-actions";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "primary";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => { closeDayDetail(); openEditModal(task, dateKey); });
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => requestDelete(task, dateKey));
    actions.append(editBtn, deleteBtn);
    card.appendChild(actions);

    return card;
  }
  el.closeDayDetail.addEventListener("click", closeDayDetail);
  el.dayDetailOverlay.addEventListener("click", (e) => { if (e.target === el.dayDetailOverlay) closeDayDetail(); });
  el.dayDetailViewFull.addEventListener("click", () => {
    const key = dayDetailDateKey;
    closeDayDetail();
    selectedDate = key;
    setView("day");
    renderCalendar();
  });

  // ---------- Timeline view ----------
  function renderTimelineView() {
    el.timelineView.innerHTML = "";
    const dayTasks = getVisibleTasks(selectedDate);
    const timed = dayTasks.filter((t) => t.time);
    const untimed = dayTasks.filter((t) => !t.time);

    const byHour = {};
    timed.forEach((t) => {
      const h = parseInt(t.time.split(":")[0], 10);
      (byHour[h] = byHour[h] || []).push(t);
    });

    let startHour = 6, endHour = 21;
    Object.keys(byHour).map(Number).forEach((h) => {
      if (h < startHour) startHour = h;
      if (h > endHour) endHour = h;
    });

    for (let h = startHour; h <= endHour; h++) {
      const row = document.createElement("div");
      row.className = "timeline-row";
      const label = document.createElement("div");
      label.className = "timeline-hour-label";
      label.textContent = formatHour(h);
      const slot = document.createElement("div");
      slot.className = "timeline-slot";
      (byHour[h] || []).sort((a, b) => a.time.localeCompare(b.time)).forEach((t) => {
        slot.appendChild(buildTimelineTask(t, true));
      });
      row.append(label, slot);
      el.timelineView.appendChild(row);
    }

    if (untimed.length) {
      const box = document.createElement("div");
      box.className = "timeline-unscheduled";
      const strong = document.createElement("strong");
      strong.textContent = "UNSCHEDULED";
      box.appendChild(strong);
      untimed.forEach((t) => box.appendChild(buildTimelineTask(t, false)));
      el.timelineView.appendChild(box);
    }

    if (dayTasks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "timeline-unscheduled";
      empty.textContent = "No tasks logged for this day.";
      el.timelineView.appendChild(empty);
    }
  }
  function buildTimelineTask(t, showTime) {
    const done = isDoneOn(t, selectedDate);
    const item = document.createElement("div");
    item.className = "timeline-task cat-" + (CATEGORIES[t.category] ? t.category : "other") + (done ? " done" : "");
    if (showTime) {
      const time = document.createElement("span");
      time.className = "timeline-task-time";
      time.textContent = t.time;
      item.appendChild(time);
    }
    const ttl = document.createElement("span");
    ttl.className = "timeline-task-title";
    ttl.textContent = t.title;
    item.appendChild(ttl);
    item.addEventListener("click", () => openEditModal(t, selectedDate));
    return item;
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
    updateSheetHeader();
    renderCurrentView();
    updateInsights();
    if (!el.dayDetailOverlay.hidden && dayDetailDateKey) renderDayDetail();
  }

  // ---------- Weekly review report ----------
  function reportStat(value, label) {
    const box = document.createElement("div");
    box.className = "report-stat";
    const v = document.createElement("span"); v.className = "report-stat-value"; v.textContent = value;
    const l = document.createElement("span"); l.className = "report-stat-label"; l.textContent = label;
    box.append(v, l);
    return box;
  }
  function renderReport() {
    el.reportBody.innerHTML = "";

    const weekStart = getWeekStart(toDateKey(today));
    let weekTotal = 0, weekDone = 0;
    const catCounts = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart); d.setDate(d.getDate() + i);
      const key = toDateKey(d);
      tasksForDate(key).forEach((t) => {
        weekTotal++;
        if (isDoneOn(t, key)) weekDone++;
        catCounts[t.category] = (catCounts[t.category] || 0) + 1;
      });
    }
    const weekPct = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

    const statsGrid = document.createElement("div");
    statsGrid.className = "report-stats-grid";
    statsGrid.appendChild(reportStat(`${weekDone}/${weekTotal}`, "Tasks this week"));
    statsGrid.appendChild(reportStat(`${weekPct}%`, "Completion rate"));
    el.reportBody.appendChild(statsGrid);

    const trendTitle = document.createElement("p");
    trendTitle.className = "report-section-title";
    trendTitle.textContent = "30-day trend";
    el.reportBody.appendChild(trendTitle);

    const trend = document.createElement("div");
    trend.className = "report-trend";
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const list = tasksForDate(key);
      const done = list.filter((t) => isDoneOn(t, key)).length;
      const pct = list.length ? Math.round((done / list.length) * 100) : 0;
      const bar = document.createElement("div");
      bar.className = "spark-bar";
      bar.title = `${key}: ${pct}%`;
      const fill = document.createElement("span");
      fill.style.height = Math.max(pct, list.length ? 4 : 0) + "%";
      bar.appendChild(fill);
      trend.appendChild(bar);
    }
    el.reportBody.appendChild(trend);

    const catTitle = document.createElement("p");
    catTitle.className = "report-section-title";
    catTitle.textContent = "Busiest categories this week";
    el.reportBody.appendChild(catTitle);

    const catEntries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    if (catEntries.length === 0) {
      const empty = document.createElement("p");
      empty.className = "report-empty";
      empty.textContent = "No tasks logged this week yet.";
      el.reportBody.appendChild(empty);
    } else {
      const list = document.createElement("div");
      list.className = "report-cat-list";
      catEntries.forEach(([cat, count]) => {
        const info = CATEGORIES[cat] || CATEGORIES.other;
        const row = document.createElement("div");
        row.className = "report-cat-row";
        const dot = document.createElement("span");
        dot.className = "chip-dot";
        dot.style.background = info.color;
        const name = document.createElement("span");
        name.className = "report-cat-name";
        name.textContent = info.label;
        const cnt = document.createElement("span");
        cnt.className = "report-cat-count";
        cnt.textContent = String(count);
        row.append(dot, name, cnt);
        list.appendChild(row);
      });
      el.reportBody.appendChild(list);
    }
  }
  function openReport() {
    renderReport();
    el.reportOverlay.hidden = false;
  }
  function closeReport() {
    el.reportOverlay.hidden = true;
  }
  el.closeReport.addEventListener("click", closeReport);
  el.reportOverlay.addEventListener("click", (e) => { if (e.target === el.reportOverlay) closeReport(); });
  el.menuWeeklyReview.addEventListener("click", () => { closeMoreMenu(); openReport(); });

  // ---------- Print ----------
  el.menuPrint.addEventListener("click", () => {
    closeMoreMenu();
    if (currentView !== "day") setView("day");
    window.print();
  });

  // ---------- Export / Import ----------
  function downloadBlob(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function csvEscape(val) {
    const s = String(val == null ? "" : val);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  el.menuExportJson.addEventListener("click", () => {
    closeMoreMenu();
    downloadBlob(`daily-log-export-${toDateKey(today)}.json`, JSON.stringify(tasks, null, 2), "application/json");
  });
  el.menuExportCsv.addEventListener("click", () => {
    closeMoreMenu();
    const headers = ["title", "category", "priority", "date", "time", "repeat", "done", "notes"];
    const rows = tasks.map((t) => [
      t.title, t.category, t.priority, t.startDate, t.time,
      t.repeat, t.repeat === "none" ? t.done : "", t.notes || "",
    ].map(csvEscape).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    downloadBlob(`daily-log-export-${toDateKey(today)}.csv`, csv, "text/csv");
  });
  el.menuImport.addEventListener("click", () => {
    closeMoreMenu();
    el.importFileInput.click();
  });
  el.importFileInput.addEventListener("change", () => {
    const file = el.importFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!Array.isArray(imported)) throw new Error("Invalid file");
        const existingIds = new Set(tasks.map((t) => t.id));
        const migrated = imported.map(migrateTask);
        const toAdd = migrated.filter((t) => !existingIds.has(t.id));
        tasks = tasks.concat(toAdd);
        saveTasks();
        renderAll();
        showSnackbar(`Imported ${toAdd.length} task(s)`);
      } catch (e) {
        showSnackbar("Import failed — invalid file");
      }
    };
    reader.readAsText(file);
    el.importFileInput.value = "";
  });

  // ---------- Toolbar ----------
  el.searchInput.addEventListener("input", () => {
    searchQuery = el.searchInput.value;
    renderCurrentView();
  });
  el.sortSelect.addEventListener("change", () => {
    sortMode = el.sortSelect.value;
    renderCurrentView();
  });

  // ---------- Subtasks (modal) ----------
  function updateSubtaskFieldProgress() {
    if (!modalSubtasks.length) { el.subtaskFieldProgress.textContent = ""; return; }
    const done = modalSubtasks.filter((s) => s.done).length;
    el.subtaskFieldProgress.textContent = `${done}/${modalSubtasks.length} done`;
  }
  function renderSubtaskList() {
    el.subtaskList.innerHTML = "";
    modalSubtasks.forEach((s, idx) => {
      const item = document.createElement("div");
      item.className = "subtask-item" + (s.done ? " done" : "");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = !!s.done;
      check.addEventListener("change", () => {
        s.done = check.checked;
        item.classList.toggle("done", s.done);
        updateSubtaskFieldProgress();
      });
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
    updateSubtaskFieldProgress();
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

  // ---------- Date picker (modal) ----------
  function openDatePicker() {
    const base = el.taskDate.value ? parseDateKey(el.taskDate.value) : new Date();
    dpViewYear = base.getFullYear();
    dpViewMonth = base.getMonth();
    renderDatePicker();
    el.datePickerPopover.hidden = false;
    el.taskDateBtn.classList.add("active");
    closeTimePicker();
  }
  function closeDatePicker() {
    el.datePickerPopover.hidden = true;
    el.taskDateBtn.classList.remove("active");
  }
  function renderDatePicker() {
    el.dpMonthYear.textContent = `${MONTHS[dpViewMonth]} ${dpViewYear}`;
    el.dpGrid.innerHTML = "";
    const firstOfMonth = new Date(dpViewYear, dpViewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(dpViewYear, dpViewMonth + 1, 0).getDate();
    for (let i = 0; i < startOffset; i++) {
      const blank = document.createElement("div");
      blank.className = "dp-day blank";
      el.dpGrid.appendChild(blank);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(dpViewYear, dpViewMonth, day);
      const key = toDateKey(dateObj);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dp-day";
      if (key === toDateKey(today)) btn.classList.add("today");
      if (key === el.taskDate.value) btn.classList.add("selected");
      btn.textContent = String(day);
      btn.addEventListener("click", () => {
        el.taskDate.value = key;
        el.taskDateDisplay.textContent = formatDateDisplay(key);
        closeDatePicker();
      });
      el.dpGrid.appendChild(btn);
    }
  }
  el.dpPrev.addEventListener("click", () => {
    dpViewMonth--; if (dpViewMonth < 0) { dpViewMonth = 11; dpViewYear--; }
    renderDatePicker();
  });
  el.dpNext.addEventListener("click", () => {
    dpViewMonth++; if (dpViewMonth > 11) { dpViewMonth = 0; dpViewYear++; }
    renderDatePicker();
  });
  el.taskDateBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (el.datePickerPopover.hidden) openDatePicker(); else closeDatePicker();
  });

  // ---------- Analog time picker (modal) ----------
  function polarPos(index) {
    const angle = (index / 12) * 2 * Math.PI;
    const cx = CLOCK_SIZE / 2, cy = CLOCK_SIZE / 2;
    return { x: cx + CLOCK_R * Math.sin(angle), y: cy - CLOCK_R * Math.cos(angle) };
  }
  function buildClockFace() {
    el.tpClock.querySelectorAll(".tp-num").forEach((n) => n.remove());
    const values = tpMode === "hour" ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    values.forEach((val, i) => {
      const pos = polarPos(i);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tp-num";
      btn.textContent = tpMode === "minute" ? String(val).padStart(2, "0") : String(val);
      btn.style.left = (pos.x - 16) + "px";
      btn.style.top = (pos.y - 16) + "px";
      btn.addEventListener("click", () => selectClockValue(val));
      el.tpClock.appendChild(btn);
    });
    updateHand();
  }
  function currentSelectedIndex() {
    if (tpMode === "hour") {
      if (tpHour24 == null) return null;
      const base = tpHour24 % 12;
      return base === 0 ? 0 : base;
    }
    return Math.round(tpMinute / 5) % 12;
  }
  function updateHand() {
    const idx = currentSelectedIndex();
    el.tpClock.querySelectorAll(".tp-num").forEach((btn, i) => btn.classList.toggle("selected", i === idx));
    if (idx == null) { el.tpHand.style.opacity = "0"; return; }
    el.tpHand.style.opacity = "1";
    el.tpHand.style.transform = `rotate(${(idx / 12) * 360}deg)`;
  }
  function selectClockValue(val) {
    if (tpMode === "hour") {
      const base = val % 12;
      tpHour24 = base + (tpAmPm === "PM" ? 12 : 0);
      tpMode = "minute";
      buildClockFace();
    } else {
      tpMinute = val;
      updateHand();
    }
    updateTimeReadout();
  }
  function updateAmPmButtons() {
    el.tpAmpmButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.ampm === tpAmPm));
  }
  el.tpAmpmButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tpAmPm = btn.dataset.ampm;
      updateAmPmButtons();
      if (tpHour24 != null) {
        const base = tpHour24 % 12;
        tpHour24 = base + (tpAmPm === "PM" ? 12 : 0);
      }
      updateTimeReadout();
    });
  });
  function updateTimeReadout() {
    const h12 = tpHour24 == null ? 12 : (tpHour24 % 12 === 0 ? 12 : tpHour24 % 12);
    el.tpHourDisplay.textContent = String(h12);
    el.tpMinuteDisplay.textContent = String(tpMinute).padStart(2, "0");
  }
  function openTimePicker() {
    if (el.taskTime.value) {
      const [h, m] = el.taskTime.value.split(":").map(Number);
      tpHour24 = h; tpMinute = m; tpAmPm = h >= 12 ? "PM" : "AM";
    } else {
      tpHour24 = null; tpMinute = 0;
      tpAmPm = new Date().getHours() >= 12 ? "PM" : "AM";
    }
    tpMode = "hour";
    updateAmPmButtons();
    buildClockFace();
    updateTimeReadout();
    el.timePickerPopover.hidden = false;
    el.taskTimeBtn.classList.add("active");
    closeDatePicker();
  }
  function closeTimePicker() {
    el.timePickerPopover.hidden = true;
    el.taskTimeBtn.classList.remove("active");
  }
  el.taskTimeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (el.timePickerPopover.hidden) openTimePicker(); else closeTimePicker();
  });
  el.tpDone.addEventListener("click", () => {
    if (tpHour24 == null) {
      el.taskTime.value = "";
      el.taskTimeDisplay.textContent = "No time set";
    } else {
      el.taskTime.value = `${String(tpHour24).padStart(2, "0")}:${String(tpMinute).padStart(2, "0")}`;
      el.taskTimeDisplay.textContent = formatTimeDisplay(el.taskTime.value);
    }
    closeTimePicker();
  });
  el.tpClear.addEventListener("click", () => {
    el.taskTime.value = "";
    el.taskTimeDisplay.textContent = "No time set";
    closeTimePicker();
  });

  // ---------- Templates (modal) ----------
  function renderTemplateOptions() {
    el.templateSelect.innerHTML = '<option value="">Start from template…</option>';
    templates.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.title;
      el.templateSelect.appendChild(opt);
    });
  }
  el.templateSelect.addEventListener("change", () => {
    const id = el.templateSelect.value;
    el.deleteTemplateBtn.hidden = !id;
    if (!id) return;
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    el.taskTitle.value = tpl.title;
    el.taskCategory.value = tpl.category;
    el.taskPriority.value = tpl.priority;
    el.taskTime.value = tpl.time || "";
    el.taskTimeDisplay.textContent = tpl.time ? formatTimeDisplay(tpl.time) : "No time set";
    el.taskRepeat.value = tpl.repeat || "none";
    el.taskReminder.checked = tpl.reminder !== false;
    el.taskNotes.value = tpl.notes || "";
    modalSubtasks = (tpl.subtasks || []).map((s) => ({ id: uid(), title: s.title, done: false }));
    renderSubtaskList();
  });
  el.saveTemplateBtn.addEventListener("click", () => {
    const title = el.taskTitle.value.trim();
    if (!title) { el.taskTitle.focus(); return; }
    const tpl = {
      id: uid(),
      title,
      category: el.taskCategory.value,
      priority: el.taskPriority.value,
      time: el.taskTime.value || "",
      repeat: el.taskRepeat.value,
      reminder: el.taskReminder.checked,
      notes: el.taskNotes.value.trim(),
      subtasks: modalSubtasks.map((s) => ({ title: s.title })),
    };
    templates.push(tpl);
    saveTemplates();
    renderTemplateOptions();
    el.templateSelect.value = tpl.id;
    el.deleteTemplateBtn.hidden = false;
    showSnackbar(`Template "${title}" saved`);
  });
  el.deleteTemplateBtn.addEventListener("click", () => {
    const id = el.templateSelect.value;
    if (!id) return;
    templates = templates.filter((t) => t.id !== id);
    saveTemplates();
    renderTemplateOptions();
    el.deleteTemplateBtn.hidden = true;
  });

  // ---------- Modal ----------
  function openCreateModal() {
    editingTask = null;
    editingDateKey = null;
    el.taskForm.reset();
    modalSubtasks = [];
    renderSubtaskList();
    el.modalTitle.textContent = "Log Item";
    el.taskDate.value = selectedDate;
    el.taskDateDisplay.textContent = formatDateDisplay(selectedDate);
    el.taskTime.value = "";
    el.taskTimeDisplay.textContent = "No time set";
    el.taskCategory.value = "work";
    el.taskPriority.value = "medium";
    el.taskRepeat.value = "none";
    el.taskReminder.checked = true;
    el.templateRow.hidden = false;
    renderTemplateOptions();
    el.templateSelect.value = "";
    el.deleteTemplateBtn.hidden = true;
    closeDatePicker();
    closeTimePicker();
    el.modalOverlay.hidden = false;
    setTimeout(() => el.taskTitle.focus(), 50);
  }
  function openEditModal(task, dateKey) {
    editingTask = task;
    editingDateKey = dateKey;
    el.taskTitle.value = task.title;
    el.taskDate.value = task.startDate;
    el.taskDateDisplay.textContent = formatDateDisplay(task.startDate);
    el.taskCategory.value = task.category;
    el.taskPriority.value = task.priority;
    el.taskTime.value = task.time || "";
    el.taskTimeDisplay.textContent = task.time ? formatTimeDisplay(task.time) : "No time set";
    el.taskRepeat.value = task.repeat;
    el.taskReminder.checked = task.reminder;
    el.taskNotes.value = task.notes || "";
    modalSubtasks = (task.subtasks || []).map((s) => ({ ...s }));
    renderSubtaskList();
    el.modalTitle.textContent = "Edit Item";
    el.templateRow.hidden = true;
    closeDatePicker();
    closeTimePicker();
    el.modalOverlay.hidden = false;
    setTimeout(() => el.taskTitle.focus(), 50);
  }
  function closeModal() {
    el.modalOverlay.hidden = true;
    closeDatePicker();
    closeTimePicker();
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
    const startDate = el.taskDate.value || selectedDate;
    const category = el.taskCategory.value;
    const priority = el.taskPriority.value;
    const time = el.taskTime.value || "";
    const reminder = time ? el.taskReminder.checked : false;
    const notes = el.taskNotes.value.trim();
    const repeat = el.taskRepeat.value;
    const subtasks = modalSubtasks.map((s) => ({ id: s.id, title: s.title, done: !!s.done }));

    if (editingTask) {
      Object.assign(editingTask, { title, category, priority, time, reminder, notes, repeat, subtasks, startDate });
    } else {
      tasks.push({
        id: uid(),
        title, category, priority, time, reminder, notes, subtasks,
        repeat,
        startDate,
        done: false,
        notified: false,
        completions: {},
        notifiedDates: {},
        skipped: {},
        order: Date.now(),
      });
      selectedDate = startDate;
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

  // ---------- Keyboard shortcuts ----------
  function shiftSelectedDate(deltaDays) {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() + deltaDays);
    selectedDate = toDateKey(d);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
    renderAll();
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!el.modalOverlay.hidden) closeModal();
      else if (!el.confirmOverlay.hidden) el.confirmOverlay.hidden = true;
      else if (!el.reportOverlay.hidden) closeReport();
      else if (!el.dayDetailOverlay.hidden) closeDayDetail();
      else if (!el.moreMenu.hidden) closeMoreMenu();
      else if (!el.snackbar.hidden) hideSnackbar();
      return;
    }
    if (!el.modalOverlay.hidden || !el.confirmOverlay.hidden || !el.reportOverlay.hidden) return;
    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
    if (typing) return;
    if (e.key === "n" || e.key === "N") { e.preventDefault(); openCreateModal(); }
    else if (e.key === "/") { e.preventDefault(); el.searchInput.focus(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); shiftSelectedDate(currentView === "week" ? -7 : -1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); shiftSelectedDate(currentView === "week" ? 7 : 1); }
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

  function showReminderBanner(text, task, dateKey) {
    el.reminderText.textContent = text;
    activeReminderTask = task;
    activeReminderDateKey = dateKey;
    el.reminderBanner.hidden = false;
  }
  el.dismissReminder.addEventListener("click", () => { el.reminderBanner.hidden = true; });
  el.snoozeReminder.addEventListener("click", () => {
    if (activeReminderTask) {
      setSnoozeUntil(activeReminderTask, activeReminderDateKey, Date.now() + SNOOZE_MS);
      clearNotifiedOn(activeReminderTask, activeReminderDateKey);
      saveTasks();
    }
    el.reminderBanner.hidden = true;
  });

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
      const snoozeUntil = getSnoozeUntil(t, nowKey);
      if (snoozeUntil && Date.now() < snoozeUntil) return;
      const [h, m] = t.time.split(":").map(Number);
      if (h * 60 + m <= nowMin) {
        setNotifiedOn(t, nowKey);
        changed = true;
        beep();
        showReminderBanner(`${t.title} — ${t.time}`, t, nowKey);
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Daily Log reminder", { body: t.title, tag: t.id + nowKey });
          } catch (e) { console.warn("Notification failed", e); }
        }
        if (nowKey === selectedDate) renderCurrentView();
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
  populateMonthYearSelects();
  renderCategoryChips();
  renderPriorityChips();
  renderAll();
})();
