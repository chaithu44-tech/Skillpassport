import { appState } from '../state.js';
import { api } from '../api.js';

export function renderNavbar() {
  const { user, activePortal, unreadCount } = appState.get();
  const navContainer = document.getElementById('main-navbar');
  if (!navContainer) return;

  let portalNavLinks = '';

  if (!user) {
    portalNavLinks = `
      <a href="#landing" class="nav-link text-sm font-medium text-slate-300 hover:text-white transition">Home</a>
      <a href="#features" class="nav-link text-sm font-medium text-slate-300 hover:text-white transition">Features</a>
      <a href="#how-it-works" class="nav-link text-sm font-medium text-slate-300 hover:text-white transition">How It Works</a>
      <a href="#opportunities" class="nav-link text-sm font-medium text-slate-300 hover:text-white transition">Opportunities</a>
      <a href="#about" class="nav-link text-sm font-medium text-slate-300 hover:text-white transition">About</a>
    `;
  } else if (user.role === 'student') {
    portalNavLinks = `
      <a href="#student/dashboard" class="nav-link text-sm font-medium text-slate-300 hover:text-[#7C5CFC] transition flex items-center gap-1.5"><i data-lucide="layout-dashboard" class="w-4 h-4"></i> Dashboard</a>
      <a href="#student/resume" class="nav-link text-sm font-medium text-slate-300 hover:text-[#7C5CFC] transition flex items-center gap-1.5"><i data-lucide="file-text" class="w-4 h-4"></i> Resume</a>
      <a href="#student/role-selection" class="nav-link text-sm font-medium text-slate-300 hover:text-[#7C5CFC] transition flex items-center gap-1.5"><i data-lucide="target" class="w-4 h-4"></i> Target Role</a>
      <a href="#student/roadmap" class="nav-link text-sm font-medium text-slate-300 hover:text-[#7C5CFC] transition flex items-center gap-1.5"><i data-lucide="milestone" class="w-4 h-4"></i> Roadmap</a>
      <a href="#opportunities" class="nav-link text-sm font-medium text-slate-300 hover:text-[#7C5CFC] transition flex items-center gap-1.5"><i data-lucide="briefcase" class="w-4 h-4"></i> Opportunities</a>
      <a href="#student/applications" class="nav-link text-sm font-medium text-slate-300 hover:text-[#7C5CFC] transition flex items-center gap-1.5"><i data-lucide="send" class="w-4 h-4"></i> Tracker</a>
    `;
  } else if (user.role === 'recruiter') {
    portalNavLinks = `
      <a href="#recruiter/dashboard" class="nav-link text-sm font-medium text-slate-300 hover:text-[#22D3EE] transition flex items-center gap-1.5"><i data-lucide="bar-chart-3" class="w-4 h-4"></i> Recruiter Dashboard</a>
      <a href="#recruiter/post-job" class="nav-link text-sm font-medium text-slate-300 hover:text-[#22D3EE] transition flex items-center gap-1.5"><i data-lucide="plus-circle" class="w-4 h-4"></i> Post Opportunity</a>
      <a href="#recruiter/applicants" class="nav-link text-sm font-medium text-slate-300 hover:text-[#22D3EE] transition flex items-center gap-1.5"><i data-lucide="users" class="w-4 h-4"></i> Candidates</a>
    `;
  } else if (user.role === 'admin') {
    portalNavLinks = `
      <a href="#admin/dashboard" class="nav-link text-sm font-medium text-[#22D3EE] hover:text-white transition flex items-center gap-1.5"><i data-lucide="shield-check" class="w-4 h-4"></i> Live Stats</a>
      <a href="#admin/users" class="nav-link text-sm font-medium text-slate-300 hover:text-[#22D3EE] transition flex items-center gap-1.5"><i data-lucide="users" class="w-4 h-4"></i> Users</a>
      <a href="#admin/roles" class="nav-link text-sm font-medium text-slate-300 hover:text-[#22D3EE] transition flex items-center gap-1.5"><i data-lucide="sliders" class="w-4 h-4"></i> Roles & Skills</a>
      <a href="#admin/monitor" class="nav-link text-sm font-medium text-slate-300 hover:text-[#22D3EE] transition flex items-center gap-1.5"><i data-lucide="activity" class="w-4 h-4"></i> AI & Jobs Monitor</a>
      <a href="#admin/logs" class="nav-link text-sm font-medium text-slate-300 hover:text-[#22D3EE] transition flex items-center gap-1.5"><i data-lucide="file-check-2" class="w-4 h-4"></i> Audit Logs</a>
    `;
  }

  // Right-side actions (Auth or Profile)
  let rightActions = '';
  if (!user) {
    rightActions = `
      <div class="flex items-center gap-3">
        <a href="#login" class="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition">Login</a>
        <a href="#register" class="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] hover:opacity-95 rounded-xl transition shadow-lg shadow-[#7C5CFC]/20">Get Started</a>
        <a href="#owner-login" title="Owner Access" class="p-2 text-slate-500 hover:text-[#22D3EE] transition"><i data-lucide="key-round" class="w-4 h-4"></i></a>
      </div>
    `;
  } else {
    const roleBadge = user.role === 'admin'
      ? '<span class="px-2 py-0.5 text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] rounded-md border border-[#EF4444]/30">OWNER</span>'
      : (user.role === 'recruiter'
        ? '<span class="px-2 py-0.5 text-[10px] font-bold bg-[#22D3EE]/20 text-[#22D3EE] rounded-md border border-[#22D3EE]/30">RECRUITER</span>'
        : '<span class="px-2 py-0.5 text-[10px] font-bold bg-[#7C5CFC]/20 text-[#7C5CFC] rounded-md border border-[#7C5CFC]/30">STUDENT</span>');

    rightActions = `
      <div class="flex items-center gap-4">
        <!-- Notification Bell -->
        <a href="#notifications" class="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition" title="Notifications">
          <i data-lucide="bell" class="w-5 h-5"></i>
          ${unreadCount > 0 ? `<span class="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-[10px] font-bold text-white flex items-center justify-center rounded-full">${unreadCount}</span>` : ''}
        </a>

        <!-- User Profile Dropdown Button -->
        <div class="relative group">
          <button class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-[#172033]/80 transition">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7C5CFC] to-[#22D3EE] flex items-center justify-center text-xs font-bold text-white">
              ${(user.email || 'U')[0].toUpperCase()}
            </div>
            <div class="text-left hidden md:block">
              <div class="text-xs font-semibold text-white truncate max-w-[120px]">${user.email.split('@')[0]}</div>
            </div>
            ${roleBadge}
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400"></i>
          </button>

          <!-- Dropdown Menu -->
          <div class="absolute right-0 mt-2 w-48 py-2 bg-[#172033] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            ${user.role === 'student' ? '<a href="#student/profile" class="block px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5">My Profile & Skills</a>' : ''}
            ${user.role === 'admin' ? '<a href="#admin/settings" class="block px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5">Platform Settings</a>' : ''}
            <hr class="border-white/5 my-1" />
            <button id="logout-btn" class="w-full text-left px-4 py-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition">Sign Out</button>
          </div>
        </div>
      </div>
    `;
  }

  navContainer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <a href="#landing" class="flex items-center gap-2.5 group">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C5CFC] to-[#22D3EE] flex items-center justify-center shadow-lg shadow-[#7C5CFC]/25 group-hover:scale-105 transition-transform">
          <i data-lucide="sparkles" class="w-5 h-5 text-white"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-black tracking-wider text-white font-heading">SKILL<span class="text-[#7C5CFC]">PASSPORT</span></span>
          <span class="text-[9px] tracking-widest text-[#22D3EE] uppercase font-mono font-medium -mt-1">CAREER INTELLIGENCE</span>
        </div>
      </a>

      <!-- Middle Portal Links -->
      <nav class="hidden lg:flex items-center gap-6">
        ${portalNavLinks}
      </nav>

      <!-- Right Actions -->
      <div class="flex items-center gap-4">
        ${rightActions}
      </div>
    </div>
  `;

  // Attach logout handler
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      api.setToken(null);
      appState.clearUser();
      window.location.hash = '#landing';
    };
  }

  if (window.lucide) window.lucide.createIcons();
}
