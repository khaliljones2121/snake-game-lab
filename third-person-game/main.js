// SNAKE MASTER GAME - ADVANCED IMPLEMENTATION
// ==========================================

// INITIALIZE SNAKE_GAME_ENGINE:
//     SET canvas dimensions (480x480)
//     SET GRID_SIZE = 24
//     SET TILE_COUNT = 20
//     SET INITIAL_SPEED = 200ms
//     SET MIN_SPEED = 80ms
//     SET SPEED_INCREMENT = 8ms
//     SET WIN_SCORE = 100
    
//     INITIALIZE game_state:
//         running = false
//         paused = false
//         gameOver = false
//         score = 0
//         level = 1
//         speed = INITIAL_SPEED
    
//     INITIALIZE snake_properties:
//         snake = [position(10,10)]
//         direction = (1,0)
//         nextDirection = (1,0)
//         food = generate_random_food()
    
//     INITIALIZE game_modes:
//         isAIMode = false
//         audioEnabled = true
//         theme = 'dark'
    
//     INITIALIZE statistics:
//         bestScore = 0
//         totalGames = 0
//         wins = 0
//         currentStreak = 0
//         achievements = empty_set
    
//     INITIALIZE input_system:
//         inputBuffer = empty_array
//         MAX_BUFFER = 3
    
//     INITIALIZE animation_system:
//         lastTime = 0
//         animationId = null
    
//     CALL initialize()

// INITIALIZE():
//     CALL loadGameData()
//     CALL setupEventListeners()
//     CALL setupAudio()
//     CALL updateUI()
//     CALL startRenderLoop()
//     SHOW overlay('Snake Master', 'Press SPACE to begin your journey')

// SETUP_AUDIO():
//     INITIALIZE audioContext = null
//     DEFINE sounds:
//         eat: frequency=440Hz, duration=0.1s
//         move: frequency=220Hz, duration=0.05s
//         gameOver: frequency=150Hz, duration=0.5s
//         win: frequency=880Hz, duration=0.3s
//         achievement: frequency=660Hz, duration=0.2s
    
//     ADD event_listeners FOR user_interaction -> initAudioContext()

// PLAY_SOUND(soundName):
//     IF NOT audioEnabled OR NOT audioContext OR NOT sounds[soundName]:
//         RETURN
    
//     TRY:
//         CREATE oscillator AND gainNode
//         CONNECT oscillator -> gainNode -> audioContext.destination
//         SET oscillator.frequency = sounds[soundName].freq
//         SET oscillator.type = 'square'
//         SET gain envelope WITH exponential_ramp
//         START oscillator
//         STOP oscillator AFTER sounds[soundName].duration
//     CATCH error:
//         LOG warning

// GET_AI_MOVE():
//     GET head = snake[0]
//     DEFINE possibleMoves = [up, down, left, right]
    
//     FILTER safeMoves FROM possibleMoves WHERE:
//         newPos = head + move
//         NOT (newPos outside canvas bounds)
//         NOT (newPos overlaps snake segments)
//         NOT (move is opposite to current direction)
    
//     IF safeMoves.length == 0:
//         RETURN emergency_fallback_move
    
//     SCORE each safe_move:
//         score = 0
//         foodDistance = manhattan_distance(newPos, food)
//         score += (TILE_COUNT * 2 - foodDistance) * 10
        
//         wallDistance = min_distance_to_walls(newPos)
//         score += wallDistance * 5
        
//         IF move == current_direction:
//             score += 15  // Prefer continuing straight
        
//         nearbySegments = count_snake_segments_near(newPos, radius=2)
//         score -= nearbySegments * 3
        
//         RETURN {move, score}
    
//     SORT scoredMoves BY score DESCENDING
//     GET bestMoves = moves WITH score >= (bestScore - 5)
//     RETURN random_choice(bestMoves)

