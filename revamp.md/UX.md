# UX — Recruiter flow

## Job

When I open this URL with 30–90 seconds, I want to know this person can ship a product end to end — client, API, and AI when needed — whether they fit my role, and how to get a resume or email.

## Persona

Primary: hiring manager / recruiter screening for **full-stack**, **AI engineer**, or **product engineer**.  
Secondary: engineering manager who will open GitHub and a README.

Do not design the first screen for other engineers’ entertainment (3D scenes, marquees, polar charts).

## Golden path

1. Read name + **Full-stack · AI · Product** + one-line pitch + city.
2. Open a resume that matches the role, or scroll experience for current company and bullets.
3. Skim two projects if still unsure.
4. Email or LinkedIn.

**Primary CTA:** View projects → `#projects`  
**Secondary CTA:** Choose a resume → `#section-professional-profiles`  
Skills, writing, GitHub, education are on the page for search and depth — not competing in the hero.

## Information architecture

```
Header   name · About · Experience · Projects · Skills · Contact · Resume
Hero     name, title, pitch, city, CTAs
About    photo, bio, three resume cards
Experience   always-visible bullets + stack
Skills   grouped chips (preview + show all)
Writing / Education / Certifications
Projects   static grid
GitHub   2D heatmap only, below the fold
Contact  email, LinkedIn, GitHub
```

Nav stays at five links. Writing, education, certifications, and GitHub are reachable by scroll, not by crowding the bar.

## Rules

- One decision per block. Hero does not also host GitHub or featured cards.
- Proof is visible: job highlights are not hover-gated.
- Skills are on the page so Cmd-F works.
- Copy is specific (company, metric, stack). No “passionate about leveraging.”
- Touch targets ≥ 40px; icon controls 40×40.
- `prefers-reduced-motion` skips entrance animation.

## Microcopy

| Place | Line |
|-------|------|
| Title under name | Full-stack · AI · Product |
| Pitch | Concrete: client, API/data, AI only when the product needs it |
| Resumes | Three versions of the same career. Download the one that matches the role. |
| Contact | Email, LinkedIn, or GitHub. I usually reply within a day. |
| Skills | Grouped by how I use them. |
