# Cards

`cards.md` is the source of truth for the live mystery chest card pool.

It is implemented in:

- `backend/laravel/app/Services/ChestRewardResolver.php`
- `frontend/src/chest_cards.ts`
- `frontend/src/i18n.tsx`
- `frontend/src/routes/distribute.tsx`

## Modes

- `auto`: resolves immediately after reveal
- `give_out`: chooser distributes the revealed pool manually
- `effect_choice`: chooser reveals the card, then picks one of two built-in effects
- `target_pick`: chooser selects a target, then the backend resolves the result

## Scaling

`chest_aggression_multiplier` scales every non-zero drink amount with:

- `round(base_amount * multiplier)`
- minimum result `1` if the base amount was non-zero

This applies to:

- `schluecke`
- `shots`
- `self_schluecke`
- `self_shots`
- `minimum_self_schluecke`
- `minimum_self_shots`
- `random_sips_max`
- `random_shots_max`

This does not change chugs, target-pick logic, or debt-doubling cards.

## Safe

| Key | Title | Weight | Mode | Effect |
| --- | --- | ---: | --- | --- |
| `safe_give_sips` | Pocket Pour | 40 | `give_out` | Give out `3` sips |
| `safe_give_shot` | Loaded Thumb | 20 | `give_out` | Give out `1` shot |
| `safe_you_and_random_sip` | Friendly Fire | 20 | `auto` | You and one random other player drink `2` sips each |
| `safe_house_edge` | House Edge | 20 | `give_out` | Give out `4` sips, with at least `1` sip assigned to yourself |
| `safe_sweet_deal` | Sweet Deal | 10 | `effect_choice` | Choice: give out `3` sips, or give out `9` sips with at least `3` assigned to yourself |
| `safe_marked_bullet` | Marked Bullet | 10 | `effect_choice` | Choice: give out `1` shot, or roll between two `2`-shot outcomes |
| `safe_current_body_count` | Body Count | 12 | `give_out` | Give out sips equal to your current wrestler's eliminations this match |
| `safe_stable_hands` | Stable Hands | 10 | `give_out` | Give out sips equal to the total eliminations across all wrestlers you have had this match |
| `safe_burned_slots` | Burned Slots | 9 | `give_out` | Give out sips equal to how many of your wrestlers have already been eliminated this match |
| `safe_blank_check` | Blank Check | 9 | `give_out` | Give out sips equal to how many of your wrestlers this match have `0` eliminations |

## Group

| Key | Title | Weight | Mode | Effect |
| --- | --- | ---: | --- | --- |
| `group_everyone_sip` | Roll Call | 25 | `auto` | Everyone drinks `2` sips |
| `group_everyone_else_sip` | Center Stage | 20 | `auto` | Everyone except you drinks `2` sips |
| `group_cheap_seats` | Cheap Seats | 20 | `auto` | Everyone without an active wrestler drinks `2` sips |
| `group_main_event` | Main Event | 15 | `auto` | Everyone drinks `1` shot |
| `group_double_undrunk_sips` | Encore | 10 | `auto` | Double every player's current undrunk sips |
| `group_double_undrunk_shots` | Double Tap | 10 | `auto` | Double every player's current undrunk shots |
| `group_double_down` | Double Down | 6 | `effect_choice` | Choice: double every player's current undrunk sips, or double every player's current undrunk shots |
| `group_double_or_nothing` | Double or Nothing | 10 | `effect_choice` | Choice: everyone drinks `3` sips, or roll between `everyone else drinks 6 sips` and `you chug` |
| `group_house_round` | House Round | 8 | `effect_choice` | Choice: everyone else drinks `3` sips, or everyone drinks `1` shot |
| `group_slot_machine` | Slot Machine | 8 | `auto` | Everyone gets a random number of `0` to `8` sips |
| `group_body_count` | Tally Sheet | 4 | `auto` | Everyone drinks sips equal to your current wrestler's eliminations this match |
| `group_stable_hands` | Deep Bench | 3 | `auto` | Everyone drinks sips equal to the total eliminations across all wrestlers you have had this match |
| `group_burned_slots` | Burn Rate | 2 | `auto` | Everyone drinks sips equal to how many of your wrestlers have already been eliminated this match |
| `group_old_hands` | Old Hands | 4 | `auto` | Everyone whose wrestler has at least `3` historical Rumble appearances drinks `4` sips |
| `group_edge_number` | Edge Number | 3 | `auto` | Everyone whose wrestler has ever entered at `#1` or `#30` drinks `5` sips |
| `group_no_rumble_resume` | No Resume | 3 | `auto` | Everyone whose wrestler has `0` historical Rumble appearances drinks `3` sips |

## Chaos

