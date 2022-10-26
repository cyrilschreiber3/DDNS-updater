import { spawn } from 'child_process';
export default defineEventHandler(async (event) => {
    const ls = spawn("python3", ["../services/updater.py"]);
    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    })
    return ls.stdout.on("data", data => {
        return { stdout: data }
    });
})