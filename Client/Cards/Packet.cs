namespace DurakClient.Cards
{
    public struct Card
    {
        public Symbols Symbol { get; set; }
        public Ranks Rank { get; set; }
    }

    struct PacketData
    {
        public DataType Type { get; set; }
        public int Length { get; set; }
        public Card[] Cards { get; set; }
    }

    class Packet
    {
        public static byte EncodeCard(Card card)
        {
            return (byte)(((byte)card.Rank << 4) + (byte)card.Symbol);
        }

        public static byte[] EncodePacket(PacketData data)
        {
            byte[] encoded = new byte[data.Length + 1];
            encoded[0] = (byte)((byte)((byte)data.Type << 6) + (byte)data.Length);
            for (byte i = 0; i < data.Length; ++i)
                encoded[i + 1] = EncodeCard(data.Cards[i]);
            return encoded;
        }

        public static Card DecodeCard(byte card)
        {
            Ranks rank = (Ranks)(card >> 4);
            Symbols symbol = (Symbols)(card & 0xf);
            return new Card() { Rank = rank, Symbol = symbol };
        }

        public static PacketData DecodePacket(byte[] packet)
        {
            PacketData data = new PacketData();
            data.Length = (byte)(packet[0] & 0x3f);
            data.Type = (DataType)(packet[0] >> 6);
            data.Cards = new Card[data.Length];
            for (byte i = 0; i < data.Length; ++i)
                data.Cards[i] = DecodeCard(packet[i + 1]);
            return data;
        }
    }
}
