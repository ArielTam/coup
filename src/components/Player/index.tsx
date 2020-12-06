import React, { useCallback } from "react";
import { Player, ACTION_TYPE, MOVE_TYPE, Card, Move } from "../../types";

interface Props {
    moveQueue: Move[];
    player: Player;
    onAction: (
        actionType: ACTION_TYPE,
        isCounter: boolean,
        counterId?: Player["id"],
        cardId?: Card["id"],
    ) => void;
}

const PlayerView = ({ moveQueue, player, onAction }: Props) => {
    const currentMove = moveQueue[0];
    const options = currentMove?.options || [];
    const isActive = currentMove?.to.includes(player.id);
    const showRevealOptions = currentMove?.type === MOVE_TYPE.REVEAL || currentMove?.type === MOVE_TYPE.LOSE_INFLUENCE;

    const revealOptions = () => {
        return player.cardsInPlay.filter((c) => !c.revealed);
    };

    const handleAction = useCallback(
        (actionType: ACTION_TYPE) => {
            if (
                currentMove?.type === MOVE_TYPE.DELIBERATE &&
                currentMove?.from !== player.id
            ) {
                // Counter move from the audience
                onAction(actionType, true, player.id);
                return;
            }
            onAction(actionType, false);
        },
        [onAction, currentMove, player.id]
    );

    const handleReveal = useCallback((cardId: Card["id"]) => {
        console.log("handleReveal: ", {cardId});
        if (currentMove?.type === MOVE_TYPE.REVEAL) {
            onAction(ACTION_TYPE.reveal, false, "", cardId);
            return;
        } else if (currentMove?.type === MOVE_TYPE.LOSE_INFLUENCE) {
            onAction(ACTION_TYPE.loseInfluence, false, "", cardId);
        }
    }, [onAction, currentMove]);

    return (
        <div>
            {player.cardsInPlay[0].revealed &&
            player.cardsInPlay[1].revealed ? (
                <h5>
                    Player: {player.name}, {player.id}
                </h5>
            ) : (
                <h1>
                    Player: {player.name}, {player.id}
                </h1>
            )}
            <p>
                Card 1:{" "}
                {!player.cardsInPlay[0].revealed
                    ? player.cardsInPlay[0].role
                    : `☠️ ${player.cardsInPlay[0].role}`}
            </p>
            <p>
                Card 2:{" "}
                {!player.cardsInPlay[1].revealed
                    ? player.cardsInPlay[1].role
                    : `☠️ ${player.cardsInPlay[1].role}`}
            </p>
            <p>Coins: {player.coins}</p>
            {isActive &&
                (showRevealOptions
                    ? revealOptions().map((char) => (
                          <button
                              key={`reveal-${char.id}-card`}
                              onClick={() => handleReveal(char.id)}
                          >
                              {char.role}, {char.revealed}, {char.id}
                          </button>
                      ))
                    : options.map((actionType) => (
                          <button
                              key={`choose-${actionType}`}
                              onClick={() => handleAction(actionType)}
                          >
                              {actionType}
                          </button>
                      )))}
        </div>
    );
};

export default PlayerView;
