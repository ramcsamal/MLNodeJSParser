import { z } from 'zod';

// ==================== Enums ====================

export enum DocumentType {
  DOCX = 'docx',
  PDF = 'pdf',
}

export enum ContentType {
  BUSINESS_RULE = 'business_rule',
  FORMULA = 'formula',
  CONDITION = 'condition',
  DEFINITION = 'definition',
  TABLE = 'table',
  TEXT = 'text',
}

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XLSX = 'xlsx',
}

// ==================== Zod Schemas ====================

export const DocumentTypeSchema = z.enum(['docx', 'pdf']);

export const ContentTypeSchema = z.enum([
  'business_rule',
  'formula',
  'condition',
  'definition',
  'table',
  'text',
]);

export const ExportFormatSchema = z.enum(['json', 'csv', 'xlsx']);

export const TableCellSchema = z.object({
  row: z.number(),
  col: z.number(),
  content: z.string(),
});

export const TableDataSchema = z.object({
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())),
});

export const ExtractedContentSchema = z.object({
  id: z.string(),
  type: z.string(),
  content: z.string(),
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.any()).optional(),
  position: z
    .object({
      page: z.number().optional(),
      paragraph: z.number().optional(),
      line: z.number().optional(),
    })
    .optional(),
  tableData: TableDataSchema.optional(),
});

export const DocumentMetadataSchema = z.object({
  fileName: z.string(),
  fileType: DocumentTypeSchema,
  extractedAt: z.date(),
  totalPages: z.number().optional(),
  totalParagraphs: z.number().optional(),
});

export const ExtractionResultSchema = z.object({
  metadata: DocumentMetadataSchema,
  contents: z.array(ExtractedContentSchema),
  summary: z
    .object({
      totalItems: z.number(),
      byType: z.record(z.number()),
    })
    .optional(),
});

export const ClassificationResultSchema = z.object({
  label: z.string(),
  score: z.number(),
});

export const ExportOptionsSchema = z.object({
  format: ExportFormatSchema,
  outputPath: z.string(),
  includeMetadata: z.boolean().default(true),
  prettyPrint: z.boolean().default(true),
});

// ==================== TypeScript Interfaces ====================

export type TableCell = z.infer<typeof TableCellSchema>;
export type TableData = z.infer<typeof TableDataSchema>;
export type ExtractedContent = z.infer<typeof ExtractedContentSchema>;
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

// Override the format type to use the enum instead of the Zod literal
export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  includeMetadata: boolean;
  prettyPrint: boolean;
}

// ==================== Parser Interfaces ====================

export interface IDocumentParser {
  parse(filePath: string): Promise<ParsedDocument>;
  getSupportedExtensions(): string[];
}

export interface ParsedDocument {
  text: string;
  tables: TableData[];
  metadata: {
    pageCount?: number;
    paragraphCount?: number;
  };
}

// ==================== NLP Interfaces ====================

export interface IClassifier {
  classify(
    text: string,
    candidateLabels: string[]
  ): Promise<ClassificationResult[]>;
  isReady(): Promise<boolean>;
}

// ==================== Exporter Interfaces ====================

export interface IExporter {
  export(result: ExtractionResult, options: ExportOptions): Promise<void>;
  getSupportedFormats(): ExportFormat[];
}

// ==================== Configuration ====================

export interface ExtractorConfig {
  classificationLabels?: string[];
  confidenceThreshold?: number;
  enableTableExtraction?: boolean;
  modelName?: string;
}

export const ExtractorConfigSchema = z.object({
  classificationLabels: z
    .array(z.string())
    .default([
      'business_rule',
      'formula',
      'condition',
      'definition',
      'table',
      'text',
    ]),
  confidenceThreshold: z.number().min(0).max(1).default(0.5),
  enableTableExtraction: z.boolean().default(true),
  modelName: z.string().default('Xenova/distilbert-base-uncased-mnli'),
});

export type ExtractorConfigType = z.infer<typeof ExtractorConfigSchema>;
