import{b as M,u as A}from"./vendor-query-kPgIHyrB.js";import{u as T}from"./index-hej_YbwN.js";import{S as N}from"./api.constants-tJV1d_6T.js";import{h as E}from"./geo-8VXAKhUM.js";const h=[{code:"BREST",name:"Brest",lat:48.383,lon:-4.495,timezone:"Europe/Paris"},{code:"CHERBOURG",name:"Cherbourg",lat:49.647,lon:-1.621,timezone:"Europe/Paris"},{code:"SAINT-MALO",name:"Saint-Malo",lat:48.644,lon:-2.009,timezone:"Europe/Paris"},{code:"LE-HAVRE",name:"Le Havre",lat:49.491,lon:.107,timezone:"Europe/Paris"},{code:"DUNKERQUE",name:"Dunkerque",lat:51.036,lon:2.367,timezone:"Europe/Paris"},{code:"CALAIS",name:"Calais",lat:50.969,lon:1.852,timezone:"Europe/Paris"},{code:"DIEPPE",name:"Dieppe",lat:49.924,lon:1.083,timezone:"Europe/Paris"},{code:"CAEN",name:"Caen (Ouistreham)",lat:49.281,lon:-.249,timezone:"Europe/Paris"},{code:"GRANVILLE",name:"Granville",lat:48.833,lon:-1.6,timezone:"Europe/Paris"},{code:"SAINT-NAZAIRE",name:"Saint-Nazaire",lat:47.268,lon:-2.197,timezone:"Europe/Paris"},{code:"LA-ROCHELLE",name:"La Rochelle",lat:46.156,lon:-1.151,timezone:"Europe/Paris"},{code:"ARCACHON",name:"Arcachon",lat:44.659,lon:-1.168,timezone:"Europe/Paris"},{code:"BAYONNE",name:"Bayonne",lat:43.494,lon:-1.476,timezone:"Europe/Paris"},{code:"MARSEILLE",name:"Marseille",lat:43.296,lon:5.381,timezone:"Europe/Paris"},{code:"TOULON",name:"Toulon",lat:43.124,lon:5.928,timezone:"Europe/Paris"},{code:"NICE",name:"Nice",lat:43.697,lon:7.266,timezone:"Europe/Paris"},{code:"LORIENT",name:"Lorient",lat:47.749,lon:-3.364,timezone:"Europe/Paris"},{code:"NANTES",name:"Nantes",lat:47.218,lon:-1.553,timezone:"Europe/Paris"}];function L(o){let t=h[0],a=E(o,{lat:t.lat,lon:t.lon});for(const n of h.slice(1)){const i=E(o,{lat:n.lat,lon:n.lon});i<a&&(a=i,t=n)}return{...t,distance:a}}function R(o,t){const a=o-t,n=Math.round((a-2)/(7.2-2)*100+20);return Math.max(20,Math.min(120,n))}function S(o,t,a){const n=new Date(t);n.setDate(n.getDate()+a);const i=u=>u.toISOString().replace(/\.\d{3}Z$/,"Z");return`<?xml version="1.0" encoding="UTF-8"?>
<wps:Execute xmlns:wps="http://www.opengis.net/wps/1.0.0"
             xmlns:ows="http://www.opengis.net/ows/1.1"
             service="WPS" version="1.0.0" language="fr">
  <ows:Identifier>GetTidalHarmonic</ows:Identifier>
  <wps:DataInputs>
    <wps:Input>
      <ows:Identifier>PORT</ows:Identifier>
      <wps:Data><wps:LiteralData>${o}</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>START_DATETIME</ows:Identifier>
      <wps:Data><wps:LiteralData>${i(t)}</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>END_DATETIME</ows:Identifier>
      <wps:Data><wps:LiteralData>${i(n)}</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>TEMPORAL_RESOLUTION</ows:Identifier>
      <wps:Data><wps:LiteralData>60</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>UNIT</ows:Identifier>
      <wps:Data><wps:LiteralData>CM</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>DATUM</ows:Identifier>
      <wps:Data><wps:LiteralData>LAT</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>GRAPH_ENCODING</ows:Identifier>
      <wps:Data><wps:LiteralData>json</wps:LiteralData></wps:Data>
    </wps:Input>
  </wps:DataInputs>
  <wps:ResponseForm>
    <wps:RawDataOutput>
      <ows:Identifier>DATA</ows:Identifier>
    </wps:RawDataOutput>
  </wps:ResponseForm>
</wps:Execute>`}function O(o,t,a,n,i,u){let d;try{d=JSON.parse(o)}catch{const e=o.match(/\{[\s\S]*\}/);d=e?JSON.parse(e[0]):{predictions:[]}}const r=(d.predictions??[]).map(e=>({dt:Math.floor(new Date(e.time).getTime()/1e3),height:e.vh/100})),s=[];for(let e=1;e<r.length-1;e++){const c=r[e-1].height,p=r[e].height,w=r[e+1].height;p>c&&p>w?s.push({dt:r[e].dt,type:"PM",height:p}):p<c&&p<w&&s.push({dt:r[e].dt,type:"BM",height:p})}for(let e=0;e<s.length;e++)if(s[e].type==="PM"){const c=s.slice(0,e).reverse().find(f=>f.type==="BM"),p=s.slice(e+1).find(f=>f.type==="BM"),w=c?.height??p?.height??0;s[e]={...s[e],coefficient:R(s[e].height,w)}}const l=Math.floor(Date.now()/1e3),P=r.reduce((e,c)=>Math.abs(e.dt-l)<Math.abs(c.dt-l)?e:c)?.height,m=s.find(e=>e.dt>l);let D;m&&(D=m.type==="PM"?"rising":"falling");const g=s.filter(e=>e.type==="PM"&&e.dt<=l).pop();return{harbourCode:t,harbourName:a,lat:n,lon:i,distance:u,events:s,predictions:r,currentHeight:P,currentPhase:D,nextEvent:m,coefficient:g?.coefficient}}async function z(o){const t=L(o),a=new Date;a.setHours(0,0,0,0);const n=S(t.code,a,7),{data:i}=await M.post(N,n,{headers:{"Content-Type":"application/xml"},responseType:"text"});return O(i,t.code,t.name,t.lat,t.lon,t.distance)}const I={getTides:z,getNearestHarbour:L,harbours:h};function B(o){const t=T(i=>i.getActiveLocation),a=o??t(),n=a?I.getNearestHarbour(a):null;return A({queryKey:["tides",n?.code],queryFn:()=>{if(!a)throw new Error("Aucune position disponible");return I.getTides(a)},enabled:!!a,staleTime:3600*1e3})}export{B as u};
