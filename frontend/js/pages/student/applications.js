import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderStudentApplicationsPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  let activeFilter = 'all';

  const loadAndRender = async () => {
    try {
      const data = await api.get('/opportunities/tracker/my-applications');
      const { applications, summary } = data;

      const filtered = applications.filter(a => {
        if (activeFilter === 'all') return true;
        return a.status === activeFilter;
      });

      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-8">
          <!-- Header -->
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono text-[#7C5CFC] font-semibold mb-1">
                <span>OPPORTUNITIES PIPELINE</span>
                <span>•</span>
                <span class="text-slate-400">PERSONAL APPLICATION TRACKER</span>
              </div>
              <h1 class="text-3xl font-extrabold text-white font-heading">Application Tracker</h1>
              <p class="text-sm text-slate-400 mt-1">Track your internship & job submissions, recruiter shortlists, and upcoming interviews.</p>
            </div>

            <a href="#opportunities" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Browse New Opportunities</span>
            </a>
          </div>

          <!-- Status Counts Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            ${[
              { key: 'all', label: 'Total', count: summary.total, color: 'text-white' },
              { key: 'saved', label: 'Saved', count: summary.saved, color: 'text-slate-400' },
              { key: 'applied', label: 'Applied', count: summary.applied, color: 'text-[#22D3EE]' },
              { key: 'under_review', label: 'Under Review', count: summary.under_review, color: 'text-[#F59E0B]' },
              { key: 'shortlisted', label: 'Shortlisted', count: summary.shortlisted, color: 'text-[#7C5CFC]' },
              { key: 'interview_scheduled', label: 'Interview', count: summary.interview_scheduled, color: 'text-[#22C55E]' },
              { key: 'rejected', label: 'Archived', count: summary.rejected, color: 'text-[#EF4444]' }
            ].map(col => `
              <button data-filter="${col.key}" class="status-tab p-3.5 rounded-xl border text-left transition ${activeFilter === col.key ? 'bg-[#172033] border-[#7C5CFC] shadow-lg shadow-[#7C5CFC]/10' : 'bg-[#111827]/60 border-white/5 hover:border-white/10'}">
                <span class="text-[10px] font-mono uppercase text-slate-400 block">${col.label}</span>
                <span class="text-xl font-black font-mono ${col.color} block mt-0.5">${col.count}</span>
              </button>
            `).join('')}
          </div>

          <!-- Applications List -->
          <div class="space-y-4">
            ${filtered.length === 0 ? `
              <div class="glass-panel p-12 rounded-3xl border border-white/5 text-center text-slate-400">
                <i data-lucide="inbox" class="w-12 h-12 text-slate-600 mx-auto mb-3"></i>
                <h4 class="text-base font-bold text-white mb-1">No Applications In This Category</h4>
                <p class="text-xs text-slate-500 mb-4">Start applying to verified opportunities that align with your skillset.</p>
                <a href="#opportunities" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold">Explore Opportunities</a>
              </div>
            ` : filtered.map(app => {
              let statusBadge = '';
              if (app.status === 'interview_scheduled') {
                statusBadge = '<span class="px-2.5 py-1 text-xs rounded-lg bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-bold font-mono">INTERVIEW SCHEDULED</span>';
              } else if (app.status === 'shortlisted') {
                statusBadge = '<span class="px-2.5 py-1 text-xs rounded-lg bg-[#7C5CFC]/20 text-[#7C5CFC] border border-[#7C5CFC]/30 font-bold font-mono">SHORTLISTED</span>';
              } else if (app.status === 'under_review') {
                statusBadge = '<span class="px-2.5 py-1 text-xs rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 font-bold font-mono">UNDER REVIEW</span>';
              } else if (app.status === 'saved') {
                statusBadge = '<span class="px-2.5 py-1 text-xs rounded-lg bg-white/10 text-slate-300 font-mono">SAVED</span>';
              } else if (app.status === 'rejected') {
                statusBadge = '<span class="px-2.5 py-1 text-xs rounded-lg bg-[#EF4444]/20 text-[#EF4444] font-mono">REJECTED</span>';
              } else {
                statusBadge = '<span class="px-2.5 py-1 text-xs rounded-lg bg-[#22D3EE]/20 text-[#22D3EE] font-mono">APPLIED</span>';
              }

              return `
                <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-base font-bold text-white">${app.title}</h3>
                        <span class="px-2 py-0.5 text-[10px] rounded bg-white/5 text-slate-400 font-mono uppercase">${app.opportunity_type}</span>
                      </div>
                      <div class="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <strong class="text-white">${app.company}</strong>
                        <span>•</span>
                        <span>${app.location} (${app.work_mode})</span>
                        ${app.stipend_or_salary ? `<span>•</span> <span class="text-[#22C55E] font-medium">${app.stipend_or_salary}</span>` : ''}
                        <span>•</span>
                        <span>Applied on: ${app.applied_at}</span>
                      </div>
                    </div>
                    <div>${statusBadge}</div>
                  </div>

                  <!-- Scheduled Interviews if any -->
                  ${(app.interviews && app.interviews.length) ? `
                    <div class="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 space-y-2">
                      <div class="text-xs font-bold text-[#22C55E] flex items-center gap-2">
                        <i data-lucide="calendar" class="w-4 h-4"></i>
                        <span>Upcoming Interview Scheduled</span>
                      </div>
                      ${app.interviews.map(i => `
                        <div class="text-xs text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <strong>${i.interview_type.toUpperCase()} Round</strong> · ${new Date(i.scheduled_time).toLocaleString()} (${i.duration_minutes} min)
                          </div>
                          ${i.meeting_link ? `
                            <a href="${i.meeting_link}" target="_blank" class="px-3 py-1 rounded-lg bg-[#22C55E] hover:opacity-90 text-[#0B0F19] font-bold text-xs inline-flex items-center gap-1.5 self-start sm:self-auto">
                              <i data-lucide="video" class="w-3.5 h-3.5"></i>
                              <span>Join Meeting Link</span>
                            </a>
                          ` : ''}
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}

                  <!-- Notes and Status Update Actions -->
                  <div class="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div class="text-slate-400">
                      ${app.notes ? `<span class="italic">Notes: "${app.notes}"</span>` : '<span class="text-slate-600">No notes recorded</span>'}
                    </div>

                    <div class="flex items-center gap-2">
                      <button data-edit-notes-id="${app.application_id}" data-notes="${encodeURIComponent(app.notes || '')}" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold transition">
                        Update Notes
                      </button>
                      <a href="#opportunities/${app.opportunity_id}" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#22D3EE] font-semibold transition">
                        View Opening
                      </a>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Filter tabs
      document.querySelectorAll('.status-tab').forEach(tab => {
        tab.onclick = () => {
          activeFilter = tab.getAttribute('data-filter');
          loadAndRender();
        };
      });

      // Update notes buttons
      document.querySelectorAll('[data-edit-notes-id]').forEach(btn => {
        btn.onclick = async () => {
          const appId = btn.getAttribute('data-edit-notes-id');
          const currentNotes = decodeURIComponent(btn.getAttribute('data-notes'));
          const newNotes = prompt('Enter your personal notes for this application:', currentNotes);
          if (newNotes !== null) {
            try {
              await api.patch(`/opportunities/tracker/applications/${appId}`, {
                status: 'applied',
                notes: newNotes
              });
              toast.success('Application notes updated.');
              await loadAndRender();
            } catch (err) {
              toast.error(err.message);
            }
          }
        };
      });

    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  await loadAndRender();
}
