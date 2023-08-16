const gameBoard = ["", "", "", "", "", "", "", "", ""];
const boardCells = document.querySelectorAll(".board-cell");
const gameStateText = document.querySelector(".game-state");

const gameDOM = (() => {
  const displayTurn = (currentPlayer) => {
    gameStateText.textContent = `${currentPlayer.getName()}'s turn!`;
  };

  const displayWinner = (message) => {
    gameStateText.textContent = message;
  };

  const renderBoard = () => {
    gameBoard.forEach((cell, index) => {
      boardCells[index].textContent = cell;
    });
  };

  return { displayTurn, displayWinner, renderBoard };
})();

const gameManager = (() => {
  let playerTwoTurn = false;

  const swapTurn = () => (playerTwoTurn = !playerTwoTurn);

  const startGame = (players) => {
    boardCells.forEach((cell) =>
      cell.addEventListener("click", (e) => clickHandler(e.target, players), {
        once: true,
      })
    );

    gameDOM.displayTurn(players[+playerTwoTurn]);
  };

  const finishGame = () => {
    // Remove all events
    boardCells.forEach((cell) => cell.replaceWith(cell.cloneNode(true)));
  };

  const checkDraw = () => {
    return Array.from(boardCells).every((cell) => cell.textContent !== "");
  };

  const checkWin = (currentPlayerSymbol) => {
    const winningConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return winningConditions.some((combination) =>
      combination.every(
        (index) => boardCells[index].innerText === currentPlayerSymbol
      )
    );
  };

  const clickHandler = (currentCell, players) => {
    const currentPlayer = players[+playerTwoTurn];

    // Insert symbol
    currentPlayer.insert(currentCell.dataset.cellindex);
    // Check draw
    if (checkDraw()) {
      gameDOM.displayWinner("Draw!");
    }
    // else: Check win
    else if (checkWin(currentPlayer.getSymbol())) {
      finishGame();

      gameDOM.displayWinner(`${currentPlayer.getName()} is the winner!`);
    }
    // else: Swap turn
    swapTurn();
    gameDOM.displayTurn(currentPlayer);
  };

  return { startGame };
})();

const playerFactory = (symbolString, playerName = "Player") => {
  const name = playerName;

  const symbol = symbolString;

  const insert = (cellIndex) => {
    gameBoard[cellIndex] = symbol;

    gameDOM.renderBoard();
  };

  const getName = () => name;

  const getSymbol = () => symbol;

  return { insert, getName, getSymbol };
};

const playerOne = playerFactory("X", "Player One");
const playerTwo = playerFactory("O", "Player Two");

gameManager.startGame([playerOne, playerTwo]);
