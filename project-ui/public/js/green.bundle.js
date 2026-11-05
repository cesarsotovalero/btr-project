(()=>{var Fi=Object.defineProperty,Ui=Object.getOwnPropertyDescriptor,to=e=>{throw TypeError(e)},o=(e,t,r,s)=>{for(var n=s>1?void 0:s?Ui(t,r):t,l=e.length-1,p;l>=0;l--)(p=e[l])&&(n=(s?p(t,r,n):p(n))||n);return s&&n&&Fi(t,r,n),n},Dr=(e,t,r)=>t.has(e)||to("Cannot "+r),i=(e,t,r)=>(Dr(e,t,"read from private field"),r?r.call(e):t.get(e)),h=(e,t,r)=>t.has(e)?to("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,r),G=(e,t,r,s)=>(Dr(e,t,"write to private field"),s?s.call(e,r):t.set(e,r),r),b=(e,t,r)=>(Dr(e,t,"access private method"),r);var Je=globalThis,Qe=Je.ShadowRoot&&(Je.ShadyCSS===void 0||Je.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Nr=Symbol(),eo=new WeakMap,Be=class{constructor(t,r,s){if(this._$cssResult$=!0,s!==Nr)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=r}get styleSheet(){let t=this.o,r=this.t;if(Qe&&t===void 0){let s=r!==void 0&&r.length===1;s&&(t=eo.get(r)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&eo.set(r,t))}return t}toString(){return this.cssText}},F=e=>new Be(typeof e=="string"?e:e+"",void 0,Nr),v=(e,...t)=>{let r=e.length===1?e[0]:t.reduce((s,n,l)=>s+(p=>{if(p._$cssResult$===!0)return p.cssText;if(typeof p=="number")return p;throw Error("Value passed to 'css' function must be a 'css' function result: "+p+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[l+1],e[0]);return new Be(r,e,Nr)},ro=(e,t)=>{if(Qe)e.adoptedStyleSheets=t.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(let r of t){let s=document.createElement("style"),n=Je.litNonce;n!==void 0&&s.setAttribute("nonce",n),s.textContent=r.cssText,e.appendChild(s)}},Vr=Qe?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let r="";for(let s of t.cssRules)r+=s.cssText;return F(r)})(e):e;var{is:ji,defineProperty:Hi,getOwnPropertyDescriptor:qi,getOwnPropertyNames:Xi,getOwnPropertySymbols:Zi,getPrototypeOf:Yi}=Object,Ke=globalThis,so=Ke.trustedTypes,Ji=so?so.emptyScript:"",Qi=Ke.reactiveElementPolyfillSupport,Ge=(e,t)=>e,Le={toAttribute(e,t){switch(t){case Boolean:e=e?Ji:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=e!==null;break;case Number:r=e===null?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch{r=null}}return r}},tr=(e,t)=>!ji(e,t),oo={attribute:!0,type:String,converter:Le,reflect:!1,useDefault:!1,hasChanged:tr};Symbol.metadata??=Symbol("metadata"),Ke.litPropertyMetadata??=new WeakMap;var Ot=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,r=oo){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(t,r),!r.noAccessor){let s=Symbol(),n=this.getPropertyDescriptor(t,s,r);n!==void 0&&Hi(this.prototype,t,n)}}static getPropertyDescriptor(t,r,s){let{get:n,set:l}=qi(this.prototype,t)??{get(){return this[r]},set(p){this[r]=p}};return{get:n,set(p){let _=n?.call(this);l?.call(this,p),this.requestUpdate(t,_,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??oo}static _$Ei(){if(this.hasOwnProperty(Ge("elementProperties")))return;let t=Yi(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Ge("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ge("properties"))){let r=this.properties,s=[...Xi(r),...Zi(r)];for(let n of s)this.createProperty(n,r[n])}let t=this[Symbol.metadata];if(t!==null){let r=litPropertyMetadata.get(t);if(r!==void 0)for(let[s,n]of r)this.elementProperties.set(s,n)}this._$Eh=new Map;for(let[r,s]of this.elementProperties){let n=this._$Eu(r,s);n!==void 0&&this._$Eh.set(n,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let r=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let n of s)r.unshift(Vr(n))}else t!==void 0&&r.push(Vr(t));return r}static _$Eu(t,r){let s=r.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,r=this.constructor.elementProperties;for(let s of r.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ro(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,r,s){this._$AK(t,s)}_$ET(t,r){let s=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,s);if(n!==void 0&&s.reflect===!0){let l=(s.converter?.toAttribute!==void 0?s.converter:Le).toAttribute(r,s.type);this._$Em=t,l==null?this.removeAttribute(n):this.setAttribute(n,l),this._$Em=null}}_$AK(t,r){let s=this.constructor,n=s._$Eh.get(t);if(n!==void 0&&this._$Em!==n){let l=s.getPropertyOptions(n),p=typeof l.converter=="function"?{fromAttribute:l.converter}:l.converter?.fromAttribute!==void 0?l.converter:Le;this._$Em=n;let _=p.fromAttribute(r,l.type);this[n]=_??this._$Ej?.get(n)??_,this._$Em=null}}requestUpdate(t,r,s,n=!1,l){if(t!==void 0){let p=this.constructor;if(n===!1&&(l=this[t]),s??=p.getPropertyOptions(t),!((s.hasChanged??tr)(l,r)||s.useDefault&&s.reflect&&l===this._$Ej?.get(t)&&!this.hasAttribute(p._$Eu(t,s))))return;this.C(t,r,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,r,{useDefault:s,reflect:n,wrapped:l},p){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,p??r??this[t]),l!==!0||p!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(r=void 0),this._$AL.set(t,r)),n===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,l]of this._$Ep)this[n]=l;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[n,l]of s){let{wrapped:p}=l,_=this[n];p!==!0||this._$AL.has(n)||_===void 0||this.C(n,void 0,l,_)}}let t=!1,r=this._$AL;try{t=this.shouldUpdate(r),t?(this.willUpdate(r),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(r)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(r)}willUpdate(t){}_$AE(t){this._$EO?.forEach(r=>r.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(r=>this._$ET(r,this[r])),this._$EM()}updated(t){}firstUpdated(t){}};Ot.elementStyles=[],Ot.shadowRootOptions={mode:"open"},Ot[Ge("elementProperties")]=new Map,Ot[Ge("finalized")]=new Map,Qi?.({ReactiveElement:Ot}),(Ke.reactiveElementVersions??=[]).push("2.1.2");var qr=globalThis,no=e=>e,er=qr.trustedTypes,io=er?er.createPolicy("lit-html",{createHTML:e=>e}):void 0,uo="$lit$",Ht=`lit$${Math.random().toFixed(9).slice(2)}$`,mo="?"+Ht,Ki=`<${mo}>`,de=document,Oe=()=>de.createComment(""),Re=e=>e===null||typeof e!="object"&&typeof e!="function",Xr=Array.isArray,ta=e=>Xr(e)||typeof e?.[Symbol.iterator]=="function",Ir=`[ 	
\f\r]`,Pe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ao=/-->/g,lo=/>/g,ae=RegExp(`>|${Ir}(?:([^\\s"'>=/]+)(${Ir}*=${Ir}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),co=/'/g,po=/"/g,go=/^(?:script|style|textarea|title)$/i,Zr=e=>(t,...r)=>({_$litType$:e,strings:t,values:r}),qt=Zr(1),fo=Zr(2),yo=Zr(3),xt=Symbol.for("lit-noChange"),$=Symbol.for("lit-nothing"),ho=new WeakMap,le=de.createTreeWalker(de,129);function bo(e,t){if(!Xr(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return io!==void 0?io.createHTML(t):t}var ea=(e,t)=>{let r=e.length-1,s=[],n,l=t===2?"<svg>":t===3?"<math>":"",p=Pe;for(let _=0;_<r;_++){let f=e[_],w,T,E=-1,q=0;for(;q<f.length&&(p.lastIndex=q,T=p.exec(f),T!==null);)q=p.lastIndex,p===Pe?T[1]==="!--"?p=ao:T[1]!==void 0?p=lo:T[2]!==void 0?(go.test(T[2])&&(n=RegExp("</"+T[2],"g")),p=ae):T[3]!==void 0&&(p=ae):p===ae?T[0]===">"?(p=n??Pe,E=-1):T[1]===void 0?E=-2:(E=p.lastIndex-T[2].length,w=T[1],p=T[3]===void 0?ae:T[3]==='"'?po:co):p===po||p===co?p=ae:p===ao||p===lo?p=Pe:(p=ae,n=void 0);let ut=p===ae&&e[_+1].startsWith("/>")?" ":"";l+=p===Pe?f+Ki:E>=0?(s.push(w),f.slice(0,E)+uo+f.slice(E)+Ht+ut):f+Ht+(E===-2?_:ut)}return[bo(e,l+(e[r]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},De=class e{constructor({strings:t,_$litType$:r},s){let n;this.parts=[];let l=0,p=0,_=t.length-1,f=this.parts,[w,T]=ea(t,r);if(this.el=e.createElement(w,s),le.currentNode=this.el.content,r===2||r===3){let E=this.el.content.firstChild;E.replaceWith(...E.childNodes)}for(;(n=le.nextNode())!==null&&f.length<_;){if(n.nodeType===1){if(n.hasAttributes())for(let E of n.getAttributeNames())if(E.endsWith(uo)){let q=T[p++],ut=n.getAttribute(E).split(Ht),Lt=/([.?@])?(.*)/.exec(q);f.push({type:1,index:l,name:Lt[2],strings:ut,ctor:Lt[1]==="."?Fr:Lt[1]==="?"?Ur:Lt[1]==="@"?jr:xe}),n.removeAttribute(E)}else E.startsWith(Ht)&&(f.push({type:6,index:l}),n.removeAttribute(E));if(go.test(n.tagName)){let E=n.textContent.split(Ht),q=E.length-1;if(q>0){n.textContent=er?er.emptyScript:"";for(let ut=0;ut<q;ut++)n.append(E[ut],Oe()),le.nextNode(),f.push({type:2,index:++l});n.append(E[q],Oe())}}}else if(n.nodeType===8)if(n.data===mo)f.push({type:2,index:l});else{let E=-1;for(;(E=n.data.indexOf(Ht,E+1))!==-1;)f.push({type:7,index:l}),E+=Ht.length-1}l++}}static createElement(t,r){let s=de.createElement("template");return s.innerHTML=t,s}};function ve(e,t,r=e,s){if(t===xt)return t;let n=s!==void 0?r._$Co?.[s]:r._$Cl,l=Re(t)?void 0:t._$litDirective$;return n?.constructor!==l&&(n?._$AO?.(!1),l===void 0?n=void 0:(n=new l(e),n._$AT(e,r,s)),s!==void 0?(r._$Co??=[])[s]=n:r._$Cl=n),n!==void 0&&(t=ve(e,n._$AS(e,t.values),n,s)),t}var Wr=class{constructor(t,r){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:r},parts:s}=this._$AD,n=(t?.creationScope??de).importNode(r,!0);le.currentNode=n;let l=le.nextNode(),p=0,_=0,f=s[0];for(;f!==void 0;){if(p===f.index){let w;f.type===2?w=new Ne(l,l.nextSibling,this,t):f.type===1?w=new f.ctor(l,f.name,f.strings,this,t):f.type===6&&(w=new Hr(l,this,t)),this._$AV.push(w),f=s[++_]}p!==f?.index&&(l=le.nextNode(),p++)}return le.currentNode=de,n}p(t){let r=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,r),r+=s.strings.length-2):s._$AI(t[r])),r++}},Ne=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,r,s,n){this.type=2,this._$AH=$,this._$AN=void 0,this._$AA=t,this._$AB=r,this._$AM=s,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,r=this._$AM;return r!==void 0&&t?.nodeType===11&&(t=r.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,r=this){t=ve(this,t,r),Re(t)?t===$||t==null||t===""?(this._$AH!==$&&this._$AR(),this._$AH=$):t!==this._$AH&&t!==xt&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):ta(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==$&&Re(this._$AH)?this._$AA.nextSibling.data=t:this.T(de.createTextNode(t)),this._$AH=t}$(t){let{values:r,_$litType$:s}=t,n=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=De.createElement(bo(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===n)this._$AH.p(r);else{let l=new Wr(n,this),p=l.u(this.options);l.p(r),this.T(p),this._$AH=l}}_$AC(t){let r=ho.get(t.strings);return r===void 0&&ho.set(t.strings,r=new De(t)),r}k(t){Xr(this._$AH)||(this._$AH=[],this._$AR());let r=this._$AH,s,n=0;for(let l of t)n===r.length?r.push(s=new e(this.O(Oe()),this.O(Oe()),this,this.options)):s=r[n],s._$AI(l),n++;n<r.length&&(this._$AR(s&&s._$AB.nextSibling,n),r.length=n)}_$AR(t=this._$AA.nextSibling,r){for(this._$AP?.(!1,!0,r);t!==this._$AB;){let s=no(t).nextSibling;no(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},xe=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,r,s,n,l){this.type=1,this._$AH=$,this._$AN=void 0,this.element=t,this.name=r,this._$AM=n,this.options=l,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=$}_$AI(t,r=this,s,n){let l=this.strings,p=!1;if(l===void 0)t=ve(this,t,r,0),p=!Re(t)||t!==this._$AH&&t!==xt,p&&(this._$AH=t);else{let _=t,f,w;for(t=l[0],f=0;f<l.length-1;f++)w=ve(this,_[s+f],r,f),w===xt&&(w=this._$AH[f]),p||=!Re(w)||w!==this._$AH[f],w===$?t=$:t!==$&&(t+=(w??"")+l[f+1]),this._$AH[f]=w}p&&!n&&this.j(t)}j(t){t===$?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Fr=class extends xe{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===$?void 0:t}},Ur=class extends xe{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==$)}},jr=class extends xe{constructor(t,r,s,n,l){super(t,r,s,n,l),this.type=5}_$AI(t,r=this){if((t=ve(this,t,r,0)??$)===xt)return;let s=this._$AH,n=t===$&&s!==$||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,l=t!==$&&(s===$||n);n&&this.element.removeEventListener(this.name,this,s),l&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Hr=class{constructor(t,r,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=r,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){ve(this,t)}};var ra=qr.litHtmlPolyfillSupport;ra?.(De,Ne),(qr.litHtmlVersions??=[]).push("3.3.2");var vo=(e,t,r)=>{let s=r?.renderBefore??t,n=s._$litPart$;if(n===void 0){let l=r?.renderBefore??null;s._$litPart$=n=new Ne(t.insertBefore(Oe(),l),l,void 0,r??{})}return n._$AI(e),n};var Yr=globalThis,Xt=class extends Ot{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=vo(r,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return xt}};Xt._$litElement$=!0,Xt.finalized=!0,Yr.litElementHydrateSupport?.({LitElement:Xt});var sa=Yr.litElementPolyfillSupport;sa?.({LitElement:Xt});(Yr.litElementVersions??=[]).push("4.2.2");var oa={attribute:!0,type:String,converter:Le,reflect:!1,hasChanged:tr},na=(e=oa,t,r)=>{let{kind:s,metadata:n}=r,l=globalThis.litPropertyMetadata.get(n);if(l===void 0&&globalThis.litPropertyMetadata.set(n,l=new Map),s==="setter"&&((e=Object.create(e)).wrapped=!0),l.set(r.name,e),s==="accessor"){let{name:p}=r;return{set(_){let f=t.get.call(this);t.set.call(this,_),this.requestUpdate(p,f,e,!0,_)},init(_){return _!==void 0&&this.C(p,void 0,e,_),_}}}if(s==="setter"){let{name:p}=r;return function(_){let f=this[p];t.call(this,_),this.requestUpdate(p,f,e,!0,_)}}throw Error("Unsupported decorator location: "+s)};function d(e){return(t,r)=>typeof r=="object"?na(e,t,r):((s,n,l)=>{let p=n.hasOwnProperty(l);return n.constructor.createProperty(l,s),p?Object.getOwnPropertyDescriptor(n,l):void 0})(e,t,r)}function rt(e){return d({...e,state:!0,attribute:!1})}var Zt=(e,t,r)=>(r.configurable=!0,r.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(e,t,r),r);function D(e,t){return(r,s,n)=>{let l=p=>p.renderRoot?.querySelector(e)??null;if(t){let{get:p,set:_}=typeof s=="object"?r:n??(()=>{let f=Symbol();return{get(){return this[f]},set(w){this[f]=w}}})();return Zt(r,s,{get(){let f=p.call(this);return f===void 0&&(f=l(this),(f!==null||this.hasUpdated)&&_.call(this,f)),f}})}return Zt(r,s,{get(){return l(this)}})}}function rr(e){return(t,r)=>Zt(t,r,{async get(){return await this.updateComplete,this.renderRoot?.querySelector(e)??null}})}var kt,sr,Dt,or,ce,St,Rt,nr,Yt,xo,Ve,_o,ir=class{constructor(t){h(this,Yt),h(this,kt,!Ie()),h(this,sr,!1),h(this,Dt,[]),h(this,or,[]),h(this,ce,new Map),h(this,St,new Map),h(this,Rt,[]),h(this,nr,[]),this.host=t,this.host.addController(this)}hostConnected(){b(this,Yt,_o).call(this)}has(t){return i(this,kt)?i(this,St).has(t):i(this,ce).has(t)}inject(t,r){b(this,Yt,xo).call(this,t,r),b(this,Yt,Ve).call(this)}clear(t){i(this,kt)?this.host.updateComplete.then(()=>{i(this,St).get(t)?.remove(),i(this,St).delete(t)}):i(this,ce).delete(t),b(this,Yt,Ve).call(this)}clearAll(){i(this,kt)?this.host.updateComplete.then(()=>{i(this,St).forEach(t=>t.remove()),i(this,Rt).forEach(t=>t.remove()),i(this,St).clear(),G(this,Rt,[])}):this.host.shadowRoot&&(this.host.shadowRoot.adoptedStyleSheets=[],i(this,ce).clear(),G(this,Dt,[]))}clearInitial(){i(this,kt)?this.host.updateComplete.then(()=>{i(this,Rt).forEach(t=>t.remove()),G(this,Rt,[])}):G(this,Dt,[]),b(this,Yt,Ve).call(this)}restoreInitial(){i(this,kt)?i(this,nr).forEach(t=>{i(this,Rt).push(t.cloneNode(!0))}):G(this,Dt,[...i(this,or)]),b(this,Yt,Ve).call(this)}};kt=new WeakMap;sr=new WeakMap;Dt=new WeakMap;or=new WeakMap;ce=new WeakMap;St=new WeakMap;Rt=new WeakMap;nr=new WeakMap;Yt=new WeakSet;xo=function(e,t){if(i(this,kt)){let r=i(this,St).get(e);r||(r=document.createElement("style"),i(this,St).set(e,r)),r.textContent=t.cssText}else{if(!this.host.shadowRoot||!t.styleSheet)return;i(this,ce).set(e,t.styleSheet)}};Ve=function(){if(i(this,kt))this.host.updateComplete.then(()=>{this.host.shadowRoot&&(this.host.shadowRoot.querySelectorAll("style").forEach(e=>{e.remove()}),i(this,Rt).forEach(e=>{this.host.shadowRoot?.appendChild(e)}),i(this,St).forEach(e=>{this.host.shadowRoot?.appendChild(e)}))});else{if(!this.host.shadowRoot)return;this.host.shadowRoot.adoptedStyleSheets=[...i(this,Dt),...Array.from(i(this,ce).values())]}};_o=function(){i(this,sr)||(i(this,kt)?this.host.updateComplete.then(()=>{this.host.shadowRoot&&this.host.shadowRoot.querySelectorAll("style").forEach(e=>{i(this,Rt).push(e),i(this,nr).push(e.cloneNode(!0))})}):this.host.shadowRoot&&i(this,Dt).length===0&&(G(this,Dt,[...this.host.shadowRoot.adoptedStyleSheets||[]]),G(this,or,[...i(this,Dt)])),G(this,sr,!0))};function Ie(){try{return new CSSStyleSheet,!0}catch{return!1}}function Jr(e){return e&&(e.includes("-")?e.split("-").map(r=>r.charAt(0).toUpperCase()+r.slice(1)).join(""):e.charAt(0).toUpperCase()+e.slice(1))}var ko;(function(e){(function(t){var r=typeof global=="object"?global:typeof self=="object"?self:typeof this=="object"?this:Function("return this;")(),s=n(e);typeof r.Reflect>"u"?r.Reflect=e:s=n(r.Reflect,s),t(s);function n(l,p){return function(_,f){typeof l[_]!="function"&&Object.defineProperty(l,_,{configurable:!0,writable:!0,value:f}),p&&p(_,f)}}})(function(t){var r=Object.prototype.hasOwnProperty,s=typeof Symbol=="function",n=s&&typeof Symbol.toPrimitive<"u"?Symbol.toPrimitive:"@@toPrimitive",l=s&&typeof Symbol.iterator<"u"?Symbol.iterator:"@@iterator",p=typeof Object.create=="function",_={__proto__:[]}instanceof Array,f=!p&&!_,w={create:p?function(){return Rr(Object.create(null))}:_?function(){return Rr({__proto__:null})}:function(){return Rr({})},has:f?function(a,c){return r.call(a,c)}:function(a,c){return c in a},get:f?function(a,c){return r.call(a,c)?a[c]:void 0}:function(a,c){return a[c]}},T=Object.getPrototypeOf(Function),E=typeof process=="object"&&process.env&&process.env.REFLECT_METADATA_USE_MAP_POLYFILL==="true",q=!E&&typeof Map=="function"&&typeof Map.prototype.entries=="function"?Map:Vi(),ut=!E&&typeof Set=="function"&&typeof Set.prototype.entries=="function"?Set:Ii(),Lt=!E&&typeof WeakMap=="function"?WeakMap:Wi(),Ye=new Lt;function bi(a,c,u,y){if(Y(u)){if(!Ys(a))throw new TypeError;if(!Js(c))throw new TypeError;return Ti(a,c)}else{if(!Ys(a))throw new TypeError;if(!K(c))throw new TypeError;if(!K(y)&&!Y(y)&&!ye(y))throw new TypeError;return ye(y)&&(y=void 0),u=Pt(u),Mi(a,c,u,y)}}t("decorate",bi);function vi(a,c){function u(y,k){if(!K(y))throw new TypeError;if(!Y(k)&&!Pi(k))throw new TypeError;Hs(a,c,y,k)}return u}t("metadata",vi);function xi(a,c,u,y){if(!K(u))throw new TypeError;return Y(y)||(y=Pt(y)),Hs(a,c,u,y)}t("defineMetadata",xi);function _i(a,c,u){if(!K(c))throw new TypeError;return Y(u)||(u=Pt(u)),Fs(a,c,u)}t("hasMetadata",_i);function ki(a,c,u){if(!K(c))throw new TypeError;return Y(u)||(u=Pt(u)),Pr(a,c,u)}t("hasOwnMetadata",ki);function Si(a,c,u){if(!K(c))throw new TypeError;return Y(u)||(u=Pt(u)),Us(a,c,u)}t("getMetadata",Si);function wi(a,c,u){if(!K(c))throw new TypeError;return Y(u)||(u=Pt(u)),js(a,c,u)}t("getOwnMetadata",wi);function Ci(a,c){if(!K(a))throw new TypeError;return Y(c)||(c=Pt(c)),qs(a,c)}t("getMetadataKeys",Ci);function $i(a,c){if(!K(a))throw new TypeError;return Y(c)||(c=Pt(c)),Xs(a,c)}t("getOwnMetadataKeys",$i);function Ei(a,c,u){if(!K(c))throw new TypeError;Y(u)||(u=Pt(u));var y=ze(c,u,!1);if(Y(y)||!y.delete(a))return!1;if(y.size>0)return!0;var k=Ye.get(c);return k.delete(u),k.size>0||Ye.delete(c),!0}t("deleteMetadata",Ei);function Ti(a,c){for(var u=a.length-1;u>=0;--u){var y=a[u],k=y(c);if(!Y(k)&&!ye(k)){if(!Js(k))throw new TypeError;c=k}}return c}function Mi(a,c,u,y){for(var k=a.length-1;k>=0;--k){var et=a[k],A=et(c,u,y);if(!Y(A)&&!ye(A)){if(!K(A))throw new TypeError;y=A}}return y}function ze(a,c,u){var y=Ye.get(a);if(Y(y)){if(!u)return;y=new q,Ye.set(a,y)}var k=y.get(c);if(Y(k)){if(!u)return;k=new q,y.set(c,k)}return k}function Fs(a,c,u){var y=Pr(a,c,u);if(y)return!0;var k=Or(c);return ye(k)?!1:Fs(a,k,u)}function Pr(a,c,u){var y=ze(c,u,!1);return Y(y)?!1:Gi(y.has(a))}function Us(a,c,u){var y=Pr(a,c,u);if(y)return js(a,c,u);var k=Or(c);if(!ye(k))return Us(a,k,u)}function js(a,c,u){var y=ze(c,u,!1);if(!Y(y))return y.get(a)}function Hs(a,c,u,y){var k=ze(u,y,!0);k.set(a,c)}function qs(a,c){var u=Xs(a,c),y=Or(a);if(y===null)return u;var k=qs(y,c);if(k.length<=0)return u;if(u.length<=0)return k;for(var et=new ut,A=[],B=0,S=u;B<S.length;B++){var P=S[B],O=et.has(P);O||(et.add(P),A.push(P))}for(var jt=0,Ks=k;jt<Ks.length;jt++){var P=Ks[jt],O=et.has(P);O||(et.add(P),A.push(P))}return A}function Xs(a,c){var u=[],y=ze(a,c,!1);if(Y(y))return u;for(var k=y.keys(),et=Oi(k),A=0;;){var B=Di(et);if(!B)return u.length=A,u;var S=Ri(B);try{u[A]=S}catch(P){try{Ni(et)}finally{throw P}}A++}}function Zs(a){if(a===null)return 1;switch(typeof a){case"undefined":return 0;case"boolean":return 2;case"string":return 3;case"symbol":return 4;case"number":return 5;case"object":return a===null?1:6;default:return 6}}function Y(a){return a===void 0}function ye(a){return a===null}function Ai(a){return typeof a=="symbol"}function K(a){return typeof a=="object"?a!==null:typeof a=="function"}function zi(a,c){switch(Zs(a)){case 0:return a;case 1:return a;case 2:return a;case 3:return a;case 4:return a;case 5:return a}var u=c===3?"string":c===5?"number":"default",y=Qs(a,n);if(y!==void 0){var k=y.call(a,u);if(K(k))throw new TypeError;return k}return Bi(a,u==="default"?"number":u)}function Bi(a,c){if(c==="string"){var u=a.toString;if(be(u)){var y=u.call(a);if(!K(y))return y}var k=a.valueOf;if(be(k)){var y=k.call(a);if(!K(y))return y}}else{var k=a.valueOf;if(be(k)){var y=k.call(a);if(!K(y))return y}var et=a.toString;if(be(et)){var y=et.call(a);if(!K(y))return y}}throw new TypeError}function Gi(a){return!!a}function Li(a){return""+a}function Pt(a){var c=zi(a,3);return Ai(c)?c:Li(c)}function Ys(a){return Array.isArray?Array.isArray(a):a instanceof Object?a instanceof Array:Object.prototype.toString.call(a)==="[object Array]"}function be(a){return typeof a=="function"}function Js(a){return typeof a=="function"}function Pi(a){switch(Zs(a)){case 3:return!0;case 4:return!0;default:return!1}}function Qs(a,c){var u=a[c];if(u!=null){if(!be(u))throw new TypeError;return u}}function Oi(a){var c=Qs(a,l);if(!be(c))throw new TypeError;var u=c.call(a);if(!K(u))throw new TypeError;return u}function Ri(a){return a.value}function Di(a){var c=a.next();return c.done?!1:c}function Ni(a){var c=a.return;c&&c.call(a)}function Or(a){var c=Object.getPrototypeOf(a);if(typeof a!="function"||a===T||c!==T)return c;var u=a.prototype,y=u&&Object.getPrototypeOf(u);if(y==null||y===Object.prototype)return c;var k=y.constructor;return typeof k!="function"||k===a?c:k}function Vi(){var a={},c=[],u=(function(){function A(B,S,P){this._index=0,this._keys=B,this._values=S,this._selector=P}return A.prototype["@@iterator"]=function(){return this},A.prototype[l]=function(){return this},A.prototype.next=function(){var B=this._index;if(B>=0&&B<this._keys.length){var S=this._selector(this._keys[B],this._values[B]);return B+1>=this._keys.length?(this._index=-1,this._keys=c,this._values=c):this._index++,{value:S,done:!1}}return{value:void 0,done:!0}},A.prototype.throw=function(B){throw this._index>=0&&(this._index=-1,this._keys=c,this._values=c),B},A.prototype.return=function(B){return this._index>=0&&(this._index=-1,this._keys=c,this._values=c),{value:B,done:!0}},A})();return(function(){function A(){this._keys=[],this._values=[],this._cacheKey=a,this._cacheIndex=-2}return Object.defineProperty(A.prototype,"size",{get:function(){return this._keys.length},enumerable:!0,configurable:!0}),A.prototype.has=function(B){return this._find(B,!1)>=0},A.prototype.get=function(B){var S=this._find(B,!1);return S>=0?this._values[S]:void 0},A.prototype.set=function(B,S){var P=this._find(B,!0);return this._values[P]=S,this},A.prototype.delete=function(B){var S=this._find(B,!1);if(S>=0){for(var P=this._keys.length,O=S+1;O<P;O++)this._keys[O-1]=this._keys[O],this._values[O-1]=this._values[O];return this._keys.length--,this._values.length--,B===this._cacheKey&&(this._cacheKey=a,this._cacheIndex=-2),!0}return!1},A.prototype.clear=function(){this._keys.length=0,this._values.length=0,this._cacheKey=a,this._cacheIndex=-2},A.prototype.keys=function(){return new u(this._keys,this._values,y)},A.prototype.values=function(){return new u(this._keys,this._values,k)},A.prototype.entries=function(){return new u(this._keys,this._values,et)},A.prototype["@@iterator"]=function(){return this.entries()},A.prototype[l]=function(){return this.entries()},A.prototype._find=function(B,S){return this._cacheKey!==B&&(this._cacheIndex=this._keys.indexOf(this._cacheKey=B)),this._cacheIndex<0&&S&&(this._cacheIndex=this._keys.length,this._keys.push(B),this._values.push(void 0)),this._cacheIndex},A})();function y(A,B){return A}function k(A,B){return B}function et(A,B){return[A,B]}}function Ii(){return(function(){function a(){this._map=new q}return Object.defineProperty(a.prototype,"size",{get:function(){return this._map.size},enumerable:!0,configurable:!0}),a.prototype.has=function(c){return this._map.has(c)},a.prototype.add=function(c){return this._map.set(c,c),this},a.prototype.delete=function(c){return this._map.delete(c)},a.prototype.clear=function(){this._map.clear()},a.prototype.keys=function(){return this._map.keys()},a.prototype.values=function(){return this._map.values()},a.prototype.entries=function(){return this._map.entries()},a.prototype["@@iterator"]=function(){return this.keys()},a.prototype[l]=function(){return this.keys()},a})()}function Wi(){var a=16,c=w.create(),u=y();return(function(){function S(){this._key=y()}return S.prototype.has=function(P){var O=k(P,!1);return O!==void 0?w.has(O,this._key):!1},S.prototype.get=function(P){var O=k(P,!1);return O!==void 0?w.get(O,this._key):void 0},S.prototype.set=function(P,O){var jt=k(P,!0);return jt[this._key]=O,this},S.prototype.delete=function(P){var O=k(P,!1);return O!==void 0?delete O[this._key]:!1},S.prototype.clear=function(){this._key=y()},S})();function y(){var S;do S="@@WeakMap@@"+B();while(w.has(c,S));return c[S]=!0,S}function k(S,P){if(!r.call(S,u)){if(!P)return;Object.defineProperty(S,u,{value:w.create()})}return S[u]}function et(S,P){for(var O=0;O<P;++O)S[O]=Math.random()*255|0;return S}function A(S){return typeof Uint8Array=="function"?typeof crypto<"u"?crypto.getRandomValues(new Uint8Array(S)):typeof msCrypto<"u"?msCrypto.getRandomValues(new Uint8Array(S)):et(new Uint8Array(S),S):et(new Array(S),S)}function B(){var S=A(a);S[6]=S[6]&79|64,S[8]=S[8]&191|128;for(var P="",O=0;O<a;++O){var jt=S[O];(O===4||O===6||O===8)&&(P+="-"),jt<16&&(P+="0"),P+=jt.toString(16).toLowerCase()}return P}}function Rr(a){return a.__=void 0,delete a.__,a}})})(ko||(ko={}));var M=class extends Xt{constructor(){super(),this.semanticVersion="2.37.0",this._isUsingTransitionalStyles=!1,this._dynamicStylesController=new ir(this)}static define(){}connectedCallback(){super.connectedCallback(),this.setAttribute("gds-element",this.gdsElementName?.toString()||"")}disconnectedCallback(){super.disconnectedCallback(),this.dispatchEvent(new CustomEvent("gds-element-disconnected",{bubbles:!0,composed:!1}))}dispatchStandardEvent(t,r){let s={bubbles:!0,composed:!1,cancelable:!0,...r};return[this.dispatchEvent(new Event(t,s)),this.dispatchEvent(new Event(Jr(t),s))].every(n=>n!==!1)}dispatchCustomEvent(t,r={}){let s={bubbles:!0,composed:!1,cancelable:!0,...r};return[this.dispatchEvent(new CustomEvent(t,s)),this.dispatchEvent(new CustomEvent(Jr(t),s))].every(n=>n!==!1)}};M.isDefined=!1;M.styleExpressionBaseSelector=":host";o([rt()],M.prototype,"_isUsingTransitionalStyles",2);var mt="-5dc5f5",ar=class{static get instance(){return globalThis.__gdsElementLookupTable?.[mt]||(globalThis.__gdsElementLookupTable={...globalThis.__gdsElementLookupTable,[mt]:new Map}),globalThis.__gdsElementLookupTable[mt]}},x=(e,t)=>function(r){var s;return s=class extends r{constructor(){super(...arguments),this.gdsElementName=e}static define(){if(s.isDefined)return;let l=globalThis.GDS_DISABLE_VERSIONED_ELEMENTS?e:e+mt;customElements.get(l)||(s.isDefined=!0,ar.instance.set(e,l),customElements.define(l,s),t?.dependsOn&&t.dependsOn.forEach(p=>p.define()))}},s.isDefined=!1,s},So=new WeakMap;function ia(e,...t){let r=So.get(e);return r||(r=wo(e),r.raw=wo(e.raw),So.set(e,r)),[r,...t]}var wo=e=>e.map(t=>{for(let[r,s]of ar.instance.entries())t=t.replace(new RegExp(`${r}(?![-a-z])`,"mg"),s);return t});function aa(e){return(t,...r)=>{if(globalThis.GDS_DISABLE_VERSIONED_ELEMENTS)return e(t,...r);let[s,...n]=ia(t,...r);return e(s,...n)}}var g=aa(qt);var la=`/**
 * Do not edit directly, this file was auto-generated.
 */

  --gds-sys-state-hover-state-layer-opacity: 0.1;
  --gds-sys-motion-easing-ease-in: 0.64, 0, 0.78, 0;
  --gds-sys-motion-easing-ease-in-out: 0.83, 0, 0.17, 1;
  --gds-sys-motion-easing-ease-out: 0.22, 1, 0.36, 1;
  --gds-sys-motion-easing-linear: 0, 0, 1, 1;
  --gds-sys-motion-duration-fastest: .2s;
  --gds-sys-motion-duration-fast: .4s;
  --gds-sys-motion-duration-default: .5s;
  --gds-sys-motion-duration-slow: 1s;
  --gds-sys-motion-duration-slowest: 1.5s;
  --gds-sys-viewport-0: 0;
  --gds-sys-viewport-2xs: 320;
  --gds-sys-viewport-xs: 425;
  --gds-sys-viewport-s: 768;
  --gds-sys-viewport-m: 1024;
  --gds-sys-viewport-l: 1280;
  --gds-sys-viewport-xl: 1440;
  --gds-sys-viewport-2xl: 2560;
  --gds-sys-viewport-3xl: 3840;
  --gds-sys-viewport-4xl: 4320;
  --gds-sys-viewport-5xl: 6016;
  --gds-sys-viewport-6xl: 7680;
  --gds-sys-text-family: SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-weight-light: 300;
  --gds-sys-text-weight-regular: 400;
  --gds-sys-text-weight-book: 450;
  --gds-sys-text-weight-medium: 500;
  --gds-sys-text-weight-bold: 700;
  --gds-sys-text-display-2xl: 450 5.125rem/5.625rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-display-xl: 450 4rem/4.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-display-l: 450 3rem/3.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-display-m: 450 2.25rem/2.75rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-display-s: 450 2rem/2.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-heading-xl: 450 2rem/2.75rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-heading-l: 450 1.75rem/2.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-heading-m: 450 1.5rem/2rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-heading-s: 450 1.25rem/1.75rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-heading-xs: 450 1rem/1.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-heading-2xs: 450 0.875rem/1.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-preamble-2xl: 450 2rem/2.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-preamble-xl: 450 1.75rem/2.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-preamble-l: 450 1.5rem/2rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-preamble-m: 450 1.25rem/1.75rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-preamble-s: 450 1.125rem/1.625rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-preamble-xs: 450 1rem/1.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-detail-book-m: 450 1rem/1.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-detail-book-s: 450 0.875rem/1.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-detail-book-xs: 450 0.75rem/1rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-detail-regular-m: 400 1rem/1.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-detail-regular-s: 400 0.875rem/1.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-detail-regular-xs: 400 0.75rem/1rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-body-medium-m: 500 1rem/1.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-body-medium-s: 500 0.875rem/1.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-body-book-m: 450 1rem/1.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-body-book-s: 450 0.875rem/1.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-body-regular-l: 400 1.25rem/1.625rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-body-regular-m: 400 1rem/1.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-body-regular-s: 400 0.875rem/1.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-body-italic-m: italic 400 1rem/1.5rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-text-body-italic-s: italic 400 0.875rem/1.25rem SEB SansSerif, SEB SansSerif GDS, SEBSansSerif;
  --gds-sys-space-0: 0px;
  --gds-sys-space-5xs: 1px;
  --gds-sys-space-4xs: 2px;
  --gds-sys-space-3xs: 4px;
  --gds-sys-space-2xs: 6px;
  --gds-sys-space-xs: 8px;
  --gds-sys-space-s: 12px;
  --gds-sys-space-m: 16px;
  --gds-sys-space-l: 20px;
  --gds-sys-space-xl: 24px;
  --gds-sys-space-2xl: 32px;
  --gds-sys-space-3xl: 40px;
  --gds-sys-space-4xl: 48px;
  --gds-sys-space-5xl: 64px;
  --gds-sys-space-6xl: 80px;
  --gds-sys-space-7xl: 96px;
  --gds-sys-space-8xl: 112px;
  --gds-sys-space-9xl: 120px;
  --gds-sys-space-max: 999px;
  --gds-sys-radius-0: 0px;
  --gds-sys-radius-none: 0px;
  --gds-sys-radius-5xs: 1px;
  --gds-sys-radius-4xs: 2px;
  --gds-sys-radius-3xs: 4px;
  --gds-sys-radius-2xs: 6px;
  --gds-sys-radius-xs: 8px;
  --gds-sys-radius-s: 12px;
  --gds-sys-radius-m: 16px;
  --gds-sys-radius-l: 20px;
  --gds-sys-radius-xl: 24px;
  --gds-sys-radius-2xl: 32px;
  --gds-sys-radius-3xl: 40px;
  --gds-sys-radius-4xl: 48px;
  --gds-sys-radius-5xl: 64px;
  --gds-sys-radius-max: 999px;`,Qr=la;var da=`/**
 * Do not edit directly, this file was auto-generated.
 */


  color-scheme: dark;
  --gds-sys-color-l1-neutral-01: #0a0b0b;
  --gds-sys-color-l1-neutral-02: #0a0b0b;
  --gds-sys-color-l1-brand-01: #003824;
  --gds-sys-color-l1-inversed: #ffffff;
  --gds-sys-color-l2-neutral-01: #191a1a;
  --gds-sys-color-l2-neutral-02: #191a1a;
  --gds-sys-color-l2-neutral-03: #3b3f3e;
  --gds-sys-color-l2-brand-01: #003824;
  --gds-sys-color-l2-brand-02: #231d10;
  --gds-sys-color-l2-positive-01: #003d26;
  --gds-sys-color-l2-negative-01: #451207;
  --gds-sys-color-l2-warning-01: #482a05;
  --gds-sys-color-l2-information-01: #1e201f;
  --gds-sys-color-l2-notice-01: #00294d;
  --gds-sys-color-l3-brand-01: #d5d7d7;
  --gds-sys-color-l3-brand-02: #efe9dc;
  --gds-sys-color-l3-brand-03: #e7ddcb;
  --gds-sys-color-l3-neutral-01: #d5d7d7;
  --gds-sys-color-l3-neutral-02: #282a29;
  --gds-sys-color-l3-neutral-03: #3b3f3e;
  --gds-sys-color-l3-neutral-04: #3b3f3e;
  --gds-sys-color-l3-neutral-05: #003824;
  --gds-sys-color-l3-positive-01: #026436;
  --gds-sys-color-l3-positive-02: #015130;
  --gds-sys-color-l3-positive-03: #003d26;
  --gds-sys-color-l3-negative-01: #a22911;
  --gds-sys-color-l3-negative-02: #731d0c;
  --gds-sys-color-l3-negative-03: #5c170a;
  --gds-sys-color-l3-notice-01: #005fb3;
  --gds-sys-color-l3-notice-02: #004480;
  --gds-sys-color-l3-notice-03: #003666;
  --gds-sys-color-l3-warning-01: #f19e38;
  --gds-sys-color-l3-warning-02: #774508;
  --gds-sys-color-l3-warning-03: #5f3707;
  --gds-sys-color-l3-information-01: #d5d7d7;
  --gds-sys-color-l3-information-02: #313533;
  --gds-sys-color-l3-information-03: #595f5d;
  --gds-sys-color-l3-disabled-01: #595f5d;
  --gds-sys-color-l3-disabled-02: #595f5d;
  --gds-sys-color-l3-disabled-03: #818886;
  --gds-sys-color-border-interactive: #a0a6a4;
  --gds-sys-color-border-subtle-01: #454a48;
  --gds-sys-color-border-subtle-02: #282a29;
  --gds-sys-color-border-strong: #f7f8f7;
  --gds-sys-color-border-inverse: #ffffff;
  --gds-sys-color-border-information-01: #636967;
  --gds-sys-color-border-positive-01: #8ae58d;
  --gds-sys-color-border-negative-01: #f08975;
  --gds-sys-color-border-warning-01: #f5b970;
  --gds-sys-color-border-notice-01: #66b8ff;
  --gds-sys-color-border-information-02: rgba(99, 105, 103, 0.4);
  --gds-sys-color-border-positive-02: rgba(138, 229, 141, 0.4);
  --gds-sys-color-border-negative-02: rgba(240, 137, 117, 0.4);
  --gds-sys-color-border-warning-02: rgba(245, 185, 112, 0.4);
  --gds-sys-color-border-notice-02: rgba(102, 184, 255, 0.4);
  --gds-sys-color-content-neutral-01: #f7f8f7;
  --gds-sys-color-content-neutral-02: #abb0ae;
  --gds-sys-color-content-neutral-03: #0a0b0b;
  --gds-sys-color-content-neutral-04: #595f5d;
  --gds-sys-color-content-inversed: #f7f8f7;
  --gds-sys-color-content-brand-01: #003824;
  --gds-sys-color-content-brand-02: #d6c7a8;
  --gds-sys-color-content-positive-01: #8ae58d;
  --gds-sys-color-content-positive-02: #027839;
  --gds-sys-color-content-positive-03: #8ae58d;
  --gds-sys-color-content-negative-01: #f08975;
  --gds-sys-color-content-negative-02: #f5b0a3;
  --gds-sys-color-content-warning-01: #f5b970;
  --gds-sys-color-content-warning-02: #fce8cf;
  --gds-sys-color-content-notice-01: #66b8ff;
  --gds-sys-color-content-notice-02: #99cfff;
  --gds-sys-color-content-disabled-01: #cacecc;
  --gds-sys-color-content-disabled-02: #cacecc;
  --gds-sys-color-state-brand-01: #000000 20%;
  --gds-sys-color-state-brand-02: #000000 30%;
  --gds-sys-color-state-brand-03: #003824 30%;
  --gds-sys-color-state-brand-04: #003824 70%;
  --gds-sys-color-state-brand-05: #003824 50%;
  --gds-sys-color-state-brand-06: #003824 90%;
  --gds-sys-color-state-neutral-01: #000000 20%;
  --gds-sys-color-state-neutral-02: #000000 35%;
  --gds-sys-color-state-neutral-03: #ffffff 20%;
  --gds-sys-color-state-neutral-04: #ffffff 30%;
  --gds-sys-color-state-neutral-05: #ffffff 12%;
  --gds-sys-color-state-neutral-06: #ffffff 25%;
  --gds-sys-color-state-positive-01: #000000 12%;
  --gds-sys-color-state-positive-02: #000000 23%;
  --gds-sys-color-state-positive-03: #ffffff 8%;
  --gds-sys-color-state-positive-04: #ffffff 14%;
  --gds-sys-color-state-positive-05: #027839 30%;
  --gds-sys-color-state-positive-06: #027839 50%;
  --gds-sys-color-state-negative-01: #000000 15%;
  --gds-sys-color-state-negative-02: #000000 30%;
  --gds-sys-color-state-negative-03: #ffffff 8%;
  --gds-sys-color-state-negative-04: #ffffff 14%;
  --gds-sys-color-state-negative-05: #b92f13 30%;
  --gds-sys-color-state-negative-06: #b92f13 45%;
  --gds-sys-color-state-notice-01: #000000 12%;
  --gds-sys-color-state-notice-02: #000000 20%;
  --gds-sys-color-state-notice-03: #ffffff 6%;
  --gds-sys-color-state-notice-04: #ffffff 10%;
  --gds-sys-color-state-notice-05: #005fb3 40%;
  --gds-sys-color-state-notice-06: #005fb3 60%;
  --gds-sys-color-state-warning-01: #000000 6%;
  --gds-sys-color-state-warning-02: #000000 14%;
  --gds-sys-color-state-warning-03: #ffffff 8%;
  --gds-sys-color-state-warning-04: #ffffff 14%;
  --gds-sys-color-state-warning-05: #f19e38 12%;
  --gds-sys-color-state-warning-06: #f19e38 20%;`,pe=da;var ca=`/**
 * Do not edit directly, this file was auto-generated.
 */


  color-scheme: light;
  --gds-sys-color-l1-neutral-01: #ffffff;
  --gds-sys-color-l1-neutral-02: #f4f5f5;
  --gds-sys-color-l1-brand-01: #003824;
  --gds-sys-color-l1-inversed: #0a0b0b;
  --gds-sys-color-l2-neutral-01: #f7f8f7;
  --gds-sys-color-l2-neutral-02: #ffffff;
  --gds-sys-color-l2-neutral-03: #0a0b0b;
  --gds-sys-color-l2-brand-01: #003824;
  --gds-sys-color-l2-brand-02: #f8f6f1;
  --gds-sys-color-l2-positive-01: #f1f9f1;
  --gds-sys-color-l2-negative-01: #fef7f6;
  --gds-sys-color-l2-warning-01: #fef8f1;
  --gds-sys-color-l2-information-01: #f7f8f7;
  --gds-sys-color-l2-notice-01: #f5faff;
  --gds-sys-color-l3-brand-01: #003824;
  --gds-sys-color-l3-brand-02: #efe9dc;
  --gds-sys-color-l3-brand-03: #e7ddcb;
  --gds-sys-color-l3-neutral-01: #0a0b0b;
  --gds-sys-color-l3-neutral-02: #eaebeb;
  --gds-sys-color-l3-neutral-03: #d5d7d7;
  --gds-sys-color-l3-neutral-04: #ffffff;
  --gds-sys-color-l3-neutral-05: #ffffff;
  --gds-sys-color-l3-positive-01: #027839;
  --gds-sys-color-l3-positive-02: #dcefdc;
  --gds-sys-color-l3-positive-03: #cceacc;
  --gds-sys-color-l3-negative-01: #b92f13;
  --gds-sys-color-l3-negative-02: #fdebe8;
  --gds-sys-color-l3-negative-03: #fad8d1;
  --gds-sys-color-l3-notice-01: #005fb3;
  --gds-sys-color-l3-notice-02: #e6f3ff;
  --gds-sys-color-l3-notice-03: #cce7ff;
  --gds-sys-color-l3-warning-01: #8f530a;
  --gds-sys-color-l3-warning-02: #fce8cf;
  --gds-sys-color-l3-warning-03: #fadcb7;
  --gds-sys-color-l3-information-01: #0a0b0b;
  --gds-sys-color-l3-information-02: #eaebeb;
  --gds-sys-color-l3-information-03: #dfe1e1;
  --gds-sys-color-l3-disabled-01: #eff0f0;
  --gds-sys-color-l3-disabled-02: #a0a6a4;
  --gds-sys-color-l3-disabled-03: #eff0f0;
  --gds-sys-color-border-interactive: #777e7c;
  --gds-sys-color-border-subtle-01: #dfe1e1;
  --gds-sys-color-border-subtle-02: #eff0f0;
  --gds-sys-color-border-strong: #0a0b0b;
  --gds-sys-color-border-inverse: #ffffff;
  --gds-sys-color-border-information-01: #0a0b0b;
  --gds-sys-color-border-positive-01: #027839;
  --gds-sys-color-border-negative-01: #b92f13;
  --gds-sys-color-border-warning-01: #8f530a;
  --gds-sys-color-border-notice-01: #005fb3;
  --gds-sys-color-border-information-02: rgba(10, 11, 11, 0.4);
  --gds-sys-color-border-positive-02: rgba(2, 120, 57, 0.4);
  --gds-sys-color-border-negative-02: rgba(185, 47, 19, 0.4);
  --gds-sys-color-border-warning-02: rgba(143, 83, 10, 0.4);
  --gds-sys-color-border-notice-02: rgba(0, 95, 179, 0.4);
  --gds-sys-color-content-neutral-01: #0a0b0b;
  --gds-sys-color-content-neutral-02: #636967;
  --gds-sys-color-content-neutral-03: #ffffff;
  --gds-sys-color-content-neutral-04: #a0a6a4;
  --gds-sys-color-content-inversed: #ffffff;
  --gds-sys-color-content-brand-01: #003824;
  --gds-sys-color-content-brand-02: #685631;
  --gds-sys-color-content-positive-01: #027839;
  --gds-sys-color-content-positive-02: #eaf6ea;
  --gds-sys-color-content-positive-03: #026436;
  --gds-sys-color-content-negative-01: #b92f13;
  --gds-sys-color-content-negative-02: #fdebe8;
  --gds-sys-color-content-warning-01: #8f530a;
  --gds-sys-color-content-warning-02: #fce8cf;
  --gds-sys-color-content-notice-01: #005fb3;
  --gds-sys-color-content-notice-02: #e6f3ff;
  --gds-sys-color-content-disabled-01: #a0a6a4;
  --gds-sys-color-content-disabled-02: #f7f8f7;
  --gds-sys-color-state-brand-01: #ffffff 20%;
  --gds-sys-color-state-brand-02: #ffffff 35%;
  --gds-sys-color-state-brand-03: #003824 6%;
  --gds-sys-color-state-brand-04: #003824 14%;
  --gds-sys-color-state-brand-05: #003824 6%;
  --gds-sys-color-state-brand-06: #003824 14%;
  --gds-sys-color-state-neutral-01: #ffffff 20%;
  --gds-sys-color-state-neutral-02: #ffffff 35%;
  --gds-sys-color-state-neutral-03: #000000 6%;
  --gds-sys-color-state-neutral-04: #000000 14%;
  --gds-sys-color-state-neutral-05: #000000 6%;
  --gds-sys-color-state-neutral-06: #000000 14%;
  --gds-sys-color-state-positive-01: #ffffff 12%;
  --gds-sys-color-state-positive-02: #ffffff 23%;
  --gds-sys-color-state-positive-03: #027839 8%;
  --gds-sys-color-state-positive-04: #027839 16%;
  --gds-sys-color-state-positive-05: #027839 8%;
  --gds-sys-color-state-positive-06: #027839 16%;
  --gds-sys-color-state-negative-01: #ffffff 8%;
  --gds-sys-color-state-negative-02: #ffffff 16%;
  --gds-sys-color-state-negative-03: #b92f13 8%;
  --gds-sys-color-state-negative-04: #b92f13 16%;
  --gds-sys-color-state-negative-05: #b92f13 8%;
  --gds-sys-color-state-negative-06: #b92f13 16%;
  --gds-sys-color-state-notice-01: #ffffff 20%;
  --gds-sys-color-state-notice-02: #ffffff 35%;
  --gds-sys-color-state-notice-03: #005fb3 8%;
  --gds-sys-color-state-notice-04: #005fb3 16%;
  --gds-sys-color-state-notice-05: #005fb3 8%;
  --gds-sys-color-state-notice-06: #005fb3 16%;
  --gds-sys-color-state-warning-01: #ffffff 20%;
  --gds-sys-color-state-warning-02: #ffffff 35%;
  --gds-sys-color-state-warning-03: #8f530a 8%;
  --gds-sys-color-state-warning-04: #8f530a 16%;
  --gds-sys-color-state-warning-05: #8f530a 8%;
  --gds-sys-color-state-warning-06: #8f530a 16%;`,_e=ca;var pa=`/**
 * Do not edit directly, this file was auto-generated.
 */

  --gds-sys-shadow-xs-01: 0px 1px 2px 0px rgba(10, 11, 10, 0.05);
  --gds-sys-shadow-xs-02: 0px 0px 0px 0px transparent;
  --gds-sys-shadow-s-01: 0px 1px 2px 0px rgba(10, 11, 10, 0.10);
  --gds-sys-shadow-s-02: 0px 1px 3px 0px rgba(10, 11, 10, 0.06);
  --gds-sys-shadow-m-01: 0px 2px 4px -2px rgba(10, 11, 10, 0.10);
  --gds-sys-shadow-m-02: 0px 4px 8px -2px rgba(10, 11, 10, 0.06);
  --gds-sys-shadow-l-01: 0px 4px 6px -2px rgba(10, 11, 10, 0.08);
  --gds-sys-shadow-l-02: 0px 12px 16px -4px rgba(10, 11, 10, 0.03);
  --gds-sys-shadow-xl-01: 0px 20px 24px -4px rgba(10, 11, 10, 0.08);
  --gds-sys-shadow-xl-02: 0px 0px 0px 0px rgba(10, 11, 10, 0.08);
  --gds-sys-shadow-2xl-01: 0px 24px 48px -12px rgba(10, 11, 10, 0.18);
  --gds-sys-shadow-2xl-02: 0px 0px 0px 0px transparent;`,Kr=pa;var he=typeof process<"u"&&process.env!==void 0,Co=/iPad|iPhone|iPod/.test(he?"":navigator.userAgent);var lr,ue,ke,dr,We,$o,Eo,To;function ha(){return he?[]:[...document.adoptedStyleSheets]}var ua=class Mo{constructor(){h(this,We),h(this,lr,!Ie()),h(this,ue,new Map),h(this,ke,new Map),h(this,dr,ha())}static get instance(){return globalThis.__gdsGlobalStylesRegistryScoped?.[mt]||(globalThis.__gdsGlobalStylesRegistryScoped={...globalThis.__gdsGlobalStylesRegistryScoped,[mt]:new Mo}),globalThis.__gdsGlobalStylesRegistryScoped[mt]}injectGlobalStyles(t,r){if(i(this,lr)){let s=Array.isArray(r)?r.map(n=>n.toString()).join(""):r.toString();b(this,We,$o).call(this,t,s)}else r.styleSheet&&b(this,We,Eo).call(this,t,r.styleSheet)}clearGlobalStyles(t){if(i(this,lr)){let r=i(this,ke).get(t);r&&r.parentNode&&(r.parentNode.removeChild(r),i(this,ke).delete(t))}else b(this,We,To).call(this,t)}};lr=new WeakMap;ue=new WeakMap;ke=new WeakMap;dr=new WeakMap;We=new WeakSet;$o=function(e,t){if(he)return;let r=i(this,ke).get(e);r||(r=document.createElement("style"),i(this,ke).set(e,r)),r.textContent=t,document.head.appendChild(r)};Eo=function(e,t){he||(i(this,ue).set(e,t),document.adoptedStyleSheets=[...i(this,dr),...Array.from(i(this,ue).values())])};To=function(e){i(this,ue).has(e)&&(i(this,ue).delete(e),document.adoptedStyleSheets=[...i(this,dr),...Array.from(i(this,ue).values())])};var Se=ua;var z=[v`
    :host {
      ${F(Qr)}
      ${F(Kr)}
    }
  `];Se.instance.injectGlobalStyles("root-tokens",v`
    :root {
      ${F(Qr)}
      ${F(Kr)}
    }
    :root:not([gds-theme]),
    :root[gds-theme='light'] {
      ${F(_e)}
    }
    :root[gds-theme='dark'] {
      ${F(pe)}
    }
    :root[gds-theme='auto'] {
      @media (prefers-color-scheme: dark) {
        ${F(pe)}
      }
      @media (prefers-color-scheme: light) {
        ${F(_e)}
      }
    }
  `);var ma=`/* stylelint-disable max-nesting-depth */
/**
 * Assert that a map is in ascending order
 * @mixin assert-ascending
 * @param {Map} $map - The map to check
 * @param {String} $map-name - The name of the map
 */
/**
 * Assert that the first breakpoint in a map starts at zero
 * @mixin assert-starts-at-zero
 * @param {Map} $map - The map to check
 * @param {String} $map-name - The name of the map
 */
/**
 * Check if a value is important
 * @function is-important
 * @param {Boolean} $important - Whether the value is important
 * @return {String} - "!important" if true, otherwise an empty string
 */
/**
 * Replace a substring in a string
 * @function str-replace
 * @param {String} $string - The original string
 * @param {String} $search - The substring to replace
 * @param {String} $replace - The replacement string
 * @return {String} - The updated string
 */
/**
 * Convert a map to its negative variant
 * @function negativify-map
 * @param {Map} $map - The map to convert
 * @return {Map} - The negative variant of the map
 */
/**
 * Generate utility classes
 * @mixin generate-utility
 * @param {Map} $utility - Utility map
 * @param {String} $infix - Infix for class names
 * @param {Boolean} $is-rfs-media-query - Whether to use RFS media query
 */
/* stylelint-enable max-nesting-depth */
/**
 * Calculate the luminance for a color.
 * @function luminance
 * @param {Color} $color - The color to calculate luminance for
 * @return {Number} - The luminance value
 */
/**
 * Calculate the contrast ratio between two colors.
 * @function color-contrast
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @return {Number} - The contrast ratio
 */
/**
 * Remove the unit of a length
 * @function strip-unit
 * @param {Number} $number - Number to remove unit from
 * @return {Number} - Unitless number
 */
/**
 * Validate font size
 * @function validate-font-size
 * @param {Number} $size - Font size to validate
 * @return {Number} - Validated font size in pixels
 */
/**
 * Get ratio for WCAG level
 * @function get-ratio
 * @param {String} $level - WCAG level
 * @param {Number} $size - Font size
 * @param {Boolean} $bold - Is bold
 * @param {Boolean} $graphic - Is graphic
 * @return {Number} - Ratio value
 */
/**
 * Determine if a color is light or dark
 * @function light-or-dark
 * @param {Color} $color - The color to check
 * @return {String} - "light" or "dark"
 */
/**
 * Get the most legible color (black or white) for a given background color
 * @function most-legible-color
 * @param {Color} $color - The background color
 * @return {Color} - The most legible color
 */
/**
 * Get the desired color combination for foreground and background colors
 * @function desired-color-combination
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {Number} $offsetThreshold - Offset threshold
 * @param {Number} $ratio - Contrast ratio
 * @return {List} - List containing background and foreground colors
 */
/**
 * @mixin desired-color-combination
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {Number} $offsetThreshold - Offset threshold
 * @param {Number} $ratio - Contrast ratio
 */
/**
 * Get an accessible color for a given foreground and background color
 * @function a11y-color
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {String} $level - WCAG level
 * @param {Number} $size - Font size
 * @param {Boolean} $bold - Is bold
 * @param {Boolean} $graphic - Is graphic
 * @param {Number} $maxOffset - Maximum offset
 * @param {Boolean} $darkMode - Is dark mode
 * @param {Number} $ratio - Contrast ratio
 * @return {Color} - Accessible color
 */
/**
 * Get the maximum contrast color
 * @function max-contrast
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {Color} $max - Maximum contrast color
 * @return {Color} - Maximum contrast color
 */
/**
 * Get the RGB values of a color as a string
 * @function stripped-rgb
 * @param {Color} $color - The color
 * @return {String} - RGB values as a string
 */
/**
 * Get the HSL values of a color as a string
 * @function stripped-hsl
 * @param {Color} $color - The color
 * @return {String} - HSL values as a string
 */
/**
 * Convert a map of colors to a map of HSL values
 * @function hsl-map
 * @param {Map} $colors - Map of colors
 * @return {Map} - Map of HSL values
 */
/**
* @deprecated
* Use \`add-focus\` instead
*/
/** add background color, color and border-color to element when it has focus-visible i.e. tab focus */
/**
 * Breakpoint viewport sizes and media queries.
 *
 * Breakpoints are defined as a map of (name: minimum width), order from small to large:
 *
 *    (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px)
 *
 * The map defined in the \`$grid-breakpoints\` global variable is used as the \`$breakpoints\` argument by default.
 */
/**
 * Name of the next breakpoint, or null for the last breakpoint.
 *
 *    >> breakpoint-next(sm)
 *    md
 *    >> breakpoint-next(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    md
 *    >> breakpoint-next(sm, $breakpoint-names: (xs sm md lg xl))
 *    md
 */
/**
 * Minimum breakpoint width. Null for the smallest (first) breakpoint.
 *
 *    >> breakpoint-min(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    576px
 */
/**
 * Maximum breakpoint width.
 * The maximum value is reduced by 0.02px to work around the limitations of
 * \`min-\` and \`max-\` prefixes and viewports with fractional widths.
 * See https://www.w3.org/TR/mediaqueries-4/#mq-min-max
 * Uses 0.02px rather than 0.01px to work around a current rounding bug in Safari.
 * See https://bugs.webkit.org/show_bug.cgi?id=178261
 *
 *    >> breakpoint-max(md, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    767.98px
 */
/**
 * Returns a blank string if smallest breakpoint, otherwise returns the name with a dash in front.
 * Useful for making responsive utilities.
 *
 *    >> breakpoint-infix(xs, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    ""  (Returns a blank string)
 *    >> breakpoint-infix(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    "-sm"
 */
/**
 * Media of at least the minimum breakpoint width. No query for the smallest breakpoint.
 * Makes the @content apply to the given breakpoint and wider.
 */
/**
 * Media of at most the maximum breakpoint width. No query for the largest breakpoint.
 * Makes the @content apply to the given breakpoint and narrower.
 */
/**
 * Media that spans multiple breakpoint widths.
 * Makes the @content apply between the min and max breakpoints
 */
/**
 * Media between the breakpoint's minimum and maximum widths.
 * No minimum for the smallest breakpoint, and no maximum for the largest one.
 * Makes the @content apply only to the given breakpoint, not viewports any wider or narrower.
 */
@layer base, reset, transitional-styles;
@layer transitional-styles {
  @layer _base, _ranks, _overrides;
  :host {
    display: inline-block;
  }
  @layer _base {
    .button {
      background-color: transparent;
      border: 0;
      cursor: pointer;
      font-family: inherit;
      padding: 0;
      padding-left: 1rem;
      padding-right: 1rem;
      padding-bottom: 0.75rem;
      padding-top: 0.75rem;
      border-radius: 0.25rem;
      border: solid 1px var(--gds-sys-color-base-600);
      font-weight: 500;
    }
    .button:focus:not(:focus-visible) {
      box-shadow: none;
      outline: 0;
    }
    .button:focus, .button:focus-visible {
      outline-color: var(--gds-sys-color-focus-outline);
      outline-style: solid;
      outline-width: 0.125rem;
      outline-offset: 0.125rem;
    }
    .button {
      min-height: 2.75rem;
      align-items: center;
      display: inline-flex;
      justify-content: center;
    }
    @media (max-width: 35.98em) {
      .button {
        min-width: 100%;
      }
    }
    @media screen and (-ms-high-contrast: active) {
      .button {
        border: 2px solid currentcolor;
      }
    }
    .button.small {
      min-height: 2rem;
      height: 2rem;
      padding: 0.4375rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1rem;
    }
    .button.large {
      min-height: 4rem;
      padding: 1rem 1.5rem;
      font-size: 1.5rem;
      line-height: 2rem;
    }
    .button {
      box-sizing: border-box;
      font-size: inherit;
      overflow: hidden;
      display: flex;
      gap: 0.5rem;
      text-decoration: none;
      width: 100%;
    }
    .button slot:not([name]) {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :host(:not([variant=ghost])) .button {
      transition: border var(--gds-sys-transition);
    }
    :host(:not([variant=ghost])) .button:not(:disabled, .disabled, [aria-disabled]):hover {
      background: var(--gds-sys-color-dark-blue-1);
      color: var(--gds-sys-color-text-white);
      --background: var(--gds-sys-color-dark-blue-1);
      --color: var(--gds-sys-color-text-white);
      border-color: var(--gds-sys-color-dark-blue-1);
    }
    :host(:not([variant=ghost])) .button[aria-selected=true], :host(:not([variant=ghost])) .button:active, :host(:not([variant=ghost])) .button.active, :host(:not([variant=ghost])) .button.active:hover, :host(:not([variant=ghost])) .button:active:hover {
      background: var(--gds-sys-color-dark-blue-2);
      color: var(--gds-sys-color-text-white);
      --background: $bg;
      --color: $color;
      border-color: var(--gds-sys-color-dark-blue-2);
    }
    :host(:not([variant=ghost])) .button {
      background: var(--gds-sys-color-dark-blue-2);
      border-color: var(--gds-sys-color-dark-blue-2);
      color: var(--gds-sys-color-text-white);
      --color: var(--gds-sys-color-text-white);
    }
    :host(:not([variant=ghost])) .button:disabled, :host(:not([variant=ghost])) .button.disabled, :host(:not([variant=ghost])) .button[aria-disabled=true] {
      background: var(--gds-sys-color-base-300) !important;
      color: var(--gds-sys-color-text-disabled) !important;
      border-color: var(--gds-sys-color-text-disabled) !important;
      cursor: not-allowed;
    }
    :host(:not([variant=ghost])) .button:disabled::-moz-placeholder, :host(:not([variant=ghost])) .button.disabled::-moz-placeholder, :host(:not([variant=ghost])) .button[aria-disabled=true]::-moz-placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    :host(:not([variant=ghost])) .button:disabled::placeholder, :host(:not([variant=ghost])) .button.disabled::placeholder, :host(:not([variant=ghost])) .button[aria-disabled=true]::placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    :host([rank*=secondary]) .button:focus:not(:focus-visible) {
      box-shadow: none;
      outline: 0;
    }
    :host([rank*=secondary]) .button:focus, :host([rank*=secondary]) .button:focus-visible {
      outline-color: var(--gds-sys-color-focus-outline);
      outline-style: solid;
      outline-width: 0.125rem;
      outline-offset: 0.125rem;
    }
    :host([rank*=secondary]) .button {
      transition: border var(--gds-sys-transition);
    }
    :host([rank*=secondary]) .button:not(:disabled, .disabled, [aria-disabled]):hover {
      background: var(--gds-sys-color-dark-blue-1);
      color: var(--gds-sys-color-text-white);
      --background: var(--gds-sys-color-dark-blue-1);
      --color: var(--gds-sys-color-text-white);
      border-color: var(--gds-sys-color-dark-blue-1);
    }
    :host([rank*=secondary]) .button[aria-selected=true], :host([rank*=secondary]) .button:active, :host([rank*=secondary]) .button.active, :host([rank*=secondary]) .button.active:hover, :host([rank*=secondary]) .button:active:hover {
      background: var(--gds-sys-color-dark-blue-2);
      color: var(--gds-sys-color-text-white);
      --background: $bg;
      --color: $color;
      border-color: var(--gds-sys-color-dark-blue-2);
    }
    :host([rank*=secondary]) .button {
      background: transparent;
      border-color: var(--gds-sys-color-dark-blue-2);
      color: var(--gds-sys-color-dark-blue-2);
      --color: var(--gds-sys-color-dark-blue-2);
    }
    :host([rank*=secondary]) .button:disabled, :host([rank*=secondary]) .button.disabled, :host([rank*=secondary]) .button[aria-disabled=true] {
      background: var(--gds-sys-color-base-300) !important;
      color: var(--gds-sys-color-text-disabled) !important;
      border-color: var(--gds-sys-color-text-disabled) !important;
      cursor: not-allowed;
    }
    :host([rank*=secondary]) .button:disabled::-moz-placeholder, :host([rank*=secondary]) .button.disabled::-moz-placeholder, :host([rank*=secondary]) .button[aria-disabled=true]::-moz-placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    :host([rank*=secondary]) .button:disabled::placeholder, :host([rank*=secondary]) .button.disabled::placeholder, :host([rank*=secondary]) .button[aria-disabled=true]::placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    :host([rank*=tertiary]) .button:focus:not(:focus-visible) {
      box-shadow: none;
      outline: 0;
    }
    :host([rank*=tertiary]) .button:focus, :host([rank*=tertiary]) .button:focus-visible {
      outline-color: var(--gds-sys-color-focus-outline);
      outline-style: solid;
      outline-width: 0.125rem;
      outline-offset: 0.125rem;
    }
    :host([rank*=tertiary]) .button {
      transition: border var(--gds-sys-transition);
    }
    :host([rank*=tertiary]) .button:not(:disabled, .disabled, [aria-disabled]):hover {
      background: var(--gds-sys-color-dark-blue-1);
      color: var(--gds-sys-color-text-white);
      --background: var(--gds-sys-color-dark-blue-1);
      --color: var(--gds-sys-color-text-white);
      border-color: var(--gds-sys-color-dark-blue-1);
    }
    :host([rank*=tertiary]) .button[aria-selected=true], :host([rank*=tertiary]) .button:active, :host([rank*=tertiary]) .button.active, :host([rank*=tertiary]) .button.active:hover, :host([rank*=tertiary]) .button:active:hover {
      background: var(--gds-sys-color-dark-blue-2);
      color: var(--gds-sys-color-text-white);
      --background: $bg;
      --color: $color;
      border-color: var(--gds-sys-color-dark-blue-2);
    }
    :host([rank*=tertiary]) .button {
      background: transparent;
      border-color: transparent;
      color: var(--gds-sys-color-dark-blue-2);
      --color: var(--gds-sys-color-dark-blue-2);
    }
    :host([rank*=tertiary]) .button:disabled, :host([rank*=tertiary]) .button.disabled, :host([rank*=tertiary]) .button[aria-disabled=true] {
      background: var(--gds-sys-color-base-300) !important;
      color: var(--gds-sys-color-text-disabled) !important;
      border-color: var(--gds-sys-color-text-disabled) !important;
      cursor: not-allowed;
    }
    :host([rank*=tertiary]) .button:disabled::-moz-placeholder, :host([rank*=tertiary]) .button.disabled::-moz-placeholder, :host([rank*=tertiary]) .button[aria-disabled=true]::-moz-placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    :host([rank*=tertiary]) .button:disabled::placeholder, :host([rank*=tertiary]) .button.disabled::placeholder, :host([rank*=tertiary]) .button[aria-disabled=true]::placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    /* stylelint-disable */
    :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button,
    :host([variant=negative][rank=primary]) .button {
      background: var(--gds-sys-color-dark-red-1);
      border-color: var(--gds-sys-color-dark-red-1);
      color: var(--gds-sys-color-text-white);
      --color: var(--gds-sys-color-text-white);
      transition: border var(--gds-sys-transition);
    }
    :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:not(:disabled, .disabled, [aria-disabled]):hover,
    :host([variant=negative][rank=primary]) .button:not(:disabled, .disabled, [aria-disabled]):hover {
      background: var(--gds-sys-color-dark-red-1);
      color: var(--gds-sys-color-text-white);
      --background: var(--gds-sys-color-dark-red-1);
      --color: var(--gds-sys-color-text-white);
      border-color: var(--gds-sys-color-dark-red-1);
    }
    :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button[aria-selected=true], :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:active, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button.active, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button.active:hover, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:active:hover,
    :host([variant=negative][rank=primary]) .button[aria-selected=true],
    :host([variant=negative][rank=primary]) .button:active,
    :host([variant=negative][rank=primary]) .button.active,
    :host([variant=negative][rank=primary]) .button.active:hover,
    :host([variant=negative][rank=primary]) .button:active:hover {
      background: var(--gds-sys-color-dark-red-1);
      color: var(--gds-sys-color-text-white);
      --background: $bg;
      --color: $color;
      border-color: var(--gds-sys-color-dark-red-1);
    }
    :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button[aria-selected]:hover, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button.active:hover, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:active:hover,
    :host([variant=negative][rank=primary]) .button[aria-selected]:hover,
    :host([variant=negative][rank=primary]) .button.active:hover,
    :host([variant=negative][rank=primary]) .button:active:hover {
      opacity: 0.9;
    }
    :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:focus:not(:focus-visible),
    :host([variant=negative][rank=primary]) .button:focus:not(:focus-visible) {
      box-shadow: none;
      outline: 0;
    }
    :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:focus, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:focus-visible,
    :host([variant=negative][rank=primary]) .button:focus,
    :host([variant=negative][rank=primary]) .button:focus-visible {
      outline-color: var(--gds-sys-color-focus-outline);
      outline-style: solid;
      outline-width: 0.125rem;
      outline-offset: 0.125rem;
    }
    :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:disabled, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button.disabled, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button[aria-disabled=true],
    :host([variant=negative][rank=primary]) .button:disabled,
    :host([variant=negative][rank=primary]) .button.disabled,
    :host([variant=negative][rank=primary]) .button[aria-disabled=true] {
      background: var(--gds-sys-color-background-primary) !important;
      color: var(--gds-sys-color-text-white) !important;
      border-color: var(--gds-sys-color-dark-red-1) !important;
      cursor: not-allowed;
    }
    :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:disabled::-moz-placeholder, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button.disabled::-moz-placeholder, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button[aria-disabled=true]::-moz-placeholder, :host([variant=negative][rank=primary]) .button:disabled::-moz-placeholder, :host([variant=negative][rank=primary]) .button.disabled::-moz-placeholder, :host([variant=negative][rank=primary]) .button[aria-disabled=true]::-moz-placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button:disabled::placeholder, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button.disabled::placeholder, :host([variant=negative]:not([rank=secondary], [rank=tertiary])) .button[aria-disabled=true]::placeholder,
    :host([variant=negative][rank=primary]) .button:disabled::placeholder,
    :host([variant=negative][rank=primary]) .button.disabled::placeholder,
    :host([variant=negative][rank=primary]) .button[aria-disabled=true]::placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    /* stylelint-enable */
    :host([variant=negative][rank=secondary]) .button,
    :host([variant=negative][rank=tertiary]) .button {
      color: var(--gds-sys-color-dark-red-1);
      --color: var(--gds-sys-color-dark-red-1);
      border-color: transparent;
      transition: border var(--gds-sys-transition);
    }
    :host([variant=negative][rank=secondary]) .button:not(:disabled, .disabled, [aria-disabled]):hover,
    :host([variant=negative][rank=tertiary]) .button:not(:disabled, .disabled, [aria-disabled]):hover {
      background: var(--gds-sys-color-dark-red-1);
      color: var(--gds-sys-color-text-white);
      --background: var(--gds-sys-color-dark-red-1);
      --color: var(--gds-sys-color-text-white);
      border-color: var(--gds-sys-color-dark-red-1);
    }
    :host([variant=negative][rank=secondary]) .button[aria-selected=true], :host([variant=negative][rank=secondary]) .button:active, :host([variant=negative][rank=secondary]) .button.active, :host([variant=negative][rank=secondary]) .button.active:hover, :host([variant=negative][rank=secondary]) .button:active:hover,
    :host([variant=negative][rank=tertiary]) .button[aria-selected=true],
    :host([variant=negative][rank=tertiary]) .button:active,
    :host([variant=negative][rank=tertiary]) .button.active,
    :host([variant=negative][rank=tertiary]) .button.active:hover,
    :host([variant=negative][rank=tertiary]) .button:active:hover {
      background: var(--gds-sys-color-dark-red-1);
      color: var(--gds-sys-color-text-white);
      --background: $bg;
      --color: $color;
      border-color: var(--gds-sys-color-dark-red-1);
    }
    :host([variant=negative][rank=secondary]) .button[aria-selected]:hover, :host([variant=negative][rank=secondary]) .button.active:hover, :host([variant=negative][rank=secondary]) .button:active:hover,
    :host([variant=negative][rank=tertiary]) .button[aria-selected]:hover,
    :host([variant=negative][rank=tertiary]) .button.active:hover,
    :host([variant=negative][rank=tertiary]) .button:active:hover {
      opacity: 0.9;
    }
    :host([variant=negative][rank=secondary]) .button:focus:not(:focus-visible),
    :host([variant=negative][rank=tertiary]) .button:focus:not(:focus-visible) {
      box-shadow: none;
      outline: 0;
    }
    :host([variant=negative][rank=secondary]) .button:focus, :host([variant=negative][rank=secondary]) .button:focus-visible,
    :host([variant=negative][rank=tertiary]) .button:focus,
    :host([variant=negative][rank=tertiary]) .button:focus-visible {
      outline-color: var(--gds-sys-color-focus-outline);
      outline-style: solid;
      outline-width: 0.125rem;
      outline-offset: 0.125rem;
    }
    :host([variant=negative][rank=secondary]) .button {
      border-color: var(--gds-sys-color-dark-red-2);
    }
    :host([variant=ghost]) .button {
      transition: border var(--gds-sys-transition);
    }
    :host([variant=ghost]) .button:not(:disabled, .disabled, [aria-disabled]):hover {
      background: var(--gds-sys-color-base-800);
      color: var(--gds-sys-color-text-white);
      --background: var(--gds-sys-color-base-800);
      --color: var(--gds-sys-color-text-white);
      border-color: var(--gds-sys-color-base-800);
    }
    :host([variant=ghost]) .button[aria-selected=true], :host([variant=ghost]) .button:active, :host([variant=ghost]) .button.active, :host([variant=ghost]) .button.active:hover, :host([variant=ghost]) .button:active:hover {
      background: var(--gds-sys-color-base-800);
      color: var(--gds-sys-color-text-white);
      --background: $bg;
      --color: $color;
      border-color: var(--gds-sys-color-base-800);
    }
    :host([variant=ghost]) .button[aria-selected]:hover, :host([variant=ghost]) .button.active:hover, :host([variant=ghost]) .button:active:hover {
      opacity: 0.9;
    }
    :host([variant=ghost]) .button {
      background-color: transparent;
      border-color: var(--gds-sys-color-base-800);
      color: var(--gds-sys-color-base-800);
      --color: var(--gds-sys-color-base-800);
    }
    :host([variant=ghost]) .button:disabled, :host([variant=ghost]) .button.disabled, :host([variant=ghost]) .button[aria-disabled=true] {
      color: var(--gds-sys-color-text-disabled) !important;
      border-color: var(--gds-sys-color-text-disabled) !important;
      cursor: not-allowed;
    }
    :host([variant=ghost]) .button:disabled::-moz-placeholder, :host([variant=ghost]) .button.disabled::-moz-placeholder, :host([variant=ghost]) .button[aria-disabled=true]::-moz-placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    :host([variant=ghost]) .button:disabled::placeholder, :host([variant=ghost]) .button.disabled::placeholder, :host([variant=ghost]) .button[aria-disabled=true]::placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
  }
  @layer _overrides {
    :host .button.icon {
      padding: 0.75rem;
      background: transparent;
      border-width: 0px;
      color: currentColor;
    }
    :host .button.icon:hover {
      color: currentColor;
      background: var(--gds-sys-color-base-300);
    }
    :host .button.icon slot {
      display: contents;
    }
    .button.icon.xs {
      min-height: 1.5rem;
      line-height: 0.75rem;
      padding: 0.25rem;
    }
    .button.icon.small {
      padding: 0.5rem;
    }
    .button.icon.large {
      padding: 1rem;
    }
  }
}`,Ao=ma;function we(){U.instance.register("gds-button",Ao.toString())}var ga=`/* stylelint-disable max-nesting-depth */
/**
 * Assert that a map is in ascending order
 * @mixin assert-ascending
 * @param {Map} $map - The map to check
 * @param {String} $map-name - The name of the map
 */
/**
 * Assert that the first breakpoint in a map starts at zero
 * @mixin assert-starts-at-zero
 * @param {Map} $map - The map to check
 * @param {String} $map-name - The name of the map
 */
/**
 * Check if a value is important
 * @function is-important
 * @param {Boolean} $important - Whether the value is important
 * @return {String} - "!important" if true, otherwise an empty string
 */
/**
 * Replace a substring in a string
 * @function str-replace
 * @param {String} $string - The original string
 * @param {String} $search - The substring to replace
 * @param {String} $replace - The replacement string
 * @return {String} - The updated string
 */
/**
 * Convert a map to its negative variant
 * @function negativify-map
 * @param {Map} $map - The map to convert
 * @return {Map} - The negative variant of the map
 */
/**
 * Generate utility classes
 * @mixin generate-utility
 * @param {Map} $utility - Utility map
 * @param {String} $infix - Infix for class names
 * @param {Boolean} $is-rfs-media-query - Whether to use RFS media query
 */
/* stylelint-enable max-nesting-depth */
/**
 * Calculate the luminance for a color.
 * @function luminance
 * @param {Color} $color - The color to calculate luminance for
 * @return {Number} - The luminance value
 */
/**
 * Calculate the contrast ratio between two colors.
 * @function color-contrast
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @return {Number} - The contrast ratio
 */
/**
 * Remove the unit of a length
 * @function strip-unit
 * @param {Number} $number - Number to remove unit from
 * @return {Number} - Unitless number
 */
/**
 * Validate font size
 * @function validate-font-size
 * @param {Number} $size - Font size to validate
 * @return {Number} - Validated font size in pixels
 */
/**
 * Get ratio for WCAG level
 * @function get-ratio
 * @param {String} $level - WCAG level
 * @param {Number} $size - Font size
 * @param {Boolean} $bold - Is bold
 * @param {Boolean} $graphic - Is graphic
 * @return {Number} - Ratio value
 */
/**
 * Determine if a color is light or dark
 * @function light-or-dark
 * @param {Color} $color - The color to check
 * @return {String} - "light" or "dark"
 */
/**
 * Get the most legible color (black or white) for a given background color
 * @function most-legible-color
 * @param {Color} $color - The background color
 * @return {Color} - The most legible color
 */
/**
 * Get the desired color combination for foreground and background colors
 * @function desired-color-combination
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {Number} $offsetThreshold - Offset threshold
 * @param {Number} $ratio - Contrast ratio
 * @return {List} - List containing background and foreground colors
 */
/**
 * @mixin desired-color-combination
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {Number} $offsetThreshold - Offset threshold
 * @param {Number} $ratio - Contrast ratio
 */
/**
 * Get an accessible color for a given foreground and background color
 * @function a11y-color
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {String} $level - WCAG level
 * @param {Number} $size - Font size
 * @param {Boolean} $bold - Is bold
 * @param {Boolean} $graphic - Is graphic
 * @param {Number} $maxOffset - Maximum offset
 * @param {Boolean} $darkMode - Is dark mode
 * @param {Number} $ratio - Contrast ratio
 * @return {Color} - Accessible color
 */
/**
 * Get the maximum contrast color
 * @function max-contrast
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {Color} $max - Maximum contrast color
 * @return {Color} - Maximum contrast color
 */
/**
 * Get the RGB values of a color as a string
 * @function stripped-rgb
 * @param {Color} $color - The color
 * @return {String} - RGB values as a string
 */
/**
 * Get the HSL values of a color as a string
 * @function stripped-hsl
 * @param {Color} $color - The color
 * @return {String} - HSL values as a string
 */
/**
 * Convert a map of colors to a map of HSL values
 * @function hsl-map
 * @param {Map} $colors - Map of colors
 * @return {Map} - Map of HSL values
 */
/**
* @deprecated
* Use \`add-focus\` instead
*/
/** add background color, color and border-color to element when it has focus-visible i.e. tab focus */
/**
 * Breakpoint viewport sizes and media queries.
 *
 * Breakpoints are defined as a map of (name: minimum width), order from small to large:
 *
 *    (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px)
 *
 * The map defined in the \`$grid-breakpoints\` global variable is used as the \`$breakpoints\` argument by default.
 */
/**
 * Name of the next breakpoint, or null for the last breakpoint.
 *
 *    >> breakpoint-next(sm)
 *    md
 *    >> breakpoint-next(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    md
 *    >> breakpoint-next(sm, $breakpoint-names: (xs sm md lg xl))
 *    md
 */
/**
 * Minimum breakpoint width. Null for the smallest (first) breakpoint.
 *
 *    >> breakpoint-min(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    576px
 */
/**
 * Maximum breakpoint width.
 * The maximum value is reduced by 0.02px to work around the limitations of
 * \`min-\` and \`max-\` prefixes and viewports with fractional widths.
 * See https://www.w3.org/TR/mediaqueries-4/#mq-min-max
 * Uses 0.02px rather than 0.01px to work around a current rounding bug in Safari.
 * See https://bugs.webkit.org/show_bug.cgi?id=178261
 *
 *    >> breakpoint-max(md, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    767.98px
 */
/**
 * Returns a blank string if smallest breakpoint, otherwise returns the name with a dash in front.
 * Useful for making responsive utilities.
 *
 *    >> breakpoint-infix(xs, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    ""  (Returns a blank string)
 *    >> breakpoint-infix(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    "-sm"
 */
/**
 * Media of at least the minimum breakpoint width. No query for the smallest breakpoint.
 * Makes the @content apply to the given breakpoint and wider.
 */
/**
 * Media of at most the maximum breakpoint width. No query for the largest breakpoint.
 * Makes the @content apply to the given breakpoint and narrower.
 */
/**
 * Media that spans multiple breakpoint widths.
 * Makes the @content apply between the min and max breakpoints
 */
/**
 * Media between the breakpoint's minimum and maximum widths.
 * No minimum for the smallest breakpoint, and no maximum for the largest one.
 * Makes the @content apply only to the given breakpoint, not viewports any wider or narrower.
 */
@layer base, reset, transitional-styles;
@layer transitional-styles {
  .field {
    border-radius: 0.25rem;
    border: solid 1px var(--gds-sys-color-base-600);
    --border-color: var(--gds-sys-color-base-600);
  }
  .field:focus:not(:focus-visible) {
    box-shadow: none;
    outline: 0;
  }
  .field:focus, .field:focus-within {
    outline-color: var(--gds-sys-color-focus-outline);
    outline-style: solid;
    outline-width: 0.125rem;
    outline-offset: 0.125rem;
  }
  .field {
    align-items: stretch;
    gap: var(--gds-sys-space-xs);
    background-color: var(--gds-sys-color-background-primary);
    box-sizing: border-box;
    color: var(--gds-sys-color-text-primary);
    cursor: text;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: calc(var(--gds-sys-space-xs) - 1px) var(--gds-sys-space-xs) calc(var(--gds-sys-space-xs) - 1px) var(--gds-sys-space-m);
    min-block-size: 44px;
  }
  .field:hover {
    background-color: var(--grey-200);
  }
  .field.small {
    font-size: 0.875rem;
    min-height: 2rem;
  }
  .field.multiline {
    align-items: flex-start;
    padding: calc(var(--gds-sys-space-s) - 1px) var(--gds-sys-space-s) calc(var(--gds-sys-space-s) - 1px) var(--gds-sys-space-m);
    height: -moz-max-content;
    height: max-content;
  }
  .field.action-slot-occupied:not(.trail-slot-occupied) {
    padding-right: var(--gds-sys-space-xs);
  }
  .field.lead-slot-occupied {
    padding-left: var(--gds-sys-space-xs);
  }
  .field.trail-slot-occupied {
    padding: calc(var(--gds-sys-space-xs) - 1px) var(--gds-sys-space-m);
  }
  .field slot[name=action]::slotted(*) {
    margin: -3px 0 -3px -3px;
  }
  .field:focus-within {
    outline-color: currentColor;
  }
  .field.invalid {
    border-color: var(--gds-sys-color-border-negative-01);
    color: var(--gds-sys-color-content-negative-01);
    border-bottom-width: 2px;
  }
  .field.disabled {
    background: var(--gds-sys-color-l3-disabled-01);
    color: var(--gds-sys-color-content-disabled-01);
    border-color: transparent;
    pointer-events: none;
  }
  .main-slot-wrap {
    display: flex;
    flex: 1;
  }
  slot:not([name])::slotted(*) {
    color: currentColor;
  }
  slot[name=lead]::slotted([gds-element^=gds-icon-]) {
    align-items: center;
    justify-content: center;
    display: flex;
    min-width: var(--gds-sys-space-l);
  }
}`,Bo=ga;function cr(){U.instance.register("gds-field-base",Bo.toString())}function Lo(){we(),cr()}var fa=`/* stylelint-disable max-nesting-depth */
/**
 * Assert that a map is in ascending order
 * @mixin assert-ascending
 * @param {Map} $map - The map to check
 * @param {String} $map-name - The name of the map
 */
/**
 * Assert that the first breakpoint in a map starts at zero
 * @mixin assert-starts-at-zero
 * @param {Map} $map - The map to check
 * @param {String} $map-name - The name of the map
 */
/**
 * Check if a value is important
 * @function is-important
 * @param {Boolean} $important - Whether the value is important
 * @return {String} - "!important" if true, otherwise an empty string
 */
/**
 * Replace a substring in a string
 * @function str-replace
 * @param {String} $string - The original string
 * @param {String} $search - The substring to replace
 * @param {String} $replace - The replacement string
 * @return {String} - The updated string
 */
/**
 * Convert a map to its negative variant
 * @function negativify-map
 * @param {Map} $map - The map to convert
 * @return {Map} - The negative variant of the map
 */
/**
 * Generate utility classes
 * @mixin generate-utility
 * @param {Map} $utility - Utility map
 * @param {String} $infix - Infix for class names
 * @param {Boolean} $is-rfs-media-query - Whether to use RFS media query
 */
/* stylelint-enable max-nesting-depth */
/**
 * Calculate the luminance for a color.
 * @function luminance
 * @param {Color} $color - The color to calculate luminance for
 * @return {Number} - The luminance value
 */
/**
 * Calculate the contrast ratio between two colors.
 * @function color-contrast
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @return {Number} - The contrast ratio
 */
/**
 * Remove the unit of a length
 * @function strip-unit
 * @param {Number} $number - Number to remove unit from
 * @return {Number} - Unitless number
 */
/**
 * Validate font size
 * @function validate-font-size
 * @param {Number} $size - Font size to validate
 * @return {Number} - Validated font size in pixels
 */
/**
 * Get ratio for WCAG level
 * @function get-ratio
 * @param {String} $level - WCAG level
 * @param {Number} $size - Font size
 * @param {Boolean} $bold - Is bold
 * @param {Boolean} $graphic - Is graphic
 * @return {Number} - Ratio value
 */
/**
 * Determine if a color is light or dark
 * @function light-or-dark
 * @param {Color} $color - The color to check
 * @return {String} - "light" or "dark"
 */
/**
 * Get the most legible color (black or white) for a given background color
 * @function most-legible-color
 * @param {Color} $color - The background color
 * @return {Color} - The most legible color
 */
/**
 * Get the desired color combination for foreground and background colors
 * @function desired-color-combination
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {Number} $offsetThreshold - Offset threshold
 * @param {Number} $ratio - Contrast ratio
 * @return {List} - List containing background and foreground colors
 */
/**
 * @mixin desired-color-combination
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {Number} $offsetThreshold - Offset threshold
 * @param {Number} $ratio - Contrast ratio
 */
/**
 * Get an accessible color for a given foreground and background color
 * @function a11y-color
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {String} $level - WCAG level
 * @param {Number} $size - Font size
 * @param {Boolean} $bold - Is bold
 * @param {Boolean} $graphic - Is graphic
 * @param {Number} $maxOffset - Maximum offset
 * @param {Boolean} $darkMode - Is dark mode
 * @param {Number} $ratio - Contrast ratio
 * @return {Color} - Accessible color
 */
/**
 * Get the maximum contrast color
 * @function max-contrast
 * @param {Color} $fg - Foreground color
 * @param {Color} $bg - Background color
 * @param {Color} $max - Maximum contrast color
 * @return {Color} - Maximum contrast color
 */
/**
 * Get the RGB values of a color as a string
 * @function stripped-rgb
 * @param {Color} $color - The color
 * @return {String} - RGB values as a string
 */
/**
 * Get the HSL values of a color as a string
 * @function stripped-hsl
 * @param {Color} $color - The color
 * @return {String} - HSL values as a string
 */
/**
 * Convert a map of colors to a map of HSL values
 * @function hsl-map
 * @param {Map} $colors - Map of colors
 * @return {Map} - Map of HSL values
 */
/**
* @deprecated
* Use \`add-focus\` instead
*/
/** add background color, color and border-color to element when it has focus-visible i.e. tab focus */
/**
 * Breakpoint viewport sizes and media queries.
 *
 * Breakpoints are defined as a map of (name: minimum width), order from small to large:
 *
 *    (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px)
 *
 * The map defined in the \`$grid-breakpoints\` global variable is used as the \`$breakpoints\` argument by default.
 */
/**
 * Name of the next breakpoint, or null for the last breakpoint.
 *
 *    >> breakpoint-next(sm)
 *    md
 *    >> breakpoint-next(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    md
 *    >> breakpoint-next(sm, $breakpoint-names: (xs sm md lg xl))
 *    md
 */
/**
 * Minimum breakpoint width. Null for the smallest (first) breakpoint.
 *
 *    >> breakpoint-min(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    576px
 */
/**
 * Maximum breakpoint width.
 * The maximum value is reduced by 0.02px to work around the limitations of
 * \`min-\` and \`max-\` prefixes and viewports with fractional widths.
 * See https://www.w3.org/TR/mediaqueries-4/#mq-min-max
 * Uses 0.02px rather than 0.01px to work around a current rounding bug in Safari.
 * See https://bugs.webkit.org/show_bug.cgi?id=178261
 *
 *    >> breakpoint-max(md, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    767.98px
 */
/**
 * Returns a blank string if smallest breakpoint, otherwise returns the name with a dash in front.
 * Useful for making responsive utilities.
 *
 *    >> breakpoint-infix(xs, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    ""  (Returns a blank string)
 *    >> breakpoint-infix(sm, (xs: 0, sm: 576px, md: 768px, lg: 992px, xl: 1200px))
 *    "-sm"
 */
/**
 * Media of at least the minimum breakpoint width. No query for the smallest breakpoint.
 * Makes the @content apply to the given breakpoint and wider.
 */
/**
 * Media of at most the maximum breakpoint width. No query for the largest breakpoint.
 * Makes the @content apply to the given breakpoint and narrower.
 */
/**
 * Media that spans multiple breakpoint widths.
 * Makes the @content apply between the min and max breakpoints
 */
/**
 * Media between the breakpoint's minimum and maximum widths.
 * No minimum for the smallest breakpoint, and no maximum for the largest one.
 * Makes the @content apply only to the given breakpoint, not viewports any wider or narrower.
 */
@layer base, reset, transitional-styles;
@layer transitional-styles {
  @layer _base;
  @layer _base {
    :host {
      border-right: 1px solid #333;
      box-sizing: border-box;
      display: flex;
      transition: 0.2s;
      z-index: 1;
    }
    :host(:last-child) {
      border-right: 0;
    }
    button {
      -webkit-appearance: none;
         -moz-appearance: none;
              appearance: none;
      background: transparent;
      border-width: 0;
      color: var(--text-primary-color);
      cursor: pointer;
      flex-grow: 1;
      flex-shrink: 0;
      font-family: inherit;
      font-size: inherit;
      font-weight: 500;
      min-width: 6.625rem;
      overflow: hidden;
      padding: 0 1rem;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
      border-radius: 0;
    }
    @media (pointer: fine) {
      button:hover {
        background-color: var(--gds-sys-color-base-200);
      }
    }
    button[aria-current=true] {
      background-color: #333;
      color: #fff;
    }
    button:focus-visible {
      outline: 2px solid #000;
      outline-offset: -2px;
    }
    button:disabled,
    button[aria-disabled=true],
    button.disabled {
      color: var(--gds-sys-color-text-disabled) !important;
      border-color: var(--gds-sys-color-text-disabled) !important;
      cursor: not-allowed;
    }
    button:disabled::-moz-placeholder, button[aria-disabled=true]::-moz-placeholder, button.disabled::-moz-placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
    button:disabled::placeholder,
    button[aria-disabled=true]::placeholder,
    button.disabled::placeholder {
      color: var(--gds-sys-color-text-disabled);
    }
  }
}`,Po=fa;function pr(){U.instance.register("gds-segmented",Po.toString())}var ba=`@layer base, reset, transitional-styles;

@layer transitional-styles {
  @layer _base, _overrides;

  @layer _base {
    :host {
      background-color: #fff;
      border: 1px solid #333;
      border-radius: 4px;
      box-sizing: border-box;
      contain: layout;
      display: inline-flex;
      height: 3rem;
      max-width: 100%;
      overflow: hidden;
    }

    :host([size='small']) {
      height: 2.5rem;
    }

    #track {
      box-sizing: border-box;
      display: flex;
      flex-grow: 0;
      flex-shrink: 1;
      scroll-snap-type: inline mandatory;
      overscroll-behavior-x: contain;
      scroll-behavior: smooth;
      overflow-x: scroll;
      position: relative;
      width: 100%;
      scrollbar-width: none;
    }

    #track::-webkit-scrollbar {
      display: none;
    }

    #btn-prev,
    #btn-next {
      align-items: center;
      -webkit-appearance: none;
         -moz-appearance: none;
              appearance: none;
      aspect-ratio: 1;
      background-color: #fff;
      border-width: 0;
      color: #333;
      cursor: pointer;
      display: flex;
      font-size: 1rem;
      height: 100%;
      justify-content: center;
      width: 2.5rem;
      z-index: 2;
      position: absolute;
      transition: 0.2s;

      @media (pointer: fine) {
        &:hover {
          background-color: var(--gds-sys-color-base-200);
        }
      }
    }

    #btn-prev {
      border-right: 1px solid #333;
    }
    #btn-next {
      border-left: 1px solid #333;
      right: 0;
    }

    #btn-prev[aria-hidden='true'],
    #btn-next[aria-hidden='true'] {
      opacity: 0;
      width: 0;
      margin: 0;
      padding: 0;
    }

    :host([size='small']) #btn-prev,
    :host([size='small']) #btn-next {
      width: 2rem;
    }

    ::slotted(*) {
      flex-grow: 1;
      flex-shrink: 0;
      z-index: 1;
      scroll-margin: 0 2.5rem;
      scroll-snap-align: start;
    }

    #indicator {
      display: none;
    }
  }

  /* @layer _overrides {
  } */
}
`,Oo=ba;function Ro(){U.instance.register("gds-segmented-control",Oo.toString()),pr()}var va=`/**
 * Do not edit directly
 * Generated on Thu, 06 Feb 2025 18:59:50 GMT
 */
