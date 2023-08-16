const gameBoard = ["", "", "", "", "", "", "", "", ""];
const boardCells = document.querySelectorAll(".board-cell");
const gameStateText = document.querySelector(".game-state");

const gameManager = (() => {
  let playerTwoTurn = false;

  const swapTurn = () => (playerTwoTurn = !playerTwoTurn);

  const displayTurn = (currentPlayer) => {
    gameStateText.textContent = `${currentPlayer.getName()}'s turn!`;
  };

  const startGame = (players) => {
    boardCells.forEach((cell) =>
      cell.addEventListener("click", clickHandler, { once: true })
    );

    displayTurn(players[+playerTwoTurn]);
  };

  const clickHandler = (e) => {
    const currentCell = e.target;

    players[+playerTwoTurn].insert(currentCell.dataset.cellindex);
    swapTurn();
    displayTurn(players[+playerTwoTurn]);
  };

  const renderBoard = () => {
    gameBoard.forEach((cell, index) => {
      boardCells[index].textContent = cell;
    });
  };

  return { startGame, renderBoard };
})();

const playerFactory = (symbolString, playerName = "Player") => {
  const name = playerName;

  const symbol = symbolString;

  const insert = (cellIndex) => {
    gameBoard[cellIndex] = symbol;

    gameManager.renderBoard();
  };

  const getName = () => name;

  return { insert, getName };
};

const playerOne = playerFactory("X", "Player One");
const playerTwo = playerFactory("O", "Player Two");

gameManager.startGame([playerOne, playerTwo]);
