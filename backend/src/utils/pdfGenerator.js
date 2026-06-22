const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice, setting, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Stream the PDF directly to Express response
  doc.pipe(res);

  // Set default styles
  const primaryColor = '#2563EB'; // Blue
  const secondaryColor = '#1E293B'; // Dark Slate
  const textColor = '#334155'; // Slate 700
  const lightBg = '#F8FAFC'; // Light Gray

  // --- HEADER SECTION ---
  doc.fillColor(secondaryColor).fontSize(20).text(setting.businessName || 'ezonix', 50, 45, { align: 'left' });
  
  doc.fontSize(9).fillColor(textColor);
  if (setting.address) doc.text(setting.address, 50, 75);
  if (setting.phone || setting.email) {
    doc.text(`${setting.phone ? `Phone: ${setting.phone}` : ''} ${setting.email ? `| Email: ${setting.email}` : ''}`, 50, 90);
  }
  if (setting.gstNumber) doc.text(`GSTIN: ${setting.gstNumber}`, 50, 105);

  // Invoice Title and Metadata (Right Aligned)
  doc.fillColor(primaryColor).fontSize(24).text('INVOICE', 350, 40, { align: 'right', width: 200 });
  
  doc.fontSize(9).fillColor(textColor);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 350, 75, { align: 'right', width: 200 });
  doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 350, 90, { align: 'right', width: 200 });
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 350, 105, { align: 'right', width: 200 });

  // Status Badge
  const statusX = 550 - 60; // Align right
  const statusText = invoice.status.toUpperCase();
  let statusColor = '#F59E0B'; // Warning
  if (statusText === 'PAID') statusColor = '#22C55E';
  if (statusText === 'OVERDUE') statusColor = '#EF4444';

  doc.rect(statusX, 120, 60, 15).fill(statusColor);
  doc.fillColor('#FFFFFF').fontSize(8).text(statusText, statusX, 124, { width: 60, align: 'center' });

  // Line Separator
  doc.moveTo(50, 145).lineTo(550, 145).strokeColor('#E2E8F0').lineWidth(1).stroke();

  // --- BILLING INFORMATION ---
  doc.fillColor(secondaryColor).fontSize(11).text('BILL TO:', 50, 160);
  doc.fillColor(textColor).fontSize(10).text(invoice.customer.name, 50, 175);
  if (invoice.customer.address) doc.text(invoice.customer.address, 50, 190);
  doc.text(`Phone: ${invoice.customer.phone}`, 50, 205);
  if (invoice.customer.email) doc.text(`Email: ${invoice.customer.email}`, 50, 220);
  if (invoice.customer.gstNumber) doc.text(`GSTIN: ${invoice.customer.gstNumber}`, 50, 235);

  // --- TABLE SECTION ---
  const tableTop = 270;
  
  // Table Header
  doc.rect(50, tableTop, 500, 20).fill(secondaryColor);
  doc.fillColor('#FFFFFF').fontSize(9);
  doc.text('Product Name', 60, tableTop + 6, { width: 200 });
  doc.text('Qty', 260, tableTop + 6, { width: 40, align: 'center' });
  doc.text('Price', 300, tableTop + 6, { width: 60, align: 'right' });
  doc.text('Tax %', 365, tableTop + 6, { width: 40, align: 'center' });
  doc.text('Disc %', 410, tableTop + 6, { width: 40, align: 'center' });
  doc.text('Total', 460, tableTop + 6, { width: 80, align: 'right' });

  // Table Body Rows
  let currentY = tableTop + 20;
  invoice.items.forEach((item, index) => {
    // Alternate backgrounds
    if (index % 2 === 0) {
      doc.rect(50, currentY, 500, 20).fill(lightBg);
    }
    doc.fillColor(textColor).fontSize(9);
    doc.text(item.name || 'Product', 60, currentY + 6, { width: 190, height: 12, ellipsis: true });
    doc.text(item.quantity.toString(), 260, currentY + 6, { width: 40, align: 'center' });
    doc.text(`Rs. ${item.price.toFixed(2)}`, 300, currentY + 6, { width: 60, align: 'right' });
    doc.text(`${item.taxPercent}%`, 365, currentY + 6, { width: 40, align: 'center' });
    doc.text(`${item.discountPercent}%`, 410, currentY + 6, { width: 40, align: 'center' });

    // Item line total
    const itemSub = item.quantity * item.price;
    const itemTax = itemSub * (item.taxPercent / 100);
    const itemDisc = itemSub * (item.discountPercent / 100);
    const itemTotal = itemSub + itemTax - itemDisc;

    doc.text(`Rs. ${itemTotal.toFixed(2)}`, 460, currentY + 6, { width: 80, align: 'right' });

    currentY += 20;
  });

  // Bottom Line
  doc.moveTo(50, currentY).lineTo(550, currentY).strokeColor('#E2E8F0').lineWidth(1).stroke();

  // --- TOTALS SECTION ---
  const totalsY = currentY + 15;
  doc.fillColor(textColor).fontSize(9);

  // Left Column Notes
  if (invoice.notes) {
    doc.fillColor(secondaryColor).fontSize(10).text('Notes:', 50, totalsY);
    doc.fillColor(textColor).fontSize(9).text(invoice.notes, 50, totalsY + 15, { width: 240 });
  }

  // Right Column calculations
  const calcX = 350;
  const calcValX = 460;
  
  // Compute subtotal before tax and discounts
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  doc.text('Subtotal:', calcX, totalsY, { width: 100, align: 'right' });
  doc.text(`Rs. ${subtotal.toFixed(2)}`, calcValX, totalsY, { width: 80, align: 'right' });

  const itemDiscounts = invoice.discountTotal - (invoice.overallDiscount || 0);
  doc.text('Discount Total:', calcX, totalsY + 15, { width: 100, align: 'right' });
  doc.text(`-Rs. ${itemDiscounts.toFixed(2)}`, calcValX, totalsY + 15, { width: 80, align: 'right' });

  let currentYOffset = totalsY + 30;

  if (invoice.overallDiscount > 0) {
    doc.text('Overall Discount:', calcX, currentYOffset, { width: 100, align: 'right' });
    doc.text(`-Rs. ${(invoice.overallDiscount || 0).toFixed(2)}`, calcValX, currentYOffset, { width: 80, align: 'right' });
    currentYOffset += 15;
  }

  doc.text('Tax Total:', calcX, currentYOffset, { width: 100, align: 'right' });
  doc.text(`+Rs. ${invoice.taxTotal.toFixed(2)}`, calcValX, currentYOffset, { width: 80, align: 'right' });

  currentYOffset += 17;

  // Grand Total highlight
  doc.rect(calcX, currentYOffset, 200, 22).fill(lightBg);
  doc.fillColor(primaryColor).fontSize(11).text('Grand Total:', calcX + 10, currentYOffset + 6, { width: 90, align: 'left' });
  doc.text(`Rs. ${invoice.grandTotal.toFixed(2)}`, calcValX, currentYOffset + 6, { width: 80, align: 'right' });

  currentYOffset += 27;

  // Amount Paid and Amount Due
  doc.fillColor(textColor).fontSize(9);
  doc.text('Amount Paid:', calcX, currentYOffset, { width: 100, align: 'right' });
  doc.text(`Rs. ${(invoice.amountPaid || 0).toFixed(2)}`, calcValX, currentYOffset, { width: 80, align: 'right' });
  
  currentYOffset += 15;

  const hasDue = invoice.amountDue > 0;
  if (hasDue) {
    doc.fillColor('#EF4444').font('Helvetica-Bold');
  }
  doc.text('Amount Due:', calcX, currentYOffset, { width: 100, align: 'right' });
  doc.text(`Rs. ${(invoice.amountDue || 0).toFixed(2)}`, calcValX, currentYOffset, { width: 80, align: 'right' });
  if (hasDue) {
    doc.fillColor(textColor).font('Helvetica');
  }

  // --- FOOTER BANNER ---
  doc.fillColor('#94A3B8').fontSize(9).text('Thank you for choosing our business!', 50, 750, { align: 'center', width: 500 });

  doc.end();
};

module.exports = {
  generateInvoicePDF,
};
