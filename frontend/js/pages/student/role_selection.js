import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderRoleSelectionPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  let roles = [];
  let userProfile = null;
  try {
    const rolesResp = await api.get('/student/career-roles');
    roles = rolesResp;
    const me = await api.get('/auth/me');
    userProfile = me.student_profile;
  } catch (err) {
    console.error('Failed to load career roles:', err);
  }

  let selectedRoleId = userProfile?.selected_role_id || (roles.find(r => r.title === 'AI Engineer')?.id || roles[0]?.id);
  let selectedLevel = userProfile?.experience_level || 'Beginner';
  let selectedGoal = userProfile?.career_goal || 'Internship';
  let selectedTimeline = userProfile?.preparation_timeline || '3 months';

  const renderContent = () => {
    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-10">
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7C5CFC]/30 bg-[#7C5CFC]/10 text-xs font-semibold text-[#22D3EE] mb-3">
            <i data-lucide="compass" class="w-4 h-4"></i>
            Step 2: Role Intelligence Mapping
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white font-heading">What career role are you interested in?</h1>
          <p class="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Choose your desired career path. We will compare your current skills with the requirements of that role and create a personalized preparation plan.
          </p>
        </div>

        <!-- Role Search and Category Filter -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
          <div class="relative w-full">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
            <input type="text" id="role-search-input" placeholder="Search career roles (e.g. AI Engineer, Full Stack, Python)..." class="w-full pl-11 pr-4 py-3 bg-[#172033] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
          </div>
        </div>

        <!-- 16+ Selectable Career Role Cards Grid -->
        <div>
          <div class="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 font-bold flex items-center justify-between">
            <span>Select One Target Career Role (${roles.length} Available)</span>
            <span class="text-[#22D3EE] text-[11px]">Click any card to select</span>
          </div>

          <div id="roles-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${roles.map(r => {
              const isSelected = r.id === selectedRoleId;
              return `
                <div data-role-id="${r.id}" class="role-card p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${isSelected ? 'bg-[#172033] border-[#7C5CFC] ring-2 ring-[#7C5CFC]/40 shadow-xl shadow-[#7C5CFC]/15' : 'bg-[#111827]/70 border-white/5 hover:border-white/15'}">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400">${r.category}</span>
                      ${isSelected ? '<span class="w-2.5 h-2.5 rounded-full bg-[#7C5CFC]"></span>' : ''}
                    </div>
                    <h3 class="text-base font-bold text-white mb-1.5">${r.title}</h3>
                    <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">${r.description}</p>
                  </div>

                  <div class="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-1">
                    ${r.core_skills.map(s => `<span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/5 text-slate-300">${s}</span>`).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Additional Preference Questions -->
        <div class="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8">
          <h3 class="text-lg font-bold text-white font-heading flex items-center gap-2">
            <i data-lucide="sliders" class="w-5 h-5 text-[#22D3EE]"></i>
            Preparation Parameters & Goals
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Experience Level -->
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">1. Experience Level</label>
              <div class="space-y-2">
                ${['Beginner', 'Intermediate', 'Advanced'].map(lvl => `
                  <label class="flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${selectedLevel === lvl ? 'bg-[#7C5CFC]/15 border-[#7C5CFC] text-white' : 'bg-[#111827]/60 border-white/5 text-slate-400 hover:text-white'}">
                    <input type="radio" name="exp_level" value="${lvl}" ${selectedLevel === lvl ? 'checked' : ''} class="text-[#7C5CFC] focus:ring-0" />
                    <span class="text-sm font-semibold">${lvl}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Career Goal -->
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">2. Career Goal</label>
              <div class="space-y-2">
                ${['Internship', 'Entry-level job', 'Placement preparation', 'Advanced career preparation'].map(goal => `
                  <label class="flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${selectedGoal === goal ? 'bg-[#22D3EE]/15 border-[#22D3EE] text-white' : 'bg-[#111827]/60 border-white/5 text-slate-400 hover:text-white'}">
                    <input type="radio" name="career_goal" value="${goal}" ${selectedGoal === goal ? 'checked' : ''} class="text-[#22D3EE] focus:ring-0" />
                    <span class="text-sm font-semibold">${goal}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Preparation Timeline -->
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">3. Preparation Timeline</label>
              <div class="space-y-2">
                ${['1 month', '3 months', '6 months', '12 months'].map(time => `
                  <label class="flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${selectedTimeline === time ? 'bg-[#22C55E]/15 border-[#22C55E] text-white' : 'bg-[#111827]/60 border-white/5 text-slate-400 hover:text-white'}">
                    <input type="radio" name="timeline" value="${time}" ${selectedTimeline === time ? 'checked' : ''} class="text-[#22C55E] focus:ring-0" />
                    <span class="text-sm font-semibold">${time}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Submit Action -->
          <div class="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-400">
              Selected: <strong class="text-white">${roles.find(r => r.id === selectedRoleId)?.title || 'Role'}</strong> · ${selectedLevel} · ${selectedGoal} · ${selectedTimeline}
            </div>

            <button id="save-role-btn" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-sm shadow-xl shadow-[#7C5CFC]/25 hover:opacity-95 transition flex items-center justify-center gap-2">
              <span>Generate Career Compatibility & Roadmap</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach card clicks
    document.querySelectorAll('.role-card').forEach(card => {
      card.onclick = () => {
        selectedRoleId = parseInt(card.getAttribute('data-role-id'));
        renderContent();
      };
    });

    // Radio inputs
    document.querySelectorAll('input[name="exp_level"]').forEach(r => {
      r.onchange = (e) => { selectedLevel = e.target.value; };
    });
    document.querySelectorAll('input[name="career_goal"]').forEach(r => {
      r.onchange = (e) => { selectedGoal = e.target.value; };
    });
    document.querySelectorAll('input[name="timeline"]').forEach(r => {
      r.onchange = (e) => { selectedTimeline = e.target.value; };
    });

    // Search filter
    const searchInput = document.getElementById('role-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const val = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.role-card').forEach(card => {
          const title = card.querySelector('h3').textContent.toLowerCase();
          const desc = card.querySelector('p').textContent.toLowerCase();
          card.style.display = (title.includes(val) || desc.includes(val)) ? 'flex' : 'none';
        });
      };
    }

    // Submit handler
    const saveBtn = document.getElementById('save-role-btn');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="animate-spin mr-2">&#9696;</span> Comparing skills & compiling roadmap...`;

        try {
          await api.post('/student/select-role', {
            role_id: selectedRoleId,
            experience_level: selectedLevel,
            career_goal: selectedGoal,
            preparation_timeline: selectedTimeline
          });

          toast.success('Career compatibility evaluated and roadmap ready!');
          window.location.hash = '#student/career-report';
        } catch (err) {
          toast.error(err.message, 'Evaluation Failed');
          saveBtn.disabled = false;
          saveBtn.innerHTML = `<span>Generate Career Compatibility & Roadmap</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
          if (window.lucide) window.lucide.createIcons();
        }
      };
    }
  };

  renderContent();
}
