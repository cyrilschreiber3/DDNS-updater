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
const delete_post = defineEventHandler(async (event) => {
  const domainToDelete = await readBody(event);
  const currentDomains = await useStorage().getItem(config.databaseName + ":subdomainList");
  const domainExists = currentDomains.find((domain) => domain.url === domainToDelete.url);
  if (domainExists) {
    currentDomains.splice(currentDomains.indexOf(domainToDelete));
    await useStorage().setItem(config.databaseName + ":subdomainList", currentDomains);
    return { data: { status: 200, message: "Domain deleted" } };
  } else {
    return { data: { status: 400, message: "Domain doesn't exist" } };
  }
});

export { delete_post as default };
//# sourceMappingURL=delete.post.mjs.map
