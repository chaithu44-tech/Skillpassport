// Accessible Modal Dialog Controller
class ModalManager {
  constructor() {
    this.container = document.getElementById('modal-container');
  }

  getContainer() {
    if (!this.container) {
      this.container = document.getElementById('modal-container');
    }
    return this.container;
  }

  open({ title, content, size = 'max-w-xl', onClose = null }) {
    const container = this.getContainer();
    if (!container) return;

    this.onCloseCallback = onClose;

    container.innerHTML = `
      <div class="relative w-full ${size} bg-[#172033] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111827]/60">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">${title}</h3>
          <button id="modal-close-btn" class="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <!-- Modal Body -->
        <div class="p-6 max-h-[80vh] overflow-y-auto">
          ${content}
        </div>
      </div>
    `;

    container.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Hook close handlers
    document.getElementById('modal-close-btn').onclick = () => this.close();
    container.onclick = (e) => {
      if (e.target === container) this.close();
    };

    if (window.lucide) window.lucide.createIcons();
  }

  close() {
    const container = this.getContainer();
    if (!container) return;
    container.classList.add('hidden');
    container.innerHTML = '';
    document.body.style.overflow = '';
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }
  }
}

export const modal = new ModalManager();
