// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    buildModules: ['@nuxtjs/tailwindcss'],
    nitro: {
        storage: {
            'redis': {
                driver: 'redis',
                port: process.env.REDIS_PORT,
                host: process.env.REDIS_HOST,
                username: process.env.REDIS_USERNAME, // needs Redis >= 6
                password: process.env.REDIS_PASSWORD,
                db: 0,
                tls: {}
            },
            'db': {
                driver: 'fs',
                base: './data/db'
            }
        }
    },
    runtimeConfig: {
        infomaniakPrivateUsername: '',
        infomaniakPrivatePassword: '',
        heartbeatURL: ''
    },
})
