(() => {
  'use strict';

  // 1. Data Store
  let state = { allWords: [], pyqWords: [] };
  let dom = {};

  // 2. Data Loader
  async function loadVocabData() {
    try {
      if(dom.loadingScreen) dom.loadingScreen.classList.remove('hidden');
      
      // cache: 'no-store' is critical here to avoid stale data from GitHub
      const response = await fetch('data.json?t=' + Date.now(), { cache: 'no-store' });
      const data = await response.json();
      
      state.allWords = data.words;
      state.pyqWords = state.allWords.filter(w => w.isRepeated);
      
      if(dom.wordCountText) dom.wordCountText.textContent = `Total: ${state.allWords.length} words`;
      if(dom.loadingScreen) dom.loadingScreen.classList.add('hidden');
      
      initNavigation();
    } catch (err) {
      if(dom.loadingScreen) dom.loadingScreen.classList.add('hidden');
      if(dom.errorScreen) dom.errorScreen.classList.remove('hidden');
      console.error("Fetch Error:", err);
    }
  }

  // 3. Navigation
  function initNavigation() {
    if(!dom.navButtons) return;
    
    dom.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        
        // Hide all screens
        Object.values(dom.screens).forEach(s => s && s.classList.add('hidden'));
        
        // Show target
        const active = document.getElementById(target);
        if(active) active.classList.remove('hidden');
        
        // Active class
        dom.navButtons.forEach(b => b.classList.remove('nav-btn--active'));
        btn.classList.add('nav-btn--active');
      });
    });
  }

  // 4. Initialization (The Safe Way)
  document.addEventListener('DOMContentLoaded', () => {
    // DOM ab pura load ho chuka hai, ab elements dhoondho
    dom = {
      loadingScreen: document.getElementById('loadingScreen'),
      errorScreen: document.getElementById('errorScreen'),
      retryBtn: document.getElementById('retryBtn'),
      wordCountText: document.getElementById('wordCountText'),
      navButtons: document.querySelectorAll('.nav-btn'),
      screens: {
        pyqSection: document.getElementById('pyqSection'),
        flashSection: document.getElementById('flashSection'),
        quizSection: document.getElementById('quizSection')
      }
    };

    if(dom.retryBtn) dom.retryBtn.addEventListener('click', loadVocabData);
    loadVocabData();
  });
})();
