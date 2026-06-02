const upload = document.querySelector("#artUpload");
const printArt = document.querySelector("#printArt");
const printZone = document.querySelector("#printZone");
const qualityBox = document.querySelector("#qualityBox");
const scaleRange = document.querySelector("#scaleRange");
const rotateRange = document.querySelector("#rotateRange");
const shirt = document.querySelector("#shirt");
const swatches = document.querySelectorAll(".swatch");
const form = document.querySelector("#requestForm");
const designGrid = document.querySelector("#designGrid");

const designFiles = [
  "1.jpg",
  "1_坐标参考.jpg",
  "2.jpg",
  "ChatGPT Image 2026年3月23日 17_35_09.png",
  "ChatGPT Image 2026年3月23日 21_28_58.png",
  "ChatGPT Image 2026年3月23日 21_37_56.png",
  "ChatGPT Image 2026年3月23日 21_40_53.png",
  "ChatGPT Image 2026年3月23日 21_47_26.png",
  "ChatGPT Image 2026年3月23日 21_59_37.png",
  "family logo loong.png",
  "monster_ai_600dpi.png",
  "monster_by_lora_letter_300dpi.png",
  "six_seven_gemini_cropped_letter_300dpi.png",
  "the_answer_is_42_letter_300dpi.png",
  "位置.png",
  "手写.jpeg",
  "手绘 final.png",
  "手绘 final_手写文字AI版_raw.png",
  "手绘_final_坐标参考.jpg",
  "手绘融合_坐姿热压版.png",
  "手绘融合_坐姿热压版_瘦20_A4_300DPI.png",
  "手绘融合_备选版.png",
  "手绘融合_搞怪版.png",
  "签名 final.png",
  "签名圆形白底热压_A4_300DPI.png",
  "签名异形白底热压_A4_300DPI.png",
  "签名异形白底热压_A4_300DPI_preview.jpg",
  "签名排版_A4_300DPI.png",
  "签名排版_A4_300DPI_compact.png",
  "签名排版_A4_300DPI_compact_preview.jpg",
  "签名排版_A4_300DPI_preview.jpg",
  "签名排版_A4_300DPI_round_preview.jpg",
  "签名排版_A4_300DPI_v2.png",
  "签名排版_A4_300DPI_v2_preview.jpg",
  "签名裁切校正_v2_debug.jpg",
];

const state = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  dragging: false,
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0,
  fileName: "",
  imageWidth: 0,
  imageHeight: 0,
};

function renderArtTransform() {
  printArt.style.left = `calc(50% + ${state.x}px)`;
  printArt.style.top = `calc(50% + ${state.y}px)`;
  printArt.style.setProperty("--art-scale", state.scale);
  printArt.style.setProperty("--art-rotate", `${state.rotate}deg`);
}

function resetPlacement() {
  state.x = 0;
  state.y = 0;
  state.scale = 1;
  state.rotate = 0;
  scaleRange.value = 100;
  rotateRange.value = 0;
  renderArtTransform();
}

function fitArtwork() {
  const zone = printZone.getBoundingClientRect();
  const art = printArt.getBoundingClientRect();
  const fitScale = Math.min(zone.width / art.width, zone.height / art.height, 1.35);
  state.scale = Number.isFinite(fitScale) ? Math.max(0.35, fitScale) : 1;
  scaleRange.value = Math.round(state.scale * 100);
  renderArtTransform();
}

function updateQuality(file, image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const shortest = Math.min(width, height);
  const sizeMb = file?.size ? file.size / 1024 / 1024 : null;
  const estimatedDpi = Math.round(width / 10);

  state.imageWidth = width;
  state.imageHeight = height;
  state.fileName = file?.name || image.dataset.fileName || "";

  qualityBox.classList.remove("good", "warn", "bad");

  let status = file ? "Artwork check" : "Selected print";
  let message = `${width} x ${height}px`;
  if (sizeMb) message += `, ${sizeMb.toFixed(1)} MB`;
  message += `. Estimated ${estimatedDpi} DPI for a 10 inch wide print.`;

  if (width >= 3000 && height >= 3000) {
    qualityBox.classList.add("good");
    status = "Artwork check: print ready";
  } else if (shortest >= 1500) {
    qualityBox.classList.add("warn");
    status = "Artwork check: usable, but not ideal";
    message += " A larger file will print sharper.";
  } else {
    qualityBox.classList.add("bad");
    status = "Artwork check: low resolution";
    message += " Ask the customer for a larger original before production.";
  }

  if (file?.type === "image/png" || state.fileName.toLowerCase().endsWith(".png")) {
    message += " PNG is a good choice for logos or transparent art.";
  }

  qualityBox.innerHTML = `<strong>${status}</strong><p>${message}</p>`;
}

