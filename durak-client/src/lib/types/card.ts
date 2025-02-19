type cardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

type cardValue = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

type card = {
    suit: cardSuit;
    value: cardValue;
};

type attackDefencePair = {
    attack: card;
    defence?: card;
}

export default card;
export type { cardSuit, cardValue, attackDefencePair };