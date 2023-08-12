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

const playerFactory = () => {
  const insertBlock = (string, row, column) => {
    gameBoard[row][column] = string;

    gameManager.renderBoard();
  };

  return { insertBlock };
};

const playerOne = playerFactory();

playerOne.insertBlock("O", 0, 0);
