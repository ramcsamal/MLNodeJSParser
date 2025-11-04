import { IClassifier, ExtractedContent, TableData } from '../types/index.js';
import {
  generateId,
  normalizeText,
  splitIntoParagraphs,
  calculateConfidence,
} from '../utils/helpers.js';

export class ContentAnalyzer {
  private classifier: IClassifier;
  private confidenceThreshold: number;
  private classificationLabels: string[];

  constructor(
    classifier: IClassifier,
    options: {
      confidenceThreshold?: number;
      classificationLabels?: string[];
    } = {}
  ) {
    this.classifier = classifier;
    this.confidenceThreshold = options.confidenceThreshold ?? 0.5;
    this.classificationLabels = options.classificationLabels ?? [
      'business_rule',
      'formula',
      'condition',
      'definition',
      'text',
    ];
  }

  /**
   * Analyze text and extract structured content
   */
  async analyzeText(
    text: string,
    metadata: { page?: number } = {}
  ): Promise<ExtractedContent[]> {
    const paragraphs = splitIntoParagraphs(normalizeText(text));
    const extractedContents: ExtractedContent[] = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];

      // Skip very short paragraphs
      if (paragraph.length < 10) continue;

      // Classify the paragraph
      const classifications = await this.classifier.classify(
        paragraph,
        this.classificationLabels
      );

      if (classifications.length === 0) continue;

      // Get the top classification
      const topClassification = classifications[0];
      const confidence = calculateConfidence(
        paragraph,
        topClassification.score
      );

      // Only include if confidence is above threshold
      if (confidence >= this.confidenceThreshold) {
        extractedContents.push({
          id: generateId(),
          type: topClassification.label,
          content: paragraph,
          confidence,
          position: {
            paragraph: i,
            page: metadata.page,
          },
        });
      }
    }

    return extractedContents;
  }

  /**
   * Analyze tables and create extracted content
   */
  analyzeTables(
    tables: TableData[],
    metadata: { page?: number } = {}
  ): ExtractedContent[] {
    const extractedContents: ExtractedContent[] = [];

    for (const table of tables) {
      // Create a text representation of the table
      const tableText = this.tableToText(table);

      extractedContents.push({
        id: generateId(),
        type: 'table',
        content: tableText,
        confidence: 1.0,
        tableData: table,
        position: {
          page: metadata.page,
        },
      });
    }

    return extractedContents;
  }

  /**
   * Convert table to text representation
   */
  private tableToText(table: TableData): string {
    const lines: string[] = [];

    if (table.headers) {
      lines.push(table.headers.join(' | '));
      lines.push('-'.repeat(50));
    }

    for (const row of table.rows) {
      lines.push(row.join(' | '));
    }

    return lines.join('\n');
  }

  /**
   * Update confidence threshold
   */
  setConfidenceThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Confidence threshold must be between 0 and 1');
    }
    this.confidenceThreshold = threshold;
  }

  /**
   * Update classification labels
   */
  setClassificationLabels(labels: string[]): void {
    if (labels.length === 0) {
      throw new Error('Classification labels cannot be empty');
    }
    this.classificationLabels = labels;
  }
}
