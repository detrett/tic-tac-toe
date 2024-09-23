/*
** The Gameboard represents the state of the board
*/
function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    //Internal logger
    const log = (message) => console.info(`%c [${Date.now()}] Gameboard Logger: ${message}`, 'font-weight: 600; color: darkgreen;');

    // Create a 2D array containing the cells
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const markToken = (row, column, player) => {
        log("Marking token");

        // Locate the target cell
        const targetCell = board[row][column];

        // If the target cell is already marked, stop execution.
        if (targetCell.getValue() !== 0) return false;

        console.log(`Marking ${player.name}'s ${player.token} into ${targetCell}`);

        // Otherwise, mark the target cell with the player's token.
        targetCell.addToken(player.token);
        return true;
    };

    const printBoard = () => {
        log("Printing board");

        const boardWithCellValues = board.map((row) => row.map((Cell) => Cell.getValue()));
        console.log(boardWithCellValues);
    };

    const checkRowsForVictory = () => {
        log("Checking rows for victory");
        return board.some((row) => {
            // Calculate the sum of values in a row
            const sum = row.reduce((acc, cell) => acc + cell.getValue(), 0);
            // Check if the sum indicates a win
            return sum === 3 || sum === -3;
        });
    };

    const checkColumnsForVictory = () => {
        log("Checking columns for victory");

        for (let col = 0; col < board[0].length; col++) {
            const sum = board.reduce((acc, row) => acc + row[col].getValue(), 0);

            if (sum === 3 || sum === -3) {
                return true; // There's a winner in this column
            }
        }

        return false;
    }

    const checkDiagonalsForVictory = () => {
        log("Checking diagonals for victory");

        const ltrSum = board.reduce((acc, row, index) => acc + row[index].getValue(), 0);
        const rtlSum = board.reduce((acc, row, index) => acc + row[board.length - 1 - index].getValue(), 0);

        // Check if either diagonal indicates a win
        return ltrSum === 3 || ltrSum === -3 ||
            rtlSum === 3 || rtlSum === -3;
    }


    const checkBoardForVictory = () => {
        const victoryInRow = checkRowsForVictory();
        const victoryInCol = checkColumnsForVictory();
        const victoryInDia = checkDiagonalsForVictory();

        if (victoryInRow || victoryInCol || victoryInDia) {
            return true;
        }

        return false;
    };

    const checkBoardForTie = () => {
        log("Checking for tie");

        const boardFull = board.every((row) => row.every(cell => cell.getValue() !== 0));

        return boardFull;
    }

    const reset = () => {
        log("Resetting the board");

        // Iterate over each row and cell to reset their values
        board.forEach(row => {
            row.forEach(cell => {
                cell.addToken(0);
            });
        });
    }

    return {
        getBoard,
        markToken,
        printBoard,
        checkBoardForVictory,
        checkBoardForTie,
        reset
    };
}

/*
** A Cell represents one "square" on the board and can have one of
** 0: no token is in the square,
** 1: Player 1's token 
** -1: PLayer 2's token 
*/
function Cell() {
    let value = 0;

    // Accept a player's token to change the value of the cell
    const addToken = (playerToken) => { value = playerToken; };
    // How we will retrieve the current value of this cell through closure
    const getValue = () => value;

    return {
        addToken,
        getValue
    };
}

/*
** The GameController will be responsible for controlling the flow
** and state of the game's turns, as well as whether anybody has won the game
*/
function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: 1
        },
        {
            name: playerTwoName,
            token: -1
        }
    ];

    let activePlayer = players[0];

    //Internal logger
    const log = (message) => console.info(`[${Date.now()}] GameController Logger: ${message}`);


    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    const playRound = (row, column) => {
        const tokenMarked = board.markToken(row, column, getActivePlayer());

        if (tokenMarked) {

            if (board.checkBoardForVictory()) {
                console.log(`${getActivePlayer().name} is the winner!`);
                board.reset();
            } else if (board.checkBoardForTie()) {
                console.log(`It's a tie!`);
                board.reset();
            } else {
                switchPlayerTurn();
            }
            printNewRound();
        }
    };

    // Initial play game message
    printNewRound();

    return {
        getActivePlayer,
        playRound,
        getBoard: board.getBoard
    };
}

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');

    const updateScreen = () => {
        // Clear the board
        boardDiv.textContent = "";

        // Get the newest version of the board and player turn
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        // Display player's turn
        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

        // Render board squares
        board.forEach((row, r_index) => {
            row.forEach((cell, c_index) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');

                cellButton.dataset.row = r_index;
                cellButton.dataset.column = c_index;
                cellButton.textContent = cell.getValue();

                boardDiv.appendChild(cellButton);
            })
        })
    }

    // Add event listener for the board
    function clickHandlerBoard(event) {
        const selectedRow = event.target.dataset.row;
        const selectedColumn = event.target.dataset.column;

        // Make sure user clicked a column and not the gaps in between
        if (!selectedColumn || !selectedRow) return;

        game.playRound(selectedRow, selectedColumn);
        updateScreen();
    }
    boardDiv.addEventListener("click", clickHandlerBoard);

    // Initial render
    updateScreen();
}

ScreenController();

