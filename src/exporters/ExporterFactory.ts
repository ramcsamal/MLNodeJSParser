import { IExporter, ExportFormat } from '../types/index.js';
import { JsonExporter } from './JsonExporter.js';
import { CsvExporter } from './CsvExporter.js';
import { ExcelExporter } from './ExcelExporter.js';

export class ExporterFactory {
  private static exporters: Map<ExportFormat, IExporter> = new Map<ExportFormat, IExporter>([
    [ExportFormat.JSON, new JsonExporter()],
    [ExportFormat.CSV, new CsvExporter()],
    [ExportFormat.XLSX, new ExcelExporter()],
  ]);

  /**
   * Get the appropriate exporter for a format
   */
  static getExporter(format: ExportFormat): IExporter {
    const exporter = this.exporters.get(format);

    if (!exporter) {
      throw new Error(`No exporter available for format: ${format}`);
    }

    return exporter;
  }

  /**
   * Register a custom exporter
   */
  static registerExporter(format: ExportFormat, exporter: IExporter): void {
    this.exporters.set(format, exporter);
  }

  /**
   * Get all supported formats
   */
  static getSupportedFormats(): ExportFormat[] {
    return Array.from(this.exporters.keys());
  }
}
