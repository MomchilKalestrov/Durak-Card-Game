using Durak.Data;
using Microsoft.VisualBasic.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using Durak.Client.UI;
using System.Text;

namespace Durak.Client
{
    partial class Window
    {
        Socket socket;
        CardControl[] playerCards;
        CardControl[] attackCards;

        void CardSelected(object sender, EventArgs e)
        {
            socket.Send(Packet.EncodePacket(new PacketData()
            {
                Type = DataType.PlayerSend,
                Length = 1,
                Cards = [((CardControl)sender).Card]
            }));
        }

        void LoadAttackDeck(Card[] cards)
        {
            Log("Loading player cards");
            if (attackCards != null)
                for (byte i = 0; i < attackCards.Length; ++i)
                    attackCards[i].Dispose();
            attackCards = new CardControl[cards.Length];
            for (int i = 0; i < attackCards.Length; ++i)
            {
                attackCards[i] = new CardControl();
                attackCards[i].Size = new Size(50, 70);
                attackCards[i].Location = new Point
                (
                    (int)(55 * i + Navigation.Panel2.Width / 2 - 27.5 * cards.Length + 2.5),
                    Navigation.Size.Height / 2 - 37
                );
                attackCards[i].Image = new Bitmap(@".\Textures\" + cards[i].Rank.ToString() + "_of_" + cards[i].Symbol.ToString() + ".png");
                Navigation.Invoke((MethodInvoker)delegate
                {
                    Navigation.Panel2.Controls.Add(attackCards[i]);
                });
            }

        }

        void LoadPlayerCards(Card[] cards)
        {
            Log("Loading player cards");
            if (playerCards != null)
                for (byte i = 0; i < playerCards.Length; ++i)
                    playerCards[i].Dispose();
            playerCards = new CardControl[cards.Length];
            for (byte i = 0; i < playerCards.Length; ++i)
            {
                playerCards[i] = new CardControl();
                playerCards[i].Card = cards[i];
                playerCards[i].Size = new Size(50, 70);
                playerCards[i].Location = new Point
                (
                    (int)(55 * i + Navigation.Panel2.Width / 2 - 27.5 * cards.Length + 2.5),
                    Navigation.Size.Height - 74
                );
                playerCards[i].Anchor = AnchorStyles.Bottom;
                playerCards[i].Image = new Bitmap(@".\Textures\" + cards[i].Rank.ToString() + "_of_" + cards[i].Symbol.ToString() + ".png");
                Navigation.Invoke((MethodInvoker)delegate
                {
                    Navigation.Panel2.Controls.Add(playerCards[i]);
                });
                playerCards[i].Click += new EventHandler(CardSelected);
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
