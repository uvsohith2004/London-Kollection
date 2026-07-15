import PDFDocument from "pdfkit";
import { format } from "date-fns";
import QRCode from "qrcode";

export class InvoiceGenerator {
  static async generateBuffer(invoiceData: any, orderData: any, settings: any): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
        const buffers: Buffer[] = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        const primaryColor = "#0f172a"; // Slate 900
        const secondaryColor = "#64748b"; // Slate 500
        const lightBorder = "#e2e8f0"; // Slate 200

        const margin = 50;
        let y = margin;
        
        // Dictionary for easy localization
        const dict = {
          invoice: "INVOICE",
          invoiceNumber: "Invoice Number:",
          orderNumber: "Order Number:",
          invoiceDate: "Invoice Date:",
          billTo: "Bill To",
          shipTo: "Ship To",
          product: "Product",
          qty: "Qty",
          unitPrice: "Unit Price",
          total: "Total",
          subtotal: "Subtotal:",
          shipping: "Shipping:",
          tax: "Tax:",
          discount: "Discount:",
          grandTotal: "Grand Total:",
          paymentMethod: "Payment Method:",
          paymentStatus: "Payment Status:",
          transactionId: "Transaction ID:",
          thankYou: "Thank you for your business!",
          returnPolicy: "Returns accepted within 14 days of delivery. Please contact support for assistance.",
          sameAsShipping: "Same as Shipping Address"
        };

        const companyName = settings?.siteName || "London Kollection";
        const companyAddress = settings?.address || "Kuwait City, Kuwait";
        const companyPhone = settings?.supportPhone || "+965 1234 5678";
        const companyEmail = settings?.supportEmail || "support@londonkollection.com";
        const companyCR = settings?.crNumber ? `CR: ${settings.crNumber}` : "";
        const companyVAT = settings?.vatNumber ? `VAT: ${settings.vatNumber}` : "";

        // --- Helper Functions ---
        const checkPageBreak = (neededSpace: number, needsHeader: boolean = false) => {
          if (y + neededSpace > doc.page.height - 120) {
            doc.addPage();
            y = margin;
            if (needsHeader) {
              drawTableHeader();
            }
          }
        };

        const formatKuwaitAddress = (rawAddress: any) => {
          if (!rawAddress) return "N/A";
          if (typeof rawAddress === 'string') {
            try {
              const parsed = JSON.parse(rawAddress);
              if (typeof parsed === 'object' && parsed !== null) {
                const parts = [];
                if (parsed.block) parts.push(`Block ${parsed.block}`);
                if (parsed.street) parts.push(`Street ${parsed.street}`);
                if (parsed.building) parts.push(`Bldg ${parsed.building}`);
                if (parsed.floorFlat) parts.push(`Floor/Flat ${parsed.floorFlat}`);
                return parts.length > 0 ? parts.join(", ") : rawAddress;
              }
            } catch (e) {
              return rawAddress;
            }
          }
          return rawAddress;
        };

        const drawTableHeader = () => {
          doc.fillColor(primaryColor).fontSize(10).font("Helvetica-Bold");
          doc.text(dict.product, margin, y);
          doc.text(dict.qty, 280, y);
          doc.text(dict.unitPrice, 350, y);
          doc.text(dict.total, 450, y, { width: 90, align: "right" });
          
          y += 15;
          doc.moveTo(margin, y).lineTo(545, y).strokeColor(lightBorder).stroke();
          y += 15;
        };

        // --- Header Section ---
        doc.fillColor(primaryColor).fontSize(20).font("Helvetica-Bold").text(companyName, margin, y);
        y += 25;
        doc.fontSize(10).font("Helvetica").fillColor(secondaryColor);
        doc.text(companyAddress, margin, y);
        y += 15;
        doc.text(`${companyEmail} | ${companyPhone}`, margin, y);
        y += 15;
        if (companyCR) {
          doc.text(companyCR, margin, y);
          y += 15;
        }
        if (companyVAT) {
          doc.text(companyVAT, margin, y);
          y += 15;
        }

