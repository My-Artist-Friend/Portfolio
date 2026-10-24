// 1) Projects – edit this list, the cards are built automatically
const projects = [
  { title: "Project One", description: "A short sentence about what it does.", link: "projects/design_01.htm" },
  { title: "Project Two", description: "Another short sentence about this one.", link: "projects/design_02.htm" },
  { title: "Project Three", description: "What problem did it solve?", link: "projects/design_03.htm" }
];

const list = document.getElementById("project-list");
projects.forEach(function (p) {
  const card = document.createElement("article");
  card.className = "project";
  card.innerHTML =
    "<h3>" + p.title + "</h3>" +
    "<p>" + p.description + "</p>" +
    '<a href="' + p.link + '">View project</a>';
  list.appendChild(card);
});

// 2) Dark mode toggle (remembers the choice)
const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");

try {
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
} catch (e) {}

toggle.addEventListener("click", function () {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// 3) Contact form – opens the visitor's email app
document.getElementById("contact-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = this.name.value;
  const message = this.message.value;
  const email = this.email.value;
  const subject = encodeURIComponent("Message from " + name);
  const body = encodeURIComponent(message + "\n\n" + email);
  window.location.href = "mailto:you@example.com?subject=" + subject + "&body=" + body;
  document.getElementById("form-status").textContent = "Opening your email app…";
});

// 4) Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// 5) Fullscreen: any tap enters fullscreen if the page isn't already in it.
//    While in fullscreen, taps behave normally. If you leave (or come back
//    from another app), the next tap enters fullscreen again.
document.addEventListener("click", function () {
  const el = document.documentElement;
  const isFull = document.fullscreenElement || document.webkitFullscreenElement;
  if (isFull) return;

  const request = el.requestFullscreen || el.webkitRequestFullscreen;
  if (request) {
    const result = request.call(el);
    if (result && result.catch) result.catch(function () {});
  }
});
