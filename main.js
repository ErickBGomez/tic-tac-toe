const gameBoard = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];
const inGameBoard = Array.from(document.querySelectorAll(".game-block"));

const gameManager = (() => {
  const renderBoard = () => {
    let counter = 0;

    for (let i = 0; i < gameBoard.length; i++) {
      for (let j = 0; j < gameBoard[i].length; j++) {
        inGameBoard[counter++].textContent = gameBoard[i][j];
      }
    }
  };

  return { renderBoard };
})();

const playerFactory = (symbolString) => {
  const symbol = symbolString;

  const insert = (row, column) => {
    // Prevent overwriting symbols
    if (!!gameBoard[row][column]) return;

    gameBoard[row][column] = symbol;

    gameManager.renderBoard();
  };

  return { insert };
};

const playerOne = playerFactory("X");
const playerTwo = playerFactory("O");

playerOne.insert(0, 0);
playerTwo.insert(0, 1);
playerOne.insert(2, 0);
playerTwo.insert(0, 2);
playerOne.insert(1, 0);
