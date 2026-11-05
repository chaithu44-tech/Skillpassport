import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderAdminAiMonitorPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#EF4444]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  const loadAndRender = async () => {
    try {
      const resumes = await api.get('/admin/resumes/monitor');

      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono text-[#EF4444] font-bold mb-1">
                <span>SUPER ADMIN</span>
                <span>•</span>
                <span class="text-slate-400">PIPELINE MONITOR</span>
              </div>
              <h1 class="text-3xl font-extrabold text-white font-heading">AI & Resume Processing Monitor</h1>
              <p class="text-sm text-slate-400 mt-1">Inspect multi-page document extractions, AI provider latency, error logs, and retry failed jobs.</p>
            </div>
            <a href="#admin/dashboard" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">
              Back to Overview
            </a>
          </div>

          <!-- Pipeline Table -->
          <div class="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#111827] text-slate-400 uppercase font-mono border-b border-white/5">
                  <tr>
                    <th class="py-3 px-4">Document / Student</th>
                    <th class="py-3 px-4">Format / Size</th>
                    <th class="py-3 px-4">Pages</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4">AI Provider</th>
                    <th class="py-3 px-4">Timestamp</th>
                    <th class="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${resumes.map(r => `
                    <tr class="hover:bg-white/[0.02] transition">
                      <td class="py-3 px-4">
                        <div class="font-bold text-white">${r.file_name}</div>
                        <div class="text-[11px] text-slate-400 font-mono">Student: ${r.student_name} (ID: ${r.student_id})</div>
                        ${r.error_message ? `<div class="text-[11px] text-[#EF4444] font-mono mt-0.5">Error: ${r.error_message}</div>` : ''}
                      </td>
                      <td class="py-3 px-4 font-mono">
                        <span class="text-white uppercase font-bold">${r.file_type}</span>
                        <span class="text-slate-400 text-[11px]"> · ${(r.file_size / 1024).toFixed(1)} KB</span>
                      </td>
                      <td class="py-3 px-4 font-mono text-slate-300">
                        ${r.page_count}
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${r.upload_status === 'parsed' ? 'bg-[#22C55E]/15 text-[#22C55E]' : (r.upload_status === 'failed' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#F59E0B]/15 text-[#F59E0B]')}">
                          ${r.upload_status}
                        </span>
                      </td>
                      <td class="py-3 px-4 font-mono text-[11px] text-[#22D3EE]">
                        ${r.ai_provider || 'Pending'}
                      </td>
                      <td class="py-3 px-4 text-slate-400 font-mono">
                        ${r.created_at}
                      </td>
                      <td class="py-3 px-4 text-right">
                        <button data-retry-resume-id="${r.id}" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition inline-flex items-center gap-1">
                          <i data-lucide="rotate-cw" class="w-3 h-3 text-[#22D3EE]"></i>
                          <span>Retry</span>
                        </button>
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

      // Retry Action Handler
      document.querySelectorAll('[data-retry-resume-id]').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute('data-retry-resume-id');
          btn.disabled = true;
          try {
            await api.post(`/admin/resumes/${id}/retry`);
            toast.success('Resume processing retried and completed.');
            await loadAndRender();
          } catch (err) {
            toast.error(err.message, 'Retry Failed');
            btn.disabled = false;
          }
        };
      });

    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  await loadAndRender();
}
