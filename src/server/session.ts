import { WebSocket } from 'ws';
import readline from 'readline';
import { IncomingMessage } from 'http';

import Deck from './deck';

import Player from '../types/player';
import card, { cardSymbol, attackDefencePair, cardValue } from '../types/card';
import packet from '../types/packet';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// check if the attack includes a symbol
const attackIncludesSymbol = (cards: attackDefencePair[], symbol: cardSymbol): boolean => {
    for (let i: number = 0; i < cards.length; i++)
        if (
            cards[i].attack.symbol === symbol ||
            cards[i].defence?.symbol === symbol
        )
            return true;
    return false;
};

const hasEnoughCards = (attack: attackDefencePair[], playerDeck: card[]): boolean => {
    const defendedCards = attack.filter((card: attackDefencePair) => card.defence);
    const truePlayerDeckCount = playerDeck.length - defendedCards.length;
    const undefendedCardsCount = attack.length - defendedCards.length;
    return truePlayerDeckCount > undefendedCardsCount;
};

const isValidDefence = (attack: card, defence: card, trump: cardSymbol): boolean => {
    const valueToNumber = (symbol: cardValue): number => {
        const numberValue = parseInt(symbol);
        if (isNaN(numberValue)) {
            switch (symbol) {
                case 'J': return 11;
                case 'Q': return 12;
                case 'K': return 13;
                case 'A': return 14;
            };
        };
        return numberValue;
    };
    const attackValue = valueToNumber(attack.value);
    const defenceValue = valueToNumber(defence.value);
    
    if (attack.symbol === defence.symbol) return defenceValue > attackValue;
    if (defence.symbol === trump) return true;
    return false;
};

class Session {
    players: Player[] = [];
    cardsPerPlayer: number = 0;
    currentAttacker: number = 0;
    
    deck: Deck = new Deck();
    currentAttack: attackDefencePair[] = [];
    trump: cardSymbol = 'hearts';

    giveCards = () => {
        // gets the cards per player
        // from personal experience, when 4 players play, each player gets 6 cards
        // from there I created this equation
        this.cardsPerPlayer = Math.floor((52 / this.players.length) / 2);

        // this will give each player the cards they need at once
        // instead of how we do it in real life,
        // three at a time until everyone has the right amount
        for (let index: number = 0; index < this.players.length; index++)
            this.drawCards(this.players[ index ]);

        // the next step is to draw the trump card,
        // which will be put at the bottom of the deck
        // we will reverse the deck first and then see what the trump card is, though
        const lastCardIndex: number = this.deck.cards.length - 1;
        [ this.deck.cards[ 0 ], this.deck.cards[ lastCardIndex] ] = [ this.deck.cards[ lastCardIndex ], this.deck.cards[ 0 ] ];
        this.trump = this.deck.cards[ 0 ].symbol;
        this.sendData();
    };

    addPlayer = (socket: WebSocket, request: IncomingMessage) => {
        const playerIndex = this.players.push({ cards: [], socket, pass: false }) - 1;
        console.log(`Player ${ request.socket.remoteAddress } has joined the game.`);
        socket.on('message', (stream: Buffer) => this.handlePlayer(socket, stream.toString(), playerIndex));
    };

    handlePlayer = (socket: WebSocket, message: string, playerIndex: number) => {
        const body = JSON.parse(message) as packet;
        switch (body.type) {
            case 'attack': this.handleAttack(socket, body.card, playerIndex); break;
            case 'defend': this.handleDefence(socket, body.cards, playerIndex); break;
            case 'playerPass': this.handlePass(socket, playerIndex); break;
        };
        this.sendData();
    };

    handleDefence = (socket: WebSocket, pair: attackDefencePair, playerIndex: number) => {
        const defenderIndex = (this.currentAttacker  + 1) % this.players.length;
        // check if the player is the defender
        // if they aren't, they cannot defend
        if (defenderIndex !== playerIndex)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if they provided a defence card
        if (!pair.defence)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the player has yielded/passed
        // if they have, they cannot defend
        if (this.players[ playerIndex ].pass)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the player has the card 
        // if they don't, they cannot defend with it
        if (
            this
                .players[ playerIndex ]
                .cards
                    .some((card: card) => card.symbol === pair.defence?.symbol && card.value === pair.defence?.value)
        )
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid' }));
        // check if the card is a valid defence
        // if it isn't, ignore it
        if (!isValidDefence(pair.attack, pair.defence, this.trump))
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid' }));
        // if it is, update the current defence
        for (let i: number = 0; i < this.currentAttack.length; i++)
            if (
                this.currentAttack[ i ].attack.symbol === pair.attack.symbol &&
                this.currentAttack[ i ].attack.value === pair.attack.value
            ) {
                this.currentAttack[i].defence = pair.defence;
                return socket.send(JSON.stringify({ type: 'serverResponse', response: 'success'}));
            };
        // if the card isn't in the current attack, ignore it
        socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
    };

