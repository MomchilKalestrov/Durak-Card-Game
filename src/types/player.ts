import { WebSocket } from 'ws';

import card from './card';

interface Player {
    cards: card[];
    socket: WebSocket;
    pass: boolean;
    name: string;
    index: number;
};

export default Player;