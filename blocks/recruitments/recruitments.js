const DATA_URL = "/pages/json/recruitments.json";
const ICON_BASE_PATH = "/media/icons/recruitments";

function value(row, key) {
    return String(row?.[key] ?? "").trim();
}

function escapeHTML(input) {
    return String(input ?? "").replace(
        /[&<>"']/g,
        (char) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[char]
    );
}

function getIcon(name, className = "") {
    const iconName = String(name ?? "")
        .trim()
        .toLowerCase();
    if (!/^[a-z0-9-]+$/.test(iconName)) return "";
    const safeClassName = String(className)
        .split(/\s+/)
        .filter((token) => /^[a-zA-Z0-9\_-]+$/.test(token))
        .join(" ");
    return `<span class="icon icon-${iconName} ${safeClassName}" aria-hidden="true"><img src="${ICON_BASE_PATH}/${iconName}.png" data-icon-name="${iconName}" alt="" width="18" height="18" loading="lazy" decoding="async"></span>`;
}

export default async function decorate(block) {
    if (
        !block.parentElement?.classList.contains("recruitments-wrapper") ||
        block.classList.contains("header") ||
        block.classList.contains("icons") ||
        block.closest('[data-visibility="hidden"]')
    ) {
        return;
    }

    if (block.dataset.recruitmentsInitialized === "true") return;

    block.dataset.recruitmentsInitialized = "true";
    block.classList.add("recruitments");

    block.innerHTML = `
    <div class="jobs-board">
      <aside class="jobs-sidebar">
        <nav class="jobs-categories" aria-label="Job technology categories"></nav>
      </aside>
      <section class="jobs-content" aria-label="Job openings">
        <div class="jobs-list" aria-live="polite"></div>
        <p class="jobs-message jobs-loading">Loading jobs...</p>
        <p class="jobs-message jobs-empty" hidden>No active openings in this category right now.</p>
        <p class="jobs-message jobs-error" hidden>Unable to load jobs. Please try again later.</p>
      </section>
    </div>
  `;

    const categoriesEl = block.querySelector(".jobs-categories");
    const listEl = block.querySelector(".jobs-list");
    const loadingEl = block.querySelector(".jobs-loading");
    const emptyEl = block.querySelector(".jobs-empty");
    const errorEl = block.querySelector(".jobs-error");

    let rows = [];
    let fullDescriptionRows = [];
    let technologies = [];
    let selectedTechnology = "";

    function applyForJob(job) {
        const applyUrl = value(job, "Apply J Link");
        if (!applyUrl) {
            console.warn(`No application link configured for job ${job.Id}`);
            return;
        }
        try {
            const url = new URL(applyUrl);
            if (!["https:", "http:"].includes(url.protocol)) throw new Error("Invalid application URL");
            window.open(url.href, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Invalid application link:", error);
        }
    }

    function renderCategories() {
        categoriesEl.innerHTML = technologies
            .map((technology) => {
                const active = technology === selectedTechnology;
                return `
        <button type="button" class="jobs-category${active ? " is-active" : ""}" data-technology="${escapeHTML(technology)}" aria-pressed="${active}">
          ${getIcon(technology.toLowerCase(), "jobs-category-icon")}
          <span class="jobs-category-name">${escapeHTML(technology)}</span>
        </button>
      `;
            })
            .join("");
    }

    function renderJob(job) {
        return `
      <article class="job-card" data-job-id="${escapeHTML(job.Id)}">
        <span class="job-card-accent" aria-hidden="true"></span>
        <div class="job-card-heading">
          <div class="job-role-icon" aria-hidden="true">${getIcon(job.Technology, "job-technology-icon")}</div>
          <div class="job-heading-content">
              <h2 class="job-title">${escapeHTML(job.Title)}</h2>
              ${
                  job.Expertise
                      ? `
              <p class="job-expertise">${escapeHTML(job.Expertise)}</p>
              `
                      : ""
              }
          </div>
        </div>
        ${job.Description ? `<p class="job-description">${escapeHTML(job.Description)}</p>` : ""}
        <div class="job-divider" aria-hidden="true"></div>
        <div class="job-card-footer">
          <div class="job-meta">
            ${job.Location ? `<span class="job-meta-item job-location">${getIcon("location", "job-meta-icon")}<span>${escapeHTML(job.Location)}</span></span>` : ""}
            ${job["Employment Type"] ? `<span class="job-meta-item job-employment">${getIcon("work", "job-meta-icon")}<span>${escapeHTML(job["Employment Type"])}</span></span>` : ""}
            ${job["Work Mode"] ? `<span class="job-meta-item job-arrangement">${getIcon("schedule", "job-meta-icon")}<span>${escapeHTML(job["Work Mode"])}</span></span>` : ""}
            ${job.Experience ? `<span class="job-meta-item job-experience">${getIcon("experience", "job-meta-icon")}<span>${escapeHTML(job.Experience)}</span></span>` : ""}
            ${job.Vacancies ? `<span class="job-meta-item job-vacancies">${getIcon("group", "job-meta-icon")}<span>${escapeHTML(job.Vacancies)} vacancies</span></span>` : ""}
          </div>
          <div class="job-actions">
            <button type="button" class="job-button job-button-secondary" data-view-jd="${escapeHTML(job.Id)}">${escapeHTML(job["View JD Button"] || "View Full Job Description")}</button>
            <button type="button" class="job-button job-button-primary" data-apply-job="${escapeHTML(job.Id)}">${escapeHTML(job["Apply J Button"] || "Apply for this job")}</button>
          </div>
        </div>
      </article>
    `;
    }

    function renderJobs() {
        const visibleJobs = rows.filter(
            (job) =>
                job.Technology === selectedTechnology && job.Id && job.Title && job.Status.toLowerCase() === "active"
        );

        listEl.innerHTML = visibleJobs.map(renderJob).join("");
        listEl.hidden = visibleJobs.length === 0;
        emptyEl.hidden = visibleJobs.length > 0;
    }

    function renderDescriptionList(content) {
        const items = String(content ?? "")
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean);
        if (!items.length) return '<p class="job-modal-empty">No information available.</p>';
        return `<ul class="job-modal-list">${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
    }

    function renderSkills(content) {
        const skills = String(content ?? "")
            .split(/[,;\r\n]+/)
            .map((item) => item.trim())
            .filter(Boolean);
        if (!skills.length) return '<p class="job-modal-empty">No skills listed.</p>';
        return `<div class="job-modal-skills">${skills.map((skill) => `<span>${escapeHTML(skill)}</span>`).join("")}</div>`;
    }

    function openJobModal(jobId, triggerButton) {
        const job = rows.find((item) => item.Id === jobId);
        const details = fullDescriptionRows.find((item) => item.Id === jobId);
        if (!job) return;

        document.querySelector(".job-modal-backdrop")?.remove();
        document.body.classList.add("job-modal-open");

        const modal = document.createElement("div");
        modal.className = "job-modal-backdrop";

        modal.innerHTML = `
      <div class="job-modal" role="dialog" aria-modal="true" aria-labelledby="job-modal-title">
        <div class="job-modal-header">
          <div class="job-modal-heading">
            <div class="job-modal-icon">${getIcon(job.Technology, "job-modal-technology-icon")}</div>
            <h2 id="job-modal-title">${escapeHTML(job.Title)}</h2>
          </div>
          <button type="button" class="job-modal-close" aria-label="Close dialog">&times;</button>
          <div class="job-modal-meta">
            ${job.Location ? `<span>${getIcon("location")} ${escapeHTML(job.Location)}</span>` : ""}
            ${job["Employment Type"] ? `<span>${getIcon("work")} ${escapeHTML(job["Employment Type"])}</span>` : ""}
            ${job["Work Mode"] ? `<span>${getIcon("schedule")} ${escapeHTML(job["Work Mode"])}</span>` : ""}
            ${job.Experience ? `<span>${getIcon("experience")} ${escapeHTML(job.Experience)}</span>` : ""}
            ${job.Vacancies ? `<span class="job-modal-vacancies">${getIcon("group")} ${escapeHTML(job.Vacancies)} Vacancies</span>` : ""}
          </div>
        </div>
        <div class="job-modal-body">
          <section>
            <h3>About the Role</h3>
            <p>${escapeHTML(details?.["About the Role"] || "No information available.")}</p>
          </section>
          <section>
            <h3>Key Responsibilities</h3>
            ${renderDescriptionList(details?.["Key Responsibilities"])}
          </section>
          <section>
            <h3>Required Qualifications</h3>
            ${renderDescriptionList(details?.["Required Qualifications"])}
          </section>
          <section>
            <h3>Desired Skills &amp; Tech Stack</h3>
            ${renderSkills(details?.Skills || job.Skills)}
          </section>
        </div>
        <div class="job-modal-footer">
          <button type="button" class="job-modal-close-button">Close</button>
          <button type="button" class="job-modal-apply">Apply for this Job <span aria-hidden="true">→</span></button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        requestAnimationFrame(() => {
            modal.classList.add("is-visible");
        });

        let closing = false;

        const closeModal = () => {
            if (closing) return;
            closing = true;

            modal.classList.remove("is-visible");
            modal.classList.add("is-closing");
            document.removeEventListener("keydown", handleEscape);

            const finishClose = () => {
                if (!modal.isConnected) return;
                modal.remove();
                document.body.classList.remove("job-modal-open");
                triggerButton?.focus();
            };

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                finishClose();
                return;
            }

            modal.addEventListener("transitionend", (event) => {
                if (event.target === modal && event.propertyName === "opacity") {
                    finishClose();
                }
            });

            window.setTimeout(finishClose, 400);
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") closeModal();
        };

        modal.querySelectorAll(".job-modal-close, .job-modal-close-button").forEach((button) => {
            button.addEventListener("click", closeModal);
        });

        modal.addEventListener("click", (event) => {
            if (event.target === modal) closeModal();
        });

        modal.querySelector(".job-modal-apply").addEventListener("click", () => {
            applyForJob(job);
            block.dispatchEvent(
                new CustomEvent("recruitments:apply", {
                    bubbles: true,
                    detail: { jobId },
                })
            );
        });

        document.addEventListener("keydown", handleEscape);
        modal.querySelector(".job-modal-close").focus();
    }

    categoriesEl.addEventListener("click", (event) => {
        const button = event.target.closest(".jobs-category");
        if (!button || !categoriesEl.contains(button)) return;

        selectedTechnology = button.dataset.technology;
        renderCategories();
        renderJobs();
    });

    block.addEventListener("click", (event) => {
        const viewButton = event.target.closest("[data-view-jd]");
        const applyButton = event.target.closest("[data-apply-job]");

        if (viewButton && block.contains(viewButton)) {
            const jobId = viewButton.dataset.viewJd;
            openJobModal(jobId, viewButton);

            block.dispatchEvent(
                new CustomEvent("recruitments:view-jd", {
                    bubbles: true,
                    detail: { jobId },
                })
            );
        }

        if (applyButton && block.contains(applyButton)) {
            const jobId = applyButton.dataset.applyJob;
            const job = rows.find((item) => item.Id === jobId);
            if (job) applyForJob(job);

            block.dispatchEvent(
                new CustomEvent("recruitments:apply", {
                    bubbles: true,
                    detail: { jobId },
                })
            );
        }
    });

    try {
        const response = await fetch(DATA_URL, {
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            throw new Error(`JSON request failed: ${response.status}`);
        }

        const result = await response.json();
        const jobSheet = result.jd;
        const descriptionSheet = result["jd-full-description"];

        if (!Array.isArray(jobSheet?.data)) {
            throw new Error("The jd sheet must contain a data array.");
        }

        rows = jobSheet.data.map((row) => ({
            ...row,
            Technology: value(row, "Technology"),
            Id: value(row, "Id"),
            Title: value(row, "Position"),
            Expertise: value(row, "Expertise"),
            Description: value(row, "Description"),
            Location: value(row, "Location"),
            "Work Mode": value(row, "Work Mode"),
            "Employment Type": value(row, "Employment Type"),
            Vacancies: value(row, "Vacancies"),
            Status: value(row, "Status"),
            Skills: value(row, "Skills"),
            "View JD Button": value(row, "View JD Button"),
            "Apply J Button": value(row, "Apply J Button"),
            "Apply J Link": value(row, "Apply J Link"),
        }));

        fullDescriptionRows = Array.isArray(descriptionSheet?.data)
            ? descriptionSheet.data.map((row) => ({
                  ...row,
                  Id: value(row, "Id"),
                  "About the Role": value(row, "About the Role"),
                  "Key Responsibilities": value(row, "Key Responsibilities"),
                  "Required Qualifications": value(row, "Required Qualifications"),
                  Skills: value(row, "Skills"),
              }))
            : [];

        technologies = [...new Set(rows.map((row) => row.Technology).filter(Boolean))];
        selectedTechnology = technologies[0] || "";

        loadingEl.hidden = true;
        renderCategories();
        renderJobs();
    } catch (error) {
        console.error("Recruitments block error:", error);
        loadingEl.hidden = true;
        listEl.hidden = true;
        emptyEl.hidden = true;
        errorEl.hidden = false;
    }
}