// GENERATE_FOOD():
//     attempts = 0
//     maxAttempts = 100
//     REPEAT:
//         food = random_position(0, TILE_COUNT)
//         attempts++
//     UNTIL food NOT overlapping snake OR attempts >= maxAttempts
//     RETURN food

// SETUP_EVENT_LISTENERS():
//     ADD keydown_listener -> handleKeyInput()
//     ADD click_listener FOR themeBtn -> toggleTheme()
//     ADD click_listener FOR audioBtn -> toggleAudio()
//     ADD click_listener FOR modeBtn -> toggleAIMode()
//     PREVENT default FOR [Space, ArrowKeys, WASD]

// HANDLE_KEY_INPUT(event):
//     key = event.code
//     SWITCH key:
//         CASE 'Space': CALL handleSpaceKey()
//         CASE 'KeyP': CALL togglePause()
//         CASE 'Escape': CALL resetStats()
//         CASE 'ArrowUp' OR 'KeyW': CALL queueMove(0, -1)
//         CASE 'ArrowDown' OR 'KeyS': CALL queueMove(0, 1)
//         CASE 'ArrowLeft' OR 'KeyA': CALL queueMove(-1, 0)
//         CASE 'ArrowRight' OR 'KeyD': CALL queueMove(1, 0)

// HANDLE_SPACE_KEY():
//     IF NOT gameState.running:
//         CALL startGame()
//     ELSE IF gameState.gameOver:
//         CALL resetGame()
//     ELSE:
//         CALL togglePause()

// QUEUE_MOVE(newDirection):
//     IF NOT gameState.running OR gameState.paused OR isAIMode:
//         RETURN
//     IF newDirection is opposite to current_direction:
//         RETURN
//     IF inputBuffer.length < MAX_BUFFER:
//         ADD newDirection TO inputBuffer

// PROCESS_INPUT_BUFFER():
//     IF inputBuffer.length > 0:
//         move = REMOVE_FIRST(inputBuffer)
//         IF move is NOT opposite to current_direction:
//             SET nextDirection = move

// START_GAME():
//     SET gameState.running = true
//     SET gameState.paused = false
//     SET gameState.gameOver = false
//     CALL hideOverlay()
//     UPDATE gameStatus TO 'Playing'
//     PLAY sound('move')

// RESET_GAME():
//     SET snake = [position(10,10)]
//     SET direction = (1,0)
//     SET nextDirection = (1,0)
//     SET food = generateFood()
//     SET gameState.score = 0
//     SET gameState.level = 1
//     SET gameState.speed = INITIAL_SPEED
//     SET gameState.running = false
//     SET gameState.paused = false
//     SET gameState.gameOver = false
//     CLEAR inputBuffer
//     CALL updateUI()
//     SHOW overlay('Snake Master', 'Press SPACE to begin your journey')
//     UPDATE gameStatus TO 'Ready to Play'

// TOGGLE_PAUSE():
//     IF NOT gameState.running:
//         RETURN
//     TOGGLE gameState.paused
//     IF gameState.paused:
//         SHOW overlay('Paused', 'Press P or SPACE to continue')
//         UPDATE gameStatus TO 'Paused'
//     ELSE:
//         CALL hideOverlay()
//         UPDATE gameStatus TO 'Playing'

// UPDATE_GAME():
//     IF NOT gameState.running OR gameState.paused OR gameState.gameOver:
//         RETURN
    
//     PROCESS input:
//         IF isAIMode:
//             SET nextDirection = getAIMove()
//         ELSE:
//             CALL processInputBuffer()
    
//     UPDATE direction = nextDirection
    
//     CALCULATE newHead = snake[0] + direction
    
//     CHECK wall_collision:
//         IF newHead outside canvas_bounds:
//             CALL endGame(false)
//             RETURN
    
//     CHECK self_collision:
//         IF newHead overlaps ANY snake_segment:
//             CALL endGame(false)
//             RETURN
    
//     ADD newHead TO front_of_snake
    
