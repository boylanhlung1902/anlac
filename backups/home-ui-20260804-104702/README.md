# Home UI backup - 2026-08-04

Restore:
```bash
cp backups/home-ui-20260804-104702/page.tsx src/app/page.tsx
cp backups/home-ui-20260804-104702/HeroCarousel.tsx src/components/HeroCarousel.tsx
cp backups/home-ui-20260804-104702/HomeSection.tsx src/components/HomeSection.tsx
cp backups/home-ui-20260804-104702/globals.css src/app/globals.css
# optional: remove new Reveal if unused
rm -f src/components/Reveal.tsx
```

Files:
- page.tsx
- HeroCarousel.tsx
- HomeSection.tsx
- globals.css
