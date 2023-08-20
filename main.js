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

  const updateRoundText = (currentRound) => {
    roundsText.textContent = currentRound;
  };

  return {
    displayTurn,
    displayWinner,
    updateRoundText,
  };
})();

const gameManager = (() => {
  let vsComputerFlag;
  let turnFlag;
  let rounds = 0;
  const players = [];

  const swapTurn = () => (turnFlag = !turnFlag);

  const setBoard = () => {
    // Create DOM cells
    const boardContainer = document.querySelector(".game-board");

    boardContainer.innerHTML = "";

    for (let i = 0; i < 9; i++) {
      boardContainer.innerHTML += `<div class="board-cell" data-cellIndex="${i}"></div>`;
    }

    boardCells = Array.from(boardContainer.querySelectorAll(".board-cell"));

    // Set board symbols
    gameBoard.forEach((symbol, index) => {
      boardCells[index].textContent = symbol;
    });

    // Set Click Events
    boardCells
      .filter((cell) => cell.textContent === "")
      .forEach((emptyCells) =>
        emptyCells.addEventListener("click", (e) =>
          clickEvent(e.target.dataset.cellindex)
        )
      );
  };

  const declarePlayers = () => {
    // Provisional dialogs
    vsComputerFlag = confirm("Ok = Vs. Computer\nCancel = Vs. Player");
    const difficulty = +prompt(
      "Set computer Difficulty:\n[0] = Easy\n[1] = Hard"
    );

    players.push(playerFactory("X", "Player One"));

    players.push(
      vsComputerFlag
        ? computerFactory(difficulty, "O")
        : playerFactory("O", "Player Two")
    );
  };

  const startNewRound = () => {
    turnFlag = false;
    rounds++;

    gameBoard = ["", "", "", "", "", "", "", "", ""];

    setBoard();

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
  const clickEvent = (currentCellIndex) => {
    const currentPlayer = players[+turnFlag];

    if (!(vsComputerFlag && turnFlag)) {
      currentPlayer.insert(currentCellIndex);
    } else {
      players[1].optimalInsert();
    }

    setBoard();

    if (checkWin(currentPlayer.getSymbol())) {
      finishRound();

      gameDOM.displayWinner(`${currentPlayer.getName()} is the winner!`);
    } else if (checkDraw()) {
      finishRound();

      gameDOM.displayWinner("Draw!");
    } else {
      swapTurn();

      gameDOM.displayTurn(players[+turnFlag]);

      if (vsComputerFlag && turnFlag) clickEvent();
    }
  };

  const getEmptyCells = () => {
    return gameBoard.filter((emptyCell) => emptyCell === "");
  };

  return { startGame, getEmptyCells };
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

  const easyInsert = () => {
    let random = 0;

    do {
      random = randomInt(0, 8);
    } while (gameBoard[random] !== "");

    prototype.insert(random);
  };

  const hardInsert = () => {};

  const optimalInsert = () => {
    if (!difficulty) {
      easyInsert();
    } else {
      hardInsert();
    }
  };

  return Object.assign({}, prototype, { optimalInsert });
};

gameManager.startGame();
