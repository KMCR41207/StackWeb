# Stackweb

Custom websites built on demand. No templates, no juniors, no handover PDFs.

**Live site:** [stackweb.net](https://stackweb.net)

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | TanStack Start (React SSR) |
| Router | TanStack Router |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion) |
| Database | MongoDB Atlas (Mongoose) |
| Deployment | Vercel |
| Build | Vite + Nitro |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, work showcase, process, testimonials |
| `/designs` | Full portfolio grid |
| `/about` | Studio story, principles, stats |
| `/help` | FAQ accordion |
| `/project-form` | Project enquiry form |
| `/admin` | Internal enquiries dashboard |

---

## Development

```sh
git clone https://github.com/KMCR41207/StackWeb.git
cd StackWeb
npm install
cp .env.example .env   # fill in your MONGODB_URI
npm run dev
```

Open [http://localhost:8082](http://localhost:8082).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.../stackweb
```

Add the same variable in your Vercel project settings under **Environment Variables**.

---

## Deploy

Push to `main` — Vercel auto-deploys via the GitHub integration.

```sh
git push origin main
```

---

## Project Structure

```
src/
  routes/          # TanStack Router file-based routes
  components/
    site/          # Page-level components (nav, footer, sections)
    ui/            # Radix UI primitives
  lib/
    db.ts          # MongoDB connection
    enquiry.model.ts  # Mongoose enquiry schema
    enquiries.server.ts  # Server functions
    site.ts        # Project data
  assets/          # Images
  styles.css       # Design tokens + Tailwind config
public/            # Static assets, favicons
migrations/        # D1 SQL migrations (legacy)
```

---

## License

All rights reserved — Stackweb.
