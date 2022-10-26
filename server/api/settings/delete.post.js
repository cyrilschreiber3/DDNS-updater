import fs from 'fs';

export default defineEventHandler(async (event) => {
    const domainToDelete = await readBody(event);
    const filePath = 'assets/data/data.json';
    const file = JSON.parse(fs.readFileSync(filePath));
    const currentDomains = file.sitesList;
    //check if domain.url already exists
    const domainExists = currentDomains.find(domain => domain.url === domainToDelete.url);

    if (domainExists) {
        currentDomains.splice(currentDomains.indexOf(domainToDelete));
        fs.writeFileSync(filePath, JSON.stringify(file, null, 4));
        return { data: { status: 200, message: 'Domain deleted' } }
    } else {
        return { data: { status: 400, message: 'Domain doesn\'t exist' } }
    }
})