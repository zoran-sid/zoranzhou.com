/** Keep the page title as the only h1 without rewriting legacy Markdown files. */
export default function headingLevels() {
  return (tree) => {
    const headings = [];
    const walk = (node) => {
      if (node.type === 'heading') headings.push(node);
      node.children?.forEach(walk);
    };
    walk(tree);
    if (headings.some(node => node.depth === 1)) {
      for (const node of headings) node.depth = Math.min(6, node.depth + 1);
    }
  };
}
