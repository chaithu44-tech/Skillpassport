import { api } from '../api.js';
import { appState } from '../state.js';
import { toast } from '../components/toast.js';

export async function renderOpportunitiesPage(container, oppId = null) {
  if (oppId) {
    await renderSingleOpportunity(container, oppId);
    return;
  }

  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  let filterType = 'all';
  let filterMode = 'all';
  let searchQuery = '';

  const loadListings = async () => {
    try {
      const opps = await api.get('/opportunities', {
        type: filterType,
        mode: filterMode,
        query: searchQuery
      });
      renderList(opps);
    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  const renderList = (opps) => {
    const { user } = appState.get();

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-[#22D3EE] font-semibold mb-1">
              <span>VERIFIED HIRING PORTAL</span>
              <span>•</span>
              <span class="text-slate-400">REAL OPPORTUNITIES</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white font-heading">Internships & Career Opportunities</h1>
            <p class="text-sm text-slate-400 mt-1">Verified partner listings with automated AI competency matching.</p>
          </div>

          ${user && user.role === 'recruiter' ? `
            <a href="#recruiter/post-job" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#7C5CFC] text-[#0B0F19] text-xs font-bold hover:opacity-95 transition flex items-center gap-2">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Post New Opportunity</span>
            </a>
          ` : ''}
        </div>

        <!-- Filter Controls -->
        <div class="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Search -->
            <div class="relative">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
              <input type="text" id="opp-search" value="${searchQuery}" placeholder="Search company, title, or skills..." class="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#7C5CFC]" />
            </div>

            <!-- Type Filter -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono text-slate-400">Type:</span>
              <select id="type-select" class="flex-1 px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#7C5CFC]">
                <option value="all" ${filterType === 'all' ? 'selected' : ''}>All Types</option>
                <option value="internship" ${filterType === 'internship' ? 'selected' : ''}>Internship</option>
                <option value="full_time" ${filterType === 'full_time' ? 'selected' : ''}>Full-Time</option>
                <option value="part_time" ${filterType === 'part_time' ? 'selected' : ''}>Part-Time</option>
              </select>
            </div>

            <!-- Work Mode Filter -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono text-slate-400">Mode:</span>
              <select id="mode-select" class="flex-1 px-3 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#7C5CFC]">
                <option value="all" ${filterMode === 'all' ? 'selected' : ''}>All Work Modes</option>
                <option value="remote" ${filterMode === 'remote' ? 'selected' : ''}>Remote</option>
                <option value="hybrid" ${filterMode === 'hybrid' ? 'selected' : ''}>Hybrid</option>
                <option value="on_site" ${filterMode === 'on_site' ? 'selected' : ''}>On-Site</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Opportunities Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${opps.length === 0 ? `
            <div class="col-span-full glass-panel p-12 rounded-3xl text-center text-slate-400">
              <i data-lucide="briefcase" class="w-12 h-12 text-slate-600 mx-auto mb-3"></i>
              <h4 class="text-base font-bold text-white mb-1">No Matching Opportunities</h4>
              <p class="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
            </div>
          ` : opps.map(opp => `
            <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/15 transition group">
              <div>
                <div class="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-white/5 text-slate-300 uppercase">${opp.opportunity_type}</span>
                  ${opp.match_metrics.match_percentage !== null ? `
                    <span class="px-2 py-0.5 text-[11px] font-bold font-mono rounded ${opp.match_metrics.match_percentage >= 60 ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' : 'bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30'}">
                      ${opp.match_metrics.match_percentage}% Match
                    </span>
                  ` : '<span class="text-[10px] text-slate-500 font-mono">Sign in to match</span>'}
                </div>

                <h3 class="text-base font-bold text-white group-hover:text-[#22D3EE] transition mb-1">${opp.title}</h3>
                <div class="text-xs text-slate-400 font-medium mb-3 flex items-center gap-2">
                  <strong class="text-slate-200">${opp.company}</strong>
                  <span>•</span>
                  <span>${opp.location}</span>
                </div>

                <p class="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">${opp.description}</p>

                <!-- Required Skills -->
                <div class="flex flex-wrap gap-1 mb-4">
                  ${opp.required_skills.map(s => {
                    const isMatched = opp.match_metrics.matched_skills.includes(s);
                    return `
                      <span class="px-2 py-0.5 text-[10px] rounded font-mono ${isMatched ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-bold' : 'bg-white/5 text-slate-400'}">
                        ${isMatched ? '✓ ' : ''}${s}
                      </span>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Card Footer -->
              <div class="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span class="text-slate-500 text-[10px] block">Compensation</span>
                  <span class="text-[#22C55E] font-semibold">${opp.stipend_or_salary || 'Competitive'}</span>
                </div>

                <div class="flex items-center gap-2">
                  <a href="#opportunities/${opp.id}" class="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-semibold text-xs hover:opacity-90 transition">
                    Details
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event listeners
    document.getElementById('opp-search').onkeydown = (e) => {
      if (e.key === 'Enter') {
        searchQuery = e.target.value.trim();
        loadListings();
      }
    };
    document.getElementById('type-select').onchange = (e) => {
      filterType = e.target.value;
      loadListings();
    };
    document.getElementById('mode-select').onchange = (e) => {
      filterMode = e.target.value;
      loadListings();
    };
  };

  await loadListings();
}

async function renderSingleOpportunity(container, oppId) {
  try {
    const opp = await api.get(`/opportunities/${oppId}`);
    const { user } = appState.get();

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Back Link -->
        <a href="#opportunities" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Back to all opportunities</span>
        </a>

        <!-- Main Card -->
        <div class="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-white/5 text-[#22D3EE] uppercase">${opp.opportunity_type}</span>
                <span class="px-2.5 py-0.5 text-[10px] font-mono rounded bg-white/5 text-slate-400 uppercase">${opp.work_mode}</span>
                <span class="px-2.5 py-0.5 text-[10px] font-mono rounded bg-[#22C55E]/15 text-[#22C55E] uppercase border border-[#22C55E]/20">VERIFIED</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-white font-heading">${opp.title}</h1>
              <div class="text-sm text-slate-300 font-semibold mt-1">${opp.company} · ${opp.location}</div>
            </div>

            ${opp.match_percentage !== null ? `
              <div class="p-3 rounded-2xl bg-[#172033] border border-white/10 text-center flex-shrink-0">
                <span class="text-[10px] font-mono uppercase text-slate-400 block">AI Match</span>
                <span class="text-2xl font-black text-[#22D3EE] font-mono block">${opp.match_percentage}%</span>
              </div>
            ` : ''}
          </div>

          <!-- Quick Specs Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5 font-mono uppercase text-[10px]">Stipend / Salary</span>
              <strong class="text-[#22C55E] text-sm">${opp.stipend_or_salary || 'Competitive'}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5 font-mono uppercase text-[10px]">Application Deadline</span>
              <strong class="text-white text-sm font-mono">${opp.deadline || 'Open'}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5 font-mono uppercase text-[10px]">Listing Source</span>
              <strong class="text-white text-xs">${opp.source || 'Verified Partner'}</strong>
            </div>
            <div class="p-3.5 rounded-xl bg-[#111827]/60 border border-white/5">
              <span class="text-slate-400 block mb-0.5 font-mono uppercase text-[10px]">Last Verified</span>
              <strong class="text-slate-300 text-xs font-mono">${opp.last_verified_at || 'Recent'}</strong>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Job Description</h3>
            <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">${opp.description}</p>
          </div>

          <!-- Eligibility -->
          ${opp.eligibility ? `
            <div class="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs">
              <strong class="text-white">Eligibility Criteria:</strong>
              <p class="text-slate-300">${opp.eligibility}</p>
            </div>
          ` : ''}

          <!-- Competencies Breakdown -->
          <div class="space-y-3 pt-2">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">Competencies Required</h3>
            <div class="flex flex-wrap gap-2">
              ${opp.required_skills.map(s => {
                const isMatched = opp.matched_skills.includes(s);
                return `
                  <span class="px-3 py-1 text-xs rounded-xl font-mono ${isMatched ? 'bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] font-bold' : 'bg-white/5 border border-white/10 text-slate-400'}">
                    ${isMatched ? '✓ Matched: ' : 'Missing: '}${s}
                  </span>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-400">
              ${opp.application_status ? `Application Status: <strong class="text-[#22D3EE] uppercase font-mono">${opp.application_status}</strong>` : 'Direct record into your Skill Passport application tracker'}
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              ${user && user.role === 'student' ? `
                <button id="save-opp-btn" class="px-5 py-3 rounded-xl border border-white/10 bg-[#111827] hover:bg-white/5 text-white text-xs font-semibold transition">
                  Save Opportunity
                </button>
                <button id="apply-opp-btn" class="px-7 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition">
                  ${opp.application_status ? 'Update Application' : 'Apply & Track Now'}
                </button>
              ` : `
                <a href="#login" class="px-6 py-3 rounded-xl bg-[#7C5CFC] text-white text-xs font-bold">Sign In to Apply</a>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach Apply & Save handlers
    const applyBtn = document.getElementById('apply-opp-btn');
    if (applyBtn) {
      applyBtn.onclick = async () => {
        applyBtn.disabled = true;
        try {
          await api.post(`/opportunities/${opp.id}/apply`, {
            notes: 'Applied via Skill Passport Opportunities Portal.'
          });
          toast.success('Application recorded to your tracker!');
          window.location.hash = '#student/applications';
        } catch (err) {
          toast.error(err.message);
          applyBtn.disabled = false;
        }
      };
    }

    const saveBtn = document.getElementById('save-opp-btn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        try {
          await api.post(`/opportunities/${opp.id}/save`);
          toast.info('Opportunity saved to your tracker.');
        } catch (err) {
          toast.error(err.message);
        }
      };
    }

  } catch (err) {
    container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
  }
}
