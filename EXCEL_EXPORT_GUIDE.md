# Excel Export & Structured Data Extraction Guide

## Overview

The enhanced TypeScript Document Extractor now includes:
- ✅ **Excel (.xlsx) export** with multiple organized sheets
- ✅ **Structured data extraction** for key-value pairs (Country, TripType, etc.)
- ✅ **Better ML models** for table-heavy documents
- ✅ **Column-based organization** in Excel

## Quick Start

### Export to Excel

```bash
# Extract to Excel (default creates multiple sheets)
npm run dev -- extract document.docx --format xlsx

# With custom output path
npm run dev -- extract document.docx --format xlsx --output results.xlsx

# Use better model for table-heavy docs
npm run dev -- extract document.docx --format xlsx --model Xenova/mobilebert-uncased-mnli
```

### Excel Output Structure

The generated Excel file contains **5 sheets**:

1. **Metadata** - Document information
2. **All Data** - Complete extraction results
3. **Tables** - All extracted tables
4. **Structured Data** - Key-value pairs organized in columns ⭐
5. **Summary** - Statistics by content type

## Structured Data Extraction

### What is Extracted?

The system automatically detects and extracts patterns like:

```
Country: India, US, China
TripType: OneWay, RoundTrip
Status: Active, Pending, Closed
PaymentMethod: CreditCard, DebitCard, Cash, UPI
```

### Excel Output Format

In the **"Structured Data"** sheet, each field becomes a **column**:

| Country | TripType  | Status  | PaymentMethod |
|---------|-----------|---------|---------------|
| India   | OneWay    | Active  | CreditCard    |
| US      | RoundTrip | Pending | DebitCard     |
| China   |           | Closed  | Cash          |
|         |           |         | UPI           |

### Supported Patterns

The extractor recognizes:

```
Key: Value1, Value2, Value3
Key : Value1 ; Value2 ; Value3
Key: Value1 | Value2 | Value3
Key: Value1 and Value2
```

**Examples:**
- `Countries: India, China, USA`
- `Status : Active ; Pending`
- `Types: Type1 | Type2 | Type3`
- `Options: Option1 and Option2`

## Better ML Models

### Recommended Models for Your Use Case

For **table-heavy documents** with lots of structured data:

#### 1. **Xenova/mobilebert-uncased-mnli** (Recommended)
- ⚡ **Faster** than DistilBERT
- 💾 **Smaller** model size (~50MB)
- ✅ **Good accuracy** for structured data
- 🎯 **Best for**: Quick extraction, table-heavy docs

```bash
npm run dev -- extract document.docx --format xlsx --model Xenova/mobilebert-uncased-mnli
```

#### 2. **Xenova/nli-deberta-v3-small**
- 🎯 **Better accuracy** than DistilBERT
- 📊 **Excellent for** complex business logic
- ⏱️ Slightly slower but more precise
- 🎯 **Best for**: Complex documents requiring high accuracy

```bash
npm run dev -- extract document.docx --format xlsx --model Xenova/nli-deberta-v3-small
```

#### 3. **Xenova/distilbert-base-uncased-mnli** (Default)
- ⚖️ **Balanced** speed and accuracy
- 🎯 **Best for**: General-purpose extraction

### Model Comparison

| Model | Size | Speed | Accuracy | Best For |
|-------|------|-------|----------|----------|
| mobilebert-uncased-mnli | 50MB | ⚡⚡⚡ | ⭐⭐⭐ | Tables, structured data |
| distilbert (default) | 250MB | ⚡⚡ | ⭐⭐⭐⭐ | General documents |
| nli-deberta-v3-small | 400MB | ⚡ | ⭐⭐⭐⭐⭐ | Complex logic |

## Complete Examples

### Example 1: Basic Excel Export

```bash
npm run dev -- extract travel-policy.docx --format xlsx
```

**Output:** `travel-policy_extracted.xlsx` with all 5 sheets

### Example 2: Custom Configuration

```bash
npm run dev -- extract policy.pdf \
  --format xlsx \
  --output results.xlsx \
  --threshold 0.6 \
  --model Xenova/mobilebert-uncased-mnli \
  --labels "policy,rule,requirement,definition"
```

### Example 3: Programmatic Usage

```typescript
import { DocumentExtractor, ExportFormat } from './src/index.js';

const extractor = new DocumentExtractor({
  confidenceThreshold: 0.6,
  enableTableExtraction: true,
  modelName: 'Xenova/mobilebert-uncased-mnli',
  classificationLabels: [
    'business_rule',
    'formula',
    'condition',
    'definition',
    'policy',
  ],
});

// Extract and export to Excel
await extractor.extractAndExport('document.docx', {
  format: ExportFormat.XLSX,
  outputPath: 'output/results.xlsx',
  includeMetadata: true,
  prettyPrint: true,
});
```

### Example 4: Process Multiple Documents to Excel

```typescript
const documents = ['doc1.docx', 'doc2.pdf', 'doc3.docx'];
const extractor = new DocumentExtractor({
  modelName: 'Xenova/mobilebert-uncased-mnli',
});

for (const doc of documents) {
  const outputPath = `output/${doc.replace(/\.[^.]+$/, '')}.xlsx`;
  await extractor.extractAndExport(doc, {
    format: ExportFormat.XLSX,
    outputPath,
    includeMetadata: true,
  });
  console.log(`✓ Exported: ${outputPath}`);
}
```

