
// === DNTN STATS.JS – FORENKLET FOR MONTH + EVENTSELECT ===
let players = [];
let currentSort = { column: null, ascending: true };
let currentData = "";

const themes = ["light-theme", "dark-theme", "plasma-theme", "sunset-theme"];
const themeSelect = document.getElementById("themeSelect");
const monthFilter = document.getElementById("monthFilter");
const eventSelect = document.getElementById("eventSelect");

const eventLabels = {
  AR: "The Archipelago Raid",
  GW: "Genesis War",
  IR: "Island Raid",
  AL: "Alliance League",
  DS: "District Showdown"
};

function applyTheme(theme) {
  document.body.classList.remove(...themes);
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);
  themeSelect.value = theme;
}

themeSelect.addEventListener("change", (e) => {
  applyTheme(e.target.value);
});

function parseFileName(filename) {
  const match = filename.match(/^([A-Z]+)_([A-Za-z]+)\.json$/);
  if (!match) return null;
  return {
    event: match[1],
    month: match[2],
    filename: filename.replace(".json", "")
  };
}

function loadData(file) {
  fetch(`assets/data/${file}.json`)
    .then(res => res.json())
    .then(data => {
      players = data.sort((a, b) => b.points - a.points);
      currentSort = { column: "points", ascending: false };
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

  data.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.name}</td>
      <td>${p.might.toLocaleString()}</td>
      <td>${p.killsTotal.toLocaleString()}</td>
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

function cleanString(str) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function applyFilters() {
  const nameFilter = cleanString(document.getElementById("searchName").value);
  const idFilter = document.getElementById("searchID").value.trim();
  let filtered = players.filter(p =>
    cleanString(p.name).includes(nameFilter) &&
    (idFilter === "" || p.id.toString().includes(idFilter))
  );
  renderTable(filtered);
}

document.getElementById("searchName").addEventListener("input", applyFilters);
document.getElementById("searchID").addEventListener("input", applyFilters);
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("searchName").value = "";
  document.getElementById("searchID").value = "";
  monthFilter.value = "";
  renderEventSelect(filteredList);
  renderTable(players);
});

let parsedFiles = [];
let filteredList = [];

function renderEventSelect(files) {
  eventSelect.innerHTML = '<option value="">Select event...</option>';
  files.forEach(f => {
    const label = `${eventLabels[f.event] || f.event} – ${f.month}`;
    const opt = document.createElement("option");
    opt.value = f.filename;
    opt.textContent = label;
    eventSelect.appendChild(opt);
  });
}

monthFilter.addEventListener("change", () => {
  const selectedMonth = monthFilter.value;
  filteredList = parsedFiles.filter(f => selectedMonth === "" || f.month === selectedMonth);
  renderEventSelect(filteredList);
});

eventSelect.addEventListener("change", e => {
  currentData = e.target.value;
  loadData(currentData);
});

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme") || "light-theme";
  applyTheme(saved);

  fetch("assets/data/index.json")
    .then(res => res.json())
    .then(fileList => {
      parsedFiles = fileList.map(parseFileName).filter(Boolean);
      const uniqueMonths = [...new Set(parsedFiles.map(f => f.month))];
      monthFilter.innerHTML = '<option value="">All months</option>';
      uniqueMonths.forEach(month => {
        const opt = document.createElement("option");
        opt.value = month;
        opt.textContent = month;
        monthFilter.appendChild(opt);
      });
      filteredList = parsedFiles;
      renderEventSelect(parsedFiles);
      if (parsedFiles.length > 0) {
        currentData = parsedFiles[0].filename;
        loadData(currentData);
      }
    });
});
