const exerciseIcons = {
  running: "🏃", walking: "🚶", cycling: "🚴", swimming: "🏊",
  yoga: "🧘", weightlifting: "🏋️", hiit: "⚡", dancing: "💃", other: "🏅"
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GOALS = { steps: 10000, calories: 500, time: 60, workouts: 3 };

let activities = [];

// --- Storage ---
function loadData() {
  const saved = localStorage.getItem("fitnessActivities");
  if (saved) activities = JSON.parse(saved);
}

function saveData() {
  localStorage.setItem("fitnessActivities", JSON.stringify(activities));
}

// --- Helpers ---
function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function getTodayActivities() {
  const today = todayKey();
  return activities.filter(a => a.date === today);
}

function getDayActivities(dateStr) {
  return activities.filter(a => a.date === dateStr);
}

function sum(arr, key) {
  return arr.reduce((s, a) => s + (Number(a[key]) || 0), 0);
}

function showToast(msg) {
  let toast = document.querySelector(".success-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "success-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// --- Tabs ---
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
    if (tab.dataset.tab === "history") renderHistory();
  });
});

// --- Dashboard ---
function renderDashboard() {
  const todayActs = getTodayActivities();
  const steps = sum(todayActs, "steps");
  const calories = sum(todayActs, "calories");
  const time = sum(todayActs, "duration");
  const workouts = todayActs.length;

  document.getElementById("totalSteps").textContent = steps.toLocaleString();
  document.getElementById("totalCalories").textContent = calories.toLocaleString();
  document.getElementById("totalTime").textContent = time;
  document.getElementById("totalWorkouts").textContent = workouts;

  setProgress("stepsProgress", steps, GOALS.steps);
  setProgress("calProgress", calories, GOALS.calories);
  setProgress("timeProgress", time, GOALS.time);
  setProgress("workoutProgress", workouts, GOALS.workouts);

  document.getElementById("stepsGoal").textContent = `${steps.toLocaleString()} / ${GOALS.steps.toLocaleString()}`;
  document.getElementById("calGoal").textContent = `${calories} / ${GOALS.calories}`;
  document.getElementById("timeGoal").textContent = `${time} / ${GOALS.time}`;
  document.getElementById("workoutGoal").textContent = `${workouts} / ${GOALS.workouts}`;

  renderWeeklyChart();
}

function setProgress(id, value, goal) {
  const pct = Math.min((value / goal) * 100, 100);
  document.getElementById(id).style.width = pct + "%";
}

function renderWeeklyChart() {
  const chart = document.getElementById("weeklyChart");
  chart.innerHTML = "";

  const today = new Date();
  const weekData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const acts = getDayActivities(key);
    weekData.push({
      day: DAYS[d.getDay()],
      steps: sum(acts, "steps"),
      calories: sum(acts, "calories")
    });
  }

  const maxSteps = Math.max(...weekData.map(d => d.steps), 1);
  const maxCal = Math.max(...weekData.map(d => d.calories), 1);

  weekData.forEach(d => {
    const col = document.createElement("div");
    col.className = "day-bars";

    const pair = document.createElement("div");
    pair.className = "bar-pair";

    const sBar = document.createElement("div");
    sBar.className = "bar steps-bar";
    sBar.style.height = (d.steps / maxSteps) * 140 + "px";
    sBar.title = `${d.steps} steps`;

    const cBar = document.createElement("div");
    cBar.className = "bar cal-bar";
    cBar.style.height = (d.calories / maxCal) * 140 + "px";
    cBar.title = `${d.calories} cal`;

    pair.appendChild(sBar);
    pair.appendChild(cBar);

    const label = document.createElement("div");
    label.className = "day-label";
    label.textContent = d.day;

    col.appendChild(pair);
    col.appendChild(label);
    chart.appendChild(col);
  });
}

// --- Log Form ---
document.getElementById("activityForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const activity = {
    id: Date.now(),
    date: todayKey(),
    type: document.getElementById("exerciseType").value,
    duration: Number(document.getElementById("duration").value),
    calories: Number(document.getElementById("calories").value),
    steps: Number(document.getElementById("steps").value) || 0,
    notes: document.getElementById("notes").value.trim()
  };

  activities.push(activity);
  saveData();
  e.target.reset();
  renderDashboard();
  showToast("Activity logged!");
});

// --- History ---
function renderHistory() {
  const list = document.getElementById("historyList");
  const sorted = [...activities].sort((a, b) => b.id - a.id);

  if (sorted.length === 0) {
    list.innerHTML = '<p class="empty-msg">No activities logged yet.</p>';
    return;
  }

  list.innerHTML = sorted.map(a => {
    const d = new Date(a.date + "T12:00:00");
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const icon = exerciseIcons[a.type] || "🏅";
    const meta = [`${a.duration} min`, `${a.calories} cal`];
    if (a.steps > 0) meta.push(`${a.steps.toLocaleString()} steps`);

    return `
      <div class="history-item">
        <div class="history-icon">${icon}</div>
        <div class="history-details">
          <div class="history-type">${a.type}</div>
          <div class="history-meta">${dateStr}${a.notes ? " — " + a.notes : ""}</div>
          <div class="history-stats">${meta.map(m => `<span>${m}</span>`).join("")}</div>
        </div>
        <button class="history-delete" data-id="${a.id}" title="Delete">✕</button>
      </div>`;
  }).join("");

  list.querySelectorAll(".history-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      activities = activities.filter(a => a.id !== Number(btn.dataset.id));
      saveData();
      renderHistory();
      renderDashboard();
      showToast("Activity deleted");
    });
  });
}

document.getElementById("clearAllBtn").addEventListener("click", () => {
  if (confirm("Delete all activity history?")) {
    activities = [];
    saveData();
    renderHistory();
    renderDashboard();
    showToast("All data cleared");
  }
});

// --- Init ---
function initDate() {
  const now = new Date();
  document.getElementById("dateDisplay").textContent = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}

loadData();
initDate();
renderDashboard();
