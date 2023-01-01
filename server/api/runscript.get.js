import axios from 'axios';
import { performance } from 'perf_hooks';

const config = useRuntimeConfig()
console.log(config)

export default defineEventHandler(async (event) => {
    let startTime = performance.now();

    const domains = await useStorage().getItem('db:subdomainList');

    let promises = [];

    domains.forEach((domain) => {
        switch (domain.provider) {
            case 'Infomaniak (private)':
                let username = config.infomaniakPrivateUsername;
                let password = config.infomaniakPrivatePassword;
                promises.push(createInfomaniakRequest(username, password, domain.url));
                break;

            default:
                let error = `Unknown provider "${domain.provider}" (domain: ${domain.url})`;
                console.error(error);
                break;
        }
    });

    try {
        await axios.all(promises).then(axios.spread((...responses) => {
            responses.forEach(response => {
                // console.log(response.data);
            });
        }))
    } catch (error) {
        console.error(error);
        delete error.stack;
        return { error }
    }

    await useStorage().setItem('db:lastScriptRun', { "lastRun": Date.now() });

    if (config.heartbeatURL) {
        try {
            await axios.get(config.heartbeatURL).then(response => {
                console.log(response.data);
            })
        } catch (error) {
            console.error(error);
            // delete error.stack;
            return { error }
        }
    }

    let endTime = performance.now();
    let duration = endTime - startTime;
    console.log(`Duration: ${duration}ms`);

    return { status: 200, message: `Script ran successfully in ${duration} ms` }
});


//////////////////////////////////
//                              //
//  Provider-specific functions //
//                              //
//////////////////////////////////

const createInfomaniakRequest = (username, password, domain) => {
    let url = `https://infomaniak.com/nic/update`;
    let request = axios({
        method: 'get',
        url: url,
        params: {
            username: username,
            password: password,
            hostname: domain
        }
    });
    console.log(`Requesting ${url} with params: username=${username}, password=${password}, hostname=${domain}`)
    return request;
}
