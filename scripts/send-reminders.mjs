// Runs on a GitHub Actions schedule (see .github/workflows/send-reminders.yml).
// Scans every synced task list in Firestore for due, un-notified reminders and
// pushes them via FCM. This mirrors app.js's own occursOn/isDoneOn/isNotifiedOn
// logic exactly, and writes the same notified flags back to the task objects,
// so a push sent here and a local in-app reminder never double-fire and any
// connected client picks up the "already notified" state on its next sync.
import admin from "firebase-admin";

const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!svcJson) {
  // Exit 0 (not a failure) so this doesn't spam failed-run notifications
  // every 5 minutes before the FIREBASE_SERVICE_ACCOUNT secret is set up.
  console.log("FIREBASE_SERVICE_ACCOUNT secret not set yet -- skipping this run.");
  process.exit(0);
}

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(svcJson)) });
const db = admin.firestore();
const messaging = admin.messaging();

const REMINDER_TZ = "Asia/Manila";

function nowInManila() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: REMINDER_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
  const nowMin = (Number(parts.hour) % 24) * 60 + Number(parts.minute);
  return { dateKey, nowMin };
}
function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function matchesRepeat(task, dateObj) {
  const startObj = parseDateKey(task.startDate);
  if (dateObj < startObj) return false;
  if (task.repeat === "daily") return true;
  if (task.repeat === "weekdays") { const wd = dateObj.getDay(); return wd >= 1 && wd <= 5; }
  if (task.repeat === "weekly") return dateObj.getDay() === startObj.getDay();
  return false;
}
function occursOn(task, dateKey, dateObj) {
  if (task.repeat === "none") return task.startDate === dateKey;
  if (task.skipped && task.skipped[dateKey]) return false;
  return matchesRepeat(task, dateObj);
}
function isDoneOn(task, dateKey) {
  return task.repeat === "none" ? !!task.done : !!(task.completions && task.completions[dateKey]);
}
function isNotifiedOn(task, dateKey) {
  return task.repeat === "none" ? !!task.notified : !!(task.notifiedDates && task.notifiedDates[dateKey]);
}
function setNotifiedOn(task, dateKey) {
  if (task.repeat === "none") task.notified = true;
  else { task.notifiedDates = task.notifiedDates || {}; task.notifiedDates[dateKey] = true; }
}
function getSnoozeUntil(task, dateKey) {
  return task.repeat === "none" ? (task.snoozeUntil || 0) : ((task.snoozeDates && task.snoozeDates[dateKey]) || 0);
}

async function run() {
  const { dateKey, nowMin } = nowInManila();
  const dateObj = parseDateKey(dateKey);

  const snap = await db.collection("syncGroups").get();
  console.log(`Checking ${snap.size} synced task list(s) at ${dateKey} ${nowMin}min (Asia/Manila)`);

  for (const doc of snap.docs) {
    const data = doc.data();
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const tokens = Array.isArray(data.fcmTokens) ? data.fcmTokens.filter(Boolean) : [];
    if (!tokens.length) continue;

    let changed = false;
    const deadTokens = new Set();

    for (const t of tasks) {
      if (!t.reminder || !t.time) continue;
      if (!occursOn(t, dateKey, dateObj)) continue;
      if (isDoneOn(t, dateKey)) continue;
      if (isNotifiedOn(t, dateKey)) continue;
      const snoozeUntil = getSnoozeUntil(t, dateKey);
      if (snoozeUntil && Date.now() < snoozeUntil) continue;
      const [h, m] = t.time.split(":").map(Number);
      if (h * 60 + m > nowMin) continue;

      for (const token of tokens) {
        try {
          await messaging.send({
            token,
            data: {
              title: "Daily Task Tracker & Planner",
              body: `${t.title} — ${t.time}`,
              tag: `${t.id}-${dateKey}`,
            },
          });
        } catch (e) {
          console.error(`send failed for doc ${doc.id}, task ${t.id}:`, e.message);
          if (e.code === "messaging/registration-token-not-registered") deadTokens.add(token);
        }
      }
      setNotifiedOn(t, dateKey);
      changed = true;
      console.log(`Notified doc ${doc.id}: "${t.title}" (${t.time})`);
    }

    const updates = {};
    if (changed) updates.tasks = tasks;
    if (deadTokens.size) updates.fcmTokens = tokens.filter((tok) => !deadTokens.has(tok));
    if (Object.keys(updates).length) {
      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      updates.updatedAtLocal = Date.now();
      await doc.ref.set(updates, { merge: true });
    }
  }
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
