# Cards

This document mirrors the current mystery chest implementation in:

- `backend/laravel/app/Services/ChestRewardResolver.php`
- `frontend/src/routes/distribute.tsx`
- `frontend/src/i18n.tsx`

## Modes

- `auto` — effect resolves automatically after reveal
- `give_out` — chooser distributes the revealed sips/shots manually
- `effect_choice` — chooser reveals the card, then picks one of two built-in effects
- `target_pick` — chooser selects a target, then the backend resolves the result

## Scaling

Chest amounts are scaled by `chest_aggression_multiplier`.

For every non-zero numeric drink amount, the backend applies:

- `round(base_amount * multiplier)`
- minimum result is `1` if the base amount was non-zero

This applies to:

- `schluecke`
- `shots`
- `self_schluecke`
- `self_shots`
- `minimum_self_schluecke`
- `minimum_self_shots`

This does not affect special effects like chugs, target-pick logic, or cards that double current undrunk drink debt.

## Current cards

### Safe

| Key | Title | Weight | Probability | Mode | Base effect |
| --- | --- | ---: | ---: | --- | --- |
| `safe_give_sips` | Pocket Pour | 40 | 28.6% | `give_out` | Give out `3` sips |
| `safe_give_shot` | Loaded Thumb | 20 | 14.3% | `give_out` | Give out `1` shot |
| `safe_you_and_random_sip` | Friendly Fire | 20 | 14.3% | `auto` | You and one random other player drink `2` sips each |
| `safe_house_edge` | House Edge | 20 | 14.3% | `give_out` | Give out `4` sips, with at least `1` sip assigned to yourself |
| `safe_current_body_count` | Body Count | 12 | 8.6% | `give_out` | Give out sips equal to your current wrestler's eliminations this match |
| `safe_stable_hands` | Stable Hands | 10 | 7.1% | `give_out` | Give out sips equal to the total eliminations across all wrestlers you have had this match |
| `safe_burned_slots` | Burned Slots | 9 | 6.4% | `give_out` | Give out sips equal to how many of your wrestlers have already been eliminated this match |
| `safe_blank_check` | Blank Check | 9 | 6.4% | `give_out` | Give out sips equal to how many of your wrestlers this match have `0` eliminations |

### Group

| Key | Title | Weight | Probability | Mode | Base effect |
| --- | --- | ---: | ---: | --- | --- |
| `group_everyone_sip` | Roll Call | 25 | 20.3% | `auto` | Everyone drinks `2` sips |
| `group_everyone_else_sip` | Center Stage | 20 | 16.3% | `auto` | Everyone except you drinks `2` sips |
| `group_cheap_seats` | Cheap Seats | 20 | 16.3% | `auto` | Everyone without an active wrestler drinks `2` sips |
| `group_main_event` | Main Event | 15 | 12.2% | `auto` | Everyone drinks `1` shot |
| `group_double_undrunk_sips` | Encore | 10 | 8.1% | `auto` | Double every player's current undrunk sips |
| `group_double_undrunk_shots` | Double Tap | 10 | 8.1% | `auto` | Double every player's current undrunk shots |
| `group_double_or_nothing` | Double or Nothing | 4 | 3.3% | `effect_choice` | Choose either: double every player's current undrunk sips, or double every player's current undrunk shots |
| `group_body_count` | Tally Sheet | 4 | 3.3% | `auto` | Everyone drinks sips equal to your current wrestler's eliminations this match |
| `group_stable_hands` | Deep Bench | 3 | 2.4% | `auto` | Everyone drinks sips equal to the total eliminations across all wrestlers you have had this match |
| `group_burned_slots` | Burn Rate | 2 | 1.6% | `auto` | Everyone drinks sips equal to how many of your wrestlers have already been eliminated this match |
| `group_old_hands` | Old Hands | 4 | 3.3% | `auto` | Everyone whose wrestler has at least `3` historical Rumble appearances drinks `4` sips |
| `group_edge_number` | Edge Number | 3 | 2.4% | `auto` | Everyone whose wrestler has ever entered at `#1` or `#30` drinks `5` sips |
| `group_no_rumble_resume` | No Resume | 3 | 2.4% | `auto` | Everyone whose wrestler has `0` historical Rumble appearances drinks `3` sips |

### Chaos

| Key | Title | Weight | Probability | Mode | Base effect |
| --- | --- | ---: | ---: | --- | --- |
| `chaos_give_sips` | Rainmaker | 20 | 20.2% | `give_out` | Give out `8` sips |
| `chaos_give_shots` | Powder Keg | 18 | 18.2% | `give_out` | Give out `3` shots |
| `chaos_everyone_sip` | Shockwave | 12 | 12.1% | `auto` | Everyone drinks `2` sips |
| `chaos_everyone_else_shot` | Mutiny | 9 | 9.1% | `auto` | Everyone except you drinks `1` shot |
| `chaos_you_drink_shots` | Self Destruct | 9 | 9.1% | `auto` | You drink `2` shots |
| `chaos_blackout_tax` | Blackout Tax | 8 | 8.1% | `auto` | You drink `1` shot and everyone else drinks `1` sip |
| `chaos_skull_crusher` | Skull Crusher | 6 | 6.1% | `auto` | One random other player chugs; if nobody else exists, you chug |
| `chaos_last_call` | Last Call | 3 | 3% | `auto` | Everyone chugs |
| `chaos_russian_roulette` | Russian Roulette | 5 | 5.1% | `target_pick` | Pick one other player; then either they or you chug at random |
| `chaos_blood_price` | Blood Price | 2 | 2% | `auto` | You drink shots equal to the total eliminations across all wrestlers you have had this match |
| `chaos_open_tab` | Open Tab | 2 | 2% | `give_out` | Give out sips equal to the total eliminations across all wrestlers you have had this match, and shots equal to your current wrestler's eliminations |
| `chaos_legends_due` | Legends Due | 2 | 2% | `auto` | Player or players whose wrestler has the most historical Rumble appearances drink `1` shot |
| `chaos_veteran_floor` | Veteran Floor | 2 | 2% | `auto` | Everyone whose wrestler has at least `3` historical Rumble appearances drinks `1` shot |
| `chaos_edge_number_tax` | Edge Number Tax | 1 | 1% | `auto` | Everyone whose wrestler has ever entered at `#1` or `#30` drinks `1` shot |

## Flow notes

### `auto`

After reveal, the backend applies the effect immediately.

The chooser then acknowledges the reveal to clear the chest from the pending flow.

For auto cards that persist `affected_participant_ids`, the reveal UI also lists exactly which participants were affected.

For `group_double_undrunk_sips` and `group_double_undrunk_shots`, the backend uses each participant's current remaining drink debt:

- total assigned sips or shots
- minus sips or shots already marked as drunk in the personal tracker

### `give_out`

After reveal, the chooser continues to a distribution screen and assigns the revealed pool manually.

Current special constraint:

- `safe_house_edge` requires at least `1` self-assigned sip

### `effect_choice`

Current live `effect_choice` cards:

- `group_double_or_nothing`

Flow:

1. chooser reveals the card
2. chooser acknowledges the reveal
3. chooser picks one of the two predefined effects
4. the chosen effect either:
   - resolves immediately if it is an `auto` effect
   - moves directly into pending distribution if it is a `give_out` effect

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
