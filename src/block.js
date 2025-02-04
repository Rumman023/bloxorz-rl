//block.js
import { createBoard } from "./board";

export class Block {
    constructor(scene, light, shadowGenerator, initialState = { orientation: "standing", r, c }) {
      this.scene = scene;
      // Create block mesh: standing dimensions (1x2x1)
      this.mesh = BABYLON.MeshBuilder.CreateBox("block", { width: 1, height: 2, depth: 1 }, scene);
      
      const mat = new BABYLON.StandardMaterial("blockMat", scene);
       // Load the diffuse texture (color texture)
       mat.diffuseTexture = new BABYLON.Texture("texture/rustydiffuse.jpg", scene);

       // Load the normal map (for surface depth and lighting effects)
       mat.bumpTexture = new BABYLON.Texture("texture/rustynormal.jpg", scene);

       // Adjust normal map strength (optional)
       mat.bumpTexture.level = 0.7; // Increase or decrease for stronger/weaker effect

       // Apply the material to the block
       this.mesh.material = mat;


        // Enable Shadows
        //this.mesh.receiveShadows = true;  // Block receives shadows
        shadowGenerator.addShadowCaster(this.mesh); // Block casts shadows
        shadowGenerator.darkness = 0.05;

      // Set initial state.
      this.state = { ...initialState };
      this.updateMesh();
  
      // Flag to prevent further moves after game over.
      this.gameOver = false;
      // Flag to track if any animation is ongoing
      this.isAnimating = false; 
    }
  
    // Updates mesh scaling, rotation, and position based on state.
    updateMesh() {
      if (this.state.orientation === "standing") {
        this.mesh.scaling = new BABYLON.Vector3(1, 1, 1);
        this.mesh.rotation = BABYLON.Vector3.Zero();
        // The tile center is (c, -0.5, r), so the block's center is at (c, 1, r).
        this.mesh.position = new BABYLON.Vector3(this.state.c, 1, this.state.r);
      } else if (this.state.orientation === "horizontal") {
        // Lying along x-axis: occupies (r, c) and (r, c+1)
        this.mesh.scaling = new BABYLON.Vector3(2, 0.5, 1);
        this.mesh.rotation = BABYLON.Vector3.Zero();
        // Its center is the midpoint of the two tiles.
        this.mesh.position = new BABYLON.Vector3(this.state.c + 0.5, 0.5, this.state.r);
      } else if (this.state.orientation === "vertical") {
        // Lying along z-axis: occupies (r, c) and (r+1, c)
        this.mesh.scaling = new BABYLON.Vector3(1, 0.5, 2);
        this.mesh.rotation = BABYLON.Vector3.Zero();
        this.mesh.position = new BABYLON.Vector3(this.state.c, 0.5, this.state.r + 0.5);
      }
    }
  
    // Checks if the new state is within board bounds (assumes a 6x6 board).
    isValidState(newState, board) {
        const { tiles } = board;
    
        // Check if within bounds and not stepping on '-'
        const isValidTile = (r, c) => tiles[r]?.[c] && tiles[r][c] !== '-';
    
        if (newState.orientation === "standing") {
            return isValidTile(newState.r, newState.c);
        } else if (newState.orientation === "horizontal") {
            return isValidTile(newState.r, newState.c) && isValidTile(newState.r, newState.c + 1);
        } else if (newState.orientation === "vertical") {
            return isValidTile(newState.r, newState.c) && isValidTile(newState.r + 1, newState.c);
        }
        return false;
    }
    
    
  
