# Blue Team Defense Center - Vulnerability Scanner

> **[English](#english)** | **[Espanol](#espanol)**

---

<a name="english"></a>
## English

### 1. Legal Disclaimer and Rules of Engagement (RoE)
**WARNING:** This tool is an educational Cyber Range designed exclusively for defensive security professionals, sysadmins, and students to understand offensive methodologies and improve target hardening.
- Operating this vulnerability scanner or the ZAP/Spider functionality against any domain, IP, or network infrastructure not owned by you or without express written consent from the owner is strictly prohibited and constitutes a federal cybercrime.
- The authors and contributors of this tool assume absolutely no liability for any misuse, damage, or legal consequences caused by the execution of these scripts.
- Use of this software implies full comprehension and agreement with these terms. Operate exclusively on authorized local variables (e.g., localhost) or self-owned test domains.

### 2. System Architecture
This Blue Team Cyber Range is constructed utilizing advanced modern frameworks tailored for enterprise auditing:
- **Frontend / Dashboard Analytics:** Next.js, React, Tailwind CSS, Recharts for visual intelligence.
- **Threat Intelligence Core:** Groq API (LLaMA 3.3 70B Versatile) fine-tuned specifically to OWASP Top 10 (2021) guidelines for real-time remediation.
- **Surface Reconnaissance:** Integrated spider/crawler evaluating network vectors based on OWASP ZAP methodologies.
- **Infrastructure Auditing:** Deep integration with Mozilla Observatory V2 API to validate HTTPS/TLS state and modern security headers.

### 3. Dual Report Generation
The platform generates two independent PDF reports from the same scan session:
1. **Executive Report (Client-facing):** High-level risk summary with severity matrices, chain of custody, and remediation status. Designed for non-technical stakeholders.
2. **Technical Playbook (Developer-facing):** The system queries the AI engine in batch mode for every detected vulnerability, waits for each structured remediation response, and assembles a comprehensive developer guide with exact code patches and OWASP references.

### 4. Installation and Setup
Ensure `Node.js` (v18+) is installed on your computer.

1. Obtain a free API key from [Groq Cloud](https://console.groq.com/).
2. Create a file called `.env.local` inside the `/dashboard` folder with the following content:
   ```
   GROQ_API_KEY=your_key_here
   ```
3. Run the automated setup script for your OS:
   - Windows: Execute `install.bat` to automatically install all Node dependencies across sub-projects.
4. Launch the environment using `start_all.bat`.

### 5. Educational Guide: Manual Vulnerability Verification
Before relying on automated scanners, security analysts must understand how to detect exposed vectors manually.
1. **Header Inspection:** Open your browser's Developer Tools (F12). Navigate to the "Network" tab. Reload the page. Click the main document file. Under "Headers" -> "Response Headers", look for missing controls such as `Content-Security-Policy` or `Strict-Transport-Security`.
2. **Surface Reconnaissance:** In the Developer Tools "Elements" tab, inspect the DOM tree for hidden API routes or unused `<a>` refs pointing to staging environments. Press `CTRL+U` to read raw source code and identify exposed administrative comments.
3. **Automated Validation:** After running the manual checks, utilize the Blue Team Defense Center scanner to correlate findings, fetch the exact theoretical risk regarding OWASP, and obtain the AI-generated remediation patches.

### 6. Project Structure
```
blue-team/
  dashboard/             # Main Blue Team Dashboard (Next.js)
    src/
      app/
        api/
          real-scan/     # Mozilla Observatory V2 + HTTP Header analysis
          real-spider/   # Surface reconnaissance crawler
          scan/          # Simulated scan engine (Cyber Range mode)
          translate/     # Groq AI remediation endpoint
        page.tsx         # Main dashboard UI
      lib/
        generateReport.ts          # Executive PDF generator
        generateTechnicalReport.ts # Technical Playbook PDF generator
  pagina_de_prueba/      # Intentionally vulnerable test target (for Cyber Range mode)
  install.bat            # Automated dependency installer
  start_all.bat          # Launch both servers simultaneously
```

---

<a name="espanol"></a>
## Espanol

### 1. Aviso Legal y Reglas de Enfrentamiento (RoE)
**ADVERTENCIA:** Esta herramienta es un Cyber Range educativo disenado exclusivamente para profesionales de seguridad defensiva, administradores de sistemas y estudiantes que necesitan comprender metodologias ofensivas para mejorar el hardening de sus objetivos.
- Operar este escaner de vulnerabilidades o la funcionalidad ZAP/Spider contra cualquier dominio, IP o infraestructura de red que no sea de su propiedad o sin consentimiento escrito expreso del propietario esta estrictamente prohibido y constituye un delito informatico.
- Los autores y contribuidores de esta herramienta no asumen absolutamente ninguna responsabilidad por cualquier uso indebido, dano o consecuencia legal causada por la ejecucion de estos scripts.
- El uso de este software implica la comprension total y el acuerdo con estos terminos. Opere exclusivamente en entornos locales autorizados (por ejemplo, localhost) o dominios de prueba de su propiedad.

### 2. Arquitectura del Sistema
Este Cyber Range de Blue Team esta construido utilizando frameworks modernos avanzados orientados a auditoria empresarial:
- **Frontend / Dashboard Analitico:** Next.js, React, Tailwind CSS, Recharts para inteligencia visual.
- **Nucleo de Inteligencia de Amenazas:** API de Groq (LLaMA 3.3 70B Versatile) configurada especificamente bajo las directrices OWASP Top 10 (2021) para remediacion en tiempo real.
- **Reconocimiento de Superficie:** Spider/Crawler integrado que evalua vectores de red basado en metodologias de OWASP ZAP.
- **Auditoria de Infraestructura:** Integracion profunda con la API V2 de Mozilla Observatory para validar el estado HTTPS/TLS y cabeceras de seguridad modernas.

### 3. Generacion de Reportes Duales
La plataforma genera dos reportes PDF independientes a partir de la misma sesion de escaneo:
1. **Reporte Ejecutivo (Para el cliente):** Resumen de riesgos de alto nivel con matrices de severidad, cadena de custodia y estado de remediacion. Disenado para stakeholders no tecnicos.
2. **Playbook Tecnico (Para el desarrollador):** El sistema consulta al motor de IA en modo batch por cada vulnerabilidad detectada, espera cada respuesta estructurada de remediacion, y ensambla una guia completa para el desarrollador con parches de codigo exactos y referencias OWASP.

### 4. Instalacion y Configuracion
Asegurese de tener `Node.js` (v18+) instalado en su computadora.

1. Obtenga una API Key gratuita desde [Groq Cloud](https://console.groq.com/).
2. Cree un archivo llamado `.env.local` dentro de la carpeta `/dashboard` con el siguiente contenido:
   ```
   GROQ_API_KEY=tu_clave_aqui
   ```
3. Ejecute el script de instalacion automatizada:
   - Windows: Ejecute `install.bat` para instalar automaticamente todas las dependencias de Node en los sub-proyectos.
4. Inicie el entorno utilizando `start_all.bat`.

### 5. Guia Educativa: Verificacion Manual de Vulnerabilidades
Antes de depender de escaneres automatizados, los analistas de seguridad deben comprender como detectar vectores expuestos de forma manual.
1. **Inspeccion de Cabeceras:** Abra las Herramientas de Desarrollador de su navegador (F12). Navegue a la pestana "Network". Recargue la pagina. Haga clic en el archivo del documento principal. En "Headers" -> "Response Headers", busque controles faltantes como `Content-Security-Policy` o `Strict-Transport-Security`.
2. **Reconocimiento de Superficie:** En la pestana "Elements" de las Herramientas de Desarrollador, inspeccione el arbol DOM en busca de rutas API ocultas o referencias `<a>` sin usar que apunten a entornos de staging. Presione `CTRL+U` para leer el codigo fuente crudo e identificar comentarios administrativos expuestos.
3. **Validacion Automatizada:** Despues de ejecutar las verificaciones manuales, utilice el escaner Blue Team Defense Center para correlacionar hallazgos, obtener el riesgo teorico exacto segun OWASP y obtener los parches de remediacion generados por IA.

### 6. Estructura del Proyecto
```
blue-team/
  dashboard/             # Dashboard principal Blue Team (Next.js)
    src/
      app/
        api/
          real-scan/     # Mozilla Observatory V2 + Analisis de cabeceras HTTP
          real-spider/   # Crawler de reconocimiento de superficie
          scan/          # Motor de escaneo simulado (modo Cyber Range)
          translate/     # Endpoint de remediacion con IA Groq
        page.tsx         # Interfaz principal del dashboard
      lib/
        generateReport.ts          # Generador de PDF Ejecutivo
        generateTechnicalReport.ts # Generador de PDF Playbook Tecnico
  pagina_de_prueba/      # Objetivo de prueba intencionalmente vulnerable (modo Cyber Range)
  install.bat            # Instalador automatizado de dependencias
  start_all.bat          # Lanzar ambos servidores simultaneamente
```
