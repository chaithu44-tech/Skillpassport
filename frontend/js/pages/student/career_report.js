import { api } from '../../api.js';
import { renderRadialGauge } from '../../components/charts.js';

export async function renderCareerReportPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const data = await api.get('/student/career-analysis');
    if (!data.has_selected_role || !data.analysis) {
      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-xl mx-auto w-full text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <i data-lucide="target" class="w-8 h-8"></i>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">No Target Role Selected</h2>
          <p class="text-sm text-slate-400 mb-6">Choose your desired career role to unlock your customized compatibility and gap analysis.</p>
          <a href="#student/role-selection" class="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-sm shadow-lg shadow-[#7C5CFC]/20 inline-flex items-center gap-2">
            <span>Select Career Role</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const { role, student_preferences, analysis } = data;
    const {
      compatibility_score, score_explanation, matched_skills, related_skills,
      missing_skills, career_readiness, what_student_can_achieve, recommendations
    } = analysis;

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-[#7C5CFC] font-semibold mb-1">
              <span>ROLE-BASED CAREER COMPATIBILITY</span>
              <span>•</span>
              <span class="text-slate-400 font-mono">${role.category}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white font-heading">${role.title} Intelligence Report</h1>
            <p class="text-sm text-slate-400 mt-1">
              Evaluated for <strong>${student_preferences.career_goal}</strong> readiness over a <strong>${student_preferences.preparation_timeline}</strong> preparation horizon.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a href="#student/role-selection" class="px-4 py-2.5 rounded-xl border border-white/10 bg-[#172033] hover:bg-white/5 text-slate-200 text-xs font-semibold transition flex items-center gap-2">
              <i data-lucide="shuffle" class="w-4 h-4 text-slate-400"></i>
              <span>Change Role</span>
            </a>
            <a href="#student/roadmap" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition flex items-center gap-2">
              <i data-lucide="milestone" class="w-4 h-4"></i>
              <span>Open Learning Roadmap</span>
            </a>
          </div>
        </div>

        <!-- Compatibility & Gap Cards Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Compatibility Gauge -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <span class="text-xs font-mono uppercase text-slate-400 mb-3">Role Compatibility</span>
            ${renderRadialGauge({ score: compatibility_score, size: 160, strokeWidth: 12, label: 'Compatibility', sublabel: career_readiness })}
            <div class="mt-4 px-3 py-1 rounded-full text-xs font-bold ${compatibility_score >= 80 ? 'bg-[#22C55E]/20 text-[#22C55E]' : (compatibility_score >= 60 ? 'bg-[#22D3EE]/20 text-[#22D3EE]' : 'bg-[#EF4444]/20 text-[#EF4444]')}">
              Readiness: ${career_readiness}
            </div>
            <p class="text-[11px] text-slate-400 mt-3 leading-relaxed max-w-xs">
              ${score_explanation}
            </p>
          </div>

          <!-- Matched Skills (Verified) -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <span class="text-xs font-mono uppercase text-[#22C55E] font-bold flex items-center gap-1.5">
                  <i data-lucide="check-circle" class="w-4 h-4"></i>
                  Skills Already Matched (${matched_skills.length})
                </span>
              </div>
              <p class="text-xs text-slate-400 mb-3">Competencies present in your resume or verified profile:</p>
              <div class="flex flex-wrap gap-1.5">
                ${matched_skills.length ? matched_skills.map(s => `
                  <span class="px-2.5 py-1 text-xs rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] font-medium flex items-center gap-1">
                    <i data-lucide="check" class="w-3 h-3"></i> ${s}
                  </span>
                `).join('') : '<span class="text-xs text-slate-500 italic">No direct matches identified yet.</span>'}
              </div>
            </div>

            ${related_skills.length ? `
              <div class="mt-4 pt-3 border-t border-white/5">
                <span class="text-[11px] font-mono text-slate-400 block mb-1.5">Related Competencies:</span>
                <div class="flex flex-wrap gap-1">
                  ${related_skills.map(s => `<span class="px-2 py-0.5 text-[11px] rounded bg-white/5 text-slate-300 font-mono">${s}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Missing Skills (Skill Gap) -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <span class="text-xs font-mono uppercase text-[#EF4444] font-bold flex items-center gap-1.5">
                  <i data-lucide="alert-octagon" class="w-4 h-4"></i>
                  Missing Skills Gap (${missing_skills.length})
                </span>
              </div>
              <p class="text-xs text-slate-400 mb-3">Required skills to focus on during your roadmap preparation:</p>
              <div class="flex flex-wrap gap-1.5">
                ${missing_skills.length ? missing_skills.map(s => `
                  <span class="px-2.5 py-1 text-xs rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] font-medium flex items-center gap-1">
                    <i data-lucide="plus" class="w-3 h-3"></i> ${s}
                  </span>
                `).join('') : '<span class="text-xs text-[#22C55E] font-medium">All core role skills satisfied!</span>'}
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500 font-mono">
              These missing skills are automatically integrated into your custom action plan.
            </div>
          </div>
        </div>

        <!-- What Can the Student Achieve Breakdown -->
        <div class="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center">
              <i data-lucide="trending-up" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white font-heading">What Can You Achieve Right Now?</h3>
              <p class="text-xs text-slate-400">Realistic placement readiness breakdown based solely on current skill evidence</p>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-[#111827]/80 border border-white/5 text-xs text-slate-300 leading-relaxed">
            ${what_student_can_achieve.narrative}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-4 rounded-2xl bg-[#111827]/60 border border-[#22C55E]/20">
              <span class="text-xs font-mono uppercase text-[#22C55E] font-bold block mb-2">Ready to Apply Today</span>
              <ul class="space-y-1.5 text-xs text-slate-300">
                ${what_student_can_achieve.roles_ready_to_apply.map(r => `
                  <li class="flex items-center gap-2">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-[#22C55E]"></i>
                    <span>${r}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="p-4 rounded-2xl bg-[#111827]/60 border border-[#22D3EE]/20">
              <span class="text-xs font-mono uppercase text-[#22D3EE] font-bold block mb-2">Requires Preparation</span>
              <ul class="space-y-1.5 text-xs text-slate-300">
                ${what_student_can_achieve.roles_requiring_preparation.map(r => `
                  <li class="flex items-center gap-2">
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-[#22D3EE]"></i>
                    <span>${r}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="p-4 rounded-2xl bg-[#111827]/60 border border-[#7C5CFC]/20">
              <span class="text-xs font-mono uppercase text-[#7C5CFC] font-bold block mb-2">Long-Term Career Goal</span>
              <ul class="space-y-1.5 text-xs text-slate-300">
                ${what_student_can_achieve.long_term_goals.map(r => `
                  <li class="flex items-center gap-2">
                    <i data-lucide="star" class="w-3.5 h-3.5 text-[#7C5CFC]"></i>
                    <span>${r}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          <div class="text-[11px] text-slate-500 border-t border-white/5 pt-3 italic">
            ${what_student_can_achieve.disclaimer}
          </div>
        </div>

        <!-- Personalized Recommendations -->
        <div class="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center">
              <i data-lucide="lightbulb" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white font-heading">Personalized Action Recommendations</h3>
              <p class="text-xs text-slate-400">Tailored to your ${student_preferences.preparation_timeline} preparation timeline</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Recommended Projects -->
            <div class="p-5 rounded-2xl bg-[#111827]/60 border border-white/5 space-y-3">
              <span class="text-xs font-mono uppercase text-white font-bold block flex items-center gap-2">
                <i data-lucide="folder-code" class="w-4 h-4 text-[#22D3EE]"></i>
                Portfolio Projects to Build
              </span>
              <ul class="space-y-2 text-xs text-slate-300">
                ${recommendations.recommended_projects.map(p => `
                  <li class="p-2.5 rounded-lg bg-white/5 border border-white/5 leading-snug">
                    ${p}
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Technical Interview Topics -->
            <div class="p-5 rounded-2xl bg-[#111827]/60 border border-white/5 space-y-3">
              <span class="text-xs font-mono uppercase text-white font-bold block flex items-center gap-2">
                <i data-lucide="help-circle" class="w-4 h-4 text-[#7C5CFC]"></i>
                Interview Topics to Master
              </span>
              <ul class="space-y-2 text-xs text-slate-300">
                ${recommendations.interview_preparation_topics.map(t => `
                  <li class="p-2.5 rounded-lg bg-white/5 border border-white/5 leading-snug">
                    ${t}
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          <!-- Bottom Action -->
          <div class="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-400">
              Pacing recommendation: <strong>${recommendations.suggested_pacing}</strong>
            </div>
            <a href="#student/roadmap" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-sm shadow-xl shadow-[#7C5CFC]/25 hover:opacity-95 transition flex items-center gap-2">
              <span>Follow Personalized Learning Roadmap</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
