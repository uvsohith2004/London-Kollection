"use client"
import { useState, useEffect } from "react"
import { cn } from "@workspace/ui/lib/utils"

export default function DesktopReturnPolicy() {
  const [activeSection, setActiveSection] = useState("introduction")

  const sections = [
    { id: "introduction", title: "1. Introduction & Guiding Philosophy" },
    { id: "eligibility", title: "2. Absolute Prerequisites for Return" },
    { id: "non-returnable", title: "3. Strictly Non-Returnable Merchandise" },
    { id: "temporal-window", title: "4. The Standard Return Window" },
    { id: "rma-procedure", title: "5. Return Authorization (RMA) Protocol" },
    { id: "qa-inspection", title: "6. Quality Assurance & Rejection" },
    { id: "refund-financials", title: "7. Refund Issuance & Financials" },
    { id: "store-credit", title: "8. Exchanges & Store Credit" },
    { id: "defective", title: "9. Defective or Incorrect Garments" },
    { id: "international-returns", title: "10. Complex International Returns" },
    { id: "abuse", title: "11. Abuse of Return Privileges" },
    { id: "statutory", title: "12. Kuwaiti Consumer Statutory Rights" },
    { id: "contact", title: "13. Support & Dispute Resolution" },
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
            Return Policy
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
            Comprehensive Return & Refund Framework
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This exhaustive Return and Refund Policy constitutes a legally binding extension of the London Kollection Terms and Conditions. We understand that purchasing premium apparel and accessories in a digital environment relies heavily on trust. Therefore, this document has been meticulously constructed to unequivocally outline the precise conditions, temporal limitations, quality assurance protocols, and financial mechanisms governing all returns, refunds, and exchanges across our platform. By initiating a purchase on londonkollections.com, you explicitly acknowledge and consent to the stringent parameters established within this comprehensive logistical framework.
          </p>
        </div>

        {/* Section 1 */}
        <section id="introduction" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">1. Introduction & Guiding Philosophy</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>At London Kollection, our foundational philosophy is dedicated to delivering unparalleled quality and ensuring absolute customer satisfaction. However, we simultaneously recognize that the operational sustainability of a premium e-commerce entity requires a highly structured, fiercely protected return ecosystem to prevent inventory degradation and logistical abuse.</p>
            <p>This policy bridges the gap between consumer flexibility and corporate protection. It applies uniformly to all merchandise purchased directly through our official digital storefronts, encompassing both domestic transactions within the State of Kuwait and highly complex international exports. Any merchandise acquired through unauthorized third-party stockists, physical retail concessions, or secondary resale marketplaces is strictly exempt from this policy and must be addressed with the original vendor.</p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="eligibility" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">2. Absolute Prerequisites for Return Eligibility</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>To qualify for a refund, store credit, or size exchange, the returned physical merchandise must comprehensively satisfy a rigorous set of prerequisite conditions. The failure to meet even a single condition will result in the immediate rejection of the return claim.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Unworn & Unwashed Mandate</h3>
            <p>The garment must remain in a fundamentally pristine, unworn, unwashed, and completely unaltered state. Merchandise that exhibits any microscopic evidence of being worn outdoors, utilized for extended periods indoors, or laundered/dry-cleaned will be categorically rejected. "Trying on" a garment for sizing purposes indoors is perfectly acceptable; wearing a garment to an event is strictly prohibited and constitutes a breach of policy.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Original Tagging & Security Seals</h3>
            <p>All original London Kollection swing tags, price tickets, woven labels, and any specialized tamper-evident security ribbons must remain perfectly attached to the garment in their exact original configuration. The deliberate removal or structural severing of a security ribbon instantly voids all return eligibility, permanently classifying the garment as "worn" under our corporate guidelines.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Absence of Odors and Stains</h3>
            <p>Merchandise must be completely free from any transferred odors or residues. This strictly includes, but is not limited to, heavy perfumes, colognes, aerosol deodorants, cigarette smoke, culinary odors, or pet dander. Furthermore, the garment must be entirely devoid of cosmetic blemishes, including foundation makeup, lipstick, self-tanner residue, or bodily fluids transferred during the fitting process.</p>

            <h3 className="text-base font-bold text-foreground mt-6">D. Original Packaging Integrity</h3>
            <p>The product must be returned housed within its original, undamaged packaging infrastructure. This includes bespoke shoe boxes, branded dust bags, structural collar stays, tissue paper, and protective poly-sleeves. A severely damaged or entirely missing premium shoe box will result in a substantial restocking penalty, as the item can no longer be sold as a primary retail unit.</p>
          </div>
        </section>

        {/* Section 3 */}
        <section id="non-returnable" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">3. Strictly Non-Returnable Merchandise</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>In strict adherence to international health and safety regulations, hygiene standards, and specific commercial constraints, the following exhaustive categories of merchandise are permanently classified as "Final Sale" and are strictly non-returnable, non-refundable, and non-exchangeable under any circumstances:</p>
            
            <ul className="list-disc list-outside ml-6 space-y-4 mt-4">
              <li><strong className="text-foreground">Intimate Apparel & Swimwear:</strong> Due to profound hygienic limitations, all lingerie, underwear briefs, bodysuits, bikini bottoms, and one-piece swimming costumes are exempt from return. (Swimwear tops may be returned only if purchased separately and unworn, but bottoms are strictly prohibited).</li>
              <li><strong className="text-foreground">Pierced Jewelry:</strong> Earrings, facial piercings, and any bodily adornments requiring physical insertion through the skin are strictly non-returnable due to the severe risk of bloodborne pathogen transmission.</li>
              <li><strong className="text-foreground">Personal Grooming & Fragrance:</strong> Unsealed cosmetics, skincare products, hair accessories, and opened fragrance bottles cannot be returned due to contamination risks and chemical degradation.</li>
              <li><strong className="text-foreground">Custom or Bespoke Commissions:</strong> Any garment that has been heavily personalized, monogrammed, structurally tailored to specific measurements, or custom-manufactured specifically for your order is entirely exempt from standard return protocols.</li>
              <li><strong className="text-foreground">Clearance & "Final Sale" Promotions:</strong> Merchandise explicitly marked as "Final Sale," heavily discounted clearance inventory, or items purchased during specific flash liquidation events (where the non-returnable nature was visibly declared prior to checkout) are strictly ineligible for return or exchange.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section id="temporal-window" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">4. The Standard Return Window & Temporal Limitations</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>London Kollection operates on a strict temporal framework regarding return requests to ensure rapid inventory turnover and seasonal relevance of our apparel lines.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. The 14-Day Baseline</h3>
            <p>You possess a strict maximum of fourteen (14) calendar days to formally initiate a return request and physically dispatch the goods back to our facilities. This fourteen-day countdown inherently begins at the precise timestamp that our courier's GPS and scanning telemetry formally registers the package as "Delivered" to your physical address or authorized collection point.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Expiration of the Window</h3>
            <p>If you attempt to initiate a Return Merchandise Authorization (RMA) on the fifteenth (15th) day or any subsequent date following the verified delivery timestamp, the digital portal will automatically reject your request. London Kollection grants zero operational grace periods beyond this strictly defined fourteen-day window, irrespective of personal circumstances, extended travel, or delayed gift opening.</p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="rma-procedure" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">5. Return Authorization (RMA) Protocol</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>To ensure a seamlessly trackable and highly secure reverse-logistics operation, we strictly prohibit "blind returns" (sending a package back without prior digital authorization). You must strictly adhere to our digital Return Merchandise Authorization (RMA) protocol:</p>
            
            <ul className="space-y-6 list-none mt-4">
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Step 1: Digital Initiation</strong>
                <p>Navigate to the 'Returns & Exchanges' portal situated in the footer of londonkollections.com. Input your unique Order Reference Number and the associated purchasing email address. Select the specific items you wish to return and precisely dictate the reason for the return using the provided dropdown matrices.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Step 2: Authorization & Documentation</strong>
                <p>Upon digital submission, our automated systems will rapidly verify your temporal eligibility. If approved, you will instantaneously receive an RMA Authorization Email containing a highly specific, scannable RMA Barcode and a downloadable Return Packing Slip.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Step 3: Secure Packaging</strong>
                <p>You must securely enclose the merchandise within a robust, highly durable shipping carton. You are legally required to print the Return Packing Slip and place it physically inside the carton. Failure to include the Packing Slip will result in massive delays, as our inbound receiving team will be entirely unable to efficiently associate the physical merchandise with your digital account.</p>
              </li>
              <li className="bg-secondary/10 p-5 rounded-lg border border-border/50">
                <strong className="text-foreground block mb-2 text-base">Step 4: Dispatch & Liability</strong>
                <p>Affix the provided return shipping label (if applicable to your region) to the exterior of the carton. You must physically hand the parcel to the designated courier and obtain a stamped or digitally verified drop-off receipt. The absolute risk of loss during reverse-transit remains entirely with you until the package is securely signed for by our Kuwaiti receiving dock.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 6 */}
        <section id="qa-inspection" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">6. Quality Assurance, Inspection & Rejection Protocols</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Upon the physical arrival of your return at our centralized Kuwaiti fulfillment hub, it immediately enters a highly secure, heavily monitored quarantine zone to undergo our rigorous Quality Assurance (QA) inspection matrix.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. The QA Inspection Process</h3>
            <p>Within forty-eight (48) to seventy-two (72) operational business hours of dock receipt, our specialized QA technicians will physically unbox your return under high-definition CCTV surveillance. The garment is subjected to intense visual, tactile, and olfactory scrutiny under high-lumen inspection lighting to detect microscopic stains, structural stretching, missing embellishments, or unauthorized alterations.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Approval Status</h3>
            <p>If the merchandise flawlessly passes the QA matrix and adheres to all prerequisite conditions outlined in Section 2, the return will be formally approved, and a digital notification will be dispatched to your email triggering the financial refund protocol.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Rejection & Quarantine Protocol</h3>
            <p>If the QA technicians detect that the garment has been worn, laundered, stained, or is missing fundamental security tags, the return will be instantaneously legally rejected. We will formally notify you via email, attaching high-definition photographic evidence of the detected damage or policy violation. The rejected merchandise will be quarantined. You will be legally required to pay a new, standalone outbound shipping invoice to have the rejected garment physically returned to your address. If you vehemently refuse to pay the return shipping invoice within thirty (30) calendar days, the garment will be legally classified as abandoned property and will be securely destroyed or donated to charity, yielding absolutely zero refund to your account.</p>
          </div>
        </section>

        {/* Section 7 */}
        <section id="refund-financials" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">7. Refund Issuance & Financial Timelines</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>London Kollection operates with absolute financial transparency. Please carefully review the precise financial mechanics regarding the issuance of approved refunds.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Non-Refundable Surcharges</h3>
            <p>Under zero circumstances do we refund the original outbound shipping fees, premium delivery surcharges, or Cash on Delivery (COD) administrative handling fees. Your final refund will strictly encompass the pure retail value of the returned merchandise, completely devoid of any initial logistical overheads.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Original Payment Method Reversal</h3>
            <p>Approved refunds are strictly, irrevocably processed back to the exact, original method of payment utilized during the initial transaction. We cannot, under any legal anti-money laundering (AML) statutes, wire funds to a different bank account, transfer funds to a different credit card, or issue physical cash equivalents.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Gateway Processing Timelines</h3>
            <p>Once our internal systems digitally trigger the refund, the capital leaves our accounts instantaneously. However, global banking infrastructure requires significant processing time. Depending heavily on your specific financial institution, credit card issuer, and geographical location, it may take an additional five (5) to ten (10) consecutive business days for the funds to formally clear the clearinghouses and visibly appear on your statement. This delay is strictly a banking limitation and is utterly outside the control of London Kollection.</p>

            <h3 className="text-base font-bold text-foreground mt-6">D. Cash on Delivery (COD) Refunds</h3>
            <p>Because physical cash cannot be securely transmitted in reverse via courier, all returns originating from a Cash on Delivery (COD) transaction will be strictly refunded in the form of a non-expiring London Kollection Digital Store Credit Voucher. No exceptions to this mechanism will be entertained.</p>
          </div>
        </section>

        {/* Section 8 */}
        <section id="store-credit" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">8. Exchanges & Store Credit Mechanisms</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>If you require a different size or colorway, we offer highly streamlined exchange and store credit mechanisms designed to expedite the replacement process.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Direct Size Exchanges</h3>
            <p>Direct exchanges are entirely subject to real-time inventory availability at the precise moment your return clears our QA inspection. We do not digitally reserve or "hold" inventory while your return is in transit. If the desired size is completely sold out upon QA approval, the exchange will automatically default to a standard financial refund or store credit.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Digital Store Credit</h3>
            <p>Customers may optionally elect to receive their refund in the form of Digital Store Credit. Store credit is issued instantaneously upon QA approval (bypassing the 5-10 day banking delay), is inextricably linked to your registered email address, and is virtually applied at checkout. London Kollection store credit does not carry an expiration date, but it strictly cannot be subsequently converted back into fiat currency under any circumstances.</p>
          </div>
        </section>

        {/* Section 9 */}
        <section id="defective" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">9. Defective, Damaged, or Incorrect Goods (Warranty & Liability)</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>While we implement extremely stringent outbound quality control metrics, manufacturing anomalies or logistical picking errors can occasionally occur.</p>
            <p>If you receive a garment that exhibits a fundamental manufacturing defect (e.g., severe structural seam failure, broken zipper hardware, critical dye bleeding) or if you receive a completely incorrect item (wrong SKU or wrong size shipped), you must formally notify our support team within a strict forty-eight (48) hour window following the delivery timestamp.</p>
            <p>You must provide extremely clear, high-definition photographic evidence of the defect or the incorrect item alongside your initial communication. Upon verification of our error, London Kollection will take absolute responsibility. We will rapidly issue a pre-paid expedited return shipping label and prioritize the dispatch of a flawless replacement unit. If a replacement unit is out of stock, a full financial refund (including original shipping costs) will be issued.</p>
            <p>Please note: Expected wear and tear, damage caused by ignoring specific garment care/washing instructions, or damage caused by forceful trying-on (e.g., tearing a delicate seam) are explicitly not considered manufacturing defects and will be summarily rejected.</p>
          </div>
        </section>

        {/* Section 10 */}
        <section id="international-returns" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">10. Complex International Returns & Customs</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Processing returns across international borders introduces severe logistical friction and complex taxation implications that international customers must be acutely aware of.</p>
            
            <h3 className="text-base font-bold text-foreground mt-6">A. Return Shipping Costs</h3>
            <p>For all international orders (originating outside the State of Kuwait), the customer is absolutely and entirely responsible for absorbing the complete financial cost of the return shipping logistics. London Kollection does not provide pre-paid international return labels. You must utilize a highly trackable, fully insured international courier (e.g., DHL, FedEx) and declare the package explicitly as "RETURNED GOODS" on all commercial invoices to heavily mitigate re-importation taxes.</p>

            <h3 className="text-base font-bold text-foreground mt-6">B. Unrecoverable Import Taxes</h3>
            <p>Any sovereign import duties, local value-added taxes (VAT), or customs clearance fees you initially paid to your local government upon the original importation of the goods are entirely non-refundable by London Kollection. It is your strict, personal responsibility to directly contact your local national customs authority with your export paperwork to attempt to reclaim these taxes independently.</p>

            <h3 className="text-base font-bold text-foreground mt-6">C. Kuwaiti Re-Importation Duties</h3>
            <p>If you fail to correctly declare the parcel as "RETURNED GOODS" on the customs commercial invoice, the State of Kuwait may erroneously assess inbound import taxes on the returned parcel. If London Kollection is billed for inbound customs duties due to your improper export documentation, those exact tax liabilities will be forcefully deducted directly from your final refund amount.</p>
          </div>
        </section>

        {/* Section 11 */}
        <section id="abuse" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">11. Abuse of Return Privileges & Account Blacklisting</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>To fiercely protect our loyal customer base from the immense financial overheads generated by fraudulent activity, our automated systems utilize algorithmic machine learning to strictly monitor all user accounts for abnormal, highly abusive return patterns.</p>
            <p>Activities categorized as "Abuse" include, but are not limited to: "wardrobing" (buying goods, wearing them to a specific event with tags tucked in, and subsequently returning them); exhibiting an excessively high overall return rate (e.g., constantly returning 80%+ of all purchased volume); or repeatedly attempting to return garments heavily tainted with odors, stains, or structural damage.</p>
            <p>If our fraud prevention algorithms flag your account for serial return abuse, London Kollection reserves the unilateral, legally protected right to permanently ban your IP address, deactivate your user account without prior warning, entirely refuse any future sales to your specific physical address or payment method, and permanently reject any outstanding return requests.</p>
          </div>
        </section>

        {/* Section 12 */}
        <section id="statutory" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">12. Kuwaiti Consumer Statutory Rights</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>Absolutely nothing contained within this rigorous Return and Refund Policy shall act to entirely exclude, severely restrict, or legally modify any mandatory statutory rights available to you under the overarching consumer protection frameworks established by the laws of the State of Kuwait (specifically those overseen by the Ministry of Commerce and Industry - MOCI).</p>
            <p>Where any specific clause contained within this corporate policy fundamentally conflicts with an unalienable, mandatory statutory right provided to Kuwaiti citizens or residents under prevailing local law, the mandatory local law shall strictly prevail to the minimum extent necessary to cure the conflict, while the remainder of this policy shall remain in full, unmitigated force and effect.</p>
          </div>
        </section>

        {/* Section 13 */}
        <section id="contact" className="scroll-mt-32">
          <h2 className="text-3xl font-serif tracking-tight mb-6 text-foreground border-b border-border/50 pb-4">13. Support & Dispute Resolution</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>If you possess granular questions regarding your specific temporal eligibility, require profound clarification on our complex QA parameters, or wish to formally dispute a rejected return outcome, our dedicated post-sale logistics team remains at your absolute disposal.</p>
            <ul className="list-inside space-y-3 mt-6 rounded-lg bg-secondary/10 p-8 border border-border/50">
              <li><strong className="text-foreground w-40 inline-block">Operating Entity:</strong> London Kollection Returns Dept.</li>
              <li><strong className="text-foreground w-40 inline-block">Centralized Hub:</strong> State of Kuwait</li>
              <li><strong className="text-foreground w-40 inline-block">Returns Support:</strong> returns@londonkollections.com</li>
              <li><strong className="text-foreground w-40 inline-block">Digital Portal:</strong> londonkollections.com/returns</li>
            </ul>
            <p className="mt-4 italic">To ensure hyper-efficient processing of your inquiry, you must unequivocally include your full Order Reference Number in the subject line of all correspondence directed to the Returns Department.</p>
          </div>
        </section>

      </div>
    </div>
  )
}
