# Ideas

Brainstorm for features that would make suffroyale.com more fun. Scope: single lobby only, no cross-lobby persistence. Each idea has a short pitch; we'll mark the cool ones after discussing.

## Scoring

### 1. Points & live leaderboard
Award points per event: entrance survival tick, eliminations made, bonus if your wrestler wins. Live-updating leaderboard sidebar during the rumble so players see their rank shift in real time instead of only at the end.

### 2. Wrestler tiers / balance
Tag wrestlers S/A/B/C tier based on historical rumble performance. Use tiers to balance draws (each player must get 1 S, 2 A, etc.) or to weight scoring (eliminating an S-tier gives more points).

## Drafting / pre-rumble

### 3. Snake draft mode
Instead of random assignment, players take turns picking wrestlers in snake order (1-2-3-3-2-1). Adds strategy and trash talk before the match even starts.

### 4. Auction draft
Everyone gets N coins, bid on wrestlers. Big names cost more, forces you to balance stars vs. depth. Classic fantasy-sports mechanic.

### 5. Blind pick with reveal
Everyone secretly picks wrestlers from a shared pool; reveal simultaneously. Duplicates get resolved by random or re-pick. Faster than a draft but still has a choice element.

### 6. Predictions bracket
Before the rumble, each player predicts: winner, final 4, first eliminated, iron man. Points awarded at the end. Works even if players also have assigned wrestlers.

## Live gameplay

### 7. Prop bets during the rumble
Mid-match micro-bets: "will the next entrant last 5 minutes?", "next elimination within 60s?". Resolve live, award bonus points. Keeps people engaged even when their wrestler is out.

### 9. Heat meter per wrestler
Visualize each wrestler's "heat" (time in ring + eliminations). Hot wrestlers glow. Adds a data-viz layer that makes the game feel more alive on screen.

## Social / chaos

### 10. Dare cards
Random dares drawn at key moments: "take a shot when your wrestler eliminates someone", "do 10 pushups when the #10 entrant arrives". Drinking-game energy, opt-in per lobby.

### 11. Mystery chest rewards on elimination
When your wrestler scores an elimination, you do not immediately hand out a fixed shot or sip. Instead, you choose between 2 or 3 chest types, then the game rolls a random reward from that chest's own pool. The chest choice gives the eliminator some control over the vibe of the room, but the reveal keeps the moment unpredictable.

#### Why this could be one of the best drinking mechanics
- Eliminations become mini jackpot moments instead of plain bookkeeping.
- The eliminator gets a real decision, not just an automatic punishment.
- The room can self-regulate its drinking pace during the match.
- Backfires create the funniest stories because greed can punish the picker.
- The same system can work for light groups and total maniacs just by changing the unit size and reward tables.

#### Main design goal
This system should do three things at the same time:
- make eliminations feel exciting
- let players softly steer how hard the room drinks
- stay fast enough that it never slows the host down

#### The key to pacing: drink units plus chest choice
Units are just `shots` or `sips`. The host does not configure unit meaning. Instead, the lobby sets a `chest aggression multiplier` that scales how hard chest cards hit.

Suggested multipliers:
- `0.75x`: soft game
- `1.0x`: default
- `1.25x`: spicy
- `1.5x`: feral

Rule for scaling:
- multiply every numeric drink amount by the multiplier
- round to the nearest whole number
- minimum result is always `1`
- chug cards do not scale
- if a scaled card becomes too large for the room, the host can cap any single player hit at `4`

Examples:
- `2 shots` at `1.25x` becomes `3 shots`
- `3 sips` at `0.75x` becomes `2 sips`
- `everyone drinks 1` at `1.5x` becomes `everyone drinks 2`

#### Suggested chest lanes
Every elimination should usually offer 3 lanes:
- `Safe Chest`: low risk, low variance, low total units
- `Group Event Chest`: medium risk, shared pressure, room-wide energy
- `Chaos Chest`: high variance, high ceiling, backfire possible

The picker should see a tiny preview on each chest so the choice feels informed:
- `Safe`: `1-2 units`, `low risk`
- `Group Event`: `2-4 units`, `shared`
- `Chaos`: `0-6 units`, `backfire possible`

This is how the player says "the group is hungry, let's turn it up" without being able to script the exact outcome.

#### Card tables
Below are concrete chest pools with probabilities. Percentages are per chest open. If you want deck behavior instead of pure RNG later, these same weights can be approximated with duplicated cards in a deck.

#### Why the choice itself is fun
The reveal is only half the moment. The public chest choice is the other half.

People will react to the pick before the card even flips:
- "Coward, he picked Safe again."
- "Nice, Group Event, we are waking the room up."
- "He opened Chaos, this could blow up in his face."

