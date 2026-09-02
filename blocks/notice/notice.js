export default function decorate(block) {
  const row = block.querySelector(':scope > div');

  if (!row) return;

  const columns = [...row.children];

  /*
   * Notice block structure:
   *
   * <div>
   *   <div>
   *     <picture>...</picture>
   *   </div>
   *
   *   <div>
   *     <h6>...</h6>
   *     <h3>...</h3>
   *     <p>...</p>
   *     <ul>
   *       <li><a>...</a></li>
   *       <li><a>...</a></li>
   *     </ul>
   *   </div>
   * </div>
   */

  /* Image / Icon */

  if (columns.length > 1) {
    columns[0].classList.add('notice-icon');
    columns[1].classList.add('notice-content');
  } else if (columns.length === 1) {
    columns[0].classList.add('notice-content');
  }


  /* Make sure picture column has notice-icon class */

  const picture = block.querySelector('picture');

  if (picture) {
    const imageColumn = picture.closest('div');

    if (imageColumn) {
      imageColumn.classList.add('notice-icon');
    }
  }


  /* CTA buttons */

  const buttons = block.querySelector('ul');

  if (buttons) {
    buttons.classList.add('notice-buttons');

    [...buttons.children].forEach((item) => {
      item.classList.add('notice-button-item');

      const link = item.querySelector('a');

      if (link) {
        link.classList.add('notice-button');
      }
    });
  }


  /* Add variation class */

  const section = block.closest('.section');

  if (!section) return;

  if (section.classList.contains('page-maintenance')) {
    block.classList.add('variant-page-maintenance');
  }

  if (section.classList.contains('site-maintenance')) {
    block.classList.add('variant-site-maintenance');
  }
}