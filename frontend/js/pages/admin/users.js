import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderAdminUsersPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#EF4444]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  let roleFilter = 'all';
  let searchQuery = '';

  const loadAndRender = async () => {
    try {
      const users = await api.get('/admin/users', { role: roleFilter, query: searchQuery });

      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono text-[#EF4444] font-bold mb-1">
                <span>SUPER ADMIN</span>
                <span>•</span>
                <span class="text-slate-400">USER DIRECTORY</span>
              </div>
              <h1 class="text-3xl font-extrabold text-white font-heading">User Management</h1>
              <p class="text-sm text-slate-400 mt-1">Search registered students and recruiters, approve company verification, or manage access.</p>
            </div>
            <a href="#admin/dashboard" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">
              Back to Overview
            </a>
          </div>

          <!-- Filter Toolbar -->
          <div class="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button class="role-tab px-3 py-1.5 rounded-lg text-xs font-semibold transition ${roleFilter === 'all' ? 'bg-[#EF4444] text-white' : 'text-slate-400 hover:text-white'}" data-role="all">All</button>
              <button class="role-tab px-3 py-1.5 rounded-lg text-xs font-semibold transition ${roleFilter === 'student' ? 'bg-[#EF4444] text-white' : 'text-slate-400 hover:text-white'}" data-role="student">Students</button>
              <button class="role-tab px-3 py-1.5 rounded-lg text-xs font-semibold transition ${roleFilter === 'recruiter' ? 'bg-[#EF4444] text-white' : 'text-slate-400 hover:text-white'}" data-role="recruiter">Recruiters</button>
            </div>

            <div class="relative w-full sm:w-72">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input type="text" id="user-search" value="${searchQuery}" placeholder="Search by email..." class="w-full pl-9 pr-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#EF4444]" />
            </div>
          </div>

          <!-- Users Table -->
          <div class="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#111827] text-slate-400 uppercase font-mono border-b border-white/5">
                  <tr>
                    <th class="py-3 px-4">User</th>
                    <th class="py-3 px-4">Role</th>
                    <th class="py-3 px-4">Extra Info</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4">Verification</th>
                    <th class="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${users.map(u => `
                    <tr class="hover:bg-white/[0.02] transition">
                      <td class="py-3 px-4">
                        <div class="font-bold text-white">${u.name}</div>
                        <div class="text-[11px] text-slate-400 font-mono">${u.email}</div>
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${u.role === 'admin' ? 'bg-[#EF4444]/20 text-[#EF4444]' : (u.role === 'recruiter' ? 'bg-[#22D3EE]/20 text-[#22D3EE]' : 'bg-[#7C5CFC]/20 text-[#7C5CFC]')}">
                          ${u.role}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-slate-300">
                        ${u.extra.company ? `<div class="font-medium text-white">${u.extra.company}</div>` : ''}
                        ${u.extra.college ? `<div>${u.extra.college}</div>` : ''}
                        ${u.extra.selected_role ? `<div class="text-[#22D3EE] font-mono">Role: ${u.extra.selected_role} (${Math.round(u.extra.readiness_score || 0)}%)</div>` : ''}
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${u.is_active ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#EF4444]/15 text-[#EF4444]'}">
                          ${u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td class="py-3 px-4">
                        ${u.role === 'recruiter' ? `
                          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${u.extra.is_verified ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'}">
                            ${u.extra.is_verified ? 'VERIFIED' : 'PENDING APPROVAL'}
                          </span>
                        ` : '<span class="text-slate-600 font-mono">—</span>'}
                      </td>
                      <td class="py-3 px-4 text-right space-x-2">
                        ${u.role === 'recruiter' ? `
                          <button data-verify-user-id="${u.id}" data-current-verified="${u.extra.is_verified}" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold ${u.extra.is_verified ? 'text-slate-400' : 'text-[#22C55E]'} transition">
                            ${u.extra.is_verified ? 'Revoke Verify' : 'Approve Verify'}
                          </button>
                        ` : ''}

                        ${u.role !== 'admin' ? `
                          <button data-toggle-active-id="${u.id}" data-current-active="${u.is_active}" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold ${u.is_active ? 'text-[#EF4444]' : 'text-[#22C55E]'} transition">
                            ${u.is_active ? 'Suspend' : 'Reactivate'}
                          </button>
                        ` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Filter tabs
      document.querySelectorAll('.role-tab').forEach(t => {
        t.onclick = () => {
          roleFilter = t.getAttribute('data-role');
          loadAndRender();
        };
      });

      // Search input
      const sInput = document.getElementById('user-search');
      if (sInput) {
        sInput.onkeydown = (e) => {
          if (e.key === 'Enter') {
            searchQuery = e.target.value.trim();
            loadAndRender();
          }
        };
      }

      // Verify toggle
      document.querySelectorAll('[data-verify-user-id]').forEach(btn => {
        btn.onclick = async () => {
          const userId = btn.getAttribute('data-verify-user-id');
          const current = btn.getAttribute('data-current-verified') === 'true';
          try {
            await api.patch(`/admin/users/${userId}/status`, {
              is_verified: !current,
              verification_notes: !current ? 'Verified directly by website owner.' : 'Verification revoked by owner.'
            });
            toast.success('Recruiter verification status updated.');
            await loadAndRender();
          } catch (err) {
            toast.error(err.message);
          }
        };
      });

      // Active toggle
      document.querySelectorAll('[data-toggle-active-id]').forEach(btn => {
        btn.onclick = async () => {
          const userId = btn.getAttribute('data-toggle-active-id');
          const current = btn.getAttribute('data-current-active') === 'true';
          try {
            await api.patch(`/admin/users/${userId}/status`, {
              is_active: !current
            });
            toast.info(`User account ${!current ? 'reactivated' : 'suspended'}.`);
            await loadAndRender();
          } catch (err) {
            toast.error(err.message);
          }
        };
      });

    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  await loadAndRender();
}
