// === genesis.js med Top 10-visning ved oppstart ===
let players = [];
let currentSort = { column: null, ascending: true };
let currentData = "";
let allFiles = [];
let filteredFiles = [];

const themes = ["light-theme", "dark-theme", "plasma-theme", "sunset-theme"];
const themeSelect = document.getElementById("themeSelect");
const monthFilter = document.getElementById("monthFilter");
const eventSelect = document.getElementById("eventSelect");

const eventLabels = {
  AR: "The Archipelago Raid",
  GW: "Genesis War",
  IR: "Island Raid",
  AL: "Alliance League",
  DS: "District Showdown",
  IR2: "Island Raid 2"
};

function applyTheme(theme) {
  document.body.classList.remove(...themes);
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);
  themeSelect.value = theme;
}

themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));

function loadData(file) {
  fetch(`assets/data/${file}`)
    .then(res => res.json())
    .then(data => {
      players = data.sort((a, b) => b.points - a.points);
      currentSort = { column: "points", ascending: false };
      document.getElementById("topPlayers").style.display = "none";
      renderTable(players);
    });
}

function renderTable(data) {
  const container = document.getElementById("tableContainer");
  container.innerHTML = "";
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th data-col="name">Navn</th>
        <th data-col="might">Might</th>
        <th data-col="killsTotal">Kills</th>
        <th data-col="points">Points</th>
        <th>ID</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");

  data.forEach(p => {
    const row = document.createElement("tr");
    const killsTotal = p.killsT1 + p.killsT2 + p.killsT3 + p.killsT4 + p.killsT5 + p.killsT6;
    row.innerHTML = `
      <td>${p.name}</td>
      <td>${p.might.toLocaleString()}</td>
      <td>${killsTotal.toLocaleString()}</td>
      <td>${p.points.toLocaleString()}</td>
      <td>${p.id}</td>
    `;

    row.addEventListener("click", () => {
      const openCard = document.querySelector(".detail-row");
      if (openCard) openCard.remove();
      if (row.classList.contains("active")) {
        row.classList.remove("active");
        return;
      }
      document.querySelectorAll("tr").forEach(r => r.classList.remove("active"));
      row.classList.add("active");
      const detailRow = document.createElement("tr");
      detailRow.className = "detail-row";
      const detailCell = document.createElement("td");
      detailCell.colSpan = 5;
      detailCell.innerHTML = `
        <div class="detail-card">
          <strong>${p.name}</strong>
          <div class="kill-grid">
            <div><span>T1:</span> ${p.killsT1.toLocaleString()}</div>
            <div><span>T4:</span> ${p.killsT4.toLocaleString()}</div>
            <div><span>T2:</span> ${p.killsT2.toLocaleString()}</div>
            <div><span>T5:</span> ${p.killsT5.toLocaleString()}</div>
            <div><span>T3:</span> ${p.killsT3.toLocaleString()}</div>
            <div><span>T6:</span> ${p.killsT6.toLocaleString()}</div>
            <div><span>Reward:</span> ${p.reward || "-"}</div>
          </div>
        </div>
      `;
      detailRow.appendChild(detailCell);
      tbody.insertBefore(detailRow, row.nextSibling);
    });

    tbody.appendChild(row);
  });

  table.querySelectorAll("th[data-col]").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      const asc = currentSort.column === col ? !currentSort.ascending : true;
      currentSort = { column: col, ascending: asc };
      players.sort((a, b) => {
        if (typeof a[col] === "string") {
          return asc ? a[col].localeCompare(b[col]) : b[col].localeCompare(a[col]);
        } else {
          return asc ? a[col] - b[col] : b[col] - a[col];
        }
      });
      renderTable(players);
    });
  });

  container.appendChild(table);
}

