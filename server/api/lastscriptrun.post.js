export default defineEventHandler(async (event) => {
    const newRunTime = await readBody(event)
    const data = await useStorage().setItem('db:lastScriptRun', newRunTime)
    return { data: { status: 200, message: 'Run time updated' } }
})