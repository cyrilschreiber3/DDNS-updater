export default defineEventHandler(async () => {
    const data = await useStorage().getItem('db:providers')
    return { data: data }
})