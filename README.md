# TypeScript Document Extractor

Intelligently extract structured insights from complex business documents using TypeScript, Node.js, and pretrained ML models.

## Features

- **Multi-format Support**: Extract content from Word (.docx) and PDF files
- **ML-Powered Classification**: Zero-shot classification using transformer models (DistilBERT, MiniLM)
- **Business Logic Detection**: Automatically identify business rules, formulas, conditions, and definitions
- **Table Extraction**: Extract and preserve tabular data from documents
- **Multiple Export Formats**: Export to JSON or CSV
- **Type-Safe**: Full TypeScript support with Zod schema validation
- **CLI Interface**: Easy-to-use command-line interface
- **Extensible**: Modular architecture for custom parsers, classifiers, and exporters

## Installation

```bash
npm install
npm run build
```

## Quick Start

### CLI Usage

Extract content from a document:

```bash
# Extract to JSON (default)
npm run dev -- extract path/to/document.docx

# Extract to CSV
npm run dev -- extract path/to/document.pdf --format csv

# Custom output path
npm run dev -- extract document.docx --output results.json

# Custom confidence threshold
npm run dev -- extract document.docx --threshold 0.7

# Custom classification labels
npm run dev -- extract document.docx --labels "rule,policy,requirement,definition"

# Disable table extraction
npm run dev -- extract document.docx --no-tables

# View extractor information
npm run dev -- info
```

### Programmatic Usage

```typescript
import { DocumentExtractor, ExportFormat } from './src/index.js';

// Create an extractor instance
const extractor = new DocumentExtractor({
  confidenceThreshold: 0.6,
  classificationLabels: [
    'business_rule',
    'formula',
    'condition',
    'definition',
    'text',
  ],
  enableTableExtraction: true,
  modelName: 'Xenova/distilbert-base-uncased-mnli',
});

// Extract content from a document
const result = await extractor.extract('path/to/document.docx');

// Access extracted content
console.log(`Extracted ${result.contents.length} items`);
result.contents.forEach((content) => {
  console.log(`${content.type}: ${content.content}`);
});

// Export to JSON
await extractor.exportResult(result, {
  format: ExportFormat.JSON,
  outputPath: 'output.json',
  includeMetadata: true,
  prettyPrint: true,
});

// Or extract and export in one step
await extractor.extractAndExport('document.docx', {
  format: ExportFormat.CSV,
  outputPath: 'output.csv',
  includeMetadata: true,
  prettyPrint: true,
});
```

## Architecture

### Components

1. **Parsers** (`src/parsers/`)
   - `DocxParser`: Extracts text and tables from .docx files using Mammoth
   - `PdfParser`: Extracts text and tables from PDF files using pdf-parse
   - `ParserFactory`: Factory for creating appropriate parsers

2. **NLP** (`src/nlp/`)
   - `ZeroShotClassifier`: Performs zero-shot classification using transformers
   - `ContentAnalyzer`: Analyzes and categorizes document content

3. **Exporters** (`src/exporters/`)
   - `JsonExporter`: Exports to JSON format
   - `CsvExporter`: Exports to CSV format
   - `ExporterFactory`: Factory for creating appropriate exporters

4. **Types** (`src/types/`)
   - TypeScript interfaces and Zod schemas for type safety and validation

5. **Utils** (`src/utils/`)
   - Helper functions for text processing and analysis

### Data Flow

```
Document → Parser → Text/Tables → Content Analyzer → Classification → Export
                                        ↓
                                  Zero-Shot Classifier (ML Model)
```

## Configuration Options

### ExtractorConfig

```typescript
{
  classificationLabels?: string[];        // Labels for classification (default: ['business_rule', 'formula', 'condition', 'definition', 'text'])
  confidenceThreshold?: number;           // Minimum confidence score (0-1, default: 0.5)
  enableTableExtraction?: boolean;        // Enable table extraction (default: true)
  modelName?: string;                     // Transformer model name (default: 'Xenova/distilbert-base-uncased-mnli')
}
```

