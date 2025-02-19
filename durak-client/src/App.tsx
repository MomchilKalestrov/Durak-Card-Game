import React from 'react';

import usePlayerData from './hooks/usePlayerData';
import useAttack from './hooks/useAttack';
import useSessionData from './hooks/useSessionData';

import getCardUrl from './lib/getCardUrl';

import './styles.css';
import card from './lib/types/card';

const compareCards = (c1: card, c2?: card) =>
    c2 && c1.suit === c2.suit && c1.value === c2.value;

const App: React.FC = () => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [ socket, setSocket ] = React.useState<WebSocket | undefined>(undefined);
    const [ selectedCard, setSelectedCard ] = React.useState<card | undefined>(undefined);

    const { hand, playerIndex } = usePlayerData(socket);
    const { attack, attackerIndex } = useAttack(socket);
    const { playerCount, trump } = useSessionData(socket);

    const createConnection = () => {
        const input: string | undefined = inputRef.current?.value;
        if (!input) return;
        const socket = new WebSocket(input);
        socket.addEventListener('open', () => setSocket(socket));
        socket.addEventListener('message', (e) => console.log(JSON.parse(e.data)));
    };

    const addToAttack = (card: card) => {
        if (socket) socket.send(JSON.stringify({ type: 'attack', card }));
    };

    const defend = (attack: card) => {
        console.log('defend', attack, selectedCard);
        if (socket && selectedCard)
            socket.send(JSON.stringify({ type: 'defend', cards: { attack, defence: selectedCard } }));
    };

    var isDefender: boolean = false;
    if (attackerIndex !== undefined && playerCount !== undefined)
        isDefender = (attackerIndex + 1) % playerCount === playerIndex;

    return (
        <div>
            <input ref={ inputRef } />
            <button onClick={ createConnection }>Connect</button>

            {
                !socket || !hand || playerIndex === undefined || attackerIndex === undefined || playerCount === undefined || !trump
                ? <></>
                : <>
                    <h1>You are player number: { playerIndex }</h1>
                    <h1>Attacker player number: { attackerIndex }</h1>
                    { isDefender && <h1>You need to defend.</h1> }

                    <div>
                        <h1>Attack</h1>
                        {
                            attack && attack.map(({ attack, defence }) => (
                                <div className='attackDefencePair' key={ attack.suit + attack.value }>
                                    <img src={ getCardUrl(attack) } onClick={ () => defend(attack) } />
                                    { defence && <img src={ getCardUrl(defence) } /> }
                                </div>
                            ))
                        }
                    </div>

                    <h1>Trump suit: { trump }</h1>
                    
                    <div>
                        <h1>Hand</h1>
                        {
                            hand && hand.map((card) => (
                                <img
                                    key={ card.suit + card.value }
                                    src={ getCardUrl(card) }
                                    style={
                                        compareCards(card, selectedCard) && isDefender
                                        ?   { border: '2px solid red'}
                                        :   undefined
                                    }
                                    onClick={ isDefender ? () => setSelectedCard(card) : () => addToAttack(card) }
                                />
                            ))
                        }
                    </div>
                    <button onClick={ () => {
                        if (socket) socket.send(JSON.stringify({ type: 'playerPass' }));
                    } }>Pass</button>
                </>
            }
        </div>
    );
};

export default App;