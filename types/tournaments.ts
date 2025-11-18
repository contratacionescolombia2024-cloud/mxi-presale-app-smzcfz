
export interface Tournament {
  id: string;
  game_type: 'reaction_test' | 'jump_time' | 'slide_puzzle' | 'memory_speed' | 'snake_retro' | 'catch_it' | 'shuriken_aim' | 'number_tracker';
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  score: number;
  rank?: number;
  prize_won?: number;
  joined_at: string;
  completed_at?: string;
}

export interface GameScore {
  id: string;
  tournament_id: string;
  user_id: string;
  user_name: string;
  score: number;
  game_data?: any;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  score: number;
  rank: number;
}

export interface MiniBattle {
  id: string;
  game_type: 'beat_bounce' | 'perfect_distance' | 'swipe_master' | 'quick_draw_duel' | 'tap_rush' | 'rhythm_tap' | 'mental_math_speed' | 'danger_path' | 'mxi_climber';
  creator_id: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  last_player_join: string;
}

export interface MiniBattleParticipant {
  id: string;
  mini_battle_id: string;
  user_id: string;
  score: number;
  rank?: number;
  prize_won?: number;
  joined_at: string;
  completed_at?: string;
}

export interface MiniBattleScore {
  id: string;
  mini_battle_id: string;
  user_id: string;
  user_name: string;
  score: number;
  game_data?: any;
  created_at: string;
  updated_at: string;
}

// Deprecated - will be removed
export interface Challenge {
  id: string;
  game_type: 'quick_draw_duel' | 'tap_rush' | 'rhythm_tap' | 'mental_math_speed' | 'danger_path' | 'mxi_climber';
  creator_id: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  invite_code: string;
  allow_random_join: boolean;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  score: number;
  rank?: number;
  prize_won?: number;
  joined_at: string;
  completed_at?: string;
}

export interface ChallengeScore {
  id: string;
  challenge_id: string;
  user_id: string;
  user_name: string;
  score: number;
  game_data?: any;
  created_at: string;
  updated_at: string;
}

export const GAME_TYPES = {
  REACTION_TEST: 'reaction_test',
  JUMP_TIME: 'jump_time',
  SLIDE_PUZZLE: 'slide_puzzle',
  MEMORY_SPEED: 'memory_speed',
  SNAKE_RETRO: 'snake_retro',
} as const;

// REMOVED: floor_is_lava and reflex_bomb
export const VIRAL_ZONE_GAME_TYPES = {
  CATCH_IT: 'catch_it',
  SHURIKEN_AIM: 'shuriken_aim',
  NUMBER_TRACKER: 'number_tracker',
} as const;

export const MINI_BATTLE_GAME_TYPES = {
  BEAT_BOUNCE: 'beat_bounce',
  PERFECT_DISTANCE: 'perfect_distance',
  SWIPE_MASTER: 'swipe_master',
  QUICK_DRAW_DUEL: 'quick_draw_duel',
  TAP_RUSH: 'tap_rush',
  RHYTHM_TAP: 'rhythm_tap',
  MENTAL_MATH_SPEED: 'mental_math_speed',
  DANGER_PATH: 'danger_path',
  MXI_CLIMBER: 'mxi_climber',
} as const;

// Deprecated
export const CHALLENGE_GAME_TYPES = {
  QUICK_DRAW_DUEL: 'quick_draw_duel',
  TAP_RUSH: 'tap_rush',
  RHYTHM_TAP: 'rhythm_tap',
  MENTAL_MATH_SPEED: 'mental_math_speed',
  DANGER_PATH: 'danger_path',
  MXI_CLIMBER: 'mxi_climber',
} as const;

export const GAME_NAMES = {
  reaction_test: 'MXI Reaction Test',
  jump_time: 'MXI JumpTime',
  slide_puzzle: 'Slide Puzzle',
  memory_speed: 'Memory Speed',
  snake_retro: 'MXI Snake Retro',
} as const;

// REMOVED: floor_is_lava and reflex_bomb
export const VIRAL_ZONE_GAME_NAMES = {
  catch_it: 'Catch It!',
  shuriken_aim: 'Shuriken Aim',
  number_tracker: 'Number Tracker',
} as const;