        let rightY = margin;
        doc.fillColor(primaryColor).fontSize(24).font("Helvetica-Bold").text(dict.invoice, 400, rightY, { align: "right" });
        rightY += 30;
        doc.fontSize(10).font("Helvetica-Bold").fillColor(primaryColor)
           .text(dict.invoiceNumber, 300, rightY, { width: 100 })
           .font("Helvetica").fillColor(secondaryColor).text(invoiceData.invoiceNumber, 400, rightY, { width: 145, align: "right" });
        rightY += 15;
        doc.font("Helvetica-Bold").fillColor(primaryColor)
           .text(dict.orderNumber, 300, rightY, { width: 100 })
           .font("Helvetica").fillColor(secondaryColor).text(orderData.orderNumber, 400, rightY, { width: 145, align: "right" });
        rightY += 15;
        doc.font("Helvetica-Bold").fillColor(primaryColor)
           .text(dict.invoiceDate, 300, rightY, { width: 100 })
           .font("Helvetica").fillColor(secondaryColor).text(format(new Date(invoiceData.createdAt), "MMM dd, yyyy"), 400, rightY, { width: 145, align: "right" });
        
        y = Math.max(y, rightY) + 30;

        // --- Addresses ---
        const shipAddressStr = formatKuwaitAddress(orderData.shippingAddress?.addressLine1);
        const billAddressStr = orderData.billingAddress ? formatKuwaitAddress(orderData.billingAddress?.addressLine1) : dict.sameAsShipping;

        doc.fillColor(primaryColor).fontSize(10).font("Helvetica-Bold").text(dict.shipTo, margin, y);
        doc.text(dict.billTo, 300, y);
        y += 15;

        doc.fontSize(10).font("Helvetica").fillColor(secondaryColor);
        
        const shipLines = [
          orderData.shippingAddress?.name || "N/A",
          shipAddressStr,
          orderData.shippingAddress?.city,
          orderData.shippingAddress?.country,
          orderData.shippingAddress?.phone
        ].filter(Boolean).join("\n");

        const billLines = [
          orderData.billingAddress?.name || orderData.shippingAddress?.name || "N/A",
          billAddressStr,
          orderData.billingAddress?.city,
          orderData.billingAddress?.country
        ].filter(Boolean).join("\n");

        doc.text(shipLines, margin, y, { width: 200 });
        doc.text(billLines, 300, y, { width: 200 });

        const shipHeight = doc.heightOfString(shipLines, { width: 200 });
        const billHeight = doc.heightOfString(billLines, { width: 200 });
        y += Math.max(shipHeight, billHeight) + 30;

        // --- Table ---
        drawTableHeader();

        for (const item of orderData.items || []) {
          const title = item.productMetadata?.title || item.product?.title || "Unknown Product";
          const qty = item.quantity || 1;
          const price = Number(item.priceAtPurchase || 0);
          const lineTotal = price * qty;
          
          // Start a new page if we don't have enough space for a row (approx 40px)
          checkPageBreak(50, true);
          
          doc.font("Helvetica-Bold").fillColor(primaryColor).fontSize(10);
          doc.text(title, margin, y, { width: 200 });
          
          // Attributes (Variant info)
          const attrStrs = [];
          if (item.productMetadata?.attributes) {
             for (const [k, v] of Object.entries(item.productMetadata.attributes)) {
                if (v) attrStrs.push(`${k}: ${v}`);
             }
          }
          let attrHeight = 0;
          if (attrStrs.length > 0) {
             doc.font("Helvetica").fillColor(secondaryColor).fontSize(8);
             doc.text(attrStrs.join(" | "), margin, y + 14, { width: 200 });
             attrHeight = 12;
          }
          
          doc.font("Helvetica").fillColor(secondaryColor).fontSize(10);
          doc.text(qty.toString(), 280, y);
          doc.text(`${price.toFixed(3)} KWD`, 350, y);
          doc.text(`${lineTotal.toFixed(3)} KWD`, 450, y, { width: 90, align: "right" });
          
          y += 20 + attrHeight;
          doc.moveTo(margin, y).lineTo(545, y).strokeColor(lightBorder).stroke();
          y += 15;
        }

