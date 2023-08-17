const gameStateText = document.querySelector(".game-state");
const roundsText = document.querySelector(".rounds");

let gameBoard;
let boardCells;

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

  const updateRoundText = (currentRound) => {
    roundsText.textContent = currentRound;
  };

  return { displayTurn, displayWinner, renderBoard, updateRoundText };
})();

const gameManager = (() => {
  let twoPlayersFlag;
  let turnFlag = false;
  let rounds = 0;
  const players = [];

  const swapTurn = () => (turnFlag = !turnFlag);

  const createBoard = () => {
    const boardContainer = document.querySelector(".game-board");

    boardContainer.innerHTML = "";

    for (let i = 0; i < 9; i++) {
      boardContainer.innerHTML += `<div class="board-cell" data-cellIndex="${i}"></div>`;
    }

    boardCells = boardContainer.querySelectorAll(".board-cell");

    boardCells.forEach((cell) =>
      cell.addEventListener("click", (e) => clickHandler(e.target, players), {
        once: true,
      })
    );
  };

  const declarePlayers = () => {
    // Provisional dialogs
    //twoPlayersFlag = confirm("Ok = Vs. Player\nCancel = Vs. Computer");
    twoPlayersFlag = true;

    players.push(playerFactory("X", "Player One"));

    players.push(
      twoPlayersFlag
        ? playerFactory("O", "Player Two")
        : playerFactory("O", "Computer")
    );
  };

  const startNewRound = () => {
    rounds++;

    gameBoard = ["", "", "", "", "", "", "", "", ""];

    createBoard();

    alert(`Round ${rounds}`);

    gameDOM.updateRoundText(rounds);
    gameDOM.displayTurn(players[+turnFlag]);
  };

  const startGame = () => {
    declarePlayers();
    startNewRound();
  };

  const finishRound = () => {
    // Remove all events
    boardCells.forEach((cell) => cell.replaceWith(cell.cloneNode(true)));

    if (rounds <= 5) {
      startNewRound();
    }
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
    const currentPlayer = players[+turnFlag];

    currentPlayer.insert(currentCell.dataset.cellindex);

    if (checkWin(currentPlayer.getSymbol())) {
      finishRound();

      gameDOM.displayWinner(`${currentPlayer.getName()} is the winner!`);
    } else if (checkDraw()) {
      finishRound();

      gameDOM.displayWinner("Draw!");
    } else {
      swapTurn();
      gameDOM.displayTurn(players[+turnFlag]);
    }
  };

  return { declarePlayers, startGame };
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

gameManager.startGame();
