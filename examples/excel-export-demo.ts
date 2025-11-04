/**
 * Excel Export Demo
 *
 * Demonstrates Excel export with structured data extraction
 * Extracts key-value pairs like "Country: India, US, China"
 * and organizes them into separate columns in Excel
 */

import { DocumentExtractor, ExportFormat } from '../src/index.js';

async function excelDemo() {
  console.log('TypeScript Document Extractor - Excel Export Demo');
  console.log('==================================================\n');

  try {
    // Create extractor with better model for structured data
    console.log('1. Initializing extractor with optimized settings...');
    const extractor = new DocumentExtractor({
      confidenceThreshold: 0.5,
      enableTableExtraction: true,
      // Use faster model for structured data
      modelName: 'Xenova/mobilebert-uncased-mnli',
    });

    // Path to your document
    const documentPath = process.argv[2] || 'path/to/your/document.docx';

    console.log(`2. Extracting content from: ${documentPath}`);
    console.log('   (First run downloads the model...)\n');

    // Extract content
    const result = await extractor.extract(documentPath);

    console.log('3. Extraction Complete!');
    console.log(`   - Total items: ${result.contents.length}`);
    console.log(`   - Tables found: ${result.contents.filter((c) => c.type === 'table').length}`);

    // Export to Excel with multiple sheets
    const outputPath = 'output/structured-data.xlsx';
    console.log(`\n4. Exporting to Excel: ${outputPath}`);
    console.log('   Creating sheets:');
    console.log('     ✓ Metadata - Document information');
    console.log('     ✓ All Data - Complete extraction results');
    console.log('     ✓ Tables - All extracted tables');
    console.log('     ✓ Structured Data - Key-value pairs (Country, TripType, etc.)');
    console.log('     ✓ Summary - Statistics by content type\n');

    await extractor.exportResult(result, {
      format: ExportFormat.XLSX,
      outputPath,
      includeMetadata: true,
      prettyPrint: true,
    });

    console.log('✓ Excel export complete!');
    console.log('\nOpen the file to see:');
    console.log('  • Structured data with columns like "Country", "TripType"');
    console.log('  • Tables preserved in their original format');
    console.log('  • All extracted business rules, formulas, conditions');
    console.log('  • Summary statistics\n');

    // Show what structured data was found
    console.log('5. Sample Structured Data Detected:');
    console.log('   (Check "Structured Data" sheet in Excel for full details)\n');

    // Demonstrate structured data extraction
    const structuredExtractor = new (await import('../src/utils/StructuredDataExtractor.js')).StructuredDataExtractor();
    const texts = result.contents.map((c) => c.content);
    const fields = structuredExtractor.extractFromMultiple(texts);

    if (fields.length > 0) {
      const merged = structuredExtractor.mergeFields(fields);
      let count = 0;
      for (const [key, values] of merged.entries()) {
        if (count >= 3) break; // Show first 3
        console.log(`   ${key}:`);
        console.log(`     → ${values.join(', ')}`);
        count++;
      }
      if (merged.size > 3) {
        console.log(`   ... and ${merged.size - 3} more fields`);
      }
    } else {
      console.log('   No structured key-value pairs detected.');
      console.log('   (Looks for patterns like "Country: India, US, China")');
    }

    console.log('\n✓ Demo complete! Check the Excel file for results.');
  } catch (error) {
    console.error('\n✗ Error:', error instanceof Error ? error.message : 'Unknown error');
    console.log('\nUsage: npm run dev examples/excel-export-demo.ts <path-to-document>');
    console.log('Example: npm run dev examples/excel-export-demo.ts examples/sample.docx');
    process.exit(1);
  }
}

excelDemo();
