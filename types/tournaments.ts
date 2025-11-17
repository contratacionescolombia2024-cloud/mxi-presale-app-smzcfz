
export interface Tournament {
  id: string;
  game_type: 'reaction_test' | 'jump_time' | 'slide_puzzle' | 'memory_speed' | 'snake_retro';
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

// Challenge types (1 vs 1-4 opponents, 2-5 total players)
export interface Challenge {
  id: string;
  game_type: 'quick_draw_duel' | 'tap_rush' | 'rhythm_tap' | 'mental_math_speed' | 'danger_path' | 'mxi_climber';
  creator_id: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number; // 2-5 players
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
export const CHALLENGE_MIN_ENTRY = 5;
export const CHALLENGE_MAX_ENTRY = 1000;
export const CHALLENGE_MIN_PLAYERS = 2;
export const CHALLENGE_MAX_PLAYERS = 5;
