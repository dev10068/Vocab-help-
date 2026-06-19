/* =========================================================
   VocabMaster — script.js
   All app logic lives here, organized into small modules:
     1. State & DOM refs
     2. Data loading (fetch data.json)
     3. Navigation (switch between the 3 screens)
     4. PYQ Master module
     5. Flashcard Vault module
     6. Quiz Arena module
     7. Bootstrapping
   ========================================================= */

(() => {
  'use strict';

  /* ---------------------------------------------------------
     1. STATE & DOM REFERENCES
     --------------------------------------------------------- */
  const state = {
    allWords: [],      // full word bank loaded from data.json
    pyqWords: [],       // filtered subset where isRepeated === true
    flashIndex: 0,      // current card index in Flashcard Vault
    quiz: {
      questions: [],    // shuffled set of quiz questions for this round
      currentIndex: 0,
      score: 0,
      answered: false
    }
  };

  const QUIZ_LENGTH = 10;     // number of questions per quiz round
  const OPTIONS_PER_QUESTION = 4;

  const dom = {
    loadingScreen: document.getElementById('loadingScreen'),
    errorScreen: document.getElementById('errorScreen'),
    retryBtn: document.getElementById('retryBtn'),
    wordCountText: document.getElementById('wordCountText'),

    // nav
    navButtons: document.querySelectorAll('.nav-btn'),
    screens: {
      pyqSection: document.getElementById('pyqSection'),
      flashSection: document.getElementById('flashSection'),
      quizSection: document.getElementById('quizSection')
    },

    // PYQ
    pyqList: document.getElementById('pyqList'),
    pyqCount: document.getElementById('pyqCount'),

    // Flashcards
    flashcard: document.getElementById('flashcard'),
    flashcardInner: document.getElementById('flashcardInner'),
    flashWord: document.getElementById('flashWord'),
    flashTagFront: document.getElementById('flashTagFront'),
    flashMeaning: document.getElementById('flashMeaning'),
    flashTrick: document.getElementById('flashTrick'),
    flashSynonym: document.getElementById('flashSynonym'),
    flashAntonym: document.getElementById('flashAntonym'),
    flashPosition: document.getElementById('flashPosition'),
    flashProgressFill: document.getElementById('flashProgressFill'),
    flashPrevBtn: document.getElementById('flashPrevBtn'),
    flashNextBtn: document.getElementById('flashNextBtn'),
    flashFlipBtn: document.getElementById('flashFlipBtn'),

    // Quiz
    quizIntro: document.getElementById('quizIntro'),
    quizActive: document.getElementById('quizActive'),
    quizResult: document.getElementById('quizResult'),
    startQuizBtn: document.getElementById('startQuizBtn'),
    restartQuizBtn: document.getElementById('restartQuizBtn'),
    quizProgress: document.getElementById('quizProgress'),
    quizProgressFill: document.getElementById('quizProgressFill'),
    quizScore: document.getElementById('quizScore'),
    quizWord: document.getElementById('quizWord'),
    quizOptions: document.getElementById('quizOptions'),
    quizFeedback: document.getElementById('quizFeedback'),
    quizFeedbackTitle: document.getElementById('quizFeedbackTitle'),
    quizExplanation: document.getElementById('quizExplanation'),
    quizExamples: document.getElementById('quizExamples'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),
    resultEmoji: document.getElementById('resultEmoji'),
    resultScoreText: document.getElementById('resultScoreText'),
    resultMessage: document.getElementById('resultMessage')
  };

  /* ---------------------------------------------------------
     2. DATA LOADING
     --------------------------------------------------------- */

  /**
   * Loads data.json asynchronously using fetch().
   * Keeping this isolated makes it trivial to later swap the source
   * (e.g. multiple JSON chunks, or an API) without touching UI code.
   */
  async function loadVocabData() {
    showLoading();
    try {
      const response = await fetch('data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (!Array.isArray(data.words)) {
        throw new Error('data.json is missing a valid "words" array.');
      }

      state.allWords = data.words;
      state.pyqWords = data.words.filter(w => w.isRepeated === true);

      onDataReady();
    } catch (err) {
      console.error('Failed to load vocabulary data:', err);
      showError();
    }
  }

  function showLoading() {
    dom.loadingScreen.classList.remove('hidden');
    dom.errorScreen.classList.add('hidden');
  }

  function showError() {
    dom.loadingScreen.classList.add('hidden');
    dom.errorScreen.classList.remove('hidden');
  }

  function onDataReady() {
    dom.loadingScreen.classList.add('hidden');
    dom.errorScreen.classList.add('hidden');

    dom.wordCountText.textContent = `${state.allWords.length} words`;

    renderPyqList();
    renderFlashcard(0);

    // Reveal the default screen (PYQ Master)
    setActiveScreen('pyqSection');
  }

  /* ---------------------------------------------------------
     3. NAVIGATION
     --------------------------------------------------------- */

  function setActiveScreen(targetId) {
    Object.entries(dom.screens).forEach(([id, el]) => {
      el.classList.toggle('hidden', id !== targetId);
    });

    dom.navButtons.forEach(btn => {
      btn.classList.toggle('nav-btn--active', btn.dataset.target === targetId);
    });
  }

  function initNavigation() {
    dom.navButtons.forEach(btn => {
      btn.addEventListener('click', () => setActiveScreen(btn.dataset.target));
    });
  }

  /* ---------------------------------------------------------
     4. PYQ MASTER MODULE
     --------------------------------------------------------- */

  function renderPyqList() {
    dom.pyqCount.textContent = `${state.pyqWords.length} PYQ Words`;

    if (state.pyqWords.length === 0) {
      dom.pyqList.innerHTML = `<div class="empty-state">No PYQ-tagged words yet. Add entries with "isRepeated": true in data.json.</div>`;
      return;
    }

    dom.pyqList.innerHTML = state.pyqWords.map(word => `
      <article class="word-card">
        <div class="word-card__top">
          <h3 class="word-card__word">${escapeHtml(word.word)}</h3>
          <span class="word-card__tag">${escapeHtml(word.examTag || 'PYQ')}</span>
        </div>
        <p class="word-card__meaning">${escapeHtml(word.meaning)}</p>
        <p class="word-card__trick">🧠 ${escapeHtml(word.trick)}</p>
      </article>
    `).join('');
  }

  /* ---------------------------------------------------------
     5. FLASHCARD VAULT MODULE
     --------------------------------------------------------- */

  function renderFlashcard(index) {
    const word = state.allWords[index];
    if (!word) return;

    state.flashIndex = index;

    // Reset flip state for the new card
    dom.flashcardInner.classList.remove('is-flipped');

    dom.flashTagFront.textContent = word.isRepeated ? '⭐ PYQ Word' : 'New Word';
    dom.flashWord.textContent = word.word;
    dom.flashMeaning.textContent = word.meaning;
    dom.flashTrick.textContent = word.trick;
    dom.flashSynonym.textContent = word.synonym || '—';
    dom.flashAntonym.textContent = word.antonym || '—';

    dom.flashPosition.textContent = `${index + 1} / ${state.allWords.length}`;
    const progressPct = ((index + 1) / state.allWords.length) * 100;
    dom.flashProgressFill.style.width = `${progressPct}%`;

    dom.flashPrevBtn.disabled = index === 0;
    dom.flashNextBtn.disabled = index === state.allWords.length - 1;
  }

  function flipFlashcard() {
    dom.flashcardInner.classList.toggle('is-flipped');
  }

  function goToFlashcard(delta) {
    const newIndex = state.flashIndex + delta;
    if (newIndex < 0 || newIndex >= state.allWords.length) return;
    renderFlashcard(newIndex);
  }

  function initFlashcardVault() {
    dom.flashcard.addEventListener('click', flipFlashcard);
    dom.flashFlipBtn.addEventListener('click', flipFlashcard);
    dom.flashPrevBtn.addEventListener('click', () => goToFlashcard(-1));
    dom.flashNextBtn.addEventListener('click', () => goToFlashcard(1));
  }

  /* ---------------------------------------------------------
     6. QUIZ ARENA MODULE
     --------------------------------------------------------- */

  /** Fisher-Yates shuffle — used to randomize question order and options. */
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Builds a quiz question for a given word: the correct meaning plus
   * 3 distractor meanings randomly pulled from other words in the bank.
   */
  function buildQuestion(word, allWords) {
    const distractorPool = allWords.filter(w => w.id !== word.id);
    const distractors = shuffle(distractorPool)
      .slice(0, OPTIONS_PER_QUESTION - 1)
      .map(w => w.meaning);

    const options = shuffle([word.meaning, ...distractors]);

    return {
      word: word.word,
      correctAnswer: word.meaning,
      options,
      trick: word.trick,
      examples: word.examples || []
    };
  }

  function startNewQuiz() {
    const wordPool = shuffle(state.allWords).slice(0, Math.min(QUIZ_LENGTH, state.allWords.length));
    state.quiz.questions = wordPool.map(word => buildQuestion(word, state.allWords));
    state.quiz.currentIndex = 0;
    state.quiz.score = 0;

    dom.quizIntro.classList.add('hidden');
    dom.quizResult.classList.add('hidden');
    dom.quizActive.classList.remove('hidden');

    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const { questions, currentIndex, score } = state.quiz;
    const question = questions[currentIndex];

    state.quiz.answered = false;

    dom.quizProgress.textContent = `Question ${currentIndex + 1} / ${questions.length}`;
    dom.quizScore.textContent = `Score: ${score}`;
    dom.quizProgressFill.style.width = `${((currentIndex) / questions.length) * 100}%`;

    dom.quizWord.textContent = question.word;
    dom.quizFeedback.classList.add('hidden');

    dom.quizOptions.innerHTML = question.options.map((opt, i) => `
      <button class="quiz-option" data-index="${i}">${escapeHtml(opt)}</button>
    `).join('');

    // Attach listeners to the freshly rendered option buttons
    dom.quizOptions.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', onAnswerSelected);
    });
  }

  function onAnswerSelected(e) {
    if (state.quiz.answered) return; // prevent double answering
    state.quiz.answered = true;

    const question = state.quiz.questions[state.quiz.currentIndex];
    const selectedText = e.currentTarget.textContent;
    const isCorrect = selectedText === question.correctAnswer;

    if (isCorrect) state.quiz.score += 1;
    dom.quizScore.textContent = `Score: ${state.quiz.score}`;

    // Lock all options and mark correct/wrong
    dom.quizOptions.querySelectorAll('.quiz-option').forEach(btn => {
      btn.classList.add('is-disabled');
      if (btn.textContent === question.correctAnswer) {
        btn.classList.add('is-correct');
      } else if (btn === e.currentTarget) {
        btn.classList.add('is-wrong');
      }
    });

    // Show feedback: Correct/Wrong + explanation + 2 real-life examples
    dom.quizFeedback.classList.remove('hidden');
    dom.quizFeedbackTitle.textContent = isCorrect ? '✅ Correct!' : '❌ Wrong!';
    dom.quizFeedbackTitle.className = 'quiz-feedback__title ' +
      (isCorrect ? 'quiz-feedback__title--correct' : 'quiz-feedback__title--wrong');

    dom.quizExplanation.textContent = question.trick;
    dom.quizExamples.innerHTML = question.examples
      .slice(0, 2)
      .map(ex => `<li>${escapeHtml(ex)}</li>`)
      .join('');

    // Update the progress bar to reflect this question being completed
    dom.quizProgressFill.style.width = `${((state.quiz.currentIndex + 1) / state.quiz.questions.length) * 100}%`;
  }

  function goToNextQuestion() {
    state.quiz.currentIndex += 1;
    if (state.quiz.currentIndex >= state.quiz.questions.length) {
      showQuizResult();
    } else {
      renderQuizQuestion();
    }
  }

  function showQuizResult() {
    dom.quizActive.classList.add('hidden');
    dom.quizResult.classList.remove('hidden');

    const { score, questions } = state.quiz;
    const total = questions.length;
    const pct = (score / total) * 100;

    dom.resultScoreText.textContent = `You scored ${score} / ${total}`;

    if (pct >= 80) {
      dom.resultEmoji.textContent = '🏆';
      dom.resultMessage.textContent = 'Outstanding! You are exam-ready on these words.';
    } else if (pct >= 50) {
      dom.resultEmoji.textContent = '👍';
      dom.resultMessage.textContent = 'Good effort! Revisit the Flashcard Vault for the ones you missed.';
    } else {
      dom.resultEmoji.textContent = '💪';
      dom.resultMessage.textContent = "Don't worry — practice in the Flashcard Vault and try again.";
    }
  }

  function resetQuizToIntro() {
    dom.quizResult.classList.add('hidden');
    dom.quizActive.classList.add('hidden');
    dom.quizIntro.classList.remove('hidden');
  }

  function initQuizArena() {
    dom.startQuizBtn.addEventListener('click', startNewQuiz);
    dom.nextQuestionBtn.addEventListener('click', goToNextQuestion);
    dom.restartQuizBtn.addEventListener('click', () => {
      resetQuizToIntro();
      startNewQuiz();
    });
  }

  /* ---------------------------------------------------------
     UTILITIES
     --------------------------------------------------------- */

  /** Basic HTML-escaping to keep injected text safe, since data.json
   *  content gets written into innerHTML throughout the app. */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ---------------------------------------------------------
     7. BOOTSTRAP
     --------------------------------------------------------- */

  function init() {
    initNavigation();
    initFlashcardVault();
    initQuizArena();
    dom.retryBtn.addEventListener('click', loadVocabData);
    loadVocabData();
    registerServiceWorker();
  }

  /**
   * Registers sw.js so the app shell + data.json get cached.
   * After the first successful online visit, the app will keep
   * working with no internet connection.
   */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    // First unregister old broken SWs, then register fresh one
    navigator.serviceWorker.getRegistrations().then(registrations => {
      Promise.all(registrations.map(r => r.unregister())).then(() => {
        navigator.serviceWorker.register('sw.js').catch(err => {
          console.warn('SW registration failed:', err);
        });
      });
    });
  }
}
