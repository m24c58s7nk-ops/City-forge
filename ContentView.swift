import SwiftUI

private enum Suit: String, CaseIterable, Identifiable {
    case clubs, diamonds, hearts, spades
    var id: String { rawValue }
    var symbol: String {
        switch self {
        case .clubs: return "♣"
        case .diamonds: return "♦"
        case .hearts: return "♥"
        case .spades: return "♠"
        }
    }
    var label: String { rawValue.capitalized }
    var isRed: Bool { self == .diamonds || self == .hearts }
}

private struct PlayingCard: Identifiable, Equatable {
    let id = UUID()
    let rank: Int
    let suit: Suit
    var name: String {
        switch rank {
        case 11: return "J"
        case 12: return "Q"
        case 13: return "K"
        case 14: return "A"
        default: return String(rank)
        }
    }
    var description: String { "\(name)\(suit.symbol)" }
}

private struct PlayedCard: Identifiable {
    let id = UUID()
    let player: Int
    let card: PlayingCard
}

struct ContentView: View {
    @State private var hands: [[PlayingCard]] = [[], [], [], []]
    @State private var kitty: [PlayingCard] = []
    @State private var trick: [PlayedCard] = []
    @State private var trump: Suit?
    @State private var leadSuit: Suit?
    @State private var currentPlayer = 0
    @State private var dealer = 0
    @State private var phase = "Welcome to Euchre"
    @State private var message = "Deal the cards to begin."
    @State private var scores = [0, 0]
    @State private var tricksWon = [0, 0]
    @State private var handNumber = 1
    @State private var isChoosingTrump = false
    @State private var isHandOver = false

