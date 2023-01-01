import axios from 'axios';
import { performance } from 'perf_hooks';

const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
    let startTime = performance.now();

    const domains = await useStorage().getItem(config.databaseName + ':subdomainList');

    if (domains == null || domains.length == 0) {
        return { status: 500, message: `No domains found` }
    }

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
                console.log(`Respone from ${response.config.url} for hostname "${response.config.params.hostname}": ${response.data}`)
                // console.log(response.data);
            });
        }))
    } catch (error) {
        console.error(error);

        if (error.response.data == 'badauth') {
            return { status: 401, message: `Authentication failed for hostname "${error.response.config.params.hostname}"` }
        }

        delete error.stack;
        return { status: 500, message: `Error while updating domain ${error.response.config.params.hostname}`, error }
    }

    await useStorage().setItem(config.databaseName + ':lastScriptRun', { "lastRun": Date.now() });

    if (config.heartbeatURL) {
        try {
            await axios.get(config.heartbeatURL).then(response => {
                if (response.data) {
                    console.log(response.data);
                }
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
    let hidenPassword = password.replace(/./g, '*');
    console.log(`Requesting ${url} with params: username=${username}, password=${hidenPassword}, hostname=${domain}`)
    return request;
}
