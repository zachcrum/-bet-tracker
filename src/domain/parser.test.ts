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
});
