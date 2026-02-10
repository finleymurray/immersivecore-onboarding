import { fetchAllProfiles, createUser, updateUserRole, deleteUser } from '../services/user-management-service.js';
import { getUser } from '../services/auth-service.js';

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatDateTime(iso) {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export async function render(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1>Network Access</h1>
    </div>
    <div id="network-content">
      <div class="loading">Loading staff...</div>
    </div>
  `;

  await loadStaff(el);
}

async function loadStaff(el) {
  const container = el.querySelector('#network-content');

  try {
    const [profiles, currentUser] = await Promise.all([fetchAllProfiles(), getUser()]);
    const currentUserId = currentUser?.id;

    const rows = profiles.map(p => {
      const isSelf = p.id === currentUserId;
      const toggleRole = p.role === 'manager' ? 'staff' : 'manager';
      const toggleLabel = p.role === 'manager' ? 'Demote to staff' : 'Promote to manager';

      return `
      <tr>
        <td>${esc(p.full_name)}${isSelf ? ' <span style="color:#666;font-size:12px;">(you)</span>' : ''}</td>
        <td>${esc(p.email)}</td>
        <td><span class="badge ${p.role === 'manager' ? 'badge-complete' : 'badge-pending'}">${esc(p.role)}</span></td>
        <td>${formatDateTime(p.created_at)}</td>
        <td>
          ${isSelf ? '' : `
            <button type="button" class="btn btn-secondary btn-sm role-toggle-btn" data-user-id="${esc(p.id)}" data-new-role="${esc(toggleRole)}">${esc(toggleLabel)}</button>
            <button type="button" class="btn btn-danger btn-sm delete-user-btn" data-user-id="${esc(p.id)}" data-user-name="${esc(p.full_name)}" style="margin-left:4px;">Delete</button>
          `}
        </td>
      </tr>`;
    }).join('');

    container.innerHTML = `
      <div class="form-section">
        <legend><span class="section-number">+</span> Create New User</legend>
        <div id="create-user-error" class="error-summary" style="display:none;"></div>
        <div id="create-user-success" class="info-banner" style="display:none;"></div>
        <form id="create-user-form">
          <div class="form-row">
            <div class="form-group">
              <label for="new-email">Email <span class="required">*</span></label>
              <input type="email" id="new-email" required>
            </div>
            <div class="form-group">
              <label for="new-name">Full name <span class="required">*</span></label>
              <input type="text" id="new-name" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="new-role">Role</label>
              <select id="new-role">
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div class="form-group">
              <label for="new-password">Password <span style="font-weight:400;color:#666;">(optional &mdash; user will set via email if blank)</span></label>
              <input type="text" id="new-password" autocomplete="off">
            </div>
          </div>
          <button type="submit" class="btn btn-primary" id="create-user-btn">Create user</button>
          <p style="margin-top:12px;font-size:12px;color:#666;">
            By creating a user account, you confirm the individual has been informed about how their data is processed.
            <a href="https://immersivecore.network/privacy-policy.html" target="_blank" style="color:#888;">Privacy Policy</a>
          </p>
        </form>
      </div>

      <div id="staff-action-msg" class="info-banner" style="display:none;margin-bottom:12px;"></div>

      <div class="detail-section" style="margin-top:20px;">
        <h2>All Staff (${profiles.length})</h2>
        ${profiles.length === 0 ? '<p class="empty-state">No users found.</p>' : `
          <table class="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        `}
      </div>

      <div class="confirm-overlay" id="delete-user-overlay" style="display:none;">
        <div class="confirm-dialog">
          <p>Are you sure you want to delete <strong id="delete-user-name"></strong>? This cannot be undone.</p>
          <div style="display:flex;gap:8px;margin-top:16px;">
            <button type="button" class="btn btn-danger" id="confirm-delete-user-btn">Delete</button>
            <button type="button" class="btn btn-secondary" id="cancel-delete-user-btn">Cancel</button>
          </div>
        </div>
      </div>
    `;

    // Create user form handler
    const form = container.querySelector('#create-user-form');
    const errorEl = container.querySelector('#create-user-error');
    const successEl = container.querySelector('#create-user-success');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.style.display = 'none';
      successEl.style.display = 'none';

      const btn = container.querySelector('#create-user-btn');
      btn.disabled = true;
      btn.textContent = 'Creating\u2026';

      try {
        const email = container.querySelector('#new-email').value.trim();
        const full_name = container.querySelector('#new-name').value.trim();
        const role = container.querySelector('#new-role').value;
        const password = container.querySelector('#new-password').value || undefined;

        await createUser({ email, full_name, role, password });

        successEl.textContent = `User ${email} created successfully.`;
        successEl.style.display = 'block';
        form.reset();

        // Refresh the staff list
        await loadStaff(el);
      } catch (err) {
        errorEl.textContent = err.message || 'Failed to create user.';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Create user';
      }
    });

    // Role toggle handlers
    container.querySelectorAll('.role-toggle-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const newRole = btn.dataset.newRole;
        btn.disabled = true;
        btn.textContent = 'Updating\u2026';

        try {
          await updateUserRole(userId, newRole);
          await loadStaff(el);
        } catch (err) {
          const msgEl = container.querySelector('#staff-action-msg');
          msgEl.className = 'info-banner error';
          msgEl.textContent = err.message || 'Failed to update role.';
          msgEl.style.display = 'block';
          btn.disabled = false;
          btn.textContent = newRole === 'manager' ? 'Promote to manager' : 'Demote to staff';
        }
      });
    });

    // Delete user handlers
    const overlay = container.querySelector('#delete-user-overlay');
    const confirmBtn = container.querySelector('#confirm-delete-user-btn');
    const cancelBtn = container.querySelector('#cancel-delete-user-btn');
    const deleteNameEl = container.querySelector('#delete-user-name');
    let pendingDeleteUserId = null;

    container.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pendingDeleteUserId = btn.dataset.userId;
        deleteNameEl.textContent = btn.dataset.userName;
        overlay.style.display = 'flex';
      });
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        pendingDeleteUserId = null;
      });
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
          pendingDeleteUserId = null;
        }
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        if (!pendingDeleteUserId) return;
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Deleting\u2026';

        try {
          await deleteUser(pendingDeleteUserId);
          overlay.style.display = 'none';
          pendingDeleteUserId = null;
          await loadStaff(el);
        } catch (err) {
          overlay.style.display = 'none';
          const msgEl = container.querySelector('#staff-action-msg');
          msgEl.className = 'info-banner error';
          msgEl.textContent = err.message || 'Failed to delete user.';
          msgEl.style.display = 'block';
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Delete';
          pendingDeleteUserId = null;
        }
      });
    }
  } catch (err) {
    container.innerHTML = `<div class="error-banner"><p>Failed to load staff: ${esc(err.message)}</p></div>`;
  }
}
