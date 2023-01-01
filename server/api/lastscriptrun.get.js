export default defineEventHandler(async () => {
    const data = await useStorage().getItem('db:lastScriptRun')
    return { data: data.lastRun }
})