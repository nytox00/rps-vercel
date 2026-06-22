// Rock Paper Scissors Game Logic
// Stores session streak in sessionStorage, all-time streak in localStorage

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const choiceButtons = document.querySelectorAll('.choice-btn');
  const playerScoreEl = document.getElementById('player-score');
  const aiScoreEl = document.getElementById('ai-score');
  const playerChoiceIconEl = document.getElementById('player-choice-icon');
  const aiChoiceIconEl = document.getElementById('ai-choice-icon');
  const resultMessageEl = document.getElementById('result-message');
  const resultStreakEl = document.getElementById('result-streak');
  const currentStreakValueEl = document.getElementById('current-streak-value');
  const sessionStreakDisplayEl = document.getElementById('session-streak-display');
  const alltimeStreakDisplayEl = document.getElementById('alltime-streak-display');
  const resetBtn = document.getElementById('reset-btn');
  const resetStatsBtn = document.getElementById('reset-stats-btn');
  const statWinsEl = document.getElementById('stat-wins');
  const statLossesEl = document.getElementById('stat-losses');
  const statDrawsEl = document.getElementById('stat-draws');
  const statWinrateEl = document.getElementById('stat-winrate');
  const statSessionStreakEl = document.getElementById('stat-session-streak');
  const statAlltimeStreakEl = document.getElementById('stat-alltime-streak');
  const historyListEl = document.getElementById('history-list');

  // Game state
  let playerScore = 0;
  let aiScore = 0;
  let sessionStreak = 0; // current consecutive wins in this session
  let alltimeStreak = 0; // best ever streak (loaded from localStorage)
  let gameHistory = []; // array of game results for this session

  // Choice mappings
  const choices = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️'
  };

  // Load persisted data
  function loadStats() {
    // Load all-time streak from localStorage
    const savedAlltimeStreak = localStorage.getItem('rpsAlltimeStreak');
    if (savedAlltimeStreak !== null) {
      alltimeStreak = parseInt(savedAlltimeStreak, 10);
    }
    
    // Load session stats from sessionStorage (if we want to survive refresh? 
    // Typically session streak resets on refresh, but we can keep wins/losses in sessionStorage if desired)
    // For now, we only persist all-time streak
    
    // Update displays
    updateStreakDisplays();
  }

  // Save all-time streak
  function saveAlltimeStreak() {
    localStorage.setItem('rpsAlltimeStreak', alltimeStreak.toString());
  }

  // Update streak displays in header
  function updateStreakDisplays() {
    sessionStreakDisplayEl.textContent = sessionStreak;
    alltimeStreakDisplayEl.textContent = alltimeStreak;
  }

  // Update score displays
  function updateScoreDisplays() {
    playerScoreEl.textContent = playerScore;
    aiScoreEl.textContent = aiScore;
  }

  // Update stats section
  function updateStats() {
    const totalGames = gameHistory.length;
    const wins = gameHistory.filter(result => result === 'win').length;
    const losses = gameHistory.filter(result => result === 'loss').length;
    const draws = gameHistory.filter(result => result === 'draw').length;
    const winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    statWinsEl.textContent = wins;
    statLossesEl.textContent = losses;
    statDrawsEl.textContent = draws;
    statWinrateEl.textContent = winrate + '%';
    statSessionStreakEl.textContent = sessionStreak;
    statAlltimeStreakEl.textContent = alltimeStreak;
    
    // Update history list
    renderHistory();
  }

  // Render history list
  function renderHistory() {
    if (gameHistory.length === 0) {
      historyListEl.innerHTML = '<p class="history-empty">No hay partidas registradas aún</p>';
      return;
    }

    // Show last 10 games
    const recentGames = gameHistory.slice(-10).reverse();
    historyListEl.innerHTML = recentGames.map((result, index) => {
      const gameNumber = gameHistory.length - index; // actual game number from start
      const resultText = result === 'win' ? 'Victoria' : result === 'loss' ? 'Derrota' : 'Empate';
      const resultClass = result === 'win' ? 'history-win' : result === 'loss' ? 'history-loss' : 'history-draw';
      return `<div class="history-item ${resultClass}">Partida #${gameNumber}: <span class="history-result">${resultText}</span></div>`;
    }).join('');
  }

  // Determine winner
  function determineWinner(playerChoice, aiChoice) {
    if (playerChoice === aiChoice) return 'draw';
    
    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    };
    
    return winConditions[playerChoice] === aiChoice ? 'win' : 'loss';
  }

  // Get random AI choice
  function getAIChoice() {
    const options = Object.keys(choices);
    return options[Math.floor(Math.random() * options.length)];
  }

  // Handle a round
  function playRound(playerChoice) {
    const aiChoice = getAIChoice();
    const result = determineWinner(playerChoice, aiChoice);
    
    // Update choice displays
    playerChoiceIconEl.textContent = choices[playerChoice];
    aiChoiceIconEl.textContent = choices[aiChoice];
    
    // Update result message
    switch (result) {
      case 'win':
        resultMessageEl.textContent = '¡Ganaste!';
        resultMessageEl.style.color = 'var(--color-develop)';
        playerScore++;
        sessionStreak++;
        if (sessionStreak > alltimeStreak) {
          alltimeStreak = sessionStreak;
          saveAlltimeStreak();
        }
        break;
      case 'loss':
        resultMessageEl.textContent = 'Perdiste.';
        resultMessageEl.style.color = 'var(--color-ship)';
        aiScore++;
        sessionStreak = 0; // reset session streak on loss
        break;
      case 'draw':
        resultMessageEl.textContent = 'Empate.';
        resultMessageEl.style.color = 'var(--color-preview)';
        sessionStreak = 0; // reset session streak on draw (optional, but typical)
        break;
    }
    
    // Update streak display in result area
    currentStreakValueEl.textContent = sessionStreak;
    resultStreakEl.hidden = false;
    
    // Add to history
    gameHistory.push(result);
    
    // Update all displays
    updateScoreDisplays();
    updateStreakDisplays();
    updateStats();
    
    // Add some visual feedback to the choice buttons
    choiceButtons.forEach(btn => {
      btn.style.transform = 'scale(1)';
      btn.style.transition = 'transform 0.1s';
    });
    
    // Optional: animate the winning choice
    setTimeout(() => {
      choiceButtons.forEach(btn => {
        btn.style.transform = '';
      });
    }, 200);
  }

  // Event listeners
  choiceButtons.forEach(button => {
    button.addEventListener('click', () => {
      const choice = button.dataset.choice;
      playRound(choice);
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key.toLowerCase()) {
      case '1':
        playRound('rock');
        break;
      case '2':
        playRound('paper');
        break;
      case '3':
        playRound('scissors');
        break;
      case 'r':
        // Reset game (scores only)
        playerScore = 0;
        aiScore = 0;
        sessionStreak = 0;
        updateScoreDisplays();
        updateStreakDisplays();
        resultMessageEl.textContent = 'Elige tu jugada para comenzar';
        resultMessageEl.style.color = '';
        playerChoiceIconEl.textContent = '—';
        aiChoiceIconEl.textContent = '—';
        resultStreakEl.hidden = true;
        break;
    }
  });

  // Reset game (scores only)
  resetBtn.addEventListener('click', () => {
    playerScore = 0;
    aiScore = 0;
    sessionStreak = 0;
    updateScoreDisplays();
    updateStreakDisplays();
    resultMessageEl.textContent = 'Elige tu jugada para comenzar';
    resultMessageEl.style.color = '';
    playerChoiceIconEl.textContent = '—';
    aiChoiceIconEl.textContent = '—';
    resultStreakEl.hidden = true;
  });

  // Reset all statistics
  resetStatsBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres borrar todas las estadísticas?')) {
      playerScore = 0;
      aiScore = 0;
      sessionStreak = 0;
      alltimeStreak = 0;
      gameHistory = [];
      localStorage.removeItem('rpsAlltimeStreak');
      updateScoreDisplays();
      updateStreakDisplays();
      updateStats();
      resultMessageEl.textContent = 'Elige tu jugada para comenzar';
      resultMessageEl.style.color = '';
      playerChoiceIconEl.textContent = '—';
      aiChoiceIconEl.textContent = '—';
      resultStreakEl.hidden = true;
    }
  });

  // Initialize
  loadStats();
  updateScoreDisplays();
  updateStats();
});

// Optional: Add focus ring styling for accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('user-is-tabbing');
});