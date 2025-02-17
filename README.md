# Bloxorz RL

This project implements a reinforcement learning (RL) agent to solve the Bloxorz puzzle game using Q-learning. The game is rendered using Babylon.js, and the RL agent learns to navigate the block to the target tile. Also users can manually move the block with the up-down-left-right key to solve the puzzle. Currently only 2 levels are implemented in this game.

## Table of Contents


- [Installation](#installation)
- [Demo](#demo)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Shortcomings and Future Improvements](#shortcomings-and-future-improvements)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Rumman023/bloxorz-rl.git
    cd bloxorz-rl
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:[port_number]`.

## Demo

[Watch the demo of Bloxorz RL](https://youtu.be/lmjoqOy7Xzs)


## Usage

- Use the arrow keys to manually move the block.
- Click the "Start Learning" button to start the RL agent's learning process.
- Adjust the learning speed using the slider.



## How It Works

1. **Initialization**: The game is initialized with a Babylon.js scene, including the game board and block.
2. **Manual Control**: The user can manually control the block using the arrow keys.
3. **Reinforcement Learning**: The RL agent uses Q-learning to learn the optimal path to the target tile. The learning process runs in the main thread of the browser so when the browser is inactive it pauses, and when the browser is active, it visualises the learning process.
4. **Visualization**: The learning process is visualized with a "Start Learning" button and a speed slider. The current episode, best path length, and other stats are displayed.

## Shortcomings and Future Improvements

### Shortcomings

1. **Web Worker Limitations**: The current implementation of the Web Worker (`rl_worker.js`) does not fully integrate with Babylon.js objects, which causes issues with rendering and state management.
2. **State Persistence**: The Q-table is stored in memory and is not persisted to disk, meaning the learning data is lost when the browser is closed or the page is refreshed.
3. **Performance**: The learning process can be slow, especially for larger levels, due to the high computational cost of Q-learning.
4. **Visualization**: The visualization of the learning process is basic and could be improved to provide more insights into the agent's learning progress.

### Future Improvements

1. **Enhanced Web Worker Integration**: Improve the integration of the Web Worker with Babylon.js objects to ensure smooth rendering and state management.
2. **State Persistence**: Implement a mechanism to save and load the Q-table to and from local storage or a server to persist the learning data across sessions.
3. **Performance Optimization**: Explore performance optimization techniques, such as parallelizing the learning process or using more efficient algorithms.
4. **Advanced Visualization**: Enhance the visualization of the learning process with more detailed statistics, graphs, and real-time updates.
5. **User Interface**: Improve the user interface to provide better controls and feedback for the learning process.
6. **Multi-Level Support**: Extend the RL agent to support multiple levels and dynamically switch between them.
