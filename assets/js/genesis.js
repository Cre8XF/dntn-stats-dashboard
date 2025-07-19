let players = [];
let currentSort = { column: null, ascending: true };
let currentData = "GW_July";

function loadData(file) {
  fetch(`assets/data/${file}.json`)
    .then(res => res.json())
    .then(data => {
      // Sorter etter points synkende ved lasting
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

  data.forEach((p, index) => {
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
          <strong>${p.name}</strong><br/>
          T1: ${p.killsT1} | T2: ${p.killsT2} | T3: ${p.killsT3} | T4: ${p.killsT4}<br/>
          T5: ${p.killsT5} | T6: ${p.killsT6}
        </div>
      `;
      detailRow.appendChild(detailCell);
      tbody.insertBefore(detailRow, row.nextSibling);
    });

    tbody.appendChild(row);
  });

  // Add sort listeners
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
  return str
    .normalize("NFD")                     // dekomponer spesialtegn
    .replace(/[\u0300-\u036f]/g, "")      // fjern aksenter
    .replace(/[^a-zA-Z0-9]/g, "")         // fjern alle symboler og spesialtegn
    .toLowerCase();
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

// 🟢 Oppdaterte event listeners:
document.getElementById("searchName").addEventListener("input", applyFilters);
document.getElementById("searchID").addEventListener("input", applyFilters);

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("searchName").value = "";
  document.getElementById("searchID").value = "";
  renderTable(players);
});

document.getElementById("eventSelect").addEventListener("change", e => {
  currentData = e.target.value;
  loadData(currentData);
});

loadData(currentData);
