// app/api/websocket/route.ts
import { WebSocketServer, WebSocket } from 'ws';
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingMessage } from 'http';
import { Socket } from 'net';

export let wss: WebSocketServer | null = null;

export default function handler(req: NextApiRequest, res: any) {
    if (!wss) {
        const server = res.socket?.server;

        if (server) {
            wss = new WebSocketServer({ noServer: true });

            wss.on('connection', (ws: WebSocket) => {
                console.log('Client connected');

                ws.on('message', (message: string) => {
                    console.log(`Received message: ${message}`);
                });

                ws.on('close', () => {
                    console.log('Client disconnected');
                });
            });

            server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
                if (request.url === '/api/websocket') {
                    wss!.handleUpgrade(request, socket, head, (ws) => {
                        wss!.emit('connection', ws, request);
                    });
                }
            });
        }
    }

    res.status(200).end();
}
