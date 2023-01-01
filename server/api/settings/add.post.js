export default defineEventHandler(async (event) => {
    const newDomain = await readBody(event)
    const currentDomains = await useStorage().getItem('db:subdomainList')
    const domainExists = currentDomains.find(domain => domain.url === newDomain.url)

    if (domainExists) {
        return { data: { status: 400, message: 'Domain already exists' } }
    } else {
        currentDomains.push(newDomain);
        await useStorage().setItem('db:subdomainList', currentDomains);
        return { data: { status: 200, message: 'Domain added' } }
    }
})