/**
 * Do not edit directly
 * Generated on Thu, 06 Feb 2025 18:59:50 GMT
 */
:host {
  display: contents;
  --gds-sys-shape-corner-none: 0;
  --gds-sys-shape-corner-small: 0.125rem;
  --gds-sys-shape-corner-medium: 0.25rem;
  --gds-sys-shape-corner-round: 50%;
}

:host([color-scheme=light]) {
  --gds-sys-color-blue: #41b0ee;
  --gds-sys-color-dark-blue-1: #0092e1;
  --gds-sys-color-dark-blue-2: #007ac7;
  --gds-sys-color-green: #60cd18;
  --gds-sys-color-dark-green-1: #45b400;
  --gds-sys-color-dark-green-2: #308800;
  --gds-sys-color-yellow: #ffc500;
  --gds-sys-color-dark-yellow-1: #ffb400;
  --gds-sys-color-dark-yellow-2: #f8a000;
  --gds-sys-color-text-primary: #333333;
  --gds-sys-color-text-secondary: #ababab;
  --gds-sys-color-text-white: #ffffff;
  --gds-sys-color-text-black: #333333;
  --gds-sys-color-text-inverted: #ffffff;
  --gds-sys-color-text-link: #0062bc;
  --gds-sys-color-text-error: #9f000a;
  --gds-sys-color-text-disabled: #adadad;
  --gds-sys-color-red: #f03529;
  --gds-sys-color-dark-red-1: #d81a1a;
  --gds-sys-color-dark-red-2: #bb000c;
  --gds-sys-color-purple: #673ab6;
  --gds-sys-color-dark-purple-1: #4f2C99;
  --gds-sys-color-dark-purple-2: #3f2587;
  --gds-sys-color-white: #ffffff;
  --gds-sys-color-black: #000000;
  --gds-sys-color-background-primary: #ffffff;
  --gds-sys-color-background-secondary: #eeeeee;
  --gds-sys-color-base-100: #f8f8f8;
  --gds-sys-color-base-200: #e9e9e9;
  --gds-sys-color-base-300: #dedede;
  --gds-sys-color-base-400: #cecece;
  --gds-sys-color-base-500: #adadad;
  --gds-sys-color-base-600: #868686;
  --gds-sys-color-base-700: #494949;
  --gds-sys-color-base-800: #333333;
  --gds-sys-color-base-900: #1a1a1a;
  --gds-sys-color-hover-10: rgba(255, 255, 255, 0.1);
  --gds-sys-color-hover-20: rgba(255, 255, 255, 0.2);
}

