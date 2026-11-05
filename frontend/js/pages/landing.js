import { appState } from '../state.js';
import { api } from '../api.js';

export async function renderLandingPage(container) {
  const { user } = appState.get();
  const ctaLink = user ? (user.role === 'student' ? '#student/resume' : `#${user.role}/dashboard`) : '#register';

  container.innerHTML = `
    <!-- Hero Section -->
    <section class="relative pt-20 pb-28 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7C5CFC]/30 bg-[#7C5CFC]/10 text-xs font-semibold text-[#22D3EE] mb-8 animate-fade-in backdrop-blur-md">
          <span class="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
          Next-Gen AI Career Intelligence for College Students
        </div>

        <!-- Main Heading -->
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto font-heading">
          Your Skills. Your Future. <br/>
          <span class="gradient-text-purple-cyan">Your Passport to Success.</span>
        </h1>

        <!-- Description -->
        <p class="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover your strengths, identify skill gaps, and build a personalized career roadmap with AI-powered career intelligence.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a href="${ctaLink}" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-base shadow-xl shadow-[#7C5CFC]/25 hover:opacity-95 transition flex items-center justify-center gap-2 group">
            <span>Analyze My Resume</span>
            <i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
          </a>
          <a href="#how-it-works" class="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-[#172033]/80 hover:bg-[#172033] text-slate-200 font-semibold text-base transition flex items-center justify-center gap-2">
            <i data-lucide="compass" class="w-5 h-5 text-[#22D3EE]"></i>
            <span>Explore Platform</span>
          </a>
        </div>

        <!-- Dashboard Visual Showcase -->
        <div class="relative max-w-5xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl glow-purple">
          <div class="bg-[#111827] rounded-xl overflow-hidden border border-white/5 p-6 text-left">
            <div class="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                <span class="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                <span class="w-3 h-3 rounded-full bg-[#22C55E]"></span>
                <span class="text-xs text-slate-400 font-mono ml-2">skill-passport://intelligence-engine</span>
              </div>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-[#7C5CFC]/20 text-[#22D3EE] border border-[#7C5CFC]/30">AI Live Model</span>
            </div>

            <!-- Preview Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-[#172033] p-5 rounded-xl border border-white/5">
                <div class="text-xs text-slate-400 font-mono mb-2">TARGET ROLE</div>
                <div class="text-xl font-bold text-white mb-1">AI Engineer</div>
                <div class="flex items-center gap-2 text-xs text-[#22C55E]">
                  <i data-lucide="trending-up" class="w-4 h-4"></i> High Placement Demand
                </div>
              </div>
              <div class="bg-[#172033] p-5 rounded-xl border border-white/5">
                <div class="text-xs text-slate-400 font-mono mb-2">CAREER READINESS SCORE</div>
                <div class="text-2xl font-black text-[#22D3EE] font-mono">78%</div>
                <div class="text-xs text-slate-400 mt-1">Nearly Ready · 4 Missing Skills</div>
              </div>
              <div class="bg-[#172033] p-5 rounded-xl border border-white/5">
                <div class="text-xs text-slate-400 font-mono mb-2">ACTIVE ROADMAP</div>
                <div class="text-xl font-bold text-white mb-1">8-Phase Action Plan</div>
                <div class="w-full bg-slate-800 rounded-full h-2 mt-2">
                  <div class="bg-[#7C5CFC] h-2 rounded-full" style="width: 37.5%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 8 Core Platform Features -->
    <section id="features" class="py-24 border-t border-white/5 relative z-10 bg-[#0B0F19]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-xs font-mono uppercase tracking-widest text-[#7C5CFC] mb-2 font-bold">Comprehensive Capabilities</h2>
          <h3 class="text-3xl sm:text-4xl font-extrabold text-white font-heading">Engineered for Every Milestone of Your Career</h3>
          <p class="text-slate-400 mt-3">From multi-page resume text extraction to customized roadmaps and verified hiring pipelines.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- 1. AI Resume Analysis -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center mb-5">
              <i data-lucide="file-search" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">1. AI Resume Analysis</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Extracts truthful personal details, technical stack, projects, and gives actionable ATS quality suggestions.</p>
          </div>

          <!-- 2. Career Role Recommendations -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center mb-5">
              <i data-lucide="compass" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">2. Career Role Recommendations</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Explore 16+ industry-standard tech domains from Full Stack and Python to AI Engineering and Cloud DevOps.</p>
          </div>

          <!-- 3. Skill Gap Detection -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center mb-5">
              <i data-lucide="git-pull-request" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">3. Skill Gap Detection</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Instantly discern matched skills, related skills, and critical missing tools required by your target career role.</p>
          </div>

          <!-- 4. Personalized Learning Roadmap -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center mb-5">
              <i data-lucide="map" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">4. Personalized Learning Roadmap</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Structured learning phases with verified real documentation links, practical tasks, and interactive check-offs.</p>
          </div>

          <!-- 5. Internship and Job Opportunities -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center mb-5">
              <i data-lucide="briefcase" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">5. Verified Opportunities</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Access real, unexpired openings with transparent stipend, work mode, and personalized AI match percentages.</p>
          </div>

          <!-- 6. Career Readiness Score -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#7C5CFC]/20 text-[#7C5CFC] flex items-center justify-center mb-5">
              <i data-lucide="gauge" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">6. Career Readiness Score</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Weighted mathematical score explaining exactly how close you are to landing your target internship or entry job.</p>
          </div>

          <!-- 7. Student Progress Tracking -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center mb-5">
              <i data-lucide="check-square" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">7. Application & Milestone Tracker</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Track application statuses from Under Review to Interview Scheduled with notes and calendar links.</p>
          </div>

          <!-- 8. Recruiter Talent Discovery -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 glow-card">
            <div class="w-12 h-12 rounded-xl bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center mb-5">
              <i data-lucide="user-check" class="w-6 h-6"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-2">8. Recruiter Talent Discovery</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Verified recruiters post opportunities, review authorized applicants, and schedule technical interviews securely.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works (4 Steps) -->
    <section id="how-it-works" class="py-24 border-t border-white/5 relative z-10 bg-[#111827]/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-xs font-mono uppercase tracking-widest text-[#22D3EE] mb-2 font-bold">The Blueprint</h2>
          <h3 class="text-3xl sm:text-4xl font-extrabold text-white font-heading">Four Steps to Job Readiness</h3>
          <p class="text-slate-400 mt-3">A transparent, reliable journey designed for undergraduate and graduate college students.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <!-- Step 1 -->
          <div class="flex flex-col items-start p-6 rounded-2xl bg-[#172033]/60 border border-white/5 relative">
            <div class="w-10 h-10 rounded-xl bg-[#7C5CFC] text-white font-mono font-bold flex items-center justify-center mb-4 text-sm shadow-lg shadow-[#7C5CFC]/30">01</div>
            <h4 class="text-base font-bold text-white mb-2">Create Student Account</h4>
            <p class="text-xs text-slate-400 leading-relaxed">Sign up with your college, degree, and graduation year to unlock your personal career intelligence space.</p>
          </div>

          <!-- Step 2 -->
          <div class="flex flex-col items-start p-6 rounded-2xl bg-[#172033]/60 border border-white/5 relative">
            <div class="w-10 h-10 rounded-xl bg-[#7C5CFC] text-white font-mono font-bold flex items-center justify-center mb-4 text-sm shadow-lg shadow-[#7C5CFC]/30">02</div>
            <h4 class="text-base font-bold text-white mb-2">Upload Your Resume</h4>
            <p class="text-xs text-slate-400 leading-relaxed">Drop your PDF or DOCX file. Our engine parses the text and identifies all verified skills and projects.</p>
          </div>

          <!-- Step 3 -->
          <div class="flex flex-col items-start p-6 rounded-2xl bg-[#172033]/60 border border-white/5 relative">
            <div class="w-10 h-10 rounded-xl bg-[#22D3EE] text-[#0B0F19] font-mono font-bold flex items-center justify-center mb-4 text-sm shadow-lg shadow-[#22D3EE]/30">03</div>
            <h4 class="text-base font-bold text-white mb-2">Select Your Target Role</h4>
            <p class="text-xs text-slate-400 leading-relaxed">Choose from 16+ career paths and indicate your experience level, career goal, and preparation timeline.</p>
          </div>

          <!-- Step 4 -->
          <div class="flex flex-col items-start p-6 rounded-2xl bg-[#172033]/60 border border-white/5 relative">
            <div class="w-10 h-10 rounded-xl bg-[#22C55E] text-white font-mono font-bold flex items-center justify-center mb-4 text-sm shadow-lg shadow-[#22C55E]/30">04</div>
            <h4 class="text-base font-bold text-white mb-2">Get Analysis & Roadmap</h4>
            <p class="text-xs text-slate-400 leading-relaxed">Receive your compatibility score, missing skill breakdown, and step-by-step phased roadmap.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-24 border-t border-white/5 relative z-10 bg-[#0B0F19]">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-xs font-mono uppercase tracking-widest text-[#7C5CFC] mb-2 font-bold">Knowledge Base</h2>
          <h3 class="text-3xl font-extrabold text-white font-heading">Frequently Asked Questions</h3>
        </div>

        <div class="space-y-4">
          <div class="p-5 rounded-2xl bg-[#172033]/80 border border-white/5">
            <h4 class="text-base font-bold text-white mb-2">How does Skill Passport calculate the Career Compatibility Score?</h4>
            <p class="text-sm text-slate-400 leading-relaxed">The score compares your verified resume skills and manual skills against the weighted requirements of your chosen role. Required skills hold the highest weight (1.8 - 2.0), preferred skills hold 1.2, and related competencies hold 0.6. It is an educational evaluation of skill alignment, not a guaranteed hiring promise.</p>
          </div>

          <div class="p-5 rounded-2xl bg-[#172033]/80 border border-white/5">
            <h4 class="text-base font-bold text-white mb-2">What happens to my uploaded resume? Is it private?</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Your resume is stored in an isolated, private directory on the server accessible strictly by your authenticated account. Recruiters can never view your resume or personal details unless you explicitly apply to their posted opportunity.</p>
          </div>

          <div class="p-5 rounded-2xl bg-[#172033]/80 border border-white/5">
            <h4 class="text-base font-bold text-white mb-2">Can I update my target career role later?</h4>
            <p class="text-sm text-slate-400 leading-relaxed">Yes! You can change your selected career role, timeline, and career goal at any time. The engine will instantly regenerate your role compatibility report and tailor a fresh roadmap for you.</p>
          </div>

          <div class="p-5 rounded-2xl bg-[#172033]/80 border border-white/5">
            <h4 class="text-base font-bold text-white mb-2">Who controls the Super Admin portal?</h4>
            <p class="text-sm text-slate-400 leading-relaxed">The Super Admin portal is exclusively locked to the configured website owner via environment-level bootstrap secret authorization. No other user can create or elevate themselves to Super Admin.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Footer Banner -->
    <section class="py-20 border-t border-white/5 bg-gradient-to-b from-[#111827] to-[#0B0F19] text-center">
      <div class="max-w-4xl mx-auto px-4">
        <h3 class="text-3xl sm:text-4xl font-extrabold text-white mb-4 font-heading">Ready to Unlock Your Career Passport?</h3>
        <p class="text-slate-400 mb-8 max-w-xl mx-auto">Upload your resume today and turn skill gaps into targeted portfolio projects.</p>
        <a href="${ctaLink}" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-base shadow-xl shadow-[#7C5CFC]/25 hover:opacity-95 transition">
          <span>Get Started Free</span>
          <i data-lucide="arrow-right" class="w-5 h-5"></i>
        </a>
      </div>
    </section>
  `;

  if (window.lucide) window.lucide.createIcons();
}
