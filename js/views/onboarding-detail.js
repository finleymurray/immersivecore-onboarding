import { fetchOnboarding } from '../services/onboarding-service.js';
import { getPaperScanUrl } from '../services/storage-service.js';
import { formatDateUK } from '../utils/date-utils.js';

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

const STATEMENT_TEXT = {
  A: 'Statement A: First job since last 6 April, no taxable benefits or pensions.',
  B: 'Statement B: Only job now, but had other job or taxable benefits since last 6 April.',
  C: 'Statement C: Has another job or receives a State/Occupational Pension.',
};

const STATUS_LABELS = {
  pending: 'Pending',
  rtw_in_progress: 'RTW In Progress',
  complete: 'Complete',
};

const STATUS_CLASSES = {
  pending: 'badge-pending',
  rtw_in_progress: 'badge-in-progress',
  complete: 'badge-complete',
};

export async function render(el, id) {
  const record = await fetchOnboarding(id);

  let scanUrl = null;
  if (record.paper_scan_path) {
    try {
      scanUrl = await getPaperScanUrl(record.paper_scan_path);
    } catch (e) {
      console.error('Failed to get scan URL:', e);
    }
  }

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1>${esc(record.full_name)}</h1>
        <span class="badge ${STATUS_CLASSES[record.status] || ''}">${STATUS_LABELS[record.status] || record.status}</span>
      </div>
      <div class="header-actions">
        ${record.gdrive_pdf_link ? `<a href="${esc(record.gdrive_pdf_link)}" target="_blank" class="btn btn-ghost">View in Google Drive</a>` : ''}
        <a href="#/onboarding/${id}/edit" class="btn btn-primary">Edit</a>
      </div>
    </div>

    <div class="detail-grid">

      <!-- Section 1 -->
      <div class="detail-section">
        <h2><span class="section-number">1</span> Core Details</h2>
        <dl class="detail-list">
          <dt>Full name</dt><dd>${esc(record.full_name)}</dd>
          <dt>Date of birth</dt><dd>${formatDateUK(record.date_of_birth)}</dd>
          <dt>NI number</dt><dd>${esc(record.ni_number) || '\u2014'}</dd>
          <dt>Address</dt><dd>${esc(record.address) || '\u2014'}</dd>
          <dt>Personal email</dt><dd>${esc(record.personal_email) || '\u2014'}</dd>
          <dt>Mobile</dt><dd>${esc(record.mobile_number) || '\u2014'}</dd>
        </dl>
      </div>

      <!-- Section 2 -->
      <div class="detail-section">
        <h2><span class="section-number">2</span> HMRC New Starter Checklist</h2>
        <dl class="detail-list">
          <dt>Employee Statement</dt><dd>${record.employee_statement ? esc(STATEMENT_TEXT[record.employee_statement]) : '\u2014'}</dd>
          <dt>Student loan</dt><dd>${record.has_student_loan ? 'Yes' + (record.student_loan_plan ? ' \u2014 ' + esc(record.student_loan_plan) : '') : 'No'}</dd>
          <dt>Postgraduate loan</dt><dd>${record.has_postgraduate_loan ? 'Yes' : 'No'}</dd>
        </dl>
      </div>

      <!-- Section 3 -->
      <div class="detail-section">
        <h2><span class="section-number">3</span> Banking Details</h2>
        <dl class="detail-list">
          <dt>Account holder</dt><dd>${esc(record.bank_account_holder) || '\u2014'}</dd>
          <dt>Sort code</dt><dd>${esc(record.bank_sort_code) || '\u2014'}</dd>
          <dt>Account number</dt><dd>${record.bank_account_number ? '\u2022\u2022\u2022\u2022' + esc(record.bank_account_number.slice(-4)) : '\u2014'}</dd>
        </dl>
      </div>

      <!-- Section 4 -->
      <div class="detail-section">
        <h2><span class="section-number">4</span> Operational Specifications</h2>
        <h3 class="subsection-title">Emergency Contact</h3>
        <dl class="detail-list">
          <dt>Name</dt><dd>${esc(record.emergency_contact_name) || '\u2014'}</dd>
          <dt>Relationship</dt><dd>${esc(record.emergency_contact_relationship) || '\u2014'}</dd>
          <dt>Phone</dt><dd>${esc(record.emergency_contact_phone) || '\u2014'}</dd>
        </dl>
        <h3 class="subsection-title">Medical &amp; Uniform</h3>
        <dl class="detail-list">
          <dt>Medical notes</dt><dd>${esc(record.medical_notes) || '\u2014'}</dd>
          <dt>T-shirt size</dt><dd>${esc(record.tshirt_size) || '\u2014'}</dd>
          <dt>Trouser size</dt><dd>${esc(record.trouser_size) || '\u2014'}</dd>
        </dl>
      </div>

      <!-- Section 5 -->
      <div class="detail-section">
        <h2><span class="section-number">5</span> Paper Record</h2>
        ${scanUrl ? `
          <div class="scan-preview">
            ${record.paper_scan_filename?.toLowerCase().endsWith('.pdf')
              ? `<p>PDF scan uploaded: <a href="${esc(scanUrl)}" target="_blank">${esc(record.paper_scan_filename)}</a></p>`
              : `<img src="${esc(scanUrl)}" alt="Paper scan" class="scan-image">`
            }
          </div>
        ` : '<p class="empty-state">No paper scan uploaded.</p>'}
      </div>

    </div>

    <div class="detail-meta">
      <p>Created: ${formatDateUK(record.created_at?.slice(0, 10))}</p>
      ${record.rtw_record_id ? `<p><a href="https://rtw.immersivecore.network/#/record/${record.rtw_record_id}">View RTW Record &rarr;</a></p>` : ''}
    </div>
  `;
}
