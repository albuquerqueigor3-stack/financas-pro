const BRAPI_TOKEN = "jQexPGvBYwSnoKzWGuu5Xt";
const ACOES_TICKERS = ["PETR4","VALE3","ITUB4","BBAS3","WEGE3","RENT3","RADL3","EGIE3","TAEE11","VIVT3"];
const FIIS_TICKERS  = ["MXRF11","HGLG11","XPML11","KNRI11","CPTS11","BTLG11","HSML11","IRDM11","VILG11","RBRF11"];
const CRYPTO_IDS    = ["bitcoin","ethereum","solana","binancecoin","cardano"];

function calcScore(change12m, dy) {
  let s = 5;
  if (change12m > 50) s += 2; else if (change12m > 20) s += 1.5; else if (change12m > 0) s += 0.5; else s -= 1;
  if (dy > 12) s += 2; else if (dy > 8) s += 1.5; else if (dy > 5) s += 1;
  return Math.min(Math.max(parseFloat(s.toFixed(1)), 5.0), 9.9);
}

function calcOp(preco, tipo) {
  const vol    = tipo==="cripto"?0.15:tipo==="fii"?0.07:0.09;
  const upside = tipo==="cripto"?0.35:tipo==="fii"?0.13:0.15;
  const prefix = tipo==="cripto"?"$":"R$";
  const decimals = tipo==="cripto" && preco>1000 ? 0 : 2;
  const fmt = v => prefix + (tipo==="cripto"&&preco>1000 ? Math.round(v).toLocaleString("en") : parseFloat(v).toFixed(2));
  return {
    entrada:`${fmt(preco*(1-0.015))}–${fmt(preco*(1+0.015))}`,
    alvo: fmt(preco*(1+upside)), alvoChg: Math.round(upside*100),
    stop: fmt(preco*(1-vol)),    stopChg: -Math.round(vol*100),
    rr: `1:${(upside/vol).toFixed(1)}`
  };
}

