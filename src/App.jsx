import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Bell, Plus, Trash2, TrendingUp, CreditCard, Home, BarChart2, Wallet, X, AlertCircle, CheckCircle, LogOut, User, Lock, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";

const COLORS = ["#6366f1","#22d3ee","#f59e0b","#10b981","#f43f5e","#a78bfa","#34d399","#fb923c","#e879f9"];
const CATS = ["Moradia","Alimentação","Transporte","Saúde","Educação","Lazer","Vestuário","Serviços","Outros"];
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const INVESTMENTS = [
  {name:"CDB Inter / Nubank",type:"CDB",rate:"110% CDI",risk:"Baixo",min:"R$ 1",liq:"D+0",star:true},
  {name:"Tesouro Selic",type:"Tesouro Direto",rate:"100% Selic",risk:"Baixíssimo",min:"R$ 100",liq:"D+1",star:true},
  {name:"CDB 120% CDI (prazo)",type:"CDB",rate:"120% CDI",risk:"Baixo",min:"R$ 5.000",liq:"Vencimento",star:true},
  {name:"LCI / LCA",type:"LCI/LCA",rate:"95–105% CDI (IR isento)",risk:"Baixo",min:"R$ 1.000",liq:"Vencimento",star:false},
  {name:"Fundo DI Premium",type:"Fundo",rate:"105–115% CDI",risk:"Baixo",min:"R$ 500",liq:"D+1",star:false},
];
const fmt = v => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);
const fmtDate = d => { try { return new Date(d+"T12:00:00").toLocaleDateString("pt-BR"); } catch(e) { return d; } };
const hashPw = s => [...s].reduce((a,c)=>((a<<5)-a+c.charCodeAt(0))|0,0).toString(36);
const toKey = (y,m) => y+"-"+String(m+1).padStart(2,"0");

const cardStyle = {background:"#1e293b",borderRadius:"14px",padding:"16px",marginBottom:"12px",border:"1px solid #334155"};
const inpStyle  = {width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:"8px",padding:"10px 12px",color:"#e2e8f0",fontSize:"14px",boxSizing:"border-box",outline:"none"};
const lblStyle  = {fontSize:"11px",color:"#64748b",marginBottom:"4px",display:"block"};
const pill = (bg,c) => ({background:bg,color:c,fontSize:"10px",padding:"2px 8px",borderRadius:"99px",fontWeight:"700"});
const btn  = (bg,c) => ({background:bg,border:"none",borderRadius:"8px",padding:"8px 14px",color:c,cursor:"pointer",fontWeight:"600",fontSize:"13px",display:"flex",alignItems:"center",gap:"5px"});
const iBtn = (bg,c) => ({background:bg,border:"none",borderRadius:"6px",padding:"5px 7px",color:c,cursor:"pointer",display:"flex",alignItems:"center"});

