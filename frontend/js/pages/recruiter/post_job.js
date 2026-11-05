import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderRecruiterPostJobPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full animate-fade-in space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between pb-6 border-b border-white/5">
        <div>
          <div class="flex items-center gap-2 text-xs font-mono text-[#22D3EE] font-semibold mb-1">
            <span>RECRUITER PORTAL</span>
            <span>•</span>
            <span class="text-slate-400">CREATE OPPORTUNITY</span>
          </div>
          <h1 class="text-3xl font-extrabold text-white font-heading">Post Career Opportunity</h1>
          <p class="text-sm text-slate-400 mt-1">Publish verified internship or entry-level positions to college candidates.</p>
        </div>

        <a href="#recruiter/dashboard" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">
          Back to Dashboard
        </a>
      </div>

      <!-- Post Form -->
      <div class="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <form id="post-job-form" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Job / Internship Title *</label>
              <input type="text" id="j-title" required placeholder="e.g. AI Engineering Intern (Summer 2026)" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Opportunity Type</label>
              <select id="j-type" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]">
                <option value="internship" selected>Internship</option>
                <option value="full_time">Full-Time</option>
                <option value="part_time">Part-Time</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Work Mode</label>
              <select id="j-mode" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]">
                <option value="remote" selected>Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_site">On-Site</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Location / Base City</label>
              <input type="text" id="j-location" placeholder="e.g. Remote / San Francisco / Bengaluru" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Stipend or Salary</label>
              <input type="text" id="j-stipend" placeholder="e.g. $2,000 / month or $25,000 / year" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Application Deadline</label>
              <input type="date" id="j-deadline" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">External Application URL (Optional)</label>
              <input type="url" id="j-link" placeholder="https://yourcompany.com/jobs/..." class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Required Skills (Comma-Separated) *</label>
            <input type="text" id="j-skills" required placeholder="Python, PyTorch, FastAPI, Git, Docker" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-[#22D3EE]" />
            <p class="text-[11px] text-slate-400 mt-1 font-mono">Our AI engine compares candidate resumes directly against these skill keywords.</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Detailed Role Description *</label>
            <textarea id="j-desc" rows="4" required placeholder="Describe day-to-day responsibilities, learning outcomes, and technical expectations..." class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]"></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Eligibility Criteria</label>
            <textarea id="j-eligibility" rows="2" placeholder="e.g. Enrolled in 3rd/4th year undergraduate program in Computer Science or related degree..." class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]"></textarea>
          </div>

          <button type="submit" id="post-submit-btn" class="w-full py-4 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#7C5CFC] text-[#0B0F19] font-bold text-sm shadow-xl hover:opacity-95 transition flex items-center justify-center gap-2">
            <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
            <span>Publish Verified Opportunity</span>
          </button>
        </form>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const form = document.getElementById('post-job-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('post-submit-btn');
    btn.disabled = true;

    const rawSkills = document.getElementById('j-skills').value.split(',').map(s => s.trim()).filter(Boolean);

    try {
      await api.post('/recruiter/opportunities', {
        title: document.getElementById('j-title').value.trim(),
        opportunity_type: document.getElementById('j-type').value,
        work_mode: document.getElementById('j-mode').value,
        location: document.getElementById('j-location').value.trim() || 'Remote',
        stipend_or_salary: document.getElementById('j-stipend').value.trim() || null,
        deadline: document.getElementById('j-deadline').value || null,
        application_link: document.getElementById('j-link').value.trim() || null,
        required_skills: rawSkills,
        description: document.getElementById('j-desc').value.trim(),
        eligibility: document.getElementById('j-eligibility').value.trim() || null
      });

      toast.success('Opportunity published successfully!');
      window.location.hash = '#recruiter/dashboard';
    } catch (err) {
      toast.error(err.message, 'Publication Failed');
      btn.disabled = false;
    }
  };
}
