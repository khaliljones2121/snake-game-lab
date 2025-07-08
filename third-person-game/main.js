// Main game structure for a Snake game engine
//     First, I need to set up the basic game stuff
//     CREATE game board (20x20 grid)
//     CREATE snake (starts with 1 piece at middle)
//     CREATE food (random position)
//     SET score = 0
//     SET game running = false

//     WHILE program is open DO
//         IF user clicks start button THEN
//             START the game

//         IF game is running THEN
//             UPDATE the game
//             DRAW everything on screen
// END PROGRAM

// Starting the game

//     When the user clicks the start button, we need to:
// FUNCTION StartGame
//     SET game running = true
//     SET snake position to middle of board
//     SET snake direction = moving right
//     PUT food somewhere random
//     SET score = 0
//     HIDE the start menu
//     PLAY start sound

// FUNCTION HandleInput
//     IF player presses UP arrow (or W key) THEN
//         IF snake is not already moving DOWN THEN
//             SET next direction = UP
    
//     IF player presses DOWN arrow (or S key) THEN
//         IF snake is not already moving UP THEN
//             SET next direction = DOWN
    
//     IF player presses LEFT arrow (or A key) THEN
//         IF snake is not already moving RIGHT THEN
//             SET next direction = LEFT
//     IF player presses RIGHT arrow (or D key) THEN
//         IF snake is not already moving LEFT THEN
//             SET next direction = RIGHT
    
//     IF player presses SPACE THEN
//         IF game is not running THEN
//             START the game
//         ELSE
//             PAUSE/UNPAUSE the game
// END FUNCTION

// Game logic
// FUNCTION UpdateGame
//     IF game is paused OR game over THEN
//         DO nothing and return
    
//     // Move the snake
//     SET snake direction = next direction
//     CALCULATE where snake head will move next
    
//     // Check if snake hits walls
//     IF snake head goes outside the board THEN
//         END the game (player loses)
//         RETURN
    
//     // Check if snake hits itself
//     FOR each piece of snake body DO
//         IF snake head touches this piece THEN
//             END the game (player loses)
//             RETURN
    
//     // Move snake forward
//     ADD new head piece where snake is moving
    
//     // Check if snake ate food
//     IF snake head is at same position as food THEN
//         ADD 10 points to score
//         PUT food in new random location
//         PLAY eating sound
//         MAKE score flash on screen
        
//         // Make game faster every 30 points
//         IF score is multiple of 30 THEN
//             INCREASE game speed
//             INCREASE level number        
//         // Don't remove tail (snake grows)
//     ELSE
//         REMOVE last piece of snake tail (snake moves but doesn't grow)    
//     // Check if player won
//     IF score >= 100 THEN
//         END the game (player wins!)

// Food Generation

// FUNCTION CreateNewFood
//     REPEAT
// SET food X = random number from 0 to 19
//         SET food Y = random number from 0 to 19
//     UNTIL food is not on any part of snake
//     RETURN food position

// FUNCTION DrawGame
//     // Clear the screen
//     FILL entire canvas with background color
//     // Draw grid lines
//     FOR each row and column DO
//         DRAW thin line
    
//     // Draw the snake
//     FOR each piece of snake DO
//         IF this is the head THEN
//             DRAW bright green square with glow effect
//             IF AI mode THEN
//                 MAKE glow orange instead
//             DRAW blue square (slightly transparent)
    
//     // Draw the food with pulsing animation
//     CALCULATE pulsing size using current time
//     DRAW orange/red square that changes size
//     ADD glowing effect around food
    
//     // Draw level number if game is running
//     IF game is active THEN
//         DRAW "Level X" text in corner

// win loss logic
// FUNCTION EndGame(did_player_win)
//     SET game running = false
//     SET game over = true
//     ADD 1 to total games played
    
//     IF player won THEN
//         ADD 1 to wins
//         ADD 1 to current win streak
//         PLAY victory sound
//         SHOW "YOU WON!" message
//         MAKE screen flash with celebration
//         CHECK for new achievements
//     ELSE
//         SET current win streak = 0
//         PLAY game over sound
//         SHOW "GAME OVER" message
//         MAKE screen shake    
//     IF current score > best score THEN
//         SET best score = current score    
//     UPDATE all statistics on screen
//     SAVE game data to browser storage
//     SHOW restart button
// END FUNCTION

// FUNCTION SaveGameData
//     CREATE data object with:
//         - Best score
//         - Total games played
//         - Number of wins
//         - Current win streak
//         - Unlocked achievements
//         - Settings (theme, sound, AI mode)
    
//     TRY TO
//         SAVE data to browser's local storage
//     IF saving fails THEN
//         DO nothing (just keep playing)

// FUNCTION LoadGameData
// BEGIN
//     TRY TO
//         GET saved data from browser's local storage
//         IF data exists THEN
//             RESTORE all statistics
//             RESTORE all settings
//             UPDATE screen to show saved data

