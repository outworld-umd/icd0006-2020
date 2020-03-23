console.log("KAVER GEI")

enum Phases {DROP=1, SELECT, MOVE, REMOVE, FINISH}
interface Game {
    board: number[][],
    currentPlayer: number,
    counter: number,
    selectCell: number[] | undefined,
    phase: Phases | undefined
}
let gameState: Game = {board: [], currentPlayer: 1, counter: 1, selectCell: undefined, phase: undefined};

// initialize board
function initialize() {
    for (let x = 0; x < 6; ++x) {
        gameState.board[x] = new Array(5);
        for (let y = 0; y < 5; ++y) gameState.board[x][y] = 0;
    }
    gameState.currentPlayer = 1;
    gameState.counter = 1;
    gameState.selectCell = undefined;
    gameState.phase = Phases.DROP;
}

function isThree(x: number, y: number, exclude: number[] | undefined = undefined) {
    let board = JSON.parse(JSON.stringify(gameState.board));
    if (exclude) board[exclude[0]][exclude[1]] = 0;
    let counterX = 0;
    if (y - 1 >= 0 && board[x][y - 1] === gameState.currentPlayer) {
        counterX++;
        if (y - 2 >= 0 && board[x][y - 2] === gameState.currentPlayer) {
            counterX++;
            if (y - 3 >= 0 && board[x][y - 3] === gameState.currentPlayer) {
                counterX++;
            }
        }
    }
    if (y + 1 < 5 && board[x][y + 1] === gameState.currentPlayer) {
        counterX++;
        if (y + 2 < 5 && board[x][y + 2] === gameState.currentPlayer) {
            counterX++;
            if (y + 3 < 5 && board[x][y + 3] === gameState.currentPlayer) {
                counterX++;
            }
        }
    }
    let counterY = 0;
    if (x - 1 >= 0 && board[x - 1][y] === gameState.currentPlayer) {
        counterY++;
        if (x - 2 >= 0 && board[x - 2][y] === gameState.currentPlayer) {
            counterY++;
            if (x - 3 >= 0 && board[x - 3][y] === gameState.currentPlayer) {
                counterY++;
            }
        }
    }
    if (x + 1 < 6 && board[x + 1][y] === gameState.currentPlayer) {
        counterY++;
        if (x + 2 < 6 && board[x + 2][y] === gameState.currentPlayer) {
            counterY++;
            if (x + 3 < 6 && board[x + 3][y] === gameState.currentPlayer) {
                counterY++;
            }
        }
    }
    if (counterX > 2 || counterY > 2) return -1;
    if (counterX === 2 || counterY === 2) return 1;
    return 0;
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * max + min);
}

function findCellToDrop() {
    while (!drop(getRandomInt(0, 6), getRandomInt(0, 5))) {
    }
}

function findFirstBestCase() {
    let playerCells = getCellsWhichBelongTo(gameState.currentPlayer);
    let bestCells = [];
    let bestMoves = [];

    for (let i = 0; i < playerCells.length; ++i) {
        let val = 0;
        const playerCell = playerCells[i];
        const possibleMoves = findPossibleMoves(playerCell.x, playerCell.y, [playerCell.x, playerCell.y]);
        for (let j = 0; j < possibleMoves.length; ++j) {
            const possibleMove = possibleMoves[j];
            val = isThree(possibleMove.x, possibleMove.y, [playerCell.x, playerCell.y]);
            if (isThree(possibleMove.x, possibleMove.y, [playerCell.x, playerCell.y]) === 1) {
                bestCells.push(playerCell);
                bestMoves.push(possibleMove);
            }
        }
    }
    if (bestMoves.length === 0) {
        for (let i = 0; i < playerCells.length; ++i) {
            const playerCell = playerCells[i];
            const possibleMoves = findPossibleMoves(playerCell.x, playerCell.y, [playerCell.x, playerCell.y]);
            for (let j = 0; j < possibleMoves.length; ++j) {
                bestCells.push(playerCell);
                bestMoves.push(possibleMoves[j]);
            }
        }
    }
    let randomIndex = getRandomInt(0, bestMoves.length - 1);
    return {bestMove: bestMoves[randomIndex], bestCell: bestCells[randomIndex]};
}

function getCellsWhichBelongTo(player: number) {
    let arr = [];
    for (let x = 0; x < 6; ++x) {
        for (let y = 0; y < 5; ++y) {
            if (gameState.board[x][y] === player) arr.push({x: x, y: y});
        }
    }
    return arr;
}

function getRandomCellWhichBelongsTo(player: number) {
    const cells = getCellsWhichBelongTo(player);
    return cells[getRandomInt(0, cells.length - 1)];
}

// computer vs computer
function stepAI() {
    if (gameState.phase === Phases.DROP) {
        findCellToDrop();
        gameState.currentPlayer = (gameState.currentPlayer === 2) ? 1 : 2;
        if (getCellsWhichBelongTo(gameState.currentPlayer).length === 12) gameState.phase = Phases.SELECT;
    } else if (gameState.phase === Phases.SELECT) {
        let moveData = findFirstBestCase();
        gameState.selectCell = [moveData.bestCell.x, moveData.bestCell.y];
        gameState.phase = Phases.MOVE;
        gameLogic([moveData.bestMove.x, moveData.bestMove.y]);
    } else if (gameState.phase === Phases.REMOVE) {
        const randomCell = getRandomCellWhichBelongsTo(gameState.currentPlayer === 1 ? 2 : 1);
        if (!randomCell) return;
        gameLogic([randomCell.x, randomCell.y]);
    }
}

