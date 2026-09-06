# Stackweb Studio Shine

Stackweb — Website Rebuild Prompt

Paste everything below into your AI builder of choice (Claude, v0, Cursor, Lovable, etc.).

Context

Build the marketing website for Stackweb, a premium web design agency that builds custom websites on demand for clients. The current site (stackweb.net) is a bare, generic single-page shell — a headline, a tagline, four nav links, and a footer. It reads as an unfinished template, not a portfolio piece for an agency that sells "incredible web experiences." Since this site is the agency's own sales pitch, it needs to visibly demonstrate the quality of work a client would be buying.

Do not produce a generic AI-generated look. Specifically avoid:

Purple/blue gradient hero backgrounds

Centered headline + subtext + two pill buttons as the entire hero

Generic glassmorphism cards with soft shadows and rounded-2xl everything

Emoji as icons, or matching stock icon sets (Lucide defaults used undecorated)

Feature grids of 3 identical cards with an icon, bold title, and grey paragraph

Inter/system-ui font left at default weight/tracking with no typographic personality

Bouncy, everything-fades-up-with-stagger scroll animation with no variation

Instead, design something with a strong point of view: high contrast, confident typography, and scroll animation that is choreographed — different sections should reveal in different ways, not the same fade-up loop repeated ten times.

Brand Direction

Tone: high-contrast, bold, premium, slightly editorial — think design-studio portfolio, not SaaS landing page.

Palette: near-black background (not pure #000, something like #0a0a0a–#111) with a single sharp accent color (off-white/cream text, one saturated accent used sparingly — e.g. an electric lime, cobalt, or signal orange — for CTAs and highlight details only). No gradients as a crutch; use color purposefully.

Typography: pick two fonts with real personality — a distinctive display/serif or condensed grotesk for headlines (large, tight tracking, big scale jumps) paired with a clean workhorse sans for body copy. Type should feel like the star of the design, not filler.

Imagery: real or realistic project mockups/screens (browser frames, device frames) shown at an angle or in a scroll-driven reveal — not stock photography, not abstract 3D blobs.

Site Structure

1. Navigation

Fixed/sticky, minimal, transparent-over-hero that solidifies (background fill + border) after scrolling past the hero. Logo left, links right ("Work", "Process", "About", "Contact"), one CTA button ("Start a Project"). Add a subtle underline/reveal animation on link hover, not just a color change.

2. Hero

Large, split or asymmetric headline layout (not dead-centered) — e.g. headline left-aligned taking 60-70% width, supporting line below.

Animate headline in with a masked/clipped reveal (text sliding up out of a mask) rather than a plain fade.

Include a piece of live visual proof immediately — a rotating/auto-scrolling strip of past project thumbnails, or a single hero mockup in a browser frame that subtly parallaxes on scroll.

One primary CTA ("Start a Project") + a secondary text link ("See our work ↓").

3. Work / Portfolio Showcase

This is the most important section — it's the proof.

Grid or full-bleed stacked showcase of past project builds, each as a browser-frame or device-frame mockup.

Scroll-triggered reveal: each project image should scale/reveal in a browser-chrome frame as it enters viewport, with the client name, project type, and a one-line result/description sliding in alongside.

On hover (desktop): image should subtly zoom or shift; on click, expand or link out.

If real project images aren't ready yet, use styled placeholder frames with labeled project names so the layout is real and ready to swap in.

4. Process / How We Work

3–5 step process (Discovery → Design → Build → Launch, or similar) shown as a horizontal scroll-linked timeline or numbered vertical list with a scroll-progress indicator (a line or dot that fills/moves as the user scrolls through the steps).

Avoid identical icon+card repetition — vary layout per step (alternate alignment, size, or supporting visual).

5. Why Stackweb / Differentiators

Instead of a 3-icon feature grid, present this as a few bold statements/stats with animated counters (projects delivered, avg. turnaround, client satisfaction) or a comparison-style layout (typical agency vs. Stackweb).

6. Testimonials (if content exists, else structure for later)

Horizontal auto-scrolling or swipeable carousel, large quote typography, client name/company/logo below.

7. CTA / Start a Project section

Full-bleed, high-contrast closing section with a large headline ("Let's build something worth showing off" or similar), single CTA button linking to the existing project-form page.

Optional: subtle animated background detail (grain, noise texture, or slow-moving gradient mesh — used once, tastefully, not throughout the site).

8. Footer

Minimal: logo, nav links repeated, social link (Instagram), copyright. Add a small scroll-to-top interaction.

Animation & Interaction Requirements

Library: use GSAP + ScrollTrigger (or Framer Motion if the stack is React) for scroll-linked animation — not just Intersection Observer fade-ins.

Variety over repetition: mix animation types across sections — masked text reveals, horizontal scroll-linked elements, pinned sections, parallax layers, scale-on-scroll images. Don't apply the same fade-up-with-stagger to every section.

Micro-interactions: buttons and links should have deliberate hover states (underline draw, background wipe, or icon shift) — not just a color/opacity change.

Performance: animations should feel smooth (60fps), respect prefers-reduced-motion, and not block initial content from being visible/crawlable.

Cursor (optional, nice-to-have): custom cursor treatment on the work/portfolio section (e.g. cursor becomes a "view project" label) — only if it can be done cleanly, skip if it risks feeling gimmicky.

Technical Requirements

Fully responsive: design should be rethought for mobile, not just scaled down (simplify pinned/scroll-linked effects on small screens; stack layouts).

Keep the existing pages/routes intact: Home, Designs, About, Help, Admin, and the Start a Project form at /project-form.html — this rebuild is for the homepage experience layer; link out to those as before unless told to rebuild them too.

Semantic HTML, accessible contrast ratios despite the dark theme, alt text on all imagery.

Fast load: lazy-load below-the-fold images/mockups, optimize any video/animation assets.

Deliverable

A single, cohesive homepage that feels art-directed — like it was designed by people who obsess over web craft (because that's the product being sold). Every scroll should reveal something considered, not a template with animations bolted on.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d924ef3c-909e-4125-b7ac-6a4b411027b3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
