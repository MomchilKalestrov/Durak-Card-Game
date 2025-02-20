import React from 'react';

import card, { attackDefencePair } from '../../lib/types/card';
import getCardUrl from '../../lib/getCardUrl';

import './attackDefencePair.css';

type AttackDefencePairProps = {
    pair: attackDefencePair;
    defend: (attack: card) => void;
};

const AttackDefencePair: React.FC<AttackDefencePairProps> = ({ pair, defend }) => (
    <div className='AttackDefencePair' key={ pair.attack.suit + pair.attack.value }>
        <img
            className='card'
            alt={ getCardUrl(pair.attack) }
            src={ getCardUrl(pair.attack) }
            onClick={ () => defend(pair.attack) }
        />
        {
            pair.defence &&
            <img
                className='card'
                alt={ getCardUrl(pair.defence) }
                src={ getCardUrl(pair.defence) }
            />
        }
    </div>
);

export default AttackDefencePair;