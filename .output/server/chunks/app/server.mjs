import { version, getCurrentInstance, defineComponent, computed, ref, h, resolveComponent, reactive, useSSRContext, createApp, toRef, isRef, defineAsyncComponent, provide, onErrorCaptured, unref, mergeProps, withCtx, createTextVNode, createVNode, openBlock, createBlock, withDirectives, vShow, toDisplayString, createCommentVNode, Fragment, renderList, inject, nextTick, watchEffect } from 'vue';
import { $fetch as $fetch$1 } from 'ohmyfetch';
import { createHooks } from 'hookable';
import { getContext } from 'unctx';
import { hasProtocol, isEqual, parseURL, joinURL, stringifyParsedURL, stringifyQuery, parseQuery } from 'ufo';
import { createError as createError$1, sendRedirect } from 'h3';
import { defuFn } from 'defu';
import { resolveUnref } from '@vueuse/shared';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderSlot } from 'vue/server-renderer';
import axios from 'axios';
import { a as useRuntimeConfig$1 } from '../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'http';
import 'https';
import 'destr';
import 'unenv/runtime/fetch/index';
import 'scule';
import 'ohash';
import 'unstorage';
import 'unstorage/drivers/redis';
import 'unstorage/drivers/fs';
import 'radix3';
import 'fs';
import 'pathe';
import 'url';