    // Computes a new state based on the given direction and moves the block.
   /* move(direction, board) {
        if (this.gameOver) return;

        console.log(`Before Move: Orientation = ${this.state.orientation}, Position = (${this.state.r}, ${this.state.c})`);

    
        const newState = { ...this.state };
    
        if (this.state.orientation === "standing") {
            if (direction === "left") {
                newState.orientation = "horizontal";
                newState.c = this.state.c + 1;
            } else if (direction === "right") {
                newState.orientation = "horizontal";
                newState.c = this.state.c - 2;
            } else if (direction === "up") {
                newState.orientation = "vertical";
                newState.r = this.state.r - 2;
            } else if (direction === "down") {
                newState.orientation = "vertical";
                newState.r = this.state.r + 1;
            }
        } else if (this.state.orientation === "horizontal") {
            if (direction === "left") {
                newState.orientation = "standing";
                newState.c = this.state.c + 2;
            } else if (direction === "right") {
                newState.orientation = "standing";
                newState.c = this.state.c - 1;
            } else if (direction === "up") {
                newState.orientation = "horizontal";
                newState.r = this.state.r - 1;
            } else if (direction === "down") {
                newState.orientation = "horizontal";
                newState.r = this.state.r + 1;
            }
        } else if (this.state.orientation === "vertical") {
            if (direction === "up") {
                newState.orientation = "standing";
                newState.r = this.state.r - 1;
            } else if (direction === "down") {
                newState.orientation = "standing";
                newState.r = this.state.r + 2;
            } else if (direction === "left") {
                newState.orientation = "vertical";
                newState.c = this.state.c + 1;
            } else if (direction === "right") {
                newState.orientation = "vertical";
                newState.c = this.state.c - 1;
            }
        }
    
        if (this.isValidState(newState, board)) {
            this.state = newState;
            this.updateMesh();
        } else {
            console.log("Invalid move", newState);
            this.fall(direction);
        }
    }
    */
    move(direction, board) {
        if (this.isAnimating || this.gameOver) return;
    
        console.log(`Before Move: Orientation = ${this.state.orientation}, Position = (${this.state.r}, ${this.state.c})`);
    
        const newState = { ...this.state };
    
        // Compute new state based on direction and current orientation
        if (this.state.orientation === "standing") {
            if (direction === "left") {
                newState.orientation = "horizontal";
                newState.c = this.state.c + 1;
            } else if (direction === "right") {
                newState.orientation = "horizontal";
                newState.c = this.state.c - 2;
            } else if (direction === "up") {
                newState.orientation = "vertical";
                newState.r = this.state.r - 2;
            } else if (direction === "down") {
                newState.orientation = "vertical";
                newState.r = this.state.r + 1;
            }
        } else if (this.state.orientation === "horizontal") {
            if (direction === "left") {
                newState.orientation = "standing";
                newState.c = this.state.c + 2;
            } else if (direction === "right") {
                newState.orientation = "standing";
                newState.c = this.state.c - 1;
            } else if (direction === "up") {
                newState.orientation = "horizontal";
                newState.r = this.state.r - 1;
            } else if (direction === "down") {
                newState.orientation = "horizontal";
                newState.r = this.state.r + 1;
            }
        } else if (this.state.orientation === "vertical") {
            if (direction === "up") {
                newState.orientation = "standing";
                newState.r = this.state.r - 1;
            } else if (direction === "down") {
                newState.orientation = "standing";
                newState.r = this.state.r + 2;
            } else if (direction === "left") {
                newState.orientation = "vertical";
                newState.c = this.state.c + 1;
            } else if (direction === "right") {
                newState.orientation = "vertical";
                newState.c = this.state.c - 1;
            }
        }
    
        // Animate the movement if valid
        if (this.isValidState(newState, board)) {
            this.isAnimating = true;
            this.animateMove(newState, direction);
        } else {
            console.log("Invalid move", newState);
            this.isAnimating = true;
            this.fall(direction);
        }
    }
    
    // Animate the movement over a period of time
    animateMove(newState, direction) {
        const duration = 300; // Animation duration in ms
        const steps = 30; // Number of animation steps
        const stepDuration = duration / steps;
    
        let step = 0;
        const startPos = this.mesh.position.clone();
        let pivot = new BABYLON.Vector3(0, 0, 0);
        let axis = new BABYLON.Vector3(0, 0, 0);
        let angle = Math.PI / 2 / steps; // 90-degree rotation split over steps
    
        // Calculate pivot and axis based on current orientation and movement
        if (this.state.orientation === "standing") {
            // When standing (1x2x1), toppling in any direction
            if (newState.orientation === "horizontal") {
                // Toppling sideways (left/right)
                const isLeft = direction === "left";
                pivot = new BABYLON.Vector3(
                    startPos.x + (isLeft ? 0.5 : -0.5), // Pivot at bottom edge
                    startPos.y - 1, // Bottom of block
                    startPos.z
                );
                axis = new BABYLON.Vector3(0, 0, isLeft ? -1 : 1);
            } else if (newState.orientation === "vertical") {
                // Toppling forward/backward (up/down)
                const isForward = direction === "up";
                pivot = new BABYLON.Vector3(
                    startPos.x,
                    startPos.y - 1, // Bottom of block
                    startPos.z + (isForward ? -0.5 : 0.5)
                );
                axis = new BABYLON.Vector3(isForward ? -1 : 1, 0, 0);
            }
        } 
        else if (this.state.orientation === "horizontal") {
            if (newState.orientation === "standing") {
                // Rising from horizontal to standing
                const isLeft = direction === "left";
                pivot = new BABYLON.Vector3(
                    startPos.x + (isLeft ? 1 : -1),
                    startPos.y - 0.5,
                    startPos.z
                );
                axis = new BABYLON.Vector3(0, 0, isLeft ? -1 : 1);
            } else {
                // Rolling while horizontal
                const delta = newState.r > this.state.r ? 0.5 : -0.5;
                pivot = new BABYLON.Vector3(
                    startPos.x,
                    startPos.y - 0.5,
                    startPos.z + delta
                );
                axis = new BABYLON.Vector3(1, 0, 0);
                angle *= newState.r > this.state.r ? 1 : -1;
            }
        }
        else if (this.state.orientation === "vertical") {
            if (newState.orientation === "standing") {
                // Rising from vertical to standing
                const isUp = direction === "up";
                pivot = new BABYLON.Vector3(
                    startPos.x,
                    startPos.y - 0.5,
                    startPos.z + (isUp ? -1 : 1)
                );
                axis = new BABYLON.Vector3(isUp ? -1 : 1, 0, 0);
            } else {
                // Rolling while vertical
                const delta = newState.c > this.state.c ? 0.5 : -0.5;
                pivot = new BABYLON.Vector3(
                    startPos.x + delta,
                    startPos.y - 0.5,
                    startPos.z
                );
                axis = new BABYLON.Vector3(0, 0, 1);
                angle *= direction === "right" ? 1 : -1;
            }
        }
    
        // Use requestAnimationFrame for smoother animation
        const animate = (timestamp) => {
            if (step < steps) {
                // Apply rotation around pivot point
                this.mesh.rotate(axis, angle, BABYLON.Space.WORLD);
                
                // Move the block around the pivot point
                this.mesh.position = this.mesh.position
                    .subtract(pivot)
                    .applyRotationQuaternion(BABYLON.Quaternion.RotationAxis(axis, angle))
                    .add(pivot);
                
                step++;
                requestAnimationFrame(animate);
            } else {
                // Ensure final position and orientation are exact
                this.state = newState;
                this.updateMesh();
                this.isAnimating = false;
            }
        };
    
        requestAnimationFrame(animate);
    }
    
    
    
    
  
