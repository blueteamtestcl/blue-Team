# Blue Team Defense Center - Vulnerability Scanner

## 1. Legal Disclaimer and Rules of Engagement (RoE)
**WARNING:** This tool is an educational Cyber Range designed exclusively for defensive security professionals, sysadmins, and students to understand offensive methodologies and improve target hardening.
- Operating this vulnerability scanner or the ZAP/Spider functionality against any domain, IP, or network infrastructure not owned by you or without express written consent from the owner is strictly prohibited and constitutes a federal cybercrime.
- The authors and contributors of this tool assume absolutely no liability for any misuse, damage, or legal consequences caused by the execution of these scripts.
- Use of this software implies full comprehension and agreement with these terms. Operate exclusively on authorized local variables (e.g., localhost) or self-owned test domains.

## 2. System Architecture
This Blue Team Cyber Range is constructed utilizing advanced modern frameworks tailored for enterprise auditing:
- **Frontend / Dashboard Analytics:** Next.js, React, Tailwind CSS, Recharts for visual intelligence.
- **Threat Intelligence Core:** Groq API (LLaMA 3.3 70B Versatile) fine-tuned specifically to OWASP Top 10 (2021) guidelines for real-time remediation.
- **Surface Reconnaissance:** Integrated spider/crawler evaluating network vectors based on OWASP ZAP methodologies.
- **Infrastructure Auditing:** Deep integration with Mozilla Observatory V2 API to validate HTTPS/TLS state and modern security headers.

## 3. Installation and Setup
Ensure `Node.js` (v18+) is installed on your computer. 

1. Obtain a free API key from [Groq Cloud](https://console.groq.com/).
2. Duplicate `.env.local.template` as `.env.local` inside the `/dashboard` folder and paste your `GROQ_API_KEY`.
3. Run the automated setup script for your OS:
   - Windows: Execute `install.bat` to automatically install all Node dependencies across sub-projects.
4. Launch the environment using `start_all.bat`.

## 4. Educational Guide: Manual Vulnerability Verification
Before relying on automated scanners, security analysts must understand how to detect exposed vectors manually.
1. **Header Inspection:** Open your browser's Developer Tools (F12). Navigate to the "Network" tab. Reload the page. Click the main document file. Under "Headers" -> "Response Headers", look for missing controls such as `Content-Security-Policy` or `Strict-Transport-Security`.
2. **Surface Reconnaissance:** In the Developer Tools "Elements" tab, inspect the DOM tree for hidden API routes or unused `<a>` refs pointing to staging environments. Press `CTRL+U` to read raw source code and identify exposed administrative comments.
3. **Automated Validation:** After running the manual checks, utilize the Blue Team Defense Center scanner to correlate findings, fetch the exact theoretical risk regarding OWASP, and obtain the AI-generated remediation patches.
