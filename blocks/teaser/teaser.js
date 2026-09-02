export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) return;

  /*
   * EDS teaser structure:
   *
   * Row
   * ├── Image
   * └── Content
   */

  const contentRow = rows[0];

  if (!contentRow) return;

  const columns = [...contentRow.children];

  const imageColumn = columns[0];
  const contentColumn = columns[1];

  /* =========================================================
     IMAGE
     ========================================================= */

  if (imageColumn) {
    imageColumn.classList.add('teaser-image');
  }


  /* =========================================================
     CONTENT
     ========================================================= */

  if (contentColumn) {
    contentColumn.classList.add('teaser-content');

    /*
     * Find CTA list
     */
    const buttonList = contentColumn.querySelector('ul');

    if (buttonList) {
      buttonList.classList.add('teaser-buttons');

      const items = [
        ...buttonList.querySelectorAll(':scope > li'),
      ];

      items.forEach((item, index) => {
        /*
         * Look for an authored link.
         *
         * If the author entered:
         *
         * <a href="/courses">Explore Courses</a>
         *
         * preserve the href.
         */

        const existingLink = item.querySelector('a');

        const text = existingLink
          ? existingLink.textContent.trim()
          : item.textContent.trim();

        const href = existingLink
          ? existingLink.getAttribute('href')
          : '#';

        /*
         * Clear original content
         */
        item.textContent = '';

        /*
         * Create link
         */
        const link = document.createElement('a');

        link.className = 'teaser-button';
        link.href = href || '#';

        /*
         * Button label
         */
        const label = document.createElement('span');

        label.className = 'teaser-button-label';
        label.textContent = text;

        /*
         * Arrow
         */
        const arrow = document.createElement('span');

        arrow.className = 'teaser-button-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';

        /*
         * Build button
         */
        link.append(label, arrow);

        item.append(link);

        /*
         * Number the buttons.
         *
         * This lets CSS automatically style
         * button 1, button 2, button 3, etc.
         */

        item.classList.add(
          `teaser-button-item-${index + 1}`,
        );
      });
    }
  }


  /* =========================================================
     SECTION VARIANTS
     ========================================================= */

  const section = block.closest('.section');

  if (!section) return;

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