    private let playerNames = ["You", "West", "Partner", "East"]
    private let green = Color(red: 0.055, green: 0.29, blue: 0.21)

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(red: 0.035, green: 0.13, blue: 0.11), green],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
            VStack(spacing: 16) {
                header
                scoreBoard
                table
                statusPanel
                Spacer(minLength: 0)
                if isChoosingTrump {
                    trumpPicker
                } else if isHandOver {
                    Button("Next hand", action: startNextHand)
                        .buttonStyle(PrimaryButtonStyle())
                } else if hands.allSatisfy({ $0.isEmpty }) {
                    Button("Deal cards", action: dealHand)
                        .buttonStyle(PrimaryButtonStyle())
                } else {
                    handView
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 14)
        }
        .preferredColorScheme(.dark)
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                Text("EUCHRE").font(.system(size: 30, weight: .black, design: .rounded))
                    .tracking(3)
                Text("TRICK-TAKING • PARTNERS • STRATEGY")
                    .font(.system(size: 9, weight: .semibold, design: .rounded))
                    .tracking(1.5).foregroundStyle(.white.opacity(0.65))
            }
            Spacer()
            Text("HAND \(handNumber)")
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .padding(.horizontal, 12).padding(.vertical, 8)
                .background(.white.opacity(0.1), in: Capsule())
        }
    }

    private var scoreBoard: some View {
        HStack(spacing: 10) {
            scoreTile(name: "YOU + PARTNER", score: scores[0], accent: Color(red: 0.95, green: 0.75, blue: 0.34))
            scoreTile(name: "OPPONENTS", score: scores[1], accent: Color(red: 0.55, green: 0.78, blue: 0.95))
        }
    }

    private func scoreTile(name: String, score: Int, accent: Color) -> some View {
        VStack(spacing: 5) {
            Text(name).font(.system(size: 9, weight: .bold, design: .rounded))
                .tracking(1).foregroundStyle(.white.opacity(0.65))
            Text("\(score)").font(.system(size: 28, weight: .black, design: .rounded))
                .foregroundStyle(accent)
            Text("TRICKS \(name == "YOU + PARTNER" ? tricksWon[0] : tricksWon[1]) / 5")
                .font(.system(size: 9, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.5))
        }
        .frame(maxWidth: .infinity).padding(.vertical, 12)
        .background(.black.opacity(0.18), in: RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(.white.opacity(0.08), lineWidth: 1))
    }

    private var table: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 28)
                .fill(LinearGradient(colors: [Color(red: 0.09, green: 0.40, blue: 0.28), Color(red: 0.04, green: 0.24, blue: 0.18)], startPoint: .topLeading, endPoint: .bottomTrailing))
                .overlay(RoundedRectangle(cornerRadius: 28).stroke(Color(red: 0.76, green: 0.58, blue: 0.29).opacity(0.8), lineWidth: 2))
                .shadow(color: .black.opacity(0.3), radius: 18, y: 9)
            RoundedRectangle(cornerRadius: 23).stroke(.white.opacity(0.10), lineWidth: 1).padding(8)

            VStack(spacing: 12) {
                opponentSeat(index: 1)
                HStack {
                    opponentSeat(index: 0)
                    Spacer(minLength: 12)
                    kittyBadge
                    Spacer(minLength: 12)
                    opponentSeat(index: 2)
                }
                trickCenter
                opponentSeat(index: 3)
            }
            .padding(15)
        }
        .frame(height: 300)
    }

    private func opponentSeat(index: Int) -> some View {
        VStack(spacing: 5) {
            HStack(spacing: 5) {
                Circle().fill(currentPlayer == index && !isHandOver ? Color.yellow : .white.opacity(0.25))
                    .frame(width: 6, height: 6)
                Text(playerNames[index].uppercased())
                    .font(.system(size: 10, weight: .bold, design: .rounded)).tracking(1)
            }
            if index == 0 {
                Text("YOUR SEAT").font(.system(size: 8, weight: .medium)).foregroundStyle(.white.opacity(0.45))
            } else {
                HStack(spacing: -12) {
                    ForEach(0..<min(hands[index].count, 5), id: \.self) { _ in
                        CardBackView().frame(width: 25, height: 36)
                    }
                }
            }
            if let played = trick.first(where: { $0.player == index }) {
                PlayingCardView(card: played.card).frame(width: 42, height: 60)
            }
        }
        .padding(.horizontal, 8).padding(.vertical, 4)
    }

    private var kittyBadge: some View {
        VStack(spacing: 5) {
            if let trump {
                Text(trump.symbol).font(.system(size: 28, weight: .bold))
                    .foregroundStyle(trump.isRed ? .red.opacity(0.95) : .white)
                Text("\(trump.label.uppercased()) TRUMP")
                    .font(.system(size: 8, weight: .black, design: .rounded)).tracking(1)
            } else {
                Image(systemName: "suit.spade.fill").font(.system(size: 22))
                    .foregroundStyle(.white.opacity(0.5))
                Text("TRUMP").font(.system(size: 8, weight: .bold, design: .rounded)).tracking(1)
            }
        }
        .frame(width: 68, height: 76)
        .background(.black.opacity(0.14), in: RoundedRectangle(cornerRadius: 13))
        .overlay(RoundedRectangle(cornerRadius: 13).stroke(.white.opacity(0.13), style: StrokeStyle(lineWidth: 1, dash: [4, 4])))
    }

    private var trickCenter: some View {
        HStack(spacing: 8) {
            ForEach(0..<4, id: \.self) { index in
                if let played = trick.first(where: { $0.player == index }) {
                    VStack(spacing: 3) {
                        PlayingCardView(card: played.card).frame(width: 45, height: 64)
                        Text(playerNames[index]).font(.system(size: 8, weight: .medium))
                    }
                } else {
                    RoundedRectangle(cornerRadius: 7).fill(.white.opacity(0.035))
                        .overlay(RoundedRectangle(cornerRadius: 7).stroke(.white.opacity(0.12), style: StrokeStyle(lineWidth: 1, dash: [3, 3])))
                        .frame(width: 45, height: 64)
                }
            }
        }
        .frame(maxWidth: .infinity)
    }

    private var statusPanel: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Circle().fill(.green).frame(width: 7, height: 7)
                Text(phase.uppercased()).font(.system(size: 10, weight: .black, design: .rounded)).tracking(1.2)
                Spacer()
                if let trump { Text("TRUMP \(trump.symbol)").font(.system(size: 11, weight: .bold)) }
            }
            Text(message).font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.75)).fixedSize(horizontal: false, vertical: true)
        }
        .padding(14).frame(maxWidth: .infinity, alignment: .leading)
        .background(.black.opacity(0.19), in: RoundedRectangle(cornerRadius: 14))
    }

    private var trumpPicker: some View {
        VStack(spacing: 10) {
            Text("CHOOSE TRUMP").font(.system(size: 11, weight: .black, design: .rounded)).tracking(1.5)
            HStack(spacing: 10) {
                ForEach(Suit.allCases) { suit in
                    Button {
                        trump = suit
                        isChoosingTrump = false
                        phase = "Trump selected"
                        message = "\(suit.label) are trump. Play a card to lead the first trick."
                        currentPlayer = 0
                    } label: {
                        VStack(spacing: 7) {
                            Text(suit.symbol).font(.system(size: 29, weight: .bold))
                            Text(suit.label).font(.system(size: 10, weight: .bold))
                        }
                        .foregroundStyle(suit.isRed ? Color.red : Color.white)
                        .frame(maxWidth: .infinity).padding(.vertical, 12)
                        .background(.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 13))
                    }
                    .buttonStyle(.plain)
                }
            }
            Text("First version: choose a suit, then play through the hand.")
                .font(.system(size: 10)).foregroundStyle(.white.opacity(0.5))
        }
    }

    private var handView: some View {
        VStack(spacing: 10) {
            HStack {
                Text("YOUR HAND").font(.system(size: 11, weight: .black, design: .rounded)).tracking(1.5)
                Spacer()
                Text("\(hands[0].count) CARDS").font(.system(size: 10, weight: .bold)).foregroundStyle(.white.opacity(0.55))
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 7) {
                    ForEach(hands[0]) { card in
                        Button { playCard(card, for: 0) } label: {
                            PlayingCardView(card: card)
                                .frame(width: 57, height: 83)
                        }
                        .buttonStyle(.plain)
                        .disabled(currentPlayer != 0 || isChoosingTrump || isHandOver)
                        .opacity(currentPlayer == 0 ? 1 : 0.55)
                    }
                }
                .padding(.vertical, 4)
            }
            if currentPlayer != 0 && !isHandOver {
                Text("Thinking…").font(.system(size: 11, weight: .medium)).foregroundStyle(.white.opacity(0.5))
            }
        }
    }

    private func dealHand() {
        var deck = Suit.allCases.flatMap { suit in (9...14).map { PlayingCard(rank: $0, suit: suit) } }
        deck.shuffle()
        hands = (0..<4).map { Array(deck[(($0 * 5)..<($0 * 5 + 5))]) }
        kitty = Array(deck[20..<24])
        trick = []
        trump = nil
        leadSuit = nil
        tricksWon = [0, 0]
        isHandOver = false
        isChoosingTrump = true
        currentPlayer = 0
        phase = "Choose trump"
        message = "You are the dealer's partner for this starter hand. Pick the suit you want to be trump."
    }

    private func playCard(_ card: PlayingCard, for player: Int) {
        guard player == currentPlayer, let index = hands[player].firstIndex(of: card) else { return }
        if let leadSuit, hands[player].contains(where: { effectiveSuit($0) == leadSuit }),
           effectiveSuit(card) != leadSuit {
            message = "You must follow the lead suit when you have one."
            return
        }
        hands[player].remove(at: index)
        if trick.isEmpty { leadSuit = effectiveSuit(card) }
        trick.append(PlayedCard(player: player, card: card))
        currentPlayer = (player + 1) % 4

        if trick.count == 4 {
            let winner = trickWinner()
            let team = winner % 2 == 0 ? 0 : 1
            tricksWon[team] += 1
            message = "\(playerNames[winner]) takes the trick."
            currentPlayer = winner
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) {
                trick = []
                leadSuit = nil
                if hands.allSatisfy({ $0.isEmpty }) {
                    finishHand()
                } else {
                    message = "\(playerNames[winner]) leads the next trick."
                    if winner != 0 { playComputerTurnIfNeeded() }
                }
            }
        } else if currentPlayer != 0 {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) { playComputerTurnIfNeeded() }
        } else {
            message = "Your turn. Follow suit if you can."
        }
    }

    private func playComputerTurnIfNeeded() {
        guard currentPlayer != 0, !isHandOver, !isChoosingTrump, !hands[currentPlayer].isEmpty else { return }
        let hand = hands[currentPlayer]
        let legal: [PlayingCard]
        if let leadSuit, hand.contains(where: { effectiveSuit($0) == leadSuit }) {
            legal = hand.filter { effectiveSuit($0) == leadSuit }
        } else {
            legal = hand
        }
        let chosen = legal.randomElement() ?? hand[0]
        playCard(chosen, for: currentPlayer)
    }

    private func effectiveSuit(_ card: PlayingCard) -> Suit {
        guard let trump, card.rank == 11 else { return card.suit }
        let sameColorSuit: Suit?
        switch trump {
        case .clubs: sameColorSuit = .spades
        case .spades: sameColorSuit = .clubs
        case .hearts: sameColorSuit = .diamonds
        case .diamonds: sameColorSuit = .hearts
        }
        return card.suit == sameColorSuit ? trump : card.suit
    }

    private func cardPower(_ card: PlayingCard) -> Int {
        guard let trump else { return card.rank }
        if card.rank == 11 && card.suit == trump { return 100 }
        let sameColor: Suit = {
            switch trump {
            case .clubs: return .spades
            case .spades: return .clubs
            case .hearts: return .diamonds
            case .diamonds: return .hearts
            }
        }()
        if card.rank == 11 && card.suit == sameColor { return 99 }
        if effectiveSuit(card) == trump { return 50 + card.rank }
        if effectiveSuit(card) == leadSuit { return 20 + card.rank }
        return card.rank
    }

    private func trickWinner() -> Int {
        guard let first = trick.first else { return 0 }
        return trick.max { a, b in
            let ap = cardPower(a.card)
            let bp = cardPower(b.card)
            if ap == bp { return false }
            return ap < bp
        }?.player ?? first.player
    }

    private func finishHand() {
        isHandOver = true
        let us = tricksWon[0]
        let them = tricksWon[1]
        if us >= 3 {
            let points = us >= 5 ? 2 : 1
            scores[0] += points
            message = "Your team wins \(us) tricks and scores \(points) point\(points == 1 ? "" : "s")!"
        } else {
            let points = them >= 5 ? 2 : 1
            scores[1] += points
            message = "The opponents win \(them) tricks and score \(points) point\(points == 1 ? "" : "s")."
        }
        phase = "Hand complete"
    }

    private func startNextHand() {
        handNumber += 1
        dealer = (dealer + 1) % 4
        dealHand()
    }
}

