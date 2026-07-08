"use client"
import { useState, useEffect } from "react"
import { cn } from "@workspace/ui/lib/utils"

export default function DesktopShippingPolicy() {
  const [activeSection, setActiveSection] = useState("introduction")

  const sections = [
    { id: "introduction", title: "1. Introduction & General Overview" },
    { id: "processing", title: "2. Order Processing & Handling Timelines" },
    { id: "domestic", title: "3. Domestic Shipping (State of Kuwait)" },
    { id: "international", title: "4. International & GCC Shipping" },
    { id: "customs", title: "5. Customs, Duties & Import Taxes" },
    { id: "rates", title: "6. Shipping Rates & Volumetric Calculations" },
    { id: "tracking", title: "7. Order Tracking & Visibility" },
    { id: "delivery-protocols", title: "8. Delivery Protocols & Signatures" },
    { id: "address-accuracy", title: "9. Address Accuracy & Modifications" },
    { id: "failed-deliveries", title: "10. Failed Deliveries & RTS (Return to Sender)" },
    { id: "lost-damaged", title: "11. Lost, Stolen or Damaged Parcels" },
    { id: "force-majeure", title: "12. Force Majeure & Exceptional Delays" },
    { id: "contact", title: "13. Contact & Support Information" },
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
            Shipping Policy
          </h1>
          <p className="text-sm text-muted-foreground">London Kollection</p>
        </div>
        
        <nav className="flex flex-col gap-3 border-l border-border/50 pl-4 h-[65vh] overflow-y-auto pr-4 no-scrollbar">
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
            Exhaustive Fulfillment & Logistics Framework
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This highly detailed Shipping Policy constitutes a legally binding extension of the London Kollection Terms and Conditions. It has been meticulously drafted to outline the precise logistical protocols, fulfillment procedures, liability transfers, and transit methodologies employed by London Kollection ("Company," "we," "our," or "us"). By placing an order on our digital platform (londonkollections.com), you unequivocally accept the stipulations, timelines, and liability limitations detailed within this extensive framework. Please read this document thoroughly to understand our operational procedures regarding domestic Kuwaiti deliveries and complex international export logistics.
          </p>
        </div>

        {/* Section 1 */}
        <section id="introduction" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">1. Introduction & General Overview</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>At London Kollection, we recognize that the final mile of the e-commerce journey is profoundly critical to overall customer satisfaction. Consequently, we have partnered with top-tier, enterprise-grade logistical networks and courier services to ensure the safe, efficient, and fully trackable transit of your purchased goods.</p>
            <p>This policy dictates the parameters of our shipping operations, originating primarily from our fulfillment centers located within the State of Kuwait. It defines the strict separation of responsibilities between London Kollection, our third-party logistics (3PL) partners, and you, the consumer and importer of record. All timeframes provided within this document and at the point of checkout are carefully calculated estimates based on historical logistical data; they are not absolute contractual guarantees unless explicitly stated otherwise in writing.</p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="processing" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">2. Order Processing & Handling Timelines</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>The total time it takes to receive your London Kollection package is a combination of our internal Order Processing Time and the courier's Transit Time. This section strictly addresses our internal operational handling.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Standard Processing Window</h3>
            <p>Upon the successful authorization of payment and the complete clearance of our internal automated fraud-detection protocols, our fulfillment center strictly endeavors to pick, pack, quality-check, and dispatch all standard retail orders within a procedural window of twenty-four (24) to forty-eight (48) operational business hours. "Business hours" are defined strictly in accordance with the official working week in the State of Kuwait (typically Sunday through Thursday, excluding all officially gazetted public and religious holidays).</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Cut-Off Times</h3>
            <p>Orders successfully placed and authorized prior to 1:00 PM Arabian Standard Time (AST) on a standard business day are typically injected into the fulfillment queue on that identical day. Orders placed after 1:00 PM AST, or on a weekend or public holiday, will categorically begin their processing cycle on the morning of the subsequent business day.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Fraud Verification Delays</h3>
            <p>To rigorously protect our customers and our corporate entity from the rising tide of digital financial fraud, certain orders are automatically flagged by our payment gateway's algorithmic risk-scoring systems. If your order triggers a high-risk alert (e.g., mismatched billing and shipping addresses, international IP addresses, or unusually large cart volumes), the processing timeline will be immediately suspended. Our loss-prevention team will contact you via email or telephone to request supplementary verification documentation (such as a utility bill or government ID). The processing countdown will only resume once this manual verification is successfully concluded.</p>

            <h3 className="text-base font-bold text-foreground mt-6">D. Peak Season and High-Volume Fluctuations</h3>
            <p>During localized or global peak purchasing periods—including, but not limited to, Ramadan, Eid Al-Fitr, Eid Al-Adha, White Friday, Cyber Monday, and exclusive capsule collection drops—our standard processing windows are subject to unavoidable extension. During these extremely high-volume epochs, internal processing may require up to five (5) to seven (7) business days prior to dispatch. We systematically append notice banners to our Website during these periods to ensure transparent communication of these anticipated delays.</p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="domestic" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">3. Domestic Shipping (State of Kuwait)</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>London Kollection is exceptionally proud to offer highly accelerated domestic delivery solutions for our clientele located within the sovereign borders of the State of Kuwait. We utilize a hybrid model of dedicated in-house delivery fleets alongside trusted local courier partnerships.</p>
            
            <ul className="space-y-6 list-none mt-4">
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Standard Domestic Transit</strong>
                <p>Following the conclusion of the aforementioned internal processing window, standard domestic deliveries are typically completed within one (1) to two (2) business days. Deliveries are generally executed between the hours of 9:00 AM and 9:00 PM AST.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Next-Day & Same-Day Services</strong>
                <p>Subject to precise geographical limitations (primarily concentrated within the core metropolitan Governorates of Capital, Hawalli, and Farwaniya) and strict logistical availability, we may offer Next-Day or Same-Day premium dispatch options at checkout. These services are highly time-sensitive and require orders to be finalized before a strict 10:00 AM AST cut-off. If a premium delivery is fundamentally missed due to our operational failure, the premium shipping surcharge will be fully refunded; however, if the failure is due to customer unavailability, no refund will be issued.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Cash on Delivery (COD) Specifics</strong>
                <p>For domestic orders, we may explicitly permit Cash on Delivery as a viable payment mechanism. Customers electing for COD must provide an absolutely verified, active local Kuwaiti mobile number. Our dispatch team will categorically not release a COD order to the final-mile courier until verbal or SMS-based confirmation is successfully established with the customer. Repeated refusal to accept COD orders at the door will result in a permanent ban from utilizing the COD facility on future transactions, and the customer's IP and profile will be restricted to pre-paid methods exclusively.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section id="international" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">4. International & GCC Shipping</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>London Kollection operates as a fundamentally global brand, offering complex export logistics to a vast array of international destinations. International shipping involves a significantly higher degree of logistical complexity, multi-carrier handoffs, and sovereign regulatory compliance.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Gulf Cooperation Council (GCC) Transit</h3>
            <p>For our clientele residing in the neighboring GCC states (Kingdom of Saudi Arabia, United Arab Emirates, Qatar, Kingdom of Bahrain, and Sultanate of Oman), we utilize expedited regional freight networks. Once dispatched from our Kuwaiti facilities, GCC transit times typically range from three (3) to five (5) business days, heavily contingent upon the speed of the receiving nation's customs clearance protocols.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Rest of World (Global Export)</h3>
            <p>For all other approved global destinations, we partner exclusively with top-tier international integrators (such as DHL Express, FedEx, or UPS). Global transit times are highly variable, typically spanning between five (5) to fourteen (14) business days. It is critical to understand that trans-continental shipments are subject to routing through multiple global hubs, aviation scheduling shifts, and stringent international security screening protocols, all of which fall outside the direct control of London Kollection.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Embargoed and Restricted Jurisdictions</h3>
            <p>In absolute compliance with the sovereign laws of the State of Kuwait, prevailing United Nations sanctions, and the compliance frameworks of our international payment gateways, London Kollection categorically refuses to ship physical goods or provide digital services to any globally embargoed or sanctioned nations. Furthermore, we reserve the unalienable right to unilaterally cancel and immediately refund any order directed to a geographic region that our logistical partners deem exceptionally high-risk, inaccessible, or currently experiencing severe geopolitical instability or active conflict.</p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="customs" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">5. Customs, Duties & Import Taxes</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>The complexities of international commercial law and border taxation form a critical component of cross-border e-commerce. This section expressly defines the financial and legal liabilities associated with importing London Kollection products into sovereign foreign territories.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Importer of Record Liability</h3>
            <p>When you purchase goods from London Kollection for delivery outside the State of Kuwait, you are legally classified as the "Importer of Record" into the destination country. You are absolutely and solely responsible for ensuring that the physical goods you have purchased are entirely lawful to import into your specific jurisdiction. We accept zero liability for goods that are delayed, seized, confiscated, or destroyed by local customs authorities due to regulatory non-compliance on the part of the importer.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Delivery Duty Unpaid (DDU) Protocols</h3>
            <p>Unless unequivocally explicitly stated at the digital checkout interface that your specific order is being processed under a "Delivery Duty Paid" (DDP) framework, all international shipments dispatched by London Kollection operate under standard "Delivery Duty Unpaid" (DDU) incoterms. This fundamental classification means that the final purchase price displayed at our checkout entirely excludes any and all localized import taxes, sovereign customs duties, value-added taxes (VAT), goods and services taxes (GST), or specific courier disbursement/brokerage fees.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Assessment and Collection of Fees</h3>
            <p>Upon the arrival of your parcel at the destination country's border, the local customs authority will autonomously assess the declared commercial value of the shipment and levy the appropriate taxes and duties. Our international courier partner will typically act as the customs broker, paying these fees on your behalf to expedite clearance, and will subsequently invoice you directly for absolute reimbursement prior to final-mile delivery.</p>

            <h3 className="text-base font-bold text-foreground mt-6">D. Refusal to Pay Customs Liabilities</h3>
            <p>If you stubbornly refuse to pay the legally assessed customs duties or import taxes upon the arrival of your parcel, the local customs authority will typically hold the package in a bonded facility. In such instances, you have breached your obligation as the importer. If the package is subsequently classified as "Return to Sender" (RTS) or "Abandoned" by the courier due to non-payment of taxes, London Kollection emphatically reserves the right to deduct all incurred return shipping fees, the original outbound shipping fees, and any punitive customs penalties levied against our account from your eventual refund (if a refund is even applicable). In cases where the return fees exceed the value of the goods, the package will be legally abandoned at the border, and you will forfeit any and all rights to a financial refund.</p>
          </div>
        </section>

        {/* Section 6 */}
        <section id="rates" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">6. Shipping Rates & Volumetric Calculations</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>We believe in maintaining absolute financial transparency regarding how we systematically calculate the logistical costs passed on to our consumers.</p>
            <p>Our shipping rates are not merely based on the physical, dead weight of the garments or accessories. International aviation freight operates on the strict principle of "Volumetric Weight" (also known as Dimensional Weight). This calculation accurately reflects the sheer amount of physical space a package occupies in the cargo hold of an aircraft, rather than just its actual weight.</p>
            <p>The calculation formula universally employed by our courier networks is: <strong>(Length x Width x Height in centimeters) / 5000 = Volumetric Weight in Kilograms.</strong> The courier will perpetually charge the billing rate based on whichever metric is definitively higher: the actual dead weight or the calculated volumetric weight.</p>
            <p>Our digital checkout infrastructure is directly integrated via API with our courier partners to provide dynamic, real-time shipping quotations based on the combined volumetric dimensions of the specific items in your digital cart, cross-referenced with your precise delivery postal code. Any promotional "Free Shipping" thresholds explicitly exclude volumetric surcharges for exceedingly bulky items unless expressly stated otherwise in the specific promotional terms.</p>
          </div>
        </section>

        {/* Section 7 */}
        <section id="tracking" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">7. Order Tracking & Visibility</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Maintaining high-fidelity visibility over your parcel throughout its transit lifecycle is a cornerstone of our customer service philosophy.</p>
            <ul className="list-disc list-outside ml-6 space-y-4 mt-4">
              <li><strong className="text-foreground">Issuance of Tracking Telemetry:</strong> Immediately upon the successful generation of a physical shipping waybill in our fulfillment center, our system will automatically broadcast a Shipping Confirmation email to your registered address. This critical communication will contain your unique alphanumeric Tracking Number and a direct hyperlink to the carrier's live tracking portal.</li>
              <li><strong className="text-foreground">Propagation Delays:</strong> Please be acutely aware that tracking numbers frequently suffer from propagation lag. It may take up to twenty-four (24) to forty-eight (48) hours from the generation of the label for the first physical origin scan to successfully reflect in the courier's public database. A lack of immediate data does not mean the package has not been dispatched.</li>
              <li><strong className="text-foreground">Tracking Blackouts:</strong> For standard international shipments, it is highly common for tracking updates to entirely cease updating for several days while the parcel is in active transit over the ocean or while it sits in a secure, bonded customs queue awaiting inspection. We kindly request that customers refrain from filing "lost package" inquiries during these entirely normal, expected blackout periods.</li>
            </ul>
          </div>
        </section>

        {/* Section 8 */}
        <section id="delivery-protocols" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">8. Delivery Protocols & Signatures</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>To definitively protect the high commercial value of London Kollection merchandise, we enforce strict protocols regarding the physical handover of goods at the final destination.</p>
            <h3 className="text-base font-bold text-foreground mt-6">A. Signature Requirements</h3>
            <p>By default, all medium-to-high value domestic and international shipments mandate a direct, physical signature from a responsible adult located at the precise destination address upon delivery. The courier is strictly instructed not to release the goods without obtaining this digital or physical signature.</p>
            <h3 className="text-base font-bold text-foreground mt-6">B. Release of Liability (Authority to Leave)</h3>
            <p>If you actively utilize a courier's proprietary application or web portal to execute a "Release of Signature" or "Authority to Leave" (e.g., instructing the driver to leave the parcel on a porch, behind a gate, or with a neighbor), you do so entirely at your own absolute risk. By expressly waiving the signature requirement, you definitively release London Kollection and the courier from any and all liability pertaining to the potential loss, severe damage, or malicious theft of the parcel after it has been deposited at the specified location.</p>
          </div>
        </section>

        {/* Section 9 */}
        <section id="address-accuracy" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">9. Address Accuracy & Modifications</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>The accuracy of the logistical data provided at the point of sale is the sole responsibility of the consumer.</p>
            <p>It is your absolute, undeniable responsibility to verify that the shipping address provided during checkout is completely accurate, meticulously formatted, and highly comprehensive (including vital details such as apartment numbers, building names, precise zip/postal codes, and highly active contact telephone numbers). London Kollection employs automated API address validation, but this system is not infallible.</p>
            <p>Once an order has formally entered the "Processing" state within our warehouse, we strictly cannot guarantee that any requested address modifications can be successfully executed. If you urgently need to change an address, you must contact support immediately. If the package has already been physically dispatched to the courier network, any attempt to execute a "Reroute" or "Intercept" will incur a significant financial administrative fee levied directly by the courier, which must be paid by the customer prior to the reroute being authorized. We emphatically cannot be held liable for parcels delivered to incorrect, outdated, or slightly misspelled addresses that were originally inputted by the user.</p>
          </div>
        </section>

        {/* Section 10 */}
        <section id="failed-deliveries" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">10. Failed Deliveries & RTS (Return to Sender)</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Logistical final-mile failures dictate a very specific set of financial consequences under our corporate policy.</p>
            <p>Our courier partners will universally attempt delivery a maximum of two (2) to three (3) distinct times. If you are entirely unavailable to receive the package, heavily ignore courier calls, or if the provided address is deemed totally inaccessible, the package will be temporarily held at a local depot for a maximum holding period (typically 3 to 5 days). If you fail to successfully coordinate collection or redelivery within this strict timeframe, the parcel will be automatically classified as "Return to Sender" (RTS).</p>
            <p>When an RTS parcel successfully arrives back at our Kuwaiti fulfillment center, it incurs severe reverse-logistics charges. Consequently, if an order is RTS due to customer negligence (incorrect address, refusal to pay duties, unavailability), we will deduct a comprehensive Restocking & Administrative Fee (typically 15% to 25% of the total order value) heavily compounded by all associated outbound and inbound shipping costs from the final refund amount. In extreme cross-border scenarios where RTS costs drastically exceed the garment value, the parcel will be destroyed at customs, yielding zero refund to the negligent customer.</p>
          </div>
        </section>

        {/* Section 11 */}
        <section id="lost-damaged" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">11. Lost, Stolen or Damaged Parcels</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>While we partner with elite logistical entities, the statistical reality of global shipping dictates that a minute fraction of parcels will inevitably encounter severe transit trauma or catastrophic loss.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Transfer of Risk</h3>
            <p>Under standard commercial law, the "Risk of Loss" formally passes from London Kollection to you, the consumer, the absolute moment the physical parcel is securely handed over to the first courier agent. However, as a matter of exceptional customer service, we will actively advocate on your behalf to secure compensation from the courier in the event of failure.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Suspected Loss in Transit</h3>
            <p>If a domestic parcel has not been delivered within seven (7) business days past the estimated delivery date, or an international parcel within twenty-one (21) business days past the estimate, it may be declared "Suspected Lost." You must immediately file a formal notification with our support team. We will immediately initiate a deeply rigorous internal Trace Investigation with the carrier's security department. These highly complex investigations routinely take between fourteen (14) to forty-five (45) business days to conclude. We unequivocally cannot issue a replacement product or financial refund until the carrier officially, in writing, declares the parcel as "Irretrievably Lost."</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Stolen Parcels (Porch Piracy)</h3>
            <p>If the courier's GPS telemetry and digital scan unequivocally indicate that the parcel was successfully delivered to the precise coordinates of your address, but you heavily claim you did not receive it, London Kollection holds zero legal liability. The theft of a delivered parcel is a criminal matter. We strongly advise you to file a formal police report with your local law enforcement agency. We will strictly not replace or refund orders marked as "Delivered" with verified GPS pings.</p>

            <h3 className="text-base font-bold text-foreground mt-6">D. Parcels Damaged in Transit</h3>
            <p>If your package arrives bearing significant, highly visible exterior trauma (crushed boxes, torn polymailers, severe water damage), you must emphatically instruct the delivery driver to log a "Damaged Exception" on their handheld scanner before you sign for it. You must systematically photograph the severely damaged exterior packaging from multiple distinct angles before opening it, and subsequently photograph the internal damage to the garments. Claims for severe transit damage must be formally submitted to our support infrastructure within forty-eight (48) hours of the delivery timestamp. Failure to provide granular photographic evidence or missing the strict 48-hour reporting window entirely nullifies your ability to claim a replacement or refund for transit damage.</p>
          </div>
        </section>

        {/* Section 12 */}
        <section id="force-majeure" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">12. Force Majeure & Exceptional Delays</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>London Kollection, nor our extensive network of courier partners, shall under any circumstances be held legally or financially liable for severe delays in transit, total failure to deliver, or damage to goods arising directly or indirectly from acts, events, omissions, or accidents utterly beyond our reasonable, commercial control. This profound legal concept of "Force Majeure" distinctly includes, but is in no way limited to:</p>
            <ul className="list-disc list-outside ml-6 space-y-2 mt-2">
              <li>Acts of God, highly extreme meteorological events, violent earthquakes, severe floods, or natural disasters;</li>
              <li>Outbreaks of highly infectious disease, sweeping global pandemics, or localized epidemics resulting in mandated logistical lockdowns;</li>
              <li>Acts of international war, intense geopolitical hostilities, active terrorism, destructive riots, or severe civil commotion;</li>
              <li>Sovereign governmental actions, sudden customs embargoes, or highly disruptive geopolitical trade disputes;</li>
              <li>Catastrophic failures of global telecommunications networks, prolonged power grid collapses, or crippling systemic cyber-attacks targeting global aviation or logistical infrastructure;</li>
              <li>Widespread industrial action, severe labor strikes, or coordinated lockouts affecting critical port authorities or national postal networks.</li>
            </ul>
            <p className="mt-4">In the event a verified Force Majeure event fundamentally disrupts our logistical operations, we will systematically suspend all guaranteed delivery timelines until the catastrophic event has completely subsided and normal commercial operations can be safely, securely resumed.</p>
          </div>
        </section>

        {/* Section 13 */}
        <section id="contact" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">13. Contact & Support Information</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Navigating global logistics can be a highly stressful endeavor. Our dedicated fulfillment and support operatives are heavily trained to assist you with extremely complex tracking issues, customs clearance roadblocks, and rerouting protocols.</p>
            <ul className="list-inside space-y-3 mt-6 rounded-lg bg-secondary/10 p-8 border border-border/50">
              <li><strong className="text-foreground w-40 inline-block">Operating Entity:</strong> London Kollection Logistics Team</li>
              <li><strong className="text-foreground w-40 inline-block">Registered Hub:</strong> State of Kuwait</li>
              <li><strong className="text-foreground w-40 inline-block">Support Email:</strong> support@londonkollections.com</li>
              <li><strong className="text-foreground w-40 inline-block">Official Tracking Portal:</strong> londonkollections.com/track</li>
            </ul>
            <p className="mt-4 italic">When communicating with our logistics team regarding a delayed or problematic shipment, you must unequivocally include your full Order Number and specific Courier Tracking ID in the subject line to ensure rapid, prioritized triage of your support ticket.</p>
          </div>
        </section>

      </div>
    </div>
  )
}
