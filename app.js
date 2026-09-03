(() => {
  "use strict";

  const STORAGE_KEY = "dailyLog.tasks.v1";
  const THEME_KEY = "dailyLog.theme";
  const ACCENT_KEY = "dailyLog.accent";
  const TEXT_SIZE_KEY = "dailyLog.textSize";
  const TEMPLATES_KEY = "dailyLog.templates.v1";
  const FILTERS_KEY = "dailyLog.filters";
  const PREPARED_BY_KEY = "dailyLog.preparedBy";
  const MONTHS = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY",
    "AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
  const DAY_NAMES = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const FULL_DAY_NAMES = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];

  // ---------- Icons ----------
  // Emoji render inconsistently across phone brands/OSes (different glyph
  // sets, sizes, colors). A single inline-SVG set styled with currentColor
  // looks identical everywhere and always matches surrounding text color.
  const ICONS = {
    chevronDown: '<path d="M6 9l6 6 6-6"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    download: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14"/>',
    sync: '<path d="M21 12a9 9 0 0 1-15.5 6.36L3 16"/><path d="M3 12a9 9 0 0 1 15.5-6.36L21 8"/><path d="M3 21v-5h5"/><path d="M21 3v5h-5"/>',
    barChart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M3 20h18"/>',
    printer: '<path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    bellOff: '<path d="M8.7 3a6 6 0 0 1 9.3 5c0 3.4.8 5.7 1.6 7.1"/><path d="M6.3 6.3C5.2 7.6 5 9.2 5 10c0 7-3 9-3 9h13"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="2" y1="2" x2="22" y2="22"/>',
    close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
    trash: '<path d="M4 7h16"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    checkbox: '<rect x="4" y="4" width="16" height="16" rx="3"/><polyline points="8 12 11 15 16 9"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    undo: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/>',
    alertTriangle: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/>',
    alarm: '<circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 15 15"/><path d="M5 3 2 6"/><path d="M22 6l-3-3"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/>',
    tag: '<path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.2L4 3a1 1 0 0 0-1 1l.2 5.59a2 2 0 0 0 .58 1.41l9.6 9.6a2 2 0 0 0 2.83 0l4.38-4.38a2 2 0 0 0 0-2.81Z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>',
  };
  function iconSvg(name, extraClass) {
    const inner = ICONS[name] || "";
    return `<svg class="icon${extraClass ? " " + extraClass : ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>`;
  }
  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = iconSvg(el.dataset.icon) + el.innerHTML;
      delete el.dataset.icon;
    });
  }

  // Categories are the user's own list now, not a fixed set. The six below are
  // only the starting point on a first run -- an engineer wants Shopdrawing /
  // RFI / Submittal far more than Health / Errands. "other" is the fallback for
  // a task whose category was deleted, so it can be renamed and recoloured but
  // never removed.
  const CATEGORY_FALLBACK = "other";
  const DEFAULT_CATEGORIES = [
    { key: "work",     label: "Work",     color: "#5b8def" },
    { key: "personal", label: "Personal", color: "#b57bf2" },
    { key: "urgent",   label: "Urgent",   color: "#f76e6e" },
    { key: "health",   label: "Health",   color: "#3ecf8e" },
    { key: "errands",  label: "Errands",  color: "#f5a94e" },
    { key: CATEGORY_FALLBACK, label: "Other", color: "#8a97ab" },
  ];
  const CATEGORY_SWATCHES = [
    "#5b8def", "#b57bf2", "#f76e6e", "#3ecf8e", "#f5a94e", "#8a97ab",
    "#2fb8c6", "#e0709f", "#8db600", "#c98b3a", "#7a86f5", "#d4534f",
  ];
  const CATEGORIES_KEY = "dailyLog.categories.v1";
  let categories = loadCategories();

  function loadCategories() {
    try {
      const raw = localStorage.getItem(CATEGORIES_KEY);
      if (!raw) return DEFAULT_CATEGORIES.map((c) => Object.assign({}, c));
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) throw new Error("empty");
      const clean = parsed
        .filter((c) => c && typeof c.key === "string" && c.key)
        .map((c) => ({ key: c.key, label: String(c.label || c.key), color: c.color || "#8a97ab" }));
      // The fallback has to exist or a task pointing at a deleted category
      // would render with no colour and no name.
      if (!clean.some((c) => c.key === CATEGORY_FALLBACK)) {
        clean.push(Object.assign({}, DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]));
      }
      return clean;
    } catch (e) {
      console.error("Could not read categories", e);
      return DEFAULT_CATEGORIES.map((c) => Object.assign({}, c));
    }
  }
  function saveCategories() {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error("Could not save categories", e);
    }
  }
  function catInfo(key) {
    return categories.find((c) => c.key === key)
      || categories.find((c) => c.key === CATEGORY_FALLBACK)
      || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
  }
  function categoryExists(key) {
    return categories.some((c) => c.key === key);
  }
  // Colours are set on the element rather than matched by a per-name CSS rule,
  // which is the only way a category invented at runtime can be coloured at all.
  function applyCategoryColor(elm, key) {
    elm.style.setProperty("--cat-color", catInfo(key).color);
  }
  function categoryKeyFrom(label) {
    const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cat";
    let key = base;
    let n = 2;
    while (categoryExists(key)) key = `${base}-${n++}`;
    return key;
  }

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
  // Name printed on the "Prepared by" line. Typed once in the menu and kept, so
  // a sheet comes off the printer already complete instead of needing a pen.
  let modalPhotoPending = null;   // Blob picked but not yet committed
  let modalPhotoPendingUrl = "";  // object URL previewing that Blob
  let preparedBy = "";
  try { preparedBy = localStorage.getItem(PREPARED_BY_KEY) || ""; } catch (e) { preparedBy = ""; }
  let calendarOpen = true;
  let insightsOpen = false;
  let searchQuery = "";
  let activeCategories = new Set();
  let activePriorities = new Set();
  let sortMode = "time";
  function saveFilters() {
    localStorage.setItem(FILTERS_KEY, JSON.stringify({
      categories: [...activeCategories],
      priorities: [...activePriorities],
      sort: sortMode,
    }));
  }
  function loadFilters() {
    try {
      const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) || "null");
      if (!saved) return;
      if (Array.isArray(saved.categories)) activeCategories = new Set(saved.categories);
      if (Array.isArray(saved.priorities)) activePriorities = new Set(saved.priorities);
      if (typeof saved.sort === "string") sortMode = saved.sort;
    } catch (e) { /* ignore malformed saved filters */ }
  }
  let currentView = "home"; // 'home' | 'day' | 'week' | 'timeline' | 'board'
  let editingTask = null;
  let editingDateKey = null;
  let modalSubtasks = [];
  let modalPhoto = "";
  let modalSnapshot = null;
  let pendingUndo = null;
  let snackbarTimer = null;
  let activeReminderTask = null;
  let activeReminderDateKey = null;
  let dpViewYear = viewYear, dpViewMonth = viewMonth;
  let tpMode = "hour";
  let tpHour24 = null;
  let tpMinute = 0;
  let tpAmPm = "AM";
  let tpTarget = "start"; // 'start' | 'end' -- which field the shared time picker is currently editing
  let dayDetailDateKey = null;
  let dayDetailMode = "day"; // 'day' | 'task'
  let dayDetailTask = null;
  let selectMode = false;
  const selectedTaskIds = new Set();
  let armedRescheduleTaskId = null;

  // ---------- Elements ----------
  const el = {
    prevMonth: document.getElementById("prevMonth"),
    nextMonth: document.getElementById("nextMonth"),
    monthSelect: document.getElementById("monthSelect"),
    yearSelect: document.getElementById("yearSelect"),
    todayBtn: document.getElementById("todayBtn"),
    sheetDateFull: document.getElementById("sheetDateFull"),
    themeToggle: document.getElementById("themeToggle"),
    themeChoices: document.getElementById("themeChoices"),
    textSizeChoices: document.getElementById("textSizeChoices"),
    syncStatusPill: document.getElementById("syncStatusPill"),
    accentSwatches: document.getElementById("accentSwatches"),
    moreMenuBtn: document.getElementById("moreMenuBtn"),
    moreMenu: document.getElementById("moreMenu"),
    menuInstall: document.getElementById("menuInstall"),
    menuSync: document.getElementById("menuSync"),
    syncOverlay: document.getElementById("syncOverlay"),
    syncBody: document.getElementById("syncBody"),
    closeSyncOverlay: document.getElementById("closeSyncOverlay"),
    menuWeeklyReview: document.getElementById("menuWeeklyReview"),
    menuPrint: document.getElementById("menuPrint"),
    menuExportIcs: document.getElementById("menuExportIcs"),
    menuExportJson: document.getElementById("menuExportJson"),
    menuExportCsv: document.getElementById("menuExportCsv"),
    menuImport: document.getElementById("menuImport"),
    importFileInput: document.getElementById("importFileInput"),
    viewTabs: document.getElementById("viewTabs"),
    selectModeBtn: document.getElementById("selectModeBtn"),
    bulkBar: document.getElementById("bulkBar"),
    bulkBarCount: document.getElementById("bulkBarCount"),
    bulkMarkDoneBtn: document.getElementById("bulkMarkDoneBtn"),
    bulkDeleteBtn: document.getElementById("bulkDeleteBtn"),
    bulkCancelBtn: document.getElementById("bulkCancelBtn"),
    rescheduleBanner: document.getElementById("rescheduleBanner"),
    rescheduleBannerText: document.getElementById("rescheduleBannerText"),
    rescheduleCancelBtn: document.getElementById("rescheduleCancelBtn"),
    viewStatusBadge: document.getElementById("viewStatusBadge"),
    calendarGrid: document.getElementById("calendarGrid"),
    calendarSection: document.getElementById("calendarSection"),
    calendarToggle: document.getElementById("calendarToggle"),
    insightsPanel: document.getElementById("insightsPanel"),
    insightsToggle: document.getElementById("insightsToggle"),
    insightsToggleLabel: document.getElementById("insightsToggleLabel"),
    calendarToggleLabel: document.getElementById("calendarToggleLabel"),
    insightRingValue: document.getElementById("insightRingValue"),
    insightRingPct: document.getElementById("insightRingPct"),
    insightStreak: document.getElementById("insightStreak"),
    insightSparkline: document.getElementById("insightSparkline"),
    insightHeadline: document.getElementById("insightHeadline"),
    insightSub: document.getElementById("insightSub"),
    insightStreakHint: document.getElementById("insightStreakHint"),
    insightWeekSummary: document.getElementById("insightWeekSummary"),
    searchInput: document.getElementById("searchInput"),
    categoryChips: document.getElementById("categoryChips"),
    priorityChips: document.getElementById("priorityChips"),
    sortSelect: document.getElementById("sortSelect"),
    punchlist: document.querySelector(".punchlist"),
    toolbar: document.getElementById("toolbar"),
    homeView: document.getElementById("homeView"),
    homeStats: document.getElementById("homeStats"),
    homeOverdueSection: document.getElementById("homeOverdueSection"),
    homeOverdueList: document.getElementById("homeOverdueList"),
    moveAllOverdueBtn: document.getElementById("moveAllOverdueBtn"),
    homeGreeting: document.getElementById("homeGreeting"),
    homeGreetingSub: document.getElementById("homeGreetingSub"),
    homeTodaySection: document.getElementById("homeTodaySection"),
    homeTodayList: document.getElementById("homeTodayList"),
    homeUpcomingSection: document.getElementById("homeUpcomingSection"),
    homeUpcomingList: document.getElementById("homeUpcomingList"),
    dayView: document.getElementById("dayView"),
    weekView: document.getElementById("weekView"),
    monthView: document.getElementById("monthView"),
    monthWeekdays: document.getElementById("monthWeekdays"),
    monthGrid: document.getElementById("monthGrid"),
    timelineView: document.getElementById("timelineView"),
    boardView: document.getElementById("boardView"),
    printSheet: document.getElementById("printSheet"),
    printSheetTitle: document.getElementById("printSheetTitle"),
    printPeriod: document.getElementById("printPeriod"),
    printClientWrap: document.getElementById("printClientWrap"),
    printClient: document.getElementById("printClient"),
    printFilterWrap: document.getElementById("printFilterWrap"),
    printFilter: document.getElementById("printFilter"),
    printGenerated: document.getElementById("printGenerated"),
    printCompletion: document.getElementById("printCompletion"),
    printSheetHead: document.getElementById("printSheetHead"),
    printSheetBody: document.getElementById("printSheetBody"),
    printPreparedName: document.getElementById("printPreparedName"),
    preparedByInput: document.getElementById("preparedByInput"),
    menuCategories: document.getElementById("menuCategories"),
    categoryOverlay: document.getElementById("categoryOverlay"),
    categoryPanel: document.getElementById("categoryPanel"),
    categoryList: document.getElementById("categoryList"),
    categoryAddForm: document.getElementById("categoryAddForm"),
    categoryNewName: document.getElementById("categoryNewName"),
    closeCategories: document.getElementById("closeCategories"),
    printPreviewBackdrop: document.getElementById("printPreviewBackdrop"),
    printPreviewBar: document.getElementById("printPreviewBar"),
    printPreviewNote: document.getElementById("printPreviewNote"),
    printRangeFrom: document.getElementById("printRangeFrom"),
    printRangeTo: document.getElementById("printRangeTo"),
    printRangeReset: document.getElementById("printRangeReset"),
    printPreviewPrint: document.getElementById("printPreviewPrint"),
    printPreviewClose: document.getElementById("printPreviewClose"),
    taskList: document.getElementById("taskList"),
    emptyState: document.getElementById("emptyState"),
    addTaskBtn: document.getElementById("addTaskBtn"),
    modalOverlay: document.getElementById("modalOverlay"),
    modalTitle: document.getElementById("modalTitle"),
    taskForm: document.getElementById("taskForm"),
    reportBox: document.querySelector("#reportOverlay .report-box"),
    syncBox: document.querySelector("#syncOverlay .report-box"),
    dayDetailBox: document.querySelector("#dayDetailOverlay .day-detail-box"),
    templateRow: document.getElementById("templateRow"),
    templateChips: document.getElementById("templateChips"),
    templateEmpty: document.getElementById("templateEmpty"),
    saveTemplateBtn: document.getElementById("saveTemplateBtn"),
    taskTitle: document.getElementById("taskTitle"),
    quickParse: document.getElementById("quickParse"),
    quickParseChips: document.getElementById("quickParseChips"),
    quickParseHint: document.getElementById("quickParseHint"),
    taskDate: document.getElementById("taskDate"),
    taskDateBtn: document.getElementById("taskDateBtn"),
    repeatEveryField: document.getElementById("repeatEveryField"),
    repeatEvery: document.getElementById("repeatEvery"),
    repeatEveryHint: document.getElementById("repeatEveryHint"),
    repeatDaysField: document.getElementById("repeatDaysField"),
    repeatDays: document.getElementById("repeatDays"),
    repeatUntilField: document.getElementById("repeatUntilField"),
    repeatUntilBtn: document.getElementById("repeatUntilBtn"),
    repeatUntilDisplay: document.getElementById("repeatUntilDisplay"),
    repeatUntil: document.getElementById("repeatUntil"),
    repeatUntilClear: document.getElementById("repeatUntilClear"),
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
    taskEndTime: document.getElementById("taskEndTime"),
    taskEndTimeBtn: document.getElementById("taskEndTimeBtn"),
    taskEndTimeDisplay: document.getElementById("taskEndTimeDisplay"),
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
    taskTag: document.getElementById("taskTag"),
    taskNotes: document.getElementById("taskNotes"),
    taskPhotoPreview: document.getElementById("taskPhotoPreview"),
    photoDropzone: document.getElementById("photoDropzone"),
    lightboxOverlay: document.getElementById("lightboxOverlay"),
    lightboxStage: document.getElementById("lightboxStage"),
    lightboxImg: document.getElementById("lightboxImg"),
    lightboxClose: document.getElementById("lightboxClose"),
    lightboxHint: document.getElementById("lightboxHint"),
    photoDropzonePrompt: document.getElementById("photoDropzonePrompt"),
    removePhotoBtn: document.getElementById("removePhotoBtn"),
    taskPhotoInput: document.getElementById("taskPhotoInput"),
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
    dayDetailEditBtn: document.getElementById("dayDetailEditBtn"),
    dayDetailDeleteBtn: document.getElementById("dayDetailDeleteBtn"),
    snackbar: document.getElementById("snackbar"),
    snackbarText: document.getElementById("snackbarText"),
    snackbarUndo: document.getElementById("snackbarUndo"),
    snackbarDismiss: document.getElementById("snackbarDismiss"),
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
  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  // ---------- Photo store (IndexedDB) ----------
  // Photos used to live inside the tasks JSON in localStorage as base64 data
  // URLs. A 1600px drawing screenshot is ~300-600KB once base64'd, against a
  // ~5MB localStorage quota -- so roughly a dozen attachments filled the store,
  // and from then on NOTHING could be saved: not another photo, not a task, not
  // a ticked checkbox. IndexedDB stores the blobs themselves, has orders of
  // magnitude more room, and keeps the image bytes out of the JSON that has to
  // be parsed and re-serialised on every single edit.
  //
  // task.photo is a reference now, not the image:
  //   ""           no photo
  //   "idb:<id>"   a blob in the object store below
  //   "data:..."   a legacy inline photo, moved into the store on startup
  const PHOTO_DB_NAME = "dailyLogPhotos";
  const PHOTO_STORE = "photos";
  const PHOTO_REF_PREFIX = "idb:";
  const photoUrlCache = new Map(); // ref -> object URL
  let photoDbPromise = null;

  const isPhotoRef = (v) => typeof v === "string" && v.startsWith(PHOTO_REF_PREFIX);
  const photoIdOf = (ref) => ref.slice(PHOTO_REF_PREFIX.length);

  function openPhotoDb() {
    if (photoDbPromise) return photoDbPromise;
    photoDbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error("IndexedDB unavailable")); return; }
      const req = indexedDB.open(PHOTO_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) db.createObjectStore(PHOTO_STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return photoDbPromise;
  }
  function photoTx(mode, run) {
    return openPhotoDb().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, mode);
      const req = run(tx.objectStore(PHOTO_STORE));
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      // Resolve on complete, not on the request: a write is only durable once
      // its transaction has committed.
      tx.oncomplete = () => resolve(req ? req.result : undefined);
    }));
  }
  function putPhoto(blob) {
    const id = uid();
    return photoTx("readwrite", (s) => s.put({ id, blob, addedAt: Date.now() }))
      .then(() => PHOTO_REF_PREFIX + id);
  }
  function getPhotoBlob(ref) {
    if (!isPhotoRef(ref)) return Promise.resolve(null);
    return photoTx("readonly", (s) => s.get(photoIdOf(ref)))
      .then((rec) => (rec && rec.blob) || null)
      .catch(() => null);
  }
  function deletePhoto(ref) {
    if (!isPhotoRef(ref)) return Promise.resolve();
    const url = photoUrlCache.get(ref);
    if (url) { URL.revokeObjectURL(url); photoUrlCache.delete(ref); }
    return photoTx("readwrite", (s) => s.delete(photoIdOf(ref))).catch(() => {});
  }
  function photoUrl(ref) {
    if (!ref) return Promise.resolve("");
    if (!isPhotoRef(ref)) return Promise.resolve(ref); // legacy inline photo
    const cached = photoUrlCache.get(ref);
    if (cached) return Promise.resolve(cached);
    return getPhotoBlob(ref).then((blob) => {
      if (!blob) return "";
      const url = URL.createObjectURL(blob);
      photoUrlCache.set(ref, url);
      return url;
    });
  }
  // Points an <img> at a reference. An already-seen photo is assigned
  // synchronously so re-rendering a list does not blink it away and back.
  function setPhotoSrc(img, ref) {
    if (!ref) { img.removeAttribute("src"); return; }
    if (!isPhotoRef(ref)) { img.src = ref; return; }
    const cached = photoUrlCache.get(ref);
    if (cached) { img.src = cached; return; }
    photoUrl(ref).then((url) => { if (url) img.src = url; });
  }
  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  }
  function dataUrlToBlob(dataUrl) {
    // fetch() parses data: URLs, which beats hand-rolling base64 decoding.
    return fetch(dataUrl).then((r) => r.blob());
  }
  // Moves any inline photo left over from the old format into the store. A
  // photo that cannot be moved keeps its inline copy rather than being lost.
  async function migrateInlinePhotos() {
    const inline = tasks.filter((t) => t.photo && !isPhotoRef(t.photo));
    if (!inline.length) return false;
    let moved = 0;
    for (const t of inline) {
      try {
        t.photo = await putPhoto(await dataUrlToBlob(t.photo));
        moved++;
      } catch (e) {
        console.error("photo migration failed for", t.id, e);
      }
    }
    if (moved) saveTasks();
    return moved > 0;
  }
  // Blobs whose task is gone. Deleting a task does NOT delete its photo -- the
  // delete is undoable from the snackbar, and an undo must not restore a task
  // whose attachment has already been thrown away. The bytes are reclaimed here
  // on the next start instead, once the undo window is definitively over.
  async function sweepOrphanPhotos() {
    try {
      const keys = await photoTx("readonly", (s) => s.getAllKeys());
      if (!keys || !keys.length) return;
      const used = new Set(tasks.filter((t) => isPhotoRef(t.photo)).map((t) => photoIdOf(t.photo)));
      for (const id of keys) {
        if (!used.has(id)) await deletePhoto(PHOTO_REF_PREFIX + id);
      }
    } catch (e) { /* a failed sweep only costs disk space */ }
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

  function timeRangeLabel(task) {
    if (!task.time) return "";
    return task.endTime ? `${task.time}–${task.endTime}` : task.time;
  }

  // Sets el's text content, wrapping the first case-insensitive match of
  // `query` in a <mark> so search results show what actually matched.
  // Builds via DOM nodes (not innerHTML) so arbitrary task text can never
  // be interpreted as markup.
  function renderHighlightedText(el, text, query) {
    el.textContent = "";
    const q = (query || "").trim();
    if (!q) { el.textContent = text; return; }
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) { el.textContent = text; return; }
    if (idx > 0) el.appendChild(document.createTextNode(text.slice(0, idx)));
    const mark = document.createElement("mark");
    mark.className = "search-highlight";
    mark.textContent = text.slice(idx, idx + q.length);
    el.appendChild(mark);
    const rest = text.slice(idx + q.length);
    if (rest) el.appendChild(document.createTextNode(rest));
  }

  // ---------- Persistence & migration ----------
  function migrateTask(t) {
    if (t.endTime === undefined) t.endTime = "";
    if (t.repeatDays === undefined) t.repeatDays = [];
    if (t.repeatEvery === undefined) t.repeatEvery = 0;
    if (t.repeatUntil === undefined) t.repeatUntil = "";
    if (t.repeat !== undefined) return t;
    return {
      id: t.id,
      title: t.title,
      category: t.category || "other",
      priority: t.priority || "medium",
      time: t.time || "",
      endTime: t.endTime || "",
      reminder: !!t.reminder,
      notes: t.notes || "",
      subtasks: t.subtasks || [],
      repeat: "none",
      repeatDays: [],
      repeatUntil: "",
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
      // Photos are stored inline, so a full quota is a realistic failure here.
      // Staying silent would let the app look saved while the change was lost.
      console.error("Could not save tasks", e);
      const full = e && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22);
      showSnackbar(full
        ? "Storage is full — remove a photo or delete old tasks"
        : "Could not save your change");
    }
    pushSyncUpdate();
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
    pushSyncUpdate();
  }

  // ---------- Occurrence logic (supports recurring tasks) ----------
  function matchesRepeat(task, dateObj) {
    const startObj = parseDateKey(task.startDate);
    if (dateObj < startObj) return false;
    if (task.repeatUntil && toDateKey(dateObj) > task.repeatUntil) return false;
    if (task.repeat === "daily") return true;
    if (task.repeat === "weekdays") { const wd = dateObj.getDay(); return wd >= 1 && wd <= 5; }
    if (task.repeat === "weekly") return dateObj.getDay() === startObj.getDay();
    if (task.repeat === "everyweeks") {
      if (dateObj.getDay() !== startObj.getDay()) return false;
      const every = repeatEveryWeeks(task);
      // Counted in whole days and then divided, rather than by adding weeks
      // repeatedly: the same weekday is always a whole number of days away, so
      // this stays exact across DST changes, which shift the clock but not the
      // calendar date.
      const days = Math.round((dateObj - startObj) / 86400000);
      return days % (every * 7) === 0;
    }
    if (task.repeat === "custom") return (task.repeatDays || []).includes(dateObj.getDay());
    if (task.repeat === "monthly") {
      // Clamp to the last day of shorter months so a task started on the 31st
      // still lands once in February and the 30-day months, rather than
      // silently skipping them.
      const lastOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
      return dateObj.getDate() === Math.min(startObj.getDate(), lastOfMonth);
    }
    return false;
  }
  // Client/project tags get a stable colour derived from their own name, so a
  // project keeps the same colour everywhere without anyone configuring it and
  // without storing anything. Hues come from a fixed palette rather than the
  // full wheel: every entry stays legible in both themes, and reds are left out
  // because red already means overdue/urgent here.
  const TAG_HUES = [210, 265, 150, 35, 190, 320, 95, 250];
  function tagHue(tag) {
    let h = 0;
    for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
    return TAG_HUES[h % TAG_HUES.length];
  }
  function applyTagColor(el, tag) {
    el.style.setProperty("--tag-hue", String(tagHue(tag)));
  }

  // ---------- Natural-language quick add ----------
  // Turns one typed line into task fields. Tokens are deliberately explicit
  // (@category, #tag, !priority) rather than guessed from bare words, because
  // a task title like "high voltage panel" or "Monday briefing" would otherwise
  // silently rewrite the priority or the date. Only dates, times and repeats
  // read as plain English, since those are unambiguous enough in context.
  const qaCategoryWords = () => categories.map((c) => c.key);
  const QA_PRIORITY_WORDS = { high: "high", hi: "high", med: "medium", medium: "medium", low: "low" };

  function qaNextWeekday(targetDow, skipAWeek) {
    const d = new Date(today);
    let delta = (targetDow - d.getDay() + 7) % 7;
    if (skipAWeek) delta += 7;
    d.setDate(d.getDate() + delta);
    return toDateKey(d);
  }
  function qaShiftDays(n) {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return toDateKey(d);
  }
  function qaTo24h(hour, minute, meridiem) {
    let h = hour % 12;
    if (meridiem === "pm") h += 12;
    if (!meridiem) h = hour % 24;         // bare 14:00 stays as typed
    return `${String(h).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`;
  }

  function parseQuickAdd(raw) {
    const found = {};
    let text = raw;
    const cut = (re) => { text = text.replace(re, " "); };

    // #tag runs to the end of the line, so project names may contain spaces.
    const tagM = text.match(/#\s*([^#]+)$/);
    if (tagM && tagM[1].trim()) {
      found.tag = tagM[1].trim();
      cut(/#\s*[^#]+$/);
    }

    // Built from the live list, so a category invented this morning is
    // recognised by "@shopdrawing" this afternoon. Longest first, or "@rfi"
    // would win over "@rfi-response".
    const catWords = qaCategoryWords().slice().sort((a, b) => b.length - a.length).map(escapeRegExp);
    const catM = catWords.length && text.match(new RegExp(`@(${catWords.join("|")})\\b`, "i"));
    if (catM) { found.category = catM[1].toLowerCase(); cut(new RegExp(`@${escapeRegExp(catM[1])}\\b`, "i")); }

    const priWordM = text.match(new RegExp(`!(${Object.keys(QA_PRIORITY_WORDS).join("|")})\\b`, "i"));
    if (priWordM) {
      found.priority = QA_PRIORITY_WORDS[priWordM[1].toLowerCase()];
      cut(new RegExp(`!${priWordM[1]}\\b`, "i"));
    } else {
      const bangM = text.match(/(?:^|\s)(!{1,3})(?=\s|$)/);
      if (bangM) {
        found.priority = { "!": "low", "!!": "medium", "!!!": "high" }[bangM[1]];
        cut(/(?:^|\s)!{1,3}(?=\s|$)/);
      }
    }

    // "every 2 weeks" / "biweekly" / "every other week" must be tested before
    // the plain "every week" rule below, which would otherwise match the tail
    // of the phrase and drop the interval.
    const nWeeks = text.match(/\bevery\s+(\d{1,2})\s*(?:weeks?|wks?)\b/i);
    const otherWeek = /\b(bi-?weekly|fortnightly|every\s+other\s+week)\b/i.test(text);
    if (nWeeks && Number(nWeeks[1]) >= 2) {
      found.repeat = "everyweeks";
      found.repeatEvery = Math.min(Number(nWeeks[1]), 26);
      cut(new RegExp(`\\bevery\\s+${nWeeks[1]}\\s*(?:weeks?|wks?)\\b`, "i"));
    } else if (otherWeek) {
      found.repeat = "everyweeks";
      found.repeatEvery = 2;
      cut(/\b(bi-?weekly|fortnightly|every\s+other\s+week)\b/i);
    }

    // Repeats before dates: "every monday" must not be eaten by the weekday rule.
    const everyDow = found.repeat === "everyweeks" ? null
      : text.match(new RegExp(`\\bevery\\s+(${FULL_DAY_NAMES.map((d) => d.toLowerCase()).join("|")})s?\\b`, "i"));
    if (everyDow) {
      found.repeat = "custom";
      found.repeatDays = [FULL_DAY_NAMES.indexOf(everyDow[1].toUpperCase())];
      cut(new RegExp(`\\bevery\\s+${everyDow[1]}s?\\b`, "i"));
    } else if (found.repeat === "everyweeks") {
      /* already claimed above */
    } else if (/\b(every\s+weekday|weekdays)\b/i.test(text)) {
      found.repeat = "weekdays"; cut(/\b(every\s+weekday|weekdays)\b/i);
    } else if (/\b(every\s*day|daily)\b/i.test(text)) {
      found.repeat = "daily"; cut(/\b(every\s*day|daily)\b/i);
    } else if (/\b(every\s+week|weekly)\b/i.test(text)) {
      found.repeat = "weekly"; cut(/\b(every\s+week|weekly)\b/i);
    } else if (/\b(every\s+month|monthly)\b/i.test(text)) {
      found.repeat = "monthly"; cut(/\b(every\s+month|monthly)\b/i);
    }

    // Time, including ranges, before dates so "9-11am" isn't read as a day number.
    const RANGE = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
    const rangeM = text.match(RANGE);
    if (rangeM) {
      const endMer = rangeM[6].toLowerCase();
      found.time = qaTo24h(+rangeM[1], +rangeM[2] || 0, (rangeM[3] || endMer).toLowerCase());
      found.endTime = qaTo24h(+rangeM[4], +rangeM[5] || 0, endMer);
      cut(RANGE);
    } else {
      const t12 = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
      const t24 = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
      if (t12) { found.time = qaTo24h(+t12[1], +t12[2] || 0, t12[3].toLowerCase()); cut(/\b\d{1,2}(?::\d{2})?\s*(am|pm)\b/i); }
      else if (t24) { found.time = qaTo24h(+t24[1], +t24[2], null); cut(/\b([01]?\d|2[0-3]):[0-5]\d\b/); }
    }

    if (/\btoday\b/i.test(text)) { found.startDate = qaShiftDays(0); cut(/\btoday\b/i); }
    else if (/\b(tomorrow|tmr|tmrw)\b/i.test(text)) { found.startDate = qaShiftDays(1); cut(/\b(tomorrow|tmr|tmrw)\b/i); }
    else {
      const inDays = text.match(/\bin\s+(\d{1,3})\s+days?\b/i);
      const nextDow = text.match(new RegExp(`\\b(next\\s+)?(${FULL_DAY_NAMES.map((d) => d.toLowerCase()).join("|")}|${DAY_NAMES.map((d) => d.toLowerCase()).join("|")})\\b`, "i"));
      const monthName = MONTHS.map((m) => m.toLowerCase()).join("|");
      const mdM = text.match(new RegExp(`\\b(${monthName}|${MONTHS.map((m) => m.slice(0, 3).toLowerCase()).join("|")})\\.?\\s+(\\d{1,2})\\b`, "i"));
      const dmM = text.match(new RegExp(`\\b(\\d{1,2})\\s+(${monthName}|${MONTHS.map((m) => m.slice(0, 3).toLowerCase()).join("|")})\\b`, "i"));
      const slashM = text.match(/\b(\d{1,2})\/(\d{1,2})\b/);

      if (inDays) { found.startDate = qaShiftDays(+inDays[1]); cut(/\bin\s+\d{1,3}\s+days?\b/i); }
      else if (mdM || dmM) {
        const nameRaw = (mdM ? mdM[1] : dmM[2]).toUpperCase();
        const day = +(mdM ? mdM[2] : dmM[1]);
        const idx = MONTHS.findIndex((m) => m.startsWith(nameRaw.slice(0, 3)));
        // A month/day already past this year means they mean next year.
        const y = today.getFullYear();
        let d = new Date(y, idx, day);
        if (toDateKey(d) < toDateKey(today)) d = new Date(y + 1, idx, day);
        found.startDate = toDateKey(d);
        cut(mdM ? new RegExp(`\\b${mdM[1]}\\.?\\s+${mdM[2]}\\b`, "i") : new RegExp(`\\b${dmM[1]}\\s+${dmM[2]}\\b`, "i"));
      } else if (nextDow) {
        const word = nextDow[2].toUpperCase();
        const dow = FULL_DAY_NAMES.findIndex((d) => d.startsWith(word.slice(0, 3)));
        found.startDate = qaNextWeekday(dow, !!nextDow[1]);
        cut(new RegExp(`\\b(next\\s+)?${nextDow[2]}\\b`, "i"));
      } else if (slashM) {
        const y = today.getFullYear();
        let d = new Date(y, +slashM[1] - 1, +slashM[2]);
        if (toDateKey(d) < toDateKey(today)) d = new Date(y + 1, +slashM[1] - 1, +slashM[2]);
        found.startDate = toDateKey(d);
        cut(/\b\d{1,2}\/\d{1,2}\b/);
      }
    }

    found.title = text.replace(/\s{2,}/g, " ").trim();
    return found;
  }

  // Guards against a stored 0/1/NaN turning "every N weeks" into either an
  // every-week task or a division by zero.
  function repeatEveryWeeks(task) {
    const n = Math.round(Number(task && task.repeatEvery));
    return Number.isFinite(n) && n >= 2 ? Math.min(n, 26) : 2;
  }
  function repeatLabel(task) {
    if (task.repeat === "everyweeks") {
      const n = repeatEveryWeeks(task);
      return n === 2 ? "every 2 weeks" : `every ${n} weeks`;
    }
    if (task.repeat === "custom") {
      const days = (task.repeatDays || []).slice().sort();
      if (!days.length) return "custom";
      return days.map((d) => DAY_NAMES[d].slice(0, 3)).join(" ");
    }
    return task.repeat;
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
    checkDayCelebration(dateKey);
  }

  // ---------- Completion celebration ----------
  const celebratedDates = new Set();
  function checkDayCelebration(dateKey) {
    const list = tasksForDate(dateKey);
    if (!list.length) { celebratedDates.delete(dateKey); return; }
    const allDone = list.every((t) => isDoneOn(t, dateKey));
    if (!allDone) { celebratedDates.delete(dateKey); return; }
    if (celebratedDates.has(dateKey)) return;
    celebratedDates.add(dateKey);
    if (dateKey === selectedDate) {
      triggerConfetti();
      showSnackbar("🎉 All tasks done for today!", null);
    }
  }
  function triggerConfetti() {
    const colors = ["#ff7a1a", "#45c6f5", "#34d399", "#f76e6e", "#b57bf2", "#fbbf24"];
    const burst = document.createElement("div");
    burst.className = "confetti-burst";
    for (let i = 0; i < 26; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${40 + Math.random() * 20}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty("--x", `${(Math.random() - 0.5) * 260}px`);
      piece.style.setProperty("--rot", `${(Math.random() - 0.5) * 720}deg`);
      piece.style.setProperty("--delay", `${Math.random() * 150}ms`);
      burst.appendChild(piece);
    }
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 1500);
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
  function closeConfirm() {
    el.confirmOverlay.hidden = true;
  }
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
        closeConfirm();
        if (b.onClick) b.onClick();
      });
      el.confirmActions.appendChild(btn);
    });
    el.confirmOverlay.hidden = false;
    pushOverlayState();
  }
  el.confirmOverlay.addEventListener("click", (e) => {
    if (e.target === el.confirmOverlay) closeConfirm();
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

  // ---------- Snackbar (undo / notices) ----------
  function showSnackbar(text, actionFn, actionLabel) {
    clearTimeout(snackbarTimer);
    el.snackbarText.textContent = text;
    el.snackbarUndo.textContent = actionLabel || "Undo";
    el.snackbarUndo.hidden = !actionFn;
    pendingUndo = actionFn || null;
    el.snackbar.hidden = false;
    if (actionLabel !== "Refresh") {
      snackbarTimer = setTimeout(hideSnackbar, 5000);
    }
  }
  function hideSnackbar() {
    el.snackbar.hidden = true;
    pendingUndo = null;
  }
  el.snackbarUndo.addEventListener("click", () => {
    if (pendingUndo) pendingUndo();
    hideSnackbar();
  });
  el.snackbarDismiss.addEventListener("click", hideSnackbar);

  // ---------- Overlay history (Back button closes overlays, not the app) ----------
  // Opening an overlay pushes one history entry so the hardware/browser Back
  // button closes it instead of exiting the app. Closing an overlay via a
  // button/backdrop/Escape does NOT call history.back() -- history.back() is
  // asynchronous, so calling it and then immediately pushState-ing (e.g. the
  // day-detail popup's Edit button, which closes the popup and opens the
  // edit modal in the same tick) races the pending navigation against the
  // new push in a way that's unreliable across browsers. Instead, opening an
  // overlay reuses (replaceState) the current entry if one is already
  // marked as ours, so transitioning between overlays never grows the stack,
  // and a leftover marker after a button-close is harmless: it's simply
  // reused by the next overlay that opens, or silently absorbed by one
  // no-op Back press if the user backs out without opening anything else.
  function pushOverlayState() {
    try {
      if (window.history.state && window.history.state.dtOverlay) {
        history.replaceState({ dtOverlay: true }, "");
      } else {
        history.pushState({ dtOverlay: true }, "");
      }
    } catch (e) { /* ignore */ }
  }
  // Listed in paint order, topmost first, so Back and Escape always dismiss
  // whatever is actually on top. z-index: lightbox 95, more-menu 80,
  // confirm 75, print preview 74/72, report/sync/day-detail 70, task modal 60.
  function closeTopmostOverlay() {
    if (!el.lightboxOverlay.hidden) { closeLightbox(); return true; }
    if (!el.moreMenu.hidden) { closeMoreMenu(); return true; }
    if (!el.confirmOverlay.hidden) { closeConfirm(); return true; }
    if (!el.printPreviewBar.hidden) { closePrintPreview(); return true; }
    if (!el.categoryOverlay.hidden) { closeCategories(); return true; }
    if (!el.reportOverlay.hidden) { closeReport(); return true; }
    if (!el.syncOverlay.hidden) { closeSyncOverlay(); return true; }
    if (!el.dayDetailOverlay.hidden) { closeDayDetail(); return true; }
    if (!el.modalOverlay.hidden) { requestCloseModal(); return true; }
    return false;
  }
  window.addEventListener("popstate", () => {
    closeTopmostOverlay();
  });

  // ---------- Theme ----------
  // "Auto" follows the device's local wall-clock time (light 06:00-17:59,
  // dark 18:00-05:59) rather than the OS-level prefers-color-scheme setting
  // -- that setting reflects whatever the user's phone/OS dark-mode toggle
  // happens to be set to, which may have nothing to do with the actual time
  // of day where they are.
  function resolveTheme(pref) {
    if (pref === "light" || pref === "dark") return pref;
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? "light" : "dark";
  }
  function getThemePref() {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : "auto";
  }
  function applyTheme(pref) {
    const resolved = resolveTheme(pref);
    document.documentElement.setAttribute("data-theme", resolved);
    el.themeToggle.innerHTML = iconSvg(resolved === "light" ? "sun" : "moon");
    el.themeToggle.setAttribute("aria-label", resolved === "light" ? "Switch to dark theme" : "Switch to light theme");
    applyAccent(localStorage.getItem(ACCENT_KEY) || "orange");
    if (el.themeChoices) {
      el.themeChoices.querySelectorAll(".theme-choice-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.themeChoice === pref);
      });
    }
  }
  function initTheme() {
    applyTheme(getThemePref());
    // Re-check every minute so Auto flips over live at the 6am/6pm boundary
    // without needing a reload.
    setInterval(() => {
      if (getThemePref() === "auto") applyTheme("auto");
    }, 60000);
  }
  el.themeToggle.addEventListener("click", () => {
    const next = resolveTheme(getThemePref()) === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
  if (el.themeChoices) {
    el.themeChoices.querySelectorAll(".theme-choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.dataset.themeChoice;
        if (choice === "auto") localStorage.removeItem(THEME_KEY);
        else localStorage.setItem(THEME_KEY, choice);
        applyTheme(choice);
      });
    });
  }

  // ---------- Text size ----------
  function getTextSizePref() {
    const saved = localStorage.getItem(TEXT_SIZE_KEY);
    return saved === "large" || saved === "xlarge" ? saved : "normal";
  }
  function applyTextSize(pref) {
    document.documentElement.setAttribute("data-text-size", pref);
    if (el.textSizeChoices) {
      el.textSizeChoices.querySelectorAll(".theme-choice-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.textSizeChoice === pref);
      });
    }
  }
  if (el.textSizeChoices) {
    el.textSizeChoices.querySelectorAll(".theme-choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.dataset.textSizeChoice;
        if (choice === "normal") localStorage.removeItem(TEXT_SIZE_KEY);
        else localStorage.setItem(TEXT_SIZE_KEY, choice);
        applyTextSize(choice);
      });
    });
  }
  applyTextSize(getTextSizePref());

  // ---------- Accent color ----------
  const ACCENT_SWATCHES = [
    { id: "orange", label: "Orange", dark: "#ff7a1a", light: "#e8600a" },
    { id: "blue",   label: "Blue",   dark: "#4f9dff", light: "#1d6fe0" },
    { id: "green",  label: "Green",  dark: "#34d399", light: "#16a34a" },
    { id: "purple", label: "Purple", dark: "#b57bf2", light: "#8b3fd6" },
    { id: "red",    label: "Red",    dark: "#f76e6e", light: "#dc2626" },
    { id: "teal",   label: "Teal",   dark: "#45c6f5", light: "#0891b2" },
    { id: "pink",   label: "Pink",   dark: "#f472b6", light: "#db2777" },
  ];
  function relLuminance(hex) {
    const [r, g, b] = hex.replace("#", "").match(/.{2}/g)
      .map((h) => parseInt(h, 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function pickOnAccent(hex) {
    return relLuminance(hex) > 0.3 ? "#12202f" : "#ffffff";
  }
  function applyAccent(id) {
    const swatch = ACCENT_SWATCHES.find((s) => s.id === id) || ACCENT_SWATCHES[0];
    const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const hex = swatch[theme];
    document.documentElement.style.setProperty("--accent", hex);
    document.documentElement.style.setProperty("--on-accent", pickOnAccent(hex));
    if (el.accentSwatches) {
      el.accentSwatches.querySelectorAll(".accent-swatch").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.accent === swatch.id);
      });
    }
  }
  if (el.accentSwatches) {
    el.accentSwatches.querySelectorAll(".accent-swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem(ACCENT_KEY, btn.dataset.accent);
        applyAccent(btn.dataset.accent);
      });
    });
  }

  // ---------- More menu ----------
  function openMoreMenu() {
    el.moreMenu.hidden = false;
    el.moreMenuBtn.setAttribute("aria-expanded", "true");
    pushOverlayState();
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
    if (!el.datePickerPopover.hidden && !path.includes(el.taskDateBtn) && !path.includes(el.repeatUntilBtn) && !path.includes(el.datePickerPopover)) closeDatePicker();
    if (!el.timePickerPopover.hidden && !path.includes(el.taskTimeBtn) && !path.includes(el.taskEndTimeBtn) && !path.includes(el.timePickerPopover)) closeTimePicker();
  });

  // ---------- View tabs (Day / Week / Timeline) ----------
  function setView(view) {
    const changed = view !== currentView;
    currentView = view;
    el.viewTabs.querySelectorAll(".view-tab").forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    el.homeView.hidden = view !== "home";
    el.dayView.hidden = view !== "day";
    el.weekView.hidden = view !== "week";
    el.monthView.hidden = view !== "month";
    el.timelineView.hidden = view !== "timeline";
    el.boardView.hidden = view !== "board";
    el.toolbar.hidden = view === "home";
    // Lets CSS drop the sidebar's mini calendar in Month view, where a second
    // calendar next to the grid is redundant and costs it a third of its width.
    document.body.dataset.view = view;
    if (changed) {
      const activeEl = view === "home" ? el.homeView : view === "day" ? el.dayView
        : view === "week" ? el.weekView : view === "month" ? el.monthView
        : view === "timeline" ? el.timelineView : el.boardView;
      activeEl.classList.remove("view-entering");
      void activeEl.offsetWidth; // restart the animation even if it's still playing
      activeEl.classList.add("view-entering");
    }
    el.selectModeBtn.hidden = view !== "day";
    if (view !== "day" && selectMode) setSelectMode(false);
    renderCurrentView();
  }
  el.viewTabs.querySelectorAll(".view-tab").forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });

  // ---------- Bulk select mode (Day view) ----------
  function setSelectMode(on) {
    selectMode = on;
    selectedTaskIds.clear();
    if (on && armedRescheduleTaskId) disarmReschedule();
    el.selectModeBtn.classList.toggle("active", on);
    el.selectModeBtn.innerHTML = iconSvg(on ? "close" : "checkbox") + (on ? " Cancel" : " Select");
    updateBulkBar();
    renderCurrentView();
  }
  function updateBulkBar() {
    el.bulkBar.hidden = !selectMode || selectedTaskIds.size === 0;
    el.bulkBarCount.textContent = `${selectedTaskIds.size} selected`;
  }
  function toggleTaskSelected(id) {
    if (selectedTaskIds.has(id)) selectedTaskIds.delete(id);
    else selectedTaskIds.add(id);
    updateBulkBar();
  }
  el.selectModeBtn.addEventListener("click", () => setSelectMode(!selectMode));
  el.bulkCancelBtn.addEventListener("click", () => setSelectMode(false));
  el.bulkMarkDoneBtn.addEventListener("click", () => {
    const ids = Array.from(selectedTaskIds);
    ids.forEach((id) => {
      const task = tasks.find((t) => t.id === id);
      if (task) setDoneOn(task, selectedDate, true);
    });
    saveTasks();
    setSelectMode(false);
    renderAll();
  });
  el.bulkDeleteBtn.addEventListener("click", () => {
    const ids = Array.from(selectedTaskIds);
    if (!ids.length) return;
    const snapshot = JSON.parse(JSON.stringify(tasks));
    showConfirm(`Remove ${ids.length} selected task${ids.length === 1 ? "" : "s"} from this sheet?`, [
      { label: "Delete", danger: true, onClick: () => {
          ids.forEach((id) => {
            const task = tasks.find((t) => t.id === id);
            if (!task) return;
            if (task.repeat === "none") {
              tasks = tasks.filter((t) => t.id !== id);
            } else {
              task.skipped = task.skipped || {};
              task.skipped[selectedDate] = true;
            }
          });
          saveTasks();
          setSelectMode(false);
          renderAll();
          showSnackbar(`${ids.length} task${ids.length === 1 ? "" : "s"} deleted`, () => {
            tasks = snapshot;
            saveTasks(); renderAll();
          });
        } },
      { label: "Cancel", cancel: true },
    ]);
  });

  function renderCurrentView() {
    if (currentView === "home") renderHomeView();
    else if (currentView === "week") renderWeekView();
    else if (currentView === "month") renderMonthView();
    else if (currentView === "timeline") renderTimelineView();
    else if (currentView === "board") renderBoardView();
    else {
      renderSheet();
      maybeShowSwipeHint();
    }
    // The badge is refreshed here, in the same pass that draws the list, and
    // nowhere else. It used to hang off updateSheetHeader(), which typing in
    // the search box never calls -- so the count stayed frozen at whatever the
    // last date change had computed while the list below it changed underneath.
    updateViewStatusBadge();
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
  // Browsing to another month moves the selection into it, keeping the same
  // day-of-month where the month is long enough. Previously these handlers only
  // redrew the grid, so the date header underneath kept showing a date from the
  // month you had navigated away from until you happened to click a day -- which
  // read as the header lagging a step behind every month change.
  function setViewedMonth(year, month) {
    viewYear = year;
    viewMonth = month;
    const cur = parseDateKey(selectedDate);
    const lastDay = new Date(year, month + 1, 0).getDate();
    selectedDate = toDateKey(new Date(year, month, Math.min(cur.getDate(), lastDay)));
    renderAll();
  }
  el.monthSelect.addEventListener("change", () => {
    setViewedMonth(viewYear, Number(el.monthSelect.value));
  });
  el.yearSelect.addEventListener("change", () => {
    setViewedMonth(Number(el.yearSelect.value), viewMonth);
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
      btn.dataset.dateKey = key;
      if (key === toDateKey(today)) btn.classList.add("today");
      if (key === selectedDate) btn.classList.add("selected");

      const num = document.createElement("span");
      num.textContent = String(day);
      btn.appendChild(num);

      const dayTasks = tasksForDate(key);
      if (dayTasks.length > 0) {
        const dotsWrap = document.createElement("span");
        dotsWrap.className = "cal-day-dots";
        const cats = [...new Set(dayTasks.map((t) => t.category || "other"))];
        cats.slice(0, 3).forEach((cat, i) => {
          const dot = document.createElement("span");
          if (i === 2 && cats.length > 3) {
            dot.className = "cal-day-dot more";
            dot.textContent = `+${cats.length - 2}`;
          } else {
            dot.className = "cal-day-dot";
            dot.style.setProperty("--dot-color", catInfo(cat).color);
          }
          dotsWrap.appendChild(dot);
        });
        btn.appendChild(dotsWrap);
      }

      if (armedRescheduleTaskId) btn.classList.add("reschedule-target");
      btn.addEventListener("click", () => {
        if (armedRescheduleTaskId) {
          const id = armedRescheduleTaskId;
          disarmReschedule();
          rescheduleTask(id, key);
          return;
        }
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
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.notes || "").toLowerCase().includes(q) || (t.tag || "").toLowerCase().includes(q));
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
    const opts = categories.map((c) => ({ key: c.key, label: c.label, color: c.color }));
    renderChipGroup(el.categoryChips, opts, activeCategories, () => { saveFilters(); renderCurrentView(); });
  }
  function renderPriorityChips() {
    const opts = Object.entries(PRIORITIES).map(([key, info]) => ({ key, label: info.label, color: info.color }));
    renderChipGroup(el.priorityChips, opts, activePriorities, () => { saveFilters(); renderCurrentView(); });
  }

  // ---------- Sheet header (date/status), shared across views ----------
  function updateSheetHeader() {
    const dateObj = parseDateKey(selectedDate);
    const fullDateStr = `${FULL_DAY_NAMES[dateObj.getDay()]}, ${MONTHS[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
    el.sheetDateFull.textContent = fullDateStr;
  }
  function filtersAreActive() {
    return Boolean(searchQuery.trim()) || activeCategories.size > 0 || activePriorities.size > 0;
  }
  // The badge counts what is actually on screen. It used to count the day's
  // whole list while the view showed the filtered one, so a search that matched
  // nothing left an empty page still claiming "1/1 done today" -- which reads
  // like the app lost the entry rather than like a filter hiding it.
  function updateViewStatusBadge() {
    let done = 0, shown = 0, total = 0, unit = "done today";
    if (currentView === "week") {
      unit = "done this week";
      const weekStart = getWeekStart(selectedDate);
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart); d.setDate(d.getDate() + i);
        const key = toDateKey(d);
        total += tasksForDate(key).length;
        getVisibleTasks(key).forEach((t) => { shown++; if (isDoneOn(t, key)) done++; });
      }
    } else if (currentView === "month") {
      unit = "done this month";
      const sel = parseDateKey(selectedDate);
      const days = new Date(sel.getFullYear(), sel.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const key = toDateKey(new Date(sel.getFullYear(), sel.getMonth(), d));
        total += tasksForDate(key).length;
        getVisibleTasks(key).forEach((t) => { shown++; if (isDoneOn(t, key)) done++; });
      }
    } else if (currentView === "board") {
      unit = "tasks done";
      total = tasks.length;
      const list = getAllFilteredTasks();
      shown = list.length;
      done = list.filter((t) => isDoneOn(t, t.startDate)).length;
    } else if (currentView === "home") {
      // Home has no filter toolbar and renders the unfiltered day, so its badge
      // must not quietly answer for filters set on another tab.
      const todayKey = toDateKey(today);
      const list = tasksForDate(todayKey);
      total = shown = list.length;
      done = list.filter((t) => isDoneOn(t, todayKey)).length;
      el.viewStatusBadge.textContent = `${done}/${shown} ${unit}`;
      el.viewStatusBadge.classList.remove("is-filtered");
      el.viewStatusBadge.title = "";
      return;
    } else {
      total = tasksForDate(selectedDate).length;
      const list = getVisibleTasks(selectedDate);
      shown = list.length;
      done = list.filter((t) => isDoneOn(t, selectedDate)).length;
    }
    const hiding = filtersAreActive() && shown < total;
    el.viewStatusBadge.textContent = `${done}/${shown} ${unit}` + (hiding ? " · filtered" : "");
    el.viewStatusBadge.classList.toggle("is-filtered", hiding);
    el.viewStatusBadge.title = hiding
      ? `${total - shown} more hidden by the search or filter chips`
      : "";
  }

  // ---------- Inline subtask checklist (Day/Week views) ----------
  function syncTaskDoneFromSubtasks(task, dateKey) {
    if (!task.subtasks || !task.subtasks.length) return;
    setDoneOn(task, dateKey, task.subtasks.every((s) => s.done));
  }

  function buildInlineSubtaskChecklist(task, dateKey, wrapClass, rowClass) {
    const wrap = document.createElement("div");
    wrap.className = wrapClass;
    task.subtasks.forEach((s) => {
      const row = document.createElement("label");
      row.className = rowClass + (s.done ? " done" : "");
      row.addEventListener("click", (e) => e.stopPropagation());
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!s.done;
      cb.addEventListener("change", () => {
        s.done = cb.checked;
        row.classList.toggle("done", s.done);
        syncTaskDoneFromSubtasks(task, dateKey);
        saveTasks();
        renderAll();
      });
      const span = document.createElement("span");
      span.textContent = s.title;
      row.append(cb, span);
      wrap.appendChild(row);
    });
    return wrap;
  }

  // ---------- Day view (punch-list) ----------
  function renderSheet() {
    const allDayTasks = tasksForDate(selectedDate);
    const visibleTasks = getVisibleTasks(selectedDate);

    el.taskList.innerHTML = "";
    el.punchlist.classList.toggle("manual-sort", isManualSort());

    if (allDayTasks.length === 0) {
      el.emptyState.innerHTML = 'This day is clear.<br>Tap <strong>+ LOG ITEM</strong> to plan something.';
      el.emptyState.style.display = "block";
    } else if (visibleTasks.length === 0) {
      el.emptyState.innerHTML = "Nothing matches those filters.<br>Try clearing the search or chips above.";
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
    completeHint.innerHTML = done ? iconSvg("undo") + " UNDO" : iconSvg("check") + " DONE";
    const deleteHint = document.createElement("div");
    deleteHint.className = "task-swipe-hint delete";
    deleteHint.innerHTML = "DELETE " + iconSvg("trash");
    actions.append(completeHint, deleteHint);

    const selected = selectMode && selectedTaskIds.has(task.id);
    const row = document.createElement("div");
    row.className = "task-row" + (done ? " done" : "")
      + (isOverdue(dateKey, task, done) ? " overdue" : "")
      + (task.priority === "high" && !done ? " is-high" : "")
      + (selectMode ? " select-mode" : "") + (selected ? " selected" : "");
    applyCategoryColor(row, task.category);
    row.draggable = isManualSort() && !selectMode;
    row.addEventListener("click", () => {
      if (!selectMode) return;
      toggleTaskSelected(task.id);
      renderCurrentView();
    });

    let selectCb = null;
    if (selectMode) {
      selectCb = document.createElement("input");
      selectCb.type = "checkbox";
      selectCb.className = "task-select-checkbox";
      selectCb.checked = selected;
      selectCb.setAttribute("aria-label", "Select task");
      selectCb.addEventListener("click", (e) => e.stopPropagation());
      selectCb.addEventListener("change", () => {
        toggleTaskSelected(task.id);
        row.classList.toggle("selected", selectCb.checked);
      });
    }

    const no = document.createElement("span");
    no.className = "task-no";
    no.textContent = String(index + 1).padStart(2, "0");

    const check = document.createElement("button");
    check.type = "button";
    check.className = "task-check";
    check.setAttribute("aria-checked", done ? "true" : "false");
    check.innerHTML = done ? iconSvg("check") : "";
    check.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selectMode) { toggleTaskSelected(task.id); renderCurrentView(); return; }
      toggleDone(task.id, dateKey);
    });

    const main = document.createElement("div");
    main.className = "task-main";

    const titleRow = document.createElement("div");
    titleRow.className = "task-title-row";
    const title = document.createElement("span");
    title.className = "task-title";
    renderHighlightedText(title, task.title, searchQuery);
    titleRow.appendChild(title);
    if (task.repeat !== "none") {
      const rep = document.createElement("span");
      rep.className = "task-repeat-icon";
      rep.innerHTML = iconSvg("repeat");
      titleRow.appendChild(rep);
    }
    main.appendChild(titleRow);

    if (task.notes) {
      const notes = document.createElement("div");
      notes.className = "task-notes";
      renderHighlightedText(notes, task.notes, searchQuery);
      main.appendChild(notes);
    }

    const meta = document.createElement("div");
    meta.className = "task-meta";
    const cat = catInfo(task.category);
    const catChip = document.createElement("span");
    catChip.className = "task-cat-chip";
    catChip.style.background = cat.color;
    catChip.textContent = cat.label;
    meta.appendChild(catChip);

    if (task.tag) {
      const tagChip = document.createElement("span");
      tagChip.className = "task-tag-chip";
      applyTagColor(tagChip, task.tag);
      renderHighlightedText(tagChip, task.tag, searchQuery);
      meta.appendChild(tagChip);
    }

    meta.appendChild(buildPriorityChip(task, dateKey, done));

    if (task.subtasks && task.subtasks.length) {
      const subDone = task.subtasks.filter((s) => s.done).length;
      const subProg = document.createElement("span");
      subProg.className = "task-subtask-progress";
      subProg.innerHTML = iconSvg("checkbox") + ` ${subDone}/${task.subtasks.length}`;
      meta.appendChild(subProg);
    }
    if (task.photo) {
      const photoBadge = document.createElement("span");
      photoBadge.className = "task-subtask-progress";
      photoBadge.innerHTML = iconSvg("camera");
      meta.appendChild(photoBadge);
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
      main.appendChild(buildInlineSubtaskChecklist(task, dateKey, "task-subtask-list", "task-subtask-row"));
    }

    main.addEventListener("click", () => {
      if (row.dataset.suppressClick === "1") return;
      if (selectMode) return;
      openTaskDetail(task, dateKey);
    });

    const timeCol = document.createElement("div");
    timeCol.className = "task-time-col";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "task-edit-btn";
    editBtn.setAttribute("aria-label", "Edit task");
    editBtn.innerHTML = iconSvg("pencil");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selectMode) { toggleTaskSelected(task.id); renderCurrentView(); return; }
      openEditModal(task, dateKey);
    });
    timeCol.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "task-delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.innerHTML = iconSvg("trash");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selectMode) { toggleTaskSelected(task.id); renderCurrentView(); return; }
      requestDelete(task, dateKey);
    });
    timeCol.appendChild(deleteBtn);

    if (task.time) {
      const timeRow = document.createElement("div");
      timeRow.className = "task-time-row";
      const timeInline = document.createElement("span");
      timeInline.className = "task-time-inline";
      timeInline.textContent = timeRangeLabel(task);
      if (!done && isDueSoon(dateKey, task.time)) timeInline.classList.add("due");
      timeRow.appendChild(timeInline);
      row.appendChild(timeRow);
    }

    const line = document.createElement("div");
    line.className = "task-row-line";
    if (selectCb) line.appendChild(selectCb);
    line.append(no, check, main, timeCol);
    row.appendChild(line);

    wrap.append(actions, row);

    attachSwipe(row, task, dateKey);
    attachDrag(row, task);

    return wrap;
  }

  const RESCHEDULE_HOLD_MS = 450;

  // ---------- Reschedule "arm, then tap a date" flow ----------
  // An earlier version tracked a continuous drag from the task row to the
  // calendar. That fought the task list's native vertical scrolling
  // (touch-action: pan-y lets the browser claim vertical finger movement for
  // scrolling before JS ever gets a say, even with preventDefault) -- the
  // drag ghost would vanish almost instantly on a real phone. A long-press
  // now just "arms" the task; the next tap on any calendar day completes the
  // move. No continuous tracking, no fight with scrolling.
  function armReschedule(task) {
    armedRescheduleTaskId = task.id;
    if (navigator.vibrate) navigator.vibrate(15);
    if (!calendarOpen) el.calendarToggle.click();
    el.calendarSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    renderCalendar();
    el.rescheduleBanner.hidden = false;
    el.rescheduleBannerText.textContent = `Tap a date to move "${task.title}"`;
  }
  function disarmReschedule() {
    armedRescheduleTaskId = null;
    el.rescheduleBanner.hidden = true;
    renderCalendar();
  }
  el.rescheduleCancelBtn.addEventListener("click", disarmReschedule);

  function attachSwipe(row, task, dateKey) {
    let startX = 0, startY = 0, dx = 0, dragging = false, decided = false, isHorizontal = false;
    const THRESH = 64;
    let longPressTimer = null;

    function clearLongPress() {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    row.addEventListener("pointerdown", (e) => {
      if (isManualSort() || selectMode) return;
      if (e.target.closest(".task-check, .task-edit-btn, .task-delete-btn, .task-select-checkbox")) return;
      startX = e.clientX; startY = e.clientY; dx = 0;
      dragging = true; decided = false; isHorizontal = false;
      clearLongPress();
      longPressTimer = setTimeout(() => {
        if (!dragging) return;
        decided = true;
        row.dataset.suppressClick = "1";
        armReschedule(task);
      }, RESCHEDULE_HOLD_MS);
    });
    row.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dxRaw = e.clientX - startX;
      const dyRaw = e.clientY - startY;
      if (!decided) {
        if (Math.abs(dxRaw) > 8 || Math.abs(dyRaw) > 8) {
          decided = true;
          isHorizontal = Math.abs(dxRaw) > Math.abs(dyRaw);
          clearLongPress();
        } else return;
      }
      if (!isHorizontal) return;
      dx = Math.max(-100, Math.min(100, dxRaw));
      row.style.transform = `translateX(${dx}px)`;
      row.dataset.suppressClick = "1";
    });
    function end() {
      clearLongPress();
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
    // Belt-and-suspenders alongside the CSS touch-callout/user-select rules:
    // some mobile browsers still fire their native long-press context menu
    // (Reload/Download/Share/...) on a ~500ms hold regardless, which would
    // hijack the reschedule gesture. Block it outright on task rows.
    row.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  function attachDrag(row, task) {
    row.addEventListener("dragstart", (e) => {
      if (!isManualSort()) { e.preventDefault(); return; }
      row.classList.add("dragging");
      e.dataTransfer.setData("text/plain", task.id);
      e.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
    });
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

  function rescheduleTask(id, newDateKey) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.startDate === newDateKey) return;
    const oldDate = task.startDate;
    const doMove = () => {
      task.startDate = newDateKey;
      saveTasks();
      renderAll();
      showSnackbar(`"${task.title}" moved to ${formatDateDisplay(newDateKey)}`, () => {
        task.startDate = oldDate;
        saveTasks();
        renderAll();
      });
    };
    if (task.repeat !== "none") {
      showConfirm(`"${task.title}" repeats. Move the whole series to start on ${formatDateDisplay(newDateKey)}?`, [
        { label: "Move series", onClick: doMove },
        { label: "Cancel", cancel: true },
      ]);
    } else {
      doMove();
    }
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
  // Stronger than "due soon": a past date entirely (regardless of time), or
  // today with a scheduled time more than 30 minutes gone -- picking up
  // right where the "due soon" window (-30 to +15 min) leaves off.
  function isOverdue(dateKey, task, doneFlag) {
    if (doneFlag) return false;
    const todayKey = toDateKey(new Date());
    if (dateKey < todayKey) return true;
    if (dateKey > todayKey || !task.time) return false;
    const now = new Date();
    const [h, m] = task.time.split(":").map(Number);
    const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    return (due - now) / 60000 < -30;
  }

  // Overdue tasks read as "URGENT!!!" regardless of their real priority --
  // purely a display override so the badge grabs attention, without ever
  // touching task.priority itself (filters, stats, and the original
  // priority all stay intact once the task is done or rescheduled).
  function buildPriorityChip(task, dateKey, doneFlag) {
    const overdue = isOverdue(dateKey, task, doneFlag);
    const pri = document.createElement("span");
    pri.className = "task-priority" + (overdue ? " urgent" : "");
    const priDot = document.createElement("span");
    priDot.className = "task-priority-dot " + (overdue ? "urgent" : task.priority);
    pri.append(priDot, document.createTextNode(overdue ? "URGENT!!!" : task.priority));
    return pri;
  }

  function toggleDone(id, dateKey) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const newDone = !isDoneOn(t, dateKey);
    if (t.subtasks && t.subtasks.length) {
      if (newDone) {
        // Remember which subtasks were already checked before force-completing
        // them all, so unchecking the main box can restore exactly that state
        // instead of blindly unchecking everything.
        t.subtaskSnapshot = t.subtasks.map((s) => !!s.done);
        t.subtasks.forEach((s) => { s.done = true; });
      } else {
        if (t.subtaskSnapshot && t.subtaskSnapshot.length === t.subtasks.length) {
          t.subtasks.forEach((s, i) => { s.done = t.subtaskSnapshot[i]; });
        } else {
          t.subtasks.forEach((s) => { s.done = false; });
        }
        delete t.subtaskSnapshot;
      }
    }
    setDoneOn(t, dateKey, newDone);
    saveTasks();
    renderAll();
  }

  // ---------- Month view ----------
  // A whole month at once, which nothing in the app could show before: Day and
  // Timeline are one date, Week is seven, and Board drops the calendar
  // entirely. Chips are coloured by CLIENT/PROJECT rather than by category --
  // over a month the useful question is whose work the time went to, not
  // work-versus-personal. Untagged tasks fall back to their category colour.
  const MONTH_CHIPS_PER_DAY = 3;
  function renderMonthView() {
    if (!el.monthWeekdays.childElementCount) {
      DAY_NAMES.forEach((d) => {
        const s = document.createElement("span");
        s.textContent = d;
        el.monthWeekdays.appendChild(s);
      });
    }
    el.monthGrid.innerHTML = "";

    const sel = parseDateKey(selectedDate);
    const year = sel.getFullYear();
    const month = sel.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const lead = first.getDay();
    // Whole weeks only, so the grid keeps its columns: pad back to the Sunday
    // before the 1st and forward to the Saturday after the last day.
    const cells = Math.ceil((lead + daysInMonth) / 7) * 7;
    const todayKey = toDateKey(today);

    for (let i = 0; i < cells; i++) {
      const d = new Date(year, month, i - lead + 1);
      const key = toDateKey(d);
      const inMonth = d.getMonth() === month;
      const list = getVisibleTasks(key);

      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "month-cell"
        + (inMonth ? "" : " outside")
        + (key === todayKey ? " today" : "")
        + (key === selectedDate ? " selected" : "");
      cell.dataset.dateKey = key;
      cell.setAttribute("aria-label",
        `${formatDateDisplay(key)} — ${list.length === 1 ? "1 item" : list.length + " items"}`);

      const head = document.createElement("div");
      head.className = "month-cell-head";
      const num = document.createElement("span");
      num.className = "month-cell-num";
      num.textContent = String(d.getDate());
      head.appendChild(num);
      if (list.length) {
        const doneN = list.filter((t) => isDoneOn(t, key)).length;
        const count = document.createElement("span");
        count.className = "month-cell-count" + (doneN === list.length ? " all-done" : "");
        count.textContent = `${doneN}/${list.length}`;
        head.appendChild(count);
      }
      cell.appendChild(head);

      if (list.length) {
        const chips = document.createElement("div");
        chips.className = "month-cell-chips";
        list.slice(0, MONTH_CHIPS_PER_DAY).forEach((t) => {
          const chip = document.createElement("span");
          const done = isDoneOn(t, key);
          chip.className = "month-chip" + (done ? " done" : "")
            + (isOverdue(key, t, done) ? " overdue" : "");
          if (t.tag) {
            chip.classList.add("tagged");
            applyTagColor(chip, t.tag);
          } else {
            chip.style.setProperty("--cat-color", catInfo(t.category).color);
          }
          // The title carries the full text: the chip is clipped by design, and
          // a hover/long-press should still be able to answer "which one?".
          chip.title = (t.time ? formatTimeDisplay(t.time) + " · " : "") + t.title;
          const label = document.createElement("span");
          label.className = "month-chip-label";
          label.textContent = t.title;
          chip.appendChild(label);
          chips.appendChild(chip);
        });
        if (list.length > MONTH_CHIPS_PER_DAY) {
          const more = document.createElement("span");
          more.className = "month-more";
          more.textContent = `+${list.length - MONTH_CHIPS_PER_DAY} more`;
          chips.appendChild(more);
        }
        cell.appendChild(chips);
      }

      cell.addEventListener("click", () => {
        selectedDate = key;
        // Selecting a day outside the current month follows it, the way the
        // sidebar calendar does, rather than leaving the grid on a month the
        // selection no longer belongs to.
        if (!inMonth) setViewedMonth(d.getFullYear(), d.getMonth());
        else renderAll();
        if (list.length) openDayDetail(key);
      });
      el.monthGrid.appendChild(cell);
    }
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
        empty.textContent = allDay.length ? "Hidden by filters" : "Clear";
        list.appendChild(empty);
      } else {
        dayTasks.slice(0, 6).forEach((t) => {
          const row = document.createElement("div");
          const tDone = isDoneOn(t, key);
          const tOverdue = isOverdue(key, t, tDone);
          row.className = "week-task-row" + (tDone ? " done" : "") + (tOverdue ? " overdue" : "");
          const dot = document.createElement("span");
          dot.className = "week-task-cat-dot";
          dot.style.background = catInfo(t.category).color;
          const ttl = document.createElement("span");
          ttl.className = "week-task-title";
          renderHighlightedText(ttl, t.title, searchQuery);
          if (t.time) {
            const time = document.createElement("span");
            time.className = "week-task-time";
            time.textContent = timeRangeLabel(t);
            row.append(dot, time, ttl);
          } else {
            row.append(dot, ttl);
          }
          if (tOverdue) {
            const urgent = document.createElement("span");
            urgent.className = "week-task-urgent-badge";
            urgent.textContent = "URGENT!!!";
            row.appendChild(urgent);
          }
          list.appendChild(row);
          if (t.subtasks && t.subtasks.length) {
            list.appendChild(buildInlineSubtaskChecklist(t, key, "week-task-subtasks", "week-task-subtask-row"));
          }
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
  // Overlay panels scroll inside themselves, and a hidden element keeps its
  // scrollTop. Without an explicit reset a panel reopens exactly where it was
  // last left, which clips its own top rows out of view. Whether that was
  // visible depended on window height and on how far focus() happened to drag
  // the container back, so it looked intermittent rather than broken.
  function showOverlay(overlayEl, panelEl) {
    overlayEl.hidden = false;
    if (panelEl) panelEl.scrollTop = 0;
  }

  function openDayDetail(dateKey) {
    dayDetailMode = "day";
    dayDetailDateKey = dateKey;
    dayDetailTask = null;
    renderDayDetail();
    el.dayDetailViewFull.hidden = false;
    showOverlay(el.dayDetailOverlay, el.dayDetailBox);
    pushOverlayState();
  }
  function openTaskDetail(task, dateKey) {
    dayDetailMode = "task";
    dayDetailDateKey = dateKey;
    dayDetailTask = task;
    renderDayDetail();
    el.dayDetailViewFull.hidden = true;
    showOverlay(el.dayDetailOverlay, el.dayDetailBox);
    pushOverlayState();
  }
  function closeDayDetail() {
    el.dayDetailOverlay.hidden = true;
    dayDetailDateKey = null;
    dayDetailTask = null;
  }
  function renderDayDetail() {
    el.dayDetailBody.innerHTML = "";

    if (dayDetailMode === "task") {
      if (!dayDetailTask || !tasks.includes(dayDetailTask) || !occursOn(dayDetailTask, dayDetailDateKey)) { closeDayDetail(); return; }
      el.dayDetailTitle.textContent = dayDetailTask.title;
      el.dayDetailBody.appendChild(buildDayDetailCard(dayDetailTask, dayDetailDateKey, false));
      el.dayDetailEditBtn.hidden = false;
      el.dayDetailDeleteBtn.hidden = false;
      return;
    }

    el.dayDetailEditBtn.hidden = true;
    el.dayDetailDeleteBtn.hidden = true;
    const dateObj = parseDateKey(dayDetailDateKey);
    el.dayDetailTitle.textContent = `${DAY_NAMES[dateObj.getDay()]}, ${MONTHS[dateObj.getMonth()].slice(0, 3)} ${dateObj.getDate()}`;
    const list = tasksForDate(dayDetailDateKey).sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
    if (list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "day-detail-empty";
      empty.textContent = "This day is clear — nothing scheduled.";
      el.dayDetailBody.appendChild(empty);
      return;
    }
    list.forEach((task) => el.dayDetailBody.appendChild(buildDayDetailCard(task, dayDetailDateKey, true)));
  }
  function buildDayDetailCard(task, dateKey, showActions) {
    const done = isDoneOn(task, dateKey);
    const card = document.createElement("div");
    card.className = "day-detail-card"
      + (isOverdue(dateKey, task, done) ? " overdue" : "");
    applyCategoryColor(card, task.category);

    const head = document.createElement("div");
    head.className = "day-detail-card-head";
    const check = document.createElement("button");
    check.type = "button";
    check.className = "task-check";
    check.setAttribute("aria-checked", done ? "true" : "false");
    check.setAttribute("aria-label", done ? "Mark as not done" : "Mark as done");
    check.innerHTML = done ? iconSvg("check") : "";
    check.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDone(task.id, dateKey);
    });
    head.appendChild(check);
    if (task.time) {
      const time = document.createElement("span");
      time.className = "day-detail-card-time";
      time.textContent = timeRangeLabel(task);
      head.appendChild(time);
    }
    const title = document.createElement("span");
    title.className = "day-detail-card-title" + (done ? " done" : "");
    title.textContent = task.title;
    head.appendChild(title);
    card.appendChild(head);

    const meta = document.createElement("div");
    meta.className = "day-detail-card-meta";
    const cat = catInfo(task.category);
    const catChip = document.createElement("span");
    catChip.className = "task-cat-chip";
    catChip.style.background = cat.color;
    catChip.textContent = cat.label;
    meta.appendChild(catChip);
    if (task.tag) {
      const tagChip = document.createElement("span");
      tagChip.className = "task-tag-chip";
      applyTagColor(tagChip, task.tag);
      tagChip.textContent = task.tag;
      meta.appendChild(tagChip);
    }
    meta.appendChild(buildPriorityChip(task, dateKey, done));
    if (task.repeat && task.repeat !== "none") {
      const rep = document.createElement("span");
      rep.className = "task-priority";
      rep.innerHTML = iconSvg("repeat") + " " + repeatLabel(task);
      meta.appendChild(rep);
    }
    if (task.subtasks && task.subtasks.length) {
      const subCount = document.createElement("span");
      subCount.className = "task-priority";
      const doneCount = task.subtasks.filter((s) => s.done).length;
      subCount.textContent = `${doneCount}/${task.subtasks.length} subtasks`;
      meta.appendChild(subCount);
    }
    card.appendChild(meta);

    if (task.notes) {
      const notes = document.createElement("div");
      notes.className = "task-notes day-detail-card-notes";
      notes.textContent = task.notes;
      card.appendChild(notes);
    }

    if (task.photo) {
      const photo = document.createElement("img");
      photo.className = "day-detail-card-photo";
      setPhotoSrc(photo, task.photo);
      photo.alt = "Attached photo for " + task.title;
      photo.title = "Open photo";
      photo.addEventListener("click", (e) => {
        e.stopPropagation();
        openLightbox(task.photo, "Attached photo for " + task.title);
      });
      card.appendChild(photo);
    }

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
          syncTaskDoneFromSubtasks(task, dateKey);
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

    if (showActions) {
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
    }

    return card;
  }
  el.closeDayDetail.addEventListener("click", closeDayDetail);
  el.dayDetailEditBtn.addEventListener("click", () => {
    if (!dayDetailTask) return;
    const task = dayDetailTask, dateKey = dayDetailDateKey;
    closeDayDetail();
    openEditModal(task, dateKey);
  });
  el.dayDetailDeleteBtn.addEventListener("click", () => {
    if (!dayDetailTask) return;
    requestDelete(dayDetailTask, dayDetailDateKey);
  });
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
      empty.textContent = "This day is clear — nothing scheduled.";
      el.timelineView.appendChild(empty);
    }
  }
  function buildTimelineTask(t, showTime) {
    const done = isDoneOn(t, selectedDate);
    const item = document.createElement("div");
    item.className = "timeline-task" + (done ? " done" : "")
      + (isOverdue(selectedDate, t, done) ? " overdue" : "");
    applyCategoryColor(item, t.category);
    if (showTime) {
      const time = document.createElement("span");
      time.className = "timeline-task-time";
      time.textContent = timeRangeLabel(t);
      item.appendChild(time);
    }
    const ttl = document.createElement("span");
    ttl.className = "timeline-task-title";
    renderHighlightedText(ttl, t.title, searchQuery);
    item.appendChild(ttl);
    item.addEventListener("click", () => openTaskDetail(t, selectedDate));
    return item;
  }

  // ---------- Home dashboard (landing view) ----------
  const HOME_OVERDUE_LOOKBACK_DAYS = 30;
  const HOME_OVERDUE_SHOWN = 20;
  const HOME_UPCOMING_LOOKAHEAD_DAYS = 7;
  const HOME_UPCOMING_SHOWN = 10;

  // One entry per *task*, not per missed occurrence. A repeating task that has
  // gone uncompleted for weeks would otherwise push one identical row per day
  // (and inflate the overdue stat to match), burying the one-off tasks that
  // actually need attention. Walking most-recent-day-first means the first
  // sighting of a task is its latest overdue date; later sightings only bump
  // missedCount.
  function getHomeOverdueEntries() {
    // { task, dateKey, missedDateKeys }, most recent day first. dateKey is the
    // latest missed day; missedDateKeys is every missed day within the lookback
    // (one element for a one-off, potentially many for a repeating task).
    const entries = [];
    const byTaskId = new Map();
    const cursor = new Date(today);
    cursor.setDate(cursor.getDate() - 1);
    for (let i = 0; i < HOME_OVERDUE_LOOKBACK_DAYS; i++) {
      const key = toDateKey(cursor);
      tasksForDate(key).forEach((t) => {
        if (isDoneOn(t, key)) return;
        const seen = byTaskId.get(t.id);
        if (seen) { seen.missedDateKeys.push(key); return; }
        const entry = { task: t, dateKey: key, missedDateKeys: [key] };
        byTaskId.set(t.id, entry);
        entries.push(entry);
      });
      cursor.setDate(cursor.getDate() - 1);
    }
    return entries;
  }
  function getHomeUpcomingEntries() {
    const entries = []; // { task, dateKey }, soonest first
    const cursor = new Date(today);
    cursor.setDate(cursor.getDate() + 1);
    for (let i = 0; i < HOME_UPCOMING_LOOKAHEAD_DAYS; i++) {
      const key = toDateKey(cursor);
      tasksForDate(key)
        .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"))
        .forEach((t) => entries.push({ task: t, dateKey: key }));
      cursor.setDate(cursor.getDate() + 1);
    }
    return entries;
  }
  function renderHomeSection(sectionEl, listEl, entries, emptyText, capAt) {
    listEl.innerHTML = "";
    if (entries.length === 0) {
      if (emptyText) {
        const empty = document.createElement("p");
        empty.className = "board-empty home-empty";
        empty.textContent = emptyText;
        listEl.appendChild(empty);
      } else {
        sectionEl.hidden = true;
        return;
      }
    }
    sectionEl.hidden = false;
    const shown = capAt ? entries.slice(0, capAt) : entries;
    shown.forEach(({ task, dateKey, missedDateKeys }) =>
      listEl.appendChild(buildBoardTaskRow(task, dateKey, missedDateKeys ? missedDateKeys.length : 0, true)));
    if (capAt && entries.length > capAt) {
      const more = document.createElement("p");
      more.className = "home-more";
      more.textContent = `+${entries.length - capAt} more`;
      listEl.appendChild(more);
    }
  }
  // Clears the whole Overdue backlog in one tap. One-off tasks are genuinely
  // moved to today. Repeating tasks are NOT moved -- shifting startDate would
  // drag every future occurrence along with it -- so their missed past days are
  // marked skipped instead, which silences the backlog while leaving today's
  // and all future runs on schedule.
  function moveAllOverdueToToday() {
    const todayKey = toDateKey(today);
    const movedOneOffs = [];   // { task, oldDate }
    const clearedRepeats = []; // { task, dateKeys }

    getHomeOverdueEntries().forEach(({ task, missedDateKeys }) => {
      if (task.repeat === "none") {
        if (task.startDate === todayKey) return;
        movedOneOffs.push({ task, oldDate: task.startDate });
        task.startDate = todayKey;
      } else {
        const toSkip = missedDateKeys.filter((k) => !(task.skipped && task.skipped[k]));
        if (!toSkip.length) return;
        task.skipped = task.skipped || {};
        toSkip.forEach((k) => { task.skipped[k] = true; });
        clearedRepeats.push({ task, dateKeys: toSkip });
      }
    });

    if (!movedOneOffs.length && !clearedRepeats.length) return;
    saveTasks();
    renderAll();

    const parts = [];
    if (movedOneOffs.length) parts.push(`${movedOneOffs.length} moved to today`);
    if (clearedRepeats.length) parts.push(`${clearedRepeats.length} recurring cleared`);
    showSnackbar(parts.join(" · "), () => {
      movedOneOffs.forEach(({ task, oldDate }) => { task.startDate = oldDate; });
      clearedRepeats.forEach(({ task, dateKeys }) => {
        dateKeys.forEach((k) => { delete task.skipped[k]; });
      });
      saveTasks();
      renderAll();
    });
  }
  el.moveAllOverdueBtn.addEventListener("click", moveAllOverdueToToday);

  function renderHomeView() {
    const todayKey = toDateKey(today);
    const overdue = getHomeOverdueEntries();
    const todayList = tasksForDate(todayKey).sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
    const todayEntries = todayList.map((t) => ({ task: t, dateKey: todayKey }));
    const upcoming = getHomeUpcomingEntries();

    renderHomeSection(el.homeOverdueSection, el.homeOverdueList, overdue, null, HOME_OVERDUE_SHOWN);
    renderHomeSection(el.homeTodaySection, el.homeTodayList, todayEntries, "Nothing planned for today yet. Tap + to add your first task.", null);
    renderHomeSection(el.homeUpcomingSection, el.homeUpcomingList, upcoming, "The week ahead is clear. A good time to plan.", HOME_UPCOMING_SHOWN);

    const todayDone = todayList.filter((t) => isDoneOn(t, todayKey)).length;
    const todayLeft = todayList.length - todayDone;
    renderHomeGreeting({ overdue: overdue.length, todayLeft, todayTotal: todayList.length, upcoming: upcoming.length });

    el.homeStats.innerHTML = "";
    const stats = [
      // Overdue is the one number that demands action, so it goes loud when it
      // has a value and stays quiet at zero. The other two are always neutral.
      { value: String(overdue.length), label: "overdue", target: el.homeOverdueSection,
        tone: overdue.length > 0 ? "danger" : "muted" },
      { value: `${todayDone}/${todayList.length}`, label: "today", target: el.homeTodaySection,
        tone: todayList.length > 0 && todayDone === todayList.length ? "good" : "" },
      { value: String(upcoming.length), label: "upcoming (7d)", target: el.homeUpcomingSection, tone: "" },
    ];
    stats.forEach((s) => {
      const box = document.createElement("button");
      box.type = "button";
      box.className = "home-stat" + (s.tone ? " " + s.tone : "");
      const v = document.createElement("span"); v.className = "home-stat-value"; v.textContent = s.value;
      const l = document.createElement("span"); l.className = "home-stat-label"; l.textContent = s.label;
      box.append(v, l);
      box.addEventListener("click", () => {
        if (s.target.hidden) return;
        s.target.scrollIntoView({ behavior: "smooth", block: "start" });
        s.target.classList.remove("is-flashed");
        void s.target.offsetWidth;
        s.target.classList.add("is-flashed");
      });
      el.homeStats.appendChild(box);
    });
  }

  function renderHomeGreeting({ overdue, todayLeft, todayTotal, upcoming }) {
    const h = new Date().getHours();
    const partOfDay = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    const d = parseDateKey(toDateKey(today));
    el.homeGreeting.textContent = `${partOfDay} — ${DAY_NAMES[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;

    // One plain sentence for the whole day, leading with whatever matters most.
    let sub;
    if (overdue > 0) {
      sub = `${overdue} overdue item${overdue > 1 ? "s" : ""} need${overdue > 1 ? "" : "s"} attention.`;
    } else if (todayTotal === 0) {
      sub = upcoming > 0
        ? `Nothing due today. ${upcoming} coming up this week.`
        : "Nothing scheduled. Enjoy the clear day.";
    } else if (todayLeft === 0) {
      sub = "Everything for today is done. Nice work.";
    } else {
      sub = `${todayLeft} of ${todayTotal} still to go today.`;
    }
    el.homeGreetingSub.textContent = sub;
  }

  // ---------- Board view (tasks grouped by client/project tag, across all dates) ----------
  function getAllFilteredTasks() {
    let list = tasks.slice();
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.notes || "").toLowerCase().includes(q) || (t.tag || "").toLowerCase().includes(q));
    if (activeCategories.size) list = list.filter((t) => activeCategories.has(t.category));
    if (activePriorities.size) list = list.filter((t) => activePriorities.has(t.priority));
    return list;
  }
  function renderBoardView() {
    el.boardView.innerHTML = "";
    const list = getAllFilteredTasks();
    if (list.length === 0) {
      const empty = document.createElement("p");
      empty.className = "board-empty";
      empty.textContent = tasks.length === 0
        ? "No tasks yet. Add one and it will appear here, grouped by client or project."
        : "Nothing matches those filters. Try clearing the search or chips above.";
      el.boardView.appendChild(empty);
      return;
    }

    const groups = new Map();
    list.forEach((t) => {
      const key = (t.tag || "").trim();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    });
    const tagKeys = Array.from(groups.keys()).filter((k) => k !== "").sort((a, b) => a.localeCompare(b));
    if (groups.has("")) tagKeys.push("");

    tagKeys.forEach((tagKey) => {
      const groupTasks = groups.get(tagKey).sort((a, b) =>
        a.startDate.localeCompare(b.startDate) || (a.time || "99:99").localeCompare(b.time || "99:99"));
      el.boardView.appendChild(buildBoardGroup(tagKey || "No client / project", groupTasks, tagKey));
    });
  }
  function buildBoardGroup(title, groupTasks, tagKey) {
    const section = document.createElement("div");
    section.className = "board-group";

    const head = document.createElement("div");
    head.className = "board-group-head";
    const ttl = document.createElement("span");
    ttl.className = "board-group-title";
    if (tagKey) {
      // Same colour the tag chips use, so a project is recognisable whether you
      // are looking at a row or at its Board heading.
      const dot = document.createElement("span");
      dot.className = "board-group-dot";
      applyTagColor(dot, tagKey);
      ttl.appendChild(dot);
    }
    ttl.appendChild(document.createTextNode(title));
    head.appendChild(ttl);
    const doneCount = groupTasks.filter((t) => isDoneOn(t, t.startDate)).length;
    const count = document.createElement("span");
    count.className = "board-group-count";
    count.textContent = `${doneCount}/${groupTasks.length} done`;
    head.appendChild(count);
    section.appendChild(head);

    const pct = Math.round((doneCount / groupTasks.length) * 100);
    const bar = document.createElement("div");
    bar.className = "week-day-bar board-group-bar";
    const fill = document.createElement("span");
    fill.style.width = pct + "%";
    bar.appendChild(fill);
    section.appendChild(bar);

    // Rollup line: at a glance, how far along the project is, what is still
    // open, what has already slipped, and when the next piece is due.
    const todayKey = toDateKey(today);
    const open = groupTasks.filter((t) => !isDoneOn(t, t.startDate));
    const overdueCount = open.filter((t) => isOverdue(t.startDate, t, false)).length;
    const nextDue = open
      .filter((t) => t.startDate >= todayKey)
      .map((t) => t.startDate)
      .sort()[0];

    const meta = document.createElement("div");
    meta.className = "board-group-meta";
    const addStat = (text, tone) => {
      const s = document.createElement("span");
      s.className = "board-group-stat" + (tone ? " " + tone : "");
      s.textContent = text;
      meta.appendChild(s);
    };
    addStat(pct + "% complete");
    if (open.length) addStat(`${open.length} left`);
    if (overdueCount) addStat(`${overdueCount} overdue`, "danger");
    if (nextDue) {
      const d = parseDateKey(nextDue);
      addStat(`next: ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`);
    }
    if (!open.length) addStat("all done", "good");
    section.appendChild(meta);

    const list = document.createElement("div");
    list.className = "board-group-tasks";
    groupTasks.forEach((t) => list.appendChild(buildBoardTaskRow(t)));
    section.appendChild(list);

    return section;
  }
  // showTag is on for Home, where rows come from every project at once, and off
  // for Board, where the group heading already names the project.
  function buildBoardTaskRow(task, dateKey, missedCount, showTag) {
    dateKey = dateKey || task.startDate;
    const done = isDoneOn(task, dateKey);
    const row = document.createElement("div");
    row.className = "board-task-row" + (done ? " done" : "")
      + (isOverdue(dateKey, task, done) ? " overdue" : "")
      + (task.priority === "high" && !done ? " is-high" : "");
    applyCategoryColor(row, task.category);

    const check = document.createElement("button");
    check.type = "button";
    check.className = "task-check";
    check.setAttribute("aria-checked", done ? "true" : "false");
    check.innerHTML = done ? iconSvg("check") : "";
    check.addEventListener("click", (e) => { e.stopPropagation(); toggleDone(task.id, dateKey); });
    row.appendChild(check);

    const main = document.createElement("div");
    main.className = "board-task-main";
    const titleRow = document.createElement("div");
    titleRow.className = "board-task-title-row";
    const ttl = document.createElement("span");
    ttl.className = "board-task-title" + (done ? " done" : "");
    renderHighlightedText(ttl, task.title, searchQuery);
    titleRow.appendChild(ttl);
    if (task.repeat !== "none") {
      const rep = document.createElement("span");
      rep.className = "task-repeat-icon";
      rep.innerHTML = iconSvg("repeat");
      titleRow.appendChild(rep);
    }
    main.appendChild(titleRow);

    const meta = document.createElement("div");
    meta.className = "board-task-meta";
    const dateObj = parseDateKey(dateKey);
    const dateSpan = document.createElement("span");
    dateSpan.className = "task-priority";
    dateSpan.textContent = `${MONTHS[dateObj.getMonth()].slice(0, 3)} ${dateObj.getDate()}` + (task.time ? `, ${timeRangeLabel(task)}` : "");
    meta.appendChild(dateSpan);
    const cat = catInfo(task.category);
    const catChip = document.createElement("span");
    catChip.className = "task-cat-chip";
    catChip.style.background = cat.color;
    catChip.textContent = cat.label;
    meta.appendChild(catChip);
    if (showTag && task.tag) {
      const tagChip = document.createElement("span");
      tagChip.className = "task-tag-chip";
      applyTagColor(tagChip, task.tag);
      tagChip.textContent = task.tag;
      meta.appendChild(tagChip);
    }
    meta.appendChild(buildPriorityChip(task, dateKey, done));
    if (missedCount > 1) {
      const missed = document.createElement("span");
      missed.className = "task-missed-chip";
      missed.textContent = `missed ${missedCount}×`;
      meta.appendChild(missed);
    }
    if (task.subtasks && task.subtasks.length) {
      const subDone = task.subtasks.filter((s) => s.done).length;
      const subProg = document.createElement("span");
      subProg.className = "task-subtask-progress";
      subProg.innerHTML = iconSvg("checkbox") + ` ${subDone}/${task.subtasks.length}`;
      meta.appendChild(subProg);
    }
    main.appendChild(meta);
    row.appendChild(main);

    row.addEventListener("click", () => openTaskDetail(task, dateKey));
    return row;
  }

  // ---------- Insights ----------
  // A streak counts consecutive days on which everything planned got finished.
  // Two rules matter for it to feel fair:
  //  - A day with nothing scheduled is neutral, not a failure. Skipping it
  //    means a normal weekend doesn't wipe out a week of finished work.
  //  - A long gap should still end the streak, so empty days only carry it
  //    across up to a week.
  const STREAK_MAX_EMPTY_GAP = 7;

  function computeStreak() {
    const todayKey = toDateKey(today);
    const todayList = tasksForDate(todayKey);
    const todayComplete = todayList.length > 0 && todayList.every((t) => isDoneOn(t, todayKey));
    const cursor = new Date(today);
    // An unfinished today doesn't break a streak built up to yesterday -- the
    // day isn't over yet -- so start counting from yesterday in that case.
    if (!todayComplete) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    let emptyRun = 0;
    for (let i = 0; i < 365; i++) {
      const key = toDateKey(cursor);
      const dayList = tasksForDate(key);
      if (dayList.length === 0) {
        if (++emptyRun > STREAK_MAX_EMPTY_GAP) break;
      } else {
        if (!dayList.every((t) => isDoneOn(t, key))) break;
        emptyRun = 0;
        streak++;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  // Returns the last 7 days oldest-first so the chart reads left-to-right.
  function getWeekCompletion() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const list = tasksForDate(key);
      const done = list.filter((t) => isDoneOn(t, key)).length;
      days.push({
        key,
        letter: DAY_NAMES[d.getDay()][0],
        total: list.length,
        done,
        pct: list.length ? Math.round((done / list.length) * 100) : 0,
        isToday: i === 0,
      });
    }
    return days;
  }

  function renderSparkline(days) {
    el.insightSparkline.innerHTML = "";
    days.forEach((day) => {
      // Each bar carries its weekday letter underneath. Without it the chart
      // is undecodable on touch, where the hover tooltip never appears.
      const col = document.createElement("div");
      col.className = "spark-col";
      const bar = document.createElement("div");
      bar.className = "spark-bar" + (day.isToday ? " is-today" : "");
      bar.title = day.total
        ? `${day.key}: ${day.done} of ${day.total} done (${day.pct}%)`
        : `${day.key}: nothing scheduled`;
      const fill = document.createElement("span");
      fill.style.height = Math.max(day.pct, day.total ? 4 : 0) + "%";
      bar.appendChild(fill);
      const label = document.createElement("span");
      label.className = "spark-day" + (day.isToday ? " is-today" : "");
      label.textContent = day.letter;
      col.append(bar, label);
      el.insightSparkline.appendChild(col);
    });
  }

  function updateInsights() {
    const todayKey = toDateKey(today);
    const todayList = tasksForDate(todayKey);
    const done = todayList.filter((t) => isDoneOn(t, todayKey)).length;
    const total = todayList.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const offset = RING_CIRCUMFERENCE * (1 - pct / 100);
    el.insightRingValue.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    el.insightRingValue.style.strokeDashoffset = String(offset);
    el.insightRingPct.textContent = pct + "%";

    // Say what the numbers mean in plain words -- a bare "0%" reads as failure
    // when it often just means the day hasn't started.
    if (total === 0) {
      el.insightHeadline.textContent = "Nothing planned today";
      el.insightSub.textContent = "Tap + LOG ITEM to add your first task.";
    } else {
      el.insightHeadline.textContent = `${done} of ${total} done today`;
      el.insightSub.textContent =
        done === total ? "All finished — nice work." :
        done === 0 ? `${total} task${total > 1 ? "s" : ""} still to go.` :
        `${total - done} left to go.`;
    }

    const streak = computeStreak();
    el.insightStreak.textContent = String(streak);
    el.insightStreakHint.textContent = streak === 0
      ? "Finish everything you planned for a day to start one."
      : streak === 1
        ? "One day down. Finish tomorrow's list to keep it going."
        : `${streak} days in a row with everything finished.`;

    const days = getWeekCompletion();
    renderSparkline(days);
    const active = days.filter((d) => d.total > 0);
    if (active.length === 0) {
      el.insightWeekSummary.textContent = "No tasks logged in the last 7 days.";
    } else {
      const totalTasks = active.reduce((n, d) => n + d.total, 0);
      const doneTasks = active.reduce((n, d) => n + d.done, 0);
      el.insightWeekSummary.textContent =
        `${doneTasks} of ${totalTasks} finished across ${active.length} day${active.length > 1 ? "s" : ""}.`;
    }
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
        const info = catInfo(cat);
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
    showOverlay(el.reportOverlay, el.reportBox);
    pushOverlayState();
  }
  function closeReport() {
    el.reportOverlay.hidden = true;
  }
  el.closeReport.addEventListener("click", closeReport);
  el.reportOverlay.addEventListener("click", (e) => { if (e.target === el.reportOverlay) closeReport(); });
  el.menuWeeklyReview.addEventListener("click", () => { closeMoreMenu(); openReport(); });

  // ---------- Cloud sync (Firebase) ----------
  // A lightweight "sync code" scheme: no login screen, no password. The first
  // device generates a short random code and writes the whole tasks/templates
  // state to a Firestore doc keyed by that code; any other device that enters
  // the same code reads that doc and subscribes to live updates. Everyone is
  // signed in anonymously purely so Firestore security rules can require
  // request.auth != null -- the code itself (not the anonymous uid) is what
  // scopes access to a given user's data. Conflict handling is last-write-wins
  // (single person, a couple of their own devices -- no real concurrent-edit
  // case to design for).
  const SYNC_CODE_KEY = "dailyLog.syncCode";
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDeRFnHtlHDJmGNMvJ2I9E7D4gly57_ca8",
    authDomain: "daily-task-tracker-2482e.firebaseapp.com",
    projectId: "daily-task-tracker-2482e",
    storageBucket: "daily-task-tracker-2482e.firebasestorage.app",
    messagingSenderId: "211591838053",
    appId: "1:211591838053:web:c99882880bc82f7fff498c",
  };
  let syncCode = localStorage.getItem(SYNC_CODE_KEY) || null;
  let syncStatus = "off"; // 'off' | 'connecting' | 'synced' | 'error'
  let syncError = "";
  let fbApi = null;
  let firebaseApp = null;
  let syncDb = null;
  let syncUnsub = null;
  let syncReadyPromise = null;
  let applyingRemoteUpdate = false;
  let pushDebounceTimer = null;
  let lastPushedAt = null;

  function ensureFirebase() {
    if (syncReadyPromise) return syncReadyPromise;
    syncReadyPromise = (async () => {
      const [appMod, authMod, fsMod] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"),
      ]);
      fbApi = { ...appMod, ...authMod, ...fsMod };
      firebaseApp = fbApi.initializeApp(FIREBASE_CONFIG);
      const auth = fbApi.getAuth(firebaseApp);
      syncDb = fbApi.getFirestore(firebaseApp);
      try { await fbApi.enableIndexedDbPersistence(syncDb); } catch (e) { /* multi-tab or unsupported -- fine without it */ }
      await new Promise((resolve, reject) => {
        const unsub = fbApi.onAuthStateChanged(auth, (user) => {
          if (user) { unsub(); resolve(user); }
        }, reject);
        fbApi.signInAnonymously(auth).catch(reject);
      });
    })();
    return syncReadyPromise;
  }

  function generateSyncCode() {
    const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/L -- easy to read aloud/retype
    const group = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${group()}-${group()}`;
  }
  function syncDocRef(code) {
    return fbApi.doc(syncDb, "syncGroups", code);
  }

  async function startNewSync() {
    syncStatus = "connecting"; syncError = ""; renderSyncBody();
    try {
      await ensureFirebase();
      const code = generateSyncCode();
      lastPushedAt = Date.now();
      await fbApi.setDoc(syncDocRef(code), {
        tasks, templates,
        updatedAt: fbApi.serverTimestamp(),
        updatedAtLocal: lastPushedAt,
      });
      syncCode = code;
      localStorage.setItem(SYNC_CODE_KEY, code);
      subscribeSync();
    } catch (e) {
      console.error("startNewSync failed", e);
      syncStatus = "error"; syncError = "Hindi nagawa yung sync code. Subukan ulit.";
      renderSyncBody();
    }
  }

  async function joinSync(rawCode) {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    syncStatus = "connecting"; syncError = ""; renderSyncBody();
    try {
      await ensureFirebase();
      const snap = await fbApi.getDoc(syncDocRef(code));
      if (!snap.exists()) {
        syncStatus = "off"; syncError = "Hindi nahanap yung code. Siguraduhing tama yung pagka-type.";
        renderSyncBody();
        return;
      }
      const data = snap.data();
      applyingRemoteUpdate = true;
      tasks = mergeRemoteTasks(data.tasks);
      templates = data.templates || [];
      if (Array.isArray(data.categories) && data.categories.length) {
        categories = data.categories;
        saveCategories();
        renderCategorySelect();
        renderCategoryChips();
      }
      saveLocalOnly();
      applyingRemoteUpdate = false;
      syncCode = code;
      localStorage.setItem(SYNC_CODE_KEY, code);
      subscribeSync();
      renderAll();
    } catch (e) {
      console.error("joinSync failed", e);
      syncStatus = "error"; syncError = "Hindi makaconnect. Subukan ulit.";
      renderSyncBody();
    }
  }

  function saveLocalOnly() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    } catch (e) { console.error("Could not save synced data locally", e); }
  }

  function subscribeSync() {
    if (syncUnsub) { syncUnsub(); syncUnsub = null; }
    syncUnsub = fbApi.onSnapshot(syncDocRef(syncCode), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data.updatedAtLocal === lastPushedAt) { syncStatus = "synced"; renderSyncBody(); return; }
      applyingRemoteUpdate = true;
      tasks = mergeRemoteTasks(data.tasks);
      templates = data.templates || [];
      if (Array.isArray(data.categories) && data.categories.length) {
        categories = data.categories;
        saveCategories();
        renderCategorySelect();
        renderCategoryChips();
      }
      saveLocalOnly();
      applyingRemoteUpdate = false;
      renderAll();
      syncStatus = "synced";
      renderSyncBody();
    }, (err) => {
      console.error("sync snapshot error", err);
      syncStatus = "error"; syncError = "Nawala yung connection sa sync.";
      renderSyncBody();
    });
    syncStatus = "synced";
    renderSyncBody();
  }

  // Photos are deliberately left out of the synced payload. A Firestore
  // document is capped at 1 MiB, and one inlined attachment was enough to blow
  // that cap -- which failed the whole write, so a single photo could stop
  // every later change from syncing at all. The reference travels; the bytes
  // stay on the device that took them.
  function tasksForSync() {
    return tasks.map((t) => (t.photo ? Object.assign({}, t, { photo: "" }) : t));
  }
  // A remote copy has no photos in it, so a naive overwrite would strip the
  // attachments off this device's own tasks. Keep what is already here.
  function mergeRemoteTasks(remote) {
    const localPhotos = new Map(tasks.filter((t) => t.photo).map((t) => [t.id, t.photo]));
    return (remote || []).map(migrateTask).map((t) => {
      if (!t.photo && localPhotos.has(t.id)) t.photo = localPhotos.get(t.id);
      return t;
    });
  }
  function pushSyncUpdate() {
    if (!syncCode || applyingRemoteUpdate) return;
    ensureFirebase().then(() => {
      clearTimeout(pushDebounceTimer);
      pushDebounceTimer = setTimeout(async () => {
        try {
          lastPushedAt = Date.now();
          // merge: true is essential here -- without it this setDoc replaces
          // the WHOLE document on every task edit, silently wiping fields
          // this call doesn't know about (e.g. fcmTokens registered by the
          // push-notifications feature).
          await fbApi.setDoc(syncDocRef(syncCode), {
            tasks: tasksForSync(), templates, categories,
            updatedAt: fbApi.serverTimestamp(),
            updatedAtLocal: lastPushedAt,
          }, { merge: true });
        } catch (e) {
          console.error("sync push failed", e);
          syncStatus = "error"; syncError = "Hindi na-save yung huling changes sa cloud.";
          renderSyncBody();
        }
      }, 700);
    }).catch((e) => console.error("sync push init failed", e));
  }

  function disableSync() {
    if (syncUnsub) { syncUnsub(); syncUnsub = null; }
    syncCode = null;
    localStorage.removeItem(SYNC_CODE_KEY);
    syncStatus = "off"; syncError = "";
    // A push token registered under the old sync group is meaningless once
    // that group is gone -- clear the local "on" cache so the UI doesn't
    // claim push is enabled when nothing is actually registered anymore.
    localStorage.removeItem(FCM_TOKEN_KEY);
    pushStatus = "off"; pushError = "";
    renderSyncBody();
  }

  // ---------- Push notifications (FCM, sent by a free GitHub Actions cron) ----------
  // Reminders fire locally (checkReminders() above) only while a tab is open.
  // To also notify when the app/browser is fully closed, this device's FCM
  // token gets stored alongside the synced task list, and a scheduled
  // GitHub Action (scripts/send-reminders.mjs) scans every few minutes for
  // due, un-notified reminders and pushes to those tokens. Because it's tied
  // to the same synced doc, push notifications require sync to be turned on.
  const VAPID_PUBLIC_KEY = "BLLozey36dOxzacLK8xJ8S9dBgr0fKe_w6-CoEHvj3GcJ4gbP1yOYIyLW1wCUT8g2CFbYazA_T-bYwG0rgVAqcE";
  const FCM_TOKEN_KEY = "dailyLog.fcmToken";
  let pushStatus = (("Notification" in window) && Notification.permission === "granted" && localStorage.getItem(FCM_TOKEN_KEY))
    ? "on" : "off"; // 'off' | 'requesting' | 'on' | 'error'
  let pushError = "";

  async function ensureMessaging() {
    await ensureFirebase();
    if (!fbApi.getMessaging) {
      const msgMod = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging.js");
      fbApi = { ...fbApi, ...msgMod };
    }
    return fbApi.getMessaging(firebaseApp);
  }

  async function enablePush() {
    if (!syncCode) return;
    pushStatus = "requesting"; pushError = ""; renderSyncBody();
    try {
      if (!("Notification" in window)) throw new Error("Hindi supported ng browser na ito ang notifications.");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        pushStatus = "off"; pushError = "Kailangan payagan ang notification permission para gumana ito.";
        renderSyncBody();
        return;
      }
      const swReg = await navigator.serviceWorker.ready;
      const messaging = await ensureMessaging();
      const token = await fbApi.getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY, serviceWorkerRegistration: swReg });
      if (!token) throw new Error("Walang nakuhang token.");
      localStorage.setItem(FCM_TOKEN_KEY, token);
      await fbApi.setDoc(syncDocRef(syncCode), {
        fcmTokens: fbApi.arrayUnion(token),
        updatedAt: fbApi.serverTimestamp(),
        updatedAtLocal: Date.now(),
      }, { merge: true });
      pushStatus = "on";
      renderSyncBody();
    } catch (e) {
      console.error("enablePush failed", e);
      pushStatus = "error"; pushError = "Hindi na-enable ang push notifications. Subukan ulit.";
      renderSyncBody();
    }
  }

  async function disablePush() {
    const token = localStorage.getItem(FCM_TOKEN_KEY);
    localStorage.removeItem(FCM_TOKEN_KEY);
    pushStatus = "off"; pushError = "";
    renderSyncBody();
    if (token && syncCode) {
      try {
        await ensureFirebase();
        await fbApi.setDoc(syncDocRef(syncCode), {
          fcmTokens: fbApi.arrayRemove(token),
          updatedAt: fbApi.serverTimestamp(),
          updatedAtLocal: Date.now(),
        }, { merge: true });
      } catch (e) { console.error("disablePush cleanup failed", e); }
    }
  }

  // Silently re-confirm this device's token is still registered whenever sync
  // is active and permission was already granted -- tokens can rotate.
  function resumePushIfEnabled() {
    if (!syncCode) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (!localStorage.getItem(FCM_TOKEN_KEY)) return;
    enablePush();
  }

  function openSyncOverlay() {
    showOverlay(el.syncOverlay, el.syncBox);
    pushOverlayState();
    renderSyncBody();
  }
  function closeSyncOverlay() {
    el.syncOverlay.hidden = true;
  }

  function renderSyncBody() {
    // Keep this in sync even while the overlay is closed -- it's the only
    // visible feedback during the silent background resume on page load.
    el.syncStatusPill.hidden = syncStatus !== "connecting";
    if (el.syncOverlay.hidden) return;
    const body = el.syncBody;
    body.innerHTML = "";

    if (syncCode) {
      const statusLine = document.createElement("p");
      statusLine.className = "sync-status-line sync-status-" + syncStatus;
      statusLine.innerHTML = syncStatus === "synced" ? iconSvg("checkCircle") + " Naka-sync"
        : syncStatus === "connecting" ? iconSvg("loader") + " Kumokonekta..."
        : iconSvg("alertTriangle") + " May problema sa connection";
      body.appendChild(statusLine);

      const codeBox = document.createElement("div");
      codeBox.className = "sync-code-box";
      const codeText = document.createElement("span");
      codeText.className = "sync-code-text";
      codeText.textContent = syncCode;
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "btn-ghost btn-small";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(syncCode);
          copyBtn.textContent = "Copied!";
          setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
        } catch (e) { /* clipboard unavailable -- ignore */ }
      });
      codeBox.append(codeText, copyBtn);
      body.appendChild(codeBox);

      const hint = document.createElement("p");
      hint.className = "sync-hint";
      hint.textContent = "I-type mo itong code sa ibang device mo para mag-connect sila sa parehong task list.";
      body.appendChild(hint);

      if (syncError) {
        const err = document.createElement("p");
        err.className = "sync-error";
        err.textContent = syncError;
        body.appendChild(err);
      }

      const pushDivider = document.createElement("p");
      pushDivider.className = "sync-divider";
      body.appendChild(pushDivider);

      const pushStatusLine = document.createElement("p");
      pushStatusLine.className = "sync-status-line sync-status-" + (pushStatus === "on" ? "synced" : pushStatus === "error" ? "error" : "connecting");
      pushStatusLine.innerHTML = pushStatus === "on" ? iconSvg("bell") + " Naka-on ang push notifications"
        : pushStatus === "requesting" ? iconSvg("loader") + " Nire-request ang permission..."
        : iconSvg("bellOff") + " Naka-off ang push notifications";
      body.appendChild(pushStatusLine);

      const pushHint = document.createElement("p");
      pushHint.className = "sync-hint";
      pushHint.textContent = "Makakatanggap ka ng reminder kahit nakasara ang app o browser, sa lahat ng device na naka-enable dito.";
      body.appendChild(pushHint);

      if (pushError) {
        const perr = document.createElement("p");
        perr.className = "sync-error";
        perr.textContent = pushError;
        body.appendChild(perr);
      }

      const pushBtn = document.createElement("button");
      pushBtn.type = "button";
      if (pushStatus === "on") {
        pushBtn.className = "btn-ghost sync-off-btn";
        pushBtn.textContent = "I-off ang push notifications";
        pushBtn.addEventListener("click", disablePush);
      } else {
        pushBtn.className = "btn-solid sync-start-btn";
        pushBtn.innerHTML = iconSvg("bell") + " I-enable ang push notifications";
        pushBtn.disabled = pushStatus === "requesting";
        pushBtn.addEventListener("click", enablePush);
      }
      body.appendChild(pushBtn);

      const offBtn = document.createElement("button");
      offBtn.type = "button";
      offBtn.className = "btn-ghost sync-off-btn";
      offBtn.textContent = "I-off ang sync sa device na ito";
      offBtn.addEventListener("click", disableSync);
      body.appendChild(offBtn);
      return;
    }

    const intro = document.createElement("p");
    intro.className = "sync-intro";
    intro.textContent = "I-sync yung tasks mo sa lahat ng device mo (phone, laptop) gamit ang isang simpleng code.";
    body.appendChild(intro);

    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "btn-solid sync-start-btn";
    startBtn.textContent = "Gumawa ng bagong sync code";
    startBtn.addEventListener("click", startNewSync);
    body.appendChild(startBtn);

    const divider = document.createElement("p");
    divider.className = "sync-divider";
    divider.textContent = "— o kung may code ka na —";
    body.appendChild(divider);

    const joinRow = document.createElement("div");
    joinRow.className = "sync-join-row";
    const codeInput = document.createElement("input");
    codeInput.type = "text";
    codeInput.placeholder = "hal. XPQR-7K4M";
    codeInput.className = "sync-code-input";
    codeInput.maxLength = 9;
    const joinBtn = document.createElement("button");
    joinBtn.type = "button";
    joinBtn.className = "btn-ghost";
    joinBtn.textContent = "Connect";
    joinBtn.addEventListener("click", () => joinSync(codeInput.value));
    codeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") joinSync(codeInput.value); });
    joinRow.append(codeInput, joinBtn);
    body.appendChild(joinRow);

    if (syncError) {
      const err = document.createElement("p");
      err.className = "sync-error";
      err.textContent = syncError;
      body.appendChild(err);
    }
  }

  el.menuSync.addEventListener("click", () => { closeMoreMenu(); openSyncOverlay(); });
  el.closeSyncOverlay.addEventListener("click", closeSyncOverlay);
  el.syncOverlay.addEventListener("click", (e) => { if (e.target === el.syncOverlay) closeSyncOverlay(); });

  // Silently resume a previously-connected sync on load, without popping the overlay open.
  // The syncStatusPill (shown via renderSyncBody) is the only feedback the
  // user gets that this is happening in the background.
  if (syncCode) {
    syncStatus = "connecting";
    renderSyncBody();
    ensureFirebase().then(subscribeSync).then(resumePushIfEnabled).catch((e) => {
      console.error("auto sync resume failed", e);
      syncStatus = "error";
      syncError = "Hindi makaconnect. Subukan ulit.";
      renderSyncBody();
    });
  }

  // ---------- Print ----------
  // The sheet mirrors what you were looking at when you asked for it. The tab
  // decides the slice, and the search box and filter chips narrow it exactly as
  // they do on screen -- printing the unfiltered day while the screen showed
  // one client's work was the main complaint.
  //
  //   board            -> every match, grouped by client/project. Board is not
  //                       tied to a date, so searching a client there is a
  //                       request for that client's whole history, not for
  //                       whichever month happens to be on the calendar.
  //   week             -> that week, grouped by day.
  //   home/day/timeline-> the whole month, grouped by day. A single day was too
  //                       thin to be worth taking to a meeting.
  // An explicit From/To beats the tab. A client asking for "everything from
  // Aug 1 to Sep 15" does not care which tab happened to be open, and the
  // month/week scopes could not express that range at all.
  let printRangeFrom = "";
  let printRangeTo = "";
  function printRangeActive() { return Boolean(printRangeFrom && printRangeTo); }
  function printScopeForView() {
    if (printRangeActive()) return "range";
    if (currentView === "board") return "project";
    if (currentView === "week") return "week";
    return "month";
  }
  const PRINT_COLUMNS = {
    dated: [["pc-no", "No."], ["pc-task", "Task Description"], ["pc-cat", "Category"],
            ["pc-pri", "Priority"], ["pc-time", "Time"], ["pc-status", "Status"]],
    // Project rows come from all over the calendar, so each one has to say when
    // it was due -- there is no day heading above it to carry that.
    project: [["pc-no", "No."], ["pc-date", "Date"], ["pc-task", "Task Description"], ["pc-cat", "Category"],
              ["pc-pri", "Priority"], ["pc-time", "Time"], ["pc-status", "Status"]],
  };
  function buildPrintHead(cols) {
    el.printSheetHead.innerHTML = "";
    const tr = document.createElement("tr");
    cols.forEach(([cls, label]) => {
      const th = document.createElement("th");
      th.className = cls;
      th.textContent = label;
      tr.appendChild(th);
    });
    el.printSheetHead.appendChild(tr);
  }
  function shortDateLabel(dateKey) {
    const d = parseDateKey(dateKey);
    return `${MONTHS[d.getMonth()].slice(0, 3).toUpperCase()} ${d.getDate()}`;
  }
  // withDate/withTag say which of the two things a group heading already
  // carries: day headings repeat no date, project headings repeat no tag.
  function buildPrintRow(task, dateKey, index, { withDate = false, withTag = true } = {}) {
    const done = isDoneOn(task, dateKey);
    const cat = catInfo(task.category);
    const pri = PRIORITIES[task.priority] || PRIORITIES.medium;
    const subs = task.subtasks || [];
    const subsDone = subs.filter((s) => s.done).length;
    const tr = document.createElement("tr");
    if (done) tr.classList.add("pc-done");
    // A row with a long step list can be taller than the space left on the
    // page. Kept unbreakable it would be pushed whole to the next sheet and
    // leave most of a page blank, so a long one is allowed to continue
    // overleaf instead; short rows still stay in one piece.
    if (subs.length >= 5) tr.classList.add("pc-tall");

    const tdNo = document.createElement("td");
    tdNo.className = "pc-no";
    tdNo.textContent = String(index).padStart(2, "0");
    tr.appendChild(tdNo);

    if (withDate) {
      const tdDate = document.createElement("td");
      tdDate.className = "pc-date";
      tdDate.textContent = shortDateLabel(dateKey);
      tr.appendChild(tdDate);
    }

    const tdTask = document.createElement("td");
    tdTask.className = "pc-task";
    const title = document.createElement("div");
    title.className = "pc-title";
    title.textContent = task.title;
    tdTask.appendChild(title);
    if (task.tag && withTag) {
      const tag = document.createElement("div");
      tag.className = "pc-tag";
      tag.textContent = task.tag;
      tdTask.appendChild(tag);
    }
    if (task.notes) {
      const notes = document.createElement("div");
      notes.className = "pc-notes";
      notes.textContent = task.notes;
      tdTask.appendChild(notes);
    }
    // Under the note, the steps and which of them were actually accomplished --
    // a sheet that only shows the parent task cannot be checked against.
    if (subs.length) {
      const wrap = document.createElement("div");
      wrap.className = "pc-subs";
      const head = document.createElement("div");
      head.className = "pc-subs-head";
      head.textContent = `Subtasks — ${subsDone}/${subs.length} done`;
      wrap.appendChild(head);
      subs.forEach((s) => {
        const line = document.createElement("div");
        line.className = "pc-sub" + (s.done ? " is-done" : "");
        const box = document.createElement("span");
        box.className = "pc-sub-box";
        box.textContent = s.done ? "[x]" : "[ ]";
        line.appendChild(box);
        line.appendChild(document.createTextNode(" " + s.title));
        wrap.appendChild(line);
      });
      tdTask.appendChild(wrap);
    }
    tr.appendChild(tdTask);

    const tdCat = document.createElement("td");
    tdCat.className = "pc-cat";
    tdCat.textContent = cat.label;

    const tdPri = document.createElement("td");
    tdPri.className = "pc-pri";
    tdPri.textContent = pri.label;

    const tdTime = document.createElement("td");
    tdTime.className = "pc-time";
    tdTime.textContent = task.time ? timeRangeLabel(task) : "—";

    const tdStatus = document.createElement("td");
    tdStatus.className = "pc-status";
    const word = document.createElement("div");
    word.textContent = done ? "DONE" : "OPEN";
    tdStatus.appendChild(word);
    if (subs.length) {
      const frac = document.createElement("div");
      frac.className = "pc-status-sub";
      frac.textContent = `${subsDone}/${subs.length}`;
      tdStatus.appendChild(frac);
    }

    tr.append(tdCat, tdPri, tdTime, tdStatus);
    return tr;
  }
  function buildPrintGroupRow(label, meta, colSpan) {
    const tr = document.createElement("tr");
    tr.className = "pc-day-group";
    const td = document.createElement("td");
    td.colSpan = colSpan;
    td.textContent = label;
    if (meta) {
      const m = document.createElement("span");
      m.className = "pc-group-meta";
      m.textContent = meta;
      td.appendChild(m);
    }
    tr.appendChild(td);
    return tr;
  }
  // On a report header the search term is almost always a client, so it is
  // printed under its own "Client / Project" heading rather than as a sentence.
  // If what was typed names a real tag, the tag's own capitalisation is used --
  // "sullivan" typed in a hurry should still read "Sullivan" on paper.
  function printClientLabel(q) {
    const lower = q.toLowerCase();
    const match = tasks.find((t) => (t.tag || "").trim().toLowerCase() === lower);
    return match ? match.tag.trim() : q;
  }
  // Category/priority chips get their own heading, so a narrowed sheet is not
  // mistaken for the full log.
  function printChipNote() {
    const bits = [];
    if (activeCategories.size) {
      bits.push(Array.from(activeCategories).map((c) => catInfo(c).label).join(" / "));
    }
    if (activePriorities.size) {
      bits.push(Array.from(activePriorities).map((p) => (PRIORITIES[p] || PRIORITIES.medium).label).join(" / ") + " priority");
    }
    return bits.join(" · ");
  }
  function buildPrintSheet() {
    el.printSheetBody.innerHTML = "";
    const now = new Date();
    el.printGenerated.textContent = `${MONTHS[now.getMonth()].slice(0, 3)} ${now.getDate()}, ${now.getFullYear()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const scope = printScopeForView();
    const cols = PRINT_COLUMNS[scope === "project" ? "project" : "dated"];
    buildPrintHead(cols);

    const query = searchQuery.trim();
    el.printClientWrap.hidden = !query;
    el.printClient.textContent = query ? printClientLabel(query) : "—";
    const chipNote = printChipNote();
    el.printFilterWrap.hidden = !chipNote;
    el.printFilter.textContent = chipNote || "—";
    const narrowed = Boolean(query || chipNote);

    el.printPreparedName.textContent = preparedBy;

    const counted = [];
    let index = 1;
    const addDatedRange = (startDate, days) => {
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateKey = toDateKey(d);
        const dayTasks = getVisibleTasks(dateKey);
        if (!dayTasks.length) continue;
        const doneN = dayTasks.filter((t) => isDoneOn(t, dateKey)).length;
        el.printSheetBody.appendChild(
          buildPrintGroupRow(formatDateDisplay(dateKey).toUpperCase(), `${doneN}/${dayTasks.length} done`, cols.length));
        dayTasks.forEach((t) => {
          el.printSheetBody.appendChild(buildPrintRow(t, dateKey, index++));
          counted.push({ t, dateKey });
        });
      }
    };

    if (scope === "range") {
      const from = parseDateKey(printRangeFrom);
      const to = parseDateKey(printRangeTo);
      const days = Math.round((to - from) / 86400000) + 1;
      el.printSheetTitle.textContent = "Task Log";
      el.printPeriod.textContent = `${formatDateDisplay(printRangeFrom)} – ${formatDateDisplay(printRangeTo)}`;
      addDatedRange(from, days);
    } else if (scope === "week") {
      const weekStart = getWeekStart(selectedDate);
      const endDate = new Date(weekStart);
      endDate.setDate(endDate.getDate() + 6);
      el.printSheetTitle.textContent = "Weekly Task Log";
      el.printPeriod.textContent = `${formatDateDisplay(toDateKey(weekStart))} – ${formatDateDisplay(toDateKey(endDate))}`;
      addDatedRange(weekStart, 7);
    } else if (scope === "month") {
      const sel = parseDateKey(selectedDate);
      const first = new Date(sel.getFullYear(), sel.getMonth(), 1);
      const days = new Date(sel.getFullYear(), sel.getMonth() + 1, 0).getDate();
      el.printSheetTitle.textContent = "Monthly Task Log";
      el.printPeriod.textContent = `${MONTHS[sel.getMonth()]} ${sel.getFullYear()}`;
      addDatedRange(first, days);
    } else {
      // Grouped by client/project, the same grouping and order the Board shows.
      el.printSheetTitle.textContent = "Project Task Log";
      const list = getAllFilteredTasks();
      const groups = new Map();
      list.forEach((t) => {
        const key = (t.tag || "").trim();
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(t);
      });
      const tagKeys = Array.from(groups.keys()).filter((k) => k !== "").sort((a, b) => a.localeCompare(b));
      if (groups.has("")) tagKeys.push("");

      let earliest = null;
      let latest = null;
      tagKeys.forEach((tagKey) => {
        const groupTasks = groups.get(tagKey).sort((a, b) =>
          a.startDate.localeCompare(b.startDate) || (a.time || "99:99").localeCompare(b.time || "99:99"));
        const doneN = groupTasks.filter((t) => isDoneOn(t, t.startDate)).length;
        el.printSheetBody.appendChild(buildPrintGroupRow(
          (tagKey || "No client / project").toUpperCase(), `${doneN}/${groupTasks.length} done`, cols.length));
        groupTasks.forEach((t) => {
          el.printSheetBody.appendChild(buildPrintRow(t, t.startDate, index++, { withDate: true, withTag: false }));
          counted.push({ t, dateKey: t.startDate });
          if (!earliest || t.startDate < earliest) earliest = t.startDate;
          if (!latest || t.startDate > latest) latest = t.startDate;
        });
      });
      el.printPeriod.textContent = earliest
        ? (earliest === latest ? formatDateDisplay(earliest)
                               : `${formatDateDisplay(earliest)} – ${formatDateDisplay(latest)}`)
        : "—";
    }

    if (!counted.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = cols.length;
      td.className = "pc-empty";
      td.textContent = narrowed
        ? "Nothing matches those filters for this period."
        : "No tasks logged for this period.";
      tr.appendChild(td);
      el.printSheetBody.appendChild(tr);
      el.printCompletion.textContent = "—";
    } else {
      const done = counted.filter(({ t, dateKey }) => isDoneOn(t, dateKey)).length;
      el.printCompletion.textContent = `${done}/${counted.length} completed`;
    }
  }
  el.preparedByInput.value = preparedBy;
  el.preparedByInput.addEventListener("input", () => {
    preparedBy = el.preparedByInput.value.trim();
    try { localStorage.setItem(PREPARED_BY_KEY, preparedBy); } catch (e) { /* name is a convenience; a full disk should not block typing */ }
  });
  // Preview first. On Home/Day/Timeline the sheet is a whole month, which you
  // could not see anywhere in the app before -- the views show one day at a
  // time -- so it had to be printed to be read.
  // Re-runs the build and the summary line. Called on open and on every change
  // to the range, so the preview always shows what Print would produce.
  function refreshPrintPreview() {
    buildPrintSheet();
    const rows = el.printSheetBody.querySelectorAll("tr:not(.pc-day-group)").length;
    const empty = el.printSheetBody.querySelector(".pc-empty");
    el.printPreviewNote.textContent =
      `${el.printSheetTitle.textContent} · ${el.printPeriod.textContent} · ` +
      (empty ? "nothing to print" : `${rows} item${rows === 1 ? "" : "s"}`);
    el.printRangeReset.hidden = !printRangeActive();
  }
  function openPrintPreview() {
    refreshPrintPreview();
    el.printPreviewBackdrop.hidden = false;
    el.printPreviewBar.hidden = false;
    document.body.classList.add("print-preview-open");
    el.printSheet.scrollTop = 0;
    pushOverlayState();
  }
  function onPrintRangeChanged() {
    const from = el.printRangeFrom.value;
    const to = el.printRangeTo.value;
    // A backwards range would silently print nothing, so it is corrected here
    // rather than left to produce a confusing empty sheet.
    if (from && to && to < from) {
      el.printRangeTo.value = from;
    }
    printRangeFrom = el.printRangeFrom.value;
    printRangeTo = el.printRangeTo.value;
    refreshPrintPreview();
  }
  function closePrintPreview() {
    document.body.classList.remove("print-preview-open");
    el.printPreviewBackdrop.hidden = true;
    el.printPreviewBar.hidden = true;
  }
  el.menuPrint.addEventListener("click", () => {
    closeMoreMenu();
    openPrintPreview();
  });
  el.printRangeFrom.addEventListener("change", onPrintRangeChanged);
  el.printRangeTo.addEventListener("change", onPrintRangeChanged);
  el.printRangeReset.addEventListener("click", () => {
    printRangeFrom = printRangeTo = "";
    el.printRangeFrom.value = "";
    el.printRangeTo.value = "";
    refreshPrintPreview();
  });
  el.printPreviewPrint.addEventListener("click", () => window.print());
  el.printPreviewClose.addEventListener("click", closePrintPreview);
  el.printPreviewBackdrop.addEventListener("click", closePrintPreview);

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
  // ---------- .ics calendar export ----------
  function icsEscapeText(s) {
    return String(s == null ? "" : s)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }
  function icsFoldLine(line) {
    if (line.length <= 75) return line;
    let out = line.slice(0, 75);
    let rest = line.slice(75);
    while (rest.length > 0) {
      out += "\r\n " + rest.slice(0, 74);
      rest = rest.slice(74);
    }
    return out;
  }
  function icsDateStamp(dateKey) {
    return dateKey.replace(/-/g, "");
  }
  function icsTimeStamp(time) {
    const [h, m] = time.split(":").map(Number);
    return String(h).padStart(2, "0") + String(m).padStart(2, "0") + "00";
  }
  function buildIcsEvent(task) {
    const lines = ["BEGIN:VEVENT", "UID:" + task.id + "@dailytasktracker"];
    const now = new Date();
    const dtstamp = now.getUTCFullYear() + String(now.getUTCMonth() + 1).padStart(2, "0") + String(now.getUTCDate()).padStart(2, "0")
      + "T" + String(now.getUTCHours()).padStart(2, "0") + String(now.getUTCMinutes()).padStart(2, "0") + String(now.getUTCSeconds()).padStart(2, "0") + "Z";
    lines.push("DTSTAMP:" + dtstamp);
    const dateStr = icsDateStamp(task.startDate);
    if (task.time) {
      lines.push("DTSTART:" + dateStr + "T" + icsTimeStamp(task.time));
      lines.push("DTEND:" + dateStr + "T" + icsTimeStamp(task.endTime || task.time));
    } else {
      lines.push("DTSTART;VALUE=DATE:" + dateStr);
    }
    if (task.repeat === "daily") lines.push("RRULE:FREQ=DAILY");
    else if (task.repeat === "weekly") lines.push("RRULE:FREQ=WEEKLY");
    else if (task.repeat === "weekdays") lines.push("RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR");
    else if (task.repeat === "everyweeks") lines.push("RRULE:FREQ=WEEKLY;INTERVAL=" + repeatEveryWeeks(task));
    else if (task.repeat === "monthly") lines.push("RRULE:FREQ=MONTHLY");
    if (task.repeat !== "none" && task.skipped) {
      const exKeys = Object.keys(task.skipped).filter((k) => task.skipped[k]);
      if (exKeys.length) {
        const exVals = exKeys.map((k) => task.time ? icsDateStamp(k) + "T" + icsTimeStamp(task.time) : icsDateStamp(k));
        lines.push((task.time ? "EXDATE:" : "EXDATE;VALUE=DATE:") + exVals.join(","));
      }
    }
    lines.push("SUMMARY:" + icsEscapeText(task.title));
    if (task.notes) lines.push("DESCRIPTION:" + icsEscapeText(task.notes));
    const priorityMap = { high: 1, medium: 5, low: 9 };
    lines.push("PRIORITY:" + (priorityMap[task.priority] || 5));
    lines.push("CATEGORIES:" + icsEscapeText(catInfo(task.category).label));
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
    return lines;
  }
  function buildIcsCalendar(taskList) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Daily Task Tracker & Planner//EN", "CALSCALE:GREGORIAN"];
    taskList.forEach((t) => { lines.push(...buildIcsEvent(t)); });
    lines.push("END:VCALENDAR");
    return lines.map(icsFoldLine).join("\r\n") + "\r\n";
  }
  el.menuExportIcs.addEventListener("click", () => {
    closeMoreMenu();
    downloadBlob(`daily-log-export-${toDateKey(today)}.ics`, buildIcsCalendar(tasks), "text/calendar");
  });
  // A backup has to stand on its own, so photos are inlined back into the JSON
  // on the way out even though they no longer live there.
  async function tasksForExport() {
    return Promise.all(tasks.map(async (t) => {
      if (!isPhotoRef(t.photo)) return t;
      const blob = await getPhotoBlob(t.photo);
      return Object.assign({}, t, { photo: blob ? await blobToDataUrl(blob) : "" });
    }));
  }
  el.menuExportJson.addEventListener("click", async () => {
    closeMoreMenu();
    try {
      const payload = await tasksForExport();
      downloadBlob(`daily-log-export-${toDateKey(today)}.json`, JSON.stringify(payload, null, 2), "application/json");
    } catch (e) {
      console.error("export failed", e);
      showSnackbar("Could not build the export file");
    }
  });
  el.menuExportCsv.addEventListener("click", () => {
    closeMoreMenu();
    const headers = ["title", "category", "priority", "tag", "date", "time", "end_time", "repeat", "done", "notes"];
    const rows = tasks.map((t) => [
      t.title, t.category, t.priority, t.tag || "", t.startDate, t.time, t.endTime || "",
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
    reader.onload = async () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!Array.isArray(imported)) throw new Error("Invalid file");
        const existingIds = new Set(tasks.map((t) => t.id));
        const migrated = imported.map(migrateTask);
        const toAdd = migrated.filter((t) => !existingIds.has(t.id));
        // Exports carry photos inline; they belong in the store, not in the
        // tasks JSON, or an import would refill localStorage with base64.
        for (const t of toAdd) {
          if (t.photo && !isPhotoRef(t.photo)) {
            try { t.photo = await putPhoto(await dataUrlToBlob(t.photo)); }
            catch (err) { t.photo = ""; }
          }
        }
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
    saveFilters();
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
      removeBtn.innerHTML = iconSvg("close");
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
  // ---------- Repeat sub-fields (custom weekdays + end date) ----------
  let modalRepeatDays = [];

  function renderRepeatDays() {
    el.repeatDays.innerHTML = "";
    DAY_NAMES.forEach((name, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "repeat-day" + (modalRepeatDays.includes(idx) ? " active" : "");
      btn.textContent = name[0];
      btn.setAttribute("aria-label", name);
      btn.setAttribute("aria-pressed", modalRepeatDays.includes(idx) ? "true" : "false");
      btn.addEventListener("click", () => {
        if (modalRepeatDays.includes(idx)) modalRepeatDays = modalRepeatDays.filter((d) => d !== idx);
        else modalRepeatDays = modalRepeatDays.concat(idx).sort();
        renderRepeatDays();
      });
      el.repeatDays.appendChild(btn);
    });
  }
  function syncRepeatFields() {
    const mode = el.taskRepeat.value;
    el.repeatDaysField.hidden = mode !== "custom";
    el.repeatEveryField.hidden = mode !== "everyweeks";
    el.repeatUntilField.hidden = mode === "none";
    if (mode === "everyweeks") renderRepeatEveryHint();
    if (mode === "none" && dpTarget === DP_TARGETS.repeatUntil) closeDatePicker();
  }
  // Says the rule back in plain words -- "every 2 weeks on Friday, next on
  // Sep 25" -- because an interval alone does not tell you which day it lands
  // on, and that is exactly what a fortnightly reminder is about.
  function renderRepeatEveryHint() {
    const n = repeatEveryWeeks({ repeatEvery: el.repeatEvery.value });
    const startKey = el.taskDate.value || selectedDate;
    const start = parseDateKey(startKey);
    const next = new Date(start);
    next.setDate(next.getDate() + n * 7);
    const until = el.repeatUntil.value;
    const beyondEnd = until && toDateKey(next) > until;
    el.repeatEveryHint.textContent =
      `on ${FULL_DAY_NAMES[start.getDay()].toLowerCase()}s — ` +
      (beyondEnd ? "ends before the next one" : `next on ${formatDateDisplay(toDateKey(next))}`);
  }
  function resetRepeatFields(task) {
    modalRepeatDays = task && task.repeatDays ? task.repeatDays.slice() : [];
    el.repeatEvery.value = String(repeatEveryWeeks(task));
    renderRepeatDays();
    const until = (task && task.repeatUntil) || "";
    el.repeatUntil.value = until;
    el.repeatUntilDisplay.textContent = until ? formatDateDisplay(until) : "No end date";
    el.repeatUntilClear.hidden = !until;
    syncRepeatFields();
  }

  // The picker is an inline panel rather than a floating popover, so opening it
  // for a given field also means relocating it to sit directly under that
  // field. Two fields share it: the task's own date and the repeat end date.
  const DP_TARGETS = {
    taskDate: {
      get input() { return el.taskDate; },
      get display() { return el.taskDateDisplay; },
      get btn() { return el.taskDateBtn; },
      get anchor() { return el.taskDateBtn.closest(".field-row"); },
      onPick: null,
    },
    repeatUntil: {
      get input() { return el.repeatUntil; },
      get display() { return el.repeatUntilDisplay; },
      get btn() { return el.repeatUntilBtn; },
      get anchor() { return el.repeatUntilField; },
      onPick: () => { el.repeatUntilClear.hidden = false; },
    },
  };
  let dpTarget = DP_TARGETS.taskDate;

  function openDatePicker(target) {
    dpTarget = target || DP_TARGETS.taskDate;
    dpTarget.anchor.insertAdjacentElement("afterend", el.datePickerPopover);
    const base = dpTarget.input.value ? parseDateKey(dpTarget.input.value) : new Date();
    dpViewYear = base.getFullYear();
    dpViewMonth = base.getMonth();
    renderDatePicker();
    el.datePickerPopover.hidden = false;
    dpTarget.btn.classList.add("active");
    closeTimePicker();
  }
  function closeDatePicker() {
    el.datePickerPopover.hidden = true;
    Object.values(DP_TARGETS).forEach((t) => t.btn.classList.remove("active"));
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
      if (key === dpTarget.input.value) btn.classList.add("selected");
      btn.textContent = String(day);
      btn.addEventListener("click", () => {
        const target = dpTarget;
        target.input.value = key;
        target.display.textContent = formatDateDisplay(key);
        if (target.onPick) target.onPick();
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
    const reopen = el.datePickerPopover.hidden || dpTarget !== DP_TARGETS.taskDate;
    closeDatePicker();
    if (reopen) openDatePicker(DP_TARGETS.taskDate);
  });
  el.repeatUntilBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const reopen = el.datePickerPopover.hidden || dpTarget !== DP_TARGETS.repeatUntil;
    closeDatePicker();
    if (reopen) openDatePicker(DP_TARGETS.repeatUntil);
  });
  el.taskRepeat.addEventListener("change", () => {
    // Default a fresh "custom" selection to the task's own weekday so the
    // schedule is never silently empty (an empty repeatDays matches nothing).
    if (el.taskRepeat.value === "custom" && modalRepeatDays.length === 0) {
      const base = el.taskDate.value ? parseDateKey(el.taskDate.value) : new Date();
      modalRepeatDays = [base.getDay()];
      renderRepeatDays();
    }
    syncRepeatFields();
  });
  el.repeatEvery.addEventListener("input", renderRepeatEveryHint);
  el.repeatUntilClear.addEventListener("click", () => {
    el.repeatUntil.value = "";
    el.repeatUntilDisplay.textContent = "No end date";
    el.repeatUntilClear.hidden = true;
    if (dpTarget === DP_TARGETS.repeatUntil) closeDatePicker();
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
    // .tp-clock-hand is drawn extending downward from the center pivot, so its
    // unrotated (0deg) orientation already points at the 6 o'clock spot -- add
    // 180deg so idx 0 (the 12 o'clock number) lines up with the hand pointing up.
    el.tpHand.style.transform = `rotate(${(idx / 12) * 360 + 180}deg)`;
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
  function timeInputFor(target) { return target === "end" ? el.taskEndTime : el.taskTime; }
  function timeDisplayFor(target) { return target === "end" ? el.taskEndTimeDisplay : el.taskTimeDisplay; }
  function openTimePicker(target) {
    tpTarget = target === "end" ? "end" : "start";
    const input = timeInputFor(tpTarget);
    if (input.value) {
      const [h, m] = input.value.split(":").map(Number);
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
    el.taskTimeBtn.classList.toggle("active", tpTarget === "start");
    el.taskEndTimeBtn.classList.toggle("active", tpTarget === "end");
    closeDatePicker();
  }
  function closeTimePicker() {
    el.timePickerPopover.hidden = true;
    el.taskTimeBtn.classList.remove("active");
    el.taskEndTimeBtn.classList.remove("active");
  }
  el.taskTimeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (el.timePickerPopover.hidden || tpTarget !== "start") openTimePicker("start"); else closeTimePicker();
  });
  el.taskEndTimeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (el.timePickerPopover.hidden || tpTarget !== "end") openTimePicker("end"); else closeTimePicker();
  });
  el.tpDone.addEventListener("click", () => {
    const input = timeInputFor(tpTarget);
    const display = timeDisplayFor(tpTarget);
    if (tpHour24 == null) {
      input.value = "";
      display.textContent = "No time set";
    } else {
      input.value = `${String(tpHour24).padStart(2, "0")}:${String(tpMinute).padStart(2, "0")}`;
      display.textContent = formatTimeDisplay(input.value);
    }
    closeTimePicker();
  });
  el.tpClear.addEventListener("click", () => {
    const input = timeInputFor(tpTarget);
    const display = timeDisplayFor(tpTarget);
    input.value = "";
    display.textContent = "No time set";
    closeTimePicker();
  });

  // ---------- Templates (modal) ----------
  // Templates used to hide inside a native <select> at the top of the form: you
  // could not tell whether you had any without opening the dropdown, and with
  // none saved it opened onto an empty list that looked broken. They are laid
  // out as chips instead -- every saved template is readable at a glance and one
  // tap away, and with none saved the row says how to make one.
  let activeTemplateId = "";

  function renderTemplateOptions() {
    el.templateChips.innerHTML = "";
    templates.forEach((t) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "template-chip" + (t.id === activeTemplateId ? " is-active" : "");
      chip.dataset.id = t.id;

      const label = document.createElement("span");
      label.className = "template-chip-label";
      label.textContent = t.title;
      chip.appendChild(label);

      const meta = templateSummary(t);
      if (meta) {
        const sub = document.createElement("span");
        sub.className = "template-chip-meta";
        sub.textContent = meta;
        chip.appendChild(sub);
      }
      chip.addEventListener("click", () => applyTemplate(t.id));

      const del = document.createElement("span");
      del.className = "template-chip-x";
      del.setAttribute("role", "button");
      del.setAttribute("tabindex", "0");
      del.setAttribute("aria-label", `Delete template ${t.title}`);
      del.innerHTML = iconSvg("close");
      const remove = (e) => {
        e.stopPropagation();
        deleteTemplate(t.id, t.title);
      };
      del.addEventListener("click", remove);
      del.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") remove(e);
      });
      chip.appendChild(del);

      el.templateChips.appendChild(chip);
    });
    el.templateChips.hidden = templates.length === 0;
    el.templateEmpty.hidden = templates.length > 0;
  }
  // A one-line reminder of what the template carries, so two similarly named
  // ones are still tellable apart without applying them.
  function templateSummary(tpl) {
    const bits = [];
    if (tpl.time) bits.push(formatTimeDisplay(tpl.time));
    if (tpl.category) bits.push(catInfo(tpl.category).label);
    if (tpl.repeat && tpl.repeat !== "none") bits.push(repeatLabel(tpl));
    const steps = (tpl.subtasks || []).length;
    if (steps) bits.push(steps === 1 ? "1 step" : `${steps} steps`);
    return bits.join(" · ");
  }
  function applyTemplate(id) {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl) return;
    activeTemplateId = id;
    el.taskTitle.value = tpl.title;
    el.taskCategory.value = tpl.category;
    el.taskPriority.value = tpl.priority;
    el.taskTime.value = tpl.time || "";
    el.taskTimeDisplay.textContent = tpl.time ? formatTimeDisplay(tpl.time) : "No time set";
    el.taskEndTime.value = tpl.endTime || "";
    el.taskEndTimeDisplay.textContent = tpl.endTime ? formatTimeDisplay(tpl.endTime) : "No time set";
    el.taskRepeat.value = tpl.repeat || "none";
    resetRepeatFields(null);
    el.taskReminder.checked = tpl.reminder !== false;
    el.taskTag.value = tpl.tag || "";
    el.taskNotes.value = tpl.notes || "";
    modalSubtasks = (tpl.subtasks || []).map((s) => ({ id: uid(), title: s.title, done: false }));
    renderSubtaskList();
    // The title was filled in by us, not typed, so no "input" event fired --
    // clear any chips left from what the user had typed before.
    clearQuickParse();
    renderTemplateOptions();
    showSnackbar(`Filled in from "${tpl.title}"`);
  }
  function deleteTemplate(id, title) {
    showConfirm(`Delete the template "${title}"? Tasks you already made from it stay.`, [
      { label: "Keep it", cancel: true },
      {
        label: "Delete",
        danger: true,
        onClick: () => {
          templates = templates.filter((t) => t.id !== id);
          saveTemplates();
          if (activeTemplateId === id) activeTemplateId = "";
          renderTemplateOptions();
          showSnackbar(`Template "${title}" deleted`);
        },
      },
    ]);
  }
  el.saveTemplateBtn.addEventListener("click", () => {
    const title = (quickParsed && quickParsed.title ? quickParsed.title : el.taskTitle.value).trim();
    if (!title) {
      el.taskTitle.focus();
      showSnackbar("Give it a name first, then save it as a template");
      return;
    }
    const tpl = {
      id: uid(),
      title,
      category: el.taskCategory.value,
      priority: el.taskPriority.value,
      time: el.taskTime.value || "",
      endTime: el.taskEndTime.value || "",
      repeat: el.taskRepeat.value,
      reminder: el.taskReminder.checked,
      tag: el.taskTag.value.trim(),
      notes: el.taskNotes.value.trim(),
      subtasks: modalSubtasks.map((s) => ({ title: s.title })),
    };
    templates.push(tpl);
    saveTemplates();
    activeTemplateId = tpl.id;
    renderTemplateOptions();
    showSnackbar(`Template "${title}" saved`);
  });

  // ---------- Category manager ----------
  const NEW_CATEGORY_OPTION = "__new_category__";
  function renderCategorySelect() {
    const current = el.taskCategory.value;
    el.taskCategory.innerHTML = "";
    categories.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.key;
      opt.textContent = c.label;
      el.taskCategory.appendChild(opt);
    });
    // The moment you need a category that does not exist yet is while you are
    // filling in the task, and the manager is three taps away in the ⋮ menu.
    // This makes it reachable from the field itself.
    const add = document.createElement("option");
    add.value = NEW_CATEGORY_OPTION;
    add.textContent = "＋ New category…";
    el.taskCategory.appendChild(add);
    // Keep the open form's choice if it still exists, so renaming a category
    // while the modal is behind this panel does not silently reassign the task.
    el.taskCategory.value = categoryExists(current) ? current : categories[0].key;
  }
  // Which category the task form should adopt once one is added from inside it.
  let adoptNewCategoryInModal = false;
  // What the field held before "＋ New category…" was picked, so backing out of
  // the panel restores the choice instead of dropping to the first category.
  let lastRealCategory = "";
  el.taskCategory.addEventListener("focus", () => {
    if (el.taskCategory.value !== NEW_CATEGORY_OPTION) lastRealCategory = el.taskCategory.value;
  });
  el.taskCategory.addEventListener("change", () => {
    if (el.taskCategory.value !== NEW_CATEGORY_OPTION) {
      lastRealCategory = el.taskCategory.value;
      return;
    }
    // Never leave the field sitting on the placeholder: put it back on a real
    // category first, so cancelling out of the panel cannot save "＋ New…".
    el.taskCategory.value = categoryExists(lastRealCategory) ? lastRealCategory : categories[0].key;
    adoptNewCategoryInModal = true;
    openCategories();
    setTimeout(() => el.categoryNewName.focus(), 60);
  });
  function categoryUsageCount(key) {
    return tasks.filter((t) => t.category === key).length;
  }
  function renderCategoryList() {
    el.categoryList.innerHTML = "";
    categories.forEach((c) => {
      const row = document.createElement("div");
      row.className = "category-row";
      row.dataset.key = c.key;

      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "category-swatch";
      swatch.style.background = c.color;
      swatch.setAttribute("aria-label", `Change the colour of ${c.label}`);
      swatch.addEventListener("click", () => cycleCategoryColor(c.key));
      row.appendChild(swatch);

      const name = document.createElement("input");
      name.type = "text";
      name.className = "category-name";
      name.value = c.label;
      name.maxLength = 28;
      name.setAttribute("aria-label", `Name of the ${c.label} category`);
      const commit = () => {
        const next = name.value.trim();
        if (!next || next === c.label) { name.value = c.label; return; }
        c.label = next;
        saveCategories();
        renderCategorySelect();
        renderCategoryChips();
        renderAll();
      };
      name.addEventListener("blur", commit);
      name.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); name.blur(); } });
      row.appendChild(name);

      const count = document.createElement("span");
      count.className = "category-count";
      const n = categoryUsageCount(c.key);
      count.textContent = n === 1 ? "1 task" : `${n} tasks`;
      row.appendChild(count);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "category-delete";
      del.innerHTML = iconSvg("trash");
      if (c.key === CATEGORY_FALLBACK) {
        // Everything deleted lands here, so this one has to survive.
        del.disabled = true;
        del.title = "Other is where tasks go when their category is deleted";
      } else {
        del.title = `Delete ${c.label}`;
        del.addEventListener("click", () => deleteCategory(c.key));
      }
      row.appendChild(del);

      el.categoryList.appendChild(row);
    });
  }
  function cycleCategoryColor(key) {
    const c = categories.find((x) => x.key === key);
    if (!c) return;
    const i = CATEGORY_SWATCHES.indexOf(c.color);
    c.color = CATEGORY_SWATCHES[(i + 1) % CATEGORY_SWATCHES.length];
    saveCategories();
    renderCategoryList();
    renderCategoryChips();
    renderAll();
  }
  function deleteCategory(key) {
    const c = categories.find((x) => x.key === key);
    if (!c || key === CATEGORY_FALLBACK) return;
    const n = categoryUsageCount(key);
    const msg = n
      ? `Delete "${c.label}"? ${n} task${n === 1 ? "" : "s"} using it will move to Other — no task is deleted.`
      : `Delete "${c.label}"?`;
    showConfirm(msg, [
      { label: "Keep it", cancel: true },
      {
        label: "Delete",
        danger: true,
        onClick: () => {
          categories = categories.filter((x) => x.key !== key);
          // Reassign rather than orphan: a task pointing at a category that no
          // longer exists would drop out of every category filter.
          tasks.forEach((t) => { if (t.category === key) t.category = CATEGORY_FALLBACK; });
          if (activeCategories.has(key)) { activeCategories.delete(key); saveFilters(); }
          saveCategories();
          saveTasks();
          renderCategoryList();
          renderCategorySelect();
          renderCategoryChips();
          renderAll();
          showSnackbar(n ? `"${c.label}" deleted — ${n} task${n === 1 ? "" : "s"} moved to Other` : `"${c.label}" deleted`);
        },
      },
    ]);
  }
  function openCategories() {
    renderCategoryList();
    showOverlay(el.categoryOverlay, el.categoryPanel);
    pushOverlayState();
  }
  function closeCategories() {
    el.categoryOverlay.hidden = true;
    adoptNewCategoryInModal = false;
  }
  el.menuCategories.addEventListener("click", () => { closeMoreMenu(); openCategories(); });
  el.closeCategories.addEventListener("click", closeCategories);
  el.categoryOverlay.addEventListener("click", (e) => {
    if (e.target === el.categoryOverlay) closeCategories();
  });
  el.categoryAddForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const label = el.categoryNewName.value.trim();
    if (!label) return;
    if (categories.some((c) => c.label.toLowerCase() === label.toLowerCase())) {
      showSnackbar(`"${label}" is already on the list`);
      return;
    }
    // New ones go above Other, which stays the last resort at the bottom.
    const cat = { key: categoryKeyFrom(label), label, color: CATEGORY_SWATCHES[categories.length % CATEGORY_SWATCHES.length] };
    const at = categories.findIndex((c) => c.key === CATEGORY_FALLBACK);
    if (at === -1) categories.push(cat); else categories.splice(at, 0, cat);
    saveCategories();
    el.categoryNewName.value = "";
    renderCategoryList();
    renderCategorySelect();
    renderCategoryChips();
    if (adoptNewCategoryInModal) {
      // Came from the task form: pick the new one there and hand the form back
      // rather than leaving the user to find their way out of the panel.
      adoptNewCategoryInModal = false;
      el.taskCategory.value = cat.key;
      closeCategories();
      showSnackbar(`"${label}" added and selected`);
      return;
    }
    showSnackbar(`"${label}" added`);
  });

  // ---------- Photo attachment (modal) ----------
  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Could not read image"));
        img.onload = () => {
          // Attachments here are usually screenshots of drawings and comment
          // threads, so they have to stay legible when opened full screen.
          // 800px at 0.6 quality smeared that text beyond reading.
          const MAX_DIM = 1600;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) { height = Math.round(height * (MAX_DIM / width)); width = MAX_DIM; }
            else { width = Math.round(width * (MAX_DIM / height)); height = MAX_DIM; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          // A Blob, not a data URL: it goes straight into IndexedDB, and skips
          // the ~33% base64 inflation the old inline format paid for.
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))),
            "image/jpeg", 0.8);
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }
  function renderPhotoField() {
    const has = !!(modalPhoto || modalPhotoPendingUrl);
    if (modalPhotoPendingUrl) el.taskPhotoPreview.src = modalPhotoPendingUrl;
    else if (modalPhoto) setPhotoSrc(el.taskPhotoPreview, modalPhoto);
    else el.taskPhotoPreview.removeAttribute("src");
    el.taskPhotoPreview.hidden = !has;
    el.photoDropzonePrompt.hidden = has;
    el.photoDropzone.classList.toggle("has-photo", has);
    el.removePhotoBtn.hidden = !has;
  }
  // A newly picked photo is held in memory and only written to the store when
  // the form is submitted, so a cancelled edit cannot leave an orphan blob.
  function clearPendingPhoto() {
    if (modalPhotoPendingUrl) URL.revokeObjectURL(modalPhotoPendingUrl);
    modalPhotoPending = null;
    modalPhotoPendingUrl = "";
  }
  function setPendingPhoto(blob) {
    clearPendingPhoto();
    modalPhotoPending = blob;
    modalPhotoPendingUrl = URL.createObjectURL(blob);
  }
  // Resolves what the task's photo field should become, writing or deleting in
  // the store as needed. previousRef is what the task held before this edit.
  async function commitModalPhoto(previousRef) {
    if (modalPhotoPending) {
      const ref = await putPhoto(modalPhotoPending);
      if (previousRef && previousRef !== ref) await deletePhoto(previousRef);
      return ref;
    }
    if (!modalPhoto && previousRef) { await deletePhoto(previousRef); return ""; }
    return modalPhoto;
  }
  // ---------- Photo lightbox ----------
  // Opens an attachment full screen. Starts fitted to the window, and a tap
  // switches to natural size inside a scrollable stage, which is what makes the
  // fine text on a drawing or a comment thread actually readable.
  function openLightbox(src, alt) {
    if (!src) return;
    setPhotoSrc(el.lightboxImg, src);
    el.lightboxImg.alt = alt || "Attached photo, enlarged";
    el.lightboxStage.classList.remove("is-zoomed");
    el.lightboxStage.scrollTop = 0;
    el.lightboxStage.scrollLeft = 0;
    el.lightboxHint.textContent = "Tap the photo to zoom in";
    el.lightboxOverlay.hidden = false;
    pushOverlayState();
  }
  function closeLightbox() {
    el.lightboxOverlay.hidden = true;
    el.lightboxImg.src = "";
    el.lightboxStage.classList.remove("is-zoomed");
  }
  function toggleLightboxZoom() {
    const zoomed = el.lightboxStage.classList.toggle("is-zoomed");
    el.lightboxHint.textContent = zoomed ? "Tap again to fit to screen" : "Tap the photo to zoom in";
    if (!zoomed) { el.lightboxStage.scrollTop = 0; el.lightboxStage.scrollLeft = 0; }
  }
  el.lightboxImg.addEventListener("click", (e) => { e.stopPropagation(); toggleLightboxZoom(); });
  el.lightboxClose.addEventListener("click", closeLightbox);
  // Clicking the backdrop closes, but only the backdrop -- while zoomed the
  // stage is scrolled around, and a drag ending on it must not count as a tap.
  el.lightboxStage.addEventListener("click", (e) => {
    if (e.target === el.lightboxStage) closeLightbox();
  });
  el.lightboxOverlay.addEventListener("click", (e) => {
    if (e.target === el.lightboxOverlay) closeLightbox();
  });

  // One path for every way a photo can arrive -- file picker, drop, or paste.
  async function attachPhotoFile(file) {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      showSnackbar("That file isn't an image");
      return;
    }
    try {
      setPendingPhoto(await compressImageFile(file));
      modalPhoto = "";
      renderPhotoField();
    } catch (e) {
      showSnackbar("Could not attach that photo");
    }
  }

  el.photoDropzone.addEventListener("click", (e) => {
    // Once a photo is attached the preview fills the zone, and a tap there
    // should open it rather than reopen the file picker underneath.
    const shown = modalPhotoPendingUrl || modalPhoto;
    if (shown && e.target === el.taskPhotoPreview) {
      openLightbox(shown, "Attached photo, enlarged");
      return;
    }
    if (shown) return;
    el.taskPhotoInput.click();
  });
  el.photoDropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.taskPhotoInput.click(); }
  });
  el.taskPhotoInput.addEventListener("change", async () => {
    const file = el.taskPhotoInput.files[0];
    el.taskPhotoInput.value = "";
    await attachPhotoFile(file);
  });

  // dragenter/dragleave also fire when the pointer crosses onto a child, so a
  // plain toggle would flicker the highlight off mid-drag. Count depth instead.
  let photoDragDepth = 0;
  const setDragActive = (on) => el.photoDropzone.classList.toggle("is-dragover", on);
  el.photoDropzone.addEventListener("dragenter", (e) => {
    e.preventDefault();
    photoDragDepth++;
    setDragActive(true);
  });
  el.photoDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  });
  el.photoDropzone.addEventListener("dragleave", () => {
    photoDragDepth = Math.max(0, photoDragDepth - 1);
    if (photoDragDepth === 0) setDragActive(false);
  });
  el.photoDropzone.addEventListener("drop", async (e) => {
    e.preventDefault();
    photoDragDepth = 0;
    setDragActive(false);
    const dt = e.dataTransfer;
    if (!dt) return;
    const file = [...(dt.files || [])].find((f) => f.type.startsWith("image/")) || dt.files[0];
    await attachPhotoFile(file);
  });
  // The browser's default for a file dropped anywhere else is to navigate away
  // from the page, which would silently discard whatever was being edited.
  ["dragover", "drop"].forEach((type) => {
    document.addEventListener(type, (e) => {
      if (!el.photoDropzone.contains(e.target)) e.preventDefault();
    });
  });

  // Paste an image straight into the open modal. Only images are intercepted,
  // so pasting text into the title or notes still behaves normally.
  document.addEventListener("paste", async (e) => {
    if (el.modalOverlay.hidden) return;
    const items = [...((e.clipboardData && e.clipboardData.items) || [])];
    const imgItem = items.find((i) => i.kind === "file" && i.type.startsWith("image/"));
    if (!imgItem) return;
    e.preventDefault();
    await attachPhotoFile(imgItem.getAsFile());
  });

  el.removePhotoBtn.addEventListener("click", () => {
    clearPendingPhoto();
    modalPhoto = "";
    renderPhotoField();
  });

  // ---------- Modal ----------
  function openCreateModal() {
    editingTask = null;
    editingDateKey = null;
    el.taskForm.reset();
    modalSubtasks = [];
    renderSubtaskList();
    modalPhoto = "";
    clearPendingPhoto();
    renderPhotoField();
    el.modalTitle.textContent = "Log Item";
    clearQuickParse();
    el.quickParseHint.hidden = false;
    el.taskDate.value = selectedDate;
    el.taskDateDisplay.textContent = formatDateDisplay(selectedDate);
    el.taskTime.value = "";
    el.taskTimeDisplay.textContent = "No time set";
    el.taskEndTime.value = "";
    el.taskEndTimeDisplay.textContent = "No time set";
    el.taskCategory.value = "work";
    el.taskPriority.value = "medium";
    el.taskTag.value = "";
    el.taskRepeat.value = "none";
    resetRepeatFields(null);
    el.taskReminder.checked = true;
    el.templateRow.hidden = false;
    activeTemplateId = "";
    renderTemplateOptions();
    closeDatePicker();
    closeTimePicker();
    showOverlay(el.modalOverlay, el.taskForm);
    modalSnapshot = modalStateKey();
    pushOverlayState();
    setTimeout(() => el.taskTitle.focus({ preventScroll: true }), 50);
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
    el.taskEndTime.value = task.endTime || "";
    el.taskEndTimeDisplay.textContent = task.endTime ? formatTimeDisplay(task.endTime) : "No time set";
    el.taskRepeat.value = task.repeat;
    resetRepeatFields(task);
    el.taskReminder.checked = task.reminder;
    el.taskTag.value = task.tag || "";
    el.taskNotes.value = task.notes || "";
    modalSubtasks = (task.subtasks || []).map((s) => ({ ...s }));
    renderSubtaskList();
    modalPhoto = task.photo || "";
    clearPendingPhoto();
    renderPhotoField();
    el.modalTitle.textContent = "Edit Item";
    clearQuickParse();
    el.quickParseHint.hidden = true;
    el.templateRow.hidden = true;
    closeDatePicker();
    closeTimePicker();
    showOverlay(el.modalOverlay, el.taskForm);
    modalSnapshot = modalStateKey();
    pushOverlayState();
    setTimeout(() => el.taskTitle.focus({ preventScroll: true }), 50);
  }
  function closeModal() {
    clearPendingPhoto();
    el.modalOverlay.hidden = true;
    // Drop the baseline so a stale one can't make the next dismissal think
    // there are unsaved changes when the form has not been opened yet.
    modalSnapshot = null;
    closeDatePicker();
    closeTimePicker();
  }
  // Live quick-add: as the line is typed, the recognised parts are pushed into
  // the real form fields so they are visible and overridable, and echoed as
  // chips. Only in create mode -- rewriting an existing task's date because its
  // title happens to contain "Monday" would be a nasty surprise.
  let quickParsed = null;

  function clearQuickParse() {
    quickParsed = null;
    el.quickParse.hidden = true;
    el.quickParseChips.innerHTML = "";
  }
  function runQuickParse() {
    if (editingTask) return;
    const raw = el.taskTitle.value;
    const p = parseQuickAdd(raw);
    const hits = [];

    if (p.startDate) {
      el.taskDate.value = p.startDate;
      el.taskDateDisplay.textContent = formatDateDisplay(p.startDate);
      hits.push({ label: formatDateDisplay(p.startDate).replace(/,\s*\d{4}$/, ""), tone: "" });
    }
    if (p.time) {
      el.taskTime.value = p.time;
      el.taskTimeDisplay.textContent = formatTimeDisplay(p.time);
      hits.push({ label: formatTimeDisplay(p.time), tone: "" });
    }
    if (p.endTime) {
      el.taskEndTime.value = p.endTime;
      el.taskEndTimeDisplay.textContent = formatTimeDisplay(p.endTime);
      hits.push({ label: "→ " + formatTimeDisplay(p.endTime), tone: "" });
    }
    if (p.priority) {
      el.taskPriority.value = p.priority;
      hits.push({ label: p.priority, tone: p.priority === "high" ? "danger" : "" });
    }
    if (p.category) {
      el.taskCategory.value = p.category;
      hits.push({ label: catInfo(p.category).label, tone: "" });
    }
    if (p.tag) {
      el.taskTag.value = p.tag;
      hits.push({ label: "#" + p.tag, tone: "tag", tag: p.tag });
    }
    if (p.repeat) {
      el.taskRepeat.value = p.repeat;
      if (p.repeatDays) { modalRepeatDays = p.repeatDays.slice(); renderRepeatDays(); }
      if (p.repeatEvery) el.repeatEvery.value = String(p.repeatEvery);
      syncRepeatFields();
      hits.push({ label: repeatLabel({ repeat: p.repeat, repeatDays: p.repeatDays, repeatEvery: p.repeatEvery }), tone: "" });
    }

    quickParsed = hits.length ? p : null;
    el.quickParse.hidden = hits.length === 0;
    el.quickParseChips.innerHTML = "";
    hits.forEach((h) => {
      const chip = document.createElement("span");
      chip.className = "quick-parse-chip" + (h.tone ? " " + h.tone : "");
      if (h.tag) applyTagColor(chip, h.tag);
      chip.textContent = h.label;
      el.quickParseChips.appendChild(chip);
    });
  }
  el.taskTitle.addEventListener("input", runQuickParse);

  el.addTaskBtn.addEventListener("click", openCreateModal);
  el.cancelTask.addEventListener("click", closeModal);
  // Everything the form currently holds, as one comparable value. Snapshotted
  // when the modal opens so an accidental dismissal can tell "nothing typed"
  // from "work about to be thrown away".
  function modalStateKey() {
    return JSON.stringify({
      title: el.taskTitle.value.trim(),
      date: el.taskDate.value,
      time: el.taskTime.value,
      endTime: el.taskEndTime.value,
      category: el.taskCategory.value,
      priority: el.taskPriority.value,
      tag: el.taskTag.value.trim(),
      repeat: el.taskRepeat.value,
      repeatDays: modalRepeatDays.slice().sort(),
      repeatEvery: el.taskRepeat.value === "everyweeks" ? el.repeatEvery.value : "",
      repeatUntil: el.repeatUntil.value,
      reminder: el.taskReminder.checked,
      notes: el.taskNotes.value.trim(),
      // The pending URL stands in for a newly picked photo, which has no
      // reference yet -- without it, attaching one would not count as a change
      // and the discard guard would let it go silently.
      photo: modalPhotoPendingUrl || modalPhoto,
      subtasks: modalSubtasks.map((s) => ({ t: s.title, d: !!s.done })),
    });
  }
  function modalIsDirty() {
    return modalSnapshot !== null && modalStateKey() !== modalSnapshot;
  }
  // Used by every accidental route out -- backdrop tap, Escape, Back. The
  // Cancel button stays direct, since pressing it is a deliberate choice.
  function requestCloseModal() {
    if (!modalIsDirty()) { closeModal(); return; }
    showConfirm("Discard this item? What you typed will be lost.", [
      { label: "Keep editing", cancel: true },
      { label: "Discard", danger: true, onClick: closeModal },
    ]);
  }
  el.modalOverlay.addEventListener("click", (e) => {
    if (e.target === el.modalOverlay) requestCloseModal();
  });
  el.taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Strip the recognised tokens out of the saved title, but only if something
    // is actually left -- "tomorrow" alone should stay as the title rather than
    // saving an empty one.
    const title = (quickParsed && quickParsed.title) ? quickParsed.title : el.taskTitle.value.trim();
    if (!title) return;
    const startDate = el.taskDate.value || selectedDate;
    const category = el.taskCategory.value;
    const priority = el.taskPriority.value;
    const time = el.taskTime.value || "";
    const endTime = el.taskEndTime.value || "";
    if (time && endTime && endTime <= time) {
      showConfirm("End time must be after the start time.", [{ label: "OK" }]);
      return;
    }
    const reminder = time ? el.taskReminder.checked : false;
    const notes = el.taskNotes.value.trim();
    const tag = el.taskTag.value.trim();
    const repeat = el.taskRepeat.value;
    const repeatDays = repeat === "custom" ? modalRepeatDays.slice().sort() : [];
    const repeatEvery = repeat === "everyweeks" ? repeatEveryWeeks({ repeatEvery: el.repeatEvery.value }) : 0;
    const repeatUntil = repeat === "none" ? "" : (el.repeatUntil.value || "");
    if (repeat === "custom" && repeatDays.length === 0) {
      showConfirm("Pick at least one day for a custom repeat.", [{ label: "OK" }]);
      return;
    }
    if (repeatUntil && repeatUntil < startDate) {
      showConfirm("The repeat end date can't be before the task's own date.", [{ label: "OK" }]);
      return;
    }
    const subtasks = modalSubtasks.map((s) => ({ id: s.id, title: s.title, done: !!s.done }));
    const target = editingTask;
    const photo = await commitModalPhoto(target ? target.photo : "");
    // The store write above is async, so re-read the edit target rather than
    // trusting a module-level variable that closeModal() may have since reset.
    if (target) {
      Object.assign(target, { title, category, priority, time, endTime, reminder, notes, tag, repeat, repeatDays, repeatEvery, repeatUntil, subtasks, startDate, photo });
    } else {
      tasks.push({
        id: uid(),
        title, category, priority, time, endTime, reminder, notes, tag, subtasks, photo,
        repeat, repeatDays, repeatEvery, repeatUntil,
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
    let m = viewMonth - 1, y = viewYear;
    if (m < 0) { m = 11; y--; }
    setViewedMonth(y, m);
  });
  el.nextMonth.addEventListener("click", () => {
    let m = viewMonth + 1, y = viewYear;
    if (m > 11) { m = 0; y++; }
    setViewedMonth(y, m);
  });
  // Both toggles share one chevron icon that rotates, rather than swapping
  // between typed arrow characters -- the two used to disagree (U+25BC vs the
  // "SMALL" U+25BE), so the insights arrow rendered visibly smaller than the
  // calendar one and changed size when toggled.
  el.calendarToggle.addEventListener("click", () => {
    calendarOpen = !calendarOpen;
    el.calendarSection.style.display = calendarOpen ? "" : "none";
    el.calendarToggleLabel.textContent = calendarOpen ? "Hide calendar" : "Show calendar";
    el.calendarToggle.classList.toggle("is-open", calendarOpen);
  });
  el.insightsToggle.addEventListener("click", () => {
    insightsOpen = !insightsOpen;
    el.insightsPanel.hidden = !insightsOpen;
    el.insightsToggleLabel.textContent = insightsOpen ? "Hide insights" : "Show insights";
    el.insightsToggle.classList.toggle("is-open", insightsOpen);
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
      // Share the Back button's stack rather than keeping a second copy of it.
      // The two lists had already drifted once -- a newly added overlay was
      // dismissable with Back but Escape closed whatever sat underneath it.
      if (!closeTopmostOverlay() && !el.snackbar.hidden) hideSnackbar();
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
        showReminderBanner(`${t.title} — ${timeRangeLabel(t)}`, t, nowKey);
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
  // Chrome only fires beforeinstallprompt once it decides the user is
  // "engaged enough" -- on desktop that can take a while (or never happen in
  // a short visit), which left the floating install button permanently
  // hidden with no other way in. The always-visible menu item below is the
  // reliable fallback: it uses the native prompt when available, and falls
  // back to plain-language manual instructions (which vary a lot by browser)
  // when it isn't.
  function isStandaloneDisplay() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
  }
  function installHelpMessage() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    if (isIOS) {
      return "Sa Safari: pindutin ang Share button (nasa ibaba, may nakataas na arrow), tapos piliin ang 'Add to Home Screen'.";
    }
    if (/Android/.test(ua)) {
      return "Sa Chrome: buksan ang ⋮ menu ng BROWSER (nasa itaas-kanan ng screen, hindi ang menu ng app na ito), tapos piliin ang 'Install app' o 'Add to Home screen'.";
    }
    return "Sa Chrome o Edge: hanapin ang install icon sa kanang bahagi ng address bar (⊕ o katulad), o buksan ang ⋮ menu ng BROWSER (hindi ng app) at piliin ang 'Install Daily Task Tracker & Planner...'.\n\nKung wala pa ring lumalabas: mag-browse muna ng ilang saglit o i-refresh ang page -- minsan naghihintay pa ang browser ng ilang segundo bago mag-alok ng install option.";
  }
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
  window.addEventListener("appinstalled", () => { el.installBtn.hidden = true; el.menuInstall.hidden = true; });
  if (isStandaloneDisplay()) el.menuInstall.hidden = true;
  el.menuInstall.addEventListener("click", async () => {
    closeMoreMenu();
    if (deferredInstallEvent) {
      deferredInstallEvent.prompt();
      await deferredInstallEvent.userChoice;
      deferredInstallEvent = null;
      el.installBtn.hidden = true;
    } else {
      showConfirm(installHelpMessage(), [{ label: "OK" }]);
    }
  });

  // ---------- Service worker (+ update notice) ----------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").then((reg) => {
        function promptUpdate(worker) {
          showSnackbar("A new version is available.", () => {
            worker.postMessage("SKIP_WAITING");
          }, "Refresh");
        }
        // A worker already sitting in "waiting" (installed while no tab had
        // focus) means an update is ready right now.
        if (reg.waiting && navigator.serviceWorker.controller) {
          promptUpdate(reg.waiting);
        }
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              promptUpdate(reg.waiting || newWorker);
            }
          });
        });
      }).catch((e) => {
        console.warn("Service worker registration failed", e);
      });

      // Reload once the new worker actually takes control -- only happens
      // after the user clicks "Refresh" above and posts SKIP_WAITING.
      let refreshedOnce = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshedOnce) return;
        refreshedOnce = true;
        window.location.reload();
      });
    });
  }

  // ---------- Onboarding coach hints ----------
  const HINTS_SEEN_KEY = "dailyLog.hintsSeen.v1";
  const hintsShownThisSession = new Set();
  let activeHintEl = null;
  let activeHintOutsideClickHandler = null;

  function getSeenHints() {
    try { return JSON.parse(localStorage.getItem(HINTS_SEEN_KEY)) || {}; } catch { return {}; }
  }
  function markHintSeen(key) {
    const seen = getSeenHints();
    seen[key] = true;
    localStorage.setItem(HINTS_SEEN_KEY, JSON.stringify(seen));
  }
  function dismissHint() {
    if (activeHintOutsideClickHandler) {
      document.removeEventListener("click", activeHintOutsideClickHandler);
      activeHintOutsideClickHandler = null;
    }
    if (activeHintEl) { activeHintEl.remove(); activeHintEl = null; }
  }
  function showCoachHint(key, targetEl, text, placement) {
    if (hintsShownThisSession.has(key) || getSeenHints()[key] || !targetEl) return;
    hintsShownThisSession.add(key);
    markHintSeen(key);
    dismissHint();

    const bubble = document.createElement("div");
    bubble.className = "coach-hint";
    const p = document.createElement("p");
    p.className = "coach-hint-text";
    p.textContent = text;
    const actions = document.createElement("div");
    actions.className = "coach-hint-actions";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Got it";
    btn.addEventListener("click", dismissHint);
    actions.appendChild(btn);
    bubble.append(p, actions);
    document.body.appendChild(bubble);

    const rect = targetEl.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    let top, arrowSide;
    if (placement === "above") {
      top = rect.top - bubbleRect.height - 10;
      arrowSide = "bottom";
    } else {
      top = rect.bottom + 10;
      arrowSide = "top";
    }
    top = Math.max(8, Math.min(top, window.innerHeight - bubbleRect.height - 8));
    let left = rect.left + rect.width / 2 - bubbleRect.width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - bubbleRect.width - 12));
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;

    const arrow = document.createElement("div");
    arrow.className = `coach-hint-arrow ${arrowSide}`;
    const arrowLeft = Math.min(Math.max(rect.left + rect.width / 2 - left - 5, 10), bubbleRect.width - 20);
    arrow.style.left = `${arrowLeft}px`;
    bubble.appendChild(arrow);

    activeHintEl = bubble;
    setTimeout(() => { if (activeHintEl === bubble) dismissHint(); }, 8000);
    const outsideClickHandler = (e) => {
      if (bubble.contains(e.target)) return;
      dismissHint();
    };
    activeHintOutsideClickHandler = outsideClickHandler;
    setTimeout(() => {
      if (activeHintOutsideClickHandler === outsideClickHandler) {
        document.addEventListener("click", outsideClickHandler);
      }
    }, 50);
  }
  function maybeShowTabsHint() {
    showCoachHint("tabs", el.viewTabs, "New: Home shows what's overdue and due soon. Board groups your tasks by client/project.", "below");
  }
  function maybeShowSwipeHint() {
    if (hintsShownThisSession.has("swipe") || getSeenHints().swipe) return;
    const firstRow = el.taskList.querySelector(".task-row");
    if (!firstRow) return;
    showCoachHint("swipe", firstRow, "Swipe right to complete, swipe left to delete. Long-press a task to move it to another date.", "below");
  }

  // ---------- Init ----------
  hydrateIcons();
  initTheme();
  loadFilters();
  el.sortSelect.value = sortMode;
  populateMonthYearSelects();
  renderCategorySelect();
  renderCategoryChips();
  renderPriorityChips();
  renderAll();

  // Move any pre-IndexedDB inline photos out of localStorage, then reclaim
  // blobs whose task is gone. Both run after the first paint -- neither is
  // needed to draw the app, and blocking startup on disk work would be felt.
  migrateInlinePhotos()
    .then((moved) => { if (moved) renderAll(); })
    .then(sweepOrphanPhotos)
    .catch((e) => console.error("photo store startup failed", e));

  const splash = document.getElementById("splashScreen");
  if (splash) {
    setTimeout(() => {
      splash.classList.add("hide");
      // Give the skeleton placeholder a brief, real moment on screen right as
      // the splash fades -- reassuring "the app is loading" feedback on every
      // refresh, not just first launch. The task list itself has already
      // rendered underneath by this point; this just reveals it.
      setTimeout(() => el.punchlist.classList.remove("is-loading"), 350);
      setTimeout(() => splash.remove(), 450);
    }, 650);
  } else {
    el.punchlist.classList.remove("is-loading");
  }
  setTimeout(maybeShowTabsHint, splash ? 1450 : 500);
})();
