export class Block {
    constructor(scene, board, light, shadowGenerator, initialState = { orientation: "standing", r:1, c:1 }) {
      this.scene = scene;
      this.targetr = board.targetTile.r;
      this.targetc = board.targetTile.c;
      this.r = initialState.r;
      this.c = initialState.c;
       
     // console.log("test test", targetTile)
 
      this.mesh = BABYLON.MeshBuilder.CreateBox("block", { width: 1, height: 2, depth: 1 }, scene);
      
      const mat = new BABYLON.StandardMaterial("blockMat", scene);
       
       mat.diffuseTexture = new BABYLON.Texture("texture/rustydiffuse.jpg", scene);

       
       mat.bumpTexture = new BABYLON.Texture("texture/rustynormal.jpg", scene);

       
       mat.bumpTexture.level = 0.7; 

       
       this.mesh.material = mat;


        // Enable Shadows
        //this.mesh.receiveShadows = true;  
        
        shadowGenerator.addShadowCaster(this.mesh);
        shadowGenerator.darkness = 0.05;
        

     
      this.state = { ...initialState };
      this.initialState = { ...initialState };
      this.updateMesh();
  
     
      this.gameOver = false;
     
      this.isAnimating = false; 

      this.isCompleted = false;
      this.shadowGenerator = shadowGenerator;
      this.moveCounter = 0;
      
    }
  
   
    updateMesh() {
      if (this.state.orientation === "standing") {
        this.mesh.scaling = new BABYLON.Vector3(1, 1, 1);
        this.mesh.rotation = BABYLON.Vector3.Zero();
     
        this.mesh.position = new BABYLON.Vector3(this.state.c, 1, this.state.r);
      } else if (this.state.orientation === "horizontal") {
       
        this.mesh.scaling = new BABYLON.Vector3(2, 0.5, 1);
        this.mesh.rotation = BABYLON.Vector3.Zero();
       
        this.mesh.position = new BABYLON.Vector3(this.state.c + 0.5, 0.5, this.state.r);
      } else if (this.state.orientation === "vertical") {
        
        this.mesh.scaling = new BABYLON.Vector3(1, 0.5, 2);
        this.mesh.rotation = BABYLON.Vector3.Zero();
        this.mesh.position = new BABYLON.Vector3(this.state.c, 0.5, this.state.r + 0.5);
      }
    }

    checkCompletion() {
        
        if (this.isCompleted || this.gameOver) return false;
        
        
        if (this.state.orientation !== "standing") return false;

        
        if (this.state.r === this.targetr && 
            this.state.c === this.targetc) {
            //shadowGenerator.removeShadowCaster(this.mesh);
            this.playCompletionAnimation();
            //Problematic
            this.gameOver = true;
            
            return true;
        }
        return false;
    }