    handleAttack = (socket: WebSocket, card: card, playerIndex: number) => {
        const defenderIndex = (this.currentAttacker  + 1) % this.players.length;
        // check if the attacker has yielded/passed
        // if they have, they cannot attack
        if (this.players[ playerIndex ].pass)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the defender has enough cards
        // to defend against the attack
        // if not, ignore the card
        if (!hasEnoughCards(this.currentAttack, this.players[ defenderIndex ].cards))
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the player has the card 
        // if they don't, they cannot defend with it
        if (
            !this
                .players[ playerIndex ]
                .cards
                    .some((c: card) => card.symbol === c.symbol && card.value === c.value)
        )
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if there are any cards in the current attack
        // if there aren't, check if the player is the attacker
        // if he isn't, then the player cannot attack
        if (this.currentAttack.length === 0 && this.currentAttacker !== playerIndex)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the player needs to defend
        // if they do, don't let them attack
        if (this.currentAttack.length > 0 && playerIndex === defenderIndex)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if there are any attacking cards
        // if there aren't, just accept any card
        // if there are, check if the card symbol
        // is included in the attack.
        if (this.currentAttack.length === 0 || attackIncludesSymbol(this.currentAttack, card.symbol)) {
            this.currentAttack.push({ attack: card });
            this.players[ playerIndex ].cards =
                this
                    .players[ playerIndex ]
                    .cards
                        .filter((c: card) => c.symbol !== card.symbol || c.value !== card.value);
            
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'success'}));
        };
        // if it isn't, ignore it. 
        socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
    };

    handlePass = (socket: WebSocket, playerIndex: number) => {
        // check if there are any cards in the current attack
        // if not, the player cannot yield/pass
        if (this.currentAttack.length === 0)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // there is no need to check if the player has passed/yielded already
        this.players[ playerIndex ].pass = true;
        this.cyclePlayers();
        return socket.send(JSON.stringify({ type: 'serverResponse', response: 'success'}));
    };

    drawCards = (player: Player) => {
        for (let i: number = player.cards.length; i < this.cardsPerPlayer; i++) {
            const card: card | undefined = this.deck.draw();
            if (!card) break;
            player.cards.push(card);
        };
    };

    cyclePlayers = () => {
        // check if all players are ready
        const allPased = this.players.every((player: Player) => player.pass);

        if (!allPased) return;

        // if the defender has failed,
        // push the attack cards to him
        // and skip his turn
        const defenderIndex = (this.currentAttacker  + 1) % this.players.length;

        if (this.currentAttack.some((pair: attackDefencePair) => !pair.defence)) {
            this.currentAttack.forEach((pair: attackDefencePair) => {
                if (pair.defence)
                    this.players[ defenderIndex ].cards.push(pair.defence);
                this.players[ defenderIndex ].cards.push(pair.attack);
            });
            this.currentAttacker = (this.currentAttacker + 1) % this.players.length;
        };

        this.currentAttack = [];
        // the first that needs to draw is the attacker,
        // then anyone else
        // and then the defender
        this.drawCards(this.players[ this.currentAttacker ]);
        this.players.forEach((_, index: number) => {
            if (index === this.currentAttacker || index === defenderIndex) return;
            this.drawCards(this.players[ index ]);
        });
        this.drawCards(this.players[ defenderIndex ]);
        
        this.currentAttacker = (this.currentAttacker + 1) % this.players.length;
    };

    sendData = () =>
        this.players.forEach((player: Player) => {
            this.sendDeck(player);
            this.sendAttack(player);
        });

    sendDeck = (player: Player) =>
        player
        .socket
            .send(
                JSON.stringify({
                    type: 'playerDeck',
                    deck: player.cards
                })
            );

    sendAttack = (player: Player) =>
        player
        .socket
            .send(
                JSON.stringify({
                    type: 'currentAttack',
                    deck: this.currentAttack,
                    attacker: this.currentAttacker
                })
            );

    begin = async () => {
        rl.question('Session started. Press any key to begin:\n', () => {
            console.log('Giving out cards...');
            this.giveCards();
        });
    };
};

export default Session;