## Advanced Features

### Custom Structured Data Extraction

```typescript
import { StructuredDataExtractor } from './src/utils/StructuredDataExtractor.js';

const extractor = new StructuredDataExtractor();

// Extract from text
const text = `
  Countries: India, USA, China
  TripType: OneWay, RoundTrip
  Status: Active, Pending
`;

const fields = extractor.extractFields(text);
// Returns: [
//   { key: 'Countries', values: ['India', 'USA', 'China'], rawText: '...' },
//   { key: 'TripType', values: ['OneWay', 'RoundTrip'], rawText: '...' },
//   { key: 'Status', values: ['Active', 'Pending'], rawText: '...' }
// ]

// Convert to Excel-ready format
const excelData = extractor.toFlatStructure(fields);
// Returns: [
//   { Countries: 'India', TripType: 'OneWay', Status: 'Active' },
//   { Countries: 'USA', TripType: 'RoundTrip', Status: 'Pending' },
//   { Countries: 'China', TripType: '', Status: '' }
// ]
```

### Working with Extracted Tables

The Excel export preserves all table structures:

```typescript
const result = await extractor.extract('document.docx');

// Filter tables
const tables = result.contents.filter((c) => c.type === 'table');

console.log(`Found ${tables.length} tables`);

tables.forEach((table, index) => {
  console.log(`\nTable ${index + 1}:`);
  if (table.tableData?.headers) {
    console.log(`Headers: ${table.tableData.headers.join(', ')}`);
  }
  console.log(`Rows: ${table.tableData?.rows.length}`);
});
```

## Excel Sheet Details

### 1. Metadata Sheet
- File name, type, extraction date
- Page count, paragraph count
- Total extracted items

### 2. All Data Sheet
Columns:
- **ID** - Unique identifier
- **Type** - business_rule, formula, condition, etc.
- **Content** - Extracted text
- **Confidence** - ML confidence score (0-1)
- **Page** - Page number (if available)
- **Paragraph** - Paragraph index

### 3. Tables Sheet
- All tables from the document
- Preserved headers and structure
- Separated by empty rows

### 4. Structured Data Sheet ⭐
- **One column per field** (Country, TripType, etc.)
- **One row per value combination**
- Auto-detected from document patterns

### 5. Summary Sheet
- Count by content type
- Total items extracted

## Tips for Best Results

### For Table-Heavy Documents
1. Use `Xenova/mobilebert-uncased-mnli` for speed
2. Enable table extraction (default: on)
3. Use lower confidence threshold (0.4-0.5)

### For Structured Data Extraction
1. Use consistent patterns in your documents:
   - `Key: Value1, Value2, Value3`
2. Separate values with commas, semicolons, or pipes
3. Keep key names short and descriptive

### For Complex Business Logic
1. Use `Xenova/nli-deberta-v3-small` for better accuracy
2. Use higher confidence threshold (0.7-0.8)
3. Customize classification labels

## Privacy & Local Processing

✅ **Everything runs locally** - No data sent externally
✅ **Models cached locally** - One-time download only
✅ **Offline capable** - After first run
✅ **No API keys** - No cloud services

## Performance Tips

### First Run
- Model downloads (50-400MB depending on choice)
- Takes 2-5 minutes
- Subsequent runs are much faster

### Speed Optimization
```bash
# Use faster model
--model Xenova/mobilebert-uncased-mnli

# Lower confidence for more speed
--threshold 0.4

# Disable tables if not needed
--no-tables
```

### Memory Optimization
```bash
# For large documents
NODE_OPTIONS="--max-old-space-size=4096" npm run dev -- extract large.pdf --format xlsx
```

## Troubleshooting

### No Structured Data Found
**Problem:** "Structured Data" sheet is empty

**Solutions:**
1. Check if your document has patterns like `Key: Value1, Value2`
2. Try different formats: commas, semicolons, pipes
3. Ensure there's whitespace around delimiters

### Tables Not Extracted Properly
**Problem:** Tables look wrong in Excel

**Solutions:**
1. For DOCX: Tables should be properly formatted Word tables
2. For PDF: Try a different PDF (some PDFs have tables as images)
3. Check the "Tables" sheet for raw extracted data

### Low Confidence Scores
**Problem:** Not enough data extracted

**Solutions:**
1. Lower threshold: `--threshold 0.4`
2. Try different model: `--model Xenova/nli-deberta-v3-small`
3. Customize labels: `--labels "your,specific,labels"`

## Command Reference

```bash
# Basic Excel export
npm run dev -- extract document.docx --format xlsx

# All options
npm run dev -- extract document.docx \
  --format xlsx \
  --output results.xlsx \
  --threshold 0.6 \
  --labels "rule,policy,condition,definition" \
  --model Xenova/mobilebert-uncased-mnli \
  --no-tables \
  --no-metadata

# View system info
npm run dev -- info

# Run demo
npm run dev examples/excel-export-demo.ts document.docx
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Try Excel export**: `npm run dev -- extract your-file.docx --format xlsx`
3. **Check the output**: Open the `.xlsx` file in Excel/LibreOffice
4. **Explore sheets**: Check "Structured Data" for key-value pairs
5. **Optimize**: Try different models and thresholds

## Support

For issues or questions about Excel export:
1. Check this guide
2. See `examples/excel-export-demo.ts`
3. Review `README.md` for general documentation
