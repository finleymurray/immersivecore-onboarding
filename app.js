import { addRoute, setAuthGuard, navigate, initRouter } from './js/router.js';
import { getSession, getUserProfile, isManager, onAuthStateChange, clearProfileCache } from './js/services/auth-service.js';

// ---- Auth guard — all routes require manager role ----
setAuthGuard(async (routeOptions) => {
  const session = await getSession();
  if (!session) {
    navigate('/login');
    return false;
  }
  const manager = await isManager();
  if (!manager) {
    navigate('/login');
    return false;
  }
  return true;
});

// ---- Routes ----
addRoute('/login', async (el) => {
  const session = await getSession();
  if (session) {
    const manager = await isManager();
    if (manager) { navigate('/'); return; }
  }
  const { render } = await import('./js/views/login.js');
  await render(el);
}, { public: true });

addRoute('/', async (el) => {
  const { render } = await import('./js/views/dashboard.js');
  await render(el);
});

addRoute('/new', async (el) => {
  const { render } = await import('./js/views/onboarding-form.js');
  await render(el);
});

addRoute('/onboarding/:id', async (el, params) => {
  const { render } = await import('./js/views/onboarding-detail.js');
  await render(el, params.id);
});

addRoute('/onboarding/:id/edit', async (el, params) => {
  const { render } = await import('./js/views/onboarding-form.js');
  await render(el, params.id);
});

addRoute('/network', async (el) => {
  const { render } = await import('./js/views/network-access.js');
  await render(el);
});

// ---- Active nav tab highlighting ----
function updateActiveTab() {
  const hash = window.location.hash || '#/';
  const navOnboarding = document.getElementById('nav-onboarding');
  const navNetwork = document.getElementById('nav-network');

  if (navOnboarding) navOnboarding.classList.toggle('active', !hash.startsWith('#/network'));
  if (navNetwork) navNetwork.classList.toggle('active', hash.startsWith('#/network'));
}

window.addEventListener('hashchange', updateActiveTab);
updateActiveTab();

// ---- Nav auth state ----
async function updateNavAuth(session) {
  const userInfoEl = document.getElementById('user-info');
  if (!userInfoEl) return;

  if (session) {
    try {
      const profile = await getUserProfile();
      userInfoEl.innerHTML = `
        <span class="user-name">${escapeHtml(profile?.full_name || session.user.email)}</span>
        <button type="button" class="btn-sign-out" id="sign-out-btn">Sign out</button>
      `;
      userInfoEl.style.display = 'flex';

      const signOutBtn = document.getElementById('sign-out-btn');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
          const { signOut } = await import('./js/services/auth-service.js');
          await signOut();
          navigate('/login');
        });
      }
    } catch (err) {
      console.error('Failed to load profile for nav:', err);
    }
  } else {
    userInfoEl.innerHTML = '';
    userInfoEl.style.display = 'none';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

onAuthStateChange((event, session) => {
  clearProfileCache();
  updateNavAuth(session);
});

getSession().then(session => updateNavAuth(session));

initRouter(document.getElementById('app'));
