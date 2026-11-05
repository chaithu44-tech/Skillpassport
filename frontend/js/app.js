import { api } from './api.js';
import { appState } from './state.js';
import { renderNavbar } from './components/navbar.js';
import { toast } from './components/toast.js';

// Page Imports
import { renderLandingPage } from './pages/landing.js';
import { renderLoginPage, renderRegisterStudentPage, renderRegisterRecruiterPage, renderOwnerLoginPage } from './pages/auth_pages.js';
import { renderStudentDashboard } from './pages/student/dashboard.js';
import { renderResumeUploadPage } from './pages/student/resume_upload.js';
import { renderResumeAnalysisPage } from './pages/student/resume_analysis.js';
import { renderRoleSelectionPage } from './pages/student/role_selection.js';
import { renderCareerReportPage } from './pages/student/career_report.js';
import { renderRoadmapPage } from './pages/student/roadmap.js';
import { renderStudentProfilePage } from './pages/student/profile.js';
import { renderStudentApplicationsPage } from './pages/student/applications.js';
import { renderOpportunitiesPage } from './pages/opportunities_page.js';
import { renderRecruiterDashboard } from './pages/recruiter/dashboard.js';
import { renderRecruiterPostJobPage } from './pages/recruiter/post_job.js';
import { renderRecruiterApplicantsPage } from './pages/recruiter/applicants.js';
import { renderAdminDashboard } from './pages/admin/dashboard.js';
import { renderAdminUsersPage } from './pages/admin/users.js';
import { renderAdminRolesPage } from './pages/admin/roles_manager.js';
import { renderAdminAiMonitorPage } from './pages/admin/ai_monitor.js';
import { renderAdminAuditLogsPage } from './pages/admin/audit_logs.js';

