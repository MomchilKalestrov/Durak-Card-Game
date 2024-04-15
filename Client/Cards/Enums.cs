namespace DurakClient.Cards
{
    public enum Symbols : byte
    {
        Hearts,
        Diamonds,
        Clubs,
        Spades
    }

    public enum Ranks : byte
    {
        Two,
        Three,
        Four,
        Five,
        Six,
        Seven,
        Eight,
        Nine,
        Ten,
        Jack,
        Queen,
        King,
        Ace
    }

    public enum DataType : byte
    {
        PlayerAttack,
        AttackDeck,
        PlayerDeck
    }
}
