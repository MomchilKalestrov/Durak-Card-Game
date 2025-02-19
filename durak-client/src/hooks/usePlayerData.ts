import React from 'react';
import { playerData } from '@/lib/types/packet';

const usePlayerData = (socket?: WebSocket) => {
    const [ data, setData ] = React.useState<playerData | undefined>(undefined);
    
    const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.type === 'playerData')
            setData(data);
    };

    React.useEffect(() => {
        if (!socket) return;
        socket.addEventListener('message', handleMessage);
        
        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [ socket ]);

    return { hand: data?.hand, playerIndex: data?.playerIndex };
};

export default usePlayerData;