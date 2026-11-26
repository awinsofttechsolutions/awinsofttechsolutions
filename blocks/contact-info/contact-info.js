const ICON_PATH = '/media/icons/contact-us/';
const ICON_EXTENSION = '.png';
const FORM_URL = '/forms/contact-us-form.json';

const MAP_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d951.5794511886903!2d78.38792026960634!3d17.444496678390408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb910046fc5b6d%3A0xfafbf3153a3511b1!2sAWIN%20Softtech%20Solutions%20Private%20Limited!5e0!3m2!1sen!2sus!4v1795503809889!5m2!1sen!2sus';
const DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=17.4444954,78.388564';

/* =========================================
   COMMON HELPERS
========================================= */

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createLink(href, text, className = '', external = false) {
  const link = createElement('a', className, text);
  link.href = href;

  if (external) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  return link;
}

/* =========================================
   COLUMN ORGANIZATION
   Groups individual EDS blocks dynamically.
========================================= */

function organizeContactColumns(section) {
  if (!section) return;

  let leftGroup = section.querySelector(
    ':scope > .contact-column-left-group',
  );

  let rightGroup = section.querySelector(
    ':scope > .contact-column-right-group',
  );

  if (!leftGroup) {
    leftGroup = createElement('div', 'contact-column-left-group');
  }

  if (!rightGroup) {
    rightGroup = createElement('div', 'contact-column-right-group');
  }

  if (!leftGroup.parentElement || !rightGroup.parentElement) {
    section.prepend(leftGroup, rightGroup);
  }

  const wrappers = [
    ...section.querySelectorAll('.contact-info-wrapper'),
  ];

  wrappers.forEach((wrapper) => {
    const block = wrapper.querySelector(
      ':scope > .contact-info',
    );

    if (!block) return;

    if (
      block.classList.contains('direct-enquiries')
      || block.classList.contains('office-location')
      || block.classList.contains('connect-with-us')
    ) {
      leftGroup.append(wrapper);
      wrapper.classList.add('contact-column-left');
      wrapper.classList.remove('contact-column-right');
    } else if (
      block.classList.contains('contact-form')
      || block.classList.contains('direct-connects')
    ) {
      rightGroup.append(wrapper);
      wrapper.classList.add('contact-column-right');
      wrapper.classList.remove('contact-column-left');
    }
  });
}

/* =========================================
   ICONS
========================================= */

function decorateIcons(block) {
  block.querySelectorAll('.icon').forEach((icon) => {
    const existingImage = icon.querySelector('img');

    const iconName = existingImage?.dataset.iconName
      || [...icon.classList]
        .find((name) => name.startsWith('icon-'))
        ?.replace('icon-', '');

    if (!iconName) return;

    const image = existingImage || document.createElement('img');

    image.src = `${ICON_PATH}${iconName}${ICON_EXTENSION}`;
    image.width = 22;
    image.height = 22;
    image.loading = 'lazy';
    image.alt = '';

    if (!existingImage) icon.replaceChildren(image);
  });
}

/* =========================================
   EMAILS
========================================= */

function decorateEmails(block) {
  block.querySelectorAll('li').forEach((item) => {
    const email = item.textContent.trim();

    if (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      && !item.querySelector('a')
    ) {
      item.replaceChildren(
        createLink(`mailto:${email}`, email, 'contact-email-link'),
      );
    }
  });
}

/* =========================================
   PHONE NUMBERS
========================================= */

function decoratePhones(block) {
  block.querySelectorAll('li').forEach((item) => {
    const phone = item.textContent.trim();

    if (/^\+?[\d\s()-]{8,}$/.test(phone) && !item.querySelector('a')) {
      const number = phone.replace(/[^\d+]/g, '');

      item.replaceChildren(
        createLink(`tel:${number}`, phone, 'contact-phone-link'),
      );
    }
  });
}

/* =========================================
   DIRECT ENQUIRIES
========================================= */

function decorateEnquiries(block) {
  block.classList.add('contact-enquiries');

  [...block.children].forEach((row, index) => {
    const cells = [...row.children];

    if (index === 0) {
      row.classList.add('contact-section-heading');
      return;
    }

    row.classList.add('enquiry-item');
    cells[0]?.classList.add('enquiry-icon');
    cells[1]?.classList.add('enquiry-content');
  });
}

