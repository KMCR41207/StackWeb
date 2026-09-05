# Stackweb — Full Website Build

An art-directed, high-contrast site for Stackweb: near-black canvas, cream text, one cobalt accent (#2b5cff) used only for actions and highlight details. No gradients-as-crutch, no glass cards, no repeated fade-up sections.

## Look and feel

- Background near-black (#0a0a0a), cream text (#f4f1ea), cobalt accent for CTAs and details only.
- Two typefaces with personality: a tight, oversized condensed grotesk for headlines and a clean workhorse sans for body copy. Big scale jumps, tight tracking.
- Project mockups shown inside browser frames, tilted or revealed on scroll. No stock photos, no abstract 3D.

## Pages

1. **Home** — the main experience (below).
2. **Designs** — full portfolio grid of the six projects with filter-style headings.
3. **About** — studio story, principles, team/stats block.
4. **Help** — FAQ + support contact, accordion-style.
5. **Start a Project** — the enquiry form (name, company, email, project type, budget, timeline, details). Submissions are not stored yet; see Open question.
6. **Admin** — placeholder screen listing enquiries; static until a backend is added.

Navigation and footer link all of these; nothing dead-ends.

## Homepage sections

1. **Nav** — sticky, transparent over the hero, fills with background + hairline border after scroll. Logo left, links right, "Start a Project" button. Hover draws an underline.
2. **Hero** — asymmetric, left-aligned headline at ~65% width with a masked line-by-line reveal, supporting line, one cobalt CTA and a "See our work ↓" text link. A hero mockup in a browser frame parallaxes gently on scroll.
3. **Work** — the six projects (Livaani, Farcarfix, Prime Flex, SVLT, ASR Infra, Peoplix) as full-bleed browser-frame mockups. Each scales/reveals on entry while client name, project type and a one-line result slide in alongside. Hover zooms the shot; a "View project" cursor label follows the pointer on desktop. Generated mockup imagery, swappable for real screens later.
4. **Process** — Discovery → Design → Build → Launch as a vertical timeline with a scroll-progress line that fills; each step alternates alignment and weight rather than repeating a card.
5. **Why Stackweb** — bold statements with animated counters (projects delivered, average turnaround, satisfaction) plus a typical-agency vs Stackweb comparison, not an icon grid.
6. **Testimonials** — large-quote auto-scrolling marquee with name/company; placeholder quotes clearly written to be swapped.
7. **Closing CTA** — full-bleed, big headline, single cobalt button to the project form, with a single subtle grain texture used only here.
8. **Footer** — logo, repeated links, Instagram, copyright, scroll-to-top.

## Motion

Framer Motion (Motion for React) for scroll-linked work, since the stack is React: masked text reveals, scroll-progress timeline, parallax hero, scale-on-scroll mockups, horizontal marquee, counters. Different treatment per section, deliberate hover states (underline draw, background wipe, arrow shift). Respects reduced-motion; heavy scroll effects simplify to stacked layouts on mobile.

## Technical notes

- TanStack Start routes: `/`, `/designs`, `/about`, `/help`, `/project-form`, `/admin`. Each with its own title/description/social metadata.
- Tokens (colors, radii, fonts) defined in `src/styles.css`; fonts loaded via a link tag in the root route.
- Project mockup images generated into `src/assets/`, lazy-loaded below the fold, alt text throughout.
- Semantic HTML, contrast checked against the dark theme, mobile layouts rethought rather than scaled.

## Open question, not blocking

The project form will validate and show a success state but has nowhere to send enquiries yet. Enabling the built-in backend later would store submissions and make the Admin page real — say the word and I'll add it.
