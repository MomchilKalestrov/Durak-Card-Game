import card, { attackDefencePair } from './card';

type defend = {
    type: 'defend';
    cards: attackDefencePair;
};

type attack = {
    type: 'attack';
    card: card;
};

type currentAttack = {
    type: 'currentAttack';
    cards: attackDefencePair[];
    attacker: number;
};

type playerDeck = {
    type: 'playerDeck';
    cards: card[];
};

type playerReady = {
    type: 'playerReady';
};

type playerPass = {
    type: 'playerPass';
};

type serverResponse = {
    type: 'serverResponse';
    response: 'success' | 'invalid' | 'error';
};

type packet = attack | defend | currentAttack | playerDeck | playerReady | playerPass | serverResponse;

export default packet;