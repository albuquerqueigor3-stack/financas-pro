import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const card = {background:"#1e293b",borderRadius:"14px",padding:"14px",marginBottom:"10px",border:"1px solid #334155"};
const MEDALS = ["🏆","🥈","🥉","4️⃣","5️⃣"];
const RISK_C = {"Baixo":"#10b981","Médio":"#f59e0b","Alto":"#f43f5e"};
const CAT_LABEL = {acoes:"Ações B3",fiis:"FIIs",criptos:"Criptos"};

function StatBox({lbl,val,color}) {
  return (
    <div style={{background:"#0f172a",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
      <div style={{fontSize:"10px",color:"#64748b",marginBottom:"2px"}}>{lbl}</div>
      <div style={{fontSize:"12px",fontWeight:"800",color:color||"#e2e8f0"}}>{val}</div>
    </div>
  );
}

function OpBox({lbl,val,bg,c,clbl}) {
  return (
    <div style={{background:bg,borderRadius:"8px",padding:"7px",textAlign:"center"}}>
      <div style={{fontSize:"10px",color:clbl,fontWeight:"700",marginBottom:"2px"}}>{lbl}</div>
      <div style={{fontSize:"11px",fontWeight:"800",color:c}}>{val}</div>
    </div>
  );
}

function AssetCard({a, idx, type}) {
  return (
    <div style={{...card, border: idx===0?"1px solid #f59e0b":"1px solid #334155"}}>
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
        <StatBox lbl="Preço" val={type==="cripto"?`$${Number(a.preco).toLocaleString()}`:`R$${a.preco}`}/>
        <StatBox lbl="12 meses" val={`${a.change12m>=0?"+":""}${a.change12m}%`} color={a.change12m>=0?"#4ade80":"#f87171"}/>
        <StatBox lbl={type==="cripto"?"Vol.24h":type==="fii"?"DY mensal":"DY anual"} val={type==="fii"?`${a.dyMensal||a.dy}%`:`${a.dy||"-"}${type!=="cripto"?"%":""}`} color="#a78bfa"/>
      </div>

      {type==="fii" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",marginBottom:"10px"}}>
          <StatBox lbl="DY anual" val={`${a.dy}%`} color="#4ade80"/>
          <StatBox lbl="DY mensal" val={`${a.dyMensal}%`} color="#4ade80"/>
        </div>
      )}

      {type==="cripto" && a.precoBrl && (
        <div style={{marginBottom:"10px"}}>
          <StatBox lbl="Preço BRL" val={`R$ ${Number(a.precoBrl).toLocaleString("pt-BR")}`} color="#f1f5f9"/>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"10px"}}>
        <OpBox lbl="🟢 Entrada" val={a.entrada} bg="#1e3a5f" c="#93c5fd" clbl="#60a5fa"/>
        <OpBox lbl="🎯 Alvo" val={`${a.alvo} +${a.alvoChg}%`} bg="#052e16" c="#86efac" clbl="#4ade80"/>
        <OpBox lbl="🔴 Stop" val={`${a.stop} ${a.stopChg}%`} bg="#450a0a" c="#fca5a5" clbl="#fca5a5"/>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",flexWrap:"wrap",gap:"6px"}}>
        <div style={{background:"#2d1b69",color:"#c4b5fd",fontSize:"11px",fontWeight:"700",padding:"4px 10px",borderRadius:"99px"}}>⚖️ R/R {a.rr}</div>
        <div style={{background:"#1e293b",color:"#94a3b8",fontSize:"11px",fontWeight:"600",padding:"4px 10px",borderRadius:"99px",border:"1px solid #334155"}}>📅 {a.segurar}</div>
        <div style={{fontSize:"11px",fontWeight:"700",color:RISK_C[a.risco]||"#f59e0b"}}>● {a.risco}</div>
      </div>

      <div style={{background:"#0f172a",borderRadius:"10px",padding:"10px 12px",borderLeft:"3px solid #6366f1"}}>
        <div style={{fontSize:"10px",color:"#6366f1",fontWeight:"700",marginBottom:"4px"}}>🤖 Análise da IA</div>
        <div style={{fontSize:"12px",color:"#94a3b8",lineHeight:"1.6"}}>{a.analise}</div>
      </div>
    </div>
  );
}

function AssetSection({title, assets, type}) {
  if (!assets?.length) return null;
  return (
    <div style={{marginBottom:"8px"}}>
      <div style={{fontWeight:"700",fontSize:"13px",color:"#94a3b8",textTransform:"uppercase",letterSpacing:".8px",marginBottom:"10px",marginTop:"6px"}}>{title}</div>
      {assets.map((a,i)=><AssetCard key={a.ticker||i} a={a} idx={i} type={type}/>)}
    </div>
  );
}

function ChangesPanel({changes}) {
  if (!changes || !Object.keys(changes).length) return null;
  return (
    <div style={{...card,background:"#1e3a5f",border:"1px solid #3b82f6",marginBottom:"14px"}}>
      <div style={{fontWeight:"800",fontSize:"13px",color:"#60a5fa",marginBottom:"10px"}}>🔄 Mudanças no ranking de hoje</div>
      {Object.entries(changes).map(([cat,chg])=>(
        <div key={cat} style={{marginBottom:"10px"}}>
          <div style={{fontSize:"11px",color:"#94a3b8",fontWeight:"700",textTransform:"uppercase",marginBottom:"6px"}}>{CAT_LABEL[cat]}</div>
          {chg.saiu?.map(a=>(
            <div key={a.ticker} style={{background:"#450a0a",borderRadius:"8px",padding:"8px 10px",marginBottom:"4px"}}>
              <div style={{fontSize:"12px",color:"#fca5a5",fontWeight:"700"}}>🔴 SAIU: {a.ticker} — {a.nome}</div>
              <div style={{fontSize:"11px",color:"#f87171",marginTop:"2px"}}>Score caiu abaixo do top 5 · Considere sair da posição</div>
            </div>
          ))}
          {chg.entrou?.map(a=>(
            <div key={a.ticker} style={{background:"#052e16",borderRadius:"8px",padding:"8px 10px",marginBottom:"4px"}}>
              <div style={{fontSize:"12px",color:"#4ade80",fontWeight:"700"}}>🟢 ENTROU: {a.ticker} — {a.nome}</div>
              <div style={{fontSize:"11px",color:"#86efac",marginTop:"2px"}}>Score: {a.score}/10 · Nova oportunidade no top 5</div>
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
    try {
      const cached = await getDoc(doc(db,"cache","investments_"+today));
      if (cached.exists()) { setData(cached.data()); setLoading(false); return; }
    } catch(e) {}
    try {
      const res = await fetch("/api/investments");
      if (!res.ok) throw new Error("Erro "+res.status);
      setData(await res.json());
    } catch(e) { setError("Erro ao carregar dados: "+e.message); }
    setLoading(false);
  };

  if (loading) return (
    <div style={{textAlign:"center",padding:"60px 0",color:"#64748b"}}>
      <div style={{fontSize:"32px",marginBottom:"12px"}}>📡</div>
      <div style={{fontWeight:"700",fontSize:"14px",color:"#94a3b8",marginBottom:"6px"}}>Analisando mercado com IA...</div>
      <div style={{fontSize:"12px"}}>Buscando top ações, FIIs e criptos</div>
      <div style={{fontSize:"11px",marginTop:"8px",color:"#475569"}}>Pode levar até 30 segundos na primeira vez</div>
    </div>
  );

  if (error) return (
    <div style={{textAlign:"center",padding:"40px 0"}}>
      <div style={{fontSize:"32px",marginBottom:"12px"}}>⚠️</div>
      <div style={{color:"#f87171",marginBottom:"16px",fontSize:"13px"}}>{error}</div>
      <button onClick={load} style={{background:"#6366f1",border:"none",borderRadius:"8px",padding:"10px 24px",color:"#fff",cursor:"pointer",fontWeight:"700",fontSize:"14px"}}>Tentar novamente</button>
    </div>
  );

  if (!data) return null;

  const usd = data.cambio?.usd;
  const eur = data.cambio?.eur;

  return (
    <div>
      <div style={{background:"#1e3a5f",borderRadius:"10px",padding:"8px 12px",marginBottom:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:"11px",color:"#60a5fa"}}>🔄 Atualizado {data.date} às {data.hora||"--:--"}</span>
        <button onClick={load} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontSize:"11px",fontWeight:"700"}}>↺ Atualizar</button>
      </div>

      {/* Câmbio */}
      <div style={{fontWeight:"700",fontSize:"13px",color:"#94a3b8",textTransform:"uppercase",letterSpacing:".8px",marginBottom:"10px"}}>💱 Câmbio do dia</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"18px"}}>
        <div style={card}>
          <div style={{fontSize:"20px",marginBottom:"4px"}}>🇺🇸</div>
          <div style={{fontSize:"20px",fontWeight:"900",color:"#f1f5f9"}}>R$ {Number(usd?.valor||0).toFixed(2)}</div>
          <div style={{fontSize:"11px",color:(usd?.chg||0)>=0?"#4ade80":"#f87171",marginTop:"2px"}}>
            {(usd?.chg||0)>=0?"▲":"▼"} {Math.abs(usd?.chg||0).toFixed(1)}% hoje
          </div>
        </div>
        <div style={card}>
          <div style={{fontSize:"20px",marginBottom:"4px"}}>🇪🇺</div>
          <div style={{fontSize:"20px",fontWeight:"900",color:"#f1f5f9"}}>R$ {Number(eur?.valor||0).toFixed(2)}</div>
          <div style={{fontSize:"11px",color:(eur?.chg||0)>=0?"#4ade80":"#f87171",marginTop:"2px"}}>
            {(eur?.chg||0)>=0?"▲":"▼"} {Math.abs(eur?.chg||0).toFixed(1)}% hoje
          </div>
        </div>
      </div>

      <ChangesPanel changes={data.changes}/>

      <AssetSection title="📈 Top 5 Ações B3" assets={data.acoes} type="acao"/>
      <AssetSection title="🏢 Top 5 FIIs" assets={data.fiis} type="fii"/>
      <AssetSection title="₿ Top 5 Criptos" assets={data.criptos} type="cripto"/>

      <div style={{background:"#1e3a5f",borderRadius:"10px",padding:"10px 12px",marginTop:"4px",border:"1px solid #1e40af"}}>
        <div style={{fontSize:"11px",color:"#93c5fd",fontWeight:"700",marginBottom:"3px"}}>⚠️ Aviso importante</div>
        <div style={{fontSize:"11px",color:"#60a5fa",lineHeight:"1.5"}}>Análises geradas por IA com dados públicos. Não constituem recomendação de investimento. Consulte um assessor financeiro antes de investir.</div>
      </div>
    </div>
  );
}