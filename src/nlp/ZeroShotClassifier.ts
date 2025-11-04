import { pipeline, env } from '@xenova/transformers';
import { IClassifier, ClassificationResult } from '../types/index.js';

// Configure transformers environment
env.allowLocalModels = true;
env.useBrowserCache = false;

// Disable SSL verification for model downloads (for corporate networks)
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export class ZeroShotClassifier implements IClassifier {
  private classifier: any = null;
  private modelName: string;
  private isInitialized: boolean = false;

  constructor(modelName: string = 'Xenova/distilbert-base-uncased-mnli') {
    this.modelName = modelName;
  }

  /**
   * Initialize the classifier model
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log(`Loading model: ${this.modelName}...`);
      this.classifier = await pipeline(
        'zero-shot-classification',
        this.modelName,
        {
          // Add retry logic
          progress_callback: (progress: any) => {
            if (progress.status === 'progress') {
              console.log(`Downloading: ${progress.file} - ${Math.round(progress.progress)}%`);
            }
          }
        }
      );
      this.isInitialized = true;
      console.log('Model loaded successfully');
    } catch (error) {
      throw new Error(
        `Failed to initialize classifier: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Classify text using zero-shot classification
   */
  async classify(
    text: string,
    candidateLabels: string[]
  ): Promise<ClassificationResult[]> {
    await this.initialize();

    if (!this.classifier) {
      throw new Error('Classifier not initialized');
    }

    if (text.trim().length === 0) {
      return candidateLabels.map((label) => ({ label, score: 0 }));
    }

    try {
      const result = await this.classifier(text, candidateLabels, {
        multi_label: false,
      });

      // Transform result to our format
      const classifications: ClassificationResult[] = [];

      if (Array.isArray(result.labels)) {
        for (let i = 0; i < result.labels.length; i++) {
          classifications.push({
            label: result.labels[i],
            score: result.scores[i],
          });
        }
      }

      return classifications;
    } catch (error) {
      console.error('Classification error:', error);
      // Return default scores if classification fails
      return candidateLabels.map((label) => ({ label, score: 0 }));
    }
  }

  /**
   * Check if the classifier is ready
   */
  async isReady(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.isInitialized;
  }

  /**
   * Batch classify multiple texts
   */
  async classifyBatch(
    texts: string[],
    candidateLabels: string[]
  ): Promise<ClassificationResult[][]> {
    const results: ClassificationResult[][] = [];

    for (const text of texts) {
      const result = await this.classify(text, candidateLabels);
      results.push(result);
    }

    return results;
  }
}
