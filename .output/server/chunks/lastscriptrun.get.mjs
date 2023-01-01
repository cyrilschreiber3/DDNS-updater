import { defineEventHandler } from 'h3';
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
const lastscriptrun_get = defineEventHandler(async () => {
  const data = await useStorage().getItem(config.databaseName + ":lastScriptRun");
  if (!data) {
    return { data: "Never" };
  }
  return { data: data.lastRun };
});

export { lastscriptrun_get as default };
//# sourceMappingURL=lastscriptrun.get.mjs.map
