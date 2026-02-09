import { formatDateUK } from './date-utils.js';
import { LOGO_WHITE_B64, LOGO_DARK_B64 } from './logo-data.js';

const STATEMENT_TEXT = {
  A: 'Statement A: First job since last 6 April, no taxable benefits or pensions.',
  B: 'Statement B: Only job now, but had other job or taxable benefits since last 6 April.',
  C: 'Statement C: Has another job or receives a State/Occupational Pension.',
};

function buildOnboardingPDFDoc(record) {
  if (typeof window.jspdf === 'undefined') return null;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const ml = 18;
  const mr = 18;
  const cw = pw - ml - mr;
  let y = 18;

  const blue = [29, 79, 145];
  const dark = [11, 12, 12];
  const grey = [80, 90, 95];
  const lightBg = [243, 242, 241];

  function drawLine(yPos) {
    doc.setDrawColor(...grey);
    doc.setLineWidth(0.3);
    doc.line(ml, yPos, pw - mr, yPos);
  }

  function addFooter() {
    doc.setFontSize(7.5);
    doc.setTextColor(...grey);
    doc.text('CONFIDENTIAL — New Starter Onboarding Record', pw / 2, ph - 10, { align: 'center' });
    doc.text('ImmersiveCore Onboarding Portal | Generated: ' + new Date().toLocaleString('en-GB'), pw / 2, ph - 6, { align: 'center' });
  }

  function checkPageBreak(needed) {
    if (y + needed > ph - 20) {
      addFooter();
      doc.addPage();
      y = 18;
    }
  }

  const valCol = ml + 60;
  const lineH = 7;

  function labelVal(label, val, yOff) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, ml + 5, yOff);
    doc.setFont('helvetica', 'normal');
    doc.text(val || '\u2014', valCol, yOff);
  }

  function drawLogo(x, yPos, onDark) {
    const logoData = onDark ? LOGO_WHITE_B64 : LOGO_DARK_B64;
    doc.addImage(logoData, 'PNG', x, yPos - 4, 14, 14);
  }

  // ======== PAGE 1 ========

  // Header bar
  doc.setFillColor(...dark);
  doc.rect(0, 0, pw, 26, 'F');
  drawLogo(ml, 8, true);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('New Starter Onboarding', ml + 55, 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Employee Onboarding Record', ml + 55, 17);
  y = 34;

  // ---- Section 1: Core Details ----
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('1. Core Details', ml, y);
  y += 2;
  drawLine(y);
  y += 6;

  doc.setTextColor(...dark);
  const detailsBoxH = 10 + 6 * lineH;
  doc.setFillColor(...lightBg);
  doc.roundedRect(ml, y - 3, cw, detailsBoxH, 2, 2, 'F');
  doc.setDrawColor(...dark);
  doc.setLineWidth(0.5);
  doc.roundedRect(ml, y - 3, cw, detailsBoxH, 2, 2, 'S');

  let by = y + 4;
  labelVal('Full name:', record.full_name || '', by); by += lineH;
  labelVal('Date of birth:', formatDateUK(record.date_of_birth), by); by += lineH;
  labelVal('NI number:', record.ni_number || '', by); by += lineH;
  labelVal('Address:', record.address || '', by); by += lineH;
  labelVal('Email:', record.personal_email || '', by); by += lineH;
  labelVal('Mobile:', record.mobile_number || '', by);

  y += detailsBoxH + 6;

  // ---- Section 2: HMRC ----
  checkPageBreak(45);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('2. HMRC New Starter Checklist', ml, y);
  y += 2;
  drawLine(y);
  y += 6;

  doc.setTextColor(...dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Statement:', ml + 2, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const stmtText = record.employee_statement ? STATEMENT_TEXT[record.employee_statement] : 'Not selected';
  const stmtLines = doc.splitTextToSize(stmtText, cw - 4);
  doc.text(stmtLines, ml + 2, y);
  y += stmtLines.length * 4.5 + 4;

  labelVal('Student loan:', record.has_student_loan ? ('Yes' + (record.student_loan_plan ? ' \u2014 ' + record.student_loan_plan : '')) : 'No', y);
  y += lineH;
  labelVal('Postgraduate loan:', record.has_postgraduate_loan ? 'Yes' : 'No', y);
  y += lineH + 4;

  // ---- Section 3: Banking ----
  checkPageBreak(35);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('3. Banking Details', ml, y);
  y += 2;
  drawLine(y);
  y += 6;

  doc.setTextColor(...dark);
  labelVal('Account holder:', record.bank_account_holder || '', y); y += lineH;
  labelVal('Sort code:', record.bank_sort_code || '', y); y += lineH;
  // Mask account number for security
  const maskedAcct = record.bank_account_number
    ? '\u2022\u2022\u2022\u2022' + record.bank_account_number.slice(-4)
    : '';
  labelVal('Account number:', maskedAcct, y);
  y += lineH + 6;

  // ---- Section 4: Operational ----
  checkPageBreak(60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('4. Operational Specifications', ml, y);
  y += 2;
  drawLine(y);
  y += 6;

  doc.setTextColor(...dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Emergency Contact', ml + 2, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  labelVal('Name:', record.emergency_contact_name || '', y); y += lineH;
  labelVal('Relationship:', record.emergency_contact_relationship || '', y); y += lineH;
  labelVal('Phone:', record.emergency_contact_phone || '', y); y += lineH + 3;

  if (record.medical_notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Medical Notes:', ml + 2, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const medLines = doc.splitTextToSize(record.medical_notes, cw - 4);
    doc.text(medLines, ml + 2, y);
    y += medLines.length * 4.5 + 4;
  }

  labelVal('T-shirt size:', record.tshirt_size || '', y); y += lineH;
  labelVal('Trouser size:', record.trouser_size || '', y);

  addFooter();
  return doc;
}

export function generateOnboardingPDF(record) {
  const doc = buildOnboardingPDFDoc(record);
  if (!doc) {
    alert('PDF library failed to load.');
    return;
  }
  const safeName = (record.full_name || 'record').replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  doc.save('Onboarding_' + safeName + '_' + dateStr + '.pdf');
}

export function generateOnboardingPDFBlob(record) {
  const doc = buildOnboardingPDFDoc(record);
  if (!doc) return null;
  return doc.output('blob');
}
