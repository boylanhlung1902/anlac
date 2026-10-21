# Contact UI backup - 2026-08-04

Restore contact page only (recommended):
```bash
cp backups/contact-ui-20260804-105432/page.tsx src/app/contact/page.tsx
```

Full globals restore (also reverts later CSS appends after this backup timestamp):
```bash
cp backups/contact-ui-20260804-105432/globals.css src/app/globals.css
```
