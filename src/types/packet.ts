import card, { attackDefencePair, cardSuit } from './card';
import Player from './player';

type safePlayer = Omit<Player, 'socket' | 'cards'> & { cards: number };

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
    attackerIndex: number;
};

type playerData = {
    type: 'playerData';
    hand: card[];
    playerIndex: number;
};

type sessionData = {
    type: 'sessionData';
    players: safePlayer[];
    trump: cardSuit;
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

type durak = {
    type: 'durak';
    durak: string;
};

type packet = attack | defend | currentAttack | playerData | playerReady | playerPass| sessionData | serverResponse | durak;

export type { attack, defend, currentAttack, playerData, playerReady, playerPass, serverResponse, sessionData, durak };
export default packet;