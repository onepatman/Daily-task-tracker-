(() => {
  "use strict";

  const STORAGE_KEY = "dailyLog.tasks.v1";
  const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
  const MONTHS = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY",
    "AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

  // ---------- State ----------
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth(); // 0-11
  let selectedDate = toDateKey(today);
  let tasks = loadTasks();
  let calendarOpen = true;

  // ---------- Elements ----------
  const el = {
    monthLabel: document.getElementById("monthLabel"),
    yearLabel: document.getElementById("yearLabel"),
    prevMonth: document.getElementById("prevMonth"),
    nextMonth: document.getElementById("nextMonth"),
    monthYearBtn: document.getElementById("monthYearBtn"),
    calendarGrid: document.getElementById("calendarGrid"),
    calendarSection: document.getElementById("calendarSection"),
    calendarToggle: document.getElementById("calendarToggle"),
    sheetDate: document.getElementById("sheetDate"),
    sheetDay: document.getElementById("sheetDay"),
    sheetStatus: document.getElementById("sheetStatus"),
    taskList: document.getElementById("taskList"),
    emptyState: document.getElementById("emptyState"),
    addTaskBtn: document.getElementById("addTaskBtn"),
    modalOverlay: document.getElementById("modalOverlay"),
    taskForm: document.getElementById("taskForm"),
    taskTitle: document.getElementById("taskTitle"),
    taskTime: document.getElementById("taskTime"),
    taskReminder: document.getElementById("taskReminder"),
    cancelTask: document.getElementById("cancelTask"),
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
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
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
  function tasksForDate(dateKey) {
    return tasks.filter((t) => t.date === dateKey);
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

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
        renderCalendar();
        renderSheet();
      });
      el.calendarGrid.appendChild(btn);
    }
  }

  // ---------- Punch-list / sheet rendering ----------
  function renderSheet() {
    const dateObj = parseDateKey(selectedDate);
    el.sheetDate.textContent =
      String(dateObj.getMonth() + 1).padStart(2, "0") + "." +
      String(dateObj.getDate()).padStart(2, "0") + "." +
      dateObj.getFullYear();
    el.sheetDay.textContent = ["SUN","MON","TUE","WED","THU","FRI","SAT"][dateObj.getDay()];

    const dayTasks = tasksForDate(selectedDate).sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
    const doneCount = dayTasks.filter((t) => t.done).length;
    el.sheetStatus.textContent = `${doneCount}/${dayTasks.length} DONE`;

    el.taskList.innerHTML = "";
    el.emptyState.style.display = dayTasks.length === 0 ? "block" : "none";

    dayTasks.forEach((task, index) => {
      const row = document.createElement("div");
      row.className = "task-row" + (task.done ? " done" : "");

      const no = document.createElement("span");
      no.className = "task-no";
      no.textContent = String(index + 1).padStart(2, "0");

      const check = document.createElement("button");
      check.type = "button";
      check.className = "task-check";
      check.setAttribute("aria-checked", task.done ? "true" : "false");
      check.textContent = task.done ? "✓" : "";
      check.addEventListener("click", () => toggleDone(task.id));

      const title = document.createElement("span");
      title.className = "task-title";
      title.textContent = task.title;

      const time = document.createElement("span");
      time.className = "task-time";
      if (task.time) {
        time.textContent = task.time;
        if (!task.done && isDueSoon(selectedDate, task.time)) time.classList.add("due");
      } else {
        time.textContent = "—";
      }

      row.append(no, check, title, time);
      row.addEventListener("dblclick", () => deleteTask(task.id));
      el.taskList.appendChild(row);
    });
  }

  function parseDateKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function isDueSoon(dateKey, time) {
    const now = new Date();
    if (dateKey !== toDateKey(now)) return false;
    const [h, m] = time.split(":").map(Number);
    const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const diffMin = (due - now) / 60000;
    return diffMin <= 15 && diffMin >= -30;
  }

  function toggleDone(id) {
    const t = tasks.find((x) => x.id === id);
    if (t) t.done = !t.done;
    saveTasks();
    renderSheet();
    renderCalendar();
  }
  function deleteTask(id) {
    if (!confirm("Remove this item from the sheet?")) return;
    tasks = tasks.filter((x) => x.id !== id);
    saveTasks();
    renderSheet();
    renderCalendar();
  }

  // ---------- Modal ----------
  function openModal() {
    el.taskForm.reset();
    el.taskReminder.checked = true;
    el.modalOverlay.hidden = false;
    setTimeout(() => el.taskTitle.focus(), 50);
  }
  function closeModal() {
    el.modalOverlay.hidden = true;
  }
  el.addTaskBtn.addEventListener("click", openModal);
  el.cancelTask.addEventListener("click", closeModal);
  el.modalOverlay.addEventListener("click", (e) => {
    if (e.target === el.modalOverlay) closeModal();
  });
  el.taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = el.taskTitle.value.trim();
    if (!title) return;
    tasks.push({
      id: uid(),
      date: selectedDate,
      title,
      time: el.taskTime.value || "",
      reminder: el.taskTime.value ? el.taskReminder.checked : false,
      done: false,
      notified: false,
    });
    saveTasks();
    closeModal();
    renderSheet();
    renderCalendar();
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
    renderCalendar();
    renderSheet();
  });
  el.calendarToggle.addEventListener("click", () => {
    calendarOpen = !calendarOpen;
    el.calendarSection.style.display = calendarOpen ? "" : "none";
    el.calendarToggle.textContent = calendarOpen ? "Hide calendar ▲" : "Show calendar ▼";
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

    tasks.forEach((t) => {
      if (!t.reminder || t.done || t.notified || !t.time || t.date !== nowKey) return;
      const [h, m] = t.time.split(":").map(Number);
      if (h * 60 + m <= nowMin) {
        t.notified = true;
        beep();
        showReminderBanner(`${t.title} — ${t.time}`);
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Daily Log reminder", { body: t.title, tag: t.id });
          } catch (e) { console.warn("Notification failed", e); }
        }
        saveTasks();
        if (t.date === selectedDate) renderSheet();
      }
    });
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
  renderCalendar();
  renderSheet();
})();
