//board.js
export function createBoard(scene, levelMap) {
    const tiles = [];
    const rows = levelMap.length;
    const cols = Math.max(...levelMap.map(row => row.length));
    const tileSize = 1;
    const tileThickness = 0.2;

    const diffuseTexture = new BABYLON.Texture("./texture/brickdiffuse.jpg", scene);
    const normalTexture = new BABYLON.Texture("./texture/bricknormal.jpg", scene);

    diffuseTexture.uScale = 0.7;
    diffuseTexture.vScale = 0.7;
    normalTexture.uScale = 0.7;
    normalTexture.vScale = 0.7;

    let targetTile = null;

    for (let r = 0; r < rows; r++) {
        tiles[r] = [];
        for (let c = 0; c < levelMap[r].length; c++) {
            if (levelMap[r][c] !== '-') {
                // Create slightly smaller base for visible border effect
                const base = BABYLON.MeshBuilder.CreateBox(`base-${r}-${c}`, {
                    width: tileSize - 0.02,
                    height: tileThickness,
                    depth: tileSize - 0.02
                }, scene);
                base.position = new BABYLON.Vector3(c, -tileThickness / 2, r);
                base.receiveShadows = true;
                // Create ground tile slightly smaller than unit size
                const tile = BABYLON.MeshBuilder.CreateGround(`tile-${r}-${c}`, {
                    width: tileSize - 0.02,
                    height: tileSize - 0.02
                }, scene);
                tile.position = new BABYLON.Vector3(c, 0, r);
                tile.receiveShadows = true;

                // Create border mesh (slightly larger and positioned underneath)
                const border = BABYLON.MeshBuilder.CreateGround(`border-${r}-${c}`, {
                    width: tileSize,
                    height: tileSize
                }, scene);
                border.position = new BABYLON.Vector3(c, -0.001, r);
                border.receiveShadows = true;

                // Material for border
                const borderMat = new BABYLON.StandardMaterial(`borderMat-${r}-${c}`, scene);
                borderMat.diffuseColor = new BABYLON.Color3(0.149, 0.149, 0.149); // Dark brown
                border.material = borderMat;

                // PBR material for tile
                const mat = new BABYLON.PBRMaterial(`mat-${r}-${c}`, scene);
                mat.albedoTexture = diffuseTexture;
                mat.bumpTexture = normalTexture;
                mat.useParallax = true;
                mat.useParallaxOcclusion = true;
                mat.parallaxScaleBias = 0.1;
                mat.metallic = 0.1;
                mat.roughness = 0.8;

                if (levelMap[r][c] === 'T') {
                    const hollow = BABYLON.MeshBuilder.CreateBox(`hollow-${r}-${c}`, {
                        width: tileSize - 0.05,
                        height: tileThickness * 1, // Raised walls
                        depth: tileSize - 0.05
                    }, scene);
                    
                    hollow.position = new BABYLON.Vector3(c, -tileThickness * 1.5, r); // Lowered height for cavity
                    hollow.material = mat;
                    tiles[r][c] = hollow; 
                    targetTile = { r, c };
                    
                    //console.log(targetTile)
                
               //continue
                }

                else {
                    // Create solid tile
                    const tile = BABYLON.MeshBuilder.CreateBox(`tile-${r}-${c}`, {
                        width: tileSize - 0.02,
                        height: tileThickness,
                        depth: tileSize - 0.02
                    }, scene);
                    tile.position = new BABYLON.Vector3(c, -tileThickness / 2, r);
                    tile.receiveShadows = true;
                    tile.material = mat;
                    tiles[r][c] = tile;
                }
            } else {
                tiles[r][c] = null;
            }
        }
    }

    return { tiles, rows, cols, tileSize, targetTile};
}