function MonthBar({year, month, onPrev, onNext}) {
  return (
    <div style={{background:"#1e293b",borderRadius:"12px",padding:"10px 14px",marginBottom:"14px",border:"1px solid #334155",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <button onClick={onPrev} style={{background:"none",border:"none",cursor:"pointer",color:"#6366f1",display:"flex",padding:"4px"}}><ChevronLeft size={18}/></button>
      <div style={{textAlign:"center"}}>
        <div style={{fontWeight:"800",fontSize:"15px",color:"#f1f5f9"}}>{MONTHS_PT[month]}</div>
        <div style={{fontSize:"11px",color:"#64748b"}}>{year}</div>
      </div>
      <button onClick={onNext} style={{background:"none",border:"none",cursor:"pointer",color:"#6366f1",display:"flex",padding:"4px"}}><ChevronRight size={18}/></button>
    </div>
  );
}

function AuthScreen({onLogin}) {
  const [mode,setMode]   = useState("login");
  const [user,setUser]   = useState("");
  const [pass,setPass]   = useState("");
  const [pass2,setPass2] = useState("");
  const [showPw,setShowPw] = useState(false);
  const [err,setErr]     = useState("");
  const [busy,setBusy]   = useState(false);

  const submit = () => {
    setErr(""); setBusy(true);
    const u = user.trim().toLowerCase();
    if (!u || !pass) { setErr("Preencha usuário e senha."); setBusy(false); return; }
    if (u.length < 3) { setErr("Usuário: mínimo 3 caracteres."); setBusy(false); return; }
    if (pass.length < 4) { setErr("Senha: mínimo 4 caracteres."); setBusy(false); return; }
    const key = "fpa_"+u;
    if (mode === "register") {
      if (pass !== pass2) { setErr("Senhas não coincidem."); setBusy(false); return; }
      if (localStorage.getItem(key)) { setErr("Usuário já existe. Faça login."); setBusy(false); return; }
      localStorage.setItem(key, hashPw(pass));
      onLogin(u);
    } else {
      const stored = localStorage.getItem(key);
      if (!stored) { setErr("Usuário não encontrado."); setBusy(false); return; }
      if (stored !== hashPw(pass)) { setErr("Senha incorreta."); setBusy(false); return; }
      onLogin(u);
    }
    setBusy(false);
  };

  return (
    <div style={{background:"#0f172a",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",padding:"20px"}}>
      <div style={{marginBottom:"24px",textAlign:"center"}}>
        <div style={{fontSize:"44px"}}>💰</div>
        <div style={{fontSize:"22px",fontWeight:"900",color:"#f1f5f9",marginTop:"6px"}}>FinançasPro</div>
        <div style={{fontSize:"12px",color:"#64748b"}}>Controle financeiro pessoal</div>
      </div>
      <div style={{background:"#1e293b",borderRadius:"20px",padding:"26px 22px",width:"100%",maxWidth:"340px",border:"1px solid #334155"}}>
        <div style={{fontSize:"17px",fontWeight:"800",color:"#f1f5f9",marginBottom:"18px",textAlign:"center"}}>
          {mode === "login" ? "Entrar na conta" : "Criar conta"}
        </div>
        <div style={{marginBottom:"12px"}}>
          <label style={lblStyle}>Usuário</label>
          <div style={{position:"relative"}}>
            <User size={14} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:"#64748b"}}/>
            <input value={user} onChange={e=>setUser(e.target.value)} placeholder="seu_usuario" type="text"
              style={{...inpStyle,paddingLeft:"36px"}} onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>
        </div>
        <div style={{marginBottom:"12px"}}>
          <label style={lblStyle}>Senha</label>
          <div style={{position:"relative"}}>
            <Lock size={14} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:"#64748b"}}/>
            <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"
              type={showPw?"text":"password"} style={{...inpStyle,paddingLeft:"36px",paddingRight:"38px"}}
              onKeyDown={e=>e.key==="Enter"&&submit()}/>
            <button onClick={()=>setShowPw(!showPw)} style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#64748b",display:"flex"}}>
              {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>
        {mode === "register" && (
          <div style={{marginBottom:"12px"}}>
            <label style={lblStyle}>Confirmar Senha</label>
            <div style={{position:"relative"}}>
              <Lock size={14} style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:"#64748b"}}/>
              <input value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="••••••••"
                type={showPw?"text":"password"} style={{...inpStyle,paddingLeft:"36px"}}
                onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
          </div>
        )}
        {err && <div style={{background:"#450a0a",border:"1px solid #ef4444",borderRadius:"8px",padding:"10px",color:"#fca5a5",fontSize:"12px",marginBottom:"12px"}}>{err}</div>}
        <button onClick={submit} disabled={busy} style={{width:"100%",background:"#6366f1",border:"none",borderRadius:"10px",padding:"13px",color:"#fff",cursor:"pointer",fontWeight:"800",fontSize:"14px",opacity:busy?0.7:1,marginTop:"4px"}}>
          {busy ? "Aguarde..." : (mode === "login" ? "Entrar" : "Criar Conta")}
        </button>
        <div style={{textAlign:"center",marginTop:"14px",fontSize:"13px",color:"#64748b"}}>
          {mode === "login"
            ? <span>Não tem conta? <button onClick={()=>{setMode("register");setErr("");}} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontWeight:"700",textDecoration:"underline"}}>Cadastre-se</button></span>
            : <span>Já tem conta? <button onClick={()=>{setMode("login");setErr("");}} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontWeight:"700",textDecoration:"underline"}}>Entrar</button></span>
          }
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user,setUser]       = useState(null);
  const [checked,setChecked] = useState(false);

  useEffect(()=>{
    const stored = localStorage.getItem("fp_sess");
    if (stored) setUser(stored);
    setChecked(true);
  },[]);

  const login  = u => { localStorage.setItem("fp_sess", u); setUser(u); };
  const logout = () => { localStorage.removeItem("fp_sess"); setUser(null); };

  if (!checked) return <div style={{background:"#0f172a",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",fontFamily:"system-ui"}}>Carregando…</div>;
  if (!user)    return <AuthScreen onLogin={login}/>;
  return <Dashboard user={user} onLogout={logout}/>;
}

function Dashboard({user, onLogout}){
  const now = new Date();
  const [selYear,setSelYear]   = useState(now.getFullYear());
  const [selMonth,setSelMonth] = useState(now.getMonth());
  const [tab,setTab]           = useState("dash");
  const [bills,setBills]       = useState([]);
  const [income,setIncome]     = useState("");
  const [exps,setExps]         = useState([]);
  const [cc,setCc]             = useState({total:""});
  const [paidIds,setPaidIds]   = useState([]);
  const [loaded,setLoaded]     = useState(false);
  const [showBF,setShowBF]     = useState(false);
  const [showEF,setShowEF]     = useState(false);
  const [editInc,setEditInc]   = useState(false);
  const [incInput,setIncInput] = useState("");
  const [nb,setNb] = useState({name:"",value:"",dueDay:"",category:"Moradia"});
  const [ne,setNe] = useState({name:"",value:"",category:"Alimentação",date:now.toISOString().slice(0,10)});

  const mKey = toKey(selYear,selMonth);
  const U    = "fp_"+user+"_";

  useEffect(()=>{
    const stored = localStorage.getItem(U+"bills");
    if (stored) setBills(JSON.parse(stored)||[]);
  },[user]);

  useEffect(()=>{
    setLoaded(false);
    setIncome(localStorage.getItem(U+mKey+"_inc")||"");
    setExps(JSON.parse(localStorage.getItem(U+mKey+"_exps")||"[]"));
    setCc(JSON.parse(localStorage.getItem(U+mKey+"_cc")||'{"total":""}'));
    setPaidIds(JSON.parse(localStorage.getItem(U+mKey+"_paid")||"[]"));
    setLoaded(true);
  },[user,mKey]);

  const sv = (k,v) => localStorage.setItem(U+k, typeof v==="string"?v:JSON.stringify(v));

  const today = new Date().getDate();
  const isNow = selYear===now.getFullYear() && selMonth===now.getMonth();
  const incNum  = parseFloat(income)||0;
  const totFix  = bills.reduce((s,b)=>s+(parseFloat(b.value)||0),0);
  const totVar  = exps.reduce((s,e)=>s+(parseFloat(e.value)||0),0);
  const totCC   = parseFloat(cc.total)||0;
  const totExp  = totFix+totVar+totCC;
  const balance = incNum-totExp;
  const pct     = incNum>0 ? Math.min(Math.round(totExp/incNum*100),100) : 0;
  const overdueB = isNow ? bills.filter(b=>!paidIds.includes(b.id)&&b.dueDay<today) : [];
  const dueSoonB = isNow ? bills.filter(b=>!paidIds.includes(b.id)&&b.dueDay>=today&&b.dueDay<=today+5) : [];

  const catMap = {};
  bills.forEach(b=>{ catMap[b.category]=(catMap[b.category]||0)+(parseFloat(b.value)||0); });
  exps.forEach(e=>{ catMap[e.category]=(catMap[e.category]||0)+(parseFloat(e.value)||0); });
  if (totCC>0) catMap["Cartão"]=(catMap["Cartão"]||0)+totCC;
  const chartData = Object.entries(catMap).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);

  const prevMonth = () => { if(selMonth===0){setSelYear(y=>y-1);setSelMonth(11);}else setSelMonth(m=>m-1); };
  const nextMonth = () => { if(selMonth===11){setSelYear(y=>y+1);setSelMonth(0);}else setSelMonth(m=>m+1); };

  const addBill = () => {
    if (!nb.name||!nb.value) return;
    const u = [...bills,{...nb,id:Date.now(),value:parseFloat(nb.value)}];
    setBills(u); sv("bills",u);
    setNb({name:"",value:"",dueDay:"",category:"Moradia"}); setShowBF(false);
  };
  const addExp = () => {
    if (!ne.name||!ne.value) return;
    const u = [...exps,{...ne,id:Date.now(),value:parseFloat(ne.value)}];
    setExps(u); sv(mKey+"_exps",u);
    setNe({name:"",value:"",category:"Alimentação",date:now.toISOString().slice(0,10)}); setShowEF(false);
  };
  const togglePaid = id => {
    const u = paidIds.includes(id)?paidIds.filter(x=>x!==id):[...paidIds,id];
    setPaidIds(u); sv(mKey+"_paid",u);
  };
  const delBill = id => { const u=bills.filter(b=>b.id!==id); setBills(u); sv("bills",u); };
  const delExp  = id => { const u=exps.filter(e=>e.id!==id); setExps(u); sv(mKey+"_exps",u); };
  const saveInc = () => { setIncome(incInput); sv(mKey+"_inc",incInput); setEditInc(false); };
  const saveCC  = (field,val) => { const u={...cc,[field]:val}; setCc(u); sv(mKey+"_cc",u); };

  const NAVS = [
    {id:"dash", icon:<Home size={18}/>,        label:"Início"},
    {id:"bills",icon:<Bell size={18}/>,        label:"Contas"},
    {id:"exps", icon:<Wallet size={18}/>,      label:"Gastos"},
    {id:"cc",   icon:<CreditCard size={18}/>,  label:"Cartão"},
    {id:"rep",  icon:<BarChart2 size={18}/>,   label:"Relatórios"},
    {id:"inv",  icon:<TrendingUp size={18}/>,  label:"Investir"},
  ];

  if (!loaded) return <div style={{background:"#0f172a",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",fontFamily:"system-ui"}}>Carregando…</div>;

  return (
    <div style={{background:"#0f172a",minHeight:"100vh",color:"#e2e8f0",fontFamily:"system-ui,sans-serif",maxWidth:"480px",margin:"0 auto"}}>
      <div style={{background:"#1e293b",padding:"12px 16px",borderBottom:"1px solid #334155",position:"sticky",top:0,zIndex:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontWeight:"900",fontSize:"16px",color:"#f1f5f9"}}>💰 FinançasPro</div>
          <div style={{fontSize:"11px",color:"#6366f1",fontWeight:"600"}}>👤 {user} &nbsp;·&nbsp; <span style={{color:"#64748b"}}>{MONTHS_PT[selMonth]} {selYear}</span></div>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          {(overdueB.length+dueSoonB.length)>0 && (
            <div style={{background:"#ef4444",borderRadius:"99px",padding:"3px 9px",fontSize:"11px",fontWeight:"700",display:"flex",alignItems:"center",gap:"3px"}}>
              <Bell size={11}/>{overdueB.length+dueSoonB.length}
            </div>
          )}
          <button onClick={onLogout} style={{...iBtn("#334155","#94a3b8"),borderRadius:"8px",padding:"7px"}}><LogOut size={14}/></button>
        </div>
      </div>

      <div style={{padding:"14px",paddingBottom:"90px"}}>

        {tab==="dash" && (
          <div>
            <MonthBar year={selYear} month={selMonth} onPrev={prevMonth} onNext={nextMonth}/>
            {overdueB.length>0 && (
              <div style={{...cardStyle,background:"#450a0a",border:"1px solid #ef4444",marginBottom:"10px"}}>
                <div style={{color:"#fca5a5",fontWeight:"700",fontSize:"13px",marginBottom:"6px",display:"flex",gap:"6px",alignItems:"center"}}><AlertCircle size={14}/>{overdueB.length} conta(s) em atraso!</div>
                {overdueB.map(b=><div key={b.id} style={{fontSize:"12px",color:"#fca5a5"}}>• {b.name} — vencia dia {b.dueDay} — {fmt(b.value)}</div>)}
              </div>
            )}
            {dueSoonB.length>0 && (
              <div style={{...cardStyle,background:"#451a03",border:"1px solid #f59e0b",marginBottom:"10px"}}>
                <div style={{color:"#fcd34d",fontWeight:"700",fontSize:"13px",marginBottom:"6px",display:"flex",gap:"6px",alignItems:"center"}}><Bell size={14}/>Vencendo em breve</div>
                {dueSoonB.map(b=><div key={b.id} style={{fontSize:"12px",color:"#fcd34d"}}>• {b.name} — dia {b.dueDay} — {fmt(b.value)}</div>)}
              </div>
            )}
            <div style={cardStyle}>
              <label style={lblStyle}>Renda — {MONTHS_PT[selMonth]}/{selYear}</label>
              {editInc ? (
                <div style={{display:"flex",gap:"8px"}}>
                  <input value={incInput} onChange={e=>setIncInput(e.target.value)} type="number" placeholder="0,00"
                    style={{...inpStyle,flex:1,fontSize:"18px",border:"1px solid #6366f1"}} onKeyDown={e=>e.key==="Enter"&&saveInc()}/>
                  <button onClick={saveInc} style={btn("#6366f1","#fff")}>OK</button>
                </div>
              ) : (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:"28px",fontWeight:"900",color:"#10b981"}}>{incNum>0?fmt(incNum):"— não informado"}</div>
                  <button onClick={()=>{setIncInput(income);setEditInc(true);}} style={{...btn("#334155","#94a3b8"),fontSize:"12px",padding:"6px 12px"}}>Editar</button>
                </div>
              )}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
              {[
                {l:"Contas Fixas",v:totFix,c:"#f59e0b",e:"📋"},
                {l:"Gastos Variáveis",v:totVar,c:"#f43f5e",e:"🛒"},
                {l:"Cartão de Crédito",v:totCC,c:"#a78bfa",e:"💳"},
                {l:"Total Gastos",v:totExp,c:"#fb923c",e:"💸"},
              ].map(x=>(
                <div key={x.l} style={cardStyle}>
                  <div style={{fontSize:"11px",color:"#64748b",marginBottom:"4px"}}>{x.e} {x.l}</div>
                  <div style={{fontSize:"17px",fontWeight:"800",color:x.c}}>{fmt(x.v)}</div>
                </div>
              ))}
            </div>
            <div style={{...cardStyle,background:balance>=0?"#052e16":"#450a0a",border:"1px solid "+(balance>=0?"#16a34a":"#ef4444")}}>
              <label style={lblStyle}>Saldo — {MONTHS_PT[selMonth]}</label>
              <div style={{fontSize:"34px",fontWeight:"900",color:balance>=0?"#4ade80":"#f87171"}}>{fmt(balance)}</div>
              <div style={{fontSize:"12px",color:balance>=0?"#86efac":"#fca5a5",marginTop:"4px"}}>
                {balance>=0?"✅ Positivo — "+fmt(balance)+" sobrando":"⚠️ Negativo — faltam "+fmt(Math.abs(balance))}
              </div>
            </div>
            {incNum>0 && (
              <div style={cardStyle}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#94a3b8",marginBottom:"8px"}}>
                  <span>Comprometido da renda</span>
                  <span style={{fontWeight:"700",color:pct>80?"#f43f5e":pct>60?"#f59e0b":"#10b981"}}>{pct}%</span>
                </div>
                <div style={{background:"#0f172a",borderRadius:"99px",height:"10px",overflow:"hidden"}}>
                  <div style={{width:pct+"%",height:"100%",background:pct>80?"#ef4444":pct>60?"#f59e0b":"#10b981",borderRadius:"99px",transition:"width .4s"}}/>
                </div>
                <div style={{fontSize:"11px",color:"#475569",marginTop:"6px"}}>
                  {pct<=50?"😊 Excelente!":pct<=70?"👍 Sob controle.":pct<=90?"⚠️ Orçamento apertado.":"🚨 Revise urgente!"}
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="bills" && (
          <div>
            <MonthBar year={selYear} month={selMonth} onPrev={prevMonth} onNext={nextMonth}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <div style={{fontWeight:"700",fontSize:"16px"}}>Contas Fixas</div>
              <button onClick={()=>setShowBF(true)} style={btn("#6366f1","#fff")}><Plus size={14}/>Adicionar</button>
            </div>
            {showBF && (
              <div style={{...cardStyle,border:"1px solid #6366f1",marginBottom:"14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
                  <span style={{fontWeight:"800",fontSize:"14px"}}>Nova Conta Fixa</span>
                  <button onClick={()=>setShowBF(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b"}}><X size={16}/></button>
                </div>
                <label style={lblStyle}>Nome</label>
                <input value={nb.name} onChange={e=>setNb({...nb,name:e.target.value})} placeholder="Ex: Luz, Aluguel" style={{...inpStyle,marginBottom:"10px"}}/>
                <label style={lblStyle}>Valor (R$)</label>
                <input value={nb.value} onChange={e=>setNb({...nb,value:e.target.value})} placeholder="0,00" type="number" style={{...inpStyle,marginBottom:"10px"}}/>
                <label style={lblStyle}>Dia Vencimento</label>
                <input value={nb.dueDay} onChange={e=>setNb({...nb,dueDay:e.target.value})} placeholder="Ex: 9" type="number" style={{...inpStyle,marginBottom:"10px"}}/>
                <label style={lblStyle}>Categoria</label>
                <select value={nb.category} onChange={e=>setNb({...nb,category:e.target.value})} style={{...inpStyle,marginBottom:"14px"}}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
                <button onClick={addBill} style={{width:"100%",background:"#6366f1",border:"none",borderRadius:"10px",padding:"12px",color:"#fff",cursor:"pointer",fontWeight:"800",fontSize:"14px"}}>Salvar</button>
              </div>
            )}
            {bills.length===0 && <div style={{textAlign:"center",color:"#475569",padding:"50px 0"}}>Nenhuma conta cadastrada.</div>}
            {[...bills].sort((a,b)=>a.dueDay-b.dueDay).map(b=>{
              const paid=paidIds.includes(b.id);
              const od=isNow&&!paid&&b.dueDay<today;
              const ds=isNow&&!paid&&b.dueDay>=today&&b.dueDay<=today+5;
              return (
                <div key={b.id} style={{...cardStyle,border:"1px solid "+(paid?"#166534":od?"#7f1d1d":ds?"#78350f":"#334155"),opacity:paid?0.75:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"5px",alignItems:"center",marginBottom:"4px"}}>
                        <span style={{fontWeight:"700",fontSize:"14px"}}>{b.name}</span>
                        {paid&&<span style={pill("#166534","#4ade80")}>✓ PAGO</span>}
                        {od&&<span style={pill("#7f1d1d","#fca5a5")}>ATRASADO</span>}
                        {ds&&<span style={pill("#78350f","#fcd34d")}>EM BREVE</span>}
                      </div>
                      <div style={{fontSize:"11px",color:"#64748b"}}>📅 Dia {b.dueDay} · {b.category}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px"}}>
                      <span style={{fontWeight:"800",color:"#f59e0b"}}>{fmt(b.value)}</span>
                      <div style={{display:"flex",gap:"4px"}}>
                        <button onClick={()=>togglePaid(b.id)} style={{...iBtn(paid?"#166534":"#1e3a5f",paid?"#4ade80":"#60a5fa"),padding:"4px 8px",fontSize:"11px",fontWeight:"700"}}>
                          {paid?<><CheckCircle size={11}/>&nbsp;Pago</>:"Pagar"}
                        </button>
                        <button onClick={()=>delBill(b.id)} style={iBtn("#450a0a","#f87171")}><Trash2 size={12}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {bills.length>0&&<div style={{...cardStyle,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:"#94a3b8",fontWeight:"600"}}>Total Fixas</span><span style={{fontWeight:"900",color:"#f59e0b",fontSize:"18px"}}>{fmt(totFix)}</span></div>}
          </div>
        )}

        {tab==="exps" && (
          <div>
            <MonthBar year={selYear} month={selMonth} onPrev={prevMonth} onNext={nextMonth}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <div style={{fontWeight:"700",fontSize:"16px"}}>Gastos — {MONTHS_PT[selMonth]}</div>
              <button onClick={()=>setShowEF(true)} style={btn("#6366f1","#fff")}><Plus size={14}/>Adicionar</button>
            </div>
            {showEF && (
              <div style={{...cardStyle,border:"1px solid #6366f1",marginBottom:"14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
                  <span style={{fontWeight:"800",fontSize:"14px"}}>Novo Gasto</span>
                  <button onClick={()=>setShowEF(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b"}}><X size={16}/></button>
                </div>
                <label style={lblStyle}>Descrição</label>
                <input value={ne.name} onChange={e=>setNe({...ne,name:e.target.value})} placeholder="Ex: Mercado, Uber" style={{...inpStyle,marginBottom:"10px"}}/>
                <label style={lblStyle}>Valor (R$)</label>
                <input value={ne.value} onChange={e=>setNe({...ne,value:e.target.value})} placeholder="0,00" type="number" style={{...inpStyle,marginBottom:"10px"}}/>
                <label style={lblStyle}>Data</label>
                <input value={ne.date} onChange={e=>setNe({...ne,date:e.target.value})} type="date" style={{...inpStyle,marginBottom:"10px"}}/>
                <label style={lblStyle}>Categoria</label>
                <select value={ne.category} onChange={e=>setNe({...ne,category:e.target.value})} style={{...inpStyle,marginBottom:"14px"}}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
                <button onClick={addExp} style={{width:"100%",background:"#6366f1",border:"none",borderRadius:"10px",padding:"12px",color:"#fff",cursor:"pointer",fontWeight:"800",fontSize:"14px"}}>Salvar</button>
              </div>
            )}
            {exps.length===0&&<div style={{textAlign:"center",color:"#475569",padding:"50px 0"}}>Nenhum gasto em {MONTHS_PT[selMonth]}.</div>}
            {Object.entries(exps.reduce((a,e)=>{a[e.category]=[...(a[e.category]||[]),e];return a},{})).map(([cat,items])=>(
              <div key={cat} style={{marginBottom:"10px"}}>
                <div style={{fontSize:"11px",color:"#64748b",fontWeight:"700",textTransform:"uppercase",letterSpacing:".8px",marginBottom:"6px"}}>
                  {cat} — {fmt(items.reduce((s,i)=>s+i.value,0))}
                </div>
                {items.map(e=>(
                  <div key={e.id} style={{...cardStyle,padding:"12px",marginBottom:"6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:"500",fontSize:"13px"}}>{e.name}</div>
                      <div style={{fontSize:"11px",color:"#64748b"}}>{fmtDate(e.date)}</div>
                    </div>
                    <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                      <span style={{fontWeight:"800",color:"#f43f5e"}}>{fmt(e.value)}</span>
                      <button onClick={()=>delExp(e.id)} style={iBtn("#450a0a","#f87171")}><Trash2 size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {exps.length>0&&<div style={{...cardStyle,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:"#94a3b8",fontWeight:"600"}}>Total {MONTHS_PT[selMonth]}</span><span style={{fontWeight:"900",color:"#f43f5e",fontSize:"18px"}}>{fmt(totVar)}</span></div>}
          </div>
        )}

        {tab==="cc" && (
          <div>
            <MonthBar year={selYear} month={selMonth} onPrev={prevMonth} onNext={nextMonth}/>
            <div style={{fontWeight:"700",fontSize:"16px",marginBottom:"12px"}}>Cartão — {MONTHS_PT[selMonth]}</div>
            <div style={cardStyle}>
              <label style={lblStyle}>Total da Fatura (R$)</label>
              <input type="number" value={cc.total} onChange={e=>saveCC("total",e.target.value)} placeholder="0,00"
                style={{...inpStyle,fontSize:"22px",fontWeight:"800",border:"1px solid #a78bfa"}}/>
            </div>
            <div style={{...cardStyle,background:"#2d1b69",border:"1px solid #a78bfa"}}>
              <div style={{fontSize:"11px",color:"#c4b5fd",marginBottom:"4px"}}>💳 Fatura {MONTHS_PT[selMonth]}/{selYear}</div>
              <div style={{fontSize:"38px",fontWeight:"900",color:"#a78bfa"}}>{fmt(totCC)}</div>
            </div>
            <div style={cardStyle}>
              <div style={{fontWeight:"700",fontSize:"13px",color:"#94a3b8",marginBottom:"10px"}}>💡 Regras inteligentes</div>
              {[["🚨","Pague SEMPRE o total. Rotativo chega a 400% ao ano."],["📊","Cartão é controle, não crédito extra."],["🎯","Parcele no máximo 3x."],["💰","Cashback só vale com fatura paga em dia."]].map((item,i)=>(
                <div key={i} style={{display:"flex",gap:"8px",marginBottom:"8px",paddingLeft:"10px",borderLeft:"2px solid #6366f1"}}>
                  <span>{item[0]}</span><span style={{fontSize:"12px",color:"#94a3b8",lineHeight:"1.5"}}>{item[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="rep" && (
          <div>
            <MonthBar year={selYear} month={selMonth} onPrev={prevMonth} onNext={nextMonth}/>
            <div style={{fontWeight:"700",fontSize:"16px",marginBottom:"12px"}}>Relatórios — {MONTHS_PT[selMonth]}</div>
            {chartData.length===0
              ? <div style={{textAlign:"center",color:"#475569",padding:"60px 0"}}>Sem dados em {MONTHS_PT[selMonth]}.</div>
              : (
                <div>
                  <div style={cardStyle}>
                    <div style={{fontWeight:"600",fontSize:"14px",marginBottom:"12px"}}>Distribuição</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} dataKey="value"
                          label={({percent})=>Math.round(percent*100)+"%"} labelLine={false} fontSize={11}>
                          {chartData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                        </Pie>
                        <Tooltip formatter={v=>fmt(v)} contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:"8px",color:"#e2e8f0",fontSize:"12px"}}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                      {chartData.map((d,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"11px",color:"#94a3b8"}}>
                          <div style={{width:"8px",height:"8px",borderRadius:"50%",background:COLORS[i%COLORS.length]}}/>{d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={cardStyle}>
                    <div style={{fontWeight:"600",fontSize:"14px",marginBottom:"12px"}}>Por Categoria</div>
                    <ResponsiveContainer width="100%" height={Math.max(chartData.length*36,120)}>
                      <BarChart data={chartData} layout="vertical">
                        <XAxis type="number" tick={{fill:"#64748b",fontSize:10}} tickFormatter={v=>v>=1000?(v/1000).toFixed(1)+"k":v}/>
                        <YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:11}} width={82}/>
                        <Tooltip formatter={v=>fmt(v)} contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:"8px",color:"#e2e8f0",fontSize:"12px"}}/>
                        <Bar dataKey="value" radius={[0,6,6,0]}>{chartData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={cardStyle}>
                    <div style={{fontWeight:"600",fontSize:"14px",marginBottom:"12px"}}>📊 Análise</div>
                    {chartData.slice(0,3).map((d,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",paddingBottom:"10px",borderBottom:"1px solid #0f172a"}}>
                        <div>
                          <div style={{fontSize:"13px",fontWeight:"600"}}>{["🔴","🟡","🟢"][i]} {d.name}</div>
                          <div style={{fontSize:"11px",color:"#64748b"}}>{incNum>0?Math.round(d.value/incNum*100):0}% da renda</div>
                        </div>
                        <span style={{fontWeight:"800",color:COLORS[i]}}>{fmt(d.value)}</span>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                      <span style={{color:"#94a3b8",fontWeight:"600"}}>Total</span>
                      <span style={{fontWeight:"900",fontSize:"16px"}}>{fmt(totExp)}</span>
                    </div>
                    {incNum>0&&<div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{color:"#94a3b8",fontWeight:"600"}}>Saldo</span>
                      <span style={{fontWeight:"900",fontSize:"16px",color:balance>=0?"#4ade80":"#f87171"}}>{fmt(balance)}</span>
                    </div>}
                  </div>
                </div>
              )
            }
          </div>
        )}

        {tab==="inv" && (
          <div>
            <div style={{fontWeight:"700",fontSize:"16px",marginBottom:"4px"}}>Onde Investir</div>
            <div style={{fontSize:"12px",color:"#64748b",marginBottom:"14px"}}>Acima de 100% do CDI com segurança</div>
            {balance>0&&<div style={{...cardStyle,background:"#052e16",border:"1px solid #16a34a"}}><div style={{fontSize:"13px",color:"#4ade80",fontWeight:"700"}}>💰 Você tem {fmt(balance)} disponível!</div><div style={{fontSize:"11px",color:"#86efac",marginTop:"4px"}}>Faça esse saldo render mais.</div></div>}
            {INVESTMENTS.map((inv,i)=>(
              <div key={i} style={{...cardStyle,border:"1px solid "+(inv.star?"#16a34a":"#334155")}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
                  <div>
                    <div style={{display:"flex",gap:"6px",alignItems:"center",marginBottom:"2px"}}>
                      <span style={{fontWeight:"700",fontSize:"13px"}}>{inv.name}</span>
                      {inv.star&&<span style={{background:"#052e16",color:"#4ade80",fontSize:"10px",padding:"2px 7px",borderRadius:"99px",fontWeight:"700"}}>⭐ TOP</span>}
                    </div>
                    <div style={{fontSize:"11px",color:"#64748b"}}>{inv.type}</div>
                  </div>
                  <div style={{fontWeight:"900",color:"#10b981",fontSize:"15px"}}>{inv.rate}</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px"}}>
                  {[{l:"Risco",v:inv.risk},{l:"Mínimo",v:inv.min},{l:"Liquidez",v:inv.liq}].map(f=>(
                    <div key={f.l} style={{background:"#0f172a",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
                      <div style={{fontSize:"10px",color:"#64748b",marginBottom:"2px"}}>{f.l}</div>
                      <div style={{fontSize:"11px",fontWeight:"700",color:"#e2e8f0",lineHeight:"1.3"}}>{f.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{...cardStyle,border:"1px solid #6366f1"}}>
              <div style={{fontWeight:"700",fontSize:"13px",marginBottom:"8px"}}>📌 Estratégia</div>
              {["1️⃣  3–6 meses de gastos em CDB liquidez diária","2️⃣  Excedente em CDB 120%+ CDI ou LCI/LCA","3️⃣  Nunca invista o que precisará antes do vencimento","4️⃣  FGC garante até R$ 250k por instituição"].map((t,i)=>(
                <div key={i} style={{fontSize:"12px",color:"#94a3b8",marginBottom:"8px",lineHeight:"1.6"}}>{t}</div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"480px",background:"#1e293b",borderTop:"1px solid #334155",display:"flex",zIndex:20}}>
        {NAVS.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",padding:"10px 0",color:tab===n.id?"#6366f1":"#475569",transition:"color .2s"}}>
            {n.icon}
            <span style={{fontSize:"9px",fontWeight:tab===n.id?"700":"400"}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}