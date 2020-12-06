import React, { useState, useCallback, useEffect } from "react";
import "./App.css";
import { Player, GameState, Card, MOVE_TYPE, ACTION_TYPE } from "./types";
import { PlayerView } from "./components";
import * as CardUtils from "./utils/card";
import * as PlayerUtils from "./utils/player";
import * as GameUtils from "./utils/game";

const defaultGameState: GameState = {
    players: [] as Player[],
    courtDeck: [] as Card[],
    inPlay: false,
    currIdx: 0,
    moveQueue: [],
};

const App = () => {
    const [gameState, setGameState] = useState(defaultGameState);
    // const [isTimerActive, setIsTimerActive] = useState(false);
    console.log("Re-rendering");

    const handleNewGame = useCallback(() => {
        const courtDeck = CardUtils.getNewDeck(true);
        const players = CardUtils.dealCards(
            ["1", "2", "3", "4", "5"],
            courtDeck
        );
        setGameState((prevState) => {
            return {
                ...prevState,
                players,
                courtDeck,
                inPlay: true,
                moveQueue: GameUtils.newTurn(players[0].id),
            };
        });
    }, []);

    const handleAction = useCallback((actionType: ACTION_TYPE, isCounter: boolean, counterId?: Player["id"], cardId?: Card["id"]) => {
        setGameState((prevState) => {
            // REVEAL CARD
            if (actionType === ACTION_TYPE.reveal && cardId) {
                console.log("handleAction | REVEAL: ", {prevState});
                prevState = PlayerUtils.revealCard(prevState, cardId);
            }

            if (actionType === ACTION_TYPE.loseInfluence && cardId) {
                console.log("handleAction | REVEAL: ", {prevState});
                prevState = PlayerUtils.loseInfluence(prevState, cardId);
            }

            console.log(`handle action: ${actionType}, ${isCounter}, ${counterId}`)

            const currMove = prevState.moveQueue[0];
            if (!currMove) {
                console.log("end turn")
                return GameUtils.endTurn(prevState);
            }

            if (currMove.type === MOVE_TYPE.DO_ACTION) {
                PlayerUtils.doAction(actionType, prevState);
            }
 
            // DELIBERATE resulted in a BLOCK, we need to say from who
            if (isCounter && counterId && prevState.moveQueue) {
                prevState.moveQueue[0].counter = counterId;
            }

            const updatedState = PlayerUtils.chooseAction(actionType, prevState);
            
            const originalAction = updatedState.moveQueue[0];
            if (originalAction && originalAction.type === MOVE_TYPE.DO_ACTION && originalAction.chosenAction) {
                const updatedState2 = PlayerUtils.doAction(originalAction.chosenAction, updatedState);
                if (!updatedState2.moveQueue.length) {
                    console.log("end turn")
                    return GameUtils.endTurn(updatedState2);
                }
                return updatedState2;
            }

            if (!updatedState.moveQueue.length) {
                console.log("end turn")
                return GameUtils.endTurn(updatedState);
            }
            return updatedState;
        });
    }, []);

    // const handleSetTimer = useCallback(() => {

    // }, []);

    // useEffect(() => {
    //     const {currentTurn} = gameState;
    //     const queue = currentTurn?.moveQueue;

    //     if (queue?[0].type === MOVE_TYPE.DELIBERATE && !isTimerActive) {
    //         handleSetTimer();
    //     }
    // }, [gameState, isTimerActxive]);

    return (
        <div className="App">
            {!gameState.inPlay ? (
                <button onClick={handleNewGame}>start a new game</button>
            ) : (
                <div>
                    {gameState.players.map((player, i) => {
                        return (
                            <PlayerView
                                moveQueue={gameState.moveQueue}
                                player={player}
                                key={player.id}
                                onAction={handleAction}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default App;
