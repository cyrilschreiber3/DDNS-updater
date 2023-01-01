const config = useRuntimeConfig()
export default defineEventHandler(async () => {
    const data = await useStorage().getItem(config.databaseName + ':lastScriptRun')
    if (!data) {
        return { data: 'Never' }
    }
    return { data: data.lastRun }
})