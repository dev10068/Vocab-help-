(() => {
  'use strict';

  const state = { allWords: [], pyqWords: [], flashIndex: 0, quiz: { questions: [], currentIndex: 0, score: 0, answered: false } };
  const dom = {
    loadingScreen: document.getElementById('loadingScreen'),
    errorScreen: document.getElementById('errorScreen'),
    retryBtn: document.getElementById('retryBtn'),
    wordCountText: document.getElementById('wordCountText'),
    // ... baki sab same rahega
  };

  async function loadVocabData() {
    try {
      dom.loadingScreen.classList.remove('hidden');
      dom.errorScreen.classList.add('hidden');
      
      // cache: 'no-cache' zaruri hai taaki naya JSON load ho
      const response = await fetch('data.json', { cache: 'no-cache' });
      const data = await response.json();
      
      state.allWords = data.words;
      state.pyqWords = state.allWords.filter(w => w.isRepeated);
      dom.wordCountText.textContent = `Total: ${state.allWords.length} words`;
      
      dom.loadingScreen.classList.add('hidden');
      initApp(); 
    } catch (err) {
      console.error("Data load error:", err);
      dom.loadingScreen.classList.add('hidden');
      dom.errorScreen.classList.remove('hidden');
    }
  }

  function init() {
    dom.retryBtn.addEventListener('click', loadVocabData);
    loadVocabData();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