/* =========================================
   OFFICE LOCATION
========================================= */

function decorateOffice(block) {
  block.classList.add('contact-office');

  const rows = [...block.children];

  rows.forEach((row, index) => {
    const cells = [...row.children];

    if (index === 0) {
      row.classList.add('office-heading');
      cells[0]?.classList.add('office-heading-icon');
      cells[1]?.classList.add('office-heading-content');
    } else if (index === 1) {
      row.classList.add('office-address');
      cells[0]?.classList.add('office-address-icon');
      cells[1]?.classList.add('office-address-content');
    } else if (index === 2) {
      row.classList.add('office-directions');

      const icon = row.querySelector('.icon');

      const button = createLink(
        DIRECTIONS_URL,
        '',
        'contact-directions-link',
        true,
      );

      if (icon) button.append(icon);

      button.append(
        createElement('span', '', 'Get Directions'),
      );

      row.replaceChildren(button);
    } else if (index === 3) {
      row.classList.add('office-details');
      cells[0]?.classList.add('office-phone');
      cells[1]?.classList.add('office-hours');
    }
  });

  decoratePhones(block);

  if (!block.querySelector('.contact-map')) {
    const mapWrapper = createElement('div', 'contact-map');
    const iframe = document.createElement('iframe');

    iframe.src = MAP_URL;
    iframe.title = 'AWIN Softtech Solutions office location';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    mapWrapper.append(iframe);

    const directionsRow = block.querySelector('.office-directions');

    if (directionsRow) {
      directionsRow.after(mapWrapper);
    } else {
      block.append(mapWrapper);
    }
  }
}

/* =========================================
   OFFICIAL SOCIAL CHANNELS
========================================= */

function decorateSocial(block) {
  block.classList.add('contact-social');

  [...block.children].forEach((row, index) => {
    const cells = [...row.children];

    if (index === 0) {
      row.classList.add('social-heading');
      return;
    }

    row.classList.add('social-list');

    cells.forEach((cell) => {
      cell.classList.add('social-item');

      const link = cell.querySelector('a[href]');
      if (!link) return;

      const icon = cell.querySelector('.icon');
      const label = link.textContent.trim();

      link.classList.add('social-link');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.replaceChildren();

      if (icon) {
        link.append(icon);
        icon.closest('p')?.remove();
      }

      link.append(createElement('span', '', label));
    });
  });
}

/* =========================================
   WHATSAPP & LINKEDIN CARDS
   Preserve links authored in EDS.
========================================= */

