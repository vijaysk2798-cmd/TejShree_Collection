\// ================== Variables ==================
let sarees = [];

const productsGrid = document.getElementById("productsGrid");
const emptyState = document.getElementById("emptyState");

const fabricFilter = document.getElementById("fabricFilter");
const conditionFilter = document.getElementById("conditionFilter");
const maxPriceFilter = document.getElementById("maxPriceFilter");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

// ================== Load CSV ==================
async function loadSareesFromCsv() {
  try {
    const response = await fetch("./assets/data/sarees.csv?v=" + Date.now());
    if (!response.ok) throw new Error("Failed to load sarees.csv");

    const text = await response.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];

    const [headerLine, ...rows] = lines;
    const headers = headerLine.split(",").map(h => h.trim());

    return rows
      .filter(r => r.trim().length > 0)
      .map((row, idx) => {
        const cols = row.split(",");
        const raw = {};
        headers.forEach((h, i) => { raw[h] = (cols[i] || "").trim(); });

        return {
          id: raw.id || idx + 1,
          title: raw.title || "",
          fabric: raw.fabric || "",
          condition: raw.condition || "",
          price: Number(raw.price || 0),
          city: raw.city || "Kanchipuram",
          blouse: raw.blouse || "",
          tagLine: raw.tagLine || "",
          whatsapp: raw.whatsapp || "919884191310",
          images: (raw.images || "").split("|")
        };
      });
  } catch (err) {
    console.error("Error loading sarees CSV:", err);
    emptyState.textContent =
      "Could not load sarees list. Make sure 'sarees.csv' exists in assets/data/";
    emptyState.style.display = "block";
    return [];
  }
}

// ================== Render ==================
function renderSarees(list) {
  productsGrid.innerHTML = "";
  if (!list.length) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  list.forEach(s => {
    const card = document.createElement("article");
    card.className = "card";

    // Main Image
    const mainImg = document.createElement("img");
    mainImg.src = s.images[0] ? `assets/images/${s.images[0]}` : "";
    mainImg.alt = s.title;
    mainImg.className = "card-main-img";

    // Thumbnails
    const thumbs = document.createElement("div");
    thumbs.className = "card-thumbs";
    s.images.forEach(img => {
      if (!img) return;
      const t = document.createElement("img");
      t.src = `assets/images/${img}`;
      t.alt = s.title;
      t.className = "thumb-img";
      t.addEventListener("click", () => (mainImg.src = t.src));
      thumbs.appendChild(t);
    });

    // Card Body
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";
    cardBody.innerHTML = `
      <div class="card-title">${s.title}</div>
      <div class="card-meta">
        <span>${s.fabric}</span>
        <span>Blouse: ${s.blouse}</span>
        <span>${s.city}</span>
      </div>
      <div class="card-tags">
        ${s.tagLine ? `<span class="card-tag">${s.tagLine}</span>` : ""}
      </div>
      <div class="card-price-row">
        <div class="price">₹${s.price.toLocaleString("en-IN")} <small>+ shipping</small></div>
        <button class="btn btn-outline btn-sm" data-id="${s.id}">WhatsApp</button>
      </div>
    `;

    card.appendChild(mainImg);
    if (s.images.length > 1) card.appendChild(thumbs);
    card.appendChild(cardBody);
    productsGrid.appendChild(card);
  });

  // WhatsApp button click
  document.querySelectorAll(".card button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const saree = sarees.find(x => String(x.id) === String(id));
      if (!saree) return;

      const msg = `Hi PS Silks Kanchipuram, I'm interested in this saree:\n\n*${saree.title}*\nFabric: ${saree.fabric}\nCondition: ${saree.condition}\nPrice: ₹${saree.price.toLocaleString("en-IN")}\nCity: ${saree.city}\n\nIs it still available?`;
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/${saree.whatsapp}?text=${encoded}`, "_blank");
    });
  });
}

// ================== Filters ==================
function applyFilters() {
  const f = fabricFilter.value;
  const c = conditionFilter.value;
  const p = maxPriceFilter.value ? Number(maxPriceFilter.value) : null;

  const filtered = sarees.filter(s => {
    if (f && s.fabric !== f) return false;
    if (c && s.condition !== c) return false;
    if (p !== null && s.price > p) return false;
    return true;
  });

  renderSarees(filtered);
}

fabricFilter.addEventListener("change", applyFilters);
conditionFilter.addEventListener("change", applyFilters);
maxPriceFilter.addEventListener("input", applyFilters);

clearFiltersBtn.addEventListener("click", () => {
  fabricFilter.value = "";
  conditionFilter.value = "";
  maxPriceFilter.value = "";
  applyFilters();
});

// ================== Scroll to Shop ==================
document.getElementById("scrollToShopBtn").addEventListener("click", () => {
  const shopSection = document.getElementById("shop");
  shopSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

// ================== Init ==================
loadSareesFromCsv().then(list => {
  sarees = list;
  renderSarees(sarees);
});

// ================== Footer Year ==================
document.getElementById("yearSpan").textContent = new Date().getFullYear();
