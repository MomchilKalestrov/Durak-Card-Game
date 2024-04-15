using System.Collections.Generic;
using System;
using System.Linq;
using Durak.Data;

namespace Durak.Players;

public struct Players
{
    public Stack<Card> Cards = new Stack<Card>(52);
    public List<Card> AttackingCards = new List<Card>(50); // -1 the minimum player ammount and -1 for the trump card.
    public readonly Symbols Trump;

    public byte playerTurn = 0;
    public readonly byte playerResetTurn;
    public Card[][] playerDecks;

    public Players(byte playersLength, byte deckLength)
    {
        // Add the cards to the stack
        for (byte i = 0; i < 4; ++i)
            for (byte j = 0; j < 13; ++j)
                Cards.Push(new()
                {
                    Symbol = (Symbols)i,
                    Rank = (Ranks)j
                });

        // Shuffle the cards
        Random random = new Random();
        Card[] values = Cards.ToArray();
        Cards.Clear();
        foreach (var value in values.OrderBy(x => random.Next()))
            Cards.Push(value);

        // Give the cards to the players
        playerDecks = new Card[playersLength][];
        for (byte i = 0; i < playersLength; ++i)
        {
            playerDecks[i] = new Card[deckLength];
            for (byte j = 0; j < deckLength; ++j)
                playerDecks[i][j] = Cards.Pop();
        }
        
        // Set the trump card
        Trump = Cards.Pop().Symbol;

        // Set when the player turn counter has to reset
        playerResetTurn = playersLength;
    }
}