//     CHECK food_collision:
//         IF newHead == food_position:
//             CALL eatFood()
//         ELSE:
//             REMOVE tail_segment FROM snake
    
//     CHECK win_condition:
//         IF gameState.score >= WIN_SCORE:
//             CALL endGame(true)

// EAT_FOOD():
//     INCREMENT gameState.score BY 10
//     SET food = generateFood()
//     PLAY sound('eat')
    
//     IF gameState.score % 30 == 0:
//         DECREASE gameState.speed BY SPEED_INCREMENT
//         SET gameState.speed = max(MIN_SPEED, gameState.speed)
//         SET gameState.level = floor(gameState.score / 30) + 1
    
//     CALL addScoreAnimation()
//     CALL updateUI()

// END_GAME(isWin):
//     SET gameState.gameOver = true
//     SET gameState.running = false
//     INCREMENT stats.totalGames
    
//     IF isWin:
//         INCREMENT stats.wins
//         INCREMENT stats.currentStreak
//         PLAY sound('win')
//         SHOW overlay('🎉 Victory! 🎉', 'Amazing! You scored ' + gameState.score + ' points!')
//         UPDATE gameStatus TO 'Victory!'
//         CALL addVictoryAnimation()
//         CALL checkAchievements('win')
//     ELSE:
//         SET stats.currentStreak = 0
//         PLAY sound('gameOver')
//         SHOW overlay('💀 Game Over 💀', 'You scored ' + gameState.score + ' points. Press SPACE to try again!')
//         UPDATE gameStatus TO 'Game Over'
//         CALL addGameOverAnimation()
    
//     IF gameState.score > stats.bestScore:
//         SET stats.bestScore = gameState.score
//         CALL checkAchievements('highScore')
    
//     CALL checkAchievements('game')
//     CALL saveGameData()
//     CALL updateUI()

// UPDATE_UI():
//     UPDATE currentScore_display WITH gameState.score
//     UPDATE bestScore_display WITH stats.bestScore
//     UPDATE totalGames_display WITH stats.totalGames
//     UPDATE winCount_display WITH stats.wins
//     CALCULATE winRate = (stats.wins / stats.totalGames) * 100
//     UPDATE winRate_display WITH winRate + '%'
//     UPDATE currentStreak_display WITH stats.currentStreak
//     UPDATE modeIndicator WITH (isAIMode ? 'AI Player' : 'Human Player')
//     CALL updateAchievements()

// CHECK_ACHIEVEMENTS(trigger):
//     DEFINE achievement_conditions:
//         'first-win': stats.wins >= 1
//         'speed-demon': gameState.score >= 150
//         'ai-master': isAIMode AND gameState.score >= 100
    
//     FOR each achievement_id, condition:
//         IF NOT stats.achievements.has(achievement_id) AND condition():
//             CALL unlockAchievement(achievement_id)

// UNLOCK_ACHIEVEMENT(id):
//     ADD id TO stats.achievements
//     PLAY sound('achievement')
//     UPDATE achievement_element TO 'unlocked' state
//     CALL showAchievementNotification(id)

// TOGGLE_THEME():
//     TOGGLE theme BETWEEN 'dark' AND 'light'
//     SET document.data-theme = theme
//     UPDATE themeBtn_icon TO (theme == 'dark' ? '🌙' : '☀️')
//     CALL saveGameData()

// TOGGLE_AUDIO():
//     TOGGLE audioEnabled
//     UPDATE audioBtn_icon TO (audioEnabled ? '🔊' : '🔇')
//     CALL saveGameData()
//     IF audioEnabled:
//         PLAY sound('move')

// TOGGLE_AI_MODE():
//     TOGGLE isAIMode
//     UPDATE modeBtn_icon TO (isAIMode ? '🤖' : '🧠')
//     CALL updateUI()
//     CALL saveGameData()
//     ADD pulse_effect TO modeBtn