That social read is a big part of why this is stronger than a flat rule. It creates table talk and lets players perform a little. The eliminator gets a tiny power fantasy, but because the reward is still random, that power fantasy can collapse into a self-own.

#### Chest identities

##### Safe Chest
- low variance
- almost no self-damage
- mostly targeted or catch-up effects
- best when the room needs a breather or the picker wants clean control

Safe should feel like: "I want something useful and funny, but I do not want to nuke the table right now."

##### Group Event Chest
- medium variance
- shared burden
- keeps eliminated players engaged too
- best when the room wants momentum without total cruelty

Group Event should feel like: "Let's keep everybody involved and move the energy up a notch."

##### Chaos Chest
- highest variance
- best story potential
- strongest rewards
- real chance to punish the picker or hand power to someone else

Chaos should feel like: "I want the pop. If it burns me, so be it."

#### What makes chest rewards actually work
- Most rewards should resolve in under 10 seconds.
- Most rewards should affect 1 to 4 people, not the full room every time.
- Heavy effects should lean toward the people who drank the least, not the people who are already dying.
- Backfires should be funny, not miserable.
- Chug effects should be rare and probably live only in `Chaos` or `Hungry` mode.
- The text on a reward card should be readable out loud in one breath.
- Cards should come from decks, not pure unlimited RNG, so the same effect does not appear three times in a row.

#### Why tracking drink totals matters
This idea gets much better if the app tracks a simple `drink total` per player.

That unlocks the best kind of "fair" cruelty:
- the game can punish the people who coasted the most
- the room can self-balance without a host doing math
- cards like "the person who drank the least must chug" become automatic
- you avoid the same one or two unlucky people getting farmed forever

This is where the chest system becomes smarter than a dumb spinner or random dare app.

#### Safe Chest card table
Safe is mostly targeted, low-spike, low-backfire.

| Probability | Card |
| --- | --- |
| 22% | Give `1` to any player. |
| 18% | Split `2` between up to two players. |
| 15% | The player with the lowest total drinks `2`. |
| 12% | The two players with the lowest totals each drink `1`. |
| 10% | Choose one player, you and that player each drink `1`. |
| 9% | Give `2`, but only to players below the room average. |
| 8% | The last person you targeted gives `1` to any player. |
| 6% | Take `1` yourself to distribute `3` total. |
|

Expected base impact at `1.0x`:
- usually `1` to `2` drinks total dealt
- occasional `3`
- almost never a hard punish on the picker

#### Group Event Chest card table
Group Event is the middle lane. It should wake the table up without feeling evil.

| Probability | Card |
| --- | --- |
| 20% | Everyone drinks `1`. |
| 16% | Every player below the room average drinks `1`. |
| 14% | Distribute `4` total, max `1` per player. |
| 12% | Pick `3` players, each drinks `1`. |
| 10% | Anyone with no active wrestler drinks `1`. |
| 10% | The three players with the lowest totals each drink `1`. |
| 8% | Everyone except the picker drinks `1`. |
| 6% | Your last target gives `2`, one at a time, to two different players. |
| 4% | Everyone drinks `1`, picker drinks `0`. Then choose one player to drink `1` more. |
|

Expected base impact at `1.0x`:
- usually `3` to `5` drinks total across the room
- often spread out
- very little direct self-punish

#### Chaos Chest card table
Chaos needs obvious upside and obvious danger. It should be the greed chest.

| Probability | Card |
| --- | --- |
| 18% | Distribute `5` however you want. Then roll backfire: `35%` chance you drink `2`. |
| 15% | Pick one player to drink `3`. Then roll backfire: `30%` chance you drink `3` instead. |
| 13% | Everyone drinks `1`. Then roll backfire: `40%` chance you drink `2`. |
| 12% | The player with the lowest total drinks `3`, but they may make you drink `2` instead. |
| 10% | Choose: you drink `2`, or everyone else drinks `1`. |
| 10% | Your last target gets revenge and redirects `2` however they want. |
| 8% | Distribute `6`, but at least `2` must go to players with the lowest totals. |
| 7% | Random player below average drinks `3`. Then roll backfire: `25%` chance everyone drinks `1`. |
| 5% | Everyone drinks `1`, and the player with the lowest total drinks `2` more. |
| 2% | The player with the lowest total must chug. |
|

Expected base impact at `1.0x`:
- usually `4` to `7` drinks total generated
- real chance the picker gets hit
- rare huge pop moments

#### Probability notes
- `Safe` should have no true dead roll. Opening it should almost always feel useful.
- `Group Event` should have high consistency. The room should know it is choosing momentum.
- `Chaos` should have a visible chance to backfire on about `40%` of its cards, but not always equally hard.
- Chug should stay rare, around `1%` to `3%`, otherwise the joke dies fast.

