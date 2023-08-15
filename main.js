const gameBoard = ["", "", "", "", "", "", "", "", ""];
const inGameBoard = document.querySelectorAll(".game-block");

const gameManager = (() => {
  const renderBoard = () => {
    gameBoard.forEach((cell, index) => {
      inGameBoard[index].textContent = cell;
    });
  };

  return { renderBoard };
})();

const playerFactory = (symbolString) => {
  const symbol = symbolString;

  const insert = (cellIndex) => {
    // Prevent overwriting symbols
    if (Boolean(gameBoard[cellIndex])) return;

    gameBoard[cellIndex] = symbol;

    gameManager.renderBoard();
  };

  return { insert };
};

const playerOne = playerFactory("X");
const playerTwo = playerFactory("O");

playerOne.insert(0);
