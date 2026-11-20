# Portfolio revamp

Source of truth for the public site’s look, spacing, and recruiter flow.

This is not a mood board. It is the system to implement. If `src/` and these files disagree, these files win until the implementation is updated.

| File | Owns |
|------|------|
| [UX.md](./UX.md) | Recruiter job, page order, CTAs, what stays off the first screen |
| [DESIGN.md](./DESIGN.md) | Tokens: color, type, radius, components (Stitch-compatible) |
| [SPACING.md](./SPACING.md) | 8px grid, page shell, section rhythm, why padding felt broken |
| [CHECKLIST.md](./CHECKLIST.md) | Implementation and review checks |

Root `DESIGN.md` remains the product/IA document. Visual tokens now live here.

---

## Positioning

Your Name is a **full-stack, AI, and product engineer**. The site should look like a senior engineer’s working notes: precise, quiet, easy to scan. It should not look like a SaaS marketing page, an AI-generated portfolio, or a magazine.

First impression in five seconds: name, **Full-stack · AI · Product**, one sentence of proof, city, two actions (projects, resume). Three resume cards let a hiring manager pick the PDF that matches the role.

---

## What was wrong

1. **Column too wide.** `max-w-content: 90rem` stretched type, cards, and gutters. Padding looked random because the grid had no edge.
2. **No spacing scale.** Hero used `py-12 sm:py-16 lg:py-24`; About used `pt-2 lg:pt-4`; sections used `py-12 lg:py-20`; gutters mixed `px-4` and `px-6`. Same page, four rhythms.
3. **Wrong type for the job.** Newsreader + Source Sans 3 + terracotta reads as an art-direction experiment. A hiring manager expects a grotesque + mono, ink on paper, black buttons.
4. **Tokens fought themselves.** Warm paper HSL, serif headings, `font-serif` on cards, primary-as-terracotta. Hierarchy was decoration, not structure.

---

## What this revamp specifies

- IBM Plex Sans + IBM Plex Mono
- Cool slate neutrals, **steel-blue** primary (`#1E55AE` / `#5FA3F0`), navy type — not black/white only
- Page column **72rem**, prose **40rem**
- One gutter, one section padding, 8px grid
- Recruiter IA: hero → about/resumes → experience → skills → … with the first line naming all three roles
