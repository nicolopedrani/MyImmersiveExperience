import { Buffer } from "node:buffer";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const dist = resolve("dist");
const indexPath = resolve(dist, "index.html");
const index = await readFile(indexPath, "utf8");
const assetPaths = [...index.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((path) => path?.includes("/assets/"));

let initialBytes = Buffer.byteLength(index);
for (const assetPath of new Set(assetPaths)) {
  const relativePath = assetPath.replace(/^\/MyImmersiveExperience\//, "");
  initialBytes += (await stat(resolve(dist, relativePath))).size;
}
if (initialBytes > 1_500_000) {
  throw new Error(`Initial HTML/CSS/JS is ${initialBytes} bytes; the limit is 1,500,000.`);
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => (entry.isDirectory() ? collectFiles(resolve(directory, entry.name)) : resolve(directory, entry.name))),
  );
  return nested.flat();
}

const files = await collectFiles(dist);
if (files.some((file) => /(?:references|\.DS_Store)(?:\/|$)/.test(file))) {
  throw new Error("Private references or system files were found in dist.");
}

const searchable = files.filter((file) => /\.(?:html|js|css|json|txt)$/i.test(file));
for (const file of searchable) {
  const text = await readFile(file, "utf8");
  if (/onnxruntime-node|global-agent|node_modules\/boolean/.test(text)) {
    throw new Error(`A Node-only AI dependency was bundled into ${file}.`);
  }
}

if (/model\.worker|\.wasm|huggingface|onnx-community/i.test(index)) {
  throw new Error("The initial HTML eagerly references the optional AI runtime.");
}

process.stdout.write(`Distribution verified: ${initialBytes} initial bytes; optional Qwen assets remain lazy.\n`);
