import sharp from "sharp";
import { fileURLToPath } from "node:url";

// One vector source keeps the header, favicon and touch icon in sync.
const source = fileURLToPath(
  new URL("../public/web3-lab-favicon.svg", import.meta.url),
);
const outputs = [
  [64, "web3-lab-favicon-64.png"],
  [180, "web3-lab-apple-touch-icon.png"],
];
for (const [size, name] of outputs) {
  const target = fileURLToPath(new URL(`../public/${name}`, import.meta.url));
  await sharp(source, { density: 288 }).resize(size, size).png().toFile(target);
  console.log(`Generated ${name} (${size} × ${size})`);
}
