import { parseSlipText } from './parser';
import { game3Bets } from '../data/game3Bets';

const sampleSlip = `
Same Game Multi @ 1450.00
15 Legs • Stake $15.00
San Antonio Spurs @ Oklahoma City Thunder
Tomorrow 31 May 10:10
Potential Winnings $21,750.00

Victor Wembanyama
To Score 25+ Points
Stephon Castle
To Score 15+ Points
Chet Holmgren
To Record 8+ Rebounds
Alex Caruso
2+ Made Threes
Cason Wallace
To Record 2+ Steals
`;

describe('parseSlipText', () => {
  it('extracts slip metadata and player prop legs', () => {
    const slip = parseSlipText(sampleSlip);

    expect(slip.totalOdds).toBe(1450);
    expect(slip.stake).toBe(15);
    expect(slip.potentialPayout).toBe(21750);
    expect(slip.game).toBe('San Antonio Spurs @ Oklahoma City Thunder');
    expect(slip.legs).toHaveLength(5);
    expect(slip.legs[0]).toMatchObject({
      player: 'Victor Wembanyama',
      marketFamily: 'points',
      threshold: 25,
      label: 'To Score 25+ Points',
    });
    expect(slip.legs[3]).toMatchObject({
      player: 'Alex Caruso',
      marketFamily: 'threes',
      threshold: 2,
      label: '2+ Made Threes',
    });
  });

  it('keeps unknown labels without dropping the leg', () => {
    const slip = parseSlipText('Same Game Multi @ 10.00\nPlayer One\nMystery Market');
    expect(slip.legs[0].marketFamily).toBe('unknown');
    expect(slip.legs[0].label).toBe('Mystery Market');
  });

  it('does not treat adjacent player names as unknown labels', () => {
    const slip = parseSlipText(`
Same Game Multi @ 12.00
Player One
Player Two
To Score 20+ Points
`);

    expect(slip.legs).toHaveLength(1);
    expect(slip.legs[0]).toMatchObject({
      player: 'Player Two',
      marketFamily: 'points',
      threshold: 20,
      label: 'To Score 20+ Points',
    });
  });

  it('skips noisy status and odds lines between player and label', () => {
    const slip = parseSlipText(`
Same Game Multi @ 25.00
San Antonio Spurs @ Oklahoma City Thunder
Victor Wembanyama
Pending
$1.34
Selection boosted
To Record 10+ Rebounds
`);

    expect(slip.legs).toHaveLength(1);
    expect(slip.legs[0]).toMatchObject({
      player: 'Victor Wembanyama',
      marketFamily: 'rebounds',
      threshold: 10,
      label: 'To Record 10+ Rebounds',
    });
    expect(slip.legs[0].sourceText).toBe(
      'Victor Wembanyama\nPending\n$1.34\nSelection boosted\nTo Record 10+ Rebounds',
    );
  });

  it('captures decimal odds skipped between player and market label', () => {
    const slip = parseSlipText(`
Same Game Multi @ 25.00
Victor Wembanyama
Pending
$1.34
To Record 10+ Rebounds
`);

    expect(slip.legs).toHaveLength(1);
    expect(slip.legs[0]).toMatchObject({
      player: 'Victor Wembanyama',
      marketFamily: 'rebounds',
      threshold: 10,
      odds: 1.34,
    });
  });

  it('captures decimal odds immediately after a market label', () => {
    const slip = parseSlipText(`
Same Game Multi @ 18.00
Jalen Brunson
To Score 25+ Points
@ 1.72
Josh Hart
2+ Assists
1.45
Stake $10.00
Potential Winnings $180.00
`);

    expect(slip.totalOdds).toBe(18);
    expect(slip.stake).toBe(10);
    expect(slip.potentialPayout).toBe(180);
    expect(slip.legs).toHaveLength(2);
    expect(slip.legs[0]).toMatchObject({
      player: 'Jalen Brunson',
      marketFamily: 'points',
      threshold: 25,
      odds: 1.72,
    });
    expect(slip.legs[1]).toMatchObject({
      player: 'Josh Hart',
      marketFamily: 'assists',
      threshold: 2,
      odds: 1.45,
    });
  });

  it('does not confuse slip totals with per-leg odds', () => {
    const slip = parseSlipText(`
Same Game Multi @ 1450.00
15 Legs • Stake $15.00
Potential Winnings $21,750.00
Victor Wembanyama
To Score 25+ Points
`);

    expect(slip.totalOdds).toBe(1450);
    expect(slip.stake).toBe(15);
    expect(slip.potentialPayout).toBe(21750);
    expect(slip.legs[0].odds).toBeUndefined();
  });

  it('parses bare low-threshold points, rebounds, assists, steals, and blocks labels', () => {
    const slip = parseSlipText(`
Same Game Multi @ 30.00
Jayson Tatum
2+ Points
Josh Hart
2+ Rebounds
Tyrese Haliburton
2+ Assists
Alex Caruso
1+ Steals
Victor Wembanyama
2+ Blocks
`);

    expect(slip.legs).toHaveLength(5);
    expect(slip.legs.map((leg) => [leg.marketFamily, leg.threshold])).toEqual([
      ['points', 2],
      ['rebounds', 2],
      ['assists', 2],
      ['steals', 1],
      ['blocks', 2],
    ]);
  });

  it('skips arbitrary OCR text between player and real market label', () => {
    const slip = parseSlipText(`
Same Game Multi @ 21.00
Victor Wembanyama
Tap to add more selections
sgm carousel item
To Record 4+ Blocks
`);

    expect(slip.legs).toHaveLength(1);
    expect(slip.legs[0]).toMatchObject({
      player: 'Victor Wembanyama',
      marketFamily: 'blocks',
      threshold: 4,
      label: 'To Record 4+ Blocks',
    });
    expect(slip.legs[0].sourceText).toBe(
      'Victor Wembanyama\nTap to add more selections\nsgm carousel item\nTo Record 4+ Blocks',
    );
  });

  it('skips players with missing market lines', () => {
    const slip = parseSlipText(`
Same Game Multi @ 18.00
Player One
Player Two
To Record 6+ Assists
`);

    expect(slip.legs).toHaveLength(1);
    expect(slip.legs[0].player).toBe('Player Two');
  });

  it('does not create unknown legs from adjacent player names without labels', () => {
    const slip = parseSlipText(`
Same Game Multi @ 18.00
Player One
Player Two
`);

    expect(slip.legs).toHaveLength(0);
  });

  it('does not create unknown legs from arbitrary text before another player', () => {
    const slip = parseSlipText(`
Same Game Multi @ 18.00
Player One
Tap to add more selections
sgm carousel item
Player Two
To Score 20+ Points
`);

    expect(slip.legs).toHaveLength(1);
    expect(slip.legs[0]).toMatchObject({
      player: 'Player Two',
      marketFamily: 'points',
      label: 'To Score 20+ Points',
    });
  });

  it('preserves accents in player names', () => {
    const slip = parseSlipText(`
Same Game Multi @ 14.00
José Alvarado
To Record 2+ Steals
`);

    expect(slip.legs[0]).toMatchObject({
      player: 'José Alvarado',
      marketFamily: 'steals',
      threshold: 2,
    });
  });

  it('preserves curly apostrophes in player names', () => {
    const slip = parseSlipText(`
Same Game Multi @ 14.00
De\u2019Aaron Fox
To Score 15+ Points
`);

    expect(slip.legs[0]).toMatchObject({
      player: 'De\u2019Aaron Fox',
      marketFamily: 'points',
      threshold: 15,
    });
  });

  it('parses the Game 3 bonus-back 18-leg multi', () => {
    const slip = parseSlipText(game3Bets[0].text);

    expect(slip.game).toBe('San Antonio Spurs @ New York Knicks');
    expect(slip.totalOdds).toBe(1351);
    expect(slip.stake).toBe(15);
    expect(slip.potentialPayout).toBe(20265);
    expect(slip.legs).toHaveLength(18);
    expect(slip.legs[0]).toMatchObject({
      player: 'Jalen Brunson',
      marketFamily: 'points',
      threshold: 25,
    });
    expect(slip.legs[4]).toMatchObject({
      player: 'Victor Wembanyama',
      marketFamily: 'rebounds',
      threshold: 12,
    });
    expect(slip.legs[17]).toMatchObject({
      player: 'Jalen Brunson',
      marketFamily: 'steals',
      threshold: 1,
    });
  });

  it('parses the Game 3 points and boards 16-leg multi', () => {
    const slip = parseSlipText(game3Bets[1].text);

    expect(slip.game).toBe('San Antonio Spurs @ New York Knicks');
    expect(slip.totalOdds).toBe(1351);
    expect(slip.stake).toBe(15);
    expect(slip.potentialPayout).toBe(20265);
    expect(slip.legs).toHaveLength(16);
    expect(slip.legs[0]).toMatchObject({
      player: 'Karl-Anthony Towns',
      marketFamily: 'points',
      threshold: 20,
    });
    expect(slip.legs[11]).toMatchObject({
      player: 'Karl-Anthony Towns',
      marketFamily: 'rebounds',
      threshold: 10,
    });
    expect(slip.legs[15]).toMatchObject({
      player: 'Devin Vassell',
      marketFamily: 'rebounds',
      threshold: 4,
    });
  });

  it('creates a deterministic slip id from the source text', () => {
    const firstSlip = parseSlipText(sampleSlip);
    const secondSlip = parseSlipText(sampleSlip);

    expect(firstSlip.id).toBe(secondSlip.id);
    expect(firstSlip.id).toMatch(/^slip-[a-z0-9]+$/);
  });
});