function endDrop() {
    return getCellsWhichBelongTo(gameState.currentPlayer).length === 12 && getCellsWhichBelongTo(3 - gameState.currentPlayer).length === 12;
}

// human vs computer
function stepHumanAI(player: number) {
    if (gameState.currentPlayer === player) return;
    if (gameState.phase === Phases.DROP && !endDrop()) {
        findCellToDrop();
        gameState.currentPlayer = player;
        if (endDrop()) {
            gameState.phase = Phases.SELECT;
            return;
        }
    }
    if (endDrop() && gameState.phase === Phases.DROP) gameState.phase = Phases.SELECT;
    if (gameState.phase === Phases.SELECT) {
        let moveData = findFirstBestCase();
        gameState.selectCell = [moveData.bestCell.x, moveData.bestCell.y];
        gameState.phase = Phases.MOVE;
        gameLogic([moveData.bestMove.x, moveData.bestMove.y]);
    }
    if (gameState.phase === Phases.REMOVE) {
        const randomCell = getRandomCellWhichBelongsTo(gameState.currentPlayer === 1 ? 2 : 1);
        if (!randomCell) return;
        gameLogic([randomCell.x, randomCell.y]);
    }
}

// main game logic
function gameLogic(clicked: number[]) {
    if (gameState.phase === Phases.DROP) {
        const dropCell = {x: clicked[0], y: clicked[1]};
        if (!drop(dropCell.x, dropCell.y)) return false;
        gameState.currentPlayer = (gameState.currentPlayer === 2) ? 1 : 2;
        if (gameState.counter === 24) gameState.phase = Phases.SELECT;
        gameState.counter += 1;
    } else if (gameState.phase === Phases.SELECT) {
        const selectCell = {x: clicked[0], y: clicked[1]};
        if (gameState.board[selectCell.x][selectCell.y] === gameState.currentPlayer) {
            gameState.selectCell = clicked;
            gameState.phase = Phases.MOVE;
            return {highlightCells: findPossibleMoves(selectCell.x, selectCell.y, gameState.selectCell)};
        }
    } else if (gameState.phase === Phases.MOVE) {
        const selectCell = {x: clicked[0], y: clicked[1]};
        if (gameState.board[selectCell.x][selectCell.y] === gameState.currentPlayer) {
            gameState.selectCell = clicked;
            return {highlightCells: findPossibleMoves(selectCell.x, selectCell.y, gameState.selectCell)};
        }
        const moveCell = {x: clicked[0], y: clicked[1]};
        if (gameState.selectCell) {
            const possibleMove = findPossibleMoves(gameState.selectCell[0], gameState.selectCell[1], gameState.selectCell)
                .filter(m => m.x === moveCell.x && m.y === moveCell.y)[0];
            if (!possibleMove) return false;
            if (isThree(moveCell.x, moveCell.y, gameState.selectCell) === -1) return false;
            move(gameState.selectCell[0], gameState.selectCell[1], moveCell.x, moveCell.y);
            if (isThree(moveCell.x, moveCell.y) === 1) gameState.phase = Phases.REMOVE;
            else {
                gameState.currentPlayer = (gameState.currentPlayer === 2) ? 1 : 2;
                gameState.phase = Phases.SELECT;
            }
            gameState.selectCell = undefined;
        }
    } else if (gameState.phase === Phases.REMOVE) {
        const removeCell = {x: clicked[0], y: clicked[1]};
        if (!remove(removeCell.x, removeCell.y)) return false;
        remove(removeCell.x, removeCell.y);
        let count = getCellsWhichBelongTo(gameState.currentPlayer === 1 ? 2 : 1).length;
        gameState.phase = count < 3 ? Phases.FINISH : Phases.SELECT;
        if (gameState.phase !== Phases.FINISH) gameState.currentPlayer = (gameState.currentPlayer === 2) ? 1 : 2;
        else console.log(`Player ${gameState.currentPlayer} won`);
    }
}

// drop point
function drop(x: number, y: number) {
    if (gameState.board[x][y] !== 0 || isThree(x, y) !== 0) {
        return false;
    }
    gameState.board[x][y] = gameState.currentPlayer;
    return true;
}

// find legal moves
function findPossibleMoves(x: number, y: number, exclude: number[] | undefined = undefined) {
    return [{x: x, y: y - 1}, {x: x, y: y + 1}, {x: x - 1, y: y}, {x: x + 1, y: y}]
        .filter(n => -1 < n.x && n.x < 6 && -1 < n.y && n.y < 5 && gameState.board[n.x][n.y] === 0
            && isThree(n.x, n.y, exclude) > -1);

}

// move point from a to b
function move(fromX: number, fromY: number, toX: number, toY: number) {
    if (gameState.board[toX][toY] !== 0) return false;
    gameState.board[toX][toY] = gameState.currentPlayer;
    gameState.board[fromX][fromY] = 0;
    return true;
}

// remove point from board
function remove(x: number, y: number) {
    if (gameState.board[x][y] === 0 || gameState.board[x][y] === gameState.currentPlayer) return false;
    gameState.currentPlayer = gameState.currentPlayer === 2 ? 1 : 2;
    let res = isThree(x, y) === 1;
    gameState.currentPlayer = gameState.currentPlayer === 2 ? 1 : 2;
    if (res) return false;
    gameState.board[x][y] = 0;
    return true;
}
