Original prompt: Implement a new type of mystery box that gives the player a choice between to two different effects

2026-04-18
- Revised requirement: choice stays a card mode inside the existing `safe` / `group` / `chaos` chests, not a fourth chest type.
- Scope: add backend support for a new `effect_choice` card mode and a follow-up selection step on the distribute screen.
- Design target: keep the `effect_choice` infrastructure available so concrete choice cards can be added later inside the existing `safe` / `group` / `chaos` pools.
- Note: admin-trigger follow-up flows appear to send the viewer id instead of the acting chooser id; if touched by the new flow, fix alongside it.
- Implemented backend support for `effect_choice` cards, persisted `choice_options` / `selected_choice_key`, and added a `resolve-choice` API route plus reveal/pending statuses for effect-choice cards.
- Implemented frontend support for follow-up effect-choice screens, shared chest-card text helpers, and pending-task counting for unresolved chest follow-ups.
- Removed the temporary live choice cards from the `group` / `chaos` pools and from the source-of-truth docs/admin trigger menu, while keeping the reusable `effect_choice` flow in place.
- Fixed the follow-up action header bug in distribution / target-pick flows by using the acting chooser id instead of the viewer id.
- Added backend feature tests for resolving synthetic `effect_choice` rewards into `resolved` and `pending_distribution`, so the flow stays covered without any live choice cards.
- Verification: `frontend` `npm run build` passed.
- Verification: `php artisan test --filter=ChestRewardChoiceTest` passed inside the API container, with warning-level output from PHP/Laravel during the requests.
