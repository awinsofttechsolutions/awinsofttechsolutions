export default function decorate(block) {
  const row = block.querySelector(':scope > div');

  if (!row) return;

  const columns = [...row.children];

  if (columns.length > 1) {
    columns[0].classList.add('text-image');
    columns[1].classList.add('text-content');
  } else {
    columns[0].classList.add('text-content');
  }

  const picture = block.querySelector('picture');

  if (picture) {
    const imageColumn = picture.closest('div');

    if (imageColumn) {
      imageColumn.classList.add('text-image');
    }
  }

  const buttons = block.querySelector('ul');

  if (buttons) {
    buttons.classList.add('text-buttons');

    [...buttons.children].forEach((item) => {
      item.classList.add('text-button-item');

      const link = item.querySelector('a');

      if (link) {
        link.classList.add('text-button');
      }
    });
  }

  const section = block.closest('.section');

  if (!section) return;

  if (section.classList.contains('text-left')) {
    block.classList.add('variant-left');
  }

  if (section.classList.contains('text-right')) {
    block.classList.add('variant-right');
  }

  if (section.classList.contains('text-center')) {
    block.classList.add('variant-center');
  }
}