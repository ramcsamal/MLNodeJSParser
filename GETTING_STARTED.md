# Getting Started with TypeScript Document Extractor

## Project Complete! 🎉

The TypeScript Document Extractor project has been fully built and is ready to use.

## What Was Built

### Core System (16 TypeScript files)

**Parsers** - Extract content from documents
- `DocxParser.ts` - Parse Word documents using Mammoth
- `PdfParser.ts` - Parse PDF files using pdf-parse
- `ParserFactory.ts` - Factory for creating parsers

**NLP Components** - Classify and analyze content
- `ZeroShotClassifier.ts` - ML-powered classification using transformers
- `ContentAnalyzer.ts` - Analyze and categorize content

**Exporters** - Export results to different formats
- `JsonExporter.ts` - Export to JSON
- `CsvExporter.ts` - Export to CSV
- `ExporterFactory.ts` - Factory for creating exporters

**Core Files**
- `types/index.ts` - All TypeScript types and Zod schemas
- `utils/helpers.ts` - Utility functions
- `DocumentExtractor.ts` - Main orchestrator
- `cli.ts` - Command-line interface
- `index.ts` - Public API

### Documentation (4 Markdown files)
- `README.md` - Complete documentation
- `QUICKSTART.md` - Quick start guide
- `PROJECT_STRUCTURE.md` - Detailed architecture
- `GETTING_STARTED.md` - This file

### Examples (3 files)
- `example-usage.ts` - 7 different usage examples
- `simple-demo.ts` - Quick demo script
- `sample-document-content.md` - Sample content for testing

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore rules

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@xenova/transformers` - ML models
- `mammoth` - Word document parsing
- `pdf-parse` - PDF parsing
- `zod` - Schema validation
- `commander` - CLI framework
- TypeScript and dev tools

### 2. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

## Usage Options

### Option 1: CLI (Recommended for Quick Use)

```bash
# Extract a document to JSON
npm run dev -- extract path/to/your/document.docx

# Extract to CSV with custom threshold
npm run dev -- extract document.pdf --format csv --threshold 0.7

# See all options
npm run dev -- extract --help

# View system info
npm run dev -- info
```

### Option 2: Programmatic API

Create a script:

```typescript
import { DocumentExtractor, ExportFormat } from './src/index.js';

async function run() {
  const extractor = new DocumentExtractor({
    confidenceThreshold: 0.6,
    classificationLabels: [
      'business_rule',
      'formula',
      'condition',
      'definition',
    ],
  });

  const result = await extractor.extract('document.docx');

  await extractor.exportResult(result, {
    format: ExportFormat.JSON,
    outputPath: 'output/results.json',
    includeMetadata: true,
    prettyPrint: true,
  });
}

run();
```

Run it:
```bash
npx tsx your-script.ts
```

### Option 3: Run Demo

```bash
npm run dev examples/simple-demo.ts path/to/your/document.docx
```

## First Run Notes

**⏱️ First Run Takes Longer**: The ML model (~250MB) downloads on first use. Subsequent runs are much faster.

**📁 Supported Formats**:
- Word documents (.docx)
- PDF files (.pdf)

**🏷️ Default Classification Labels**:
- `business_rule` - Business rules and policies
- `formula` - Mathematical formulas and calculations
- `condition` - Conditional statements (if/when/unless)
- `definition` - Term definitions
- `table` - Tabular data
- `text` - General text content

## Project Structure

```
typescript-document-extractor/
├── src/                    # All source code
│   ├── parsers/           # Document parsing
│   ├── nlp/              # ML classification
│   ├── exporters/        # Result export
│   ├── types/            # TypeScript types
│   └── utils/            # Helpers
├── examples/             # Usage examples
├── output/              # Output files go here
├── dist/                # Compiled code (after build)
└── [docs]               # README, guides, etc.
```

## Common Commands

```bash
# Build project
npm run build

# Run in dev mode (no build needed)
npm run dev -- extract document.docx

# Run compiled version
npm start -- extract document.docx

# Clean build artifacts
npm run clean

# Rebuild from scratch
npm run clean && npm run build
```

## Next Steps

1. **Test with Your Documents**
   - Place your .docx or .pdf files in the project
   - Run: `npm run dev -- extract your-file.docx`

2. **Customize Labels**
   - Adjust classification labels for your domain
   - Use `--labels` flag or config

3. **Adjust Confidence**
   - Lower threshold (0.3-0.5) for more results
   - Higher threshold (0.7-0.9) for high-quality results

4. **Explore Examples**
   - Check `examples/example-usage.ts` for advanced patterns
   - Run `examples/simple-demo.ts` for a quick test

## Features at a Glance

✅ Parse Word and PDF documents
✅ Extract text and tables
✅ ML-powered content classification
✅ Zero-shot learning (no training needed)
✅ Export to JSON and CSV
✅ Full TypeScript type safety
✅ Zod schema validation
✅ CLI and programmatic API
✅ Extensible architecture
✅ Comprehensive documentation

## Troubleshooting

**Problem**: `Cannot find module`
**Solution**: Run `npm install` and `npm run build`

**Problem**: Low-quality extractions
**Solution**: Adjust `--threshold` or try different labels

**Problem**: Out of memory
**Solution**: Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev -- extract large.pdf
```

**Problem**: Slow first run
**Solution**: This is normal - the ML model is downloading

## Architecture Highlights

- **Factory Pattern**: Pluggable parsers and exporters
- **Dependency Injection**: Flexible component composition
- **Type Safety**: TypeScript + Zod runtime validation
- **ML Integration**: @xenova/transformers for zero-shot classification
- **Modular Design**: Easy to extend and customize

## Learn More

- **Full Documentation**: See [README.md](README.md)
- **Quick Start**: See [QUICKSTART.md](QUICKSTART.md)
- **Architecture**: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Examples**: See `examples/` folder

## Ready to Use! 🚀

The project is fully functional and ready for document extraction. Start by running:

```bash
npm install
npm run dev -- info
npm run dev -- extract path/to/your/document.docx
```

Happy extracting!