// Sound System
// FUNCTION PlaySound(sound_name)
//     IF sound is turned off THEN
//         DO nothing and return    
//     IF sound_name is "eat" THEN
//         PLAY high beep sound
//     ELSE IF sound_name is "game_over" THEN
//         PLAY low sad sound
//     ELSE IF sound_name is "win" THEN
//         PLAY happy victory sound
//     ELSE IF sound_name is "achievement" THEN
//         PLAY special achievement sound
// Achievements
// FUNCTION CheckAchievements
//     IF player has 1 or more wins AND hasn't unlocked "First Win" THEN
//         UNLOCK "First Victory" achievement
//         PLAY achievement sound
//         SHOW achievement notification    
//     IF current score >= 150 AND hasn't unlocked "Speed Demon" THEN
//         UNLOCK "Speed Demon" achievement
//         PLAY achievement sound    
//     IF AI mode is on AND score >= 100 AND hasn't unlocked "AI Master" THEN
//         UNLOCK "AI Master" achievement
//         PLAY achievement sound

// FUNCTION ToggleTheme
//     IF current theme is dark THEN
//         SET theme = light
//         CHANGE all colors to light mode
//     ELSE
//         SET theme = dark
//         CHANGE all colors to dark mode    
//     SAVE settings

// FUNCTION ToggleSound
//     IF sound is on THEN
//         TURN sound off
//         CHANGE button to muted icon
//     ELSE
//         TURN sound on
//         CHANGE button to sound icon
//         PLAY test sound
    //     SAVE settings

// FUNCTION ToggleAIMode
//     IF AI is off THEN
//         TURN AI on
//         CHANGE button to robot icon
//     ELSE
//         TURN AI off
//         CHANGE button to brain icon    
//     UPDATE mode indicator on screen
//     SAVE settings


class SnakeGameEngine {
  constructor() {
    // Game settings
    this.GRID_SIZE = 24;
    this.TILE_COUNT = 20;
    this.INITIAL_SPEED = 200;
    this.MIN_SPEED = 80;
    this.SPEED_INCREMENT = 8;
    this.WIN_SCORE = 100;

    // game state
    this.gameState = {
      running: false,
      paused: false,
      gameOver: false,
      score: 0,
      level: 1,
      speed: this.INITIAL_SPEED,
};

// snake and food
this.snake = [{ x: 10, y: 10 }];
this.direction = { x: 1, y: 0};
this.nextDirection = { x: 1, y: 0};
this.food = null;

// modes and settings
this.aiMode = false;
this.audioEnabled = true;
this.theme = 'dark';

// Stats
this.stats = {
  totalGames: 0,
  wins: 0,
  currentWinStreak: 0,
  achievements: new setInterval()};

  // input buffer
  this.inputBuffer = [];
  this.Max_Buffer = 3;

  // Animation
  this.lastTime = 0;
  this.animationId = null;
}

domInitialize() {
  this.canvas = document.getElementById('gameField');
  this.ctx = this.canvas.getContext('2d');
  this.canvas.width = this.GRID_SIZE * this.TILE_COUNT;
  this.food = this.generateFood();
  this.domInitialize();
}

initialize() {
  this.loadGameData();
  this.setupEventListeners();
  this.setupAudio();
  this.updateUI();
  this.startRenderLoop();
}

let title = 'The Slytherin';
let message = 'Press SPACE to start';
this.showOverlay(title, message);
}

setupAudio() {
  this.audioContent = null;
  this.sounds = {
    eat: { freq: 220, duration: 0.1 },
    move: { freq: 440, duration: 0.1 },
    gameOver: { freq: 150, duration: 0.5 },
    win: { freq: 880, duration: 0.3 },
    achievement: { freq: 660, duration: 0.2 },
  };

  document.addEventListener('click', this.initAudio.bind(this), { once: true });

  document.addEventListener('keydown', this.initAudio.bind(this), { once: true });
  document.addEventListener('touchstart', this.initAudio.bind(this), { once: true });
}

initAudioContext() {
  if (!this.audioContext) {
    let AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      this.audioContext = new AudioCtx();
    }
  }
  playSound(name) {
    if (!this.audioEnabled || !this.audioContext || !this.sounds[name]) {
      return;
let osc = this.audioContext.createGain();
      osc.connect(gain);

      gain.connect(this.audioContext.destination);
      let sound = this.sound[name];
      osc.frequency.setValueAtTime(sound.freq, this.audioContext.currentTime);
      osc.type = 'square';
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + sound.duration);
      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + sound.duration); 
    }
  
    getAIMove() {
      let head = this.snake[0];
      let moves = [
        { x: 0, y: -1},
        { x: 0, y: 1},
        { x: -1, y: 0},
        { x: 1, y: 0}
      ];
      let safe = (move) => {
        let newHead = { x: head.x + move.x, y: head.y + move.y };
        return !this.isOutOfBounds(newHead) && !this.isCollidingWithSnake(newHead);
      };
      let wall = head.x < 0 || head.x >= this.TILE_COUNT || head.y < 0 || head.y >= this.TILE_COUNT;