function renderTopPlayers(players) {
  const topSection = document.getElementById("topPlayers");
  const list = document.getElementById("topPlayersList");
  list.innerHTML = "";
  players.slice(0, 10).forEach((p, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${index + 1}. <strong>${p.name}</strong> – ${p.points.toLocaleString()} pts`;
    list.appendChild(li);
  });
  topSection.style.display = "block";
}

function cleanString(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function applyFilters() {
  const nameFilter = cleanString(document.getElementById("searchName").value);
  const idFilter = document.getElementById("searchID").value.trim();
  const filtered = players.filter(p =>
    cleanString(p.name).includes(nameFilter) &&
    (idFilter === "" || p.id.toString().includes(idFilter))
  );
  renderTable(filtered);
}

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("searchName").value = "";
  document.getElementById("searchID").value = "";
  monthFilter.value = "";

  const eventFilter = document.getElementById("eventFilter");
  if (eventFilter) eventFilter.value = "";

  filteredFiles = allFiles;
  renderEventOptions(filteredFiles);

  // 🧹 Tøm tabellen fra tidligere event
  const tableContainer = document.getElementById("tableContainer");
  if (tableContainer) tableContainer.innerHTML = "";

  // 🟢 Vis toppliste igjen
  document.getElementById("topPlayers").style.display = "block";

  // 🔁 Tegn topplisten på nytt
  initDashboardStats(allFiles);
   location.reload();
});

monthFilter.addEventListener("change", () => {
  const selectedMonth = monthFilter.value?.trim().toLowerCase();
  filteredFiles = selectedMonth
    ? allFiles.filter(f => f.month?.trim().toLowerCase() === selectedMonth)
    : allFiles;
  renderEventOptions(filteredFiles);
});

eventSelect.addEventListener("change", e => {
  const selectedFile = e.target.value;
  if (selectedFile) {
    currentData = selectedFile;
    loadData(currentData);
  }
});

function renderMonthOptions(files) {
  const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const uniqueMonths = [...new Set(files.map(f => f.month))];
  const sortedMonths = monthOrder.filter(m => uniqueMonths.includes(m));
  monthFilter.innerHTML = '<option value="">All months</option>';
  sortedMonths.forEach(month => {
    const opt = document.createElement("option");
    opt.value = month;
    opt.textContent = month;
    monthFilter.appendChild(opt);
  });
}

function renderEventOptions(files) {
  eventSelect.innerHTML = '<option value="">Select event...</option>';
  files.forEach(file => {
    const opt = document.createElement("option");
    opt.value = file.file;
    opt.textContent = (eventLabels[file.event] || file.event) + " – " + file.month;
    eventSelect.appendChild(opt);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light-theme";
  applyTheme(savedTheme);

  fetch("assets/data/index.json")
    .then(res => res.json())
    .then(data => {
      allFiles = data;
      filteredFiles = allFiles;
      renderMonthOptions(allFiles);
      renderEventOptions(allFiles);
      initDashboardStats(allFiles);
    }); // ← denne manglet hos deg
}); // ← og denne også


      // === Alliance Stats Summary: Multi-stat Dashboard ===
function renderTopPlayers(players) {
  const list = document.getElementById("topPlayers");
  list.innerHTML = "";
  players.slice(0, 10).forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${i + 1}. <strong>${p.name}</strong> – ${p.points.toLocaleString()} pts`;
    list.appendChild(li);
  });
}

function renderTopKills(players) {
  const list = document.getElementById("topKills");
  list.innerHTML = "";
  players.slice(0, 10).forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${i + 1}. <strong>${p.name}</strong> – ${p.kills.toLocaleString()} kills`;
    list.appendChild(li);
  });
}

function renderTopEvents(players) {
  const list = document.getElementById("topEvents");
  list.innerHTML = "";
  players.slice(0, 10).forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${i + 1}. <strong>${p.name}</strong> – ${p.events} events`;
    list.appendChild(li);
  });
}

function renderTopSingleScores(players) {
  const list = document.getElementById("topSingle");
  list.innerHTML = "";
  players.slice(0, 10).forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${i + 1}. <strong>${p.name}</strong> – ${p.best.toLocaleString()} pts`;
    list.appendChild(li);
  });
}

function renderUniquePlayerCount(count) {
  const box = document.getElementById("uniquePlayers");
  box.textContent = count.toLocaleString();
}

function initDashboardStats(allFiles) {
  Promise.all(
    allFiles.map(file => fetch(`assets/data/${file.file}`).then(res => res.json()))
  ).then(results => {
    const merged = {};
    const unique = new Set();

    results.flat().forEach(p => {
      const key = p.id || p.name;
      if (!key) return;
      unique.add(key);

      if (!merged[key]) {
        merged[key] = {
          name: p.name || "Unknown",
          points: p.points || 0,
          kills: 0,
          events: 1,
          best: p.points || 0
        };
      } else {
        merged[key].points += p.points || 0;
        merged[key].events++;
        if ((p.points || 0) > merged[key].best) merged[key].best = p.points;
      }

      for (let i = 1; i <= 6; i++) {
        merged[key].kills += p[`killsT${i}`] || 0;
      }
    });

    const all = Object.values(merged);
    renderTopPlayers([...all].sort((a, b) => b.points - a.points));
    renderTopKills([...all].sort((a, b) => b.kills - a.kills));
    renderTopEvents([...all].sort((a, b) => b.events - a.events));
    renderTopSingleScores([...all].sort((a, b) => b.best - a.best));
    renderUniquePlayerCount(unique.size);
  });
}

// Kjør ved DOM load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light-theme";
  applyTheme(savedTheme);

  fetch("assets/data/index.json")
    .then(res => res.json())
    .then(data => {
      allFiles = data;
      filteredFiles = allFiles;
      renderMonthOptions(allFiles);
      renderEventOptions(allFiles);
      initDashboardStats(allFiles);
    });
});
