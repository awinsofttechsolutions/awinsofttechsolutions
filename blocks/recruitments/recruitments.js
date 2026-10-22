
const DATA_URL = '/pages/json/recruitments.json';
const ICON_BASE_PATH = '/media/icons/recruitments';

/**
 * Normalize spreadsheet values.
 */
function value(row, key) {
  return String(row[key] ?? '').trim();
}

/**
 * Escape dynamic values before inserting them into HTML.
 */
function escapeHTML(input) {
  return String(input ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

/**
 * Render an icon from the recruitment PNG media directory.
 *
 * Example:
 * /media/icons/recruitments/location.png
 * /media/icons/recruitments/adobe.png
 */
function getIcon(name, className = '') {
  const iconName = String(name ?? '').trim().toLowerCase();

  if (!/^[a-z0-9-]+$/.test(iconName)) {
    return '';
  }

  const safeClassName = String(className)
    .split(/\s+/)
    .filter((token) => /^[a-zA-Z0-9_-]+$/.test(token))
    .join(' ');

  return `
    <span class="icon icon-${iconName} ${safeClassName}" aria-hidden="true">
      <img
        src="${ICON_BASE_PATH}/${iconName}.png"
        data-icon-name="${iconName}"
        alt=""
        width="18"
        height="18"
        loading="lazy"
        decoding="async"
      >
    </span>
  `;
}

export default async function decorate(block) {
  /**
   * The hidden icon registry also has the block name
   * "recruitments". Do not turn that block into a job listing.
   */
  if (
    block.classList.contains('icons')
    || block.closest('[data-visibility="hidden"]')
  ) {
    return;
  }

  /**
   * Prevent the same element from being decorated twice.
   */
  if (block.dataset.recruitmentsInitialized === 'true') {
    return;
  }

  block.dataset.recruitmentsInitialized = 'true';
  block.classList.add('recruitments');

  block.innerHTML = `
    <div class="jobs-board">
      <aside class="jobs-sidebar">
        <nav
          class="jobs-categories"
          aria-label="Job technology categories">
        </nav>
      </aside>

      <section class="jobs-content" aria-label="Job openings">
        <div class="jobs-list" aria-live="polite"></div>

        <p class="jobs-message jobs-loading">
          Loading jobs...
        </p>

        <p class="jobs-message jobs-empty" hidden>
          No active openings in this category right now.
        </p>

        <p class="jobs-message jobs-error" hidden>
          Unable to load jobs. Please try again later.
        </p>
      </section>
    </div>
  `;

  const categoriesEl = block.querySelector('.jobs-categories');
  const listEl = block.querySelector('.jobs-list');
  const loadingEl = block.querySelector('.jobs-loading');
  const emptyEl = block.querySelector('.jobs-empty');
  const errorEl = block.querySelector('.jobs-error');

  let rows = [];
  let technologies = [];
  let selectedTechnology = '';

  /**
   * Render the technology sidebar once.
   * The technology icon now loads from the PNG media path.
   */
  function renderCategories() {
    categoriesEl.innerHTML = technologies.map((technology) => {
      const active = technology === selectedTechnology;
      const iconName = technology.toLowerCase();

      return `
        <button
          type="button"
          class="jobs-category${active ? ' is-active' : ''}"
          data-technology="${escapeHTML(technology)}"
          aria-pressed="${active}"
        >
          ${getIcon(iconName, 'jobs-category-icon')}

          <span class="jobs-category-name">
            ${escapeHTML(technology)}
          </span>
        </button>
      `;
    }).join('');
  }

  /**
   * Render a single job card.
   * No sidebar or jobs-board is created here.
   */
  function renderJob(job) {
    return `
      <article
        class="job-card"
        data-job-id="${escapeHTML(job.Id)}"
      >
        <span class="job-card-accent" aria-hidden="true"></span>

        <div class="job-card-heading">
          <div class="job-role-icon" aria-hidden="true">
            ${getIcon(job.Technology, 'job-technology-icon')}
          </div>

          <h2 class="job-title">
            ${escapeHTML(job.Title)}
          </h2>
        </div>

        ${job.Description ? `
          <p class="job-description">
            ${escapeHTML(job.Description)}
          </p>
        ` : ''}

        <div class="job-divider" aria-hidden="true"></div>

        <div class="job-card-footer">
          <div class="job-meta">
            ${job.Location ? `
              <span class="job-meta-item">
                ${getIcon('location', 'job-meta-icon')}
                <span>${escapeHTML(job.Location)}</span>
              </span>
            ` : ''}

            ${job['Employment Type'] ? `
              <span class="job-meta-item">
                ${getIcon('schedule', 'job-meta-icon')}
                <span>${escapeHTML(job['Employment Type'])}</span>
              </span>
            ` : ''}

            ${job.Vacancies ? `
              <span class="job-meta-item job-vacancies">
                ${getIcon('work', 'job-meta-icon')}
                <span>${escapeHTML(job.Vacancies)} vacancies</span>
              </span>
            ` : ''}
          </div>

          <div class="job-actions">
            <button
              type="button"
              class="job-button job-button-secondary"
              data-view-jd="${escapeHTML(job.Id)}"
            >
              ${escapeHTML(
                job['View JD Button'] || 'View Full Job Description',
              )}
            </button>

            <button
              type="button"
              class="job-button job-button-primary"
              data-apply-job="${escapeHTML(job.Id)}"
            >
              ${escapeHTML(
                job['Apply J Button'] || 'Apply for this job',
              )}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Filter active jobs and replace the list contents.
   * This prevents cards accumulating on category changes.
   */
  function renderJobs() {
    const visibleJobs = rows.filter((job) => (
      job.Technology === selectedTechnology
      && job.Id
      && job.Title
      && job.Status.toLowerCase() === 'active'
    ));

    listEl.innerHTML = visibleJobs.map(renderJob).join('');
    listEl.hidden = visibleJobs.length === 0;
    emptyEl.hidden = visibleJobs.length > 0;
  }

  /**
   * Handle technology category selection.
   */
  categoriesEl.addEventListener('click', (event) => {
    const button = event.target.closest('.jobs-category');

    if (!button || !categoriesEl.contains(button)) {
      return;
    }

    selectedTechnology = button.dataset.technology;

    renderCategories();
    renderJobs();
  });

  /**
   * Preserve the existing custom events for JD and Apply buttons.
   */
  block.addEventListener('click', (event) => {
    const viewButton = event.target.closest('[data-view-jd]');
    const applyButton = event.target.closest('[data-apply-job]');

    if (viewButton && block.contains(viewButton)) {
      block.dispatchEvent(new CustomEvent('recruitments:view-jd', {
        bubbles: true,
        detail: {
          jobId: viewButton.dataset.viewJd,
        },
      }));
    }

    if (applyButton && block.contains(applyButton)) {
      block.dispatchEvent(new CustomEvent('recruitments:apply', {
        bubbles: true,
        detail: {
          jobId: applyButton.dataset.applyJob,
        },
      }));
    }
  });

  try {
    const response = await fetch(DATA_URL, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`JSON request failed: ${response.status}`);
    }

    const result = await response.json();

    if (!Array.isArray(result.data)) {
      throw new Error('The JSON response must contain a data array.');
    }

    /**
     * Normalize all rows.
     * Keep empty rows so their technology names can still appear
     * as categories (for example, DevOps).
     */
    rows = result.data.map((row) => ({
      ...row,
      Technology: value(row, 'Technology'),
      Id: value(row, 'Id'),
      Title: value(row, 'Title'),
      Description: value(row, 'Description'),
      Location: value(row, 'Location'),
      'Employment Type': value(row, 'Employment Type'),
      Vacancies: value(row, 'Vacancies'),
      Status: value(row, 'Status'),
      'View JD Button': value(row, 'View JD Button'),
      'Apply J Button': value(row, 'Apply J Button'),
    }));

    technologies = [...new Set(
      rows.map((row) => row.Technology).filter(Boolean),
    )];

    selectedTechnology = technologies[0] || '';

    loadingEl.hidden = true;

    renderCategories();
    renderJobs();
  } catch (error) {
    console.error('Recruitments block error:', error);

    loadingEl.hidden = true;
    listEl.hidden = true;
    emptyEl.hidden = true;
    errorEl.hidden = false;
  }
}
