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
      boardCells[index].textContent =
        typeof gameBoard[index] !== "number" ? symbol : "";
    });
  };

  const setBoardEvents = () => {
    // Set Click Events
    boardCells
      .filter((cell) => cell.textContent === "")
      .forEach((emptyCells) =>
        emptyCells.addEventListener("click", (e) =>
          insertEvent(e.target.dataset.cellindex)
        )
      );
  };

  const declarePlayers = (config) => {
    player = playerFactory(config.playerSymbol, "Player");

    if (config.opponent === "CPU") {
      vsComputerFlag = true;
      opponent = computerFactory(config.opponentSymbol, config.difficulty);
    } else {
      vsComputerFlag = false;
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
    rounds++;

    gameBoard = Array.from(Array(9).keys());

    setBoard();
    setBoardEvents();
    //alert(`Round ${rounds}`);

    gameDOM.updateRoundText(rounds);
    gameDOM.displayTurn(players[+turnFlag]);
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

  const insertEvent = (currentCellIndex) => {
    const currentPlayer = players[+turnFlag];

    if (!(vsComputerFlag && turnFlag)) {
      currentPlayer.insert(currentCellIndex);
    } else {
      players[1].optimalInsert();
    }

    setBoard();
    if (turnFlag) setBoardEvents();

    if (checkWin(currentPlayer.getSymbol())) {
      finishRound();

      gameDOM.displayWinner(`${currentPlayer.getName()} is the winner!`);
    } else if (checkDraw()) {
      finishRound();

      gameDOM.displayWinner("Draw!");
    } else {
      swapTurn();

      gameDOM.displayTurn(players[+turnFlag]);

      if (vsComputerFlag && turnFlag) setTimeout(insertEvent, 1000);
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

    if (gameManager.checkWin(players[0].getSymbol())) {
      return { score: -10 };
    } else if (gameManager.checkWin(players[1].getSymbol())) {
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

      if (playerSymbol == players[1].getSymbol()) {
        result = minimax(newBoard, players[0].getSymbol());
        move.score = result.score;
      } else {
        result = minimax(newBoard, players[1].getSymbol());
        move.score = result.score;
      }

      newBoard[availableCells[i]] = move.index;

      moves.push(move);
    }

    let bestMove;
    let bestScore;

    if (playerSymbol === players[1].getSymbol()) {
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

    sceneManager.openScene(1);
  };

  const setSymbol = (symbol) => {
    gameConfig.playerSymbol = symbol;
    gameConfig.opponentSymbol = symbol === "X" ? "O" : "X";

    sceneManager.openScene(2);
    gameManager.startGame(gameConfig);
  };

  selectOpponent.humanPlayer.addEventListener("click", () =>
    setOpponent("human")
  );

  selectOpponent.computerPlayer.easy.addEventListener("click", () =>
    setOpponent("CPU", 0)
  );

  selectOpponent.computerPlayer.hard.addEventListener("click", () =>
    setOpponent("CPU", 1)
  );

  selectSymbol.x.addEventListener("click", () => setSymbol("X"));
  selectSymbol.o.addEventListener("click", () => setSymbol("O"));
})();
