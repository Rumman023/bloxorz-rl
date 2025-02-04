//game.js
import { createBoard } from "./board.js";
import { Block } from "./block.js";

export function createGame(engine, canvas) {
  const scene = new BABYLON.Scene(engine);

  const levelMap = [
    "ooo",
    "oSoooo",
    "ooooooooo",
    "-ooooooooo",
    "-----ooToo",
    "------ooo"
];

  // Camera: fixed so arrow keys don't move it.
  const camera = new BABYLON.ArcRotateCamera(
    "Camera",
    Math.PI / 3,
    Math.PI / 4.5,
    17,
    new BABYLON.Vector3(3, 0, 3),
    scene
  );
  camera.attachControl(canvas, true);
  camera.inputs.clear();

  // Lighting - Sunlight effect
  const sunlight = new BABYLON.DirectionalLight("sunlight", new BABYLON.Vector3(-1, -2, -1), scene);
  sunlight.direction = new BABYLON.Vector3(-0.5, -1, -0.5).normalize(); // Softer angle
  sunlight.position = new BABYLON.Vector3(5, 5, 5); // Higher position
  sunlight.intensity = 5; // Slightly bright sunlight

  // Enable shadows
  const shadowGenerator = new BABYLON.ShadowGenerator(1024, sunlight);
  shadowGenerator.useBlurExponentialShadowMap = true; // Soft shadows
  shadowGenerator.blurKernel = 16; // Blur effect for realistic softness

  // Create the board
  const board = createBoard(scene, levelMap);

  // Locate the start position dynamically
  let startRow = 0, startCol = 0;
  for (let r = 0; r < levelMap.length; r++) {
      let c = levelMap[r].indexOf('S');
      if (c !== -1) {
          startRow = r;
          startCol = c;
          break;
      }
  }

   // Create block at start position
   const block = new Block(scene, sunlight, shadowGenerator, { orientation: "standing", r: startRow, c: startCol });

   // Listen for key presses
   window.addEventListener("keydown", (event) => {
       const keyMap = { "ArrowLeft": "left", "ArrowRight": "right", "ArrowUp": "up", "ArrowDown": "down" };
       if (keyMap[event.key]) {
           block.move(keyMap[event.key], board);
       }
   });
  document.addEventListener("gameover", () => {
    //alert("Game Over!");
    restartGame(engine, canvas);
  });

  
  return scene;
}

// Restart function to reset the game
function restartGame(engine, canvas) {
  engine.dispose(); // Dispose of the old engine
  const newEngine = new BABYLON.Engine(canvas, true); // Create a new engine instance
  const newScene = createGame(newEngine, canvas); // Restart the game
  newEngine.runRenderLoop(() => {
      newScene.render();
  });
  //window.addEventListener("resize", () => newEngine.resize());
}