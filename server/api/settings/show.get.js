export default defineEventHandler(async () => {
    const data = await useStorage().getItem('db:subdomainList')
    return { data: data }
})