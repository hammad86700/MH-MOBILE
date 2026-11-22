import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  GoogleGenAI,
  ThinkingLevel,
  Type,
  type FunctionDeclaration,
} from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Simple sliding-window in-memory rate limiter for abuse protection
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);
  return false;
}

const submitRepairRequestTool: FunctionDeclaration = {
  name: 'submit_repair_request',
  description:
    'Record a customer mobile repair request ONLY after the customer has voluntarily provided their name, phone model, problem description, and contact number/method.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerName: {
        type: Type.STRING,
        description: 'Customer full name.',
      },
      contactInfo: {
        type: Type.STRING,
        description: 'Phone number, WhatsApp number, or preferred contact detail.',
      },
      whatsappNumber: {
        type: Type.STRING,
        description: 'Optional WhatsApp number if explicitly provided.',
      },
      phoneModel: {
        type: Type.STRING,
        description: 'Smartphone brand and model (e.g., Samsung Galaxy A54, iPhone 13).',
      },
      serviceName: {
        type: Type.STRING,
        description: 'Matching HM Mobile repair service category.',
      },
      problemDescription: {
        type: Type.STRING,
        description: 'Concise description of the reported phone issue.',
      },
    },
    required: [
      'customerName',
      'contactInfo',
      'phoneModel',
      'serviceName',
      'problemDescription',
    ],
  },
};

interface IncomingShopContext {
  settings?: {
    businessName?: string;
    locationAddress?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    email?: string;
    openingHours?: string;
    chatbotCustomInstructions?: string;
  };
  services?: Array<{
    name?: string;
    category?: string;
    priceLabel?: string;
    isConfirmedAvailable?: boolean;
  }>;
  accessories?: Array<{
    name?: string;
    category?: string;
    priceLabel?: string;
    availabilityStatus?: string;
  }>;
  faqs?: Array<{
    question?: string;
    answer?: string;
  }>;
  knowledgeEntries?: Array<{
    topic?: string;
    category?: string;
    content?: string;
  }>;
}