// Router Dispatcher
async function handleRouting() {
  const hash = window.location.hash || '#landing';
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const { user } = appState.get();

  // Route parser
  const cleanHash = hash.split('?')[0];

  // Public Routes
  if (cleanHash === '' || cleanHash === '#landing' || cleanHash === '#features' || cleanHash === '#how-it-works' || cleanHash === '#about') {
    renderLandingPage(appContainer);
  } else if (cleanHash === '#login') {
    renderLoginPage(appContainer);
  } else if (cleanHash === '#register') {
    renderRegisterStudentPage(appContainer);
  } else if (cleanHash === '#register-recruiter') {
    renderRegisterRecruiterPage(appContainer);
  } else if (cleanHash === '#owner-login') {
    renderOwnerLoginPage(appContainer);
  }
  // Opportunities Route (Public & Authenticated)
  else if (cleanHash.startsWith('#opportunities')) {
    const parts = cleanHash.split('/');
    const oppId = parts.length > 1 ? parseInt(parts[1]) : null;
    renderOpportunitiesPage(appContainer, oppId);
  }
  // Student Portal Routes
  else if (cleanHash === '#student/dashboard') {
    if (!requireAuth('student')) return;
    renderStudentDashboard(appContainer);
  } else if (cleanHash === '#student/resume') {
    if (!requireAuth('student')) return;
    renderResumeUploadPage(appContainer);
  } else if (cleanHash === '#student/analysis') {
    if (!requireAuth('student')) return;
    renderResumeAnalysisPage(appContainer);
  } else if (cleanHash === '#student/role-selection') {
    if (!requireAuth('student')) return;
    renderRoleSelectionPage(appContainer);
  } else if (cleanHash === '#student/career-report') {
    if (!requireAuth('student')) return;
    renderCareerReportPage(appContainer);
  } else if (cleanHash === '#student/roadmap') {
    if (!requireAuth('student')) return;
    renderRoadmapPage(appContainer);
  } else if (cleanHash === '#student/profile') {
    if (!requireAuth('student')) return;
    renderStudentProfilePage(appContainer);
  } else if (cleanHash === '#student/applications') {
    if (!requireAuth('student')) return;
    renderStudentApplicationsPage(appContainer);
  }
  // Recruiter Portal Routes
  else if (cleanHash === '#recruiter/dashboard') {
    if (!requireAuth('recruiter')) return;
    renderRecruiterDashboard(appContainer);
  } else if (cleanHash === '#recruiter/post-job') {
    if (!requireAuth('recruiter')) return;
    renderRecruiterPostJobPage(appContainer);
  } else if (cleanHash === '#recruiter/applicants') {
    if (!requireAuth('recruiter')) return;
    renderRecruiterApplicantsPage(appContainer);
  }
  // Super Admin Portal Routes
  else if (cleanHash === '#admin/dashboard') {
    if (!requireAuth('admin')) return;
    renderAdminDashboard(appContainer);
  } else if (cleanHash === '#admin/users') {
    if (!requireAuth('admin')) return;
    renderAdminUsersPage(appContainer);
  } else if (cleanHash === '#admin/roles') {
    if (!requireAuth('admin')) return;
    renderAdminRolesPage(appContainer);
  } else if (cleanHash === '#admin/monitor') {
    if (!requireAuth('admin')) return;
    renderAdminAiMonitorPage(appContainer);
  } else if (cleanHash === '#admin/logs' || cleanHash === '#admin/settings') {
    if (!requireAuth('admin')) return;
    renderAdminAuditLogsPage(appContainer);
  }
  // Notifications View
  else if (cleanHash === '#notifications') {
    if (!user) {
      window.location.hash = '#login';
      return;
    }
    renderNotificationsPage(appContainer);
  } else {
    // Fallback to landing
    renderLandingPage(appContainer);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function requireAuth(expectedRole = null) {
  const { user } = appState.get();
  if (!user) {
    toast.warning('Please sign in to access this portal.');
    window.location.hash = '#login';
    return false;
  }
  if (expectedRole && user.role !== expectedRole) {
    toast.error(`Access restricted. Requires ${expectedRole} account.`, 'Unauthorized');
    window.location.hash = user.role === 'admin' ? '#admin/dashboard' : (user.role === 'recruiter' ? '#recruiter/dashboard' : '#student/dashboard');
    return false;
  }
  return true;
}

// Notifications Page
async function renderNotificationsPage(container) {
  try {
    const notifs = await api.get('/notifications');
    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full animate-fade-in space-y-6">
        <div class="flex items-center justify-between pb-6 border-b border-white/5">
          <div>
            <h1 class="text-3xl font-extrabold text-white font-heading">Notifications</h1>
            <p class="text-sm text-slate-400 mt-1">Updates on resume analysis, roadmap activities, and hiring alerts.</p>
          </div>
          <button id="mark-all-read-btn" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition">
            Mark All as Read
          </button>
        </div>

        <div class="space-y-3">
          ${notifs.length === 0 ? `
            <div class="glass-panel p-12 rounded-3xl text-center text-slate-500 text-sm">
              No notifications yet.
            </div>
          ` : notifs.map(n => `
            <div class="p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${n.is_read ? 'bg-[#111827]/40 border-white/5 opacity-75' : 'bg-[#172033] border-[#7C5CFC]/30 shadow-lg'}">
              <div class="flex items-start gap-3.5">
                <div class="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-slate-600' : 'bg-[#7C5CFC]'}"></div>
                <div>
                  <h4 class="text-sm font-bold text-white mb-0.5">${n.title}</h4>
                  <p class="text-xs text-slate-300 leading-relaxed">${n.message}</p>
                  <span class="text-[10px] text-slate-500 font-mono mt-1 block">${n.created_at}</span>
                </div>
              </div>
              ${n.action_link ? `
                <a href="${n.action_link}" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#22D3EE] font-semibold flex-shrink-0">
                  View
                </a>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('mark-all-read-btn').onclick = async () => {
      await api.post('/notifications/read-all');
      appState.set({ unreadCount: 0 });
      renderNotificationsPage(container);
    };
  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}

// Global Footer
function renderFooter() {
  const footer = document.getElementById('main-footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/5">
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7C5CFC] to-[#22D3EE] flex items-center justify-center text-white font-bold text-xs">
              SP
            </div>
            <span class="text-base font-black tracking-wider text-white font-heading">SKILL<span class="text-[#7C5CFC]">PASSPORT</span></span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            AI-powered career intelligence, multi-page resume extraction, and personalized roadmaps engineered for college students.
          </p>
        </div>

        <div>
          <h4 class="text-xs font-mono uppercase text-white font-bold mb-3 tracking-wider">Portals</h4>
          <ul class="space-y-2 text-xs">
            <li><a href="#student/dashboard" class="hover:text-white transition">Student Portal</a></li>
            <li><a href="#recruiter/dashboard" class="hover:text-white transition">Recruiter Talent Hub</a></li>
            <li><a href="#owner-login" class="hover:text-[#EF4444] transition flex items-center gap-1"><i data-lucide="shield" class="w-3 h-3 text-[#EF4444]"></i> Super Admin (Owner)</a></li>
            <li><a href="#opportunities" class="hover:text-white transition">Verified Opportunities</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-xs font-mono uppercase text-white font-bold mb-3 tracking-wider">Technology</h4>
          <ul class="space-y-2 text-xs">
            <li>PyMuPDF Multi-Page Extraction</li>
            <li>FastAPI & SQLAlchemy Relational DB</li>
            <li>Google Gemini AI Analysis Engine</li>
            <li>PBKDF2 Hashing & JWT Protection</li>
          </ul>
        </div>

        <div>
          <h4 class="text-xs font-mono uppercase text-white font-bold mb-3 tracking-wider">Transparency</h4>
          <p class="text-xs text-slate-400 leading-relaxed mb-3">
            Skill Passport never invents credentials or guarantees employment. All readiness metrics reflect actual stored data.
          </p>
          <div class="text-[11px] font-mono text-[#22D3EE]">v1.0.0 Production Ready</div>
        </div>
      </div>

      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>&copy; 2026 SKILL PASSPORT. All rights reserved. Platform Owner Controlled.</div>
        <div class="flex items-center gap-4">
          <a href="#landing" class="hover:text-slate-400">Privacy Policy</a>
          <a href="#landing" class="hover:text-slate-400">Terms of Service</a>
          <a href="#landing" class="hover:text-slate-400">Security Standards</a>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

// Poll Unread Notifications
async function pollNotifications() {
  const { user } = appState.get();
  if (!user) return;
  try {
    const res = await api.get('/notifications/unread-count');
    appState.set({ unreadCount: res.unread_count || 0 });
  } catch (e) {
    // ignore background poll errors
  }
}

// App Initialization
async function init() {
  renderNavbar();
  renderFooter();

  // Try restoring existing session
  const token = api.getToken();
  if (token) {
    try {
      const me = await api.get('/auth/me');
      appState.setUser(me);
    } catch (e) {
      api.setToken(null);
      appState.clearUser();
    }
  }

  // Subscribe state changes to re-render navbar
  appState.subscribe(() => {
    renderNavbar();
  });

  // Handle route changes
  window.addEventListener('hashchange', () => {
    handleRouting();
  });

  window.addEventListener('auth:expired', () => {
    appState.clearUser();
    toast.warning('Session expired. Please sign in again.');
    window.location.hash = '#login';
  });

  // Initial Route Load
  await handleRouting();

  // Initial poll & intervals
  pollNotifications();
  setInterval(pollNotifications, 30000);
}

document.addEventListener('DOMContentLoaded', init);
