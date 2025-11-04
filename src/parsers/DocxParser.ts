import PizZip from 'pizzip';
import { readFile } from 'fs/promises';
import { IDocumentParser, ParsedDocument, TableData } from '../types/index.js';

export class DocxParser implements IDocumentParser {
  /**
   * Parse a .docx file and extract text and tables
   */
  async parse(filePath: string): Promise<ParsedDocument> {
    try {
      const buffer = await readFile(filePath);

      // Extract text from DOCX
      const text = await this.extractText(buffer);

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
   * Extract text from DOCX file using PizZip
   */
  private async extractText(buffer: Buffer): Promise<string> {
    try {
      const zip = new PizZip(buffer);
      const xml = zip.file('word/document.xml')?.asText();

      if (!xml) {
        throw new Error('Could not find document.xml in DOCX file');
      }

      // Extract text from XML
      let text = xml.replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, '$1');
      text = text.replace(/<w:p[^>]*>/g, '\n'); // Paragraphs
      text = text.replace(/<[^>]+>/g, ''); // Remove remaining XML tags
      text = text.replace(/\n+/g, '\n').trim();

      return text;
    } catch (error) {
      throw new Error(
        `Failed to extract text: ${
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
      const zip = new PizZip(buffer);
      const xml = zip.file('word/document.xml')?.asText();

      if (!xml) {
        return [];
      }

      const tables: TableData[] = [];

      // Extract tables using regex
      const tableRegex = /<w:tbl[^>]*>([\s\S]*?)<\/w:tbl>/gi;
      let tableMatch;

      while ((tableMatch = tableRegex.exec(xml)) !== null) {
        const tableXml = tableMatch[1];
        const rows: string[][] = [];

        // Extract rows
        const rowRegex = /<w:tr[^>]*>([\s\S]*?)<\/w:tr>/gi;
        let rowMatch;

        while ((rowMatch = rowRegex.exec(tableXml)) !== null) {
          const rowXml = rowMatch[1];
          const cells: string[] = [];

          // Extract cells
          const cellRegex = /<w:tc[^>]*>([\s\S]*?)<\/w:tc>/gi;
          let cellMatch;

          while ((cellMatch = cellRegex.exec(rowXml)) !== null) {
            const cellXml = cellMatch[1];
            const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
            let cellText = '';
            let textMatch;

            while ((textMatch = textRegex.exec(cellXml)) !== null) {
              cellText += textMatch[1];
            }

            cells.push(cellText.trim());
          }

          if (cells.length > 0) {
            rows.push(cells);
          }
        }

        if (rows.length > 0) {
          // Assume first row is header
          const headers = rows[0];
          const dataRows = rows.slice(1);

          if (dataRows.length > 0) {
            tables.push({ headers, rows: dataRows });
          } else {
            tables.push({ rows });
          }
        }
      }

      return tables;
    } catch (error) {
      console.warn('Failed to extract tables:', error);
      return [];
    }
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['docx'];
  }
}
