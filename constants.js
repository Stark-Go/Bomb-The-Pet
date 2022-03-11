"use strict";
const TIME_PER_FRAME = 33;  // This means 30 FPS

// Background colors
const GAME_FONT_COLOR = "gray";
const BACKGROUND_RIGHT_COLOR = "#000066";
const BACKGROUND_LEFT_COLOR = "#4d1a00";

// Character paths
const PATH_TOM = "img/spritesheet.png";
const PATH_JERRY = "img/spritesheet2.png";

// Bomb Paths
const PATH_BOMB_DEFAULT = "img/bomb_0.png";
const PATH_BOMB_YELLOW = "img/bomb_1.png";
const PATH_BOMB_ORANGE = "img/bomb_2.png";
const PATH_BOMB_RED = "img/bomb_3.png";

// Explosion Path
const PATH_EXPLOSION = "img/boom.png";

// Sound paths
const PATH_TOM_SOUND = "sound/tom_screams.mp3";
const PATH_JERRY_SOUND = "sound/jerry_screams.mp3";
const PATH_BACKGROUND_SOUND = "sound/background.mp3";

// Sizes
const BOMB_WIDTH = 67;
const BOMB_HEIGHT = 65;
const CHARACTER_WIDTH = 72;
const CHARACTER_HEIGHT = 96;
const EXPLOSION_WIDTH = 128;
const EXPLOSION_HEIGHT = 128;

// X & Y-position at the screen for Tom
const SCREEN_TOM_X = (($(window).width() / 4) * 3);
const SCREEN_TOM_Y = ($(window).height() / 2) - CHARACTER_HEIGHT;

// X & Y-position at the screen for Jerry
const SCREEN_JERRY_X = (($(window).width() / 2) / 2) - CHARACTER_WIDTH;
const SCREEN_JERRY_Y = ($(window).height() / 2) - CHARACTER_HEIGHT;

// Character Speed
const SCREEN_CHARACTER_SPEED = 7;

// Tom movement keys
const K_KEY = 75;
const O_KEY = 79;
const Ö_KEY = 192;
const L_KEY = 76;
const ENTER_KEY = 13;

// Jerry movement keys
const A_KEY = 65;
const W_KEY = 87;
const D_KEY = 68;
const S_KEY = 83;
const SPACE_KEY = 32;