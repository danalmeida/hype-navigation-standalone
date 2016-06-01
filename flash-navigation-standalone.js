/*  SWFObject v2.3.20130521 <http://github.com/swfobject/swfobject>
    is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){var D="undefined",r="object",T="Shockwave Flash",Z="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",S="SWFObjectExprInst",x="onreadystatechange",Q=window,h=document,t=navigator,V=false,X=[],o=[],P=[],K=[],I,p,E,B,L=false,a=false,m,G,j=true,l=false,O=function(){var ad=typeof h.getElementById!=D&&typeof h.getElementsByTagName!=D&&typeof h.createElement!=D,ak=t.userAgent.toLowerCase(),ab=t.platform.toLowerCase(),ah=ab?/win/.test(ab):/win/.test(ak),af=ab?/mac/.test(ab):/mac/.test(ak),ai=/webkit/.test(ak)?parseFloat(ak.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,aa=t.appName==="Microsoft Internet Explorer",aj=[0,0,0],ae=null;if(typeof t.plugins!=D&&typeof t.plugins[T]==r){ae=t.plugins[T].description;if(ae&&(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&t.mimeTypes[q].enabledPlugin)){V=true;aa=false;ae=ae.replace(/^.*\s+(\S+\s+\S+$)/,"$1");aj[0]=n(ae.replace(/^(.*)\..*$/,"$1"));aj[1]=n(ae.replace(/^.*\.(.*)\s.*$/,"$1"));aj[2]=/[a-zA-Z]/.test(ae)?n(ae.replace(/^.*[a-zA-Z]+(.*)$/,"$1")):0}}else{if(typeof Q.ActiveXObject!=D){try{var ag=new ActiveXObject(Z);if(ag){ae=ag.GetVariable("$version");if(ae){aa=true;ae=ae.split(" ")[1].split(",");aj=[n(ae[0]),n(ae[1]),n(ae[2])]}}}catch(ac){}}}return{w3:ad,pv:aj,wk:ai,ie:aa,win:ah,mac:af}}(),i=function(){if(!O.w3){return}if((typeof h.readyState!=D&&(h.readyState==="complete"||h.readyState==="interactive"))||(typeof h.readyState==D&&(h.getElementsByTagName("body")[0]||h.body))){f()}if(!L){if(typeof h.addEventListener!=D){h.addEventListener("DOMContentLoaded",f,false)}if(O.ie){h.attachEvent(x,function aa(){if(h.readyState=="complete"){h.detachEvent(x,aa);f()}});if(Q==top){(function ac(){if(L){return}try{h.documentElement.doScroll("left")}catch(ad){setTimeout(ac,0);return}f()}())}}if(O.wk){(function ab(){if(L){return}if(!/loaded|complete/.test(h.readyState)){setTimeout(ab,0);return}f()}())}}}();function f(){if(L||!document.getElementsByTagName("body")[0]){return}try{var ac,ad=C("span");ad.style.display="none";ac=h.getElementsByTagName("body")[0].appendChild(ad);ac.parentNode.removeChild(ac);ac=null;ad=null}catch(ae){return}L=true;var aa=X.length;for(var ab=0;ab<aa;ab++){X[ab]()}}function M(aa){if(L){aa()}else{X[X.length]=aa}}function s(ab){if(typeof Q.addEventListener!=D){Q.addEventListener("load",ab,false)}else{if(typeof h.addEventListener!=D){h.addEventListener("load",ab,false)}else{if(typeof Q.attachEvent!=D){g(Q,"onload",ab)}else{if(typeof Q.onload=="function"){var aa=Q.onload;Q.onload=function(){aa();ab()}}else{Q.onload=ab}}}}}function Y(){var aa=h.getElementsByTagName("body")[0];var ae=C(r);ae.setAttribute("style","visibility: hidden;");ae.setAttribute("type",q);var ad=aa.appendChild(ae);if(ad){var ac=0;(function ab(){if(typeof ad.GetVariable!=D){try{var ag=ad.GetVariable("$version");if(ag){ag=ag.split(" ")[1].split(",");O.pv=[n(ag[0]),n(ag[1]),n(ag[2])]}}catch(af){O.pv=[8,0,0]}}else{if(ac<10){ac++;setTimeout(ab,10);return}}aa.removeChild(ae);ad=null;H()}())}else{H()}}function H(){var aj=o.length;if(aj>0){for(var ai=0;ai<aj;ai++){var ab=o[ai].id;var ae=o[ai].callbackFn;var ad={success:false,id:ab};if(O.pv[0]>0){var ah=c(ab);if(ah){if(F(o[ai].swfVersion)&&!(O.wk&&O.wk<312)){w(ab,true);if(ae){ad.success=true;ad.ref=z(ab);ad.id=ab;ae(ad)}}else{if(o[ai].expressInstall&&A()){var al={};al.data=o[ai].expressInstall;al.width=ah.getAttribute("width")||"0";al.height=ah.getAttribute("height")||"0";if(ah.getAttribute("class")){al.styleclass=ah.getAttribute("class")}if(ah.getAttribute("align")){al.align=ah.getAttribute("align")}var ak={};var aa=ah.getElementsByTagName("param");var af=aa.length;for(var ag=0;ag<af;ag++){if(aa[ag].getAttribute("name").toLowerCase()!="movie"){ak[aa[ag].getAttribute("name")]=aa[ag].getAttribute("value")}}R(al,ak,ab,ae)}else{b(ah);if(ae){ae(ad)}}}}}else{w(ab,true);if(ae){var ac=z(ab);if(ac&&typeof ac.SetVariable!=D){ad.success=true;ad.ref=ac;ad.id=ac.id}ae(ad)}}}}}X[0]=function(){if(V){Y()}else{H()}};function z(ac){var aa=null,ab=c(ac);if(ab&&ab.nodeName.toUpperCase()==="OBJECT"){if(typeof ab.SetVariable!==D){aa=ab}else{aa=ab.getElementsByTagName(r)[0]||ab}}return aa}function A(){return !a&&F("6.0.65")&&(O.win||O.mac)&&!(O.wk&&O.wk<312)}function R(ad,ae,aa,ac){var ah=c(aa);aa=W(aa);a=true;E=ac||null;B={success:false,id:aa};if(ah){if(ah.nodeName.toUpperCase()=="OBJECT"){I=J(ah);p=null}else{I=ah;p=aa}ad.id=S;if(typeof ad.width==D||(!/%$/.test(ad.width)&&n(ad.width)<310)){ad.width="310"}if(typeof ad.height==D||(!/%$/.test(ad.height)&&n(ad.height)<137)){ad.height="137"}var ag=O.ie?"ActiveX":"PlugIn",af="MMredirectURL="+encodeURIComponent(Q.location.toString().replace(/&/g,"%26"))+"&MMplayerType="+ag+"&MMdoctitle="+encodeURIComponent(h.title.slice(0,47)+" - Flash Player Installation");if(typeof ae.flashvars!=D){ae.flashvars+="&"+af}else{ae.flashvars=af}if(O.ie&&ah.readyState!=4){var ab=C("div");
aa+="SWFObjectNew";ab.setAttribute("id",aa);ah.parentNode.insertBefore(ab,ah);ah.style.display="none";y(ah)}u(ad,ae,aa)}}function b(ab){if(O.ie&&ab.readyState!=4){ab.style.display="none";var aa=C("div");ab.parentNode.insertBefore(aa,ab);aa.parentNode.replaceChild(J(ab),aa);y(ab)}else{ab.parentNode.replaceChild(J(ab),ab)}}function J(af){var ae=C("div");if(O.win&&O.ie){ae.innerHTML=af.innerHTML}else{var ab=af.getElementsByTagName(r)[0];if(ab){var ag=ab.childNodes;if(ag){var aa=ag.length;for(var ad=0;ad<aa;ad++){if(!(ag[ad].nodeType==1&&ag[ad].nodeName=="PARAM")&&!(ag[ad].nodeType==8)){ae.appendChild(ag[ad].cloneNode(true))}}}}}return ae}function k(aa,ab){var ac=C("div");ac.innerHTML="<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='"+aa+"'>"+ab+"</object>";return ac.firstChild}function u(ai,ag,ab){var aa,ad=c(ab);ab=W(ab);if(O.wk&&O.wk<312){return aa}if(ad){var ac=(O.ie)?C("div"):C(r),af,ah,ae;if(typeof ai.id==D){ai.id=ab}for(ae in ag){if(ag.hasOwnProperty(ae)&&ae.toLowerCase()!=="movie"){e(ac,ae,ag[ae])}}if(O.ie){ac=k(ai.data,ac.innerHTML)}for(af in ai){if(ai.hasOwnProperty(af)){ah=af.toLowerCase();if(ah==="styleclass"){ac.setAttribute("class",ai[af])}else{if(ah!=="classid"&&ah!=="data"){ac.setAttribute(af,ai[af])}}}}if(O.ie){P[P.length]=ai.id}else{ac.setAttribute("type",q);ac.setAttribute("data",ai.data)}ad.parentNode.replaceChild(ac,ad);aa=ac}return aa}function e(ac,aa,ab){var ad=C("param");ad.setAttribute("name",aa);ad.setAttribute("value",ab);ac.appendChild(ad)}function y(ac){var ab=c(ac);if(ab&&ab.nodeName.toUpperCase()=="OBJECT"){if(O.ie){ab.style.display="none";(function aa(){if(ab.readyState==4){for(var ad in ab){if(typeof ab[ad]=="function"){ab[ad]=null}}ab.parentNode.removeChild(ab)}else{setTimeout(aa,10)}}())}else{ab.parentNode.removeChild(ab)}}}function U(aa){return(aa&&aa.nodeType&&aa.nodeType===1)}function W(aa){return(U(aa))?aa.id:aa}function c(ac){if(U(ac)){return ac}var aa=null;try{aa=h.getElementById(ac)}catch(ab){}return aa}function C(aa){return h.createElement(aa)}function n(aa){return parseInt(aa,10)}function g(ac,aa,ab){ac.attachEvent(aa,ab);K[K.length]=[ac,aa,ab]}function F(ac){ac+="";var ab=O.pv,aa=ac.split(".");aa[0]=n(aa[0]);aa[1]=n(aa[1])||0;aa[2]=n(aa[2])||0;return(ab[0]>aa[0]||(ab[0]==aa[0]&&ab[1]>aa[1])||(ab[0]==aa[0]&&ab[1]==aa[1]&&ab[2]>=aa[2]))?true:false}function v(af,ab,ag,ae){var ad=h.getElementsByTagName("head")[0];if(!ad){return}var aa=(typeof ag=="string")?ag:"screen";if(ae){m=null;G=null}if(!m||G!=aa){var ac=C("style");ac.setAttribute("type","text/css");ac.setAttribute("media",aa);m=ad.appendChild(ac);if(O.ie&&typeof h.styleSheets!=D&&h.styleSheets.length>0){m=h.styleSheets[h.styleSheets.length-1]}G=aa}if(m){if(typeof m.addRule!=D){m.addRule(af,ab)}else{if(typeof h.createTextNode!=D){m.appendChild(h.createTextNode(af+" {"+ab+"}"))}}}}function w(ad,aa){if(!j){return}var ab=aa?"visible":"hidden",ac=c(ad);if(L&&ac){ac.style.visibility=ab}else{if(typeof ad==="string"){v("#"+ad,"visibility:"+ab)}}}function N(ab){var ac=/[\\\"<>\.;]/;var aa=ac.exec(ab)!=null;return aa&&typeof encodeURIComponent!=D?encodeURIComponent(ab):ab}var d=function(){if(O.ie){window.attachEvent("onunload",function(){var af=K.length;for(var ae=0;ae<af;ae++){K[ae][0].detachEvent(K[ae][1],K[ae][2])}var ac=P.length;for(var ad=0;ad<ac;ad++){y(P[ad])}for(var ab in O){O[ab]=null}O=null;for(var aa in swfobject){swfobject[aa]=null}swfobject=null})}}();return{registerObject:function(ae,aa,ad,ac){if(O.w3&&ae&&aa){var ab={};ab.id=ae;ab.swfVersion=aa;ab.expressInstall=ad;ab.callbackFn=ac;o[o.length]=ab;w(ae,false)}else{if(ac){ac({success:false,id:ae})}}},getObjectById:function(aa){if(O.w3){return z(aa)}},embedSWF:function(af,al,ai,ak,ab,ae,ad,ah,aj,ag){var ac=W(al),aa={success:false,id:ac};if(O.w3&&!(O.wk&&O.wk<312)&&af&&al&&ai&&ak&&ab){w(ac,false);M(function(){ai+="";ak+="";var an={};if(aj&&typeof aj===r){for(var aq in aj){an[aq]=aj[aq]}}an.data=af;an.width=ai;an.height=ak;var ar={};if(ah&&typeof ah===r){for(var ao in ah){ar[ao]=ah[ao]}}if(ad&&typeof ad===r){for(var am in ad){if(ad.hasOwnProperty(am)){var ap=(l)?encodeURIComponent(am):am,at=(l)?encodeURIComponent(ad[am]):ad[am];if(typeof ar.flashvars!=D){ar.flashvars+="&"+ap+"="+at}else{ar.flashvars=ap+"="+at}}}}if(F(ab)){var au=u(an,ar,al);if(an.id==ac){w(ac,true)}aa.success=true;aa.ref=au;aa.id=au.id}else{if(ae&&A()){an.data=ae;R(an,ar,al,ag);return}else{w(ac,true)}}if(ag){ag(aa)}})}else{if(ag){ag(aa)}}},switchOffAutoHideShow:function(){j=false},enableUriEncoding:function(aa){l=(typeof aa===D)?true:aa},ua:O,getFlashPlayerVersion:function(){return{major:O.pv[0],minor:O.pv[1],release:O.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(ac,ab,aa){if(O.w3){return u(ac,ab,aa)}else{return undefined}},showExpressInstall:function(ac,ad,aa,ab){if(O.w3&&A()){R(ac,ad,aa,ab)}},removeSWF:function(aa){if(O.w3){y(aa)}},createCSS:function(ad,ac,ab,aa){if(O.w3){v(ad,ac,ab,aa)}},addDomLoadEvent:M,addLoadEvent:s,getQueryParamValue:function(ad){var ac=h.location.search||h.location.hash;
if(ac){if(/\?/.test(ac)){ac=ac.split("?")[1]}if(ad==null){return N(ac)}var ab=ac.split("&");for(var aa=0;aa<ab.length;aa++){if(ab[aa].substring(0,ab[aa].indexOf("="))==ad){return N(ab[aa].substring((ab[aa].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var aa=c(S);if(aa&&I){aa.parentNode.replaceChild(I,aa);if(p){w(p,true);if(O.ie){I.style.display="block"}}if(E){E(B)}}a=false}},version:"2.3"}}();

// Columnizer-jQuery-Plugin 
// version 1.6.2
(function($){var DATA_ORIGINAL_DOM_KEY='columnizer-original-dom';$.fn.columnize=function(options){this.each(function(){var $el=$(this);$el.data(DATA_ORIGINAL_DOM_KEY,$el.clone(true,true));});this.cols=[];this.offset=0;this.before=[];this.lastOther=0;this.prevMax=0;this.debug=0;this.setColumnStart=null;this.elipsisText='';var defaults={width:400,columns:false,buildOnce:false,overflow:false,doneFunc:function(){},target:false,ignoreImageLoading:true,columnFloat:"left",lastNeverTallest:false,accuracy:false,precise:false,manualBreaks:false,cssClassPrefix:"",elipsisText:'...',debug:0};options=$.extend(defaults,options);if(typeof(options.width)=="string"){options.width=parseInt(options.width,10);if(isNaN(options.width)){options.width=defaults.width;}}
if(typeof options.setColumnStart=='function'){this.setColumnStart=options.setColumnStart;}
if(typeof options.elipsisText=='string'){this.elipsisText=options.elipsisText;}
if(options.debug){this.debug=options.debug;}
if(!options.setWidth){if(options.precise){options.setWidth=function(numCols){return 100/numCols;};}else{options.setWidth=function(numCols){return Math.floor(100/numCols);};}}
function appendSafe($target,$elem){try{$target.append($elem);}catch(e){$target[0].appendChild($elem[0]);}}
return this.each(function(){var $inBox=options.target?$(options.target):$(this);var maxHeight=$(this).height();var $cache=$('<div></div>');var lastWidth=0;var columnizing=false;var manualBreaks=options.manualBreaks;var cssClassPrefix=defaults.cssClassPrefix;if(typeof(options.cssClassPrefix)=="string"){cssClassPrefix=options.cssClassPrefix;}
var adjustment=0;appendSafe($cache,$(this).contents().clone(true));if(!options.ignoreImageLoading&&!options.target){if(!$inBox.data("imageLoaded")){$inBox.data("imageLoaded",true);if($(this).find("img").length>0){var func=function($inBox,$cache){return function(){if(!$inBox.data("firstImageLoaded")){$inBox.data("firstImageLoaded","true");appendSafe($inBox.empty(),$cache.children().clone(true));$inBox.columnize(options);}};}($(this),$cache);$(this).find("img").one("load",func);$(this).find("img").one("abort",func);return;}}}
$inBox.empty();columnizeIt();if(!options.buildOnce){$(window).resize(function(){if(!options.buildOnce){if($inBox.data("timeout")){clearTimeout($inBox.data("timeout"));}
$inBox.data("timeout",setTimeout(columnizeIt,200));}});}
function prefixTheClassName(className,withDot){var dot=withDot?".":"";if(cssClassPrefix.length){return dot+cssClassPrefix+"-"+className;}
return dot+className;}
function columnize($putInHere,$pullOutHere,$parentColumn,targetHeight){while((manualBreaks||$parentColumn.height()<targetHeight)&&$pullOutHere[0].childNodes.length){var node=$pullOutHere[0].childNodes[0];if($(node).find(prefixTheClassName("columnbreak",true)).length){return;}
if($(node).hasClass(prefixTheClassName("columnbreak"))){return;}
appendSafe($putInHere,$(node));}
if($putInHere[0].childNodes.length===0)return;var kids=$putInHere[0].childNodes;var lastKid=kids[kids.length-1];$putInHere[0].removeChild(lastKid);var $item=$(lastKid);if($item[0].nodeType==3){var oText=$item[0].nodeValue;var counter2=options.width/18;if(options.accuracy)
counter2=options.accuracy;var columnText;var latestTextNode=null;while($parentColumn.height()<targetHeight&&oText.length){var indexOfSpace=oText.indexOf(' ',counter2);if(indexOfSpace!=-1){columnText=oText.substring(0,indexOfSpace);}else{columnText=oText;}
latestTextNode=document.createTextNode(columnText);appendSafe($putInHere,$(latestTextNode));if(oText.length>counter2&&indexOfSpace!=-1){oText=oText.substring(indexOfSpace);}else{oText="";}}
if($parentColumn.height()>=targetHeight&&latestTextNode!==null){$putInHere[0].removeChild(latestTextNode);oText=latestTextNode.nodeValue+oText;}
if(oText.length){$item[0].nodeValue=oText;}else{return false;}}
if($pullOutHere.contents().length){$pullOutHere.prepend($item);}else{appendSafe($pullOutHere,$item);}
return $item[0].nodeType==3;}
function split($putInHere,$pullOutHere,$parentColumn,targetHeight){if($putInHere.contents(":last").find(prefixTheClassName("columnbreak",true)).length){return;}
if($putInHere.contents(":last").hasClass(prefixTheClassName("columnbreak"))){return;}
if($pullOutHere.contents().length){var $cloneMe=$pullOutHere.contents(":first");if(typeof $cloneMe.get(0)=='undefined'||$cloneMe.get(0).nodeType!=1)return;var $clone=$cloneMe.clone(true);if($cloneMe.hasClass(prefixTheClassName("columnbreak"))){appendSafe($putInHere,$clone);$cloneMe.remove();}else if(manualBreaks){appendSafe($putInHere,$clone);$cloneMe.remove();}else if($clone.get(0).nodeType==1&&!$clone.hasClass(prefixTheClassName("dontend"))){appendSafe($putInHere,$clone);if($clone.is("img")&&$parentColumn.height()<targetHeight+20){$cloneMe.remove();}else if($cloneMe.hasClass(prefixTheClassName("dontsplit"))&&$parentColumn.height()<targetHeight+20){$cloneMe.remove();}else if($clone.is("img")||$cloneMe.hasClass(prefixTheClassName("dontsplit"))){$clone.remove();}else{$clone.empty();if(!columnize($clone,$cloneMe,$parentColumn,targetHeight)){$cloneMe.addClass(prefixTheClassName("split"));if($cloneMe.get(0).tagName=='OL'){var startWith=$clone.get(0).childElementCount+$clone.get(0).start;$cloneMe.attr('start',startWith+1);}
if($cloneMe.children().length){split($clone,$cloneMe,$parentColumn,targetHeight);}}else{$cloneMe.addClass(prefixTheClassName("split"));}
if($clone.get(0).childNodes.length===0){$clone.remove();$cloneMe.removeClass(prefixTheClassName("split"));}else if($clone.get(0).childNodes.length==1){var onlyNode=$clone.get(0).childNodes[0];if(onlyNode.nodeType==3){var nonwhitespace=/\S/;var str=onlyNode.nodeValue;if(!nonwhitespace.test(str)){$clone.remove();$cloneMe.removeClass(prefixTheClassName("split"));}}}}}}}
function singleColumnizeIt(){if($inBox.data("columnized")&&$inBox.children().length==1){return;}
$inBox.data("columnized",true);$inBox.data("columnizing",true);$inBox.empty();$inBox.append($("<div class='"
+prefixTheClassName("first")+" "
+prefixTheClassName("last")+" "
+prefixTheClassName("column")+" "
+"' style='width:100%; float: "+options.columnFloat+";'></div>"));$col=$inBox.children().eq($inBox.children().length-1);$destroyable=$cache.clone(true);if(options.overflow){targetHeight=options.overflow.height;columnize($col,$destroyable,$col,targetHeight);if(!$destroyable.contents().find(":first-child").hasClass(prefixTheClassName("dontend"))){split($col,$destroyable,$col,targetHeight);}
while($col.contents(":last").length&&checkDontEndColumn($col.contents(":last").get(0))){var $lastKid=$col.contents(":last");$lastKid.remove();$destroyable.prepend($lastKid);}
var html="";var div=document.createElement('DIV');while($destroyable[0].childNodes.length>0){var kid=$destroyable[0].childNodes[0];if(kid.attributes){for(var i=0;i<kid.attributes.length;i++){if(kid.attributes[i].nodeName.indexOf("jQuery")===0){kid.removeAttribute(kid.attributes[i].nodeName);}}}
div.innerHTML="";div.appendChild($destroyable[0].childNodes[0]);html+=div.innerHTML;}
var overflow=$(options.overflow.id)[0];overflow.innerHTML=html;}else{appendSafe($col,$destroyable.contents());}
$inBox.data("columnizing",false);if(options.overflow&&options.overflow.doneFunc){options.overflow.doneFunc();}
options.doneFunc();}
function checkDontEndColumn(dom){if(dom.nodeType==3){if(/^\s+$/.test(dom.nodeValue)){if(!dom.previousSibling)return false;return checkDontEndColumn(dom.previousSibling);}
return false;}
if(dom.nodeType!=1)return false;if($(dom).hasClass(prefixTheClassName("dontend")))return true;if(dom.childNodes.length===0)return false;return checkDontEndColumn(dom.childNodes[dom.childNodes.length-1]);}
function columnizeIt(){adjustment=0;if(lastWidth==$inBox.width())return;lastWidth=$inBox.width();var numCols=Math.round($inBox.width()/options.width);var optionWidth=options.width;var optionHeight=options.height;if(options.columns)numCols=options.columns;if(manualBreaks){numCols=$cache.find(prefixTheClassName("columnbreak",true)).length+1;optionWidth=false;}
if(numCols<=1){return singleColumnizeIt();}
if($inBox.data("columnizing"))return;$inBox.data("columnized",true);$inBox.data("columnizing",true);$inBox.empty();$inBox.append($("<div style='width:"+options.setWidth(numCols)+"%; float: "+options.columnFloat+";'></div>"));$col=$inBox.children(":last");appendSafe($col,$cache.clone());maxHeight=$col.height();$inBox.empty();var targetHeight=maxHeight/numCols;var firstTime=true;var maxLoops=3;var scrollHorizontally=false;if(options.overflow){maxLoops=1;targetHeight=options.overflow.height;}else if(optionHeight&&optionWidth){maxLoops=1;targetHeight=optionHeight;scrollHorizontally=true;}
for(var loopCount=0;loopCount<maxLoops&&loopCount<20;loopCount++){$inBox.empty();var $destroyable,className,$col,$lastKid;try{$destroyable=$cache.clone(true);}catch(e){$destroyable=$cache.clone();}
$destroyable.css("visibility","hidden");for(var i=0;i<numCols;i++){className=(i===0)?prefixTheClassName("first"):"";className+=" "+prefixTheClassName("column");className=(i==numCols-1)?(prefixTheClassName("last")+" "+className):className;$inBox.append($("<div class='"+className+"' style='width:"+options.setWidth(numCols)+"%; float: "+options.columnFloat+";'></div>"));}
i=0;while(i<numCols-(options.overflow?0:1)||scrollHorizontally&&$destroyable.contents().length){if($inBox.children().length<=i){$inBox.append($("<div class='"+className+"' style='width:"+options.setWidth(numCols)+"%; float: "+options.columnFloat+";'></div>"));}
$col=$inBox.children().eq(i);if(scrollHorizontally){$col.width(optionWidth+"px");}
columnize($col,$destroyable,$col,targetHeight);split($col,$destroyable,$col,targetHeight);while($col.contents(":last").length&&checkDontEndColumn($col.contents(":last").get(0))){$lastKid=$col.contents(":last");$lastKid.remove();$destroyable.prepend($lastKid);}
i++;if($col.contents().length===0&&$destroyable.contents().length){$col.append($destroyable.contents(":first"));}else if(i==numCols-(options.overflow?0:1)&&!options.overflow){if($destroyable.find(prefixTheClassName("columnbreak",true)).length){numCols++;}}}
if(options.overflow&&!scrollHorizontally){var IE6=false;var IE7=(document.all)&&(navigator.appVersion.indexOf("MSIE 7.")!=-1);if(IE6||IE7){var html="";var div=document.createElement('DIV');while($destroyable[0].childNodes.length>0){var kid=$destroyable[0].childNodes[0];for(i=0;i<kid.attributes.length;i++){if(kid.attributes[i].nodeName.indexOf("jQuery")===0){kid.removeAttribute(kid.attributes[i].nodeName);}}
div.innerHTML="";div.appendChild($destroyable[0].childNodes[0]);html+=div.innerHTML;}
var overflow=$(options.overflow.id)[0];overflow.innerHTML=html;}else{$(options.overflow.id).empty().append($destroyable.contents().clone(true));}}else if(!scrollHorizontally){$col=$inBox.children().eq($inBox.children().length-1);$destroyable.contents().each(function(){$col.append($(this));});var afterH=$col.height();var diff=afterH-targetHeight;var totalH=0;var min=10000000;var max=0;var lastIsMax=false;var numberOfColumnsThatDontEndInAColumnBreak=0;$inBox.children().each(function($inBox){return function($item){var $col=$inBox.children().eq($item);var endsInBreak=$col.children(":last").find(prefixTheClassName("columnbreak",true)).length;if(!endsInBreak){var h=$col.height();lastIsMax=false;totalH+=h;if(h>max){max=h;lastIsMax=true;}
if(h<min)min=h;numberOfColumnsThatDontEndInAColumnBreak++;}};}($inBox));var avgH=totalH/numberOfColumnsThatDontEndInAColumnBreak;if(totalH===0){loopCount=maxLoops;}else if(options.lastNeverTallest&&lastIsMax){adjustment+=5;targetHeight=targetHeight+30;if(loopCount==maxLoops-1)maxLoops++;}else if(max-min>30){targetHeight=avgH+30;}else if(Math.abs(avgH-targetHeight)>20){targetHeight=avgH;}else{loopCount=maxLoops;}}else{$inBox.children().each(function(i){$col=$inBox.children().eq(i);$col.width(optionWidth+"px");if(i===0){$col.addClass(prefixTheClassName("first"));}else if(i==$inBox.children().length-1){$col.addClass(prefixTheClassName("last"));}else{$col.removeClass(prefixTheClassName("first"));$col.removeClass(prefixTheClassName("last"));}});$inBox.width($inBox.children().length*optionWidth+"px");}
$inBox.append($("<br style='clear:both;'>"));}
$inBox.find(prefixTheClassName("column",true)).find(":first"+prefixTheClassName("removeiffirst",true)).remove();$inBox.find(prefixTheClassName("column",true)).find(':last'+prefixTheClassName("removeiflast",true)).remove();$inBox.find(prefixTheClassName("split",true)).find(":first"+prefixTheClassName("removeiffirst",true)).remove();$inBox.find(prefixTheClassName("split",true)).find(':last'+prefixTheClassName("removeiflast",true)).remove();$inBox.data("columnizing",false);if(options.overflow){options.overflow.doneFunc();}
options.doneFunc();}});};$.fn.uncolumnize=function(){this.each(function(){var $el=$(this),$clone;if($clone=$el.data(DATA_ORIGINAL_DOM_KEY)){$el.replaceWith($clone);}});};$.fn.renumberByJS=function($searchTag,$colno,$targetId,$targetClass){this.setList=function($cols,$list,$tag1){var $parents=this.before.parents();var $rest;$rest=$($cols[this.offset-1]).find('>*');if(($rest.last())[0].tagName!=$tag1.toUpperCase()){if(this.debug){console.log("Last item in previous column, isn't a list...");}
return 0;}
$rest=$rest.length;var $tint=1;if(this.lastOther<=0){$tint=this.before.children().length+1;}else{$tint=$($parents[this.lastOther]).children().length+1;}
if($($cols[this.offset]).find($tag1+':first li.split').length){var $whereElipsis=$($cols[this.offset-1]).find($tag1+':last li:last');if(this.elipsisText===''||$($cols[this.offset-1]).find($tag1+':last ~ div').length||$($cols[this.offset-1]).find($tag1+':last ~ p').length){;}else{if($($whereElipsis).find('ul, ol, dl').length==0){var $txt=$whereElipsis.last().text();var $len=$txt.length;if($txt.substring($len-1)==';'){if($txt.substring($len-4)!=this.elipsisText+';'){$txt=$txt.substring(0,$len-1)+this.elipsisText+';';}}else{if($txt.substring($len-3)!=this.elipsisText){$txt+=this.elipsisText;}}
$whereElipsis.last().text($txt);}}
if($($cols[this.offset]).find($tag1+':first >li.split >'+$tag1).length==0){$tint--;}}
if($rest==1){$tint+=this.prevMax;}
if(this.nest>1){if(this.debug){console.log("Supposed to be a nested list...decr");}
$tint--;var $tt=$($cols[this.offset-1]).find($tag1+':first li.split:first');if($tt.length>0){if(this.debug){console.log("Previous column started with a split item, so that count is one less than expected");}
$tint--;}
$tt=$($cols[this.offset]).find($tag1+':first li:first').clone();$tt.children().remove();if($.trim($tt.text()).length>0){if(this.debug){console.log("If that was a complete list in the previous column, don't decr.");}
$tint++;if($($cols[this.offset-1]).find(">"+$tag1+':last ').children().length==0){if(this.debug){console.log("unless that was empty, in which case revert");}
$tint--;}}}else{var $tt=$($cols[this.offset]).find($tag1+':first li:first '+$tag1+".split li.split");if($tt.length>0){if(this.debug){console.log("[Nested] Column started with a split item, so that count is one less than expected");}
$tint--;}}
if(this.debug){console.log("Setting the start value to "+$tint+" ("+this.prevMax+")");}
if($tint>0){if(typeof this.setColumnStart=='function'){this.setColumnStart($list,$tint);}else{$list.attr('start',$tint);}}
return 0;}
if(typeof $targetId==='undefined'){$targetId=false;}
if(typeof $targetClass==='undefined'){$targetClass=false;}
if(!$targetId&&!$targetClass){throw"renumberByJS(): Bad param, must pass an id or a class";}
var $target='';this.prevMax=1;if($targetClass){$target="."+$targetClass;}else{$target="#"+$targetId;}
var $tag1=$searchTag.toLowerCase();var $tag2=$searchTag.toUpperCase();this.cols=$($target);if(this.debug){console.log("There are "+this.cols.length+" items, looking for "+$tag1);}
this.before=$(this.cols[0]).find($tag1+':last');this.prevMax=this.before.children().length;for(this.offset=1;this.offset<this.cols.length;this.offset++){if(this.debug){console.log("iterating "+this.offset+"...[of "+this.cols.length+"]");}
if(this.offset%$colno==0){if(this.debug){console.log("First column (in theory..)");}
this.prevMax=1;continue;}
this.before=$(this.cols[this.offset-1]).find($tag1+':last');if(this.before.length){if(this.debug){console.log("Have some "+$searchTag+" elements in the previous column");}
var $list=$(this.cols[this.offset]).find($tag1+':first');var $first=$(this.cols[this.offset]).find('*:first');if($first[0]!==$list[0]){continue;}
var $parents=this.before.parents();this.lastOther=0;var $found=false;for(;this.lastOther<$parents.length;this.lastOther++){if($parents[this.lastOther].tagName!=$tag2&&$parents[this.lastOther].tagName!="LI"){$found=true;this.lastOther--;break;}}
this.nest=1;if($(this.cols[this.offset]).find(">"+$tag1+':first li '+$tag1+":first").length){this.nest=2;}
this.setList(this.cols,$list,$tag1);this.lastOther--;$list=$(this.cols[this.offset]).find($tag1+':first li '+$tag1+":first");if($list.length){this.before=$(this.cols[this.offset-1]).find(">"+$tag1+':last li '+$tag1+":last");this.prevMax=0;this.nest=1;this.setList(this.cols,$list,$tag1);}
var $reset=$(this.cols[this.offset-1]).find(">"+$tag1+':last');this.prevMax=$reset.children().length;}}
return 0;};})(jQuery);


// SCORM Flash Navigation
// --------------------

/**
 * Enable fluid course width
 * maintain aspect ratio
 *
 * @link http://css-tricks.com/NetMag/FluidWidthVideo/Article-FluidWidthVideo.php
 */
