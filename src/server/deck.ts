import card, { cardValue, cardSuit } from '../types/card';

// arrays to convert numbers to valid card values and symbols
const cardSuits: cardSuit[] = [ 'hearts', 'diamonds', 'clubs', 'spades' ];
const cardValues: cardValue[] = [ '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A' ];

// Initialize an ordered deck of cards
const getDeck = (): card[] => {
    const deck: card[] = [];
    for (let i = 0; i < 52; i++)
        deck.push({
            value: cardValues[ i % 13 ],
            suit: cardSuits[ Math.floor(i / 13) ]
        });
    return deck;
};

class Deck {
    cards: card[] = getDeck();

    constructor() {
        this.shuffle();
    };

    // Fisher-Yates shuffle
    shuffle = () => {
        for (let i = 0; i < this.cards.length; i++) {
            const j = Math.floor(Math.random() * this.cards.length);
            [ this.cards[ i ], this.cards[ j ] ] = [ this.cards[ j ], this.cards[ i ] ];
        };
    };

    draw = () => this.cards.pop();
};

export default Deck;