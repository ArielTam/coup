import {
    ACTION_TYPE,
    GameState,
    Player,
    Card,
    Role,
    MOVE_TYPE,
    Move,
} from "../types";
import * as ActionUtils from "./action";

export const doAction = (
    action: ACTION_TYPE,
    gameState: GameState
): GameState => {
    console.log("do action: ", { gameState });
    switch (action) {
        case ACTION_TYPE.collectForeignAid:
            return doCollectForeignAid(gameState);
        case ACTION_TYPE.collectThreeCoins:
            return doCollectThree(gameState);
    }
    console.log("not a valid action");
    return gameState;
};

export const chooseAction = (
    action: ACTION_TYPE,
    gameState: GameState
): GameState => {
    console.log("choose action");
    // return a brand new game state but don't set it
    switch (action) {
        case ACTION_TYPE.accept:
            return chooseAccept(gameState);
        case ACTION_TYPE.collectIncome:
            return doCollectIncome(gameState);
        case ACTION_TYPE.collectForeignAid:
            return chooseCollectForeignAid(gameState);
        // case ACTION_TYPE.coup:
        //     if (to) {
        //         return coupPlayer(gameState, to);
        //     }
        //     break;
        case ACTION_TYPE.blockForeignAid:
            return blockForeignAid(gameState);
        case ACTION_TYPE.collectThreeCoins:
            return chooseCollectThree(gameState);
        // case ACTION_TYPE.assassinate:
        //     if (to) {
        //         return assassinatePlayer(gameState, to);
        //     }
        //     break;
        // case ACTION_TYPE.swapCards:
        //     return swapCards(gameState);
        // case ACTION_TYPE.steal:
        //     if (to) {
        //         return stealFromPlayer(gameState, to);
        //     }
        //     break;
        // case ACTION_TYPE.blockSteal:
        //     return blockSteal(gameState);
        // case ACTION_TYPE.blockAssassin:
        //     return blockAssassin(gameState);
        case ACTION_TYPE.challenge: // call B.S. on current player
            return challengePlayer(gameState);
        // case ACTION_TYPE.accept:
        //     return gameState;
    }
    console.log("not a valid action");
    return gameState;
};

const playerCoinsChanged = (
    players: Player[],
    targetId: Player["id"],
    amount: number
): Player[] => {
    return players.map((player: Player) => {
        if (player.id === targetId) {
            return {
                ...player,
                coins: player.coins + amount,
            };
        }
        return player;
    });
};

// If any cards have not yet been revealed, one will be revealed
const revealRandomCard = (cards: Card[]): Card[] => {
    let hasRevealedCard = false;
    return cards.map((card) => {
        if (!hasRevealedCard && !card.revealed) {
            hasRevealedCard = true;
            console.log(`Revealed card: ${card.role}`);
            return {
                ...card,
                revealed: true,
            };
        }
        return card;
    });
};

// If the expected character card is present, reveal it
export const revealCard = (
    gameState: GameState,
    cardId: Card["id"],
) => {
    
    const revealMove = gameState.moveQueue[0];
    const {to, from, expectedRole, blocked} = revealMove;
    if (!expectedRole) {
        console.error("RevealCard: no expectedRole set");
        return gameState;
    }

    console.log({revealMove});

    const targetted = gameState.players.find(p => p.id === to[0]);
    const challenger = gameState.players.find(p => p.id === from);

    if (!targetted || !challenger) {
        console.error("RevealCard: cannot find players to and from")
        return gameState;
    }

    const revealedCard = targetted?.cardsInPlay.find(c => c.id === cardId);
    if (!revealedCard) {
        console.error("RevealCard: cannot find card by id");
        return gameState;
    }
    console.log(`${targetted?.name} revealed a ${revealedCard.role}`)
    console.log(gameState.moveQueue)

    const updatedCards = targetted.cardsInPlay.map( c => {
        if (c.id === cardId) {
            return {...c, revealed: true};
        }
        return c;
    });

    const updatedPlayers = gameState.players.map(p => {
        if (p.id === targetted.id) {
            return {...p, cardsInPlay: updatedCards}
        }
        return p;
    })

    const updatedGameState = {...gameState, players: updatedPlayers};

    const isExpectedRole = expectedRole?.includes(revealedCard.role);

    // pop off REVEAL
    updatedGameState.moveQueue.shift();
    
    if (isExpectedRole) {
        console.log(`${targetted?.name} gets to draw a new card.`)
        /* todo */
        console.log(`${challenger?.name} was wrong! They lose influence.`)

        if (blocked) {
            // block succeeds, pop off DO_ACTION
            updatedGameState.moveQueue.shift();
        }

        // push on LOSE_INFLUENCE
        const loseInfluenceMove: Move = {
            type: MOVE_TYPE.LOSE_INFLUENCE,
            to: [challenger.id],
        }
        return {...updatedGameState, moveQueue: [loseInfluenceMove, ...updatedGameState.moveQueue]}
    } else {
        console.log(`${challenger?.name} was right!`)

        if (blocked) {
            // block succeeds, pop off DO_ACTION
            updatedGameState.moveQueue.shift();
        }
    }
    return updatedGameState;
};

