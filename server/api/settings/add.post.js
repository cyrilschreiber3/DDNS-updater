const config = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    const newDomain = await readBody(event)
    let currentDomains = await useStorage().getItem(config.databaseName + ':subdomainList')
    if (currentDomains === null) {
        currentDomains = []
    }
    const domainExists = currentDomains.find(domain => domain.url === newDomain.url)

    if (domainExists) {
        return { data: { status: 400, message: 'Domain already exists' } }
    } else {
        currentDomains.push(newDomain);
        await useStorage().setItem(config.databaseName + ':subdomainList', currentDomains);
        return { data: { status: 200, message: 'Domain added' } }
    }
})