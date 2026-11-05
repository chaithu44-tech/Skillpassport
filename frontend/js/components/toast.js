// Animated Toast Notifications
class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
  }

  getContainer() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
    }
    return this.container;
  }

  show({ message, title = '', type = 'info', duration = 4500 }) {
    const container = this.getContainer();
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-panel shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 max-w-md w-full';

    // Type styles
    let borderClass = 'border-white/10';
    let iconName = 'info';
    let iconColor = 'text-[#22D3EE]';

    if (type === 'success') {
      borderClass = 'border-[#22C55E]/30 bg-[#22C55E]/10';
      iconName = 'check-circle-2';
      iconColor = 'text-[#22C55E]';
    } else if (type === 'error') {
      borderClass = 'border-[#EF4444]/30 bg-[#EF4444]/10';
      iconName = 'alert-triangle';
      iconColor = 'text-[#EF4444]';
    } else if (type === 'warning') {
      borderClass = 'border-[#F59E0B]/30 bg-[#F59E0B]/10';
      iconName = 'alert-circle';
      iconColor = 'text-[#F59E0B]';
    } else {
      borderClass = 'border-[#7C5CFC]/30 bg-[#7C5CFC]/10';
      iconName = 'bell';
      iconColor = 'text-[#7C5CFC]';
    }

    toast.classList.add(...borderClass.split(' '));

    toast.innerHTML = `
      <div class="mt-0.5 flex-shrink-0 ${iconColor}">
        <i data-lucide="${iconName}" class="w-5 h-5"></i>
      </div>
      <div class="flex-1 text-sm">
        ${title ? `<h4 class="font-semibold text-white mb-0.5">${title}</h4>` : ''}
        <p class="text-slate-300 leading-snug">${message}</p>
      </div>
      <button class="text-slate-400 hover:text-white flex-shrink-0 ml-2" onclick="this.parentElement.remove()">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    // Auto remove
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(msg, title = 'Success') {
    this.show({ message: msg, title, type: 'success' });
  }

  error(msg, title = 'Error') {
    this.show({ message: msg, title, type: 'error' });
  }

  warning(msg, title = 'Warning') {
    this.show({ message: msg, title, type: 'warning' });
  }

  info(msg, title = 'Information') {
    this.show({ message: msg, title, type: 'info' });
  }
}

export const toast = new ToastManager();
