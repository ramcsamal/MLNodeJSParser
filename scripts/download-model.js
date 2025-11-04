/**
 * Script to download the ML model for offline use
 * Run with: node scripts/download-model.js
 */

import { pipeline, env } from '@xenova/transformers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure cache directory
const cacheDir = path.join(__dirname, '..', 'models');
env.cacheDir = cacheDir;
env.allowLocalModels = true;
env.useBrowserCache = false;

// Disable SSL verification for downloads
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const MODEL_NAME = 'Xenova/distilbert-base-uncased-mnli';

async function downloadModel() {
  console.log('='.repeat(60));
  console.log('Downloading ML Model for Document Extraction');
  console.log('='.repeat(60));
  console.log(`Model: ${MODEL_NAME}`);
  console.log(`Cache directory: ${cacheDir}`);
  console.log('');

  try {
    console.log('Starting download...');
    console.log('This may take several minutes (model is ~250MB)');
    console.log('');

    const classifier = await pipeline('zero-shot-classification', MODEL_NAME, {
      progress_callback: (progress) => {
        if (progress.status === 'progress') {
          const percent = Math.round(progress.progress || 0);
          const file = progress.file || 'unknown';
          process.stdout.write(`\rDownloading: ${file.padEnd(40)} ${percent}%`);
        } else if (progress.status === 'done') {
          console.log(`\n✓ Downloaded: ${progress.file}`);
        }
      }
    });

    console.log('');
    console.log('='.repeat(60));
    console.log('✓ Model downloaded successfully!');
    console.log('='.repeat(60));
    console.log(`Location: ${cacheDir}`);
    console.log('');
    console.log('You can now run the application offline.');
    console.log('The model will be loaded from the local cache.');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('✗ Failed to download model');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check your internet connection');
    console.error('2. Verify you can access https://huggingface.co');
    console.error('3. Try setting NODE_TLS_REJECT_UNAUTHORIZED=0 if behind a proxy');
    console.error('4. Check firewall settings');
    process.exit(1);
  }
}

downloadModel();
