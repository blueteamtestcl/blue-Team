/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from '@/lib/logoBase64';

interface Alert {
  id: string;
  source: string;
  cweId: string;
  owaspCategory: string;
  name: string;
  severity: string;
  riskScore: number;
  description: string;
  affectedUrl: string;
  evidence: string;
}

interface AuditLog {
  action: string;
  timestamp: string;
  type: string;
}

interface SpiderResult {
  url: string;
  method: string;
  status?: number;
  type: string;
  context?: string;
}

interface ReportData {
  target: string;
  alerts: Alert[];
  patchedAlerts: string[];
  auditLogs: AuditLog[];
  spiderResults: SpiderResult[];
  scanSummary: { critical: number; high: number; medium: number; low: number } | null;
  observatoryGrade: string;
  observatoryScore?: number;
  observatoryTests?: Array<{name: string; pass: boolean; result: string; scoreModifier: number; description: string}>;
  scanMode: string;
}

const COLORS = {
  primary: [15, 23, 42] as [number, number, number],       // slate-950
  accent: [59, 130, 246] as [number, number, number],       // blue-500
  critical: [239, 68, 68] as [number, number, number],      // red-500
  high: [249, 115, 22] as [number, number, number],         // orange-500
  medium: [234, 179, 8] as [number, number, number],        // yellow-500
  low: [59, 130, 246] as [number, number, number],          // blue-500
  green: [34, 197, 94] as [number, number, number],         // green-500
  white: [255, 255, 255] as [number, number, number],
  gray: [148, 163, 184] as [number, number, number],        // slate-400
  darkGray: [30, 41, 59] as [number, number, number],       // slate-800
};

function sevColor(severity: string): [number, number, number] {
  const map: Record<string, [number, number, number]> = {
    Critical: COLORS.critical,
    High: COLORS.high,
    Medium: COLORS.medium,
    Low: COLORS.low,
  };
  return map[severity] || COLORS.gray;
}

