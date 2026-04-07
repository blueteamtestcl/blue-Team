import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('target') || 'http://localhost:3001';

  const scanTimestamp = new Date().toISOString();

  // ═══ FASE 1: Simulación de Spider/Crawler ═══
  const spiderResults = [
    { url: `${target}/`, method: 'GET', status: 200, type: 'page' },
    { url: `${target}/search`, method: 'GET', status: 200, type: 'page' },
    { url: `${target}/search?q=test`, method: 'GET', status: 200, type: 'dynamic' },
    { url: `${target}/api/login`, method: 'POST', status: 401, type: 'api' },
    { url: `${target}/_next/static/`, method: 'GET', status: 200, type: 'asset' },
    { url: `${target}/favicon.ico`, method: 'GET', status: 200, type: 'asset' },
  ];

  // ═══ FASE 2: Alertas de Vulnerabilidades (OWASP ZAP + Mozilla Observatory) ═══
  const mockAlerts = [
    {
      id: 'alert-1',
      source: 'OWASP ZAP (Active Scan)',
      cweId: 'CWE-89',
      cveId: 'CVE-2024-23897',
      owaspCategory: 'A03:2021 – Injection',
      name: 'SQL Injection en formulario de Login',
      severity: 'Critical',
      riskScore: 10,
      description: `El formulario POST en ${target}/api/login construye consultas SQL mediante concatenación directa de cadenas sin parametrización. Un atacante puede inyectar "admin' OR '1'='1" para evadir la autenticación.`,
      affectedUrl: `${target}/api/login`,
      evidence: "Parámetro 'username' no sanitizado. Respuesta devuelve token con payload malicioso.",
      timestamp: scanTimestamp,
    },
    {
      id: 'alert-2',
      source: 'OWASP ZAP (Active Scan)',
      cweId: 'CWE-79',
      cveId: 'N/A',
      owaspCategory: 'A03:2021 – Injection (XSS)',
      name: 'Cross-Site Scripting (XSS Reflejado)',
      severity: 'High',
      riskScore: 8,
      description: `El endpoint ${target}/search renderiza el parámetro GET "q" directamente en el DOM mediante dangerouslySetInnerHTML sin sanitización.`,
      affectedUrl: `${target}/search?q=<script>alert(1)</script>`,
      evidence: "Respuesta HTML contiene payload sin codificación. Ejecución de JS arbitrario confirmada.",
      timestamp: scanTimestamp,
    },
    {
      id: 'alert-3',
      source: 'Mozilla Observatory',
      cweId: 'CWE-693',
      cveId: 'N/A',
      owaspCategory: 'A05:2021 – Security Misconfiguration',
      name: 'Content-Security-Policy (CSP) ausente',
      severity: 'High',
      riskScore: 7,
      description: `El servidor no implementa Content-Security-Policy. Sin CSP, el navegador permite carga y ejecución de scripts desde cualquier origen externo.`,
      affectedUrl: target,
      evidence: "HTTP Response Headers: CSP ausente. Mozilla Observatory Score: F (0/100).",
      timestamp: scanTimestamp,
    },
    {
      id: 'alert-4',
      source: 'Mozilla Observatory',
      cweId: 'CWE-16',
      cveId: 'N/A',
      owaspCategory: 'A05:2021 – Security Misconfiguration',
      name: 'X-Content-Type-Options Header ausente',
      severity: 'Medium',
      riskScore: 5,
      description: `El servidor no envía "X-Content-Type-Options: nosniff". Esto permite que el navegador interprete archivos con un tipo MIME incorrecto (MIME Sniffing).`,
      affectedUrl: target,
      evidence: "Header 'X-Content-Type-Options' ausente en todas las respuestas HTTP.",
      timestamp: scanTimestamp,
    },
    {
      id: 'alert-5',
      source: 'Mozilla Observatory',
      cweId: 'CWE-1021',
      cveId: 'N/A',
      owaspCategory: 'A05:2021 – Security Misconfiguration',
      name: 'X-Frame-Options Header ausente (Clickjacking)',
      severity: 'Medium',
      riskScore: 5,
      description: `Sin X-Frame-Options, un atacante puede incrustar la página en un iframe invisible para engañar al usuario (Clickjacking).`,
      affectedUrl: target,
      evidence: "Header 'X-Frame-Options' ausente. Página embebible sin restricción.",
      timestamp: scanTimestamp,
    },
    {
      id: 'alert-6',
      source: 'Mozilla Observatory',
      cweId: 'CWE-319',
      cveId: 'N/A',
      owaspCategory: 'A02:2021 – Cryptographic Failures',
      name: 'Strict-Transport-Security (HSTS) ausente',
      severity: 'Medium',
      riskScore: 4,
      description: `Sin HSTS, un atacante Man-in-the-Middle puede interceptar comunicaciones HTTP en texto plano capturando credenciales y datos financieros.`,
      affectedUrl: target,
      evidence: "Header 'Strict-Transport-Security' ausente. SSL Stripping posible.",
      timestamp: scanTimestamp,
    },
    {
      id: 'alert-7',
      source: 'OWASP ZAP (Passive Scan)',
      cweId: 'CWE-200',
      cveId: 'N/A',
      owaspCategory: 'A01:2021 – Broken Access Control',
      name: 'Exposición de información en respuestas de error',
      severity: 'Low',
      riskScore: 2,
      description: `El endpoint de login devuelve mensajes de error diferenciados que permiten enumerar usuarios válidos para ataques de fuerza bruta dirigidos.`,
      affectedUrl: `${target}/api/login`,
      evidence: "Respuestas HTTP con mensajes distintos para usuario inexistente vs contraseña incorrecta.",
      timestamp: scanTimestamp,
    },
  ];

  const summary = {
    critical: mockAlerts.filter(a => a.severity === 'Critical').length,
    high: mockAlerts.filter(a => a.severity === 'High').length,
    medium: mockAlerts.filter(a => a.severity === 'Medium').length,
    low: mockAlerts.filter(a => a.severity === 'Low').length,
  };

  return NextResponse.json({
    target,
    scanEngine: 'OWASP ZAP v2.15.0 + Mozilla Observatory v3.0',
    scanDate: scanTimestamp,
    totalAlerts: mockAlerts.length,
    spiderResults,
    summary,
    alerts: mockAlerts,
    observatoryGrade: 'F',
    observatoryScore: 0,
  });
}
