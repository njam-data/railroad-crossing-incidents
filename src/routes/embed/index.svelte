<script context="module">
  export const ssr = false
</script>

<script>
  const url = import.meta.env.DEV ? 'http://localhost:3000' : 'https://njam-data.github.io/railroad-crossing-incidents'
</script>

<div
  id="frame-explore"
  data-frame-src="{url}/"
  data-frame-sandbox="allow-scripts allow-same-origin allow-popups"
></div>

<h1 class="text-lg font-bold mt-6">Embed the railroad crossing incidents explorer</h1>

<textarea id="explore-embed-code" class="w-96 h-96 p-4 text-sm font-mono text-gray-800"></textarea>

<div>
  <script>
    const exploreFrame = document.getElementById('frame-explore')
    const exploreUrl = exploreFrame.dataset.frameSrc
    const minHeight = '800px'
    const exploreCode = document.getElementById('explore-embed-code');
    exploreCode.value = '<div data-frame-src="' + exploreUrl + '" data-frame-sandbox="allow-scripts allow-same-origin allow-popups" style="min-height: ' + minHeight + '"><\/div>\n<script>!function(){"use strict";var e=["allowfullscreen"];function t(t,i){for(var r={},n=t.attributes,o=n.length,s=i.length,a=0;a<o;a++){var l=n[a].name;if(l.substr(0,s)===i){var u=l.slice(s),c=n[a].value;e.indexOf(u)>-1&&(c=!0),r[u]=c}}return r}function i(e,t){for(var i in t)e[i]=t[i];return e}var r="embed-size",n="data-frame-",o=n+"auto-initialized",s=function(e){var t=e.allowfullscreen;void 0===t&&(t=!1);var i=e.name,r=e.referrerpolicy,n=e.sandbox;void 0===n&&(n="allow-scripts");var o=e.src,s=e.title;this.container=e.container,this.src=o,this.allowfullscreen=t,this.name=i,this.referrerpolicy=r,this.sandbox=n,this.title=s,this.i=this.i.bind(this),window.addEventListener("message",this.i,!1),this.t()};function a(e){var t;void 0===e&&(e=document.documentElement.offsetHeight),void 0===(t={height:e})&&(t={}),window.parent.postMessage(i({sentinel:"amp",type:r},t),"*")}function l(){window.addEventListener("load",(function e(){a(),window.removeEventListener("load",e)}))}function u(){window.addEventListener("resize",(function(){return a()}))}function c(e){void 0===e&&(e=300),setInterval(a,e)}function f(){a(),l(),u()}function d(e){if(e.__esModule)return e;var t=Object.defineProperty({},"__esModule",{value:!0});return Object.keys(e).forEach((function(i){var r=Object.getOwnPropertyDescriptor(e,i);Object.defineProperty(t,i,r.get?r:{enumerable:!0,get:function(){return e[i]}})})),t}s.prototype.remove=function(){window.removeEventListener("message",this.i,!1),this.container.removeChild(this.iframe),this.iframe=null},s.prototype.t=function(){var e=this.iframe=document.createElement("iframe");e.setAttribute("src",this.src),e.setAttribute("width","100%"),e.setAttribute("scrolling","no"),e.setAttribute("marginheight","0"),e.setAttribute("frameborder","0"),this.allowfullscreen&&e.setAttribute("allowfullscreen",""),this.name&&e.setAttribute("name",name),this.referrerpolicy&&e.setAttribute("referrerpolicy",this.referrerpolicy),e.setAttribute("sandbox",this.sandbox),this.title&&e.setAttribute("title",this.title),this.container.appendChild(e)},s.prototype.i=function(e){if(e.source===this.iframe.contentWindow){var t=e.data;"amp"===t.sentinel&&t.type===r&&this.o(t.height)}},s.prototype.o=function(e){this.iframe.setAttribute("height",e)};var h=d(Object.freeze({__proto__:null,autoInitFrames:function(){for(var e=document.querySelectorAll("[data-frame-src]:not(["+o+"])"),r=[],a=0;a<e.length;a++){var l=e[a],u=t(l,n);l.setAttribute(o,""),r.push(new s(i({container:l},u)))}return r},Framer:s,initFrame:f,initFrameAndPoll:function(e){f(),c(e)},sendFrameHeight:a,sendHeightOnLoad:l,sendHeightOnPoll:c,sendHeightOnResize:u}));const{autoInitFrames:m}=h;m()}();<\/script>'
    </script>
</div>
