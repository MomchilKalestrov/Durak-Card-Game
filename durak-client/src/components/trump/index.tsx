import React from 'react';

import { cardSuit } from '../../lib/types/card';

import './trump.css';

type TrumpProps = {
    suit: cardSuit;
};

const suits: Record<cardSuit, React.JSX.Element> = {
    spades:   <p className='Black'>♠</p>,
    hearts:   <p className='Red'>♥</p>,
    diamonds: <p className='Red'>♦</p>,
    clubs:    <p className='Black'>♣</p>
}

const TrumpBadge: React.FC<TrumpProps> = ({ suit }) => (
    <div className='TrumpBadge'>{ suits[ suit ] }</div>
);

export default TrumpBadge;