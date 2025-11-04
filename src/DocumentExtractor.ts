import path from 'path';
import { ParserFactory } from './parsers/index.js';
import { ZeroShotClassifier, ContentAnalyzer } from './nlp/index.js';
import { ExporterFactory } from './exporters/index.js';
import {
  ExtractionResult,
  ExtractedContent,
  ExportOptions,
  ExtractorConfigType,
  ExtractorConfigSchema,
  DocumentType,
} from './types/index.js';
import { getDocumentType } from './utils/helpers.js';

export class DocumentExtractor {
  private config: ExtractorConfigType;
  private classifier: ZeroShotClassifier;
  private analyzer: ContentAnalyzer;

  constructor(config: Partial<ExtractorConfigType> = {}) {
    // Validate and merge config with defaults
    this.config = ExtractorConfigSchema.parse(config);

    // Initialize NLP components
    this.classifier = new ZeroShotClassifier(this.config.modelName);
    this.analyzer = new ContentAnalyzer(this.classifier, {
      confidenceThreshold: this.config.confidenceThreshold,
      classificationLabels: this.config.classificationLabels,
    });
  }

  /**
   * Extract structured content from a document
   */
  async extract(filePath: string): Promise<ExtractionResult> {
    console.log(`Extracting content from: ${filePath}`);

    // Ensure classifier is ready
    await this.classifier.isReady();

    // Get the appropriate parser
    const parser = ParserFactory.getParser(filePath);

    // Parse the document
    const parsedDoc = await parser.parse(filePath);

    // Analyze text content
    const textContents = await this.analyzer.analyzeText(parsedDoc.text);

    // Analyze tables if enabled
    let tableContents: ExtractedContent[] = [];
    if (this.config.enableTableExtraction && parsedDoc.tables.length > 0) {
      tableContents = this.analyzer.analyzeTables(parsedDoc.tables);
    }

    // Combine all extracted content
    const allContents = [...textContents, ...tableContents];

    // Calculate summary
    const summary = this.calculateSummary(allContents);

    // Create extraction result
    const result: ExtractionResult = {
      metadata: {
        fileName: path.basename(filePath),
        fileType: getDocumentType(filePath),
        extractedAt: new Date(),
        totalPages: parsedDoc.metadata.pageCount,
        totalParagraphs: parsedDoc.metadata.paragraphCount,
      },
      contents: allContents,
      summary,
    };

    console.log(
      `Extraction complete: ${allContents.length} items extracted`
    );

    return result;
  }

  /**
   * Extract and export in one step
   */
  async extractAndExport(
    filePath: string,
    exportOptions: ExportOptions
  ): Promise<void> {
    // Extract content
    const result = await this.extract(filePath);

    // Export result
    await this.exportResult(result, exportOptions);
  }

  /**
   * Export extraction result
   */
  async exportResult(
    result: ExtractionResult,
    options: ExportOptions
  ): Promise<void> {
    const exporter = ExporterFactory.getExporter(options.format);
    await exporter.export(result, options);
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(contents: ExtractedContent[]): {
    totalItems: number;
    byType: Record<string, number>;
  } {
    const byType: Record<string, number> = {};

    for (const content of contents) {
      if (!byType[content.type]) {
        byType[content.type] = 0;
      }
      byType[content.type]++;
    }

    return {
      totalItems: contents.length,
      byType,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ExtractorConfigType>): void {
    this.config = ExtractorConfigSchema.parse({
      ...this.config,
      ...config,
    });

    // Update analyzer settings
    if (config.confidenceThreshold !== undefined) {
      this.analyzer.setConfidenceThreshold(config.confidenceThreshold);
    }

    if (config.classificationLabels !== undefined) {
      this.analyzer.setClassificationLabels(config.classificationLabels);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ExtractorConfigType {
    return { ...this.config };
  }
}
