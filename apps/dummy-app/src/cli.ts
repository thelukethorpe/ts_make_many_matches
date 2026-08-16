import { runApp } from "./index.js";

const name = process.argv[2] ?? "TypeScript";
console.log(runApp(name));
