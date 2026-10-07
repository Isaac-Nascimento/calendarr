import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Endpoint for Real Estate Ideas & Offer Proposals
app.post('/api/ai/generate-ideas', async (req, res) => {
  try {
    const { objetivo, canal, perfilCliente, detalheCustom } = req.body;

    // If Gemini API is available, generate dynamic proposals using gemini-3.8-flash
    if (ai) {
      const prompt = `Você é um estrategista sênior de marketing imobiliário e copywriter focado no mercado imobiliário brasileiro (especialmente Maricá, Região dos Lagos e cidades em expansão).
Gere exatamente 3 ideias de pautas com propostas de ofertas comerciais de alta conversão.

Parâmetros:
- Objetivo comercial: ${objetivo || 'Venda e Lançamento Imobiliário'}
- Canal de distribuição: ${canal || 'Instagram'}
- Perfil do cliente: ${perfilCliente || 'Família buscando qualidade de vida e segurança'}
- Detalhes / Foco adicional: ${detalheCustom || 'Destaque para valorização urbana, casas lineares em condomínio, opções de entrada facilitada'}

Retorne APENAS um JSON válido (sem markdown extra, sem blocos \`\`\`json) contendo uma lista de 3 objetos com as propriedades:
- "titulo": string (gancho editorial magnético e claro)
- "propostaOferta": string (a oferta comercial concreta, ex: bônus de escritura, entrada parcelada, tour exclusivo, avaliação grátis, condição especial de pré-lançamento)
- "cta": string (chamada para ação específica para WhatsApp, direct ou formulário)
- "briefing": string (roteiro conciso com problema, gancho, dor do comprador e solução da imobiliária)
- "canal": string (${canal || 'Instagram'})
- "responsavelSugerido": string ("Mariana Silva" para copy/blog, "Carlos Souza" para design/carrossel, "Beatriz Costa" para vídeo/reels, "Rafael Mello" para anúncios Google)
- "diasParaProducao": number (geralmente 2 ou 3 dias)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim() || '[]';
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, ideas: parsed, source: 'gemini' });
      } catch (parseErr) {
        console.warn('Could not parse Gemini JSON response directly, falling back:', parseErr);
      }
    }

    // High quality domain fallback if API key is absent or model output format differs
    const fallbackIdeas = generateDomainFallback(objetivo, canal, perfilCliente, detalheCustom);
    return res.json({ success: true, ideas: fallbackIdeas, source: 'fallback' });
  } catch (error: any) {
    console.error('Error generating AI real estate ideas:', error);
    const fallbackIdeas = generateDomainFallback(req.body?.objetivo, req.body?.canal, req.body?.perfilCliente, req.body?.detalheCustom);
    return res.json({ success: true, ideas: fallbackIdeas, source: 'fallback', error: error?.message });
  }
});

function generateDomainFallback(objetivo?: string, canal?: string, perfilCliente?: string, detalheCustom?: string) {
  const chosenCanal = canal || 'Instagram';
  return [
    {
      titulo: 'Oferta Especial: Casa Linear com Quintal Gourmet e ITBI Grátis em Maricá',
      propostaOferta: 'Condição de Fechamento de Mês: Construtora assume 100% dos custos de ITBI e RGI para contratos assinados até o dia 25.',
      cta: 'Clique no link da bio e receba o book digital com vídeo tour completo no WhatsApp',
      briefing: 'Destacar o sonho do espaço privativo com piscina sem a burocracia dos custos cartorários. Apresentar fotos reais da área gourmet e simulação com entrada parcelada.',
      canal: chosenCanal,
      responsavelSugerido: 'Mariana Silva',
      diasParaProducao: 2,
    },
    {
      titulo: 'Captação Exclusiva: "Seu imóvel em Maricá vendido com Produção de Cinema e Drone"',
      propostaOferta: 'Proposta para Proprietários: Anúncio com tour em vídeo 4K, tráfego pago segmentado no RJ e avaliação mercadológica sem custo.',
      cta: 'Envie "AVALIAR" no direct para nossa equipe agendar a visita técnica ao seu imóvel',
      briefing: 'Focar na dor do proprietário que está com a placa enferrujada há meses em outras imobiliárias. Mostrar o padrão visual Inovatti e alcance de compradores qualificados da capital.',
      canal: chosenCanal,
      responsavelSugerido: 'Beatriz Costa',
      diasParaProducao: 3,
    },
    {
      titulo: 'Feirão de Financiamento: Como trocar o aluguel no RJ por sobrado próprio pagando menos de R$ 1.800/mês',
      propostaOferta: 'Análise de Crédito Expressa: Simulação gratuita em até 2 horas com Caixa, Bradesco e Itaú + uso facilitado do saldo do FGTS.',
      cta: 'Toque abaixo e faça sua simulação sem compromisso com nosso correspondente bancário',
      briefing: 'Comparativo visual do custo de aluguel em Niterói/São Gonçalo vs prestação de casa própria em condomínio com lazer em Maricá, enfatizando transporte gratuito e segurança.',
      canal: chosenCanal,
      responsavelSugerido: 'Rafael Mello',
      diasParaProducao: 2,
    },
  ];
}

// Development with Vite Middlewares or Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
