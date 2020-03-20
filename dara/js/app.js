const cells = document.querySelectorAll(".js-cell");
// addEventListener to retrieve clicked cell
for (var i = 0; i < cells.length; i++) {
    cells[i].addEventListener("click", function () {
        clicked(this.dataset.id.split(",").map(x => +x));
    });
}

// select mode
var mode;
selectMode();
draw();


// manual move + computer
function clicked(clicked) {
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
            cell.classList.remove("blink");
            setTimeout(function () {
                cell.classList.add("blink");
            }, 100);
        });
    }
    let id = clicked.join(",");
    let cell = document.querySelector("[data-id='" + id);
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
    var intFunc;

    intFunc = setInterval(function () {
        stepAI();
        draw(gameState.board);
        if (gameState.phase === 5) {
            clearInterval(intFunc);
        }
    }, 1000);
}

function draw(board) {
    const phase = document.getElementById("phase");
    const turn = document.getElementById("turn");
    let phase_text = "";
    if (!board && !gameState.phase) {
        turn.innerHTML = "Select Mode and Press Start";
        return;
    }
    for (let x = 0; x < 6; ++x) {
        for (let y = 0; y < 5; ++y) {
            let id = `${x},${y}`;
            let cell = document.querySelector("[data-id='" + id);
            if (board[x][y] === 1) cell.className = " js-cell button p1";
            else if (board[x][y] === 2) cell.className = " js-cell button p2 ";
            else cell.className = " js-cell ";
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
    if (gameState.phase === gamePhase.FINISH) {
        turn.innerHTML = "PLAYER " + gameState.currentPlayer + " WON!";
        const board = document.querySelector("#board");
        board.className = "disabled";
    } else turn.innerHTML = "Player " + gameState.currentPlayer + ", " + phase_text + "!";
}

function selectMode() {
    mode = undefined;
    var form = document.getElementById("modeForm");
    form.addEventListener("submit", function () {
        event.preventDefault();
        mode = document.querySelector('input[name="mode"]:checked').value;
        //INITIAL CHANGES
        const board = document.querySelector("#board");
        board.className = "";
        initialize();
        const phase = document.getElementById("phase");
        const turn = document.getElementById("turn");
        phase.innerHTML = "phase: drop";
        turn.innerHTML = "turn: player 1";
        draw(gameState.board);
        if (mode === "mode3") modeAI();
        if (mode === "mode4") {
            stepHumanAI(2);
            draw(gameState.board);
        }
    });
}

