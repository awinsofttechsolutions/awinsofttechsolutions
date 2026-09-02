export default function decorate(block) {
  const items = [...block.children];

  items.forEach((item) => {
    item.classList.add("trust-bar-item");

    const content = item.querySelector(":scope > div");

    if (content) {
      content.classList.add("trust-bar-item-content");
    }
  });

  block.classList.add("trust-bar-rendered");
}
