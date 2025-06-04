const puzzle = document.getElementById("puzzle");
const winMessage = document.getElementById("win-message");
const toggleBtn = document.getElementById("toggleModeBtn");

let positions = [0,1,2,3,4,5,6,7,null]; // 0-7 tiles + empty
let useNumbers = false; // false = image mode, true = numbers mode

function drawPuzzle() {
  puzzle.innerHTML = "";
  positions.forEach((tile, i) => {
    const div = document.createElement("div");
    div.classList.add("tile");

    const row = Math.floor(i / 3);
    const col = i % 3;
    div.style.top = `${row * 100}px`;
    div.style.left = `${col * 100}px`;

    if (tile === null) {
      div.classList.add("empty");
    } else {
      if (useNumbers) {
        div.classList.add("number");
        div.textContent = tile + 1;  // numbers 1 to 8
      } else {
        const bgRow = Math.floor(tile / 3);
        const bgCol = tile % 3;
        div.style.backgroundImage = customImageURL ? `url('${customImageURL}')` : "url('cr7.jpg')";
        div.style.backgroundSize = "300px 300px";
        div.style.backgroundPosition = `-${bgCol * 100}px -${bgRow * 100}px`;
      }
      div.addEventListener("click", () => moveTile(i));
    }
    puzzle.appendChild(div);
  });
}

function moveTile(index) {
  const emptyIndex = positions.indexOf(null);
  const validMoves = [index - 1, index + 1, index - 3, index + 3];

  if (
    validMoves.includes(emptyIndex) &&
    Math.abs(index % 3 - emptyIndex % 3) + Math.abs(Math.floor(index / 3) - Math.floor(emptyIndex / 3)) === 1
  ) {
    if (!hasStarted) {
      hasStarted = true;
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);
    }

    [positions[index], positions[emptyIndex]] = [positions[emptyIndex], positions[index]];
    drawPuzzle();
    checkWin();
  }
}

function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `Time: ${seconds}s`;
}

function resetTimer() {
  hasStarted = false;
  startTime = null;
  timerDisplay.textContent = "Time: 0s";
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function shufflePuzzle() {
  do {
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
  } while (!isSolvable(positions) || checkWinImmediate());  

  resetTimer();
}

function checkWinImmediate() {
  return positions.every((val, idx) => val === null ? idx === 8 : val === idx);
}



function checkWin() {
  if (positions.every((val, idx) => val === null ? idx === 8 : val === idx)) {
    winMessage.textContent = "🎉 You solved the puzzle!";
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  } else {
    winMessage.textContent = "";
  }
}


// Toggle puzzle mode when button clicked
toggleBtn.addEventListener("click", () => {
  useNumbers = !useNumbers;
  toggleBtn.textContent = useNumbers ? "Switch to Image Puzzle" : "Switch to Number Puzzle";
  shufflePuzzle();
  drawPuzzle();
});

const uploadBtn = document.getElementById('uploadBtn');
const uploadInput = document.getElementById('uploadImage');

let customImageURL = null;

uploadBtn.addEventListener('click', () => {
  uploadInput.click();
});

uploadInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    customImageURL = e.target.result;  // data URL of uploaded image
    drawPuzzle();
  };
  reader.readAsDataURL(file);
});
function solvePuzzle(start) {
  const target = [0, 1, 2, 3, 4, 5, 6, 7, null];
  const targetStr = target.map(v => v === null ? 'x' : v).join(',');
  
  const serialize = arr => arr.map(v => v === null ? 'x' : v).join(',');

  function manhattan(state) {
    let dist = 0;
    for (let i = 0; i < 9; i++) {
      if (state[i] === null) continue;
      const targetIndex = state[i];
      const currRow = Math.floor(i / 3), currCol = i % 3;
      const targetRow = Math.floor(targetIndex / 3), targetCol = targetIndex % 3;
      dist += Math.abs(currRow - targetRow) + Math.abs(currCol - targetCol);
    }
    return dist;
  }

  const openSet = [{ state: start, path: [], cost: 0 }];
  const visited = new Map();
  visited.set(serialize(start), 0);

  while (openSet.length > 0) {
    // sort by estimated cost (lowest first)
    openSet.sort((a, b) => (a.cost + manhattan(a.state)) - (b.cost + manhattan(b.state)));
    const current = openSet.shift();
    const serialized = serialize(current.state);

    if (serialized === targetStr) {
      return current.path;
    }

    const empty = current.state.indexOf(null);
    const moves = [-1, 1, -3, 3];

    for (const move of moves) {
      const newIndex = empty + move;
      if (newIndex < 0 || newIndex >= 9) continue;
      if (move === -1 && empty % 3 === 0) continue;
      if (move === 1 && empty % 3 === 2) continue;

      const newState = [...current.state];
      [newState[empty], newState[newIndex]] = [newState[newIndex], newState[empty]];
      const key = serialize(newState);

      const newCost = current.path.length + 1;
      if (!visited.has(key) || visited.get(key) > newCost) {
        visited.set(key, newCost);
        openSet.push({ state: newState, path: [...current.path, newState], cost: newCost });
      }
    }
  }

  return [];
}


function animateSolution(steps) {
  if (!steps || steps.length === 0) return;

  let i = 0;
  const interval = setInterval(() => {
    positions = steps[i];
    drawPuzzle();
    checkWin();
    i++;
    if (i >= steps.length) clearInterval(interval);
  }, 400);
}

document.getElementById("solve-btn").addEventListener("click", () => {
  if (!isSolvable(positions)) {
    winMessage.textContent = "This puzzle is unsolvable! Try shuffling again.";
    return;
  }
  const solution = solvePuzzle([...positions]);
  winMessage.textContent = "Solving...";
  if (solution.length === 0) {
    winMessage.textContent = "No solution found.";
    return;
  }
  animateSolution(solution);
});

function isSolvable(arr) {
  const tiles = arr.filter(t => t !== null);
  let inversions = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  return inversions % 2 === 0;
}

let hasStarted = false;
let timerInterval = null;
let startTime = null;
const timerDisplay = document.getElementById("timer");


shufflePuzzle();
drawPuzzle();
