import { DocumentExtractor, ExportFormat } from '../src/index.js';

/**
 * Example 1: Basic extraction with default settings
 */
async function basicExtraction() {
  console.log('Example 1: Basic Extraction');
  console.log('===========================\n');

  const extractor = new DocumentExtractor();

  // Extract content from a document
  const result = await extractor.extract('path/to/your/document.docx');

  console.log(`Extracted ${result.contents.length} items`);
  console.log('\nSummary by type:');
  for (const [type, count] of Object.entries(result.summary?.byType || {})) {
    console.log(`  ${type}: ${count}`);
  }

  // Show first few items
  console.log('\nFirst 3 extracted items:');
  result.contents.slice(0, 3).forEach((content, index) => {
    console.log(
      `\n${index + 1}. [${content.type}] (confidence: ${content.confidence})`
    );
    console.log(`   ${content.content.substring(0, 100)}...`);
  });
}

/**
 * Example 2: Custom configuration
 */
async function customConfiguration() {
  console.log('\n\nExample 2: Custom Configuration');
  console.log('================================\n');

  const extractor = new DocumentExtractor({
    confidenceThreshold: 0.7,
    classificationLabels: [
      'business_rule',
      'compliance_requirement',
      'risk_factor',
      'calculation',
      'policy',
    ],
    enableTableExtraction: true,
    modelName: 'Xenova/distilbert-base-uncased-mnli',
  });

  const result = await extractor.extract('path/to/your/document.pdf');

  console.log(`Extracted ${result.contents.length} items with high confidence`);
  console.log(`Confidence threshold: ${extractor.getConfig().confidenceThreshold}`);
}

/**
 * Example 3: Extract and export to multiple formats
 */
async function multipleExports() {
  console.log('\n\nExample 3: Multiple Export Formats');
  console.log('===================================\n');

  const extractor = new DocumentExtractor();

  const result = await extractor.extract('path/to/your/document.docx');

  // Export to JSON
  await extractor.exportResult(result, {
    format: ExportFormat.JSON,
    outputPath: 'output/results.json',
    includeMetadata: true,
    prettyPrint: true,
  });
  console.log('Exported to JSON: output/results.json');

  // Export to CSV
  await extractor.exportResult(result, {
    format: ExportFormat.CSV,
    outputPath: 'output/results.csv',
    includeMetadata: true,
    prettyPrint: false,
  });
  console.log('Exported to CSV: output/results.csv');
}

/**
 * Example 4: Filter by content type
 */
async function filterByType() {
  console.log('\n\nExample 4: Filter By Content Type');
  console.log('==================================\n');

  const extractor = new DocumentExtractor();

  const result = await extractor.extract('path/to/your/document.docx');

  // Filter business rules only
  const businessRules = result.contents.filter(
    (c) => c.type === 'business_rule'
  );

  console.log(`Found ${businessRules.length} business rules:`);
  businessRules.forEach((rule, index) => {
    console.log(
      `\n${index + 1}. [Confidence: ${rule.confidence}]`
    );
    console.log(`   ${rule.content}`);
  });

  // Filter formulas only
  const formulas = result.contents.filter((c) => c.type === 'formula');
  console.log(`\nFound ${formulas.length} formulas`);
}

/**
 * Example 5: Extract tables only
 */
async function extractTablesOnly() {
  console.log('\n\nExample 5: Extract Tables Only');
  console.log('===============================\n');

  const extractor = new DocumentExtractor({
    enableTableExtraction: true,
  });

  const result = await extractor.extract('path/to/your/document.docx');

  // Filter tables only
  const tables = result.contents.filter((c) => c.type === 'table');

  console.log(`Found ${tables.length} tables`);

  tables.forEach((table, index) => {
    console.log(`\nTable ${index + 1}:`);
    if (table.tableData?.headers) {
      console.log(`  Headers: ${table.tableData.headers.join(', ')}`);
    }
    console.log(`  Rows: ${table.tableData?.rows.length || 0}`);
  });
}

/**
 * Example 6: Process multiple documents
 */
async function processMultipleDocuments() {
  console.log('\n\nExample 6: Process Multiple Documents');
  console.log('======================================\n');

  const extractor = new DocumentExtractor();

  const documents = [
    'path/to/document1.docx',
    'path/to/document2.pdf',
    'path/to/document3.docx',
  ];

  const allResults = [];

  for (const doc of documents) {
    console.log(`Processing: ${doc}`);
    const result = await extractor.extract(doc);
    allResults.push(result);
    console.log(`  Extracted ${result.contents.length} items`);
  }

  const totalItems = allResults.reduce(
    (sum, result) => sum + result.contents.length,
    0
  );
  console.log(`\nTotal items extracted from all documents: ${totalItems}`);
}

/**
 * Example 7: Update configuration dynamically
 */
async function dynamicConfiguration() {
  console.log('\n\nExample 7: Dynamic Configuration');
  console.log('=================================\n');

  const extractor = new DocumentExtractor({
    confidenceThreshold: 0.5,
  });

  console.log('Initial threshold: 0.5');
  let result = await extractor.extract('path/to/your/document.docx');
  console.log(`Extracted ${result.contents.length} items`);

  // Update configuration
  extractor.updateConfig({
    confidenceThreshold: 0.8,
  });

  console.log('\nUpdated threshold: 0.8');
  result = await extractor.extract('path/to/your/document.docx');
  console.log(`Extracted ${result.contents.length} items`);
}

// Run examples
async function runExamples() {
  try {
    // Uncomment the examples you want to run:

    // await basicExtraction();
    // await customConfiguration();
    // await multipleExports();
    // await filterByType();
    // await extractTablesOnly();
    // await processMultipleDocuments();
    // await dynamicConfiguration();

    console.log('\n\nExamples complete!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run:
// runExamples();
