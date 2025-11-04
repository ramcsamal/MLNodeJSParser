#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { DocumentExtractor } from './DocumentExtractor.js';
import { ExportFormat } from './types/index.js';

const program = new Command();

program
  .name('doc-extract')
  .description(
    'Extract structured insights from business documents using ML-powered NLP'
  )
  .version('1.0.0');

program
  .command('extract')
  .description('Extract content from a document')
  .argument('<input>', 'Path to the input document (.docx or .pdf)')
  .option('-o, --output <path>', 'Output file path')
  .option(
    '-f, --format <format>',
    'Output format (json, csv, or xlsx)',
    'json'
  )
  .option(
    '-t, --threshold <number>',
    'Confidence threshold (0-1)',
    '0.5'
  )
  .option(
    '-l, --labels <labels>',
    'Comma-separated classification labels',
    'business_rule,formula,condition,definition,text'
  )
  .option(
    '-m, --model <name>',
    'Model name to use',
    'Xenova/distilbert-base-uncased-mnli'
  )
  .option('--no-tables', 'Disable table extraction')
  .option('--no-metadata', 'Exclude metadata from output')
  .option('--compact', 'Compact output (no pretty printing)')
  .action(async (input: string, options: any) => {
    try {
      // Parse options
      const confidenceThreshold = parseFloat(options.threshold);
      if (isNaN(confidenceThreshold) || confidenceThreshold < 0 || confidenceThreshold > 1) {
        console.error('Error: Confidence threshold must be between 0 and 1');
        process.exit(1);
      }

      const format = options.format.toLowerCase() as ExportFormat;
      if (format !== 'json' && format !== 'csv' && format !== 'xlsx') {
        console.error('Error: Format must be either "json", "csv", or "xlsx"');
        process.exit(1);
      }

      const classificationLabels = options.labels
        .split(',')
        .map((label: string) => label.trim());

      // Determine output path
      const inputPath = path.resolve(input);
      const outputPath = options.output
        ? path.resolve(options.output)
        : path.join(
            path.dirname(inputPath),
            `${path.basename(inputPath, path.extname(inputPath))}_extracted.${format}`
          );

      // Create extractor
      console.log('Initializing document extractor...');
      const extractor = new DocumentExtractor({
        confidenceThreshold,
        classificationLabels,
        enableTableExtraction: options.tables,
        modelName: options.model,
      });

      // Extract and export
      await extractor.extractAndExport(inputPath, {
        format,
        outputPath,
        includeMetadata: options.metadata,
        prettyPrint: !options.compact,
      });

      console.log('\nExtraction complete!');
      console.log(`Output saved to: ${outputPath}`);
    } catch (error) {
      console.error(
        'Error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Display information about the extractor')
  .action(() => {
    console.log('TypeScript Document Extractor');
    console.log('=============================');
    console.log('Version: 1.0.0');
    console.log('');
    console.log('Supported file formats:');
    console.log('  - .docx (Word documents)');
    console.log('  - .pdf (PDF documents)');
    console.log('');
    console.log('Supported export formats:');
    console.log('  - JSON');
    console.log('  - CSV');
    console.log('  - XLSX (Excel with multiple sheets)');
    console.log('');
    console.log('Default classification labels:');
    console.log('  - business_rule');
    console.log('  - formula');
    console.log('  - condition');
    console.log('  - definition');
    console.log('  - text');
    console.log('');
    console.log('Default model: Xenova/distilbert-base-uncased-mnli');
    console.log('');
    console.log('Recommended models for table-heavy documents:');
    console.log('  - Xenova/mobilebert-uncased-mnli (faster)');
    console.log('  - Xenova/nli-deberta-v3-small (better accuracy)');
    console.log('');
    console.log('For more information, run: doc-extract --help');
  });

program.parse();
