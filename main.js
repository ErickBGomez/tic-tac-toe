let gameBoard;
let boardCells;

let player = null;
let opponent = null;
const players = [];

const sceneManager = (() => {
  let currentSceneIndex = 0;
  const scenes = document.querySelectorAll(".scenes > div");

  const showScene = (index) => {
    scenes[index].style.display = "flex";
  };

  const closeScene = (index) => {
    scenes[index].style.display = "none";
  };

  const openScene = (index) => {
    closeScene(currentSceneIndex);

    currentSceneIndex = index;
    showScene(currentSceneIndex);
  };

  return { openScene };
})();

const gameDOM = (() => {
  const turnSymbols = document.querySelectorAll(".turn-symbols");
  const roundsText = document.querySelector(".rounds");

  const displayTurn = (currentSymbol) => {
    console.log(turnSymbols[0].classList);
    if (currentSymbol === "X") {
      turnSymbols[0].classList.add("active");
      turnSymbols[1].classList.remove("active");
    } else {
      turnSymbols[0].classList.remove("active");
      turnSymbols[1].classList.add("active");
    }
  };

  const displayWinner = (message) => {
    // gameStateText.textContent = message;
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
  let computerFlag;
  let turnFlag;
  let currentTurn;
  let rounds = 0;
  const computerTimeout = 1000;

  const swapTurn = () => {
    turnFlag = !turnFlag;
    currentTurn = !turnFlag ? "X" : "O";
  };

  const resetBoard = () => {
    // Create DOM cells
    const boardContainer = document.querySelector(".game-board");

    boardContainer.innerHTML = "";

    for (let i = 0; i < 9; i++) {
      boardContainer.innerHTML += `<div class="board-cell" data-index="${i}"></div>`;
    }

    boardCells = Array.from(boardContainer.querySelectorAll(".board-cell"));

    // Set board symbols
    gameBoard.forEach((symbol, index) => {
      boardCells[index].textContent =
        typeof gameBoard[index] !== "number" ? symbol : "";
    });
  };

  const resetBoardEvents = () => {
    // Set Click Events
    boardCells
      .filter((cell) => cell.textContent === "")
      .forEach((emptyCells) =>
        emptyCells.addEventListener("click", (e) => {
          const callbackEvent = computerFlag
            ? playerComputerInsertEvent
            : twoPlayersInsertEvent;

          callbackEvent(e.target.dataset.index);
        })
      );
  };

  const declarePlayers = (config) => {
    player = playerFactory(config.playerSymbol, "Player");

    if (config.opponent === "CPU") {
      computerFlag = true;
      opponent = computerFactory(config.opponentSymbol, config.difficulty);
    } else {
      computerFlag = false;
      opponent = playerFactory(config.opponentSymbol, "Player Two");
    }

    if (config.playerSymbol === "X") {
      players.push(player);
      players.push(opponent);
    } else {
      players.push(opponent);
      players.push(player);
    }
  };

  const startNewRound = () => {
    turnFlag = false;
    currentTurn = "X";
    rounds++;

    gameBoard = Array.from(Array(9).keys());

    resetBoard();

    gameDOM.updateRoundText(rounds);
    gameDOM.displayTurn(currentTurn);

    if (player.getSymbol() === "X") {
      resetBoardEvents();
    } else {
      setTimeout(playerComputerInsertEvent, computerTimeout);
    }
  };

  const startGame = (config) => {
    declarePlayers(config);
    startNewRound();
  };

  const finishRound = () => {
    // Remove all events
    boardCells.forEach((cell) => cell.replaceWith(cell.cloneNode(true)));

    if (rounds < 5) {
      setTimeout(startNewRound, 500);
    }
  };

  const checkDraw = () => {
    return gameBoard.every((cell) => typeof cell === "string");
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
      combination.every((index) => gameBoard[index] === currentPlayerSymbol)
    );
  };

  const twoPlayersInsertEvent = (currentCellIndex) => {
    const currentPlayer = players[+turnFlag];

    currentPlayer.insert(currentCellIndex);

    resetBoard();
    resetBoardEvents();

    if (checkWin(currentPlayer.getSymbol())) {
      finishRound();
      // gameDOM.displayWinner(`${currentPlayer.getName()} is the winner!`);
    } else if (checkDraw()) {
      finishRound();
      // gameDOM.displayWinner("Draw!");
    } else {
      swapTurn();
      gameDOM.displayTurn(players[+turnFlag].getSymbol());
    }
  };

  const playerComputerInsertEvent = (currentCellIndex) => {
    const currentPlayer = players[+turnFlag];

    if (currentTurn === player.getSymbol()) {
      player.insert(currentCellIndex);
    } else {
      opponent.optimalInsert();
    }

    resetBoard();

    if (checkWin(currentPlayer.getSymbol())) {
      finishRound();
      // gameDOM.displayWinner(`${currentPlayer.getName()} is the winner!`);
    } else if (checkDraw()) {
      finishRound();
      // gameDOM.displayWinner("Draw!");
    } else {
      swapTurn();
      gameDOM.displayTurn(players[+turnFlag].getSymbol());

      if (currentTurn === opponent.getSymbol()) {
        setTimeout(playerComputerInsertEvent, computerTimeout);
      } else {
        resetBoardEvents();
      }
    }
  };

  const getEmptyCells = () => {
    return gameBoard.filter((emptyCell) => typeof emptyCell === "number");
  };

  return { startGame, checkWin, getEmptyCells };
})();