export const loseInfluence = (gameState: GameState, cardId: Card["id"]) => {
    const prevMove = gameState.moveQueue[0];
    const player = gameState.players.find(p => p.id === prevMove.to[0]);

    if(!player) {
        console.error("loseInfluence: could not find player");
        return gameState;
    }

    const updatedCards = player.cardsInPlay.map( c => {
        if (c.id === cardId) {
            return {...c, revealed: true};
        }
        return c;
    });

    const updatedPlayers = gameState.players.map(p => {
        if (p.id === player.id) {
            return {...p, cardsInPlay: updatedCards}
        }
        return p;
    })

    // pop off LOSE_INFLUENCE
    gameState.moveQueue.shift();
    return {...gameState, players: updatedPlayers};
}

// Player reveals a card and player status is updated
const playerLostInfluence = (players: Player[], victimId: Player["id"]) => {
    return players.map((player: Player) => {
        if (player.id === victimId) {
            const updatedCards = revealRandomCard(player.cardsInPlay);
            const [firstCard, secondCard] = updatedCards;
            const updatedInPlay = !(firstCard.revealed && secondCard.revealed);
            const msg = updatedInPlay ? "still in play" : "out of the game";
            console.log(`Player, ${player.name}, is ${msg}`);
            return {
                ...player,
                cardsInPlay: updatedCards,
                inPlay: updatedInPlay,
            };
        }
        return player;
    });
};

export const chooseAccept = (gs: GameState) => {
    const moveQueue = gs.moveQueue;
    if (moveQueue[0].blocked) {
        console.log("ACCEPTED.");
        return {
            ...gs,
            moveQueue: [],
        };
    }
    return {
        ...gs,
        moveQueue: [moveQueue[1]],
    };
};

const doCollectIncome = (gs: GameState) => {
    const currPlayer = gs.players[gs.currIdx];
    console.log(`${gs.players[gs.currIdx].name} collected income`);
    return {
        ...gs,
        players: playerCoinsChanged(gs.players, currPlayer.id, 1),
        moveQueue: [],
    };
};

const chooseCollectForeignAid = (gs: GameState) => {
    const currPlayer = gs.players[gs.currIdx];
    console.log(`${gs.players[gs.currIdx].name} wants to collect foreign aid`);

    const deliberateMove: Move = {
        type: MOVE_TYPE.DELIBERATE,
        from: currPlayer.id,
        to: gs.players.filter((p) => p.id !== currPlayer.id).map((p) => p.id),
        options: ActionUtils.getDeliberateActions(
            ACTION_TYPE.collectForeignAid
        ),
    };
    const doMove: Move = {
        type: MOVE_TYPE.DO_ACTION,
        from: currPlayer.id,
        to: [currPlayer.id],
        chosenAction: ACTION_TYPE.collectForeignAid,
    };

    return {
        ...gs,
        moveQueue: [deliberateMove, doMove],
    };
};

