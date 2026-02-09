import { fetchAllOnboarding } from '../services/onboarding-service.js';
import { formatDateShort } from '../utils/date-utils.js';

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

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

export async function render(el) {
  el.innerHTML = `
    <div class="page-header">
      <h1>Onboarding Dashboard</h1>
      <div class="page-header-actions">
        <button type="button" id="download-form-btn" class="btn btn-secondary">Download New Starter Form</button>
        <a href="#/new" class="btn btn-primary">+ New Onboarding</a>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="search-input" class="search-input" placeholder="Search by name...">
      <select id="status-filter" class="status-filter">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="rtw_in_progress">RTW In Progress</option>
        <option value="complete">Complete</option>
      </select>
    </div>

    <div id="records-container">
      <div class="loading">Loading records...</div>
    </div>
  `;

  const container = el.querySelector('#records-container');
  const searchInput = el.querySelector('#search-input');
  const statusFilter = el.querySelector('#status-filter');

  let allRecords = [];

  try {
    allRecords = await fetchAllOnboarding();
  } catch (err) {
    container.innerHTML = `<div class="error-banner"><p>Failed to load records: ${esc(err.message)}</p></div>`;
    return;
  }

  function renderTable() {
    const search = searchInput.value.toLowerCase().trim();
    const statusVal = statusFilter.value;

    let filtered = allRecords;
    if (search) {
      filtered = filtered.filter(r => r.full_name.toLowerCase().includes(search));
    }
    if (statusVal) {
      filtered = filtered.filter(r => r.status === statusVal);
    }

    if (filtered.length === 0) {
      container.innerHTML = '<p class="empty-state">No onboarding records found.</p>';
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date of Birth</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(r => `
            <tr class="clickable-row" data-id="${r.id}">
              <td>${esc(r.full_name)}</td>
              <td>${formatDateShort(r.date_of_birth)}</td>
              <td><span class="badge ${STATUS_CLASSES[r.status] || ''}">${STATUS_LABELS[r.status] || r.status}</span></td>
              <td>${formatDateShort(r.created_at?.slice(0, 10))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.querySelectorAll('.clickable-row').forEach(row => {
      row.addEventListener('click', () => {
        window.location.hash = '#/onboarding/' + row.dataset.id;
      });
    });
  }

  searchInput.addEventListener('input', renderTable);
  statusFilter.addEventListener('change', renderTable);
  renderTable();

  // Download New Starter Form button
  el.querySelector('#download-form-btn').addEventListener('click', async () => {
    const btn = el.querySelector('#download-form-btn');
    btn.disabled = true;
    btn.textContent = 'Generating...';
    try {
      const { generateBlankStarterForm } = await import('../utils/blank-form-generator.js');
      generateBlankStarterForm();
    } catch (err) {
      console.error('Failed to generate blank form:', err);
      alert('Failed to generate form. Please try again.');
    }
    btn.disabled = false;
    btn.textContent = 'Download New Starter Form';
  });
}
