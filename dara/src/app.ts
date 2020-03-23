import './game.js'
import Timeout = NodeJS.Timeout;

const cells = document.querySelectorAll(".js-cell");
// addEventListener to retrieve clicked cell
for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener("click", function (this: HTMLDivElement) {
        if (this.dataset.id) clicked(this.dataset.id.split(",").map(x => +x));
    });
}

// select mode
let mode: string | undefined;
selectMode();


// manual move + computer
function clicked(clicked: number[]) {
    if (mode === "mode4") {
        setTimeout(function () {
            stepHumanAI(2);
            draw(gameState.board)
        }, 1000)
    }
    const blob = gameLogic(clicked);
    if (blob) {
        const highlightCells = blob.highlightCells;
        highlightCells.forEach(element => {
            let id = `${element.x},${element.y}`;
            let cell = document.querySelector("[data-id='" + id);
            if (cell != null) {
                cell.classList.remove("blink");
                setTimeout(function () {
                    if (cell != null) cell.classList.add("blink");
                }, 100);
            }
        });
    }
    draw(gameState.board);
    if (mode === "mode2") {
        setTimeout(function () {
            stepHumanAI(1);
            draw(gameState.board)
        }, 1000)
    }
}

// automatic
function modeAI() {
    let intFunc: Timeout;

    intFunc = setInterval(function () {
        stepAI();
        draw(gameState.board);
        if (gameState.phase === 5) {
            clearInterval(intFunc);
        }
    }, 1000);
}

function draw(board: number[][]) {
    const turn: HTMLElement | null = document.getElementById("turn");
    let phase_text = "";
    if (!board && !gameState.phase && turn != null) {
        turn.innerHTML = "Select Mode and Press Start";
        return;
    }
    for (let x = 0; x < 6; ++x) {
        for (let y = 0; y < 5; ++y) {
            let id = `${x},${y}`;
            let cell: HTMLElement | null = document.querySelector("[data-id='" + id);
            if (cell != null) {
                if (board[x][y] === 1) cell.className = " js-cell button p1";
                else if (board[x][y] === 2) cell.className = " js-cell button p2 ";
                else cell.className = " js-cell ";
            }
        }
    }


    switch (gameState.phase) {
        case 1:
            phase_text = "drop";
            break;
        case 2:
            phase_text = "pick";
            break;
        case 3:
            phase_text = "move";
            break;
        case 4:
            phase_text = "remove";
            break;
        default:
            phase_text = "";
    }
    if (turn != null) {
        if (gameState.phase === Phases.FINISH) {
            turn.innerHTML = "PLAYER " + gameState.currentPlayer + " WON!";
            const board = document.querySelector("#board");
            if (board != null) board.className = "disabled";
        } else turn.innerHTML = "Player " + gameState.currentPlayer + ", " + phase_text + "!";
    }
}

function selectMode() {
    console.log("HELLO");
    mode = undefined;
    let form: HTMLElement | null = document.getElementById("modeForm");
    if (form) form.addEventListener("submit", function (event) {
        event.preventDefault();
        mode = (<HTMLInputElement> document.querySelector('input[name="mode"]:checked')).value;
        //INITIAL CHANGES
        let board: HTMLElement | null = document.querySelector("#board");
        if (board) board.className = "";
        initialize();
        const turn = document.getElementById("turn");
        if (turn) turn.innerHTML = "turn: player 1";
        draw(gameState.board);
        if (mode === "mode3") modeAI();
        if (mode === "mode4") {
            stepHumanAI(2);
            draw(gameState.board);
        }
    });
}

