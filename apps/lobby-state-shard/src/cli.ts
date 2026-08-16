import { runMatchStateShardApp } from "./index.js";

const streamPassword = process.argv[2] ?? ""
const updatePassword = process.argv[3] ?? ""
void runMatchStateShardApp(streamPassword, updatePassword)