function gerarAnalise(ticker, nome, change12m, dy, score, tipo) {
  const trend = change12m>30?"forte tendência de alta":change12m>10?"tendência positiva":change12m>0?"leve alta":"correção recente";
  const dyTxt = dy>12?`DY excepcional de ${dy}% ao ano — excelente renda passiva.`:dy>7?`DY atrativo de ${dy}% ao ano acima da média do setor.`:dy>3?`DY de ${dy}% ao ano.`:"";
  const sTxt = score>=9?"Score máximo — oportunidade rara de entrada com alta convicção.":score>=8?"Score elevado — boa relação risco/retorno.":score>=7?"Score acima da média — entrada razoável nos níveis atuais.":"Oportunidade especulativa — utilize posição reduzida.";
  const perf = `Rentabilidade de ${change12m>=0?"+":""}${change12m}% nos últimos 12 meses.`;
  if (tipo==="acao") return `${nome} apresenta ${trend}. ${perf} ${dyTxt} Empresa com fundamentos sólidos e geração de caixa consistente. ${sTxt} Acompanhe resultados trimestrais, política de dividendos e cenário macroeconômico brasileiro. Entrada sugerida próxima ao suporte técnico atual.`;
  if (tipo==="fii") return `${nome} é um FII com ${trend}. ${perf} ${dyTxt} Portfólio diversificado com gestão ativa que reduz risco de vacância e inadimplência. ${sTxt} Rendimentos mensais isentos de IR para pessoa física. Acompanhe relatórios mensais de gestão e variação da taxa Selic.`;
  return `${nome} acumula ${change12m>=0?"+":""}${change12m}% em 12 meses. Adoção institucional e de varejo em crescimento. ${sTxt} Alta volatilidade inerente ao mercado cripto — use no máximo 5-10% do portfólio. Acompanhe dominância de mercado, regulação global e fluxo de ETFs institucionais.`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Cache-Control","s-maxage=86400, stale-while-revalidate");

  try {
    // ── CÂMBIO ──────────────────────────────────────────────
    let usdVal=5.80, eurVal=6.30, usdChg=0, eurChg=0;
    try {
      const r = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL",{headers:{"Accept":"application/json"}});
      const j = await r.json();
      if (j.USDBRL?.bid) { usdVal=parseFloat(j.USDBRL.bid); usdChg=parseFloat(j.USDBRL.pctChange||0); }
      if (j.EURBRL?.bid) { eurVal=parseFloat(j.EURBRL.bid); eurChg=parseFloat(j.EURBRL.pctChange||0); }
    } catch(e) { console.error("Câmbio error:",e.message); }

    // ── AÇÕES ───────────────────────────────────────────────
    let acoes = [];
    try {
      const url = `https://brapi.dev/api/quote/${ACOES_TICKERS.join(",")}?token=${BRAPI_TOKEN}&fundamental=true&range=1y&interval=1mo`;
      const r = await fetch(url);
      const j = await r.json();
      acoes = (j.results||[])
        .filter(a=>a.regularMarketPrice && a.regularMarketPrice>0)
        .map(a=>{
          const low52 = a.fiftyTwoWeekLow || a.regularMarketPrice*0.85;
          const change12m = parseFloat(((a.regularMarketPrice-low52)/low52*100).toFixed(1));
          const dy    = parseFloat((a.dividendYield||a.trailingAnnualDividendYield*100||0).toFixed(1));
          const score = calcScore(change12m, dy);
          const op    = calcOp(a.regularMarketPrice,"acao");
          return {
            rank:0, ticker:a.symbol, nome:a.longName||a.shortName||a.symbol,
            setor:a.sector||"B3", preco:a.regularMarketPrice,
            change12m, dy, score, ...op,
            segurar:"6–12 meses", risco:Math.abs(change12m)>50?"Alto":Math.abs(change12m)>20?"Médio":"Baixo",
            analise:gerarAnalise(a.symbol,a.longName||a.shortName||a.symbol,change12m,dy,score,"acao")
          };
        })
        .sort((a,b)=>b.score-a.score).slice(0,5).map((a,i)=>({...a,rank:i+1}));
    } catch(e) { console.error("Ações error:",e.message); }

    // ── FIIs ────────────────────────────────────────────────
    let fiis = [];
    try {
      const url = `https://brapi.dev/api/quote/${FIIS_TICKERS.join(",")}?token=${BRAPI_TOKEN}&fundamental=true&range=1y&interval=1mo`;
      const r = await fetch(url);
      const j = await r.json();
      fiis = (j.results||[])
        .filter(f=>f.regularMarketPrice && f.regularMarketPrice>0)
        .map(f=>{
          const low52   = f.fiftyTwoWeekLow || f.regularMarketPrice*0.9;
          const change12m = parseFloat(((f.regularMarketPrice-low52)/low52*100).toFixed(1));
          const dy      = parseFloat((f.dividendYield||f.trailingAnnualDividendYield*100||0).toFixed(1));
          const dyMensal= parseFloat((dy/12).toFixed(2));
          const score   = calcScore(change12m, dy);
          const op      = calcOp(f.regularMarketPrice,"fii");
          return {
            rank:0, ticker:f.symbol, nome:f.longName||f.shortName||f.symbol,
            setor:"FII", preco:f.regularMarketPrice,
            change12m, dy, dyMensal, score, ...op,
            segurar:"Longo prazo", risco:"Baixo",
            analise:gerarAnalise(f.symbol,f.longName||f.shortName||f.symbol,change12m,dy,score,"fii")
          };
        })
        .sort((a,b)=>b.score-a.score).slice(0,5).map((a,i)=>({...a,rank:i+1}));
    } catch(e) { console.error("FIIs error:",e.message); }

    // ── CRIPTOS ─────────────────────────────────────────────
    let criptos = [];
    try {
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(",")}&price_change_percentage=1y&order=market_cap_desc&per_page=10&page=1&sparkline=false`;
      const r = await fetch(url,{headers:{"Accept":"application/json"}});
      const j = await r.json();
      criptos = (j||[])
        .map(c=>{
          const change12m = parseFloat((c.price_change_percentage_1y_in_currency||c.price_change_percentage_24h||0).toFixed(1));
          const score = calcScore(change12m, 0);
          const op    = calcOp(c.current_price,"cripto");
          return {
            rank:0, ticker:c.symbol?.toUpperCase(), nome:c.name, setor:"Crypto",
            preco:c.current_price, precoBrl:parseFloat((c.current_price*usdVal).toFixed(2)),
            change12m, dy:null, score, ...op,
            segurar:"3–6 meses", risco:"Alto",
            analise:gerarAnalise(c.symbol?.toUpperCase(),c.name,change12m,0,score,"cripto")
          };
        })
        .sort((a,b)=>b.score-a.score).slice(0,5).map((a,i)=>({...a,rank:i+1}));
    } catch(e) { console.error("Crypto error:",e.message); }

    // ── RENTABILIDADE DA CARTEIRA 12M ────────────────────────
    const calcRent = arr => {
      if (!arr.length) return null;
      const media = arr.reduce((s,a)=>s+a.change12m,0)/arr.length;
      const melhor = arr.reduce((m,a)=>a.change12m>m.change12m?a:m,arr[0]);
      const pior   = arr.reduce((m,a)=>a.change12m<m.change12m?a:m,arr[0]);
      return { media:parseFloat(media.toFixed(1)), melhor:{ticker:melhor.ticker,change12m:melhor.change12m}, pior:{ticker:pior.ticker,change12m:pior.change12m} };
    };

    const hora = new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"});

    return res.status(200).json({
      date: new Date().toISOString().slice(0,10), hora,
      cambio: { usd:{valor:parseFloat(usdVal.toFixed(2)),chg:parseFloat(usdChg.toFixed(2))}, eur:{valor:parseFloat(eurVal.toFixed(2)),chg:parseFloat(eurChg.toFixed(2))} },
      acoes, fiis, criptos,
      rentabilidade: { acoes:calcRent(acoes), fiis:calcRent(fiis), criptos:calcRent(criptos) }
    });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}