var course_loaded = function() {
  // Find SWF
  var $course_swf = $("object#course-content");

  // The element that is fluid width
  $fluidEl = $("#course-loader");

  // Figure out and save aspect ratio for each video
  $course_swf.each(function() {

    $(this)
      .attr('data-aspectRatio', this.height / this.width)

      // and remove the hard coded width/height
      .removeAttr('height')
      .removeAttr('width');

  });

  // When the window is resized
  $(window).resize(function() {

    var newWidth = $fluidEl.width();

    // Resize all videos according to their own aspect ratio
    $course_swf.each(function() {
      var $el = $(this);
      $el
        .width(newWidth)
        .height(newWidth * $el.attr('data-aspectRatio'));
    });

  // Kick off one resize to fix all videos on page load
  }).resize();
};


// course init
// --------------------

var page_time_start = 0, // start page timer
    prev_page = 0,
    current_page_id = 0,
    total_pages = 0;

var course_init = function() {

  total_pages = pages.length;

  var course_pagination = $("#course-pagination"),
      course_nav_next = $("#course-next"),
      course_nav_prev = $("#course-prev"),
      course_index = $("#course-index"),
      course_index_btn = $("#course-index-btn");


  // Start course
  // --------------------

  load_page(current_page_id);


  // Course Index
  // --------------------

  course_index.css('visibility', 'hidden').show();

  // generate course page links
  $.each(pages, function(page_id) {
    page_name = pages[page_id][1];

    var page_link = '<p><a href="' + page_id + '" class="load-page"><span>' + (page_id+1) + '.</span> ' + page_name + '</a></p>';
    course_index.append(page_link);
  });

  // create columns, and hide
  course_index
    .columnize()
    .css('visibility', 'visible')
    .hide();

  // show/hide course index
  var course_index_btn_icon = 'icon-menu--before',
      course_index_btn_active_icon = 'icon-close--before',
      course_index_btn_text = course_index_btn.text();

  if ( pages.length <= 1 ) {
    course_index_btn.hide();
  }

  course_index_btn.on('click', function(e) {
    e.preventDefault();

    text = $(this).text();
    $(this)
      .toggleClass(course_index_btn_icon)
      .toggleClass(course_index_btn_active_icon)
      .text( text == course_index_btn_text ? "Close" : course_index_btn_text );

    course_index.fadeToggle(250);
  });

  // load page from course index
  $(".load-page").on('click', function(e) {
    e.preventDefault();

    course_index_btn.removeClass(course_index_btn_active_icon).addClass(course_index_btn_icon);
    course_index.fadeOut(250);

    text = course_index_btn.text();
    course_index_btn.text( text == course_index_btn_text ? "Close " + course_index_btn_text : course_index_btn_text );

    var page_swf = $(this).attr('href');
    load_page(page_swf);
  });


  // Course navigation
  // --------------------

  // load next page
  course_nav_next.on('click', function(e) {
      e.preventDefault();
      if ( current_page_id + 1 < total_pages ) {
        current_page_id++;
        load_page(current_page_id);
      } else if ( current_page_id + 1 == total_pages) {
        // load assessment
        startAssessment();
      }
    });


  // load previous page
  if ( pages.length <= 1 ) {
    course_nav_prev.hide();
  }

  course_nav_prev.on('click', function(e) {
      e.preventDefault();
      if ( current_page_id > 0 ) {
        current_page_id--;
        load_page(current_page_id);
      }
    });

  // disable previous and next buttons depending on loaded page
  if ( current_page_id <= 0 ) {
    course_nav_prev.attr('disabled', true);
  } else if ( current_page_id >= total_pages ) {
    course_nav_next.attr('disabled', true);
  }
};