#### Recommended display in the app
- `Safe`: `low risk`, `mostly 1-2`
- `Group Event`: `shared`, `usually 3-5 total`
- `Chaos`: `high risk`, `big swings`, `backfire possible`

#### Multiplier examples on real cards
- Safe card `Give 1 to any player`:
  `0.75x` -> `1`, `1.0x` -> `1`, `1.25x` -> `1`, `1.5x` -> `2`
- Group card `Pick 3 players, each drinks 1`:
  `0.75x` -> each `1`, `1.0x` -> each `1`, `1.25x` -> each `1`, `1.5x` -> each `2`
- Chaos card `Pick one player to drink 3`:
  `0.75x` -> `2`, `1.0x` -> `3`, `1.25x` -> `4`, `1.5x` -> `5`

#### Best initial rule set
- units are just `shots` or `sips`
- host sets chest aggression multiplier before the match
- every elimination offers `Safe`, `Group Event`, `Chaos`
- card text is prewritten and probability driven
- drink totals are tracked so low-total cards can resolve instantly
- `Chaos` is the only chest with true backfire and chug outcomes

#### Cards grouped by UI difficulty
This is the useful cut for implementation. The first ship should bias heavily toward cards that can resolve with zero or one tap after the chest opens.

##### Tier 1: auto-resolve cards
No extra picker input after reveal. The app can apply the result instantly.

Best for v1 because these are fast, obvious, and do not block the host.

Cards:
- `The player with the lowest total drinks 2`
- `The two players with the lowest totals each drink 1`
- `Everyone drinks 1`
- `Every player below the room average drinks 1`
- `Anyone with no active wrestler drinks 1`
- `The three players with the lowest totals each drink 1`
- `Everyone except the picker drinks 1`
- `Everyone drinks 1, and the player with the lowest total drinks 2 more`
- `Random player below average drinks 3. Then roll backfire: 25% chance everyone drinks 1`
- `The player with the lowest total must chug`

Why easy:
- no targeting UI
- no second actor
- no conditional choice after reveal, except simple built-in random or backfire logic

##### Tier 2: single target select cards
One picker decision after reveal. Choose one player, then resolve.

Still very good for v1 if the current UI already supports selecting one participant quickly.

Cards:
- `Give 1 to any player`
- `Choose one player, you and that player each drink 1`
- `Pick 3 players, each drinks 1`
- `Pick one player to drink 3. Then roll backfire: 30% chance you drink 3 instead`
- `Everyone drinks 1, picker drinks 0. Then choose one player to drink 1 more`

Why medium-easy:
- requires only a quick participant picker
- no need to track temporary state beyond chosen targets

##### Tier 3: constrained distribution cards
The picker must assign multiple drinks under simple rules.

These are still realistic if the UI can show plus/minus controls or tap-to-assign chips.

Cards:
- `Split 2 between up to two players`
- `Give 2, but only to players below the room average`
- `Take 1 yourself to distribute 3 total`
- `Distribute 4 total, max 1 per player`
- `Distribute 5 however you want. Then roll backfire: 35% chance you drink 2`
- `Distribute 6, but at least 2 must go to players with the lowest totals`

Why harder:
- needs validation rules
- needs a more deliberate assignment UI
- easy to slow the game down if the interaction is clunky

##### Tier 4: reverse power cards
Another player gets agency after the reveal.

These are fun, but they add latency because the app has to hand control to somebody else.

Cards:
- `The last person you targeted gives 1 to any player`
- `Your last target gives 2, one at a time, to two different players`
- `Your last target gets revenge and redirects 2 however they want`
- `The player with the lowest total drinks 3, but they may make you drink 2 instead`

Why harder:
- requires tracking `last target` reliably
- requires handing control to a second player
- creates waiting time if that player is drunk, slow, or confused

##### Tier 5: explicit choice cards
The revealed card contains a binary choice instead of a pure result.

These are not technically hard, but they add one more decision point and should stay limited in v1.

Cards:
- `Choose: you drink 2, or everyone else drinks 1`

Why medium:
- trivial UI if choices are buttons
- still adds a pause, so too many of these will drag

#### Best v1 chest pool by UI simplicity
If we want the easiest first version, start with mostly Tier 1 and Tier 2 cards.

##### Safe Chest v1
- `Give 1 to any player`
- `The player with the lowest total drinks 2`
- `The two players with the lowest totals each drink 1`
- `Choose one player, you and that player each drink 1`

##### Group Event Chest v1
- `Everyone drinks 1`
- `Every player below the room average drinks 1`
- `Anyone with no active wrestler drinks 1`
- `Everyone except the picker drinks 1`
- `Pick 3 players, each drinks 1`

