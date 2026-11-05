import { api } from '../../api.js';
import { appState } from '../../state.js';
import { renderRadialGauge, renderProgressBar } from '../../components/charts.js';

export async function renderStudentDashboard(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const data = await api.get('/student/dashboard');
    const { student, resume_status, skills_summary, roadmap_progress, recommended_opportunities, recent_notifications } = data;

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Top Welcome Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-[#7C5CFC] font-semibold mb-1">
              <span>STUDENT INTELLIGENCE PORTAL</span>
              <span>•</span>
              <span class="text-slate-400">${student.college || 'College Student'}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white font-heading">Welcome back, ${student.full_name}!</h1>
            <p class="text-sm text-slate-400 mt-1">Here is your real-time career readiness and roadmap intelligence.</p>
          </div>

          <div class="flex items-center gap-3">
            <a href="#student/resume" class="px-4 py-2.5 rounded-xl border border-white/10 bg-[#172033] hover:bg-white/5 text-slate-200 text-sm font-semibold transition flex items-center gap-2">
              <i data-lucide="upload-cloud" class="w-4 h-4 text-[#7C5CFC]"></i>
              <span>${resume_status.has_resume ? 'Manage Resume' : 'Upload Resume'}</span>
            </a>
            <a href="#student/role-selection" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-sm font-bold shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition flex items-center gap-2">
              <i data-lucide="target" class="w-4 h-4"></i>
              <span>${student.selected_role ? 'Switch Target Role' : 'Select Target Role'}</span>
            </a>
          </div>
        </div>

        <!-- Metric Cards Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- 1. Career Readiness -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-mono uppercase text-slate-400">Career Readiness</span>
              <span class="px-2.5 py-1 text-xs font-bold rounded-lg ${student.readiness_score >= 65 ? 'bg-[#22C55E]/20 text-[#22C55E]' : (student.readiness_score >= 40 ? 'bg-[#22D3EE]/20 text-[#22D3EE]' : 'bg-[#EF4444]/20 text-[#EF4444]')}">
                ${student.readiness_level || 'Beginner'}
              </span>
            </div>
            <div class="flex items-center justify-center my-2">
              ${renderRadialGauge({ score: student.readiness_score || 0, size: 140, strokeWidth: 10, sublabel: student.selected_role || 'Target' })}
            </div>
            <div class="text-center text-xs text-slate-400 mt-2">
              ${student.selected_role ? `Evaluated for <strong>${student.selected_role}</strong>` : 'Select a target role to calculate'}
            </div>
          </div>

          <!-- 2. Skills Profile -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-mono uppercase text-slate-400">Verified Skills</span>
                <i data-lucide="cpu" class="w-4 h-4 text-[#7C5CFC]"></i>
              </div>
              <div class="text-3xl font-black text-white font-mono mt-1">${skills_summary.total_skills}</div>
              <div class="text-xs text-slate-400 mt-1">
                ${skills_summary.resume_extracted} extracted from resume · ${skills_summary.manual_added} added manually
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-white/5">
              <div class="text-xs font-semibold text-slate-300 mb-2">Top Missing Skills:</div>
              <div class="flex flex-wrap gap-1.5">
                ${(skills_summary.missing_skills && skills_summary.missing_skills.length)
                  ? skills_summary.missing_skills.map(s => `<span class="px-2 py-0.5 text-[11px] font-mono rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20">${s}</span>`).join('')
                  : '<span class="text-xs text-slate-500">None identified or role not selected</span>'
                }
              </div>
            </div>
          </div>

          <!-- 3. Learning Roadmap Progress -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-mono uppercase text-slate-400">Roadmap Progress</span>
                <i data-lucide="milestone" class="w-4 h-4 text-[#22D3EE]"></i>
              </div>
              <div class="text-3xl font-black text-white font-mono mt-1">${Math.round(roadmap_progress.progress_percentage)}%</div>
              <div class="text-xs text-slate-400 mt-1">
                ${roadmap_progress.completed_phases} of ${roadmap_progress.total_phases} learning activities completed
              </div>
            </div>

            <div class="mt-4">
              ${renderProgressBar({ percentage: roadmap_progress.progress_percentage, height: 'h-2.5', color: 'bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE]' })}
              <a href="#student/roadmap" class="inline-block mt-3 text-xs text-[#22D3EE] font-semibold hover:underline">Continue Roadmap &rarr;</a>
            </div>
          </div>

          <!-- 4. Resume Processing Status -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-mono uppercase text-slate-400">Resume Health</span>
                <i data-lucide="file-check" class="w-4 h-4 text-[#22C55E]"></i>
              </div>
              <div class="text-lg font-bold text-white mt-1 truncate">
                ${resume_status.has_resume ? resume_status.file_name : 'No Resume Uploaded'}
              </div>
              <div class="text-xs text-slate-400 mt-1">
                Status: <span class="capitalize text-slate-200 font-semibold">${resume_status.upload_status || 'Pending'}</span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-white/5">
              ${resume_status.has_resume
                ? `<a href="#student/analysis" class="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white block text-center transition">View AI Analysis Report</a>`
                : `<a href="#student/resume" class="w-full py-2 px-3 rounded-lg bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-xs font-semibold text-white block text-center transition">Upload Document Now</a>`
              }
            </div>
          </div>
        </div>

        <!-- Lower Grid: Recommended Opportunities & Notifications -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recommended Opportunities (2 Cols) -->
          <div class="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
            <div class="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div>
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <i data-lucide="sparkles" class="w-5 h-5 text-[#22D3EE]"></i>
                  Recommended Verified Opportunities
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">Matching your verified technical competencies</p>
              </div>
              <a href="#opportunities" class="text-xs text-[#22D3EE] font-semibold hover:underline">View All Opportunities &rarr;</a>
            </div>

            <div class="space-y-4">
              ${recommended_opportunities.length === 0 ? `
                <div class="text-center py-8 text-slate-500 text-sm">
                  No active opportunities match your exact skill profile yet. Explore all listings!
                </div>
              ` : recommended_opportunities.map(opp => `
                <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5 hover:border-white/10 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-white">${opp.title}</span>
                      <span class="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 text-slate-300 uppercase">${opp.opportunity_type}</span>
                    </div>
                    <div class="text-xs text-slate-400 flex items-center gap-3">
                      <span>${opp.company}</span>
                      <span>•</span>
                      <span>${opp.location}</span>
                      <span>•</span>
                      <span class="text-[#22C55E] font-medium">${opp.stipend_or_salary || 'Competitive'}</span>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-1">
                      ${opp.matched_skills.map(s => `<span class="px-1.5 py-0.2 text-[10px] rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">${s}</span>`).join('')}
                    </div>
                  </div>

                  <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span class="text-xs font-bold text-[#22D3EE] font-mono">${opp.match_percentage}% Match</span>
                    <a href="#opportunities/${opp.id}" class="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-semibold hover:opacity-90 transition">
                      Details
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Activity Notifications (1 Col) -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <h3 class="text-base font-bold text-white flex items-center gap-2">
                  <i data-lucide="bell" class="w-4 h-4 text-[#7C5CFC]"></i>
                  Recent Updates
                </h3>
                <a href="#notifications" class="text-xs text-slate-400 hover:text-white">All</a>
              </div>

              <div class="space-y-3">
                ${recent_notifications.length === 0 ? `
                  <p class="text-xs text-slate-500 py-6 text-center">No new notifications.</p>
                ` : recent_notifications.map(n => `
                  <div class="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <div class="font-semibold text-white mb-0.5">${n.title}</div>
                    <p class="text-slate-400 leading-snug">${n.message}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="pt-4 border-t border-white/5 mt-4 text-center">
              <a href="#student/applications" class="text-xs text-[#22D3EE] font-semibold hover:underline flex items-center justify-center gap-1">
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
                <span>Open Application Tracker</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `
      <div class="p-8 max-w-xl mx-auto text-center">
        <div class="w-12 h-12 rounded-full bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center mx-auto mb-4">
          <i data-lucide="alert-triangle" class="w-6 h-6"></i>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Failed to Load Dashboard</h3>
        <p class="text-sm text-slate-400 mb-4">${err.message}</p>
        <button onclick="window.location.reload()" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold">Retry</button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}
