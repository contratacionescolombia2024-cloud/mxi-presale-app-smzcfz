
# 1 vs 3 Challenges Implementation

## Overview
This document describes the implementation of the 1 vs 3 challenges feature, which allows users to create custom challenges with customizable entry fees (5-1000 MXI) and invite friends to compete.

## Database Schema

### Tables Created

#### `challenges`
- `id` (UUID, primary key)
- `game_type` (TEXT) - One of: quick_draw_duel, tap_rush, rhythm_tap, mental_math_speed, danger_path, mxi_climber
- `creator_id` (UUID) - References auth.users
- `entry_fee` (NUMERIC) - Between 5 and 1000 MXI
- `prize_pool` (NUMERIC) - Total prize pool (entry_fee * 4)
- `max_players` (INTEGER) - Always 4 (1 vs 3)
- `current_players` (INTEGER) - Current number of participants
- `status` (TEXT) - waiting, in_progress, completed, cancelled
- `invite_code` (TEXT, unique) - 8-character invite code
- `allow_random_join` (BOOLEAN) - Allow random players to join
- `start_time`, `end_time`, `created_at`, `updated_at` (TIMESTAMP)

#### `challenge_participants`
- `id` (UUID, primary key)
- `challenge_id` (UUID) - References challenges
- `user_id` (UUID) - References auth.users
- `score` (NUMERIC) - Player's score
- `rank` (INTEGER) - Final rank
- `prize_won` (NUMERIC) - Prize amount won
- `joined_at`, `completed_at` (TIMESTAMP)

#### `challenge_scores`
- `id` (UUID, primary key)
- `challenge_id` (UUID) - References challenges
- `user_id` (UUID) - References auth.users
- `user_name` (TEXT) - Player's name
- `score` (NUMERIC) - Score achieved
- `game_data` (JSONB) - Additional game data
- `created_at`, `updated_at` (TIMESTAMP)

### RPC Functions

#### `generate_challenge_invite_code()`
Generates a unique 8-character invite code for challenges.

#### `join_challenge(p_challenge_id UUID, p_user_id UUID)`
Handles joining a challenge:
- Validates challenge status and availability
- Checks user balance
- Deducts entry fee from tournaments_balance
- Adds participant to challenge
- Returns success/failure with message

#### `complete_challenge(p_challenge_id UUID)`
Completes a challenge and distributes prizes:
- Ranks participants by score
- Awards full prize pool to winner (highest score)
- Updates participant records with ranks and prizes
- Credits winner's tournaments_balance

#### `cancel_challenge(p_challenge_id UUID, p_user_id UUID)`
Cancels a challenge:
- Validates creator permissions
- Refunds all participants
- Updates challenge status to cancelled

## New Game Components

### 1. Quick Draw Duel (`QuickDrawDuelGame.tsx`)
- Western-style quick draw game
- Shows "FIRE" after random delay
- Player must tap as fast as possible
- Score based on reaction time
- 5 rounds total

### 2. Tap Rush (`TapRushGame.tsx`)
- Tap button as many times as possible in 10 seconds
- Score = total taps
- Visual feedback on each tap
- Shows taps per second at end

### 3. Rhythm Tap (`RhythmTapGame.tsx`)
- Guitar Hero-style rhythm game
- 4 lanes with falling notes
- Tap lanes when notes reach hit zone
- Combo system for bonus points
- 30 seconds duration

### 4. Mental Math Speed (`MentalMathSpeedGame.tsx`)
- Solve math problems quickly
- Addition, subtraction, multiplication
- Score based on speed and accuracy
- 10 problems total

### 5. Danger Path (`DangerPathGame.tsx`)
- Navigate through zigzag maze
- Drag player without touching walls
- Score based on distance and time
- Collision detection

### 6. MXI Climber (`MXIClimberGame.tsx`)
- Tap to climb mountain
- Avoid falling obstacles
- Score = height climbed
- Endless gameplay until collision

## User Interface

### Tournaments Screen Updates
- Added "1 vs 3 Challenges" card
- Links to challenges screen
- Shows entry fee range (5-1000 MXI)
- Displays "Winner Takes All" prize structure

### Challenges Screen (`/challenges`)
Features:
- View tournaments balance
- Create new challenge button
- Join by invite code button
- "My Challenges" section showing created challenges
- "Available Challenges" section showing joinable challenges
- Copy invite code functionality
- Cancel challenge option for creators

### Challenge Creation Modal
- Select game type (6 options)
- Set entry fee (5-1000 MXI)
- Toggle "Allow random players to join"
- Generates unique invite code

### Challenge Game Screen (`/challenge-game/[gameType]`)
- Dynamic routing for each game type
- Loads challenge details
- Renders appropriate game component
- Submits score on completion
- Auto-completes challenge when all players finish

## Prize Distribution

### Winner Takes All
- Only the player with the highest score wins
- Winner receives the full prize pool (entry_fee * 4)
- Prize is credited to tournaments_balance
- Can be withdrawn from Commission & Tournaments balance

### Example
- Entry fee: 100 MXI
- Prize pool: 400 MXI (100 * 4 players)
- Winner gets: 400 MXI

## Features

### Invite System
- Each challenge has unique 8-character invite code
- Creator can share code with friends
- Players can join by entering code
- Copy to clipboard functionality

### Random Join
- Optional: Allow random players to join
- If enabled, challenge appears in "Available Challenges"
- If disabled, only players with invite code can join

### Challenge Management
- Creator can cancel challenge before completion
- All participants are refunded on cancellation
- Challenge auto-completes when all players finish
- Real-time updates on player count

### Balance Integration
- Entry fees deducted from tournaments_balance
- Prizes credited to tournaments_balance
- Same balance used for tournaments and challenges
- Can be withdrawn to main balance

## Type Definitions

Added to `types/tournaments.ts`:
- `Challenge` interface
- `ChallengeParticipant` interface
- `ChallengeScore` interface
- `CHALLENGE_GAME_TYPES` constants
- `CHALLENGE_GAME_NAMES` constants
- `CHALLENGE_GAME_DESCRIPTIONS` constants
- `CHALLENGE_MIN_ENTRY` = 5
- `CHALLENGE_MAX_ENTRY` = 1000

## Security

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Anyone can view challenges and scores
- Only authenticated users can create challenges
- Only creators can update/delete their challenges
- Only participants can submit scores

### Validation
- Entry fee range enforced (5-1000 MXI)
- Balance checks before joining
- Duplicate join prevention
- Creator-only cancellation
- Status validation for all operations

## Future Enhancements

Potential improvements:
- Leaderboards for each game type
- Challenge history and statistics
- Spectator mode for ongoing challenges
- Tournament-style brackets
- Team challenges (2v2)
- Custom game settings
- Replay functionality
- Achievement system

## Testing Checklist

- [ ] Create challenge with minimum entry fee (5 MXI)
- [ ] Create challenge with maximum entry fee (1000 MXI)
- [ ] Join challenge with invite code
- [ ] Join challenge from available list
- [ ] Play each of the 6 games
- [ ] Submit scores and verify recording
- [ ] Complete challenge and verify prize distribution
- [ ] Cancel challenge and verify refunds
- [ ] Test insufficient balance scenarios
- [ ] Test duplicate join prevention
- [ ] Verify real-time updates
- [ ] Test copy invite code functionality

## Notes

- All 6 new games are fully implemented and playable
- Prize distribution is automatic when all players complete
- Challenges use the same tournaments_balance as tournaments
- Invite codes are unique and case-insensitive
- Games are designed for quick play (30 seconds to 2 minutes)
- Score submission is immediate after game completion
