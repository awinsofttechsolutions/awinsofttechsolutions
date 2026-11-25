let faqInstanceCount = 0;

export default function decorate(block) {
  if (block.dataset.faqInitialized === 'true') return;

  const rows = [...block.children];
  if (!rows.length) return;

  block.dataset.faqInitialized = 'true';
  block.classList.add('faq-block');

  faqInstanceCount += 1;
  const instanceId = block.id || `faq-${faqInstanceCount}`;

  const headerCell = rows[0]?.firstElementChild;
  const header = document.createElement('div');
  header.className = 'faq-header';

  if (headerCell) {
    while (headerCell.firstChild) {
      header.append(headerCell.firstChild);
    }
  }

  const list = document.createElement('div');
  list.className = 'faq-list';
  list.setAttribute('aria-label', 'Frequently asked questions');

  const items = rows.slice(1).map((row, index) => {
    const cells = [...row.children];
    const questionCell = cells[0];
    const answerCell = cells[1];

    if (!questionCell || !answerCell) return null;

    const question = questionCell.textContent.trim();
    if (!question) return null;

    const item = document.createElement('article');
    item.className = 'faq-item';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'faq-trigger';
    trigger.setAttribute('aria-expanded', 'false');

    const answerId = `${instanceId}-answer-${index + 1}`;
    trigger.setAttribute('aria-controls', answerId);

    const questionText = document.createElement('span');
    questionText.className = 'faq-question';
    questionText.textContent = question;

    const chevron = document.createElement('span');
    chevron.className = 'faq-chevron';
    chevron.setAttribute('aria-hidden', 'true');

    trigger.append(questionText, chevron);

    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    answer.id = answerId;
    answer.setAttribute('aria-hidden', 'true');
    answer.inert = true;

    const answerInner = document.createElement('div');
    answerInner.className = 'faq-answer-inner';

    const answerContent = document.createElement('div');
    answerContent.className = 'faq-answer-content';

    [...answerCell.childNodes].forEach((node) => {
      answerContent.append(node.cloneNode(true));
    });

    answerInner.append(answerContent);
    answer.append(answerInner);
    item.append(trigger, answer);

    return item;
  }).filter(Boolean);

  if (!items.length) return;

  list.append(...items);
  block.replaceChildren(header, list);

  block.addEventListener('click', (event) => {
    const trigger = event.target.closest('.faq-trigger');

    if (!trigger || !block.contains(trigger)) return;

    const currentItem = trigger.closest('.faq-item');
    const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';

    block.querySelectorAll('.faq-item').forEach((item) => {
      const button = item.querySelector('.faq-trigger');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item === currentItem && shouldOpen;

      button.setAttribute('aria-expanded', String(isOpen));
      answer.setAttribute('aria-hidden', String(!isOpen));
      answer.inert = !isOpen;
      item.classList.toggle('is-open', isOpen);
    });
  });
}