/* force dark mode */
:host([color-scheme=dark]) {
  --gds-sys-color-blue: #58b8ee;
  --gds-sys-color-dark-blue-1: #58b8ee;
  --gds-sys-color-dark-blue-2: #2c9cd9;
  --gds-sys-color-green: #60cd18;
  --gds-sys-color-dark-green-1: #75b44a;
  --gds-sys-color-dark-green-2: #308800;
  --gds-sys-color-yellow: #ffe182;
  --gds-sys-color-dark-yellow-1: #f0be47;
  --gds-sys-color-dark-yellow-2: #ebab39;
  --gds-sys-color-text-primary: #dedede;
  --gds-sys-color-text-secondary: #ababab;
  --gds-sys-color-text-white: #ffffff;
  --gds-sys-color-text-black: #333333;
  --gds-sys-color-text-inverted: #333333;
  --gds-sys-color-text-link: #2c9cd9;
  --gds-sys-color-text-error: #ff594f;
  --gds-sys-color-text-disabled: #464646;
  --gds-sys-color-red: #f7706d;
  --gds-sys-color-dark-red-1: #c82a29;
  --gds-sys-color-dark-red-2: #9e2120;
  --gds-sys-color-purple: #ad91dc;
  --gds-sys-color-dark-purple-1: #7e52cc;
  --gds-sys-color-dark-purple-2: #4a328f;
  --gds-sys-color-white: #ffffff;
  --gds-sys-color-black: #000000;
  --gds-sys-color-background-primary: #222222;
  --gds-sys-color-background-secondary: #1a1a1a;
  --gds-sys-color-base-100: #121212;
  --gds-sys-color-base-200: #222222;
  --gds-sys-color-base-300: #272727;
  --gds-sys-color-base-400: #2c2c2c;
  --gds-sys-color-base-500: #333333;
  --gds-sys-color-base-600: #494949;
  --gds-sys-color-base-700: #757575;
  --gds-sys-color-base-800: #ababab;
  --gds-sys-color-base-900: #dedede;
  --gds-sys-color-hover-10: rgba(0, 0, 0, 0.1);
  --gds-sys-color-hover-20: rgba(0, 0, 0, 0.2);
}

