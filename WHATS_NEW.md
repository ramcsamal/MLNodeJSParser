# What's New - Excel Export & Enhanced Features

## 🎉 Major New Features

### 1. Excel (.xlsx) Export with Multiple Sheets

Export your extracted data to Excel with **5 organized sheets**:

- **Metadata** - Document information
- **All Data** - Complete extraction results
- **Tables** - All extracted tables preserved
- **Structured Data** ⭐ - Key-value pairs in separate columns
- **Summary** - Statistics by content type

```bash
npm run dev -- extract document.docx --format xlsx
```

### 2. Structured Data Extraction ⭐

Automatically extracts and organizes patterns like:
- `Country: India, US, China`
- `TripType: OneWay, RoundTrip`
- `Status: Active, Pending, Closed`

**Excel Output:**

| Country | TripType  | Status  |
|---------|-----------|---------|
| India   | OneWay    | Active  |
| US      | RoundTrip | Pending |
| China   |           | Closed  |

### 3. Better ML Models for Table-Heavy Documents

**New Recommended Models:**

1. **Xenova/mobilebert-uncased-mnli** (Faster, 50MB)
   ```bash
   npm run dev -- extract doc.docx --format xlsx --model Xenova/mobilebert-uncased-mnli
   ```

2. **Xenova/nli-deberta-v3-small** (Better accuracy, 400MB)
   ```bash
   npm run dev -- extract doc.docx --format xlsx --model Xenova/nli-deberta-v3-small
   ```

## Quick Usage Examples

### Basic Excel Export
```bash
npm run dev -- extract document.docx --format xlsx
```

### With Better Model for Tables
```bash
npm run dev -- extract document.docx --format xlsx --model Xenova/mobilebert-uncased-mnli
```

### Programmatic Usage
```typescript
import { DocumentExtractor, ExportFormat } from './src/index.js';

const extractor = new DocumentExtractor({
  modelName: 'Xenova/mobilebert-uncased-mnli',
  enableTableExtraction: true,
});

await extractor.extractAndExport('document.docx', {
  format: ExportFormat.XLSX,
  outputPath: 'output.xlsx',
  includeMetadata: true,
});
```

## What This Solves

### Before
- ❌ Manual extraction of structured data
- ❌ Tables exported as plain text
- ❌ No column organization
- ❌ CSV limited to flat structure

### After
- ✅ Automatic key-value pair extraction
- ✅ Tables preserved in Excel format
- ✅ Organized in separate sheets
- ✅ Each field in its own column
- ✅ Multiple sheets for different data types

## File Structure

```
output/
└── results.xlsx
    ├── Sheet 1: Metadata
    ├── Sheet 2: All Data
    ├── Sheet 3: Tables
    ├── Sheet 4: Structured Data ⭐
    └── Sheet 5: Summary
```

## Privacy & Performance

✅ **100% Local** - No data leaves your machine
✅ **Faster Models** - MobileBERT is 3x faster
✅ **Offline Capable** - After first model download
✅ **Auto-sized Columns** - Excel columns fit content

## Documentation

- **Complete Guide**: See `EXCEL_EXPORT_GUIDE.md`
- **Examples**: See `examples/excel-export-demo.ts`
- **General Docs**: See `README.md`

## Installation

```bash
# Install new dependencies (includes xlsx)
npm install

# Build the project
npm run build

# Try Excel export
npm run dev -- extract your-document.docx --format xlsx
```

## Next Steps

1. Read `EXCEL_EXPORT_GUIDE.md` for detailed examples
2. Run `npm run dev -- info` to see all options
3. Try `npm run dev examples/excel-export-demo.ts your-document.docx`

## Support

All features run **locally** with **no external API calls** (after initial model download).
