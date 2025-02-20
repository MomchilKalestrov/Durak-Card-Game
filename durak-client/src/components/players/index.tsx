import React from 'react';

import Player from '../../lib/types/player';

import './players.css';

type PlayersProps = {
    players: Player[];
    attackerIndex: number;
    defenderIndex: number;
};

type PlayerInfoProps = {
    player: Player;
    isAttacker: boolean;
    isDefender: boolean;
};

const getColors = (isAttacker: boolean, isDefender: boolean) => {
    if (isAttacker)
        return 'PlayerAttacker';
    else if (isDefender)
        return 'PlayerDefender';
    else
        return 'PlayerNeutral';
};

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isAttacker, isDefender }) => (
    <div className='PlayerInfo'>
        <div className={ getColors(isAttacker, isDefender) }>{ player.cards }</div>
        <p>{ player.name }</p>
    </div>
);

const Players: React.FC<PlayersProps> = ({ players, attackerIndex, defenderIndex }) => (
    <div className='PlayersContainer'>
        { 
            players.map((player) => (
                <PlayerInfo
                    player={ player }
                    key={ player.name }
                    isAttacker={ attackerIndex === player.index }
                    isDefender={ defenderIndex === player.index }
                />
            ))
        }
    </div>
);

export default Players;