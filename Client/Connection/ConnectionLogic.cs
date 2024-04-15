using DurakClient.Cards;
using Microsoft.VisualBasic.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;

namespace DurakClient
{
    partial class Window
    {
        Socket socket;
        PictureBox[] cardControls = Enumerable.Range(0, 52)
                         .Select(_ => new PictureBox())
                         .ToArray();

        void LoadAttackDeck(Card[] cards)
        {

        }

        void LoadPlayerCards(Card[] cards)
        {
            Log("Loading player cards");
            cardControls = new PictureBox[cards.Length];
            for (int i = 0; i < cardControls.Length; ++i)
            {
                cardControls[i] = new PictureBox();
                cardControls[i].Size = new Size(50, 70);
                cardControls[i].Location = new Point((int)(55 * i + Navigation.Panel2.Width / 2 - 27.5 * cards.Length + 2.5), Navigation.Size.Height - 74);
                cardControls[i].Anchor = AnchorStyles.Bottom;
                cardControls[i].Image = new Bitmap(@".\Textures\" + cards[i].Rank.ToString() + "_of_" + cards[i].Symbol.ToString() + ".png");
                Navigation.Invoke((MethodInvoker)delegate
                {
                    Navigation.Panel2.Controls.Add(cardControls[i]);
                });
            }
        }

        // Handler for when the client recieves data
        async void HandleRecieveFromServer()
        {
            while (true)
            {
                byte[] buffer = new byte[52];
                int bytesRead = socket.Receive(buffer);
                if (bytesRead <= 0) continue;
                PacketData packetData = Packet.DecodePacket(buffer);
                switch(packetData.Type)
                {
                    case DataType.AttackDeck: LoadAttackDeck(packetData.Cards); break;
                    case DataType.PlayerDeck: LoadPlayerCards(packetData.Cards); break;
                }
            }
        }

        // Handler for when the client sends data
        async void HandleSendToServer()
        {
        }

        void Log(object message)
        {
            Logger.Invoke((MethodInvoker)delegate
            {
                Logger.Text += TimeOnly.FromDateTime(DateTime.Now) + "\n" + message + "\n\n";
            });
        }

        async Task ConnectToServerHandler()
        {
            string ip = IPAndPort.Text.Split(':')[0];
            int port = int.Parse(IPAndPort.Text.Split(':')[1]);
            socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

            try
            {
                socket.Connect(ip, port);
                Log("Connected to " + ip + ":" + port);
                Task.Run(HandleSendToServer);
                Task.Run(HandleRecieveFromServer);
            }
            catch (Exception ex)
            {
                Log("An error occurred: " + ex.Message);
            }
        }
    }
}
