const ICON_PATH = '/media/icons/contact-us/';
const ICON_EXTENSION = '.png';
const MAP_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d951.5794511886903!2d78.38792026960634!3d17.444496678390408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb910046fc5b6d%3A0xfafbf3153a3511b1!2sAWIN%20Softtech%20Solutions%20Private%20Limited!5e0!3m2!1sen!2sus!4v1795503809889!5m2!1sen!2sus';
const DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=17.4444954,78.388564';

function createLink(href, text, className, external = false) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  link.className = className;
  if (external) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return link;
}

function decorateIcons(block) {
  block.querySelectorAll('.icon').forEach((icon) => {
    const existingImage = icon.querySelector('img');
    const iconName = existingImage?.dataset.iconName || [...icon.classList].find((name) => name.startsWith('icon-'))?.replace('icon-', '');
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

function decorateEmails(block) {
  block.querySelectorAll('li').forEach((item) => {
    const email = item.textContent.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !item.querySelector('a')) {
      item.replaceChildren(createLink(`mailto:${email}`, email, 'contact-email-link'));
    }
  });
}

function decoratePhones(block) {
  block.querySelectorAll('li').forEach((item) => {
    const phone = item.textContent.trim();
    if (/^\+?[\d\s()-]{8,}$/.test(phone) && !item.querySelector('a')) {
      const number = phone.replace(/[^\d+]/g, '');
      item.replaceChildren(createLink(`tel:${number}`, phone, 'contact-phone-link'));
    }
  });
}

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
      const button = createLink(DIRECTIONS_URL, '', 'contact-directions-link', true);

      if (icon) button.append(icon);

      const label = document.createElement('span');
      label.textContent = 'Get Directions';
      button.append(label);

      row.replaceChildren(button);
    } else if (index === 3) {
      row.classList.add('office-details');
      cells[0]?.classList.add('office-phone');
      cells[1]?.classList.add('office-hours');
    }
  });

  decoratePhones(block);

  // Google Maps embed
  if (!block.querySelector('.contact-map')) {
    const mapWrapper = document.createElement('div');
    mapWrapper.className = 'contact-map';

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

      const text = document.createElement('span');
      text.textContent = label;
      link.append(text);
    });
  });
}

export default function decorate(block) {
  if (block.dataset.contactInitialized === 'true') return;
  block.dataset.contactInitialized = 'true';

  const section = block.closest('.contact-info-container');
  section?.classList.add('contact-two-column');

  const wrapper = block.closest('.contact-info-wrapper');

  if (block.classList.contains('column-left')) {
    wrapper?.classList.add('contact-column-left');
  }

  if (block.classList.contains('column-right')) {
    wrapper?.classList.add('contact-column-right');
  }

  decorateIcons(block);

  if (block.classList.contains('direct-enquiries')) {
    decorateEnquiries(block);
    decorateEmails(block);
  } else if (block.classList.contains('office-location')) {
    decorateOffice(block);
  } else if (block.classList.contains('connect-with-us')) {
    decorateSocial(block);
  } else if (block.classList.contains('contact-form')) {
    block.classList.add('contact-form-placeholder');
    block.children[0]?.classList.add('contact-section-heading');
  }
}
