let gameBoard;
let boardCells;
const boardContainer = document.querySelector(".game-board");

let player = null;
let opponent = null;
let players = [];

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

const sceneManager = (() => {
  let currentSceneIndex = 0;
  const scenes = document.querySelectorAll(".scenes > div");
  const backButton = document.querySelector(".back-button");

  const displayBackButton = () => {
    if (currentSceneIndex > 0) {
      backButton.classList.remove("hide");
    } else {
      backButton.classList.add("hide");
    }
  };

  const showScene = (index) => {
    scenes[index].classList.add("open");
  };

  const closeScenes = () => {
    scenes.forEach((scene) => scene.classList.remove("open"));
  };

  const openScene = (index) => {
    closeScenes();

    currentSceneIndex = index;
    showScene(currentSceneIndex);
    displayBackButton();
  };

  backButton.addEventListener("click", () => openScene(0));

  return { openScene };
})();

const gameDOM = (() => {
  const gameState = document.querySelector(".game-state");
  const turnSymbols = document.querySelectorAll(".turn-symbols");
  const turnLabels = document.querySelectorAll(".turn-label");
  const roundsText = document.querySelector(".rounds");
  const scoreLabels = document.querySelectorAll(".score-label");

  const setComputerColor = (computerSymbol) => {
    boardContainer.dataset.computer = computerSymbol;
    gameState.dataset.computer = computerSymbol;
  };

  const setTurnLabels = (playersArray) => {
    turnLabels[0].textContent = playersArray[0].getName();
    turnLabels[1].textContent = playersArray[1].getName();
  };

  const displayTurn = (currentSymbol = "") => {
    boardContainer.dataset.turn = currentSymbol;
    turnSymbols.forEach((symbol) => {
      symbol.classList.remove("active");
      symbol.classList.remove("winning");
    });

    if (currentSymbol === "X") {
      turnSymbols[0].classList.add("active");
    } else if (currentSymbol === "O") {
      turnSymbols[1].classList.add("active");
    }
  };

  const updateRoundText = (currentRound) => {
    roundsText.textContent = currentRound;
  };

  const highlightWinSymbols = (playerSymbol) => {
    let winIndex = null;
    let plays = gameBoard.reduce(
      (array, element, index) =>
        element === playerSymbol ? array.concat(index) : array,
      []
    );

    for (let [index, win] of winningConditions.entries()) {
      if (win.every((element) => plays.indexOf(element) > -1)) {
        winIndex = index;
        break;
      }
    }

    for (let index of winningConditions[winIndex]) {
      boardCells[index].classList.add("round-won");
    }
  };

  const setScoreLabel = (players) => {
    players.forEach(
      (players, index) => (scoreLabels[index].textContent = players.getScore())
    );

    if (players[0].getScore() > players[1].getScore()) {
      turnSymbols[0].classList.add("winning");
      turnSymbols[1].classList.remove("winning");
    } else if (players[0].getScore() < players[1].getScore()) {
      turnSymbols[0].classList.remove("winning");
      turnSymbols[1].classList.add("winning");
    } else {
      turnSymbols[0].classList.add("winning");
      turnSymbols[1].classList.add("winning");
    }
  };

  const toggleScoreLabel = (flag) => {
    gameState.dataset.score = flag;
  };

  const animateInsertedSymbol = (cellIndex) => {
    const symbolDOM = document.querySelector(
      `.board-cell[data-index="${cellIndex}"]`
    );
    console.log(symbolDOM);
    symbolDOM.classList.add("inserted");
  };

  return {
    setComputerColor,
    setTurnLabels,
    displayTurn,
    updateRoundText,
    highlightWinSymbols,
    setScoreLabel,
    toggleScoreLabel,
    animateInsertedSymbol,
  };
})();

