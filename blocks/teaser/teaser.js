/**
 * Teaser block decorator.
 * Supports image + text, text-only and CTA teaser layouts.
 * @param {Element} block The teaser block element.
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const contentRow = rows[0];
  const columns = [...contentRow.children];
  if (!columns.length) return;
  const imageColumn = columns.find((column) => column.querySelector('picture, img'));
  const contentColumn = columns.find((column) => column !== imageColumn)
    || (imageColumn ? null : columns[0]);
  if (imageColumn) {
    imageColumn.classList.add('teaser-image');
  }
  if (contentColumn) {
    contentColumn.classList.add('teaser-content');
    const buttonList = contentColumn.querySelector('ul');
    if (buttonList) {
      buttonList.classList.add('teaser-buttons');
      [...buttonList.querySelectorAll(':scope > li')].forEach((item, index) => {
        const existingLink = item.querySelector('a');
        const labelText = existingLink
          ? existingLink.textContent.trim()
          : item.textContent.trim();
        const href = existingLink?.getAttribute('href') || '#';
        item.textContent = '';
        const link = document.createElement('a');
        link.className = 'teaser-button';
        link.href = href;
        const label = document.createElement('span');
        label.className = 'teaser-button-label';
        label.textContent = labelText;
        const arrow = document.createElement('span');
        arrow.className = 'teaser-button-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';
        link.append(label, arrow);
        item.append(link);
        item.classList.add(`teaser-button-item-${index + 1}`);
      });
    }
  }
  const section = block.closest('.section');
  if (section) {
    const variants = [
      'text-left',
      'text-right',
      'text-center',
      'image-left',
      'image-right',
      'image-center',
    ];
    variants.forEach((variant) => {
      if (section.classList.contains(variant)) {
        block.classList.add(variant);
      }
    });
  }
  if (!imageColumn) {
    block.classList.add('teaser-no-image');
  }
}