    // Animates the block falling off the board.
    // Phase 1: The block rotates/tips naturally in the intended move direction until its entire body is off the board.
    // Phase 2: Once completely off, it falls downward.
    fall(direction) {
        this.gameOver = true;
    
        const startPos = this.mesh.position.clone();
        const startRot = this.mesh.rotation.clone();
        
        // Calculate edge point that will drag along the platform
        const edgePoint = startPos.clone();
        const pivotPoint = startPos.clone();
        
        // Set pivot point and edge point based on direction
        switch(direction) {
            case "left":
                pivotPoint.x += 0.5;
                edgePoint.x += 0.5;
                break;
            case "right":
                pivotPoint.x -= 0.5;
                edgePoint.x -= 0.5;
                break;
            case "up":
                pivotPoint.z -= 0.5;
                edgePoint.z -= 0.5;
                break;
            case "down":
                pivotPoint.z += 0.5;
                edgePoint.z += 0.5;
                break;
        }
    
        // Animation frames setup
        const frames = {
            tilt: { start: 0, end: 12 },
            drag: { start: 12, end: 24 },
            fall: { start: 24, end: 36 }
        };
    
        // Create animation for tilting phase
        const tiltAnim = new BABYLON.Animation(
            "tiltAnim",
            "rotation",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3
        );
    
        const tiltPosAnim = new BABYLON.Animation(
            "tiltPosAnim",
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3
        );
    
        // Calculate tilt rotation based on direction
        const tiltRot = startRot.clone();
        const tiltAngle = Math.PI / 3; // 60 degrees tilt
        
        switch(direction) {
            case "left":
                tiltRot.z = -tiltAngle;
                break;
            case "right":
                tiltRot.z = tiltAngle;
                break;
            case "up":
                tiltRot.x = -tiltAngle;
                break;
            case "down":
                tiltRot.x = tiltAngle;
                break;
        }
    
        // Set up dragging movement
        const dragDistance = 2; // Distance to drag along edge
        const dragPos = edgePoint.clone();
        switch(direction) {
            case "left":
                dragPos.x += dragDistance;
                break;
            case "right":
                dragPos.x -= dragDistance;
                break;
            case "up":
                dragPos.z -= dragDistance;
                break;
            case "down":
                dragPos.z += dragDistance;
                break;
        }
    
        // Final position (falling off)
        const finalPos = dragPos.clone();
        finalPos.y = -25;
    
        // Set animation keyframes
        tiltAnim.setKeys([
            { frame: frames.tilt.start, value: startRot },
            { frame: frames.tilt.end, value: tiltRot },
            { frame: frames.drag.end, value: tiltRot.scale(1.5) },
            { frame: frames.fall.end, value: tiltRot.scale(2) }
        ]);
    
        tiltPosAnim.setKeys([
            { frame: frames.tilt.start, value: startPos },
            { frame: frames.tilt.end, value: edgePoint },
            { frame: frames.drag.end, value: dragPos },
            { frame: frames.fall.end, value: finalPos }
        ]);
    
        // Add easing functions
        tiltAnim.setEasingFunction(new BABYLON.CircleEase());
        tiltPosAnim.setEasingFunction(new BABYLON.CircleEase());
    
        this.mesh.animations = [tiltAnim, tiltPosAnim];
    
        // Play the complete animation sequence
        this.scene.beginAnimation(this.mesh, 0, frames.fall.end, false, 1, () => {
            console.log("Game Over");
            this.isAnimating = false;
            document.dispatchEvent(new CustomEvent("gameover"));
        });
    }
    
    
  }
  