// SAVE_GAME_DATA():
//     CREATE gameData:
//         stats: {...stats, achievements: Array.from(stats.achievements)}
//         settings: {theme, audioEnabled, isAIMode}
//     TRY:
//         WRITE gameData TO localStorage['snakeMasterData']
//     CATCH error:
//         LOG warning

// LOAD_GAME_DATA():
//     TRY:
//         READ gameData FROM localStorage['snakeMasterData']
//         IF gameData exists:
//             MERGE gameData.stats INTO stats
//             CONVERT achievements_array TO Set
//             APPLY gameData.settings TO current_settings
//             UPDATE UI_elements WITH loaded_settings
//     CATCH error:
//         LOG warning

// START_RENDER_LOOP():
//     DEFINE gameLoop(currentTime):
//         deltaTime = currentTime - lastTime
//         IF deltaTime >= gameState.speed:
//             CALL updateGame()
//             SET lastTime = currentTime
//         CALL render()
//         SET animationId = requestAnimationFrame(gameLoop)
//     SET animationId = requestAnimationFrame(gameLoop)

// RENDER():
//     GET theme_colors FOR current_theme
//     CLEAR canvas WITH background_color
    
//     DRAW grid_lines:
//         FOR i = 0 TO TILE_COUNT:
//             pos = i * GRID_SIZE
//             DRAW vertical_line AT pos
//             DRAW horizontal_line AT pos
    
//     DRAW snake:
//         FOR each segment, index IN snake:
//             x = segment.x * GRID_SIZE
//             y = segment.y * GRID_SIZE
//             IF index == 0:  // Head
//                 SET shadowColor = glow_color
//                 SET shadowBlur = (isAIMode ? 20 : 15)
//                 SET fillStyle = snakeHead_color
//                 IF isAIMode:
//                     SET shadowColor = '#ff9800'  // AI indicator
//             ELSE:  // Body
//                 alpha = max(0.3, 1 - (index * 0.1))
//                 SET fillStyle = snakeBody_color + alpha_hex
//                 SET shadowBlur = 5
//             DRAW rectangle(x+2, y+2, GRID_SIZE-4, GRID_SIZE-4)
    
//     RESET shadowBlur = 0
    
//     DRAW food WITH pulsing_effect:
//         time = current_milliseconds * 0.003
//         pulse = sin(time) * 0.3 + 0.7
//         foodSize = GRID_SIZE * pulse
//         foodX = food.x * GRID_SIZE + (GRID_SIZE - foodSize) / 2
//         foodY = food.y * GRID_SIZE + (GRID_SIZE - foodSize) / 2
//         SET shadowColor = food_color
//         SET shadowBlur = 15 + sin(time) * 5
//         DRAW rectangle(foodX, foodY, foodSize, foodSize)
    
//     RESET shadowBlur = 0
    
//     IF gameState.running AND NOT gameState.paused:
//         DRAW level_indicator:
//             SET fillStyle = theme_text_color
//             SET font = '16px monospace'
//             DRAW text('Level ' + gameState.level, 10, 25)