function buildSystemInstruction(ctx: IncomingShopContext): string {
  const s = ctx.settings ?? {};
  const businessName = (s.businessName || 'HM Mobile').slice(0, 100);
  const location = (s.locationAddress || 'Main Auto Market, Rahim Yar Khan, Pakistan').slice(0, 240);
  const phone = s.phoneNumber?.trim() || 'Not yet published online (customer should submit a request or check at the shop)';
  const whatsapp = s.whatsappNumber?.trim() || 'Not yet configured online (customer can submit an online service/inquiry request)';
  const email = s.email?.trim() || 'Not published online';
  const hours = s.openingHours?.trim() || 'To be confirmed — contact shop before visiting';
  const customRules = s.chatbotCustomInstructions?.trim()
    ? `\nSHOP OWNER CUSTOM INSTRUCTIONS:\n${s.chatbotCustomInstructions.slice(0, 1800)}\n`
    : '';

  const servicesBlock = (ctx.services ?? [])
    .slice(0, 30)
    .map((svc) => {
      const status = svc.isConfirmedAvailable
        ? 'Confirmed Available'
        : 'Pending Shop Confirmation (tell customer to confirm availability)';
      const price = svc.priceLabel || 'Contact for Confirmation';
      return `- ${String(svc.name ?? '').slice(0, 100)} [${String(svc.category ?? '')}] | Status: ${status} | Price: ${String(price).slice(0, 80)}`;
    })
    .join('\n');

  const accessoriesBlock = (ctx.accessories ?? [])
    .slice(0, 40)
    .map((acc) => {
      return `- ${String(acc.name ?? '').slice(0, 120)} (${String(acc.category ?? '')}) | Price: ${String(acc.priceLabel ?? 'Price on inquiry').slice(0, 80)} | Stock: ${String(acc.availabilityStatus ?? 'confirm_availability')}`;
    })
    .join('\n');

  const kbBlock = (ctx.knowledgeEntries ?? [])
    .slice(0, 20)
    .map((kb) => `- [${String(kb.category ?? 'info')}] ${String(kb.topic ?? '').slice(0, 120)}: ${String(kb.content ?? '').slice(0, 600)}`)
    .join('\n');

  const faqBlock = (ctx.faqs ?? [])
    .slice(0, 15)
    .map((f) => `Q: ${String(f.question ?? '').slice(0, 200)}\nA: ${String(f.answer ?? '').slice(0, 400)}`)
    .join('\n\n');

  return `You are the official AI Customer Support Representative for ${businessName}, located at ${location}.

LANGUAGE & TONE RULES (CRITICAL):
1. Automatically detect the customer's language on every turn and respond naturally in the SAME language:
   - English -> clear, polite, professional English.
   - Urdu script (اردو) -> natural, courteous Urdu script.
   - Roman Urdu (e.g. "Mera mobile charge nahi ho raha") -> natural, respectful Roman Urdu.
2. Keep replies clear, structured, and practical—no robotic jargon, no overlong walls of text.

STRICT FACTUALITY & ZERO-FABRICATION RULES (NON-NEGOTIABLE):
1. NEVER invent or guess product prices, repair charges, stock counts, warranty durations, repair completion times, opening hours, phone numbers, or service guarantees.
2. Clearly distinguish between:
   - General smartphone troubleshooting advice (safe steps customers can try).
   - Verified ${businessName} shop details listed below.
   - Details that require confirmation directly from ${businessName}.
3. If a repair service is marked "Pending Shop Confirmation" or an accessory is marked "confirm_availability" / "Price on inquiry", politely state that the customer should confirm live availability and exact pricing with ${businessName}.
4. NEVER claim that a repair appointment is confirmed unless the submit_repair_request tool has been invoked AND returned a real ticket reference.

SAFETY BOUNDARIES (CRITICAL):
- NEVER tell customers to open/pry lithium batteries, touch exposed charging circuits/motherboards, heat devices dangerously, bypass FRP/iCloud/screen locks illegally, or attempt risky hardware disassembly themselves.
- For hardware symptoms (swollen battery, liquid damage, overheating that persists, cracked display, charging port sparks/looseness, motherboard no-power), recommend safe immediate precautions and a professional in-shop inspection.

SMART TROUBLESHOOTING & LEAD CAPTURE:
- When a customer describes a phone issue (charging, battery drain, overheating, display, camera, speaker, network, slow performance, water damage):
  1. Ask for their smartphone brand & model if not yet shared.
  2. Ask 1 concise clarifying question (e.g., when it happens or if another cable was tested).
  3. Offer 2–3 safe, simple troubleshooting checks.
  4. Mention possible causes without claiming a confirmed diagnosis.
  5. Offer to log a repair inspection request for ${businessName} (collecting their name, phone model, problem description, and contact/WhatsApp number) OR suggest contacting the shop on WhatsApp.
- Only call submit_repair_request once the customer has explicitly given: customerName, phoneModel, problemDescription, and contactInfo (and optionally whatsappNumber).

VERIFIED SHOP PROFILE:
- Business Name: ${businessName}
- Location: ${location}
- Phone: ${phone}
- WhatsApp: ${whatsapp}
- Email: ${email}
- Business Hours: ${hours}
${customRules}
VERIFIED REPAIR SERVICES CATALOG:
${servicesBlock || '- Contact shop for current repair service list.'}

VERIFIED ACCESSORIES CATALOG:
${accessoriesBlock || '- Contact shop for current accessories availability.'}

VERIFIED SHOP POLICIES & KNOWLEDGE BASE:
${kbBlock || '- Standard inspection-first policy applies.'}

VERIFIED FAQS:
${faqBlock || '- None listed.'}`;
}

