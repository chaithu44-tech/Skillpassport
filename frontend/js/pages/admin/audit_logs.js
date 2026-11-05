import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderAdminAuditLogsPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#EF4444]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const [logs, settingsList] = await Promise.all([
      api.get('/admin/audit-logs'),
      api.get('/admin/settings')
    ]);

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-[#EF4444] font-bold mb-1">
              <span>SUPER ADMIN</span>
              <span>•</span>
              <span class="text-slate-400">SECURITY AUDIT & SETTINGS</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white font-heading">Audit Trail & Platform Settings</h1>
            <p class="text-sm text-slate-400 mt-1">Review security events and configure platform-wide parameters.</p>
          </div>
          <a href="#admin/dashboard" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">
            Back to Overview
          </a>
        </div>

        <!-- Platform Settings Editor -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="sliders" class="w-5 h-5 text-[#22D3EE]"></i>
            Platform Settings
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${settingsList.map(s => `
              <div class="p-4 rounded-xl bg-[#111827]/70 border border-white/5 space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-mono font-bold text-white uppercase">${s.key}</span>
                  <span class="text-slate-500 text-[10px]">${s.description || ''}</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="text" data-setting-key="${s.key}" value="${s.value}" class="flex-1 px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#EF4444]" />
                  <button data-save-setting-key="${s.key}" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition">
                    Save
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Immutable Audit Trail -->
        <div class="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl space-y-4 p-6">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="shield" class="w-5 h-5 text-[#EF4444]"></i>
            Immutable Security & Activity Audit Log
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#111827] text-slate-400 uppercase font-mono border-b border-white/5">
                <tr>
                  <th class="py-3 px-4">Action</th>
                  <th class="py-3 px-4">User</th>
                  <th class="py-3 px-4">Resource</th>
                  <th class="py-3 px-4">Details</th>
                  <th class="py-3 px-4">IP</th>
                  <th class="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                ${logs.map(l => `
                  <tr class="hover:bg-white/[0.02] transition font-mono">
                    <td class="py-3 px-4 text-[#EF4444] font-bold">${l.action}</td>
                    <td class="py-3 px-4 text-slate-300 font-sans">${l.user_email}</td>
                    <td class="py-3 px-4 text-slate-400">${l.resource_type || '—'} ${l.resource_id ? `#${l.resource_id}` : ''}</td>
                    <td class="py-3 px-4 text-slate-400 max-w-xs truncate">${JSON.stringify(l.details || {})}</td>
                    <td class="py-3 px-4 text-slate-500">${l.ip_address || 'local'}</td>
                    <td class="py-3 px-4 text-slate-400">${l.timestamp}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach setting save handlers
    document.querySelectorAll('[data-save-setting-key]').forEach(btn => {
      btn.onclick = async () => {
        const key = btn.getAttribute('data-save-setting-key');
        const input = document.querySelector(`input[data-setting-key="${key}"]`);
        if (!input) return;
        const val = input.value.trim();

        try {
          await api.put('/admin/settings', {
            setting_key: key,
            setting_value: val
          });
          toast.success(`Platform setting '${key}' updated.`);
        } catch (err) {
          toast.error(err.message);
        }
      };
    });

  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