private struct PlayingCardView: View {
    let card: PlayingCard
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(card.name).font(.system(size: 16, weight: .black, design: .rounded))
            Text(card.suit.symbol).font(.system(size: 13, weight: .bold))
            Spacer(minLength: 0)
            Text(card.suit.symbol).font(.system(size: 27, weight: .medium))
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            Spacer(minLength: 0)
            HStack {
                Spacer()
                Text(card.name).font(.system(size: 12, weight: .bold, design: .rounded))
                Text(card.suit.symbol).font(.system(size: 10, weight: .bold))
            }
        }
        .foregroundStyle(card.suit.isRed ? Color(red: 0.78, green: 0.12, blue: 0.18) : Color(red: 0.12, green: 0.16, blue: 0.19))
        .padding(6)
        .background(LinearGradient(colors: [.white, Color(red: 0.92, green: 0.92, blue: 0.88)], startPoint: .topLeading, endPoint: .bottomTrailing), in: RoundedRectangle(cornerRadius: 8))
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(.black.opacity(0.15), lineWidth: 1))
        .shadow(color: .black.opacity(0.25), radius: 4, y: 2)
    }
}

private struct CardBackView: View {
    var body: some View {
        RoundedRectangle(cornerRadius: 5)
            .fill(Color(red: 0.12, green: 0.22, blue: 0.42))
            .overlay(RoundedRectangle(cornerRadius: 5).stroke(.white.opacity(0.75), lineWidth: 1))
            .overlay(
                RoundedRectangle(cornerRadius: 3).stroke(.white.opacity(0.5), lineWidth: 1).padding(3)
            )
            .overlay(Image(systemName: "suit.spade.fill").font(.system(size: 10)).foregroundStyle(.white.opacity(0.8)))
    }
}

private struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 13, weight: .black, design: .rounded))
            .tracking(1)
            .foregroundStyle(Color(red: 0.08, green: 0.20, blue: 0.15))
            .frame(maxWidth: .infinity).padding(.vertical, 16)
            .background(Color(red: 0.95, green: 0.75, blue: 0.34), in: RoundedRectangle(cornerRadius: 14))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}
