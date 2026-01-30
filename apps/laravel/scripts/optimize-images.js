import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_DIR = join(__dirname, '../public/img');
const OUTPUT_DIR = join(__dirname, '../public/img/optimized');

// Configuration for different image types
const CAROUSEL_SIZES = [400, 760, 1050];
const BANNER_SIZES = [640, 1024, 1440, 1920];

const FORMATS = [
  { ext: 'avif', options: { quality: 65, effort: 4 } },
  { ext: 'webp', options: { quality: 80 } },
  { ext: 'jpg', options: { quality: 85, mozjpeg: true } }
];

async function ensureOutputDir() {
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Output directory ready: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('Failed to create output directory:', error);
    throw error;
  }
}

async function optimizeImage(inputPath, outputName, sizes) {
  console.log(`\nProcessing: ${outputName}`);
  let count = 0;

  for (const width of sizes) {
    for (const format of FORMATS) {
      const outputPath = join(OUTPUT_DIR, `${outputName}-${width}w.${format.ext}`);

      try {
        const image = sharp(inputPath);

        // Resize and optimize
        await image
          .resize(width, null, { withoutEnlargement: true })
          .toFormat(format.ext, format.options)
          .toFile(outputPath);

        count++;
        process.stdout.write('.');
      } catch (error) {
        console.error(`\n✗ Failed to generate ${outputPath}:`, error.message);
      }
    }
  }

  console.log(`\n✓ Generated ${count} variants for ${outputName}`);
  return count;
}

async function processImages() {
  console.log('🖼️  Starting image optimization...\n');

  await ensureOutputDir();

  let totalFiles = 0;

  // Process carousel images (1-6.jpg)
  console.log('\n📸 Processing carousel images...');
  for (let i = 1; i <= 6; i++) {
    const inputPath = join(INPUT_DIR, `${i}.jpg`);
    totalFiles += await optimizeImage(inputPath, `${i}`, CAROUSEL_SIZES);
  }

  // Process banner image
  console.log('\n🎨 Processing banner image...');
  const bannerPath = join(INPUT_DIR, 'banner.jpg');
  totalFiles += await optimizeImage(bannerPath, 'banner', BANNER_SIZES);

  console.log(`\n\n✨ Optimization complete!`);
  console.log(`📊 Total files generated: ${totalFiles}`);
  console.log(`📁 Output location: ${OUTPUT_DIR}`);
}

// Run the optimization
processImages().catch(error => {
  console.error('❌ Optimization failed:', error);
  process.exit(1);
});