| Key | Title | Weight | Mode | Effect |
| --- | --- | ---: | --- | --- |
| `chaos_give_sips` | Rainmaker | 20 | `give_out` | Give out `8` sips |
| `chaos_give_shots` | Powder Keg | 18 | `give_out` | Give out `3` shots |
| `chaos_everyone_sip` | Shockwave | 12 | `auto` | Everyone drinks `2` sips |
| `chaos_everyone_else_shot` | Mutiny | 9 | `auto` | Everyone except you drinks `1` shot |
| `chaos_you_drink_shots` | Self Destruct | 9 | `auto` | You drink `2` shots |
| `chaos_blackout_tax` | Blackout Tax | 8 | `auto` | You drink `1` shot and everyone else drinks `1` sip |
| `chaos_skull_crusher` | Skull Crusher | 6 | `auto` | One random other player chugs; if nobody else exists, you chug |
| `chaos_last_call` | Last Call | 3 | `auto` | Everyone chugs |
| `chaos_russian_roulette` | Russian Roulette | 5 | `target_pick` | Pick one other player; then either they or you chug at random |
| `chaos_blood_price` | Blood Price | 2 | `auto` | You drink shots equal to the total eliminations across all wrestlers you have had this match |
| `chaos_open_tab` | Open Tab | 2 | `give_out` | Give out sips equal to the total eliminations across all wrestlers you have had this match, and shots equal to your current wrestler's eliminations |
| `chaos_legends_due` | Legends Due | 2 | `auto` | Player or players whose wrestler has the most historical Rumble appearances drink `2` shots |
| `chaos_veteran_floor` | Veteran Floor | 2 | `auto` | Everyone whose wrestler has at least `3` historical Rumble appearances drinks `1` shot |
| `chaos_edge_number_tax` | Edge Number Tax | 1 | `auto` | Everyone whose wrestler has ever entered at `#1` or `#30` drinks `1` shot |
| `chaos_high_treason` | High Treason | 3 | `effect_choice` | Choice: you drink `1` shot, or everyone chugs |
| `chaos_kates_worst_nightmare` | Kate's Worst Nightmare | 5 | `effect_choice` | Choice: you take `50` sips, or you take `1` shot |
| `chaos_loaded_dice` | Loaded Dice | 5 | `effect_choice` | Choice: give `6` sips, or give `6` shots with at least `1` shot assigned to yourself |

## Effect-choice details

### `safe_sweet_deal`

- `give_three`: give out `3` sips
- `big_pool_self_three`: give out `9` sips, minimum self `3` sips

### `safe_marked_bullet`

- `give_one_shot`: give out `1` shot
- `double_shot_gamble`: weighted roll
- `self_backfire`: `30%`, chooser drinks `2` shots
- `random_target`: `70%`, one random player drinks `2` shots

### `group_double_or_nothing`

- `everyone_three_sips`: everyone drinks `3` sips
- `riot_or_ruin`: weighted roll
- `room_pays`: `70%`, everyone except chooser drinks `6` sips
- `you_chug`: `30%`, chooser chugs

### `group_double_down`

- `double_sips`: double every player's current undrunk sips
- `double_shots`: double every player's current undrunk shots

### `group_house_round`

- `everyone_else_three_sips`: everyone except chooser drinks `3` sips
- `everyone_one_shot`: everyone drinks `1` shot

### `chaos_high_treason`

- `take_the_fall`: chooser drinks `1` shot
- `burn_it_down`: everyone chugs

### `chaos_kates_worst_nightmare`

- `take_fifty_sips`: chooser takes `50` sips
- `take_one_shot`: chooser takes `1` shot

### `chaos_loaded_dice`

- `give_six_sips`: give out `6` sips
- `drink_one_and_give_six_shots`: give out `6` shots, minimum self `1` shot

## Flow notes

### `auto`

- Resolves immediately after reveal
- Stores `affected_participant_ids` when the backend can determine exactly who was hit
- For random-outcome cards, the backend resolves and persists the fired sub-outcome once

### `give_out`

- Reveals the pool first
- Then moves into manual distribution

Special constraints:

- `safe_house_edge`: minimum self `1` sip
- `safe_sweet_deal.big_pool_self_three`: minimum self `3` sips
- `chaos_loaded_dice.drink_one_and_give_six_shots`: minimum self `1` shot

### `effect_choice`

Flow:

1. Reveal the card
2. Acknowledge the reveal
3. Choose one option
4. If that option contains a weighted roll, the backend resolves it immediately and persists the fired outcome
5. The result either auto-resolves or moves into pending distribution

### `target_pick`

Currently only `chaos_russian_roulette` uses this mode.

Flow:

1. Reveal the card
2. Continue to target selection
3. Choose one other participant
4. Backend randomly selects either chooser or target as the loser
5. Loser gets a `chug`
