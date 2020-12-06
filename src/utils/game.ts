import { GameState, Move, MOVE_TYPE } from "../types";
import * as ActionUtils from "../utils/action";

export const endTurn = (gameState: GameState) => {
    const nextIdx =
        gameState.currIdx === gameState.players.length - 1
            ? 0
            : gameState.currIdx + 1;
    return {
        ...gameState,
        currIdx: nextIdx,
        moveQueue: newTurn(gameState.players[nextIdx].id)
    };
};

export const newTurn = (playerId: string): Move[] => {
    console.log("new turn: ", playerId);
    return [
            {
                type: MOVE_TYPE.CHOOSE_ACTION,
                to: [playerId],
                options: ActionUtils.defaultActions,
            },
        ];
};