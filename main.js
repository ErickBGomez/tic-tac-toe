const gameBoard = [
  [" ", " ", " "],
  [" ", " ", " "],
  [" ", " ", " "],
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

  const insertBlock = (row, column) => {
    gameBoard[row][column] = symbol;

    gameManager.renderBoard();
  };

  return { insertBlock };
};

const playerOne = playerFactory("O");
const playerTwo = playerFactory("X");

playerOne.insertBlock(0, 0);
playerTwo.insertBlock(1, 0);
