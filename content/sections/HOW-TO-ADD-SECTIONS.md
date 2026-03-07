# How to Add New Sections

## Quick Start

1. Create a new file in this folder with the pattern: `06-your-section-name.ts`
2. Copy this template:

```typescript
export const section = {
  notice: "Your notice text",
  heading: "Your Heading",
  meta: "Your subtitle",
  body: "Your main content paragraph."
};
```

3. Restart the dev server (Ctrl+C then `npm run dev`)
4. Your new section will automatically appear!

## How It Works

When you run `npm run dev` or `npm run build`, a script automatically:
- Scans the `content/sections/` folder
- Finds all files matching the pattern `##-*.ts` (like `01-`, `02-`, etc.)
- Generates `lib/sections-loader.ts` with all the imports
- Your sections are automatically loaded in order

## Field Descriptions

- **notice**: Small text at the top (Inter Bold, 11px, uppercase)
- **heading**: Main section title (Inter Bold, 24px)
- **meta**: Subtitle between heading and body (Inter Light, 11px)
- **body**: Main paragraph content (Inter Light, 11px, right-aligned)

## Manual Regeneration

If you add a section while the dev server is running, restart it or run:
```bash
npm run generate-sections
```

This will regenerate the sections loader and pick up your new file.
