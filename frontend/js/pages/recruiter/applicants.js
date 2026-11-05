import { api } from '../../api.js';
import { toast } from '../../components/toast.js';
import { modal } from '../../components/modal.js';

export async function renderRecruiterApplicantsPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#22D3EE]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  const loadAndRender = async () => {
    try {
      const apps = await api.get('/recruiter/applications');

      container.innerHTML = `
        <div class="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono text-[#22D3EE] font-semibold mb-1">
                <span>TALENT PIPELINE</span>
                <span>•</span>
                <span class="text-slate-400">APPLICANT SCREENING</span>
              </div>
              <h1 class="text-3xl font-extrabold text-white font-heading">Candidate Applications</h1>
              <p class="text-sm text-slate-400 mt-1">Review verified applicants, evaluate matching competencies, and schedule interview rounds.</p>
            </div>
            <a href="#recruiter/dashboard" class="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white transition">
              Back to Dashboard
            </a>
          </div>

          <!-- Applications Table / Grid -->
          <div class="space-y-4">
            ${apps.length === 0 ? `
              <div class="glass-panel p-16 rounded-3xl border border-white/5 text-center text-slate-400">
                <i data-lucide="users" class="w-12 h-12 text-slate-600 mx-auto mb-3"></i>
                <h4 class="text-base font-bold text-white mb-1">No Candidate Applications Yet</h4>
                <p class="text-xs text-slate-500">As college candidates discover your verified openings and apply, they will appear here with AI match scoring.</p>
              </div>
            ` : apps.map(app => `
              <div class="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <!-- Candidate Info -->
                <div class="space-y-2">
                  <div class="flex items-center gap-3">
                    <h3 class="text-lg font-bold text-white">${app.student_name}</h3>
                    <span class="px-2 py-0.5 text-xs font-mono font-bold rounded bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
                      ${app.match_percentage}% Match
                    </span>
                    <span class="px-2 py-0.5 text-xs font-mono rounded bg-white/5 text-slate-400 capitalize">
                      ${app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div class="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span>Applied for: <strong class="text-white">${app.opportunity_title}</strong></span>
                    <span>•</span>
                    <span>${app.college || 'College'} (${app.course_branch || 'Degree'})</span>
                    <span>•</span>
                    <span>Applied: ${app.applied_at}</span>
                  </div>

                  <!-- Matched Competencies -->
                  <div class="flex flex-wrap gap-1 pt-1">
                    ${app.matched_skills.map(s => `
                      <span class="px-2 py-0.5 text-[10px] rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-mono">
                        ✓ ${s}
                      </span>
                    `).join('')}
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap items-center gap-2">
                  <button data-view-applicant-id="${app.application_id}" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition flex items-center gap-1.5">
                    <i data-lucide="user" class="w-3.5 h-3.5 text-[#22D3EE]"></i>
                    <span>Profile</span>
                  </button>

                  <select data-status-app-id="${app.application_id}" class="px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#22D3EE]">
                    <option value="applied" ${app.status === 'applied' ? 'selected' : ''}>Applied</option>
                    <option value="under_review" ${app.status === 'under_review' ? 'selected' : ''}>Under Review</option>
                    <option value="shortlisted" ${app.status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                    <option value="interview_scheduled" ${app.status === 'interview_scheduled' ? 'selected' : ''}>Interview Scheduled</option>
                    <option value="selected" ${app.status === 'selected' ? 'selected' : ''}>Selected</option>
                    <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                  </select>

                  <button data-schedule-app-id="${app.application_id}" data-student-name="${app.student_name}" class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#7C5CFC] text-[#0B0F19] text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5">
                    <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                    <span>Schedule Interview</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // View Candidate Profile
      document.querySelectorAll('[data-view-applicant-id]').forEach(btn => {
        btn.onclick = async () => {
          const appId = btn.getAttribute('data-view-applicant-id');
          try {
            const data = await api.get(`/recruiter/applicants/${appId}`);
            const c = data.candidate;
            modal.open({
              title: `Candidate Profile: ${c.full_name}`,
              content: `
                <div class="space-y-4 text-xs">
                  <div class="p-4 rounded-xl bg-[#111827]/70 border border-white/5">
                    <div class="text-sm font-bold text-white mb-1">${c.full_name}</div>
                    <div class="text-slate-400">${c.college || 'College'} · ${c.course_branch || 'Degree'} (Class of ${c.graduation_year || 'N/A'})</div>
                    ${c.bio ? `<p class="text-slate-300 mt-2 italic">${c.bio}</p>` : ''}
                  </div>

                  <div>
                    <h4 class="font-bold text-white uppercase font-mono mb-2">Verified Competencies</h4>
                    <div class="flex flex-wrap gap-1.5">
                      ${c.skills.map(s => `<span class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-mono">${s.name} (${s.source === 'resume_extracted' ? 'Resume' : 'Manual'})</span>`).join('')}
                    </div>
                  </div>

                  ${c.projects.length ? `
                    <div>
                      <h4 class="font-bold text-white uppercase font-mono mb-2">Projects</h4>
                      <div class="space-y-2">
                        ${c.projects.map(p => `
                          <div class="p-3 rounded-lg bg-white/5 border border-white/5">
                            <div class="font-bold text-white">${p.title}</div>
                            <p class="text-slate-400 mt-0.5">${p.description || ''}</p>
                            ${p.technologies ? `<div class="text-[#22D3EE] font-mono text-[10px] mt-1">Stack: ${p.technologies}</div>` : ''}
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              `
            });
          } catch (err) {
            toast.error(err.message);
          }
        };
      });

      // Change status select handler
      document.querySelectorAll('[data-status-app-id]').forEach(select => {
        select.onchange = async (e) => {
          const appId = select.getAttribute('data-status-app-id');
          const newStatus = e.target.value;
          try {
            await api.patch(`/recruiter/applications/${appId}/status`, {
              status: newStatus
            });
            toast.success(`Candidate status updated to ${newStatus.replace('_', ' ')}.`);
          } catch (err) {
            toast.error(err.message);
          }
        };
      });

      // Schedule Interview Modal
      document.querySelectorAll('[data-schedule-app-id]').forEach(btn => {
        btn.onclick = () => {
          const appId = btn.getAttribute('data-schedule-app-id');
          const studentName = btn.getAttribute('data-student-name');
          const defaultTime = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16);

          modal.open({
            title: `Schedule Interview with ${studentName}`,
            content: `
              <form id="schedule-interview-form" class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Interview Date & Time *</label>
                  <input type="datetime-local" id="int-time" value="${defaultTime}" required class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Duration (Minutes)</label>
                    <select id="int-duration" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]">
                      <option value="30">30 minutes</option>
                      <option value="45" selected>45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Round Type</label>
                    <select id="int-type" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]">
                      <option value="technical" selected>Technical Round</option>
                      <option value="hr">HR & Cultural</option>
                      <option value="system_design">System Architecture</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Meeting Link (Google Meet / Zoom) *</label>
                  <input type="url" id="int-link" required placeholder="https://meet.google.com/xyz-abc" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Preparation Notes for Candidate</label>
                  <textarea id="int-notes" rows="2" placeholder="Topics to prepare, code editor requirements, etc." class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE]"></textarea>
                </div>
                <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-[#22D3EE] to-[#7C5CFC] text-[#0B0F19] font-bold rounded-xl text-sm hover:opacity-95 transition">
                  Confirm & Dispatch Interview Invitation
                </button>
              </form>
            `
          });

          document.getElementById('schedule-interview-form').onsubmit = async (e) => {
            e.preventDefault();
            const timeVal = document.getElementById('int-time').value;
            const duration = parseInt(document.getElementById('int-duration').value);
            const roundType = document.getElementById('int-type').value;
            const link = document.getElementById('int-link').value.trim();
            const notes = document.getElementById('int-notes').value.trim();

            try {
              await api.post('/recruiter/interviews', {
                application_id: parseInt(appId),
                scheduled_time: new Date(timeVal).toISOString(),
                duration_minutes: duration,
                meeting_link: link,
                interview_type: roundType,
                notes: notes || null
              });
              modal.close();
              toast.success(`Interview scheduled and notified to ${studentName}!`);
              await loadAndRender();
            } catch (err) {
              toast.error(err.message, 'Failed to schedule');
            }
          };
        };
      });

    } catch (err) {
      container.innerHTML = `<div class="p-12 text-center text-[#EF4444]">${err.message}</div>`;
    }
  };

  await loadAndRender();
}
