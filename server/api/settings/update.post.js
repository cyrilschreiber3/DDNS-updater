import fs from 'fs';

export default defineEventHandler(async (event) => {
    const newDomain = await readBody(event);
    const filePath = 'public/data/data.json';
    const file = JSON.parse(fs.readFileSync(filePath));
    const currentDomains = file.sitesList;
    //check if domain.url already exists
    const domainExists = currentDomains.find(domain => domain.url === newDomain.url);

    if (domainExists) {
        return { data: { status: 400, message: 'Domain already exists' } }
    } else {
        currentDomains.push(newDomain);
        fs.writeFileSync(filePath, JSON.stringify(file, null, 4));
        return { data: { status: 200, message: 'Domain added' } }
    }
})