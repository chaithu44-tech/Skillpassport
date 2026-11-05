// Global Application State Manager
class StateManager {
  constructor() {
    this.state = {
      user: null,
      activePortal: 'public', // 'public' | 'student' | 'recruiter' | 'admin'
      currentRoute: window.location.hash || '#landing',
      notifications: [],
      unreadCount: 0,
      isLoading: false
    };
    this.listeners = [];
  }

  get() {
    return this.state;
  }

  set(partial) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.state);
      } catch (err) {
        console.error('State listener error:', err);
      }
    });
  }

  setUser(user) {
    let portal = 'public';
    if (user) {
      if (user.role === 'admin') portal = 'admin';
      else if (user.role === 'recruiter') portal = 'recruiter';
      else if (user.role === 'student') portal = 'student';
    }
    this.set({ user, activePortal: portal });
  }

  clearUser() {
    this.set({ user: null, activePortal: 'public', notifications: [], unreadCount: 0 });
  }
}

export const appState = new StateManager();
