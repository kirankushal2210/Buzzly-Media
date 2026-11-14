import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

// Lets Node's test runner load the app's TypeScript modules unchanged:
//  - "@/..." maps to the project root (tsconfig paths),
//  - extensionless relative imports inside the project probe .ts/.tsx/...,
//  - "next/server" resolves to the file Next ships for it.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const extensions = [".ts", ".tsx", ".mts", ".js", ".mjs", "/index.ts"];

function withExtension(base) {
  if (existsSync(base) && !isDirectory(base)) return base;
  return extensions.map(ext => base + ext).find(existsSync);
}

function isDirectory(path) {
  try { return existsSync(path) && !/\.[a-z]+$/i.test(path) && existsSync(join(path, "index.ts")); } catch { return false; }
}

export async function resolve(specifier, context, next) {
  if (specifier === "next/server") return next("next/server.js", context);
  if (specifier.startsWith("@/")) {
    const found = withExtension(join(root, specifier.slice(2)));
    if (found) return next(pathToFileURL(found).href, context);
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:") && !context.parentURL.includes("/node_modules/")) {
    const base = fileURLToPath(new URL(specifier, context.parentURL));
    if (!/\.[a-z]+$/i.test(base)) {
      const found = withExtension(base);
      if (found) return next(pathToFileURL(found).href, context);
    }
  }
  return next(specifier, context);
}
