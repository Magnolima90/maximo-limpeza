// api/lead.js — captura de leads do formulário de orçamento (Máximo Limpeza & Serviço)
//
// Para ativar o encaminhamento automático de leads (e-mail, planilha, CRM),
// configure a variável de ambiente LEAD_WEBHOOK_URL no painel do Vercel
// (Project Settings > Environment Variables) apontando para um webhook
// (Zapier, Make, n8n, Google Apps Script, etc). Sem essa variável, os leads
// ficam apenas nos logs da função (visíveis no painel do Vercel).
//
// Convenção CommonJS (module.exports = async (req, res) => {...}) usada de
// propósito: é a forma mais compatível com o deploy "zero-config" anônimo do
// Vercel (sem vercel.json de "functions" / sem package.json com "type":
// "module"), evitando qualquer ambiguidade entre ESM e CJS neste ambiente.

// Rate limiting best-effort, em memória, por IP.
// LIMITAÇÃO CONHECIDA: este Map vive apenas na instância/processo atual da
// função serverless. Ele é zerado a cada cold start e NÃO é compartilhado
// entre múltiplas instâncias concorrentes do Vercel — portanto isto reduz
// abuso básico mas não é um rate-limit confiável/production-grade. Para algo
// robusto, use Vercel KV, Upstash Redis ou serviço equivalente.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_LIMIT_MAX = 5; // no máx. 5 envios por IP por janela
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "unknown";
}

async function readJsonBody(req) {
  // Em alguns runtimes do Vercel req.body já vem parseado; em outros é
  // necessário ler o stream manualmente. Cobrimos os dois casos.
  if (req.body && typeof req.body === "object") return req.body;
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error("payload too large"));
      }
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: "method not allowed" }));
    return;
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    res.statusCode = 429;
    res.end(JSON.stringify({ ok: false, error: "too many requests, tente novamente mais tarde" }));
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: "invalid JSON body" }));
    return;
  }

  const { nome, telefone, endereco, servico, tipo, quantidade, honeypot, website } = body || {};

  // Honeypot: campo escondido que humanos não preenchem. Se vier preenchido,
  // finge sucesso (200) sem processar/encaminhar, para não alertar bots.
  const honeypotValue = honeypot || website || "";
  if (typeof honeypotValue === "string" && honeypotValue.trim() !== "") {
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (typeof nome !== "string" || nome.trim() === "" || typeof telefone !== "string" || telefone.trim() === "") {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: "nome e telefone são obrigatórios" }));
    return;
  }

  const lead = {
    nome: nome.trim(),
    telefone: telefone.trim(),
    endereco: typeof endereco === "string" ? endereco.trim() : "",
    servico: typeof servico === "string" ? servico.trim() : "",
    tipo: typeof tipo === "string" ? tipo.trim() : "",
    quantidade: typeof quantidade === "string" ? quantidade.trim() : "",
    timestamp: new Date().toISOString(),
    ip: ip
  };

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });
    } catch (err) {
      // Nunca falhar a resposta ao usuário por causa do encaminhamento —
      // apenas logamos o erro para investigação nos logs do Vercel.
      console.error("[api/lead] falha ao encaminhar para LEAD_WEBHOOK_URL:", err);
    }
  } else {
    console.log("[api/lead] novo lead (LEAD_WEBHOOK_URL não configurada):", lead);
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
};
