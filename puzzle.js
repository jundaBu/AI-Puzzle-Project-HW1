const puzzle = document.getElementById("puzzle");
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


shufflePuzzle();
drawPuzzle();