const gameManager = (() => {
  let computerFlag;
  let turnFlag;
  let currentTurn;
  let rounds = 0;
  const computerTimeout = 1000;
  const turnTimeout = 300;
  const newRoundTimeout = 1000;

  const swapTurn = () => {
    turnFlag = !turnFlag;
    currentTurn = !turnFlag ? "X" : "O";
  };

  const resetBoard = () => {
    // Create DOM cells
    boardContainer.innerHTML = "";

    for (let i = 0; i < 9; i++)
      boardContainer.innerHTML += `<div class="board-cell" data-index="${i}"></div>`;

    boardCells = Array.from(boardContainer.querySelectorAll(".board-cell"));

    // Set board symbols
    gameBoard.forEach((cell, index) => {
      if (cell === "X") {
        boardCells[
          index
        ].innerHTML = `<svg width="50" height="50" viewBox="0 0 64 64" class="x-symbol">
        <path
          style="stroke-width: 9; stroke-linecap: round"
          d="M 5,5 59,59 M 59,5 5,59"
        />
      </svg>`;
      } else if (cell === "O") {
        boardCells[
          index
        ].innerHTML = `<svg width="50" height="50" viewBox="0 0 64 64" class="o-symbol">
        <circle
          style="fill: none; stroke-width: 9; stroke-linecap: round"
          cx="32"
          cy="32"
          r="27.5"
        />
      </svg>`;
      }
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
    players = [];
    let playerName;

    if (config.opponent === "CPU") {
      computerFlag = true;
      opponent = computerFactory(config.opponentSymbol, config.difficulty);
      playerName = "P";
    } else {
      computerFlag = false;
      opponent = playerFactory(config.opponentSymbol, "P2");
      playerName = "P1";
    }

    player = playerFactory(config.playerSymbol, playerName);

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
    gameDOM.toggleScoreLabel(false);

    if (player.getSymbol() === "X") {
      resetBoardEvents();
    } else {
      setTimeout(playerComputerInsertEvent, computerTimeout);
    }
  };

  const startGame = (config) => {
    rounds = 0;

    declarePlayers(config);
    gameDOM.setComputerColor(computerFlag ? opponent.getSymbol() : "");
    gameDOM.setTurnLabels(players);
    startNewRound();
  };

  const finishRound = () => {
    // Remove all events
    boardCells.forEach((cell) => cell.replaceWith(cell.cloneNode(true)));

    gameDOM.setScoreLabel(players);
    gameDOM.toggleScoreLabel(true);

    setTimeout(startNewRound, newRoundTimeout);
  };

  const checkDraw = () => {
    return gameBoard.every((cell) => typeof cell === "string");
  };

  const checkWin = (currentPlayerSymbol) => {
    return winningConditions.some((combination) =>
      combination.every((index) => gameBoard[index] === currentPlayerSymbol)
    );
  };

  const twoPlayersInsertEvent = (currentCellIndex) => {
    const currentPlayer = players[+turnFlag];

    currentPlayer.insert(currentCellIndex);

    resetBoard();
    gameDOM.animateInsertedSymbol(currentCellIndex);

    if (checkWin(currentPlayer.getSymbol())) {
      currentPlayer.incrementScore();
      gameDOM.displayTurn();
      gameDOM.highlightWinSymbols(currentPlayer.getSymbol());
      finishRound();
    } else if (checkDraw()) {
      gameDOM.displayTurn();
      finishRound();
    } else {
      setTimeout(() => {
        swapTurn();
        gameDOM.displayTurn(players[+turnFlag].getSymbol());
        resetBoardEvents();
      }, turnTimeout);
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
    gameDOM.animateInsertedSymbol(currentCellIndex);

    if (checkWin(currentPlayer.getSymbol())) {
      currentPlayer.incrementScore();
      gameDOM.displayTurn();
      gameDOM.highlightWinSymbols(currentPlayer.getSymbol());
      finishRound();
    } else if (checkDraw()) {
      gameDOM.displayTurn();
      finishRound();
    } else {
      setTimeout(() => {
        swapTurn();
        gameDOM.displayTurn(players[+turnFlag].getSymbol());

        if (currentTurn === opponent.getSymbol()) {
          setTimeout(playerComputerInsertEvent, computerTimeout);
        } else {
          resetBoardEvents();
        }
      }, turnTimeout);
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
  let score = 0;

  const insert = (cellIndex) => {
    if (typeof gameBoard[cellIndex] === "number") {
      gameBoard[cellIndex] = symbol;
    }
  };

  const getName = () => name;

  const getSymbol = () => symbol;

  const getScore = () => score;

  const incrementScore = () => {
    score++;
  };

  return { insert, getName, getSymbol, getScore, incrementScore };
};

const computerFactory = (symbolString, difficulty, playerName = "CPU") => {
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

sceneManager.openScene(0);
