import { useState, useEffect } from "react";

const ACOES = [
  {ticker:"PETR4", nome:"Petrobras PN",           setor:"Energia",     dyFallback:14.2},
  {ticker:"VALE3", nome:"Vale ON",                 setor:"Mineração",   dyFallback:9.8},
  {ticker:"ITUB4", nome:"Itaú Unibanco PN",        setor:"Financeiro",  dyFallback:5.1},
  {ticker:"BBAS3", nome:"Banco do Brasil ON",       setor:"Financeiro",  dyFallback:8.3},
  {ticker:"WEGE3", nome:"WEG ON",                  setor:"Indústria",   dyFallback:1.8},
];
const FIIS = [
  {ticker:"MXRF11", nome:"Maxi Renda",             setor:"FII Papel",     dyFallback:11.4},
  {ticker:"HGLG11", nome:"CSHG Logística",         setor:"FII Logística", dyFallback:9.2},
  {ticker:"XPML11", nome:"XP Malls",               setor:"FII Shopping",  dyFallback:10.1},
  {ticker:"KNRI11", nome:"Kinea Renda Imobiliária", setor:"FII Híbrido",   dyFallback:8.7},
  {ticker:"CPTS11", nome:"Capitânia Securities",    setor:"FII Papel",     dyFallback:12.3},
];
const CRYPTO_IDS = ["bitcoin","ethereum","solana","binancecoin","cardano"];

const card  = {background:"#1e293b",borderRadius:"14px",padding:"14px",marginBottom:"10px",border:"1px solid #334155"};
const MEDALS= ["🏆","🥈","🥉","4️⃣","5️⃣"];
const RISK_C= {"Alto":"#f43f5e","Médio-Alto":"#f97316","Médio":"#f59e0b","Baixo":"#10b981"};

// ── helpers ──────────────────────────────────────────────────
function calcScore(change12m, dy) {
  let s=5;
  if(change12m>50)s+=2; else if(change12m>20)s+=1.5; else if(change12m>0)s+=0.5; else s-=1;
  if(dy>12)s+=2; else if(dy>8)s+=1.5; else if(dy>5)s+=1;
  return Math.min(Math.max(parseFloat(s.toFixed(1)),5.0),9.9);
}
function calcOp(preco, tipo) {
  const vol=tipo==="cripto"?0.15:tipo==="fii"?0.07:0.09;
  const up =tipo==="cripto"?0.35:tipo==="fii"?0.13:0.15;
  const fmt=v=>tipo==="cripto"&&preco>100?`$${Math.round(v).toLocaleString("en")}`:tipo==="cripto"?`$${v.toFixed(4)}`:`R$${v.toFixed(2)}`;
  return {entrada:`${fmt(preco*(1-0.015))}–${fmt(preco*(1+0.015))}`,alvo:fmt(preco*(1+up)),alvoChg:Math.round(up*100),stop:fmt(preco*(1-vol)),stopChg:-Math.round(vol*100),rr:`1:${(up/vol).toFixed(1)}`};
}
function gerarAnalise(ticker,nome,change12m,dy,score,tipo) {
  const trend=change12m>30?"forte tendência de alta":change12m>10?"tendência positiva":change12m>0?"leve alta":"correção recente";
  const dyTxt=dy>12?`DY excepcional de ${dy}% ao ano.`:dy>7?`DY atrativo de ${dy}% ao ano.`:dy>3?`DY de ${dy}% ao ano.`:"";
  const sTxt=score>=9?"Score máximo — oportunidade rara.":score>=8?"Score elevado — alta convicção.":score>=7?"Score acima da média.":"Oportunidade especulativa — use posição reduzida.";
  if(tipo==="acao") return `${nome} apresenta ${trend} com ${change12m>=0?"+":""}${change12m}% em 12 meses. ${dyTxt} Empresa com fundamentos sólidos e geração de caixa consistente. ${sTxt} Entrada próxima ao suporte técnico atual. Monitore resultados trimestrais e política de dividendos.`;
  if(tipo==="fii")  return `${nome} é um FII com ${trend}. Rentabilidade de ${change12m>=0?"+":""}${change12m}% em 12 meses. ${dyTxt} Portfólio diversificado reduz risco de vacância. ${sTxt} Rendimentos mensais isentos de IR. Acompanhe relatórios mensais e variação da Selic.`;
  return `${nome} acumula ${change12m>=0?"+":""}${change12m}% em 12 meses. Adoção institucional em crescimento. ${sTxt} Alta volatilidade — use no máximo 5-10% do portfólio. Monitore dominância de mercado e fluxo de ETFs.`;
}
function calcRent(arr) {
  if(!arr?.length) return null;
  const media=arr.reduce((s,a)=>s+a.change12m,0)/arr.length;
  const melhor=arr.reduce((m,a)=>a.change12m>m.change12m?a:m,arr[0]);
  const pior  =arr.reduce((m,a)=>a.change12m<m.change12m?a:m,arr[0]);
  return {media:parseFloat(media.toFixed(1)),melhor:{ticker:melhor.ticker,change12m:melhor.change12m},pior:{ticker:pior.ticker,change12m:pior.change12m}};
}

