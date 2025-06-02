window.onload = function () {
  console.log("Page loaded");

  const puzzle = document.getElementById("puzzle");
  const winMessage = document.getElementById("win-message");
  let positions = [0, 1, 2, 3, 4, 5, 6, 7, null]; // null = empty tile

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
      div.style.backgroundImage = "url('cr7.jpg')";
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
    const visited = new Set();
    const queue = [{ state: start, path: [] }];

    const serialize = arr => arr.map(v => v === null ? 'x' : v).join(',');
    visited.add(serialize(start));

    while (queue.length > 0) {
      const { state, path } = queue.shift();

      if (serialize(state) === serialize(target)) {
        return path;
      }

      const empty = state.indexOf(null);
      const moves = [-1, 1, -3, 3];

      for (const move of moves) {
        const newIndex = empty + move;
        if (newIndex < 0 || newIndex >= 9) continue;
        if (move === -1 && empty % 3 === 0) continue;
        if (move === 1 && empty % 3 === 2) continue;

        const newState = [...state];
        [newState[empty], newState[newIndex]] = [newState[newIndex], newState[empty]];

        const key = serialize(newState);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ state: newState, path: [...path, newState] });
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
    const solution = solvePuzzle([...positions]);
    winMessage.textContent = "Solving...";
    animateSolution(solution);
  });

  shufflePuzzle();
  drawPuzzle();
};
