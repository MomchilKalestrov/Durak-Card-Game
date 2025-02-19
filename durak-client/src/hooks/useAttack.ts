import React from 'react';
import { currentAttack } from '@/lib/types/packet';

const useAttack = (socket?: WebSocket) => {
    const [ data, setData ] = React.useState<currentAttack | undefined>(undefined);
    
    const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'currentAttack')
            setData(data);
    };

    React.useEffect(() => {
        if (!socket) return
        socket.addEventListener('message', handleMessage);
        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [ socket ]);

    return {
        attack: data?.cards,
        attackerIndex: data?.attackerIndex
    };
};

export default useAttack;