// src/stores/questionnaires.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
// import { fullQuestionnaireData } from '@/api/mockData'

export const useQuestionnairesStore = defineStore('questionnaires', () => {
  // --- State ---
  const questionnaires = ref([
    {
      id: 1,
      name: 'Standard ITIVA Assessment',
      lastUpdated: '2024-05-01',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Advanced Cloud Security Check',
      lastUpdated: '2024-04-10',
      status: 'Active',
    },
    {
      id: 3,
      name: 'GDPR Compliance Audit',
      lastUpdated: '2024-03-20',
      status: 'Active',
    },
  ])

  const allQuestions = ref([
    {
      id: 1,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Website Strength',
      text: 'Is your website traffic encrypted using a valid and current SSL/TLS certificate (HTTPS)?',
      explanation:
        "Checks if your website uses a secure 'lock' (HTTPS) to protect data, like passwords, from being stolen as it travels over the internet.",
      options: [
        {
          text: 'Yes, on all pages, with HSTS enabled',
          score: 2,
          explanation:
            'The gold standard, enforcing encryption and protecting against downgrade attacks.',
          recommendation:
            'Excellent. Maintain your strong TLS configuration and review it annually against new best practices.',
        },
        {
          text: 'Yes, standard certificate on all pages',
          score: 1,
          explanation: 'Good security. The entire site is encrypted.',
          recommendation:
            'Good. Consider implementing HSTS (HTTP Strict Transport Security) to further enhance security by preventing protocol downgrade attacks.',
        },
        {
          text: 'Only on sensitive pages',
          score: 0,
          explanation: 'A partial implementation that leaves other pages vulnerable.',
          recommendation:
            'High Priority: Immediately deploy SSL/TLS across your entire website. Modern web traffic should be encrypted by default, not just on sensitive pages.',
        },
        {
          text: 'Certificate is expired/misconfigured',
          score: -1,
          explanation: 'Creates security warnings and may not provide proper encryption.',
          recommendation:
            'Critical: Renew or fix your SSL/TLS certificate immediately. A broken certificate damages user trust and offers no protection.',
        },
        {
          text: 'No, we use HTTP only',
          score: -2,
          explanation: 'A critical vulnerability. All data is sent in plaintext.',
          recommendation:
            'Critical: Procure and install an SSL/TLS certificate for your website immediately. Operating over HTTP is a major security risk to your users and your business.',
        },
      ],
    },
    {
      id: 2,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Website Strength',
      text: 'Are all software components of your website (e.g., CMS, plugins, themes) kept up-to-date?',
      explanation:
        'Ensures the building blocks of your website are updated to fix security holes that hackers could exploit, much like updating the apps on your phone.',
      options: [
        {
          text: 'Yes, we use an automated process to scan and apply security patches within 48 hours of release.',
          score: 2,
          explanation:
            'A proactive and rapid patching process that minimizes the window of opportunity for attackers.',
          recommendation:
            'Excellent. Continue to monitor your automated patching system to ensure it is functioning correctly.',
        },
        {
          text: 'Yes, we check for and apply updates manually on a weekly basis.',
          score: 1,
          explanation: 'A good, disciplined process, though slightly slower than an automated one.',
          recommendation:
            'Good. To improve, investigate automated patching solutions to reduce the manual workload and shorten the time to patch.',
        },
        {
          text: 'We apply updates sporadically or only when something breaks.',
          score: 0,
          explanation:
            'An inconsistent process that likely leaves vulnerabilities open for extended periods.',
          recommendation:
            'High Priority: Implement a formal, regular patching schedule (at least weekly). Sporadic updates leave you vulnerable to known exploits.',
        },
        {
          text: 'We rarely update, or only update major versions.',
          score: -1,
          explanation: 'This guarantees that numerous known vulnerabilities exist on the website.',
          recommendation:
            'Critical: Immediately implement a patch management process. Your website is almost certainly running software with known, severe vulnerabilities.',
        },
        {
          text: 'We do not know how to or never update our website components.',
          score: -2,
          explanation: 'A high-risk state, making a compromise of the website highly probable.',
          recommendation:
            'Critical: Seek immediate technical assistance to establish an update and patch management process. This is a foundational security requirement.',
        },
      ],
    },
    {
      id: 3,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Website Strength',
      text: 'Do you have a Web Application Firewall (WAF) in place?',
      explanation:
        'Asks if you have a digital bodyguard for your website that blocks common hacking attempts and malicious traffic before it can do any harm.',
      options: [
        {
          text: 'Yes, a managed WAF with custom rules tailored to our application.',
          score: 2,
          explanation:
            'The most effective WAF implementation, offering protection against both common and application-specific attacks.',
          recommendation:
            'Excellent. Your proactive approach with a managed, custom WAF provides superior protection. Ensure rules are reviewed regularly.',
        },
        {
          text: 'Yes, we use a standard WAF provided by our hosting or CDN provider.',
          score: 1,
          explanation: 'A strong protective measure against a wide range of common attacks.',
          recommendation:
            'Good. You have a solid layer of protection. Periodically review the WAF logs to understand the types of attacks being blocked.',
        },
        {
          text: 'We are planning to implement one.',
          score: 0,
          explanation: 'Awareness without protection offers no current security benefit.',
          recommendation:
            'Recommendation: Prioritize the implementation of a WAF. It is a critical defense layer against common, automated web attacks.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation:
            'Lack of awareness of a critical security control is a significant vulnerability in itself.',
          recommendation:
            'High Priority: Investigate if your hosting provider offers a WAF and enable it. Understanding and using a WAF is key to web security.',
        },
        {
          text: 'No, we do not have a WAF.',
          score: -2,
          explanation:
            'The website is fully exposed to common attacks like SQL injection and XSS without a dedicated filter.',
          recommendation:
            'Critical: Implement a Web Application Firewall (WAF) as soon as possible to protect against common attacks like SQL Injection and Cross-Site Scripting (XSS).',
        },
      ],
    },
    {
      id: 4,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Website Strength',
      text: 'Are user-submitted data and inputs validated on both the frontend and backend?',
      explanation:
        'This checks if your website carefully inspects all information users enter into forms to prevent them from submitting malicious code that could break or compromise your site.',
      options: [
        {
          text: 'Yes, comprehensive validation is strictly enforced on both the client and server-side.',
          score: 2,
          explanation:
            'Robust protection against data injection attacks by treating all user input as untrusted.',
          recommendation:
            'Excellent. This is the correct approach and provides robust protection against injection attacks.',
        },
        {
          text: 'Yes, all inputs are validated on the server-side.',
          score: 1,
          explanation:
            'Good security, as server-side validation cannot be bypassed by an attacker.',
          recommendation:
            'Good. Server-side validation is the most critical part. Ensure it covers all possible user inputs.',
        },
        {
          text: 'We mostly rely on frontend validation.',
          score: 0,
          explanation:
            'A significant vulnerability, as client-side validation can be easily bypassed.',
          recommendation:
            'Critical: Immediately implement server-side validation. Frontend validation is a user experience feature, not a security control, as it can be easily bypassed.',
        },
        {
          text: 'Validation is inconsistent and only applied to some forms.',
          score: -1,
          explanation:
            'Inconsistent validation leaves predictable and exploitable holes in security.',
          recommendation:
            'High Priority: Conduct a full review of your application and enforce server-side input validation on every single user-submitted field.',
        },
        {
          text: 'No, we do not perform input validation.',
          score: -2,
          explanation:
            'A critical flaw that makes the application highly susceptible to injection attacks.',
          recommendation:
            'Critical: Immediately implement server-side input validation across your entire application. This is a fundamental defense against many severe vulnerabilities.',
        },
      ],
    },
    {
      id: 5,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Website Strength',
      text: 'Does your website have a strong password policy for user and administrator accounts?',
      explanation:
        'Determines if you require users and staff to create strong, hard-to-guess passwords for their accounts to prevent them from being easily taken over.',
      options: [
        {
          text: 'Yes, we enforce complexity, length, and 2FA for all accounts, especially admins.',
          score: 2,
          explanation:
            'A comprehensive approach that protects against brute-force attacks and credential stuffing.',
          recommendation:
            'Excellent. This comprehensive approach provides strong defense against password-based attacks.',
        },
        {
          text: 'Yes, we enforce password complexity (e.g., uppercase, numbers, symbols) and length.',
          score: 1,
          explanation:
            'A strong foundational policy that prevents weak and easily guessable passwords.',
          recommendation:
            'Good. To improve, enforce 2FA/MFA, especially for administrative accounts, to provide an additional layer of security.',
        },
        {
          text: 'We have a basic password length requirement only.',
          score: 0,
          explanation:
            'A minimal standard that is better than nothing but still allows for weak passwords.',
          recommendation:
            'Recommendation: Enhance your password policy to include complexity requirements (uppercase, lowercase, numbers, symbols).',
        },
        {
          text: 'We have no password requirements; users can set anything.',
          score: -1,
          explanation:
            'A critical risk that allows for extremely weak passwords and easy account compromise.',
          recommendation:
            'Critical: Immediately implement and enforce a strong password policy requiring length and complexity. The current state is a high-risk invitation for account takeovers.',
        },
        {
          text: 'We have shared administrator accounts.',
          score: -2,
          explanation:
            'This is a major security risk, as it makes auditing impossible and simplifies unauthorized access.',
          recommendation:
            'Critical: Immediately create unique accounts for each administrator and user. Shared accounts are a major security risk that prevents accountability and effective access control.',
        },
      ],
    },
    {
      id: 6,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Website Strength',
      text: 'Are regular backups of your website data performed?',
      explanation:
        "Asks if you regularly make copies of your website's data and files, so you can restore everything quickly if it gets hacked, deleted, or breaks.",
      options: [
        {
          text: 'Yes, automated daily backups are encrypted and stored in a secure, geographically separate location.',
          score: 2,
          explanation:
            'The gold standard for disaster recovery, ensuring business continuity with minimal data loss.',
          recommendation:
            'Excellent. Your backup strategy is robust and aligned with best practices for disaster recovery.',
        },
        {
          text: 'Yes, automated daily or weekly backups are stored with our hosting provider.',
          score: 1,
          explanation:
            'A good practice that ensures data can be recovered, though with a potential 24-hour data loss.',
          recommendation:
            'Good. Ensure you periodically test restoring from your backups to verify their integrity.',
        },
        {
          text: 'We perform manual backups sporadically.',
          score: 0,
          explanation: 'Unreliable and prone to human error, leading to significant data loss.',
          recommendation:
            'High Priority: Implement an automated, regular backup schedule. Manual backups are unreliable and will lead to data loss.',
        },
        {
          text: "We have backups, but they are old or we've never tested restoring them.",
          score: -1,
          explanation: 'A useless backup system that provides a false sense of security.',
          recommendation:
            'Critical: Your backups are not viable. Immediately create a new backup and implement a regular, automated backup process with periodic restoration tests.',
        },
        {
          text: 'No, we do not have backups.',
          score: -2,
          explanation:
            'A critical failure in business continuity planning. A single event could lead to total data loss.',
          recommendation:
            'Critical: Implement a backup solution immediately. Without backups, any hardware failure, ransomware attack, or major error could permanently destroy your business data.',
        },
      ],
    },
    {
      id: 7,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Website Strength',
      text: "Does your website's design incorporate security best practices, such as the principle of least privilege?",
      explanation:
        'Checks if user accounts are set up so people only have access to the features they absolutely need, preventing a low-level user from making high-level changes.',
      options: [
        {
          text: 'Yes, user roles are strictly defined, and access is granted on a need-to-know basis.',
          score: 2,
          explanation:
            'A mature security design that minimizes the impact of a potential account compromise.',
          recommendation:
            'Excellent. This is a mature and effective implementation of the principle of least privilege.',
        },
        {
          text: 'Yes, we have different roles for administrators and regular users.',
          score: 1,
          explanation:
            'A good, basic security practice that separates administrative functions from normal use.',
          recommendation:
            'Good. Regularly review the permissions of your administrator accounts to ensure they are still appropriate.',
        },
        {
          text: 'User roles are not well-defined; many users have high-level privileges.',
          score: 0,
          explanation:
            'A significant risk, as a compromise of any user account could lead to a full system compromise.',
          recommendation:
            'High Priority: Conduct a review of all user accounts and revoke unnecessary privileges. Implement a formal process for granting and reviewing access.',
        },
        {
          text: 'All users share the same level of access.',
          score: -1,
          explanation:
            'A critical vulnerability. If one account is breached, the entire system is breached.',
          recommendation:
            "Critical: Immediately implement role-based access control. Start by creating a standard 'user' role with limited permissions and a separate 'admin' role.",
        },
        {
          text: "I don't know what the principle of least privilege is.",
          score: -2,
          explanation:
            "Lack of awareness indicates that security was not a consideration in the system's design.",
          recommendation:
            'High Priority: Research and implement the Principle of Least Privilege. This foundational security concept means users should only have access to the information and functions essential to their job.',
        },
      ],
    },
    {
      id: 8,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Website Strength',
      text: 'Have you implemented security headers to protect against attacks like cross-site scripting (XSS) and clickjacking?',
      explanation:
        'Asks if your website uses special instructions for web browsers that help prevent certain types of common hacking techniques, like tricking users into clicking hidden buttons.',
      options: [
        {
          text: 'Yes, we have a strong Content Security Policy (CSP) and use multiple security headers.',
          score: 2,
          explanation:
            'A proactive defense that significantly hardens the website against common client-side attacks.',
          recommendation:
            'Excellent. Your use of a strong CSP and other headers shows a mature approach to client-side security.',
        },
        {
          text: 'Yes, we have implemented basic security headers like X-Frame-Options.',
          score: 1,
          explanation: 'A good first step that protects against clickjacking attacks.',
          recommendation:
            'Good. To improve, research and implement a Content Security Policy (CSP) for defense-in-depth against XSS attacks.',
        },
        {
          text: 'We are aware of them but have not implemented them yet.',
          score: 0,
          explanation: 'Awareness without action provides no security benefit.',
          recommendation:
            'Recommendation: Implement basic security headers like X-Frame-Options, X-Content-Type-Options, and Strict-Transport-Security (if you have HTTPS).',
        },
        {
          text: "I don't know what security headers are.",
          score: -1,
          explanation:
            'Indicates a lack of fundamental web security knowledge, suggesting other vulnerabilities may exist.',
          recommendation:
            'High Priority: Research and implement security headers. They are a simple, free, and effective way to protect your users from common attacks.',
        },
        {
          text: 'No, we have not implemented any security headers.',
          score: -2,
          explanation:
            'The website is left open to a wide range of well-known and easily preventable attacks.',
          recommendation:
            'High Priority: Implement security headers immediately, starting with X-Frame-Options to prevent clickjacking. They are a low-effort, high-impact security improvement.',
        },
      ],
    },
    {
      id: 9,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Devices & Network',
      text: 'Do you maintain an up-to-date inventory of all devices connected to your business network?',
      explanation:
        'This checks if you have a complete list of every computer, phone, and router connected to your office network, so you know what needs to be protected.',
      options: [
        {
          text: 'Yes, we have an automated, real-time inventory of all hardware and software assets.',
          score: 2,
          explanation:
            'Best practice for asset management. You know exactly what is on your network at all times.',
          recommendation:
            'Excellent. A real-time, automated inventory is the gold standard for asset management.',
        },
        {
          text: 'Yes, we maintain a manually updated spreadsheet or document of all devices.',
          score: 1,
          explanation: 'A good practice, but prone to human error and becoming outdated quickly.',
          recommendation:
            'Good. This is a solid practice. To improve, try to review and validate the manual inventory on a quarterly basis to ensure accuracy.',
        },
        {
          text: 'We have a partial or outdated inventory.',
          score: 0,
          explanation:
            'Better than nothing, but significant blind spots exist, which are a security risk.',
          recommendation:
            'Recommendation: Dedicate time to complete your asset inventory. You cannot fully protect your network without knowing what is on it.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation:
            'A known unknown. It implies a lack of control and visibility over the network.',
          recommendation:
            'High Priority: Begin creating an asset inventory immediately. Start by listing all known computers, servers, and network devices.',
        },
        {
          text: 'No, we do not have a formal inventory.',
          score: -2,
          explanation:
            "You cannot protect what you don't know you have. This is a foundational security failure.",
          recommendation:
            'Critical: Creating a device inventory is your first step towards security. You must know what you need to protect. Start with a simple spreadsheet listing all office computers.',
        },
      ],
    },
    {
      id: 10,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Devices & Network',
      text: 'Is all office Wi-Fi protected with a strong password and modern encryption (e.g., WPA2 or WPA3)?',
      explanation:
        'Determines if your office wireless network is secured with a strong password and the latest security standards to prevent unauthorized people from accessing your internal network.',
      options: [
        {
          text: 'Yes, we use WPA3/WPA2-Enterprise with separate, secure networks for guests and internal staff.',
          score: 2,
          explanation:
            'The highest standard for wireless security, providing robust protection and network segmentation.',
          recommendation:
            'Excellent. This is a very secure wireless configuration that separates trusted and untrusted traffic effectively.',
        },
        {
          text: 'Yes, we use WPA2 or WPA3 with a strong, complex password.',
          score: 1,
          explanation: 'A strong and necessary security control for any modern business network.',
          recommendation:
            'Good. This is a strong baseline for wireless security. Ensure the password is long and complex.',
        },
        {
          text: 'We use WPA2 but with a simple, easily guessable password.',
          score: -1,
          explanation:
            'The password becomes the weak link, making the network vulnerable to brute-force attacks.',
          recommendation:
            'High Priority: Immediately change your Wi-Fi password to a long, complex passphrase that is not easily guessable.',
        },
        {
          text: 'Our Wi-Fi uses outdated WEP encryption or is open (no password).',
          score: -2,
          explanation:
            'A critical vulnerability. WEP is easily cracked, and an open network allows anyone to connect.',
          recommendation:
            'Critical: Immediately reconfigure your Wi-Fi to use WPA2 or WPA3 encryption with a strong password. An open or WEP network is dangerously insecure.',
        },
        {
          text: "I don't know the configuration of our Wi-Fi.",
          score: -1,
          explanation:
            'Lack of knowledge implies lack of control, and the network could be in a highly vulnerable state.',
          recommendation:
            "High Priority: Investigate your Wi-Fi settings immediately. If you don't know how, contact your IT support or service provider. Assume it is insecure until proven otherwise.",
        },
      ],
    },
    {
      id: 11,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Devices & Network',
      text: 'Are your network devices, such as routers and firewalls, configured with unique, strong passwords?',
      explanation:
        "Checks if you have changed the default, factory-set passwords (like 'admin') on your internet router and other network gear to prevent easy unauthorized access.",
      options: [
        {
          text: 'Yes, all default passwords have been changed, and we use a password manager to store strong, unique credentials.',
          score: 2,
          explanation:
            'Excellent security hygiene that prevents unauthorized access to network infrastructure.',
          recommendation:
            'Excellent. This practice significantly hardens your network infrastructure against unauthorized access.',
        },
        {
          text: 'Yes, all default passwords have been changed to a custom password.',
          score: 1,
          explanation: 'A fundamental and necessary security step for any network device.',
          recommendation:
            'Good. This is a fundamental security requirement. Ensure the custom password used is strong and not reused elsewhere.',
        },
        {
          text: 'Some devices have been updated, but others may still use default passwords.',
          score: -1,
          explanation:
            'An attacker who gains access to the network can easily find and compromise these devices.',
          recommendation:
            'High Priority: Conduct an audit of all network devices (routers, switches, firewalls) and change any default passwords immediately.',
        },
        {
          text: "We are still using the default 'admin/password' on our network devices.",
          score: -2,
          explanation:
            'A critical risk. Default credentials are the first thing an attacker will try.',
          recommendation:
            'Critical: Change the default passwords on your network equipment immediately. This is one of the most common and easily exploited vulnerabilities.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation:
            'Indicates a lack of basic network management and a high probability of vulnerable devices.',
          recommendation:
            'High Priority: Identify all your network devices and verify that their passwords have been changed from the default. Assume they are all at risk until verified.',
        },
      ],
    },
    {
      id: 12,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Devices & Network',
      text: 'Do you have a policy for employees connecting personal devices to the company network (BYOD policy)?',
      explanation:
        'Asks if you have clear rules for employees who use their personal phones or laptops for work and connect them to the office network, managing potential security risks.',
      options: [
        {
          text: 'Yes, we have a strict BYOD policy that requires security checks and management software on personal devices.',
          score: 2,
          explanation: 'A mature approach that manages the risks associated with personal devices.',
          recommendation:
            'Excellent. A managed BYOD policy is the most secure way to allow personal devices on the network.',
        },
        {
          text: 'Yes, we have a policy that outlines acceptable use for personal devices.',
          score: 1,
          explanation: 'A good first step in setting expectations and establishing liability.',
          recommendation:
            'Good. This is a solid foundation. Consider enhancing the policy with minimum security requirements for personal devices (e.g., screen lock, up-to-date OS).',
        },
        {
          text: 'We allow it, but we have no formal policy in place.',
          score: -1,
          explanation:
            'Unmanaged and unknown devices on the network represent a significant security risk.',
          recommendation:
            'High Priority: Establish a formal Bring Your Own Device (BYOD) policy that outlines security expectations and acceptable use for personal devices on the network.',
        },
        {
          text: "We actively discourage it, but we don't enforce it.",
          score: 0,
          explanation:
            "While safer, it may not be practical and doesn't address unauthorized connections.",
          recommendation:
            'Recommendation: If you allow personal devices, you need a formal policy. If you truly ban them, consider technical controls to block unauthorized connections.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation:
            'Lack of a policy indicates a lack of control over what connects to the network.',
          recommendation:
            'High Priority: Decide on a formal stance for personal devices and document it in a policy. A lack of policy creates ambiguity and risk.',
        },
      ],
    },
    {
      id: 13,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Devices & Network',
      text: 'Is your internal network segmented to separate critical systems from general user access?',
      explanation:
        'Checks if your network is divided into zones, like a separate guest Wi-Fi, to prevent a security issue in one area from spreading to more critical systems.',
      options: [
        {
          text: 'Yes, we use VLANs or physical segmentation to create separate zones for servers, users, and guests.',
          score: 2,
          explanation:
            'A core security principle that contains breaches and prevents lateral movement by attackers.',
          recommendation:
            'Excellent. Network segmentation is a powerful control for containing threats and protecting critical assets.',
        },
        {
          text: 'Yes, we have a separate Wi-Fi network for guests.',
          score: 1,
          explanation:
            'A good, basic form of segmentation that protects the internal network from guests.',
          recommendation:
            'Good. This is a great first step. Consider further segmentation, such as creating a separate VLAN for critical servers.',
        },
        {
          text: 'No, all devices are on one single, flat network.',
          score: -2,
          explanation:
            'A high-risk architecture. If one device is compromised, the entire network is at risk.',
          recommendation:
            'Critical: Plan to segment your network as a high-priority project. A flat network means a single compromised device could potentially infect critical servers.',
        },
        {
          text: 'We are not sure what network segmentation is.',
          score: -1,
          explanation:
            'Indicates a lack of understanding of fundamental network security concepts.',
          recommendation:
            'High Priority: Research network segmentation (VLANs). It is a key architectural concept for building a defensible network.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation:
            'Lack of awareness suggests the network is likely flat and highly vulnerable.',
          recommendation:
            'High Priority: Investigate your network structure. If all devices can communicate with each other, implement network segmentation to reduce risk.',
        },
      ],
    },
    {
      id: 14,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Devices & Network',
      text: 'Are all computers and servers protected with reputable and up-to-date anti-malware software?',
      explanation:
        'Determines if all your company computers have antivirus software installed and kept up-to-date to protect against viruses, ransomware, and other malicious programs.',
      options: [
        {
          text: 'Yes, a centrally managed, enterprise-grade solution is deployed on all endpoints and updated automatically.',
          score: 2,
          explanation:
            'The best practice for endpoint security, providing proactive and manageable protection.',
          recommendation:
            'Excellent. Centrally managed endpoint protection is the most effective and scalable solution.',
        },
        {
          text: 'Yes, individual licensed anti-malware software is installed on all devices.',
          score: 1,
          explanation:
            'A good security measure ensuring all devices have a baseline of protection.',
          recommendation:
            'Good. This provides a necessary layer of protection. Ensure all users keep their software up-to-date.',
        },
        {
          text: 'Only on some devices, or we rely on free versions.',
          score: -1,
          explanation:
            'Inconsistent coverage creates unprotected entry points for malware into your network.',
          recommendation:
            'High Priority: Ensure every single company device has a reputable, paid anti-malware solution installed. Inconsistent coverage is a major risk.',
        },
        {
          text: 'We rely only on the default protection built into the operating system.',
          score: -1,
          explanation:
            'OS protection is basic and often insufficient against modern, sophisticated threats.',
          recommendation:
            'High Priority: Install a reputable, third-party anti-malware solution on all computers. While OS protection is improving, it should be supplemented.',
        },
        {
          text: 'No, we do not actively use anti-malware software.',
          score: -2,
          explanation:
            'A critical vulnerability that leaves all endpoints exposed to malware infections.',
          recommendation:
            'Critical: Install reputable anti-malware software on all computers immediately. Operating without it is a near-guarantee for a malware infection.',
        },
      ],
    },
    {
      id: 15,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Devices & Network',
      text: 'Do you have a firewall configured to block unsolicited incoming network traffic?',
      explanation:
        'Asks if you have a digital barrier (a firewall) that protects your internal network from unwanted and potentially malicious connection attempts from the internet.',
      options: [
        {
          text: 'Yes, we have a properly configured hardware firewall with specific inbound and outbound rules.',
          score: 2,
          explanation: 'A robust network defense that provides granular control over traffic.',
          recommendation:
            'Excellent. A dedicated, well-configured hardware firewall is a cornerstone of network security.',
        },
        {
          text: 'Yes, we use the software firewalls on our individual computers and servers.',
          score: 1,
          explanation:
            'A good baseline, but offers no centralized control or protection against internal threats.',
          recommendation:
            'Good. Software firewalls provide protection. For better security, consider a dedicated hardware firewall at the network perimeter.',
        },
        {
          text: 'We rely on the default firewall in our internet router.',
          score: 0,
          explanation:
            'Provides basic protection but lacks the advanced features of a dedicated firewall.',
          recommendation:
            'Recommendation: While better than nothing, a basic router firewall offers limited protection. Plan to upgrade to a dedicated hardware firewall for better control and visibility.',
        },
        {
          text: "Our firewall is disabled or has a policy to 'allow all' traffic.",
          score: -2,
          explanation:
            'A critical risk, leaving the network wide open to external scans and attacks.',
          recommendation:
            "Critical: Enable your firewall immediately with a 'deny all by default' policy. An open firewall is like leaving your front door unlocked and wide open.",
        },
        {
          text: "I don't know.",
          score: -1,
          explanation:
            "Indicates a lack of visibility and control over the network's perimeter security.",
          recommendation:
            'High Priority: Locate your primary network firewall (likely your internet router) and ensure it is enabled and configured to block unsolicited incoming traffic.',
        },
      ],
    },
    {
      id: 16,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Compliance Documentation',
      text: 'Do you have a formally documented Information Security Policy that is accessible to all employees?',
      explanation:
        "Checks if your company has a written rulebook for security that outlines everyone's responsibilities for protecting company information and systems.",
      options: [
        {
          text: 'Yes, it is reviewed annually, communicated to all staff, and employees are trained on it.',
          score: 2,
          explanation: 'A mature approach that embeds security into the company culture.',
          recommendation:
            'Excellent. This demonstrates a mature security program and a strong security culture.',
        },
        {
          text: 'Yes, we have a documented policy that is available to employees.',
          score: 1,
          explanation: 'A foundational element of any security program.',
          recommendation:
            'Good. This is a foundational governance document. To improve, schedule an annual review and a brief training session for all staff.',
        },
        {
          text: 'We have an informal or outdated policy.',
          score: 0,
          explanation:
            'Better than nothing, but informal policies are inconsistently applied and hard to enforce.',
          recommendation:
            'Recommendation: Formalize your security policy and have it officially approved by management. An informal policy is not enforceable.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation: 'Indicates a lack of governance and a reactive approach to security.',
          recommendation:
            "High Priority: Develop a formal Information Security Policy. It is the central document that outlines your organization's commitment and rules for security.",
        },
        {
          text: 'No, we do not have a documented policy.',
          score: -2,
          explanation:
            'A fundamental failure in governance. There are no defined rules for security.',
          recommendation:
            'Critical: Develop and document an Information Security Policy as a top priority. This is the foundation of a structured security program.',
        },
      ],
    },
    {
      id: 17,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Compliance Documentation',
      text: 'Is there a clear Data Protection Policy that outlines how sensitive data is handled?',
      explanation:
        'Determines if you have a formal document explaining how your company protects sensitive customer and employee data, in line with privacy laws like GDPR or NDPR.',
      options: [
        {
          text: "Yes, it's aligned with regulations (like GDPR/NDPR), defines data types, and dictates handling procedures.",
          score: 2,
          explanation:
            'Best practice for ensuring both compliance and a clear understanding of data handling responsibilities.',
          recommendation:
            'Excellent. This proactive approach to data protection and compliance is a sign of a mature organization.',
        },
        {
          text: 'Yes, we have a basic document outlining data privacy.',
          score: 1,
          explanation: 'A good first step towards formalizing data protection.',
          recommendation:
            'Good. This is a necessary document. To improve, align it with a specific framework like the NDPR and communicate it to staff.',
        },
        {
          text: 'We handle it based on common sense but have no formal policy.',
          score: -1,
          explanation:
            'Inconsistent and subjective data handling leads to mistakes and potential breaches.',
          recommendation:
            'High Priority: Formalize your data handling rules into a Data Protection Policy. Unwritten rules lead to inconsistencies and potential breaches.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation: 'A significant governance gap, especially if handling customer data.',
          recommendation:
            'High Priority: If you handle any personal data, you must understand your legal obligations. Research data protection regulations like the NDPR and create a policy.',
        },
        {
          text: 'No, we have no formal policy on data protection.',
          score: -2,
          explanation:
            'A critical compliance and security risk, showing a disregard for data privacy.',
          recommendation:
            'Critical: Create a Data Protection Policy immediately. Handling customer or employee data without a policy is a major legal and security risk.',
        },
      ],
    },
    {
      id: 18,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Compliance Documentation',
      text: 'Have you established an Incident Response Plan to guide your actions in the event of a security breach?',
      explanation:
        'Asks if you have a step-by-step guide ready for what to do if your company gets hacked, to ensure a quick and organized response to minimize damage.',
      options: [
        {
          text: 'Yes, it is documented, contains key contacts, and we test it with drills at least annually.',
          score: 2,
          explanation:
            'The gold standard. A tested plan ensures an effective, coordinated response during a crisis.',
          recommendation:
            'Excellent. A tested plan is a plan that will work in a real crisis. This is best practice.',
        },
        {
          text: 'Yes, we have a documented plan outlining the steps to take.',
          score: 1,
          explanation:
            'A necessary component of security management, providing a roadmap for crisis.',
          recommendation:
            'Good. Having a documented plan is a critical piece of preparedness. To improve, schedule a simple tabletop drill to test it.',
        },
        {
          text: 'We have some informal notes or an idea of who to call.',
          score: -1,
          explanation:
            'An informal plan will fail under the pressure of a real incident, leading to chaos and increased damage.',
          recommendation:
            'High Priority: Formalize your notes into a structured Incident Response Plan. An informal plan will fall apart under pressure.',
        },
        {
          text: "I don't know what an Incident Response Plan is.",
          score: -1,
          explanation:
            'Indicates a lack of preparedness for the most basic security inevitabilities.',
          recommendation:
            'Critical: Research and create an Incident Response Plan. It is a simple document outlining who to call and what steps to take when a breach occurs.',
        },
        {
          text: 'No, we have no plan for security incidents.',
          score: -2,
          explanation:
            'A critical failure. The damage from a breach will be significantly worse without a plan.',
          recommendation:
            'Critical: Develop an Incident Response Plan immediately. In the event of a breach, having a plan can significantly reduce costs and reputational damage.',
        },
      ],
    },
    {
      id: 19,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Compliance Documentation',
      text: 'Is there a defined policy for employee password complexity and regular updates?',
      explanation:
        'Checks if you have official rules that force employees to create strong passwords and update them periodically, making it harder for accounts to be compromised.',
      options: [
        {
          text: "Yes, it's enforced via system settings and requires MFA, length, complexity, and rotation.",
          score: 2,
          explanation: 'A mature and proactive approach to enforcing strong authentication.',
          recommendation:
            'Excellent. Enforcing strong password policies through technical controls is the most effective method.',
        },
        {
          text: 'Yes, we have a written policy that encourages strong passwords.',
          score: 1,
          explanation: 'A good practice that sets clear expectations for employees.',
          recommendation:
            'Good. This sets a clear expectation. To improve, find ways to technically enforce the policy through your systems.',
        },
        {
          text: "We just tell our employees to use 'strong' passwords.",
          score: 0,
          explanation:
            'Offers guidance but no enforcement, resulting in inconsistent password strength.',
          recommendation:
            'High Priority: Create a formal, written password policy that specifies minimum length, complexity, and other requirements.',
        },
        {
          text: 'We have no policy regarding passwords.',
          score: -2,
          explanation:
            'A significant risk, leading to widespread use of weak, easily compromised passwords.',
          recommendation:
            'Critical: Implement a formal password policy immediately. Without one, employees will default to simple, reusable passwords.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation: 'Lack of a policy implies a lack of basic security governance.',
          recommendation:
            "High Priority: Establish and communicate a formal password policy. It's a simple, low-cost way to dramatically improve your security posture.",
        },
      ],
    },
    {
      id: 20,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Compliance Documentation',
      text: 'Do you have an Acceptable Use Policy that details the permissible use of company IT resources?',
      explanation:
        'Determines if you have a document that employees must agree to, outlining the rules for using company computers, internet, and email appropriately and securely.',
      options: [
        {
          text: 'Yes, all employees read and sign it as part of their onboarding.',
          score: 2,
          explanation:
            'Ensures that employees are aware of their responsibilities and the organization has legal recourse.',
          recommendation:
            'Excellent. This ensures awareness and accountability across the organization.',
        },
        {
          text: 'Yes, we have one documented and available.',
          score: 1,
          explanation: 'A foundational governance document.',
          recommendation:
            'Good. This is a foundational IT governance document. Ensure new employees are made aware of it.',
        },
        {
          text: "It's an unwritten rule that people generally understand.",
          score: 0,
          explanation: 'Unwritten rules are not enforceable and lead to inconsistent behavior.',
          recommendation:
            'High Priority: Formalize these rules into a written Acceptable Use Policy (AUP). This protects both the company and the employee.',
        },
        {
          text: 'No, there are no rules on how employees use company tech.',
          score: -2,
          explanation: 'A significant risk that can lead to misuse of assets and internal threats.',
          recommendation:
            'Critical: Create and implement an Acceptable Use Policy. This is a critical document for protecting company assets.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation: 'Indicates a lack of basic IT governance.',
          recommendation:
            'High Priority: Develop an Acceptable Use Policy (AUP). This document defines how employees can use company technology.',
        },
      ],
    },
    {
      id: 21,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Compliance Documentation',
      text: 'Are your data handling and privacy practices compliant with relevant regulations (e.g., GDPR, NDPR)?',
      explanation:
        "Checks if your company's methods for collecting and storing personal data follow the legal requirements of data protection laws, like Nigeria's NDPR, to avoid fines.",
      options: [
        {
          text: 'Yes, we have had a formal audit or review to ensure full compliance.',
          score: 2,
          explanation: 'Demonstrates due diligence and a proactive stance on compliance.',
          recommendation:
            'Excellent. This demonstrates a proactive and mature approach to managing compliance risk.',
        },
        {
          text: 'Yes, we have reviewed the regulations and believe we are compliant.',
          score: 1,
          explanation: 'A good faith effort, but may contain gaps without a formal review.',
          recommendation:
            'Good. This is a positive step. To improve, consider a third-party gap assessment to get an objective view of your compliance status.',
        },
        {
          text: 'We are aware of the regulations but have not taken formal steps.',
          score: -1,
          explanation: 'Awareness without action is a significant legal and financial risk.',
          recommendation:
            'High Priority: Take formal steps to meet your compliance obligations (e.g., NDPR). This may include appointing a Data Protection Officer (DPO).',
        },
        {
          text: 'We are not aware of any regulations that apply to us.',
          score: -2,
          explanation: 'Willful ignorance is not a defense and represents a major compliance risk.',
          recommendation:
            'Critical: You must identify and comply with all relevant data protection laws. Ignorance can lead to severe penalties.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation:
            'A significant risk, as non-compliance can lead to heavy fines and reputational damage.',
          recommendation:
            'Critical: Immediately identify the data privacy laws that apply to your business. Non-compliance can have severe financial consequences.',
        },
      ],
    },
    {
      id: 22,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Cyber Security Implementations',
      text: 'Do you use an Intrusion Detection System (IDS) or Intrusion Prevention System (IPS)?',
      explanation:
        'Asks if you have a security system that acts like a burglar alarm for your network, watching for suspicious activity and either alerting you or automatically blocking it.',
      options: [
        {
          text: 'Yes, we have a managed IDS/IPS that is monitored and alerts our security team.',
          score: 2,
          explanation:
            'A proactive security measure that allows for rapid detection and response to threats.',
          recommendation:
            'Excellent. A monitored IDS/IPS provides powerful, real-time insight into network threats.',
        },
        {
          text: 'Yes, we have an IDS/IPS device or software running.',
          score: 1,
          explanation: 'A good security control that provides visibility into network threats.',
          recommendation:
            'Good. You have the right technology in place. Ensure you have a process for regularly reviewing its logs and alerts.',
        },
        {
          text: 'We are planning to implement one.',
          score: 0,
          explanation: 'Awareness without implementation provides no security benefit.',
          recommendation:
            'Recommendation: Consider implementing an IDS/IPS as your organization matures. Many modern firewalls have this functionality built-in.',
        },
        {
          text: "I don't know what an IDS/IPS is.",
          score: -1,
          explanation: 'Indicates a lack of knowledge about modern network security technologies.',
          recommendation:
            'Recommendation: Research Intrusion Detection/Prevention Systems. They act like a burglar alarm for your network.',
        },
        {
          text: 'No, we do not use IDS or IPS.',
          score: -2,
          explanation: 'The network is blind to active threats and ongoing attacks.',
          recommendation:
            'Recommendation: For improved threat visibility, investigate adding IDS/IPS capabilities to your security infrastructure.',
        },
      ],
    },
    {
      id: 23,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Cyber Security Implementations',
      text: 'Have you implemented a Security Information and Event Management (SIEM) system?',
      explanation:
        'Checks if you collect all security-related logs from your various systems into one central place for analysis, helping you spot trends and detect complex attacks.',
      options: [
        {
          text: 'Yes, we have a SIEM that aggregates logs from all critical systems and has rules for threat detection.',
          score: 2,
          explanation:
            'The best practice for security visibility, enabling rapid threat detection and investigation.',
          recommendation:
            'Excellent. A well-configured SIEM is a sign of a mature security operations program.',
        },
        {
          text: 'Yes, we collect logs from some systems but analysis is manual and infrequent.',
          score: 1,
          explanation:
            'A good start, but manual analysis is not scalable or effective for real-time threat detection.',
          recommendation:
            'Good. Centralizing logs is a great first step. To improve, investigate SIEM tools to automate log analysis.',
        },
        {
          text: 'We keep logs on individual devices but do not centralize them.',
          score: -1,
          explanation:
            'Useless for incident response, as correlating events across devices is nearly impossible.',
          recommendation:
            'High Priority: Implement a centralized logging solution. Without it, investigating security incidents is nearly impossible.',
        },
        {
          text: 'We do not collect or review security logs.',
          score: -2,
          explanation:
            'A critical visibility gap. You cannot investigate or learn from a breach without logs.',
          recommendation:
            'Critical: Begin collecting security logs from your critical systems immediately. Without logs, you are blind to network activities.',
        },
        {
          text: "I don't know what a SIEM is.",
          score: -1,
          explanation: 'Indicates a lack of knowledge about modern security monitoring.',
          recommendation:
            'Recommendation: Research Security Information and Event Management (SIEM). The core idea is to collect all security logs into one place.',
        },
      ],
    },
    {
      id: 24,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Cyber Security Implementations',
      text: 'Is two-factor or multi-factor authentication (2FA/MFA) required for accessing critical systems?',
      explanation:
        'Determines if you require a second form of verification, like a code from a phone app, in addition to a password for logging into important accounts.',
      options: [
        {
          text: 'Yes, MFA is mandatory for all users on all critical systems, including email and remote access.',
          score: 2,
          explanation:
            'The single most effective control to prevent unauthorized access, even if passwords are stolen.',
          recommendation:
            'Excellent. This is the gold standard and the single most important defense against account takeover attacks.',
        },
        {
          text: 'Yes, but it is only required for administrative or privileged accounts.',
          score: 1,
          explanation: 'A good practice that protects the most powerful accounts.',
          recommendation:
            'Good. Protecting privileged accounts is the highest priority. Plan to expand MFA to all users.',
        },
        {
          text: 'It is available but optional for users to enable.',
          score: 0,
          explanation:
            'Optional security is rarely used by the majority of users, providing little overall protection.',
          recommendation:
            "High Priority: Change your MFA policy from 'optional' to 'mandatory' for all users.",
        },
        {
          text: 'We only use it for one or two non-critical applications.',
          score: -1,
          explanation:
            'Provides a false sense of security while leaving all critical systems exposed.',
          recommendation:
            'Recommendation: Re-evaluate your use of MFA. It should be applied to your most critical systems first.',
        },
        {
          text: 'No, we do not use MFA anywhere.',
          score: -2,
          explanation:
            "A critical vulnerability in today's threat landscape. It makes account takeover trivial.",
          recommendation:
            'Critical: Implement MFA immediately, starting with all administrative accounts. Passwords alone are no longer sufficient.',
        },
      ],
    },
    {
      id: 25,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Cyber Security Implementations',
      text: 'Is sensitive data encrypted both when it is stored (at rest) and when it is transmitted (in transit)?',
      explanation:
        "Asks if you scramble sensitive data to make it unreadable, both when it's being sent over the internet and when it's saved on your hard drives.",
      options: [
        {
          text: 'Yes, all sensitive data is encrypted at rest (e.g., database encryption) and in transit (SSL/TLS).',
          score: 2,
          explanation:
            'A comprehensive data protection strategy that protects data from all forms of unauthorized access.',
          recommendation:
            'Excellent. This comprehensive data protection strategy is aligned with modern best practices.',
        },
        {
          text: 'Data is encrypted in transit, but not while stored on our servers.',
          score: 1,
          explanation:
            'Good security, but leaves data vulnerable if a server or database is compromised.',
          recommendation:
            'High Priority: Implement encryption at rest for your sensitive data. This protects you if physical hardware is stolen.',
        },
        {
          text: 'Only some of our sensitive data is encrypted.',
          score: -1,
          explanation: 'Inconsistent encryption leaves sensitive data exposed.',
          recommendation:
            'High Priority: Conduct a data audit to identify all locations of sensitive data and ensure full encryption.',
        },
        {
          text: "I don't know if or how our data is encrypted.",
          score: -1,
          explanation:
            'A significant risk, as you cannot confirm that sensitive data is protected.',
          recommendation:
            'Critical: You must determine if and how your sensitive data is encrypted. Assume it is not protected and investigate immediately.',
        },
        {
          text: 'No, we do not use encryption.',
          score: -2,
          explanation:
            'A critical flaw that exposes all sensitive data to interception and direct access.',
          recommendation:
            'Critical: Implement encryption for all sensitive data immediately. Start with SSL/TLS for data in transit.',
        },
      ],
    },
    {
      id: 26,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Cyber Security Implementations',
      text: 'Do you conduct regular vulnerability scans or penetration tests of your IT infrastructure?',
      explanation:
        'Checks if you proactively search for security weaknesses in your systems, either through automated tools or by hiring ethical hackers to simulate an attack.',
      options: [
        {
          text: 'Yes, we conduct regular automated scans and an annual third-party penetration test.',
          score: 2,
          explanation:
            'A mature, proactive approach to identifying and remediating vulnerabilities.',
          recommendation:
            'Excellent. This proactive combination is the best practice for vulnerability management.',
        },
        {
          text: 'Yes, we perform periodic automated vulnerability scans on our network.',
          score: 1,
          explanation: 'A good practice for proactively identifying security weaknesses.',
          recommendation:
            'Good. This is a great proactive security measure. To mature your program, consider adding annual penetration tests.',
        },
        {
          text: 'We have done a scan once in the past, but not regularly.',
          score: 0,
          explanation:
            'A one-time snapshot that is now outdated and provides a false sense of security.',
          recommendation:
            'Recommendation: Implement a regular, recurring schedule for vulnerability scans (e.g., quarterly).',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation: 'Indicates a lack of awareness of fundamental security assurance practices.',
          recommendation:
            'High Priority: Research and conduct a vulnerability scan of your network. There are many affordable tools available.',
        },
        {
          text: 'No, we have never performed scans or tests.',
          score: -2,
          explanation:
            'A purely reactive security posture. You will only find vulnerabilities when they are exploited by attackers.',
          recommendation:
            'Critical: Begin a vulnerability management program immediately. You need to find security holes before attackers do.',
        },
      ],
    },
    {
      id: 27,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Cyber Security Implementations',
      text: 'Do employees receive regular cybersecurity awareness training?',
      explanation:
        'Determines if you train your staff on how to spot and avoid security threats like phishing emails, making them a strong line of defense against cyberattacks.',
      options: [
        {
          text: 'Yes, all employees undergo mandatory annual training with periodic phishing simulations.',
          score: 2,
          explanation:
            'The most effective way to build a human firewall and defend against social engineering.',
          recommendation:
            'Excellent. This is the gold standard for building a security-aware culture.',
        },
        {
          text: 'Yes, new employees receive some security training during onboarding.',
          score: 1,
          explanation:
            'A good first step, but security knowledge becomes outdated without regular reinforcement.',
          recommendation:
            'Good. This is a solid foundation. To improve, implement annual refresher training.',
        },
        {
          text: 'We occasionally send out an email reminder about security.',
          score: -1,
          explanation: 'Ineffective and insufficient for creating a security-aware culture.',
          recommendation:
            'High Priority: Implement a formal, structured security awareness training program for all employees.',
        },
        {
          text: 'No, we believe our employees already know how to be secure.',
          score: -1,
          explanation:
            'A dangerous assumption that ignores the fact that employees are the primary target of attackers.',
          recommendation:
            'Critical: Immediately implement a security awareness training program. Humans are a primary target for attackers.',
        },
        {
          text: 'No, we do not provide any security training.',
          score: -2,
          explanation:
            'A critical gap that makes the organization highly vulnerable to phishing and other social engineering attacks.',
          recommendation:
            'Critical: Implement a security awareness training program immediately. Employees need training to spot and report threats.',
        },
      ],
    },
    {
      id: 28,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Cyber Security Implementations',
      text: 'Is there a process for securely disposing of old hardware and data?',
      explanation:
        'Asks if you have a secure method for getting rid of old computers and hard drives to ensure that sensitive company data cannot be recovered from the trash.',
      options: [
        {
          text: 'Yes, we have a strict policy that requires professional data destruction and/or physical destruction of drives.',
          score: 2,
          explanation:
            'A comprehensive process that ensures sensitive data does not leave the organization on old equipment.',
          recommendation:
            'Excellent. Your process ensures that data leakage from disposed assets is highly unlikely.',
        },
        {
          text: 'Yes, we wipe the hard drives before disposing of old computers.',
          score: 1,
          explanation: 'A good practice that prevents casual data recovery from disposed drives.',
          recommendation:
            'Good. This is a solid practice. For higher security, consider using data destruction software.',
        },
        {
          text: 'We just delete the files before giving the hardware away.',
          score: -2,
          explanation:
            'A significant risk. Deleted files are easily recoverable with free software.',
          recommendation:
            "Critical: Immediately change your process. 'Deleting' files does not remove them. Use secure wiping tools.",
        },
        {
          text: 'We throw old computers in the trash without any data wiping.',
          score: -2,
          explanation:
            'A critical data leakage risk. This is equivalent to handing your data to strangers.',
          recommendation:
            'Critical: Stop this practice immediately. All storage devices must be securely wiped or physically destroyed.',
        },
        {
          text: "I don't know what happens to old hardware.",
          score: -1,
          explanation: 'Indicates a lack of control and a high probability of data leakage.',
          recommendation:
            'High Priority: Establish a formal policy and process for asset disposal that includes secure data wiping.',
        },
      ],
    },
    {
      id: 29,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Cyber Security Implementations',
      text: 'Do you have a system in place for managing and applying security patches in a timely manner?',
      explanation:
        'Checks if you have an organized process for regularly installing security updates on all your software and systems to fix vulnerabilities as they are discovered.',
      options: [
        {
          text: 'Yes, we use an automated patch management system that applies critical patches within days.',
          score: 2,
          explanation:
            'A mature, proactive process that minimizes the window of exploitation for new vulnerabilities.',
          recommendation:
            'Excellent. An automated and rapid patch management process is a sign of mature security.',
        },
        {
          text: 'Yes, we have a manual process to check for and apply patches monthly.',
          score: 1,
          explanation: 'A good, disciplined process, though slower than automated systems.',
          recommendation:
            'Good. A disciplined manual process is effective. To improve, look into patch management tools.',
        },
        {
          text: 'We only patch systems when we encounter a problem.',
          score: -1,
          explanation:
            "A reactive 'break-fix' approach that guarantees systems remain vulnerable for long periods.",
          recommendation:
            "High Priority: Move from reactive to proactive patching. Waiting for problems means you're already compromised.",
        },
        {
          text: 'We do not have a formal patching process.',
          score: -2,
          explanation:
            'A critical failure in security maintenance, leading to a build-up of easily exploitable vulnerabilities.',
          recommendation:
            'Critical: Implement a formal patch management process immediately. Unpatched systems are the most common attack vector.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation:
            'A significant operational risk, as unpatched systems are a primary target for attackers.',
          recommendation:
            'Critical: Designate a person or team responsible for applying security patches monthly.',
        },
      ],
    },
    {
      id: 30,
      assessment_name: 'Standard ITIVA Assessment',
      category: 'Cyber Security Implementations',
      text: 'Is access to sensitive data and systems restricted based on the principle of least privilege?',
      explanation:
        'Determines if employees are only given the minimum level of access to data and systems that they need to perform their job, reducing the risk of data breaches.',
      options: [
        {
          text: 'Yes, access rights are strictly controlled and regularly reviewed based on job roles.',
          score: 2,
          explanation:
            'The gold standard for access control, minimizing the potential impact of any single account compromise.',
          recommendation:
            'Excellent. This demonstrates a mature and effective access control program.',
        },
        {
          text: 'Yes, we have different levels of access for different groups of employees.',
          score: 1,
          explanation: 'A good, foundational access control model.',
          recommendation:
            'Good. This is a foundational practice. To improve, implement periodic access reviews.',
        },
        {
          text: 'Access is granted on request, but rarely revoked or reviewed.',
          score: -1,
          explanation:
            "Known as 'privilege creep,' this creates a massive internal attack surface over time.",
          recommendation:
            'High Priority: Implement regular access reviews to identify and revoke unnecessary permissions.',
        },
        {
          text: 'Most employees have access to most data.',
          score: -2,
          explanation:
            'A critical risk. A compromise of any user account could lead to a full company data breach.',
          recommendation:
            'Critical: Immediately begin implementing the Principle of Least Privilege. Start by identifying data types and creating user roles.',
        },
        {
          text: "I don't know.",
          score: -1,
          explanation:
            'Indicates a lack of basic access control, a fundamental security principle.',
          recommendation:
            'High Priority: Research and implement the Principle of Least Privilege. Users should only have access to what they need.',
        },
      ],
    },
    {
      id: 31,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Infrastructure Security',
      text: 'How are access keys and credentials for cloud services managed?',
      explanation:
        "Checks your method for handling sensitive 'keys' to your cloud accounts (like AWS, Azure). Secure management prevents these keys from being stolen and used to access your infrastructure.",
      options: [
        {
          text: 'We use a dedicated secrets management service (e.g., AWS Secrets Manager, HashiCorp Vault) with automated key rotation.',
          score: 2,
          explanation:
            'Best practice. Centralizes secrets, controls access, and automates rotation to minimize exposure.',
          recommendation:
            'Excellent. A multi-layered security approach is consistently implemented across all cloud environments.',
        },
        {
          text: 'Keys are stored as environment variables on servers and rotated manually every 90 days.',
          score: 1,
          explanation:
            'A good, common practice, but manual rotation can be forgotten and keys can be exposed in logs.',
          recommendation:
            'Good. A strong defense-in-depth strategy is in place, but some layers could be enhanced.',
        },
        {
          text: 'Keys are stored in private code repositories or configuration files.',
          score: -1,
          explanation:
            'High risk. Exposes credentials to anyone with code access and makes rotation very difficult.',
          recommendation:
            'Fair. A basic defense-in-depth strategy is in place but lacks consistency across services.',
        },
        {
          text: 'Keys are hardcoded directly into the application source code.',
          score: -2,
          explanation:
            'Critical vulnerability. Leaking code means leaking all credentials, with no easy way to revoke them.',
          recommendation:
            'Poor. The defense-in-depth strategy is weak. Implement foundational security controls immediately.',
        },
        {
          text: 'We use the same long-lived key for all services.',
          score: -2,
          explanation:
            'Extremely high risk. A single key compromise gives an attacker access to everything.',
          recommendation:
            'Very Poor. No defense-in-depth strategy exists. Architect a multi-layered security framework immediately.',
        },
      ],
    },
    {
      id: 32,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Infrastructure Security',
      text: 'What is your strategy for network security in the cloud (VPCs, Security Groups, NACLs)?',
      explanation:
        'Asks about your setup for creating private, isolated networks in the cloud. Proper configuration acts as a virtual firewall, controlling who and what can access your servers.',
      options: [
        {
          text: 'We use a multi-tiered VPC architecture with strict, least-privilege security groups and network ACLs for defense-in-depth.',
          score: 2,
          explanation:
            "Excellent. This layered defense model isolates resources and significantly limits an attacker's movement.",
          recommendation:
            'Excellent. This layered defense model provides robust protection against network threats.',
        },
        {
          text: 'We use a single VPC with security groups configured to allow traffic only from specific known IP addresses.',
          score: 1,
          explanation:
            'Good control, but a flat network within the VPC means a compromised server can attack others.',
          recommendation:
            'Good. Network security is strong but could be improved with finer-grained controls.',
        },
        {
          text: 'We use a default VPC and rely on the default security group settings, which are somewhat permissive.',
          score: 0,
          explanation:
            'A neutral but risky state. Default settings are often too open for production workloads.',
          recommendation:
            'Fair. Basic network security controls exist but security groups are often overly permissive.',
        },
        {
          text: 'Our security groups are configured to allow all traffic (0.0.0.0/0) on most ports for ease of access.',
          score: -2,
          explanation:
            'Critical misconfiguration. Exposes all services on the instance to the entire internet.',
          recommendation:
            'Poor. Network security configurations are weak. Redesign your cloud network architecture.',
        },
        {
          text: "We don't use VPCs or security groups.",
          score: -2,
          explanation:
            'This implies using legacy cloud services (like EC2-Classic) which is a major security risk.',
          recommendation:
            'Very Poor. No network segmentation exists. Implement strict access controls immediately.',
        },
      ],
    },
    {
      id: 33,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Data Protection',
      text: 'How is data encryption managed for storage services (e.g., S3, Blob Storage, EBS)?',
      explanation:
        'Checks if data saved in your cloud storage is scrambled (encrypted). This protects your information even if an unauthorized person somehow gains access to the storage system.',
      options: [
        {
          text: 'All data is encrypted at rest by default using customer-managed keys (CMK) with a defined key rotation policy.',
          score: 2,
          explanation:
            'Best practice. Provides maximum control and auditability over data encryption.',
          recommendation:
            'Excellent. This provides maximum control and auditability over data encryption.',
        },
        {
          text: "All data is encrypted at rest using the cloud provider's default managed keys.",
          score: 1,
          explanation:
            'Good security posture. The data is protected, though with less granular control than CMKs.',
          recommendation:
            'Good. Most data is encrypted, but consider enforcing encryption for all data stores.',
        },
        {
          text: 'Only buckets/volumes containing known sensitive data are manually configured for encryption.',
          score: -1,
          explanation:
            'Risky approach. Relies on humans to correctly identify all sensitive data, which is prone to error.',
          recommendation:
            'Fair. Encryption is implemented inconsistently. Perform data discovery and classification.',
        },
        {
          text: 'We rely on the default settings, which may or may not include encryption.',
          score: -1,
          explanation:
            'Dangerous assumption. Many older services do not encrypt by default, leaving data exposed.',
          recommendation:
            'Poor. Encryption is not standard practice. Prioritize encryption for sensitive data.',
        },
        {
          text: 'We do not encrypt data stored in the cloud.',
          score: -2,
          explanation:
            'Critical vulnerability. A breach of the storage system would expose all data in plaintext.',
          recommendation:
            'Very Poor. No data encryption exists. Implement encryption across all cloud services immediately.',
        },
      ],
    },
    {
      id: 34,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Data Protection',
      text: 'Are detailed logging and monitoring enabled for all cloud activities (e.g., CloudTrail, Azure Monitor)?',
      explanation:
        'Determines if you are recording every action taken in your cloud account. This log is crucial for investigating security incidents and detecting unauthorized activity.',
      options: [
        {
          text: 'Yes, logging is enabled for all services in all regions, aggregated to a central, tamper-proof account, with alerts on suspicious API calls.',
          score: 2,
          explanation: 'Gold standard for cloud visibility and incident response readiness.',
          recommendation:
            'Excellent. This provides full visibility and enables rapid incident response.',
        },
        {
          text: 'Logging is enabled for most critical services, and logs are reviewed manually during an incident.',
          score: 1,
          explanation:
            'Good, but reactive. Lacks the proactive alerting needed to catch threats in real-time.',
          recommendation:
            'Good. Logging is established but needs proactive alerting for real-time threat detection.',
        },
        {
          text: 'Logging is enabled but logs are stored in the same account and are not centrally managed or monitored.',
          score: 0,
          explanation:
            'Logs are available but can be tampered with by an attacker who compromises the account.',
          recommendation:
            'Fair. Logging exists but lacks central management. Implement a centralized monitoring solution.',
        },
        {
          text: 'Logging is enabled on only a few services, or we use the default settings.',
          score: -1,
          explanation: 'Major blind spots. You cannot investigate what you do not log.',
          recommendation:
            'Poor. Major logging gaps exist. Enable detailed logging for all cloud services.',
        },
        {
          text: 'Logging is disabled to save costs.',
          score: -2,
          explanation:
            'Critical visibility gap. Makes effective incident response nearly impossible.',
          recommendation:
            'Very Poor. No logging exists. Implement centralized logging immediately.',
        },
      ],
    },
    {
      id: 35,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Access Management',
      text: 'How do you enforce Identity and Access Management (IAM) policies based on the principle of least privilege?',
      explanation:
        'Asks how you control what each user and service is allowed to do in your cloud account, ensuring they only have the minimum permissions necessary for their tasks.',
      options: [
        {
          text: 'IAM roles with granular, resource-specific permissions are used for all human and machine access. Permissions are reviewed quarterly.',
          score: 2,
          explanation:
            'Excellent. A mature implementation of least privilege, reducing the blast radius of a compromise.',
          recommendation:
            'Excellent. This mature implementation minimizes potential damage from compromises.',
        },
        {
          text: 'We use IAM groups with broad policies (e.g., PowerUser, ReadOnly) assigned to users.',
          score: 1,
          explanation:
            'A good start, but broad policies often grant more permissions than necessary.',
          recommendation:
            'Good. IAM policies are defined but could be more granular for least privilege.',
        },
        {
          text: 'We attach policies directly to individual IAM users as needed, but rarely review or remove them.',
          score: -1,
          explanation:
            'Leads to "privilege creep" where users accumulate excessive permissions over time.',
          recommendation:
            'Fair. IAM policies exist but need formal processes to prevent permission accumulation.',
        },
        {
          text: 'Most developers and services use an IAM user with full administrator access for convenience.',
          score: -2,
          explanation:
            'Critical risk. A compromise of any one of these users/services leads to a full environment compromise.',
          recommendation:
            'Poor. IAM controls are weak. Implement role-based access control immediately.',
        },
        {
          text: 'We use the root account for all daily operations.',
          score: -2,
          explanation:
            'Extremely dangerous practice. The root account should be locked away and never used for operational tasks.',
          recommendation:
            'Very Poor. Root account misuse creates extreme risk. Lock root account and use IAM roles.',
        },
      ],
    },
    {
      id: 36,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Infrastructure Security',
      text: 'What is your approach to vulnerability scanning for cloud workloads (e.g., container images, EC2 instances)?',
      explanation:
        'Checks if you regularly scan your cloud servers and application containers for known security weaknesses to fix them before they can be exploited by attackers.',
      options: [
        {
          text: 'We have an automated CI/CD pipeline that scans all container images and AMIs for vulnerabilities before deployment, blocking critical findings.',
          score: 2,
          explanation:
            'Best practice "shift-left" security. Prevents vulnerabilities from ever reaching production.',
          recommendation:
            'Excellent. This "shift-left" approach prevents vulnerabilities from reaching production.',
        },
        {
          text: 'We run weekly automated vulnerability scans on all running instances and container repositories.',
          score: 1,
          explanation:
            'Good detective control, but it means vulnerable systems may be live for up to a week.',
          recommendation: 'Good. Vulnerability scanning is established but could be more frequent.',
        },
        {
          text: 'We perform manual, ad-hoc vulnerability scans on our primary production servers a few times a year.',
          score: 0,
          explanation:
            'Infrequent scanning provides a poor and outdated picture of the actual risk.',
          recommendation:
            'Fair. Scanning is infrequent. Implement automated scanning for better coverage.',
        },
        {
          text: 'We rely on the security of the base images provided by the cloud provider or Docker Hub.',
          score: -1,
          explanation:
            'Base images can contain vulnerabilities or become outdated. They must be scanned.',
          recommendation:
            'Poor. Reliance on base image security is insufficient. Implement scanning processes.',
        },
        {
          text: 'We do not perform vulnerability scanning on our cloud workloads.',
          score: -2,
          explanation:
            'Critical gap. Leaves systems exposed to well-known and easily exploitable vulnerabilities.',
          recommendation:
            'Very Poor. No scanning exists. Implement vulnerability scanning immediately.',
        },
      ],
    },
    {
      id: 37,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Infrastructure Security',
      text: 'How are your public-facing cloud services protected against DDoS attacks?',
      explanation:
        'Determines what protections you have in place to defend against attacks that try to overwhelm your website or application with traffic, making it unavailable for legitimate users.',
      options: [
        {
          text: 'We use a managed DDoS protection service (e.g., AWS Shield Advanced, Azure DDoS Protection Standard) combined with a WAF and a CDN.',
          score: 2,
          explanation:
            'A robust, multi-layered defense against volumetric and application-layer DDoS attacks.',
          recommendation:
            'Excellent. This multi-layered defense provides comprehensive DDoS protection.',
        },
        {
          text: "We rely on the standard, default DDoS protection included with our cloud provider's services.",
          score: 1,
          explanation:
            'Provides protection against common, large-scale attacks but not sophisticated application-layer attacks.',
          recommendation:
            'Good. Basic protection exists but may not cover sophisticated application-layer attacks.',
        },
        {
          text: 'We have a WAF, but no specific, advanced DDoS mitigation service.',
          score: 1,
          explanation:
            'A WAF helps with application-layer attacks but may not be sufficient for large volumetric attacks.',
          recommendation:
            'Good. WAF provides some protection but supplement with DDoS-specific services.',
        },
        {
          text: 'We have no specific DDoS protection in place.',
          score: -1,
          explanation:
            'High risk for any public-facing application, as even small DDoS attacks can cause an outage.',
          recommendation:
            'Poor. DDoS protection is inadequate. Implement specific DDoS mitigation services.',
        },
        {
          text: 'We are not sure what DDoS protection is.',
          score: -2,
          explanation:
            'Lack of awareness of a common and impactful threat is a major business risk.',
          recommendation:
            'Very Poor. No DDoS protection awareness exists. Implement protection immediately.',
        },
      ],
    },
    {
      id: 38,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Access Management',
      text: 'How do you manage and audit third-party and marketplace software used in your cloud environment?',
      explanation:
        'Asks about your process for approving and monitoring software from external vendors that you run in your cloud. This prevents the introduction of insecure third-party code.',
      options: [
        {
          text: 'All third-party software from marketplaces undergoes a security review and is deployed in an isolated environment before production use.',
          score: 2,
          explanation:
            'A mature supply chain security process that minimizes risk from external code.',
          recommendation: 'Excellent. This mature process minimizes supply chain risks.',
        },
        {
          text: 'We only use software from well-known, reputable vendors found on the official cloud marketplace.',
          score: 1,
          explanation: 'A good practice, but even reputable software can have vulnerabilities.',
          recommendation: 'Good. Vendor selection is cautious but needs formal security reviews.',
        },
        {
          text: 'We allow developers to use any third-party software they need to get their job done, without a formal review process.',
          score: -1,
          explanation:
            'High risk. Introduces unknown and unvetted code into your secure environment.',
          recommendation: 'Poor. Lack of review process creates significant supply chain risks.',
        },
        {
          text: 'We are not aware of any third-party software running in our environment.',
          score: -1,
          explanation:
            "Lack of awareness is a risk. It's likely third-party code exists in dependencies.",
          recommendation:
            'Poor. Unknown third-party software creates risks. Implement discovery processes.',
        },
        {
          text: 'We do not use any third-party software.',
          score: 0,
          explanation:
            'Unlikely in modern development, but if true, it reduces this specific risk vector.',
          recommendation: 'Fair. While reducing risk, verify no third-party dependencies exist.',
        },
      ],
    },
    {
      id: 39,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Infrastructure Security',
      text: 'What is your strategy for cloud database security (e.g., RDS, Cosmos DB)?',
      explanation:
        'Checks how you secure your cloud databases, including controlling network access, encrypting data, and managing user permissions to protect the information stored within.',
      options: [
        {
          text: 'Databases are deployed in private subnets, require SSL/TLS for connections, have encryption at rest enabled, and use granular IAM database authentication.',
          score: 2,
          explanation: 'Excellent layered security model for protecting critical data stores.',
          recommendation:
            'Excellent. This layered security model provides comprehensive database protection.',
        },
        {
          text: 'Databases are in private subnets with access restricted by security groups to specific application servers.',
          score: 1,
          explanation:
            'Good network-level protection, but lacks other defense-in-depth measures like IAM auth.',
          recommendation:
            'Good. Network-level protection exists but add IAM authentication for better security.',
        },
        {
          text: 'Databases are publicly accessible but are protected by a strong password.',
          score: -1,
          explanation:
            'High risk. Exposes the database to brute-force attacks and potential zero-day vulnerabilities from the internet.',
          recommendation:
            'Poor. Public database access creates significant risk. Move to private subnets.',
        },
        {
          text: 'Databases are publicly accessible and use default port numbers with simple passwords.',
          score: -2,
          explanation:
            'Critical misconfiguration. It is highly likely the database will be compromised.',
          recommendation:
            'Very Poor. Critical misconfiguration exists. Immediately secure database access.',
        },
        {
          text: 'We are not sure how our databases are configured.',
          score: -1,
          explanation:
            'Lack of awareness of the configuration of a critical asset is a major security risk.',
          recommendation:
            'Poor. Database configuration unknown. Audit and secure database configurations.',
        },
      ],
    },
    {
      id: 40,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Infrastructure Security',
      text: 'How do you manage infrastructure as code (IaC) security (e.g., Terraform, CloudFormation)?',
      explanation:
        'Asks if you check your infrastructure configuration scripts for security issues. This prevents deploying a new server or service with a built-in security flaw.',
      options: [
        {
          text: 'We use automated static analysis security testing (SAST) tools in our CI/CD pipeline to scan IaC templates for misconfigurations before deployment.',
          score: 2,
          explanation:
            'Best practice. Automates security and prevents misconfigurations from being deployed.',
          recommendation:
            'Excellent. Automating security checks prevents misconfigurations from deployment.',
        },
        {
          text: 'We have a manual peer-review process for all infrastructure code changes to look for potential security issues.',
          score: 1,
          explanation:
            'Good practice, but prone to human error and less scalable than automated tools.',
          recommendation:
            'Good. Manual reviews exist but implement automated tools for better coverage.',
        },
        {
          text: 'We use IaC but do not have a specific security review process for the templates.',
          score: -1,
          explanation:
            'High risk. This can lead to the repeatable deployment of insecure infrastructure.',
          recommendation:
            'Poor. Lack of security review creates risks. Implement IaC security scanning.',
        },
        {
          text: 'We make changes to our cloud infrastructure manually through the web console.',
          score: -1,
          explanation:
            'Manual changes are error-prone, lack auditability, and lead to configuration drift.',
          recommendation:
            'Poor. Manual changes create risks. Implement Infrastructure as Code practices.',
        },
        {
          text: 'We do not use Infrastructure as Code.',
          score: 0,
          explanation:
            'Neutral. While not a direct risk, it indicates a lack of maturity in cloud operations.',
          recommendation: 'Fair. While not a direct risk, IaC improves security and consistency.',
        },
      ],
    },
    {
      id: 41,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Infrastructure Security',
      text: 'How do you handle container security (e.g., runtime security, pod security policies)?',
      explanation:
        'If you use containers (like Docker), this checks if you have security measures in place to protect the applications running inside them while they are active.',
      options: [
        {
          text: 'We use runtime security monitoring tools, enforce pod security policies (or equivalents), and run containers as non-root users with read-only filesystems where possible.',
          score: 2,
          explanation: 'A comprehensive, defense-in-depth approach to container security.',
          recommendation:
            'Excellent. This comprehensive approach provides robust container security.',
        },
        {
          text: 'We scan container images for vulnerabilities but do not have specific runtime security monitoring in place.',
          score: 1,
          explanation:
            'Good "shift-left" practice, but doesn\'t protect against threats that occur at runtime.',
          recommendation:
            'Good. Image scanning exists but add runtime security for complete protection.',
        },
        {
          text: 'We run our containers using the default settings provided by the orchestration service (e.g., EKS, AKS).',
          score: 0,
          explanation:
            'Risky. Default settings are often too permissive for secure production environments.',
          recommendation:
            'Fair. Default settings create risks. Customize security policies for containers.',
        },
        {
          text: 'Our containers are run with root privileges for maximum compatibility.',
          score: -2,
          explanation:
            'Critical risk. A container escape vulnerability would grant the attacker root access to the host node.',
          recommendation:
            'Very Poor. Running as root creates critical risk. Implement non-root containers immediately.',
        },
        {
          text: 'We do not use containers.',
          score: 0,
          explanation: 'Not applicable if containers are not in use.',
          recommendation: 'Fair. Not applicable, but consider container benefits when scaling.',
        },
      ],
    },
    {
      id: 42,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Access Management',
      text: 'How is multi-factor authentication (MFA) enforced for all human access to the cloud management console?',
      explanation:
        'Checks if all users, including administrators, are required to use a second verification step (like a phone app) to log in to the main cloud control panel.',
      options: [
        {
          text: 'MFA is enforced programmatically for all IAM users and the root account, and console access is federated through a central identity provider requiring MFA.',
          score: 2,
          explanation: 'Gold standard for identity and access management in the cloud.',
          recommendation:
            'Excellent. This is the gold standard for identity management in the cloud.',
        },
        {
          text: 'MFA is enabled and required for all administrative users and the root account.',
          score: 1,
          explanation:
            'Good practice that protects the most powerful accounts, but leaves others vulnerable.',
          recommendation: 'Good. MFA protects privileged accounts but should extend to all users.',
        },
        {
          text: 'MFA is encouraged for all users but not strictly enforced by policy.',
          score: -1,
          explanation:
            'Ineffective. Optional security is rarely adopted and provides a false sense of security.',
          recommendation:
            'Poor. Optional MFA is ineffective. Enforce MFA for all users programmatically.',
        },
        {
          text: 'Only the root account has MFA enabled.',
          score: -2,
          explanation:
            'Critically insufficient. The root account should not be used for daily tasks, and regular user accounts are left exposed.',
          recommendation:
            'Very Poor. Inadequate MFA coverage. Enable MFA for all accounts immediately.',
        },
        {
          text: 'MFA is not used for any account.',
          score: -2,
          explanation:
            'Critical vulnerability. Makes password-based attacks like credential stuffing trivial.',
          recommendation: 'Very Poor. No MFA exists. Implement MFA immediately as a top priority.',
        },
      ],
    },
    {
      id: 43,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Infrastructure Security',
      text: 'What is your disaster recovery (DR) and business continuity plan for your cloud environment?',
      explanation:
        'Asks about your plan to recover and continue operating if a major failure occurs in your primary cloud region, such as by having backups in another location.',
      options: [
        {
          text: 'We have a well-documented and tested multi-region DR plan with automated failover for critical services and regular cross-region backup replication.',
          score: 2,
          explanation: 'Excellent. A mature and robust plan to ensure business continuity.',
          recommendation:
            'Excellent. This mature plan ensures business continuity during disasters.',
        },
        {
          text: 'We have regular backups of our data and infrastructure templates stored in a different region, with a manual recovery process documented.',
          score: 1,
          explanation:
            'Good practice. Provides recoverability, though manual processes can be slow and error-prone.',
          recommendation: 'Good. Backups exist but automate failover for faster recovery.',
        },
        {
          text: 'We have backups stored in the same region as our primary infrastructure.',
          score: -1,
          explanation:
            'High risk. A region-wide failure would destroy both the primary infrastructure and the backups.',
          recommendation:
            'Poor. Backup location creates risk. Store backups in a different region.',
        },
        {
          text: 'We rely on the high availability of a single cloud region to prevent outages.',
          score: -2,
          explanation:
            'Critically risky. Single-region high availability does not protect against region-wide disasters or failures.',
          recommendation:
            'Very Poor. Single-region reliance is risky. Implement multi-region disaster recovery.',
        },
        {
          text: 'We do not have a disaster recovery plan.',
          score: -2,
          explanation:
            'A major business risk that threatens the continuity of the entire operation.',
          recommendation:
            'Very Poor. No DR plan exists. Develop and implement a comprehensive plan immediately.',
        },
      ],
    },
    {
      id: 44,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Data Protection',
      text: 'How do you monitor for and respond to security events in your cloud environment?',
      explanation:
        'Determines your process for detecting and reacting to security alerts from your cloud services, ensuring a swift response to potential threats.',
      options: [
        {
          text: 'We have a centralized security alerting system (from SIEM/monitoring tools) with automated response actions for common events and a 24/7 on-call rotation.',
          score: 2,
          explanation: 'A mature, proactive security operations model.',
          recommendation: 'Excellent. This proactive model enables rapid threat response.',
        },
        {
          text: 'We receive email alerts from cloud security services and respond to them manually during business hours.',
          score: 1,
          explanation:
            'Good, but can lead to significant delays in response, especially for overnight incidents.',
          recommendation:
            'Good. Alerting exists but implement 24/7 monitoring for faster response.',
        },
        {
          text: 'We periodically log in to the cloud console to check for any security notifications.',
          score: -1,
          explanation:
            'A reactive and ineffective approach. Threats can cause significant damage before being noticed.',
          recommendation:
            'Poor. Reactive monitoring is insufficient. Implement proactive alerting systems.',
        },
        {
          text: 'We assume the cloud provider handles all security events.',
          score: -2,
          explanation:
            'A critical misunderstanding of the Shared Responsibility Model. The customer is responsible for security in the cloud.',
          recommendation:
            'Very Poor. Misunderstanding of shared responsibility. Take ownership of security monitoring.',
        },
        {
          text: 'We do not monitor for security events.',
          score: -2,
          explanation: 'Complete lack of visibility into threats, attacks, and misconfigurations.',
          recommendation:
            'Very Poor. No monitoring exists. Implement security monitoring immediately.',
        },
      ],
    },
    {
      id: 45,
      assessment_name: 'Advanced Cloud Security Check',
      category: 'Access Management',
      text: 'How do you secure serverless functions (e.g., Lambda, Azure Functions)?',
      explanation:
        'If you use serverless computing, this checks how you control the permissions of each function to ensure it only accesses the specific resources it needs (least privilege).',
      options: [
        {
          text: 'Each serverless function has a unique IAM execution role with narrowly scoped, least-privilege permissions. Function dependencies are scanned for vulnerabilities.',
          score: 2,
          explanation: 'Excellent. A granular, secure-by-design approach to serverless security.',
          recommendation: 'Excellent. This granular approach provides optimal serverless security.',
        },
        {
          text: 'Functions use shared execution roles with broader permissions based on their general purpose (e.g., "database-access-role").',
          score: 1,
          explanation:
            'A common practice, but it often grants functions more permissions than they strictly need.',
          recommendation:
            'Good. Roles exist but implement function-specific permissions for least privilege.',
        },
        {
          text: 'All functions run under a single, highly permissive execution role for simplicity.',
          score: -1,
          explanation:
            'High risk. A vulnerability in one function could be exploited to abuse the permissions of all other functions.',
          recommendation:
            'Poor. Overly permissive roles create risk. Implement function-specific roles.',
        },
        {
          text: 'Our functions have administrator-level permissions to avoid any access issues.',
          score: -2,
          explanation:
            'Critical risk. A compromise of a single function would lead to a full environment compromise.',
          recommendation:
            'Very Poor. Administrator permissions create extreme risk. Implement least privilege immediately.',
        },
        {
          text: 'We do not use serverless functions.',
          score: 0,
          explanation: 'Not applicable if serverless functions are not in use.',
          recommendation: 'Fair. Not applicable, but consider serverless benefits for scalability.',
        },
      ],
    },
    {
      id: 46,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Data Governance',
      text: 'What is your documented lawful basis for processing personal data?',
      explanation:
        'GDPR requires you to have a valid, specific reason for collecting and using personal data. This checks if you have identified and written down your legal reason (e.g., user consent).',
      options: [
        {
          text: 'We have a documented lawful basis for each data processing activity, which is reviewed and included in our privacy notice.',
          score: 2,
          explanation:
            'Excellent. Demonstrates a clear understanding and implementation of a core GDPR principle.',
          recommendation:
            'Excellent. Maintain your documented lawful bases and ensure they are regularly reviewed and communicated in your privacy notice.',
        },
        {
          text: 'We primarily rely on user consent, obtained via clear affirmative action, for all our data processing.',
          score: 1,
          explanation:
            "Good, but consent is not always the only or best basis. It's important to understand all six lawful bases.",
          recommendation:
            'Review other lawful bases under GDPR. Consent is appropriate in many cases, but may not cover all processing activities.',
        },
        {
          text: "We process data based on our 'legitimate interests' but have not performed or documented a formal balancing test.",
          score: -1,
          explanation:
            'High compliance risk. Using legitimate interests without a documented LIA is not compliant.',
          recommendation:
            'Conduct and document Legitimate Interests Assessments (LIAs) for all processing activities using this basis.',
        },
        {
          text: 'We assume we have a right to process the data we collect.',
          score: -2,
          explanation:
            'Critical compliance failure. Processing without a lawful basis is a major infringement.',
          recommendation:
            'Immediately identify and document lawful bases for all processing activities. Processing without a valid basis violates GDPR.',
        },
        {
          text: "We are not sure what a 'lawful basis' is.",
          score: -2,
          explanation: 'Indicates a fundamental lack of understanding of GDPR requirements.',
          recommendation:
            'Train staff on GDPR fundamentals and conduct a comprehensive review of your data processing activities.',
        },
      ],
    },
    {
      id: 47,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Operational Compliance',
      text: 'How do you facilitate data subject rights (e.g., right to access, right to erasure)?',
      explanation:
        'Asks about your process for handling requests from individuals who want to see, change, or delete the personal data you hold about them, as required by law.',
      options: [
        {
          text: 'We have a clear, documented process and a dedicated contact point for handling data subject requests within the one-month time limit.',
          score: 2,
          explanation:
            'Best practice. Ensures you can meet your legal obligations efficiently and correctly.',
          recommendation:
            'Regularly test your DSAR process and train staff on handling complex requests.',
        },
        {
          text: 'We handle requests on an ad-hoc basis as they come in via email or support tickets.',
          score: 0,
          explanation:
            'Risky. An ad-hoc process can easily miss the legal deadline, leading to a compliance breach.',
          recommendation:
            'Implement a formal DSAR process with tracking mechanisms to ensure timely responses.',
        },
        {
          text: 'We have received requests but are unsure how to process them or if we have to comply.',
          score: -1,
          explanation:
            'High risk of non-compliance. Ignoring or improperly handling requests can lead to complaints and fines.',
          recommendation:
            'Immediately establish a formal DSAR procedure and train relevant staff on GDPR requirements.',
        },
        {
          text: 'We tell users we are unable to delete their data.',
          score: -2,
          explanation:
            'A direct violation of data subject rights under GDPR, unless a specific legal exemption applies.',
          recommendation:
            'Review GDPR requirements for data erasure. Implement processes to comply with valid deletion requests.',
        },
        {
          text: 'We have never received a data subject request.',
          score: 0,
          explanation:
            "Neutral, but it's crucial to have a process in place for when a request is eventually received.",
          recommendation:
            'Proactively establish a DSAR process rather than waiting for your first request.',
        },
      ],
    },
    {
      id: 48,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Data Governance',
      text: 'Do you have a Data Protection Officer (DPO) appointed, if required?',
      explanation:
        'Checks if your organization has officially appointed a person responsible for overseeing data protection strategy and compliance, which is mandatory for some businesses.',
      options: [
        {
          text: 'Yes, we have formally appointed a DPO with the necessary expertise and have registered them with the relevant supervisory authority.',
          score: 2,
          explanation:
            'Excellent. Correctly implemented where required, showing mature governance.',
          recommendation:
            'Ensure your DPO maintains independence and has adequate resources to perform their duties effectively.',
        },
        {
          text: 'We have assigned data protection responsibilities to an existing employee, but not as a formal DPO role.',
          score: 1,
          explanation:
            'A good step, but may not meet the formal requirements if a DPO is mandatory for your organization.',
          recommendation:
            'Evaluate if your processing activities require a formal DPO appointment under GDPR Article 37.',
        },
        {
          text: 'We use an external consultant for data protection advice but have no appointed DPO.',
          score: 0,
          explanation: 'May be compliant if a DPO is not mandatory, but risky if one is required.',
          recommendation:
            'Confirm whether your processing activities legally require a DPO. Document your compliance decision.',
        },
        {
          text: 'We are a small company and believe we do not need a DPO.',
          score: -1,
          explanation:
            'A risky assumption. The need for a DPO is based on processing activities, not just company size.',
          recommendation:
            'Re-evaluate DPO requirements based on core processing activities, not just organizational size.',
        },
        {
          text: 'We do not know what a DPO is.',
          score: -2,
          explanation:
            "Indicates a significant gap in understanding GDPR's governance requirements.",
          recommendation:
            'Immediately train key staff on GDPR requirements and conduct a formal compliance assessment.',
        },
      ],
    },
    {
      id: 49,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Operational Compliance',
      text: "How do you implement 'Data Protection by Design and by Default'?",
      explanation:
        'This principle means you must build data protection into your projects from the very beginning, and your default settings should be the most privacy-friendly. This question checks your approach.',
      options: [
        {
          text: 'We have a formal process where a Data Protection Impact Assessment (DPIA) is conducted for all new projects involving personal data.',
          score: 2,
          explanation: 'Excellent. This embeds privacy into your operations, as required by GDPR.',
          recommendation:
            'Maintain this proactive approach and ensure DPIAs are consistently documented and acted upon.',
        },
        {
          text: 'We consider privacy during the design phase of new products, but the process is informal.',
          score: 1,
          explanation:
            'A good cultural practice, but an informal process can be inconsistent and hard to prove to regulators.',
          recommendation:
            'Formalize your privacy-by-design process with documented procedures and accountability mechanisms.',
        },
        {
          text: 'We try to add privacy features after a product has been built if a concern is raised.',
          score: -1,
          explanation:
            "A reactive approach that goes against the core principle of 'by Design and by Default'.",
          recommendation:
            'Shift to proactive privacy design by integrating assessments early in development lifecycles.',
        },
        {
          text: 'We prioritize functionality first and consider privacy only if required by customers.',
          score: -2,
          explanation: "A direct contradiction of the 'Data Protection by Design' principle.",
          recommendation:
            'Reorient your development philosophy to prioritize privacy from the initial design stages.',
        },
        {
          text: 'We are not familiar with this principle.',
          score: -2,
          explanation: "A fundamental gap in knowledge of GDPR's core operational requirements.",
          recommendation:
            'Immediately train product teams on Privacy by Design principles and GDPR requirements.',
        },
      ],
    },
    {
      id: 50,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Operational Compliance',
      text: 'What is your process for data breach notification to the supervisory authority (e.g., ICO in the UK)?',
      explanation:
        'Asks about your plan for reporting a personal data breach to the official data protection authority within the legally required 72-hour timeframe.',
      options: [
        {
          text: 'We have a documented internal procedure for assessing and reporting breaches to the supervisory authority within 72 hours, as part of our Incident Response Plan.',
          score: 2,
          explanation:
            'Best practice. Ensures you can meet the tight and mandatory reporting deadline.',
          recommendation:
            'Regularly test your breach reporting process through tabletop exercises.',
        },
        {
          text: 'We know we need to report breaches and would contact our legal advisor to do so if one occurred.',
          score: 1,
          explanation:
            'Good awareness, but not having a pre-defined internal process can cause critical delays.',
          recommendation:
            'Develop internal breach assessment procedures rather than relying solely on external advisors.',
        },
        {
          text: 'We would only report a breach if it was very large or if customers complained.',
          score: -2,
          explanation:
            'Non-compliant. All breaches posing a risk to individuals must be reported, not just large ones.',
          recommendation:
            'Immediately revise your breach assessment criteria to align with GDPR requirements.',
        },
        {
          text: 'We believe we are not required to report data breaches.',
          score: -2,
          explanation:
            'A critical misunderstanding of GDPR obligations, which can lead to significant fines.',
          recommendation:
            'Educate leadership on mandatory breach reporting requirements under GDPR Article 33.',
        },
        {
          text: 'We do not have a process for this.',
          score: -1,
          explanation:
            'High risk. Without a process, meeting the 72-hour deadline is nearly impossible.',
          recommendation:
            'Immediately document a breach notification procedure with clear roles and timelines.',
        },
      ],
    },
    {
      id: 51,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Data Governance',
      text: 'Do you maintain a Record of Processing Activities (RoPA) as required under Article 30?',
      explanation:
        'Checks if you keep a detailed internal record of all your activities that involve processing personal data, including the purpose, data categories, and any data transfers.',
      options: [
        {
          text: 'Yes, we maintain a comprehensive and up-to-date RoPA that is regularly reviewed and made available to supervisory authorities upon request.',
          score: 2,
          explanation: 'Excellent. This meets a core, mandatory documentation requirement of GDPR.',
          recommendation:
            'Continue regular reviews and updates of your RoPA as processing activities evolve.',
        },
        {
          text: 'We have a spreadsheet that lists our main data processing activities, but it is not fully detailed or regularly updated.',
          score: 1,
          explanation:
            'A good start, but an incomplete or outdated RoPA does not meet the legal requirement.',
          recommendation:
            'Expand your RoPA to include all GDPR-required elements and implement a quarterly review process.',
        },
        {
          text: 'We have some documentation on data flows for specific projects, but not a central record.',
          score: -1,
          explanation:
            'Insufficient. GDPR requires a central, comprehensive Record of Processing Activities.',
          recommendation:
            'Consolidate all documentation into a single RoPA that covers all processing activities.',
        },
        {
          text: 'We do not maintain a record of our processing activities.',
          score: -2,
          explanation:
            'A direct breach of a mandatory GDPR documentation requirement (Article 30).',
          recommendation:
            'Immediately create a RoPA. Start by documenting your data flows, purposes, and legal bases.',
        },
        {
          text: 'We do not know what a RoPA is.',
          score: -2,
          explanation: 'A critical knowledge gap regarding a key GDPR accountability obligation.',
          recommendation:
            'Train staff on GDPR documentation requirements and immediately begin creating your RoPA.',
        },
      ],
    },
    {
      id: 52,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Operational Compliance',
      text: 'How do you ensure data protection with third-party vendors (data processors)?',
      explanation:
        'Asks what steps you take to ensure that other companies you share personal data with (like a cloud provider or marketing service) also protect it according to GDPR rules.',
      options: [
        {
          text: 'We have signed Data Processing Agreements (DPAs) with all third-party vendors, and we conduct periodic reviews of their security and compliance measures.',
          score: 2,
          explanation:
            'A mature, best-practice approach to managing supply chain and data processor risk.',
          recommendation:
            'Continue regular vendor audits and maintain a central register of all DPAs.',
        },
        {
          text: 'We have DPAs in place with our major vendors.',
          score: 1,
          explanation:
            'Good practice, but GDPR requires a DPA with all processors, not just major ones.',
          recommendation:
            'Extend DPAs to cover all vendors processing personal data, regardless of size or importance.',
        },
        {
          text: "We check the vendor's privacy policy before using their service, but do not have formal agreements.",
          score: -1,
          explanation:
            'Insufficient. A privacy policy is not a substitute for a legally binding DPA.',
          recommendation:
            'Implement a vendor onboarding process that requires DPAs before sharing any personal data.',
        },
        {
          text: 'We use vendors without a formal data protection review process.',
          score: -2,
          explanation:
            "High risk. You are liable for breaches caused by your data processors if you haven't performed due diligence.",
          recommendation:
            'Immediately pause sharing data with vendors until proper DPAs and assessments are in place.',
        },
        {
          text: 'We do not share personal data with any third-party vendors.',
          score: 0,
          explanation: 'Reduces this specific risk, but this is rare for modern businesses.',
          recommendation:
            'If you begin sharing data with vendors, ensure you have DPAs in place beforehand.',
        },
      ],
    },
    {
      id: 53,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Operational Compliance',
      text: 'How do you manage international data transfers outside the UK/EEA?',
      explanation:
        'If you send personal data to other countries, this checks if you use a legally approved method (like Standard Contractual Clauses) to ensure that data remains protected.',
      options: [
        {
          text: "All international data transfers are mapped and conducted using a valid transfer mechanism, such as the UK's International Data Transfer Agreement or Adequacy decisions.",
          score: 2,
          explanation:
            'Excellent. Demonstrates a clear and compliant approach to a complex area of GDPR.',
          recommendation:
            'Maintain your transfer register and stay updated on changing adequacy decisions.',
        },
        {
          text: 'We are aware some of our vendors are outside the UK/EEA and believe they are compliant, but have not documented the transfer mechanism.',
          score: -1,
          explanation:
            'Belief is not sufficient for compliance. You must have a valid, documented transfer mechanism in place.',
          recommendation:
            'Document all international transfers and implement appropriate safeguards like SCCs or IDTAs.',
        },
        {
          text: "We transfer data to vendors globally without a specific legal mechanism in place, assuming it's okay.",
          score: -2,
          explanation: "A direct breach of GDPR's rules on international data transfers.",
          recommendation:
            'Immediately cease unauthorized international transfers and implement GDPR-compliant mechanisms.',
        },
        {
          text: 'We are not sure where our data is stored or transferred.',
          score: -1,
          explanation:
            'A significant governance failure. You must know where the personal data you control is going.',
          recommendation:
            'Conduct a comprehensive data mapping exercise to identify all international data flows.',
        },
        {
          text: 'We do not transfer any data internationally.',
          score: 0,
          explanation:
            'Simplifies compliance, but ensure this is accurate (e.g., check where your cloud provider stores data).',
          recommendation:
            'Regularly verify that no personal data leaves the UK/EEA, including through cloud services.',
        },
      ],
    },
    {
      id: 54,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Data Governance',
      text: 'How are data retention periods defined and enforced?',
      explanation:
        "Checks if you have a policy that specifies how long you keep different types of personal data, and a process to securely delete it once it's no longer needed.",
      options: [
        {
          text: 'We have a data retention policy with specific periods for all categories of personal data, and an automated process for deletion or anonymization.',
          score: 2,
          explanation:
            'Best practice. This operationalizes the GDPR principle of storage limitation.',
          recommendation:
            'Regularly audit your deletion processes to ensure compliance with documented retention periods.',
        },
        {
          text: 'We have general guidelines for data retention but the deletion process is manual and ad-hoc.',
          score: 1,
          explanation:
            'A good start, but a manual process is prone to error and data being kept for too long.',
          recommendation:
            'Implement automated deletion workflows and conduct quarterly audits of stored personal data.',
        },
        {
          text: 'We keep most data indefinitely unless a user specifically asks for it to be deleted.',
          score: -2,
          explanation:
            "A direct violation of the storage limitation principle. Data should not be kept forever 'just in case'.",
          recommendation:
            'Immediately establish specific retention periods and implement a process for regular data purging.',
        },
        {
          text: 'We have never deleted any personal data we have collected.',
          score: -2,
          explanation:
            'This indicates a systemic failure to comply with the storage limitation principle.',
          recommendation:
            'Conduct a full data audit and create a prioritized plan for secure deletion of outdated personal data.',
        },
        {
          text: 'We do not have a data retention policy.',
          score: -1,
          explanation:
            'High compliance risk. You must be able to justify why you are still holding personal data.',
          recommendation:
            "Develop and implement a data retention policy aligned with GDPR's storage limitation principle.",
        },
      ],
    },
    {
      id: 55,
      assessment_name: 'GDPR Compliance Audit',
      category: 'Data Governance',
      text: 'How do you ensure your privacy notices are transparent and easily accessible?',
      explanation:
        'Checks if your privacy policy is easy for people to find, written in clear language, and contains all the information required by GDPR to inform them about how you use their data.',
      options: [
        {
          text: 'Our privacy notice is written in plain language, easily accessible from all data collection points, and reviewed regularly for accuracy and compliance.',
          score: 2,
          explanation:
            'Excellent. This meets the GDPR requirements for transparency and accessibility.',
          recommendation:
            'Continue regular reviews and user testing to ensure your notices remain clear and comprehensive.',
        },
        {
          text: 'We have a comprehensive privacy policy linked in our website footer.',
          score: 1,
          explanation:
            "Good, but must also be actively provided at the point of data collection ('just-in-time' notice).",
          recommendation:
            'Implement contextual privacy notices at all data collection points, not just in your website footer.',
        },
        {
          text: 'Our privacy policy is a long legal document that is difficult for a non-lawyer to understand.',
          score: -1,
          explanation:
            "Fails the GDPR requirement for information to be provided in 'a concise, transparent, intelligible and easily accessible form, using clear and plain language'.",
          recommendation:
            'Redraft your privacy notice using simpler language, layered formats, and visual aids.',
        },
        {
          text: 'We do not have a privacy notice or policy.',
          score: -2,
          explanation:
            'A critical compliance failure that violates the core principle of transparency.',
          recommendation:
            'Immediately create and publish a GDPR-compliant privacy notice covering all processing activities.',
        },
        {
          text: 'We use a generic privacy policy template we found online.',
          score: -1,
          explanation:
            'High risk. A template is not specific to your data processing activities and is likely non-compliant.',
          recommendation:
            'Customize your privacy notice to accurately reflect your specific data processing activities.',
        },
      ],
    },
  ])

  // // --- Getters (Computed Properties) ---
  // const getQuestionnaireById = (id) => {
  //   // The ID from the route is a string, so we need to convert it.
  //   const numericId = parseInt(id, 10)
  //   return questionnaires.value.find((q) => q.id === numericId)
  // }

  // const getQuestionsForAssessment = (assessmentName) => {
  //   return allQuestions.value.filter((q) => q.assessment_name === assessmentName)
  // }

  // const getQuestionCountForAssessment = (assessmentName) => {
  //   return getQuestionsForAssessment(assessmentName).length
  // }

  // // --- Actions ---
  // const updateQuestionnaire = (updatedQuestionnaire) => {
  //   const index = questionnaires.value.findIndex((q) => q.id === updatedQuestionnaire.id)
  //   if (index !== -1) {
  //     questionnaires.value[index] = {
  //       ...updatedQuestionnaire,
  //       lastUpdated: new Date().toISOString(),
  //     }
  //     // In a real app, you'd also update the questions in `allQuestions`
  //     console.log('Updated questionnaire:', questionnaires.value[index])
  //     return { success: true }
  //   }
  //   return { success: false, message: 'Questionnaire not found' }
  // }

  // const addQuestionnaire = (newQuestionnaireData) => {
  //   const newId = Math.max(...questionnaires.value.map((q) => q.id)) + 1
  //   const newQ = {
  //     ...newQuestionnaireData,
  //     id: newId,
  //     lastUpdated: new Date().toISOString(),
  //   }
  //   questionnaires.value.push(newQ)
  //   console.log('Added new questionnaire:', newQ)
  //   return { success: true, newQuestionnaire: newQ }
  // }

  // return {
  //   questionnaires,
  //   allQuestions,
  //   getQuestionnaireById,
  //   getQuestionsForAssessment,
  //   getQuestionCountForAssessment,
  //   updateQuestionnaire,
  //   addQuestionnaire,
  // }
  // --- Getters (Computed Properties) ---
  const getQuestionnaireById = (id) => {
    // The ID from the route is a string, so we need to convert it.
    const numericId = parseInt(id, 10)
    return questionnaires.value.find((q) => q.id === numericId)
  }

  const getQuestionsForAssessment = (assessmentName) => {
    return allQuestions.value.filter((q) => q.assessment_name === assessmentName)
  }

  const getQuestionCountForAssessment = (assessmentName) => {
    return getQuestionsForAssessment(assessmentName).length
  }

  // --- Actions ---
  const updateQuestionnaire = (updatedQuestionnaire) => {
    const qIndex = questionnaires.value.findIndex((q) => q.id === updatedQuestionnaire.id)
    if (qIndex === -1) {
      return { success: false, message: 'Questionnaire not found' }
    }

    // Get the original name before the update, in case it was changed.
    const originalName = questionnaires.value[qIndex].name
    const newName = updatedQuestionnaire.name

    // Separate metadata from the questions payload
    const { questions: updatedQuestions, ...metaData } = updatedQuestionnaire

    // Update the questionnaire metadata (name, status, etc.)
    questionnaires.value[qIndex] = {
      ...metaData,
      lastUpdated: new Date().toISOString(),
    }

    // Remove all questions associated with the *original* name.
    // This handles deletions and prepares for updates/additions.
    allQuestions.value = allQuestions.value.filter((q) => q.assessment_name !== originalName)

    // Add the updated list of questions back, ensuring they have the new name.
    const questionsToAdd = updatedQuestions.map((q) => ({
      ...q,
      assessment_name: newName,
    }))
    allQuestions.value.push(...questionsToAdd)

    console.log('Updated questionnaire and questions successfully.')
    return { success: true }
  }

  const addQuestionnaire = (newQuestionnaireData) => {
    const newId =
      questionnaires.value.length > 0 ? Math.max(...questionnaires.value.map((q) => q.id)) + 1 : 1
    const { questions: newQuestions, ...metaData } = newQuestionnaireData
    const newQ = {
      ...metaData,
      id: newId,
      lastUpdated: new Date().toISOString(),
    }
    questionnaires.value.push(newQ)
    // Also add the questions to the allQuestions list
    const questionsToAdd = newQuestions.map((q) => ({
      ...q,
      assessment_name: newQ.name, // Use the name from the new metadata
    }))
    allQuestions.value.push(...questionsToAdd)
    console.log('Added new questionnaire:', newQ)
    return { success: true, newQuestionnaire: newQ }
  }

  return {
    questionnaires,
    allQuestions,
    getQuestionnaireById,
    getQuestionsForAssessment,
    getQuestionCountForAssessment,
    updateQuestionnaire,
    addQuestionnaire,
  }
})
