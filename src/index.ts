// Main exports
export { DocumentExtractor } from './DocumentExtractor.js';

// Type exports
export {
  DocumentType,
  ContentType,
  ExportFormat,
  ExtractedContent,
  ExtractionResult,
  DocumentMetadata,
  ExportOptions,
  TableData,
  ClassificationResult,
  ExtractorConfigType,
  IDocumentParser,
  IClassifier,
  IExporter,
  ParsedDocument,
} from './types/index.js';

// Parser exports
export { DocxParser, PdfParser, ParserFactory } from './parsers/index.js';

// NLP exports
export { ZeroShotClassifier, ContentAnalyzer } from './nlp/index.js';

// Exporter exports
export {
  JsonExporter,
  CsvExporter,
  ExcelExporter,
  ExporterFactory,
} from './exporters/index.js';

// Utility exports
export {
  generateId,
  getDocumentType,
  normalizeText,
  splitIntoSentences,
  splitIntoParagraphs,
  looksLikeFormula,
  looksLikeCondition,
  calculateConfidence,
} from './utils/helpers.js';

export {
  StructuredDataExtractor,
  type StructuredField,
} from './utils/StructuredDataExtractor.js';
