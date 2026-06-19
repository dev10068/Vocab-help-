(() => {
  'use strict';

  const state = {
    allWords: [],
    pyqWords: [],
    flashIndex: 0,
    quiz: { questions: [], currentIndex: 0, score: 0, answered: false }
  };

  const dom = {
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

  async function loadVocabData() {
    try {
      dom.loadingScreen.classList.remove('hidden');
      dom.errorScreen.classList.add('hidden');
      
      const response = await fetch('data.json', { cache: 'no-cache' });
      const data = await response.json();
      
      state.allWords = data.words;
      state.pyqWords = state.allWords.filter(w => w.isRepeated);
      
      dom.wordCountText.textContent = `Total: ${state.allWords.length} words`;
      dom.loadingScreen.classList.add('hidden');
      
      // Data load hone ke baad hi navigation initialize karo
      initNavigation();
    } catch (err) {
      console.error("Data load error:", err);
      dom.loadingScreen.classList.add('hidden');
      dom.errorScreen.classList.remove('hidden');
    }
  }

  function initNavigation() {
    dom.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        
        // Sabhi screens ko hide karo
        Object.values(dom.screens).forEach(s => {
          if(s) s.classList.add('hidden');
        });
        
        // Target screen dikhao
        const activeScreen = document.getElementById(target);
        if(activeScreen) activeScreen.classList.remove('hidden');
        
        // Active class update karo
        dom.navButtons.forEach(b => b.classList.remove('nav-btn--active'));
        btn.classList.add('nav-btn--active');
      });
    });
  }

  function init() {
    if(dom.retryBtn) dom.retryBtn.addEventListener('click', loadVocabData);
    loadVocabData();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
