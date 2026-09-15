import { supabase, getUser, isAdmin, signOut } from "./supabase.js";
import { SOCIAL_LINKS } from "./config.js";
import { getStudentProfile, saveStudentProfile } from "./student.js";

const header = document.getElementById("site-header");
const footer = document.getElementById("site-footer");
const isAdminPage = location.pathname.toLowerCase().endsWith("/admin.html") || location.pathname.toLowerCase().endsWith("admin.html");

function esc(x="") {
  return String(x).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function renderHeader() {
  if (!header) return;
  header.innerHTML = `<header class="site-header"><div class="container nav">
    <a class="brand" href="index.html"><span class="brand-mark">S</span>Sampanna Edu</a>
    <button class="nav-toggle" id="navToggle" aria-label="Open menu">☰</button>
    <nav class="nav-links" id="navLinks">
      <a href="index.html">Home</a><a href="class11.html">Class 11</a><a href="cee.html">CEE</a><a href="ioe.html">IOE</a>
      <a href="notes.html">Notes</a><a href="mcqs.html">MCQs</a><a href="quizzes.html">Mock Tests</a><a href="index.html#about">About</a>
    </nav>
    <div class="user-area" id="userArea"></div>
  </div></header>`;

  document.getElementById("navToggle")?.addEventListener("click", () =>
    document.getElementById("navLinks")?.classList.toggle("open")
  );
}

function renderFooter() {
  if (!footer) return;
  footer.innerHTML = `<footer class="footer"><div class="container footer-grid">
    <div><b>Sampanna Edu</b><div>Learn smarter. Prepare better.</div></div>
    <div>© ${new Date().getFullYear()} Sampanna Edu · <a href="index.html#contact">Contact</a></div>
  </div></footer>`;
}

async function setupUserArea() {
  const area = document.getElementById("userArea");
  if (!area) return;

  const student = getStudentProfile();
  area.innerHTML = student
    ? `<div class="student-chip" title="Student profile">
         <span class="student-avatar">${esc(student.name.charAt(0).toUpperCase())}</span>
         <span class="student-mini"><b>${esc(student.name)}</b><small>${esc(student.className)}</small></span>
       </div>
       <a class="btn btn-secondary btn-small" href="dashboard.html">Dashboard</a>
       <a class="btn btn-primary btn-small" href="login.html">Profile</a>`
    : `<button class="btn btn-primary btn-small" id="profileBtn">Enter Name & Class</button>`;

  document.getElementById("profileBtn")?.addEventListener("click", () => openProfileModal(true));
}

function openProfileModal(force = false) {
  document.getElementById("studentModal")?.remove();

  const current = getStudentProfile() || { name: "", className: "" };
  const modal = document.createElement("div");
  modal.id = "studentModal";
  modal.className = "student-modal";
  modal.innerHTML = `
    <div class="student-modal-card" role="dialog" aria-modal="true" aria-labelledby="studentModalTitle">
      <div class="student-modal-icon">🎓</div>
      <h2 id="studentModalTitle">${force && current.name ? "Update your profile" : "Welcome to Sampanna Edu!"}</h2>
      <p class="student-modal-subtitle">Enter your real name and class before using the website.</p>
      <form id="studentProfileForm">
        <label>Real Name
          <input id="studentName" name="name" type="text" autocomplete="name"
                 placeholder="Enter your real name" value="${esc(current.name)}"
                 minlength="2" maxlength="80" required>
        </label>
        <label>Class / Preparation
          <select id="studentClass" name="className" required>
            <option value="">Select your class</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
            <option value="CEE">CEE</option>
            <option value="IOE">IOE</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label class="real-name-check">
          <input id="realNameConfirm" type="checkbox" required>
          <span>I confirm that I am using my real name.</span>
        </label>
        <div class="notice">
          Your name and class are saved only in this browser for your Sampanna Edu profile.
          No Google login is required for students.
        </div>
        <button class="btn btn-primary" type="submit" style="width:100%">Continue to Sampanna Edu →</button>
        ${force ? '<button class="profile-cancel" type="button" id="cancelProfile">Cancel</button>' : ''}
        <p id="studentProfileError" class="form-note"></p>
      </form>
    </div>`;

  document.body.appendChild(modal);
  const select = modal.querySelector("#studentClass");
  if (current.className) select.value = current.className;

  modal.querySelector("#studentProfileForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = modal.querySelector("#studentName").value.trim();
    const className = select.value;
    const error = modal.querySelector("#studentProfileError");

    if (!/^[\p{L}][\p{L}\s.'-]{1,79}$/u.test(name)) {
      error.textContent = "Please enter a valid real name (letters, spaces, . ' or - only).";
      return;
    }
    if (!className) {
      error.textContent = "Please select your class.";
      return;
    }

    saveStudentProfile(name, className);
    modal.remove();
    setupUserArea();
    window.dispatchEvent(new CustomEvent("sampanna-profile-updated"));
  });

  modal.querySelector("#cancelProfile")?.addEventListener("click", () => modal.remove());
}

function ensureStudentProfile() {
  if (isAdminPage) return;
  if (!getStudentProfile()) openProfileModal(false);
}

function setupSocials() {
  document.querySelectorAll("[data-social]").forEach(a => {
    const key = a.dataset.social;
    if (SOCIAL_LINKS[key] && SOCIAL_LINKS[key] !== "#") a.href = SOCIAL_LINKS[key];
    else {
      a.href = "#";
      a.style.opacity = ".55";
    }
  });
}

document.getElementById("contactForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const subject = encodeURIComponent("Sampanna Edu Contact");
  const body = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
  location.href = `mailto:?subject=${subject}&body=${body}`;
  document.getElementById("contactStatus").textContent = "Your email app should open with the message prepared.";
});

renderHeader();
renderFooter();
setupSocials();
setupUserArea();
ensureStudentProfile();

export { openProfileModal, esc };
