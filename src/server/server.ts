import { WebSocketServer } from 'ws';
import Session from './session';

const server = new WebSocketServer({ port: 8080 });
const session = new Session();

server.on('connection', session.addPlayer);
session.begin();