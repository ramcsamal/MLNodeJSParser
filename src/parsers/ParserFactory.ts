import { IDocumentParser } from '../types/index.js';
import { DocxParser } from './DocxParser.js';
import { PdfParser } from './PdfParser.js';
import { getDocumentType } from '../utils/helpers.js';
import { DocumentType } from '../types/index.js';

export class ParserFactory {
  private static parsers: Map<DocumentType, IDocumentParser> = new Map<DocumentType, IDocumentParser>([
    [DocumentType.DOCX, new DocxParser()],
    [DocumentType.PDF, new PdfParser()],
  ]);

  /**
   * Get the appropriate parser for a file
   */
  static getParser(filePath: string): IDocumentParser {
    const docType = getDocumentType(filePath);
    const parser = this.parsers.get(docType);

    if (!parser) {
      throw new Error(`No parser available for document type: ${docType}`);
    }

    return parser;
  }

  /**
   * Register a custom parser
   */
  static registerParser(docType: DocumentType, parser: IDocumentParser): void {
    this.parsers.set(docType, parser);
  }

  /**
   * Get all supported extensions
   */
  static getSupportedExtensions(): string[] {
    const extensions: string[] = [];
    this.parsers.forEach((parser) => {
      extensions.push(...parser.getSupportedExtensions());
    });
    return extensions;
  }
}
