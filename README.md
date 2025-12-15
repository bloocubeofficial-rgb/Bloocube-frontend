## Bloocube Frontend

Landing experience for Bloocube built with Next.js (App Router), TypeScript and Tailwind CSS.

### Tech
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Framer Motion (section animations)
- React Icons / Lucide (iconography)

### Structure (relevant)
- `src/app/(landing)` – landing route group
  - `layout.tsx` – global dark background and premium gradient blobs
  - `page.tsx` – section composition
  - `components/` – Hero, Persona, Features, Automation, Visualization, Testimonials, Pricing
- `src/components/layout` – `Navbar`, `Footer`
- `src/components/ui/Button.tsx` – shared button with variants

eojgiojgioejiogj4ioj

### Getting Started

Install deps and run dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Design System Notes
- Text colors are unified; gradient emphasis uses `.text-gradient-primary` (purple → blue → teal) defined in `src/app/globals.css`.
- Buttons should use `src/components/ui/Button.tsx`:
  - Primary: `<Button>...</Button>`
  - Outline: `<Button variant="outline">...</Button>`
  - Sizes: `sm | md | lg`

### Hero Interactions
- Social media icons have subtle “wander” motion (premium, slow drift).
- Typewriter effect animates a word in the headline.
- Optional (if present): a canvas can draw animated connections from `.social-icon` elements to `#Bloocube-logo` using requestAnimationFrame.

### Production Build

```bash
npm run build
npm run start
```

### Conventions
- Keep new emphasized words using `.text-gradient-primary` for visual consistency.
- Prefer the shared `Button` component over custom inline button styles.
- Icons should use consistent sizes and glass card patterns used across sections.

