
import { createGame } from "./game.js";
import { RLAgent } from "./rl.js";
import { Block } from "./block.js";
import { createBoard } from "./board.js";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = createGame(engine, canvas);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => engine.resize());


const levelMap = [
  ["ooo",
  "oSoooo",
  "ooooooooo",
  "-ooooooooo",
  "-----ooToo",
  "------ooo"],

  ["---.......",
    "---.......",
    "oooo-----ooo",
    "ooo-------oo",
    "ooo-------oo",
    "oSo--oooo.....",
    "ooo--oooo.....",
    "-----oTo--..o.",
    "-----ooo--...."]
];


 const sunlight = new BABYLON.DirectionalLight("sunlight", new BABYLON.Vector3(-1, -2, -1), scene);
 sunlight.direction = new BABYLON.Vector3(-0.5, -1, -0.5).normalize(); 
 sunlight.position = new BABYLON.Vector3(5, 5, 5); 
 sunlight.intensity = 5; 


 const shadowGenerator = new BABYLON.ShadowGenerator(1024, sunlight);
 shadowGenerator.useBlurExponentialShadowMap = true; 
 shadowGenerator.blurKernel = 16; 


 function initializeRLAgent() {
  const board = createBoard(scene, levelMap[0]);


  let startRow = 0, startCol = 0;
  for (let r = 0; r < levelMap[0].length; r++) {
      let c = levelMap[0][r].indexOf('S');
      if (c !== -1) {
          startRow = r;
          startCol = c;
          break;
      }
  }

  const block = new Block(scene, board, sunlight, shadowGenerator, { orientation: "standing", r: startRow, c: startCol });
  rlAgent = new RLAgent(board, block);

  rlAgent.createVisualization();
}

initializeRLAgent();

document.addEventListener("gameover", () => {
  restartGame();
});

function restartGame() {
  engine.dispose(); 
  engine = new BABYLON.Engine(canvas, true); 
  scene = createGame(engine, canvas);
  initializeRLAgent(); 
  engine.runRenderLoop(() => {
      scene.render();
  });
  window.addEventListener("resize", () => engine.resize());
}