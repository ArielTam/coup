export type GameState = {
    players: Player[]; // all players
    courtDeck: Card[];
    inPlay: boolean; // whether a game is happening
    currIdx: number; // index of players
    // playerQueue: number[];
    // todo: logging
    moveQueue: Move[];
}

export type Role = "Duke" | "Assassin" | "Ambassador" | "Captain" | "Contessa" | "NONE";

// todo: uppercase
export enum ACTION_TYPE {
    // -- common --
    collectIncome = "collectIncome",
    coup = "coup",
    collectForeignAid = "collectForeignAid", // can be blocked
    challenge = "challenge",
    accept = "accept",
    // --- character specific --
    collectThreeCoins = "collectThreeCoins",
    assassinate = "assassinate",
    swapCards = "swapCards",
    steal = "steal",
    blockForeignAid = "blockForeignAid",
    blockSteal = "blockSteal",
    blockAssassin = "blockAssassin",
    reveal = "reveal",
    loseInfluence = "loseInfluence"
}

export type Action = {
    type: ACTION_TYPE;
    targetPlayerId?: Player['id'];
} 

export type Move = {
    type: MOVE_TYPE;

    // testing this out
    from?: Player['id'];
    to: Player['id'][];
    counter?: Player['id'];
    expectedRole?: Role[]; 
    options?: ACTION_TYPE[];
    chosenAction?: ACTION_TYPE;
    blocked?: boolean;
}

export enum MOVE_TYPE {
    // Player chooses an action. This is the first move during a round.
    CHOOSE_ACTION = "Choose Action",

    // Player(s) have 10 seconds to choose between [accept, challenge, block -- if it can be blocked].
    DELIBERATE = "Deliberate",
    
    // Player responds to an attack with [accept, block].
    RESPOND = "Response to Attack",

    // Player chooses a card to reveal.
    // If it's valid, the revealed card gets replaced
    // If it's invalid, do nothing
    REVEAL = "Reveal a Card",

    // Player chooses a card to give up.
    LOSE_INFLUENCE = "Lose Influence",

    // Player can go through with action.
    DO_ACTION = "Do Action",
}

const useCase1 = [
    MOVE_TYPE.CHOOSE_ACTION, /* [p1] decides to target p2 for assassination */
    MOVE_TYPE.DELIBERATE, /* [p2, p3, p4] can choose to [block, challenge] during a countdown; p3 challenges p1 */
    MOVE_TYPE.REVEAL, /* [p1] reveals a card and it's valid */
    MOVE_TYPE.LOSE_INFLUENCE, /* [p2, p3] lose a card */
    /* turn has ended */
];

const useCase2 = [
    MOVE_TYPE.CHOOSE_ACTION, /* [p1] decides to collect one coin -- no one can deliberate this action */
    /* turn has ended */
];

// certain actions like collecting three coins can't be blocked

// they should still be able to choose which card to reveal (logic shouldn't find it for them)

const useCase3 = [
    MOVE_TYPE.CHOOSE_ACTION, /* [p1] decides to collect three coins */
    MOVE_TYPE.DELIBERATE, /* [p2, p3, p4] can choose to [accept, challenge] during a countdown, p3 challenges */
    MOVE_TYPE.REVEAL, /* [p1] can choose to [reveal]; if valid, they receive a card & the revealed card goes back to the deck */
    MOVE_TYPE.LOSE_INFLUENCE, /* [p3] was wrong and loses a card */
    /* turn has ended */
];

const useCase4 = [
    MOVE_TYPE.CHOOSE_ACTION, /* [p1] decides to steal from [p2] */
    MOVE_TYPE.DELIBERATE, /* [p2, p3, p4] can choose to [challenge] during a countdown; nothing happens */
    MOVE_TYPE.RESPOND, /* [p2] chooses from [block, accept] --> block */
    MOVE_TYPE.DELIBERATE, /* [p1] can choose to [challenge, accept] --> challenge */
    MOVE_TYPE.REVEAL, /* [p2] has to [reveal]; if valid, they receive a card & the revealed card goes back to the deck */
    MOVE_TYPE.LOSE_INFLUENCE, /* [p3] was wrong and loses a card */
    /* turn has ended */
];

export type Card = {
    role: Role;
    revealed: boolean;
    id: string;
}

export type Player = {
    id: string;
    cardsInPlay: Card[];
    coins: number;
    inPlay: boolean; // whether the player is still in the game
    name: string;
    turnLog: string[];
}