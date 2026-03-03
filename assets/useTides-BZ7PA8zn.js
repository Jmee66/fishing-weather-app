import{b as A,u as N}from"./vendor-query-kPgIHyrB.js";import{u as f}from"./index-o3cqbgOU.js";import{S as R}from"./api.constants-tJV1d_6T.js";import{h as L}from"./geo-8VXAKhUM.js";const E=[{code:"BREST",name:"Brest",lat:48.383,lon:-4.495,timezone:"Europe/Paris"},{code:"CHERBOURG",name:"Cherbourg",lat:49.647,lon:-1.621,timezone:"Europe/Paris"},{code:"SAINT-MALO",name:"Saint-Malo",lat:48.644,lon:-2.009,timezone:"Europe/Paris"},{code:"LE-HAVRE",name:"Le Havre",lat:49.491,lon:.107,timezone:"Europe/Paris"},{code:"DUNKERQUE",name:"Dunkerque",lat:51.036,lon:2.367,timezone:"Europe/Paris"},{code:"CALAIS",name:"Calais",lat:50.969,lon:1.852,timezone:"Europe/Paris"},{code:"DIEPPE",name:"Dieppe",lat:49.924,lon:1.083,timezone:"Europe/Paris"},{code:"CAEN",name:"Caen (Ouistreham)",lat:49.281,lon:-.249,timezone:"Europe/Paris"},{code:"GRANVILLE",name:"Granville",lat:48.833,lon:-1.6,timezone:"Europe/Paris"},{code:"SAINT-NAZAIRE",name:"Saint-Nazaire",lat:47.268,lon:-2.197,timezone:"Europe/Paris"},{code:"LA-ROCHELLE",name:"La Rochelle",lat:46.156,lon:-1.151,timezone:"Europe/Paris"},{code:"ARCACHON",name:"Arcachon",lat:44.659,lon:-1.168,timezone:"Europe/Paris"},{code:"BAYONNE",name:"Bayonne",lat:43.494,lon:-1.476,timezone:"Europe/Paris"},{code:"MARSEILLE",name:"Marseille",lat:43.296,lon:5.381,timezone:"Europe/Paris"},{code:"TOULON",name:"Toulon",lat:43.124,lon:5.928,timezone:"Europe/Paris"},{code:"NICE",name:"Nice",lat:43.697,lon:7.266,timezone:"Europe/Paris"},{code:"LORIENT",name:"Lorient",lat:47.749,lon:-3.364,timezone:"Europe/Paris"},{code:"NANTES",name:"Nantes",lat:47.218,lon:-1.553,timezone:"Europe/Paris"}];function M(o){let t=E[0],s=L(o,{lat:t.lat,lon:t.lon});for(const a of E.slice(1)){const i=L(o,{lat:a.lat,lon:a.lon});i<s&&(s=i,t=a)}return{...t,distance:s}}function S(o,t){const s=o-t,a=Math.round((s-2)/(7.2-2)*100+20);return Math.max(20,Math.min(120,a))}function O(o,t,s){const a=new Date(t);a.setDate(a.getDate()+s);const i=c=>c.toISOString().replace(/\.\d{3}Z$/,"Z");return`<?xml version="1.0" encoding="UTF-8"?>
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
      <wps:Data><wps:LiteralData>${i(a)}</wps:LiteralData></wps:Data>
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
</wps:Execute>`}function z(o,t,s,a,i,c){let u;try{u=JSON.parse(o)}catch{const e=o.match(/\{[\s\S]*\}/);u=e?JSON.parse(e[0]):{predictions:[]}}const r=(u.predictions??[]).map(e=>({dt:Math.floor(new Date(e.time).getTime()/1e3),height:e.vh/100})),n=[];for(let e=1;e<r.length-1;e++){const l=r[e-1].height,p=r[e].height,m=r[e+1].height;p>l&&p>m?n.push({dt:r[e].dt,type:"PM",height:p}):p<l&&p<m&&n.push({dt:r[e].dt,type:"BM",height:p})}for(let e=0;e<n.length;e++)if(n[e].type==="PM"){const l=n.slice(0,e).reverse().find(D=>D.type==="BM"),p=n.slice(e+1).find(D=>D.type==="BM"),m=l?.height??p?.height??0;n[e]={...n[e],coefficient:S(n[e].height,m)}}const d=Math.floor(Date.now()/1e3),g=r.reduce((e,l)=>Math.abs(e.dt-d)<Math.abs(l.dt-d)?e:l)?.height,h=n.find(e=>e.dt>d);let I;h&&(I=h.type==="PM"?"rising":"falling");const T=n.filter(e=>e.type==="PM"&&e.dt<=d).pop();return{harbourCode:t,harbourName:s,lat:a,lon:i,distance:c,events:n,predictions:r,currentHeight:g,currentPhase:I,nextEvent:h,coefficient:T?.coefficient}}async function H(o){const t=M(o),s=new Date;s.setHours(0,0,0,0);const a=O(t.code,s,7),{data:i}=await A.post(R,a,{headers:{"Content-Type":"application/xml"},responseType:"text"});return z(i,t.code,t.name,t.lat,t.lon,t.distance)}const P={getTides:H,getNearestHarbour:M,harbours:E};function B(o){const t=f(n=>n.selectedLocation?.lat),s=f(n=>n.selectedLocation?.lon),a=f(n=>n.currentPosition?.lat),i=f(n=>n.currentPosition?.lon),c=o?.lat??t??a,u=o?.lon??s??i,w=c!=null&&u!=null?{lat:c,lon:u}:null,r=w?P.getNearestHarbour(w):null;return N({queryKey:["tides",r?.code],queryFn:()=>{if(!w)throw new Error("Aucune position disponible");return P.getTides(w)},enabled:!!w,staleTime:3600*1e3})}export{B as u};
