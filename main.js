let gameBoard;
let boardCells;

const gameDOM = (() => {
  const gameStateText = document.querySelector(".game-state");
  const roundsText = document.querySelector(".rounds");

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
  let vsComputerFlag;
  let turnFlag;
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
      cell.addEventListener(
        "click",
        (e) => clickHandler(e.target.dataset.cellindex),
        {
          once: true,
        }
      )
    );
  };

  const declarePlayers = () => {
    // Provisional dialogs
    vsComputerFlag = confirm("Ok = Vs. Computer\nCancel = Vs. Player");

    players.push(playerFactory("X", "Player One"));

    players.push(
      vsComputerFlag
        ? computerFactory(0, "O")
        : playerFactory("O", "Player Two")
    );
  };

  const startNewRound = () => {
    turnFlag = false;
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

    if (rounds < 5) {
      setTimeout(startNewRound, 250);
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

  // Agregar una forma de insertar el computer cuando sea su turno
  const clickHandler = (currentCellIndex) => {
    const currentPlayer = players[+turnFlag];

    if (!vsComputerFlag || +turnFlag === 0) {
      currentPlayer.insert(currentCellIndex);
    } else {
      players[1].optimalInsert();
    }

    console.log(currentPlayer.getSymbol());

    gameDOM.renderBoard();

    if (checkWin(currentPlayer.getSymbol())) {
      finishRound();

      gameDOM.displayWinner(`${currentPlayer.getName()} is the winner!`);
    } else if (checkDraw()) {
      finishRound();

      gameDOM.displayWinner("Draw!");
    } else {
      swapTurn();

      gameDOM.displayTurn(players[+turnFlag]);

      if (vsComputerFlag && +turnFlag === 1) clickHandler();
    }
  };

  return { declarePlayers, startGame };
})();

const playerFactory = (symbolString, playerName = "Player") => {
  const name = playerName;

  const symbol = symbolString;

  const insert = (cellIndex) => {
    if (gameBoard[cellIndex] === "") {
      gameBoard[cellIndex] = symbol;
    }
  };

  const getName = () => name;

  const getSymbol = () => symbol;

  return { insert, getName, getSymbol };
};

const computerFactory = (difficulty, symbolString, playerName = "Computer") => {
  const prototype = playerFactory(symbolString, playerName);
  const computerDifficulty = difficulty;

  const randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const optimalInsert = () => {
    if (difficulty == 0) {
      let random = 0;

      do {
        random = randomInt(0, 8);
      } while (gameBoard[random] !== "");

      prototype.insert(random);
    }
  };

  return Object.assign({}, prototype, { optimalInsert });
};

gameManager.startGame();
