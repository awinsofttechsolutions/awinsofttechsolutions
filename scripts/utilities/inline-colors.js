const COLOR_PATTERN = /\[(primary|secondary|tertiary):([\s\S]+?)\]/g;

function getTextNodes(element) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
  );

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  return nodes;
}

function createRange(element, start, end) {
  const nodes = getTextNodes(element);
  const range = document.createRange();
  let position = 0;
  let startSet = false;
  let endSet = false;

  nodes.some((node) => {
    const nextPosition = position + node.textContent.length;

    if (!startSet && start < nextPosition) {
      range.setStart(node, start - position);
      startSet = true;
    }

    if (!endSet && end <= nextPosition) {
      range.setEnd(node, end - position);
      endSet = true;
      return true;
    }

    position = nextPosition;
    return false;
  });

  return startSet && endSet ? range : null;
}

function removeCharacters(fragment, count, fromEnd = false) {
  const nodes = getTextNodes(fragment);
  if (fromEnd) nodes.reverse();

  let remaining = count;

  nodes.some((node) => {
    if (!remaining) return true;

    const { length } = node.textContent;
    const remove = Math.min(length, remaining);

    node.textContent = fromEnd
      ? node.textContent.slice(0, length - remove)
      : node.textContent.slice(remove);

    remaining -= remove;
    return !remaining;
  });
}

function decorateElement(element) {
  const text = element.textContent;
  const matches = [...text.matchAll(COLOR_PATTERN)];

  matches.reverse().forEach((match) => {
    const fullMatch = match[0];
    const color = match[1];
    const start = match.index;
    const end = start + fullMatch.length;

    const range = createRange(element, start, end);
    if (!range) return;

    const fragment = range.extractContents();

    removeCharacters(fragment, fullMatch.indexOf(':') + 1);
    removeCharacters(fragment, 1, true);

    const span = document.createElement('span');
    span.className = `text-${color}`;
    span.appendChild(fragment);

    range.insertNode(span);
  });
}

export default function decorateInlineColors(container) {
  const elements = container.querySelectorAll(
    'h1, h2, h3, h4, h5, h6, p, li, blockquote',
  );

  elements.forEach(decorateElement);
}
