import { defineEventHandler } from 'h3';
import axios from 'axios';
import { performance } from 'perf_hooks';
import { u as useStorage, a as useRuntimeConfig } from './nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'http';
import 'https';
import 'destr';
import 'ohmyfetch';
import 'unenv/runtime/fetch/index';
import 'hookable';
import 'scule';
import 'ohash';
import 'ufo';
import 'unstorage';
import 'unstorage/drivers/redis';
import 'unstorage/drivers/fs';
import 'defu';
import 'radix3';
import 'fs';
import 'pathe';
import 'url';

const config = useRuntimeConfig();
const runscript_get = defineEventHandler(async (event) => {
  let startTime = performance.now();
  const domains = await useStorage().getItem(config.databaseName + ":subdomainList");
  if (domains == null || domains.length == 0) {
    return { status: 500, message: `No domains found` };
  }
  let promises = [];
  domains.forEach((domain) => {
    switch (domain.provider) {
      case "Infomaniak (private)":
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
      responses.forEach((response) => {
        console.log(`Respone from ${response.config.url} for hostname "${response.config.params.hostname}": ${response.data}`);
      });
    }));
  } catch (error) {
    console.error(error);
    if (error.response.data == "badauth") {
      return { status: 401, message: `Authentication failed for hostname "${error.response.config.params.hostname}"` };
    }
    delete error.stack;
    return { status: 500, message: `Error while updating domain ${error.response.config.params.hostname}`, error };
  }
  await useStorage().setItem(config.databaseName + ":lastScriptRun", { "lastRun": Date.now() });
  if (config.heartbeatURL) {
    try {
      await axios.get(config.heartbeatURL).then((response) => {
        if (response.data) {
          console.log(response.data);
        }
      });
    } catch (error) {
      console.error(error);
      return { error };
    }
  }
  let endTime = performance.now();
  let duration = endTime - startTime;
  console.log(`Duration: ${duration}ms`);
  return { status: 200, message: `Script ran successfully in ${duration} ms` };
});
const createInfomaniakRequest = (username, password, domain) => {
  let url = `https://infomaniak.com/nic/update`;
  let request = axios({
    method: "get",
    url,
    params: {
      username,
      password,
      hostname: domain
    }
  });
  let hidenPassword = password.replace(/./g, "*");
  console.log(`Requesting ${url} with params: username=${username}, password=${hidenPassword}, hostname=${domain}`);
  return request;
};

export { runscript_get as default };
//# sourceMappingURL=runscript.get.mjs.map
