const gameManager = (() => {
  const gameBoard = [
    [" ", " ", " "],
    [" ", " ", " "],
    [" ", " ", " "],
  ];
  const inGameBoard = Array.from(document.querySelectorAll(".game-block"));

  const renderBoard = () => {
    let counter = 0;

    for (let i = 0; i < gameBoard.length; i++) {
      for (let j = 0; j < gameBoard[i].length; j++) {
        inGameBoard[counter++].textContent = gameBoard[i][j];
      }
    }
  };

  const insertBlock = (string, row, column) => {
    gameBoard[row][column] = string;
    console.log(gameBoard);

    renderBoard();
  };

  return { insertBlock };
})();

gameManager.insertBlock("O", 0, 0);
gameManager.insertBlock("X", 1, 0);
