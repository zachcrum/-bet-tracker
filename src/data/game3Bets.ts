export interface FeaturedBet {
  id: string;
  name: string;
  legCount: number;
  stake: number;
  placedAt: string;
  note?: string;
  text: string;
}

export const game3 = {
  game: 'San Antonio Spurs @ New York Knicks',
  tipoff: 'Tuesday, 9 Jun 10:40 AEST',
  label: 'Game 3',
};

export const game3Bets: FeaturedBet[] = [
  {
    id: 'game-3-bet-1',
    name: 'Bet 1 - 18 leg bonus-back multi',
    legCount: 18,
    stake: 15,
    placedAt: 'Tue, 9 Jun 07:46:39 AEST',
    note: 'Any legs fail, get a $15.00 Bonus Bet',
    text: `Same Game Multi @ 1351.00
18 Legs • Stake $15.00
San Antonio Spurs @ New York Knicks
Tuesday, 9 Jun 10:40
Bet Return - ANY legs fail, get a $15.00 Bonus Bet
Potential Winnings $20,265.00

Jalen Brunson
To Score 25+ Points
OG Anunoby
To Score 15+ Points
Mikal Bridges
To Score 10+ Points
Landry Shamet
To Score 5+ Points
Victor Wembanyama
To Record 12+ Rebounds
Josh Hart
To Record 6+ Rebounds
Mitchell Robinson
To Record 4+ Rebounds
Stephon Castle
To Record 4+ Rebounds
Devin Vassell
To Record 2+ Assists
Julian Champagnie
2+ Made Threes
De'Aaron Fox
1+ Made Threes
Stephon Castle
1+ Made Threes
Karl-Anthony Towns
1+ Made Threes
OG Anunoby
To Record 1+ Steals
Mikal Bridges
To Record 1+ Steals
Victor Wembanyama
To Record 1+ Steals
Stephon Castle
To Record 1+ Steals
Jalen Brunson
To Record 1+ Steals

Bet Placed On:
Tue, 9 Jun 07:46:39 AEST`,
  },
  {
    id: 'game-3-bet-2',
    name: 'Bet 2 - 16 leg points and boards multi',
    legCount: 16,
    stake: 15,
    placedAt: 'Tue, 9 Jun 07:26:30 AEST',
    text: `Same Game Multi @ 1351.00
16 Legs • Stake $15.00
San Antonio Spurs @ New York Knicks
Tuesday, 9 Jun 10:40
Potential Winnings $20,265.00

Karl-Anthony Towns
To Score 20+ Points
De'Aaron Fox
To Score 15+ Points
Devin Vassell
To Score 10+ Points
OG Anunoby
To Score 15+ Points
Mikal Bridges
To Score 10+ Points
Dylan Harper
To Score 10+ Points
Julian Champagnie
To Score 10+ Points
Landry Shamet
To Score 10+ Points
Miles McBride
To Score 5+ Points
Keldon Johnson
To Score 5+ Points
Mitchell Robinson
To Score 5+ Points
Karl-Anthony Towns
To Record 10+ Rebounds
Josh Hart
To Record 8+ Rebounds
Dylan Harper
To Record 4+ Rebounds
Stephon Castle
To Record 4+ Rebounds
Devin Vassell
To Record 4+ Rebounds

Bet Placed On:
Tue, 9 Jun 07:26:30 AEST`,
  },
];
