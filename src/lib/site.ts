export const SITE = {
  name: 'Voyagelo',
  url: 'https://www.voyagelo.com',
  author: 'Voyagelo Content Team',
  tagline: 'Budget travel guides, trip costs and booking tips',
  description: 'Voyagelo publishes budget travel guides with real trip costs in US dollars, checked against current prices, plus booking tips for travellers who want to spend less.',
  ga4: 'G-2NS892R3FH',
  // Paste your signup page URL here to show the email signup blocks.
  emailSignupUrl: '',
  // Official accounts (taken from the old Blogger theme). Remove a line to hide it.
  social: [
    { name: 'Instagram', url: 'https://www.instagram.com/voyagelo/' },
    { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61560893701835' },
    { name: 'Pinterest', url: 'https://www.pinterest.com/Voyagelo/' },
    { name: 'YouTube', url: 'https://www.youtube.com/@VoyageloTravel' },
    { name: 'X', url: 'https://x.com/Voyagelo' },
  ],
};

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const REGIONS: Record<string, string[]> = {
  Asia: ['India', 'Japan', 'Vietnam', 'Nepal', 'Indonesia', 'Cambodia', 'Thailand'],
  Europe: ['Italy', 'Romania', 'Portugal', 'Spain', 'Greece', 'Croatia', 'UK', 'Norway'],
  Americas: ['Mexico', 'Caribbean', 'Canada'],
  'Middle East & Africa': ['Dubai', 'Egypt'],
};

export const placeOf = (labels: string[]) => labels.find((l) => l !== 'Budget Travel') ?? '';
export function regionOf(labels: string[]) {
  const place = placeOf(labels);
  for (const [region, places] of Object.entries(REGIONS)) if (places.includes(place)) return region;
  return 'Worldwide';
}
export function typeOf(title: string) {
  if (/resort|villa|luxur/i.test(title)) return 'Splurge';
  if (/\b\d+[- ]day\b|itinerary|week in/i.test(title)) return 'Itinerary';
  if (/beach|shore/i.test(title)) return 'Beaches';
  if (/cheapest|under \$|budget|cheap/i.test(title)) return 'Budget picks';
  return 'Guide';
}
export const TYPES = ['Itinerary', 'Budget picks', 'Guide', 'Beaches', 'Splurge'];
export const readMins = (body = '') => Math.max(1, Math.round(body.split(/\s+/).length / 220));
// Small card image: local images get a pre-made thumbnail, remote ones are used as they are.
export const thumb = (src = '') => (src.startsWith('/images/') ? src.replace('/images/', '/images/t/') : src);

export function cardData(p: any) {
  const d = p.data;
  return {
    title: d.title, href: d.path, description: d.description, image: d.heroImage || '',
    place: placeOf(d.labels), region: regionOf(d.labels), type: typeOf(d.title), mins: readMins(p.body),
  };
}
