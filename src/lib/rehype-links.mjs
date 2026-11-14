// Marks affiliate links rel="sponsored", opens external links safely,
// and makes images lazy (the first image in a post loads eagerly).
const AFFILIATE = [
  'kqzyfj.com', 'tkqlhce.com', 'jdoqocy.com', 'anrdoezrs.net', 'lduhtrp.net', 'dpbolvw.net',
  'tp.st', 'prf.hn', 'awin1.com', 'shareasale.com', 'booking.com', 'viator.com',
  'getyourguide.com', 'tiqets.com', 'rb.gy',
];
const isAff = (host) => AFFILIATE.some((d) => host === d || host.endsWith('.' + d));

export function rehypeLinks() {
  return (tree) => {
    let images = 0;
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && node.properties?.href) {
        const href = String(node.properties.href);
        if (/^https?:\/\//i.test(href)) {
          let host = '';
          try { host = new URL(href).hostname.replace(/^www\./, ''); } catch {}
          node.properties.target = '_blank';
          node.properties.rel = isAff(host) ? ['sponsored', 'noopener'] : ['noopener'];
        }
      }
      if (node.type === 'element' && node.tagName === 'img') {
        images++;
        node.properties.decoding = 'async';
        if (images === 1) node.properties.fetchpriority = 'high';
        else node.properties.loading = 'lazy';
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}
