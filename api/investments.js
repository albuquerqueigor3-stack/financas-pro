import Anthropic from "@anthropic-ai/sdk";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmuPHMkI2i6ptVdgRAOKELPSviB88wt9E",
  authDomain: "financas-pro-aff9b.firebaseapp.com",
  projectId: "financas-pro-aff9b",
  storageBucket: "financas-pro-aff9b.firebasestorage.app",
  messagingSenderId: "359967610480",
  appId: "1:359967610480:web:78e8c33baa99b37e4c06b5"
};

let app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const today = new Date().toISOString().slice(0, 10);

  try {
    const cached = await getDoc(doc(db, "cache", "investments_" + today));
    if (cached.exists()) return res.status(200).json(cached.data());
  } catch(e) {}

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const today_br = new Date().toLocaleDateString("pt-BR");

  const prompt = `Hoje é ${today_br}. Pesquise na internet dados reais e atuais do mercado financeiro brasileiro e retorne os melhores ativos para investir agora.

Retorne APENAS JSON válido sem markdown, sem texto extra, exatamente neste formato:
{
  "date": "${today}",
  "hora": "HH:MM",
  "cambio": {
    "usd": {"valor": 5.82, "chg": 0.3},
    "eur": {"valor": 6.31, "chg": -0.1}
  },
  "acoes": [
    {
      "rank": 1, "ticker": "PETR4", "nome": "Petrobras PN", "setor": "Energia",
      "preco": 38.50, "change12m": 42.3, "dy": 14.2, "score": 9.2,
      "entrada": "R$37,80–38,90", "alvo": "R$44,50", "alvoChg": 15,
      "stop": "R$35,20", "stopChg": -7, "rr": "1:2,1",
      "segurar": "Dez/2025", "risco": "Médio",
      "analise": "Análise detalhada de 5-7 linhas: por que entrar agora, catalisadores de alta, situação técnica atual, dividend yield projetado, riscos principais e perspectiva de médio prazo."
    }
  ],
  "fiis": [
    {
      "rank": 1, "ticker": "MXRF11", "nome": "Maxi Renda", "setor": "FII de Papel",
      "preco": 10.42, "change12m": 12.1, "dy": 11.4, "dyMensal": 0.95, "score": 9.0,
      "entrada": "R$10,20–10,50", "alvo": "R$11,80", "alvoChg": 13,
      "stop": "R$9,70", "stopChg": -7, "rr": "1:1,9",
      "segurar": "Longo prazo", "risco": "Baixo",
      "analise": "Análise detalhada de 5-7 linhas: qualidade da carteira, vacância, distribuições mensais, perspectiva de taxa Selic, gestão e riscos."
    }
  ],
  "criptos": [
    {
      "rank": 1, "ticker": "BTC", "nome": "Bitcoin", "setor": "Layer 1",
      "preco": 97400, "precoBrl": 566000, "change12m": 125, "score": 9.5,
      "entrada": "$94.000–97.000", "alvo": "$130.000", "alvoChg": 35,
      "stop": "$82.000", "stopChg": -15, "rr": "1:2,3",
      "segurar": "6–12 meses", "risco": "Alto",
      "analise": "Análise detalhada de 5-7 linhas: ciclo atual, adoção institucional, dominância, suportes técnicos, catalisadores e riscos."
    }
  ]
}

Selecione os TOP 5 reais de cada categoria com base em: rentabilidade 12m + momento técnico + fundamentos + R/R. Use dados reais pesquisados agora. Analise com profundidade — o usuário precisa entender POR QUE entrar em cada ativo.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      tool_choice: { type: "auto" },
      messages: [{ role: "user", content: prompt }]
    });

    const textBlock = response.content.find(b => b.type === "text");
    if (!textBlock?.text) return res.status(500).json({ error: "Sem resposta da IA" });

    let data;
    try {
      const clean = textBlock.text.replace(/```json[\s\S]*?```/g, m => m.slice(7,-3)).replace(/```/g,"").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
    } catch(e) {
      return res.status(500).json({ error: "JSON inválido", raw: textBlock.text.slice(0,500) });
    }

    // Detectar mudanças vs ontem
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    try {
      const prevDoc = await getDoc(doc(db, "cache", "investments_" + yesterday));
      if (prevDoc.exists()) {
        const prev = prevDoc.data();
        const changes = {};
        for (const cat of ["acoes", "fiis", "criptos"]) {
          if (!prev[cat] || !data[cat]) continue;
          const prevTickers = prev[cat].map(a => a.ticker);
          const currTickers = data[cat].map(a => a.ticker);
          const saiu = prev[cat].filter(a => !currTickers.includes(a.ticker));
          const entrou = data[cat].filter(a => !prevTickers.includes(a.ticker));
          if (saiu.length || entrou.length) changes[cat] = { saiu, entrou };
        }
        if (Object.keys(changes).length) data.changes = changes;
      }
    } catch(e) {}

    // Salvar no cache
    try { await setDoc(doc(db, "cache", "investments_" + today), data); } catch(e) {}

    return res.status(200).json(data);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}