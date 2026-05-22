const BRAPI_TOKEN = "jQexPGvBYwSnoKzWGuu5Xt";

const ACOES_TICKERS = ["PETR4","VALE3","ITUB4","BBAS3","WEGE3","RENT3","RADL3","EGIE3","TAEE11","VIVT3"];
const FIIS_TICKERS  = ["MXRF11","HGLG11","XPML11","KNRI11","CPTS11","BTLG11","HSML11","IRDM11","VILG11","RBRF11"];
const CRYPTO_IDS    = ["bitcoin","ethereum","solana","binancecoin","cardano"];

function calcScore(change12m, dy) {
  let score = 5;
  if (change12m > 50) score += 2;
  else if (change12m > 20) score += 1.5;
  else if (change12m > 0) score += 0.5;
  else score -= 1;
  if (dy > 12) score += 2;
  else if (dy > 8) score += 1.5;
  else if (dy > 5) score += 1;
  return Math.min(Math.max(parseFloat(score.toFixed(1)), 5.0), 9.9);
}

function calcOp(preco, tipo) {
  const vol    = tipo==="cripto" ? 0.15 : tipo==="fii" ? 0.07 : 0.09;
  const upside = tipo==="cripto" ? 0.35 : tipo==="fii" ? 0.13 : 0.15;
  const entMin = (preco*(1-0.015)).toFixed(2);
  const entMax = (preco*(1+0.015)).toFixed(2);
  const alvo   = (preco*(1+upside)).toFixed(2);
  const stop   = (preco*(1-vol)).toFixed(2);
  return {
    entMin, entMax, alvo, alvoChg: Math.round(upside*100),
    stop, stopChg: -Math.round(vol*100), rr:`1:${(upside/vol).toFixed(1)}`
  };
}

