var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone = {};
  for (const key in obj) {
    clone[key.toLowerCase()] = obj[key];
  }
  return clone;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
const subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
const escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
const escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
const s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${page && page.path ? try_serialize(page.path, (error3) => {
      throw new Error(`Failed to serialize page.path: ${error3.message}`);
    }) : null},
						query: new URLSearchParams(${page && page.query ? s$1(page.query.toString()) : ""}),
						params: ${page && page.params ? try_serialize(page.params, (error3) => {
      throw new Error(`Failed to serialize page.params: ${error3.message}`);
    }) : null}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
const s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const prefix = options2.paths.assets || options2.paths.base;
        const filename = (resolved.startsWith(prefix) ? resolved.slice(prefix.length) : resolved).slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
const absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
class ReadOnlyFormData {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
}
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
const escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function afterUpdate() {
}
var root_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: null
};
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$1);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
let base = "";
let assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
const template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
let options = null;
const default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-e4e7bd94.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-e4e7bd94.js", assets + "/_app/chunks/vendor-145a45d6.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
const empty = () => ({});
const manifest = {
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }],
  layout: ".svelte-kit/build/components/layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: [".svelte-kit/build/components/layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
const get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
const module_lookup = {
  ".svelte-kit/build/components/layout.svelte": () => Promise.resolve().then(function() {
    return layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  })
};
const metadata_lookup = { ".svelte-kit/build/components/layout.svelte": { "entry": "layout.svelte-57c59828.js", "css": [], "js": ["layout.svelte-57c59828.js", "chunks/vendor-145a45d6.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-5473c439.js", "css": [], "js": ["error.svelte-5473c439.js", "chunks/vendor-145a45d6.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-aae3708d.js", "css": ["assets/pages/index.svelte-200b3773.css"], "js": ["pages/index.svelte-aae3708d.js", "chunks/vendor-145a45d6.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
var layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Layout
});
function load({ error: error2, status }) {
  return { props: { error: error2, status } };
}
const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var index_svelte_svelte_type_style_lang = "";
const css = {
  code: `@font-face{font-family:'orbitron';src:url("public\\Orbitron-Regular.ttf")}@font-face{font-family:'mono';src:local('public\\ShareTechMono-Regular.ttf')}body{scroll-behavior:smooth;margin:0;padding:0;background-color:#000;background-repeat:no-repeat;background-size:cover;background-position:center;font-family:orbitron;overflow-x:hidden;margin:0;padding:0}.anchor.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{display:block;position:relative;visibility:hidden}.nav.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{z-index:100;padding-left:4vh;padding-right:4vh;height:7vh;background-color:#000;box-sizing:border-box;position:fixed;width:100%;transition:all 0.3s ease-in-out}.nav.svelte-j7uxv1 a.svelte-j7uxv1.svelte-j7uxv1{padding:2.5vh 2.8vh 2.6vh 1.2vh;float:right;text-transform:uppercase;font-size:1.7vh;font-weight:500;text-decoration:none;color:#fff;transition:all 0.2s ease-in-out}.nav.svelte-j7uxv1>.nav-logo.svelte-j7uxv1.svelte-j7uxv1{padding:1vh 0 3vh 5vh;float:left;position:relative;left:5vh}.nav-logo.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{height:5vh;margin:0;transition:all 0.3s ease-in-out}img.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1:hover{transform:rotate(360deg)}.nav.svelte-j7uxv1 a.svelte-j7uxv1.svelte-j7uxv1{font-size:1.5vh}.nav.svelte-j7uxv1 a.svelte-j7uxv1.svelte-j7uxv1:hover{transform:scale(1.2)}.nav.svelte-j7uxv1>.nav-active.svelte-j7uxv1.svelte-j7uxv1{color:#39b44a}@media(max-width: 60vh){.nav.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{display:none}}.nav.svelte-j7uxv1 a.svelte-j7uxv1.svelte-j7uxv1{float:center;font-size:1.3vh}@import url('https://fonts.googleapis.com/css?family=Poppins:400,500,600,700&display=swap');.wrapper.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{z-index:200;position:fixed;top:0;left:0;height:100%;width:100%;background:linear-gradient( #39b44a, #0B6623);clip-path:circle(25px at calc(100% - 60px) 4.5vh);transition:all 0.3s ease-in-out}#active.svelte-j7uxv1:checked~.wrapper.svelte-j7uxv1.svelte-j7uxv1{clip-path:circle(75%)}.menu-btn.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{position:fixed;z-index:201;right:1.4vh;top:2vh;height:5vh;width:5vh;text-align:center;line-height:5vh;border-radius:50%;font-size:2vh;color:#fff;cursor:pointer;background:#000;transition:all 0.3s ease-in-out}#active.svelte-j7uxv1:checked~.menu-btn.svelte-j7uxv1.svelte-j7uxv1{background:#fff;color:#39b44a}#active:checked~.menu-btn.svelte-j7uxv1 i.svelte-j7uxv1.svelte-j7uxv1:before{content:"\\f00d"}.wrapper.svelte-j7uxv1 ul.svelte-j7uxv1.svelte-j7uxv1{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);list-style:none;text-align:center}.wrapper.svelte-j7uxv1 ul.svelte-j7uxv1 li.svelte-j7uxv1{margin:15px 0}.wrapper.svelte-j7uxv1 ul li a.svelte-j7uxv1.svelte-j7uxv1{color:none;text-decoration:none;font-size:4vh;font-weight:500;padding:5px 30px;color:#fff;position:relative;line-height:5vh;transition:all 0.3s ease}.wrapper.svelte-j7uxv1 ul li a.svelte-j7uxv1.svelte-j7uxv1:after{position:absolute;content:"";background:#000;width:100%;height:100px;left:0;border-radius:50px;transform:scaleY(0);z-index:-1;transition:transform 0.3s ease}.wrapper.svelte-j7uxv1 ul li a.svelte-j7uxv1.svelte-j7uxv1:hover:after{transform:scaleY(1)}.wrapper.svelte-j7uxv1 ul li a.svelte-j7uxv1.svelte-j7uxv1:hover{color:#fff}input[type="checkbox"].svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{display:none}@media(min-width: 60vh){.wrapper.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{display:none}.menu-btn.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{display:none}}.splash.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{width:100%;height:100%;overflow-x:visible;display:flex}.splash-title.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{box-sizing:border-box;padding-top:10%;padding-left:7.5%;position:absolute;top:40%;-ms-transform:translateY(-50%);transform:translateY(-50%)}.splash-title.svelte-j7uxv1 h1.svelte-j7uxv1.svelte-j7uxv1{color:#000;text-align:unset;font-weight:500;font-size:500%;line-height:0.4}.splash-title.svelte-j7uxv1 p.svelte-j7uxv1.svelte-j7uxv1{color:#000;margin-top:-10px;font-size:24px;text-transform:uppercase}.splash.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{align-self:center;margin:0 0 0 50px;width:50%;object-fit:contain}.splash-title.svelte-j7uxv1 b.svelte-j7uxv1.svelte-j7uxv1{color:#0b6623;font-weight:700}@media(max-width: 60vh){.splash-title.svelte-j7uxv1 h1.svelte-j7uxv1.svelte-j7uxv1{font-size:1000%}.splash-title.svelte-j7uxv1 p.svelte-j7uxv1.svelte-j7uxv1{color:#000;font-size:48px}}.about.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{height:150vh}.about.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{border-width:0.5vh;border-style:solid ;border-image:linear-gradient(to right, #0B6623, #9bcc33) 1}h1.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{text-align:center;font-size:42px;font-weight:600;font-family:orbitron}.about.svelte-j7uxv1 p.svelte-j7uxv1.svelte-j7uxv1{text-align:left;font-size:2.6vh;font-family:mono;text-align:center}.align1.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{padding-left:10vw;padding-right:40vw;margin-top:15vh}.align2.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{margin-top:17vh;padding-left:40vw;padding-right:15vw}.align3.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{padding-left:10vw;padding-right:40vw;margin-top:20vh}.align4.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{text-align:center;margin-top:10vh;padding-left:20vw;padding-right:20vw}.aboutimage1.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{position:relative;margin-top:-25vh;border-radius:0px;margin-left:65vw;width:20vw;height:auto;display:flex;align-items:center}.aboutimage2.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{position:relative;border-radius:0px;margin-left:10vw;margin-top:-25vh;width:20vw;height:auto;display:flex;align-items:center}.aboutimage3.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{position:relative;margin-top:-25vh;border-radius:0px;margin-left:65vw;width:20vw;height:auto;display:flex;align-items:center}.about.svelte-j7uxv1 b.svelte-j7uxv1.svelte-j7uxv1{color:#39b44a}@media(max-width: 60vh){.aboutimage1.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{padding-left:0;padding-right:0;margin-left:auto;margin-right:auto;margin-top:0vh;width:60vw;left:0;right:0;text-align:center;border-radius:0px}.aboutimage2.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{padding-left:0;padding-right:0;margin-left:auto;margin-right:auto;margin-top:auto;width:60vw;left:0;right:0;text-align:center;border-radius:0px}.aboutimage3.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{padding-left:0;padding-right:0;margin-left:auto;margin-right:auto;margin-top:0vh;width:60vw;left:0;right:0;text-align:center;border-radius:0px}.about.svelte-j7uxv1 p.svelte-j7uxv1.svelte-j7uxv1{font-size:1.5vh}.align1.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{text-align:center;padding-left:10vw;padding-right:10vw;margin:0}.align2.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{margin-left:0;text-align:center;padding-left:10vw;padding-right:10vw;margin-top:0vh}.align3.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{margin-top:0vh;text-align:center;padding-left:10vw;padding-right:10vw}.align4.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{margin-top:0vh;text-align:center;padding-left:10vw;padding-right:10vw}}.terminal.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{animation:svelte-j7uxv1-blink 1s infinite step-end}@keyframes svelte-j7uxv1-blink{from,to{opacity:0}50%{opacity:1}}.alignCAD.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{width:100%;position:absolute;left:45%;top:55%;-ms-transform:translateY(-50%);transform:translateY(-50%)}.splash.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{height:100vh;width:100%}.aboutus.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{height:100vh;color:#fff;position:relative}@media(max-width: 60vh){.alignCAD.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{display:none}}@media(max-width: 80vh){.alignCAD.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{top:35vh}}.area.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{background:#39b44a;background:-webkit-linear-gradient(to left, rgb(10, 124, 0), rgb(17, 88, 27));width:100%;height:100vh;overflow:hidden;position:absolute;background-position:center center}.circles.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{background-position:center center;position:absolute;top:5;left:0;width:100%;height:100vh;overflow:hidden}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1{position:absolute;display:block;list-style:none;width:20px;height:20px;background:rgba(255, 255, 255, 0.479);animation:svelte-j7uxv1-animate 25s linear infinite;bottom:-150px}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(1){left:25%;width:80px;height:80px;animation-delay:0s}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(2){left:10%;width:20px;height:20px;animation-delay:2s;animation-duration:12s}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(3){left:70%;width:20px;height:20px;animation-delay:4s}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(4){left:40%;width:60px;height:60px;animation-delay:0s;animation-duration:18s}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(5){left:65%;width:20px;height:20px;animation-delay:0s}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(6){left:75%;width:110px;height:110px;animation-delay:3s}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(7){left:35%;width:150px;height:150px;animation-delay:7s}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(8){left:50%;width:25px;height:25px;animation-delay:15s;animation-duration:45s}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(9){left:20%;width:15px;height:15px;animation-delay:2s;animation-duration:35s}.circles.svelte-j7uxv1 li.svelte-j7uxv1.svelte-j7uxv1:nth-child(10){left:85%;width:150px;height:150px;animation-delay:0s;animation-duration:11s}@keyframes svelte-j7uxv1-animate{0%{transform:translateY(0) rotate(0deg);opacity:1;border-radius:0}100%{transform:translateY(-1000px) rotate(720deg);opacity:0;border-radius:50%}}.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{box-sizing:border-box}.timeline.svelte-j7uxv1 h1.svelte-j7uxv1.svelte-j7uxv1{position:relative;text-align:center;font-weight:600;font-family:orbitron;position:relative;color:#fff;margin:auto;top:-5vh}.timeline.svelte-j7uxv1 b.svelte-j7uxv1.svelte-j7uxv1{color:#39b44a}.timeline.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{position:absolute;left:50%;transform:translateX(-50%);border-width:4px;border-style:solid;border-image:linear-gradient(to right, #0B6623, #9bcc33) 1;margin-top:2vh;background:#39b44a}.timeline.svelte-j7uxv1 h2.svelte-j7uxv1.svelte-j7uxv1{color:#000}.timeline.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{position:relative;left:0;right:0;margin-left:auto;margin-right:auto;max-width:1500px;top:35vh;font-family:mono}@media(min-width: 60vh){.timeline.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{top:60vh}.timeline.svelte-j7uxv1 h1.svelte-j7uxv1.svelte-j7uxv1{top:-7vh}}@media(max-width: 60vh){.timeline.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{top:25vh}}.timeline.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1::after{content:'';position:absolute;width:6px;background-color:#333333;top:0;bottom:0;left:50%;margin-left:-3px}.container.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{padding:10px 40px;position:relative;background-color:inherit;width:50%}.container.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1::after{content:'';position:absolute;width:25px;height:25px;right:-17px;background-color:#333333;border:4px solid #39b44a;top:15px;border-radius:50%;z-index:1}.left.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{left:0}.right.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{left:50%}.left.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1::before{content:" ";height:0;position:absolute;top:22px;width:0;z-index:1;right:30px;border:medium solid #39b44a;border-width:10px 0 10px 10px;border-color:transparent transparent transparent #39b44a}.right.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1::before{content:" ";height:0;position:absolute;top:22px;width:0;z-index:1;left:30px;border:medium solid #39b44a;border-width:10px 10px 10px 0;border-color:transparent #39b44a transparent transparent}.right.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1::after{left:-16px}.rightimg.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{left:50%}.containerimg.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{padding:10px 40px;position:relative;background-color:inherit;width:50%}.content.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{padding:20px 30px;background-color:#39b44a;position:relative;border-radius:15px}@media screen and (max-width: 600px){.timeline.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1::after{left:31px}.container.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{width:100%;padding-left:70px;padding-right:25px}.container.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1::before{left:60px;border:medium solid #404040;border-width:10px 10px 10px 0;border-color:transparent #39b44a transparent transparent}.left.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1::after,.right.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1::after{left:15px}.right.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{left:0%}}hr.new5.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{border:3px solid #333333;border-radius:3px}.img2021.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{width:400px;height:auto}.img2020.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{height:auto;width:370px}.img2019.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{height:auto;width:350px}.img2018.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{height:auto;width:330px}@media(max-width: 60vh){.img2020.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{margin-top:3vh}.img2019.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{margin-top:3vh}.img2021.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{margin-top:1vh}}.linkssection.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{position:relative;top:85vh}@media(max-width: 60vh){.linkssection.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{top:60vh}}.linkssection.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{position:relative;width:19.5vw;height:auto}.logosection.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{position:relative;top:80vh}.logosection.svelte-j7uxv1 img.svelte-j7uxv1.svelte-j7uxv1{height:auto;width:32vw}@media(max-width: 60vh){.logosection.svelte-j7uxv1.svelte-j7uxv1.svelte-j7uxv1{top:55vh}}`,
  map: null
};
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `







<main class="${"svelte-j7uxv1"}"><meta name="${"viewport"}" content="${"user-scalable=0;"}" class="${"svelte-j7uxv1"}"><div class="${"HTML svelte-j7uxv1"}">
	
	  <nav class="${"nav svelte-j7uxv1"}" id="${"navbar"}"><a href="${"/members.html"}" class="${"svelte-j7uxv1"}">&gt;Members<span class="${"terminal svelte-j7uxv1"}">_</span></a>
		<a href="${"#home"}" class="${"nav-active svelte-j7uxv1"}">&gt;Home<span class="${"terminal svelte-j7uxv1"}">_</span></a>
		<a class="${"nav-logo svelte-j7uxv1"}" href="${"#home"}"><img src="${"public\\logo.png"}" id="${"navbar-logo"}" alt="${"Logo"}" class="${"svelte-j7uxv1"}"></a></nav>
	  <div id="${"main"}" class="${"svelte-j7uxv1"}"></div>

	

	  <link rel="${"stylesheet"}" href="${"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"}" class="${"svelte-j7uxv1"}">
	  <input type="${"checkbox"}" id="${"active"}" class="${"svelte-j7uxv1"}">
      <label for="${"active"}" class="${"menu-btn svelte-j7uxv1"}"><i class="${"fas fa-bars svelte-j7uxv1"}"></i></label>
      <div class="${"wrapper svelte-j7uxv1"}"><ul class="${"svelte-j7uxv1"}"><li class="${"svelte-j7uxv1"}"><a href="${"/projects"}" class="${"svelte-j7uxv1"}">Home</a></li>
            <li class="${"svelte-j7uxv1"}"><a href="${"#home"}" class="${"svelte-j7uxv1"}">About</a></li>
            <li class="${"svelte-j7uxv1"}"><a href="${"#home"}" class="${"svelte-j7uxv1"}">Services</a></li>
            <li class="${"svelte-j7uxv1"}"><a href="${"#home"}" class="${"svelte-j7uxv1"}">Gallery</a></li>
            <li class="${"svelte-j7uxv1"}"><a href="${"#home"}" class="${"svelte-j7uxv1"}">Feedback</a></li></ul></div>

	

	

	  <div class="${"splash svelte-j7uxv1"}"><div class="${"splash svelte-j7uxv1"}" id="${"home"}">${``}
			${``}
		<div class="${"always-visible svelte-j7uxv1"}">${``}</div></div></div>
	  <div class="${"aboutus svelte-j7uxv1"}"><div class="${"about svelte-j7uxv1"}"><span class="${"anchor svelte-j7uxv1"}" id="${"about"}" style="${"top: -80px"}"></span>
		<h1 class="${"svelte-j7uxv1"}">&gt;We are <b class="${"svelte-j7uxv1"}">InfO(1)Robotics</b><span class="${"terminal svelte-j7uxv1"}">_</span></h1>
		
			
		<div class="${"align1 svelte-j7uxv1"}"><p class="${"svelte-j7uxv1"}">&gt;<b class="${"svelte-j7uxv1"}">We</b> are the <b class="${"svelte-j7uxv1"}">infO(1)Robotics</b> Team \u2013 RO 140 - from \u201CIon Luca Caragiale\u201D
		  High School, Ploiesti, Romania. Our team started out in April
		  2018, and it is coordinated by our main mentor Daniela Lica, a Computer
		  \u2013 Programming teacher<span class="${"terminal svelte-j7uxv1"}">_</span>
		<br class="${"svelte-j7uxv1"}"></p></div><div class="${"aboutimage1 svelte-j7uxv1"}"><img src="${"public\\soarecolor.jpg"}" alt="${"Soare"}" class="${"svelte-j7uxv1"}"></div>
			
		<div class="${"align2 svelte-j7uxv1"}"><p class="${"svelte-j7uxv1"}">&gt;<b class="${"svelte-j7uxv1"}">Our team</b> is composed of 15 members and 59 volunteers and each of them is currently
			working in the STEM fields with extracurricular activities which fit their sub-teams.
			<b class="${"svelte-j7uxv1"}">We</b> started out with no budget and has been gradually building up its financial
			resources<span class="${"terminal svelte-j7uxv1"}">_</span></p></div><div class="${"aboutimage2 svelte-j7uxv1"}"><img src="${"public\\robotcolor.jpg"}" alt="${"Soare"}" class="${"svelte-j7uxv1"}"></div>
		
		<div class="${"align3 svelte-j7uxv1"}"><p class="${"svelte-j7uxv1"}">&gt;<b class="${"svelte-j7uxv1"}">infO(1)Robotics</b> is currently participating at <b class="${"svelte-j7uxv1"}">FIRST Tech Challenge</b> and expects to
			develop a greater knowledge for the future\u2019s main goal: Robots and Artificial
			Intelligence<span class="${"terminal svelte-j7uxv1"}">_</span></p></div><div class="${"aboutimage3 svelte-j7uxv1"}"><img src="${"public\\flcolor.jpg"}" alt="${"Soare"}" class="${"svelte-j7uxv1"}"></div>
		<div class="${"align4 svelte-j7uxv1"}"><p class="${"svelte-j7uxv1"}">&gt;<b class="${"svelte-j7uxv1"}">We</b> combine work and pleasure, we <b class="${"svelte-j7uxv1"}">as a team</b> 
			always train hard but in an enjoyable way. By
			sharing opinions and learning about team work, we believe we can get creative
			enough to someday find a revolutionary and feasible idea of a robot that could
			unbelievably save humanity in its own way<span class="${"terminal svelte-j7uxv1"}">_</span></p></div></div></div>

<div class="${"timeline svelte-j7uxv1"}"><hr class="${"new5 svelte-j7uxv1"}">
		<h1 class="${"svelte-j7uxv1"}">&gt;Our <b class="${"svelte-j7uxv1"}">Time</b>line<span class="${"terminal svelte-j7uxv1"}">_</span></h1>
	<div class="${"containerimg rightimg svelte-j7uxv1"}"><div class="${"img2021 svelte-j7uxv1"}"><img src="${"public\\2021.png"}" alt="${"SampleImage"}" class="${"svelte-j7uxv1"}"></div></div>

	<div class="${"container left svelte-j7uxv1"}"><div class="${"content svelte-j7uxv1"}"><h2 style="${"font-family:orbitron"}" class="${"svelte-j7uxv1"}">&gt;2021 - PRESENT<span class="${"terminal svelte-j7uxv1"}">_</span></h2>
		<p class="${"svelte-j7uxv1"}">&gt;Currently, with new members on the team, Inf0(1) Robotics is looking forward to competing in this season.<span class="${"terminal svelte-j7uxv1"}">_</span></p></div>		<div class="${"img2020 svelte-j7uxv1"}"><img src="${"public\\2020.gif"}" alt="${"SampleImage"}" class="${"svelte-j7uxv1"}"></div></div>

	<div class="${"container right svelte-j7uxv1"}"><div class="${"content svelte-j7uxv1"}"><h2 style="${"font-family:orbitron"}" class="${"svelte-j7uxv1"}">&gt;2020-2021<span class="${"terminal svelte-j7uxv1"}">_</span></h2>
		<p class="${"svelte-j7uxv1"}">&gt;As the pandemic continued, Ultimate Goal has been a challenging season where demos and events were held remote.
			 In that season we created Po(1)cast where we invited a lot of teams and members from the FTC community.
			At the Bucharest Regional, Inf0(1) Robotics won Control Award for its robot great autonomous period<span class="${"terminal svelte-j7uxv1"}">_</span></p>
		
	</div><div class="${"img2019 svelte-j7uxv1"}"><img src="${"public\\2019.jpg"}" alt="${"SampleImage"}" class="${"svelte-j7uxv1"}"></div></div>
	<div class="${"container left svelte-j7uxv1"}"><div class="${"content svelte-j7uxv1"}"><h2 style="${"font-family:orbitron"}" class="${"svelte-j7uxv1"}">&gt;2019-2020<span class="${"terminal svelte-j7uxv1"}">_</span></h2>
		<p class="${"svelte-j7uxv1"}">&gt;During the Skystone season, Inf0(1) Robotics created numerous events (e.g. Inf0(1) Talks, Inf0(1) Demo, etc.) and won a great deal 
			of demos (e.g. Qube Demo, RobotX Demo etc.). When the pandemic started, we decided to create plastic face-shields for medical staff in 
			need. We donated a total of 2401 face-shields to 32 institutions. Inf0(1) Robotics won Inspire 1 at Bucharest Regional<span class="${"terminal svelte-j7uxv1"}">_</span></p></div>		<div class="${"img2018 svelte-j7uxv1"}"><img src="${"public\\2018.jpg"}" alt="${"SampleImage"}" class="${"svelte-j7uxv1"}"></div></div>
	<div class="${"container right svelte-j7uxv1"}"><div class="${"content svelte-j7uxv1"}"><h2 style="${"font-family:orbitron"}" class="${"svelte-j7uxv1"}">&gt;2018-2019<span class="${"terminal svelte-j7uxv1"}">_</span></h2>
		<p class="${"svelte-j7uxv1"}">&gt;Inf0(1) Robotics estabilished in late octomber and, as rookies, we faced a lot of problems. Despite our first year, we won the Bucharest
			 Regional as 2nd pick and at the National Stage, we won Inspire 3<span class="${"terminal svelte-j7uxv1"}">_</span></p></div></div>
	<br class="${"svelte-j7uxv1"}">
	<hr class="${"new5 svelte-j7uxv1"}"></div>

<div class="${"logosection svelte-j7uxv1"}"><a href="${"http://www.cn-caragiale.ro/"}" class="${"svelte-j7uxv1"}"><img src="${"public\\cnilc.png"}" alt="${"INSTAGRAM"}" class="${"svelte-j7uxv1"}"></a>
	<a href="${"https://natieprineducatie.ro/"}" class="${"svelte-j7uxv1"}"><img src="${"public\\brd.png"}" alt="${"FTC"}" style="${"margin-left:1%;"}" class="${"svelte-j7uxv1"}"></a>
	<a href="${"https://www.instagram.com/info1robotics/"}" class="${"svelte-j7uxv1"}"><img src="${"public\\logo1.png"}" alt="${"INSTAGRAM"}" class="${"svelte-j7uxv1"}"></a></div>
<div class="${"linkssection svelte-j7uxv1"}"><a href="${"https://www.instagram.com/info1robotics/"}" class="${"svelte-j7uxv1"}"><img src="${"public\\instagram.png"}" alt="${"INSTAGRAM"}" class="${"svelte-j7uxv1"}"></a>
	<a href="${"https://www.facebook.com/info1robotics/"}" class="${"svelte-j7uxv1"}"><img src="${"public\\facebook.png"}" alt="${"FACEBOOK"}" class="${"svelte-j7uxv1"}"></a>
	<a href="${"https://www.youtube.com/channel/UC6PkNCRNEQOfKuciVltqzTQ"}" class="${"svelte-j7uxv1"}"><img src="${"public\\youtube.png"}" alt="${"YOUTUBE"}" class="${"svelte-j7uxv1"}"></a>
	<a href="${"https://open.spotify.com/show/6glFbyo8OnIqih7RuPjB1e"}" class="${"svelte-j7uxv1"}"><img src="${"public\\spotify.png"}" alt="${"SPOTIFY"}" class="${"svelte-j7uxv1"}"></a>
	<a href="${"mailto: info1robotics@gmail.com"}" class="${"svelte-j7uxv1"}"><img src="${"public\\email.png"}" alt="${"EMAIL"}" class="${"svelte-j7uxv1"}"></a></div></div></main>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
export { init, render };
