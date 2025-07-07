// SNAKE MASTER GAME - ADVANCED IMPLEMENTATION
// ==========================================

class SnakeGameEngine {
  constructor() {
    this.canvas = document.getElementById('gameField');
    this.ctx = this.canvas.getContext('2d');
    
    // Game Configuration
    this.GRID_SIZE = 24;
    this.TILE_COUNT = 20;
    this.INITIAL_SPEED = 200;
    this.MIN_SPEED = 80;
    this.SPEED_INCREMENT = 8;
    this.WIN_SCORE = 100;
    
    // Game State
    this.gameState = {
      running: false,
      paused: false,
      gameOver: false,
      score: 0,
      level: 1,
      speed: this.INITIAL_SPEED
    };
    
    // Snake Properties
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = this.generateFood();
    
    // Game Modes
    this.isAIMode = false;
    this.audioEnabled = true;
    this.theme = 'dark';
    
    // Statistics
    this.stats = {
      bestScore: 0,
      totalGames: 0,
      wins: 0,
      currentStreak: 0,
      achievements: new Set()
    };
    
    // Input Buffer
    this.inputBuffer = [];
    this.MAX_BUFFER = 3;
    
    // Touch/Mobile Properties
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.minSwipeDistance = 50;
    this.isMobile = this.detectMobile();
    
    // Animation Frame
    this.lastTime = 0;
    this.animationId = null;
    
    this.initialize();
  }
  
  // Mobile Detection
  detectMobile() {
    const mobileCheck = 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (window.innerWidth <= 968) ||
      (window.innerHeight <= 600);
    
    console.log('📱 Mobile detection result:', mobileCheck);
    return mobileCheck;
  }
  
  initialize() {
    this.loadGameData();
    this.setupEventListeners();
    this.setupAudio();
    this.updateUI();
    this.startRenderLoop();
    
    // Force mobile mode for testing
    this.isMobile = true;
    console.log('🔧 FORCED mobile mode for testing');
    
    const title = 'Snake Master';
    const message = this.isMobile ? 
      'Tap START GAME to begin!' : 
      'Press SPACE to begin your journey';
    this.showOverlay(title, message);
  }
  
  // Audio System
  setupAudio() {
    this.audioContext = null;
    this.sounds = {
      eat: { freq: 440, duration: 0.1 },
      move: { freq: 220, duration: 0.05 },
      gameOver: { freq: 150, duration: 0.5 },
      win: { freq: 880, duration: 0.3 },
      achievement: { freq: 660, duration: 0.2 }
    };
    
    // Initialize AudioContext on first user interaction
    document.addEventListener('click', this.initAudioContext.bind(this), { once: true });
    document.addEventListener('keydown', this.initAudioContext.bind(this), { once: true });
    document.addEventListener('touchstart', this.initAudioContext.bind(this), { once: true });
  }
  
  initAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Audio not supported:', error);
      }
    }
    
    // Prevent pull-to-refresh on mobile
    if (this.isMobile) {
      document.body.style.overscrollBehavior = 'none';
    }
  }
  
  playSound(soundName) {
    if (!this.audioEnabled || !this.audioContext || !this.sounds[soundName]) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      const sound = this.sounds[soundName];
      oscillator.frequency.setValueAtTime(sound.freq, this.audioContext.currentTime);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + sound.duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }
  
  // AI System
  getAIMove() {
    const head = this.snake[0];
    const possibleMoves = [
      { x: 0, y: -1, name: 'up' },
      { x: 0, y: 1, name: 'down' },
      { x: -1, y: 0, name: 'left' },
      { x: 1, y: 0, name: 'right' }
    ];
    
    // Filter out moves that would cause immediate death
    const safeMoves = possibleMoves.filter(move => {
      const newPos = { x: head.x + move.x, y: head.y + move.y };
      
      // Check wall collision
      if (newPos.x < 0 || newPos.x >= this.TILE_COUNT || 
          newPos.y < 0 || newPos.y >= this.TILE_COUNT) {
        return false;
      }
      
      // Check self collision
      if (this.snake.some(segment => segment.x === newPos.x && segment.y === newPos.y)) {
        return false;
      }
      
      // Prevent 180-degree turns
      if (move.x === -this.direction.x && move.y === -this.direction.y) {
        return false;
      }
      
      return true;
    });
    
    if (safeMoves.length === 0) {
      // Emergency fallback - try any move
      return possibleMoves.find(move => 
        !(move.x === -this.direction.x && move.y === -this.direction.y)
      ) || { x: 0, y: -1 };
    }
    
    // Score each safe move
    const scoredMoves = safeMoves.map(move => {
      const newPos = { x: head.x + move.x, y: head.y + move.y };
      let score = 0;
      
      // Distance to food (Manhattan distance)
      const foodDistance = Math.abs(newPos.x - this.food.x) + Math.abs(newPos.y - this.food.y);
      score += (this.TILE_COUNT * 2 - foodDistance) * 10;
      
      // Distance from walls
      const wallDistance = Math.min(
        newPos.x, this.TILE_COUNT - 1 - newPos.x,
        newPos.y, this.TILE_COUNT - 1 - newPos.y
      );
      score += wallDistance * 5;
      
      // Prefer continuing in same direction
      if (move.x === this.direction.x && move.y === this.direction.y) {
        score += 15;
      }
      
      // Avoid areas with high snake density
      let nearbySegments = 0;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const checkPos = { x: newPos.x + dx, y: newPos.y + dy };
          if (this.snake.some(segment => segment.x === checkPos.x && segment.y === checkPos.y)) {
            nearbySegments++;
          }
        }
      }
      score -= nearbySegments * 3;
      
      return { move, score };
    });
    
    // Sort by score and add some randomness
    scoredMoves.sort((a, b) => b.score - a.score);
    const bestScore = scoredMoves[0].score;
    const bestMoves = scoredMoves.filter(m => m.score >= bestScore - 5);
    
    return bestMoves[Math.floor(Math.random() * bestMoves.length)].move;
  }
  
  // Food Generation
  generateFood() {
    let food;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      food = {
        x: Math.floor(Math.random() * this.TILE_COUNT),
        y: Math.floor(Math.random() * this.TILE_COUNT)
      };
      attempts++;
    } while (
      attempts < maxAttempts &&
      this.snake.some(segment => segment.x === food.x && segment.y === food.y)
    );
    
    return food;
  }
  
  // Input Management
  setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', this.handleKeyInput.bind(this));
    document.getElementById('themeBtn').addEventListener('click', this.toggleTheme.bind(this));
    document.getElementById('audioBtn').addEventListener('click', this.toggleAudio.bind(this));
    document.getElementById('modeBtn').addEventListener('click', this.toggleAIMode.bind(this));
    
    // Mobile touch controls
    if (this.isMobile) {
      this.setupTouchControls();
      this.setupSwipeControls();
      document.body.classList.add('game-active');
    }
    
    // Handle orientation changes
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    window.addEventListener('resize', this.handleOrientationChange.bind(this));
    
    // Prevent default behavior for game keys
    document.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });
  }
  
  setupTouchControls() {
    console.log('🔧 Setting up touch controls for mobile...');
    console.log('📱 Mobile detected:', this.isMobile);
    
    // Touch button controls
    const touchButtons = [
      { id: 'upBtn', direction: { x: 0, y: -1 } },
      { id: 'downBtn', direction: { x: 0, y: 1 } },
      { id: 'leftBtn', direction: { x: -1, y: 0 } },
      { id: 'rightBtn', direction: { x: 1, y: 0 } }
    ];
    
    touchButtons.forEach(({ id, direction }) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.handleTouchMove(direction);
          this.addTouchFeedback(e.target);
        });
        
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleTouchMove(direction);
          this.addTouchFeedback(e.target);
        });
      }
    });
    
    // Pause button
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
      pauseBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.togglePause();
        this.addTouchFeedback(e.target);
      });
      
      pauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.togglePause();
        this.addTouchFeedback(e.target);
      });
    }
    
    // Mobile start button - CRITICAL FIX
    const mobileStartBtn = document.getElementById('mobileStartBtn');
    if (mobileStartBtn) {
      console.log('✅ Mobile start button found and being connected!');
      
      // TOUCHSTART event for mobile
      mobileStartBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('📱 Mobile start button TOUCHED!');
        this.handleMobileStart();
        this.addTouchFeedback(e.target);
      }, { passive: false });
      
      // CLICK event for compatibility
      mobileStartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Mobile start button CLICKED!');
        this.handleMobileStart();
        this.addTouchFeedback(e.target);
      });
      
      // Make sure button is visible on mobile
      if (this.isMobile) {
        mobileStartBtn.style.display = 'inline-block';
        console.log('👀 Mobile start button made visible!');
      }
      
    } else {
      console.error('❌ CRITICAL: Mobile start button not found! Check your HTML for id="mobileStartBtn"');
      console.log('🔍 Available elements:', document.querySelectorAll('button'));
    }
    
    // Prevent scrolling on touch controls
    document.querySelectorAll('.touch-btn, .mobile-start-btn').forEach(btn => {
      btn.addEventListener('touchmove', (e) => e.preventDefault());
      btn.addEventListener('touchend', (e) => e.preventDefault());
    });
  }

  // Mobile start button handler
  handleMobileStart() {
    console.log('🚀 Mobile start button pressed!');
    
    if (!this.gameState.running) {
      // Start or restart the game
      if (this.gameState.gameOver) {
        this.resetGame();
        setTimeout(() => this.startGame(), 50);
      } else {
        this.startGame();
      }
    } else if (this.gameState.paused) {
      // Resume paused game
      this.togglePause();
    } else {
      // Pause running game
      this.togglePause();
    }
  }

  setupSwipeControls() {
    const gameArea = document.getElementById('gameField');
    
    gameArea.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    }, { passive: false });
    
    gameArea.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
    
    gameArea.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (!e.changedTouches[0]) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Check if swipe is long enough
      if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) {
        // Short tap on canvas - only pause/resume if game is running
        if (this.gameState.running) {
          this.togglePause();
        }
        // Don't start game from canvas tap - use START button instead
        return;
      }
      
      // Only process swipes if game is running and not paused
      if (!this.gameState.running || this.gameState.paused) return;
      
      // Determine swipe direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          this.handleTouchMove({ x: 1, y: 0 }); // Right
        } else {
          this.handleTouchMove({ x: -1, y: 0 }); // Left
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          this.handleTouchMove({ x: 0, y: 1 }); // Down
        } else {
          this.handleTouchMove({ x: 0, y: -1 }); // Up
        }
      }
    }, { passive: false });
  }
  
  handleTouchMove(direction) {
    if (!this.gameState.running || this.gameState.paused || this.isAIMode) return;
    this.queueMove(direction);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
  
  addTouchFeedback(element) {
    element.classList.add('touch-feedback');
    setTimeout(() => {
      element.classList.remove('touch-feedback');
    }, 200);
  }
  
  handleOrientationChange() {
    setTimeout(() => {
      this.render();
    }, 100);
  }
  
  handleKeyInput(event) {
    const key = event.code;
    
    switch (key) {
      case 'Space':
        this.handleSpaceKey();
        break;
      case 'KeyP':
        this.togglePause();
        break;
      case 'Escape':
        this.resetStats();
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.queueMove({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.queueMove({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.queueMove({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.queueMove({ x: 1, y: 0 });
        break;
    }
  }
  
  handleSpaceKey() {
    if (!this.gameState.running) {
      this.startGame();
    } else if (this.gameState.gameOver) {
      this.resetGame();
    } else {
      this.togglePause();
    }
  }
  
  queueMove(newDirection) {
    if (!this.gameState.running || this.gameState.paused || this.isAIMode) return;
    
    // Prevent opposite direction
    if (newDirection.x === -this.direction.x && newDirection.y === -this.direction.y) return;
    
    // Add to buffer if not full
    if (this.inputBuffer.length < this.MAX_BUFFER) {
      this.inputBuffer.push(newDirection);
    }
  }
  
  processInputBuffer() {
    if (this.inputBuffer.length > 0) {
      const move = this.inputBuffer.shift();
      // Double-check for opposite direction
      if (!(move.x === -this.direction.x && move.y === -this.direction.y)) {
        this.nextDirection = move;
      }
    }
  }
  
  // Game Logic
  startGame() {
    console.log('🎮 Starting game...');
    this.gameState.running = true;
    this.gameState.paused = false;
    this.gameState.gameOver = false;
    this.hideOverlay();
    this.updateGameStatus('Playing');
    this.playSound('move');
  }
  
  resetGame() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = this.generateFood();
    this.gameState.score = 0;
    this.gameState.level = 1;
    this.gameState.speed = this.INITIAL_SPEED;
    this.gameState.running = false;
    this.gameState.paused = false;
    this.gameState.gameOver = false;
    this.inputBuffer = [];
    
    this.updateUI();
    
    const title = 'Snake Master';
    const message = this.isMobile ? 
      'Tap START GAME to begin!' : 
      'Press SPACE to begin your journey';
    this.showOverlay(title, message);
    this.updateGameStatus('Ready to Play');
  }
  
  togglePause() {
    if (!this.gameState.running) return;
    
    this.gameState.paused = !this.gameState.paused;
    if (this.gameState.paused) {
      const message = this.isMobile ? 
        'Game Paused' : 
        'Press P or SPACE to continue';
      this.showOverlay('Paused', message);
      this.updateGameStatus('Paused');
    } else {
      this.hideOverlay();
      this.updateGameStatus('Playing');
    }
  }
  
  updateGame() {
    if (!this.gameState.running || this.gameState.paused || this.gameState.gameOver) return;
    
    // Process input
    if (this.isAIMode) {
      this.nextDirection = this.getAIMove();
    } else {
      this.processInputBuffer();
    }
    
    // Update direction
    this.direction = { ...this.nextDirection };
    
    // Calculate new head position
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= this.TILE_COUNT || 
        head.y < 0 || head.y >= this.TILE_COUNT) {
      this.endGame(false);
      return;
    }
    
    // Check self collision
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.endGame(false);
      return;
    }
    
    // Add new head
    this.snake.unshift(head);
    
    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.eatFood();
    } else {
      this.snake.pop();
    }
    
    // Check win condition
    if (this.gameState.score >= this.WIN_SCORE) {
      this.endGame(true);
    }
  }
  
  eatFood() {
    this.gameState.score += 10;
    this.food = this.generateFood();
    this.playSound('eat');
    
    // Increase speed every 30 points
    if (this.gameState.score % 30 === 0) {
      this.gameState.speed = Math.max(this.MIN_SPEED, this.gameState.speed - this.SPEED_INCREMENT);
      this.gameState.level = Math.floor(this.gameState.score / 30) + 1;
    }
    
    // Visual feedback
    this.addScoreAnimation();
    this.updateUI();
  }
  
  endGame(isWin) {
    this.gameState.gameOver = true;
    this.gameState.running = false;
    this.stats.totalGames++;
    
    if (isWin) {
      this.stats.wins++;
      this.stats.currentStreak++;
      this.playSound('win');
      const message = `CONGRATULATIONS! You reached ${this.gameState.score} points and WON!`;
      this.showOverlay('🎉 VICTORY! 🎉', message);
      this.updateGameStatus('Victory!');
      this.addVictoryAnimation();
      this.checkAchievements('win');
    } else {
      this.stats.currentStreak = 0;
      this.playSound('gameOver');
      const lossMessage = `You scored ${this.gameState.score} points but needed ${this.WIN_SCORE} to win!`;
      this.showOverlay('💀 GAME OVER 💀', lossMessage);
      this.updateGameStatus('Game Over - Failed to reach 100');
      this.addGameOverAnimation();
    }
    
    // Update best score
    if (this.gameState.score > this.stats.bestScore) {
      this.stats.bestScore = this.gameState.score;
      this.checkAchievements('highScore');
    }
    
    this.checkAchievements('game');
    this.saveGameData();
    this.updateUI();
  }
  
  // UI Management
  updateUI() {
    document.getElementById('currentScore').textContent = this.gameState.score;
    document.getElementById('bestScore').textContent = this.stats.bestScore;
    document.getElementById('totalGames').textContent = this.stats.totalGames;
    document.getElementById('winCount').textContent = this.stats.wins;
    
    const winRate = this.stats.totalGames > 0 ? 
      Math.round((this.stats.wins / this.stats.totalGames) * 100) : 0;
    document.getElementById('winRate').textContent = `${winRate}%`;
    
    document.getElementById('currentStreak').textContent = this.stats.currentStreak;
    
    const modeText = this.isAIMode ? 'AI Player' : 'Human Player';
    document.getElementById('modeIndicator').textContent = modeText;
    
    this.updateAchievements();
  }
  
  updateGameStatus(status) {
    document.getElementById('gameStatus').textContent = status;
  }
  
  showOverlay(title, message) {
    const overlay = document.getElementById('gameOverlay');
    const mobileStartBtn = document.getElementById('mobileStartBtn');
    
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMessage').textContent = message;
    
    // Always show mobile button on mobile devices
    if (this.isMobile && mobileStartBtn) {
      mobileStartBtn.style.display = 'inline-block';
      
      // Update button text based on game state
      if (!this.gameState.running && !this.gameState.gameOver) {
        mobileStartBtn.textContent = 'START GAME';
      } else if (this.gameState.gameOver) {
        mobileStartBtn.textContent = 'PLAY AGAIN';
      } else if (this.gameState.paused) {
        mobileStartBtn.textContent = 'CONTINUE';
      } else {
        mobileStartBtn.textContent = 'PAUSE';
      }
      
      console.log('✅ Mobile button shown:', mobileStartBtn.textContent);
    } else if (mobileStartBtn) {
      mobileStartBtn.style.display = 'none';
    }
    
    overlay.classList.remove('hidden');
  }

  hideOverlay() {
    const overlay = document.getElementById('gameOverlay');
    const mobileStartBtn = document.getElementById('mobileStartBtn');
    
    overlay.classList.add('hidden');
    
    // Hide mobile start button when overlay is hidden
    if (mobileStartBtn && this.isMobile) {
      mobileStartBtn.style.display = 'none';
    }
  }
  
  // Achievements System
  checkAchievements(trigger) {
    const achievements = {
      'first-win': () => this.stats.wins >= 1,
      'speed-demon': () => this.gameState.score >= 150,
      'ai-master': () => this.isAIMode && this.gameState.score >= 100
    };
    
    Object.entries(achievements).forEach(([id, condition]) => {
      if (!this.stats.achievements.has(id) && condition()) {
        this.unlockAchievement(id);
      }
    });
  }
  
  unlockAchievement(id) {
    this.stats.achievements.add(id);
    this.playSound('achievement');
    
    const element = document.getElementById(`achieve-${id}`);
    if (element) {
      element.classList.remove('locked');
      element.classList.add('unlocked');
    }
    
    this.showAchievementNotification(id);
  }
  
  showAchievementNotification(id) {
    const names = {
      'first-win': 'First Victory',
      'speed-demon': 'Speed Demon', 
      'ai-master': 'AI Master'
    };
    
    console.log(`Achievement Unlocked: ${names[id]}!`);
  }
  
  updateAchievements() {
    const achievements = ['first-win', 'speed-demon', 'ai-master'];
    achievements.forEach(id => {
      const element = document.getElementById(`achieve-${id}`);
      if (element && this.stats.achievements.has(id)) {
        element.classList.remove('locked');
        element.classList.add('unlocked');
      }
    });
  }
  
  // Animation Effects
  addScoreAnimation() {
    const scoreElement = document.getElementById('currentScore');
    scoreElement.classList.add('score-boost');
    setTimeout(() => scoreElement.classList.remove('score-boost'), 400);
  }
  
  addVictoryAnimation() {
    this.canvas.classList.add('victory-celebration');
    setTimeout(() => this.canvas.classList.remove('victory-celebration'), 2000);
  }
  
  addGameOverAnimation() {
    this.canvas.classList.add('game-over-effect');
    setTimeout(() => this.canvas.classList.remove('game-over-effect'), 1000);
  }
  
  // Theme System
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    document.getElementById('themeBtn').textContent = this.theme === 'dark' ? '🌙' : '☀️';
    this.saveGameData();
  }
  
  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    document.getElementById('audioBtn').textContent = this.audioEnabled ? '🔊' : '🔇';
    this.saveGameData();
    
    if (this.audioEnabled) {
      this.playSound('move');
    }
  }
  
  toggleAIMode() {
    this.isAIMode = !this.isAIMode;
    document.getElementById('modeBtn').textContent = this.isAIMode ? '🤖' : '🧠';
    this.updateUI();
    this.saveGameData();
    
    const button = document.getElementById('modeBtn');
    button.classList.add('pulse-effect');
    setTimeout(() => button.classList.remove('pulse-effect'), 300);
  }
  
  resetStats() {
    if (confirm('Are you sure you want to reset all statistics?')) {
      this.stats = {
        bestScore: 0,
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        achievements: new Set()
      };
      this.saveGameData();
      this.updateUI();
      this.updateAchievements();
    }
  }
  
  // Data Persistence
  saveGameData() {
    const gameData = {
      stats: {
        ...this.stats,
        achievements: Array.from(this.stats.achievements)
      },
      settings: {
        theme: this.theme,
        audioEnabled: this.audioEnabled,
        isAIMode: this.isAIMode
      }
    };
    
    try {
      localStorage.setItem('snakeMasterData', JSON.stringify(gameData));
    } catch (error) {
      console.warn('Failed to save game data:', error);
    }
  }
  
  loadGameData() {
    try {
      const data = localStorage.getItem('snakeMasterData');
      if (data) {
        const gameData = JSON.parse(data);
        
        if (gameData.stats) {
          this.stats = {
            ...this.stats,
            ...gameData.stats,
            achievements: new Set(gameData.stats.achievements || [])
          };
        }
        
        if (gameData.settings) {
          this.theme = gameData.settings.theme || 'dark';
          this.audioEnabled = gameData.settings.audioEnabled !== false;
          this.isAIMode = gameData.settings.isAIMode || false;
          
          document.documentElement.setAttribute('data-theme', this.theme);
          document.getElementById('themeBtn').textContent = this.theme === 'dark' ? '🌙' : '☀️';
          document.getElementById('audioBtn').textContent = this.audioEnabled ? '🔊' : '🔇';
          document.getElementById('modeBtn').textContent = this.isAIMode ? '🤖' : '🧠';
        }
      }
    } catch (error) {
      console.warn('Failed to load game data:', error);
    }
  }
  
  // Rendering System
  startRenderLoop() {
    const gameLoop = (currentTime) => {
      const deltaTime = currentTime - this.lastTime;
      
      if (deltaTime >= this.gameState.speed) {
        this.updateGame();
        this.lastTime = currentTime;
      }
      
      this.render();
      this.animationId = requestAnimationFrame(gameLoop);
    };
    
    this.animationId = requestAnimationFrame(gameLoop);
  }
  
  render() {
    const ctx = this.ctx;
    const theme = this.theme;
    
    // Auto-resize canvas for mobile
    if (this.isMobile) {
      const container = this.canvas.parentElement;
      const containerSize = Math.min(container.clientWidth - 40, container.clientHeight - 100);
      this.canvas.style.width = containerSize + 'px';
      this.canvas.style.height = containerSize + 'px';
    }
    
    // Define colors based on theme
    const colors = {
      dark: {
        background: '#0a0e1a',
        grid: '#2d3561',
        snakeHead: '#00ff88',
        snakeBody: '#00d4ff',
        food: '#ff6b35',
        glow: 'rgba(0, 255, 136, 0.5)'
      },
      light: {
        background: '#f8fafc',
        grid: '#cbd5e0',
        snakeHead: '#38a169',
        snakeBody: '#3182ce',
        food: '#dd6b20',
        glow: 'rgba(56, 161, 105, 0.5)'
      }
    };

    const palette = colors[theme];
    
    // Clear canvas
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= this.TILE_COUNT; i++) {
      const pos = i * this.GRID_SIZE;
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, this.canvas.height);
      ctx.stroke();
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(this.canvas.width, pos);
      ctx.stroke();
    }
    
    // Draw snake
    this.snake.forEach((segment, index) => {
      const x = segment.x * this.GRID_SIZE;
      const y = segment.y * this.GRID_SIZE;
      
      if (index === 0) {
        // Head with glow effect
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = this.isAIMode ? 20 : 15;
        ctx.fillStyle = palette.snakeHead;
        
        // Add AI indicator
        if (this.isAIMode) {
          ctx.shadowColor = '#ff9800';
        }
      } else {
        // Body with gradient
        const alpha = Math.max(0.3, 1 - (index * 0.1));
        ctx.fillStyle = palette.snakeBody + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.shadowBlur = 5;
      }
      
      ctx.fillRect(x + 2, y + 2, this.GRID_SIZE - 4, this.GRID_SIZE - 4);
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw food with pulsing effect
    const time = Date.now() * 0.003;
    const pulse = Math.sin(time) * 0.3 + 0.7;
    const foodSize = this.GRID_SIZE * pulse;
    const foodX = this.food.x * this.GRID_SIZE + (this.GRID_SIZE - foodSize) / 2;
    const foodY = this.food.y * this.GRID_SIZE + (this.GRID_SIZE - foodSize) / 2;
    
    ctx.shadowColor = palette.food;
    ctx.shadowBlur = 15 + Math.sin(time) * 5;
    ctx.fillStyle = palette.food;
    ctx.fillRect(foodX, foodY, foodSize, foodSize);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw level indicator if game is running
    if (this.gameState.running && !this.gameState.paused) {
      ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
      ctx.font = '16px monospace';
      ctx.fillText(`Level ${this.gameState.level}`, 10, 25);
    }
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🐍 Snake Master - Initializing...');
  
  try {
    const game = new SnakeGameEngine();
    console.log('✅ Game initialized successfully!');
    
    // Make game instance globally accessible for debugging
    window.snakeGame = game;
  } catch (error) {
    console.error('❌ Failed to initialize game:', error);
  }
});