import { api } from '../../api.js';

export async function renderRecruiterDashboard(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#22D3EE]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const data = await api.get('/recruiter/dashboard');
    const { recruiter_profile, stats, recent_interviews } = data;

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-[#22D3EE] font-semibold mb-1">
              <span>RECRUITER HIRING PORTAL</span>
              <span>•</span>
              <span class="text-white font-bold">${recruiter_profile.company_name}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white font-heading">Recruiter Talent Hub</h1>
            <p class="text-sm text-slate-400 mt-1">Manage postings, review matched college talent, and conduct interviews.</p>
          </div>

          <div class="flex items-center gap-3">
            <a href="#recruiter/post-job" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#7C5CFC] text-[#0B0F19] text-xs font-bold shadow-lg hover:opacity-95 transition flex items-center gap-2">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Post New Role</span>
            </a>
            <a href="#recruiter/applicants" class="px-4 py-2.5 rounded-xl border border-white/10 bg-[#172033] hover:bg-white/5 text-slate-200 text-xs font-semibold transition flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-[#22D3EE]"></i>
              <span>View Candidates</span>
            </a>
          </div>
        </div>

        <!-- Verification Notice if unverified -->
        ${!recruiter_profile.is_verified ? `
          <div class="p-5 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-4 text-xs text-[#F59E0B]">
            <i data-lucide="shield-alert" class="w-5 h-5 flex-shrink-0 mt-0.5"></i>
            <div>
              <strong class="font-bold text-white block text-sm mb-0.5">Recruiter Verification Pending</strong>
              Your account is currently queued for Super Admin review. Once confirmed, your published openings will appear in student feeds.
            </div>
          </div>
        ` : ''}

        <!-- Metrics Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-panel p-6 rounded-2xl border border-white/5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono uppercase text-slate-400">Active Postings</span>
              <i data-lucide="briefcase" class="w-4 h-4 text-[#22D3EE]"></i>
            </div>
            <div class="text-3xl font-black text-white font-mono mt-1">${stats.active_listings}</div>
            <div class="text-xs text-slate-400 mt-1">${stats.total_listings} total openings posted</div>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-white/5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono uppercase text-slate-400">Total Applicants</span>
              <i data-lucide="users" class="w-4 h-4 text-[#7C5CFC]"></i>
            </div>
            <div class="text-3xl font-black text-white font-mono mt-1">${stats.total_applications}</div>
            <div class="text-xs text-slate-400 mt-1">Students who applied directly</div>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-white/5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono uppercase text-slate-400">Shortlisted</span>
              <i data-lucide="user-check" class="w-4 h-4 text-[#22C55E]"></i>
            </div>
            <div class="text-3xl font-black text-white font-mono mt-1">${stats.shortlisted_candidates}</div>
            <div class="text-xs text-slate-400 mt-1">Ready for screening</div>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-white/5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono uppercase text-slate-400">Scheduled Interviews</span>
              <i data-lucide="calendar" class="w-4 h-4 text-[#F59E0B]"></i>
            </div>
            <div class="text-3xl font-black text-white font-mono mt-1">${stats.scheduled_interviews}</div>
            <div class="text-xs text-slate-400 mt-1">Active upcoming rounds</div>
          </div>
        </div>

        <!-- Recent Scheduled Interviews -->
        <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="calendar" class="w-5 h-5 text-[#22D3EE]"></i>
              Upcoming Candidate Interviews
            </h3>
            <a href="#recruiter/applicants" class="text-xs text-[#22D3EE] font-semibold hover:underline">Manage All &rarr;</a>
          </div>

          <div class="space-y-3">
            ${recent_interviews.length === 0 ? `
              <p class="text-xs text-slate-500 py-6 text-center">No interviews scheduled yet. Review your applicants to set up interviews.</p>
            ` : recent_interviews.map(i => `
              <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div class="font-bold text-white text-sm">${i.student_name}</div>
                  <div class="text-slate-400">${i.interview_type.toUpperCase()} · ${new Date(i.scheduled_time).toLocaleString()}</div>
                </div>
                ${i.meeting_link ? `
                  <a href="${i.meeting_link}" target="_blank" class="px-3 py-1.5 rounded-lg bg-[#22D3EE]/20 hover:bg-[#22D3EE]/30 text-[#22D3EE] font-bold text-xs inline-flex items-center gap-1.5">
                    <i data-lucide="video" class="w-3.5 h-3.5"></i>
                    <span>Open Meeting Link</span>
                  </a>
                ` : '<span class="text-slate-500 font-mono">No link</span>'}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
