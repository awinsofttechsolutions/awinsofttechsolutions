export default function decorate(block) {
  const content = block.querySelector(':scope > div > div');

  if (!content) return;

  const number = content.querySelector('h1')?.textContent.trim() || '404';

  const title =
    content.querySelector('h3')?.textContent.trim() ||
    'Lost in AWIN Softtech Solutions website?';

  const description =
    content.querySelector('p')?.textContent.trim() ||
    'The page you are looking for might have been moved, deleted, or never existed. Let’s get you back on track with our premium recruitment and training solutions.';

  const authoredLinks = [...content.querySelectorAll('ul a')];

  block.textContent = '';

  /* Main canvas */
  const main = document.createElement('div');
  main.className = 'error-main';

  /* Background glows */
  const glowContainer = document.createElement('div');
  glowContainer.className = 'error-glow-container';

  const glowOne = document.createElement('div');
  glowOne.className = 'error-glow error-glow-one';

  const glowTwo = document.createElement('div');
  glowTwo.className = 'error-glow error-glow-two';

  glowContainer.append(glowOne, glowTwo);

  /* Content */
  const container = document.createElement('div');
  container.className = 'error-content';

  /* 404 visual */
  const visual = document.createElement('div');
  visual.className = 'error-visual';

  const errorNumber = document.createElement('h1');
  errorNumber.className = 'error-number';
  errorNumber.textContent = number;

  /* SVG decoration */
  const svg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );

  svg.classList.add('error-decoration');
  svg.setAttribute('viewBox', '0 0 400 200');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('aria-hidden', 'true');

  svg.innerHTML = `
    <path
      d="M50 100 L150 100 M250 100 L350 100"
      stroke="#d4af37"
      stroke-dasharray="4 4"
      stroke-width="1">
    </path>

    <circle
      cx="200"
      cy="100"
      r="4"
      fill="#d4af37">
    </circle>

    <path
      d="M200 50 L200 80 M200 120 L200 150"
      stroke="#d4af37"
      stroke-dasharray="4 4"
      stroke-width="1">
    </path>
  `;

  visual.append(errorNumber, svg);

  /* Heading */
  const heading = document.createElement('h2');
  heading.className = 'error-title';
  heading.textContent = title;

  /* Description */
  const text = document.createElement('p');
  text.className = 'error-description';
  text.textContent = description;

  /* Buttons */
  const actions = document.createElement('div');
  actions.className = 'error-actions';

  if (authoredLinks.length) {
    authoredLinks.slice(0, 2).forEach((link, index) => {
      const button = document.createElement('a');

      button.href = link.href;
      button.textContent =
        link.textContent.trim() ||
        (index === 0 ? 'Back to Home' : 'Explore Training');

      button.className =
        index === 0
          ? 'error-button error-button-primary'
          : 'error-button error-button-secondary';

      actions.append(button);
    });
  } else {
    const home = document.createElement('a');
    home.href = '/';
    home.textContent = 'Back to Home';
    home.className = 'error-button error-button-primary';

    const training = document.createElement('a');
    training.href = '/training';
    training.textContent = 'Explore Training';
    training.className = 'error-button error-button-secondary';

    actions.append(home, training);
  }

  container.append(
    visual,
    heading,
    text,
    actions,
  );

  main.append(
    glowContainer,
    container,
  );

  block.append(main);
}