import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Validates meme.png and copies it to the output directory as entry.png.
 */
async function main() {
  try {
    const botDir = process.env.MAKEFUN_BOT_DIR || '/bot';
    const filePath = join(botDir, 'meme.png');
    const buffer = await readFile(filePath);

    // Verify PNG Signature: 89 50 4E 47 0D 0A 1A 0A
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    if (!buffer.subarray(0, 8).equals(signature)) throw new Error('Invalid PNG signature');

    // Verify File Size: Under 1MiB (1048576 bytes)
    if (buffer.length >= 1048576) throw new Error('File size exceeds 1MB limit');

    // Verify IHDR Dimensions: Exactly 1200x675
    // Width at offset 16, Height at offset 20
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width !== 1200 || height !== 675) {
      throw new Error(`Invalid dimensions: ${width}x${height} (expected 1200x675)`);
    }

    // Ensure output directory exists
    const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
    await mkdir(outputDir, { recursive: true });

    // Copy to output as entry.png
    await writeFile(join(outputDir, 'entry.png'), buffer);
    console.log(`Successfully validated and copied ${filePath} to ${outputDir}/entry.png`);

    // Copy POST.json byte-for-byte to the output directory
    const postJsonPath = join(botDir, 'POST.json');
    const postJsonBuffer = await readFile(postJsonPath);
    await writeFile(join(outputDir, 'POST.json'), postJsonBuffer);
    console.log(`Successfully copied ${postJsonPath} to ${outputDir}/POST.json`);

    console.log('DONE');
  } catch (error) {
    throw new Error(`Validation failed: ${error instanceof Error ? error.message : error}`);
  }
}

main();
