import { api } from '../../api.js';
import { toast } from '../../components/toast.js';

export async function renderResumeUploadPage(container) {
  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full animate-fade-in">
      <div class="flex items-center justify-center py-20 text-slate-400">
        <i data-lucide="loader" class="w-8 h-8 animate-spin text-[#7C5CFC]"></i>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  let existingResume = null;
  try {
    const data = await api.get('/student/resume');
    if (data.has_resume) {
      existingResume = data.resume;
    }
  } catch (err) {
    console.error('Error fetching resume status:', err);
  }

  container.innerHTML = `
    <div class="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full animate-fade-in space-y-8">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7C5CFC]/30 bg-[#7C5CFC]/10 text-xs font-semibold text-[#22D3EE] mb-3">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          AI Resume Intelligence Engine
        </div>
        <h1 class="text-3xl font-extrabold text-white font-heading">Upload Your Resume</h1>
        <p class="text-sm text-slate-400 mt-2">
          Upload your PDF or DOCX resume. Our backend extracts text across all pages and analyzes your verified skills, education, and projects.
        </p>
      </div>

      <!-- Existing Resume Card (if present) -->
      ${existingResume ? `
        <div class="p-5 rounded-2xl bg-[#172033] border border-[#22C55E]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center">
              <i data-lucide="file-check" class="w-6 h-6"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                ${existingResume.file_name}
                <span class="px-2 py-0.5 text-[10px] rounded bg-[#22C55E]/20 text-[#22C55E] font-mono">PARSED</span>
              </h4>
              <p class="text-xs text-slate-400 mt-0.5 font-mono">
                ${(existingResume.file_size / 1024).toFixed(1)} KB · ${existingResume.page_count} Page(s) · Uploaded ${new Date(existingResume.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <a href="#student/analysis" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white text-xs font-bold hover:opacity-95 transition">
              View AI Analysis
            </a>
            <button id="delete-resume-btn" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#EF4444]/20 text-slate-300 hover:text-[#EF4444] text-xs font-semibold border border-white/10 transition">
              Remove
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Upload Form Box -->
      <div class="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <!-- Drag and Drop Dropzone -->
        <div id="drop-zone" class="border-2 border-dashed border-white/15 hover:border-[#7C5CFC]/60 rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer bg-[#111827]/40">
          <input type="file" id="file-input" accept=".pdf,.docx" class="hidden" />

          <div class="w-16 h-16 rounded-2xl bg-[#7C5CFC]/15 text-[#7C5CFC] flex items-center justify-center mx-auto mb-4">
            <i data-lucide="upload-cloud" class="w-8 h-8"></i>
          </div>

          <h3 class="text-lg font-bold text-white mb-1">
            ${existingResume ? 'Replace Document (Drag & Drop or Browse)' : 'Drag & Drop your resume here'}
          </h3>
          <p class="text-xs text-slate-400 mb-4">Supported formats: <span class="text-slate-200 font-semibold font-mono">PDF (.pdf), DOCX (.docx)</span> · Max size: 10 MB</p>

          <button type="button" id="browse-btn" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition inline-flex items-center gap-2">
            <i data-lucide="folder-search" class="w-4 h-4 text-[#22D3EE]"></i>
            <span>Browse Files</span>
          </button>
        </div>

        <!-- Selected File Information Bar -->
        <div id="file-info-bar" class="hidden p-4 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <i data-lucide="file" class="w-5 h-5 text-[#7C5CFC]"></i>
            <div>
              <div id="selected-file-name" class="text-xs font-bold text-white">document.pdf</div>
              <div id="selected-file-size" class="text-[11px] text-slate-400 font-mono">0 KB</div>
            </div>
          </div>
          <button id="clear-file-btn" class="text-slate-400 hover:text-white p-1">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Upload Progress Indicator -->
        <div id="progress-container" class="hidden space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-300">
            <span id="progress-status-text" class="flex items-center gap-2 font-mono">
              <span class="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
              Extracting document text & running AI analysis...
            </span>
            <span id="progress-pct" class="font-mono text-[#22D3EE]">0%</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div id="progress-fill" class="bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>

        <!-- Submit Button -->
        <button id="upload-btn" disabled class="w-full py-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#22D3EE] text-white font-bold text-sm shadow-xl shadow-[#7C5CFC]/25 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition flex items-center justify-center gap-2">
          <i data-lucide="sparkles" class="w-4 h-4"></i>
          <span>Process & Analyze Resume</span>
        </button>
      </div>

      <!-- Privacy & Quality Notes -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-400">
        <div class="p-4 rounded-xl bg-[#172033]/40 border border-white/5 flex items-start gap-2.5">
          <i data-lucide="shield" class="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5"></i>
          <div><strong class="text-white block">Private & Isolated</strong> Uploaded resumes are never shared with recruiters unless you apply.</div>
        </div>
        <div class="p-4 rounded-xl bg-[#172033]/40 border border-white/5 flex items-start gap-2.5">
          <i data-lucide="layers" class="w-4 h-4 text-[#7C5CFC] flex-shrink-0 mt-0.5"></i>
          <div><strong class="text-white block">Multi-Page Extraction</strong> Complete extraction using PyMuPDF and python-docx.</div>
        </div>
        <div class="p-4 rounded-xl bg-[#172033]/40 border border-white/5 flex items-start gap-2.5">
          <i data-lucide="check-circle" class="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5"></i>
          <div><strong class="text-white block">Honest Analysis</strong> Only factual details present in your document are extracted.</div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Attach drag-and-drop & file selection events
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const fileInfoBar = document.getElementById('file-info-bar');
  const fileNameEl = document.getElementById('selected-file-name');
  const fileSizeEl = document.getElementById('selected-file-size');
  const clearFileBtn = document.getElementById('clear-file-btn');
  const uploadBtn = document.getElementById('upload-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressFill = document.getElementById('progress-fill');
  const progressPct = document.getElementById('progress-pct');
  const progressText = document.getElementById('progress-status-text');

  let selectedFile = null;

  const handleFileSelect = (file) => {
    if (!file) return;
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      toast.error(`Unsupported file type '${ext}'. Please upload a .pdf or .docx document.`, 'Invalid Format');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds 10 MB limit. Please upload a smaller document.', 'File Too Large');
      return;
    }

    selectedFile = file;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
    fileInfoBar.classList.remove('hidden');
    uploadBtn.disabled = false;
  };

  browseBtn.onclick = () => fileInput.click();
  dropZone.onclick = (e) => {
    if (e.target !== browseBtn && !browseBtn.contains(e.target)) fileInput.click();
  };

  fileInput.onchange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Drag over / leave
  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
  };
  dropZone.ondragleave = () => {
    dropZone.classList.remove('drag-active');
  };
  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  clearFileBtn.onclick = () => {
    selectedFile = null;
    fileInput.value = '';
    fileInfoBar.classList.add('hidden');
    uploadBtn.disabled = true;
  };

  // Handle Upload
  uploadBtn.onclick = async () => {
    if (!selectedFile) return;

    uploadBtn.disabled = true;
    progressContainer.classList.remove('hidden');
    progressFill.style.width = '35%';
    progressPct.textContent = '35%';

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      progressFill.style.width = '65%';
      progressPct.textContent = '65%';

      const result = await api.upload('/student/upload-resume', formData);

      progressFill.style.width = '100%';
      progressPct.textContent = '100%';
      toast.success('Resume analyzed successfully!');

      setTimeout(() => {
        window.location.hash = '#student/analysis';
      }, 700);
    } catch (err) {
      progressContainer.classList.add('hidden');
      uploadBtn.disabled = false;
      toast.error(err.message, 'Resume Analysis Failed');
    }
  };

  // Handle Remove Existing Resume
  const deleteBtn = document.getElementById('delete-resume-btn');
  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      if (!confirm('Are you sure you want to remove your current resume? You can upload a new version immediately.')) return;
      try {
        await api.delete('/student/resume');
        toast.info('Resume removed.');
        renderResumeUploadPage(container);
      } catch (err) {
        toast.error(err.message);
      }
    };
  }
}
