import { defineEventHandler, readBody } from 'h3';
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
const add_post = defineEventHandler(async (event) => {
  const newDomain = await readBody(event);
  let currentDomains = await useStorage().getItem(config.databaseName + ":subdomainList");
  if (currentDomains === null) {
    currentDomains = [];
  }
  const domainExists = currentDomains.find((domain) => domain.url === newDomain.url);
  if (domainExists) {
    return { data: { status: 400, message: "Domain already exists" } };
  } else {
    currentDomains.push(newDomain);
    await useStorage().setItem(config.databaseName + ":subdomainList", currentDomains);
    return { data: { status: 200, message: "Domain added" } };
  }
});

export { add_post as default };
//# sourceMappingURL=add.post.mjs.map