function gerarAnalise(ticker, nome, change12m, dy, score, tipo) {
  const trend = change12m>20?"forte tendência de alta":change12m>0?"tendência positiva":"correção recente";
  const dyText = dy>10?`Dividend Yield atrativo de ${dy}% ao ano.`:dy>5?`DY de ${dy}% acima da média.`:"";
  const scoreText = score>=9?"Score máximo — oportunidade rara.":score>=8?"Score elevado — alta convicção.":"Bom ponto de entrada.";
  if (tipo==="acao") return `${nome} apresenta ${trend} com rentabilidade de ${change12m>0?"+":""}${change12m}% em 12 meses. ${dyText} Fundamentos sólidos com geração de caixa consistente. ${scoreText} Entrada próxima ao suporte técnico. Acompanhe resultados trimestrais.`;
  if (tipo==="fii") return `${nome} distribui rendimentos mensais com ${dyText} Portfólio diversificado reduz risco de vacância. Variação de ${change12m>0?"+":""}${change12m}% em 12 meses. ${scoreText} Ideal para renda mensal isenta de IR.`;
  return `${nome} acumula ${change12m>0?"+":""}${change12m}% em 12 meses com adoção crescente. Momento técnico favorável com suporte nos níveis atuais. ${scoreText} Alta volatilidade — máximo 5-10% da carteira.`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Cache-Control","s-maxage=86400");

  try {
    // CÂMBIO
    const cambioRes  = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL");
    const cambioJson = await cambioRes.json();
    const usdVal = parseFloat(cambioJson.USDBRL?.bid||5.80);
    const eurVal = parseFloat(cambioJson.EURBRL?.bid||6.30);
    const usdChg = parseFloat(cambioJson.USDBRL?.pctChange||0);
    const eurChg = parseFloat(cambioJson.EURBRL?.pctChange||0);

    // AÇÕES
    const acoesRes  = await fetch(`https://brapi.dev/api/quote/${ACOES_TICKERS.join(",")}?token=${BRAPI_TOKEN}&fundamental=true`);
    const acoesJson = await acoesRes.json();
    const acoes = (acoesJson.results||[])
      .filter(a=>a.regularMarketPrice)
      .map(a=>{
        const change12m = parseFloat(((a.regularMarketPrice-(a.fiftyTwoWeekLow||a.regularMarketPrice*0.85))/(a.fiftyTwoWeekLow||a.regularMarketPrice*0.85)*100).toFixed(1));
        const dy    = parseFloat((a.dividendYield||0).toFixed(1));
        const score = calcScore(change12m, dy);
        const op    = calcOp(a.regularMarketPrice, "acao");
        return {
          rank:0, ticker:a.symbol, nome:a.shortName||a.symbol, setor:a.sector||"B3",
          preco:a.regularMarketPrice, change12m, dy, score,
          entrada:`R$${op.entMin}–${op.entMax}`, alvo:`R$${op.alvo}`, alvoChg:op.alvoChg,
          stop:`R$${op.stop}`, stopChg:op.stopChg, rr:op.rr,
          segurar:"6–12 meses", risco:Math.abs(change12m)>40?"Médio-Alto":"Médio",
          analise:gerarAnalise(a.symbol,a.shortName||a.symbol,change12m,dy,score,"acao")
        };
      })
      .sort((a,b)=>b.score-a.score).slice(0,5).map((a,i)=>({...a,rank:i+1}));

    // FIIs
    const fiisRes  = await fetch(`https://brapi.dev/api/quote/${FIIS_TICKERS.join(",")}?token=${BRAPI_TOKEN}&fundamental=true`);
    const fiisJson = await fiisRes.json();
    const fiis = (fiisJson.results||[])
      .filter(f=>f.regularMarketPrice)
      .map(f=>{
        const change12m = parseFloat(((f.regularMarketPrice-(f.fiftyTwoWeekLow||f.regularMarketPrice*0.9))/(f.fiftyTwoWeekLow||f.regularMarketPrice*0.9)*100).toFixed(1));
        const dy      = parseFloat((f.dividendYield||0).toFixed(1));
        const dyMensal= parseFloat((dy/12).toFixed(2));
        const score   = calcScore(change12m, dy);
        const op      = calcOp(f.regularMarketPrice, "fii");
        return {
          rank:0, ticker:f.symbol, nome:f.shortName||f.symbol, setor:"FII",
          preco:f.regularMarketPrice, change12m, dy, dyMensal, score,
          entrada:`R$${op.entMin}–${op.entMax}`, alvo:`R$${op.alvo}`, alvoChg:op.alvoChg,
          stop:`R$${op.stop}`, stopChg:op.stopChg, rr:op.rr,
          segurar:"Longo prazo", risco:"Baixo",
          analise:gerarAnalise(f.symbol,f.shortName||f.symbol,change12m,dy,score,"fii")
        };
      })
      .sort((a,b)=>b.score-a.score).slice(0,5).map((a,i)=>({...a,rank:i+1}));

    // CRIPTOS
    const cryptoRes  = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(",")}&price_change_percentage=1y&order=market_cap_desc`);
    const cryptoJson = await cryptoRes.json();
    const criptos = (cryptoJson||[])
      .map(c=>{
        const change12m = parseFloat((c.price_change_percentage_1y_in_currency||0).toFixed(1));
        const score = calcScore(change12m, 0);
        const op    = calcOp(c.current_price, "cripto");
        return {
          rank:0, ticker:c.symbol?.toUpperCase(), nome:c.name, setor:"Crypto",
          preco:c.current_price, precoBrl:parseFloat((c.current_price*usdVal).toFixed(2)),
          change12m, dy:null, score,
          entrada:`$${op.entMin}–${op.entMax}`, alvo:`$${op.alvo}`, alvoChg:op.alvoChg,
          stop:`$${op.stop}`, stopChg:op.stopChg, rr:op.rr,
          segurar:"3–6 meses", risco:"Alto",
          analise:gerarAnalise(c.symbol?.toUpperCase(),c.name,change12m,0,score,"cripto")
        };
      })
      .sort((a,b)=>b.score-a.score).slice(0,5).map((a,i)=>({...a,rank:i+1}));

    const hora = new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"});

    return res.status(200).json({
      date: new Date().toISOString().slice(0,10),
      hora, cambio:{usd:{valor:usdVal,chg:usdChg},eur:{valor:eurVal,chg:eurChg}},
      acoes, fiis, criptos
    });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}