// MAIN_PROGRAM:
//     WAIT FOR DOM_content_loaded
//     TRY:
//         CREATE new SnakeGameEngine()
//         LOG '✅ Game initialized successfully!'
//         SET window.snakeGame = game  // For debugging
//     CATCH error:
//         LOG '❌ Failed to initialize game:' + error



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
    
    // Animation Frame
    this.lastTime = 0;
    this.animationId = null;
    
    this.initialize();
  }
  
  initialize() {
    this.loadGameData();
    this.setupEventListeners();
    this.setupAudio();
    this.updateUI();
    this.startRenderLoop();
    this.showOverlay('Snake Master', 'Press SPACE to begin your journey');
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
  }
  
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    document.addEventListener('keydown', this.handleKeyInput.bind(this));
    document.getElementById('themeBtn').addEventListener('click', this.toggleTheme.bind(this));
    document.getElementById('audioBtn').addEventListener('click', this.toggleAudio.bind(this));
    document.getElementById('modeBtn').addEventListener('click', this.toggleAIMode.bind(this));
    
    // Prevent default behavior for game keys
    document.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });
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
    this.showOverlay('Snake Master', 'Press SPACE to begin your journey');
    this.updateGameStatus('Ready to Play');
  }
  
  togglePause() {
    if (!this.gameState.running) return;
    
    this.gameState.paused = !this.gameState.paused;
    if (this.gameState.paused) {
      this.showOverlay('Paused', 'Press P or SPACE to continue');
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
    
    // Check wall collision - LOSE if hit before reaching 100
    if (head.x < 0 || head.x >= this.TILE_COUNT || 
        head.y < 0 || head.y >= this.TILE_COUNT) {
      this.endGame(false); // LOSS - didn't reach 100
      return;
    }
    
    // Check self collision - LOSE if hit before reaching 100
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.endGame(false); // LOSS - didn't reach 100
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
    
    // Check win condition - ONLY way to win is reaching 100
    if (this.gameState.score >= this.WIN_SCORE) {
      this.endGame(true); // WIN - reached 100!
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
  
  // UPDATED: Make win/lose conditions explicit
  endGame(isWin) {
    this.gameState.gameOver = true;
    this.gameState.running = false;
    this.stats.totalGames++;
    
    if (isWin) {
      // Player reached 100+ points = WIN
      this.stats.wins++;
      this.stats.currentStreak++;
      this.playSound('win');
      this.showOverlay('🎉 VICTORY! 🎉', `CONGRATULATIONS! You reached ${this.gameState.score} points and WON!`);
      this.updateGameStatus('Victory!');
      this.addVictoryAnimation();
      this.checkAchievements('win');
    } else {
      // Player crashed before reaching 100 = LOSS
      this.stats.currentStreak = 0;
      this.playSound('gameOver');
      
      // Make loss message explicit about needing 100 to win
      const lossMessage = `You scored ${this.gameState.score} points but needed ${this.WIN_SCORE} to win! Try again!`;
      
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
    // Update score
    document.getElementById('currentScore').textContent = this.gameState.score;
    
    // Update statistics
    document.getElementById('bestScore').textContent = this.stats.bestScore;
    document.getElementById('totalGames').textContent = this.stats.totalGames;
    document.getElementById('winCount').textContent = this.stats.wins;
    
    const winRate = this.stats.totalGames > 0 ? 
      Math.round((this.stats.wins / this.stats.totalGames) * 100) : 0;
    document.getElementById('winRate').textContent = `${winRate}%`;
    
    document.getElementById('currentStreak').textContent = this.stats.currentStreak;
    
    // Update mode indicator
    const modeText = this.isAIMode ? 'AI Player' : 'Human Player';
    document.getElementById('modeIndicator').textContent = modeText;
    
    // Update achievements
    this.updateAchievements();
  }
  
  updateGameStatus(status) {
    document.getElementById('gameStatus').textContent = status;
  }
  
  showOverlay(title, message) {
    const overlay = document.getElementById('gameOverlay');
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMessage').textContent = message;
    overlay.classList.remove('hidden');
  }
  
  hideOverlay() {
    document.getElementById('gameOverlay').classList.add('hidden');
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
    
    // Show notification
    this.showAchievementNotification(id);
  }
  
  showAchievementNotification(id) {
    // Simple notification - could be enhanced with a proper notification system
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
    
    // Visual feedback
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
        
        // Load stats
        if (gameData.stats) {
          this.stats = {
            ...this.stats,
            ...gameData.stats,
            achievements: new Set(gameData.stats.achievements || [])
          };
        }
        
        // Load settings
        if (gameData.settings) {
          this.theme = gameData.settings.theme || 'dark';
          this.audioEnabled = gameData.settings.audioEnabled !== false;
          this.isAIMode = gameData.settings.isAIMode || false;
          
          // Apply settings
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