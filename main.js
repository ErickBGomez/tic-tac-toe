const gameBoard = ["", "", "", "", "", "", "", "", ""];
const boardCells = document.querySelectorAll(".board-cell");

const gameManager = (() => {
  let playerTwoTurn = false;

  const swapTurn = () => (playerTwoTurn = !playerTwoTurn);

  const renderBoard = () => {
    gameBoard.forEach((cell, index) => {
      boardCells[index].textContent = cell;
    });
  };

  const startGame = (players) => {
    boardCells.forEach((cell) =>
      cell.addEventListener(
        "click",
        () => {
          players[+playerTwoTurn].insert(cell.dataset.cellindex);
          swapTurn();
        },
        { once: true }
      )
    );
  };

  return { renderBoard, startGame };
})();

const playerFactory = (symbolString) => {
  const symbol = symbolString;

  const insert = (cellIndex) => {
    gameBoard[cellIndex] = symbol;

    gameManager.renderBoard();
  };

  return { insert };
};

const playerOne = playerFactory("X");
const playerTwo = playerFactory("O");

gameManager.startGame([playerOne, playerTwo]);
