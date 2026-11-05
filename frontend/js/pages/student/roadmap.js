import { api } from '../../api.js';
import { toast } from '../../components/toast.js';
import { renderProgressBar } from '../../components/charts.js';

export async function renderRoadmapPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  let roadmapData = null;
  let activeFilter = 'all'; // 'all', 'pending', 'completed'

  const loadAndRender = async () => {
    try {
      const data = await api.get('/student/roadmap');
      if (!data.has_roadmap || !data.roadmap) {
        container.innerHTML = `
          <div class="flex-1 p-6 lg:p-10 max-w-xl mx-auto w-full text-center py-20">
            <div class="w-16 h-16 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <i data-lucide="map" class="w-8 h-8"></i>
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">No Active Roadmap</h2>
            <p class="text-sm text-slate-400 mb-6">Select a target career role to generate your tailored preparation roadmap.</p>
            <a href="#student/role-selection" class="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-sm shadow-lg shadow-[#7C5CFC]/20 inline-flex items-center gap-2">
              <span>Choose Career Role</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      roadmapData = data.roadmap;
      renderRoadmapView();
    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  const renderRoadmapView = () => {
    const { id, title, summary, role_title, total_phases, completed_phases, progress_percentage, activities } = roadmapData;

    const filteredActivities = activities.filter(a => {
      if (activeFilter === 'completed') return a.is_completed;
      if (activeFilter === 'pending') return !a.is_completed;
      return true;
    });

    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Top Bar -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-[#7C5CFC] font-semibold mb-1">
              <span>PERSONALIZED CAREER BLUEPRINT</span>
              <span>•</span>
              <span class="text-[#22D3EE]">${role_title}</span>
            </div>
            <h1 class="text-3xl font-extrabold text-white font-heading">${title}</h1>
            <p class="text-sm text-slate-400 mt-1">${summary || 'Follow your structured phases and mark off milestones as you master each topic.'}</p>
          </div>

          <div class="flex items-center gap-3">
            <button id="regenerate-roadmap-btn" class="px-4 py-2.5 rounded-xl border border-white/10 bg-[#172033] hover:bg-white/5 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4 text-slate-400"></i>
              <span>Regenerate Roadmap</span>
            </button>
            <a href="#student/career-report" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition flex items-center gap-2">
              <i data-lucide="bar-chart-2" class="w-4 h-4 text-[#22D3EE]"></i>
              <span>View Gap Report</span>
            </a>
          </div>
        </div>

        <!-- Overall Progress Header Card -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="space-y-1.5 text-center sm:text-left">
            <span class="text-xs font-mono uppercase text-slate-400">Preparation Progress</span>
            <div class="text-3xl font-black text-white font-mono flex items-center gap-3 justify-center sm:justify-start">
              <span class="text-[#22D3EE]">${Math.round(progress_percentage)}%</span>
              <span class="text-sm font-semibold text-slate-400 font-sans">(${completed_phases} of ${total_phases} Milestones Completed)</span>
            </div>
            <p class="text-xs text-slate-400">Check off activities below to dynamically increase your career readiness score.</p>
          </div>

          <div class="w-full sm:w-64">
            ${renderProgressBar({ percentage: progress_percentage, height: 'h-3', color: 'bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE]' })}
          </div>
        </div>

        <!-- Filters (All / Pending / Completed) -->
        <div class="flex items-center justify-between gap-4 pb-2">
          <div class="flex items-center gap-2 bg-[#111827] p-1 rounded-xl border border-white/10 text-xs">
            <button class="filter-btn px-3 py-1.5 rounded-lg font-semibold transition ${activeFilter === 'all' ? 'bg-[#7C5CFC] text-white' : 'text-slate-400 hover:text-white'}" data-filter="all">
              All Phases (${total_phases})
            </button>
            <button class="filter-btn px-3 py-1.5 rounded-lg font-semibold transition ${activeFilter === 'pending' ? 'bg-[#7C5CFC] text-white' : 'text-slate-400 hover:text-white'}" data-filter="pending">
              Pending (${total_phases - completed_phases})
            </button>
            <button class="filter-btn px-3 py-1.5 rounded-lg font-semibold transition ${activeFilter === 'completed' ? 'bg-[#7C5CFC] text-white' : 'text-slate-400 hover:text-white'}" data-filter="completed">
              Completed (${completed_phases})
            </button>
          </div>

          <span class="text-xs font-mono text-slate-400 hidden sm:inline">Interactive Learning Checklist</span>
        </div>

        <!-- Timeline Activities List -->
        <div class="space-y-6">
          ${filteredActivities.map((act) => `
            <div class="activity-card p-6 rounded-2xl border transition-all duration-200 ${act.is_completed ? 'bg-[#111827]/40 border-[#22C55E]/30 opacity-80' : 'bg-[#172033]/90 border-white/10 shadow-xl'}">
              <div class="flex items-start gap-4">
                <!-- Completion Checkbox -->
                <button data-activity-id="${act.id}" data-completed="${act.is_completed}" class="toggle-activity-btn flex-shrink-0 mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition ${act.is_completed ? 'bg-[#22C55E] border-[#22C55E] text-white' : 'border-white/20 bg-white/5 hover:border-[#7C5CFC] text-transparent'}">
                  <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
                </button>

                <!-- Activity Details -->
                <div class="flex-1 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span class="text-[11px] font-mono uppercase text-[#7C5CFC] font-semibold tracking-wider">${act.phase_title}</span>
                      <h3 class="text-base font-bold text-white ${act.is_completed ? 'line-through text-slate-400' : ''}">${act.topic}</h3>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="px-2.5 py-1 text-[11px] font-mono rounded bg-white/5 text-slate-400 border border-white/5">
                        <i data-lucide="clock" class="w-3 h-3 inline mr-1 text-[#22D3EE]"></i>${act.estimated_duration}
                      </span>
                      ${act.is_completed ? '<span class="px-2 py-0.5 text-[10px] rounded bg-[#22C55E]/20 text-[#22C55E] font-bold">COMPLETED</span>' : ''}
                    </div>
                  </div>

                  <p class="text-xs text-slate-300 leading-relaxed">${act.description}</p>

                  ${act.learning_objective ? `
                    <div class="p-3 rounded-xl bg-[#111827]/70 border border-white/5 text-xs text-slate-300">
                      <strong class="text-white">Learning Objective:</strong> ${act.learning_objective}
                    </div>
                  ` : ''}

                  <!-- Practical Task -->
                  ${act.practical_task ? `
                    <div class="p-3 rounded-xl bg-[#7C5CFC]/10 border border-[#7C5CFC]/20 text-xs text-slate-200 flex items-start gap-2">
                      <i data-lucide="terminal" class="w-4 h-4 text-[#7C5CFC] flex-shrink-0 mt-0.5"></i>
                      <div><strong class="text-[#22D3EE]">Practical Task:</strong> ${act.practical_task}</div>
                    </div>
                  ` : ''}

                  <!-- Recommended Verified Resources -->
                  ${(act.recommended_resources && act.recommended_resources.length) ? `
                    <div class="pt-2">
                      <div class="text-[11px] font-mono uppercase text-slate-400 mb-2 font-semibold">Recommended Real-World Resources:</div>
                      <div class="flex flex-wrap gap-2">
                        ${act.recommended_resources.map(res => `
                          <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-[#22D3EE] transition inline-flex items-center gap-1.5 group">
                            <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#22D3EE]"></i>
                            <span class="font-medium">${res.title}</span>
                            <span class="text-[10px] text-slate-500 font-mono">(${res.type || 'Link'})</span>
                          </a>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach Toggle Checkbox Handlers
    document.querySelectorAll('.toggle-activity-btn').forEach(btn => {
      btn.onclick = async () => {
        const actId = parseInt(btn.getAttribute('data-activity-id'));
        const currentCompleted = btn.getAttribute('data-completed') === 'true';
        const nextState = !currentCompleted;

        try {
          const resp = await api.patch(`/student/roadmap/activity/${actId}`, {
            is_completed: nextState
          });

          // Update local state and re-render
          const target = roadmapData.activities.find(a => a.id === actId);
          if (target) {
            target.is_completed = nextState;
            roadmapData.progress_percentage = resp.roadmap_progress.progress_percentage;
            roadmapData.completed_phases = resp.roadmap_progress.completed_phases;
          }

          toast.success(nextState ? 'Milestone completed!' : 'Milestone reopened.');
          renderRoadmapView();
        } catch (err) {
          toast.error(err.message, 'Failed to update milestone');
        }
      };
    });

    // Attach Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.onclick = () => {
        activeFilter = btn.getAttribute('data-filter');
        renderRoadmapView();
      };
    });

    // Regenerate Roadmap Handler
    const regenBtn = document.getElementById('regenerate-roadmap-btn');
    if (regenBtn) {
      regenBtn.onclick = async () => {
        if (!confirm('Regenerate this learning roadmap? Your checked tasks for this role will be reset to a fresh curriculum.')) return;
        regenBtn.disabled = true;
        try {
          await api.post('/student/roadmap/regenerate');
          toast.success('Roadmap regenerated.');
          await loadAndRender();
        } catch (err) {
          toast.error(err.message);
          regenBtn.disabled = false;
        }
      };
    }
  };

  await loadAndRender();
}
