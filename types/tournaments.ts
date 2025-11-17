
export interface Tournament {
  id: string;
  game_type: 'reaction_test' | 'jump_time' | 'slide_puzzle' | 'memory_speed' | 'spaceship_survival' | 'snake_retro';
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

export const GAME_TYPES = {
  REACTION_TEST: 'reaction_test',
  JUMP_TIME: 'jump_time',
  SLIDE_PUZZLE: 'slide_puzzle',
  MEMORY_SPEED: 'memory_speed',
  SPACESHIP_SURVIVAL: 'spaceship_survival',
  SNAKE_RETRO: 'snake_retro',
} as const;

export const GAME_NAMES = {
  reaction_test: 'MXI Reaction Test',
  jump_time: 'MXI JumpTime',
  slide_puzzle: 'Slide Puzzle',
  memory_speed: 'Memory Speed',
  spaceship_survival: 'Retro Spaceship Survival',
  snake_retro: 'MXI Snake Retro',
} as const;

export const GAME_DESCRIPTIONS = {
  reaction_test: 'Tap the target as fast as you can! Test your reflexes.',
  jump_time: 'Jump over obstacles and survive as long as possible.',
  slide_puzzle: 'Solve the puzzle in the shortest time possible.',
  memory_speed: 'Remember and repeat the sequence. How far can you go?',
  spaceship_survival: 'Dodge meteorites and survive in space.',
  snake_retro: 'Classic snake game. Grow longer and score higher!',
} as const;
