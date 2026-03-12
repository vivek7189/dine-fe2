# DineOpen Blog Writing Guidelines

## Golden Rules
1. **Never write thin, boring, filler content.** Every paragraph must teach something or provide real value.
2. **Every blog must start with a HOOK** - a surprising stat, a real story, a provocative question, or a bold claim.
3. **Use real data** - actual prices in INR, real percentages, real tool names, real government schemes. Never fake numbers.
4. **Make it actionable** - a reader should be able to DO something after reading. Checklists, step-by-steps, templates, formulas.
5. **Each blog should feel different** - vary the opening style, structure, and tone. Not every blog should read the same.

---

## Opening Hook Styles (Rotate These)

1. **Shocking Stat** - "92% of restaurants fail in the first year. Here's what the surviving 8% do differently."
2. **Story/Scenario** - "Ravi opened his ice cream parlour in Jaipur with Rs 3 lakh. Within 6 months, he was making Rs 1.5 lakh/month profit. Here's his exact tech stack."
3. **Bold Claim** - "Your restaurant is losing Rs 50,000 every month and you don't even know it."
4. **Question** - "What if you could cut your Zomato commission from 25% to 0% - without losing a single order?"
5. **Myth Buster** - "Everyone says you need Rs 20 lakh to open a restaurant. That's wrong. Here's the real number."
6. **Before/After** - "6 months ago, this cloud kitchen was doing 30 orders/day. Today, it does 150. The only thing that changed was their POS system."

---

## Content Structure

### Every Blog Must Include:
- **Hero image** (Unsplash, relevant to topic)
- **Intro paragraph** (hook + what the reader will learn)
- **Table of Contents** feel via clear H2 sections
- **At least 1 comparison table** (readers love scanning tables)
- **At least 1 highlight box** (key takeaway, checklist, or formula)
- **At least 1 CTA box** (mid-article or end, linking to DineOpen)
- **Internal links** to at least 5 other DineOpen pages (blogs, tools, product pages)
- **FAQ section** (7 questions, with FAQPage schema for Google rich results)
- **Sidebar** with DineOpen CTA, features, and related articles

### Content Depth:
- Minimum 3,000+ words of actual content (excluding HTML markup)
- Must cover the topic comprehensively - a reader should NOT need to visit another site
- Include specific examples with Indian context (city names, INR prices, Indian brands)
- If comparing software, be honest about pros AND cons (builds trust and authority)

---

## SEO Requirements (Every Blog)

### Meta & Schema:
- `<meta name="description">` - 150-160 chars, include primary keyword naturally
- `<meta name="keywords">` - 5-8 relevant keywords
- Canonical URL
- Open Graph tags (og:type, og:title, og:description, og:url, og:image, og:site_name)
- Twitter Card tags
- **BlogPosting** structured data (author: DineOpen Team, datePublished, dateModified)
- **FAQPage** structured data (7 FAQs matching the visible FAQ section)
- **BreadcrumbList** structured data (Home > Blog > Article Title)

### On-Page SEO:
- Primary keyword in H1, first paragraph, at least 2 H2s, and meta description
- Secondary keywords naturally throughout content
- Image alt tags with descriptive text (include keywords where natural)
- Internal links to:
  - At least 2 other blog posts
  - At least 1 product page (/products/pos, /products/menu, etc.)
  - At least 1 tool page (/tools/food-cost-calculator, /tools/qr-menu-generator, etc.)
  - At least 1 industry page (/for/restaurants, /for/ice-cream-shops, etc.)

### AEO (Answer Engine Optimization):
- Write FAQ answers as complete, standalone answers (Google pulls these for featured snippets)
- Include "What is X?" definitions early in the content
- Use numbered lists and tables (Google loves structured data)
- Answer the exact questions people search for (check Search Console queries)

---

## Citation & Data Presentation

### When Using Statistics:
- Present stats in a visually appealing way (stat cards, highlight boxes, comparison tables)
- Use specific numbers, not vague claims ("Rs 50,000/month" not "a lot of money")
- If citing research, mention the source naturally: "According to NRAI's 2025 report..."
- For government schemes, link to official portals where possible

### Data Presentation Styles:
- **Stat Grid** - 3-4 cards with big numbers (use for opening impact)
- **Comparison Tables** - Dark header, striped rows, hover effects
- **Highlight Boxes** - Red border for key takeaways, formulas, checklists
- **Before/After Cards** - Visual comparison of old vs new way
- **Step Cards** - Numbered steps with descriptions and price tags
- **Warning Boxes** - Amber/yellow for things to avoid

---

## Internal Linking Strategy

### Link Priority (every blog should link to relevant ones):
1. **Product pages** - /products/pos, /products/menu, /products/orders, /products/kitchen, /products/inventory, /products/loyalty, /products/ai
2. **Tool pages** - /tools/food-cost-calculator, /tools/qr-menu-generator, /tools/kot-system, /tools/bill-splitter
3. **Industry pages** - /for/restaurants, /for/cafes, /for/ice-cream-shops, /for/cloud-kitchens, /for/bars-pubs
4. **Other blogs** - Link to 3-5 related blog posts
5. **Alternatives pages** - /alternatives/petpooja, /alternatives/toast, etc.
6. **Location pages** - /pos/mumbai, /pos/delhi, /pos/uae, etc.

### Anchor Text:
- Use natural, descriptive anchor text (not "click here")
- Vary anchor text - don't always use the same phrase
- Include keyword-rich anchors where natural

---

## Visual Design (HTML Template)

### CSS Pattern:
- Dark header: `#1f2937` gradient
- Red accents: `#ef4444` (brand color)
- Layout: `1fr 320px` grid (content + sidebar)
- Responsive: 968px and 640px breakpoints
- All standard DineOpen blog classes (see existing blogs in /public/blog/)

### Required HTML Classes:
`.header`, `.header-content`, `.back-link`, `.meta`, `.main-container`, `.content`, `.sidebar`, `.hero-image`, `.intro`, `.section` (h2/h3/p/ul/ol), `.highlight-box`, `.comparison-table`, `.cta-box`, `.cta-button`, `.faq-section`, `.faq-item`, `.faq-question`, `.faq-answer`, `.sidebar-card`, `.sidebar-logo`, `.sidebar-cta`, `.sidebar-button`, `.sidebar-features`, `.sidebar-links`, `.footer`

---

## Quality Checklist (Before Publishing)

- [ ] Does the opening hook grab attention in the first 2 sentences?
- [ ] Would a restaurant owner bookmark this page?
- [ ] Are all prices in INR and realistic for 2026?
- [ ] Does it have at least 1 comparison table?
- [ ] Does it have internal links to 5+ DineOpen pages?
- [ ] Is the FAQ section genuinely useful (not filler)?
- [ ] Are all structured data schemas present and correct?
- [ ] Does the blog naturally mention DineOpen features without being too salesy?
- [ ] Is the content different in style from the last 3 blogs published?
- [ ] Would you read this yourself if you were opening a restaurant?
