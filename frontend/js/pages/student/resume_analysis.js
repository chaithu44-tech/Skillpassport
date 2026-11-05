import { api } from '../../api.js';
import { renderRadialGauge } from '../../components/charts.js';

export async function renderResumeAnalysisPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const data = await api.get('/student/resume');
    if (!data.has_resume || !data.analysis) {
      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-xl mx-auto w-full text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <i data-lucide="file-question" class="w-8 h-8"></i>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">No Resume Analysis Found</h2>
          <p class="text-sm text-slate-400 mb-6">Please upload your PDF or DOCX resume to generate your AI intelligence report.</p>
          <a href="#student/resume" class="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-sm shadow-lg shadow-[#7C5CFC]/20 inline-flex items-center gap-2">
            <i data-lucide="upload" class="w-4 h-4"></i>
            <span>Upload Resume Now</span>
          </a>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const { resume, analysis } = data;
    const { personal_info, technical_skills, other_info, quality_analysis, ai_provider_used } = analysis;

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Header & Action Bar -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-[#7C5CFC] font-semibold mb-1">
              <span>RESUME INTELLIGENCE REPORT</span>
              <span>•</span>
              <span class="text-slate-400 font-mono">${resume.file_name}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white font-heading">AI Resume Analysis</h1>
            <p class="text-sm text-slate-400 mt-1">
              Extracted from ${resume.page_count} page(s) · AI Model: <strong class="text-[#22D3EE]">${ai_provider_used}</strong>
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a href="#student/resume" class="px-4 py-2.5 rounded-xl border border-white/10 bg-[#172033] hover:bg-white/5 text-slate-200 text-xs font-semibold transition flex items-center gap-2">
              <i data-lucide="refresh-cw" class="w-4 h-4 text-slate-400"></i>
              <span>Replace Resume</span>
            </a>
            <a href="#student/role-selection" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition flex items-center gap-2">
              <span>Choose Career Role &rarr;</span>
            </a>
          </div>
        </div>

        <!-- Quality & ATS Overview Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- ATS Score Gauge -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <span class="text-xs font-mono uppercase text-slate-400 mb-3">ATS Readability Score</span>
            ${renderRadialGauge({ score: quality_analysis.ats_readability_score || 70, size: 150, strokeWidth: 12, label: 'ATS Score' })}
            <div class="mt-4 text-xs font-medium text-slate-300">
              Structure Rating: <span class="font-bold text-[#22C55E]">${quality_analysis.structure_rating || 'Good'}</span>
            </div>
          </div>

          <!-- Strong Points -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono uppercase text-[#22C55E] font-bold mb-3">
                <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                Identified Strengths
              </div>
              <ul class="space-y-2 text-xs text-slate-300">
                ${(quality_analysis.strong_points || ['Clear typography and recognizable sections']).map(sp => `
                  <li class="flex items-start gap-2">
                    <span class="text-[#22C55E] mt-0.5">•</span>
                    <span>${sp}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500">
              ${quality_analysis.keyword_density_summary || 'Keywords processed.'}
            </div>
          </div>

          <!-- Actionable Improvements -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono uppercase text-[#F59E0B] font-bold mb-3">
                <i data-lucide="alert-circle" class="w-4 h-4"></i>
                Improvement Suggestions
              </div>
              <ul class="space-y-2 text-xs text-slate-300">
                ${(quality_analysis.improvement_suggestions || ['Quantify project achievements with metrics']).map(sug => `
                  <li class="flex items-start gap-2">
                    <span class="text-[#F59E0B] mt-0.5">&rarr;</span>
                    <span>${sug}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            ${(quality_analysis.missing_sections && quality_analysis.missing_sections.length) ? `
              <div class="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#EF4444]">
                Missing: ${quality_analysis.missing_sections.join(', ')}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Personal Information Section -->
        <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="user" class="w-5 h-5 text-[#7C5CFC]"></i>
            Personal & Education Information
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5">Candidate Name</span>
              <strong class="text-white text-sm">${personal_info.name || 'Not found in resume'}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5">Email</span>
              <strong class="text-white text-sm font-mono">${personal_info.email || 'Not found in resume'}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5">Phone</span>
              <strong class="text-white text-sm font-mono">${personal_info.phone || 'Not found in resume'}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5">College / University</span>
              <strong class="text-white text-sm">${personal_info.college || 'Not found in resume'}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5">Degree / Branch</span>
              <strong class="text-white text-sm">${personal_info.degree || 'Not found in resume'}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5">Graduation Year</span>
              <strong class="text-white text-sm font-mono">${personal_info.graduation_year || 'Not found in resume'}</strong>
            </div>
          </div>
        </div>

        <!-- Technical Skills Categorized -->
        <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="cpu" class="w-5 h-5 text-[#22D3EE]"></i>
            Extracted Technical Competencies
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${Object.entries(technical_skills).map(([category, skills]) => `
              <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5">
                <div class="text-xs font-mono uppercase text-[#7C5CFC] font-bold mb-3 flex items-center justify-between">
                  <span>${category}</span>
                  <span class="text-slate-500 font-normal">(${skills.length})</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  ${skills.length ? skills.map(s => `
                    <span class="px-2.5 py-1 text-xs rounded-lg bg-[#172033] border border-white/10 text-white font-medium hover:border-[#7C5CFC]/40 transition">
                      ${s}
                    </span>
                  `).join('') : '<span class="text-xs text-slate-500 italic">None found in resume</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Projects & Experience -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Projects -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="folder-git-2" class="w-5 h-5 text-[#22C55E]"></i>
              Projects Documented (${other_info.projects ? other_info.projects.length : 0})
            </h3>
            <div class="space-y-3">
              ${(other_info.projects && other_info.projects.length) ? other_info.projects.map(p => `
                <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5 space-y-1.5">
                  <div class="text-sm font-bold text-white">${p.title}</div>
                  <p class="text-xs text-slate-400 leading-relaxed">${p.description}</p>
                  ${p.technologies && p.technologies.length ? `
                    <div class="flex flex-wrap gap-1 pt-1">
                      ${p.technologies.map(t => `<span class="px-1.5 py-0.5 text-[10px] rounded bg-white/5 text-[#22D3EE] font-mono">${t}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('') : '<p class="text-xs text-slate-500 italic">No explicit projects section identified in resume.</p>'}
            </div>
          </div>

          <!-- Internships & Experience -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="briefcase" class="w-5 h-5 text-[#F59E0B]"></i>
              Internships & Professional Experience
            </h3>
            <div class="space-y-3">
              ${(other_info.internships_and_experience && other_info.internships_and_experience.length) ? other_info.internships_and_experience.map(e => `
                <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-white">${e.role}</span>
                    <span class="text-[11px] text-slate-400 font-mono">${e.duration}</span>
                  </div>
                  <div class="text-xs text-[#22D3EE]">${e.company}</div>
                  <p class="text-xs text-slate-400 leading-relaxed">${e.summary}</p>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 italic">No formal internship/work experience section identified in resume.</p>'}
            </div>
          </div>
        </div>

        <!-- Next Step Prompt Banner -->
        <div class="p-8 rounded-3xl bg-gradient-to-r from-[#7C5CFC]/20 via-[#22D3EE]/20 to-[#7C5CFC]/20 border border-[#7C5CFC]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 class="text-xl font-extrabold text-white font-heading">What Career Role Are You Interested In?</h3>
            <p class="text-xs text-slate-300 mt-1 max-w-xl">
              Choose your desired career path. We will compare your extracted skills with the role requirements and generate your personalized preparation roadmap.
            </p>
          </div>
          <a href="#student/role-selection" class="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-sm shadow-xl shadow-[#7C5CFC]/30 hover:opacity-95 transition flex-shrink-0 flex items-center gap-2">
            <span>Select Career Role</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