    playCompletionAnimation() {
        this.isCompleted = true;
        this.isAnimating = true;

        const startPos = this.mesh.position.clone();
        const finalPos = startPos.clone();
        finalPos.y = -0.9; 

        
        const slideAnim = new BABYLON.Animation(
            "slideAnim",
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3
        );

    
        const scaleAnim = new BABYLON.Animation(
            "scaleAnim",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3
        );

        
        slideAnim.setKeys([
            { frame: 0, value: startPos },
            { frame: 30, value: finalPos }
        ]);

        const startScale = this.mesh.scaling.clone();
        const finalScale = new BABYLON.Vector3(0.98, 1, 0.98);
        
        scaleAnim.setKeys([
            { frame: 0, value: startScale },
            { frame: 30, value: finalScale }
        ]);

      
        const easingFunction = new BABYLON.CubicEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        slideAnim.setEasingFunction(easingFunction);
        scaleAnim.setEasingFunction(easingFunction);

      
        this.mesh.animations = [slideAnim, scaleAnim];

        this.shadowGenerator.removeShadowCaster(this.mesh);

        this.scene.beginAnimation(this.mesh, 0, 30, false, 1, () => {
            this.isAnimating = false;
            
            document.dispatchEvent(new CustomEvent("levelcomplete"));
        });

       
        this.createCompletionParticles();
    }

    
    createCompletionParticles() {
        const particleSystem = new BABYLON.ParticleSystem("completionParticles", 50, this.scene);
        
        
        particleSystem.particleTexture = new BABYLON.Texture("texture/star.png", this.scene);
        
       
        particleSystem.emitter = this.mesh.position;
        
        
        particleSystem.color1 = new BABYLON.Color4(1, 0.8, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1.5;
        
        particleSystem.emitRate = 50;
        
       
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 2;
        
       
        particleSystem.start();
        
        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => particleSystem.dispose(), 2000);
        }, 1000);
    }
  
   
    isValidState(newState, board) {
        const { tiles } = board;
    
       
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

    updateMoveCounterDisplay() {
        document.getElementById("moveCounter").innerText = `Moves: ${this.moveCounter}`;
    }
    

    move(direction, board) {
        if (this.isAnimating || this.gameOver) return;
    
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
            this.isAnimating = true;
            this.animateMove(newState, direction);

            this.moveCounter++;
            this.updateMoveCounterDisplay(); 

            setTimeout(() => {
                if (!this.gameOver) {
                    this.checkCompletion();
                }
            }, 300);
        } 
        else {
            console.log("Invalid move", newState);
            this.isAnimating = true;
            this.fall(direction);
        }
    }

    reset(initialState = null) {
        
        const resetState = initialState || this.initialState;
        this.state = { ...resetState };
        
     
        this.gameOver = false;
        this.isAnimating = false;
        this.isCompleted = false;
        this.moveCounter = 0;
        
       
        this.mesh.rotation = BABYLON.Vector3.Zero();
        this.updateMesh();
        
        
        if (!this.shadowGenerator.getShadowMap().renderList.includes(this.mesh)) {
            this.shadowGenerator.addShadowCaster(this.mesh);
        }
    }

    
    
    animateMove(newState, direction) {
        const duration = 300;
        const steps = 30; 
        const stepDuration = duration / steps;
    
        let step = 0;
        const startPos = this.mesh.position.clone();
        let pivot = new BABYLON.Vector3(0, 0, 0);
        let axis = new BABYLON.Vector3(0, 0, 0);
        let angle = Math.PI / 2 / steps; 
    
    
        if (this.state.orientation === "standing") {
            
            if (newState.orientation === "horizontal") {
                
                const isLeft = direction === "left";
                pivot = new BABYLON.Vector3(
                    startPos.x + (isLeft ? 0.5 : -0.5), 
                    startPos.y - 1, 
                    startPos.z
                );
                axis = new BABYLON.Vector3(0, 0, isLeft ? -1 : 1);
            } else if (newState.orientation === "vertical") {
               
                const isForward = direction === "up";
                pivot = new BABYLON.Vector3(
                    startPos.x,
                    startPos.y - 1, 
                    startPos.z + (isForward ? -0.5 : 0.5)
                );
                axis = new BABYLON.Vector3(isForward ? -1 : 1, 0, 0);
            }
        } 
        else if (this.state.orientation === "horizontal") {
            if (newState.orientation === "standing") {
               
                const isLeft = direction === "left";
                pivot = new BABYLON.Vector3(
                    startPos.x + (isLeft ? 1 : -1),
                    startPos.y - 0.5,
                    startPos.z
                );
                axis = new BABYLON.Vector3(0, 0, isLeft ? -1 : 1);
            } else {
               
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
                
                const isUp = direction === "up";
                pivot = new BABYLON.Vector3(
                    startPos.x,
                    startPos.y - 0.5,
                    startPos.z + (isUp ? -1 : 1)
                );
                axis = new BABYLON.Vector3(isUp ? -1 : 1, 0, 0);
            } else {
                
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
    
       
        const animate = (timestamp) => {
            if (step < steps) {
               
                this.mesh.rotate(axis, angle, BABYLON.Space.WORLD);
                
                
                this.mesh.position = this.mesh.position
                    .subtract(pivot)
                    .applyRotationQuaternion(BABYLON.Quaternion.RotationAxis(axis, angle))
                    .add(pivot);
                
                step++;
                requestAnimationFrame(animate);
            } else {
                this.state = newState;
                this.updateMesh();
                this.isAnimating = false;
            }
        };
    
        requestAnimationFrame(animate);
    }
    
    
    
    fall(direction) {
        this.gameOver = true;
    
        const startPos = this.mesh.position.clone();
        const startRot = this.mesh.rotation.clone();
        
        const edgePoint = startPos.clone();
        const pivotPoint = startPos.clone();
        
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
    
       const frames = {
            tilt: { start: 0, end: 12 },
            drag: { start: 12, end: 24 },
            fall: { start: 24, end: 36 }
        };
    
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
    
        const tiltRot = startRot.clone();
        const tiltAngle = Math.PI / 3; 
        
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
    
        const dragDistance = 2; 
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
    
        const finalPos = dragPos.clone();
        finalPos.y = -25;
    
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
    
        tiltAnim.setEasingFunction(new BABYLON.CircleEase());
        tiltPosAnim.setEasingFunction(new BABYLON.CircleEase());
    
        this.mesh.animations = [tiltAnim, tiltPosAnim];
    
    
        this.scene.beginAnimation(this.mesh, 0, frames.fall.end, false, 1, () => {
            console.log("Game Over");
            this.isAnimating = false;
            document.dispatchEvent(new CustomEvent("gameover"));
        });
    }
    
    
  }
  