import { runMatchStateShardApp } from "./index.js";

const password = process.argv[2] ?? ""
void runMatchStateShardApp(password)
