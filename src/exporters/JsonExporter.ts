import { writeFile } from 'fs/promises';
import {
  IExporter,
  ExtractionResult,
  ExportOptions,
  ExportFormat,
} from '../types/index.js';

export class JsonExporter implements IExporter {
  /**
   * Export extraction results to JSON format
   */
  async export(
    result: ExtractionResult,
    options: ExportOptions
  ): Promise<void> {
    try {
      // Prepare the output data
      const outputData = this.prepareOutputData(result, options);

      // Convert to JSON string
      const jsonString = options.prettyPrint
        ? JSON.stringify(outputData, null, 2)
        : JSON.stringify(outputData);

      // Write to file
      await writeFile(options.outputPath, jsonString, 'utf-8');

      console.log(`Exported to JSON: ${options.outputPath}`);
    } catch (error) {
      throw new Error(
        `Failed to export to JSON: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Prepare output data based on options
   */
  private prepareOutputData(
    result: ExtractionResult,
    options: ExportOptions
  ): any {
    const output: any = {};

    if (options.includeMetadata) {
      output.metadata = {
        fileName: result.metadata.fileName,
        fileType: result.metadata.fileType,
        extractedAt: result.metadata.extractedAt.toISOString(),
        totalPages: result.metadata.totalPages,
        totalParagraphs: result.metadata.totalParagraphs,
      };
    }

    output.contents = result.contents.map((content) => ({
      id: content.id,
      type: content.type,
      content: content.content,
      confidence: content.confidence,
      position: content.position,
      tableData: content.tableData,
      metadata: content.metadata,
    }));

    if (result.summary) {
      output.summary = result.summary;
    }

    return output;
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats(): ExportFormat[] {
    return [ExportFormat.JSON];
  }
}
