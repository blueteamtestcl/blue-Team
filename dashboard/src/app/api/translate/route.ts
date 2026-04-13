import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cweId, name, description, owaspCategory, affectedUrl } = body;

    if (!cweId || !name) {
      return NextResponse.json({ error: 'Missing alert details' }, { status: 400 });
    }

    // ═══ SISTEMA DE SANITIZACIÓN (Blue Team Compliance) ═══
    // Antes de enviar a la IA externa, eliminamos datos internos sensibles.
    // Solo enviamos el código genérico (CWE), la descripción y la categoría OWASP.
    // Jamás enviamos IPs internas, tokens, rutas de directorio ni hostnames reales.
    const sanitizedUrl = affectedUrl
      ? affectedUrl.replace(/localhost:\d+/g, '[SERVIDOR_OBJETIVO]').replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP_REDACTADA]')
      : 'No disponible';

    const prompt = `Actúa como un arquitecto de seguridad web experimentado del Blue Team.
Se ha detectado la siguiente vulnerabilidad durante una auditoría preventiva:

- Código CWE: ${cweId}
- Nombre: ${name}
- Categoría OWASP Top 10: ${owaspCategory || 'No clasificada'}
- URL afectada (sanitizada): ${sanitizedUrl}
- Descripción técnica: ${description}

Estructura tu respuesta en español usando formato Markdown con estas 4 secciones:

## 🔍 ¿Qué significa esta vulnerabilidad?
Explica en lenguaje claro y comprensible (para un analista junior que recién se integra al Blue Team) qué es este fallo, por qué existe, y qué podría hacer un atacante del Red Team si lo encuentra primero. Usa analogías simples.

## ⚠️ Impacto en la Organización
Detalla el impacto técnico y humano: qué datos quedan expuestos, cómo afecta la confianza de los clientes, el estrés operativo del equipo de TI, y las consecuencias legales/reputacionales para la empresa.

## 🛡️ Código de Remediación (Parche del Blue Team)
Proporciona el fragmento de código EXACTO y listo para copiar-pegar que el analista debe aplicar para cerrar esta vulnerabilidad. Incluye soluciones para:
- **Next.js / Node.js** (código de la aplicación)
- **Nginx / Servidores Base** (si aplica. MUY IMPORTANTE: Agrega una nota aclarando explícitamente que los parches de infraestructura como Nginx/Apache SOLO se aplican si la arquitectura usa un servidor dedicado, local o VPS pequeño. Aclara que si la app usa servicios cloud gestionados o CDN como Cloudflare, Vercel o AWS, estas protecciones suelen venir preconfiguradas o se gestionan desde los paneles web protectores, no en archivos .conf).
Cada bloque de código debe estar en un bloque de código con el lenguaje especificado.

## 📋 Verificación Post-Parche
Indica los pasos exactos para verificar que el parche fue aplicado correctamente (comandos curl, pruebas manuales, o herramientas).

No saludes ni introduzcas. Ve directo al contenido técnico con formato corporativo impecable.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un arquitecto senior de ciberseguridad del Blue Team. Respondes exclusivamente en español formal. Tu prioridad es proteger la organización alineándote SIEMPRE con los estándares más recientes de OWASP Top 10 (2025 o superior) y CWE. Cada respuesta debe ser accionable, estar basada en las últimas normativas de seguridad, e incluir código real de remediación moderno.'
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2048,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No se recibió respuesta de la IA.';

    return NextResponse.json({ translation: aiResponse });

  } catch (error) {
    console.error('Error in Groq Translation API:', error);
    return NextResponse.json({ error: 'Failed to translate vulnerability' }, { status: 500 });
  }
}
