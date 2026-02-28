
    const FRAME_W = 332;
    const FRAME_H = 386;
    const TEXT_POOL = ["今日份快乐", "周末散步", "天晴有风", "你在身边", "生活是礼物", "路过好风景", "记录这一刻", "小确幸"];
    const photoStates = new Map();
    const textStates = new Map([
      [1, { line1: "今日份快乐", line2Enabled: false, line2: "", font1: "'Ma Shan Zheng', cursive", font2: "'ZCOOL KuaiLe', cursive" }],
      [2, { line1: "记录这一刻", line2Enabled: false, line2: "", font1: "'Ma Shan Zheng', cursive", font2: "'ZCOOL KuaiLe', cursive" }]
    ]);

    let activeCard = 1;
    let cropCardId = null;
    let cropNaturalW = 0;
    let cropNaturalH = 0;
    let viewScale = 1;
    let cropTemp = { x: 0, y: 0, scale: 1, rotate: 0, lastX: 0, lastY: 0, isDragging: false };
    let marginH = 44;
    let marginV = 55;
    let previewMarginH = marginH;
    let previewMarginV = marginV;

    function updateCardLayout(h = marginH, v = marginV) {
      const card1 = document.getElementById("card1");
      const card2 = document.getElementById("card2");
      const left = (900 - (360 + 360 + h)) / 2;
      card1.style.left = `${left}px`;
      card1.style.top = `${v}px`;
      card2.style.left = `${left + 360 + h}px`;
      card2.style.top = `${v}px`;
    }

    function openMarginModal() {
      previewMarginH = marginH;
      previewMarginV = marginV;
      document.getElementById("marginH").value = previewMarginH;
      document.getElementById("marginV").value = previewMarginV;
      document.getElementById("marginHLabel").innerText = previewMarginH;
      document.getElementById("marginVLabel").innerText = previewMarginV;
      document.getElementById("marginModal").style.display = "flex";
    }
    function closeMarginModal() {
      updateCardLayout(marginH, marginV);
      document.getElementById("marginModal").style.display = "none";
    }
    function updateMarginPreview() {
      previewMarginH = parseInt(document.getElementById("marginH").value, 10) || 0;
      previewMarginV = parseInt(document.getElementById("marginV").value, 10) || 0;
      document.getElementById("marginHLabel").innerText = previewMarginH;
      document.getElementById("marginVLabel").innerText = previewMarginV;
      updateCardLayout(previewMarginH, previewMarginV);
    }
    function applyMargin() {
      marginH = previewMarginH;
      marginV = previewMarginV;
      updateCardLayout();
      closeMarginModal();
    }

    function autoScaleCanvas() {
      const viewport = document.querySelector(".canvas-viewport");
      const scaler = document.getElementById("scaler");
      const area = document.getElementById("captureArea");
      const scale = Math.min((viewport.clientWidth - 20) / area.offsetWidth, 1);
      scaler.style.transform = `scale(${scale})`;
    }

    function pickRandomText() {
      return TEXT_POOL[Math.floor(Math.random() * TEXT_POOL.length)];
    }

    function syncControlsFromActive() {
      const s = textStates.get(activeCard);
      document.getElementById("activeLabel").innerText = `第${activeCard}张`;
      document.getElementById("line1Input").value = s.line1;
      document.getElementById("line2Enable").checked = s.line2Enabled;
      document.getElementById("line2Input").value = s.line2;
      document.getElementById("font1Select").value = s.font1;
      document.getElementById("font2Select").value = s.font2;
      document.getElementById("line2Input").disabled = !s.line2Enabled;
      document.getElementById("font2Select").disabled = !s.line2Enabled;
    }

    function renderCaption(id) {
      const s = textStates.get(id);
      const line1 = document.getElementById(`caption${id}line1`);
      const line2 = document.getElementById(`caption${id}line2`);
      line1.innerText = s.line1 || " ";
      line1.style.fontFamily = s.font1;
      line2.innerText = s.line2 || " ";
      line2.style.fontFamily = s.font2;
      line2.style.display = s.line2Enabled ? "block" : "none";
    }

    function updateActiveCaptionFromControls() {
      const s = textStates.get(activeCard);
      s.line1 = document.getElementById("line1Input").value.trim();
      s.line2Enabled = document.getElementById("line2Enable").checked;
      s.line2 = document.getElementById("line2Input").value.trim();
      s.font1 = document.getElementById("font1Select").value;
      s.font2 = document.getElementById("font2Select").value;
      renderCaption(activeCard);
    }

    function toggleSecondLine() {
      const enabled = document.getElementById("line2Enable").checked;
      document.getElementById("line2Input").disabled = !enabled;
      document.getElementById("font2Select").disabled = !enabled;
      updateActiveCaptionFromControls();
    }

    function randomizeActiveText() {
      const s = textStates.get(activeCard);
      s.line1 = pickRandomText();
      if (s.line2Enabled) s.line2 = pickRandomText();
      syncControlsFromActive();
      renderCaption(activeCard);
    }

    function selectCard(id) {
      activeCard = id;
      document.getElementById("card1").classList.toggle("active", id === 1);
      document.getElementById("card2").classList.toggle("active", id === 2);
      syncControlsFromActive();
    }

    function uploadPhoto(id) {
      document.getElementById(`file${id}`).value = "";
      document.getElementById(`file${id}`).click();
    }
    function uploadActivePhoto() {
      uploadPhoto(activeCard);
    }

    function applyImageState(id) {
      const img = document.getElementById(`card${id}`).querySelector("img");
      const state = photoStates.get(id);
      if (!state) return;
      img.style.transform = `translate(${state.x}px, ${state.y}px) rotate(${state.rotate}deg) scale(${state.scale})`;
    }

    function handleFile(id, event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const card = document.getElementById(`card${id}`);
        const img = card.querySelector("img");
        const placeholder = card.querySelector(".placeholder");
        img.src = e.target.result;
        img.style.display = "block";
        placeholder.style.display = "none";
        img.onload = () => {
          const fitScale = Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight);
          photoStates.set(id, { x: (FRAME_W - img.naturalWidth) / 2, y: (FRAME_H - img.naturalHeight) / 2, scale: fitScale, rotate: 0 });
          applyImageState(id);
          selectCard(id);
        };
      };
      reader.readAsDataURL(file);
    }

    function recalcCropViewScale() {
      const rect = document.getElementById("cropViewport").getBoundingClientRect();
      const vw = Math.max(rect.width - 24, 240);
      const vh = Math.max(rect.height - 24, 180);
      viewScale = Math.min(vw / FRAME_W, vh / FRAME_H, 1);
      const wrapper = document.getElementById("cropWrapper");
      wrapper.style.width = `${FRAME_W}px`;
      wrapper.style.height = `${FRAME_H}px`;
      wrapper.style.transform = `scale(${viewScale})`;
    }

    function renderCropPreview() {
      document.getElementById("cropPreviewImg").style.transform = `translate(${cropTemp.x}px, ${cropTemp.y}px) rotate(${cropTemp.rotate}deg) scale(${cropTemp.scale})`;
    }

    function openCropModal() {
      const id = activeCard;
      const img = document.getElementById(`card${id}`).querySelector("img");
      if (!img.getAttribute("src")) return uploadPhoto(id);
      cropCardId = id;
      cropNaturalW = img.naturalWidth;
      cropNaturalH = img.naturalHeight;
      cropTemp = { ...photoStates.get(id), isDragging: false, lastX: 0, lastY: 0 };
      document.getElementById("cropZoom").min = (cropTemp.scale * 0.1).toFixed(4);
      document.getElementById("cropZoom").max = (cropTemp.scale * 10).toFixed(4);
      document.getElementById("cropZoom").value = cropTemp.scale;
      document.getElementById("cropRotate").value = cropTemp.rotate || 0;
      document.getElementById("cropPreviewImg").src = img.src;
      document.getElementById("cropModal").style.display = "flex";
      requestAnimationFrame(() => { recalcCropViewScale(); updateCropTransform(); });
    }

    function closeCropModal() { document.getElementById("cropModal").style.display = "none"; }

    function clampCropPosition() {
      if (!cropNaturalW || !cropCardId) return;
      const r = cropTemp.rotate * Math.PI / 180;
      const cosR = Math.abs(Math.cos(r));
      const sinR = Math.abs(Math.sin(r));
      const minScale = Math.max(FRAME_W / (cropNaturalW * cosR + cropNaturalH * sinR), FRAME_H / (cropNaturalW * sinR + cropNaturalH * cosR));
      if (cropTemp.scale < minScale) {
        cropTemp.scale = minScale;
        const slider = document.getElementById("cropZoom");
        if (parseFloat(slider.min) > minScale) slider.min = minScale.toFixed(4);
        slider.value = minScale;
      }
      const s = cropTemp.scale;
      const sw = cropNaturalW * s;
      const sh = cropNaturalH * s;
      const halfW = (sw * cosR + sh * sinR) / 2;
      const halfH = (sw * sinR + sh * cosR) / 2;
      const xMin = FRAME_W - halfW - cropNaturalW / 2;
      const xMax = halfW - cropNaturalW / 2;
      const yMin = FRAME_H - halfH - cropNaturalH / 2;
      const yMax = halfH - cropNaturalH / 2;
      cropTemp.x = Math.min(xMax, Math.max(xMin, cropTemp.x));
      cropTemp.y = Math.min(yMax, Math.max(yMin, cropTemp.y));
    }

    function updateCropTransform() {
      const newScale = parseFloat(document.getElementById("cropZoom").value);
      const oldScale = cropTemp.scale;
      const newRotate = parseInt(document.getElementById("cropRotate").value, 10) || 0;
      if (oldScale !== newScale) {
        const cx = FRAME_W / 2;
        const cy = FRAME_H / 2;
        const imgCx = cropTemp.x + cropNaturalW / 2;
        const imgCy = cropTemp.y + cropNaturalH / 2;
        cropTemp.x += (cx - imgCx) * (1 - newScale / oldScale);
        cropTemp.y += (cy - imgCy) * (1 - newScale / oldScale);
        cropTemp.scale = newScale;
      }
      cropTemp.rotate = newRotate;
      clampCropPosition();
      const baseScale = photoStates.get(cropCardId)?.scale || 1;
      document.getElementById("zoomLabel").innerText = (cropTemp.scale / baseScale).toFixed(1) + "X";
      document.getElementById("rotateLabel").innerText = cropTemp.rotate + "°";
      renderCropPreview();
    }

    function applyCrop() {
      if (!cropCardId) return;
      photoStates.set(cropCardId, { x: cropTemp.x, y: cropTemp.y, scale: cropTemp.scale, rotate: cropTemp.rotate });
      applyImageState(cropCardId);
      closeCropModal();
    }

    function onStart(e) {
      if (e.target.id !== "cropPreviewImg") return;
      const t = e.touches ? e.touches[0] : e;
      cropTemp.isDragging = true;
      cropTemp.lastX = t.clientX;
      cropTemp.lastY = t.clientY;
    }
    function onMove(e) {
      if (!cropTemp.isDragging) return;
      const t = e.touches ? e.touches[0] : e;
      cropTemp.x += (t.clientX - cropTemp.lastX) / viewScale;
      cropTemp.y += (t.clientY - cropTemp.lastY) / viewScale;
      cropTemp.lastX = t.clientX;
      cropTemp.lastY = t.clientY;
      renderCropPreview();
      e.preventDefault();
    }
    function onEnd() {
      if (!cropTemp.isDragging) return;
      cropTemp.isDragging = false;
      clampCropPosition();
      renderCropPreview();
    }

    async function exportPhoto() {
      const loading = document.getElementById("exportLoading");
      const area = document.getElementById("captureArea");
      const qualityScale = parseFloat(document.getElementById("exportQuality").value);
      loading.style.display = "flex";
      try {
        const scaler = document.getElementById("scaler");
        const oldTransform = scaler.style.transform;
        scaler.style.transform = "scale(1)";
        const canvas = await html2canvas(area, { scale: qualityScale, useCORS: true, backgroundColor: "#ffffff", logging: false });
        scaler.style.transform = oldTransform;
        const link = document.createElement("a");
        link.download = `Photo_6x4_polaroid_${Date.now()}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
      } catch (err) {
        alert("导出失败，请重试");
      } finally {
        loading.style.display = "none";
      }
    }

    window.addEventListener("resize", () => {
      autoScaleCanvas();
      if (document.getElementById("cropModal").style.display === "flex") {
        recalcCropViewScale();
        renderCropPreview();
      }
    });
    window.addEventListener("load", () => {
      updateCardLayout();
      renderCaption(1);
      renderCaption(2);
      selectCard(1);
      autoScaleCanvas();
    });
    document.addEventListener("mousedown", onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchstart", onStart, { passive: false });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.getElementById("card1").addEventListener("dblclick", () => uploadPhoto(1));
    document.getElementById("card2").addEventListener("dblclick", () => uploadPhoto(2));
  