### ExportOptions

```typescript
{
  format: ExportFormat;                   // 'json' or 'csv'
  outputPath: string;                     // Path to output file
  includeMetadata?: boolean;              // Include document metadata (default: true)
  prettyPrint?: boolean;                  // Pretty print JSON output (default: true)
}
```

## Supported Models

The project uses models from Hugging Face through `@xenova/transformers`:

- `Xenova/distilbert-base-uncased-mnli` (default)
- `Xenova/MiniLM-L6-v2`
- Any compatible zero-shot classification model

## Output Format

### JSON Output

```json
{
  "metadata": {
    "fileName": "document.docx",
    "fileType": "docx",
    "extractedAt": "2025-01-04T12:00:00.000Z",
    "totalParagraphs": 42
  },
  "contents": [
    {
      "id": "uuid-here",
      "type": "business_rule",
      "content": "All customers must provide valid identification...",
      "confidence": 0.92,
      "position": {
        "paragraph": 5
      }
    }
  ],
  "summary": {
    "totalItems": 25,
    "byType": {
      "business_rule": 10,
      "formula": 3,
      "condition": 7,
      "definition": 5
    }
  }
}
```

### CSV Output

```csv
ID,Type,Content,Confidence,Page,Paragraph,Has Table Data
uuid-1,business_rule,"All customers must...",0.92,,5,No
uuid-2,formula,"Total = Price * Quantity",0.87,,8,No
```

## Extending the System

### Custom Parser

```typescript
import { IDocumentParser, ParsedDocument } from './src/types/index.js';

class CustomParser implements IDocumentParser {
  async parse(filePath: string): Promise<ParsedDocument> {
    // Your parsing logic
    return {
      text: extractedText,
      tables: extractedTables,
      metadata: { /* ... */ }
    };
  }

  getSupportedExtensions(): string[] {
    return ['custom'];
  }
}

// Register the parser
ParserFactory.registerParser(DocumentType.CUSTOM, new CustomParser());
```

### Custom Exporter

```typescript
import { IExporter, ExtractionResult, ExportOptions } from './src/types/index.js';

class CustomExporter implements IExporter {
  async export(result: ExtractionResult, options: ExportOptions): Promise<void> {
    // Your export logic
  }

  getSupportedFormats(): ExportFormat[] {
    return [ExportFormat.CUSTOM];
  }
}

// Register the exporter
ExporterFactory.registerExporter(ExportFormat.CUSTOM, new CustomExporter());
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev -- extract path/to/document.docx

# Clean build artifacts
npm run clean
```

## Project Structure

```
typescript-document-extractor/
├── src/
│   ├── parsers/           # Document parsers
│   │   ├── DocxParser.ts
│   │   ├── PdfParser.ts
│   │   └── ParserFactory.ts
│   ├── nlp/              # NLP and ML components
│   │   ├── ZeroShotClassifier.ts
│   │   └── ContentAnalyzer.ts
│   ├── exporters/        # Export functionality
│   │   ├── JsonExporter.ts
│   │   ├── CsvExporter.ts
│   │   └── ExporterFactory.ts
│   ├── types/            # TypeScript types and Zod schemas
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   └── helpers.ts
│   ├── DocumentExtractor.ts  # Main orchestrator
│   ├── cli.ts           # CLI interface
│   └── index.ts         # Public API exports
├── examples/            # Example documents
├── package.json
├── tsconfig.json
└── README.md
```

## Requirements

- Node.js >= 18.0.0
- TypeScript 5.3+

## Dependencies

- `@xenova/transformers` - Transformer models for zero-shot classification
- `mammoth` - Word document parsing
- `pdf-parse` - PDF document parsing
- `zod` - Schema validation
- `commander` - CLI framework

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

For issues and questions, please open an issue on GitHub.
