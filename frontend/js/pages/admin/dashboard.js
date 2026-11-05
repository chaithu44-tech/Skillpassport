import { api } from '../../api.js';

export async function renderAdminDashboard(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#EF4444]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const data = await api.get('/admin/stats');
    const { metrics, system_health } = data;

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Top Admin Bar -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-[#EF4444] font-bold mb-1">
              <span class="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
              <span>SUPER ADMIN PORTAL · OWNER ONLY</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white font-heading">Real-Time Platform Intelligence</h1>
            <p class="text-sm text-slate-400 mt-1">Live metrics derived directly from the database with zero simulated numbers.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <a href="#admin/users" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition flex items-center gap-1.5">
              <i data-lucide="users" class="w-3.5 h-3.5 text-[#22D3EE]"></i>
              <span>Users</span>
            </a>
            <a href="#admin/roles" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition flex items-center gap-1.5">
              <i data-lucide="sliders" class="w-3.5 h-3.5 text-[#7C5CFC]"></i>
              <span>Role Manager</span>
            </a>
            <a href="#admin/monitor" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition flex items-center gap-1.5">
              <i data-lucide="activity" class="w-3.5 h-3.5 text-[#F59E0B]"></i>
              <span>AI Monitor</span>
            </a>
            <a href="#admin/logs" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition flex items-center gap-1.5">
              <i data-lucide="shield" class="w-3.5 h-3.5 text-[#EF4444]"></i>
              <span>Audit Logs</span>
            </a>
          </div>
        </div>

        <!-- 8 Real Database Metric Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div class="glass-panel p-5 rounded-2xl border border-white/5">
            <span class="text-[11px] font-mono uppercase text-slate-400 block mb-1">Registered Students</span>
            <div class="text-3xl font-black text-white font-mono">${metrics.total_students}</div>
            <div class="text-[11px] text-[#7C5CFC] mt-1 font-semibold">Active Profiles</div>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-white/5">
            <span class="text-[11px] font-mono uppercase text-slate-400 block mb-1">Total Recruiters</span>
            <div class="text-3xl font-black text-white font-mono">${metrics.total_recruiters}</div>
            <div class="text-[11px] text-[#22D3EE] mt-1 font-semibold">${metrics.verified_recruiters} Verified by Owner</div>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-white/5">
            <span class="text-[11px] font-mono uppercase text-slate-400 block mb-1">Uploaded Resumes</span>
            <div class="text-3xl font-black text-white font-mono">${metrics.total_resumes}</div>
            <div class="text-[11px] text-[#22C55E] mt-1 font-semibold">${metrics.completed_ai_analyses} AI Analyses Done</div>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-white/5">
            <span class="text-[11px] font-mono uppercase text-slate-400 block mb-1">Active Opportunities</span>
            <div class="text-3xl font-black text-white font-mono">${metrics.active_opportunities}</div>
            <div class="text-[11px] text-[#F59E0B] mt-1 font-semibold">${metrics.total_applications} Applications Filed</div>
          </div>
        </div>

        <!-- System Health & Storage Engine Specs -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- System & Engine Specs -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="server" class="w-5 h-5 text-[#22D3EE]"></i>
              Platform Infrastructure & Status
            </h3>

            <div class="space-y-3 text-xs">
              <div class="p-3.5 rounded-xl bg-[#111827]/70 border border-white/5 flex items-center justify-between">
                <span class="text-slate-400 font-mono">System Health</span>
                <span class="px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] font-bold font-mono">
                  ${system_health.status}
                </span>
              </div>

              <div class="p-3.5 rounded-xl bg-[#111827]/70 border border-white/5 flex items-center justify-between">
                <span class="text-slate-400 font-mono">Database Engine</span>
                <span class="text-white font-mono font-medium">${system_health.database_engine}</span>
              </div>

              <div class="p-3.5 rounded-xl bg-[#111827]/70 border border-white/5 flex items-center justify-between">
                <span class="text-slate-400 font-mono">AI Service Configuration</span>
                <span class="text-[#22D3EE] font-mono font-medium text-right">${system_health.ai_service_status}</span>
              </div>

              <div class="p-3.5 rounded-xl bg-[#111827]/70 border border-white/5 flex items-center justify-between">
                <span class="text-slate-400 font-mono">Document Storage</span>
                <span class="text-slate-200 font-mono">${system_health.storage_usage_mb} MB in ${system_health.storage_provider}</span>
              </div>
            </div>
          </div>

          <!-- Quick Owner Actions -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
            <div>
              <h3 class="text-base font-bold text-white flex items-center gap-2 mb-2">
                <i data-lucide="shield-check" class="w-5 h-5 text-[#EF4444]"></i>
                Super Admin Security & Controls
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed mb-4">
                You are authenticated as the permanent website owner. All administrative changes are recorded in the immutable audit log.
              </p>

              <div class="space-y-2">
                <a href="#admin/users" class="p-3.5 rounded-xl bg-[#111827]/60 hover:bg-[#111827] border border-white/5 flex items-center justify-between text-xs text-slate-200 transition">
                  <span class="flex items-center gap-2"><i data-lucide="user-check" class="w-4 h-4 text-[#22C55E]"></i> Approve Recruiter Verification</span>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
                </a>
                <a href="#admin/monitor" class="p-3.5 rounded-xl bg-[#111827]/60 hover:bg-[#111827] border border-white/5 flex items-center justify-between text-xs text-slate-200 transition">
                  <span class="flex items-center gap-2"><i data-lucide="rotate-cw" class="w-4 h-4 text-[#F59E0B]"></i> Inspect Pipeline / Retry Failed Jobs (${metrics.failed_processing_jobs})</span>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
                </a>
                <a href="#admin/roles" class="p-3.5 rounded-xl bg-[#111827]/60 hover:bg-[#111827] border border-white/5 flex items-center justify-between text-xs text-slate-200 transition">
                  <span class="flex items-center gap-2"><i data-lucide="edit-3" class="w-4 h-4 text-[#7C5CFC]"></i> Manage Career Roles & Requirements</span>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
                </a>
              </div>
            </div>

            <div class="pt-4 border-t border-white/5 text-[11px] font-mono text-slate-500 text-center">
              Active Session: Owner Authorized
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
