"use client"
import { useState, useEffect } from "react"
import { cn } from "@workspace/ui/lib/utils"

export default function DesktopPrivacyPolicyDetailed() {
  const [activeSection, setActiveSection] = useState("introduction")

  const sections = [
    { id: "introduction", title: "1. Introduction & Definitions" },
    { id: "data-collection", title: "2. Categories of Data Collected" },
    { id: "collection-methods", title: "3. Methods of Data Collection" },
    { id: "purposes", title: "4. Purposes of Processing" },
    { id: "legal-basis", title: "5. Legal Basis for Processing" },
    { id: "sharing", title: "6. Data Sharing & Disclosure" },
    { id: "cross-border", title: "7. International Data Transfers" },
    { id: "security", title: "8. Data Security Protocols" },
    { id: "retention", title: "9. Data Retention Policies" },
    { id: "user-rights", title: "10. User Rights & Choices" },
    { id: "cookies", title: "11. Comprehensive Cookie Policy" },
    { id: "third-party", title: "12. Third-Party Links" },
    { id: "children", title: "13. Children's Privacy" },
    { id: "changes", title: "14. Modifications to Policy" },
    { id: "contact", title: "15. Contact Information" },
  ]

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      const offset = 120
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id))
      const scrollPosition = window.scrollY + 150

      sectionElements.forEach((el) => {
        if (el && el.offsetTop <= scrollPosition && (el.offsetTop + el.offsetHeight) > scrollPosition) {
          setActiveSection(el.id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [sections])

  return (
    <div className="mx-auto flex max-w-360 items-start gap-16 px-8 py-12 xl:gap-24 text-foreground">
      
      {/* Left Column: Sticky Navigation */}
      <div className="sticky top-32 hidden w-72 shrink-0 flex-col gap-8 lg:flex">
        <div>
          <h1 className="font-serif text-3xl leading-tight tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">London Kollection</p>
        </div>
        
        <nav className="flex flex-col gap-3 border-l border-border/50 pl-4 h-[60vh] overflow-y-auto pr-4 no-scrollbar">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "text-left text-sm transition-all duration-200 py-1",
                activeSection === section.id
                  ? "font-medium text-foreground -ml-4.25 border-l-2 border-foreground pl-4"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Column: Main Content */}
      <div className="flex-1 flex flex-col gap-16 pb-32">
        
        <div className="rounded-xl border border-border/50 bg-secondary/20 p-8">
          <h3 className="mb-3 text-sm font-bold tracking-widest uppercase text-foreground">
            Extensive Privacy Commitment & Legal Notice
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This comprehensive Privacy Policy ("Policy") is issued by London Kollection ("Company," "we," "our," or "us"). We recognize and respect the fundamental importance of data privacy and security for our users, customers, and visitors ("User," "you," or "your"). This document has been meticulously drafted to provide complete transparency regarding our data collection, processing, storage, and sharing methodologies. It is intended to comply strictly with the applicable laws of the State of Kuwait, primarily Law No. 20 of 2014 concerning Electronic Transactions, alongside supplementary regulations established by the Communication and Information Technology Regulatory Authority (CITRA). Please read this detailed policy thoroughly to understand our views and practices regarding your personal data and how we will treat it.
          </p>
        </div>

        {/* Section 1 */}
        <section id="introduction" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">1. Introduction & Definitions</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Welcome to the London Kollection Privacy Policy. This Policy applies to all information collected through our website (londonkollections.com), related mobile applications, APIs, electronic communications, and any offline interactions related to our e-commerce services (collectively referred to as the "Services"). By accessing or utilizing our Services in any capacity, you acknowledge that you have read, understood, and entirely agree to be bound by the terms detailed in this Policy.</p>
            <p>To ensure absolute clarity and precision throughout this document, the following terms shall be defined as follows:</p>
            <ul className="space-y-4 list-disc list-outside ml-6 mt-4">
              <li><strong className="text-foreground">"Personal Data" or "Personal Information":</strong> Any information relating to an identified or identifiable natural person. An identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier, or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural, or social identity of that natural person.</li>
              <li><strong className="text-foreground">"Data Controller":</strong> The natural or legal person, public authority, agency, or other body which, alone or jointly with others, determines the purposes and means of the processing of personal data. For the purposes of this Policy, London Kollection acts as the Data Controller.</li>
              <li><strong className="text-foreground">"Data Processor":</strong> A natural or legal person, public authority, agency, or other body which processes personal data on behalf of the Data Controller. This includes third-party service providers, cloud storage providers, and payment gateways utilized by London Kollection.</li>
              <li><strong className="text-foreground">"Processing":</strong> Any operation or set of operations which is performed on personal data or on sets of personal data, whether or not by automated means, such as collection, recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure, or destruction.</li>
              <li><strong className="text-foreground">"Consent":</strong> Any freely given, specific, informed, and unambiguous indication of the data subject's wishes by which he or she, by a statement or by a clear affirmative action, signifies agreement to the processing of personal data relating to him or her.</li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section id="data-collection" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">2. Categories of Data Collected</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>In order to provide highly personalized, efficient, and secure Services, London Kollection may collect, use, store, and transfer varying types of Personal Data. We have grouped these categories of data as comprehensively as follows:</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Identity Data</h3>
            <p>This category encompasses the fundamental identifiers required to establish an individual as a customer of our brand. It includes, but is not expressly limited to, your first name, middle name, last name, preferred salutation, marital status, title, date of birth, gender, and national identity numbers (only where strictly mandated by local customs or taxation authorities for international shipments).</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Contact Data</h3>
            <p>This category contains the communication channels we utilize to interact with you. It includes your primary and alternate billing addresses, residential or commercial delivery addresses, electronic mail (e-mail) addresses, primary mobile telephone numbers, and alternate landline or business telephone numbers.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Financial Data</h3>
            <p>Financial Data pertains to the mechanisms utilized to execute transactions on our platform. This includes bank account details, payment card particulars (including cardholder name, card number, expiration date, and CVV codes). It is imperative to note that London Kollection does not store full credit card data on our own servers. All Financial Data is instantly tokenized, encrypted, and processed by certified, PCI-DSS compliant third-party payment gateways.</p>

            <h3 className="text-base font-bold text-foreground mt-6">D. Transaction Data</h3>
            <p>This comprises comprehensive details regarding your historical and current interactions with our commercial offerings. It includes records of payments originating from and directed to you, exhaustive details of products and services you have purchased, returned, or exchanged, order timestamps, transaction reference numbers, promotional codes utilized, and refund histories.</p>

            <h3 className="text-base font-bold text-foreground mt-6">E. Technical Data</h3>
            <p>Whenever you interact with our digital infrastructure, we automatically gather technical telemetry. This includes internet protocol (IP) addresses, user login data, browser type and version specifications, time zone settings and location data, browser plug-in types and versions, operating systems and platforms, and other technical metadata regarding the devices you utilize to access this Website.</p>

            <h3 className="text-base font-bold text-foreground mt-6">F. Profile Data</h3>
            <p>This category represents the unique digital footprint and persona you maintain on our platform. It includes your secure account username or unique identifier, your encrypted password credentials, your historical purchase and order compilation, your expressly stated product interests, your size and fit preferences, customer feedback provided, and responses to detailed brand surveys.</p>

            <h3 className="text-base font-bold text-foreground mt-6">G. Usage Data</h3>
            <p>Usage Data involves analytics detailing precisely how you utilize our Website, products, and services. This includes complete uniform resource locator (URL) clickstreams to, through, and from our Website, products viewed or searched for, page response times, download errors, lengths of visits to specific pages, page interaction information (such as scrolling, clicks, and mouse-overs), and methods utilized to browse away from the page.</p>

            <h3 className="text-base font-bold text-foreground mt-6">H. Marketing and Communications Data</h3>
            <p>This outlines your explicit preferences concerning receiving direct marketing collateral from London Kollection and our designated third-party affiliates, as well as your granular communication preferences (e.g., preference for SMS notifications over email, or vice versa).</p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="collection-methods" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">3. Methods of Data Collection</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>We deploy multiple, diverse methodologies to collect data from and about you, ensuring a holistic understanding of our customer base while maintaining absolute compliance with privacy statutes.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Direct Interactions</h3>
            <p>The vast majority of data is procured when you directly provide it to us. You may give us your Identity, Contact, and Financial Data by filling in forms or corresponding with us by post, phone, email, live chat, or otherwise. This distinctly includes personal data you provide when you:</p>
            <ul className="list-disc list-outside ml-6 space-y-2 mt-2">
              <li>Apply for or purchase our products or services;</li>
              <li>Create a user account or guest profile on our Website;</li>
              <li>Subscribe to our newsletters, digital publications, or marketing broadcasts;</li>
              <li>Request marketing collateral, lookbooks, or promotional material to be sent to you;</li>
              <li>Enter a brand competition, promotional event, or survey;</li>
              <li>Provide direct feedback, reviews, or contact our customer support infrastructure.</li>
            </ul>

            <h3 className="text-base font-bold text-foreground mt-6">B. Automated Technologies or Interactions</h3>
            <p>As you interact with our digital infrastructure, we automatically collect Technical and Usage Data concerning your equipment, browsing actions, and patterns. We aggregate this data by utilizing cookies, server logs, web beacons, clear GIFs, and other similar prevailing tracking technologies. We may also receive Technical Data about you if you visit other websites implementing our specialized cookies.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Third Parties or Publicly Available Sources</h3>
            <p>We may receive personal data about you from various authorized third parties and public sources, including but not limited to:</p>
            <ul className="list-disc list-outside ml-6 space-y-2 mt-2">
              <li>Analytics providers (such as Google Analytics);</li>
              <li>Advertising networks and digital marketing agencies;</li>
              <li>Search information providers;</li>
              <li>Contact, Financial, and Transaction Data from technical, payment, and delivery service networks operating securely;</li>
              <li>Identity and Contact Data from data brokers or aggregators where legally permissible.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section id="purposes" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">4. Purposes of Processing</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>We have meticulously set out below a detailed description of all the primary ways we plan to use your personal data. We will only use your personal data for the purposes for which we collected it, unless we reasonably consider that we need to use it for another fundamentally compatible purpose. If we need to use your personal data for an entirely unrelated purpose, we will notify you and systematically explain the legal basis which allows us to do so.</p>
            
            <ul className="space-y-6 list-none mt-4">
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">To Register You as a New Customer</strong>
                <p>We utilize your Identity and Contact Data to create, authenticate, and manage your user account, ensuring secure access to your profile and historical records.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">To Process and Deliver Your Order</strong>
                <p>We rigorously utilize Identity, Contact, Financial, and Transaction Data to manage payments, fees, and charges, securely collect and recover money owed to us, dispatch physical goods via our logistics partners, and manage complex cross-border customs declarations where applicable.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">To Manage Our Ongoing Relationship With You</strong>
                <p>This includes notifying you about critical modifications to our Terms or Privacy Policy, asking you to leave a review or take a survey, and providing post-sale customer support utilizing Identity, Contact, Profile, and Marketing Data.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">To Administer and Protect Our Business and Website</strong>
                <p>We rely on Identity, Contact, and Technical Data for comprehensive troubleshooting, advanced data analysis, exhaustive testing, system maintenance, high-level support, robust reporting, and secure hosting of data. This is critical for preventing fraudulent activities and defending against malicious cyber-attacks.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">To Deliver Relevant Content and Advertisements</strong>
                <p>We utilize Identity, Contact, Profile, Usage, Marketing, and Technical Data to ascertain the effectiveness of the advertising we serve to you and to selectively deliver bespoke, tailored marketing collateral that aligns with your demonstrated consumer preferences.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">To Utilize Data Analytics to Improve Our Services</strong>
                <p>We process Technical and Usage Data to continuously evaluate, iterate upon, and enhance our Website architecture, physical product lines, service methodologies, marketing strategies, customer relationships, and overall consumer experiences.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section id="legal-basis" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">5. Legal Basis for Processing</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>In adherence to stringent data protection doctrines, including the frameworks established by Kuwaiti jurisdiction and international best practices, we mandate that every instance of data processing be anchored in a verifiable legal foundation. We rely on the following legal bases to process your Personal Data:</p>
            
            <ul className="list-disc list-outside ml-6 space-y-4 mt-4">
              <li><strong className="text-foreground">Performance of a Contract:</strong> Processing is absolutely necessary for the performance of a commercial contract to which you are a primary party (e.g., when you purchase a product, we must process your data to fulfill that purchase) or in order to take imperative steps at your direct request prior to entering into a commercial contract.</li>
              <li><strong className="text-foreground">Explicit Consent:</strong> In specific scenarios, we collect and process your data based on your explicit, freely given, informed, and unambiguous consent. This is predominantly utilized for direct email marketing, SMS promotional broadcasts, and the deployment of non-essential tracking cookies. You possess the unalienable right to withdraw this consent at any juncture.</li>
              <li><strong className="text-foreground">Legitimate Interests:</strong> We may process your data when it is fundamentally necessary for our legitimate corporate interests, provided that these interests are not overridden by your fundamental rights, freedoms, and interests. Our legitimate interests include the continuous development of our product lines, maintaining the absolute security of our IT infrastructure, preventing fraud, and optimizing corporate operational efficiencies.</li>
              <li><strong className="text-foreground">Legal Obligation:</strong> Processing is strictly necessary for compliance with a mandatory legal or regulatory obligation to which London Kollection is subject. This includes processing data for tax declarations, financial auditing, anti-money laundering (AML) compliance, and responding to binding, lawful requests from recognized Kuwaiti judicial or governmental authorities.</li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section id="sharing" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">6. Data Sharing & Disclosure</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>London Kollection operates within a complex digital ecosystem requiring collaboration with specialized external entities. While we unequivocally reject the practice of selling user data to data brokers, we may share your Personal Data with the following categories of third parties under strict contractual confidentiality obligations:</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Core Service Providers (Sub-Processors)</h3>
            <p>We engage vetted, enterprise-tier third-party companies to perform critical business functions on our behalf. These include:</p>
            <ul className="list-disc list-outside ml-6 space-y-2 mt-2">
              <li><strong>Payment Processors:</strong> To securely facilitate and authenticate credit card, debit card, and localized payment transactions.</li>
              <li><strong>Logistics and Fulfillment Partners:</strong> Global and regional courier services mandated to deliver your physical orders to your specified destination.</li>
              <li><strong>Cloud Hosting Platforms:</strong> Secure data centers and cloud infrastructure providers (e.g., AWS, Google Cloud) that house our databases and application servers.</li>
              <li><strong>Customer Service Software:</strong> Platforms that manage our ticketing systems, live chat integrations, and email correspondence to ensure prompt customer support.</li>
            </ul>

            <h3 className="text-base font-bold text-foreground mt-6">B. Professional Advisers</h3>
            <p>In the course of corporate operations, we may disclose requisite data to professional advisers acting as processors or joint controllers, including eminent lawyers, bankers, specialized auditors, and corporate insurers who provide comprehensive consultancy, banking, legal, insurance, and accounting services to London Kollection.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Corporate Restructuring and Business Transfers</h3>
            <p>We may share or transfer your information in connection with, or during complex negotiations of, any merger, sale of company assets, operational financing, or total/partial acquisition of our business by another corporate entity. In such events, strict non-disclosure agreements govern the transfer, and the acquiring entity is legally bound to uphold the tenets of this Privacy Policy.</p>

            <h3 className="text-base font-bold text-foreground mt-6">D. Legal Authorities and Statutory Bodies</h3>
            <p>We may disclose your Personal Data to Kuwaiti regulatory authorities, law enforcement agencies, tax authorities, or other government bodies if we are under a legal duty to disclose or share your data in order to comply with any legal mandate, to enforce or apply our Terms and Conditions, or to protect the rights, tangible property, or physical safety of London Kollection, our employees, our customers, or the general public. This explicitly includes exchanging information with specialized agencies for the express purposes of sophisticated fraud protection and credit risk reduction.</p>
          </div>
        </section>

        {/* Section 7 */}
        <section id="cross-border" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">7. International Data Transfers</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>While London Kollection is established in the State of Kuwait, our digital infrastructure and trusted third-party service providers possess a global footprint. Consequently, your Personal Data may be transferred to, stored at, and processed in destinations outside of Kuwait.</p>
            <p>Whenever we transfer your personal data out of Kuwait, we ensure a high degree of protection is consistently afforded to it by strictly implementing at least one of the following rigorous safeguards:</p>
            <ul className="list-disc list-outside ml-6 space-y-4 mt-2">
              <li>We will unequivocally only transfer your personal data to countries that have been deemed to provide an inherently adequate level of protection for personal data by relevant regulatory bodies.</li>
              <li>Where we utilize specific service providers based internationally, we utilize specialized, legally binding contracts—often based on internationally recognized standard contractual clauses (SCCs)—which mandate that the receiving entity affords your data the exact same comprehensive protection it receives under Kuwaiti jurisdiction.</li>
              <li>We conduct extensive due diligence and periodic compliance audits on all international sub-processors to verify their ongoing adherence to stringent, enterprise-level cybersecurity frameworks and data privacy standards.</li>
            </ul>
          </div>
        </section>

        {/* Section 8 */}
        <section id="security" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">8. Data Security Protocols</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>London Kollection treats the security of your data with the utmost severity. We have implemented a multi-layered, robust architecture of security measures designed meticulously to prevent your personal data from being accidentally lost, compromised, used, or accessed in an unauthorized fashion, altered, or maliciously disclosed.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Technical Measures</h3>
            <p>Our technical security posture includes, but is not limited to: Transport Layer Security (TLS/SSL) encryption for all data in transit across our Website; Advanced Encryption Standard (AES-256) for highly sensitive data resting in our primary databases; strict deployment of enterprise-grade firewalls, sophisticated intrusion detection systems (IDS), and routine automated vulnerability scanning; robust password hashing utilizing modern cryptographic algorithms (e.g., bcrypt); and rigorous adherence to Payment Card Industry Data Security Standard (PCI-DSS) protocols for all financial transaction channels.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Organizational Measures</h3>
            <p>We severely limit access to your personal data strictly to those employees, contracted agents, specialized contractors, and verified third parties who have an absolute, undeniable "business need to know." These selected individuals will exclusively process your personal data solely upon our explicit instructions, and they are universally subject to binding, severe duties of commercial confidentiality.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Breach Notification Protocols</h3>
            <p>We have developed and implemented comprehensive internal procedures designed to rapidly identify, mitigate, and conclusively deal with any suspected personal data breach scenario. In the highly unlikely event of a verified systemic data breach that poses a risk to your fundamental rights and freedoms, we will promptly notify you, and any applicable Kuwaiti or international regulatory authority, precisely where we are legally mandated to do so, adhering strictly to required statutory timelines.</p>
          </div>
        </section>

        {/* Section 9 */}
        <section id="retention" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">9. Data Retention Policies</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>We will perpetually retain your personal data strictly for as long as is fundamentally necessary to fulfill the specific operational purposes for which we initially collected it. This explicitly includes the mandatory retention periods required to satisfy any complex legal, intricate accounting, or rigorous statutory reporting requirements established by the laws of Kuwait.</p>
            <p>To determine the appropriate and legal retention period for personal data, we comprehensively consider the sheer amount, nature, and inherent sensitivity of the personal data; the potential risk of profound harm stemming from unauthorized use or malicious disclosure of your data; the specific commercial purposes for which we process your data and whether we can successfully achieve those objectives through alternative methodologies; and the prevailing, applicable legal requirements.</p>
            <ul className="list-disc list-outside ml-6 space-y-4 mt-4">
              <li><strong className="text-foreground">Basic Account Data:</strong> Retained for the active lifespan of your account. Should your account remain entirely dormant for a continuous period of thirty-six (36) months, we reserve the right to securely purge or permanently anonymize your data.</li>
              <li><strong className="text-foreground">Transaction and Financial Records:</strong> By mandatory law, we are frequently required to keep fundamental information regarding our customers (including Contact, Identity, Financial, and Transaction Data) for prolonged periods (typically up to seven to ten years) post-transaction exclusively for strict tax auditing and legal compliance purposes.</li>
              <li><strong className="text-foreground">Marketing Consent:</strong> If you elect to withdraw your consent for marketing communications, we will immediately cease promotional activities but must retain a suppressed record of your Contact Data indefinitely to guarantee that we strictly honor your opt-out request in perpetuity.</li>
            </ul>
          </div>
        </section>

        {/* Section 10 */}
        <section id="user-rights" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">10. User Rights & Choices</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Under specific, recognized circumstances dictated by evolving data protection jurisprudence, you possess substantial, legally enforceable rights relating directly to your personal data. London Kollection enthusiastically facilitates the exercise of these fundamental rights:</p>
            
            <ul className="space-y-6 list-none mt-4">
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Right to Access (Data Subject Access Request)</strong>
                <p>You have the absolute right to formally request a comprehensive copy of the personal data we securely hold about you. This enables you to meticulously verify that we are lawfully processing your data and to understand the specific scope of information we maintain.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Right to Rectification</strong>
                <p>You have the unequivocal right to demand the immediate correction of any incomplete, inaccurate, or outdated data we hold regarding your profile. However, we may fundamentally need to verify the accuracy of the novel data you provide to us.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Right to Erasure (Right to be Forgotten)</strong>
                <p>You possess the right to ask us to permanently delete or irreversibly remove personal data where there is no longer an overriding, legitimate corporate reason for us continuing to process it. Please note, however, that we may not always be able to completely fulfill your erasure request for specific, prevailing legal reasons (e.g., anti-money laundering laws, tax retention) which will be transparently communicated to you at the time of your request.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Right to Restrict Processing</strong>
                <p>You hold the right to petition us to temporarily suspend the active processing of your personal data in the following specialized scenarios: (a) if you desire us to establish the data's absolute accuracy; (b) where our utilization of the data is arguably unlawful but you explicitly do not want us to erase it; (c) where you fundamentally need us to securely hold the data even if we no longer require it as you need it to establish, exercise or fiercely defend ongoing legal claims.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Right to Data Portability</strong>
                <p>You maintain the right to request the secure transfer of your personal data directly to you or immediately to a designated third party. We will invariably provide to you, or your chosen third party, your personal data in a highly structured, commonly used, machine-readable digital format.</p>
              </li>
            </ul>
            <p className="mt-6">To exercise any of these fundamental rights, you are strongly encouraged to contact our Data Protection Team at <strong className="text-foreground">support@londonkollections.com</strong>. We strive to comprehensively respond to all legitimate, verified requests within one (1) calendar month.</p>
          </div>
        </section>

        {/* Section 11 */}
        <section id="cookies" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">11. Comprehensive Cookie Policy</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Our Website deploys an extensive array of cookies and similar tracking technologies (including web beacons, pixels, and localized storage) to systematically distinguish you from other users of our Website. This is critical to helping us provide you with an incredibly seamless, bespoke browsing experience while allowing us to continuously improve our digital platform.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Definitions of Cookie Types Utilized</h3>
            <ul className="list-disc list-outside ml-6 space-y-4 mt-2">
              <li><strong className="text-foreground">Strictly Necessary Cookies:</strong> These are absolute, foundational cookies that are technically required for the sheer operation of our Website. They unequivocally include, for instance, cookies that strictly enable you to securely log into restricted, secure areas of our Website, effectively use an electronic shopping cart architecture, or confidently utilize secure e-billing services.</li>
              <li><strong className="text-foreground">Analytical / Performance Cookies:</strong> These specific cookies allow us to systematically recognize and continuously count the total number of unique visitors, while tracking precisely how these visitors navigate around our Website while they are actively using it. This definitively helps us vastly improve the way our Website practically functions, for example, by guaranteeing that users easily and intuitively find precisely what they are searching for.</li>
              <li><strong className="text-foreground">Functionality Cookies:</strong> These are deployed to distinctly recognize you when you invariably return to our Website. This effectively enables us to heavily personalize our digital content for you, personally greet you by your designated name, and securely remember your strict preferences (for instance, your specific choice of language, currency, or geographical region).</li>
              <li><strong className="text-foreground">Targeting / Advertising Cookies:</strong> These sophisticated cookies fastidiously record your specific visit to our Website, the granular pages you have visited, and the precise links you have clicked. We actively utilize this data to make our Website and the advertising seamlessly displayed on it profoundly more relevant to your expressly demonstrated interests. We may also dynamically share this highly specific information with trusted third-party marketing agencies for this identical purpose.</li>
            </ul>

            <h3 className="text-base font-bold text-foreground mt-6">B. Managing Your Cookie Preferences</h3>
            <p>You can dynamically set your specific browser preferences to outright refuse all or some browser cookies, or to explicitly alert you when corporate websites systematically set or access these cookies. If you deliberately disable or aggressively refuse cookies, please be highly aware that several critical parts of this Website may become entirely inaccessible or fail to function properly.</p>
          </div>
        </section>

        {/* Section 12 */}
        <section id="third-party" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">12. Third-Party Links</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>This Website may routinely include explicit digital links to entirely external, third-party websites, bespoke plug-ins, and standalone applications. Clicking on those aforementioned links or actively enabling those complex connections may unfortunately allow unaffiliated third parties to covertly collect or silently share granular data about you.</p>
            <p>We absolutely do not systematically control these external third-party websites and are unequivocally not responsible in any capacity for their unique privacy statements, data processing activities, or security protocols. When you actively leave our highly secured Website environment, we strongly encourage and advise you to thoroughly read the explicit privacy notice of absolutely every single destination website you subsequently visit.</p>
          </div>
        </section>

        {/* Section 13 */}
        <section id="children" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">13. Children's Privacy</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>London Kollection operates a commercial e-commerce platform that is strictly and exclusively intended for a mature, general audience consisting of individuals who have reached the legal age of majority in their respective jurisdiction of residence. Our Services, physical products, and digital marketing collateral are emphatically not directed towards, nor intended for, children under the legal age of eighteen (18).</p>
            <p>We do not knowingly, deliberately, or intentionally collect, solicit, or process personal identifiable data from anyone definitively known to be under the age of 18. If a parent, legal guardian, or responsible adult becomes acutely aware that their child has provided us with Personal Data without verifiable parental consent, they should immediately contact our support team. Upon verifiable notification, we will take immediate, decisive action to permanently purge such data from our primary databases and backup servers.</p>
          </div>
        </section>

        {/* Section 14 */}
        <section id="changes" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">14. Modifications to Policy</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>The digital landscape and associated legal frameworks governing data privacy are in a state of constant, rapid evolution. Therefore, London Kollection strictly reserves the absolute, undeniable right to routinely update, dramatically modify, or completely overhaul this comprehensive Privacy Policy at any time and at our sole corporate discretion.</p>
            <p>Any substantive, material changes we actively make to our Privacy Policy in the foreseeable future will be transparently posted directly on this specific page. Furthermore, where appropriate and operationally feasible, significant modifications will be directly communicated to our registered account holders via electronic mail broadcast prior to the changes taking definitive legal effect. We strongly implore you to frequently review this page to ensure you are consistently aware of any updates or changes to our privacy protocols.</p>
          </div>
        </section>

        {/* Section 15 */}
        <section id="contact" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">15. Contact Information</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>We passionately welcome your rigorous questions, detailed comments, and formal requests regarding this comprehensive Privacy Policy and our holistic data processing practices. We maintain a dedicated support infrastructure to handle any privacy-related inquiries or formal data subject access requests.</p>
            <ul className="list-inside space-y-3 mt-6 rounded-lg bg-secondary/10 p-8 border border-border/50">
              <li><strong className="text-foreground w-40 inline-block">Operating Entity:</strong> London Kollection</li>
              <li><strong className="text-foreground w-40 inline-block">Registered Jurisdiction:</strong> State of Kuwait</li>
              <li><strong className="text-foreground w-40 inline-block">Privacy Team Email:</strong> support@londonkollections.com</li>
              <li><strong className="text-foreground w-40 inline-block">Official Website:</strong> londonkollections.com</li>
            </ul>
            <p className="mt-4 italic">Please allow up to 48 hours for an initial operational acknowledgment of your correspondence from our dedicated privacy team.</p>
          </div>
        </section>

      </div>
    </div>
  )
}
