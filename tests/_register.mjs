// Teaches Node's test runner the "@/..." import alias that tsconfig maps to the
// project root, so lib/ modules load unchanged under `node --test`.
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./_alias-hooks.mjs", pathToFileURL(import.meta.filename));
