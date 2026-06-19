(() => {
  'use strict';

  const state = {
    allWords: [],
    pyqWords: [],
    flashIndex: 0,
    quiz: { questions: [], currentIndex: 0, score: 0, answered: false }
  };

  // DOM elements ko yahan global mat rakho, inhe init() ke andar define karo
  let dom = {};

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
        
        Object.values(dom.screens).forEach(s => {
          if(s) s.classList.add('hidden');
        });
        
        const activeScreen = document.getElementById(target);
        if(activeScreen) activeScreen.classList.remove('hidden');
        
        dom.navButtons.forEach(b => b.classList.remove('nav-btn--active'));
        btn.classList.add('nav-btn--active');
      });
    });
  }

  function init() {
    // Ab jab DOM content load ho gaya hai, tab elements dhoondho
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
  }

  document.addEventListener('DOMContentLoaded', init);
})();
