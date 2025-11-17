
# Tournament Leaderboard Component

## Overview
The `TournamentLeaderboard` component provides a real-time, auto-updating leaderboard for tournament games. It displays current standings, prize amounts, and motivates players to compete for top positions.

## Usage

```tsx
import TournamentLeaderboard from '@/components/TournamentLeaderboard';

<TournamentLeaderboard
  tournamentId={tournament.id}
  prizePool={tournament.prize_pool}
  maxPlayers={tournament.max_players}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tournamentId` | string | Yes | Unique identifier for the tournament |
| `prizePool` | number | Yes | Total prize pool in MXI |
| `maxPlayers` | number | Yes | Maximum number of players allowed |

## Features

### Real-time Updates
- Automatically subscribes to Supabase Realtime channel
- Updates immediately when any player submits a score
- No manual refresh needed (but pull-to-refresh available)

### Prize Distribution Display
Shows exact prize amounts:
- 🥇 1st Place: 50% of prize pool
- 🥈 2nd Place: 25% of prize pool
- 🥉 3rd Place: 15% of prize pool
- 📊 10% goes to prize fund

### Visual Hierarchy
- **Gold styling** for 1st place
- **Silver styling** for 2nd place
- **Bronze styling** for 3rd place
- Standard styling for other positions
- Crown emoji (👑) for current leader
- Record badge showing highest score

### Empty State
When no scores are submitted yet:
- Shows friendly message
- Encourages first player to participate
- Displays group icon

### Loading State
- Shows spinner while fetching data
- Displays "Loading leaderboard..." message

## Real-time Implementation

### Channel Setup
```typescript
const channel = supabase.channel(`tournament:${tournamentId}:leaderboard`, {
  config: { private: true },
});

channel
  .on('broadcast', { event: 'score_update' }, (payload) => {
    loadLeaderboard();
  })
  .subscribe();
```

### Broadcasting Score Updates
When a player completes a game:
```typescript
const channel = supabase.channel(`tournament:${tournamentId}:leaderboard`);
await channel.send({
  type: 'broadcast',
  event: 'score_update',
  payload: {
    user_id: user.id,
    user_name: user.name,
    score: score,
    tournament_id: tournamentId,
  },
});
```

## Styling

### Color Scheme
- **1st Place**: Orange background (#FFD700 border)
- **2nd Place**: Blue background (#C0C0C0 border)
- **3rd Place**: Purple background (#CD7F32 border)
- **Other**: Standard card background

### Rank Badges
- Circular badges with rank number
- Medal emojis for top 3
- Color-coded to match entry styling

### Prize Display
- Green text for prize amounts
- "Prize" label below amount
- Only shown for top 3 positions

## Data Flow

1. Component mounts → Subscribe to real-time channel
2. Load initial leaderboard data from `game_scores` table
3. Calculate prize distribution (50%, 25%, 15%)
4. Render leaderboard with styling
5. Listen for `score_update` broadcasts
6. Reload leaderboard when update received
7. Component unmounts → Unsubscribe from channel

## Performance Considerations

- Maximum height of 400px with scrolling
- Efficient re-renders using React keys
- Debounced real-time updates
- Automatic cleanup on unmount

## Accessibility

- Clear visual hierarchy
- High contrast colors
- Readable font sizes
- Descriptive labels
- Touch-friendly tap targets

## Example Integration

```tsx
// In tournament game screen
{tournaments.map((tournament) => (
  <Fragment key={tournament.id}>
    <View style={styles.tournamentCard}>
      {/* Tournament info */}
    </View>
    
    {/* Show leaderboard if tournament has participants */}
    {tournament.current_players > 0 && (
      <TournamentLeaderboard
        tournamentId={tournament.id}
        prizePool={tournament.prize_pool}
        maxPlayers={tournament.max_players}
      />
    )}
  </Fragment>
))}
```

## Future Enhancements

Potential improvements:
- Add player position highlighting
- Show score change animations
- Add "Beat this score" challenges
- Display time since last update
- Add filtering/sorting options
- Show player avatars
- Add share functionality
