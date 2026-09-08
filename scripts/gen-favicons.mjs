import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(__dirname, "../public/favicon.svg"));
const out = (name) => join(__dirname, "../public", name);

const sizes = [
  { file: "favicon-16.png",      size: 16  },
  { file: "favicon-32.png",      size: 32  },
  { file: "apple-touch-icon.png",size: 180 },
  { file: "favicon-192.png",     size: 192 },
  { file: "favicon-512.png",     size: 512 },
];

for (const { file, size } of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(out(file));
  console.log(`✓ ${file} (${size}×${size})`);
}