// Load Course Pages
// --------------------

var load_page = function(page_id) {

  current_page_id = Number(page_id); // global page id
  page_id = Number(page_id);

  // Load Selected Page
  // --------------------

  var course_header = $('#course-header'),
      course_title = $('#course-title'),
      course_loader = $('#course-loader'),
      course_nav = $('#course-nav'),
      course_nav_next = $('#course-next'),
      course_nav_prev = $('#course-prev'),
      course_pagination = $('#course-pagination'),
      course_progress_bar = $('#course-progress').find('.progress-bar'),
      course_tip = $('#course-tip'),
      course_tip_content = $('#course-tip-content'),
      course_content_id = "course-content";

  // course header width
  course_header.css('width', course_width);

  // course container width/height
  course_loader.css({
    width: course_width,
    height: course_height
  });

  // course nav width
  course_nav.css('width', course_width);

  // update page title
  if ( pages[page_id][1].length > 0 ) {
    course_title.show().html(pages[page_id][1]);
  } else {
    course_title.hide();
  }

  // update page number
  if ( pages.length > 1 ) {
    course_pagination.html( 'page ' + (page_id + 1) + ' of ' + pages.length );
  } else {
    course_pagination.hide();
  }

  // update next page button text
  var next_page_text = '';
  if ( page_id + 1 < pages.length ) {
    next_page_text = '<span>next page:</span> ' + pages[page_id + 1][1];
  } else if ( page_id + 1 == pages.length ) {
    if ( course_nav_next.parents().hasClass('has-assessment') ) {
      next_page_text = 'Assessment';
    } else {
      next_page_text = 'Complete Course';
    }
  }
  course_nav_next.html( next_page_text + ' &rarr;' );

  // show/hide previous page button
  if ( page_id <= 0 ) {
    course_nav_prev.attr('disabled', true);
  } else {
    course_nav_prev.attr('disabled', false);
  }
  // show/hide next page button
  if ( page_id >= total_pages ) {
    course_nav_next.attr('disabled', true);
  } else {
    course_nav_next.attr('disabled', false);
  }

  // update progress bar
  var progress_percentage = (page_id + 1) / pages.length * 100;
  course_progress_bar
    .attr('aria-valuemin', 1)
    .attr('aria-valuemax', pages.length)
    .attr('aria-valuenow', page_id + 1)
    .css('width', progress_percentage + '%')
    .find('.sr-only').text( Math.round(progress_percentage) + '% Complete' );

  // tooltip layout
  course_tip.css('left', course_width);

  // load tooltip
  if ( pages[page_id][2] != (undefined || '') ) {
    course_tip.addClass('active');
    course_tip_content.html( '<img src="' + pages[page_id][2] + '" alt="">');
  } else {
    course_tip.removeClass('active');
    course_tip_content.html('');
  }

  // load swf
  var swf_url = pages[page_id][0];
  var flashvars = {};
  var params = {
    'base': '/',
    'wmode': 'opaque'
  };
  var attributes = {};
  swfobject.embedSWF(swf_url, course_content_id, course_width, course_height, '9.0.0', 'expressInstall.swf', flashvars, params, attributes, course_loaded);
};


// External page request
// --------------------

request_page = function(page_id) {
  // delay load function
  setTimeout(function() {
    load_page(page_id);
  }, 250);
  return;
};


// Trigger assessment
// --------------------

function startAssessment() {
  window.location.href = '../assessment.html';
}


// Initialize
// --------------------
$(document).ready(function() {
  course_init();
});
