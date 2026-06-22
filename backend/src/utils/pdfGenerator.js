const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const getImgBufferOrPath = async (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      console.error('Failed to fetch remote image:', url, err);
      return null;
    }
  } else {
    // Local path, e.g. /uploads/logo-xxx.png
    const localPath = path.join(__dirname, '../../public', url);
    if (fs.existsSync(localPath)) {
      return localPath;
    }
    return null;
  }
};

const generateInvoicePDF = async (invoice, setting, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Stream the PDF directly to Express response
  doc.pipe(res);

  // Set default styles
  const primaryColor = '#2563EB'; // Blue
  const secondaryColor = '#1E293B'; // Dark Slate
  const textColor = '#334155'; // Slate 700
  const lightBg = '#F8FAFC'; // Light Gray

  // --- HEADER SECTION ---
  let logoSource = null;
  if (setting.logoUrl) {
    logoSource = await getImgBufferOrPath(setting.logoUrl);
  }

  let headerTextY = 75;
  if (logoSource) {
    try {
      doc.image(logoSource, 50, 40, { fit: [120, 40] });
      // Render brand name next to logo
      doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(20).text(setting.businessName || '', 185, 48, { align: 'left', width: 160 });
      headerTextY = 95;
    } catch (e) {
      console.error('Error drawing logo image: ', e);
      doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(20).text(setting.businessName || 'ezonix', 50, 45, { align: 'left' });
      headerTextY = 75;
    }
  } else {
    doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(20).text(setting.businessName || 'ezonix', 50, 45, { align: 'left' });
    headerTextY = 75;
  }
  
  doc.font('Helvetica').fontSize(9).fillColor(textColor);
  if (setting.address) {
    const addressHeight = doc.heightOfString(setting.address, { width: 280 });
    doc.text(setting.address, 50, headerTextY, { width: 280 });
    headerTextY += addressHeight + 4;
  }
  if (setting.phone || setting.email) {
    const contactText = `${setting.phone ? `Phone: ${setting.phone}` : ''} ${setting.email ? ` | Email: ${setting.email}` : ''}`;
    const contactHeight = doc.heightOfString(contactText, { width: 280 });
    doc.text(contactText, 50, headerTextY, { width: 280 });
    headerTextY += contactHeight + 4;
  }
  if (setting.gstNumber) {
    const gstText = `GSTIN: ${setting.gstNumber}`;
    const gstHeight = doc.heightOfString(gstText, { width: 280 });
    doc.text(gstText, 50, headerTextY, { width: 280 });
    headerTextY += gstHeight + 4;
  }

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

  // Line Separator (placed below both left and right header elements)
  const separatorY = Math.max(145, headerTextY + 10);
  doc.moveTo(50, separatorY).lineTo(550, separatorY).strokeColor('#E2E8F0').lineWidth(1).stroke();

  // --- BILLING INFORMATION ---
  let billToY = separatorY + 15;
  doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(11).text('BILL TO:', 50, billToY);
  billToY += 15;
  
  doc.fillColor(textColor).font('Helvetica').fontSize(10).text(invoice.customer.name, 50, billToY);
  billToY += 15;
  
  if (invoice.customer.address) {
    const custAddressHeight = doc.heightOfString(invoice.customer.address, { width: 280 });
    doc.text(invoice.customer.address, 50, billToY, { width: 280 });
    billToY += custAddressHeight + 4;
  }
  
  const phoneText = `Phone: ${invoice.customer.phone}`;
  const phoneHeight = doc.heightOfString(phoneText, { width: 280 });
  doc.text(phoneText, 50, billToY, { width: 280 });
  billToY += phoneHeight + 4;
  
  if (invoice.customer.email) {
    const emailText = `Email: ${invoice.customer.email}`;
    const emailHeight = doc.heightOfString(emailText, { width: 280 });
    doc.text(emailText, 50, billToY, { width: 280 });
    billToY += emailHeight + 4;
  }
  
  if (invoice.customer.gstNumber) {
    const gstText = `GSTIN: ${invoice.customer.gstNumber}`;
    const gstHeight = doc.heightOfString(gstText, { width: 280 });
    doc.text(gstText, 50, billToY, { width: 280 });
    billToY += gstHeight + 4;
  }

  // --- TABLE SECTION ---
  const tableTop = Math.max(270, billToY + 20);
  
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

  // --- PAYMENT DETAILS & QR CODE ---
  currentYOffset += 35;

  // Let's check if the remaining space is enough (we need at least 150 points for payment info + QR code)
  // Page height is 841, margin bottom is 50. Total printable area height = 791.
  // Terms & Conditions block starts at Y = 710.
  // So if currentYOffset > 560, we should add a new page so that the payment details are printed cleanly.
  if (currentYOffset > 560) {
    doc.addPage();
    currentYOffset = 50;
  }

  // Draw a separator line
  doc.moveTo(50, currentYOffset).lineTo(550, currentYOffset).strokeColor('#E2E8F0').lineWidth(1).stroke();
  currentYOffset += 15;

  // Fetch active QR Code
  let qrCodeUrl = '';
  if (setting.activeQrCode === 'qr2') {
    qrCodeUrl = setting.qrCode2Url;
  } else {
    qrCodeUrl = setting.qrCode1Url;
  }

  let qrSource = null;
  if (qrCodeUrl) {
    qrSource = await getImgBufferOrPath(qrCodeUrl);
  }

  let leftColY = currentYOffset;
  const hasBankDetails = setting.bankName || setting.accountHolderName || setting.accountNumber || setting.ifscCode;

  if (hasBankDetails) {
    doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(10).text('Payment Information (Bank Transfer)', 50, leftColY);
    leftColY += 16;

    doc.font('Helvetica').fontSize(8.5).fillColor(textColor);
    if (setting.accountHolderName) {
      doc.text(`Account Holder: ${setting.accountHolderName}`, 50, leftColY);
      leftColY += 13;
    }
    if (setting.bankName) {
      doc.text(`Bank Name: ${setting.bankName}`, 50, leftColY);
      leftColY += 13;
    }
    if (setting.accountNumber) {
      doc.text(`Account Number: ${setting.accountNumber}`, 50, leftColY);
      leftColY += 13;
    }
    if (setting.ifscCode) {
      doc.text(`IFSC Code: ${setting.ifscCode}`, 50, leftColY);
      leftColY += 13;
    }
  }

  // Render QR Code in Right Column (if available)
  if (qrSource) {
    try {
      // Position QR code on the right (X = 460, Y = currentYOffset, Width = 70, Height = 70)
      doc.image(qrSource, 460, currentYOffset, { fit: [70, 70] });
      doc.font('Helvetica-Bold').fontSize(8).fillColor(secondaryColor).text('Scan to Pay', 460, currentYOffset + 75, { width: 70, align: 'center' });
    } catch (e) {
      console.error('Error drawing QR code image: ', e);
    }
  }

  // --- TERMS & CONDITIONS & FOOTER ---
  // Place terms and conditions at a fixed height from the bottom of the page (e.g. Y = 710)
  const termsY = 710;
  doc.moveTo(50, termsY - 5).lineTo(550, termsY - 5).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

  doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(8).text('Terms & Conditions:', 50, termsY);
  doc.font('Helvetica').fontSize(7.5).fillColor('#64748B');
  doc.text('1. Payment is due within the stipulated due date. Please reference the invoice number on your payment.', 50, termsY + 12);
  doc.text('2. Please review the invoice details immediately. Any discrepancies must be reported within 3 business days.', 50, termsY + 22);
  doc.text('3. This document is a computer-generated invoice and does not require a physical signature.', 50, termsY + 32);

  // --- FOOTER BANNER ---
  doc.fillColor('#94A3B8').fontSize(8.5).text('Thank you for choosing our business!', 50, 770, { align: 'center', width: 500 });

  doc.end();
};

module.exports = {
  generateInvoicePDF,
};
