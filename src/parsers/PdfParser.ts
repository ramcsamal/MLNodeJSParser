import pdfParse from 'pdf-parse';
import { readFile } from 'fs/promises';
import { IDocumentParser, ParsedDocument, TableData } from '../types/index.js';

export class PdfParser implements IDocumentParser {
  /**
   * Parse a PDF file and extract text and tables
   */
  async parse(filePath: string): Promise<ParsedDocument> {
    try {
      const buffer = await readFile(filePath);
      const data = await pdfParse(buffer);

      const text = data.text;
      const pageCount = data.numpages;

      // Extract tables using heuristic pattern matching
      const tables = this.extractTables(text);

      return {
        text,
        tables,
        metadata: {
          pageCount,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to parse PDF file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Extract tables from PDF text using heuristic patterns
   * Note: This is a simplified approach. For more robust table extraction,
   * consider using specialized libraries like pdf-table-extractor or tabula-js
   */
  private extractTables(text: string): TableData[] {
    const tables: TableData[] = [];
    const lines = text.split('\n');

    let currentTable: string[][] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect potential table rows (lines with multiple tab/space-separated values)
      const cells = this.splitTableRow(line);

      if (cells.length >= 2) {
        // Looks like a table row
        if (!inTable) {
          inTable = true;
          currentTable = [];
        }
        currentTable.push(cells);
      } else {
        // Not a table row
        if (inTable && currentTable.length > 1) {
          // End of table - save it
          const headers = this.detectHeaders(currentTable);
          const rows = headers ? currentTable.slice(1) : currentTable;

          tables.push({
            headers,
            rows,
          });
        }
        inTable = false;
        currentTable = [];
      }
    }

    // Check for table at end of document
    if (inTable && currentTable.length > 1) {
      const headers = this.detectHeaders(currentTable);
      const rows = headers ? currentTable.slice(1) : currentTable;

      tables.push({
        headers,
        rows,
      });
    }

    return tables;
  }

  /**
   * Split a line into table cells based on whitespace
   */
  private splitTableRow(line: string): string[] {
    // Split by multiple spaces or tabs
    const cells = line
      .split(/\s{2,}|\t+/)
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

    return cells;
  }

  /**
   * Detect if the first row is a header row
   */
  private detectHeaders(table: string[][]): string[] | undefined {
    if (table.length === 0) return undefined;

    const firstRow = table[0];

    // Heuristic: Headers typically don't contain numbers or are shorter
    const looksLikeHeader = firstRow.some(
      (cell) =>
        cell.toLowerCase().includes('name') ||
        cell.toLowerCase().includes('type') ||
        cell.toLowerCase().includes('description') ||
        cell.toLowerCase().includes('value') ||
        !/\d/.test(cell)
    );

    return looksLikeHeader ? firstRow : undefined;
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['pdf'];
  }
}