        // --- Financial Summary ---
        checkPageBreak(120);

        const subtotal = Number(orderData.totalAmount) - Number(orderData.shippingAmount) - Number(orderData.taxAmount) + Number(orderData.discountAmount);
        
        doc.fillColor(secondaryColor);
        doc.text(dict.subtotal, 350, y);
        doc.text(`${subtotal.toFixed(3)} KWD`, 450, y, { width: 90, align: "right" });
        y += 20;

        if (Number(orderData.shippingAmount) > 0) {
          doc.text(dict.shipping, 350, y);
          doc.text(`${Number(orderData.shippingAmount).toFixed(3)} KWD`, 450, y, { width: 90, align: "right" });
          y += 20;
        }
        
        if (Number(orderData.taxAmount) > 0) {
          doc.text(dict.tax, 350, y);
          doc.text(`${Number(orderData.taxAmount).toFixed(3)} KWD`, 450, y, { width: 90, align: "right" });
          y += 20;
        }

        if (Number(orderData.discountAmount) > 0) {
          doc.text(dict.discount, 350, y);
          doc.fillColor("#ef4444").text(`-${Number(orderData.discountAmount).toFixed(3)} KWD`, 450, y, { width: 90, align: "right" });
          doc.fillColor(secondaryColor);
          y += 20;
        }

        doc.moveTo(350, y).lineTo(545, y).strokeColor(primaryColor).stroke();
        y += 10;

        doc.font("Helvetica-Bold").fillColor(primaryColor).fontSize(12);
        doc.text(dict.grandTotal, 350, y);
        doc.text(`${Number(orderData.totalAmount).toFixed(3)} KWD`, 450, y, { width: 90, align: "right" });
        
        y += 40;

        // --- Payment Info ---
        checkPageBreak(80);
        
        doc.fontSize(10).font("Helvetica-Bold").fillColor(primaryColor);
        doc.text(dict.paymentMethod, margin, y, { width: 120 });
        doc.font("Helvetica").fillColor(secondaryColor).text(orderData.paymentMethod?.toUpperCase() || "N/A", margin + 120, y);
        y += 15;
        
        doc.font("Helvetica-Bold").fillColor(primaryColor);
        doc.text(dict.paymentStatus, margin, y, { width: 120 });
        doc.font("Helvetica").fillColor(secondaryColor).text(orderData.paymentStatus?.toUpperCase() || "N/A", margin + 120, y);
        y += 15;

        // --- Footer & QR Code ---
        // QR Code generation
        // URL points to the frontend order page
        const websiteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://londonkollection.com";
        const qrUrl = `${websiteUrl}/account/orders/${orderData.id}`;
        
        try {
          const qrBuffer = await QRCode.toBuffer(qrUrl, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 80,
            color: {
              dark: '#0f172a',
              light: '#ffffff'
            }
          });
          
          checkPageBreak(100);
          
          doc.image(qrBuffer, margin, y, { width: 60 });
          doc.font("Helvetica-Oblique").fillColor(secondaryColor).fontSize(8);
          doc.text("Scan to view order online", margin + 70, y + 25);
        } catch (qrErr) {
          console.error("Failed to generate QR Code", qrErr);
        }

        // Global footers on all pages
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.font("Helvetica").fillColor(secondaryColor).fontSize(8);
          doc.text(dict.thankYou, 0, doc.page.height - 100, { align: "center", width: doc.page.width, lineBreak: false });
          doc.text(dict.returnPolicy, 0, doc.page.height - 85, { align: "center", width: doc.page.width, lineBreak: false });
          doc.text(`Page ${i + 1} of ${pages.count}`, 0, doc.page.height - 70, { align: "center", width: doc.page.width, lineBreak: false });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