const playerFactory = (symbolString, playerName = "Player") => {
  const name = playerName;
  const symbol = symbolString;

  const insert = (cellIndex) => {
    if (typeof gameBoard[cellIndex] === "number") {
      gameBoard[cellIndex] = symbol;
    }
  };

  const getName = () => name;

  const getSymbol = () => symbol;

  return { insert, getName, getSymbol };
};

const computerFactory = (symbolString, difficulty, playerName = "Computer") => {
  const prototype = playerFactory(symbolString, playerName);

  const randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const minimax = (newBoard, playerSymbol) => {
    const availableCells = gameManager.getEmptyCells();

    if (gameManager.checkWin(player.getSymbol())) {
      return { score: -10 };
    } else if (gameManager.checkWin(opponent.getSymbol())) {
      return { score: 10 };
    } else if (availableCells.length === 0) {
      return { score: 0 };
    }

    const moves = [];

    for (let i = 0; i < availableCells.length; i++) {
      const move = {};
      let result;

      move.index = newBoard[availableCells[i]];
      newBoard[availableCells[i]] = playerSymbol;

      if (playerSymbol == opponent.getSymbol()) {
        result = minimax(newBoard, player.getSymbol());
        move.score = result.score;
      } else {
        result = minimax(newBoard, opponent.getSymbol());
        move.score = result.score;
      }

      newBoard[availableCells[i]] = move.index;

      moves.push(move);
    }

    let bestMove;
    let bestScore;

    if (playerSymbol === opponent.getSymbol()) {
      bestScore = -Infinity;

      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      bestScore = Infinity;

      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  };

  const easyInsert = () => {
    let random = 0;

    do {
      random = randomInt(0, 8);
    } while (typeof gameBoard[random] === "string");

    prototype.insert(random);
  };

  const hardInsert = () => {
    prototype.insert(minimax(gameBoard, prototype.getSymbol()).index);
  };

  const optimalInsert = () => {
    if (!difficulty) {
      easyInsert();
    } else {
      hardInsert();
    }
  };

  return Object.assign({}, prototype, { optimalInsert });
};

const gameSetUp = (() => {
  const gameConfig = {};

  const selectOpponent = {
    humanPlayer: document.querySelector(".select-human-player"),
    computerPlayer: {
      easy: document.querySelector(".difficulty-container .easy-difficulty"),
      hard: document.querySelector(".difficulty-container .hard-difficulty"),
    },
  };
  const selectComputer = document.querySelector(".select-computer");

  const selectSymbol = {
    x: document.querySelector(".select-x-symbol"),
    o: document.querySelector(".select-o-symbol"),
  };

  selectComputer.addEventListener("click", () =>
    selectComputer.classList.toggle("active")
  );

  const setOpponent = (opponent, difficulty = 0) => {
    gameConfig.opponent = opponent;
    gameConfig.difficulty = difficulty;
  };

  const setSymbol = (playerSymbol, opponentSymbol) => {
    gameConfig.playerSymbol = playerSymbol;
    gameConfig.opponentSymbol = opponentSymbol;

    sceneManager.openScene(2);
    gameManager.startGame(gameConfig);
  };

  selectOpponent.humanPlayer.addEventListener("click", () => {
    setOpponent("human");
    setSymbol("X", "O");
    sceneManager.openScene(2);
  });

  selectOpponent.computerPlayer.easy.addEventListener("click", () => {
    setOpponent("CPU", 0);
    sceneManager.openScene(1);
  });

  selectOpponent.computerPlayer.hard.addEventListener("click", () => {
    setOpponent("CPU", 1);
    sceneManager.openScene(1);
  });

  selectSymbol.x.addEventListener("click", () => setSymbol("X", "O"));
  selectSymbol.o.addEventListener("click", () => setSymbol("O", "X"));
})();

// sceneManager.openScene(2);