##### Chaos Chest v1
- `Pick one player to drink 3. Then roll backfire: 30% chance you drink 3 instead`
- `Everyone drinks 1. Then roll backfire: 40% chance you drink 2`
- `Choose: you drink 2, or everyone else drinks 1`
- `Random player below average drinks 3. Then roll backfire: 25% chance everyone drinks 1`
- `The player with the lowest total must chug`

This v1 pool avoids the slowest UX patterns:
- no multi-step distribution UI
- no second-player redirect turns
- almost no rule validation after reveal

#### Save for v2
These are the first cards I would cut if we want to ship fast:
- all `distribute X` cards
- all `last target` cards
- all redirect or revenge cards

They are good cards, but they want better targeting and handoff UI than the app probably has right now.

#### Good chaos versus bad chaos
Good chaos:
- creates a loud table reaction
- resolves fast
- makes the picker sweat before reveal
- sometimes embarrasses the picker
- changes who is involved in the moment

Bad chaos:
- needs too much explanation
- creates long delayed conditions nobody remembers
- keeps hammering the same player all night
- is so harsh that players stop wanting eliminations at all

The chest system only works if it stays on the good side.

#### Pacing and UX guardrails
This feature can become amazing or annoying depending on speed.

Best guardrails:
- chest choice happens on the eliminating player's screen, not in the host's main logging flow
- the host can keep entering events immediately
- chest choice times out into `Safe` after a short timer
- reward text is one line plus one confirmation tap
- no card should require more than one follow-up decision

If the UX is sharp, this system adds flavor. If the UX is slow, it becomes a traffic jam.

#### What the first version should probably be
- 3 chest families: `Safe`, `Group Event`, `Chaos`
- 8 to 10 rewards per chest
- unit type is `shots` or `sips`
- chest aggression multiplier is a lobby setting
- a simple `drink total` tracker per player
- backfire chance only on `Chaos`
- no effects that last longer than the current moment
- no repeated draws from the same chest deck until reshuffle

That is already enough to make eliminations feel special, let the room steer the drinking level, and create stories without turning the app into a full board game.

#### Future spice if the base version works
- rare gold chest on double elimination
- chest pools that change in the final four
- theme-specific chest decks
- non-alcoholic chest decks built around dares instead of drinks
- a host option to show only 2 chests for faster groups

## Meta / UX

### 13. Rumble replay timeline
After the rumble, a scrubbable timeline of entrances + eliminations. Export as image to share in the group chat.

### 14. Commentary feed
Auto-generated one-liners in a feed ("John Cena tosses Randy Orton after 42 seconds!"). Template-based, uses wrestler names. Feels like a broadcast.

### 15. Custom wrestler pool
Lobby creator can restrict the pool (e.g. "2020s only", "heels only", "legends"). Changes the vibe per party.

### 16. Theme per lobby
Lobby creator picks a visual theme (attitude era, ruthless aggression, current) that changes the frontend look. Cosmetic, but fun.

## Extra ideas

### 18. Secret side quests
Each player gets 1-2 hidden objectives before the rumble: "your wrestler must survive 10 minutes", "score a double elimination", "enter in the first half and still make final 4". Reveal them at the end for bonus points and laughs.

### 19. Bounty wrestler
Every few entrants, the game randomly marks one active wrestler as the bounty. Whoever owns the wrestler that eliminates them gets a chunky bonus. Creates a temporary shared target everyone watches.

### 20. Comeback mechanic for busted players
Once all of your wrestlers are out, you unlock small prediction prompts for the rest of the match: next entrant odd/even, next elimination within 2 minutes, will the next entrant score an elimination. Keeps eliminated players engaged without overshadowing the main game.

### 21. Streak bonuses
Reward streaks like back-to-back eliminations, surviving 5 entrant intervals, or entering from an unlucky number and overperforming. Helps the scoring feel more dramatic than just counting raw eliminations.

### 22. Final four market
During the early and mid game, players can lock in live picks for final four while the match is ongoing. Picks get riskier as the rumble evolves, but late picks score fewer points. Adds tension even for people with weak wrestler draws.

### 23. Rivalry callouts
If a wrestler eliminates someone tied to the same participant multiple times across the match, or if two owners keep trading eliminations, the app calls it out as a "rivalry" in the feed. Purely cosmetic, but it gives the history more personality.

### 24. Host correction queue
Lightweight undo/correction flow for the host: wrong offender selected, wrong victim selected, accidental duplicate entrance. Not a flashy feature, but it would save real frustration during chaotic live use.

### 25. Moment of the match
At the end, the app auto-nominates 3-5 standout moments from the rumble: biggest elimination swing, longest survival, craziest multi-elimination, worst choke. Gives the session a strong ending and something shareable.