const doCollectForeignAid = (gs: GameState) => {
    const currPlayer = gs.players[gs.currIdx];
    console.log(`${gs.players[gs.currIdx].name} collected foreign aid`);
    return {
        ...gs,
        players: playerCoinsChanged(gs.players, currPlayer.id, 2),
        moveQueue: [],
    };
};

const coupPlayer = (gs: GameState, victimId: Player["id"]) => {
    const currPlayer = gs.players[gs.currIdx];
    const victimPlayer = gs.players.find(({ id }: Player) => id === victimId);
    if (!victimPlayer) {
        console.error(
            `Could not find player id #${victimId} in gameState.players.`
        );
        return gs;
    }
    // Subtract 3 coins from attacker
    const updatedPlayers = playerCoinsChanged(gs.players, currPlayer.id, -7);
    // Reveal one of the victim's cards and update player status
    const updatedPlayers2 = playerLostInfluence(updatedPlayers, victimId);
    console.log(`${gs.players[gs.currIdx].name} couped ${victimPlayer.name}`);
    return {
        ...gs,
        players: updatedPlayers2,
    };
};

const blockForeignAid = (gs: GameState) => {
    const prevMove = gs.moveQueue[0];

    if (!prevMove) {
        console.error("blockForeignAid: prev move could not get first element");
        return gs;
    }

    if (!prevMove.from) {
        console.error("blockForeignAid: prev move didn't set who it's from");
        return gs;
    }

    const counter =
        gs.players.find((p) => p.id === prevMove.counter) || ({} as Player);
    console.log(`${counter.name} wants to block foreign aid`);
    const updateMoveQueue: Move[] = [
        {
            type: MOVE_TYPE.DELIBERATE,
            from: prevMove.counter,
            to: [prevMove.from],
            options: ActionUtils.getDeliberateActions(
                ACTION_TYPE.blockForeignAid
            ),
            expectedRole: ["Duke"],
            blocked: true,
        },
        gs.moveQueue[1],
    ];

    return {
        ...gs,
        moveQueue: updateMoveQueue,
    };
};

const doCollectThree = (gs: GameState) => {
    const currPlayer = gs.players[gs.currIdx];
    const updatedPlayers = playerCoinsChanged(gs.players, currPlayer.id, 3);
    console.log(`${gs.players[gs.currIdx].name} collected three coins`);
    return {
        ...gs,
        players: updatedPlayers,
        moveQueue: [],
    };
};

const chooseCollectThree = (gs: GameState) => {
    const currPlayer = gs.players[gs.currIdx];
    console.log(`${gs.players[gs.currIdx].name} wants to collect three coins`);

    const deliberateMove: Move = {
        type: MOVE_TYPE.DELIBERATE,
        from: currPlayer.id,
        to: gs.players.filter((p) => p.id !== currPlayer.id).map((p) => p.id),
        options: ActionUtils.getDeliberateActions(
            ACTION_TYPE.collectThreeCoins
        ),
        expectedRole: ["Duke"],
    };
    const doMove: Move = {
        type: MOVE_TYPE.DO_ACTION,
        from: currPlayer.id,
        to: [currPlayer.id],
        chosenAction: ACTION_TYPE.collectThreeCoins,
    };

    console.log(deliberateMove, doMove);
    return {
        ...gs,
        moveQueue: [deliberateMove, doMove],
    };
};

const assassinatePlayer = (gs: GameState, victimId: Player["id"]) => {
    const currPlayer = gs.players[gs.currIdx];
    const victimPlayer = gs.players.find(({ id }: Player) => id === victimId);
    if (!victimPlayer) {
        console.error(
            `Could not find player id #${victimId} in gameState.players.`
        );
        return gs;
    }
    // Subtract 3 coins from attacker
    const updatedPlayers = playerCoinsChanged(gs.players, currPlayer.id, -3);
    // Reveal one of the victim's cards and update player status
    const updatedPlayers2 = playerLostInfluence(updatedPlayers, victimId);
    console.log(
        `${gs.players[gs.currIdx].name} assassinated ${victimPlayer.name}`
    );
    return {
        ...gs,
        players: updatedPlayers2,
    };
};

