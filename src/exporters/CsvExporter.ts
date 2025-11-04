import { writeFile } from 'fs/promises';
import {
  IExporter,
  ExtractionResult,
  ExportOptions,
  ExportFormat,
} from '../types/index.js';

export class CsvExporter implements IExporter {
  /**
   * Export extraction results to CSV format
   */
  async export(
    result: ExtractionResult,
    options: ExportOptions
  ): Promise<void> {
    try {
      // Generate CSV content
      const csvContent = this.generateCsv(result, options);

      // Write to file
      await writeFile(options.outputPath, csvContent, 'utf-8');

      console.log(`Exported to CSV: ${options.outputPath}`);
    } catch (error) {
      throw new Error(
        `Failed to export to CSV: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Generate CSV content from extraction results
   */
  private generateCsv(
    result: ExtractionResult,
    options: ExportOptions
  ): string {
    const rows: string[] = [];

    // Add header row
    const headers = [
      'ID',
      'Type',
      'Content',
      'Confidence',
      'Page',
      'Paragraph',
      'Has Table Data',
    ];
    rows.push(this.escapeCsvRow(headers));

    // Add data rows
    for (const content of result.contents) {
      const row = [
        content.id,
        content.type,
        content.content.replace(/\n/g, ' '), // Replace newlines with spaces
        content.confidence.toString(),
        content.position?.page?.toString() ?? '',
        content.position?.paragraph?.toString() ?? '',
        content.tableData ? 'Yes' : 'No',
      ];
      rows.push(this.escapeCsvRow(row));
    }

    // Add metadata as comments if requested
    if (options.includeMetadata) {
      const metadataRows = [
        '',
        '# Metadata',
        `# File Name: ${result.metadata.fileName}`,
        `# File Type: ${result.metadata.fileType}`,
        `# Extracted At: ${result.metadata.extractedAt.toISOString()}`,
        `# Total Pages: ${result.metadata.totalPages ?? 'N/A'}`,
        `# Total Paragraphs: ${result.metadata.totalParagraphs ?? 'N/A'}`,
      ];
      rows.push(...metadataRows);

      if (result.summary) {
        rows.push('');
        rows.push('# Summary');
        rows.push(`# Total Items: ${result.summary.totalItems}`);
        rows.push('# By Type:');
        for (const [type, count] of Object.entries(result.summary.byType)) {
          rows.push(`#   ${type}: ${count}`);
        }
      }
    }

    return rows.join('\n');
  }

  /**
   * Escape a CSV row
   */
  private escapeCsvRow(row: string[]): string {
    return row
      .map((cell) => {
        // Escape quotes and wrap in quotes if necessary
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      })
      .join(',');
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats(): ExportFormat[] {
    return [ExportFormat.CSV];
  }
}
