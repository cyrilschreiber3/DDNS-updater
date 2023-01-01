import { defineEventHandler } from 'h3';
import { u as useStorage } from './nitro/node-server.mjs';
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

const providers_get = defineEventHandler(async () => {
  const data = await useStorage().getItem("file:providers");
  return { data };
});

export { providers_get as default };
//# sourceMappingURL=providers.get.mjs.map
