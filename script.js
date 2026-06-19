(() => {
  'use strict';

  let state = { allWords: [], pyqWords: [] };
  let dom = {};

  async function loadVocabData() {
    try {
      // Direct fetch, cache disable karke
      const response = await fetch('data.json?t=' + new Date().getTime(), { cache: 'no-store' });
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

  function initNavigation() {
    dom.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        Object.values(dom.screens).forEach(s => s && s.classList.add('hidden'));
        const active = document.getElementById(target);
        if(active) active.classList.remove('hidden');
        dom.navButtons.forEach(b => b.classList.remove('nav-btn--active'));
        btn.classList.add('nav-btn--active');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
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
