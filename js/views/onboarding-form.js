import { createOnboarding, updateOnboarding, fetchOnboarding, createLinkedRTWRecord } from '../services/onboarding-service.js';
import { uploadPaperScan } from '../services/storage-service.js';
import { validateOnboarding } from '../utils/validation.js';
import { navigate } from '../router.js';

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export async function render(el, editId) {
  let existingRecord = null;
  if (editId) {
    existingRecord = await fetchOnboarding(editId);
  }

  const isEdit = !!existingRecord;
  const title = isEdit ? 'Edit Onboarding Record' : 'New Starter Onboarding';

  el.innerHTML = `
    <div class="page-header">
      <h1>${title}</h1>
      <p class="page-subtitle">Digitise the New Starter Pack into the system</p>
    </div>

    <div id="error-summary" class="error-summary" style="display:none;">
      <h3>There are errors</h3>
      <ul id="error-list"></ul>
    </div>

    <form id="onboarding-form" novalidate>

      <!-- Section 1: Core Details -->
      <fieldset class="form-section">
        <legend><span class="section-number">1</span> Core Details</legend>

        <div class="form-row">
          <div class="form-group">
            <label for="full_name">Full name <span class="required">*</span></label>
            <input type="text" id="full_name" name="full_name" required value="${esc(existingRecord?.full_name || '')}">
          </div>
          <div class="form-group">
            <label for="date_of_birth">Date of birth <span class="required">*</span></label>
            <input type="date" id="date_of_birth" name="date_of_birth" required value="${existingRecord?.date_of_birth || ''}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="ni_number">National Insurance number</label>
            <input type="text" id="ni_number" name="ni_number" placeholder="QQ 12 34 56 A" value="${esc(existingRecord?.ni_number || '')}">
          </div>
          <div class="form-group">
            <label for="mobile_number">Mobile number</label>
            <input type="tel" id="mobile_number" name="mobile_number" value="${esc(existingRecord?.mobile_number || '')}">
          </div>
        </div>

        <div class="form-group">
          <label for="address">Address</label>
          <textarea id="address" name="address" rows="3">${esc(existingRecord?.address || '')}</textarea>
        </div>

        <div class="form-group">
          <label for="personal_email">Personal email</label>
          <input type="email" id="personal_email" name="personal_email" value="${esc(existingRecord?.personal_email || '')}">
        </div>
      </fieldset>

      <!-- Section 2: HMRC New Starter Checklist -->
      <fieldset class="form-section">
        <legend><span class="section-number">2</span> HMRC New Starter Checklist</legend>

        <div class="form-group">
          <label class="group-label">Employee Statement</label>

          <div class="radio-option">
            <input type="radio" id="statement_a" name="employee_statement" value="A" ${existingRecord?.employee_statement === 'A' ? 'checked' : ''}>
            <label for="statement_a">
              <strong>Statement A:</strong> This is my first job since last 6 April and I have not been receiving taxable Jobseeker's Allowance, Employment and Support Allowance, taxable Incapacity Benefit, State Pension or Occupational Pension.
            </label>
          </div>

          <div class="radio-option">
            <input type="radio" id="statement_b" name="employee_statement" value="B" ${existingRecord?.employee_statement === 'B' ? 'checked' : ''}>
            <label for="statement_b">
              <strong>Statement B:</strong> This is now my only job but since last 6 April I have had another job, or received taxable Jobseeker's Allowance, Employment and Support Allowance or taxable Incapacity Benefit. I do not receive a State Pension or Occupational Pension.
            </label>
          </div>

          <div class="radio-option">
            <input type="radio" id="statement_c" name="employee_statement" value="C" ${existingRecord?.employee_statement === 'C' ? 'checked' : ''}>
            <label for="statement_c">
              <strong>Statement C:</strong> As well as my new job, I have another job or receive a State Pension or Occupational Pension.
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="has_student_loan" name="has_student_loan" ${existingRecord?.has_student_loan ? 'checked' : ''}>
              Do you have a student loan?
            </label>
            <div id="student-loan-plan-wrapper" class="conditional-field" style="display:${existingRecord?.has_student_loan ? 'block' : 'none'};">
              <label for="student_loan_plan">Student Loan Plan</label>
              <select id="student_loan_plan" name="student_loan_plan">
                <option value="">-- Select plan --</option>
                <option value="Plan 1" ${existingRecord?.student_loan_plan === 'Plan 1' ? 'selected' : ''}>Plan 1</option>
                <option value="Plan 2" ${existingRecord?.student_loan_plan === 'Plan 2' ? 'selected' : ''}>Plan 2</option>
                <option value="Plan 4" ${existingRecord?.student_loan_plan === 'Plan 4' ? 'selected' : ''}>Plan 4</option>
                <option value="Plan 5" ${existingRecord?.student_loan_plan === 'Plan 5' ? 'selected' : ''}>Plan 5</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="has_postgraduate_loan" name="has_postgraduate_loan" ${existingRecord?.has_postgraduate_loan ? 'checked' : ''}>
              Do you have a postgraduate loan?
            </label>
          </div>
        </div>
      </fieldset>

      <!-- Section 3: Banking Details -->
      <fieldset class="form-section">
        <legend><span class="section-number">3</span> Banking Details</legend>

        <div class="form-group">
          <label for="bank_account_holder">Account holder name</label>
          <input type="text" id="bank_account_holder" name="bank_account_holder" value="${esc(existingRecord?.bank_account_holder || '')}">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="bank_sort_code">Sort code</label>
            <input type="text" id="bank_sort_code" name="bank_sort_code" placeholder="XX-XX-XX" maxlength="8" value="${esc(existingRecord?.bank_sort_code || '')}">
          </div>
          <div class="form-group">
            <label for="bank_account_number">Account number</label>
            <input type="text" id="bank_account_number" name="bank_account_number" placeholder="8 digits" maxlength="8" value="${esc(existingRecord?.bank_account_number || '')}">
          </div>
        </div>
      </fieldset>

      <!-- Section 4: Operational Specifications -->
      <fieldset class="form-section">
        <legend><span class="section-number">4</span> Operational Specifications</legend>

        <h3 class="subsection-title">Emergency Contact</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="emergency_contact_name">Contact name</label>
            <input type="text" id="emergency_contact_name" name="emergency_contact_name" value="${esc(existingRecord?.emergency_contact_name || '')}">
          </div>
          <div class="form-group">
            <label for="emergency_contact_relationship">Relationship</label>
            <input type="text" id="emergency_contact_relationship" name="emergency_contact_relationship" value="${esc(existingRecord?.emergency_contact_relationship || '')}">
          </div>
          <div class="form-group">
            <label for="emergency_contact_phone">Phone number</label>
            <input type="tel" id="emergency_contact_phone" name="emergency_contact_phone" value="${esc(existingRecord?.emergency_contact_phone || '')}">
          </div>
        </div>

        <div class="form-group">
          <label for="medical_notes">Medical conditions or allergies</label>
          <textarea id="medical_notes" name="medical_notes" rows="3" placeholder="Any medical conditions or allergies we should know about?">${esc(existingRecord?.medical_notes || '')}</textarea>
        </div>

        <h3 class="subsection-title">Uniform</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="tshirt_size">T-shirt size</label>
            <select id="tshirt_size" name="tshirt_size">
              <option value="">-- Select --</option>
              ${['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s =>
                `<option value="${s}" ${existingRecord?.tshirt_size === s ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="trouser_size">Trouser size</label>
            <input type="text" id="trouser_size" name="trouser_size" value="${esc(existingRecord?.trouser_size || '')}">
          </div>
        </div>
      </fieldset>

      <!-- Section 5: Paper Record Upload -->
      <fieldset class="form-section">
        <legend><span class="section-number">5</span> Paper Record Upload <span class="optional-tag">Optional</span></legend>

        <p class="section-description">Upload a scanned image of the physical New Starter Pack form.</p>

        <div id="upload-area" class="upload-area">
          <div id="upload-prompt" class="upload-prompt">
            <p class="upload-icon">&#128196;</p>
            <p>Drag and drop a file here, or <label for="file-input" class="upload-link">browse</label></p>
            <p class="upload-hint">JPEG, PNG or PDF — max 10 MB</p>
          </div>
          <input type="file" id="file-input" accept=".jpg,.jpeg,.png,.pdf" style="display:none;">
          <div id="upload-preview" class="upload-preview" style="display:none;">
            <div id="preview-container"></div>
            <div class="upload-file-info">
              <span id="upload-filename"></span>
              <button type="button" id="upload-remove" class="btn btn-danger btn-sm">Remove</button>
            </div>
          </div>
        </div>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" id="submit-btn">
          ${isEdit ? 'Update Record' : 'Submit Onboarding'}
        </button>
        <a href="#/" class="btn btn-ghost">Cancel</a>
      </div>
    </form>

    <div id="submit-progress" class="submit-progress" style="display:none;">
      <div class="progress-spinner"></div>
      <p id="progress-message">Saving record...</p>
    </div>
  `;

  // ---- File upload handling ----
  let selectedFile = null;
  let fileBase64 = null;

  const uploadArea = el.querySelector('#upload-area');
  const fileInput = el.querySelector('#file-input');
  const uploadPrompt = el.querySelector('#upload-prompt');
  const uploadPreview = el.querySelector('#upload-preview');
  const previewContainer = el.querySelector('#preview-container');
  const uploadFilename = el.querySelector('#upload-filename');
  const uploadRemove = el.querySelector('#upload-remove');

  function handleFile(file) {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 10 MB.');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPEG, PNG or PDF.');
      return;
    }

    selectedFile = file;
    uploadFilename.textContent = file.name;
    uploadPrompt.style.display = 'none';
    uploadPreview.style.display = 'block';

    // Preview
    previewContainer.innerHTML = '';
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-image';
        previewContainer.appendChild(img);
        fileBase64 = e.target.result.split(',')[1];
      };
      reader.readAsDataURL(file);
    } else {
      previewContainer.innerHTML = '<div class="pdf-preview-placeholder">PDF file selected</div>';
      const reader = new FileReader();
      reader.onload = (e) => {
        fileBase64 = e.target.result.split(',')[1];
      };
      reader.readAsDataURL(file);
    }
  }

  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  });

  uploadRemove.addEventListener('click', () => {
    selectedFile = null;
    fileBase64 = null;
    fileInput.value = '';
    previewContainer.innerHTML = '';
    uploadPreview.style.display = 'none';
    uploadPrompt.style.display = 'block';
  });

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
  const form = el.querySelector('#onboarding-form');
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

    // Validate
    const errors = validateOnboarding(data);
    if (errors.length > 0) {
      errorList.innerHTML = errors.map(e => `<li>${esc(e.message)}</li>`).join('');
      errorSummary.style.display = 'block';
      errorSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    errorSummary.style.display = 'none';
    submitBtn.disabled = true;
    progressEl.style.display = 'flex';
    progressMsg.textContent = 'Saving record...';

    try {
      let record;
      if (isEdit) {
        record = await updateOnboarding(editId, data);
      } else {
        record = await createOnboarding(data);
      }

      // Upload paper scan if selected
      if (selectedFile) {
        progressMsg.textContent = 'Uploading paper scan...';
        const scanPath = await uploadPaperScan(record.id, selectedFile);
        await updateOnboarding(record.id, {
          paper_scan_path: scanPath,
          paper_scan_filename: selectedFile.name,
        });
      }

      // Generate PDF and upload to Google Drive
      if (!isEdit) {
        progressMsg.textContent = 'Generating PDF...';
        try {
          const { generateOnboardingPDFBlob } = await import('../utils/pdf-generator.js');
          const pdfBlob = generateOnboardingPDFBlob(record);

          if (pdfBlob) {
            progressMsg.textContent = 'Uploading to Google Drive...';
            const pdfBase64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result.split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(pdfBlob);
            });

            const safeName = data.full_name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const fileName = `Onboarding_${safeName}_${dateStr}.pdf`;

            const { uploadToGoogleDrive } = await import('../services/gdrive-service.js');
            const driveResult = await uploadToGoogleDrive({
              employeeName: data.full_name,
              fileName,
              fileBase64: pdfBase64,
              subfolder: 'Onboarding',
            });

            await updateOnboarding(record.id, {
              gdrive_folder_id: driveResult.employee_folder_id,
              gdrive_pdf_link: driveResult.web_view_link,
            });
          }
        } catch (driveErr) {
          console.error('Google Drive upload failed (non-blocking):', driveErr);
        }

        // Create linked RTW record
        progressMsg.textContent = 'Creating RTW record...';
        try {
          const rtwRecord = await createLinkedRTWRecord(record.id, data.full_name, data.date_of_birth);
          await updateOnboarding(record.id, {
            rtw_record_id: rtwRecord.id,
            status: 'rtw_in_progress',
          });
        } catch (rtwErr) {
          console.error('RTW record creation failed (non-blocking):', rtwErr);
        }
      }

      navigate('/onboarding/' + record.id);

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
