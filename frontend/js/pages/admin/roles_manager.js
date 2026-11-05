import { api } from '../../api.js';
import { toast } from '../../components/toast.js';
import { modal } from '../../components/modal.js';

export async function renderAdminRolesPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#EF4444]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  const loadAndRender = async () => {
    try {
      const roles = await api.get('/admin/career-roles');

      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono text-[#EF4444] font-bold mb-1">
                <span>SUPER ADMIN</span>
                <span>•</span>
                <span class="text-slate-400">CAREER ROLE INTELLIGENCE</span>
              </div>
              <h1 class="text-3xl font-extrabold text-white font-heading">Career Roles & Requirements Manager</h1>
              <p class="text-sm text-slate-400 mt-1">Manage the master career catalog and fine-tune required skill weights.</p>
            </div>

            <button id="add-role-btn" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#7C5CFC] text-white text-xs font-bold shadow-lg hover:opacity-95 transition flex items-center gap-2">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Create New Career Role</span>
            </button>
          </div>

          <!-- Roles Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${roles.map(r => `
              <div class="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[#22D3EE]">${r.category}</span>
                    <button data-delete-role-id="${r.id}" class="text-slate-500 hover:text-[#EF4444] p-1 transition" title="Delete role">&times;</button>
                  </div>
                  <h3 class="text-lg font-bold text-white mb-1">${r.title}</h3>
                  <p class="text-xs text-slate-400 leading-relaxed mb-4">${r.description}</p>

                  <!-- Requirements summary -->
                  <div class="space-y-1.5 pt-2 border-t border-white/5">
                    <span class="text-[10px] font-mono uppercase text-slate-400 font-bold block">Requirements (${r.requirements.length}):</span>
                    <div class="flex flex-wrap gap-1">
                      ${r.requirements.map(rq => `
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono ${rq.type === 'required' ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20' : (rq.type === 'preferred' ? 'bg-[#22D3EE]/15 text-[#22D3EE]' : 'bg-white/5 text-slate-400')}">
                          ${rq.skill_name} (${rq.weight}x)
                        </span>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <div class="pt-3 border-t border-white/5 text-[11px] text-slate-500 font-mono">
                  Slug: ${r.slug}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Add Role Modal
      document.getElementById('add-role-btn').onclick = () => {
        modal.open({
          title: 'Create Career Role',
          content: `
            <form id="create-role-form" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Role Title *</label>
                <input type="text" id="cr-title" required placeholder="e.g. Site Reliability Engineer" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Category</label>
                  <select id="cr-cat" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm">
                    <option value="Engineering">Engineering</option>
                    <option value="Data & AI">Data & AI</option>
                    <option value="Cloud & Security">Cloud & Security</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Slug</label>
                  <input type="text" id="cr-slug" placeholder="site-reliability-engineer" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Role Description *</label>
                <textarea id="cr-desc" rows="2" required placeholder="Summary of role expectations..." class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm"></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Required Skills (Comma-Separated, Weight 1.8x)</label>
                <input type="text" id="cr-req" placeholder="Linux, Kubernetes, Python, CI/CD" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm font-mono" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Preferred Skills (Comma-Separated, Weight 1.2x)</label>
                <input type="text" id="cr-pref" placeholder="Terraform, Docker, Prometheus" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm font-mono" />
              </div>
              <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-[#EF4444] to-[#7C5CFC] text-white font-bold rounded-xl text-sm hover:opacity-95 transition">
                Create & Publish Career Role
              </button>
            </form>
          `
        });

        document.getElementById('create-role-form').onsubmit = async (e) => {
          e.preventDefault();
          const title = document.getElementById('cr-title').value.trim();
          const category = document.getElementById('cr-cat').value;
          const slug = document.getElementById('cr-slug').value.trim() || title.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const description = document.getElementById('cr-desc').value.trim();
          const required = document.getElementById('cr-req').value.split(',').map(s => s.trim()).filter(Boolean);
          const preferred = document.getElementById('cr-pref').value.split(',').map(s => s.trim()).filter(Boolean);

          try {
            await api.post('/admin/career-roles', {
              title,
              category,
              slug,
              description,
              required_skills: required,
              preferred_skills: preferred
            });
            modal.close();
            toast.success(`Career role '${title}' created successfully.`);
            await loadAndRender();
          } catch (err) {
            toast.error(err.message);
          }
        };
      };

      // Delete Role Handler
      document.querySelectorAll('[data-delete-role-id]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Are you sure you want to delete this career role? Existing roadmaps referencing this role will be impacted.')) return;
          const id = btn.getAttribute('data-delete-role-id');
          try {
            await api.delete(`/admin/career-roles/${id}`);
            toast.info('Role deleted.');
            await loadAndRender();
          } catch (err) {
            toast.error(err.message);
          }
        };
      });

    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  await loadAndRender();
}
