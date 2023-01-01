const config = useRuntimeConfig()
export default defineEventHandler(async () => {
    const data = await useStorage().getItem(config.databaseName + ':subdomainList')
    return { data: data }
})