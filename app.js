let products = [];
let lines = [];

async function loadCatalog() {
  const res = await fetch("data/products.json");
  products = await res.json();
  renderCatalog();
}

function renderCatalog(filter = "") {
  const container = document.getElementById("catalog");
  container.innerHTML = "";
  const filtered = products.products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );
  filtered.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.name} (${p.uom}) - $${p.unitMaterialCost}`;
    container.appendChild(div);
  });
}

document.getElementById("search").addEventListener("input", e => {
  renderCatalog(e.target.value);
});

document.getElementById("addLine").addEventListener("click", () => {
  lines.push({ desc: "", qty: 1, uom: "unit", mat: 0, lab: 0, eqp: 0 });
  renderLines();
});

function renderLines() {
  const tbody = document.querySelector("#lines tbody");
  tbody.innerHTML = "";
  lines.forEach((line, idx) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input value="${line.desc}" onchange="updateLine(${idx},'desc',this.value)"></td>
      <td><input type="number" value="${line.qty}" onchange="updateLine(${idx},'qty',this.value)"></td>
      <td><input value="${line.uom}" onchange="updateLine(${idx},'uom',this.value)"></td>
      <td><input type="number" value="${line.mat}" onchange="updateLine(${idx},'mat',this.value)"></td>
      <td><input type="number" value="${line.lab}" onchange="updateLine(${idx},'lab',this.value)"></td>
      <td><input type="number" value="${line.eqp}" onchange="updateLine(${idx},'eqp',this.value)"></td>
      <td>$${(line.qty * (line.mat + line.lab + line.eqp)).toFixed(2)}</td>
      <td><button onclick="removeLine(${idx})">x</button></td>
    `;
    tbody.appendChild(row);
  });
}

function updateLine(i, field, value) {
  lines[i][field] = field === "desc" || field === "uom" ? value : parseFloat(value);
  renderLines();
}

function removeLine(i) {
  lines.splice(i, 1);
  renderLines();
}

document.getElementById("calc").addEventListener("click", () => {
  const subtotal = lines.reduce((sum, l) => sum + l.qty * (l.mat + l.lab + l.eqp), 0);
  document.getElementById("result").textContent = `Total Estimate: $${subtotal.toFixed(2)}`;
});

// CSV Export
document.getElementById("exportCSV").addEventListener("click", () => {
  let csv = "Description,Qty,UoM,Material,Labor,Equipment,Total\n";
  lines.forEach(l => {
    csv += `${l.desc},${l.qty},${l.uom},${l.mat},${l.lab},${l.eqp},${l.qty*(l.mat+l.lab+l.eqp)}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "estimate.csv";
  a.click();
});

// PDF Export
document.getElementById("exportPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Estimate Report", 10, 10);
  lines.forEach((l, i) => {
    doc.text(`${i+1}. ${l.desc} - $${l.qty*(l.mat+l.lab+l.eqp)}`, 10, 20 + i*10);
  });
  doc.save("estimate.pdf");
});

loadCatalog();
