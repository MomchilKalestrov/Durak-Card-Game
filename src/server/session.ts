import { WebSocket } from 'ws';
import readline from 'readline';
import { IncomingMessage } from 'http';

import Deck from './deck';

import Player from '../types/player';
import card, { cardSuit, attackDefencePair, cardValue } from '../types/card';
import packet from '../types/packet';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const compareCards = (c1?: card, c2?: card) =>
    c1 && c2 && c1.suit === c2.suit && c1.value === c2.value;

// check if the attack includes a suit
const attackIncludesValue = (cards: attackDefencePair[], value: cardValue): boolean => {
    for (let i: number = 0; i < cards.length; i++)
        if (
            cards[i].attack.value === value ||
            cards[i].defence?.value === value
        )
            return true;
    return false;
};

const hasEnoughCards = (attack: attackDefencePair[], playerDeck: card[]): boolean => {
    const defendedCards = attack.filter((card: attackDefencePair) => card.defence);
    return playerDeck.length > attack.length - defendedCards.length;
};

const isValidDefence = (attack: card, defence: card, trump: cardSuit): boolean => {
    const valueToNumber = (suit: cardValue): number => {
        const numberValue = parseInt(suit);
        if (isNaN(numberValue)) {
            switch (suit) {
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
    if (attack.suit === defence.suit) return defenceValue > attackValue;
    if (defence.suit === trump) return true;
    return false;
};

class Session {
    players: Player[] = [];
    cardsPerPlayer: number = 0;
    currentAttacker: number = 0;
    
    deck: Deck = new Deck();
    currentAttack: attackDefencePair[] = [];
    trump: cardSuit = 'hearts';

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
        this.trump = this.deck.cards[ 0 ].suit;
        this.sendDataToAll();
    };

    addPlayer = (socket: WebSocket, request: IncomingMessage) => {
        const player: Player = {
            cards: [],
            socket,
            pass: false,
            name: `player-${ this.players.length + 1 }`,
            index: this.players.length,
            exited: false
        };
        const playerIndex = this.players.push(player) - 1;
        console.log(`Player ${ request.socket.remoteAddress } has joined the game.`);
        socket.on('message', (stream: Buffer) => this.handlePlayer(socket, stream.toString(), playerIndex));
    };

    handlePlayer = (socket: WebSocket, message: string, playerIndex: number) => {
        const body = JSON.parse(message) as packet;
        switch (body.type) {
            case 'attack': this.handleAttack(socket, body.card, this.players[ playerIndex ]); break;
            case 'defend': this.handleDefence(socket, body.cards, this.players[ playerIndex ]); break;
            case 'playerPass': this.handlePass(socket, this.players[ playerIndex ]); break;
        };
        if(this.endConditionsMet())
            this.end();
        this.cyclePlayers();
        this.sendDataToAll();
    };

    handleDefence = (socket: WebSocket, pair: attackDefencePair, player: Player) => {
        // get the first player after the attacker that hasn't exited
        let defenderIndex: number = this.currentAttacker;
        do defenderIndex = (defenderIndex + 1) % this.players.length;
        while (this.players[ defenderIndex ].exited);
        console.log(player.name + ' is defending (calculated defender ' + this.players[ defenderIndex ].name + ')');
        // check if the player is the defender
        // if they aren't, they cannot defend
        if (defenderIndex !== player.index)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if they provided a defence card
        if (!pair.defence)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the player has yielded/passed
        // if they have, they cannot defend
        if (player.pass)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the player has the card 
        // if they don't, they cannot defend with it
        if (
            !player
                .cards
                .some((card: card) => card.suit === pair.defence?.suit && card.value === pair.defence?.value)
        )
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid' }));
        // check if the attack card is already defended
        if (
            this
                .currentAttack
                .some((p: attackDefencePair) => {
                    if (compareCards(p.attack, pair.attack))
                        return p.defence;
                    return false;
                })
        )
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid' }));
        // check if the card is a valid defence
        // if it isn't, ignore it
        if (!isValidDefence(pair.attack, pair.defence, this.trump))
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid' }));
        // if it is, update the current defence
        // only if the card is in the ACTUAL attack
        for (let i: number = 0; i < this.currentAttack.length; i++)
            if (
                this.currentAttack[ i ].attack.suit === pair.attack.suit &&
                this.currentAttack[ i ].attack.value === pair.attack.value
            ) {
                this.currentAttack[ i ].defence = pair.defence;
                player.cards = player.cards.filter((c: card) => c.suit !== pair.defence?.suit || c.value !== pair.defence?.value);
                return socket.send(JSON.stringify({ type: 'serverResponse', response: 'success'}));
            };
        // if the card isn't in the current attack, ignore it
        socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
    };

    handleAttack = (socket: WebSocket, card: card, player: Player) => {
        // get the first player after the attacker that hasn't exited
        let defenderIndex: number = this.currentAttacker;
        do defenderIndex = (defenderIndex + 1) % this.players.length;
        while (this.players[ defenderIndex ].exited);
        console.log(player.name + ' is attacking ' + this.players[ defenderIndex ].name);
        // check if the attacker has yielded/passed
        // if they have, they cannot attack
        if (player.pass)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the defender has enough cards
        // to defend against the attack
        // if not, ignore the card
        if (!hasEnoughCards(this.currentAttack, this.players[ defenderIndex ].cards))
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the player has the card 
        // if they don't, they cannot defend with it
        if (!player.cards.some((c: card) => card.suit === c.suit && card.value === c.value))
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if there are any cards in the current attack
        // if there aren't, check if the player is the attacker
        // if he isn't, then the player cannot attack
        if (this.currentAttack.length === 0 && this.currentAttacker !== player.index)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if the player needs to defend
        // if they do, don't let them attack
        if (this.currentAttack.length > 0 && player.index === defenderIndex)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // check if there are any attacking cards
        // if there aren't, just accept any card
        // if there are, check if the card suit
        // is included in the attack.
        if (this.currentAttack.length === 0 || attackIncludesValue(this.currentAttack, card.value)) {
            this.currentAttack.push({ attack: card });
            player.cards = player.cards.filter((c: card) => c.suit !== card.suit || c.value !== card.value);
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'success'}));
        };
        // if it isn't, ignore it. 
        socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
    };

    handlePass = (socket: WebSocket, player: Player) => {
        // check if there are any cards in the current attack
        // if not, the player cannot yield/pass
        if (this.currentAttack.length === 0)
            return socket.send(JSON.stringify({ type: 'serverResponse', response: 'invalid'}));
        // there is no need to check if the player has passed/yielded already
        player.pass = true;
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
        const allReady = this.players.every((player: Player) => player.pass || player.exited);
        if (!allReady) return;
        // if they are, clear their pass status
        this.players.forEach(player => player.pass = false);

        // if the defender has failed his task,
        // push the attack cards to him
        // and skip his turn
        let defenderIndex: number = this.currentAttacker;
        do defenderIndex = (defenderIndex + 1) % this.players.length;
        while (this.players[ defenderIndex ].exited);

        if (this.currentAttack.some((pair: attackDefencePair) => !pair.defence)) {
            this.currentAttack.forEach((pair: attackDefencePair) => {
                if (pair.defence)
                    this.players[ defenderIndex ].cards.push(pair.defence);
                this.players[ defenderIndex ].cards.push(pair.attack);
            });
            
            do this.currentAttacker = (this.currentAttacker + 1) % this.players.length;
            while (this.players[ defenderIndex ].exited);
        };

        // clear the attack for the next round
        this.currentAttack = [];
        // the first that needs to draw is the attacker,
        // then anyone else
        // and then the defender
        this.drawCards(this.players[ this.currentAttacker ]);
        this.players.forEach((player: Player) => {
            if (
                player.index === this.currentAttacker ||
                player.index === defenderIndex
            ) return;
            this.drawCards(player);
        });
        this.drawCards(this.players[ defenderIndex ]);
        
        do this.currentAttacker = (this.currentAttacker + 1) % this.players.length;
        while (this.players[ this.currentAttacker ].exited);
    };

    sendDataToAll = () =>
        this.players.forEach((player: Player, index: number) => {
            this.sendPlayerData(player, index);
            this.sendAttackData(player);
            this.sendSessionData(player);
        });

    sendPlayerData = (player: Player, playerIndex: number) => {
        const packet: packet = {
            type: 'playerData',
            hand: player.cards,
            playerIndex
        };
        player.socket.send(JSON.stringify(packet));
    };

    sendAttackData = (player: Player) => {
        const packet: packet = {
            type: 'currentAttack',
            cards: this.currentAttack,
            attackerIndex: this.currentAttacker
        };

        player.socket.send(JSON.stringify(packet));
    };

    sendSessionData = (player: Player) => {
        const packet: packet = {
            type: 'sessionData',
            players: this.players.map((player: Player) => {
                const cloned = { ...player, cards: player.cards.length, socket: undefined };
                delete cloned.socket;
                return cloned;
            }),
            trump: this.trump
        };
        player.socket.send(JSON.stringify(packet));
    };

    begin = () => {
        console.log('Session started. Press any key to begin:');
        rl.question('', () => {
            console.log('Giving out cards...');
            this.giveCards();
            console.log('Cards given out.');
        });
    };

    endConditionsMet = (): boolean => {
        let exitedPlayers: number = 0;
        const deckIsEmpty = this.deck.cards.length === 0;
        this.players.forEach(player => {
            if (player.cards.length === 0 && deckIsEmpty) player.exited = true;
            if (player.cards.length === 0 && deckIsEmpty) console.log(player.name + ' has exited.');
            if (player.exited) exitedPlayers++;
        });
        return exitedPlayers >= this.players.length - 1;
    };

    getLoser = (): Player | undefined => {
        for (let i: number = 0; i < this.players.length; i++)
            if (!this.players[ i ].exited) return this.players[ i ];
        return;
    };

    end = () => {
        console.log('The session has ended.');
        const loser = this.getLoser();
        if (loser) console.log(`The loser is ${ loser.name }.`);
        else return;

        const packet: packet = {
            type: 'durak',
            durak: loser.name
        };

        this.players.forEach(player => {
            player.socket.send(JSON.stringify(packet));
            player.socket.close();
        });
        process.exit(0);
    };
};

export default Session;