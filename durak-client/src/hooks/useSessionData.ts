import React from 'react';
import { sessionData } from '../lib/types/packet';

const useSessionData = (socket?: WebSocket) => {
    const [ data, setData ] = React.useState<sessionData | undefined>(undefined);
    
    const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'sessionData')
            setData(data);
    };

    React.useEffect(() => {
        if (!socket) return;
        socket.addEventListener('message', handleMessage);
        
        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [ socket ]);

    return { players: data?.players, trump: data?.trump };
};

export default useSessionData;