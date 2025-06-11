window.onload = function () {
  console.log("Page loaded");

  const puzzle = document.getElementById("puzzle");
  const winMessage = document.getElementById("win-message");
  let positions = [0, 1, 2, 3, 4, 5, 6, 7, null]; // null = empty tile

  let imageSrc = "cr7.jpg"; // default image

document.getElementById("image-upload").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    imageSrc = e.target.result;
    drawPuzzle(); // re-draw with new image
  };
  reader.readAsDataURL(file);
});


  function drawPuzzle() {
    puzzle.innerHTML = "";
    positions.forEach((tile, i) => {
      if (tile === null) return;

      const div = document.createElement("div");
      div.classList.add("tile");

      const row = Math.floor(i / 3);
      const col = i % 3;
      div.style.top = `${row * 100}px`;
      div.style.left = `${col * 100}px`;

      // ✅ Add background image and position
      div.style.backgroundImage = `url('${imageSrc}')`;

      div.style.backgroundSize = "300px 300px";

      const bgRow = Math.floor(tile / 3);
      const bgCol = tile % 3;
      div.style.backgroundPosition = `-${bgCol * 100}px -${bgRow * 100}px`;

      div.addEventListener("click", () => moveTile(i));
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
      [positions[index], positions[emptyIndex]] = [positions[emptyIndex], positions[index]];
      drawPuzzle();
      checkWin();
    }
  }

  function checkWin() {
    const isSolved = positions.every((val, idx) => val === null ? idx === 8 : val === idx);
    winMessage.textContent = isSolved ? "🎉 You solved the puzzle!" : "";
  }

  function shufflePuzzle() {
    do {
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [positions[i], positions[j]] = [positions[j], positions[i]];
      }
    } while (positions.every((val, idx) => val === null ? idx === 8 : val === idx));
  }

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
  document.getElementById("solve-btn").addEventListener("click", () => {
    const solution = solvePuzzle([...positions]);
    winMessage.textContent = "Solving...";
    animateSolution(solution);
  });


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

document.getElementById("shuffle-btn").addEventListener("click", () => {
  positions = [0, 1, 2, 3, 4, 5, 6, 7, null]; // reset with 8 tiles + empty
  shufflePuzzle();
  drawPuzzle();
  winMessage.textContent = "";
});

shufflePuzzle();
drawPuzzle();
