// Project popup: click anywhere on a project card (its link must point to an .html file).
// The card shows a small loading effect while the page AND its images load,
// and the popup opens only when everything is ready.
(function () {
  const dialog = document.createElement("dialog");
  dialog.id = "project-modal";
  dialog.setAttribute("aria-label", "Project details");
  dialog.innerHTML =
    '<button type="button" class="modal-close">Close</button>' +
    '<div class="modal-body" tabindex="-1"></div>';
  document.body.appendChild(dialog);

  const body = dialog.querySelector(".modal-body");
  const cache = {};
  let latest = 0;
  let busyCard = null;

  // The popup size is calculated from the screen size
  function size() {
    const w = Math.min(window.innerWidth * 0.92, 960);
    const h = Math.min(window.innerHeight * 0.88, 760);
    dialog.style.width = Math.round(w) + "px";
    dialog.style.height = Math.round(h) + "px";
  }

  async function fetchHtml(file) {
    if (cache[file]) return cache[file];
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 15000);
    try {
      const res = await fetch(file, { signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      cache[file] = await res.text();
      return cache[file];
    } finally {
      clearTimeout(timer);
    }
  }

  // Waits until every <img> inside the fetched HTML has loaded (gives up after 10 s)
  function preloadImages(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html; // images inside a template don't load by themselves
    const jobs = Array.from(tpl.content.querySelectorAll("img")).map(function (img) {
      return new Promise(function (resolve) {
        const src = img.getAttribute("src");
        if (!src) return resolve();
        const probe = new Image();
        probe.onload = resolve;
        probe.onerror = resolve; // a broken image shouldn't block the popup
        probe.src = src;
      });
    });
    const limit = new Promise(function (resolve) { setTimeout(resolve, 10000); });
    return Promise.race([Promise.all(jobs), limit]);
  }

  async function openProject(file, card) {
    const id = ++latest;
    if (busyCard) busyCard.classList.remove("is-loading");
    busyCard = card;
    card.classList.add("is-loading");

    let html = null;
    let errorText = null;
    try {
      html = await fetchHtml(file);
      await preloadImages(html);
    } catch (err) {
      console.error("Project load failed:", file, err);
      if (err.name === "AbortError") {
        errorText = "The server didn’t answer for “" + file + "” within 15 seconds. Try again.";
      } else {
        errorText = "Couldn’t load “" + file + "” (" + err.message + "). " +
                    "Check that the file exists at this exact path and name.";
      }
    }

    if (id !== latest) return; // a newer click took over
    card.classList.remove("is-loading");
    busyCard = null;

    size();
    document.body.classList.add("modal-open");
    if (errorText) body.textContent = errorText;
    else body.innerHTML = html;
    if (!dialog.open) dialog.showModal(); // showModal() blocks the page behind it
    void dialog.offsetHeight; // forces the browser to redraw the popup right away
    body.scrollTop = 0;
    body.focus();
  }

  // Capture phase + stopPropagation: the page-wide fullscreen tap doesn't fire at the same moment
  document.addEventListener("click", function (e) {
    const card = e.target.closest("#project-list .project");
    if (!card) return;
    const link = card.querySelector("a");
    const file = link && link.getAttribute("href");
    if (!file || !/\.html?$/i.test(file)) return; // cards without an .html link do nothing special
    e.preventDefault();
    e.stopPropagation();
    if (card !== busyCard) openProject(file, card);
  }, true);

  dialog.querySelector(".modal-close").addEventListener("click", function () {
    dialog.close();
  });
  // Tap on the dark area outside the popup closes it
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", function () {
    document.body.classList.remove("modal-open");
  });
  window.addEventListener("resize", function () {
    if (dialog.open) size();
  });
})();
