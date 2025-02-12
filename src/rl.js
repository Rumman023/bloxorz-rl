const INITIAL_LEARNING_RATE = 0.3;    
const FINAL_LEARNING_RATE = 0.01;    
const DISCOUNT_FACTOR = 0.99;        
const INITIAL_EPSILON = 0.4;          
const MIN_EPSILON = 0.001;           
const MAX_EPISODES = 5000;
const CONVERGENCE_THRESHOLD = 3;      

export class RLAgent {
    constructor(board, block) {
        this.board = board;
        this.block = block;
        this.qTable = new Map();
        this.episode = 0;
        this.isLearning = false;
        this.currentPath = [];
        this.bestPath = null;
        this.bestPathLength = Infinity;
        this.visualizationSpeed = 500;
        this.visitedStates = new Set();
        this.successfulEpisodes = [];
        this.failureStates = new Set();  
        this.consecutiveSuccesses = 0;
        this.lastPathLength = null;
        this.converged = false;
        this.optimalPath = null;
        this.lastDistance = Infinity;
        
        this.createVisualization();
    }

    getLearningRate() {
        return Math.max(
            FINAL_LEARNING_RATE,
            INITIAL_LEARNING_RATE * (1 - this.episode / MAX_EPISODES)
        );
    }

    getEpsilon() {
        return Math.max(
            MIN_EPSILON,
            INITIAL_EPSILON * (1 - this.episode / MAX_EPISODES)
        );
    }

    getState() {
        return `${this.block.state.orientation}-${this.block.state.r}-${this.block.state.c}`;
    }

    getValidActions() {
        const actions = ['left', 'right', 'up', 'down'];
        return actions.filter(action => {
            const newState = this.simulateMove(this.block.state, action);
            return this.block.isValidState(newState, this.board);
        });
    }

    simulateMove(state, action) {
        const newState = { ...state };
        
        if (state.orientation === "standing") {
            if (action === "left") {
                newState.orientation = "horizontal";
                newState.c = state.c + 1;
            } else if (action === "right") {
                newState.orientation = "horizontal";
                newState.c = state.c - 2;
            } else if (action === "up") {
                newState.orientation = "vertical";
                newState.r = state.r - 2;
            } else if (action === "down") {
                newState.orientation = "vertical";
                newState.r = state.r + 1;
            }
        }
        else if (state.orientation === "horizontal") {
            if (action === "left") {
                newState.orientation = "standing";
                newState.c = state.c + 2;
            } else if (action === "right") {
                newState.orientation = "standing";
                newState.c = state.c - 1;
            } else if (action === "up") {
                newState.orientation = "horizontal";
                newState.r = state.r - 1;
            } else if (action === "down") {
                newState.orientation = "horizontal";
                newState.r = state.r + 1;
            }
        } else if (state.orientation === "vertical") {
            if (action === "up") {
                newState.orientation = "standing";
                newState.r = state.r - 1;
            } else if (action === "down") {
                newState.orientation = "standing";
                newState.r = state.r + 2;
            } else if (action === "left") {
                newState.orientation = "vertical";
                newState.c = state.c + 1;
            } else if (action === "right") {
                newState.orientation = "vertical";
                newState.c = state.c - 1;
            }
        }

        return newState;
    }

    getQValue(state, action) {
        const key = `${state}-${action}`;
        if (this.failureStates.has(key)) {
            return -1000; 
        }
        return this.qTable.get(key) || 0;
    }

    calculateReward(currentState, nextState, steps) {
        if (this.block.gameOver) {
            this.failureStates.add(`${currentState}-${this.lastAction}`);
            return -200;  
        }

        if (this.block.checkCompletion()) {
            return 1000 + (1000 / steps);  
        }

       
        const currentDist = Math.abs(this.block.state.r - this.block.targetr) + 
                          Math.abs(this.block.state.c - this.block.targetc);
        
        
        let reward = -1;

      
        if (currentDist < this.lastDistance) {
            reward += 5;  
        }

        return reward;
    }

    updateQValue(state, action, reward, nextState) {
        const key = `${state}-${action}`;
        const currentQ = this.getQValue(state, action);
        const nextMaxQ = Math.max(...this.getValidActions().map(a => this.getQValue(nextState, a)));
        const learningRate = this.getLearningRate();
        
        const newQ = currentQ + learningRate * (
            reward + DISCOUNT_FACTOR * nextMaxQ - currentQ
        );
        this.qTable.set(key, newQ);
    }

    chooseAction(state) {
        if (this.converged && this.optimalPath) {
            const currentStep = this.currentPath.length;
            return this.optimalPath[currentStep];
        }

        if (Math.random() < this.getEpsilon()) {
            const validActions = this.getValidActions();
            return validActions[Math.floor(Math.random() * validActions.length)];
        }
        
        const validActions = this.getValidActions();
        let bestAction = validActions[0];
        let maxQ = this.getQValue(state, bestAction);
        let bestActions = [bestAction];
        
        for (const action of validActions.slice(1)) {
            const q = this.getQValue(state, action);
            if (q > maxQ) {
                maxQ = q;
                bestActions = [action];
            } else if (q === maxQ) {
                bestActions.push(action);
            }
        }
        
        const unexploredActions = bestActions.filter(action => {
            const newState = this.simulateMove(this.block.state, action);
            const stateKey = `${newState.orientation}-${newState.r}-${newState.c}`;
            return !this.visitedStates.has(stateKey);
        });
        
        return unexploredActions.length > 0 ? 
            unexploredActions[Math.floor(Math.random() * unexploredActions.length)] :
            bestActions[Math.floor(Math.random() * bestActions.length)];
    }

