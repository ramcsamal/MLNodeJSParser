# Quick Start Guide

Get started with the TypeScript Document Extractor in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Build the Project

```bash
npm run build
```

## Step 3: Extract Your First Document

### Option A: Using the CLI

```bash
# Extract a Word document to JSON
npm run dev -- extract path/to/your/document.docx

# Extract a PDF to CSV
npm run dev -- extract path/to/your/document.pdf --format csv --output results.csv
```

### Option B: Using the API

Create a file called `test.ts`:

```typescript
import { DocumentExtractor, ExportFormat } from './src/index.js';

async function extract() {
  // Create extractor
  const extractor = new DocumentExtractor();

  // Extract and export
  await extractor.extractAndExport('path/to/your/document.docx', {
    format: ExportFormat.JSON,
    outputPath: 'output.json',
    includeMetadata: true,
    prettyPrint: true,
  });

  console.log('Extraction complete!');
}

extract();
```

Run it:

```bash
npx tsx test.ts
```

## Step 4: Explore the Results

Open the generated JSON or CSV file to see the extracted content categorized by type:

- **business_rule**: Business rules and policies
- **formula**: Mathematical formulas and calculations
- **condition**: Conditional statements
- **definition**: Term definitions
- **table**: Tabular data
- **text**: General text content

## Common CLI Options

```bash
# Custom confidence threshold (0-1)
npm run dev -- extract document.docx --threshold 0.7

# Custom classification labels
npm run dev -- extract document.docx --labels "rule,policy,requirement"

# Disable table extraction
npm run dev -- extract document.docx --no-tables

# Compact JSON output
npm run dev -- extract document.docx --compact

# Use a different model
npm run dev -- extract document.docx --model Xenova/MiniLM-L6-v2
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out [examples/example-usage.ts](examples/example-usage.ts) for more examples
- Customize classification labels for your specific use case
- Adjust confidence threshold to balance precision and recall

## Troubleshooting

### Model Download Takes Long

The first time you run the extractor, it will download the ML model (~250MB). This is a one-time operation. Subsequent runs will be much faster.

### Low-Quality Extractions

Try these adjustments:

1. **Lower confidence threshold**: `--threshold 0.4`
2. **Different model**: `--model Xenova/MiniLM-L6-v2`
3. **Custom labels**: Use labels specific to your document domain

### Memory Issues

For very large documents, you may need to increase Node.js memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev -- extract large-document.pdf
```

## Support

For issues and questions, please check the [README.md](README.md) or open an issue on GitHub.
