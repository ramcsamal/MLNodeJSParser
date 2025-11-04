import XLSX from 'xlsx';
import {
  IExporter,
  ExtractionResult,
  ExportOptions,
  ExportFormat,
  ExtractedContent,
} from '../types/index.js';
import { StructuredDataExtractor } from '../utils/StructuredDataExtractor.js';

export class ExcelExporter implements IExporter {
  private structuredExtractor: StructuredDataExtractor;

  constructor() {
    this.structuredExtractor = new StructuredDataExtractor();
  }

  /**
   * Export extraction results to Excel format
   */
  async export(
    result: ExtractionResult,
    options: ExportOptions
  ): Promise<void> {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Add metadata sheet if requested
      if (options.includeMetadata) {
        this.addMetadataSheet(workbook, result);
      }

      // Add main data sheet with all extractions
      this.addMainDataSheet(workbook, result);

      // Add tables sheet
      this.addTablesSheet(workbook, result);

      // Add structured data sheet (Country, TripType, etc.)
      this.addStructuredDataSheet(workbook, result);

      // Add summary sheet
      this.addSummarySheet(workbook, result);

      // Write to file
      XLSX.writeFile(workbook, options.outputPath);

      console.log(`Exported to Excel: ${options.outputPath}`);
    } catch (error) {
      throw new Error(
        `Failed to export to Excel: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Add metadata sheet
   */
  private addMetadataSheet(
    workbook: XLSX.WorkBook,
    result: ExtractionResult
  ): void {
    const data = [
      ['Property', 'Value'],
      ['File Name', result.metadata.fileName],
      ['File Type', result.metadata.fileType],
      ['Extracted At', result.metadata.extractedAt.toISOString()],
      [
        'Total Pages',
        result.metadata.totalPages?.toString() || 'N/A',
      ],
      [
        'Total Paragraphs',
        result.metadata.totalParagraphs?.toString() || 'N/A',
      ],
      ['Total Extracted Items', result.contents.length.toString()],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    this.autoSizeColumns(worksheet, data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Metadata');
  }

  /**
   * Add main data sheet with all extractions
   */
  private addMainDataSheet(
    workbook: XLSX.WorkBook,
    result: ExtractionResult
  ): void {
    const data = [
      ['ID', 'Type', 'Content', 'Confidence', 'Page', 'Paragraph'],
      ...result.contents.map((content) => [
        content.id,
        content.type,
        content.content,
        content.confidence,
        content.position?.page?.toString() || '',
        content.position?.paragraph?.toString() || '',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    this.autoSizeColumns(worksheet, data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Data');
  }

  /**
   * Add tables sheet with extracted tables
   */
  private addTablesSheet(
    workbook: XLSX.WorkBook,
    result: ExtractionResult
  ): void {
    const tables = result.contents.filter((c) => c.tableData);

    if (tables.length === 0) {
      // Add empty sheet with message
      const data = [['No tables found in document']];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tables');
      return;
    }

    // Each table gets its own section
    const allData: any[][] = [];

    tables.forEach((table, index) => {
      // Add table header
      allData.push([`Table ${index + 1}`]);
      allData.push([]); // Empty row

      // Add headers if available
      if (table.tableData?.headers) {
        allData.push(table.tableData.headers);
      }

      // Add rows
      if (table.tableData?.rows) {
        allData.push(...table.tableData.rows);
      }

      // Add separator
      allData.push([]);
      allData.push([]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(allData);
    this.autoSizeColumns(worksheet, allData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tables');
  }

  /**
   * Add structured data sheet (Country, TripType, etc.)
   * This extracts patterns like "Country: India, US, China"
   */
  private addStructuredDataSheet(
    workbook: XLSX.WorkBook,
    result: ExtractionResult
  ): void {
    // Extract all text content
    const texts = result.contents.map((c) => c.content);

    // Extract structured fields
    const structuredData = this.structuredExtractor.extractToExcelFormat(texts);

    if (structuredData.length === 0) {
      // Add empty sheet with message
      const data = [['No structured key-value data found']];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Structured Data');
      return;
    }

    // Convert to array format
    const keys = Object.keys(structuredData[0]);
    const data = [
      keys, // Headers
      ...structuredData.map((row) => keys.map((key) => row[key])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    this.autoSizeColumns(worksheet, data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Structured Data');
  }

  /**
   * Add summary sheet
   */
  private addSummarySheet(
    workbook: XLSX.WorkBook,
    result: ExtractionResult
  ): void {
    if (!result.summary) {
      return;
    }

    const data = [
      ['Content Type', 'Count'],
      ...Object.entries(result.summary.byType).map(([type, count]) => [
        type,
        count,
      ]),
      [],
      ['Total Items', result.summary.totalItems],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    this.autoSizeColumns(worksheet, data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
  }

  /**
   * Auto-size columns based on content
   */
  private autoSizeColumns(worksheet: XLSX.WorkSheet, data: any[][]): void {
    const colWidths: number[] = [];

    data.forEach((row) => {
      row.forEach((cell, colIndex) => {
        const cellValue = cell?.toString() || '';
        const cellLength = cellValue.length;
        colWidths[colIndex] = Math.max(
          colWidths[colIndex] || 10,
          Math.min(cellLength + 2, 50) // Max 50 chars width
        );
      });
    });

    worksheet['!cols'] = colWidths.map((width) => ({ width }));
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats(): ExportFormat[] {
    return [ExportFormat.XLSX];
  }
}