    checkConvergence(pathLength) {
        if (this.lastPathLength === pathLength) {
            this.consecutiveSuccesses++;
            if (this.consecutiveSuccesses >= CONVERGENCE_THRESHOLD) {
                this.converged = true;
                this.optimalPath = [...this.currentPath];
                console.log(`Converged to optimal path of length ${pathLength}`);
                return true;
            }
        } else {
            this.consecutiveSuccesses = 1;
            this.lastPathLength = pathLength;
        }
        return false;
    }

    createVisualization() {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '10px';
        overlay.style.left = '10px';
        overlay.style.padding = '10px';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        overlay.style.color = 'white';
        overlay.style.fontFamily = 'monospace';
        
        this.statsElement = document.createElement('div');
        this.statsElement.id = 'rl-stats';
        overlay.appendChild(this.statsElement);
        
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';
        
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Learning';
        startButton.onclick = () => this.startLearning();
        controls.appendChild(startButton);
        
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = '100';
        speedSlider.max = '1000';
        speedSlider.value = this.visualizationSpeed;
        speedSlider.onchange = (e) => this.visualizationSpeed = e.target.value;
        controls.appendChild(speedSlider);
        
        overlay.appendChild(controls);
        document.body.appendChild(overlay);
    }

    updateVisualization() {
        const stats = `
            Episode: ${this.episode}
            States Explored: ${this.visitedStates.size}
            Current Path Length: ${this.currentPath.length}
            Best Path Length: ${this.bestPath ? this.bestPath.length : 'N/A'}
            Consecutive Successes: ${this.consecutiveSuccesses}
            Status: ${this.converged ? 'CONVERGED' : 'Learning'}
            Success Rate: ${((this.successfulEpisodes.length / this.episode) * 100).toFixed(2)}%
        `;
        this.statsElement.textContent = stats;
    }

    displayQTable() {
        let qTableDiv = document.getElementById("q-table");
        if (!qTableDiv) {
            qTableDiv = document.createElement("div");
            qTableDiv.id = "q-table";
            qTableDiv.style.position = "absolute";
            qTableDiv.style.top = "200px";
            qTableDiv.style.left = "10px";
            qTableDiv.style.padding = "10px";
            qTableDiv.style.backgroundColor = "rgba(0,0,0,0.7)";
            qTableDiv.style.color = "white";
            qTableDiv.style.fontFamily = "monospace";
            qTableDiv.style.maxHeight = "300px";
            qTableDiv.style.overflowY = "auto";
            document.body.appendChild(qTableDiv);
        }
    
        let content = "<b>Q-Table</b><br>";
        for (let [key, value] of this.qTable.entries()) {
            content += `${key}: ${value.toFixed(3)}<br>`;
        }
        qTableDiv.innerHTML = content;
    }

    async startLearning() {
        this.isLearning = true;
        this.episode = 0;
        this.lastDistance = Infinity;
        
        while (this.episode < MAX_EPISODES && this.isLearning && !this.converged) {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.block.reset({orientation: "standing", r: this.block.r, c: this.block.c});
            
            this.currentPath = [];
            let state = this.getState();
            let steps = 0;
            let totalReward = 0;
            this.lastDistance = Infinity;

            if (this.bestPath && Math.random() < 0.2) {
                console.log("Replaying best path...");
                for (const action of this.bestPath) {
                    await new Promise(resolve => setTimeout(resolve, this.visualizationSpeed));
                    this.block.move(action, this.board);
                    while (this.block.isAnimating) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
                this.episode++;
                continue;
            }
            
            while (steps < 100 && !this.block.checkCompletion() && !this.block.gameOver) {
                this.displayQTable();
                this.visitedStates.add(state);
                
                const action = this.chooseAction(state);
                this.lastAction = action;
                this.currentPath.push(action);

        
                this.lastDistance = Math.abs(this.block.state.r - this.block.targetr) + 
                                  Math.abs(this.block.state.c - this.block.targetc);
                
                await new Promise(resolve => setTimeout(resolve, this.visualizationSpeed));
                this.block.move(action, this.board);
                
                while (this.block.isAnimating) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                
                const newState = this.getState();
                const reward = this.calculateReward(state, newState, steps);
                totalReward += reward;
                
                this.updateQValue(state, action, reward, newState);
                state = newState;
                steps++;
                
                this.updateVisualization();
                
                if (this.block.checkCompletion()) {
                    if (!this.bestPath || this.currentPath.length < this.bestPathLength) {
                        this.bestPath = [...this.currentPath];
                        this.bestPathLength = this.currentPath.length;
                        console.log(`New best path found! Length: ${this.bestPathLength}`);
                        this.successfulEpisodes.push({
                            path: [...this.currentPath],
                            reward: totalReward
                        });
                        
                        if (this.checkConvergence(this.currentPath.length)) {
                            break;
                        }
                    }
                }
            }
            
            this.episode++;
            this.updateVisualization();
        }
    }
}