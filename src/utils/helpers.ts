import { randomUUID } from 'crypto';
import path from 'path';
import { DocumentType } from '../types/index.js';

/**
 * Generate a unique ID for extracted content
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Determine document type from file extension
 */
export function getDocumentType(filePath: string): DocumentType {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  if (ext === 'docx') {
    return DocumentType.DOCX;
  } else if (ext === 'pdf') {
    return DocumentType.PDF;
  }
  throw new Error(`Unsupported file type: ${ext}`);
}

/**
 * Clean and normalize text
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split text into sentences
 */
export function splitIntoSentences(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Split text into paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Check if text looks like a formula
 */
export function looksLikeFormula(text: string): boolean {
  const formulaPatterns = [
    /[+\-*/=()]/,
    /\b(SUM|AVG|COUNT|MAX|MIN|IF|THEN|ELSE)\b/i,
    /\d+\s*[+\-*/]\s*\d+/,
    /[A-Z]\d+/,
  ];
  return formulaPatterns.some((pattern) => pattern.test(text));
}

/**
 * Check if text looks like a condition
 */
export function looksLikeCondition(text: string): boolean {
  const conditionPatterns = [
    /\b(if|when|where|unless|provided that|in case)\b/i,
    /\b(must|should|shall|may|can|cannot)\b/i,
    /\b(and|or|not)\b/i,
    /[<>=!]+/,
  ];
  return conditionPatterns.some((pattern) => pattern.test(text));
}

/**
 * Calculate confidence score based on text characteristics
 */
export function calculateConfidence(
  text: string,
  classificationScore: number
): number {
  let confidence = classificationScore;

  // Boost confidence for longer, more structured text
  if (text.length > 100) {
    confidence = Math.min(1.0, confidence + 0.05);
  }

  // Reduce confidence for very short text
  if (text.length < 20) {
    confidence = Math.max(0.0, confidence - 0.1);
  }

  return Math.round(confidence * 100) / 100;
}

/**
 * Format date for output
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9_\-\.]/gi, '_');
}
