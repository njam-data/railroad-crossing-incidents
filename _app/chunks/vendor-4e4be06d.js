function t(){}function n(t,n){for(const e in n)t[e]=n[e];return t}function e(t){return t()}function o(){return Object.create(null)}function r(t){t.forEach(e)}function i(t){return"function"==typeof t}function s(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function u(n,e,o){n.$$.on_destroy.push(function(n,...e){if(null==n)return t;const o=n.subscribe(...e);return o.unsubscribe?()=>o.unsubscribe():o}(e,o))}function c(t,n,e,o){if(t){const r=a(t,n,e,o);return t[0](r)}}function a(t,e,o,r){return t[1]&&r?n(o.ctx.slice(),t[1](r(e))):o.ctx}function f(t,n,e,o,r,i,s){const u=function(t,n,e,o){if(t[2]&&o){const r=t[2](o(e));if(void 0===n.dirty)return r;if("object"==typeof r){const t=[],e=Math.max(n.dirty.length,r.length);for(let o=0;o<e;o+=1)t[o]=n.dirty[o]|r[o];return t}return n.dirty|r}return n.dirty}(n,o,r,i);if(u){const r=a(n,e,o,s);t.p(r,u)}}function l(n){return n&&i(n.destroy)?n.destroy:t}function d(t,n){t.appendChild(n)}function h(t,n,e){t.insertBefore(n,e||null)}function g(t){t.parentNode.removeChild(t)}function p(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function m(t){return document.createElement(t)}function y(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function $(t){return document.createTextNode(t)}function b(){return $(" ")}function v(){return $("")}function x(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function _(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function w(t){return Array.from(t.childNodes)}function k(t,n,e,o){for(let r=0;r<t.length;r+=1){const o=t[r];if(o.nodeName===n){let n=0;const i=[];for(;n<o.attributes.length;){const t=o.attributes[n++];e[t.name]||i.push(t.name)}for(let t=0;t<i.length;t++)o.removeAttribute(i[t]);return t.splice(r,1)[0]}}return o?y(n):m(n)}function E(t,n){for(let e=0;e<t.length;e+=1){const o=t[e];if(3===o.nodeType)return o.data=""+n,t.splice(e,1)[0]}return $(n)}function P(t){return E(t," ")}function M(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function S(t,n,e,o){t.style.setProperty(n,e,o?"important":"")}function A(t,n,e){t.classList[e?"add":"remove"](n)}function C(t,n=document.body){return Array.from(n.querySelectorAll(t))}let L;function j(t){L=t}function N(){if(!L)throw new Error("Function called outside component initialization");return L}function O(t){N().$$.on_mount.push(t)}function T(t){N().$$.after_update.push(t)}function F(){const t=N();return(n,e)=>{const o=t.$$.callbacks[n];if(o){const r=function(t,n){const e=document.createEvent("CustomEvent");return e.initCustomEvent(t,!1,!1,n),e}(n,e);o.slice().forEach((n=>{n.call(t,r)}))}}}function G(t,n){N().$$.context.set(t,n)}function q(t){return N().$$.context.get(t)}const z=[],B=[],H=[],I=[],U=Promise.resolve();let D=!1;function J(t){H.push(t)}let K=!1;const Q=new Set;function R(){if(!K){K=!0;do{for(let t=0;t<z.length;t+=1){const n=z[t];j(n),V(n.$$)}for(j(null),z.length=0;B.length;)B.pop()();for(let t=0;t<H.length;t+=1){const n=H[t];Q.has(n)||(Q.add(n),n())}H.length=0}while(z.length);for(;I.length;)I.pop()();D=!1,K=!1,Q.clear()}}function V(t){if(null!==t.fragment){t.update(),r(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(J)}}const W=new Set;let X;function Y(){X={r:0,c:[],p:X}}function Z(){X.r||r(X.c),X=X.p}function tt(t,n){t&&t.i&&(W.delete(t),t.i(n))}function nt(t,n,e,o){if(t&&t.o){if(W.has(t))return;W.add(t),X.c.push((()=>{W.delete(t),o&&(e&&t.d(1),o())})),t.o(n)}}function et(t,n){const e={},o={},r={$$scope:1};let i=t.length;for(;i--;){const s=t[i],u=n[i];if(u){for(const t in s)t in u||(o[t]=1);for(const t in u)r[t]||(e[t]=u[t],r[t]=1);t[i]=u}else for(const t in s)r[t]=1}for(const s in o)s in e||(e[s]=void 0);return e}function ot(t){return"object"==typeof t&&null!==t?t:{}}function rt(t){t&&t.c()}function it(t,n){t&&t.l(n)}function st(t,n,o,s){const{fragment:u,on_mount:c,on_destroy:a,after_update:f}=t.$$;u&&u.m(n,o),s||J((()=>{const n=c.map(e).filter(i);a?a.push(...n):r(n),t.$$.on_mount=[]})),f.forEach(J)}function ut(t,n){const e=t.$$;null!==e.fragment&&(r(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function ct(t,n){-1===t.$$.dirty[0]&&(z.push(t),D||(D=!0,U.then(R)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function at(n,e,i,s,u,c,a=[-1]){const f=L;j(n);const l=n.$$={fragment:null,ctx:null,props:c,update:t,not_equal:u,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(f?f.$$.context:e.context||[]),callbacks:o(),dirty:a,skip_bound:!1};let d=!1;if(l.ctx=i?i(n,e.props||{},((t,e,...o)=>{const r=o.length?o[0]:e;return l.ctx&&u(l.ctx[t],l.ctx[t]=r)&&(!l.skip_bound&&l.bound[t]&&l.bound[t](r),d&&ct(n,t)),e})):[],l.update(),d=!0,r(l.before_update),l.fragment=!!s&&s(l.ctx),e.target){if(e.hydrate){const t=w(e.target);l.fragment&&l.fragment.l(t),t.forEach(g)}else l.fragment&&l.fragment.c();e.intro&&tt(n.$$.fragment),st(n,e.target,e.anchor,e.customElement),R()}j(f)}class ft{$destroy(){ut(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const lt=[];function dt(n,e=t){let o;const r=[];function i(t){if(s(n,t)&&(n=t,o)){const t=!lt.length;for(let e=0;e<r.length;e+=1){const t=r[e];t[1](),lt.push(t,n)}if(t){for(let t=0;t<lt.length;t+=2)lt[t][0](lt[t+1]);lt.length=0}}}return{set:i,update:function(t){i(t(n))},subscribe:function(s,u=t){const c=[s,u];return r.push(c),1===r.length&&(o=e(i)||t),s(n),()=>{const t=r.indexOf(c);-1!==t&&r.splice(t,1),0===r.length&&(o(),o=null)}}}}function ht(t){var n;void 0===t&&(t=document.documentElement.offsetHeight),void 0===(n={height:t})&&(n={}),window.parent.postMessage(function(t,n){for(var e in n)t[e]=n[e];return t}({sentinel:"amp",type:"embed-size"},n),"*")}function gt(t){void 0===t&&(t=300),setInterval(ht,t)}function pt(t,n,e){if(null!==t)for(var o,r,i,s,u,c,a,f,l=0,d=0,h=t.type,g="FeatureCollection"===h,p="Feature"===h,m=g?t.features.length:1,y=0;y<m;y++){u=(f=!!(a=g?t.features[y].geometry:p?t.geometry:t)&&"GeometryCollection"===a.type)?a.geometries.length:1;for(var $=0;$<u;$++){var b=0,v=0;if(null!==(s=f?a.geometries[$]:a)){c=s.coordinates;var x=s.type;switch(l=!e||"Polygon"!==x&&"MultiPolygon"!==x?0:1,x){case null:break;case"Point":if(!1===n(c,d,y,b,v))return!1;d++,b++;break;case"LineString":case"MultiPoint":for(o=0;o<c.length;o++){if(!1===n(c[o],d,y,b,v))return!1;d++,"MultiPoint"===x&&b++}"LineString"===x&&b++;break;case"Polygon":case"MultiLineString":for(o=0;o<c.length;o++){for(r=0;r<c[o].length-l;r++){if(!1===n(c[o][r],d,y,b,v))return!1;d++}"MultiLineString"===x&&b++,"Polygon"===x&&v++}"Polygon"===x&&b++;break;case"MultiPolygon":for(o=0;o<c.length;o++){for(v=0,r=0;r<c[o].length;r++){for(i=0;i<c[o][r].length-l;i++){if(!1===n(c[o][r][i],d,y,b,v))return!1;d++}v++}b++}break;case"GeometryCollection":for(o=0;o<s.geometries.length;o++)if(!1===pt(s.geometries[o],n,e))return!1;break;default:throw new Error("Unknown Geometry Type")}}}}}function mt(t){var n=[1/0,1/0,-1/0,-1/0];return pt(t,(function(t){n[0]>t[0]&&(n[0]=t[0]),n[1]>t[1]&&(n[1]=t[1]),n[2]<t[0]&&(n[2]=t[0]),n[3]<t[1]&&(n[3]=t[1])})),n}mt.default=mt;export{n as A,Y as B,dt as C,c as D,f as E,d as F,t as G,q as H,y as I,S as J,p as K,u as L,B as M,x as N,r as O,F as P,l as Q,A as R,ft as S,mt as T,C as U,ht as V,gt as W,w as a,_ as b,k as c,g as d,m as e,h as f,E as g,M as h,at as i,rt as j,b as k,v as l,it as m,P as n,st as o,et as p,ot as q,nt as r,s,$ as t,Z as u,tt as v,ut as w,G as x,T as y,O as z};