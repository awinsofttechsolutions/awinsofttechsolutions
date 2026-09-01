export default function decorate(block) {
  const content = block.querySelector(':scope > div > div');

  if (!content) return;

  /* Heading */
  const heading = content.querySelector('h1, h2, h3');

  if (heading) {
    heading.classList.add('homepage-teaser-title');

    heading.innerHTML = heading.innerHTML
      .replace(
        'Digital Experiences.',
        '<span>Digital Experiences.</span>',
      )
      .replace(
        'Business Impact.',
        '<span>Business Impact.</span>',
      );
  }

  /* Description */
  const paragraph = content.querySelector('p');

  if (paragraph) {
    paragraph.classList.add('homepage-teaser-description');
  }

  /* Buttons */
  const list = content.querySelector('ul');

  if (list) {
    list.classList.add('homepage-teaser-buttons');

    [...list.children].forEach((item, index) => {
      item.classList.add('homepage-teaser-button-item');

      const text = item.textContent
        .replace(/→/g, '')
        .trim();

      item.textContent = '';

      const link = document.createElement('a');

      link.className = 'homepage-teaser-button';

      link.href = index === 0
        ? '/services'
        : '/contact-us';

      link.innerHTML = `
        <span>${text}</span>
        <span class="homepage-teaser-arrow">→</span>
      `;

      item.append(link);
    });
  }
}