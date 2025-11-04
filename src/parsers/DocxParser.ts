import mammoth from 'mammoth';
import { readFile } from 'fs/promises';
import { IDocumentParser, ParsedDocument, TableData } from '../types/index.js';

export class DocxParser implements IDocumentParser {
  /**
   * Parse a .docx file and extract text and tables
   */
  async parse(filePath: string): Promise<ParsedDocument> {
    try {
      const buffer = await readFile(filePath);

      // Extract text with Mammoth
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      // Count paragraphs (simple heuristic)
      const paragraphCount = text.split('\n\n').filter((p) => p.trim()).length;

      // Extract tables
      const tables = await this.extractTables(buffer);

      return {
        text,
        tables,
        metadata: {
          paragraphCount,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to parse DOCX file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Extract tables from DOCX file
   */
  private async extractTables(buffer: Buffer): Promise<TableData[]> {
    try {
      // Use Mammoth to convert to HTML to extract table structure
      const htmlResult = await mammoth.convertToHtml({ buffer });
      const html = htmlResult.value;

      const tables: TableData[] = [];

      // Simple regex-based table extraction from HTML
      const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
      let tableMatch;

      while ((tableMatch = tableRegex.exec(html)) !== null) {
        const tableHtml = tableMatch[1];
        const rows: string[][] = [];
        let headers: string[] | undefined;

        // Extract header row
        const theadRegex = /<thead[^>]*>([\s\S]*?)<\/thead>/i;
        const theadMatch = theadRegex.exec(tableHtml);

        if (theadMatch) {
          const headerRow = this.extractRowCells(theadMatch[1]);
          if (headerRow.length > 0) {
            headers = headerRow;
          }
        }

        // Extract body rows
        const tbodyRegex = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i;
        const tbodyMatch = tbodyRegex.exec(tableHtml);
        const bodyHtml = tbodyMatch ? tbodyMatch[1] : tableHtml;

        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        let rowMatch;

        while ((rowMatch = rowRegex.exec(bodyHtml)) !== null) {
          const cells = this.extractRowCells(rowMatch[1]);
          if (cells.length > 0) {
            rows.push(cells);
          }
        }

        if (rows.length > 0) {
          tables.push({ headers, rows });
        }
      }

      return tables;
    } catch (error) {
      console.warn('Failed to extract tables:', error);
      return [];
    }
  }

  /**
   * Extract cells from a table row HTML
   */
  private extractRowCells(rowHtml: string): string[] {
    const cells: string[] = [];
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      const cellContent = cellMatch[1]
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      cells.push(cellContent);
    }

    return cells;
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['docx'];
  }
}
