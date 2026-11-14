export const SITE = {
  name: 'Voyagelo',
  url: 'https://www.voyagelo.com',
  tagline: 'Budget travel guides, trip costs and booking tips',
  ga4: 'G-2NS892R3FH',
  // Paste your MailerLite (or other) signup page URL here to show the signup box on posts.
  emailSignupUrl: '',
};
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
