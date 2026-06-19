/* =========================================================
   VocabMaster — Complete script.js
   ========================================================= */

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

  // 1. Data Fetching
  async function loadVocabData() {
    try {
      dom.loadingScreen.classList.remove('hidden');
      dom.errorScreen.classList.add('hidden');
      
      // cache: 'no-cache' ensures we always fetch the latest data.json
      const response = await fetch('data.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      state.allWords = data.words;
      state.pyqWords = state.allWords.filter(w => w.isRepeated);
      
      dom.wordCountText.textContent = `Total: ${state.allWords.length} words`;
      dom.loadingScreen.classList.add('hidden');
      
      // Initialize after successful load
      initNavigation();
      initFlashcardVault();
      initQuizArena();
    } catch (err) {
      console.error("Data load error:", err);
      dom.loadingScreen.classList.add('hidden');
      dom.errorScreen.classList.remove('hidden');
    }
  }

  // 2. Navigation
  function initNavigation() {
    dom.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.navButtons.forEach(b => b.classList.remove('nav-btn--active'));
        btn.classList.add('nav-btn--active');
        
        Object.values(dom.screens).forEach(s => s.classList.add('hidden'));
        const target = btn.getAttribute('data-target');
        document.getElementById(target).classList.remove('hidden');
      });
    });
  }

  // 3. Flashcards (Simplified Placeholder logic)
  function initFlashcardVault() {
    console.log("Flashcard Vault initialized");
  }

  // 4. Quiz Logic (Placeholder logic)
  function initQuizArena() {
    console.log("Quiz Arena initialized");
  }

  // 5. Bootstrap
  function init() {
    dom.retryBtn.addEventListener('click', loadVocabData);
    loadVocabData();
    registerServiceWorker();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW failed:', err));
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