export const MINI_BATTLE_GAME_NAMES = {
  beat_bounce: 'MXI Beat Bounce',
  perfect_distance: 'MXI Perfect Distance',
  swipe_master: 'MXI Swipe Master',
  quick_draw_duel: 'Quick Draw Duel',
  tap_rush: 'Tap Rush',
  rhythm_tap: 'Rhythm Tap',
  mental_math_speed: 'Mental Math Speed',
  danger_path: 'Danger Path',
  mxi_climber: 'MXI Climber',
} as const;

// Deprecated
export const CHALLENGE_GAME_NAMES = {
  quick_draw_duel: 'Quick Draw Duel',
  tap_rush: 'Tap Rush',
  rhythm_tap: 'Rhythm Tap',
  mental_math_speed: 'Mental Math Speed',
  danger_path: 'Danger Path',
  mxi_climber: 'MXI Climber',
} as const;

export const GAME_DESCRIPTIONS = {
  reaction_test: 'Tap the target as fast as you can! Test your reflexes.',
  jump_time: 'Jump over obstacles and survive as long as possible.',
  slide_puzzle: 'Solve the puzzle in the shortest time possible.',
  memory_speed: 'Remember and repeat the sequence. How far can you go?',
  snake_retro: 'Classic snake game. Grow longer and score higher!',
} as const;

// REMOVED: floor_is_lava and reflex_bomb
export const VIRAL_ZONE_GAME_DESCRIPTIONS = {
  catch_it: 'Catch correct objects falling from above. Highest score in 30 seconds wins!',
  shuriken_aim: 'Throw ninja stars at the target. Precision determines your score!',
  number_tracker: 'Tap numbers in order from a full screen. Fast and addictive!',
} as const;

export const MINI_BATTLE_GAME_DESCRIPTIONS = {
  beat_bounce: 'Tap when the ball hits the zone. Rhythm and precision!',
  perfect_distance: 'Place a point at exactly the right distance. Precision wins!',
  swipe_master: 'Swipe in the correct direction as fast as possible!',
  quick_draw_duel: 'When "FIRE" appears, tap as fast as you can! Fastest wins.',
  tap_rush: 'Tap the button as many times as possible in 10 seconds.',
  rhythm_tap: 'Hit the notes at the right time. Perfect rhythm wins!',
  mental_math_speed: 'Solve math problems quickly. First correct answer wins!',
  danger_path: 'Navigate through the maze without touching walls.',
  mxi_climber: 'Tap to climb higher while dodging obstacles!',
} as const;

// Deprecated
export const CHALLENGE_GAME_DESCRIPTIONS = {
  quick_draw_duel: 'When "FIRE" appears, tap as fast as you can! Fastest wins.',
  tap_rush: 'Tap the button as many times as possible in 10 seconds.',
  rhythm_tap: 'Hit the notes at the right time. Perfect rhythm wins!',
  mental_math_speed: 'Solve math problems quickly. First correct answer wins!',
  danger_path: 'Navigate through the maze without touching walls.',
  mxi_climber: 'Tap to climb higher while dodging obstacles!',
} as const;

export const MAX_ACTIVE_TOURNAMENTS = 30;
export const PARTICIPANT_OPTIONS = [25, 50] as const;
export const VIRAL_ZONE_ENTRY_FEE = 1;
export const VIRAL_ZONE_MAX_PLAYERS = 100;
export const MINI_BATTLE_MIN_ENTRY = 5;
export const MINI_BATTLE_MAX_ENTRY = 1000;
// UPDATED: Only 2 or 4 players allowed
export const MINI_BATTLE_MIN_PLAYERS = 2;
export const MINI_BATTLE_MAX_PLAYERS = 4;
export const MINI_BATTLE_ALLOWED_PLAYERS = [2, 4] as const;
// Deprecated
export const CHALLENGE_MIN_ENTRY = 5;
export const CHALLENGE_MAX_ENTRY = 1000;
export const CHALLENGE_MIN_PLAYERS = 2;
export const CHALLENGE_MAX_PLAYERS = 5;

export interface GameSettings {
  id: string;
  game_type: string;
  max_active_tournaments: number;
  entry_fee: number;
  max_players: number;
  prize_distribution: {
    first: number;
    second?: number;
    third?: number;
  };
  created_at: string;
  updated_at: string;
}