function designPath(fileName) {
  return `assets/designs/${encodeURIComponent(fileName)}`;
}

function setArtworkImage(src, fileName, file = null) {
  const image = new Image();
  image.onload = () => {
    printArt.classList.remove("empty");
    printArt.innerHTML = "";
    image.dataset.fileName = fileName;
    printArt.appendChild(image);
    resetPlacement();
    updateQuality(file, image);
  };
  image.src = src;
}

function renderDesignGrid() {
  if (!designGrid) return;

  designFiles.forEach((fileName, index) => {
    const button = document.createElement("button");
    const src = designPath(fileName);
    const label = fileName.replace(/\.[^.]+$/, "");

    button.className = "design-card";
    button.type = "button";
    button.innerHTML = `
      <span class="mini-shirt">
        <span class="mini-shirt-body"></span>
        <img src="${src}" alt="">
      </span>
      <strong>${label}</strong>
    `;
    button.addEventListener("click", () => {
      document.querySelectorAll(".design-card").forEach((card) => card.classList.remove("active"));
      button.classList.add("active");
      setArtworkImage(src, fileName);
      document.querySelector("#customizer").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    designGrid.appendChild(button);

    if (index === 0) {
      button.classList.add("active");
      setArtworkImage(src, fileName);
    }
  });
}

upload.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  document.querySelectorAll(".design-card").forEach((card) => card.classList.remove("active"));
  const src = URL.createObjectURL(file);
  setArtworkImage(src, file.name, file);
});

printArt.addEventListener("pointerdown", (event) => {
  state.dragging = true;
  state.startX = event.clientX;
  state.startY = event.clientY;
  state.originX = state.x;
  state.originY = state.y;
  printArt.setPointerCapture(event.pointerId);
});

printArt.addEventListener("pointermove", (event) => {
  if (!state.dragging) return;
  state.x = state.originX + event.clientX - state.startX;
  state.y = state.originY + event.clientY - state.startY;
  renderArtTransform();
});

printArt.addEventListener("pointerup", () => {
  state.dragging = false;
});

printArt.addEventListener("pointercancel", () => {
  state.dragging = false;
});

scaleRange.addEventListener("input", (event) => {
  state.scale = Number(event.target.value) / 100;
  renderArtTransform();
});

rotateRange.addEventListener("input", (event) => {
  state.rotate = Number(event.target.value);
  renderArtTransform();
});

swatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    swatches.forEach((item) => item.classList.remove("active"));
    swatch.classList.add("active");
    shirt.style.setProperty("--shirt-color", swatch.dataset.color);
  });
});

document.querySelector("#resetPrint").addEventListener("click", resetPlacement);
document.querySelector("#centerPrint").addEventListener("click", () => {
  state.x = 0;
  state.y = 0;
  renderArtTransform();
});
document.querySelector("#fitPrint").addEventListener("click", fitArtwork);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const telegram = document.querySelector("#telegram").value.trim();
  const size = document.querySelector("#shirtSize").value;
  const quantity = document.querySelector("#quantity").value;
  const notes = document.querySelector("#notes").value.trim();

  const subject = encodeURIComponent("Custom T-shirt request");
  const body = encodeURIComponent(
    [
      "Custom T-shirt request",
      "",
      `Size: ${size}`,
      `Quantity: ${quantity}`,
      `Customer email: ${email || "Not provided"}`,
      `Telegram: ${telegram || "Not provided"}`,
      `Artwork file: ${state.fileName || "Not uploaded in preview"}`,
      state.imageWidth ? `Artwork size: ${state.imageWidth} x ${state.imageHeight}px` : "",
      `Print scale: ${Math.round(state.scale * 100)}%`,
      `Rotation: ${state.rotate} degrees`,
      "",
      "Notes:",
      notes || "None",
      "",
      "Please attach the original artwork file when sending this email.",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  window.location.href = `mailto:hello@t-shirt.example?subject=${subject}&body=${body}`;
});

renderDesignGrid();
renderArtTransform();
