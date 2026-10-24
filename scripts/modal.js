// Project popup: click a project link that points to an .html file,
// and that file is fetched and shown inside a modal dialog.
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

  // The popup size is calculated from the screen size
  function size() {
    const w = Math.min(window.innerWidth * 0.92, 960);
    const h = Math.min(window.innerHeight * 0.88, 760);
    dialog.style.width = Math.round(w) + "px";
    dialog.style.height = Math.round(h) + "px";
  }

  async function openProject(file) {
    const id = ++latest;
    size();
    body.textContent = "Loading…";
    document.body.classList.add("modal-open");
    if (!dialog.open) dialog.showModal(); // showModal() blocks the page behind it

    let html = null;
    let errorText = null;
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 15000);
    try {
      if (!cache[file]) {
        const res = await fetch(file, { signal: ctrl.signal });
        if (!res.ok) throw new Error("HTTP " + res.status);
        cache[file] = await res.text();
      }
      html = cache[file];
    } catch (err) {
      console.error("Project load failed:", file, err);
      if (err.name === "AbortError") {
        errorText = "The server didn’t answer for “" + file + "” within 15 seconds. " +
                    "This usually points to the preview server, not the code. Try again.";
      } else {
        errorText = "Couldn’t load “" + file + "” (" + err.message + "). " +
                    "Check that the file exists at this exact path and name.";
      }
    } finally {
      clearTimeout(timer);
    }

    if (id !== latest) return; // a newer click took over
    if (errorText) body.textContent = errorText;
    else body.innerHTML = html;
    void dialog.offsetHeight; // forces the browser to redraw the popup right away
    body.scrollTop = 0;
    body.focus();
  }

  document.addEventListener("click", function (e) {
    const link = e.target.closest("#project-list a");
    if (!link) return;
    const file = link.getAttribute("href");
    if (!file || !/\.html?$/i.test(file)) return; // normal links work as usual
    e.preventDefault();
    e.stopPropagation(); // keeps the page-wide fullscreen tap from firing at the same moment
    openProject(file);
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
