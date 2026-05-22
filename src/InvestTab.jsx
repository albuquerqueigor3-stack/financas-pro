import { useState, useEffect } from "react";

const card = {background:"#1e293b",borderRadius:"14px",padding:"14px",marginBottom:"10px",border:"1px solid #334155"};
const MEDALS = ["🏆","🥈","🥉","4️⃣","5️⃣"];
const RISK_C = {"Alto":"#f43f5e","Médio-Alto":"#f97316","Médio":"#f59e0b","Baixo":"#10b981"};

function StatBox({lbl,val,color}) {
  return (
    <div style={{background:"#0f172a",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
      <div style={{fontSize:"10px",color:"#64748b",marginBottom:"2px"}}>{lbl}</div>
      <div style={{fontSize:"12px",fontWeight:"800",color:color||"#e2e8f0"}}>{val}</div>
    </div>
  );
}

function RentCard({title, rent}) {
  if (!rent) return null;
  return (
    <div style={{...card,background:"#0f172a",border:"1px solid #334155"}}>
      <div style={{fontWeight:"700",fontSize:"13px",color:"#94a3b8",marginBottom:"10px"}}>{title}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
        <div style={{background:"#1e293b",borderRadius:"10px",padding:"10px",textAlign:"center"}}>
          <div style={{fontSize:"10px",color:"#64748b",marginBottom:"4px"}}>Média 12m</div>
          <div style={{fontSize:"18px",fontWeight:"900",color:rent.media>=0?"#4ade80":"#f87171"}}>{rent.media>=0?"+":""}{rent.media}%</div>
        </div>
        <div style={{background:"#052e16",borderRadius:"10px",padding:"10px",textAlign:"center"}}>
          <div style={{fontSize:"10px",color:"#4ade80",marginBottom:"4px"}}>🏆 Melhor</div>
          <div style={{fontSize:"13px",fontWeight:"800",color:"#4ade80"}}>{rent.melhor.ticker}</div>
          <div style={{fontSize:"12px",color:"#86efac"}}>+{rent.melhor.change12m}%</div>
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

function AssetCard({a, idx, tipo}) {
  return (
    <div style={{...card, border:idx===0?"1px solid #f59e0b":"1px solid #334155"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <span style={{fontSize:"18px"}}>{MEDALS[idx]}</span>
          <div>
            <div style={{fontWeight:"800",fontSize:"14px",color:"#f1f5f9"}}>{a.nome}</div>
            <div style={{fontSize:"11px",color:"#6366f1",fontWeight:"700"}}>{a.ticker}{a.setor?` · ${a.setor}`:""}</div>
          </div>
        </div>
        <div style={{background:"#052e16",color:"#4ade80",fontSize:"12px",fontWeight:"800",padding:"4px 10px",borderRadius:"99px",whiteSpace:"nowrap"}}>{a.score}/10</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"10px"}}>
        <StatBox lbl="Preço" val={tipo==="cripto"?`$${Number(a.preco).toLocaleString("en")}`:`R$${a.preco}`}/>
        <StatBox lbl="12 meses" val={`${a.change12m>=0?"+":""}${a.change12m}%`} color={a.change12m>=0?"#4ade80":"#f87171"}/>
        <StatBox lbl={tipo==="cripto"?"Mercado":tipo==="fii"?"DY mensal":"DY anual"} val={tipo==="fii"?`${a.dyMensal}%`:tipo==="cripto"?"Cripto":`${a.dy}%`} color="#a78bfa"/>
      </div>

      {tipo==="fii" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"10px"}}>
          <StatBox lbl="DY anual" val={`${a.dy}%`} color="#4ade80"/>
          <StatBox lbl="DY mensal" val={`${a.dyMensal}%`} color="#4ade80"/>
        </div>
      )}

      {tipo==="cripto" && a.precoBrl && (
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
          <div style={{fontSize:"10px",fontWeight:"800",color:"#86efac"}}>{a.alvo} <span style={{fontSize:"9px"}}>+{a.alvoChg}%</span></div>
        </div>
        <div style={{background:"#450a0a",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
          <div style={{fontSize:"10px",color:"#fca5a5",fontWeight:"700",marginBottom:"2px"}}>🔴 Stop</div>
          <div style={{fontSize:"10px",fontWeight:"800",color:"#fca5a5"}}>{a.stop} <span style={{fontSize:"9px"}}>{a.stopChg}%</span></div>
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

function Section({title, assets, tipo, rent}) {
  if (!assets?.length) return (
    <div style={{marginBottom:"8px"}}>
      <div style={{fontWeight:"700",fontSize:"13px",color:"#94a3b8",textTransform:"uppercase",letterSpacing:".8px",marginBottom:"10px",marginTop:"6px"}}>{title}</div>
      <div style={{...card,textAlign:"center",color:"#475569"}}>Dados indisponíveis no momento.</div>
    </div>
  );
  return (
    <div style={{marginBottom:"8px"}}>
      <div style={{fontWeight:"700",fontSize:"13px",color:"#94a3b8",textTransform:"uppercase",letterSpacing:".8px",marginBottom:"10px",marginTop:"6px"}}>{title}</div>
      {rent && <RentCard title="📊 Rentabilidade da carteira — 12 meses" rent={rent}/>}
      {assets.map((a,i)=><AssetCard key={a.ticker||i} a={a} idx={i} tipo={tipo}/>)}
    </div>
  );
}

function ChangesPanel({changes}) {
  if (!changes||!Object.keys(changes).length) return null;
  const labels = {acoes:"Ações B3",fiis:"FIIs",criptos:"Criptos"};
  return (
    <div style={{...card,background:"#1e3a5f",border:"1px solid #3b82f6",marginBottom:"14px"}}>
      <div style={{fontWeight:"800",fontSize:"13px",color:"#60a5fa",marginBottom:"10px"}}>🔄 Mudanças no ranking hoje</div>
      {Object.entries(changes).map(([cat,chg])=>(
        <div key={cat} style={{marginBottom:"10px"}}>
          <div style={{fontSize:"11px",color:"#94a3b8",fontWeight:"700",textTransform:"uppercase",marginBottom:"6px"}}>{labels[cat]}</div>
          {chg.saiu?.map(a=>(
            <div key={a.ticker} style={{background:"#450a0a",borderRadius:"8px",padding:"8px 10px",marginBottom:"4px"}}>
              <div style={{fontSize:"12px",color:"#fca5a5",fontWeight:"700"}}>🔴 SAIU: {a.ticker} — {a.nome}</div>
              <div style={{fontSize:"11px",color:"#f87171",marginTop:"2px"}}>Saiu do top 5 — considere revisar posição</div>
            </div>
          ))}
          {chg.entrou?.map(a=>(
            <div key={a.ticker} style={{background:"#052e16",borderRadius:"8px",padding:"8px 10px",marginBottom:"4px"}}>
              <div style={{fontSize:"12px",color:"#4ade80",fontWeight:"700"}}>🟢 ENTROU: {a.ticker} — {a.nome}</div>
              <div style={{fontSize:"11px",color:"#86efac",marginTop:"2px"}}>Score: {a.score}/10 — nova oportunidade</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function InvestTab() {
  const [data,setData]       = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError]     = useState("");

  useEffect(()=>{ load(); },[]);

  const load = async () => {
    setLoading(true); setError("");
    const today = new Date().toISOString().slice(0,10);
    const cacheKey = "inv_cache_"+today;
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setData(JSON.parse(cached)); setLoading(false); return; }
    try {
      const res = await fetch("/api/investments");
      if (!res.ok) { const e=await res.json(); throw new Error(e.error||"Erro "+res.status); }
      const json = await res.json();
      localStorage.setItem(cacheKey, JSON.stringify(json));
      // limpa caches antigos
      Object.keys(localStorage).filter(k=>k.startsWith("inv_cache_")&&k!==cacheKey).forEach(k=>localStorage.removeItem(k));
      setData(json);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  if (loading) return (
    <div style={{textAlign:"center",padding:"60px 0",color:"#64748b"}}>
      <div style={{fontSize:"32px",marginBottom:"12px"}}>📡</div>
      <div style={{fontWeight:"700",fontSize:"14px",color:"#94a3b8",marginBottom:"6px"}}>Analisando mercado...</div>
      <div style={{fontSize:"12px"}}>Buscando top ações, FIIs e criptos</div>
      <div style={{fontSize:"11px",marginTop:"8px",color:"#475569"}}>Pode levar até 20 segundos</div>
    </div>
  );
  if (error) return (
    <div style={{textAlign:"center",padding:"40px 0"}}>
      <div style={{fontSize:"32px",marginBottom:"12px"}}>⚠️</div>
      <div style={{color:"#f87171",marginBottom:"16px",fontSize:"13px"}}>{error}</div>
      <button onClick={load} style={{background:"#6366f1",border:"none",borderRadius:"8px",padding:"10px 24px",color:"#fff",cursor:"pointer",fontWeight:"700"}}>Tentar novamente</button>
    </div>
  );
  if (!data) return null;

  const {cambio,acoes,fiis,criptos,changes,rentabilidade} = data;
  const usd = cambio?.usd, eur = cambio?.eur;

  return (
    <div>
      <div style={{background:"#1e3a5f",borderRadius:"10px",padding:"8px 12px",marginBottom:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:"11px",color:"#60a5fa"}}>🔄 {data.date} às {data.hora||"--:--"}</span>
        <button onClick={()=>{localStorage.removeItem("inv_cache_"+data.date);load();}} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontSize:"11px",fontWeight:"700"}}>↺ Atualizar</button>
      </div>

      {/* Câmbio */}
      <div style={{fontWeight:"700",fontSize:"13px",color:"#94a3b8",textTransform:"uppercase",letterSpacing:".8px",marginBottom:"10px"}}>💱 Câmbio do dia</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"18px"}}>
        {[{flag:"🇺🇸",label:"Dólar (USD)",d:usd},{flag:"🇪🇺",label:"Euro (EUR)",d:eur}].map(({flag,label,d})=>(
          <div key={label} style={card}>
            <div style={{fontSize:"20px",marginBottom:"4px"}}>{flag}</div>
            <div style={{fontSize:"11px",color:"#64748b",marginBottom:"2px"}}>{label}</div>
            <div style={{fontSize:"22px",fontWeight:"900",color:"#f1f5f9"}}>R$ {Number(d?.valor||0).toFixed(2)}</div>
            <div style={{fontSize:"11px",color:(d?.chg||0)>=0?"#4ade80":"#f87171",marginTop:"2px"}}>
              {(d?.chg||0)>=0?"▲":"▼"} {Math.abs(d?.chg||0).toFixed(2)}% hoje
            </div>
          </div>
        ))}
      </div>

      <ChangesPanel changes={changes}/>

      <Section title="📈 Top 5 Ações B3" assets={acoes} tipo="acao" rent={rentabilidade?.acoes}/>
      <Section title="🏢 Top 5 FIIs"     assets={fiis}  tipo="fii"  rent={rentabilidade?.fiis}/>
      <Section title="₿ Top 5 Criptos"   assets={criptos} tipo="cripto" rent={rentabilidade?.criptos}/>

      <div style={{background:"#1e3a5f",borderRadius:"10px",padding:"10px 12px",marginTop:"4px",border:"1px solid #1e40af"}}>
        <div style={{fontSize:"11px",color:"#93c5fd",fontWeight:"700",marginBottom:"3px"}}>⚠️ Aviso importante</div>
        <div style={{fontSize:"11px",color:"#60a5fa",lineHeight:"1.5"}}>Análises geradas com dados públicos via algoritmo. Não constituem recomendação de investimento. Consulte um assessor financeiro.</div>
      </div>
    </div>
  );
}