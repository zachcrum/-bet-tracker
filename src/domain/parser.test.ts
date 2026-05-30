import { parseSlipText } from './parser';

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

  it('creates a deterministic slip id from the source text', () => {
    const firstSlip = parseSlipText(sampleSlip);
    const secondSlip = parseSlipText(sampleSlip);

    expect(firstSlip.id).toBe(secondSlip.id);
    expect(firstSlip.id).toMatch(/^slip-[a-z0-9]+$/);
  });
});