function decorateDirectConnects(block) {
  block.classList.add('contact-social-cards');

  [...block.children].forEach((row, index) => {
    const sourceCell = row.querySelector(':scope > div');
    if (!sourceCell) return;

    const type = index === 0 ? 'whatsapp' : 'linkedin';

    row.classList.add('contact-social-card', type);

    const iconParagraph = sourceCell.querySelector('p:has(.icon)');
    const icon = iconParagraph?.querySelector('.icon');
    const heading = sourceCell.querySelector('h5, h3, h4');

    const description = [...sourceCell.querySelectorAll('p')]
      .find((paragraph) => !paragraph.querySelector('.icon'));

    const link = sourceCell.querySelector('a[href]');

    const content = createElement('div', 'contact-social-content');
    const textContent = createElement('div', 'contact-social-text');

    if (icon) {
      icon.classList.add('contact-social-icon');
      content.append(icon);
    }

    if (heading) {
      heading.classList.add('contact-social-title');
      textContent.append(heading);
    }

    if (description) {
      description.classList.add('contact-social-description');
      textContent.append(description);
    }

    content.append(textContent);
    row.replaceChildren(content);

    if (link) {
      link.classList.add('contact-social-action');

      if (link.href.startsWith('http')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      row.append(link);
    }
  });
}

/* =========================================
   CONTACT FORM HELPERS
========================================= */

function isTrue(value) {
  return ['true', 'yes', '1'].includes(
    String(value || '').trim().toLowerCase(),
  );
}

function createFieldId(name) {
  return `awin-contact-${String(name || 'field')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;
}

function createFieldDescription(field, description) {
  if (!description) return null;

  const id = `${field.id}-description`;

  field.setAttribute('aria-describedby', id);

  const element = createElement(
    'span',
    'contact-form-description visually-hidden',
    description,
  );

  element.id = id;

  return element;
}

function applyFieldAttributes(field, row) {
  if (row.Placeholder && 'placeholder' in field) {
    field.placeholder = row.Placeholder;
  }

  if (row.Value && !['checkbox', 'radio'].includes(field.type)) {
    field.value = row.Value;
  }

  if (isTrue(row.Mandatory)) {
    field.required = true;
  }

  if (row.Min !== undefined && row.Min !== '') field.min = row.Min;
  if (row.Max !== undefined && row.Max !== '') field.max = row.Max;
  if (row.Step !== undefined && row.Step !== '') field.step = row.Step;

  if (isTrue(row.ReadOnly)) {
    field.readOnly = true;
  }
}

function createFieldLabel(field, row) {
  const label = createElement(
    'label',
    'contact-form-label',
    row.Label || row.Name,
  );

  label.htmlFor = field.id;

  if (isTrue(row.Mandatory)) {
    const required = createElement('span', 'required-marker', ' *');
    required.setAttribute('aria-hidden', 'true');
    label.append(required);
  }

  return label;
}

/* =========================================
   SELECT FIELD OPTIONS
========================================= */

function createSelectOptions(field, row) {
  const firstOption = createElement(
    'option',
    '',
    row.Placeholder || 'Select an option...',
  );

  firstOption.value = '';
  firstOption.disabled = true;
  firstOption.selected = true;

  field.append(firstOption);

  String(row.Options || '')
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean)
    .forEach((option) => {
      const optionElement = createElement('option', '', option);
      optionElement.value = option;
      field.append(optionElement);
    });
}

/* =========================================
   CUSTOM AWIN SELECT DROPDOWN
   Original select remains the real form field.
========================================= */

function enhanceCustomSelect(select) {
  const wrapper = createElement('div', 'awin-custom-select');
  const trigger = createElement('button', 'awin-custom-select-trigger');
  const value = createElement('span', 'awin-custom-select-value');
  const arrow = createElement('span', 'awin-custom-select-arrow');
  const list = createElement('div', 'awin-custom-select-list');

  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', select.name);

  list.setAttribute('role', 'listbox');
  list.hidden = true;
  list.id = `${select.id}-options`;

  trigger.setAttribute('aria-controls', list.id);

  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '';

  function closeList() {
    list.hidden = true;

    trigger.setAttribute('aria-expanded', 'false');
    wrapper.classList.remove('is-open');

    list.querySelectorAll('.is-focused')
      .forEach((item) => item.classList.remove('is-focused'));
  }

  const options = [...select.options].map((option) => {
    const item = createElement(
      'button',
      'awin-custom-select-option',
      option.textContent,
    );

    item.type = 'button';
    item.setAttribute('role', 'option');
    item.dataset.value = option.value;
    item.disabled = option.disabled;

    item.setAttribute(
      'aria-selected',
      String(select.value === option.value),
    );

    item.addEventListener('click', () => {
      if (option.disabled) return;

      select.value = option.value;

      select.dispatchEvent(
        new Event('change', { bubbles: true }),
      );

      closeList();
      trigger.focus();
    });

    list.append(item);
    return item;
  });

  function updateDisplay() {
    const selected = select.options[select.selectedIndex];

    value.textContent = selected?.textContent
      || select.options[0]?.textContent
      || 'Select an option...';

    trigger.classList.toggle('is-placeholder', !select.value);

    options.forEach((item) => {
      const selectedOption = item.dataset.value === select.value;

      item.setAttribute('aria-selected', String(selectedOption));
      item.classList.toggle('is-selected', selectedOption);
      item.classList.remove('is-focused');
    });
  }

  function openList() {
    list.hidden = false;

    trigger.setAttribute('aria-expanded', 'true');
    wrapper.classList.add('is-open');

    const selected = options.find(
      (item) => item.dataset.value === select.value,
    ) || options.find((item) => !item.disabled);

    selected?.scrollIntoView({ block: 'nearest' });
  }

  function focusOption(index) {
    const enabled = options.filter((item) => !item.disabled);

    if (!enabled.length) return;

    const target = enabled[index];

    enabled.forEach((item) => item.classList.remove('is-focused'));

    if (target) {
      target.classList.add('is-focused');
      target.scrollIntoView({ block: 'nearest' });
    }
  }

  trigger.append(value, arrow);
  wrapper.append(trigger, list);

  select.insertAdjacentElement('afterend', wrapper);

  select.classList.add('awin-native-select');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  select.addEventListener('change', updateDisplay);

  trigger.addEventListener('click', () => {
    if (list.hidden) {
      openList();
    } else {
      closeList();
    }
  });

  trigger.addEventListener('keydown', (event) => {
    const enabled = options.filter((item) => !item.disabled);

    const current = enabled.findIndex(
      (item) => item.dataset.value === select.value,
    );

    let next = current < 0 ? 0 : current;

    if (event.key === 'ArrowDown') {
      next = Math.min(next + 1, enabled.length - 1);
    } else if (event.key === 'ArrowUp') {
      next = Math.max(next - 1, 0);
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = enabled.length - 1;
    } else if (event.key === 'Escape') {
      closeList();
      return;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (list.hidden) {
        openList();
      } else {
        const focused = list.querySelector('.is-focused');
        focused?.click();
      }

      return;
    } else {
      return;
    }

    event.preventDefault();

    if (list.hidden) openList();

    focusOption(next);
  });

  list.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeList();
      trigger.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!wrapper.contains(event.target)) {
      closeList();
    }
  });

  updateDisplay();

  return { wrapper, trigger };
}

/* =========================================
   CHECKBOX FIELD
========================================= */

function createCheckboxField(row) {
  const wrapper = createElement(
    'div',
    'contact-form-field field-full-width contact-form-consent',
  );

  const label = createElement('label', 'contact-form-choice-label');
  const checkbox = document.createElement('input');

  checkbox.type = 'checkbox';
  checkbox.id = createFieldId(row.Name);
  checkbox.name = row.Name;
  checkbox.className = 'contact-form-checkbox';
  checkbox.value = 'true';
  checkbox.checked = isTrue(row.Checked);

  if (isTrue(row.Mandatory)) {
    checkbox.required = true;
  }

  label.append(checkbox);

  const labelText = String(row.Label || row.Name || '');
  const privacyMatch = labelText.match(/privacy policy/i);

  if (privacyMatch) {
    label.append(
      document.createTextNode(labelText.slice(0, privacyMatch.index)),
    );

    const privacyLink = createElement('a', '', 'privacy policy');

    privacyLink.href = '/pages/legal-pages/privacy-and-policy';

    label.append(privacyLink);

    label.append(
      document.createTextNode(
        labelText.slice(privacyMatch.index + privacyMatch[0].length),
      ),
    );
  } else {
    label.append(document.createTextNode(` ${labelText}`));
  }

  wrapper.append(label);

  const description = createFieldDescription(
    checkbox,
    row.Describe,
  );

  if (description) wrapper.append(description);

  return wrapper;
}

/* =========================================
   REGULAR FORM FIELDS
========================================= */

function createRegularField(row, index) {
  const name = row.Name || `field-${index + 1}`;
  const type = String(row.Type || 'text').toLowerCase();

  const wrapper = createElement('div', 'contact-form-field');

  if (Number(row['Column Span']) === 12) {
    wrapper.classList.add('field-full-width');
  }

  let field;

  if (type === 'textarea') {
    field = createElement('textarea', 'contact-form-input');
    field.rows = 4;
  } else if (type === 'select') {
    field = createElement('select', 'contact-form-input');
    createSelectOptions(field, row);
  } else {
    field = createElement('input', 'contact-form-input');

    const allowedTypes = [
      'text',
      'email',
      'tel',
      'number',
      'date',
      'url',
    ];

    field.type = allowedTypes.includes(type) ? type : 'text';
  }

  field.id = createFieldId(name);
  field.name = name;

  applyFieldAttributes(field, row);

  wrapper.append(createFieldLabel(field, row), field);

  if (type === 'select') {
    const customSelect = enhanceCustomSelect(field);
    wrapper.customSelect = customSelect;
  }

  const description = createFieldDescription(
    field,
    row.Describe,
  );

  if (description) wrapper.append(description);

  return wrapper;
}

/* =========================================
   SUBMIT BUTTON
========================================= */

function createSubmitButton(row) {
  const button = createElement(
    'button',
    'contact-form-submit',
    row.Label || 'Send Message',
  );

  button.type = 'submit';
  button.dataset.successMessage = row.Value || '';

  return button;
}

/* =========================================
   BUILD FORM FROM AEM JSON
========================================= */

function buildContactForm(rows) {
  const form = createElement('form', 'awin-contact-form');
  form.noValidate = true;

  const fields = createElement('div', 'contact-form-fields');

  let submitButton;

  const customSelects = [];

  rows.forEach((row, index) => {
    if (row.Visible && !isTrue(row.Visible)) return;

    const type = String(row.Type || '').toLowerCase();

    if (type === 'submit') {
      submitButton = createSubmitButton(row);
      return;
    }

    if (type === 'hidden') {
      const hidden = document.createElement('input');

      hidden.type = 'hidden';
      hidden.name = row.Name;
      hidden.value = row.Value || '';

      form.append(hidden);
      return;
    }

    if (type === 'checkbox') {
      fields.append(createCheckboxField(row));
      return;
    }

    const fieldWrapper = createRegularField(row, index);

    if (fieldWrapper.customSelect) {
      customSelects.push(fieldWrapper.customSelect);
    }

    fields.append(fieldWrapper);
  });

  form.append(fields);

  const buttonWrapper = createElement(
    'div',
    'contact-form-button-wrapper field-full-width',
  );

  const finalSubmitButton = submitButton
    || createSubmitButton({ Label: 'Send Message' });
  const requiredCheckboxes = [
    ...form.querySelectorAll('.contact-form-checkbox[required]'),
  ];
  const updateSubmitButtonState = () => {
    finalSubmitButton.disabled = requiredCheckboxes.some(
      (checkbox) => !checkbox.checked,
    );
  };

  requiredCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', updateSubmitButtonState);
  });
  updateSubmitButtonState();

  buttonWrapper.append(finalSubmitButton);

  form.append(buttonWrapper);

  const status = createElement('p', 'contact-form-status');

  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  form.append(status);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const invalid = [...form.elements].find(
      (field) => field.willValidate && !field.checkValidity(),
    );

    if (invalid) {
      const custom = customSelects.find(
        (item) => item.wrapper.previousElementSibling === invalid,
      );

      if (custom) {
        custom.trigger.focus();
      } else {
        invalid.reportValidity();
      }

      return;
    }

    status.textContent = 'The submission service is not connected yet. Please contact AWIN directly.';
  });

  return form;
}

/* =========================================
   LOAD AEM FORM JSON
========================================= */

async function loadContactForm(block) {
  if (block.dataset.formInitialized === 'true') return;

  block.dataset.formInitialized = 'true';
  block.classList.add('contact-form-placeholder');

  const heading = block.children[0];

  if (heading) {
    heading.classList.add('contact-section-heading');
  }

  const loading = createElement(
    'p',
    'contact-form-loading',
    'Loading contact form...',
  );

  [...block.children].slice(1).forEach((child) => child.remove());

  block.append(loading);

  try {
    const response = await fetch(FORM_URL);

    if (!response.ok) {
      throw new Error(`Form request failed: ${response.status}`);
    }

    const json = await response.json();

    if (!Array.isArray(json.data)) {
      throw new Error('AEM form data array not found.');
    }

    const form = buildContactForm(json.data);

    loading.remove();
    block.append(form);
  } catch (error) {
    // Keep diagnostics available when form loading fails.
    // eslint-disable-next-line no-console
    console.error('AWIN Contact Form:', error);

    loading.textContent = 'Unable to load the contact form. Please try again later.';

    loading.classList.add('contact-form-error');
  }
}

/* =========================================
   MAIN DECORATOR
========================================= */

export default function decorate(block) {
  if (block.dataset.contactInitialized === 'true') return;

  block.dataset.contactInitialized = 'true';

  const section = block.closest('.contact-info-container');

  if (!section) return;

  section.classList.add('contact-two-column');

  /* Group individual EDS blocks into columns. */
  organizeContactColumns(section);

  /* Decorate icons. */
  decorateIcons(block);

  /* Decorate the individual block. */
  if (block.classList.contains('direct-enquiries')) {
    decorateEnquiries(block);
    decorateEmails(block);
  } else if (block.classList.contains('office-location')) {
    decorateOffice(block);
  } else if (block.classList.contains('connect-with-us')) {
    decorateSocial(block);
  } else if (block.classList.contains('contact-form')) {
    loadContactForm(block);
  } else if (block.classList.contains('direct-connects')) {
    decorateDirectConnects(block);
  }
}
