import { Card, Player } from "../types";
import shortid from "shortid";

export const getNewDeck = (shuffle: boolean) : Card[] => {
    const deck: Card[] = [
        {role: "Duke", revealed: false, id: shortid.generate()},
        {role: "Duke", revealed: false, id: shortid.generate()},
        {role: "Duke", revealed: false, id: shortid.generate()},
        {role: "Assassin", revealed: false, id: shortid.generate()},
        {role: "Assassin", revealed: false, id: shortid.generate()},
        {role: "Assassin", revealed: false, id: shortid.generate()},
        {role: "Ambassador", revealed: false, id: shortid.generate()},
        {role: "Ambassador", revealed: false, id: shortid.generate()},
        {role: "Ambassador", revealed: false, id: shortid.generate()},
        {role: "Captain", revealed: false, id: shortid.generate()},
        {role: "Captain", revealed: false, id: shortid.generate()},
        {role: "Captain", revealed: false, id: shortid.generate()},
        {role: "Contessa", revealed: false, id: shortid.generate()},
        {role: "Contessa", revealed: false, id: shortid.generate()},
        {role: "Contessa", revealed: false, id: shortid.generate()},
    ];

    if (shuffle) {
        return shuffleDeck(deck);
    }
    return deck;
}

export const shuffleDeck = (deck: Card[]) : Card[] => {
    const newDeck = [...deck];

    for(let i = newDeck.length-1; i > 0; i--){
        const j = Math.floor(Math.random() * i)
        const temp = newDeck[i]
        newDeck[i] = newDeck[j]
        newDeck[j] = temp
    }

    return newDeck;
}

// mods the courtdeck
export const dealCards = (playerNames: string[], courtDeck: Card[]): Player[] => {
    const players: Player[] = [];

    for (let i = 0; i < playerNames.length && courtDeck.length > 2; i++) {
        // error: type Card | undefined is not assignable to type Card
        const card1 = courtDeck.pop();
        const card2 = courtDeck.pop();
        if (card1 && card2) {
            players.push({
                id: shortid.generate(),
                cardsInPlay: [card1, card2],
                coins: 2,
                inPlay: true,
                name: playerNames[i],
                turnLog: [],
            });
        }
    }
    return players;
};