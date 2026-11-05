import { api } from '../api.js';
import { appState } from '../state.js';
import { toast } from '../components/toast.js';

export function renderLoginPage(container) {
  container.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-4 py-16">
      <div class="max-w-md w-full bg-[#172033]/90 border border-white/10 rounded-2xl p-8 shadow-2xl glass-panel animate-fade-in">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7C5CFC] to-[#22D3EE] mx-auto flex items-center justify-center mb-3 shadow-lg shadow-[#7C5CFC]/20">
            <i data-lucide="lock" class="w-6 h-6 text-white"></i>
          </div>
          <h2 class="text-2xl font-bold text-white font-heading">Welcome Back</h2>
          <p class="text-sm text-slate-400 mt-1">Sign in to access your Skill Passport dashboard</p>
        </div>

        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <input type="email" id="login-email" required placeholder="you@university.edu" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              <a href="#forgot-password" class="text-xs text-[#22D3EE] hover:underline">Forgot password?</a>
            </div>
            <input type="password" id="login-password" required placeholder="••••••••" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
          </div>

          <button type="submit" id="login-submit-btn" class="w-full py-3.5 bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold rounded-xl shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition text-sm flex items-center justify-center gap-2">
            <span>Sign In</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-slate-400">
          Don't have an account? <a href="#register" class="text-[#7C5CFC] font-semibold hover:underline">Create a Student Account</a>
        </div>

        <div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <a href="#register-recruiter" class="hover:text-slate-300">Recruiter Sign Up</a>
          <a href="#owner-login" class="hover:text-[#22D3EE] flex items-center gap-1"><i data-lucide="key" class="w-3 h-3"></i> Super Admin</a>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const form = document.getElementById('login-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-submit-btn');

    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-2">&#9696;</span> Authenticating...`;

    try {
      const data = await api.post('/auth/login', { email, password });
      api.setToken(data.access_token);
      toast.success(`Welcome back, ${data.full_name || data.email}!`);
      
      const me = await api.get('/auth/me');
      appState.setUser(me);

      if (me.role === 'admin') {
        window.location.hash = '#admin/dashboard';
      } else if (me.role === 'recruiter') {
        window.location.hash = '#recruiter/dashboard';
      } else {
        window.location.hash = '#student/dashboard';
      }
    } catch (err) {
      toast.error(err.message, 'Login Failed');
      btn.disabled = false;
      btn.innerHTML = `<span>Sign In</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  };
}

export function renderRegisterStudentPage(container) {
  container.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-4 py-16">
      <div class="max-w-lg w-full bg-[#172033]/90 border border-white/10 rounded-2xl p-8 shadow-2xl glass-panel animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-xl bg-[#7C5CFC]/20 text-[#7C5CFC] mx-auto flex items-center justify-center mb-3">
            <i data-lucide="graduation-cap" class="w-6 h-6"></i>
          </div>
          <h2 class="text-2xl font-bold text-white font-heading">Student Registration</h2>
          <p class="text-sm text-slate-400 mt-1">Join Skill Passport and build your verified career roadmap</p>
        </div>

        <form id="student-reg-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name *</label>
            <input type="text" id="reg-name" required placeholder="Alex Mercer" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Student Email Address *</label>
            <input type="email" id="reg-email" required placeholder="alex@university.edu" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password *</label>
              <input type="password" id="reg-password" required minlength="6" placeholder="Min 6 characters" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirm Password *</label>
              <input type="password" id="reg-confirm" required minlength="6" placeholder="Repeat password" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">College / University</label>
              <input type="text" id="reg-college" placeholder="Stanford University" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Grad Year</label>
              <input type="number" id="reg-grad-year" placeholder="2026" min="2020" max="2032" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Course / Degree / Branch</label>
            <input type="text" id="reg-course" placeholder="B.S. in Computer Science" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition" />
          </div>

          <button type="submit" id="reg-submit-btn" class="w-full py-3.5 bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold rounded-xl shadow-lg shadow-[#7C5CFC]/20 hover:opacity-95 transition text-sm flex items-center justify-center gap-2">
            <span>Create Student Account</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-slate-400">
          Already registered? <a href="#login" class="text-[#7C5CFC] font-semibold hover:underline">Sign In</a>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const form = document.getElementById('student-reg-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const college = document.getElementById('reg-college').value.trim();
    const gradYearVal = document.getElementById('reg-grad-year').value;
    const courseBranch = document.getElementById('reg-course').value.trim();

    if (password !== confirm) {
      toast.error('Passwords do not match. Please verify.', 'Validation Error');
      return;
    }

    const btn = document.getElementById('reg-submit-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-2">&#9696;</span> Registering...`;

    try {
      const data = await api.post('/auth/register-student', {
        full_name: fullName,
        email,
        password,
        college: college || null,
        graduation_year: gradYearVal ? parseInt(gradYearVal) : null,
        course_branch: courseBranch || null
      });

      api.setToken(data.access_token);
      toast.success('Student account created successfully!');
      
      const me = await api.get('/auth/me');
      appState.setUser(me);
      window.location.hash = '#student/resume';
    } catch (err) {
      toast.error(err.message, 'Registration Failed');
      btn.disabled = false;
      btn.innerHTML = `<span>Create Student Account</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  };
}

export function renderRegisterRecruiterPage(container) {
  container.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-4 py-16">
      <div class="max-w-lg w-full bg-[#172033]/90 border border-white/10 rounded-2xl p-8 shadow-2xl glass-panel animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE] mx-auto flex items-center justify-center mb-3">
            <i data-lucide="building" class="w-6 h-6"></i>
          </div>
          <h2 class="text-2xl font-bold text-white font-heading">Recruiter Registration</h2>
          <p class="text-sm text-slate-400 mt-1">Hire verified talent and post genuine student internships</p>
        </div>

        <form id="recruiter-reg-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name *</label>
            <input type="text" id="rec-name" required placeholder="Elena Rostova" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE] transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Official Work Email *</label>
            <input type="email" id="rec-email" required placeholder="elena@quantum.io" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE] transition" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Company Name *</label>
              <input type="text" id="rec-company" required placeholder="Quantum AI Labs" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE] transition" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Designation</label>
              <input type="text" id="rec-designation" placeholder="Talent Lead" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE] transition" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Company Website</label>
            <input type="url" id="rec-website" placeholder="https://quantum.io" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE] transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password *</label>
            <input type="password" id="rec-password" required minlength="6" placeholder="Min 6 characters" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#22D3EE] transition" />
          </div>

          <div class="p-3 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-xs text-[#22D3EE]">
            Note: Recruiter accounts undergo Super Admin verification before publishing job openings to students.
          </div>

          <button type="submit" id="rec-submit-btn" class="w-full py-3.5 bg-gradient-to-r from-[#22D3EE] to-[#7C5CFC] text-[#0B0F19] font-bold rounded-xl shadow-lg hover:opacity-95 transition text-sm flex items-center justify-center gap-2">
            <span>Register Recruiter Account</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-slate-400">
          Already registered? <a href="#login" class="text-[#22D3EE] font-semibold hover:underline">Sign In</a>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const form = document.getElementById('recruiter-reg-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('rec-submit-btn');
    btn.disabled = true;

    try {
      const data = await api.post('/auth/register-recruiter', {
        full_name: document.getElementById('rec-name').value.trim(),
        official_email: document.getElementById('rec-email').value.trim(),
        company_name: document.getElementById('rec-company').value.trim(),
        company_website: document.getElementById('rec-website').value.trim() || null,
        designation: document.getElementById('rec-designation').value.trim() || null,
        password: document.getElementById('rec-password').value
      });

      api.setToken(data.access_token);
      toast.success('Recruiter account created. Verification pending by website owner.');
      const me = await api.get('/auth/me');
      appState.setUser(me);
      window.location.hash = '#recruiter/dashboard';
    } catch (err) {
      toast.error(err.message, 'Recruiter Registration Failed');
      btn.disabled = false;
    }
  };
}

export function renderOwnerLoginPage(container) {
  container.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-4 py-16">
      <div class="max-w-md w-full bg-[#172033]/90 border border-[#EF4444]/30 rounded-2xl p-8 shadow-2xl glass-panel animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-xl bg-[#EF4444]/20 text-[#EF4444] mx-auto flex items-center justify-center mb-3 border border-[#EF4444]/30">
            <i data-lucide="shield-alert" class="w-6 h-6"></i>
          </div>
          <h2 class="text-2xl font-bold text-white font-heading">Super Admin Portal</h2>
          <p class="text-xs text-slate-400 mt-1 font-mono">OWNER-ONLY EXCLUSIVE ACCESS</p>
        </div>

        <div class="mb-6 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs text-slate-300 leading-relaxed">
          This portal is strictly reserved for the verified website owner. Requires the server-side bootstrap secret or registered owner credentials.
        </div>

        <form id="owner-login-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Owner Email Address</label>
            <input type="email" id="owner-email" required placeholder="owner@skillpassport.ai" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#EF4444] transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Owner Bootstrap Secret Phrase</label>
            <input type="password" id="owner-secret" required placeholder="Server-side secret" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-[#EF4444] transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Owner Password (or new password)</label>
            <input type="password" id="owner-password" required minlength="8" placeholder="••••••••" class="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#EF4444] transition" />
          </div>

          <button type="submit" id="owner-submit-btn" class="w-full py-3.5 bg-gradient-to-r from-[#EF4444] to-[#7C5CFC] text-white font-bold rounded-xl shadow-lg hover:opacity-95 transition text-sm flex items-center justify-center gap-2">
            <i data-lucide="key" class="w-4 h-4"></i>
            <span>Authenticate Website Owner</span>
          </button>
        </form>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const form = document.getElementById('owner-login-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('owner-submit-btn');
    btn.disabled = true;

    try {
      const data = await api.post('/auth/owner-bootstrap', {
        email: document.getElementById('owner-email').value.trim(),
        bootstrap_secret: document.getElementById('owner-secret').value.trim(),
        password: document.getElementById('owner-password').value
      });

      api.setToken(data.access_token);
      toast.success('Super Admin authenticated successfully.');
      const me = await api.get('/auth/me');
      appState.setUser(me);
      window.location.hash = '#admin/dashboard';
    } catch (err) {
      toast.error(err.message, 'Owner Authorization Denied');
      btn.disabled = false;
    }
  };
}
