const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const fs = require("fs");
const path = require("path");

const GRAPHURA_LOGO_PATH = path.resolve(
  __dirname,
  "../../../frontend/src/assets/homePage/graphura-logo.png"
);

const generateInvoice = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      // ── Page setup ──────────────────────────────────────────
      const doc = new PDFDocument({ margin: 0, size: "A4" });
      const stream = new PassThrough();
      doc.pipe(stream);

      const PW = doc.page.width;
      const PH = doc.page.height;
      const L  = 50;
      const R  = PW - 50;
      const CW = R - L;

      // ── Colour palette (G-Crown minimal style) ──────────────
      const BLACK  = "#1A1A1A";
      const MUTED  = "#555555";
      const LIGHT  = "#F7F7F7";
      const BORDER = "#BE123C";
      const ACCENT = "#EE0C48";

      // ── Helpers ─────────────────────────────────────────────
      const fmt = (n) => `Rs. ${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

      const hRule = (y, color = BORDER, lw = 0.5) =>
        doc.save().moveTo(L, y).lineTo(R, y)
          .strokeColor(color).lineWidth(lw).stroke().restore();

      const filledRect = (x, y, w, h, color) =>
        doc.save().rect(x, y, w, h).fillColor(color).fill().restore();

      // 1. HEADER
     
      let cy = 40;

      // Logo (left)
      if (fs.existsSync(GRAPHURA_LOGO_PATH)) {
        doc.image(GRAPHURA_LOGO_PATH, L + 5, cy + 4, { fit: [160, 50], align: "left", valign: "center" });
      }

      // Tagline & contact (below Graphura logo)
      doc.fontSize(8.5).font("Helvetica").fillColor(MUTED)
        .text("Fresh & Delicious Cakes Delivered!", L, cy + 42, { width: CW * 0.55 })
        .text("info@bakeryfresh.com  |  +91 98765 43210", L, cy + 54, { width: CW * 0.55 });

      // TAX INVOICE label (right)
      doc.fontSize(20).font("Helvetica-Bold").fillColor(BLACK)
        .text("TAX INVOICE", L, cy + 4, { width: CW, align: "right" });

      // Invoice meta (right)
      const oid = order._id.toString();
      const invoiceNo = `INV-${oid.slice(0, 8).toUpperCase()}`;
      doc.fontSize(8.5).font("Helvetica").fillColor(MUTED)
        .text(`Invoice No: ${invoiceNo}`, L, cy + 30, { width: CW, align: "right" })
        .text(`Order ID: ${oid}`, L, cy + 42, { width: CW, align: "right" })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
          L, cy + 54, { width: CW, align: "right" });

      cy += 72;

      // Thin gold separator line
      doc.save().moveTo(L, cy).lineTo(R, cy)
        .strokeColor(ACCENT).lineWidth(1).stroke().restore();

      cy += 14;

      // 2. BILLING & SHIPPING DETAILS
     
      const colW = CW / 2 - 10;

      doc.fontSize(8).font("Helvetica-Bold").fillColor(ACCENT)
        .text("BILLING DETAILS", L, cy)
        .text("SHIPPING DETAILS", L + CW / 2, cy);

      cy += 14;

      // Bill-to
      doc.fontSize(9).font("Helvetica-Bold").fillColor(BLACK)
        .text(user.name || "", L, cy);
      doc.fontSize(8.5).font("Helvetica").fillColor(MUTED)
        .text(user.email || "", L, cy + 13)
        .text(user.phone || "N/A", L, cy + 26);

      // Ship-to
      const addr = order.shippingAddress || {};
      const shipLines = [
        addr.name,
        addr.addressLine1,
        addr.addressLine2,
        [addr.city, addr.state].filter(Boolean).join(", ") +
          (addr.postalCode ? ` - ${addr.postalCode}` : ""),
        addr.phone ? `Ph: ${addr.phone}` : null,
      ].filter(Boolean);

      shipLines.forEach((line, i) => {
        doc.fontSize(i === 0 ? 9 : 8.5)
          .font(i === 0 ? "Helvetica-Bold" : "Helvetica")
          .fillColor(i === 0 ? BLACK : MUTED)
          .text(line, L + CW / 2, cy + i * 13, { width: colW });
      });

      cy += Math.max(3, shipLines.length) * 13 + 18;

      doc.save().moveTo(L, cy).lineTo(R, cy)
        .strokeColor(ACCENT).lineWidth(1).stroke().restore();

      cy += 14;

      // 3. ITEMS TABLE
      
      const COL = {
        no:    { x: L,       w: 30  },
        name:  { x: L + 32,  w: 200 },
        qty:   { x: L + 236, w: 50  },
        rate:  { x: L + 290, w: 100 },
        total: { x: L + 393, w: 102 },
      };

      // Table header
      const thH = 24;
      filledRect(L, cy, CW, thH, LIGHT);
      doc.save()
        .rect(L, cy, CW, thH)
        .strokeColor(BORDER).lineWidth(0.5).stroke()
        .restore();

      const thY = cy + 8;
      doc.fontSize(8.5).font("Helvetica-Bold").fillColor(BLACK);
      doc.text("NO.",       COL.no.x + 2,   thY, { width: COL.no.w,    align: "center" });
      doc.text("DESCRIPTION", COL.name.x,   thY, { width: COL.name.w });
      doc.text("QTY",       COL.qty.x,       thY, { width: COL.qty.w,   align: "center" });
      doc.text("RATE",      COL.rate.x,      thY, { width: COL.rate.w,  align: "right"  });
      doc.text("AMOUNT",    COL.total.x,     thY, { width: COL.total.w - 4, align: "right" });

      cy += thH;

      // Item rows
      const rowH = 22;
      order.items.forEach((item, idx) => {
        if (cy + rowH > PH - 180) {
          doc.addPage();
          cy = 50;
        }

        // Row border
        doc.save().rect(L, cy, CW, rowH)
          .strokeColor(BORDER).lineWidth(0.3).stroke().restore();

        const ry = cy + 6;
        doc.fontSize(8.5).font("Helvetica").fillColor(MUTED)
          .text(String(idx + 1), COL.no.x + 2, ry, { width: COL.no.w, align: "center" });

        doc.fillColor(BLACK)
          .text(item.name.substring(0, 40), COL.name.x, ry, { width: COL.name.w - 4 });

        doc.fillColor(MUTED)
          .text(String(item.qty), COL.qty.x, ry, { width: COL.qty.w, align: "center" })
          .text(fmt(item.price),  COL.rate.x, ry, { width: COL.rate.w, align: "right" });

        doc.font("Helvetica-Bold").fillColor(BLACK)
          .text(fmt(item.price * item.qty), COL.total.x, ry,
            { width: COL.total.w - 4, align: "right" });

        cy += rowH;
      });

      cy += 16;

    
      // 4. TOTALS
     
      const totW  = 210;
      const lblX  = R - totW;
      const valX  = R - 100;
      const valW  = 96;

      const totRow = (label, value, bold = false) => {
        doc.fontSize(bold ? 10 : 9)
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fillColor(bold ? BLACK : MUTED)
          .text(label, lblX, cy, { width: totW - 104 })
          .text(value, valX, cy, { width: valW, align: "right" });
        cy += bold ? 17 : 14;
      };

      totRow("Subtotal",    fmt(order.subtotal));
      totRow(`GST (${((order.tax / order.subtotal) * 100).toFixed(0)}%)`, fmt(order.tax));
      totRow("Shipping",    fmt(order.deliveryCharge));

      hRule(cy + 4, ACCENT, 0.8);
      cy += 14;

      totRow("Grand Total", fmt(order.totalAmount), true);
      cy += 6;

     
      // 5. PAYMENT INFORMATION
  
      hRule(cy, BORDER);
      cy += 12;

      doc.fontSize(8).font("Helvetica-Bold").fillColor(ACCENT)
        .text("PAYMENT INFORMATION", L, cy);
      cy += 14;

      const payMethod =
        order.paymentMethod === "razorpay" ? "Online Transfer"
        : order.paymentMethod === "cod"     ? "Cash on Delivery"
        : order.paymentMethod === "wallet"  ? "Wallet"
        : order.paymentMethod;

      doc.fontSize(9).font("Helvetica").fillColor(MUTED)
        .text(`Status: ${order.paymentStatus.toUpperCase()}`, L, cy)
        .text(`Method: ${payMethod}`, L, cy + 13);

      if (order.razorpay?.paymentId) {
        doc.text(`Ref No: ${order.razorpay.paymentId}`, L, cy + 26);
        cy += 14;
      }

      cy += 38;

      
      // 6. THANK YOU
    
      doc.save().moveTo(L, cy).lineTo(R, cy)
        .strokeColor(ACCENT).lineWidth(1).stroke().restore();
      cy += 12;

      doc.fontSize(10).font("Helvetica-Bold").fillColor(BLACK)
        .text("Thank you for choosing Bakery Shop. We hope to see you again!", L, cy,
          { width: CW, align: "center" });
      cy += 16;

     
      // 7. FOOTER
     
      const footY = Math.max(cy + 10, PH - 44);
      hRule(footY, BORDER, 0.4);

      doc.fontSize(7.5).font("Helvetica").fillColor(MUTED)
        .text("This is a computer-generated document. No signature is required.",
          L, footY + 10, { width: CW, align: "center" })
        .text(`Generated on: ${new Date().toLocaleString("en-IN")}  |  Order ID: ${order._id}`,
          L, footY + 22, { width: CW, align: "center" });

      doc.end();

      const chunks = [];
      stream.on("data",  (c) => chunks.push(c));
      stream.on("end",   ()  => resolve(Buffer.concat(chunks)));
      stream.on("error", (e) => reject(e));

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoice;