!function(e,t,r,n,o){var i="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},l="function"==typeof i.parcelRequire0b9c&&i.parcelRequire0b9c,u=l.cache||{},c="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function s(t,r){if(!u[t]){if(!e[t]){var n="function"==typeof i.parcelRequire0b9c&&i.parcelRequire0b9c;if(!r&&n)return n(t,!0);if(l)return l(t,!0);if(c&&"string"==typeof t)return c(t);var o=new Error("Cannot find module '"+t+"'");throw o.code="MODULE_NOT_FOUND",o}f.resolve=function(r){return e[t][1][r]||r},f.cache={};var a=u[t]=new s.Module(t);e[t][0].call(a.exports,f,a,a.exports,this)}return u[t].exports;function f(e){return s(f.resolve(e))}}s.isParcelRequire=!0,s.Module=function(e){this.id=e,this.bundle=s,this.exports={}},s.modules=e,s.cache=u,s.parent=l,s.register=function(t,r){e[t]=[function(e,t){t.exports=r},{}]},Object.defineProperty(s,"root",{get:function(){return i.parcelRequire0b9c}}),i.parcelRequire0b9c=s;for(var a=0;a<t.length;a++)s(t[a]);var f=s(r);"object"==typeof exports&&"undefined"!=typeof module?module.exports=f:"function"==typeof define&&define.amd&&define((function(){return f}))}({"3WDm5":[function(e,t,r){var n=e("@parcel/transformer-js/lib/esmodule-helpers.js");n.defineInteropFlag(r),n.export(r,"WEBGL",(function(){return o}));class o{static isWebGLAvailable(){try{const e=document.createElement("canvas");return!(!window.WebGLRenderingContext||!e.getContext("webgl")&&!e.getContext("experimental-webgl"))}catch(e){return!1}}static isWebGL2Available(){try{const e=document.createElement("canvas");return!(!window.WebGL2RenderingContext||!e.getContext("webgl2"))}catch(e){return!1}}static getWebGLErrorMessage(){return this.getErrorMessage(1)}static getWebGL2ErrorMessage(){return this.getErrorMessage(2)}static getErrorMessage(e){const t={1:window.WebGLRenderingContext,2:window.WebGL2RenderingContext};let r='Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>';const n=document.createElement("div");return n.id="webglmessage",n.style.fontFamily="monospace",n.style.fontSize="13px",n.style.fontWeight="normal",n.style.textAlign="center",n.style.background="#fff",n.style.color="#000",n.style.padding="1.5em",n.style.width="400px",n.style.margin="5em auto 0",r=t[e]?r.replace("$0","graphics card"):r.replace("$0","browser"),r=r.replace("$1",{1:"WebGL",2:"WebGL 2"}[e]),n.innerHTML=r,n}}},{"@parcel/transformer-js/lib/esmodule-helpers.js":"6ooKJ"}],"6ooKJ":[function(e,t,r){"use strict";r.interopDefault=function(e){return e&&e.__esModule?e:{default:e}},r.defineInteropFlag=function(e){Object.defineProperty(e,"__esModule",{value:!0})},r.exportAll=function(e,t){return Object.keys(e).forEach((function(r){"default"!==r&&"__esModule"!==r&&(r in t&&t[r]===e[r]||Object.defineProperty(t,r,{enumerable:!0,get:function(){return e[r]}}))})),t},r.export=function(e,t,r){Object.defineProperty(e,t,{enumerable:!0,get:r})}},{}]},["3WDm5"],"3WDm5");
//# sourceMappingURL=index.cb616f2c.js.map
