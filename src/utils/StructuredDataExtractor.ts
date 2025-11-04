/**
 * StructuredDataExtractor
 *
 * Extracts structured key-value data from text
 * Example: "Country: India, US, China" -> { Country: ['India', 'US', 'China'] }
 */

export interface StructuredField {
  key: string;
  values: string[];
  rawText: string;
}

export class StructuredDataExtractor {
  /**
   * Extract structured fields from text
   * Supports formats like:
   * - "Country: India, US, China"
   * - "TripType: OneWay, RoundTrip"
   * - "Status : Active ; Pending ; Closed"
   */
  extractFields(text: string): StructuredField[] {
    const fields: StructuredField[] = [];

    // Pattern 1: Key: Value1, Value2, Value3
    const colonPattern = /(\w+(?:\s+\w+)*)\s*:\s*([^;\n]+)/gi;
    let match;

    while ((match = colonPattern.exec(text)) !== null) {
      const key = match[1].trim();
      const valuesText = match[2].trim();

      // Split by comma, semicolon, or pipe
      const values = this.splitValues(valuesText);

      if (values.length > 0) {
        fields.push({
          key,
          values,
          rawText: match[0],
        });
      }
    }

    return fields;
  }

  /**
   * Split values by common delimiters
   */
  private splitValues(text: string): string[] {
    // Try comma first
    let values = text.split(/[,;|]/).map((v) => v.trim());

    // If only one value, try "and" or "or"
    if (values.length === 1) {
      values = text.split(/\s+(?:and|or)\s+/i).map((v) => v.trim());
    }

    return values.filter((v) => v.length > 0);
  }

  /**
   * Extract all fields from multiple text segments
   */
  extractFromMultiple(texts: string[]): StructuredField[] {
    const allFields: StructuredField[] = [];

    for (const text of texts) {
      const fields = this.extractFields(text);
      allFields.push(...fields);
    }

    return allFields;
  }

  /**
   * Merge fields with the same key
   */
  mergeFields(fields: StructuredField[]): Map<string, string[]> {
    const merged = new Map<string, string[]>();

    for (const field of fields) {
      const existing = merged.get(field.key);
      if (existing) {
        // Add unique values only
        for (const value of field.values) {
          if (!existing.includes(value)) {
            existing.push(value);
          }
        }
      } else {
        merged.set(field.key, [...field.values]);
      }
    }

    return merged;
  }

  /**
   * Convert to flat structure for Excel export
   * Each row represents one combination of values
   */
  toFlatStructure(fields: StructuredField[]): Array<Record<string, string>> {
    if (fields.length === 0) return [];

    const merged = this.mergeFields(fields);
    const keys = Array.from(merged.keys());
    const rows: Array<Record<string, string>> = [];

    // Find max number of values
    const maxValues = Math.max(...Array.from(merged.values()).map((v) => v.length));

    // Create rows
    for (let i = 0; i < maxValues; i++) {
      const row: Record<string, string> = {};
      for (const key of keys) {
        const values = merged.get(key)!;
        row[key] = values[i] || '';
      }
      rows.push(row);
    }

    return rows;
  }

  /**
   * Extract and convert to Excel-ready format
   */
  extractToExcelFormat(texts: string[]): Array<Record<string, string>> {
    const fields = this.extractFromMultiple(texts);
    return this.toFlatStructure(fields);
  }
}
