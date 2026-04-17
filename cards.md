# Cards

This document mirrors the current mystery chest implementation in:

- `backend/laravel/app/Services/ChestRewardResolver.php`
- `frontend/src/routes/distribute.tsx`
- `frontend/src/i18n.tsx`

## Modes

- `auto` — effect resolves automatically after reveal
- `give_out` — chooser distributes the revealed sips/shots manually
- `target_pick` — chooser selects a target, then the backend resolves the result

## Scaling

Chest amounts are scaled by `chest_aggression_multiplier`.

For every non-zero `schluecke` or `shots` value, the backend applies:

- `round(base_amount * multiplier)`
- minimum result is `1` if the base amount was non-zero

This affects numeric card values, but not special effects like chugs or target-pick logic.

## Current cards

### Safe

| Key | Title | Weight | Probability | Mode | Base effect |
| --- | --- | ---: | ---: | --- | --- |
| `safe_give_sips` | Pocket Pour | 40 | 40% | `give_out` | Give out `3` sips |
| `safe_give_shot` | Loaded Thumb | 20 | 20% | `give_out` | Give out `1` shot |
| `safe_you_and_random_sip` | Friendly Fire | 20 | 20% | `auto` | You and one random other player drink `2` sips each |
| `safe_house_edge` | House Edge | 20 | 20% | `give_out` | Give out `4` sips, with at least `1` sip assigned to yourself |

### Group

| Key | Title | Weight | Probability | Mode | Base effect |
| --- | --- | ---: | ---: | --- | --- |
| `group_everyone_sip` | Roll Call | 35 | 35% | `auto` | Everyone drinks `2` sips |
| `group_everyone_else_sip` | Center Stage | 25 | 25% | `auto` | Everyone except you drinks `2` sips |
| `group_cheap_seats` | Cheap Seats | 25 | 25% | `auto` | Everyone without an active wrestler drinks `2` sips |
| `group_main_event` | Main Event | 15 | 15% | `auto` | Everyone drinks `1` shot |

### Chaos

| Key | Title | Weight | Probability | Mode | Base effect |
| --- | --- | ---: | ---: | --- | --- |
| `chaos_give_sips` | Rainmaker | 23 | 23% | `give_out` | Give out `8` sips |
| `chaos_give_shots` | Powder Keg | 20 | 20% | `give_out` | Give out `3` shots |
| `chaos_everyone_sip` | Shockwave | 13 | 13% | `auto` | Everyone drinks `2` sips |
| `chaos_everyone_else_shot` | Mutiny | 10 | 10% | `auto` | Everyone except you drinks `1` shot |
| `chaos_you_drink_shots` | Self Destruct | 10 | 10% | `auto` | You drink `2` shots |
| `chaos_blackout_tax` | Blackout Tax | 9 | 9% | `auto` | You drink `1` shot and everyone else drinks `1` sip |
| `chaos_skull_crusher` | Skull Crusher | 7 | 7% | `auto` | One random other player chugs; if nobody else exists, you chug |
| `chaos_last_call` | Last Call | 3 | 3% | `auto` | Everyone chugs |
| `chaos_russian_roulette` | Russian Roulette | 5 | 5% | `target_pick` | Pick one other player; then either they or you chug at random |

## Flow notes

### `auto`

After reveal, the chooser acknowledges the card and the effect is applied automatically by the backend.

### `give_out`

After reveal, the chooser continues to a distribution screen and assigns the revealed pool manually.

Current special constraint:

- `safe_house_edge` requires at least `1` self-assigned sip

### `target_pick`

Currently only `chaos_russian_roulette` uses this mode.

Flow:

1. chooser reveals the card
2. chooser continues to target selection
3. chooser picks one other participant
4. backend randomly selects either chooser or target as the loser
5. loser gets a `chug`

## Outdated ideas removed

The earlier note about cards like `Panic Button` being recommended but not implemented is no longer part of the current implementation source of truth.
