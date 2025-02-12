
import { createBoard } from "./board.js";
import { Block } from "./block.js";

export function createGame(engine, canvas) {
  const scene = new BABYLON.Scene(engine);

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

  const camera = new BABYLON.ArcRotateCamera(
    "Camera",
    Math.PI / 2,
    Math.PI / 6,
    17,
    new BABYLON.Vector3(5, 0, 5),
    scene
  );
  camera.attachControl(canvas, true);
  camera.inputs.clear();


  const sunlight = new BABYLON.DirectionalLight("sunlight", new BABYLON.Vector3(-1, -2, -1), scene);
  sunlight.direction = new BABYLON.Vector3(-0.5, -1, -0.5).normalize(); 
  sunlight.position = new BABYLON.Vector3(5, 5, 5); 
  sunlight.intensity = 5; 


  const shadowGenerator = new BABYLON.ShadowGenerator(1024, sunlight);
  shadowGenerator.useBlurExponentialShadowMap = true; 
  shadowGenerator.blurKernel = 16; 

 
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


function restartGame(engine, canvas) {
  engine.dispose();
  const newEngine = new BABYLON.Engine(canvas, true); 
  const newScene = createGame(newEngine, canvas); 
  newEngine.runRenderLoop(() => {
      newScene.render();
  });
  //window.addEventListener("resize", () => newEngine.resize());
}