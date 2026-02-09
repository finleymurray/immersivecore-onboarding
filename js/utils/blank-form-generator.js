import { LOGO_WHITE_B64 } from './logo-data.js';

export function generateBlankStarterForm() {
  if (typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded. Please refresh and try again.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const ml = 16;
  const mr = 16;
  const cw = pw - ml - mr;
  let y = 0;

  const blue = [29, 79, 145];
  const dark = [30, 30, 30];
  const grey = [120, 120, 120];
  const lineCol = [180, 180, 180];

  function drawFooter() {
    doc.setFontSize(7.5);
    doc.setTextColor(...grey);
    doc.text('CONFIDENTIAL \u2014 ImmersiveCore New Starter Pack', pw / 2, ph - 10, { align: 'center' });
    doc.text('Please complete all sections in BLOCK CAPITALS using black ink.', pw / 2, ph - 6, { align: 'center' });
  }

  function checkPage(needed) {
    if (y + needed > ph - 22) {
      drawFooter();
      doc.addPage();
      y = 16;
    }
  }

  function sectionHeader(num, title) {
    checkPage(14);
    doc.setFillColor(...blue);
    doc.roundedRect(ml, y, cw, 9, 1.5, 1.5, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(num + '. ' + title, ml + 5, y + 6.5);
    y += 13;
  }

  function fieldLine(label) {
    checkPage(12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...dark);
    doc.text(label, ml + 2, y);
    y += 1;
    doc.setDrawColor(...lineCol);
    doc.setLineWidth(0.3);
    doc.line(ml + 2, y + 3, pw - mr - 2, y + 3);
    y += 8;
  }

  function fieldLineInline(label, xStart, lineEndX, yPos) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...dark);
    doc.text(label, xStart, yPos);
    doc.setDrawColor(...lineCol);
    doc.setLineWidth(0.3);
    const labelW = doc.getTextWidth(label) + 2;
    doc.line(xStart + labelW, yPos + 3, lineEndX, yPos + 3);
  }

  function twoFields(label1, label2) {
    checkPage(12);
    const halfW = cw / 2 - 4;
    const col2 = ml + cw / 2 + 4;
    fieldLineInline(label1, ml + 2, ml + halfW, y);
    fieldLineInline(label2, col2, pw - mr - 2, y);
    y += 9;
  }

  function checkbox(label) {
    checkPage(8);
    doc.setDrawColor(...lineCol);
    doc.setLineWidth(0.3);
    doc.rect(ml + 4, y - 3, 4, 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...dark);
    doc.text(label, ml + 12, y);
    y += 7;
  }

  function textArea(label, lines) {
    checkPage(8 + lines * 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...dark);
    if (label) doc.text(label, ml + 2, y);
    y += 4;
    doc.setDrawColor(...lineCol);
    doc.setLineWidth(0.3);
    for (let i = 0; i < lines; i++) {
      y += 6;
      doc.line(ml + 2, y, pw - mr - 2, y);
    }
    y += 4;
  }

  function smallText(text) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...grey);
    const wrapped = doc.splitTextToSize(text, cw - 4);
    doc.text(wrapped, ml + 2, y);
    y += wrapped.length * 3.5 + 2;
    doc.setFont('helvetica', 'normal');
  }

  // Header bar
  doc.setFillColor(...blue);
  doc.rect(0, 0, pw, 28, 'F');

  try {
    doc.addImage(LOGO_WHITE_B64, 'PNG', ml, 4, 16, 16);
  } catch (e) { /* logo not available */ }

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('New Starter Pack', ml + 60, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Please complete all sections in BLOCK CAPITALS using black ink.', ml + 60, 19);
  y = 36;

  // Section 1
  sectionHeader('1', 'Personal Details');
  fieldLine('Full name (as on passport / birth certificate):');
  twoFields('Date of birth (DD/MM/YYYY):', 'National Insurance number:');
  textArea('Address (including postcode):', 2);
  twoFields('Personal email address:', 'Mobile number:');

  // Section 2
  sectionHeader('2', 'HMRC New Starter Checklist');
  smallText('Your employer needs this information to set up your tax code correctly. Please tick ONE statement below that applies to you.');
  y += 2;

  checkbox('Statement A \u2014 This is my first job since last 6 April and I have not been receiving');
  smallText('    taxable Jobseeker\'s Allowance, Employment and Support Allowance, or Incapacity Benefit.');
  y += 1;

  checkbox('Statement B \u2014 This is now my only job but since last 6 April I have had another job,');
  smallText('    or received taxable Jobseeker\'s Allowance, Employment and Support Allowance, or Incapacity Benefit.');
  y += 1;

  checkbox('Statement C \u2014 I have another job or receive a State or Occupational Pension.');
  y += 4;

  checkbox('I have a student loan (tick if yes)');
  checkPage(10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grey);
  doc.text('If yes, which plan?    Plan 1  /  Plan 2  /  Plan 4  /  Plan 5   (circle one)', ml + 14, y);
  y += 8;

  checkbox('I have a postgraduate loan (tick if yes)');
  y += 4;

  // Section 3
  sectionHeader('3', 'Banking Details');
  smallText('Your wages will be paid by BACS transfer. Please provide your UK bank account details.');
  fieldLine('Account holder name (as shown on bank statement):');
  twoFields('Sort code (XX-XX-XX):', 'Account number (8 digits):');
  y += 2;

  // Section 4
  sectionHeader('4', 'Emergency Contact & Operational');

  checkPage(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text('Emergency Contact', ml + 2, y);
  y += 6;

  fieldLine('Contact name:');
  twoFields('Relationship:', 'Contact phone number:');
  y += 2;

  checkPage(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text('Medical Information', ml + 2, y);
  y += 4;
  smallText('Please note any medical conditions, allergies, or medications we should be aware of in an emergency.');
  textArea('', 3);

  checkPage(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text('Uniform Sizes', ml + 2, y);
  y += 6;
  twoFields('T-shirt size (XS / S / M / L / XL / XXL):', 'Trouser size:');
  y += 4;

  // Section 5 - Declaration
  sectionHeader('5', 'Declaration');
  smallText('I confirm that the information provided on this form is true and complete to the best of my knowledge. I understand that providing false information may result in disciplinary action. I consent to ImmersiveCore processing this data for employment purposes in accordance with GDPR.');
  y += 4;

  checkPage(20);
  twoFields('Signature:', 'Date:');
  y += 6;
  fieldLine('Print name:');

  drawFooter();

  doc.save('ImmersiveCore_New_Starter_Pack.pdf');
}