async function createServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'hm-mobile-api' });
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Too many messages sent briefly. Please wait a moment before sending another message.',
      });
    }

    const { message, history, shopContext } = req.body ?? {};

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a valid message.' });
    }
    if (message.length > 1500) {
      return res.status(400).json({ error: 'Message is too long. Please keep it under 1500 characters.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI customer support is currently unavailable. Please configure the GEMINI_API_KEY secret in Settings > Secrets.',
      });
    }

    const sanitizedHistory = Array.isArray(history)
      ? history
          .slice(-14)
          .filter(
            (item): item is { role: 'user' | 'assistant'; content: string } =>
              Boolean(item) &&
              (item.role === 'user' || item.role === 'assistant') &&
              typeof item.content === 'string' &&
              item.content.trim().length > 0
          )
          .map((item) => ({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content.slice(0, 1500) }],
          }))
      : [];

    const contents = [
      ...sanitizedHistory,
      { role: 'user', parts: [{ text: message.trim() }] },
    ];

    const systemInstruction = buildSystemInstruction(
      (shopContext && typeof shopContext === 'object' ? shopContext : {}) as IncomingShopContext
    );

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          tools: [{ functionDeclarations: [submitRepairRequestTool] }],
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const bookingCall = functionCalls.find(
          (fc) => fc.name === 'submit_repair_request'
        );
        if (bookingCall && bookingCall.args) {
          const args = bookingCall.args as Record<string, unknown>;
          const bookingDraft = {
            customerName: String(args.customerName ?? '').trim().slice(0, 100),
            contactInfo: String(args.contactInfo ?? '').trim().slice(0, 120),
            whatsappNumber: String(args.whatsappNumber ?? '').trim().slice(0, 40),
            phoneModel: String(args.phoneModel ?? '').trim().slice(0, 120),
            serviceName: String(args.serviceName ?? 'Mobile Repair Inspection').trim().slice(0, 140),
            problemDescription: String(args.problemDescription ?? '').trim().slice(0, 1500),
          };

          const hasRequiredFields =
            bookingDraft.customerName.length >= 2 &&
            bookingDraft.contactInfo.length >= 4 &&
            bookingDraft.phoneModel.length >= 2 &&
            bookingDraft.problemDescription.length >= 5;

          if (hasRequiredFields) {
            return res.json({
              reply:
                response.text?.trim() ||
                'Thank you! I am recording your repair request for HM Mobile now.',
              bookingDraft,
              suggestWhatsApp: true,
            });
          }
        }
      }

      const replyText = response.text?.trim();
      if (!replyText) {
        return res.status(502).json({
          error: 'Unable to generate a response right now. Please try again.',
        });
      }

      const lowerMsg = message.toLowerCase();
      const lowerReply = replyText.toLowerCase();
      const suggestWhatsApp =
        lowerMsg.includes('whatsapp') ||
        lowerMsg.includes('contact') ||
        lowerMsg.includes('price') ||
        lowerMsg.includes('rate') ||
        lowerReply.includes('whatsapp');
      const suggestBookingModal =
        lowerMsg.includes('book') ||
        lowerMsg.includes('appointment') ||
        lowerMsg.includes('repair request');

      return res.json({
        reply: replyText,
        suggestWhatsApp,
        suggestBookingModal,
      });
    } catch (error: unknown) {
      console.error('Gemini API error:', error);
      const errMessage = error instanceof Error ? error.message : String(error);

      if (errMessage.includes('API_KEY_INVALID') || errMessage.includes('403')) {
        return res.status(503).json({
          error:
            'AI service authentication failed. Please verify the Gemini API key in Settings > Secrets.',
        });
      }
      if (errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          error:
            'Our AI assistant is temporarily busy due to usage limits. Please try again shortly or submit a repair request directly.',
        });
      }
      return res.status(500).json({
        error:
          'Sorry, our AI support service encountered a temporary error. Please try again or reach out using our Repair Request form.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HM Mobile server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
