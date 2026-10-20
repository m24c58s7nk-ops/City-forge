# Euchre — SwiftUI Starter

City Forge has been repurposed as the starting point for a native SwiftUI Euchre card game.

## Files
- `EuchreApp.swift` — SwiftUI app entry point.
- `ContentView.swift` — card table, dealing, trump selection, trick play, and score display.

## Current starter features
- Four seats: you, your partner, and two computer opponents.
- Euchre-style 24-card deck (9 through Ace).
- Suit selection for trump, card play, following suit, and left/right bower ranking.
- Trick counting and team score display.

## Important
This repository was originally a Vite web app and is now being converted to Swift source. GitHub's web editor can edit these files, but it cannot compile or run a SwiftUI iOS app. To run it, create/open a SwiftUI app project in Xcode or Swift Playgrounds and add these Swift files.

This is an early playable prototype, not yet a complete official-rules implementation: bidding, the dealer's up-card and kitty pickup, loners, and full strategic computer play are future steps.
