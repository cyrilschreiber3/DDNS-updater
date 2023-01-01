const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    const domainToDelete = await readBody(event);
    const currentDomains = await useStorage().getItem(config.databaseName + ':subdomainList')
    //check if domain.url already exists
    const domainExists = currentDomains.find(domain => domain.url === domainToDelete.url);

    if (domainExists) {
        currentDomains.splice(currentDomains.indexOf(domainToDelete));
        await useStorage().setItem(config.databaseName + ':subdomainList', currentDomains);
        return { data: { status: 200, message: 'Domain deleted' } }
    } else {
        return { data: { status: 400, message: 'Domain doesn\'t exist' } }
    }
})