using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Net;
using System.Threading.Tasks;
using Durak.Data;

namespace Durak.Server;

class Server
{
    List<Socket> serverUsers = new List<Socket>();
    bool acceptConnections = true;

    byte usersCounter = 0;
    Players.Players playerData;

    void AddToAttack()
    {

    }

    // Handler for when the client sends data
    async void HandleRecieveFromClient(Socket socket)
    {
        while (true)
        {
            byte[] buffer = new byte[52];
            int bytesRead = socket.Receive(buffer);
            if (bytesRead <= 0) continue;
            PacketData packetData = Packet.DecodePacket(buffer);
            switch(packetData.Type)
            {
                case
            }
        }
    }

    void SendDeckToClient()
    {
        for (byte i = 0; i < serverUsers.Count; ++i)
            serverUsers[i].Send
            (
                Packet.EncodePacket
                (
                    new PacketData()
                    {
                        Type = DataType.PlayerDeck,
                        Length = playerData.playerDecks[i].Length,
                        Cards = playerData.playerDecks[i]
                    }
                )
            );
    }

    public void StartServer()
    {
        IPAddress ipAddress = IPAddress.Parse("127.0.0.1");
        int port = 6969;

        Socket listener = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

        listener.Bind(new IPEndPoint(ipAddress, port));
        listener.Listen(10);

        Console.WriteLine("Listening for incoming connections at: " + ipAddress.ToString() + ":" + port.ToString() + ".");

        while (acceptConnections)
        {
            Socket socket = listener.Accept();
            Console.WriteLine("Client connected: " + socket.RemoteEndPoint.ToString());
            if (!serverUsers.Contains(socket))
                serverUsers[usersCounter++] = socket;

            Task.Run(() => HandleRecieveFromClient(socket));
        }
    }

    public void StartGame()
    {
        Console.WriteLine("Write \"start\" when all players are ready.");
        while (Console.ReadLine().ToLower() != "start");
        acceptConnections = false;
        Console.WriteLine("Generating lobby for " + serverUsers.Count + " players with a deck of " + (3 + serverUsers.Count / 2) + ".");
        playerData = new Players.Players((byte)serverUsers.Count, (byte)(3 + serverUsers.Count / 2));
        Console.WriteLine("Sending decks to players.");
        SendDeckToClient();
        while (true);
    }
}