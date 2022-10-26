import { spawn } from 'child_process';
export default defineEventHandler(async (event) => {
    const ls = spawn("python3", ["services/updater.py"]);
    return ls.stdout.on("data", data => {
        return { stdout: data }
    });
})