import { createDraftOnboarding } from '../services/onboarding-service.js';

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
        <h1>Invite New Starter</h1>
        <p class="page-subtitle">Pre-fill any details you know, then send the link to the new starter to complete the rest.</p>
      </div>
    </div>

    <form id="invite-form" novalidate>
      <fieldset class="form-section">
        <legend><span class="section-number">1</span> Known Details</legend>
        <p class="section-description">Fill in whatever you already know. The new starter will see these pre-filled and complete the remaining fields.</p>

        <div class="form-row">
          <div class="form-group">
            <label for="full_name">Full name <span class="required">*</span></label>
            <input type="text" id="full_name" name="full_name" required>
          </div>
          <div class="form-group">
            <label for="date_of_birth">Date of birth</label>
            <input type="date" id="date_of_birth" name="date_of_birth">
          </div>
        </div>

        <div class="form-group">
          <label for="personal_email">Personal email</label>
          <input type="email" id="personal_email" name="personal_email">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="mobile_number">Mobile number</label>
            <input type="tel" id="mobile_number" name="mobile_number">
          </div>
          <div class="form-group">
            <label for="ni_number">National Insurance number</label>
            <input type="text" id="ni_number" name="ni_number" placeholder="QQ 12 34 56 A">
          </div>
        </div>
      </fieldset>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" id="create-btn">Create Invite Link</button>
        <a href="#/" class="btn btn-ghost">Cancel</a>
      </div>
    </form>

    <div id="invite-result" style="display:none;"></div>
  `;

  const form = el.querySelector('#invite-form');
  const createBtn = el.querySelector('#create-btn');
  const resultEl = el.querySelector('#invite-result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = el.querySelector('#full_name').value.trim();
    if (!fullName) {
      alert('Full name is required.');
      return;
    }

    createBtn.disabled = true;
    createBtn.textContent = 'Creating...';

    try {
      const data = { full_name: fullName };

      const dob = el.querySelector('#date_of_birth').value;
      if (dob) data.date_of_birth = dob;

      const email = el.querySelector('#personal_email').value.trim();
      if (email) data.personal_email = email;

      const mobile = el.querySelector('#mobile_number').value.trim();
      if (mobile) data.mobile_number = mobile;

      const ni = el.querySelector('#ni_number').value.trim();
      if (ni) data.ni_number = ni;

      const record = await createDraftOnboarding(data);

      const link = window.location.origin + window.location.pathname + '#/newstarter/' + record.id;

      form.style.display = 'none';
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="form-section" style="text-align:center; padding:32px;">
          <h2 style="color:#fff; margin-bottom:8px;">Invite created for ${esc(fullName)}</h2>
          <p style="color:#aaa; margin-bottom:20px;">Send this link to the new starter. They will see the pre-filled details and complete the rest of the form.</p>

          <div style="display:flex; gap:8px; max-width:600px; margin:0 auto;">
            <input type="text" id="invite-link" class="search-input" value="${esc(link)}" readonly style="flex:1; font-size:13px;">
            <button type="button" id="copy-btn" class="btn btn-primary">Copy</button>
          </div>

          <p id="copy-msg" style="color:#4caf50; font-size:13px; margin-top:8px; min-height:20px;"></p>

          <div style="margin-top:24px; display:flex; gap:12px; justify-content:center;">
            <a href="#/invite" class="btn btn-secondary">Create Another</a>
            <a href="#/" class="btn btn-ghost">Back to Dashboard</a>
          </div>
        </div>
      `;

      const linkInput = resultEl.querySelector('#invite-link');
      const copyBtn = resultEl.querySelector('#copy-btn');
      const copyMsg = resultEl.querySelector('#copy-msg');

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(link);
          copyMsg.textContent = 'Copied to clipboard!';
          linkInput.select();
        } catch (_) {
          linkInput.select();
          document.execCommand('copy');
          copyMsg.textContent = 'Copied!';
        }
        setTimeout(() => { copyMsg.textContent = ''; }, 3000);
      });

      // Auto-select on click
      linkInput.addEventListener('click', () => linkInput.select());

    } catch (err) {
      console.error('Failed to create invite:', err);
      createBtn.disabled = false;
      createBtn.textContent = 'Create Invite Link';
      alert('Failed to create invite: ' + err.message);
    }
  });
}
