import { api } from '../../api.js';
import { toast } from '../../components/toast.js';
import { modal } from '../../components/modal.js';

export async function renderStudentProfilePage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  const loadAndRender = async () => {
    try {
      const profile = await api.get('/student/profile');
      renderView(profile);
    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  const renderView = (profile) => {
    container.innerHTML = `
      <div class="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full animate-fade-in space-y-8">
        <!-- Profile Header -->
        <div class="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#22D3EE] flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-[#7C5CFC]/30">
              ${(profile.full_name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl sm:text-3xl font-extrabold text-white font-heading">${profile.full_name}</h1>
                <span class="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-[#7C5CFC]/20 text-[#22D3EE] border border-[#7C5CFC]/30">STUDENT</span>
              </div>
              <p class="text-sm text-slate-400 mt-0.5 font-mono">${profile.email}</p>
              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                <span><i data-lucide="graduation-cap" class="w-3.5 h-3.5 inline text-[#7C5CFC]"></i> ${profile.college || 'College not specified'}</span>
                <span>•</span>
                <span>${profile.course_branch || 'Degree'} (${profile.graduation_year || 'Class'})</span>
                ${profile.selected_role ? `<span>•</span> <span class="text-[#22D3EE] font-semibold"><i data-lucide="target" class="w-3.5 h-3.5 inline"></i> ${profile.selected_role.title}</span>` : ''}
              </div>
            </div>
          </div>

          <button id="edit-profile-btn" class="px-4 py-2.5 rounded-xl border border-white/10 bg-[#111827] hover:bg-white/5 text-white text-xs font-semibold transition flex items-center gap-2">
            <i data-lucide="edit-3" class="w-4 h-4 text-[#22D3EE]"></i>
            <span>Edit Profile Info</span>
          </button>
        </div>

        <!-- Skills Section: Distinguishing Resume Extracted vs Manually Added -->
        <div class="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <h3 class="text-lg font-bold text-white font-heading flex items-center gap-2">
                <i data-lucide="cpu" class="w-5 h-5 text-[#7C5CFC]"></i>
                Verified Technical & Soft Skills
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">Transparently separates skills verified from your uploaded document vs added manually.</p>
            </div>
            <button id="add-skill-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Skill with Evidence</span>
            </button>
          </div>

          <!-- 1. Resume Extracted Skills -->
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-xs font-mono uppercase text-[#22C55E] font-bold">
              <i data-lucide="file-check" class="w-4 h-4"></i>
              <span>Skills Extracted from Resume (${profile.resume_skills.length})</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${profile.resume_skills.length ? profile.resume_skills.map(s => `
                <div class="px-3 py-1.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-white text-xs flex items-center gap-2">
                  <span class="font-medium">${s.name}</span>
                  <span class="text-[10px] text-slate-400 font-mono">(${s.category})</span>
                  <button data-delete-skill-id="${s.id}" class="text-slate-500 hover:text-[#EF4444] transition ml-1" title="Remove skill">&times;</button>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 italic">No skills extracted yet. Upload your resume to auto-populate.</p>'}
            </div>
          </div>

          <!-- 2. Manually Added Skills with Evidence -->
          <div class="space-y-3 pt-4 border-t border-white/5">
            <div class="flex items-center gap-2 text-xs font-mono uppercase text-[#22D3EE] font-bold">
              <i data-lucide="user-check" class="w-4 h-4"></i>
              <span>Manually Added Skills with Evidence (${profile.manual_skills.length})</span>
            </div>
            <div class="space-y-2">
              ${profile.manual_skills.length ? profile.manual_skills.map(s => `
                <div class="p-3 rounded-xl bg-[#111827]/60 border border-white/5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div class="font-bold text-white flex items-center gap-2">
                      <span>${s.name}</span>
                      <span class="px-1.5 py-0.2 text-[10px] rounded bg-white/5 text-[#22D3EE] font-mono">${s.proficiency}</span>
                      <span class="text-[10px] text-slate-400 font-mono">(${s.category})</span>
                    </div>
                    ${s.evidence ? `<p class="text-[11px] text-slate-400 mt-1 italic">Evidence: ${s.evidence}</p>` : ''}
                  </div>
                  <button data-delete-skill-id="${s.id}" class="px-2 py-1 rounded bg-white/5 hover:bg-[#EF4444]/20 text-slate-400 hover:text-[#EF4444] text-[11px] font-semibold transition">
                    Remove
                  </button>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 italic">No manual skills added. You can add non-resume skills with proof or links.</p>'}
            </div>
          </div>
        </div>

        <!-- Projects & Certifications Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Projects -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i data-lucide="folder-git-2" class="w-4 h-4 text-[#7C5CFC]"></i>
                Practical Projects (${profile.projects.length})
              </h3>
              <button id="add-project-btn" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 font-semibold border border-white/10 transition">
                + Add Project
              </button>
            </div>
            <div class="space-y-3">
              ${profile.projects.length ? profile.projects.map(p => `
                <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5 space-y-1.5 text-xs">
                  <div class="font-bold text-white text-sm flex items-center justify-between">
                    <span>${p.title}</span>
                    ${p.url ? `<a href="${p.url}" target="_blank" class="text-[#22D3EE] hover:underline flex items-center gap-1 font-mono text-[11px]"><i data-lucide="external-link" class="w-3 h-3"></i> View Repo</a>` : ''}
                  </div>
                  <p class="text-slate-400 leading-relaxed">${p.description || ''}</p>
                  ${p.technologies ? `<div class="text-[11px] font-mono text-[#7C5CFC]">Stack: ${p.technologies}</div>` : ''}
                </div>
              `).join('') : '<p class="text-xs text-slate-500 italic">No custom projects added yet.</p>'}
            </div>
          </div>

          <!-- Certifications -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 class="text-base font-bold text-white flex items-center gap-2">
                <i data-lucide="award" class="w-4 h-4 text-[#22D3EE]"></i>
                Certifications & Badges (${profile.certifications.length})
              </h3>
              <button id="add-cert-btn" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 font-semibold border border-white/10 transition">
                + Add Certificate
              </button>
            </div>
            <div class="space-y-3">
              ${profile.certifications.length ? profile.certifications.map(c => `
                <div class="p-4 rounded-xl bg-[#111827]/60 border border-white/5 space-y-1 text-xs">
                  <div class="font-bold text-white text-sm flex items-center justify-between">
                    <span>${c.title}</span>
                    ${c.url ? `<a href="${c.url}" target="_blank" class="text-[#22D3EE] hover:underline flex items-center gap-1 font-mono text-[11px]"><i data-lucide="external-link" class="w-3 h-3"></i> Certificate</a>` : ''}
                  </div>
                  <div class="text-slate-400">${c.organization || 'Issuing Organization'} ${c.date ? `· ${c.date}` : ''}</div>
                </div>
              `).join('') : '<p class="text-xs text-slate-500 italic">No certifications added yet.</p>'}
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Attach Delete Skill Handlers
    document.querySelectorAll('[data-delete-skill-id]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-delete-skill-id');
        try {
          await api.delete(`/student/skills/${id}`);
          toast.info('Skill removed.');
          await loadAndRender();
        } catch (err) {
          toast.error(err.message);
        }
      };
    });

    // Attach Add Skill Modal
    document.getElementById('add-skill-btn').onclick = () => {
      modal.open({
        title: 'Add Manual Skill with Evidence',
        content: `
          <form id="add-skill-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Skill Name *</label>
              <input type="text" id="m-skill-name" required placeholder="e.g. Docker, PyTorch, GraphQL" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Category</label>
                <select id="m-skill-cat" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]">
                  <option value="language">Language</option>
                  <option value="framework" selected>Framework</option>
                  <option value="database">Database</option>
                  <option value="tool">Tool / DevOps</option>
                  <option value="cloud">Cloud Platform</option>
                  <option value="aiml">AI / ML</option>
                  <option value="soft_skill">Soft Skill</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Proficiency Level</label>
                <select id="m-skill-level" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate" selected>Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Evidence / Proof Note</label>
              <textarea id="m-skill-evidence" rows="2" placeholder="Link to project repo, coursework, or practical proof where applied" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]"></textarea>
            </div>
            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold rounded-xl text-sm hover:opacity-95 transition">
              Add Verified Skill
            </button>
          </form>
        `
      });

      document.getElementById('add-skill-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
          await api.post('/student/skills', {
            skill_name: document.getElementById('m-skill-name').value.trim(),
            category: document.getElementById('m-skill-cat').value,
            proficiency_level: document.getElementById('m-skill-level').value,
            evidence_note: document.getElementById('m-skill-evidence').value.trim() || null
          });
          modal.close();
          toast.success('Skill added to profile.');
          await loadAndRender();
        } catch (err) {
          toast.error(err.message);
        }
      };
    };

    // Attach Add Project Modal
    document.getElementById('add-project-btn').onclick = () => {
      modal.open({
        title: 'Add Project to Portfolio',
        content: `
          <form id="add-proj-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Project Title *</label>
              <input type="text" id="p-title" required placeholder="AI Document Intelligence Assistant" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Technologies Used</label>
              <input type="text" id="p-tech" placeholder="Python, FastAPI, PyTorch, Docker" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Project / Repository URL</label>
              <input type="url" id="p-url" placeholder="https://github.com/yourusername/project" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Description</label>
              <textarea id="p-desc" rows="3" placeholder="Key outcomes, architecture, and metrics..." class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]"></textarea>
            </div>
            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold rounded-xl text-sm hover:opacity-95 transition">
              Save Project
            </button>
          </form>
        `
      });

      document.getElementById('add-proj-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
          await api.post('/student/projects', {
            title: document.getElementById('p-title').value.trim(),
            technologies_used: document.getElementById('p-tech').value.trim() || null,
            project_url: document.getElementById('p-url').value.trim() || null,
            description: document.getElementById('p-desc').value.trim() || null
          });
          modal.close();
          toast.success('Project added.');
          await loadAndRender();
        } catch (err) {
          toast.error(err.message);
        }
      };
    };

    // Attach Add Cert Modal
    document.getElementById('add-cert-btn').onclick = () => {
      modal.open({
        title: 'Add Verified Certification',
        content: `
          <form id="add-cert-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Certificate Title *</label>
              <input type="text" id="c-title" required placeholder="AWS Certified Cloud Practitioner" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Issuing Organization</label>
                <input type="text" id="c-org" placeholder="Amazon Web Services" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Date</label>
                <input type="text" id="c-date" placeholder="2025" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Credential URL</label>
              <input type="url" id="c-url" placeholder="https://credly.com/..." class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC]" />
            </div>
            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold rounded-xl text-sm hover:opacity-95 transition">
              Save Certificate
            </button>
          </form>
        `
      });

      document.getElementById('add-cert-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
          await api.post('/student/certifications', {
            title: document.getElementById('c-title').value.trim(),
            issuing_organization: document.getElementById('c-org').value.trim() || null,
            issue_date: document.getElementById('c-date').value.trim() || null,
            certificate_url: document.getElementById('c-url').value.trim() || null
          });
          modal.close();
          toast.success('Certificate recorded.');
          await loadAndRender();
        } catch (err) {
          toast.error(err.message);
        }
      };
    };

    // Attach Edit Profile Modal
    document.getElementById('edit-profile-btn').onclick = () => {
      modal.open({
        title: 'Edit Profile Information',
        content: `
          <form id="edit-profile-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
              <input type="text" id="ep-name" value="${profile.full_name || ''}" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">College</label>
                <input type="text" id="ep-college" value="${profile.college || ''}" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Grad Year</label>
                <input type="number" id="ep-year" value="${profile.graduation_year || ''}" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Course / Degree</label>
              <input type="text" id="ep-course" value="${profile.course_branch || ''}" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Bio / Headline</label>
              <textarea id="ep-bio" rows="2" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm">${profile.bio || ''}</textarea>
            </div>
            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold rounded-xl text-sm hover:opacity-95 transition">
              Update Profile
            </button>
          </form>
        `
      });

      document.getElementById('edit-profile-form').onsubmit = async (e) => {
        e.preventDefault();
        try {
          await api.put('/student/profile', {
            full_name: document.getElementById('ep-name').value.trim(),
            college: document.getElementById('ep-college').value.trim() || null,
            graduation_year: document.getElementById('ep-year').value ? parseInt(document.getElementById('ep-year').value) : null,
            course_branch: document.getElementById('ep-course').value.trim() || null,
            bio: document.getElementById('ep-bio').value.trim() || null
          });
          modal.close();
          toast.success('Profile updated.');
          await loadAndRender();
        } catch (err) {
          toast.error(err.message);
        }
      };
    };
  };

  await loadAndRender();
}
