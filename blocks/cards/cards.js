import { createOptimizedPicture } from '../../scripts/aem.js';

function isCardImage(element) {
  if (element.querySelector('picture')) return true;

  const images = [...element.querySelectorAll('img')];

  return images.some((img) => (
    !img.closest('.icon, .material-symbols-outlined, [data-icon-name]')
  ));
}

function updateCardIcons(block) {
  const isContactUs = window.location.pathname
    .toLowerCase()
    .includes('contact-us');

  const iconFolder = isContactUs ? 'contact-us' : 'about-us';

  block.querySelectorAll('img[data-icon-name]').forEach((img) => {
    const { iconName } = img.dataset;

    if (!iconName) return;

    img.src = `/media/icons/${iconFolder}/${iconName}.png`;
    img.removeAttribute('srcset');
  });
}

function optimizeCardImages(block) {
  block.querySelectorAll('.cards-card-image picture > img').forEach((img) => {
    const picture = img.closest('picture');

    if (!picture) return;

    picture.replaceWith(
      createOptimizedPicture(
        img.src,
        img.alt,
        false,
        [{ width: '750' }],
      ),
    );
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    [...row.children].forEach((cell) => {
      cell.className = isCardImage(cell)
        ? 'cards-card-image'
        : 'cards-card-body';

      li.append(cell);
    });

    ul.append(li);
  });

  block.replaceChildren(ul);

  updateCardIcons(block);
  optimizeCardImages(block);
}