const swapCards = (gameState: GameState) => {
    /* todo: requires more user input */
    return gameState;
};

const stealFromPlayer = (gs: GameState, victimId: Player["id"]) => {
    const currPlayer = gs.players[gs.currIdx];
    const victimPlayer = gs.players.find(({ id }: Player) => id === victimId);
    if (!victimPlayer) {
        console.error(
            `Could not find player id #${victimId} in gameState.players.`
        );
        return gs;
    }
    // Attacker gains 2 coins
    const updatedPlayers = playerCoinsChanged(gs.players, currPlayer.id, 2);
    // Victim loses 2 coins
    const updatedPlayers2 = playerCoinsChanged(updatedPlayers, victimId, -2);
    console.log(
        `${gs.players[gs.currIdx].name} stole 2 coins from ${victimPlayer.name}`
    );
    return {
        ...gs,
        players: updatedPlayers2,
    };
};

const blockSteal = (gameState: GameState) => {
    return gameState;
};

const blockAssassin = (gameState: GameState) => {
    return gameState;
};

/* todo: requires some back and forth */
const challengePlayer = (
    gs: GameState
) => {
    const prevMoves = gs.moveQueue;
    const {expectedRole, to, from, blocked} = prevMoves[0];

    if(!expectedRole || !from) {
        return gs;
    }

    const revealMove: Move = {
        type: MOVE_TYPE.REVEAL,
        from: to[0],
        to: [from],
        expectedRole: expectedRole,
        blocked: blocked || false,
    }
    prevMoves.shift();

    const updatedMoveQueue = [revealMove, ...prevMoves];
    console.log("challengePlayer: ", {updatedMoveQueue});

    return {
        ...gs,
        moveQueue: updatedMoveQueue,
    };

    // const currPlayer = gs.players[gs.currIdx];
    // const targetPlayer = gs.players.find(({ id }: Player) => id === target);
    // if (!targetPlayer) {
    //     console.error(
    //         `Could not find player id #${target} in gameState.players.`
    //     );
    //     return gs;
    // }

    // const challengerPlayer = gs.players.find(({ id }: Player) => id === challenger);
    // if (!challengerPlayer) {
    //     console.error(
    //         `Could not find player id #${challenger} in gameState.players.`
    //     );
    //     return gs;
    // }

    // // todo: need to account 2 roles
    // const characterRole = expectedRole[0];

    // const { cards: updatedCards, hasCharacter } = revealCharacterCard(
    //     targetPlayer.cardsInPlay,
    //     characterRole
    // );

    // if (hasCharacter) {
    //     // Character card is revealed
    //     console.log(
    //         `Player, ${targetPlayer.name}, was telling the truth! They do have a ${characterRole}!`
    //     );
    //     // const updatedPlayers = gs.players.map((player: Player) => {
    //     //     if (player.id === targetId) {
    //     //         return {
    //     //             ...player,
    //     //             cardsInPlay: updatedCards,
    //     //         };
    //     //     }
    //     //     return player;
    //     // });

    //     // targetPlayers draws a new card and puts the revealed card back into the deck
    //     console.log(
    //         `Player, ${targetPlayer.name}, gets to pick a new card from the deck!`
    //     );
    //     /* todo: shuffle card into deck, gain a new one */

    //     console.log(
    //         `Player, ${challengerPlayer.name}, was wrong! They lose influence.`
    //     );
    //     /* todo: push LOSE_INFLUENCE to queue */

    //     // currPlayer was wrong!
    //     // const updatedPlayers2 = playerLostInfluence(
    //     //     updatedPlayers,
    //     //     currPlayer.id
    //     // );
    //     // return {
    //     //     ...gs,
    //     //     players: [...updatedPlayers2],
    //     // };
    //     return gs;
    // }
    // // targetPlayer was wrong!
    // console.log(
    //     `Player, ${targetPlayer.name}, was bluffing! They must reveal a card!`
    // );
    // // const updatedPlayers = playerLostInfluence(gs.players, currPlayer.id);
    // // return {
    // //     ...gs,
    // //     players: [...updatedPlayers],
    // // };
    // return gs;
};
