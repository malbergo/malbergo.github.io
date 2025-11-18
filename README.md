# Michael S Albergo - Academic Portfolio

A brutalist-inspired academic portfolio website featuring minimalist design, bold typography, and purposeful layout.

## Design Philosophy

Inspired by utrecht.jp, this website embraces:
- **Purposeful minimalism** - Every element serves a function
- **Bold typography** - IBM Plex Mono for headers, system sans-serif for body
- **Generous whitespace** - Content breathes with intentional negative space
- **Stark contrasts** - Near-monochrome palette emphasizing content over decoration
- **Accessibility-first** - WCAG AA compliant, semantic HTML5, keyboard navigation

## Color Palette

- Background: `#fafafa` (off-white)
- Text: `#0a0a0a` (near black)
- Secondary Text: `#4a4a4a` (medium gray)
- Borders/Accents: `#2e2e2e` (dark gray)

## Typography Scale

- Base: 16px
- Small: 14px
- Medium: 18px
- Large: 22px
- XL: 28-48px (fluid)
- XXL: 36-64px (fluid)

## File Structure

```
malbergo.github.io-new/
├── index.html          # About page with bio and news
├── papers.html         # Research publications
├── potpourri.html      # Personal/artistic content
├── css/
│   └── brutalist.css   # Main stylesheet
└── docs/               # Images, papers, media assets
    ├── twitter.png
    ├── faculty_photo_from_tara.jpeg
    ├── papers/         # Paper images and videos
    └── potpourri/      # Personal images and media
```

## Key Features

1. **Responsive Design** - Mobile-first approach, tested on all devices
2. **Sticky Navigation** - Always accessible, minimal interference
3. **Semantic HTML5** - Proper document structure for accessibility
4. **Performance Optimized** - Minimal dependencies, fast load times
5. **Print Friendly** - Proper print styles for academic CVs

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Android Chrome 80+

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators for all links
- Semantic HTML structure
- Sufficient color contrast (WCAG AA)
- Reduced motion preferences respected

## Typography

The site uses IBM Plex Mono (loaded from Google Fonts) for headers and monospace elements, with fallback to system fonts for optimal performance.

## Customization

All design tokens are defined as CSS custom properties in `:root` for easy theming:
- Colors
- Typography scales
- Spacing system
- Border widths
- Layout dimensions

## Development

No build process required. Simply edit HTML/CSS files and deploy.

## License

Content © Michael S Albergo. All rights reserved.
