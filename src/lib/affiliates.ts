// Chosen affiliate partners (green rows in the tracking sheet). Edit links here only.
// `cj: true` means the link accepts a `sid` tag, so clicks can be traced to the page they came from.
export interface Partner { id: string; name: string; url: string; cj: boolean; headline: string; blurb: string; cta: string }

export const PARTNERS: Record<string, Partner> = {
  hostelworld: { id: 'hostelworld', name: 'Hostelworld', url: 'https://prf.hn/l/gx8gj4j/', cj: false, headline: 'Hostels and budget stays', blurb: 'Compare hostels and low-cost private rooms, with reviews from other travelers.', cta: 'Find hostels' },
  yesim: { id: 'yesim', name: 'Yesim', url: 'https://yesim.tp.st/ia9T3otd', cj: false, headline: 'Travel eSIM', blurb: 'Install a data plan before you fly and skip roaming charges and airport SIM queues.', cta: 'Get an eSIM' },
  ovago: { id: 'ovago', name: 'Ovago', url: 'https://www.kqzyfj.com/click-101157578-17055331', cj: true, headline: 'Flights', blurb: 'Search flight deals for your dates and compare before you pay.', cta: 'Check flights' },
  qatar: { id: 'qatar', name: 'Qatar Airways', url: 'https://www.kqzyfj.com/click-101157578-15598279', cj: true, headline: 'Flights via Doha', blurb: 'A useful connection for long routes to Asia, the Middle East and Africa.', cta: 'See Qatar Airways flights' },
  travelex: { id: 'travelex', name: 'Travelex', url: 'https://www.jdoqocy.com/click-101157578-14418597', cj: true, headline: 'Travel insurance', blurb: 'Check what cover you need for medical costs, delays and lost bags.', cta: 'Compare cover' },
  compensair: { id: 'compensair', name: 'Compensair', url: 'https://compensair.tp.st/lAbqz1PF', cj: false, headline: 'Flight delayed or cancelled?', blurb: 'Check whether you may be owed compensation.', cta: 'Check my flight' },
  bigbus: { id: 'bigbus', name: 'Big Bus Tours', url: 'https://www.dpbolvw.net/click-101157578-15734568', cj: true, headline: 'City sightseeing tours', blurb: 'Hop-on hop-off tours that cover the main sights in one ticket.', cta: 'See tours' },
  tiqets: { id: 'tiqets', name: 'Tiqets', url: 'https://tiqets.tp.st/kkQjcwBq', cj: false, headline: 'Attraction tickets', blurb: 'Book museums and landmarks in advance and keep tickets on your phone.', cta: 'Browse tickets' },
  bahia: { id: 'bahia', name: 'Bahia Principe', url: 'https://www.tkqlhce.com/click-101157578-15820674', cj: true, headline: 'Resort stays', blurb: 'Bahia Principe resorts in the Caribbean, Mexico and Spain.', cta: 'See resorts' },
  getrentacar: { id: 'getrentacar', name: 'GetRentacar', url: 'https://getrentacar.tp.st/7yE2hIIn', cj: false, headline: 'Car rental', blurb: 'Compare rental cars for your dates and pick-up point.', cta: 'Compare cars' },
};

export const goHref = (id: string, tag: string) => `/go/${id}.html?s=${encodeURIComponent(tag)}`;

// One partner per job, never two businesses doing the same thing, and at most MAX_PARTNERS different partners per guide.
export const MAX_PARTNERS = 3;

// Candidates in priority order (best commission first), one per category:
// stay (Hostelworld), eSIM (Yesim 18%), then ONE situational pick: car, then tickets, then flights, then insurance.
export function offersFor(place: string, region: string): Partner[] {
  const ids = ['hostelworld', 'yesim'];
  if (['Italy', 'Portugal', 'Croatia', 'Mexico', 'Greece', 'Spain'].includes(place)) ids.push('getrentacar');
  if (['Italy', 'Dubai', 'UK'].includes(place)) ids.push('bigbus');
  else if (region === 'Europe') ids.push('tiqets');
  if (['Caribbean', 'Mexico'].includes(place)) ids.push('bahia');
  ids.push(region === 'Asia' || region === 'Middle East & Africa' ? 'qatar' : 'ovago');
  ids.push('travelex');
  return ids.map((i) => PARTNERS[i]);
}

// Partner ids already linked inside a post's text.
export const usedInText = (body: string): string[] => [...new Set([...body.matchAll(/\/go\/([a-z]+)\.html/g)].map((m) => m[1]))];
