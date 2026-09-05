import sharp from "sharp";
import { readFileSync } from "fs";
import { mkdirSync } from "fs";

const svg = readFileSync("public/icons/icon.svg");

mkdirSync("public/icons", { recursive: true });

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svg).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
  console.log(`Generated icon-${size}.png`);
}

console.log("Done!");
