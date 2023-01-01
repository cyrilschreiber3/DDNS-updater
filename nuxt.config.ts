// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    buildModules: ['@nuxtjs/tailwindcss'],
    nitro: {
        storage: {
            'redis': {
                driver: 'redis',
                port: 6379,
                host: 'updater-database',
                // host: '192.168.1.125',
                username: '', // needs Redis >= 6
                password: '',
            },
            'file': {
                driver: 'fs',
                base: '/usr/src/app/data/db'
            }
        },
        devStorage: {
            'redis': {
                driver: 'redis',
                port: 6379,
                host: '192.168.1.125',
                username: '', // needs Redis >= 6
                password: '',
            },
            'file': {
                driver: 'fs',
                base: './data/db'
            }
        }
    },
    runtimeConfig: {
        databaseName: '',
        infomaniakPrivateUsername: '',
        infomaniakPrivatePassword: '',
        heartbeatURL: '',
    },
})
