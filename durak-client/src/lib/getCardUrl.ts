import card from '../lib/types/card';

const valueMap: { [key: string]: string } = {
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine',
    '10': 'ten',
    'J': 'jack',
    'Q': 'queen',
    'K': 'king',
    'A': 'ace'
};

const getCardUrl = (card: card): string => 
    `/cards/${ valueMap[ card.value ] }_of_${ card.suit }.png`;

export default getCardUrl;