export function generatePDFReport(data: ReportData): void {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    encryption: {
      userPassword: 'blue',
      ownerPassword: 'blue',
      userPermissions: ['print', 'copy']
    }
  });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;

  const checkPage = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  };

  // ═══════════════════════════════════════
  // PORTADA
  // ═══════════════════════════════════════
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 297, 'F');

  // Línea decorativa superior
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, 210, 4, 'F');

  // Logo/Shield
  // Calculamos el centro: X central es 105, la imagen es cuadrada de 40x40 -> x=85
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 85, 60, 40, 40);
  } else {
    // Respaldo por si no llegara a cargar
    doc.setFillColor(...COLORS.accent);
    doc.circle(105, 80, 20, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(24);
    doc.text('🛡️', 98, 86);
  }

  // Título
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME DE EVALUACIÓN', 105, 125, { align: 'center' });
  doc.text('DE VULNERABILIDADES', 105, 137, { align: 'center' });

  // Subtítulo
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.accent);
  doc.text('VULNERABILITY ASSESSMENT REPORT', 105, 152, { align: 'center' });

  // Línea separadora
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(60, 160, 150, 160);

  // Información del informe
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.gray);
  doc.setFont('helvetica', 'normal');

  const reportDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const reportId = `BT-${Date.now().toString(36).toUpperCase()}`;

  doc.text(`Objetivo: ${data.target}`, 105, 180, { align: 'center' });
  doc.text(`Fecha: ${reportDate}`, 105, 190, { align: 'center' });
  doc.text(`ID Reporte: ${reportId}`, 105, 200, { align: 'center' });
  doc.text(`Modo: ${data.scanMode === 'real' ? 'Escaneo Real (Producción)' : 'Simulación (Cyber Range)'}`, 105, 210, { align: 'center' });

  // Clasificación
  doc.setFillColor(...COLORS.critical);
  doc.roundedRect(65, 230, 80, 12, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLASIFICACIÓN: CONFIDENCIAL', 105, 238, { align: 'center' });

  // Footer portada
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Blue Team Defense Center — Vulnerability Management & Threat Intelligence', 105, 280, { align: 'center' });
  doc.text('Generado automáticamente por el motor de análisis Groq LLaMA 3.3 70B', 105, 286, { align: 'center' });

  // ═══════════════════════════════════════
  // PÁGINA 2: ÍNDICE
  // ═══════════════════════════════════════
  doc.addPage();
  y = 30;

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, 210, 4, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ÍNDICE', margin, y);
  y += 5;
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(1);
  doc.line(margin, y, margin + 30, y);
  y += 15;

  const tocItems = [
    { num: '1', title: 'Resumen Ejecutivo', page: '3' },
    { num: '2', title: 'Alcance y Metodología', page: '3' },
    { num: '3', title: 'Matriz de Riesgo', page: '4' },
    { num: '4', title: 'Hallazgos Detallados', page: '4' },
    { num: '5', title: 'Superficie de Ataque (Spider)', page: String(5 + Math.ceil(data.alerts.length / 2)) },
    { num: '6', title: 'Acciones de Remediación Aplicadas', page: String(6 + Math.ceil(data.alerts.length / 2)) },
    { num: '7', title: 'Registro de Auditoría', page: String(7 + Math.ceil(data.alerts.length / 2)) },
    { num: '8', title: 'Conclusiones y Recomendaciones', page: String(8 + Math.ceil(data.alerts.length / 2)) },
  ];

  tocItems.forEach(item => {
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.num}.`, margin, y);
    doc.text(item.title, margin + 10, y);
    doc.setTextColor(...COLORS.accent);
    doc.text(item.page, pageW - margin, y, { align: 'right' });

    doc.setDrawColor(50, 60, 80);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin + 10 + doc.getTextWidth(item.title) + 2, y, pageW - margin - doc.getTextWidth(item.page) - 2, y);
    doc.setLineDashPattern([], 0);
    y += 10;
  });

  // ═══════════════════════════════════════
  // PÁGINA 3: RESUMEN EJECUTIVO
  // ═══════════════════════════════════════
  doc.addPage();
  y = 20;

  // Header de cada página
  const addPageHeader = () => {
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, 210, 12, 'F');
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 0, 210, 2, 'F');
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Blue Team Defense Center — Informe de Evaluación de Vulnerabilidades', margin, 9);
    doc.text(`ID: ${reportId}`, pageW - margin, 9, { align: 'right' });
  };

  addPageHeader();
  y = 25;

  // § 1 — Resumen Ejecutivo
  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Resumen Ejecutivo', margin, y);
  y += 10;

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const totalVulns = data.alerts.length;
  const resolvedCount = data.patchedAlerts.length;
  const crit = data.scanSummary?.critical || 0;
  const high = data.scanSummary?.high || 0;

  const execSummary = `Se realizó una evaluación de seguridad sobre el objetivo ${data.target} utilizando herramientas automatizadas de análisis (OWASP ZAP, Mozilla Observatory) integradas con inteligencia artificial (Groq LLaMA 3.3 70B) para traducción contextual y generación de código de remediación.

Se identificaron un total de ${totalVulns} vulnerabilidades, de las cuales ${crit} son de severidad CRÍTICA y ${high} de severidad ALTA. Durante la sesión de auditoría, se aplicaron ${resolvedCount} parches de mitigación, reduciendo la exposición del sistema a ataques conocidos.

${crit > 0 ? 'ADVERTENCIA: Se detectaron vulnerabilidades críticas que requieren atención inmediata para prevenir compromiso total del sistema.' : 'No se detectaron vulnerabilidades de nivel crítico.'}`;

  const lines = doc.splitTextToSize(execSummary, contentW);
  doc.text(lines, margin, y);
  y += lines.length * 4.5 + 10;

  // § 2 — Alcance y Metodología
  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Alcance y Metodología', margin, y);
  y += 10;

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  autoTable(doc, {
    startY: y,
    head: [['Parámetro', 'Valor']],
    body: [
      ['Objetivo', data.target],
      ['Tipo de Escaneo', data.scanMode === 'real' ? 'Escaneo Real (Producción)' : 'Simulación Controlada (Cyber Range)'],
      ['Motor de Escaneo', 'OWASP ZAP v2.15.0 + Mozilla Observatory v3.0'],
      ['Motor de IA', 'Groq — LLaMA 3.3 70B Versatile'],
      ['Metodología', 'OWASP Testing Guide v4.2 + PTES (Penetration Testing Execution Standard)'],
      ['Fecha', reportDate],
      ['Calificación Observatory', data.observatoryGrade || 'N/A'],
      ['Clasificación', 'CONFIDENCIAL — Solo para personal autorizado'],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.accent, textColor: COLORS.white, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [80, 80, 80] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: margin, right: margin },
    tableWidth: contentW,
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ═══════════════════════════════════════
  // MATRIZ DE RIESGO
  // ═══════════════════════════════════════
  checkPage(80);

  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Matriz de Riesgo', margin, y);
  y += 10;

  // Cuadro visual de severidades
  const sevData = [
    { label: 'CRÍTICAS', count: data.scanSummary?.critical || 0, color: COLORS.critical },
    { label: 'ALTAS', count: data.scanSummary?.high || 0, color: COLORS.high },
    { label: 'MEDIAS', count: data.scanSummary?.medium || 0, color: COLORS.medium },
    { label: 'BAJAS', count: data.scanSummary?.low || 0, color: COLORS.low },
    { label: 'RESUELTAS', count: resolvedCount, color: COLORS.green },
  ];

  const boxW = (contentW - 4 * 4) / 5;
  sevData.forEach((s, i) => {
    const x = margin + i * (boxW + 4);
    doc.setFillColor(...s.color);
    doc.roundedRect(x, y, boxW, 22, 2, 2, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(String(s.count), x + boxW / 2, y + 12, { align: 'center' });
    doc.setFontSize(6);
    doc.text(s.label, x + boxW / 2, y + 18, { align: 'center' });
  });
  y += 35;

  // Tabla resumen de hallazgos
  autoTable(doc, {
    startY: y,
    head: [['ID', 'CWE', 'Vulnerabilidad', 'Severidad', 'OWASP', 'Estado']],
    body: data.alerts.map(a => [
      a.id.split('-')[1] || a.id,
      a.cweId,
      a.name.substring(0, 40),
      a.severity,
      a.owaspCategory.substring(0, 25),
      data.patchedAlerts.includes(a.id) ? '[MITIGADA]' : '[PENDIENTE]',
    ]),
    theme: 'grid',
    headStyles: { fillColor: COLORS.darkGray, textColor: COLORS.white, fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [80, 80, 80] },
    columnStyles: {
      3: { cellWidth: 18 },
    },
    didParseCell: (hookData: any) => {
      if (hookData.section === 'body' && hookData.column.index === 3) {
        const sev = hookData.cell.raw as string;
        hookData.cell.styles.textColor = sevColor(sev);
        hookData.cell.styles.fontStyle = 'bold';
      }
      if (hookData.section === 'body' && hookData.column.index === 5) {
        const val = hookData.cell.raw as string;
        if (val.includes('Mitigada')) {
          hookData.cell.styles.textColor = COLORS.green;
          hookData.cell.styles.fontStyle = 'bold';
        } else {
          hookData.cell.styles.textColor = COLORS.critical;
        }
      }
    },
    margin: { left: margin, right: margin },
    tableWidth: contentW,
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ═══════════════════════════════════════
  // HALLAZGOS DETALLADOS
  // ═══════════════════════════════════════
  doc.addPage();
  addPageHeader();
  y = 25;

  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Hallazgos Detallados', margin, y);
  y += 12;

  data.alerts.forEach((alert, idx) => {
    checkPage(60);
    if (y > 250) {
      doc.addPage();
      addPageHeader();
      y = 25;
    }

    // Finding header
    const sc = sevColor(alert.severity);
    doc.setFillColor(...sc);
    doc.roundedRect(margin, y, contentW, 8, 1, 1, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`4.${idx + 1}  ${alert.cweId} — ${alert.name}`, margin + 3, y + 5.5);
    const statusText = data.patchedAlerts.includes(alert.id) ? 'MITIGADA' : alert.severity.toUpperCase();
    doc.text(statusText, pageW - margin - 3, y + 5.5, { align: 'right' });
    y += 12;

    // Finding details table
    autoTable(doc, {
      startY: y,
      body: [
        ['CWE', alert.cweId],
        ['Categoría OWASP', alert.owaspCategory],
        ['Fuente', alert.source],
        ['URL Afectada', alert.affectedUrl],
        ['Puntuación de Riesgo', `${alert.riskScore}/10`],
        ['Descripción', alert.description],
        ['Evidencia', alert.evidence || 'Ver análisis de IA'],
        ['Estado', data.patchedAlerts.includes(alert.id) ? '[MITIGADA] — Parche aplicado durante la sesión' : '[PENDIENTE] — Requiere remediación'],
      ],
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold', textColor: [80, 80, 80], fontSize: 8 },
        1: { textColor: [60, 60, 60], fontSize: 8 },
      },
      margin: { left: margin, right: margin },
      tableWidth: contentW,
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  });

  // ═══════════════════════════════════════
  // MOZILLA OBSERVATORY TESTS
  // ═══════════════════════════════════════
  if (data.observatoryTests && data.observatoryTests.length > 0) {
    doc.addPage();
    addPageHeader();
    y = 25;

    doc.setTextColor(...COLORS.accent);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Mozilla Observatory Security Tests', margin, y);
    y += 10;

    // Resumen de la nota
    doc.setFillColor(...(data.observatoryScore || 0) >= 80 ? COLORS.green : (data.observatoryScore || 0) >= 50 ? COLORS.medium : COLORS.critical);
    doc.roundedRect(margin, y, 90, 20, 2, 2, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(14);
    doc.text(`Nota Oficial:   ${data.observatoryGrade}`, margin + 5, y + 8);
    doc.setFontSize(10);
    doc.text(`Puntuación de Seguridad: ${data.observatoryScore}/100`, margin + 5, y + 16);

    y += 30;

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize('A continuación se detallan los resultados de los 10 tests de seguridad estandarizados, evaluando la adopción de cabeceras de servidor modernas y buenas prácticas criptográficas.', contentW), margin, y);
    y += 10;

    const testsData = data.observatoryTests.map(t => [
      t.pass ? 'PASS' : 'FAIL',
      t.name.replace('→', '->'),
      t.pass ? 'Implementado' : 'Faltante',
      t.scoreModifier === 0 ? 'Neutro' : `${t.scoreModifier > 0 ? '+' : ''}${t.scoreModifier} pts`,
      t.description.substring(0, 70)
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Estado', 'Test de Seguridad', 'Condición', 'Impacto', 'Descripción']],
      body: testsData,
      theme: 'grid',
      headStyles: { fillColor: COLORS.darkGray, textColor: COLORS.white, fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [80, 80, 80] },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: 'bold' },
        1: { cellWidth: 35, fontStyle: 'bold' },
        3: { cellWidth: 15 },
      },
      didParseCell: (hookData: any) => {
        if (hookData.section === 'body' && hookData.column.index === 0) {
          const val = hookData.cell.raw as string;
          if (val.includes('PASS')) hookData.cell.styles.textColor = COLORS.green;
          if (val.includes('FAIL')) hookData.cell.styles.textColor = COLORS.critical;
        }
      },
      margin: { left: margin, right: margin },
      tableWidth: contentW,
    });

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // ═══════════════════════════════════════
  // SPIDER / SUPERFICIE DE ATAQUE
  // ═══════════════════════════════════════
  if (data.spiderResults.length > 0) {
    doc.addPage();
    addPageHeader();
    y = 25;

    doc.setTextColor(...COLORS.accent);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${(data.observatoryTests && data.observatoryTests.length > 0) ? '6' : '5'}. Superficie de Ataque (Spider/Crawler)`, margin, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Se descubrieron ${data.spiderResults.length} endpoints durante la fase de reconocimiento.`, margin, y + 5);
    y += 15;

    autoTable(doc, {
      startY: y,
      head: [['URL', 'Método', 'Tipo', 'Contexto']],
      body: data.spiderResults.map(sr => [
        sr.url.substring(0, 55),
        sr.method,
        sr.type,
        sr.context || '-',
      ]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.darkGray, textColor: COLORS.white, fontSize: 7, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, textColor: [80, 80, 80] },
      margin: { left: margin, right: margin },
      tableWidth: contentW,
    });

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // ═══════════════════════════════════════
  // REMEDIACIONES APLICADAS
  // ═══════════════════════════════════════
  doc.addPage();
  addPageHeader();
  y = 25;

    let chapterNum = 6;
    if (data.spiderResults.length > 0) chapterNum++;
    if (data.observatoryTests && data.observatoryTests.length > 0) chapterNum++;

    doc.setTextColor(...COLORS.accent);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${chapterNum}. Acciones de Remediación Aplicadas`, margin, y);
    y += 12;

  if (data.patchedAlerts.length === 0) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('No se aplicaron parches durante esta sesión de auditoría.', margin, y);
    y += 10;
  } else {
    const patchedDetails = data.alerts
      .filter(a => data.patchedAlerts.includes(a.id))
      .map(a => [a.cweId, a.name, a.severity, '[APLICADO Y VERIFICADO]']);

    autoTable(doc, {
      startY: y,
      head: [['CWE', 'Vulnerabilidad', 'Severidad', 'Estado']],
      body: patchedDetails,
      theme: 'grid',
      headStyles: { fillColor: COLORS.green, textColor: COLORS.white, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [80, 80, 80] },
      margin: { left: margin, right: margin },
      tableWidth: contentW,
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ═══════════════════════════════════════
  // AUDIT LOG
  // ═══════════════════════════════════════
  y += 5;
  checkPage(40);

  let auditChapterNum = 7;
  if (data.spiderResults.length > 0) auditChapterNum++;
  if (data.observatoryTests && data.observatoryTests.length > 0) auditChapterNum++;

  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${auditChapterNum}. Registro de Auditoría (Cadena de Custodia)`, margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Registro inmutable de todas las acciones realizadas durante la sesión.', margin, y + 5);
  y += 15;

  const logEntries = data.auditLogs.slice(0, 30).map(log => {
    // Remove emojis to prevent jsPDF text width calculation issues
    const cleanAction = log.action.replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F]/g, '').trim();
    return [
      new Date(log.timestamp).toLocaleTimeString(),
      log.type.toUpperCase(),
      cleanAction.substring(0, 80),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Hora', 'Tipo', 'Acción']],
    body: logEntries,
    theme: 'grid',
    headStyles: { fillColor: COLORS.darkGray, textColor: COLORS.white, fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 6.5, textColor: [80, 80, 80] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18 },
    },
    margin: { left: margin, right: margin },
    tableWidth: contentW,
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ═══════════════════════════════════════
  // CONCLUSIONES
  // ═══════════════════════════════════════
  doc.addPage();
  addPageHeader();
  y = 25;

  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${auditChapterNum + 1}. Conclusiones y Recomendaciones`, margin, y);
  y += 12;

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const conclusions = `La infraestructura auditada (${data.target}) presenta un nivel de riesgo ${crit > 0 ? 'CRÍTICO' : high > 0 ? 'ALTO' : 'MODERADO'} basado en los hallazgos identificados.

Recomendaciones prioritarias:

1. INMEDIATO (0-24 horas): Remediar todas las vulnerabilidades de severidad Crítica. ${crit > 0 ? `Se identificaron ${crit} hallazgo(s) crítico(s) que permiten compromiso completo del sistema.` : 'No se encontraron vulnerabilidades críticas.'}

2. CORTO PLAZO (1-7 días): Remediar vulnerabilidades de severidad Alta. ${high > 0 ? `Se identificaron ${high} hallazgo(s) de alta severidad que exponen datos sensibles o funcionalidad crítica.` : ''}

3. MEDIANO PLAZO (1-30 días): Implementar cabeceras de seguridad HTTP faltantes y configurar WAF (Web Application Firewall) para protección en capa de aplicación.

4. CONTINUO: Implementar un programa de gestión de vulnerabilidades con escaneos automatizados periódicos y auditorías trimestrales.

Estado de Remediación:
— Vulnerabilidades identificadas: ${totalVulns}
— Vulnerabilidades mitigadas durante la sesión: ${resolvedCount}
— Vulnerabilidades pendientes: ${totalVulns - resolvedCount}
— Cobertura de remediación: ${totalVulns > 0 ? Math.round((resolvedCount / totalVulns) * 100) : 0}%`;

  const concLines = doc.splitTextToSize(conclusions, contentW);
  doc.text(concLines, margin, y);
  y += concLines.length * 4 + 20;

  // Firma
  checkPage(40);
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 60, y);
  y += 5;
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.text('Analista de Seguridad — Blue Team', margin, y);
  y += 4;
  doc.text(`Fecha: ${reportDate}`, margin, y);
  y += 4;
  doc.text('Blue Team Defense Center', margin, y);

  // Segunda firma
  doc.setDrawColor(...COLORS.accent);
  doc.line(pageW - margin - 60, y - 13, pageW - margin, y - 13);
  doc.text('Revisado por: Líder de SOC', pageW - margin - 60, y - 8);
  doc.text(`Fecha: ${reportDate}`, pageW - margin - 60, y - 4);

  // Footer con clasificación
  y += 20;
  doc.setFillColor(...COLORS.critical);
  doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENTO CONFIDENCIAL — Distribución restringida al equipo de seguridad autorizado', 105, y + 6.5, { align: 'center' });

  // ═══ GUARDAR ═══
  const filename = `Informe_Vulnerabilidades_${data.target.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
