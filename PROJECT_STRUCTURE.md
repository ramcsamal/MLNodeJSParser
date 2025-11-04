# Project Structure

## Overview

```
typescript-document-extractor/
├── src/                          # Source code
│   ├── parsers/                  # Document parsing modules
│   │   ├── DocxParser.ts         # Word document parser (Mammoth)
│   │   ├── PdfParser.ts          # PDF document parser (pdf-parse)
│   │   ├── ParserFactory.ts      # Parser factory pattern
│   │   └── index.ts              # Module exports
│   │
│   ├── nlp/                      # NLP and ML components
│   │   ├── ZeroShotClassifier.ts # Transformer-based classifier
│   │   ├── ContentAnalyzer.ts    # Content analysis and categorization
│   │   └── index.ts              # Module exports
│   │
│   ├── exporters/                # Export functionality
│   │   ├── JsonExporter.ts       # JSON format exporter
│   │   ├── CsvExporter.ts        # CSV format exporter
│   │   ├── ExporterFactory.ts    # Exporter factory pattern
│   │   └── index.ts              # Module exports
│   │
│   ├── types/                    # TypeScript types and schemas
│   │   └── index.ts              # All types, interfaces, and Zod schemas
│   │
│   ├── utils/                    # Utility functions
│   │   └── helpers.ts            # Text processing and analysis helpers
│   │
│   ├── DocumentExtractor.ts      # Main orchestrator class
│   ├── cli.ts                    # CLI interface (Commander.js)
│   └── index.ts                  # Public API exports
│
├── examples/                     # Examples and demos
│   ├── example-usage.ts          # Comprehensive usage examples
│   ├── simple-demo.ts            # Quick demo script
│   └── sample-document-content.md # Sample document content for testing
│
├── output/                       # Output directory for exports
│
├── dist/                         # Compiled JavaScript (after build)
│
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── .gitignore                    # Git ignore rules
├── README.md                     # Main documentation
├── QUICKSTART.md                 # Quick start guide
└── PROJECT_STRUCTURE.md          # This file

```

## Key Components

### 1. Document Parsers (`src/parsers/`)

**Purpose**: Extract raw text and tables from different document formats

- **DocxParser**: Uses Mammoth to parse .docx files
  - Extracts plain text
  - Extracts HTML tables and converts to structured format
  - Counts paragraphs

- **PdfParser**: Uses pdf-parse to parse PDF files
  - Extracts text content
  - Uses heuristics to detect and extract tables
  - Counts pages

- **ParserFactory**: Factory pattern for creating appropriate parsers
  - Automatically selects parser based on file extension
  - Supports custom parser registration

### 2. NLP Components (`src/nlp/`)

**Purpose**: Classify and analyze document content using ML models

- **ZeroShotClassifier**: Wrapper for @xenova/transformers
  - Loads pretrained models (DistilBERT, MiniLM)
  - Performs zero-shot classification
  - Supports batch processing
  - No training required

- **ContentAnalyzer**: High-level content analysis
  - Splits text into paragraphs
  - Classifies content using the classifier
  - Applies confidence thresholds
  - Processes tables
  - Generates structured ExtractedContent objects

### 3. Exporters (`src/exporters/`)

**Purpose**: Export extraction results to different formats

- **JsonExporter**: Exports to JSON format
  - Pretty printing option
  - Metadata inclusion
  - Preserves all data structures

- **CsvExporter**: Exports to CSV format
  - Flattens nested structures
  - Includes metadata as comments
  - Proper CSV escaping

- **ExporterFactory**: Factory pattern for creating exporters
  - Supports custom exporter registration

### 4. Types (`src/types/`)

**Purpose**: Type safety and runtime validation

- TypeScript interfaces for all data structures
- Zod schemas for runtime validation
- Enums for constants
- Interface definitions for extensibility

### 5. Utilities (`src/utils/`)

**Purpose**: Helper functions used across the project

- Text normalization and cleaning
- Sentence and paragraph splitting
- Pattern detection (formulas, conditions)
- ID generation
- Confidence calculation

### 6. Main Components

**DocumentExtractor** (`src/DocumentExtractor.ts`)
- Main orchestrator class
- Coordinates parsers, analyzers, and exporters
- Manages configuration
- Provides high-level API

**CLI** (`src/cli.ts`)
- Command-line interface using Commander.js
- `extract` command for document processing
- `info` command for system information
- Rich option support

## Data Flow

```
1. Input Document
   ↓
2. Parser (DocxParser or PdfParser)
   ↓
3. ParsedDocument { text, tables, metadata }
   ↓
4. ContentAnalyzer
   ↓
5. ZeroShotClassifier (ML Model)
   ↓
6. ExtractedContent[] (classified items)
   ↓
7. Exporter (JsonExporter or CsvExporter)
   ↓
8. Output File
```

## Extension Points

### Adding a New Parser

1. Implement `IDocumentParser` interface
2. Register with `ParserFactory`

### Adding a New Classifier

1. Implement `IClassifier` interface
2. Pass to `ContentAnalyzer` constructor

### Adding a New Exporter

1. Implement `IExporter` interface
2. Register with `ExporterFactory`

### Adding Custom Classification Labels

```typescript
const extractor = new DocumentExtractor({
  classificationLabels: ['your', 'custom', 'labels']
});
```

## Configuration

All configuration is centralized in `ExtractorConfig`:
- Classification labels
- Confidence threshold
- Table extraction enable/disable
- Model selection

Configuration can be set at initialization or updated dynamically.

## Scripts

```json
{
  "build": "tsc",                    // Compile TypeScript
  "start": "node dist/cli.js",       // Run compiled CLI
  "dev": "tsx src/cli.ts",           // Run CLI in dev mode
  "clean": "rimraf dist",            // Clean build artifacts
  "prebuild": "npm run clean"        // Clean before build
}
```

## Dependencies

### Production
- `@xenova/transformers` - ML models
- `commander` - CLI framework
- `mammoth` - DOCX parsing
- `pdf-parse` - PDF parsing
- `zod` - Schema validation

### Development
- `typescript` - Type system
- `tsx` - TypeScript execution
- `rimraf` - Cross-platform rm -rf
- `@types/*` - Type definitions

## Design Patterns

1. **Factory Pattern**: ParserFactory, ExporterFactory
2. **Strategy Pattern**: Interchangeable parsers and exporters
3. **Dependency Injection**: Classifier injected into ContentAnalyzer
4. **Builder Pattern**: Configuration building with ExtractorConfig
5. **Interface Segregation**: Separate interfaces for each component

## Type Safety

- Compile-time: TypeScript interfaces
- Runtime: Zod schemas
- Validation at boundaries
- No `any` types in production code

## Error Handling

- Try-catch blocks at component boundaries
- Meaningful error messages
- Graceful degradation (e.g., table extraction failures)
- CLI error codes

## Performance Considerations

- Lazy model loading (only when needed)
- Model caching (singleton classifier)
- Batch processing support
- Streaming for large files (future enhancement)

## Testing Strategy

- Unit tests for individual components
- Integration tests for full pipeline
- Example documents for validation
- Type checking as first line of defense
