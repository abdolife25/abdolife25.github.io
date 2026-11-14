// Marks affiliate links rel="sponsored" and opens external links safely.
const AFFILIATE = [
  'kqzyfj.com', 'tkqlhce.com', 'jdoqocy.com', 'anrdoezrs.net', 'lduhtrp.net', 'dpbolvw.net',
  'tp.st', 'prf.hn', 'awin1.com', 'shareasale.com', 'booking.com', 'viator.com',
  'getyourguide.com', 'tiqets.com', 'rb.gy',
];
const isAff = (host) => AFFILIATE.some((d) => host === d || host.endsWith('.' + d));

function walk(node) {
  if (node.type === 'element' && node.tagName === 'a' && node.properties?.href) {
    const href = String(node.properties.href);
    if (/^https?:\/\//i.test(href)) {
      let host = '';
      try { host = new URL(href).hostname.replace(/^www\./, ''); } catch {}
      node.properties.target = '_blank';
      node.properties.rel = isAff(host) ? ['sponsored', 'noopener'] : ['noopener'];
    }
  }
  if (node.children) node.children.forEach(walk);
}
export function rehypeLinks() { return (tree) => walk(tree); }
