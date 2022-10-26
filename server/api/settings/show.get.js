import fs from 'fs';

export default defineEventHandler(() => {
    let rawdata = fs.readFileSync('public/data/data.json');
    let settings = JSON.parse(rawdata);
    return { data: settings }
})