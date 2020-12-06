import {ACTION_TYPE} from "../types";

export const defaultActions = [
    ACTION_TYPE.collectIncome,
    ACTION_TYPE.collectForeignAid,
    ACTION_TYPE.collectThreeCoins,
    ACTION_TYPE.swapCards,
    ACTION_TYPE.steal,
]

export const getAssassinAction = (coins: number) => {
    return [...(coins >= 3 ? [ACTION_TYPE.assassinate] : [])];
}

export const getCoupAction = (coins: number) => {
    return [...(coins >= 7 ? [ACTION_TYPE.coup] : [])];
}

export const getDeliberateActions = (a: ACTION_TYPE) => {
    const acceptOrChallenge = [ACTION_TYPE.accept, ACTION_TYPE.challenge];

    // cannot deliberate: collectIncome, coup, challenge or accept
    switch (a) {
        case ACTION_TYPE.collectForeignAid:
            return [ACTION_TYPE.accept, ACTION_TYPE.blockForeignAid];
        case ACTION_TYPE.collectThreeCoins:
            return acceptOrChallenge;
        case ACTION_TYPE.steal:
            return [...acceptOrChallenge, ACTION_TYPE.blockSteal];
        case ACTION_TYPE.swapCards:
            return acceptOrChallenge;
        case ACTION_TYPE.assassinate:
            return [...acceptOrChallenge, ACTION_TYPE.blockAssassin];
        case ACTION_TYPE.blockForeignAid || ACTION_TYPE.blockSteal || ACTION_TYPE.blockAssassin:
            return acceptOrChallenge;
        default:
            return [ACTION_TYPE.accept];
    }
}

// export const getAvailableActions = (player: Player, move?: Move) : ACTION_TYPE[] => {
//     const isActive = move?.to?.includes(player.id);

//     if (!move || !isActive) {
//         return [];
//     }
//     switch (move.type) {
//         case MOVE_TYPE.CHOOSE_ACTION:
//             if (player.coins > 10) {
//                 return getCoupAction(player.coins)
//             }
//             return [...defaultActions, ...getAssassinAction(player.coins), ...getCoupAction(player.coins)]
//         case MOVE_TYPE.DELIBERATE:
//             return getDeliberateActions(move);
//         case MOVE_TYPE.RESPOND:
//             return [];
//         case MOVE_TYPE.REVEAL:
//             return [];
//         case MOVE_TYPE.LOSE_INFLUENCE:
//             return [];
//         case MOVE_TYPE.DO_ACTION:
//             // todo: certain actions will require user input, add options here later
//             return [];
//     }
// }