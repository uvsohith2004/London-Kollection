"use client"
import { useState, useEffect } from "react"
import { cn } from "@workspace/ui/lib/utils"

export default function DesktopTermsAndConditions() {
  const [activeSection, setActiveSection] = useState("intro")

  const sections = [
    { id: "intro", title: "Introduction & Definitions" },
    { id: "eligibility", title: "Eligibility & Accounts" },
    { id: "products", title: "Products, Pricing & Promotions" },
    { id: "orders", title: "Orders, Payments & Billing" },
    { id: "shipping", title: "Shipping & Delivery" },
    { id: "returns", title: "Returns, Refunds & Warranties" },
    { id: "responsibilities", title: "Customer Responsibilities & Liability" },
    { id: "general", title: "General & Final Provisions" },
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
    <div className="mx-auto flex max-w-7xl items-start gap-16 px-8 py-12 xl:gap-24 text-foreground">
      
      {/* Left Column: Sticky Navigation */}
      <div className="sticky top-32 hidden w-64 shrink-0 flex-col gap-8 md:flex">
        <div>
          <h1 className="font-serif text-3xl leading-tight tracking-tight mb-2">
            Terms & Conditions
          </h1>
          <p className="text-sm text-muted-foreground">London Kollection</p>
        </div>
        
        <nav className="flex flex-col gap-4 border-l border-border/50 pl-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "text-left text-sm transition-all duration-200",
                activeSection === section.id
                  ? "font-medium text-foreground -ml-4.5 border-l-2 border-foreground pl-4"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Column: Main Content */}
      <div className="flex-1 flex flex-col gap-12 pb-24">
        
        <div className="rounded-xl border border-border/50 bg-secondary/20 p-6">
          <h3 className="mb-2 text-sm font-medium tracking-widest uppercase">
            Draft Status / Final Note
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This document is an original drafting template intended as a starting point for a comprehensive Kuwait-based e-commerce Terms & Conditions agreement. Before publication, it should be reviewed and adapted by qualified legal counsel to ensure compliance with the specific business model, products, services, and applicable legal requirements.
          </p>
        </div>

        {/* Section 1: Intro */}
        <section id="intro" className="scroll-mt-32">
          <h2 className="text-2xl font-serif tracking-tight mb-6">Introduction & Definitions</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">1. Introduction</h3>
              <p>These Terms and Conditions ("Terms") govern the access to and use of the website, mobile application, products and services offered by London Kollection ("Company", "we", "our", or "us"). By accessing or using the website, creating an account, placing an order, or otherwise interacting with our services, you agree to be legally bound by these Terms. If you do not agree with any provision, you should not use the website or purchase products through it. These Terms are intended to establish a transparent contractual relationship between the Company and every customer. They explain how orders are placed, accepted, processed and delivered, the responsibilities of customers, the Company's rights, and the rules governing the use of the platform. These Terms should be read together with the Privacy Policy, Shipping Policy and Return & Refund Policy. Our website is designed for customers located in the State of Kuwait and may also serve customers in other jurisdictions where our services are made available. Where local mandatory consumer protection laws apply, those laws will prevail over any conflicting contractual provision to the extent required by law.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">2. Acceptance of Terms</h3>
              <p>Your continued use of the website confirms that you have read, understood and accepted these Terms. Acceptance may occur by browsing the website, registering an account, checking the acceptance box during checkout, placing an order or otherwise using the services. Electronic acceptance has the same effect as a handwritten signature where recognized by applicable law. The Company reserves the right to amend these Terms from time to time. Revised versions become effective when published on the website unless otherwise stated. Customers are responsible for reviewing the latest version before placing each order.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">3. Definitions</h3>
              <p>For the purposes of these Terms: "Account" means a customer profile created on the website. "Customer", "User" or "You" means any individual or legal entity using the website. "Products" means goods or services offered for sale. "Order" means a purchase request submitted through the website. "Website" includes the Company's website and any official mobile application. "Business Day" means a day on which commercial activities are ordinarily conducted in Kuwait, excluding officially recognized public holidays where applicable.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">4. Company Information</h3>
              <p>The website is operated by London Kollection. The Company may appoint logistics providers, payment processors and other service providers to assist in providing services. Such appointment does not transfer the Company's obligations to customers unless expressly stated.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">5. Scope of Services</h3>
              <p>The website enables customers to browse products, compare items, create wish lists, place orders, complete secure payment transactions where available, monitor order status and contact customer support. Product descriptions, specifications, pricing, availability and promotional offers are presented in good faith. Nevertheless, typographical, technical or pricing errors may occasionally occur. The Company reserves the right to correct such errors and, where appropriate, cancel or amend affected orders after informing the customer. Customers are expected to use the website only for lawful purposes. Any attempt to interfere with website operations, obtain unauthorized access, manipulate pricing, abuse promotional offers or engage in fraudulent conduct may result in suspension of access, cancellation of orders and any other remedies available under applicable law.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">6. Interpretation</h3>
              <p>Headings are provided for convenience only and do not affect interpretation. References to the singular include the plural where appropriate and references to one gender include all genders. If any provision of these Terms is determined by a court or competent authority to be invalid or unenforceable, the remaining provisions shall continue in full force and effect unless the invalid provision is fundamental to the overall agreement.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Eligibility */}
        <section id="eligibility" className="scroll-mt-32 pt-6 border-t border-border/50">
          <h2 className="text-2xl font-serif tracking-tight mb-6">Eligibility, Customer Accounts & Security</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">7. Eligibility</h3>
              <p>To place orders through the Website, you represent that you have the legal capacity to enter into binding contracts under applicable law. If you are purchasing on behalf of a business entity, you confirm that you have authority to bind that entity. The Company may refuse service where it reasonably believes these requirements are not satisfied. Customers are responsible for ensuring that the use of the Website complies with the laws applicable to their location.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">8. Customer Accounts</h3>
              <p>Certain features require registration of an account. During registration you agree to provide accurate, current and complete information, including your name, email address, telephone number and delivery address. You agree to keep this information updated. The Company may suspend or terminate accounts containing false, misleading or incomplete information where necessary to protect customers, prevent fraud or comply with legal requirements. You are responsible for all activity occurring under your account unless caused by the Company's own negligence. You should maintain the confidentiality of your password, avoid sharing login credentials and immediately notify customer support if you suspect unauthorized access. The Company may require identity verification before processing certain requests relating to account recovery or changes to sensitive account details.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">9. Account Security</h3>
              <p>The Company employs reasonable technical and organizational measures designed to protect customer accounts and personal information. No online system can be guaranteed to be completely secure. Customers are encouraged to use strong passwords, enable available security features and access the Website only through trusted devices and networks. The Company may temporarily suspend accounts where unusual login attempts, suspected fraudulent activity or security incidents are detected. Such action is intended to protect both customers and the integrity of the platform.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">10. Communications</h3>
              <p>By creating an account or placing an order, you consent to receive communications necessary for providing the service, including order confirmations, invoices, shipping updates, password reset messages and customer support responses. Marketing communications will be sent only where permitted by applicable law or where you have provided any required consent. You may opt out of promotional communications using the methods described in the message, although transactional communications relating to your orders may continue.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">11. Accuracy of Information</h3>
              <p>Customers are responsible for ensuring that delivery addresses, contact details and billing information are accurate before submitting an order. Delays, failed deliveries or additional charges resulting from incorrect information supplied by the customer may be the customer's responsibility where permitted by applicable law.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">12. Suspension and Termination</h3>
              <p>The Company may suspend or terminate access to the Website where a customer materially breaches these Terms, engages in fraudulent activity, attempts to interfere with the operation of the Website, abuses promotional offers or uses the service for unlawful purposes. Where appropriate, the Company may provide notice and an opportunity to resolve the issue before permanent termination. Termination of an account does not affect rights and obligations that arose before the termination date, including payment obligations, completed purchases or provisions that by their nature are intended to survive termination, such as intellectual property, limitation of liability and dispute resolution clauses.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Products */}
        <section id="products" className="scroll-mt-32 pt-6 border-t border-border/50">
          <h2 className="text-2xl font-serif tracking-tight mb-6">Products, Pricing & Promotions</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">13. Product Listings</h3>
              <p>The Company offers products through the Website subject to availability. All product descriptions, specifications, dimensions, colors, compatibility information and usage guidelines are provided in good faith. While reasonable efforts are made to ensure accuracy, the Company does not warrant that every description is completely free from typographical, technical or photographic errors. Minor differences between product images and the actual product may occur due to display settings, manufacturing updates or packaging changes.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">14. Availability</h3>
              <p>Products displayed on the Website do not guarantee availability. Inventory levels may change without notice because of customer purchases, supplier delays or inventory adjustments. If an item becomes unavailable after an order has been placed, the Company may contact the customer to offer a replacement, partial fulfillment, delayed delivery or refund for the unavailable item.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">15. Pricing</h3>
              <p>Unless otherwise stated, all prices are displayed in Kuwaiti Dinar (KWD). Prices may change without prior notice. Price changes do not affect orders that have already been accepted by the Company unless a pricing error has occurred. Shipping fees, taxes and other applicable charges, if any, will be presented during checkout before the customer confirms the purchase.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">16. Pricing Errors</h3>
              <p>Despite reasonable precautions, pricing errors may occasionally occur. If a product is listed at an incorrect price due to a technical or human error, the Company reserves the right to cancel the affected order before shipment and notify the customer. Where payment has already been collected, the Company will refund the amount paid using the original payment method unless another lawful arrangement is agreed.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">17. Promotions and Discount Codes</h3>
              <p>Promotional campaigns, discount codes, vouchers and special offers are subject to the specific terms published with each promotion. Unless expressly stated, promotions cannot be combined, exchanged for cash or transferred to another person. The Company reserves the right to withdraw or modify promotions where fraud, misuse or technical errors are identified.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">18. Product Reviews</h3>
              <p>Customers may submit reviews based on genuine purchasing experiences. Reviews must be truthful, respectful and must not contain unlawful, offensive or misleading content. The Company may remove reviews that violate these Terms or applicable law without affecting legitimate customer feedback.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">19. Product Images and Intellectual Property</h3>
              <p>Images, graphics, videos and written descriptions appearing on the Website are provided for informational purposes and remain the property of the Company or its licensors unless otherwise indicated. Customers may not copy, reproduce, distribute or commercially use such material without prior written permission.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">20. Commercial Information</h3>
              <p>The Company strives to provide accurate information regarding product compatibility, care instructions and recommended usage. Customers remain responsible for determining whether a product is suitable for their intended purpose before completing a purchase.</p>
            </div>
          </div>
        </section>

        {/* Section 4: Orders */}
        <section id="orders" className="scroll-mt-32 pt-6 border-t border-border/50">
          <h2 className="text-2xl font-serif tracking-tight mb-6">Orders, Payments & Billing</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">21. Placing an Order</h3>
              <p>By submitting an order through the Website, you make an offer to purchase the selected products subject to these Terms. After an order is submitted, you will receive an acknowledgement confirming receipt of your request. This acknowledgement does not constitute acceptance of the order. Acceptance occurs only when the Company confirms that the order has been approved for processing or dispatch.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">22. Order Verification</h3>
              <p>The Company reserves the right to verify customer information before accepting an order. Verification may include confirming billing information, delivery details, identity or payment authorization. Orders may be delayed while verification is performed.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">23. Right to Refuse or Cancel Orders</h3>
              <p>The Company may refuse or cancel an order before shipment where products are unavailable, pricing or technical errors occur, fraud is suspected, payment cannot be authorized, legal compliance requires cancellation, or the customer has materially breached these Terms. Where payment has already been collected, any applicable refund will be processed using the original payment method unless otherwise agreed.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">24. Payment Methods</h3>
              <p>The Website may support one or more payment methods including KNET, Visa, Mastercard, Apple Pay, Cash on Delivery or other payment solutions made available from time to time. Supported payment methods may vary depending on product type, delivery location or promotional campaigns. Payment processing may be handled by independent payment service providers. The Company does not store complete payment card details unless expressly stated and permitted by applicable standards.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">25. Billing Information</h3>
              <p>Customers must provide accurate billing information. If incorrect billing details result in payment failure or delays, the Company may suspend processing until the information is corrected. Electronic invoices or receipts may be issued after payment confirmation.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">26. Payment Authorization</h3>
              <p>By providing payment information, you confirm that you are authorized to use the selected payment method and authorize the Company or its payment processor to charge the applicable amount, including any shipping charges, taxes or other disclosed fees.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">27. Fraud Prevention</h3>
              <p>The Company actively monitors transactions to reduce fraud and protect customers. Orders identified as unusual or high risk may require additional verification or may be cancelled where permitted by law. Customers agree to cooperate with reasonable verification requests intended to protect all parties.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">28. Taxes and Charges</h3>
              <p>Any applicable taxes, customs duties, governmental fees or mandatory charges will be displayed where reasonably possible before completion of the purchase. Customers are responsible for charges imposed by authorities that are not collected by the Company unless applicable law provides otherwise.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">29. Order Records</h3>
              <p>Electronic order records maintained by the Company may be relied upon as evidence of transactions to the extent permitted by applicable law. Customers are encouraged to retain copies of order confirmations, invoices and related communications for their records.</p>
            </div>
          </div>
        </section>

        {/* Section 5: Shipping */}
        <section id="shipping" className="scroll-mt-32 pt-6 border-t border-border/50">
          <h2 className="text-2xl font-serif tracking-tight mb-6">Shipping, Delivery & Cancellations</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">30. Shipping Services</h3>
              <p>The Company arranges delivery through its own logistics operations or approved third-party carriers. Available delivery methods, estimated delivery times and shipping charges are displayed during checkout where applicable. Delivery estimates are provided in good faith and are not guaranteed unless expressly stated.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">31. Delivery Areas</h3>
              <p>The Company may deliver within Kuwait and, where offered, to selected GCC or international destinations. Certain products may be unavailable for delivery to particular locations due to legal, logistical or safety restrictions.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">32. Delivery Timeframes</h3>
              <p>Estimated delivery times begin after the order has been accepted and payment or verification requirements have been completed. Delays may arise because of customs procedures, weather, public holidays, transportation disruptions, inventory issues or circumstances beyond the Company's reasonable control. The Company will make reasonable efforts to keep customers informed of significant delays.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">33. Customer Responsibilities for Delivery</h3>
              <p>Customers must provide a complete and accurate delivery address together with a valid contact telephone number. If delivery cannot be completed because incorrect information was supplied, the Company may charge additional delivery fees where permitted by law.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">34. Delivery Attempts</h3>
              <p>Where a courier is unable to complete delivery, additional delivery attempts may be made or the shipment may be held for collection depending on the courier's policies. If the shipment is returned because the customer failed to accept delivery, the Company may deduct applicable shipping and handling costs from any refund where legally permitted.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">35. Inspection Upon Delivery</h3>
              <p>Customers should inspect delivered products as soon as reasonably possible. Visible damage, missing items or incorrect products should be reported promptly with supporting photographs where available. Prompt reporting helps facilitate investigation and resolution.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">36. Transfer of Risk</h3>
              <p>Unless mandatory law provides otherwise, risk of accidental loss or damage passes to the customer upon successful delivery to the address specified in the order or upon collection by the customer or the customer's authorized representative.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">37. Customer Cancellations</h3>
              <p>Customers may request cancellation before an order has entered shipment processing. Once an order has been dispatched, cancellation may no longer be possible and the Return and Refund Policy will apply instead.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">38. Company Cancellations</h3>
              <p>The Company reserves the right to cancel orders due to inventory shortages, payment issues, suspected fraud, legal restrictions, supplier interruptions or technical errors. Where payment has already been received, refunds will be processed in accordance with the Refund Policy.</p>
            </div>
          </div>
        </section>

        {/* Section 6: Returns */}
        <section id="returns" className="scroll-mt-32 pt-6 border-t border-border/50">
          <h2 className="text-2xl font-serif tracking-tight mb-6">Returns, Refunds, Exchanges & Warranties</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">39. Return Policy</h3>
              <p>Customers may request the return of eligible products within the return period stated on the Website or as otherwise required by applicable law. Returned products should be unused where appropriate, in their original condition, and accompanied by original packaging, accessories and proof of purchase unless the return relates to a manufacturing defect or another circumstance where such conditions cannot reasonably be satisfied.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">40. Non-Returnable Products</h3>
              <p>Certain products may not be eligible for return because of their nature, including personal care items, customized products, perishable goods, downloadable digital products, gift cards, or other products identified on the Website as non-returnable, except where applicable law provides otherwise.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">41. Return Procedure</h3>
              <p>Customers should contact customer support before returning a product. The Company may request the order number, photographs of the product, a description of the issue and other information reasonably necessary to evaluate the request. Return instructions should be followed to reduce the risk of loss or damage during transport.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">42. Refunds</h3>
              <p>After receiving and inspecting a returned product, the Company will determine whether the return qualifies for a refund under these Terms and the applicable Return Policy. Approved refunds will ordinarily be processed using the original payment method unless another method is agreed or required by law. Processing times may vary depending on the payment provider or financial institution.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">43. Exchanges</h3>
              <p>Where offered by the Company, eligible products may be exchanged for the same product, a different size, color or replacement item, subject to stock availability. Exchange requests may be declined if the requested product is unavailable or the eligibility requirements are not satisfied.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">44. Defective or Damaged Products</h3>
              <p>If a product arrives damaged, defective or materially different from the description provided on the Website, customers should notify the Company as soon as reasonably possible after delivery. The Company may investigate the issue and, where appropriate, provide a replacement, repair, exchange or refund in accordance with applicable law and any manufacturer warranty.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">45. Warranties</h3>
              <p>Some products may be covered by a manufacturer's warranty or an additional warranty expressly provided by the Company. Warranty coverage, duration, exclusions and claim procedures will be governed by the applicable warranty documentation. Except where prohibited by law, no additional warranties are made beyond those expressly stated.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">46. Customer Support</h3>
              <p>The Company aims to respond to customer inquiries within a reasonable period. Support may be provided through email, telephone, online chat or other communication channels identified on the Website. Customers are expected to communicate respectfully and provide accurate information to facilitate efficient resolution of inquiries.</p>
            </div>
          </div>
        </section>

        {/* Section 7: Responsibilities */}
        <section id="responsibilities" className="scroll-mt-32 pt-6 border-t border-border/50">
          <h2 className="text-2xl font-serif tracking-tight mb-6">Customer Responsibilities, Acceptable Use & Liability</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">47. Customer Responsibilities</h3>
              <p>Customers agree to use the Website in a lawful, honest and responsible manner. You are responsible for maintaining accurate account information, safeguarding your login credentials and ensuring that purchases made through your account are authorized. You must not use the Website for any fraudulent, unlawful or abusive purpose.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">48. Acceptable Use</h3>
              <p>You agree not to interfere with the operation or security of the Website, attempt to gain unauthorized access to systems or accounts, introduce malicious software, scrape content using automated tools without authorization, or engage in activities that could disrupt other users' experience. The Company may investigate suspected misuse and take appropriate action, including suspension of accounts.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">49. User Content</h3>
              <p>Where the Website allows reviews, ratings or other customer submissions, you retain ownership of your content but grant the Company a non-exclusive, worldwide, royalty-free license to display, reproduce and use that content for operating, improving and promoting the Website. You confirm that your submissions do not infringe the rights of others and are not unlawful, defamatory, misleading or offensive.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">50. Intellectual Property</h3>
              <p>All intellectual property rights relating to the Website, including software, source code, trademarks, logos, graphics, photographs, videos, product descriptions, page layouts and other content, are owned by the Company or its licensors unless otherwise stated. Nothing in these Terms transfers ownership of such rights. Customers are granted only a limited, revocable, non-transferable right to access and use the Website for personal, non-commercial shopping purposes.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">51. Third-Party Services</h3>
              <p>The Website may integrate payment providers, logistics companies, mapping services or other third-party services. The Company is not responsible for the independent terms, privacy practices or availability of those third-party services. Customers should review the applicable terms published by those providers where relevant.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">52. Disclaimer</h3>
              <p>To the maximum extent permitted by applicable law, the Website and its services are provided on an "as available" basis. Although the Company makes reasonable efforts to maintain accurate information and reliable operation, uninterrupted availability cannot be guaranteed. Scheduled maintenance, technical failures or events beyond the Company's reasonable control may temporarily affect access.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">53. Limitation of Liability</h3>
              <p>Nothing in these Terms excludes liability that cannot legally be excluded under applicable law. Subject to that limitation, the Company shall not be liable for indirect, incidental, consequential, special or punitive damages, loss of profits, loss of business opportunities, loss of data or interruption of business arising from the use of the Website or products, except where such liability results from the Company's fraud, gross negligence or other circumstances in which liability cannot be excluded by law. Where permitted by law, the Company's total liability relating to any single order or claim shall not exceed the amount actually paid by the customer for the relevant product or service giving rise to the claim.</p>
            </div>
          </div>
        </section>

        {/* Section 8: General */}
        <section id="general" className="scroll-mt-32 pt-6 border-t border-border/50">
          <h2 className="text-2xl font-serif tracking-tight mb-6">General & Final Provisions</h2>
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">54. Indemnification</h3>
              <p>To the extent permitted by applicable law, you agree to indemnify and hold harmless the Company, its affiliates, directors, employees and service providers from claims, losses, damages, liabilities, costs and expenses arising from your breach of these Terms, misuse of the Website, violation of applicable law or infringement of the rights of another person. This obligation does not apply where the claim results from the Company's own negligence or misconduct.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">55. Force Majeure</h3>
              <p>The Company shall not be responsible for delays or failures in performance caused by events beyond its reasonable control, including natural disasters, epidemics, acts of government, war, civil unrest, labor disputes, utility failures, cyberattacks, telecommunication outages, transportation interruptions or supplier failures. The Company will use reasonable efforts to resume performance once the event has ended.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">56. Governing Law</h3>
              <p>These Terms shall be governed by and interpreted in accordance with the laws of the State of Kuwait, without prejudice to any mandatory consumer protections that cannot be waived by agreement. Any mandatory statutory rights available to consumers remain unaffected.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">57. Dispute Resolution</h3>
              <p>The parties agree to attempt to resolve disputes through good-faith discussions before commencing formal legal proceedings. If a dispute cannot be resolved amicably, it may be submitted to the competent courts of the State of Kuwait unless another forum is required by applicable law.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">58. Notices</h3>
              <p>Official notices from the Company may be delivered by email, through the Website, customer account notifications or other reasonable communication methods. Customers are responsible for keeping their contact information current.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">59. Assignment</h3>
              <p>The Company may assign or transfer its rights and obligations in connection with a business reorganization, merger, acquisition or sale of assets, provided that such transfer does not reduce mandatory consumer rights. Customers may not assign their rights or obligations without the Company's prior written consent.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">60. Waiver</h3>
              <p>Failure by the Company to enforce any provision of these Terms shall not constitute a waiver of that provision or any other right.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">61. Severability</h3>
              <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect to the extent permitted by law.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">62. Entire Agreement</h3>
              <p>These Terms, together with the Privacy Policy, Shipping Policy, Return and Refund Policy and any additional policies referenced on the Website, constitute the entire agreement between the Company and the customer concerning the use of the Website.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">63. Amendments</h3>
              <p>The Company may revise these Terms from time to time. Material changes will be published on the Website. Continued use of the Website after revised Terms become effective constitutes acceptance of the updated Terms.</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">64. Contact Information</h3>
              <ul className="list-inside space-y-2 mt-4 rounded-lg bg-secondary/10 p-6 border border-border/50">
                <li><strong>Company Name:</strong> London Kollection</li>
                <li><strong>Registered Address:</strong> Kuwait</li>
                <li><strong>Commercial Registration No.:</strong> Pending</li>
                <li><strong>Support Email:</strong> support@londonkollections.com</li>
                <li><strong>Support Phone:</strong> Pending</li>
                <li><strong>Website:</strong> londonkollections.com</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