const appConfig = useRuntimeConfig$1().app;
const baseURL = () => appConfig.baseURL;
const nuxtAppCtx = getContext("nuxt-app");
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    provide: void 0,
    globalName: "nuxt",
    payload: reactive({
      data: {},
      state: {},
      _errors: {},
      ...{ serverRendered: true }
    }),
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: {},
    ...options
  };
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  {
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext.nuxt = nuxtApp;
    }
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    if (nuxtApp.ssrContext.payload) {
      Object.assign(nuxtApp.payload, nuxtApp.ssrContext.payload);
    }
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.payload.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  const compatibilityConfig = new Proxy(runtimeConfig, {
    get(target, prop) {
      var _a;
      if (prop === "public") {
        return target.public;
      }
      return (_a = target[prop]) != null ? _a : target.public[prop];
    },
    set(target, prop, value) {
      {
        return false;
      }
    }
  });
  nuxtApp.provide("config", compatibilityConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin !== "function") {
    return;
  }
  const { provide: provide2 } = await callWithNuxt(nuxtApp, plugin, [nuxtApp]) || {};
  if (provide2 && typeof provide2 === "object") {
    for (const key in provide2) {
      nuxtApp.provide(key, provide2[key]);
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  for (const plugin of plugins2) {
    await applyPlugin(nuxtApp, plugin);
  }
}
function normalizePlugins(_plugins2) {
  const plugins2 = _plugins2.map((plugin) => {
    if (typeof plugin !== "function") {
      return null;
    }
    if (plugin.length > 1) {
      return (nuxtApp) => plugin(nuxtApp, nuxtApp.provide);
    }
    return plugin;
  }).filter(Boolean);
  return plugins2;
}
function defineNuxtPlugin(plugin) {
  plugin[NuxtPluginIndicator] = true;
  return plugin;
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  {
    return nuxtAppCtx.callAsync(nuxt, fn);
  }
}
function useNuxtApp() {
  const nuxtAppInstance = nuxtAppCtx.tryUse();
  if (!nuxtAppInstance) {
    const vm = getCurrentInstance();
    if (!vm) {
      throw new Error("nuxt instance unavailable");
    }
    return vm.appContext.app.$nuxt;
  }
  return nuxtAppInstance;
}
function useRuntimeConfig() {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (_err) => {
  const err = createError(_err);
  try {
    const nuxtApp = useNuxtApp();
    nuxtApp.callHook("app:error", err);
    const error = useError();
    error.value = error.value || err;
  } catch {
    throw err;
  }
  return err;
};
const createError = (err) => {
  const _err = createError$1(err);
  _err.__nuxt_error = true;
  return _err;
};
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = "$s" + _key;
  const nuxt = useNuxtApp();
  const state = toRef(nuxt.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxt.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (getCurrentInstance()) {
    return inject("_route", useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : to.path || "/";
  const isExternal = hasProtocol(toPath, true);
  if (isExternal && !(options == null ? void 0 : options.external)) {
    throw new Error("Navigating to external URL is not allowed by default. Use `nagivateTo (url, { external: true })`.");
  }
  if (isExternal && parseURL(toPath).protocol === "script:") {
    throw new Error("Cannot navigate to an URL with script protocol.");
  }
  const router = useRouter();
  {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.ssrContext && nuxtApp.ssrContext.event) {
      const redirectLocation = isExternal ? toPath : joinURL(useRuntimeConfig().app.baseURL, router.resolve(to).fullPath || "/");
      return nuxtApp.callHook("app:redirected").then(() => sendRedirect(nuxtApp.ssrContext.event, redirectLocation, (options == null ? void 0 : options.redirectCode) || 302));
    }
  }
  if (isExternal) {
    if (options == null ? void 0 : options.replace) {
      location.replace(toPath);
    } else {
      location.href = toPath;
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
const firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
const DEFAULT_EXTERNAL_REL_ATTRIBUTE = "noopener noreferrer";
function defineNuxtLink(options) {
  const componentName = options.componentName || "NuxtLink";
  return defineComponent({
    name: componentName,
    props: {
      to: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      href: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      target: {
        type: String,
        default: void 0,
        required: false
      },
      rel: {
        type: String,
        default: void 0,
        required: false
      },
      noRel: {
        type: Boolean,
        default: void 0,
        required: false
      },
      prefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      noPrefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      activeClass: {
        type: String,
        default: void 0,
        required: false
      },
      exactActiveClass: {
        type: String,
        default: void 0,
        required: false
      },
      prefetchedClass: {
        type: String,
        default: void 0,
        required: false
      },
      replace: {
        type: Boolean,
        default: void 0,
        required: false
      },
      ariaCurrentValue: {
        type: String,
        default: void 0,
        required: false
      },
      external: {
        type: Boolean,
        default: void 0,
        required: false
      },
      custom: {
        type: Boolean,
        default: void 0,
        required: false
      }
    },
    setup(props, { slots }) {
      const router = useRouter();
      const to = computed(() => {
        return props.to || props.href || "";
      });
      const isExternal = computed(() => {
        if (props.external) {
          return true;
        }
        if (props.target && props.target !== "_self") {
          return true;
        }
        if (typeof to.value === "object") {
          return false;
        }
        return to.value === "" || hasProtocol(to.value, true);
      });
      const prefetched = ref(false);
      const el = void 0;
      return () => {
        var _a, _b, _c;
        if (!isExternal.value) {
          return h(
            resolveComponent("RouterLink"),
            {
              ref: void 0,
              to: to.value,
              ...prefetched.value && !props.custom ? { class: props.prefetchedClass || options.prefetchedClass } : {},
              activeClass: props.activeClass || options.activeClass,
              exactActiveClass: props.exactActiveClass || options.exactActiveClass,
              replace: props.replace,
              ariaCurrentValue: props.ariaCurrentValue,
              custom: props.custom
            },
            slots.default
          );
        }
        const href = typeof to.value === "object" ? (_b = (_a = router.resolve(to.value)) == null ? void 0 : _a.href) != null ? _b : null : to.value || null;
        const target = props.target || null;
        const rel = props.noRel ? null : firstNonUndefined(props.rel, options.externalRelAttribute, href ? DEFAULT_EXTERNAL_REL_ATTRIBUTE : "") || null;
        const navigate = () => navigateTo(href, { replace: props.replace });
        if (props.custom) {
          if (!slots.default) {
            return null;
          }
          return slots.default({
            href,
            navigate,
            route: router.resolve(href),
            rel,
            target,
            isActive: false,
            isExactActive: false
          });
        }
        return h("a", { ref: el, href, rel, target }, (_c = slots.default) == null ? void 0 : _c.call(slots));
      };
    }
  });
}
const __nuxt_component_0 = defineNuxtLink({ componentName: "NuxtLink" });
const inlineConfig = {};
defuFn(inlineConfig);
function useHead(meta) {
  useNuxtApp()._useHead(meta);
}
const components = {};
const _nuxt_components_plugin_mjs_KR1HBZs4kY = defineNuxtPlugin((nuxtApp) => {
  for (const name in components) {
    nuxtApp.vueApp.component(name, components[name]);
    nuxtApp.vueApp.component("Lazy" + name, components[name]);
  }
});
var PROVIDE_KEY = "usehead";
var HEAD_COUNT_KEY = "head:count";
var HEAD_ATTRS_KEY = "data-head-attrs";
var SELF_CLOSING_TAGS = ["meta", "link", "base"];
var BODY_TAG_ATTR_NAME = "data-meta-body";
var propsToString = (props) => {
  const handledAttributes = [];
  for (const [key, value] of Object.entries(props)) {
    if (value === false || value == null)
      continue;
    let attribute = key;
    if (value !== true)
      attribute += `="${String(value).replace(/"/g, "&quot;")}"`;
    handledAttributes.push(attribute);
  }
  return handledAttributes.length > 0 ? ` ${handledAttributes.join(" ")}` : "";
};
var tagToString = (tag) => {
  const attrs = propsToString(tag.props);
  const openTag = `<${tag.tag}${attrs}>`;
  return SELF_CLOSING_TAGS.includes(tag.tag) ? openTag : `${openTag}${tag.children || ""}</${tag.tag}>`;
};
var resolveHeadEntries = (entries, force) => {
  return entries.map((e) => {
    if (e.input && (force || !e.resolved))
      e.input = resolveUnrefHeadInput(e.input);
    return e;
  });
};
var renderHeadToString = async (head) => {
  var _a, _b;
  const headHtml = [];
  const bodyHtml = [];
  let titleHtml = "";
  const attrs = { htmlAttrs: {}, bodyAttrs: {} };
  const resolvedEntries = resolveHeadEntries(head.headEntries);
  for (const h2 in head.hooks["resolved:entries"])
    await head.hooks["resolved:entries"][h2](resolvedEntries);
  const headTags = resolveHeadEntriesToTags(resolvedEntries);
  for (const h2 in head.hooks["resolved:tags"])
    await head.hooks["resolved:tags"][h2](headTags);
  for (const tag of headTags) {
    if ((_a = tag.options) == null ? void 0 : _a.beforeTagRender)
      tag.options.beforeTagRender(tag);
    if (tag.tag === "title")
      titleHtml = tagToString(tag);
    else if (tag.tag === "htmlAttrs" || tag.tag === "bodyAttrs")
      attrs[tag.tag] = { ...attrs[tag.tag], ...tag.props };
    else if ((_b = tag.options) == null ? void 0 : _b.body)
      bodyHtml.push(tagToString(tag));
    else
      headHtml.push(tagToString(tag));
  }
  headHtml.push(`<meta name="${HEAD_COUNT_KEY}" content="${headHtml.length}">`);
  return {
    get headTags() {
      return titleHtml + headHtml.join("");
    },
    get htmlAttrs() {
      return propsToString({
        ...attrs.htmlAttrs,
        [HEAD_ATTRS_KEY]: Object.keys(attrs.htmlAttrs).join(",")
      });
    },
    get bodyAttrs() {
      return propsToString({
        ...attrs.bodyAttrs,
        [HEAD_ATTRS_KEY]: Object.keys(attrs.bodyAttrs).join(",")
      });
    },
    get bodyTags() {
      return bodyHtml.join("");
    }
  };
};
var sortTags = (aTag, bTag) => {
  const tagWeight = (tag) => {
    var _a;
    if ((_a = tag.options) == null ? void 0 : _a.renderPriority)
      return tag.options.renderPriority;
    switch (tag.tag) {
      case "base":
        return -1;
      case "meta":
        if (tag.props.charset)
          return -2;
        if (tag.props["http-equiv"] === "content-security-policy")
          return 0;
        return 10;
      default:
        return 10;
    }
  };
  return tagWeight(aTag) - tagWeight(bTag);
};
var tagDedupeKey = (tag) => {
  const { props, tag: tagName, options } = tag;
  if (["base", "title", "titleTemplate", "bodyAttrs", "htmlAttrs"].includes(tagName))
    return tagName;
  if (tagName === "link" && props.rel === "canonical")
    return "canonical";
  if (props.charset)
    return "charset";
  if (options == null ? void 0 : options.key)
    return `${tagName}:${options.key}`;
  const name = ["id"];
  if (tagName === "meta")
    name.push(...["name", "property", "http-equiv"]);
  for (const n of name) {
    if (typeof props[n] !== "undefined") {
      return `${tagName}:${n}:${props[n]}`;
    }
  }
  return tag.runtime.position;
};
function resolveUnrefHeadInput(ref2) {
  const root = resolveUnref(ref2);
  if (!ref2 || !root) {
    return root;
  }
  if (Array.isArray(root)) {
    return root.map(resolveUnrefHeadInput);
  }
  if (typeof root === "object") {
    return Object.fromEntries(
      Object.entries(root).map(([key, value]) => {
        if (key === "titleTemplate")
          return [key, unref(value)];
        return [
          key,
          resolveUnrefHeadInput(value)
        ];
      })
    );
  }
  return root;
}
var resolveTag = (name, input, e) => {
  var _a;
  input = { ...input };
  const tag = {
    tag: name,
    props: {},
    runtime: {
      entryId: e.id
    },
    options: {
      ...e.options
    }
  };
  ["hid", "vmid", "key"].forEach((key) => {
    if (input[key]) {
      tag.options.key = input[key];
      delete input[key];
    }
  });
  ["children", "innerHTML", "textContent"].forEach((key) => {
    if (typeof input[key] !== "undefined") {
      tag.children = input[key];
      delete input[key];
    }
  });
  ["body", "renderPriority"].forEach((key) => {
    if (typeof input[key] !== "undefined") {
      tag.options[key] = input[key];
      delete input[key];
    }
  });
  if ((_a = tag.options) == null ? void 0 : _a.body)
    input[BODY_TAG_ATTR_NAME] = true;
  tag.props = input;
  return tag;
};
var headInputToTags = (e) => {
  return Object.entries(e.input).filter(([, v]) => typeof v !== "undefined").map(([key, value]) => {
    return (Array.isArray(value) ? value : [value]).map((props) => {
      switch (key) {
        case "title":
        case "titleTemplate":
          return {
            tag: key,
            children: props,
            props: {},
            runtime: { entryId: e.id },
            options: e.options
          };
        case "base":
        case "meta":
        case "link":
        case "style":
        case "script":
        case "noscript":
        case "htmlAttrs":
        case "bodyAttrs":
          return resolveTag(key, props, e);
        default:
          return false;
      }
    });
  }).flat().filter((v) => !!v);
};
var renderTitleTemplate = (template, title) => {
  if (template == null)
    return title || null;
  if (typeof template === "function")
    return template(title);
  return template.replace("%s", title != null ? title : "");
};
var resolveHeadEntriesToTags = (entries) => {
  const deduping = {};
  const resolvedEntries = resolveHeadEntries(entries);
  resolvedEntries.forEach((entry2, entryIndex) => {
    const tags = headInputToTags(entry2);
    tags.forEach((tag, tagIdx) => {
      tag.runtime = tag.runtime || {};
      tag.runtime.position = entryIndex * 1e4 + tagIdx;
      deduping[tagDedupeKey(tag)] = tag;
    });
  });
  let resolvedTags = Object.values(deduping).sort((a, b) => a.runtime.position - b.runtime.position).sort(sortTags);
  const titleTemplateIdx = resolvedTags.findIndex((i) => i.tag === "titleTemplate");
  const titleIdx = resolvedTags.findIndex((i) => i.tag === "title");
  if (titleIdx !== -1 && titleTemplateIdx !== -1) {
    const newTitle = renderTitleTemplate(
      resolvedTags[titleTemplateIdx].children,
      resolvedTags[titleIdx].children
    );
    if (newTitle !== null) {
      resolvedTags[titleIdx].children = newTitle || resolvedTags[titleIdx].children;
    } else {
      resolvedTags = resolvedTags.filter((_, i) => i !== titleIdx);
    }
    resolvedTags = resolvedTags.filter((_, i) => i !== titleTemplateIdx);
  } else if (titleTemplateIdx !== -1) {
    const newTitle = renderTitleTemplate(
      resolvedTags[titleTemplateIdx].children
    );
    if (newTitle !== null) {
      resolvedTags[titleTemplateIdx].children = newTitle;
      resolvedTags[titleTemplateIdx].tag = "title";
    } else {
      resolvedTags = resolvedTags.filter((_, i) => i !== titleTemplateIdx);
    }
  }
  return resolvedTags;
};
function isEqualNode(oldTag, newTag) {
  if (oldTag instanceof HTMLElement && newTag instanceof HTMLElement) {
    const nonce = newTag.getAttribute("nonce");
    if (nonce && !oldTag.getAttribute("nonce")) {
      const cloneTag = newTag.cloneNode(true);
      cloneTag.setAttribute("nonce", "");
      cloneTag.nonce = nonce;
      return nonce === oldTag.nonce && oldTag.isEqualNode(cloneTag);
    }
  }
  return oldTag.isEqualNode(newTag);
}
var setAttrs = (el, attrs) => {
  const existingAttrs = el.getAttribute(HEAD_ATTRS_KEY);
  if (existingAttrs) {
    for (const key of existingAttrs.split(",")) {
      if (!(key in attrs))
        el.removeAttribute(key);
    }
  }
  const keys = [];
  for (const key in attrs) {
    const value = attrs[key];
    if (value == null)
      continue;
    if (value === false)
      el.removeAttribute(key);
    else
      el.setAttribute(key, value);
    keys.push(key);
  }
  if (keys.length)
    el.setAttribute(HEAD_ATTRS_KEY, keys.join(","));
  else
    el.removeAttribute(HEAD_ATTRS_KEY);
};
var createElement = (tag, document) => {
  var _a;
  const $el = document.createElement(tag.tag);
  Object.entries(tag.props).forEach(([k, v]) => {
    if (v !== false) {
      $el.setAttribute(k, v === true ? "" : String(v));
    }
  });
  if (tag.children) {
    if ((_a = tag.options) == null ? void 0 : _a.safe) {
      if (tag.tag !== "script")
        $el.textContent = tag.children;
    } else {
      $el.innerHTML = tag.children;
    }
  }
  return $el;
};
var updateElements = (document = window.document, type, tags) => {
  var _a, _b;
  const head = document.head;
  const body = document.body;
  let headCountEl = head.querySelector(`meta[name="${HEAD_COUNT_KEY}"]`);
  const bodyMetaElements = body.querySelectorAll(`[${BODY_TAG_ATTR_NAME}]`);
  const headCount = headCountEl ? Number(headCountEl.getAttribute("content")) : 0;
  const oldHeadElements = [];
  const oldBodyElements = [];
  if (bodyMetaElements) {
    for (let i = 0; i < bodyMetaElements.length; i++) {
      if (bodyMetaElements[i] && ((_a = bodyMetaElements[i].tagName) == null ? void 0 : _a.toLowerCase()) === type)
        oldBodyElements.push(bodyMetaElements[i]);
    }
  }
  if (headCountEl) {
    for (let i = 0, j = headCountEl.previousElementSibling; i < headCount; i++, j = (j == null ? void 0 : j.previousElementSibling) || null) {
      if (((_b = j == null ? void 0 : j.tagName) == null ? void 0 : _b.toLowerCase()) === type)
        oldHeadElements.push(j);
    }
  } else {
    headCountEl = document.createElement("meta");
    headCountEl.setAttribute("name", HEAD_COUNT_KEY);
    headCountEl.setAttribute("content", "0");
    head.append(headCountEl);
  }
  let newElements = tags.map((tag) => {
    var _a3;
    var _a2;
    return {
      element: createElement(tag, document),
      body: (_a3 = (_a2 = tag.options) == null ? void 0 : _a2.body) != null ? _a3 : false
    };
  });
  newElements = newElements.filter((newEl) => {
    for (let i = 0; i < oldHeadElements.length; i++) {
      const oldEl = oldHeadElements[i];
      if (isEqualNode(oldEl, newEl.element)) {
        oldHeadElements.splice(i, 1);
        return false;
      }
    }
    for (let i = 0; i < oldBodyElements.length; i++) {
      const oldEl = oldBodyElements[i];
      if (isEqualNode(oldEl, newEl.element)) {
        oldBodyElements.splice(i, 1);
        return false;
      }
    }
    return true;
  });
  oldBodyElements.forEach((t) => {
    var _a2;
    return (_a2 = t.parentNode) == null ? void 0 : _a2.removeChild(t);
  });
  oldHeadElements.forEach((t) => {
    var _a2;
    return (_a2 = t.parentNode) == null ? void 0 : _a2.removeChild(t);
  });
  newElements.forEach((t) => {
    if (t.body)
      body.insertAdjacentElement("beforeend", t.element);
    else
      head.insertBefore(t.element, headCountEl);
  });
  headCountEl.setAttribute(
    "content",
    `${headCount - oldHeadElements.length + newElements.filter((t) => !t.body).length}`
  );
};
var updateDOM = async (head, previousTags, document) => {
  var _a, _b;
  const tags = {};
  if (!document)
    document = window.document;
  for (const k in head.hooks["before:dom"]) {
    if (await head.hooks["before:dom"][k]() === false)
      return;
  }
  const resolvedEntries = resolveHeadEntries(head.headEntries);
  for (const h2 in head.hooks["resolved:entries"])
    await head.hooks["resolved:entries"][h2](resolvedEntries);
  const headTags = resolveHeadEntriesToTags(resolvedEntries);
  for (const h2 in head.hooks["resolved:tags"])
    await head.hooks["resolved:tags"][h2](headTags);
  for (const tag of headTags) {
    switch (tag.tag) {
      case "title":
        if (typeof tag.children !== "undefined")
          document.title = tag.children;
        break;
      case "base":
      case "meta":
      case "link":
      case "style":
      case "script":
      case "noscript":
        tags[tag.tag] = tags[tag.tag] || [];
        tags[tag.tag].push(tag);
        break;
    }
  }
  setAttrs(document.documentElement, ((_a = headTags.find((t) => t.tag === "htmlAttrs")) == null ? void 0 : _a.props) || {});
  setAttrs(document.body, ((_b = headTags.find((t) => t.tag === "bodyAttrs")) == null ? void 0 : _b.props) || {});
  const tagKeys = /* @__PURE__ */ new Set([...Object.keys(tags), ...previousTags]);
  for (const tag of tagKeys)
    updateElements(document, tag, tags[tag] || []);
  previousTags.clear();
  Object.keys(tags).forEach((i) => previousTags.add(i));
};
version.startsWith("2.");
var createHead = (initHeadObject) => {
  let entries = [];
  let entryId = 0;
  const previousTags = /* @__PURE__ */ new Set();
  let domUpdateTick = null;
  const head = {
    install(app) {
      if (app.config.globalProperties)
        app.config.globalProperties.$head = head;
      app.provide(PROVIDE_KEY, head);
    },
    hooks: {
      "before:dom": [],
      "resolved:tags": [],
      "resolved:entries": []
    },
    get headEntries() {
      return entries;
    },
    get headTags() {
      const resolvedEntries = resolveHeadEntries(head.headEntries);
      return resolveHeadEntriesToTags(resolvedEntries);
    },
    addHeadObjs(input, options) {
      return head.addEntry(input, options);
    },
    addEntry(input, options = {}) {
      let resolved = false;
      if (options == null ? void 0 : options.resolved) {
        resolved = true;
        delete options.resolved;
      }
      const entry2 = {
        id: entryId++,
        options,
        resolved,
        input
      };
      entries.push(entry2);
      return {
        remove() {
          entries = entries.filter((_objs) => _objs.id !== entry2.id);
        },
        update(updatedInput) {
          entries = entries.map((e) => {
            if (e.id === entry2.id)
              e.input = updatedInput;
            return e;
          });
        }
      };
    },
    async updateDOM(document, force) {
      const doDomUpdate = () => {
        domUpdateTick = null;
        return updateDOM(head, previousTags, document);
      };
      if (force)
        return doDomUpdate();
      return domUpdateTick = domUpdateTick || new Promise((resolve) => nextTick(() => resolve(doDomUpdate())));
    },
    addReactiveEntry(input, options = {}) {
      let entrySideEffect = null;
      const cleanUpWatch = watchEffect(() => {
        const resolvedInput = resolveUnrefHeadInput(input);
        if (entrySideEffect === null) {
          entrySideEffect = head.addEntry(
            resolvedInput,
            { ...options, resolved: true }
          );
        } else {
          entrySideEffect.update(resolvedInput);
        }
      });
      return () => {
        cleanUpWatch();
        if (entrySideEffect)
          entrySideEffect.remove();
      };
    }
  };
  if (initHeadObject)
    head.addEntry(initHeadObject);
  return head;
};
const appHead = { "meta": [{ "name": "viewport", "content": "width=device-width, initial-scale=1" }, { "charset": "utf-8" }], "link": [], "style": [], "script": [], "noscript": [] };
const node_modules_nuxt_dist_head_runtime_lib_vueuse_head_plugin_mjs_D7WGfuP1A0 = defineNuxtPlugin((nuxtApp) => {
  const head = createHead();
  head.addEntry(appHead, { resolved: true });
  nuxtApp.vueApp.use(head);
  nuxtApp._useHead = (_meta, options) => {
    {
      head.addEntry(_meta, options);
      return;
    }
  };
  {
    nuxtApp.ssrContext.renderMeta = async () => {
      const meta = await renderHeadToString(head);
      return {
        ...meta,
        bodyScripts: meta.bodyTags
      };
    };
  }
});
const metaMixin = {
  created() {
    const instance = getCurrentInstance();
    if (!instance) {
      return;
    }
    const options = instance.type;
    if (!options || !("head" in options)) {
      return;
    }
    const nuxtApp = useNuxtApp();
    const source = typeof options.head === "function" ? () => options.head(nuxtApp) : options.head;
    useHead(source);
  }
};
const node_modules_nuxt_dist_head_runtime_mixin_plugin_mjs_prWV5EzJWI = defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin(metaMixin);
});
const globalMiddleware = [];
function getRouteFromPath(fullPath) {
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = parseURL(fullPath.toString());
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    params: {},
    name: void 0,
    matched: [],
    redirectedFrom: void 0,
    meta: {},
    href: fullPath
  };
}
const node_modules_nuxt_dist_app_plugins_router_mjs_PJLmOmdFeM = defineNuxtPlugin((nuxtApp) => {
  const initialURL = nuxtApp.ssrContext.url;
  const routes = [];
  const hooks = {
    "navigate:before": [],
    "resolve:before": [],
    "navigate:after": [],
    error: []
  };
  const registerHook = (hook, guard) => {
    hooks[hook].push(guard);
    return () => hooks[hook].splice(hooks[hook].indexOf(guard), 1);
  };
  useRuntimeConfig().app.baseURL;
  const route = reactive(getRouteFromPath(initialURL));
  async function handleNavigation(url, replace) {
    try {
      const to = getRouteFromPath(url);
      for (const middleware of hooks["navigate:before"]) {
        const result = await middleware(to, route);
        if (result === false || result instanceof Error) {
          return;
        }
        if (result) {
          return handleNavigation(result, true);
        }
      }
      for (const handler of hooks["resolve:before"]) {
        await handler(to, route);
      }
      Object.assign(route, to);
      if (false)
        ;
      for (const middleware of hooks["navigate:after"]) {
        await middleware(to, route);
      }
    } catch (err) {
      for (const handler of hooks.error) {
        await handler(err);
      }
    }
  }
  const router = {
    currentRoute: route,
    isReady: () => Promise.resolve(),
    options: {},
    install: () => Promise.resolve(),
    push: (url) => handleNavigation(url),
    replace: (url) => handleNavigation(url),
    back: () => window.history.go(-1),
    go: (delta) => window.history.go(delta),
    forward: () => window.history.go(1),
    beforeResolve: (guard) => registerHook("resolve:before", guard),
    beforeEach: (guard) => registerHook("navigate:before", guard),
    afterEach: (guard) => registerHook("navigate:after", guard),
    onError: (handler) => registerHook("error", handler),
    resolve: getRouteFromPath,
    addRoute: (parentName, route2) => {
      routes.push(route2);
    },
    getRoutes: () => routes,
    hasRoute: (name) => routes.some((route2) => route2.name === name),
    removeRoute: (name) => {
      const index = routes.findIndex((route2) => route2.name === name);
      if (index !== -1) {
        routes.splice(index, 1);
      }
    }
  };
  nuxtApp.vueApp.component("RouterLink", {
    functional: true,
    props: {
      to: String,
      custom: Boolean,
      replace: Boolean,
      activeClass: String,
      exactActiveClass: String,
      ariaCurrentValue: String
    },
    setup: (props, { slots }) => {
      const navigate = () => handleNavigation(props.to, props.replace);
      return () => {
        var _a;
        const route2 = router.resolve(props.to);
        return props.custom ? (_a = slots.default) == null ? void 0 : _a.call(slots, { href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
          e.preventDefault();
          return navigate();
        } }, slots);
      };
    }
  });
  nuxtApp._route = route;
  nuxtApp._middleware = nuxtApp._middleware || {
    global: [],
    named: {}
  };
  const initialLayout = useState("_layout");
  nuxtApp.hooks.hookOnce("app:created", async () => {
    router.beforeEach(async (to, from) => {
      var _a;
      to.meta = reactive(to.meta || {});
      if (nuxtApp.isHydrating) {
        to.meta.layout = (_a = initialLayout.value) != null ? _a : to.meta.layout;
      }
      nuxtApp._processingMiddleware = true;
      const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
      for (const middleware of middlewareEntries) {
        const result = await callWithNuxt(nuxtApp, middleware, [to, from]);
        {
          if (result === false || result instanceof Error) {
            const error = result || createError$1({
              statusCode: 404,
              statusMessage: `Page Not Found: ${initialURL}`
            });
            return callWithNuxt(nuxtApp, showError, [error]);
          }
        }
        if (result || result === false) {
          return result;
        }
      }
    });
    router.afterEach(() => {
      delete nuxtApp._processingMiddleware;
    });
    await router.replace(initialURL);
    if (!isEqual(route.fullPath, initialURL)) {
      await callWithNuxt(nuxtApp, navigateTo, [route.fullPath]);
    }
  });
  return {
    provide: {
      route,
      router
    }
  };
});
const _plugins = [
  _nuxt_components_plugin_mjs_KR1HBZs4kY,
  node_modules_nuxt_dist_head_runtime_lib_vueuse_head_plugin_mjs_D7WGfuP1A0,
  node_modules_nuxt_dist_head_runtime_mixin_plugin_mjs_prWV5EzJWI,
  node_modules_nuxt_dist_app_plugins_router_mjs_PJLmOmdFeM
];
const _sfc_main$a = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const ErrorComponent = defineAsyncComponent(() => import('./_nuxt/error-component.bffde3c9.mjs').then((r) => r.default || r));
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    provide("_route", useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        callWithNuxt(nuxtApp, showError, [err]);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_App = resolveComponent("App");
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(error)) {
            _push(ssrRenderComponent(unref(ErrorComponent), { error: unref(error) }, null, _parent));
          } else {
            _push(ssrRenderComponent(_component_App, null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const _sfc_main$9 = {
  __name: "Modal",
  __ssrInlineRender: true,
  props: {
    title: {
      type: String,
      required: true
    },
    busy: {
      type: Boolean
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full h-full fixed top-0 left-0 z-[60] overflow-x-hidden overflow-y-auto transition-all duration-300 bg-gray-900/75" }, _attrs))}><div class="mt-0 ease-out transition-all duration-300 md:max-w-2xl md:w-full m-3 md:mx-auto min-h-[calc(100%-3.5rem)] shadow-lg flex items-center"><div class="flex flex-col bg-white border shadow-sm rounded-xl m-auto dark:bg-gray-800 dark:border-gray-700 dark:shadow-slate-700/[.7]"><div class="flex justify-between items-center py-3 px-4 border-b dark:border-gray-700"><h3 class="font-bold text-gray-800 dark:text-white">${ssrInterpolate(__props.title)}</h3><button type="button" class="inline-flex flex-shrink-0 justify-center items-center h-8 w-8 rounded-md text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all text-sm dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"${ssrIncludeBooleanAttr(__props.busy) ? " disabled" : ""}><span class="sr-only">Close</span><svg class="w-3.5 h-3.5" width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.258206 1.00652C0.351976 0.912791 0.479126 0.860131 0.611706 0.860131C0.744296 0.860131 0.871447 0.912791 0.965207 1.00652L3.61171 3.65302L6.25822 1.00652C6.30432 0.958771 6.35952 0.920671 6.42052 0.894471C6.48152 0.868271 6.54712 0.854471 6.61352 0.853901C6.67992 0.853321 6.74572 0.865971 6.80722 0.891111C6.86862 0.916251 6.92442 0.953381 6.97142 1.00032C7.01832 1.04727 7.05552 1.1031 7.08062 1.16454C7.10572 1.22599 7.11842 1.29183 7.11782 1.35822C7.11722 1.42461 7.10342 1.49022 7.07722 1.55122C7.05102 1.61222 7.01292 1.6674 6.96522 1.71352L4.31871 4.36002L6.96522 7.00648C7.05632 7.10078 7.10672 7.22708 7.10552 7.35818C7.10442 7.48928 7.05182 7.61468 6.95912 7.70738C6.86642 7.80018 6.74102 7.85268 6.60992 7.85388C6.47882 7.85498 6.35252 7.80458 6.25822 7.71348L3.61171 5.06702L0.965207 7.71348C0.870907 7.80458 0.744606 7.85498 0.613506 7.85388C0.482406 7.85268 0.357007 7.80018 0.264297 7.70738C0.171597 7.61468 0.119017 7.48928 0.117877 7.35818C0.116737 7.22708 0.167126 7.10078 0.258206 7.00648L2.90471 4.36002L0.258206 1.71352C0.164476 1.61976 0.111816 1.4926 0.111816 1.36002C0.111816 1.22744 0.164476 1.10028 0.258206 1.00652Z" fill="currentColor"></path></svg></button></div><div class="p-4 overflow-y-auto">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div><div class="flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-gray-700"><button type="button" class="hs-dropdown-toggle py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"${ssrIncludeBooleanAttr(__props.busy) ? " disabled" : ""}> Close </button></div></div></div></div>`);
    };
  }
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Modal.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const _sfc_main$8 = {
  __name: "Paragraph",
  __ssrInlineRender: true,
  props: {
    value: String
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.value) {
        _push(`<p${ssrRenderAttrs(mergeProps({ class: "block text-sm font-normal text-gray-200" }, _attrs))}>${ssrInterpolate(__props.value)}</p>`);
      } else {
        _push(`<p${ssrRenderAttrs(mergeProps({ class: "block text-sm font-normal text-gray-200" }, _attrs))}>`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</p>`);
      }
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Paragraph.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const _sfc_main$7 = {
  __name: "Button",
  __ssrInlineRender: true,
  props: {
    value: String,
    disabled: Boolean
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.value) {
        _push(`<button${ssrRenderAttrs(mergeProps({
          class: "py-[.688rem] px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-blue-500 hover:text-white hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:border-gray-700 dark:hover:border-blue-500 disabled:bg-red-600",
          disabled: __props.disabled
        }, _attrs))}>${ssrInterpolate(__props.value)}</button>`);
      } else {
        _push(`<button${ssrRenderAttrs(mergeProps({
          class: "py-[.688rem] px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-blue-500 hover:text-white hover:bg-blue-500 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:border-gray-700 dark:hover:border-blue-500 disabled:bg-red-600",
          disabled: __props.disabled
        }, _attrs))}>`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</button>`);
      }
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Button.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$6 = {};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col" }, _attrs))}><div class="-m-1.5 overflow-x-auto"><div class="p-1.5 min-w-full inline-block align-middle"><div class="border rounded-lg overflow-hidden dark:border-gray-800 dark:bg-gray-800"><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead>`);
  ssrRenderSlot(_ctx.$slots, "header", {}, null, _push, _parent);
  _push(`</thead><tbody class="divide-y divide-gray-200 dark:divide-gray-700">`);
  ssrRenderSlot(_ctx.$slots, "content", {}, null, _push, _parent);
  _push(`</tbody></table></div></div></div></div>`);
}
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/table/Table.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["ssrRender", _sfc_ssrRender$2]]);
const _sfc_main$5 = {
  __name: "Row",
  __ssrInlineRender: true,
  props: {
    title: String
  },
  setup(__props) {
    const props = __props;
    let classes = "";
    if (props.title) {
      classes = "";
    } else {
      classes = "hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out";
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<tr${ssrRenderAttrs(mergeProps({ class: unref(classes) }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</tr>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/table/Row.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  _push(`<th${ssrRenderAttrs(mergeProps({
    scope: "col",
    class: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
  }, _attrs))}>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</th>`);
}
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/table/TitleCell.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["ssrRender", _sfc_ssrRender$1]]);
const _sfc_main$3 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<td${ssrRenderAttrs(mergeProps({ class: "px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200" }, _attrs))}>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</td>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/table/Cell.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$2 = {
  __name: "Input",
  __ssrInlineRender: true,
  props: {
    placeholder: {
      type: String,
      default: "Enter text"
    },
    modelValue: String
  },
  emits: ["update:modelValue"],
  setup(__props, { expose }) {
    const input = ref(null);
    expose({ focus: () => input.value.focus() });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<input${ssrRenderAttrs(mergeProps({
        ref_key: "input",
        ref: input,
        type: "text",
        class: "py-2 px-3 block w-full border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 placeholder:dark:text-gray-400",
        placeholder: __props.placeholder,
        value: __props.modelValue
      }, _attrs))}>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Input.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "Select",
  __ssrInlineRender: true,
  props: {
    placeholder: {
      type: String,
      default: "Enter text"
    },
    modelValue: String
  },
  emits: ["update:modelValue"],
  setup(__props, { expose }) {
    const input = ref(null);
    expose({ focus: () => input.value.focus() });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<select${ssrRenderAttrs(mergeProps({
        ref_key: "input",
        ref: input,
        type: "text",
        class: "py-2 px-3 block w-full border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 placeholder:dark:text-gray-400",
        value: __props.modelValue
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</select>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Select.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const data = ref([]);
    const showInvalidDomainLabel = ref(false);
    const scriptBusy = ref(false);
    const showOutputDialog = ref(false);
    const outputMsg = ref("");
    const formData = ref({ domainLabel: "", domainURL: "", domainProvider: "" });
    const getDomains = () => {
      $fetch("/api/settings/show").then((res) => {
        data.value.domains = null;
        data.value.domains = res.data;
      });
    };
    const getLastscriptRun = () => {
      $fetch("/api/lastscriptrun").then((res) => {
        let dateFormat = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "2-digit", hour: "numeric", minute: "numeric", second: "numeric", hour12: false });
        data.value.lastRun = null;
        if (res.data == "Never") {
          data.value.lastRun = "never";
          return;
        }
        data.value.lastRun = dateFormat.format(res.data);
      });
    };
    const runScript = () => {
      scriptBusy.value = true;
      showOutputDialog.value = true;
      outputMsg.value = "";
      axios.get("/api/runscript").then((res) => {
        outputMsg.value = res.data;
        scriptBusy.value = false;
      }).then(() => {
        getLastscriptRun();
      });
    };
    const addDomain = async () => {
      let newDomainLabel = formData.value.domainLabel;
      let newDomainURL = formData.value.domainURL;
      let newDomainProvider = formData.value.domainProvider;
      showInvalidDomainLabel.value = false;
      if (!newDomainURL.match(/^(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}$/gim) || !newDomainLabel.match(/[a-z0-9]/gim)) {
        showInvalidDomainLabel.value = true;
        return;
      }
      await axios.post("/api/settings/add", {
        name: newDomainLabel,
        url: newDomainURL,
        provider: newDomainProvider
      }).then((res) => {
        if (res.data.data.status == "200") {
          getDomains();
          formData.value.domainLabel = "";
          formData.value.domainURL = "";
          formData.value.domainProvider = "";
        } else {
          console.alert(res.data.data.message);
        }
      });
    };
    const deleteDomain = async (domain) => {
      await axios.post("/api/settings/delete", {
        name: domain.domain.name,
        url: domain.domain.url
      }).then((res) => {
        if (res.data.data.status == "200") {
          getDomains();
        } else {
          console.alert(res.data.data.message);
        }
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Modal = _sfc_main$9;
      const _component_Paragraph = _sfc_main$8;
      const _component_Button = _sfc_main$7;
      const _component_Table = __nuxt_component_3;
      const _component_TableRow = _sfc_main$5;
      const _component_TableTitleCell = __nuxt_component_5;
      const _component_TableCell = __nuxt_component_6;
      const _component_Input = _sfc_main$2;
      const _component_Select = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col flex-start min-h-screen bg-slate-900 text-center" }, _attrs))}><h1 class="font-bold pt-10 text-gray-300 text-4xl">DDNS Updater Configuration</h1>`);
      _push(ssrRenderComponent(_component_Modal, {
        onClose: ($event) => showOutputDialog.value = false,
        title: "Run the DDNS updater script manualy",
        style: showOutputDialog.value ? null : { display: "none" },
        busy: scriptBusy.value
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-auto flex-col justify-center items-center w-full px-4 py-2 md:px-5"${_scopeId}>`);
            if (outputMsg.value == "") {
              _push2(ssrRenderComponent(_component_Paragraph, { class: "self-start text-left mb-5" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Wait for the script to finish running to see the output. `);
                  } else {
                    return [
                      createTextVNode(" Wait for the script to finish running to see the output. ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_Paragraph, { class: "self-start text-left mb-5" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Script output: `);
                  } else {
                    return [
                      createTextVNode(" Script output: ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            }
            _push2(`<div style="${ssrRenderStyle(scriptBusy.value ? null : { display: "none" })}" class="flex justify-center"${_scopeId}><div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading"${_scopeId}><span class="sr-only"${_scopeId}>Loading...</span></div></div>`);
            if (outputMsg.value) {
              _push2(`<div class="whitespace-pre-line break-words text-left text-gray-200 rounded-2xl p-3 bg-gray-900"${_scopeId}><pre${_scopeId}>${ssrInterpolate(JSON.stringify(outputMsg.value, null, 4))}</pre></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-auto flex-col justify-center items-center w-full px-4 py-2 md:px-5" }, [
                outputMsg.value == "" ? (openBlock(), createBlock(_component_Paragraph, {
                  key: 0,
                  class: "self-start text-left mb-5"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Wait for the script to finish running to see the output. ")
                  ]),
                  _: 1
                })) : (openBlock(), createBlock(_component_Paragraph, {
                  key: 1,
                  class: "self-start text-left mb-5"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Script output: ")
                  ]),
                  _: 1
                })),
                withDirectives(createVNode("div", { class: "flex justify-center" }, [
                  createVNode("div", {
                    class: "animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full",
                    role: "status",
                    "aria-label": "loading"
                  }, [
                    createVNode("span", { class: "sr-only" }, "Loading...")
                  ])
                ], 512), [
                  [vShow, scriptBusy.value]
                ]),
                outputMsg.value ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "whitespace-pre-line break-words text-left text-gray-200 rounded-2xl p-3 bg-gray-900"
                }, [
                  createVNode("pre", null, toDisplayString(JSON.stringify(outputMsg.value, null, 4)), 1)
                ])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex my-12 justify-center items-center gap-4">`);
      _push(ssrRenderComponent(_component_Paragraph, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Last Update script run: ${ssrInterpolate(data.value.lastRun)}`);
          } else {
            return [
              createTextVNode(" Last Update script run: " + toDisplayString(data.value.lastRun), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Button, {
        onClick: ($event) => runScript(),
        value: "Run now"
      }, null, _parent));
      _push(`</div><div class="flex mb-4 justify-center">`);
      _push(ssrRenderComponent(_component_Table, null, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_TableRow, { title: "true" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_TableTitleCell, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Label`);
                      } else {
                        return [
                          createTextVNode("Label")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_TableTitleCell, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Host`);
                      } else {
                        return [
                          createTextVNode("Host")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_TableTitleCell, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Provider`);
                      } else {
                        return [
                          createTextVNode("Provider")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_TableTitleCell, { class: "text-right" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Delete`);
                      } else {
                        return [
                          createTextVNode("Delete")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_TableTitleCell, null, {
                      default: withCtx(() => [
                        createTextVNode("Label")
                      ]),
                      _: 1
                    }),
                    createVNode(_component_TableTitleCell, null, {
                      default: withCtx(() => [
                        createTextVNode("Host")
                      ]),
                      _: 1
                    }),
                    createVNode(_component_TableTitleCell, null, {
                      default: withCtx(() => [
                        createTextVNode("Provider")
                      ]),
                      _: 1
                    }),
                    createVNode(_component_TableTitleCell, { class: "text-right" }, {
                      default: withCtx(() => [
                        createTextVNode("Delete")
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_TableRow, { title: "true" }, {
                default: withCtx(() => [
                  createVNode(_component_TableTitleCell, null, {
                    default: withCtx(() => [
                      createTextVNode("Label")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_TableTitleCell, null, {
                    default: withCtx(() => [
                      createTextVNode("Host")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_TableTitleCell, null, {
                    default: withCtx(() => [
                      createTextVNode("Provider")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_TableTitleCell, { class: "text-right" }, {
                    default: withCtx(() => [
                      createTextVNode("Delete")
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList(data.value.domains, (domain) => {
              _push2(ssrRenderComponent(_component_TableRow, {
                key: domain.domain
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_TableCell, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(domain.name)}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(domain.name), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_TableCell, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<a${ssrRenderAttr("href", "https://" + domain.url)} class="hover:underline"${_scopeId3}>${ssrInterpolate(domain.url)}</a>`);
                        } else {
                          return [
                            createVNode("a", {
                              href: "https://" + domain.url,
                              class: "hover:underline"
                            }, toDisplayString(domain.url), 9, ["href"])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_TableCell, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(domain.provider)}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(domain.provider), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_TableCell, {
                      onClick: ($event) => deleteDomain({ domain }),
                      class: "text-right"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<a class="text-blue-500 hover:text-blue-700 transition" href="#"${_scopeId3}>Delete</a>`);
                        } else {
                          return [
                            createVNode("a", {
                              class: "text-blue-500 hover:text-blue-700 transition",
                              href: "#"
                            }, "Delete")
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_TableCell, null, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(domain.name), 1)
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_TableCell, null, {
                        default: withCtx(() => [
                          createVNode("a", {
                            href: "https://" + domain.url,
                            class: "hover:underline"
                          }, toDisplayString(domain.url), 9, ["href"])
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_TableCell, null, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(domain.provider), 1)
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_TableCell, {
                        onClick: ($event) => deleteDomain({ domain }),
                        class: "text-right"
                      }, {
                        default: withCtx(() => [
                          createVNode("a", {
                            class: "text-blue-500 hover:text-blue-700 transition",
                            href: "#"
                          }, "Delete")
                        ]),
                        _: 2
                      }, 1032, ["onClick"])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]-->`);
            _push2(ssrRenderComponent(_component_TableRow, { title: "true" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_TableCell, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_Input, {
                          placeholder: "New Domain Label",
                          modelValue: formData.value.domainLabel,
                          "onUpdate:modelValue": ($event) => formData.value.domainLabel = $event
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_Input, {
                            placeholder: "New Domain Label",
                            modelValue: formData.value.domainLabel,
                            "onUpdate:modelValue": ($event) => formData.value.domainLabel = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_TableCell, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_Input, {
                          placeholder: "New Domain",
                          modelValue: formData.value.domainURL,
                          "onUpdate:modelValue": ($event) => formData.value.domainURL = $event
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_Input, {
                            placeholder: "New Domain",
                            modelValue: formData.value.domainURL,
                            "onUpdate:modelValue": ($event) => formData.value.domainURL = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_TableCell, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_Select, {
                          modelValue: formData.value.domainProvider,
                          "onUpdate:modelValue": ($event) => formData.value.domainProvider = $event,
                          placeholder: "Provider"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<option selected disabled hidden${_scopeId4}>Select a provider</option><!--[-->`);
                              ssrRenderList(data.value.providers, (provider) => {
                                _push5(`<option${ssrRenderAttr("value", provider)}${_scopeId4}>${ssrInterpolate(provider)}</option>`);
                              });
                              _push5(`<!--]-->`);
                            } else {
                              return [
                                createVNode("option", {
                                  selected: "",
                                  disabled: "",
                                  hidden: ""
                                }, "Select a provider"),
                                (openBlock(true), createBlock(Fragment, null, renderList(data.value.providers, (provider) => {
                                  return openBlock(), createBlock("option", {
                                    key: provider,
                                    value: provider
                                  }, toDisplayString(provider), 9, ["value"]);
                                }), 128))
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_Select, {
                            modelValue: formData.value.domainProvider,
                            "onUpdate:modelValue": ($event) => formData.value.domainProvider = $event,
                            placeholder: "Provider"
                          }, {
                            default: withCtx(() => [
                              createVNode("option", {
                                selected: "",
                                disabled: "",
                                hidden: ""
                              }, "Select a provider"),
                              (openBlock(true), createBlock(Fragment, null, renderList(data.value.providers, (provider) => {
                                return openBlock(), createBlock("option", {
                                  key: provider,
                                  value: provider
                                }, toDisplayString(provider), 9, ["value"]);
                              }), 128))
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_TableCell, { class: "flex flex-row-reverse" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_Button, {
                          onClick: ($event) => addDomain()
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Add`);
                            } else {
                              return [
                                createTextVNode("Add")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_Button, {
                            onClick: ($event) => addDomain()
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Add")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_TableCell, null, {
                      default: withCtx(() => [
                        createVNode(_component_Input, {
                          placeholder: "New Domain Label",
                          modelValue: formData.value.domainLabel,
                          "onUpdate:modelValue": ($event) => formData.value.domainLabel = $event
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_TableCell, null, {
                      default: withCtx(() => [
                        createVNode(_component_Input, {
                          placeholder: "New Domain",
                          modelValue: formData.value.domainURL,
                          "onUpdate:modelValue": ($event) => formData.value.domainURL = $event
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_TableCell, null, {
                      default: withCtx(() => [
                        createVNode(_component_Select, {
                          modelValue: formData.value.domainProvider,
                          "onUpdate:modelValue": ($event) => formData.value.domainProvider = $event,
                          placeholder: "Provider"
                        }, {
                          default: withCtx(() => [
                            createVNode("option", {
                              selected: "",
                              disabled: "",
                              hidden: ""
                            }, "Select a provider"),
                            (openBlock(true), createBlock(Fragment, null, renderList(data.value.providers, (provider) => {
                              return openBlock(), createBlock("option", {
                                key: provider,
                                value: provider
                              }, toDisplayString(provider), 9, ["value"]);
                            }), 128))
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_TableCell, { class: "flex flex-row-reverse" }, {
                      default: withCtx(() => [
                        createVNode(_component_Button, {
                          onClick: ($event) => addDomain()
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Add")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              (openBlock(true), createBlock(Fragment, null, renderList(data.value.domains, (domain) => {
                return openBlock(), createBlock(_component_TableRow, {
                  key: domain.domain
                }, {
                  default: withCtx(() => [
                    createVNode(_component_TableCell, null, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(domain.name), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_TableCell, null, {
                      default: withCtx(() => [
                        createVNode("a", {
                          href: "https://" + domain.url,
                          class: "hover:underline"
                        }, toDisplayString(domain.url), 9, ["href"])
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_TableCell, null, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(domain.provider), 1)
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_TableCell, {
                      onClick: ($event) => deleteDomain({ domain }),
                      class: "text-right"
                    }, {
                      default: withCtx(() => [
                        createVNode("a", {
                          class: "text-blue-500 hover:text-blue-700 transition",
                          href: "#"
                        }, "Delete")
                      ]),
                      _: 2
                    }, 1032, ["onClick"])
                  ]),
                  _: 2
                }, 1024);
              }), 128)),
              createVNode(_component_TableRow, { title: "true" }, {
                default: withCtx(() => [
                  createVNode(_component_TableCell, null, {
                    default: withCtx(() => [
                      createVNode(_component_Input, {
                        placeholder: "New Domain Label",
                        modelValue: formData.value.domainLabel,
                        "onUpdate:modelValue": ($event) => formData.value.domainLabel = $event
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_TableCell, null, {
                    default: withCtx(() => [
                      createVNode(_component_Input, {
                        placeholder: "New Domain",
                        modelValue: formData.value.domainURL,
                        "onUpdate:modelValue": ($event) => formData.value.domainURL = $event
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_TableCell, null, {
                    default: withCtx(() => [
                      createVNode(_component_Select, {
                        modelValue: formData.value.domainProvider,
                        "onUpdate:modelValue": ($event) => formData.value.domainProvider = $event,
                        placeholder: "Provider"
                      }, {
                        default: withCtx(() => [
                          createVNode("option", {
                            selected: "",
                            disabled: "",
                            hidden: ""
                          }, "Select a provider"),
                          (openBlock(true), createBlock(Fragment, null, renderList(data.value.providers, (provider) => {
                            return openBlock(), createBlock("option", {
                              key: provider,
                              value: provider
                            }, toDisplayString(provider), 9, ["value"]);
                          }), 128))
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_TableCell, { class: "flex flex-row-reverse" }, {
                    default: withCtx(() => [
                      createVNode(_component_Button, {
                        onClick: ($event) => addDomain()
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Add")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_Paragraph, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (showInvalidDomainLabel.value) {
              _push2(`<div class="text-red-500"${_scopeId}> Invalid domain label or domain name. </div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              showInvalidDomainLabel.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: "text-red-500"
              }, " Invalid domain label or domain name. ")) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch$1.create({
    baseURL: baseURL()
  });
}
let entry;
const plugins = normalizePlugins(_plugins);
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main$a);
    vueApp.component("App", _sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (err) {
      await nuxt.callHook("app:error", err);
      nuxt.payload.error = nuxt.payload.error || err;
    }
    return vueApp;
  };
}
const entry$1 = (ctx) => entry(ctx);

export { _export_sfc as _, __nuxt_component_0 as a, entry$1 as default, useHead as u };
//# sourceMappingURL=server.mjs.map