/* use preferred color scheme */
@media (prefers-color-scheme: dark) {
  :host,
  :host([color-scheme=auto]) {
    --gds-sys-color-blue: #58b8ee;
    --gds-sys-color-dark-blue-1: #58b8ee;
    --gds-sys-color-dark-blue-2: #2c9cd9;
    --gds-sys-color-green: #60cd18;
    --gds-sys-color-dark-green-1: #75b44a;
    --gds-sys-color-dark-green-2: #308800;
    --gds-sys-color-yellow: #ffe182;
    --gds-sys-color-dark-yellow-1: #f0be47;
    --gds-sys-color-dark-yellow-2: #ebab39;
    --gds-sys-color-text-primary: #dedede;
    --gds-sys-color-text-secondary: #ababab;
    --gds-sys-color-text-white: #ffffff;
    --gds-sys-color-text-black: #333333;
    --gds-sys-color-text-inverted: #333333;
    --gds-sys-color-text-link: #2c9cd9;
    --gds-sys-color-text-error: #ff594f;
    --gds-sys-color-text-disabled: #464646;
    --gds-sys-color-red: #f7706d;
    --gds-sys-color-dark-red-1: #c82a29;
    --gds-sys-color-dark-red-2: #9e2120;
    --gds-sys-color-purple: #ad91dc;
    --gds-sys-color-dark-purple-1: #7e52cc;
    --gds-sys-color-dark-purple-2: #4a328f;
    --gds-sys-color-white: #ffffff;
    --gds-sys-color-black: #000000;
    --gds-sys-color-background-primary: #222222;
    --gds-sys-color-background-secondary: #1a1a1a;
    --gds-sys-color-base-100: #121212;
    --gds-sys-color-base-200: #222222;
    --gds-sys-color-base-300: #272727;
    --gds-sys-color-base-400: #2c2c2c;
    --gds-sys-color-base-500: #333333;
    --gds-sys-color-base-600: #494949;
    --gds-sys-color-base-700: #757575;
    --gds-sys-color-base-800: #ababab;
    --gds-sys-color-base-900: #dedede;
    --gds-sys-color-hover-10: rgba(0, 0, 0, 0.1);
    --gds-sys-color-hover-20: rgba(0, 0, 0, 0.2);
  }
}`,Do=va;function No(){U.instance.register("gds-theme",Do.toString())}var hr,ur,ts;var xa=class Vo{constructor(){h(this,hr,new Map),h(this,ur,new Map),h(this,ts,!Ie())}static get instance(){return globalThis.__gdsTransitionalStyles?.[mt]||(globalThis.__gdsTransitionalStyles={...globalThis.__gdsTransitionalStyles,[mt]:new Vo}),globalThis.__gdsTransitionalStyles[mt]}apply(t,r){if(!t.shadowRoot)return;let s=i(this,hr).get(r);s&&(i(this,ur).set(r,t),this.applyToElement(r,s))}applyToElement(t,r){let s=i(this,ur).get(t);if(!s||!s.shadowRoot)return;let n=()=>{s._dynamicStylesController.clearInitial(),s._dynamicStylesController.inject("t-styles",F(r)),s._isUsingTransitionalStyles=!0},l=()=>{s._isUsingTransitionalStyles=!1,s._dynamicStylesController.clear("t-styles"),s._dynamicStylesController.restoreInitial()},p="[gds-element=gds-theme]",_=s.getRootNode(),f=s.closest(p);for(;f===null&&_!==document;)f=_.host?.closest(p),_=_.host?.getRootNode();if(f){let w=f,T=()=>{w.designVersion==="2023"?l():n()};if(w.addEventListener("gds-design-version-changed",T),s.addEventListener("gds-element-disconnected",()=>w.removeEventListener("gds-design-version-changed",T)),w.designVersion==="2023"){l();return}}n()}register(t,r){let s=r;i(this,ts)&&(s=`@layer reset {
        *:not(style, [gds-element]) {
          all: revert;
        }
      }
      ${r}`),i(this,hr).set(t,s),this.applyToElement(t,s)}};hr=new WeakMap;ur=new WeakMap;ts=new WeakMap;var U=xa;function N(e,t){let r={waitUntilFirstUpdate:!1,...t};return(s,n,l)=>{let{update:p}=s,_=Array.isArray(e)?e:[e];s.update=function(f){_.forEach(w=>{let T=w;if(f.has(T)){let E=f.get(T),q=this[T];E!==q&&(!r.waitUntilFirstUpdate||this.hasUpdated)&&l.value?.call(this,E,q)}}),p.call(this,f)}}}function mr(e={attributes:!0,childList:!0,subtree:!1,characterData:!0}){return(t,r,s)=>{let n,l=t.connectedCallback,p=t.disconnectedCallback;t.connectedCallback=function(){l?.call(this);let _=(f,w)=>{s.value?.call(this)};n=new MutationObserver(_),n.observe(this,e)},t.disconnectedCallback=function(){p?.call(this),n.disconnect()}}}var Nt=class extends M{constructor(){super(...arguments),this.colorScheme="light",this.designVersion="2023"}connectedCallback(){super.connectedCallback(),U.instance.apply(this,"gds-theme"),this._dynamicStylesController.inject("dark",F(`:host {${pe}}`))}render(){return g`<slot></slot>`}_onColorSchemeChange(){switch(this.colorScheme){case"dark":this._dynamicStylesController.inject("color-scheme",F(`:host { ${pe}}`));break;case"light":default:this._dynamicStylesController.inject("color-scheme",F(`:host { ${_e}}`));break;case"auto":this._dynamicStylesController.inject("color-scheme",F(`:host { ${_e}} @media (prefers-color-scheme: dark) { :host { ${pe} } }`));break}this.dispatchCustomEvent("gds-color-scheme-changed",{detail:{colorScheme:this.colorScheme}})}_onDesignVersionChange(){this.dispatchCustomEvent("gds-design-version-changed",{detail:{designVersion:this.designVersion}})}};Nt.styles=[z,v`
      :host {
        display: contents;
        color: var(--gds-sys-color-content-neutral-01);
        font-family: var(--gds-sys-text-family);
      }
    `];o([d({reflect:!0,attribute:"color-scheme"})],Nt.prototype,"colorScheme",2);o([d({reflect:!0,attribute:"design-version"})],Nt.prototype,"designVersion",2);o([N("colorScheme")],Nt.prototype,"_onColorSchemeChange",1);o([N("designVersion")],Nt.prototype,"_onDesignVersionChange",1);Nt=o([x("gds-theme")],Nt);Nt.define();var Ce={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},$e=e=>(...t)=>({_$litDirective$:e,values:t}),Jt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,r,s){this._$Ct=t,this._$AM=r,this._$Ci=s}_$AS(t,r){return this.update(t,r)}update(t,r){return this.render(...r)}};var nt=$e(class extends Jt{constructor(e){if(super(e),e.type!==Ce.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(let s in t)t[s]&&!this.nt?.has(s)&&this.st.add(s);return this.render(t)}let r=e.element.classList;for(let s of this.st)s in t||(r.remove(s),this.st.delete(s));for(let s in t){let n=!!t[s];n===this.st.has(s)||this.nt?.has(s)||(n?(r.add(s),this.st.add(s)):(r.remove(s),this.st.delete(s)))}return xt}});var L=e=>e??$;function J(e,t,r){return e?t(e):r?.(e)}var es=Symbol.for(""),_a=e=>{if(e?.r===es)return e?._$litStatic$},Wo=e=>({_$litStatic$:e,r:es}),rs=(e,...t)=>({_$litStatic$:t.reduce((r,s,n)=>r+(l=>{if(l._$litStatic$!==void 0)return l._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${l}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`)})(s)+e[n+1],e[0]),r:es}),Io=new Map,ss=e=>(t,...r)=>{let s=r.length,n,l,p=[],_=[],f,w=0,T=!1;for(;w<s;){for(f=t[w];w<s&&(l=r[w],(n=_a(l))!==void 0);)f+=n+t[++w],T=!0;w!==s&&_.push(l),p.push(f),w++}if(w===s&&p.push(t[s]),T){let E=p.join("$$lit$$");(t=Io.get(E))===void 0&&(p.raw=p,Io.set(E,t=p)),r=_}return e(t,...r)},Qt=ss(qt),Dc=ss(fo),Nc=ss(yo);var ka=v`
  :host {
    --gds-ripple-motion-name: ripple;
    --gds-ripple-motion: var(--gds-ripple-motion-name) 1.25s
      cubic-bezier(0.16, 1, 0.3, 1) 0s 1 normal none running;
    border-radius: var(--gds-sys-space-max);
    contain: strict;
    display: grid;
    place-content: center;
    height: 100%;
    inset: 0;
    overflow: hidden;
    position: absolute;
    width: 100%;
  }

  div {
    background-color: currentColor;
    border-radius: var(--gds-sys-space-max);
    display: flex;
    height: 100%;
    left: calc((-50% + var(--gds-ripple-left)) / 4);
    opacity: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 100%;
    will-change: transform;
  }

  div.gds-ripple-effect {
    animation: var(--gds-ripple-motion);
  }

  @keyframes ripple {
    from {
      opacity: 0.2;
      transform: scale(0.6, 1);
    }

    to {
      opacity: 0;
      transform: scale(1.25);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :host {
      --gds-ripple-motion-name: none !important;
    }
  }
`,Fo=ka;var Ee=class extends M{constructor(){super(...arguments),this.onmousedown=e=>{this.triggerRipple(e.clientX,e.clientY)}}render(){return qt`<div></div>`}triggerRipple(e,t){let r=this._rippleEl,s=this.getBoundingClientRect(),n=e!==void 0?e-s.left:s.width/2,l=t!==void 0?t-s.top:s.height/2;r&&(r.classList.remove("gds-ripple-effect"),this.style.setProperty("--gds-ripple-top",`${l}px`),this.style.setProperty("--gds-ripple-left",`${n}px`),setTimeout(()=>{r.classList.add("gds-ripple-effect")},20))}};Ee.styles=[z,Fo];o([D("div")],Ee.prototype,"_rippleEl",2);Ee=o([x("gds-ripple")],Ee);var Sa={0:"0px","2xs":"320px",xs:"425px",s:"768px",m:"1024px",l:"1280px",xl:"1440px","2xl":"2560px","3xl":"3840px","4xl":"4320px","5xl":"6016px","6xl":"7680px"},wa=/^([<|>]=?)?([0-9a-z]+)/,jo=["{","}",";",":",","],Uo=[" ","/n"];function Ho(e=""){let t=[],r="";for(let s=0;s<e.length;s++){let n=e[s];if(Uo.includes(n)||(r+=n),jo.includes(n)){t.push(r.slice(0,-1)),t.push(n),r="";continue}if(Uo.includes(n)||s===e.length-1){t.push(r),r="";continue}}return t.filter(s=>s!=="")}function qo(e){let t=[],r={breakpoint:"-",values:[]},s=()=>({sel:"",values:[]}),n=s();for(let l of e){if(!jo.includes(l)){n.values.push(l);continue}if(l==="{"&&(r={breakpoint:n.values.join(","),values:[]},n=s()),l===";"&&(t.length===0&&t.push(r),n.values.length>0&&(r.values.push(n),n=s())),l===":"){let p=n.values.pop()??"";n.sel=p}r&&l==="}"&&(r.values.push(n),n=s(),t.push(r))}return n.values.length>0&&r.values.push(n),t.length===0&&t.push(r),t}function Ca(e){return e.split(",").map(r=>{let s=r.trim().match(wa);if(!s)throw new Error(`Invalid breakpoint specifier: ${r}`);return{condition:s[1],value:s[2]}})}function Xo(e,t,r,s=l=>l,n=(l,p)=>`${l}: ${p.join(" ")};`){let l="";for(let p of r){let w=`@media ${(p.breakpoint==="-"?[{condition:">=",value:"0"}]:Ca(p.breakpoint)).map(T=>`(${T.condition?.includes("<")?"max-width":"min-width"}: ${Sa[T.value]??T.value})`).join(" and ")} {${p.values.map(T=>{let E=e;T.sel.length>0&&(E=e===":host"?`:host(:${T.sel})`:`${e}:${T.sel}`);let q=n(t,T.values.map(s));return T.sel==="hover"?`@media (hover: hover) {${E}{${q}}}`:`${E}{${q}}`}).join("")}}`;l+=w}return l}var os=new Map;function m(e){return(t,r)=>{let s=e?.property??String(r),n=e?.valueTemplate,l=e?.styleTemplate,p=e?.cacheOverrideKey??"0",_=e?.attribute??String(r);d({attribute:_,reflect:e?.reflect,noAccessor:!0})(t,r),Object.defineProperty(t,r,{get:function(){return this["__"+String(r)]},set:async function(f){f=f?.toString().trim()??"",this["__"+String(r)]=f,e?.reflect&&(f?this.setAttribute(_,String(f)):this.removeAttribute(_)),await this.updateComplete;let w=e?.selector??this.constructor.styleExpressionBaseSelector,T=this.level??"0",E=w+s+f+T+p;if(os.has(E)){this._dynamicStylesController.inject(`sep_${String(r)}`,os.get(E));return}let q=qo(Ho(f)),ut=Xo(w,s,q,n?.bind(this),l?.bind(this)),Lt=F(ut);os.set(E,Lt),this._dynamicStylesController.inject(`sep_${String(r)}`,Lt)}})}}var ns=class extends Jt{constructor(t){if(super(t),t.type!==Ce.ELEMENT)throw new Error("The `forwardAttributes` directive must be used in element bindings")}render(t){return $}update(t,[r]){let s=t.element,n=t.options?.host;Array.from(n.attributes).forEach(l=>{r(l)&&s.setAttribute(l.name.replace("gds-",""),l.value)})}},Zo=$e(ns);var Yo=new WeakMap;function Jo(e){return(t,...r)=>{let s=Yo.get(t);return s||(s=t.map(n=>n.replace(/\n[\s]+</gm,"<")),s.raw=t.raw,Yo.set(t,s)),e(s,...r)}}function is(e,t,r){if(e==="transparent"||e==="currentColor"||e==="inherit")return e;let[s,n]=e.split("/"),l;return r&&t==="background"?l=`var(--gds-sys-color-l${r}-${s})`:l=`var(--gds-sys-color-${t}-${s})`,n?`color-mix(in srgb, ${l} ${parseFloat(n)*100}%, transparent 0%)`:l}function wt(e){return{valueTemplate:function(t){return is(t,e,this.level)}}}var Vt={valueTemplate:e=>`var(--gds-sys-space-${e}, 0)`},Qo={valueTemplate:e=>`var(--gds-sys-radius-${e}, 0)`},it={valueTemplate:e=>`var(--gds-sys-space-${$a(e)}, ${e})`},gr={valueTemplate:e=>{let r=(e.startsWith("-")?"neg":"pos")=="pos"?`var(--gds-sys-space-${e})`:`calc(var(--gds-sys-space-${e.substring(1)}) * -1)`;return e==="auto"?"auto":r},styleTemplate:(e,t)=>{let r=_=>_==="auto"?"auto":`${_}`,s=r(t[0]),n=t.length>1?r(t[1]):s,l=t.length>2?r(t[2]):s,p=t.length>3?r(t[3]):n;return`${e}: ${s} ${n} ${l} ${p};`}};function $a(e){return e.replace(/[^a-zA-Z0-9-]/g,"")}function I(e){class t extends e{}return o([m(it)],t.prototype,"width",2),o([m(it)],t.prototype,"min-width",2),o([m(it)],t.prototype,"max-width",2),o([m(it)],t.prototype,"inline-size",2),o([m(it)],t.prototype,"min-inline-size",2),o([m(it)],t.prototype,"max-inline-size",2),t}function fr(e){class t extends e{}return o([m(it)],t.prototype,"height",2),o([m(it)],t.prototype,"min-height",2),o([m(it)],t.prototype,"max-height",2),o([m(it)],t.prototype,"block-size",2),o([m(it)],t.prototype,"min-block-size",2),o([m(it)],t.prototype,"max-block-size",2),t}function j(e){class t extends e{}return o([m(gr)],t.prototype,"margin",2),o([m(gr)],t.prototype,"margin-inline",2),o([m(gr)],t.prototype,"margin-block",2),t}function yr(e){class t extends e{}return o([m(Vt)],t.prototype,"padding",2),o([m(Vt)],t.prototype,"padding-inline",2),o([m(Vt)],t.prototype,"padding-block",2),t}function H(e){class t extends e{}return o([m()],t.prototype,"align-self",2),o([m()],t.prototype,"justify-self",2),o([m()],t.prototype,"place-self",2),o([m()],t.prototype,"grid-column",2),o([m()],t.prototype,"grid-row",2),o([m()],t.prototype,"grid-area",2),o([m()],t.prototype,"flex",2),o([m()],t.prototype,"order",2),t}function br(e){class t extends e{}return o([m()],t.prototype,"position",2),o([m()],t.prototype,"transform",2),o([m()],t.prototype,"inset",2),t}he||(function(e){if(typeof e.requestSubmit=="function")return;e.requestSubmit=function(s=null){s?(t(s,this),s.click()):(s=document.createElement("input"),s.type="submit",s.hidden=!0,this.appendChild(s),s.click(),this.removeChild(s))};function t(s,n){s instanceof HTMLElement||r(TypeError,"parameter 1 is not of type 'HTMLElement'"),s.type=="submit"||r(TypeError,"The specified element is not a submit button"),s.form==n||r(DOMException,"The specified element is not owned by this form element","NotFoundError")}function r(s,n,l="Error"){throw new s("Failed to execute 'requestSubmit' on 'HTMLFormElement': "+n+".",l)}})(HTMLFormElement.prototype);var st,Z=class extends M{constructor(){super(),h(this,st),this.required=!1,this.errorMessage="",this.label="",this.name="",this.disabled=!1;try{G(this,st,this.attachInternals())}catch{G(this,st,{form:this.closest("form"),setFormValue:r=>{this._internalValue=r},setValidity:(r,s)=>{i(this,st).validity=r,this.errorMessage=s||""},validationMessage:"",validity:{badInput:!1,customError:!1,patternMismatch:!1,rangeOverflow:!1,rangeUnderflow:!1,stepMismatch:!1,tooLong:!1,tooShort:!1,typeMismatch:!1,valueMissing:!1,valid:!0},willValidate:!0,checkValidity:this.checkValidity.bind(this),reportValidity:this.reportValidity.bind(this)})}}connectedCallback(){if(super.connectedCallback(),typeof this.attachInternals!="function"){let t=this.closest("form");t&&(t.addEventListener("submit",this._handleFormSubmit.bind(this)),t.addEventListener("reset",this.formResetCallback.bind(this)))}}set invalid(t){let r=this.invalid;i(this,st).setValidity({...i(this,st).validity,customError:t,valid:!t},this.errorMessage||this.validationMessage||"   ",this._getValidityAnchor()||void 0),this.requestUpdate("invalid",r),i(this,st).checkValidity()}get invalid(){return!i(this,st).validity.valid}get value(){return this._internalValue}set value(t){this._internalValue=t,i(this,st).setFormValue(t)}get form(){return i(this,st).form}get validity(){return i(this,st).validity}get validationMessage(){return i(this,st).validationMessage}get willValidate(){return i(this,st).willValidate}checkValidity(){if(!this._getValidityAnchor()||!this.validator)return!0;let r=this.invalid,s=this.validator.validate(this)||[{...this.validity,valid:!0},""];return this.errorMessage=s[1]||this.errorMessage,i(this,st).setValidity(s[0],s[1],this._getValidityAnchor()),r!==this.invalid&&(this.requestUpdate("invalid",r),this.dispatchCustomEvent("gds-validity-state",{detail:{valid:this.validity.valid,message:this.validationMessage},composed:!0})),i(this,st).checkValidity()}reportValidity(){return i(this,st).reportValidity()}__handleValueChange(){this.checkValidity()}formResetCallback(){typeof this.value=="string"?this.value="":Array.isArray(this.value)?this.value=[]:this.value=void 0}formAssociatedCallback(t){t?.addEventListener("submit",this._handleFormSubmit.bind(this))}_handleFormSubmit(t){this.checkValidity(),this.validity.valid||t.preventDefault()}};st=new WeakMap;Z.formAssociated=!0;o([d({attribute:!1})],Z.prototype,"validator",2);o([d({type:Boolean})],Z.prototype,"required",2);o([d({attribute:"error-message"})],Z.prototype,"errorMessage",2);o([d({type:Boolean,reflect:!0})],Z.prototype,"invalid",1);o([d()],Z.prototype,"label",2);o([d()],Z.prototype,"value",1);o([d({reflect:!0})],Z.prototype,"name",2);o([d({type:Boolean,reflect:!0})],Z.prototype,"disabled",2);o([N("value",{waitUntilFirstUpdate:!0})],Z.prototype,"__handleValueChange",1);var Ea=v`
  @layer tokens, core, a11y, ranks, sizes, variants, disabled;

  @layer a11y {
    @media (prefers-reduced-motion: reduce) {
      .button {
        transition: none;
      }
    }
  }

  @layer core {
    :host {
      display: inline-flex;
      max-width: 100%;
    }

    .button {
      --_block-size: var(--gds-sys-space-4xl);
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border: none;
      cursor: pointer;
      min-width: 0;
      background-color: var(--gds-sys-color-l3-neutral-01);
      color: var(--gds-sys-color-content-neutral-03);
      border-radius: calc(var(--_block-size) / 1.8);
      font-family: inherit;
      font: var(--gds-sys-text-detail-book-m);
      gap: var(--gds-sys-space-xs);
      outline-color: transparent;
      outline-offset: var(--gds-sys-space-4xs);
      outline-style: solid;
      outline-width: var(--gds-sys-space-4xs);
      padding-block: var(--gds-sys-space-s);
      padding-inline: var(--gds-sys-space-xl);
      position: relative;
      text-decoration: none;
      transition-property: color, border-colorm, background;
      transition-duration: 0.2s;
      flex: 1;

      &:focus {
        outline-color: var(--gds-sys-color-content-neutral-01);

        &:not(:focus-visible) {
          outline-color: transparent;
        }
      }

      @media (pointer: fine) {
        &:hover {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-neutral-01),
            var(--gds-sys-color-state-neutral-01)
          );
        }
      }

      &:active {
        background-color: color-mix(
          in srgb,
          var(--gds-sys-color-l3-neutral-01),
          var(--gds-sys-color-state-neutral-02)
        );
      }

      &:not(.circle, .wrapped) slot:not([name]) {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }

      &:not(.wrapped) {
        block-size: var(--_block-size);
      }

      &.wrapped {
        min-block-size: var(--_block-size);
      }
    }
  }

  .button.circle {
    aspect-ratio: 1 / 1;
    padding: 0;
    min-block-size: var(--_block-size);
    min-inline-size: var(--_block-size);
  }

  .button:disabled {
    pointer-events: none;
    background-color: var(--gds-sys-color-l3-disabled-01);
    color: var(--gds-sys-color-content-disabled-01);
  }

  @layer ranks {
    :host([rank*='secondary']) .button {
      background-color: var(--gds-sys-color-l3-neutral-02);
      color: var(--gds-sys-color-content-neutral-01);

      @media (pointer: fine) {
        &:hover {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-neutral-02),
            var(--gds-sys-color-state-neutral-03)
          );
        }
      }

      &:active {
        background-color: color-mix(
          in srgb,
          var(--gds-sys-color-l3-neutral-02),
          var(--gds-sys-color-state-neutral-04)
        );
      }
    }

    :host([rank*='tertiary']) .button {
      background-color: transparent;
      color: var(--gds-sys-color-content-neutral-01);

      @media (pointer: fine) {
        &:hover {
          background-color: color-mix(
            in srgb,
            transparent,
            var(--gds-sys-color-state-neutral-05)
          );
        }
      }

      &:active {
        background-color: color-mix(
          in srgb,
          transparent,
          var(--gds-sys-color-state-neutral-06)
        );
      }
    }
  }

  @layer sizes {
    :host([size='xs']) .button {
      --_block-size: var(--gds-sys-space-xl);
      gap: var(--gds-sys-space-3xs);
      font: var(--gds-sys-text-detail-book-xs);
      padding-inline: var(--gds-sys-space-s);
      padding-block: 0;
    }

    :host([size='small']) .button {
      --_block-size: var(--gds-sys-space-2xl);
      font: var(--gds-sys-text-detail-book-s);
      gap: var(--gds-sys-space-3xs);
      padding-block: var(--gds-sys-space-3xs);
      padding-inline: var(--gds-sys-space-m);
    }

    :host([size='medium']) .button {
      --_block-size: var(--gds-sys-space-3xl);
      gap: var(--gds-sys-space-2xs);
      font: var(--gds-sys-text-detail-book-m);
      padding-inline: var(--gds-sys-space-l);
    }
  }

  @layer variants {
    .brand {
      background-color: var(--gds-sys-color-l3-brand-01);

      &:focus {
        outline-color: var(--gds-sys-color-content-brand-01);

        &:not(:focus-visible) {
          outline-color: transparent;
        }
      }

      @media (pointer: fine) {
        &:hover {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-brand-01),
            var(--gds-sys-color-state-brand-01)
          );
        }
      }

      &:active {
        background-color: color-mix(
          in srgb,
          var(--gds-sys-color-l3-brand-01),
          var(--gds-sys-color-state-brand-02)
        );
      }

      &.secondary {
        background-color: var(--gds-sys-color-l3-neutral-02);
        color: var(--gds-sys-color-content-neutral-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              var(--gds-sys-color-l3-neutral-02),
              var(--gds-sys-color-state-brand-03)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-neutral-02),
            var(--gds-sys-color-state-brand-04)
          );
        }
      }

      &.tertiary {
        background-color: transparent;
        color: var(--gds-sys-color-content-neutral-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              transparent,
              var(--gds-sys-color-state-brand-05)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            transparent,
            var(--gds-sys-color-state-brand-06)
          );
        }
      }
    }

    .positive {
      background-color: var(--gds-sys-color-l3-positive-01);
      color: var(--gds-sys-color-content-inversed);

      &:focus {
        outline-color: var(--gds-sys-color-content-positive-01);

        &:not(:focus-visible) {
          outline-color: transparent;
        }
      }

      @media (pointer: fine) {
        &:hover {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-positive-01),
            var(--gds-sys-color-state-positive-01)
          );
        }
      }

      &:active {
        background-color: color-mix(
          in srgb,
          var(--gds-sys-color-l3-positive-01),
          var(--gds-sys-color-state-positive-02)
        );
      }

      &.secondary {
        background-color: var(--gds-sys-color-l3-positive-02);
        color: var(--gds-sys-color-content-positive-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              var(--gds-sys-color-l3-positive-02),
              var(--gds-sys-color-state-positive-03)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-positive-02),
            var(--gds-sys-color-state-positive-04)
          );
        }
      }

      &.tertiary {
        background-color: transparent;
        color: var(--gds-sys-color-content-positive-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              transparent,
              var(--gds-sys-color-state-positive-05)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            transparent,
            var(--gds-sys-color-state-positive-06)
          );
        }
      }
    }

    .negative {
      background-color: var(--gds-sys-color-l3-negative-01);
      color: var(--gds-sys-color-content-inversed);

      &:focus {
        outline-color: var(--gds-sys-color-content-negative-01);
        &:not(:focus-visible) {
          outline-color: transparent;
        }
      }

      @media (pointer: fine) {
        &:hover {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-negative-01),
            var(--gds-sys-color-state-negative-01)
          );
        }
      }

      &:active {
        background-color: color-mix(
          in srgb,
          var(--gds-sys-color-l3-negative-01),
          var(--gds-sys-color-state-negative-02)
        );
      }

      &.secondary {
        background-color: var(--gds-sys-color-l3-negative-02);
        color: var(--gds-sys-color-content-negative-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              var(--gds-sys-color-l3-negative-02),
              var(--gds-sys-color-state-negative-03)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-negative-02),
            var(--gds-sys-color-state-negative-04)
          );
        }
      }

      &.tertiary {
        background-color: transparent;
        color: var(--gds-sys-color-content-negative-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              transparent,
              var(--gds-sys-color-state-negative-05)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            transparent,
            var(--gds-sys-color-state-negative-06)
          );
        }
      }
    }

    .notice {
      background-color: var(--gds-sys-color-l3-notice-01);
      color: var(--gds-sys-color-content-inversed);

      &:focus {
        outline-color: var(--gds-sys-color-content-notice-01);
        &:not(:focus-visible) {
          outline-color: transparent;
        }
      }

      @media (pointer: fine) {
        &:hover {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-notice-01),
            var(--gds-sys-color-state-notice-01)
          );
        }
      }

      &:active {
        background-color: color-mix(
          in srgb,
          var(--gds-sys-color-l3-notice-01),
          var(--gds-sys-color-state-notice-02)
        );
      }

      &.secondary {
        background-color: var(--gds-sys-color-l3-notice-02);
        color: var(--gds-sys-color-content-notice-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              var(--gds-sys-color-l3-notice-02),
              var(--gds-sys-color-state-notice-03)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-notice-02),
            var(--gds-sys-color-state-notice-04)
          );
        }
      }

      &.tertiary {
        background-color: transparent;
        color: var(--gds-sys-color-content-notice-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              transparent,
              var(--gds-sys-color-state-notice-05)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            transparent,
            var(--gds-sys-color-state-notice-06)
          );
        }
      }
    }

    .warning {
      background-color: var(--gds-sys-color-l3-warning-01);
      color: var(--gds-sys-color-content-neutral-03);

      &:focus {
        outline-color: var(--gds-sys-color-content-warning-01);
        &:not(:focus-visible) {
          outline-color: transparent;
        }
      }

      @media (pointer: fine) {
        &:hover {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-warning-01),
            var(--gds-sys-color-state-warning-01)
          );
        }
      }

      &:active {
        background-color: color-mix(
          in srgb,
          var(--gds-sys-color-l3-warning-01),
          var(--gds-sys-color-state-warning-02)
        );
      }

      &.secondary {
        background-color: var(--gds-sys-color-l3-warning-02);
        color: var(--gds-sys-color-content-warning-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              var(--gds-sys-color-l3-warning-02),
              var(--gds-sys-color-state-warning-03)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-warning-02),
            var(--gds-sys-color-state-warning-04)
          );
        }
      }

      &.tertiary {
        background-color: transparent;
        color: var(--gds-sys-color-content-warning-01);

        @media (pointer: fine) {
          &:hover {
            background-color: color-mix(
              in srgb,
              transparent,
              var(--gds-sys-color-state-warning-05)
            );
          }
        }

        &:active {
          background-color: color-mix(
            in srgb,
            transparent,
            var(--gds-sys-color-state-warning-06)
          );
        }
      }
    }
  }
`,Ko=Ea;var Fe,Ct,Kt,tn,as,ls,ds,Ta=["aria-label","aria-haspopup","aria-expanded"],Ma=Jo(g),X=class extends Z{constructor(){super(...arguments),h(this,Ct),this.disabled=!1,this.rank="primary",this.variant="neutral",this.size="medium",this.label="",this.wrapped=!1,this.href="",h(this,Fe,!1),h(this,as,()=>{let t=this._mainSlot?.assignedElements()??[];G(this,Fe,t.length===1&&(t[0].tagName.toLowerCase().startsWith("gds-icon")||t[0].getAttribute("name")==="icon")),this.requestUpdate()}),h(this,ls,t=>{this.dispatchCustomEvent("gds-click",{bubbles:!0,composed:!0,detail:t}),this.form&&!i(this,Ct,Kt)&&(this.type==="submit"?this.form.requestSubmit():this.type==="reset"&&this.form.reset())}),h(this,ds,t=>{if(!this.disabled&&(t.code==="Space"||t.key==="Enter")&&!t.repeat){let r=this._ripple;r&&r.triggerRipple()}})}focus(t){this._getValidityAnchor()?.focus(t)}click(){this._getValidityAnchor()?.click()}connectedCallback(){super.connectedCallback(),this.setAttribute("role","none"),U.instance.apply(this,"gds-button")}render(){let t={button:!0,circle:i(this,Fe),icon:i(this,Fe),xs:this.size==="xs",small:this.size==="small",large:this.size==="large",brand:this.variant==="brand",positive:this.variant==="positive",negative:this.variant==="negative",notice:this.variant==="notice",warning:this.variant==="warning",primary:this.rank==="primary",secondary:this.rank==="secondary",tertiary:this.rank==="tertiary",wrapped:this.wrapped},r=i(this,Ct,Kt)?rs`a`:rs`button`;return Qt`
      <${r}
        class=${nt(t)}
        type="${L(i(this,Ct,Kt)?void 0:this.type)}"
        ?disabled="${this.disabled}"
        aria-label=${this.label||$}
        href=${L(i(this,Ct,Kt)?this.href:void 0)}
        target=${L(i(this,Ct,Kt)?this.target:void 0)}
        rel=${L(i(this,Ct,Kt)?this.rel||i(this,Ct,tn):void 0)}
        download=${L(i(this,Ct,Kt)?this.download:void 0)}
        part="_button"
        @click="${i(this,ls)}"
        @keydown="${i(this,ds)}"
        ${Zo(s=>s.name.startsWith("gds-aria")||s.name==="gds-role"||Ta.includes(s.name))}
      >
        <slot name="lead"></slot>
        <slot @slotchange=${i(this,as)}></slot>
        <slot name="trail"></slot>
        ${J(!this._isUsingTransitionalStyles,()=>Ma`<gds-ripple part="_ripple"></gds-ripple>`)}
      </${r}>
      `}_getValidityAnchor(){return this._button}_attributeChanged(){this.requestUpdate()}};Fe=new WeakMap;Ct=new WeakSet;Kt=function(){return this.href.length>0};tn=function(){return this.target==="_blank"?"noreferrer noopener":void 0};as=new WeakMap;ls=new WeakMap;ds=new WeakMap;X.styles=[z,Ko];X.shadowRootOptions={mode:"open",delegatesFocus:!0};o([d({type:Boolean,reflect:!0})],X.prototype,"disabled",2);o([m({selector:".button"})],X.prototype,"justify-content",2);o([d({reflect:!0})],X.prototype,"type",2);o([d({reflect:!0})],X.prototype,"rank",2);o([d({reflect:!0})],X.prototype,"variant",2);o([d({reflect:!0})],X.prototype,"size",2);o([d()],X.prototype,"label",2);o([d({attribute:"wrapped",type:Boolean,reflect:!0})],X.prototype,"wrapped",2);o([d()],X.prototype,"href",2);o([d()],X.prototype,"target",2);o([d()],X.prototype,"rel",2);o([d()],X.prototype,"download",2);o([D("slot:not([name])")],X.prototype,"_mainSlot",2);o([D(".button")],X.prototype,"_button",2);o([D("gds-ripple")],X.prototype,"_ripple",2);o([mr({attributes:!0,childList:!1,subtree:!1,characterData:!1})],X.prototype,"_attributeChanged",1);var gt=class extends I(j(H(X))){};gt=o([x("gds-button",{dependsOn:[Ee]})],gt);gt.define();var Aa=v`
  :host {
    display: block;
    box-sizing: border-box;
    border-style: solid;
    border-width: 0;
    border-color: var(--gds-sys-color-border-subtle-01);
  }
`,en=Aa;var C=class extends I(fr(j(yr(H(br(M)))))){constructor(){super(...arguments),this.level="2"}render(){return g`<slot></slot>`}};C.styles=[z,en];o([m()],C.prototype,"display",2);o([d()],C.prototype,"level",2);o([m(wt("content"))],C.prototype,"color",2);o([m(wt("background"))],C.prototype,"background",2);o([m({styleTemplate:function(e,t){let r=this,[s,n=r["border-style"]||"solid",l=r["border-color"]||"subtle-01"]=t,p=`var(--gds-sys-space-${s})`,_=is(l,"border",r.level);return`border: ${p} ${n} ${_};`}})],C.prototype,"border",2);o([m(wt("border"))],C.prototype,"border-color",2);o([m(Vt)],C.prototype,"border-width",2);o([m()],C.prototype,"border-style",2);o([m(Qo)],C.prototype,"border-radius",2);o([m({valueTemplate:e=>`var(--gds-sys-shadow-${e}-01), var(--gds-sys-shadow-${e}-02)`})],C.prototype,"box-shadow",2);o([m()],C.prototype,"opacity",2);o([m()],C.prototype,"overflow",2);o([m()],C.prototype,"box-sizing",2);o([m()],C.prototype,"z-index",2);o([m({styleTemplate:(e,t)=>`font: var(--gds-sys-text-${t[0]});`})],C.prototype,"font",2);o([m({valueTemplate:e=>`var(--gds-sys-text-weight-${e})`})],C.prototype,"font-weight",2);o([m()],C.prototype,"text-align",2);o([m()],C.prototype,"text-wrap",2);o([m()],C.prototype,"overflow-wrap",2);o([m()],C.prototype,"white-space",2);o([m({...Vt,styleTemplate:(e,t)=>{let r=t[0],s=t[1]||r;return`gap: ${r} ${s};`},cacheOverrideKey:"flex"})],C.prototype,"gap",2);o([m()],C.prototype,"align-items",2);o([m()],C.prototype,"align-content",2);o([m()],C.prototype,"justify-content",2);o([m()],C.prototype,"justify-items",2);o([m()],C.prototype,"flex-direction",2);o([m()],C.prototype,"flex-wrap",2);o([m()],C.prototype,"place-items",2);o([m()],C.prototype,"place-content",2);o([m()],C.prototype,"aspect-ratio",2);o([m()],C.prototype,"cursor",2);o([m()],C.prototype,"pointer-events",2);C=o([x("gds-div")],C);var za=v`
  :host {
    display: flex;
    box-sizing: border-box;
    border-style: solid;
    border-width: 0;
    border-color: var(--gds-sys-color-border-subtle-01);
  }
`,rn=za;var _t=class extends C{render(){return g`<slot></slot>`}};_t.styles=[z,rn];_t=o([x("gds-flex")],_t);var Ba=v`
  @layer tokens, core, variants, sizes, states, notification;

  @layer core {
    :host {
      display: inline-block;
    }

    .badge {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: var(--gds-sys-space-3xs);
      padding: var(--_padding);
      min-height: var(--_block-size);
      border-radius: var(--_border-radius);
      width: 100%;
      min-width: var(--_inline-size);
      font: var(--_font);
      background-color: var(--_bg);
      color: var(--_color);
      box-sizing: border-box;

      --_padding: var(--gds-sys-space-4xs) var(--gds-sys-space-xs);
      --_block-size: var(--gds-sys-space-xs);
      --_border-radius: var(--gds-sys-space-2xs);
      --_inline-size: var(--gds-sys-space-l);
      --_font: var(--gds-sys-text-detail-book-s);
    }
  }

  @layer variants {
    .badge.information {
      --_bg: var(--gds-sys-color-l3-information-03);
      --_color: var(--gds-sys-color-content-information-01);
    }

    .badge.notice {
      --_bg: var(--gds-sys-color-l3-notice-03);
      --_color: var(--gds-sys-color-content-notice-01);
    }

    .badge.positive {
      --_bg: var(--gds-sys-color-l3-positive-03);
      --_color: var(--gds-sys-color-content-positive-03);
    }

    .badge.warning {
      --_bg: var(--gds-sys-color-l3-warning-03);
      --_color: var(--gds-sys-color-content-warning-01);
    }

    .badge.negative {
      --_bg: var(--gds-sys-color-l3-negative-03);
      --_color: var(--gds-sys-color-content-negative-01);
    }

    .badge.disabled {
      --_bg: var(--gds-sys-color-l3-disabled-03);
      --_color: var(--gds-sys-color-content-disabled-01);
    }
  }

  @layer sizes {
    .badge.small {
      --_padding: var(--gds-sys-space-4xs) var(--gds-sys-space-2xs);
      --_block-size: var(--gds-sys-space-m);
      --_border-radius: var(--gds-sys-space-3xs);
      --_font: var(--gds-sys-text-detail-book-xs);
    }
  }

  @layer notification {
    .badge.notification {
      --_padding: var(--gds-sys-space-3xs);
      --_block-size: var(--gds-sys-space-xs);
      --_border-radius: var(--gds-sys-space-max);
      --_inline-size: 0;
      justify-content: center;
      gap: 0;
      --_bg: var(--gds-sys-color-l3-negative-01);
      --_color: var(--gds-sys-color-content-inversed);
      --_font: var(--gds-sys-text-detail-book-xs);
    }

    .badge.notification.with-content {
      --_padding: var(--gds-sys-space-4xs) var(--gds-sys-space-2xs);
      --_block-size: var(--gds-sys-space-m);
      --_inline-size: var(--gds-sys-space-l);
    }
  }

  @layer states {
    .badge.rounded {
      --_border-radius: var(--gds-sys-space-max);
      justify-content: center;
    }
  }

  slot[name='lead']::slotted(*) {
    line-height: var(--gds-sys-space-m);
  }

  :host([notification]) slot[name='trail']::slotted(*) {
    line-height: var(--gds-sys-space-s);
  }

  :host([notification]) slot[name='lead']::slotted(*) {
    line-height: var(--gds-sys-space-s);
  }
`,sn=Ba;var me,cs,on,nn,an,dt=class extends I(j(H(M))){constructor(){super(...arguments),h(this,me),this.variant="information",this.size="default",this.notification=!1,this.rounded=!1,this.mainSlotOccupied=!1,this.leadSlotOccupied=!1}render(){let e=nt({badge:!0,[this.variant]:!0,[this.size]:this.size==="small",notification:this.notification,"with-content":this.notification&&this.mainSlotOccupied,rounded:this.rounded});return g`
      <div class="${e}">
        ${[b(this,me,on).call(this),b(this,me,nn).call(this),b(this,me,an).call(this)]}
      </div>
    `}};me=new WeakSet;cs=function(e,t){let s=e.target.assignedNodes({flatten:!0});this[t]=s.length>0&&s.some(n=>n.nodeType===Node.ELEMENT_NODE||n.nodeType===Node.TEXT_NODE&&n.textContent?.trim()!=="")};on=function(){if(this.size!=="small"||!this.notification)return g`<slot
        name="lead"
        @slotchange=${e=>b(this,me,cs).call(this,e,"leadSlotOccupied")}
      ></slot>`};nn=function(){return g`<slot
      @slotchange=${e=>b(this,me,cs).call(this,e,"mainSlotOccupied")}
    ></slot>`};an=function(){return g`<slot name="trail"></slot>`};dt.styles=[z,sn];o([d()],dt.prototype,"variant",2);o([d({type:String})],dt.prototype,"size",2);o([d({attribute:"notification",type:Boolean,reflect:!0})],dt.prototype,"notification",2);o([d({attribute:"rounded",type:Boolean,reflect:!0})],dt.prototype,"rounded",2);o([rt()],dt.prototype,"mainSlotOccupied",2);o([rt()],dt.prototype,"leadSlotOccupied",2);dt=o([x("gds-badge",{dependsOn:[_t]})],dt);dt.define();var $t=class extends C{constructor(){super(),this.variant="primary",this.padding="m;m{xl}",this["border-radius"]="s",this.gap="m;m{l}"}render(){return g`<slot></slot>`}};$t.styles=[z,v`
      :host {
        box-sizing: border-box;
        border-color: var(--_border-color);
        background-color: var(--_background-color);
        color: var(--_color);
        border-width: var(--gds-sys-space-5xs);
        border-style: solid;
        display: flex;
        flex-direction: column;
      }
    `];o([m({styleTemplate:function(e,t){let r,s,n;switch(t[0]){case"primary":r="transparent",s=`var(--gds-sys-color-l${this.level}-neutral-01)`,n="var(--gds-sys-color-content-neutral-01)";break;case"secondary":r="var(--gds-sys-color-border-subtle-01)",s=`var(--gds-sys-color-l${this.level}-neutral-02)`,n="var(--gds-sys-color-content-neutral-01)";break;case"tertiary":r="transparent",s=`var(--gds-sys-color-l${this.level}-neutral-02)`,n="var(--gds-sys-color-content-neutral-01)";break;case"brand-01":r="transparent",s=`var(--gds-sys-color-l${this.level}-brand-01)`,n="var(--gds-sys-color-content-inversed)";break;case"brand-02":r="transparent",s=`var(--gds-sys-color-l${this.level}-brand-02)`,n="var(--gds-sys-color-content-brand-02)";break;case"positive":case"negative":case"warning":case"information":case"notice":r=`var(--gds-sys-color-border-${t[0]}-02)`,s=`var(--gds-sys-color-l${this.level}-${t[0]}-01)`,n=`var(--gds-sys-color-content-${t[0]}-01)`;break;default:r="transparent",s=`var(--gds-sys-color-l${this.level}-neutral-01)`,n="var(--gds-sys-color-content-neutral-01)";break}return`
      --_border-color: ${r};
      --_background-color: ${s};
      --_color: ${n};
      `}})],$t.prototype,"variant",2);$t=o([x("gds-card")],$t);$t.define();var vr="lit-localize-status";var ln=e=>typeof e!="string"&&"strTag"in e,ps=(e,t,r)=>{let s=e[0];for(let n=1;n<e.length;n++)s+=t[r?r[n-1]:n-1],s+=e[n];return s};var xr=(e=>ln(e)?ps(e.strings,e.values):e);var ot=xr;var hs=class{constructor(t){this.__litLocalizeEventHandler=r=>{r.detail.status==="ready"&&this.host.requestUpdate()},this.host=t}hostConnected(){window.addEventListener(vr,this.__litLocalizeEventHandler)}hostDisconnected(){window.removeEventListener(vr,this.__litLocalizeEventHandler)}},Ga=e=>e.addController(new hs(e)),dn=Ga;var tt=()=>(e,t)=>(e.addInitializer(dn),e);var _r=class{constructor(){this.settled=!1,this.promise=new Promise((t,r)=>{this._resolve=t,this._reject=r})}resolve(t){this.settled=!0,this._resolve(t)}reject(t){this.settled=!0,this._reject(t)}};var La=[];for(let e=0;e<256;e++)La[e]=(e>>4&15).toString(16)+(e&15).toString(16);var Oa=new _r;Oa.resolve();var Ra=v`
  @layer base, a11y;

  @layer a11y {
    @media (prefers-reduced-motion: reduce) {
      .field {
        transition: none;
      }
    }
  }

  @layer base {
    * {
      box-sizing: border-box;
    }

    .field {
      display: flex;
      position: relative;
      align-items: center;
      justify-content: space-between;
      gap: var(--gds-sys-space-xs);
      padding-block: var(--gds-sys-space-xs);
      padding-inline: var(--gds-sys-space-m) var(--gds-sys-space-s);
      min-block-size: var(--gds-sys-space-3xl);
      block-size: var(--gds-sys-space-3xl);
      outline-style: solid;
      outline-width: 0;
      border-radius: var(--gds-sys-radius-xs);
      background: var(--gds-sys-color-l3-neutral-02);
      color: var(--gds-sys-color-content-neutral-01);
      outline-offset: 0;
      border: var(--gds-sys-space-5xs) solid
        var(--gds-sys-color-border-interactive);
      cursor: text;
      transition-property: background-color, outline-offset;
      backface-visibility: hidden;
      transition-duration: var(--gds-sys-motion-duration-fastest);
      transition-timing-function: var(--gds-sys-motion-easing-linear);

      .right {
        display: contents;
      }

      .right.as-flex {
        display: flex;
        position: absolute;
        gap: var(--gds-sys-space-xs);
        right: var(--gds-sys-space-xs);
        top: var(--gds-sys-space-xs);
        block-size: max-content;
      }
    }

    .field:focus-within {
      outline-width: var(--gds-sys-space-4xs);
      outline-offset: var(--gds-sys-space-4xs);
      outline-color: currentColor;
      border-color: currentColor;
    }

    .field.small {
      gap: var(--gds-sys-space-3xs);
      padding: var(--gds-sys-space-3xs) var(--gds-sys-space-xs);
      min-block-size: var(--gds-sys-space-2xl);
      block-size: var(--gds-sys-space-2xl);
      border-radius: var(--gds-sys-radius-2xs);
    }

    .field.multiline {
      align-items: flex-start;
      padding: var(--gds-sys-space-s);
      padding-inline-start: var(--gds-sys-space-m);
      height: max-content;
    }

    .field.disabled {
      background: var(--gds-sys-color-l3-disabled-01);
      color: var(--gds-sys-color-content-disabled-01);
      border-color: transparent;
      pointer-events: none;
    }

    .field.invalid {
      background: var(--gds-sys-color-l3-negative-02);
      border-color: var(--gds-sys-color-border-negative-01);
      color: var(--gds-sys-color-content-negative-01);
    }

    .field.lead-slot-occupied {
      padding-inline-start: var(--gds-sys-space-s);
    }

    .field.lead-has-badge {
      padding-inline-start: var(--gds-sys-space-2xs);
    }

    .field.small.lead-has-badge {
      padding-inline-start: var(--gds-sys-space-2xs);
    }

    .field.trail-slot-occupied {
      padding-inline-end: var(--gds-sys-space-xs);
    }

    .field.small.trail-slot-occupied {
      padding-inline-end: var(--gds-sys-space-2xs);
    }

    .field.action-slot-occupied:not(.trail-slot-occupied) {
      padding-inline-end: var(--gds-sys-space-s);
    }

    .field.small.action-slot-occupied:not(.trail-slot-occupied) {
      padding-inline-end: var(--gds-sys-space-2xs);
    }

    slot:not([name])::slotted(*) {
      color: currentColor;
    }

    .main-slot-wrap {
      display: flex;
      gap: var(--gds-sys-space-xs);
      flex: 1;
      align-self: stretch;
    }

    .main-slot-wrap.multiline {
      height: max-content;
    }

    @media (hover: hover) {
      .field:hover {
        background: color-mix(
          in srgb,
          var(--gds-sys-color-l3-neutral-02),
          var(--gds-sys-color-state-neutral-03)
        );
      }

      .field.invalid:hover {
        background: color-mix(
          in srgb,
          var(--gds-sys-color-l3-negative-02),
          var(--gds-sys-color-state-negative-hover)
        );
      }
    }

    slot[name='lead']::slotted([gds-element^='gds-icon-']) {
      align-items: center;
      justify-content: center;
      display: flex;
      inline-size: var(--gds-sys-space-l);
      block-size: var(--gds-sys-space-l);
    }

    .multiline slot[name='action']::slotted([gds-element]) {
      margin-top: -4px;
    }
  }
`,cn=Ra;var Te,ge,pn,hn,un,mn,gn,Q=class extends M{constructor(){super(),h(this,ge),this.size="large",this.multiline=!1,this.disabled=!1,this.invalid=!1,this._leadSlotOccupied=!1,this._leadHasBadge=!1,this._trailSlotOccupied=!1,this._actionSlotOccupied=!1,h(this,Te,(e,t)=>{let s=t.target.assignedNodes({flatten:!0}),n=s.length>0&&s.some(l=>l.nodeType===Node.ELEMENT_NODE||l.nodeType===Node.TEXT_NODE&&l.textContent?.trim()!=="");e==="lead"?(this._leadSlotOccupied=n,this._leadHasBadge=n&&s.some(l=>l.getAttribute?.("gds-element")==="gds-badge")):e==="trail"?this._trailSlotOccupied=n:e==="action"&&(this._actionSlotOccupied=n)})}connectedCallback(){super.connectedCallback(),U.instance.apply(this,"gds-field-base")}render(){let e={invalid:this.invalid??!1,multiline:this.multiline,disabled:this.disabled,"lead-slot-occupied":this._leadSlotOccupied,"lead-has-badge":this._leadHasBadge,"trail-slot-occupied":this._trailSlotOccupied,"action-slot-occupied":this._actionSlotOccupied,small:this.size==="small"};return g`
      <div class="field ${nt(e)}" part="_base">
        ${b(this,ge,pn).call(this)}
      </div>
    `}_handleDisabledChange(){this.disabled?this.setAttribute("inert",""):this.removeAttribute("inert")}};Te=new WeakMap;ge=new WeakSet;pn=function(){let e={right:!0,"as-flex":this.multiline&&(this._trailSlotOccupied||this._actionSlotOccupied)};return g`
      ${b(this,ge,hn).call(this)} ${b(this,ge,un).call(this)}
      <div class="${nt(e)}">
        ${b(this,ge,mn).call(this)} ${b(this,ge,gn).call(this)}
      </div>
    `};hn=function(){return g` <slot
      name="lead"
      @slotchange=${e=>i(this,Te).call(this,"lead",e)}
    ></slot>`};un=function(){return g`<div
      class="main-slot-wrap ${nt({multiline:this.multiline})}"
    >
      <slot
        @slotchange=${e=>i(this,Te).call(this,"main",e)}
      ></slot>
    </div>`};mn=function(){return g`
      <slot
        name="action"
        @slotchange=${e=>i(this,Te).call(this,"action",e)}
      ></slot>
    `};gn=function(){return g`
      <slot
        name="trail"
        @slotchange=${e=>i(this,Te).call(this,"trail",e)}
      ></slot>
    `};Q.styles=[cn];o([d()],Q.prototype,"size",2);o([d({type:Boolean})],Q.prototype,"multiline",2);o([d({type:Boolean,reflect:!0})],Q.prototype,"disabled",2);o([d({type:Boolean})],Q.prototype,"invalid",2);o([D("slot:not([name])")],Q.prototype,"_mainSlotElement",2);o([rt()],Q.prototype,"_leadSlotOccupied",2);o([rt()],Q.prototype,"_leadHasBadge",2);o([rt()],Q.prototype,"_trailSlotOccupied",2);o([rt()],Q.prototype,"_actionSlotOccupied",2);o([N("disabled")],Q.prototype,"_handleDisabledChange",1);Q=o([x("gds-field-base"),tt()],Q);var Ue=class extends Jt{constructor(t){if(super(t),this.it=$,t.type!==Ce.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===$||t==null)return this._t=void 0,this.it=t;if(t===xt)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;let r=[t];return r.raw=r,this._t={_$litType$:this.constructor.resultType,strings:r,values:[]}}};Ue.directiveName="unsafeHTML",Ue.resultType=1;var fn=$e(Ue);var Da=v`
  @layer icon;

  @layer icon {
    :host {
      display: inline-block;
    }

    svg {
      display: block;
      height: 1lh;
      width: auto;
    }
  }
`,yn=Da;var W=class extends j(H(M)){constructor(){super(...arguments),this.solid=!1,this.level="2",this.label=""}get svgAttributes(){let r={fill:"none",xmlns:"http://www.w3.org/2000/svg",viewBox:this.constructor._viewBox,part:"icon"};return this.label?{...r,"aria-label":this.label}:{...r,role:"presentation"}}get svgContent(){let t=this.constructor;return this.solid?t._solidSVG:t._regularSVG}applyStroke(t){return this.stroke?t.replace(/<(path|rect|circle|ellipse|line|polyline|polygon)/g,`<$1 stroke-width="${this.stroke}"`):t}generateAttributesString(t){return Object.entries(t).filter(([r,s])=>s!==void 0).map(([r,s])=>`${r}="${s}"`).join(`
      `)}render(){let t=this.svgAttributes,r=this.svgContent||"";this.stroke&&(r=this.applyStroke(r));let s=`
      <svg ${this.generateAttributesString(t)}>
        ${r}
      </svg>
    `;return qt`${fn(s)}`}};W.styles=[z,yn];o([m({...it,property:"height",selector:"svg"})],W.prototype,"size",2);o([d({type:Boolean})],W.prototype,"solid",2);o([d({type:Number})],W.prototype,"stroke",2);o([d()],W.prototype,"level",2);o([m(wt("content"))],W.prototype,"color",2);o([d({type:String})],W.prototype,"label",2);var Et=class extends W{};Et._regularSVG='<path d="M12 8.75V12.75M12 15.5V15.49M12.25 15.5C12.25 15.6381 12.1381 15.75 12 15.75C11.8619 15.75 11.75 15.6381 11.75 15.5C11.75 15.3619 11.8619 15.25 12 15.25C12.1381 15.25 12.25 15.3619 12.25 15.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M2.79693 16.2279L10.2809 3.64118C11.0561 2.33738 12.9438 2.33738 13.719 3.64118L21.203 16.2279C21.9957 17.561 21.035 19.25 19.484 19.25H4.516C2.96497 19.25 2.00424 17.561 2.79693 16.2279Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>';Et._solidSVG='<path fill-rule="evenodd" clip-rule="evenodd" d="M9.63618 3.25787C10.7021 1.46515 13.2977 1.46515 14.3636 3.25787L21.8476 15.8446C22.9376 17.6777 21.6165 20 19.4839 20H4.51593C2.38326 20 1.06225 17.6777 2.15221 15.8446L9.63618 3.25787ZM12 8C12.4142 8 12.75 8.33579 12.75 8.75V12.75C12.75 13.1642 12.4142 13.5 12 13.5C11.5858 13.5 11.25 13.1642 11.25 12.75V8.75C11.25 8.33579 11.5858 8 12 8ZM13 15.5C13 16.0523 12.5523 16.5 12 16.5C11.4477 16.5 11 16.0523 11 15.5C11 14.9477 11.4477 14.5 12 14.5C12.5523 14.5 13 14.9477 13 15.5Z" fill="currentColor"/>';Et._name="triangle-exclamation";Et._width=24;Et._height=24;Et._viewBox="0 0 24 24";Et=o([x("gds-icon-triangle-exclamation")],Et);var Na=v`
  @layer base, reset, transitional-styles;
  @layer base {
    :host(.visually-hidden) {
      position: absolute;
      clip: rect(0 0 0 0);
      width: 0px;
      height: 0px;
      overflow: hidden;
    }

    :host > *:not(style) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--gds-sys-space-xl);
    }

    .error-message {
      display: flex;
      align-items: flex-start;
      gap: var(--gds-sys-space-xs);
      margin-top: var(--gds-sys-space-3xs);
      font: var(--gds-sys-text-detail-regular-s);
      color: var(--gds-sys-color-content-negative-01);
    }

    [gds-element^='gds-icon'] {
      width: 18px;
      height: 18px;
    }

    :host(.size-small) {
      & .error-message {
        font: var(--gds-sys-text-detail-xs);
        gap: var(--gds-sys-space-3xs);
      }
      & [gds-element^='gds-icon'] {
        width: 16px;
        height: 16px;
        line-height: 16px;
        margin-right: 2px;
      }
    }
  }
`,bn=Na;var us,vn,ft=class extends M{constructor(){super(...arguments),h(this,us)}_handleVisibilityChange(){this.classList.toggle("visually-hidden",!this.errorMessage&&!this.charCounter?.[1])}connectedCallback(){super.connectedCallback(),this._handleVisibilityChange()}render(){return g`<div aria-live="polite">
      <div class="error-message">
        <slot name="message"
          >${J(this.errorMessage,()=>g`
              <gds-icon-triangle-exclamation
                solid
              ></gds-icon-triangle-exclamation>
              ${this.errorMessage}
            `)}</slot
        >
      </div>
      <div class="char-counter" aria-hidden="true">
        ${b(this,us,vn).call(this)}
      </div>
    </div>`}};us=new WeakSet;vn=function(){if(!this.charCounter||this.charCounter[1]===!1)return $;let[e,t]=this.charCounter;return g`<gds-badge variant="${t}">${e}</gds-badge>`};ft.styles=[bn];o([d({type:Array})],ft.prototype,"charCounter",2);o([d()],ft.prototype,"errorMessage",2);o([N("charCounter"),N("errorMessage")],ft.prototype,"_handleVisibilityChange",1);ft=o([x("gds-form-control-footer",{dependsOn:[dt,Et]})],ft);var Tt=class extends W{};Tt._regularSVG='<path d="M10.75 11H12L12 16.25M21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7.375C12.3452 7.375 12.625 7.65482 12.625 8C12.625 8.34518 12.3452 8.625 12 8.625C11.6548 8.625 11.375 8.34518 11.375 8C11.375 7.65482 11.6548 7.375 12 7.375Z" fill="currentColor" stroke="currentColor" stroke-width="0.25"/>';Tt._solidSVG='<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM10 11C10 10.5858 10.3358 10.25 10.75 10.25H12C12.4142 10.25 12.75 10.5858 12.75 11L12.75 16.25C12.75 16.6642 12.4142 17 12 17C11.5858 17 11.25 16.6642 11.25 16.25L11.25 11.75H10.75C10.3358 11.75 10 11.4142 10 11ZM12 7.25C11.5858 7.25 11.25 7.58579 11.25 8C11.25 8.41421 11.5858 8.75 12 8.75C12.4142 8.75 12.75 8.41421 12.75 8C12.75 7.58579 12.4142 7.25 12 7.25Z" fill="currentColor"/>';Tt._name="circle-info";Tt._width=24;Tt._height=24;Tt._viewBox="0 0 24 24";Tt=o([x("gds-icon-circle-info")],Tt);var Va=v`
  @layer base, reset, transitional-styles;
  @layer base {
    #label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--gds-sys-color-content-neutral-01);
    }

    #label-row > div {
      display: flex;
      flex-direction: column;
    }

    slot[name='label']::slotted(*) {
      font: var(--_font-label, var(--gds-sys-text-detail-book-m));
    }

    slot[name='supporting-text']::slotted(*) {
      font: var(--_font-supporting-text, var(--gds-sys-text-detail-regular-s));
    }

    :host(.size-small) slot[name='supporting-text'],
    :host(.size-small) ::slotted(label) {
      font: var(--_font-label, var(--gds-sys-text-detail-book-s));
    }

    #extended-supporting-text {
      opacity: 1;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 368ms;
      transition-property: all;
      font: var(--_font-supporting-text, var(--gds-sys-text-detail-regular-s));
      border-radius: var(--gds-sys-space-xs);
      background-color: var(--gds-sys-color-l3-neutral-02);
      color: var(--gds-sys-color-content-neutral-01);
      max-height: var(--_max-height);
    }

    #extended-supporting-text[aria-hidden='false'] {
      margin: var(--gds-sys-space-3xs) 0 0 0;
      padding: var(--gds-sys-space-s) var(--gds-sys-space-m);
    }

    #extended-supporting-text[aria-hidden='true'] {
      max-height: 0;
      opacity: 0;
      translate: 0 2px;
      padding: 0 var(--gds-sys-space-m);
      margin: 0;
      overflow: hidden;
    }
  }
`,xn=Va;var Sr,_n,ms,gs,kr,kn,yt=class extends M{constructor(){super(...arguments),h(this,Sr),this.showExtendedSupportingText=!1,this._hasExtendedSupportingText=!1,h(this,ms,()=>g`
      <gds-button
        size="small"
        rank="tertiary"
        margin="-xs 0"
        label="${ot("Show more information")}"
        gds-aria-expanded="${this.showExtendedSupportingText}"
        @click=${i(this,gs)}
      >
        <gds-icon-circle-info ?solid=${this.showExtendedSupportingText} />
      </gds-button>
    `),h(this,gs,()=>{this.dispatchCustomEvent("gds-ui-state",{bubbles:!0,composed:!0,detail:this.showExtendedSupportingText,cancelable:!0})&&(this.showExtendedSupportingText=!this.showExtendedSupportingText,this._extendedSupportingText?.style.setProperty("--_max-height",this.showExtendedSupportingText?`${this._extendedSupportingText.scrollHeight}px`:"0"))}),h(this,kr,()=>{this.showExtendedSupportingText&&this._extendedSupportingText?.style.setProperty("--_max-height",`${this._extendedSupportingText.scrollHeight}px`)})}render(){return g`
      <div id="label-row">
        <div>
          <slot name="label"></slot>
          <slot name="supporting-text"></slot>
        </div>
        ${J(this._hasExtendedSupportingText,i(this,ms))}
      </div>

      ${b(this,Sr,kn).call(this)}
    `}connectedCallback(){super.connectedCallback(),window.addEventListener("resize",i(this,kr))}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("resize",i(this,kr))}};Sr=new WeakSet;_n=function(e){this._hasExtendedSupportingText=e.target.assignedElements({flatten:!0}).length>0};ms=new WeakMap;gs=new WeakMap;kr=new WeakMap;kn=function(){return g`
      <div
        id="extended-supporting-text"
        aria-hidden="${this.showExtendedSupportingText?"false":"true"}"
        ?inert=${!this.showExtendedSupportingText}
      >
        <slot
          name="extended-supporting-text"
          @slotchange=${b(this,Sr,_n)}
        ></slot>
      </div>
    `};yt.styles=[xn];o([d({type:Boolean,reflect:!0})],yt.prototype,"showExtendedSupportingText",2);o([rt()],yt.prototype,"_hasExtendedSupportingText",2);o([D("#extended-supporting-text")],yt.prototype,"_extendedSupportingText",2);yt=o([x("gds-form-control-header",{dependsOn:[gt,$t,Tt]}),tt()],yt);var Me=v`
  * {
    box-sizing: border-box;
  }

  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    contain: layout;
    isolation: isolate;
    gap: var(--gds-sys-space-xs);
  }

  :host([size='small']) {
    gap: var(--gds-sys-space-3xs);
  }

  :host([size='small']) .native-control {
    font: var(--gds-sys-text-detail-regular-s);
  }

  :host([disabled]) {
    color: var(--gds-sys-color-content-disabled-01);
    pointer-events: none;
  }

  .native-control {
    font: var(--gds-sys-text-detail-regular-m);
    align-items: center;
    align-self: center;
    appearance: none;
    background-color: transparent;
    border: 0;
    font-family: inherit;
    margin: unset;
    outline: none;
    overflow: hidden;
    padding: unset;
    width: 100%;
    color: currentColor;
    text-align: left;
  }

  :host([size='small']) slot[name='lead']::slotted(*) {
    line-height: 18px;
    width: var(--gds-sys-space-m);
  }

  :host([size='small']) slot[name='lead']::slotted(*) {
    min-width: var(--gds-sys-space-m);
    max-width: var(--gds-sys-space-m);
    display: flex;
  }

  slot[name='lead']::slotted(*) {
    min-width: var(--gds-sys-space-l);
    display: flex;
  }
`;var bt=class extends W{};bt._regularSVG='<path d="M7.75 7.75L16.25 16.25M16.25 7.75L7.75 16.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';bt._solidSVG='<path fill-rule="evenodd" clip-rule="evenodd" d="M7.11612 7.11612C7.60427 6.62796 8.39573 6.62796 8.88388 7.11612L12 10.2322L15.1161 7.11612C15.6043 6.62796 16.3957 6.62796 16.8839 7.11612C17.372 7.60427 17.372 8.39573 16.8839 8.88388L13.7678 12L16.8839 15.1161C17.372 15.6043 17.372 16.3957 16.8839 16.8839C16.3957 17.372 15.6043 17.372 15.1161 16.8839L12 13.7678L8.88388 16.8839C8.39573 17.372 7.60427 17.372 7.11612 16.8839C6.62796 16.3957 6.62796 15.6043 7.11612 15.1161L10.2322 12L7.11612 8.88388C6.62796 8.39573 6.62796 7.60427 7.11612 7.11612Z" fill="currentColor"/>';bt._name="cross-small";bt._width=24;bt._height=24;bt._viewBox="0 0 24 24";bt=o([x("gds-icon-cross-small")],bt);function wr(){return(e,t,r)=>{let s=e.connectedCallback,n=e.disconnectedCallback;e.connectedCallback=function(){s?.call(this),this.__resizeObservers=this.__resizeObservers||{},this.__resizeObserver_tids=this.__resizeObserver_tids||{},this.__resizeObservers[t]=new ResizeObserver(()=>{this.__resizeObserver_tids[t]&&clearTimeout(this.__resizeObserver_tids[t]),this.__resizeObserver_tids[t]=setTimeout(()=>{r.value?.call(this)},20)}),this.__resizeObservers[t].observe(this)},e.disconnectedCallback=function(){n?.call(this),this.__resizeObservers[t].disconnect()}}}var Ia=v`
  textarea {
    height: calc(1lh * var(--_lines));
    min-height: calc(1lh * 4);
    max-height: calc(1lh * 20);
    overflow: auto;
    min-width: 20ch;
    padding-inline-end: calc(
      var(--gds-sys-space-xs) + var(--padding-inline-end)
    );

    &.resize-manual {
      resize: vertical;
    }

    &.resize-auto {
      resize: none;
    }

    &.resize-false {
      resize: none;
    }
  }
`,Sn=Ia;var Cr,te,wn,ys,bs,vs,fs,xs,Cn,$n,En,Tn,Mn,R=class extends Z{constructor(){super(),h(this,te),this._defaultRows=4,this.rows=4,this.supportingText="",this.clearable=!1,this.resizable="auto",this.showExtendedSupportingText=!1,this.maxlength=Number.MAX_SAFE_INTEGER,this.size="large",this.plain=!1,this.autocapitalize="off",this.autocorrect=!1,this.autofocus=!1,this.spellcheck=!0,this.charCounterCallback=_s,h(this,Cr,this.charCounterCallback(this)),this._handleSlotChange=()=>{requestAnimationFrame(()=>{this._handleResize()})},h(this,ys,e=>{let t=e.target;this.value=t.value}),h(this,bs,e=>{let t=e.target;this.value=t.value,this.dispatchStandardEvent("change",{bubbles:!0,composed:!0})}),h(this,vs,e=>{requestAnimationFrame(()=>{this._setAutoHeight()})}),h(this,fs,()=>{this.elTextareaAsync.then(e=>e.focus())}),h(this,xs,()=>{this.value="",this.elTextareaAsync.then(e=>{if(this.resizable==="manual")e.style.height="";else if(this.resizable==="false"){let t=this._initialRows??this._defaultRows;this.rows=t,e.style.setProperty("--_lines",t.toString())}else{let t=this._initialRows??this._defaultRows;this.rows=t,e.style.setProperty("--_lines",t.toString()),e.style.height=""}}),this.dispatchCustomEvent("gds-input-cleared",{bubbles:!0,composed:!0}),this.dispatchStandardEvent("input",{bubbles:!0,composed:!0})}),this.value=""}test_getClearButton(){return this.shadowRoot?.querySelector("#clear-button")}test_getFieldElement(){return this.shadowRoot?.querySelector("#field")}focus(e){this._getValidityAnchor()?.focus(e)}select(){this._getValidityAnchor()?.select()}setRangeText(...e){this._getValidityAnchor()?.setRangeText(...e),this.value=this._getValidityAnchor()?.value||""}setSelectionRange(...e){this._getValidityAnchor()?.setSelectionRange(...e)}get selectionStart(){return this._getValidityAnchor()?.selectionStart}set selectionStart(e){let t=this._getValidityAnchor();t&&(t.selectionStart=e)}get selectionEnd(){return this._getValidityAnchor()?.selectionEnd}set selectionEnd(e){let t=this._getValidityAnchor();t&&(t.selectionEnd=e)}get selectionDirection(){return this._getValidityAnchor()?.selectionDirection}set selectionDirection(e){let t=this._getValidityAnchor();t&&(t.selectionDirection=e)}_handleResize(){this.fieldBase&&Promise.resolve().then(()=>{let e=this.fieldBase?.shadowRoot;if(!e)return;let t=e.querySelector(".right");if(t){let r=t.getBoundingClientRect();this.elTextarea.style.setProperty("--padding-inline-end",`${r.width}px`)}else this.elTextarea.style.removeProperty("--padding-inline-end")})}connectedCallback(){super.connectedCallback(),this.hasAttribute("rows")&&(this._initialRows=this.rows),this._setAutoHeight(),this.addEventListener("slotchange",this._handleSlotChange)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("slotchange",this._handleSlotChange)}render(){return g`
      ${J(!this.plain,()=>g`<gds-form-control-header
            class="size-${this.size}"
            .showExtendedSupportingText="${this.showExtendedSupportingText}"
          >
            <label for="input" slot="label">${this.label}</label>
            <span slot="supporting-text" id="supporting-text">
              ${this.supportingText}
            </span>
            <slot
              name="extended-supporting-text"
              slot="extended-supporting-text"
            ></slot>
          </gds-form-control-header>`)}

      <gds-field-base
        id="field"
        .disabled=${this.disabled}
        .invalid=${this.invalid}
        @click=${i(this,fs)}
        multiline
      >
        ${b(this,te,Cn).call(this)}
      </gds-field-base>

      ${J(b(this,te,wn).call(this),()=>g`<gds-form-control-footer
            id="footer"
            class="size-${this.size}"
            .charCounter=${i(this,Cr)}
            .errorMessage=${this.invalid?this.errorMessage:void 0}
          ></gds-form-control-footer>`)}
    `}_handleValueChange(){G(this,Cr,this.charCounterCallback(this))}_getValidityAnchor(){return this.elTextarea}_setAutoHeight(){this.elTextareaAsync.then(e=>{if(this.resizable==="false"){let t=this._initialRows??this._defaultRows;this.rows=t,e.style.setProperty("--_lines",t.toString());return}if(this.resizable!=="manual"&&this.resizable==="auto")if(e.value===""){let t=this._initialRows??this._defaultRows;this.rows=t,e.style.setProperty("--_lines",t.toString())}else{let t=getComputedStyle(e),r=parseFloat(t.lineHeight),s=e.scrollHeight,n=Math.ceil(s/r),l=this._initialRows??this._defaultRows;this.rows=Math.max(l,n),e.style.setProperty("--_lines",this.rows.toString())}})}_handleRowsChange(){this.hasAttribute("rows")&&(this._initialRows=this.rows),this.elTextareaAsync.then(e=>{this.resizable==="false"&&e.style.setProperty("--_lines",this.rows.toString())})}};Cr=new WeakMap;te=new WeakSet;wn=function(){return!this.plain};ys=new WeakMap;bs=new WeakMap;vs=new WeakMap;fs=new WeakMap;xs=new WeakMap;Cn=function(){return[b(this,te,$n).call(this),b(this,te,Tn).call(this),b(this,te,Mn).call(this),b(this,te,En).call(this)].map(t=>g`${t}`)};$n=function(){return g`<slot slot="lead" name="lead"></slot>`};En=function(){return g`<slot slot="trail" name="trail"></slot>`};Tn=function(){return g`
      <textarea
        @input=${i(this,ys)}
        @change=${i(this,bs)}
        @paste=${i(this,vs)}
        .value=${this.value}
        id="input"
        class="native-control resize-${this.resizable}"
        aria-label=${this.plain&&this.label||$}
        aria-describedby="supporting-text extended-supporting-text sub-label message"
        aria-errormessage="footer"
        placeholder=" "
        autocapitalize=${L(this.autocapitalize)}
        autocomplete=${L(this.autocomplete)}
        autocorrect=${L(this.autocorrect)}
        ?autofocus=${this.autofocus}
        spellcheck=${this.spellcheck}
        enterkeyhint=${L(this.enterkeyhint)}
        inputmode=${L(this.inputmode)}
        wrap=${L(this.wrap)}
        ?required=${this.required}
      ></textarea>
    `};Mn=function(){return this.clearable&&(this.value?.length||0)>0?g`
        <gds-button
          size="small"
          rank="tertiary"
          variant="${L(this.invalid?"negative":void 0)}"
          ?disabled="${this.disabled}"
          label="${ot("Clear input")}"
          @click=${i(this,xs)}
          slot="action"
          id="clear-button"
        >
          <gds-icon-cross-small></gds-icon-cross-small>
        </gds-button>
      `:$};R.styles=[z,Me,Sn];o([m({valueTemplate:e=>e,selector:"textarea",styleTemplate:(e,t)=>`min-height: calc(1lh * ${t[0]});`})],R.prototype,"rows",2);o([d({attribute:"supporting-text"})],R.prototype,"supportingText",2);o([d({type:Boolean})],R.prototype,"clearable",2);o([d({type:String})],R.prototype,"resizable",2);o([d({attribute:"show-extended-supporting-text",type:Boolean,reflect:!0})],R.prototype,"showExtendedSupportingText",2);o([d({type:Number})],R.prototype,"maxlength",2);o([d({type:String})],R.prototype,"size",2);o([d({type:Boolean})],R.prototype,"plain",2);o([d()],R.prototype,"autocapitalize",2);o([d({type:Boolean})],R.prototype,"autocorrect",2);o([d()],R.prototype,"autocomplete",2);o([d({type:Boolean})],R.prototype,"autofocus",2);o([d({type:Boolean,converter:{fromAttribute:e=>!(!e||e==="false"),toAttribute:e=>e?"true":"false"}})],R.prototype,"spellcheck",2);o([d()],R.prototype,"wrap",2);o([d()],R.prototype,"enterkeyhint",2);o([d()],R.prototype,"inputmode",2);o([d({attribute:!1})],R.prototype,"charCounterCallback",2);o([rr("textarea")],R.prototype,"elTextareaAsync",2);o([D("textarea")],R.prototype,"elTextarea",2);o([D("gds-field-base")],R.prototype,"fieldBase",2);o([wr()],R.prototype,"_handleResize",1);o([N("value")],R.prototype,"_handleValueChange",1);o([N("value")],R.prototype,"_setAutoHeight",1);o([N("rows")],R.prototype,"_handleRowsChange",1);R=o([tt()],R);var $r=class extends H(I(j(R))){};$r=o([x("gds-textarea",{dependsOn:[yt,ft,gt,Q,bt]})],$r);var _s=e=>{let t=(e.value?.length||0)>=e.maxlength?"negative":"positive";return[e.maxlength-(e.value?.length||0),e.maxlength<Number.MAX_SAFE_INTEGER&&t]};var Wa=v`
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: var(--_appearance-spin-button, auto);
  }

  input[type='number'] {
    -moz-appearance: var(--_appearance-spin-button, textfield);
  }
`,An=Wa;var Er,ee,zn,Ss,ws,Cs,ks,$s,Bn,Gn,Ln,Pn,On,V=class extends Z{constructor(){super(),h(this,ee),this.supportingText="",this.showExtendedSupportingText=!1,this.clearable=!1,this.maxlength=Number.MAX_SAFE_INTEGER,this.size="large",this.plain=!1,this.type="text",this.autocapitalize="off",this.autocorrect=!1,this.autofocus=!1,this.spellcheck=!0,this.charCounterCallback=_s,h(this,Er,this.charCounterCallback(this)),h(this,Ss,e=>{let t=e.target;this.value=t.value}),h(this,ws,e=>{let t=e.target;this.value=t.value,this.dispatchStandardEvent("change",{bubbles:!0,composed:!0})}),h(this,Cs,e=>{if(e.key!=="Enter"||this.disabled||e.isComposing||e.repeat)return;let t=this.form??this.closest("form");t&&queueMicrotask(()=>{e.defaultPrevented||this.disabled||t.requestSubmit()})}),h(this,ks,()=>{this.elInputAsync.then(e=>e.focus())}),h(this,$s,()=>{this.value="",this.dispatchCustomEvent("gds-input-cleared",{bubbles:!0,composed:!0}),this.dispatchStandardEvent("input",{bubbles:!0,composed:!0})}),this.value=""}focus(e){this._getValidityAnchor()?.focus(e)}select(){this._getValidityAnchor()?.select()}setRangeText(...e){this._getValidityAnchor()?.setRangeText(...e),this.value=this._getValidityAnchor()?.value||""}setSelectionRange(...e){this._getValidityAnchor()?.setSelectionRange(...e)}showPicker(){this._getValidityAnchor()?.showPicker()}stepDown(e){this._getValidityAnchor()?.stepDown(e)}stepUp(e){this._getValidityAnchor()?.stepUp(e)}get selectionStart(){return this._getValidityAnchor()?.selectionStart}set selectionStart(e){let t=this._getValidityAnchor();t&&(t.selectionStart=e)}get selectionEnd(){return this._getValidityAnchor()?.selectionEnd}set selectionEnd(e){let t=this._getValidityAnchor();t&&(t.selectionEnd=e)}get selectionDirection(){return this._getValidityAnchor()?.selectionDirection}set selectionDirection(e){let t=this._getValidityAnchor();t&&(t.selectionDirection=e)}test_getClearButton(){return this.shadowRoot?.querySelector("#clear-button")}test_getFieldElement(){return this.shadowRoot?.querySelector("#field")}render(){return g`
      ${J(!this.plain,()=>g`<gds-form-control-header class="size-${this.size}">
            <label for="input" slot="label">${this.label}</label>
            <span slot="supporting-text" id="supporting-text">
              ${this.supportingText}
            </span>
            <slot
              name="extended-supporting-text"
              slot="extended-supporting-text"
            ></slot>
          </gds-form-control-header>`)}
      <gds-field-base
        .size=${this.size}
        .disabled=${this.disabled}
        .invalid=${this.invalid}
        @click=${i(this,ks)}
        id="field"
      >
        ${b(this,ee,Bn).call(this)}
      </gds-field-base>
      ${J(b(this,ee,zn).call(this),()=>g` <gds-form-control-footer
            id="message"
            class="size-${this.size}"
            .charCounter=${i(this,Er)}
            .errorMessage=${this.invalid?this.errorMessage:void 0}
          ></gds-form-control-footer>`)}
    `}_handleValueChange(){G(this,Er,this.charCounterCallback(this))}_getValidityAnchor(){return this.elInput}};Er=new WeakMap;ee=new WeakSet;zn=function(){return!this.plain};Ss=new WeakMap;ws=new WeakMap;Cs=new WeakMap;ks=new WeakMap;$s=new WeakMap;Bn=function(){return[b(this,ee,Gn).call(this),b(this,ee,Pn).call(this),b(this,ee,On).call(this),b(this,ee,Ln).call(this)].map(t=>g`${t}`)};Gn=function(){return g` <slot slot="lead" name="lead"></slot> `};Ln=function(){return g`<slot slot="trail" name="trail"></slot>`};Pn=function(){return g`
      <input
        class="native-control"
        @input=${i(this,Ss)}
        @keydown=${i(this,Cs)}
        @change=${i(this,ws)}
        .value=${this.value}
        id="input"
        ?disabled=${this.disabled}
        aria-describedby="supporting-text extended-supporting-text sub-label message"
        aria-invalid=${this.invalid}
        aria-errormessage="message"
        aria-label=${this.plain&&this.label||$}
        placeholder=" "
        type=${this.type}
        min=${L(this.min)}
        max=${L(this.max)}
        step=${L(this.step)}
        autocapitalize=${L(this.autocapitalize)}
        autocomplete=${L(this.autocomplete)}
        autocorrect=${L(this.autocorrect)}
        ?autofocus=${this.autofocus}
        spellcheck=${this.spellcheck}
        enterkeyhint=${L(this.enterkeyhint)}
        inputmode=${L(this.inputmode)}
        ?required=${this.required}
      />
    `};On=function(){return this.clearable&&(this.value?.length||0)>0?g`<gds-button
        size="${this.size==="small"?"xs":"small"}"
        rank="tertiary"
        variant="${L(this.invalid?"negative":void 0)}"
        ?disabled="${this.disabled}"
        label="${ot("Clear input")}"
        @click=${i(this,$s)}
        id="clear-button"
        slot="action"
      >
        <gds-icon-cross-small></gds-icon-cross-small>
      </gds-button>`:$};V.styles=[z,Me,An];o([d({attribute:"supporting-text"})],V.prototype,"supportingText",2);o([d({attribute:"show-extended-supporting-text",type:Boolean,reflect:!0})],V.prototype,"showExtendedSupportingText",2);o([d({type:Boolean})],V.prototype,"clearable",2);o([d({type:Number})],V.prototype,"maxlength",2);o([d({reflect:!0})],V.prototype,"size",2);o([d({type:Boolean})],V.prototype,"plain",2);o([d({reflect:!0})],V.prototype,"type",2);o([d()],V.prototype,"min",2);o([d()],V.prototype,"max",2);o([d()],V.prototype,"step",2);o([d()],V.prototype,"autocapitalize",2);o([d({type:Boolean})],V.prototype,"autocorrect",2);o([d()],V.prototype,"autocomplete",2);o([d({type:Boolean})],V.prototype,"autofocus",2);o([d()],V.prototype,"enterkeyhint",2);o([d({type:Boolean,converter:{fromAttribute:e=>!(!e||e==="false"),toAttribute:e=>e?"true":"false"}})],V.prototype,"spellcheck",2);o([d()],V.prototype,"inputmode",2);o([d({attribute:!1})],V.prototype,"charCounterCallback",2);o([rr("input")],V.prototype,"elInputAsync",2);o([D("input")],V.prototype,"elInput",2);o([N("value")],V.prototype,"_handleValueChange",1);V=o([tt()],V);var Tr=class extends I(j(H(V))){};Tr=o([x("gds-input",{dependsOn:[yt,ft,Q,_t,gt,bt]})],Tr);Tr.define();$r.define();var Mt=class extends W{};Mt._regularSVG='<path d="M20 9L12 17L4 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';Mt._solidSVG='<path fill-rule="evenodd" clip-rule="evenodd" d="M3.46967 8.46967C3.76256 8.17678 4.23744 8.17678 4.53033 8.46967L12 15.9393L19.4697 8.46967C19.7626 8.17678 20.2374 8.17678 20.5303 8.46967C20.8232 8.76256 20.8232 9.23744 20.5303 9.53033L12.5303 17.5303C12.3897 17.671 12.1989 17.75 12 17.75C11.8011 17.75 11.6103 17.671 11.4697 17.5303L3.46967 9.53033C3.17678 9.23744 3.17678 8.76256 3.46967 8.46967Z" fill="currentColor"/>';Mt._name="chevron-bottom";Mt._width=24;Mt._height=24;Mt._viewBox="0 0 24 24";Mt=o([x("gds-icon-chevron-bottom")],Mt);var Fa=v`
  @layer base, reset, transitional-styles;
  @layer base {
    .select-container {
      display: contents;
    }

    select {
      flex: 1;
      height: 100%;
      opacity: 0;
      position: absolute;
      z-index: 1;
      inset: 0;

      &::-ms-expand {
        display: none;
      }
    }

    select[multiple] {
      opacity: 1;
      position: relative;
      width: 100%;
    }

    label {
      flex: 1;
    }
  }
`,Rn=Fa;var je,It,Dn,Mr,Nn,Vn,In,Wn,Fn,Un,ct=class extends Z{constructor(){super(...arguments),h(this,It),this.supportingText="",this.showExtendedSupportingText=!1,this.size="large",this.plain=!1,h(this,je,!1),h(this,Mr,e=>{e.stopPropagation(),b(this,It,Nn).call(this),requestAnimationFrame(()=>{this.dispatchCustomEvent("input",{detail:{value:this.value},bubbles:!0,composed:!0}),this.dispatchCustomEvent("change",{detail:{value:this.value},bubbles:!0,composed:!0})})})}get value(){return this._internalValue}set value(e){i(this,je)||G(this,je,!0),this._internalValue=e}get displayValue(){return this.selectElement?Array.from(this.selectElement.selectedOptions).map(e=>e.text).join(", "):""}get multiple(){return this.selectElement?.multiple??!1}connectedCallback(){super.connectedCallback(),this.updateComplete.then(()=>{this._captureDOM(),this._handleValueChange()})}focus(e){this._getValidityAnchor()?.focus(e)}render(){let e={multiple:this.multiple};return this.selectElement&&(this.selectElement.disabled=this.disabled),g`
      ${J(!this.plain,()=>g`<gds-form-control-header
            class="size-${this.size}"
            .showExtendedSupportingText=${this.showExtendedSupportingText}
          >
            <label for="select" slot="label" id="label-text">
              ${this.label}
            </label>
            <span slot="supporting-text" id="supporting-text">
              ${this.supportingText}
            </span>
            <slot
              name="extended-supporting-text"
              slot="extended-supporting-text"
            ></slot>
          </gds-form-control-header>`)}

      <gds-field-base
        .size=${this.size}
        .disabled=${this.disabled}
        .invalid=${this.invalid}
        .multiline=${this.multiple}
        align-items=${this.multiple?"flex-start":"center"}
        class=${nt(e)}
      >
        ${b(this,It,Vn).call(this)}
      </gds-field-base>

      ${J(b(this,It,Dn).call(this),()=>g`<gds-form-control-footer
            class="size-${this.size}"
            .errorMessage=${this.invalid?this.errorMessage:void 0}
          ></gds-form-control-footer>`)}
    `}_captureDOM(){if(!this.shadowRoot||this.childNodes.length===0||!this._elSelectContainer)return;let e=Array.from(this.children).filter(t=>t.nodeName==="SELECT").map(t=>{let r=t.cloneNode(!0);return r.addEventListener("change",i(this,Mr)),r.addEventListener("input",i(this,Mr)),r.setAttribute("aria-describedby","supporting-text extended-supporting-text sub-label message"),r.ariaLabel=this.label,r.setAttribute("id","select"),r.disabled=this.disabled,r.className="native-control",i(this,je)?r.value=this.value:this._internalValue=r.value,r});this._elSelectContainer.replaceChildren(...e)}formResetCallback(){if(this.selectElement)if(this.selectElement.multiple)Array.from(this.selectElement.options).forEach(e=>{e.selected=!1}),this.value=[];else{let e=this.selectElement.options[0];e&&(this.value=e.value,this.selectElement.value=e.value)}}_getValidityAnchor(){return this.selectElement}_handleValueChange(){if(this.selectElement){if(this.multiple){let e=this.value||[];Array.from(this.selectElement.options).forEach(t=>{t.selected=e.includes(t.value)})}else this.selectElement.value=this.value;this.requestUpdate()}}};je=new WeakMap;It=new WeakSet;Dn=function(){return!this.plain&&this.invalid};Mr=new WeakMap;Nn=function(){if(this.selectElement)if(this.multiple){let e=Array.from(this.selectElement.selectedOptions);this.value=e.map(t=>t.value)}else this.value=this.selectElement.value};Vn=function(){return[b(this,It,In).call(this),b(this,It,Fn).call(this),b(this,It,Wn).call(this),b(this,It,Un).call(this)].map(t=>g`${t}`)};In=function(){return g`<slot name="lead" slot="lead"></slot>`};Wn=function(){if(!this.multiple)return g`<label id="placeholder" class="native-control"
        >${this.displayValue}</label
      >`};Fn=function(){return g`<div class="select-container"></div>`};Un=function(){if(!this.multiple)return g`
        <gds-icon-chevron-bottom slot="action"></gds-icon-chevron-bottom>
      `};ct.styles=[z,Me,Rn];o([d({attribute:"supporting-text"})],ct.prototype,"supportingText",2);o([d({attribute:"show-extended-supporting-text",type:Boolean,reflect:!0})],ct.prototype,"showExtendedSupportingText",2);o([d({type:String})],ct.prototype,"size",2);o([d({type:Boolean})],ct.prototype,"plain",2);o([D("select")],ct.prototype,"selectElement",2);o([d()],ct.prototype,"value",1);o([D(".select-container")],ct.prototype,"_elSelectContainer",2);o([mr({childList:!0,subtree:!0,attributes:!0,characterData:!0})],ct.prototype,"_captureDOM",1);o([N("value")],ct.prototype,"_handleValueChange",1);ct=o([tt()],ct);var Ar=class extends H(I(j(ct))){};Ar=o([x("gds-select",{dependsOn:[yt,ft,Q,Mt]})],Ar);Ar.define();var Ua=`@layer base, reset, transitional-styles;
@layer transitional-styles {
  @layer _base, _overrides;
  @layer _base {}
  @layer _overrides {}
}`,jn=Ua;function Hn(){U.instance.register("gds-select",jn.toString()),we(),cr()}var At=class extends W{};At._regularSVG='<path d="M4.75 4.75L19.25 19.25M19.25 4.75L4.75 19.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';At._solidSVG='<path fill-rule="evenodd" clip-rule="evenodd" d="M4.11612 4.11612C4.60427 3.62796 5.39573 3.62796 5.88388 4.11612L12 10.2322L18.1161 4.11612C18.6043 3.62796 19.3957 3.62796 19.8839 4.11612C20.372 4.60427 20.372 5.39573 19.8839 5.88388L13.7678 12L19.8839 18.1161C20.372 18.6043 20.372 19.3957 19.8839 19.8839C19.3957 20.372 18.6043 20.372 18.1161 19.8839L12 13.7678L5.88388 19.8839C5.39573 20.372 4.60427 20.372 4.11612 19.8839C3.62796 19.3957 3.62796 18.6043 4.11612 18.1161L10.2322 12L4.11612 5.88388C3.62796 5.39573 3.62796 4.60427 4.11612 4.11612Z" fill="currentColor"/>';At._name="cross-large";At._width=24;At._height=24;At._viewBox="0 0 24 24";At=o([x("gds-icon-cross-large")],At);var ja=v`
  @layer base, reset, transitional-styles;
  @layer base {
    :host {
      display: contents;

      --_margin: var(--gds-sys-space-l);
    }

    dialog {
      transition: transform var(--gds-sys-motion-duration-fast)
        cubic-bezier(var(--gds-sys-motion-easing-ease-out));
      background: transparent;
      padding: 0;
      border-width: 0;
      overflow: visible;
      max-width: calc(100vw - var(--_margin));
      max-height: 100vh;
      display: flex;
      width: 400px;

      @starting-style {
        opacity: 0;
        transform: translateY(-16px);
        &::backdrop {
          opacity: 0;
        }
      }

      &::backdrop {
        transition: all var(--gds-sys-motion-duration-fast)
          cubic-bezier(var(--gds-sys-motion-easing-ease-out));
        background: rgba(100, 100, 100, 0.4);
      }
    }

    dialog > * {
      flex-grow: 1;
    }

    dialog.default.placement-initial {
      margin: auto;
      --_margin: 0px;
    }

    dialog.default.placement-top {
      margin: var(--gds-sys-space-l) auto auto;
    }

    dialog.default.placement-bottom {
      margin: auto auto var(--gds-sys-space-l) auto;
    }

    dialog.default.placement-left {
      margin: auto var(--gds-sys-space-l) auto auto;
    }
    dialog.default.placement-right {
      margin: auto auto auto var(--gds-sys-space-l);
    }

    dialog.slide-out {
      --_in: var(--gds-sys-space-m);
      --_margin: var(--gds-sys-space-l);

      height: auto;

      &.placement-initial,
      &.placement-right {
        inset: var(--_in);

        @media (min-width: 648px) {
          --_in: var(--gds-sys-space-l);
          inset: var(--_in) var(--_in) var(--_in) auto;
        }

        @starting-style {
          transform: translateX(var(--gds-sys-space-6xl));
        }
      }

      &.placement-left {
        @starting-style {
          transform: translateX(calc(-1 * var(--gds-sys-space-6xl)));
        }
        inset: var(--_in);

        @media (min-width: 648px) {
          --_in: var(--gds-sys-space-l);
          inset: var(--_in) auto var(--_in) var(--_in);
        }
      }

      &.placement-top {
        @starting-style {
          transform: translateY(calc(-1 * var(--gds-sys-space-6xl)));
        }
        inset: var(--_in) var(--_in) auto var(--_in);
      }

      &.placement-bottom {
        @starting-style {
          transform: translateY(calc(var(--gds-sys-space-6xl)));
        }
        inset: auto var(--_in) var(--_in) var(--_in);
      }
    }

    dialog:focus {
      outline: none;
    }

    .card {
      flex-direction: column;
    }

    slot[name='footer'] > *,
    slot[name='footer']::slotted(*) {
      flex: 1;
    }

    h2 {
      margin: 0;
      padding: 0;
      font: var(--gds-sys-text-heading-s);
      margin-block-start: var(--gds-sys-space-4xs);
    }
  }
`,qn=ja;var Es=new Set;function Xn(){Se.instance.injectGlobalStyles("dialog-scroll-lock",v`
      .gds-scroll-lock body {
        padding-right: var(--gds-scroll-lock-size) !important;
        overflow: hidden !important;
      }
    `)}function Zn(e){if(Es.add(e),!document.documentElement.classList.contains("gds-scroll-lock")){let t=Ha()+qa(),r=getComputedStyle(document.documentElement).scrollbarGutter;(!r||r==="auto")&&(r="stable"),t<2&&(r=""),document.documentElement.style.setProperty("--gds-scroll-lock-gutter",r),document.documentElement.classList.add("gds-scroll-lock"),document.documentElement.style.setProperty("--gds-scroll-lock-size",`${t}px`)}}function Ts(e){Es.delete(e),Es.size===0&&(document.documentElement.classList.remove("gds-scroll-lock"),document.documentElement.style.removeProperty("--gds-scroll-lock-size"))}function Ha(){let e=document.documentElement.clientWidth;return Math.abs(window.innerWidth-e)}function qa(){let e=Number(getComputedStyle(document.body).paddingRight.replace(/px/,""));return isNaN(e)||!e?0:e}var Wt,He,Ft,re,Ms,As,zr,zs,qe,Br,Gr,Bs,Yn,Gs,Xe;Xn();var at=class extends I(fr(yr(M))){constructor(){super(...arguments),h(this,Bs),this.open=!1,this.variant="default",this.placement="initial",this.scrollable=!1,this.closedby="closerequest",h(this,Wt),h(this,He,!1),h(this,Ft,!1),h(this,re,e=>{i(this,qe).call(this,e)&&(G(this,Ft,!0),this.close(e),G(this,Ft,!1))}),h(this,Ms,e=>{i(this,Br).call(this,e)&&(G(this,Ft,!0),this.show(e),G(this,Ft,!1))}),h(this,As,e=>{e.preventDefault(),i(this,re).call(this,"native-close")}),h(this,zr,e=>{e.key==="Escape"&&(e.preventDefault(),i(this,re).call(this,"native-close"))}),h(this,zs,e=>{this.open?(G(this,Ft,!0),this.close("native-close"),G(this,Ft,!1),i(this,qe).call(this,"native-close")):!i(this,Ft)&&i(this,Wt)&&i(this,Wt)!=="prop-change"&&i(this,qe).call(this,i(this,Wt))}),h(this,qe,e=>i(this,Gr).call(this,e)?(this.dispatchCustomEvent("gds-close",{detail:e}),!0):!1),h(this,Br,e=>i(this,Gr).call(this,e)?(this.dispatchCustomEvent("gds-show",{detail:e}),!0):!1),h(this,Gr,e=>this.dispatchCustomEvent("gds-ui-state",{detail:{reason:e,open:this.open}})),h(this,Gs,e=>{i(this,Ms).call(this,"slotted-trigger")}),h(this,Xe,e=>{let t=e,r=this._elDialog;if((t.clientX>0||t.clientY>0)&&t.target===this&&r&&this.open){let n=r.getBoundingClientRect();!(n.top<=t.clientY&&t.clientY<=n.top+n.height&&n.left<=t.clientX&&t.clientX<=n.left+n.width)&&!i(this,He)&&i(this,re).call(this,"click-outside")}G(this,He,!1)})}show(e){this.open=!0,e&&i(this,Br).call(this,e)}close(e){G(this,Wt,e),this.open=!1}disconnectedCallback(){super.disconnectedCallback(),Ts(this)}render(){return g`<slot
        name="trigger"
        @slotchange=${b(this,Bs,Yn)}
      ></slot>
      ${J(this.open,()=>g`<dialog
            closedby=${this.closedby}
            @cancel=${i(this,As)}
            @close=${i(this,zs)}
            class=${nt({[this.variant]:!0,[`placement-${this.placement}`]:!0})}
            aria-label=${L(this.heading)}
          >
            <gds-card
              class="card"
              padding="xl"
              variant="secondary"
              box-shadow="xl"
              border-radius="m"
              max-width="100%"
              border-width="0"
              @mousedown=${()=>G(this,He,!0)}
            >
              <slot name="dialog">
                <gds-flex justify-content="space-between">
                  <h2 id="heading">${this.heading}</h2>
                  <gds-button
                    id="close-btn"
                    rank="tertiary"
                    size="small"
                    label=${ot("Close")}
                    @click=${()=>i(this,re).call(this,"btn-close")}
                  >
                    <gds-icon-cross-large
                      size="m"
                      stroke="2"
                    ></gds-icon-cross-large>
                  </gds-button>
                </gds-flex>
                <gds-div
                  id="content"
                  flex="1"
                  overflow=${L(this.scrollable)?"auto":$}
                >
                  <slot></slot>
                </gds-div>
                <gds-flex
                  class="footer"
                  justify-content="center"
                  gap="s"
                  padding="s 0 0 0"
                  flex-wrap="wrap"
                >
                  <slot name="footer">
                    <gds-button
                      value="cancel"
                      @click=${()=>i(this,re).call(this,"btn-cancel")}
                      rank="secondary"
                      >${ot("Cancel")}</gds-button
                    >
                    <gds-button
                      value="ok"
                      @click=${()=>i(this,re).call(this,"btn-ok")}
                    >
                      Ok
                    </gds-button>
                  </slot>
                </gds-flex>
              </slot>
            </gds-card>
          </dialog>`)}`}_handleOpenChange(){this.open?(G(this,Wt,void 0),this.updateComplete.then(()=>{this._elDialog?.showModal(),Zn(this),this.removeEventListener("click",i(this,Xe)),requestAnimationFrame(()=>this.addEventListener("click",i(this,Xe))),this.closedby==="none"&&this._elDialog?.addEventListener("keydown",i(this,zr)),Co&&this._elDialog?.focus()})):(G(this,Wt,i(this,Wt)||"prop-change"),this._elDialog?.removeEventListener("keydown",i(this,zr)),this._elDialog?.close(),Ts(this),document.removeEventListener("click",i(this,Xe)),this.requestUpdate("open"))}};Wt=new WeakMap;He=new WeakMap;Ft=new WeakMap;re=new WeakMap;Ms=new WeakMap;As=new WeakMap;zr=new WeakMap;zs=new WeakMap;qe=new WeakMap;Br=new WeakMap;Gr=new WeakMap;Bs=new WeakSet;Yn=function(){if(this._elTriggerSlot&&this._elTriggerSlot.assignedElements()[0]){let e=this._elTriggerSlot.assignedElements()[0];e?.addEventListener("click",i(this,Gs)),e?.setAttribute("aria-haspopup","dialog")}};Gs=new WeakMap;Xe=new WeakMap;at.styles=[qn];at.styleExpressionBaseSelector="dialog";o([d({type:Boolean,reflect:!0})],at.prototype,"open",2);o([d()],at.prototype,"heading",2);o([d()],at.prototype,"variant",2);o([d()],at.prototype,"placement",2);o([d({type:Boolean})],at.prototype,"scrollable",2);o([d({reflect:!0})],at.prototype,"closedby",2);o([D("dialog")],at.prototype,"_elDialog",2);o([D('slot[name="trigger"]')],at.prototype,"_elTriggerSlot",2);o([N("open")],at.prototype,"_handleOpenChange",1);at=o([x("gds-dialog",{dependsOn:[gt,$t,C,_t,At]}),tt()],at);at.define();var Xa=v`
  /* Host configuration with core variables */
  :host {
    /* Size variables with indexed access using CSS custom properties */
    --spinner-sizes: 2rem 3.75rem 6rem;
    --spinner-size-sm: 2rem;
    --spinner-size-md: 3.75rem;
    --spinner-size-lg: 6rem;

    --track-widths: 0.1rem 0.2rem 0.3rem;
    --track-width-sm: 0.275rem;
    --track-width-md: 0.375rem;
    --track-width-lg: 0.375rem;

    /* Default to light mode as fallback */
    --spinner-track-color: var(--gds-sys-color-l3-neutral-02);
    --spinner-active-color: var(--gds-sys-color-content-neutral-02);
    --spinner-label-color: currentColor;
    --spinner-backdrop-color: rgba(100, 100, 100, 0.4);

    --spinner-backdrop-blur: 2px;

    /* Base sizing, will be overridden by size-specific variables */
    --size: var(--spinner-size-md);
    --track-width: var(--track-width-md);

    /* Use CSS variable for color-scheme to avoid minification issues */
    --spinner-color-scheme: light dark;
    color-scheme: var(--spinner-color-scheme);

    display: block;
  }

  /* Size-specific host settings */
  :host([size='sm']) {
    --size: var(--spinner-size-sm);
    --track-width: var(--track-width-sm);
  }

  :host([size='md']),
  :host([size='default']) {
    --size: var(--spinner-size-md);
    --track-width: var(--track-width-md);
  }

  :host([size='lg']) {
    --size: var(--spinner-size-lg);
    --track-width: var(--track-width-lg);
  }

  /* Fullscreen positioning */
  :host([fullscreen]) {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }

  /* Focus styles */
  :host(:focus-visible) {
    outline: 2px solid var(--spinner-active-color);
    outline-offset: 2px;
  }

  /* Spinner component */
  .spinner {
    border-radius: 50%;
    border: var(--track-width, 0.375rem) solid var(--spinner-track-color);
    border-top-color: var(--spinner-active-color);
    height: var(--size, 3.75rem);
    width: var(--size, 3.75rem);
    animation: gdsSpinnerRotation 1s linear infinite;
    aspect-ratio: 1 / 1;
  }

  /* Motion preference adjustments */
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      /* Slower rotation for reduced motion preference */
      animation-duration: 2s;
      /* Smaller rotation to reduce visual intensity */
      animation-name: gdsSpinnerReducedRotation;
    }

    @keyframes gdsSpinnerReducedRotation {
      to {
        transform: rotate(180deg);
      }
    }
  }

  /* Layout components */
  .spinner-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .spinner-wrapper.spinner-cover {
    position: absolute;
    inset: 0;
    z-index: 999;
  }

  .spinner-wrapper.spinner-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
  }

  .spinner-wrapper.spinner-backdrop {
    background-color: var(--spinner-backdrop-color);
    backdrop-filter: blur(var(--spinner-backdrop-blur));
  }

  .spinner-wrapper.spinner-label-top {
    flex-direction: column-reverse;

    & .spinner-label {
      margin: 0 0 1rem;
    }
  }

  .spinner-wrapper.spinner-label-left {
    flex-direction: row-reverse;
    & .spinner-label {
      margin: 0 1rem 0 0;
    }
  }

  .spinner-wrapper.spinner-label-right {
    flex-direction: row;
    & .spinner-label {
      margin: 0 0 0 1rem;
    }
  }

  /* Label styling */
  .spinner-label {
    margin-top: 1rem;
    color: var(--spinner-label-color);
    text-align: center;
  }

  /* Animation keyframes */
  @keyframes gdsSpinnerRotation {
    to {
      transform: rotate(360deg);
    }
  }
`,Jn=Xa;var Ls,Ps,Qn,lt=class extends j(br(H(M))){constructor(){super(...arguments),h(this,Ps),h(this,Ls,v`
    html {
      overflow: hidden !important;
      overscroll-behavior: none !important;
    }
  `),this.label=ot("Loading..."),this.labelPosition="bottom",this.showLabel=!1,this.cover=!1,this.fullscreen=!1,this.size="md",this._isAnimating=!1}connectedCallback(){super.connectedCallback(),this.setAttribute("role","status"),this.setAttribute("aria-live","polite"),this._isAnimating=!0,this.dispatchCustomEvent("gds-spinner-connected")}disconnectedCallback(){super.disconnectedCallback(),this.fullscreen&&(this.fullscreen=!1,this._toggleRootStyles()),this._isAnimating=!1}_updateAriaLabel(){this.setAttribute("aria-label",this.label)}render(){return g`
      <div part="wrapper" class=${nt(b(this,Ps,Qn).call(this))}>
        <span part="spinner" class="spinner"></span>
        ${J(this.showLabel,()=>g`<span part="label" class="spinner-label">${this.label}</span>`)}
      </div>
    `}_toggleRootStyles(){let e=Se.instance,t=`gds-spinner-fullscreen-${this.id||"default"}`;this.fullscreen?e.injectGlobalStyles(t,i(this,Ls)):e.clearGlobalStyles(t)}};Ls=new WeakMap;Ps=new WeakSet;Qn=function(){return{"spinner-wrapper":!0,"spinner-fullscreen":this.fullscreen,"spinner-cover":this.cover,"spinner-backdrop":this.cover||this.fullscreen,"spinner-animating":this._isAnimating,[`spinner-label-${this.labelPosition}`]:this.labelPosition}};lt.styles=[z,Jn];o([d({type:String})],lt.prototype,"label",2);o([d({type:String,reflect:!0,attribute:"label-position"})],lt.prototype,"labelPosition",2);o([d({type:Boolean,reflect:!0})],lt.prototype,"showLabel",2);o([d({type:Boolean,reflect:!0})],lt.prototype,"cover",2);o([d({type:Boolean,reflect:!0})],lt.prototype,"fullscreen",2);o([d({type:String,reflect:!0})],lt.prototype,"size",2);o([rt()],lt.prototype,"_isAnimating",2);o([N("label")],lt.prototype,"_updateAriaLabel",1);o([N("fullscreen")],lt.prototype,"_toggleRootStyles",1);lt=o([x("gds-spinner"),tt()],lt);lt.define();_t.define();var Za=v`
  :host {
    --_c: 12;
    --_grid-col: repeat(var(--_c), 1fr);
    width: 100%;
    display: grid;
    grid-template-columns: var(--_grid-col);
    grid-column-gap: var(--_gap-column, 0px);
    grid-row-gap: var(--_gap-row, 0px);
    box-sizing: border-box;
  }

  :host([auto-columns]) {
    --_col-count: var(--_c, 0);
    --_gap-count: calc(var(--_col-count) - 1);
    --_total-gap-width: calc(var(--_gap-count) * var(--_gap-column, 0px));
    --_col-width-max: calc(
      (100% - var(--_total-gap-width)) / var(--_col-count)
    );
    grid-template-columns: repeat(
      auto-fill,
      minmax(max(var(--_col-width), var(--_col-width-max)), 1fr)
    );
  }
`,Kn=Za;var se=class extends C{render(){return g`<slot></slot>`}};se.styles=[z,Kn];o([m({property:"--_c"})],se.prototype,"columns",2);o([m({...Vt,styleTemplate:(e,t)=>{let r=t[0];return`--_gap-column: ${t[1]||r}; --_gap-row: ${r};`}})],se.prototype,"gap",2);o([m({reflect:!0,property:"--_col-width",valueTemplate:e=>`${isNaN(e)?e:`${e}px`}`})],se.prototype,"auto-columns",2);se=o([x("gds-grid")],se);se.define();C.define();var Ya=v`
  :host {
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--_size);
  }

  hr {
    width: 100%;
    height: 1px;
    min-height: 1px;
    max-height: 1px;
    border: 0;
    margin: 0;
    padding: 0;
    background: var(--_color, currentColor);
    box-sizing: border-box;
  }
`,ti=Ya;var Ut=class extends I(M){constructor(){super(...arguments),this.role=null}render(){return g`<hr role=${this.role||$} />`}};Ut.styles=[z,ti];o([m({...wt("border"),property:"--_color"})],Ut.prototype,"color",2);o([m({property:"--_size",valueTemplate:e=>`var(--gds-sys-space-${e})`})],Ut.prototype,"size",2);o([m()],Ut.prototype,"opacity",2);o([d()],Ut.prototype,"role",2);Ut=o([x("gds-divider")],Ut);Ut.define();var ei=v`
  @layer defaults {
    a:link {
      color: currentColor;
      text-underline-offset: 0.1lh;
      font-weight: var(--gds-sys-text-weight-book);
    }

    a:visited {
      color: currentColor;
    }

    h1 {
      font: var(--gds-sys-text-heading-xl);
    }

    h2 {
      font: var(--gds-sys-text-heading-l);
    }

    h3 {
      font: var(--gds-sys-text-heading-m);
    }

    h4 {
      font: var(--gds-sys-text-heading-s);
    }

    h5 {
      font: var(--gds-sys-text-heading-xs);
    }

    h6 {
      font: var(--gds-sys-text-heading-2xs);
    }

    p,
    li {
      font: var(--gds-sys-text-body-regular-m);
    }

    strong {
      font-weight: var(--gds-sys-text-weight-medium);
    }
  }
`;var Ja=v`
  :host {
    display: block;
  }

  [tag] {
    margin: 0;
    padding: 0;
    text-underline-offset: 0.2lh;
  }
`,ri=Ja;var pt=class extends C{constructor(){super(...arguments),this.tag="span"}render(){let e=Wo(encodeURI(this.tag));return Qt`<${e} tag><slot></slot></${e}>`}};pt.styles=[z,ei,ri];o([d({type:String})],pt.prototype,"tag",2);o([m({selector:"[tag]",styleTemplate:(e,t)=>`font: var(--gds-sys-text-${t[0]});`})],pt.prototype,"font",2);o([m({selector:"[tag]",valueTemplate:e=>`var(--gds-sys-text-weight-${e})`})],pt.prototype,"font-weight",2);o([m()],pt.prototype,"text-transform",2);o([m({selector:"[tag]"})],pt.prototype,"text-decoration",2);o([m({selector:"[tag]",styleTemplate:(e,t)=>`overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: ${t[0]};
      -webkit-box-orient: vertical;`})],pt.prototype,"lines",2);pt=o([x("gds-text")],pt);pt.define();var Qa=v`
  :host {
    display: inline-block;
  }

  [part='signal'] {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 6px;
    height: 6px;
    border-radius: var(--gds-sys-radius-max);
    background-color: currentColor;
    transition: all 0.4s;

    &::before {
      display: flex;
      position: absolute;
      content: '';
      inset: -4px;
      border-radius: inherit;
      background-color: color-mix(in srgb, currentColor, transparent 80%);
      animation: signal 3s ease-in-out infinite;
    }
  }

  @keyframes signal {
    0% {
      transform: scale(2);
      opacity: 0;
    }
    60% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(3);
      opacity: 0;
    }
  }
`,si=Qa;var Ae=class extends M{render(){return Qt`<div part="signal"></div>`}};Ae.styles=[z,si];o([m({...wt("content"),selector:'[part="signal"]'})],Ae.prototype,"color",2);Ae=o([x("gds-signal")],Ae);Ae.define();var vt=class extends W{};vt._regularSVG='<path d="M15 20L7 12L15 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';vt._solidSVG='<path fill-rule="evenodd" clip-rule="evenodd" d="M15.5303 3.46967C15.8232 3.76256 15.8232 4.23744 15.5303 4.53033L8.06066 12L15.5303 19.4697C15.8232 19.7626 15.8232 20.2374 15.5303 20.5303C15.2374 20.8232 14.7626 20.8232 14.4697 20.5303L6.46967 12.5303C6.32902 12.3897 6.25 12.1989 6.25 12C6.25 11.8011 6.32902 11.6103 6.46967 11.4697L14.4697 3.46967C14.7626 3.17678 15.2374 3.17678 15.5303 3.46967Z" fill="currentColor"/>';vt._name="chevron-left";vt._width=24;vt._height=24;vt._viewBox="0 0 24 24";vt=o([x("gds-icon-chevron-left")],vt);var Ka=v`
  @layer base, reset, transitional-styles;
  @layer base {
    :host {
      container-type: inline-size;
      --_gap: var(--gds-sys-space-s);
    }

    nav {
      display: flex;
      align-items: center;
      width: max-content;
      gap: var(--_gap);
      font: var(--gds-sys-text-detail-book-m);
    }

    .size-small {
      font: var(--gds-sys-text-detail-book-s);
      --_gap: var(--gds-sys-space-xs);
    }

    .size-small .list {
      --_gap: var(--gds-sys-space-xs);
    }

    .list {
      display: flex;
      align-items: center;
      gap: var(--_gap);
      list-style: none;
      margin-block-start: 0;
      margin-block-end: 0;
      padding-inline-start: 0;
      height: max-content;
      font-weight: inherit;
      font-size: inherit;
      line-height: inherit;
    }

    ::slotted(*:not(:last-child))::after {
      content: '/';
      display: block;
    }

    ::slotted(*:not([gds-element='gds-breadcrumb'])) {
      display: contents;
    }

    .mobile-return {
      display: none;
      align-items: center;
      justify-content: center;
    }

    @container (max-width: 400px) {
      .mobile-return {
        display: flex;
      }

      ::slotted(*[return])::after {
        display: none;
      }
    }
  }
`,oi=Ka;var fe=class extends H(I(j(M))){constructor(){super(...arguments),this.size="large",this.label=ot("Breadcrumbs")}get breadcrumbItems(){return Array.from(this.querySelectorAll("[gds-element=gds-breadcrumb]"))}handleSlotChange(){let e=this.breadcrumbItems;e.forEach((t,r)=>{r===e.length-2?t.setAttribute("return",""):t.removeAttribute("return")})}render(){return g`
      <nav
        role="navigation"
        aria-label=${this.label}
        class=${nt({"size-small":this.size==="small"})}
      >
        <div class="mobile-return">
          <gds-icon-chevron-left></gds-icon-chevron-left>
        </div>
        <div role="list" class="list">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </nav>
    `}};fe.styles=[z,oi];o([d({type:String})],fe.prototype,"size",2);o([d({type:String})],fe.prototype,"label",2);fe=o([x("gds-breadcrumbs",{dependsOn:[vt]}),tt()],fe);fe.define();function ni(e){var t;class r extends e{constructor(){super(...arguments),h(this,t)}get rel(){return i(this,t)?i(this,t):this.target==="_blank"?"noreferrer noopener":void 0}set rel(n){G(this,t,n)}}return t=new WeakMap,o([d()],r.prototype,"href",2),o([d()],r.prototype,"target",2),o([d()],r.prototype,"rel",1),o([d({type:String})],r.prototype,"download",2),o([d()],r.prototype,"ping",2),r}var tl=v`
  @layer core, link;

  @layer core {
    :host {
      display: inline-block;
      white-space: normal;
    }
  }

  @layer link {
    a {
      display: flex;
      align-items: center;
      gap: 1ch;
      text-decoration: none;
      text-underline-offset: 0.2lh;
      color: currentColor;
      cursor: pointer;
      border-radius: var(--gds-sys-radius-3xs);
      outline-offset: var(--gds-sys-space-3xs);
      outline-color: currentColor;
      font-weight: var(--gds-sys-text-weight-book);
      will-change: text-underline-offset;
      transition-property: text-underline-offset;
      transition-duration: var(--gds-sys-motion-duration-fastest);
      transition-timing-function: var(--gds-sys-motion-easing-ease-in-out);

      @media (pointer: fine) {
        &:hover {
          text-decoration: underline;
          text-underline-offset: 0.16lh;

          &:active {
            text-underline-offset: 0.08lh;
          }
        }
      }
    }
  }
`,ii=tl;var Os,ai,oe=class extends j(I(H(ni(M)))){constructor(){super(...arguments),h(this,Os),this.label=""}connectedCallback(){super.connectedCallback(),this.setAttribute("role","none")}render(){return Qt`
      <a
        href=${L(this.href)}
        target=${L(this.target)}
        rel=${L(this.rel||i(this,Os,ai))}
        download=${L(this.download)}
        ping=${L(this.ping)}
        aria-label=${this.label||$}
      >
        <slot name="lead"></slot>
        <slot></slot>
        <slot name="trail"></slot>
      </a>
    `}};Os=new WeakSet;ai=function(){return this.target==="_blank"?"noreferrer noopener":void 0};oe.styles=[z,F(ii)];oe.shadowRootOptions={mode:"open",delegatesFocus:!0};o([d()],oe.prototype,"label",2);o([m({valueTemplate:e=>e,selector:"a"})],oe.prototype,"text-decoration",2);oe=o([x("gds-link")],oe);var el=v`
  @layer base {
    :host {
      display: contents;
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: center;
      list-style: none;
      margin: unset;
      padding: unset;
      height: max-content;
      font-weight: inherit;
      font-size: inherit;
      line-height: inherit;
      gap: var(--_gap);
    }

    @container (max-width: 400px) {
      :host(:not([return])) {
        display: none;
      }

      :host([return]) {
        display: contents;
      }
    }
  }
`,li=el;var ne,di,ci,pi,hi,ui,mi,zt=class extends M{constructor(){super(...arguments),h(this,ne),this.href="",this.label="",this.overflow=!1}render(){return g`
      <div role="listitem" class="list-item">${b(this,ne,ci).call(this)}</div>
    `}};ne=new WeakSet;di=function(){return this.target==="_blank"?"noreferrer noopener":void 0};ci=function(){return[b(this,ne,pi).call(this)].map(t=>g`${t}`)};pi=function(){return this.overflow?b(this,ne,hi).call(this):this.href?b(this,ne,ui).call(this):b(this,ne,mi).call(this)};hi=function(){return g`<slot></slot>`};ui=function(){return g`
      <gds-link
        href=${L(this.href)}
        target=${L(this.target)}
        rel=${L(this.rel||i(this,ne,di))}
        aria-label=${this.label||$}
      >
        <slot name="lead"></slot>
        <slot></slot>
        <slot name="trail"></slot>
      </gds-link>
    `};mi=function(){return g`
      <gds-text
        color="neutral-02"
        font-weight="regular"
        aria-current=${L(this.href?void 0:"page")}
      >
        <slot></slot>
      </gds-text>
    `};zt.styles=[li];o([d()],zt.prototype,"href",2);o([d()],zt.prototype,"target",2);o([d()],zt.prototype,"rel",2);o([d()],zt.prototype,"label",2);o([d({type:Boolean,reflect:!0})],zt.prototype,"overflow",2);zt=o([x("gds-breadcrumb",{dependsOn:[oe,pt]})],zt);zt.define();var Bt=class extends W{};Bt._regularSVG='<path d="M9 4L17 12L9 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';Bt._solidSVG='<path fill-rule="evenodd" clip-rule="evenodd" d="M8.46967 3.46967C8.76256 3.17678 9.23744 3.17678 9.53033 3.46967L17.5303 11.4697C17.671 11.6103 17.75 11.8011 17.75 12C17.75 12.1989 17.671 12.3897 17.5303 12.5303L9.53033 20.5303C9.23744 20.8232 8.76256 20.8232 8.46967 20.5303C8.17678 20.2374 8.17678 19.7626 8.46967 19.4697L15.9393 12L8.46967 4.53033C8.17678 4.23744 8.17678 3.76256 8.46967 3.46967Z" fill="currentColor"/>';Bt._name="chevron-right";Bt._width=24;Bt._height=24;Bt._viewBox="0 0 24 24";Bt=o([x("gds-icon-chevron-right")],Bt);var rl=v`
  @layer base {
    :host {
      display: flex;
      z-index: 1;
    }

    button {
      appearance: none;
      background: transparent;
      border-radius: var(--gds-sys-radius-max);
      border-width: 0;
      color: var(--gds-sys-color-content-neutral-02);
      cursor: pointer;
      flex-grow: 1;
      flex-shrink: 0;
      font-family: inherit;
      font-size: inherit;
      font: var(--gds-sys-text-detail-book-m);
      overflow: hidden;
      padding: 0 1rem;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
      transition:
        background-color var(--gds-sys-motion-duration-fast),
        border-color var(--gds-sys-motion-duration-fast),
        color var(--gds-sys-motion-duration-fast);
      outline-width: var(--gds-sys-space-4xs);
      outline-style: solid;
      outline-offset: -2px;
      outline-color: transparent;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }

    :host([selected]) button {
      color: var(--gds-sys-color-content-neutral-01);
    }

    @media (pointer: fine) {
      :host(:not([selected])) button:hover {
        background-color: color-mix(
          in srgb,
          transparent,
          var(--gds-sys-color-state-neutral-05)
        );

        &:disabled {
          background-color: transparent;
        }
      }
    }

    button:focus-visible {
      outline-color: color-mix(
        in srgb,
        transparent,
        var(--gds-sys-color-l3-content-tertiary) 100%
      );
    }
  }
`,gi=rl;var Gt=class extends I(M){constructor(){super(...arguments),this.selected=!1,this.disabled=!1,this._isVisible=!0}get isVisible(){return this._isVisible}connectedCallback(){super.connectedCallback(),U.instance.apply(this,"gds-segmented"),this.setAttribute("role","listitem")}render(){return g`<button
      aria-current=${String(this.selected)}
      ?disabled="${this.disabled}"
    >
      <slot></slot>
    </button>`}};Gt.styles=[...z,gi];o([d({type:Boolean,reflect:!0})],Gt.prototype,"selected",2);o([d()],Gt.prototype,"value",2);o([d({type:Boolean,reflect:!0})],Gt.prototype,"disabled",2);Gt=o([x("gds-segment")],Gt);var sl=v`
  @layer base {
    :host {
      background-color: var(--gds-sys-color-l3-neutral-02);
      border: 0.25rem solid transparent;
      border-radius: var(--gds-sys-radius-max);
      box-sizing: border-box;
      contain: layout;
      display: inline-flex;
      height: 3rem;
      width: 100%;
      position: relative;
      overflow: hidden;
      --_gds-segment-scroll-margin-inline: 2.75rem;
    }

    :host([size='small']) {
      height: 2.5rem;
      --_gds-segment-scroll-margin-inline: 2.25rem;
    }

    #track {
      box-sizing: border-box;
      display: flex;
      flex-grow: 1;
      scroll-snap-type: inline mandatory;
      scroll-padding-inline: var(--_gds-segment-scroll-margin-inline);
      overscroll-behavior-x: contain;
      scroll-behavior: smooth;
      overflow-x: scroll;
      gap: 0.25rem;
      position: relative;
      scrollbar-width: none;
    }

    #track::-webkit-scrollbar {
      display: none;
    }

    #btn-prev,
    #btn-next {
      box-sizing: border-box;
      align-items: center;
      appearance: none;
      aspect-ratio: 1;
      border-radius: var(--gds-sys-radius-max);
      border-width: 0;
      background-color: var(--gds-sys-color-l3-neutral-02);
      color: var(--gds-sys-color-content-neutral-01);
      cursor: pointer;
      display: flex;
      font-size: 1rem;
      height: 100%;
      justify-content: center;
      width: 2.5rem;
      transition: 0.2s;
      z-index: 2;
      position: absolute;

      @media (pointer: fine) {
        &:hover {
          background-color: color-mix(
            in srgb,
            var(--gds-sys-color-l3-neutral-02),
            var(--gds-sys-color-state-neutral-03)
          );
        }
      }
    }
    #btn-prev {
      margin: 0 0.25rem 0 0;
    }
    #btn-next {
      margin: 0 0 0 0.25rem;
      right: 0;
    }

    #btn-prev[aria-hidden='true'],
    #btn-next[aria-hidden='true'] {
      opacity: 0;
      width: 0;
      margin: 0;
      padding: 0;
    }

    :host([size='small']) #btn-prev,
    :host([size='small']) #btn-next {
      width: 2rem;
    }

    ::slotted(*) {
      flex-grow: 1;
      flex-shrink: 0;
      z-index: 1;
      scroll-margin-inline: var(--_gds-segment-scroll-margin-inline);
      scroll-snap-align: start;
    }

    #indicator {
      background-color: var(--gds-sys-color-l3-neutral-04);
      border-radius: var(--gds-sys-radius-max);
      height: 100%;
      left: 0;
      position: absolute;
      z-index: 0;
      transition:
        transform 0.2s,
        width 0.2s;
      z-index: 0;
    }
  }
`,fi=sl;var ie,Rs,yi,Ds,Ns,Vs,Ze,Lr,Is,Ws,ol=(e,t)=>{let r;return()=>{clearTimeout(r),r=setTimeout(e,t)}},ht=class extends H(I(j(M))){constructor(){super(...arguments),h(this,Rs),this.size="medium",h(this,ie),this._showPrevButton=!1,this._showNextButton=!1,this.intersectionObserver=null,h(this,Ds,()=>{let e=this.segments.filter((t,r,s)=>s[r+1]?.isVisible&&!t.isVisible)[0];e&&(this._elTrack.scrollLeft-=e.offsetWidth)}),h(this,Ns,()=>{let e=this.segments.filter((t,r,s)=>s[r-1]?.isVisible&&!t.isVisible).reverse()[0];e&&(this._elTrack.scrollLeft+=e.offsetWidth)}),h(this,Vs,()=>{this.segments.every(e=>!e.isVisible)||(this._showPrevButton=!this.segments[0].isVisible,this._showNextButton=!this.segments[this.segments.length-1].isVisible)}),h(this,Ze,ol(i(this,Vs),50)),h(this,Lr,()=>{let e=this.segments.find(t=>t.selected);if(e){let t=e.offsetWidth,r=e.offsetLeft;this._elIndicator.style.transform=`translateX(${r}px)`,this._elIndicator.style.width=`${t}px`}else this._elIndicator.style.transform="translateX(-100%)",this._elIndicator.style.width="0px"}),h(this,Is,e=>{let t=this.segments.find(r=>r===e.target||r.contains(e.target));t&&(this.segments.forEach(r=>r.selected=!1),t.selected=!0,G(this,ie,t.value),i(this,Lr).call(this),this.dispatchCustomEvent("change",{detail:{segment:t},bubbles:!0,composed:!0}))}),h(this,Ws,()=>{i(this,ie)&&this.updateComplete.then(()=>{let e=this.segments.find(t=>t.value===i(this,ie));e&&(this.segments.forEach(t=>t.selected=!1),e.selected=!0,e.scrollIntoView({block:"nearest",inline:"nearest"}))})})}get value(){return i(this,ie)}set value(e){G(this,ie,e),i(this,Ws).call(this)}get segments(){return this._elSlot?this._elSlot.assignedElements():[]}connectedCallback(){super.connectedCallback(),U.instance.apply(this,"gds-segmented-control"),this.updateComplete.then(()=>{this._elTrack.addEventListener("scroll",()=>{i(this,Ze).call(this)})})}render(){return g`<button
        aria-hidden=${!this._showPrevButton}
        ?inert=${!this._showPrevButton}
        id="btn-prev"
        @click=${i(this,Ds)}
        aria-label=${ot("Scroll right")}
      >
        <gds-icon-chevron-left />
      </button>
      <div id="track" role="list">
        <slot
          @click=${i(this,Is)}
          @slotchange=${b(this,Rs,yi)}
          role="none"
        ></slot>
        <div id="indicator" role="none"></div>
      </div>
      <button
        aria-hidden=${!this._showNextButton}
        ?inert=${!this._showNextButton}
        id="btn-next"
        @click=${i(this,Ns)}
        aria-label=${ot("Scroll right")}
      >
        <gds-icon-chevron-right />
      </button>`}_recalculateMinWidth(){this.updateComplete.then(()=>{i(this,Ze).call(this),i(this,Lr).call(this)})}};ie=new WeakMap;Rs=new WeakSet;yi=function(){let e=this.segments.find(t=>t.selected)?.value;e&&G(this,ie,e),this.intersectionObserver?.disconnect(),this.intersectionObserver=new IntersectionObserver(t=>{t.forEach(r=>{let s=r.target;s._isVisible=r.intersectionRatio>.99,i(this,Ze).call(this)})},{root:this._elTrack,threshold:[0,.01,.5,.99,1]}),this.segments.forEach(t=>{this.intersectionObserver?.observe(t)})};Ds=new WeakMap;Ns=new WeakMap;Vs=new WeakMap;Ze=new WeakMap;Lr=new WeakMap;Is=new WeakMap;Ws=new WeakMap;ht.styles=[z,fi];o([d({reflect:!0})],ht.prototype,"size",2);o([d()],ht.prototype,"value",1);o([D("slot")],ht.prototype,"_elSlot",2);o([D("#indicator")],ht.prototype,"_elIndicator",2);o([D("#track")],ht.prototype,"_elTrack",2);o([rt()],ht.prototype,"_showPrevButton",2);o([rt()],ht.prototype,"_showNextButton",2);o([wr(),N("value")],ht.prototype,"_recalculateMinWidth",1);ht=o([x("gds-segmented-control",{dependsOn:[Gt,vt,Bt]}),tt()],ht);ht.define();Gt.define();No();we();Lo();Hn();Ro();pr();console.log("[BTR] SEB Green Design System initialised");})();
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
lit-html/directives/unsafe-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
lit-html/directives/when.js:
@lit/localize/internal/locale-status-event.js:
@lit/localize/internal/str-tag.js:
@lit/localize/internal/types.js:
@lit/localize/internal/default-msg.js:
@lit/localize/internal/localized-controller.js:
@lit/localize/internal/localized-decorator.js:
@lit/localize/internal/runtime-msg.js:
@lit/localize/init/runtime.js:
@lit/localize/init/transform.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

reflect-metadata/Reflect.js:
  (*! *****************************************************************************
  Copyright (C) Microsoft. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** *)

lit-html/directives/class-map.js:
lit-html/directives/if-defined.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/static.js:
@lit/localize/internal/deferred.js:
@lit/localize/internal/id-generation.js:
@lit/localize/lit-localize.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/localize/internal/fnv1a64.js:
  (**
   * @license
   * Copyright 2014 Travis Webb
   * SPDX-License-Identifier: MIT
   *)
*/
