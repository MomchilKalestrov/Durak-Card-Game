import React from 'react';

import usePlayerData from './hooks/usePlayerData';
import useAttack from './hooks/useAttack';
import useSessionData from './hooks/useSessionData';

import Input from './components/input';
import Button from './components/button';
import TrumpBadge from './components/trump';
import AttackDefencePair from './components/attackDefencePair';

import getCardUrl from './lib/getCardUrl';
import card from './lib/types/card';

import './styles.css';
import Players from './components/players';

const compareCards = (c1?: card, c2?: card) =>
    c1 && c2 && c1.suit === c2.suit && c1.value === c2.value;

const App: React.FC = () => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [ socket, setSocket ] = React.useState<WebSocket | undefined>(undefined);
    const [ selectedCard, setSelectedCard ] = React.useState<card | undefined>(undefined);

    const { hand, playerIndex } = usePlayerData(socket);
    const { attack, attackerIndex } = useAttack(socket);
    const { players, trump } = useSessionData(socket);

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
        if (socket && selectedCard)
            socket.send(JSON.stringify({ type: 'defend', cards: { attack, defence: selectedCard } }));
    };

    var isDefender: boolean = false;
    if (attackerIndex !== undefined && players?.length !== undefined)
        isDefender = (attackerIndex + 1) % players?.length === playerIndex;

    if (!isDefender && selectedCard) setSelectedCard(undefined);

    return (
        !socket
        ?   <div className='ConnectContainer'>
                <Input ref={ inputRef } type='text' name='Server' />
                <Button onClick={ createConnection }>Connect</Button>
            </div>
        :   <>
                {
                    attack &&
                    <div style={ { display: 'flex', gap: '1rem', flexWrap: 'wrap' } }>
                        {
                            attack.map((pair) => (
                                <AttackDefencePair
                                    pair={ pair }
                                    defend={ defend }
                                    key={ pair.attack.suit + pair.attack.value }
                                />
                            ))
                        }
                    </div>
                }
                {
                    (trump && socket) &&
                    <div className='DiffContainer'>
                        <TrumpBadge suit={ trump }/>
                        <Button onClick={ () => socket ? socket.send(JSON.stringify({ type: 'playerPass' })) : null }>
                            Pass
                        </Button>
                    </div>
                }
                {
                    hand &&
                    <div className='handContainer'>
                        {
                            hand.map((card: card, index: number) => (
                                <img
                                    src={ getCardUrl(card) }
                                    alt={ getCardUrl(card) }
                                    key={ card.suit + card.value }
                                    style={ { '--index': index } as React.CSSProperties }
                                    onClick={ isDefender ? () => setSelectedCard(card) : () => addToAttack(card) }
                                    className={ `card stacked ${ compareCards(card, selectedCard) ? 'selected' : '' }` }
                                />
                            ))
                        }
                    </div>
                }
                {
                    (players && playerIndex !== undefined && attackerIndex !== undefined) &&
                    <Players
                        players={ players.map((player) =>
                            player.index === playerIndex
                            ?   { ...player, name: player.name + '(you)' }
                            :   player
                        ) }
                        attackerIndex={ attackerIndex }
                        defenderIndex={ (attackerIndex + 1) % players.length }
                    />
                }
            </>
    );
};

export default App;