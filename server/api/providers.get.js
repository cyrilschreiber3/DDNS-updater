export default defineEventHandler(async () => {
    const data = await useStorage().getItem('file:providers')
    return { data: data }
})