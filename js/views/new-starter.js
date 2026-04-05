import { createPublicOnboarding } from '../services/onboarding-service.js';
import { validateOnboarding } from '../utils/validation.js';

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export async function render(el) {
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1>New Starter Pack</h1>
        <p class="page-subtitle">Please complete all sections below. Your submission will be reviewed by a manager.</p>
      </div>
    </div>

    <div id="error-summary" class="error-summary" style="display:none;">
      <h3>There are errors</h3>
      <ul id="error-list"></ul>
    </div>

    <form id="newstarter-form" novalidate>

      <!-- Section 1: Personal Details -->
      <fieldset class="form-section">
        <legend><span class="section-number">1</span> Personal Details</legend>

        <div class="form-row">
          <div class="form-group">
            <label for="full_name">Full name (as on passport / birth certificate) <span class="required">*</span></label>
            <input type="text" id="full_name" name="full_name" required>
          </div>
          <div class="form-group">
            <label for="date_of_birth">Date of birth <span class="required">*</span></label>
            <input type="date" id="date_of_birth" name="date_of_birth" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="ni_number">National Insurance number</label>
            <input type="text" id="ni_number" name="ni_number" placeholder="QQ 12 34 56 A">
          </div>
          <div class="form-group">
            <label for="mobile_number">Mobile number</label>
            <input type="tel" id="mobile_number" name="mobile_number">
          </div>
        </div>

        <div class="form-group">
          <label for="address">Address (including postcode)</label>
          <textarea id="address" name="address" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label for="personal_email">Personal email address</label>
          <input type="email" id="personal_email" name="personal_email">
        </div>
      </fieldset>

      <!-- Section 2: HMRC New Starter Checklist -->
      <fieldset class="form-section">
        <legend><span class="section-number">2</span> HMRC New Starter Checklist</legend>
        <p class="section-description">Your employer needs this information to set up your tax code correctly. Please tick ONE statement below that applies to you.</p>

        <div class="form-group">
          <div class="radio-option">
            <input type="radio" id="statement_a" name="employee_statement" value="A">
            <label for="statement_a">
              <strong>Statement A</strong> &mdash; This is my first job since last 6 April and I have not been receiving taxable Jobseeker's Allowance, Employment and Support Allowance, or Incapacity Benefit.
            </label>
          </div>

          <div class="radio-option">
            <input type="radio" id="statement_b" name="employee_statement" value="B">
            <label for="statement_b">
              <strong>Statement B</strong> &mdash; This is now my only job but since last 6 April I have had another job, or received taxable Jobseeker's Allowance, Employment and Support Allowance, or Incapacity Benefit.
            </label>
          </div>

          <div class="radio-option">
            <input type="radio" id="statement_c" name="employee_statement" value="C">
            <label for="statement_c">
              <strong>Statement C</strong> &mdash; I have another job or receive a State or Occupational Pension.
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="has_student_loan" name="has_student_loan">
              I have a student loan
            </label>
            <div id="student-loan-plan-wrapper" class="conditional-field" style="display:none;">
              <label for="student_loan_plan">Which plan?</label>
              <select id="student_loan_plan" name="student_loan_plan">
                <option value="">-- Select plan --</option>
                <option value="Plan 1">Plan 1</option>
                <option value="Plan 2">Plan 2</option>
                <option value="Plan 4">Plan 4</option>
                <option value="Plan 5">Plan 5</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="has_postgraduate_loan" name="has_postgraduate_loan">
              I have a postgraduate loan
            </label>
          </div>
        </div>
      </fieldset>

      <!-- Section 3: Banking Details -->
      <fieldset class="form-section">
        <legend><span class="section-number">3</span> Banking Details</legend>
        <p class="section-description">Your wages will be paid by BACS transfer. Please provide your UK bank account details.</p>

        <div class="form-group">
          <label for="bank_account_holder">Account holder name (as shown on bank statement)</label>
          <input type="text" id="bank_account_holder" name="bank_account_holder">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="bank_sort_code">Sort code</label>
            <input type="text" id="bank_sort_code" name="bank_sort_code" placeholder="XX-XX-XX" maxlength="8">
          </div>
          <div class="form-group">
            <label for="bank_account_number">Account number</label>
            <input type="text" id="bank_account_number" name="bank_account_number" placeholder="8 digits" maxlength="8">
          </div>
        </div>
      </fieldset>

      <!-- Section 4: Emergency Contact & Operational -->
      <fieldset class="form-section">
        <legend><span class="section-number">4</span> Emergency Contact &amp; Operational</legend>

        <h3 class="subsection-title">Emergency Contact</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="emergency_contact_name">Contact name</label>
            <input type="text" id="emergency_contact_name" name="emergency_contact_name">
          </div>
          <div class="form-group">
            <label for="emergency_contact_relationship">Relationship</label>
            <input type="text" id="emergency_contact_relationship" name="emergency_contact_relationship">
          </div>
          <div class="form-group">
            <label for="emergency_contact_phone">Contact phone number</label>
            <input type="tel" id="emergency_contact_phone" name="emergency_contact_phone">
          </div>
        </div>

        <h3 class="subsection-title">Medical Information</h3>
        <div class="form-group">
          <label for="medical_notes">Please note any medical conditions, allergies, or medications we should be aware of in an emergency.</label>
          <textarea id="medical_notes" name="medical_notes" rows="3"></textarea>
        </div>

        <h3 class="subsection-title">Uniform Sizes</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="tshirt_size">T-shirt size</label>
            <select id="tshirt_size" name="tshirt_size">
              <option value="">-- Select --</option>
              ${['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s =>
                `<option value="${s}">${s}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="trouser_size">Trouser size</label>
            <input type="text" id="trouser_size" name="trouser_size">
          </div>
        </div>
      </fieldset>

      <!-- Section 5: Declaration -->
      <fieldset class="form-section">
        <legend><span class="section-number">5</span> Declaration</legend>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="declaration" name="declaration" required>
            I confirm that the information provided on this form is true and complete to the best of my knowledge. I understand that providing false information may result in disciplinary action. I consent to ImmersiveCore processing this data for employment purposes in accordance with GDPR.
          </label>
        </div>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" id="submit-btn">Submit</button>
      </div>
    </form>

    <div id="submit-progress" class="submit-progress" style="display:none;">
      <div class="progress-spinner"></div>
      <p id="progress-message">Submitting...</p>
    </div>
  `;

  // ---- Student loan conditional ----
  const studentLoanCheckbox = el.querySelector('#has_student_loan');
  const studentLoanWrapper = el.querySelector('#student-loan-plan-wrapper');
  studentLoanCheckbox.addEventListener('change', () => {
    studentLoanWrapper.style.display = studentLoanCheckbox.checked ? 'block' : 'none';
    if (!studentLoanCheckbox.checked) {
      el.querySelector('#student_loan_plan').value = '';
    }
  });

  // ---- Sort code auto-format ----
  const sortCodeInput = el.querySelector('#bank_sort_code');
  sortCodeInput.addEventListener('input', () => {
    let val = sortCodeInput.value.replace(/[^0-9]/g, '');
    if (val.length > 6) val = val.slice(0, 6);
    if (val.length > 4) val = val.slice(0, 2) + '-' + val.slice(2, 4) + '-' + val.slice(4);
    else if (val.length > 2) val = val.slice(0, 2) + '-' + val.slice(2);
    sortCodeInput.value = val;
  });

  // ---- Form submission ----
  const form = el.querySelector('#newstarter-form');
  const submitBtn = el.querySelector('#submit-btn');
  const progressEl = el.querySelector('#submit-progress');
  const progressMsg = el.querySelector('#progress-message');
  const errorSummary = el.querySelector('#error-summary');
  const errorList = el.querySelector('#error-list');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      full_name: el.querySelector('#full_name').value.trim(),
      date_of_birth: el.querySelector('#date_of_birth').value,
      ni_number: el.querySelector('#ni_number').value.trim() || null,
      address: el.querySelector('#address').value.trim() || null,
      personal_email: el.querySelector('#personal_email').value.trim() || null,
      mobile_number: el.querySelector('#mobile_number').value.trim() || null,

      employee_statement: el.querySelector('input[name="employee_statement"]:checked')?.value || null,
      has_student_loan: el.querySelector('#has_student_loan').checked,
      student_loan_plan: el.querySelector('#has_student_loan').checked ? (el.querySelector('#student_loan_plan').value || null) : null,
      has_postgraduate_loan: el.querySelector('#has_postgraduate_loan').checked,

      bank_account_holder: el.querySelector('#bank_account_holder').value.trim() || null,
      bank_sort_code: el.querySelector('#bank_sort_code').value.trim() || null,
      bank_account_number: el.querySelector('#bank_account_number').value.trim() || null,

      emergency_contact_name: el.querySelector('#emergency_contact_name').value.trim() || null,
      emergency_contact_relationship: el.querySelector('#emergency_contact_relationship').value.trim() || null,
      emergency_contact_phone: el.querySelector('#emergency_contact_phone').value.trim() || null,
      medical_notes: el.querySelector('#medical_notes').value.trim() || null,
      tshirt_size: el.querySelector('#tshirt_size').value || null,
      trouser_size: el.querySelector('#trouser_size').value.trim() || null,
    };

    // Check declaration
    const declaration = el.querySelector('#declaration');
    const errors = validateOnboarding(data);
    if (!declaration.checked) {
      errors.push({ field: 'declaration', message: 'You must agree to the declaration before submitting.' });
    }

    if (errors.length > 0) {
      errorList.innerHTML = errors.map(e => `<li>${esc(e.message)}</li>`).join('');
      errorSummary.style.display = 'block';
      errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    errorSummary.style.display = 'none';
    submitBtn.disabled = true;
    progressEl.style.display = 'flex';
    progressMsg.textContent = 'Submitting your details...';

    try {
      await createPublicOnboarding(data);

      // Show success screen
      el.innerHTML = `
        <div style="text-align:center; padding:60px 20px;">
          <div style="font-size:48px; margin-bottom:16px;">&#10003;</div>
          <h1 style="color:#fff; margin-bottom:8px;">Thank you!</h1>
          <p style="color:#aaa; font-size:16px; max-width:480px; margin:0 auto;">
            Your New Starter Pack has been submitted successfully. A manager will review your details shortly.
          </p>
          <p style="color:#666; font-size:13px; margin-top:24px;">You can close this page.</p>
        </div>
      `;
    } catch (err) {
      console.error('Submit error:', err);
      progressEl.style.display = 'none';
      submitBtn.disabled = false;
      errorList.innerHTML = `<li>${esc(err.message)}</li>`;
      errorSummary.style.display = 'block';
      errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}
