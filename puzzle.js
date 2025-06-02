const puzzle = document.getElementById("puzzle");
let positions = [0, 1, 2, 3, 4, 5, 6, 7, null]; // last is blank

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

    const bgRow = Math.floor(tile / 3);
    const bgCol = tile % 3;
    div.style.backgroundImage = "url('cr7.jpg')";
    div.style.backgroundSize = "300px 300px";
    div.style.backgroundPosition = `-${bgCol * 100}px -${bgRow * 100}px`;

    div.addEventListener("click", () => moveTile(i));
    puzzle.appendChild(div);
  });
}

function moveTile(index) {
  const emptyIndex = positions.indexOf(null);
  const validMoves = [
    index - 1, index + 1,
    index - 3, index + 3
  ];

  if (
    validMoves.includes(emptyIndex) &&
    Math.abs(index % 3 - emptyIndex % 3) + Math.abs(Math.floor(index / 3) - Math.floor(emptyIndex / 3)) === 1
  ) {
    [positions[index], positions[emptyIndex]] = [positions[emptyIndex], positions[index]];
    drawPuzzle();
    checkWin();
  }
}

function shufflePuzzle() {
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
}

function checkWin() {
  const winMessage = document.getElementById("win-message");
  if (positions.every((val, idx) => val === null ? idx === 8 : val === idx)) {
    winMessage.textContent = "🎉 You solved the puzzle!";
  } else {
    winMessage.textContent = "";
  }
}

shufflePuzzle();
drawPuzzle();
