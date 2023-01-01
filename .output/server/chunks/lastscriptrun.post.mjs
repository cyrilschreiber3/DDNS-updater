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
const lastscriptrun_post = defineEventHandler(async (event) => {
  const newRunTime = await readBody(event);
  await useStorage().setItem(config.databaseName + ":lastScriptRun", newRunTime);
  return { data: { status: 200, message: "Run time updated" } };
});

export { lastscriptrun_post as default };
//# sourceMappingURL=lastscriptrun.post.mjs.map
