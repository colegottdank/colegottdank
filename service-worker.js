"use strict";function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}var precacheConfig=[["colegottdank.github.io/colegottdank/index.html","ec994e3c06f033b25b41187aaba25de6"],["colegottdank.github.io/colegottdank/static/css/main.89f1f6fb.css","a26ee8cc2c11b733cb6a469ba7374bf7"],["colegottdank.github.io/colegottdank/static/js/main.0e08db96.js","3dcfc0745cdad567f872167a1b61d2fe"],["colegottdank.github.io/colegottdank/static/media/ColeGottdank_copy.0d9a970d.png","0d9a970d4fcc44469c4c0a7ee1a22aea"],["colegottdank.github.io/colegottdank/static/media/flags.9c74e172.png","9c74e172f87984c48ddf5c8108cabe67"],["colegottdank.github.io/colegottdank/static/media/icons.674f50d2.eot","674f50d287a8c48dc19ba404d20fe713"],["colegottdank.github.io/colegottdank/static/media/icons.912ec66d.svg","912ec66d7572ff821749319396470bde"],["colegottdank.github.io/colegottdank/static/media/icons.af7ae505.woff2","af7ae505a9eed503f8b8e6982036873e"],["colegottdank.github.io/colegottdank/static/media/icons.b06871f2.ttf","b06871f281fee6b241d60582ae9369b9"],["colegottdank.github.io/colegottdank/static/media/icons.fee66e71.woff","fee66e712a8a08eef5805a46892932ad"],["colegottdank.github.io/colegottdank/static/media/logo2.25b4315c.png","25b4315c863ec7b649be2964da4370c3"],["colegottdank.github.io/colegottdank/static/media/logo_transparent.a27d7f90.png","a27d7f904f3aedfffed423f9c4237179"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,t){var n=new URL(e);return"/"===n.pathname.slice(-1)&&(n.pathname+=t),n.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(t){return new Response(t,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,t,n,a){var o=new URL(e);return a&&o.pathname.match(a)||(o.search+=(o.search?"&":"")+encodeURIComponent(t)+"="+encodeURIComponent(n)),o.toString()},isPathWhitelisted=function(e,t){if(0===e.length)return!0;var n=new URL(t).pathname;return e.some(function(e){return n.match(e)})},stripIgnoredUrlParameters=function(e,t){var n=new URL(e);return n.hash="",n.search=n.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return t.every(function(t){return!t.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),n.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var t=e[0],n=e[1],a=new URL(t,self.location),o=createCacheKey(a,hashParamName,n,/\.\w{8}\./);return[a.toString(),o]}));self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(n){if(!t.has(n)){var a=new Request(n,{credentials:"same-origin"});return fetch(a).then(function(t){if(!t.ok)throw new Error("Request for "+n+" returned a response with status "+t.status);return cleanResponse(t).then(function(t){return e.put(n,t)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(n){return Promise.all(n.map(function(n){if(!t.has(n.url))return e.delete(n)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var t,n=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(t=urlsToCacheKeys.has(n))||(n=addDirectoryIndex(n,"index.html"),t=urlsToCacheKeys.has(n));!t&&"navigate"===e.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],e.request.url)&&(n=new URL("colegottdank.github.io/colegottdank/index.html",self.location).toString(),t=urlsToCacheKeys.has(n)),t&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(n)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(t){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,t),fetch(e.request)}))}});