// ── API fetchers ──────────────────────────────────────────────
async function fetchYahoo(ticker) {
  try {
    const url=`https://query2.finance.yahoo.com/v8/finance/chart/${ticker}.SA?interval=1d&range=1y`;
    const r=await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const j=await r.json();
    const meta=j?.chart?.result?.[0]?.meta;
    if(!meta) return null;
    const closes=(j?.chart?.result?.[0]?.indicators?.quote?.[0]?.close||[]).filter(v=>v!=null);
    const first=closes[0]||meta.chartPreviousClose||meta.regularMarketPrice;
    const last =meta.regularMarketPrice||closes[closes.length-1];
    return {preco:last, change12m:parseFloat(((last-first)/first*100).toFixed(1))};
  } catch(e) { return null; }
}

async function fetchDY(ticker, tipo) {
  try {
    const path = tipo==="fii" ? `fundos-imobiliarios` : `acoes`;
    const url  = `https://statusinvest.com.br/${path}/${ticker.toLowerCase()}`;
    const r    = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const html = await r.text();
    // Tenta extrair DY do HTML
    const m = html.match(/["']dy["'][\s\S]{0,200}?(\d{1,2}[,\.]\d{1,2})/i)
           || html.match(/dividend.yield[\s\S]{0,200}?(\d{1,2}[,\.]\d{1,2})/i)
           || html.match(/>(\d{1,2}[,\.]\d{2})<\/span>[\s\S]{0,50}?%/i);
    if(!m) return null;
    const val = parseFloat(m[1].replace(",","."));
    if(val<=0||val>50) return null;
    return tipo==="fii" ? {dyAnual:val, dyMensal:parseFloat((val/12).toFixed(2))} : {dy:val};
  } catch(e) { return null; }
}

// ── sub-components ────────────────────────────────────────────
function StatBox({lbl,val,color}) {
  return (
    <div style={{background:"#0f172a",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
      <div style={{fontSize:"10px",color:"#64748b",marginBottom:"2px"}}>{lbl}</div>
      <div style={{fontSize:"12px",fontWeight:"800",color:color||"#e2e8f0"}}>{val}</div>
    </div>
  );
}
function RentCard({rent}) {
  if(!rent) return null;
  return (
    <div style={{...card,background:"#0f172a",marginBottom:"10px"}}>
      <div style={{fontWeight:"700",fontSize:"12px",color:"#94a3b8",marginBottom:"10px"}}>📊 Rentabilidade da carteira — 12 meses</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
        <div style={{background:"#1e293b",borderRadius:"10px",padding:"10px",textAlign:"center"}}>
          <div style={{fontSize:"10px",color:"#64748b",marginBottom:"4px"}}>Média</div>
          <div style={{fontSize:"18px",fontWeight:"900",color:rent.media>=0?"#4ade80":"#f87171"}}>{rent.media>=0?"+":""}{rent.media}%</div>
        </div>
        <div style={{background:"#052e16",borderRadius:"10px",padding:"10px",textAlign:"center"}}>
          <div style={{fontSize:"10px",color:"#4ade80",marginBottom:"4px"}}>🏆 Melhor</div>
          <div style={{fontSize:"13px",fontWeight:"800",color:"#4ade80"}}>{rent.melhor.ticker}</div>
          <div style={{fontSize:"12px",color:"#86efac"}}>{rent.melhor.change12m>=0?"+":""}{rent.melhor.change12m}%</div>
        </div>
        <div style={{background:"#1e3a5f",borderRadius:"10px",padding:"10px",textAlign:"center"}}>
          <div style={{fontSize:"10px",color:"#60a5fa",marginBottom:"4px"}}>📉 Menor</div>
          <div style={{fontSize:"13px",fontWeight:"800",color:"#93c5fd"}}>{rent.pior.ticker}</div>
          <div style={{fontSize:"12px",color:rent.pior.change12m>=0?"#86efac":"#fca5a5"}}>{rent.pior.change12m>=0?"+":""}{rent.pior.change12m}%</div>
        </div>
      </div>
    </div>
  );
}
function AssetCard({a,idx,tipo}) {
  return (
    <div style={{...card,border:idx===0?"1px solid #f59e0b":"1px solid #334155"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <span style={{fontSize:"18px"}}>{MEDALS[idx]}</span>
          <div>
            <div style={{fontWeight:"800",fontSize:"14px",color:"#f1f5f9"}}>{a.nome}</div>
            <div style={{fontSize:"11px",color:"#6366f1",fontWeight:"700"}}>{a.ticker}{a.setor?` · ${a.setor}`:""}</div>
          </div>
        </div>
        <div style={{background:"#052e16",color:"#4ade80",fontSize:"12px",fontWeight:"800",padding:"4px 10px",borderRadius:"99px"}}>{a.score}/10</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"10px"}}>
        <StatBox lbl="Preço" val={tipo==="cripto"?`$${Number(a.preco).toLocaleString("en")}`:`R$${a.preco}`}/>
        <StatBox lbl="12 meses" val={`${a.change12m>=0?"+":""}${a.change12m}%`} color={a.change12m>=0?"#4ade80":"#f87171"}/>
        <StatBox lbl={tipo==="fii"?"DY mensal":tipo==="cripto"?"Cripto":"DY anual"} val={tipo==="fii"?`${a.dyMensal}%`:tipo==="cripto"?"Crypto":`${a.dy}%`} color="#a78bfa"/>
      </div>

      {tipo==="fii"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"10px"}}>
          <StatBox lbl="DY anual" val={`${a.dy}%`} color="#4ade80"/>
          <StatBox lbl="DY mensal" val={`${a.dyMensal}%`} color="#4ade80"/>
        </div>
      )}
      {tipo==="cripto"&&a.precoBrl&&(
        <div style={{marginBottom:"10px"}}>
          <StatBox lbl="Preço em BRL" val={`R$ ${Number(a.precoBrl).toLocaleString("pt-BR")}`}/>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"10px"}}>
        <div style={{background:"#1e3a5f",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
          <div style={{fontSize:"10px",color:"#60a5fa",fontWeight:"700",marginBottom:"2px"}}>🟢 Entrada</div>
          <div style={{fontSize:"10px",fontWeight:"800",color:"#93c5fd"}}>{a.entrada}</div>
        </div>
        <div style={{background:"#052e16",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
          <div style={{fontSize:"10px",color:"#4ade80",fontWeight:"700",marginBottom:"2px"}}>🎯 Alvo</div>
          <div style={{fontSize:"10px",fontWeight:"800",color:"#86efac"}}>{a.alvo} +{a.alvoChg}%</div>
        </div>
        <div style={{background:"#450a0a",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
          <div style={{fontSize:"10px",color:"#fca5a5",fontWeight:"700",marginBottom:"2px"}}>🔴 Stop</div>
          <div style={{fontSize:"10px",fontWeight:"800",color:"#fca5a5"}}>{a.stop} {a.stopChg}%</div>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",flexWrap:"wrap",gap:"6px"}}>
        <div style={{background:"#2d1b69",color:"#c4b5fd",fontSize:"11px",fontWeight:"700",padding:"4px 10px",borderRadius:"99px"}}>⚖️ R/R {a.rr}</div>
        <div style={{background:"#1e293b",color:"#94a3b8",fontSize:"11px",padding:"4px 10px",borderRadius:"99px",border:"1px solid #334155"}}>📅 {a.segurar}</div>
        <div style={{fontSize:"11px",fontWeight:"700",color:RISK_C[a.risco]||"#f59e0b"}}>● {a.risco}</div>
      </div>

      <div style={{background:"#0f172a",borderRadius:"10px",padding:"10px 12px",borderLeft:"3px solid #6366f1"}}>
        <div style={{fontSize:"10px",color:"#6366f1",fontWeight:"700",marginBottom:"4px"}}>🤖 Análise</div>
        <div style={{fontSize:"12px",color:"#94a3b8",lineHeight:"1.6"}}>{a.analise}</div>
      </div>
    </div>
  );
}
function Section({title,assets,tipo,loading}) {
  return (
    <div style={{marginBottom:"8px"}}>
      <div style={{fontWeight:"700",fontSize:"13px",color:"#94a3b8",textTransform:"uppercase",letterSpacing:".8px",marginBottom:"10px",marginTop:"6px"}}>{title}</div>
      {loading&&<div style={{...card,textAlign:"center",color:"#475569",fontSize:"13px"}}>Carregando dados reais...</div>}
      {!loading&&!assets?.length&&<div style={{...card,textAlign:"center",color:"#475569",fontSize:"13px"}}>Dados indisponíveis no momento.</div>}
      {!loading&&assets?.length>0&&<><RentCard rent={calcRent(assets)}/>{assets.map((a,i)=><AssetCard key={a.ticker||i} a={a} idx={i} tipo={tipo}/>)}</>}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────
export default function InvestTab() {
  const [acoes,setAcoes]     = useState([]);
  const [fiis,setFiis]       = useState([]);
  const [criptos,setCriptos] = useState([]);
  const [cambio,setCambio]   = useState(null);
  const [hora,setHora]       = useState("");
  const [loadA,setLoadA]     = useState(true);
  const [loadF,setLoadF]     = useState(true);
  const [loadC,setLoadC]     = useState(true);

  const today   = new Date().toISOString().slice(0,10);
  const cacheKey= "inv4_"+today;

  useEffect(()=>{ load(); },[]);

  const load = async (force=false) => {
    setLoadA(true); setLoadF(true); setLoadC(true);

    if(!force) {
      const cached=localStorage.getItem(cacheKey);
      if(cached) {
        const d=JSON.parse(cached);
        setAcoes(d.acoes||[]); setFiis(d.fiis||[]); setCriptos(d.criptos||[]);
        setCambio(d.cambio); setHora(d.hora||"");
        setLoadA(false); setLoadF(false); setLoadC(false);
        return;
      }
    }

    const h=new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    setHora(h);

    // CÂMBIO
    let usdVal=5.80,eurVal=6.30,usdChg=0,eurChg=0;
    try {
      const r=await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL");
      const j=await r.json();
      if(j.USDBRL?.bid){usdVal=parseFloat(parseFloat(j.USDBRL.bid).toFixed(2));usdChg=parseFloat(parseFloat(j.USDBRL.pctChange).toFixed(2));}
      if(j.EURBRL?.bid){eurVal=parseFloat(parseFloat(j.EURBRL.bid).toFixed(2));eurChg=parseFloat(parseFloat(j.EURBRL.pctChange).toFixed(2));}
    } catch(e){}
    const cambioData={usd:{valor:usdVal,chg:usdChg},eur:{valor:eurVal,chg:eurChg}};
    setCambio(cambioData);

    const save=(newA,newF,newC)=>{
      try {
        const prev=localStorage.getItem(cacheKey);
        const base=prev?JSON.parse(prev):{};
        localStorage.setItem(cacheKey,JSON.stringify({acoes:newA||base.acoes||[],fiis:newF||base.fiis||[],criptos:newC||base.criptos||[],cambio:cambioData,hora:h}));
        Object.keys(localStorage).filter(k=>k.startsWith("inv")&&k!==cacheKey).forEach(k=>localStorage.removeItem(k));
      } catch(e){}
    };

    // AÇÕES — Yahoo (preço+12m) + StatusInvest (DY real)
    Promise.allSettled([
      ...ACOES.map(a=>fetchYahoo(a.ticker)),
      ...ACOES.map(a=>fetchDY(a.ticker,"acao"))
    ]).then(results=>{
      const yRes=results.slice(0,ACOES.length);
      const dRes=results.slice(ACOES.length);
      const data=ACOES.map((a,i)=>{
        const y=yRes[i].status==="fulfilled"?yRes[i].value:null;
        const d=dRes[i].status==="fulfilled"?dRes[i].value:null;
        if(!y?.preco) return null;
        const dy=d?.dy||a.dyFallback;
        const score=calcScore(y.change12m,dy), op=calcOp(y.preco,"acao");
        return {rank:0,ticker:a.ticker,nome:a.nome,setor:a.setor,preco:parseFloat(y.preco.toFixed(2)),change12m:y.change12m,dy,score,...op,segurar:"6–12 meses",risco:Math.abs(y.change12m)>50?"Alto":"Médio",analise:gerarAnalise(a.ticker,a.nome,y.change12m,dy,score,"acao")};
      }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,5).map((a,i)=>({...a,rank:i+1}));
      setAcoes(data); setLoadA(false); save(data,null,null);
    });

    // FIIs — Yahoo (preço+12m) + StatusInvest (DY mensal real)
    Promise.allSettled([
      ...FIIS.map(f=>fetchYahoo(f.ticker)),
      ...FIIS.map(f=>fetchDY(f.ticker,"fii"))
    ]).then(results=>{
      const yRes=results.slice(0,FIIS.length);
      const dRes=results.slice(FIIS.length);
      const data=FIIS.map((f,i)=>{
        const y=yRes[i].status==="fulfilled"?yRes[i].value:null;
        const d=dRes[i].status==="fulfilled"?dRes[i].value:null;
        if(!y?.preco) return null;
        const dy      =d?.dyAnual ||f.dyFallback;
        const dyMensal=d?.dyMensal||parseFloat((f.dyFallback/12).toFixed(2));
        const score=calcScore(y.change12m,dy), op=calcOp(y.preco,"fii");
        return {rank:0,ticker:f.ticker,nome:f.nome,setor:f.setor,preco:parseFloat(y.preco.toFixed(2)),change12m:y.change12m,dy,dyMensal,score,...op,segurar:"Longo prazo",risco:"Baixo",analise:gerarAnalise(f.ticker,f.nome,y.change12m,dy,score,"fii")};
      }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,5).map((a,i)=>({...a,rank:i+1}));
      setFiis(data); setLoadF(false); save(null,data,null);
    });

    // CRIPTOS — CoinGecko
    try {
      const r=await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(",")}&price_change_percentage=1y&order=market_cap_desc`);
      const j=await r.json();
      const data=(j||[]).map(c=>{
        const change12m=parseFloat((c.price_change_percentage_1y_in_currency||0).toFixed(1));
        const score=calcScore(change12m,0), op=calcOp(c.current_price,"cripto");
        return {rank:0,ticker:c.symbol?.toUpperCase(),nome:c.name,setor:"Crypto",preco:c.current_price,precoBrl:parseFloat((c.current_price*usdVal).toFixed(2)),change12m,dy:null,score,...op,segurar:"3–6 meses",risco:"Alto",analise:gerarAnalise(c.symbol?.toUpperCase(),c.name,change12m,0,score,"cripto")};
      }).sort((a,b)=>b.score-a.score).slice(0,5).map((a,i)=>({...a,rank:i+1}));
      setCriptos(data); setLoadC(false); save(null,null,data);
    } catch(e){ setLoadC(false); }
  };

  const usd=cambio?.usd, eur=cambio?.eur;

  return (
    <div>
      <div style={{background:"#1e3a5f",borderRadius:"10px",padding:"8px 12px",marginBottom:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:"11px",color:"#60a5fa"}}>🔄 {today} às {hora||"--:--"}</span>
        <button onClick={()=>{localStorage.removeItem(cacheKey);load(true);}} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontSize:"11px",fontWeight:"700"}}>↺ Atualizar</button>
      </div>

      <div style={{fontWeight:"700",fontSize:"13px",color:"#94a3b8",textTransform:"uppercase",letterSpacing:".8px",marginBottom:"10px"}}>💱 Câmbio do dia</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"18px"}}>
        {[{flag:"🇺🇸",label:"Dólar (USD)",d:usd},{flag:"🇪🇺",label:"Euro (EUR)",d:eur}].map(({flag,label,d})=>(
          <div key={label} style={card}>
            <div style={{fontSize:"20px",marginBottom:"4px"}}>{flag}</div>
            <div style={{fontSize:"11px",color:"#64748b",marginBottom:"2px"}}>{label}</div>
            <div style={{fontSize:"22px",fontWeight:"900",color:"#f1f5f9"}}>R$ {(d?.valor||0).toFixed(2)}</div>
            <div style={{fontSize:"11px",color:(d?.chg||0)>=0?"#4ade80":"#f87171",marginTop:"2px"}}>
              {(d?.chg||0)>=0?"▲":"▼"} {Math.abs(d?.chg||0).toFixed(2)}% hoje
            </div>
          </div>
        ))}
      </div>

      <Section title="📈 Top 5 Ações B3" assets={acoes}   tipo="acao"   loading={loadA}/>
      <Section title="🏢 Top 5 FIIs"     assets={fiis}    tipo="fii"    loading={loadF}/>
      <Section title="₿ Top 5 Criptos"   assets={criptos} tipo="cripto" loading={loadC}/>

      <div style={{background:"#1e3a5f",borderRadius:"10px",padding:"10px 12px",marginTop:"4px",border:"1px solid #1e40af"}}>
        <div style={{fontSize:"11px",color:"#93c5fd",fontWeight:"700",marginBottom:"3px"}}>⚠️ Aviso importante</div>
        <div style={{fontSize:"11px",color:"#60a5fa",lineHeight:"1.5"}}>Preços via Yahoo Finance em tempo real. DY via StatusInvest atualizado automaticamente. Não constitui recomendação de investimento.</div>
      </div>
    </div>
  );
}