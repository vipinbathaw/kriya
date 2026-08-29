# Roadmap

Rough plan for where Kriya is headed. The phases below map to GitHub milestones,
and each item has an issue.

## v0.1.x Foundations

Cleanup and fixes to sort out before piling on more features.

- Wire AI tagging into the notes service. Right now it only does rule-based tags
  even when a user has AI turned on.
- Decide how tags are stored. The `note_tags`/`finance_tags` tables exist but
  nothing writes to them, we only use the JSON column. Pick one and stick with it.
- Fix the nutrition queue so it survives more than one server instance. The
  current setInterval poll will process the same entry twice.
- Get the AI model list out of the migration. It's hardcoded and already out of date.
- Add some metrics/logging around AI calls and the queue.

## v0.2 Near term

Stuff we can build on what's already there.

- One input box that works out whether you're adding a note, an expense, or a meal.
- Search across all three modules at once.
- Recurring transactions and budgets.
- Export/import (CSV and JSON).

## v0.3 Mid term

New modules, same shape as the existing ones.

- Habits / streaks
- Tasks / todos
- Health metrics (weight, sleep, mood, water, steps)
- Weekly/monthly summary put together by AI
- Reminders and push notifications

## v1.0 Later

Bigger bets.

- Chat / Q&A over your own data
- Mobile app (Expo), reusing the shared schemas
- Turn bank/UPI SMS into transactions
- OCR for receipts and food labels
- Multiple users / family accounts
