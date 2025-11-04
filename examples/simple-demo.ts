/**
 * Simple Demo Script
 *
 * This is a minimal example to test the Document Extractor.
 * Replace 'path/to/your/document.docx' with an actual document path.
 */

import { DocumentExtractor, ExportFormat } from '../src/index.js';

async function demo() {
  console.log('TypeScript Document Extractor - Simple Demo');
  console.log('===========================================\n');

  try {
    // Create the extractor with default settings
    console.log('1. Initializing extractor...');
    const extractor = new DocumentExtractor({
      confidenceThreshold: 0.5,
      enableTableExtraction: true,
    });

    // Path to your document
    const documentPath = process.argv[2] || 'path/to/your/document.docx';

    console.log(`2. Extracting content from: ${documentPath}`);
    console.log('   (This may take a minute on first run while downloading the ML model...)\n');

    // Extract content
    const result = await extractor.extract(documentPath);

    // Display results
    console.log('\n3. Extraction Results:');
    console.log('   ==================\n');
    console.log(`   Total items extracted: ${result.contents.length}`);
    console.log(`   Document: ${result.metadata.fileName}`);
    console.log(`   Type: ${result.metadata.fileType}`);

    if (result.summary) {
      console.log('\n   Items by type:');
      for (const [type, count] of Object.entries(result.summary.byType)) {
        console.log(`     - ${type}: ${count}`);
      }
    }

    // Show sample extractions
    console.log('\n4. Sample Extractions (first 5 items):');
    console.log('   ===================================\n');

    result.contents.slice(0, 5).forEach((content, index) => {
      console.log(`   ${index + 1}. [${content.type.toUpperCase()}] (confidence: ${(content.confidence * 100).toFixed(1)}%)`);
      const preview = content.content.length > 80
        ? content.content.substring(0, 80) + '...'
        : content.content;
      console.log(`      "${preview}"\n`);
    });

    // Export to JSON
    const outputPath = 'output/demo-results.json';
    console.log(`5. Exporting to ${outputPath}...`);

    await extractor.exportResult(result, {
      format: ExportFormat.JSON,
      outputPath,
      includeMetadata: true,
      prettyPrint: true,
    });

    console.log('\n✓ Demo complete! Check the output file for full results.');

  } catch (error) {
    console.error('\n✗ Error:', error instanceof Error ? error.message : 'Unknown error');
    console.log('\nUsage: npm run dev examples/simple-demo.ts <path-to-document>');
    console.log('Example: npm run dev examples/simple-demo.ts examples/sample.docx');
    process.exit(1);
  }
}

demo();
