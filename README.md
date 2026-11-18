# Snaku Survival

A 2D grid-based snake survival game built with HTML5 Canvas, CSS, and Vanilla JavaScript, featuring a custom tabular Q-Learning AI bot.

## Game Features & Mechanics
- **Grid Arena:** Played on a `360x360` canvas divided into `20px` boxes (`18x18` grid).
- **Play vs AI Mode (`180ms` tick rate):** Survive against the red AI bot (`#ff4444`) while controlling the green snake (`#00ff88`). Your survival time (`score`) increases every second, and eating yellow energy orbs (`#ffcc00`) grows your snake.
- **Train AI Mode (`40ms` tick rate):** Fast-paced training mode where the player snake bounces automatically off walls to act as a moving target. Episodes automatically reset upon wall crashes, catching the player, or exceeding `150` steps (`stepCount > 150`).
- **Controls:** Full support for desktop `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` keys and on-screen mobile touch buttons (`UP`, `DOWN`, `LEFT`, `RIGHT`, `MENU`) with 180-degree self-reversal prevention.
- **Persistent Memory:** Saves and loads the trained Q-table (`snakuQTable`), episode count (`snakuEpisodes`), and exploration rate (`snakuEpsilon`) via browser `localStorage`, alongside a `RESET AI BRAIN` option to wipe memory.

## How the AI Works & Learns (`ai.js` & `script.js`)
The AI bot uses a custom tabular **Q-Learning** implementation without any external libraries:

1. **State Space (`getAIState`):** 
   Every tick, the bot observes a 6-value state string: `${dirX},${dirY},${dUp},${dDown},${dLeft},${dRight}`:
   - `dirX` & `dirY`: Sign (`-1`, `0`, or `1`) of the relative X and Y distance between the bot's head (`bot[0]`) and the player's head (`player[0]`).
   - `dUp`, `dDown`, `dLeft`, `dRight`: Binary danger sensors (`0` or `1` via `isDanger`) checking the 4 adjacent grid cells around the bot's head for canvas boundaries or body segments (`obstacles` combining `player.slice(1)` and `bot.slice(1)`).

2. **Action Space (`chooseAIAction`):**
   - 4 discrete grid movements: Up `(0, -1)`, Down `(0, 1)`, Left `(-1, 0)`, and Right `(1, 0)`.
   - During training, it uses an **Epsilon-Greedy** policy: choosing a random action with probability `epsilon`, or selecting randomly among the highest Q-value actions (`maxQ`).
   - During `play` mode, if the chosen action leads into a wall, a safe fallback loop checks for the first valid in-bounds move so the bot stays in the arena.

3. **Reward Structure:**
   - **Manhattan Distance Heuristic (`getManhattanDist`):** `+1` reward if the bot's new head position reduces the Manhattan distance to the player's head (`newDist < prevDist`), or `-1.5` penalty if it moves further away.
   - **Wall Collision:** `-10` penalty if the bot attempts to move outside the canvas boundaries.
   - **Catching the Player:** `+20` reward when the bot's head collides with any segment of the player's snake (`player.some(...)`).

4. **Q-Table Update & Hyperparameters (`updateQTable`):**
   - **Learning Rate (`alpha`):** `0.25`
   - **Discount Factor (`gamma`):** `0.9`
   - **Exploration Decay:** Starts at `epsilon = 1.0` and multiplies by `0.985` (`epsilonDecay`) after each training episode down to a minimum of `0.05` (`minEpsilon`).
   - **Bellman Update Formula:** 
     `qTable[state][actionIdx] = Number((oldQ + alpha * (reward + gamma * maxNextQ - oldQ)).toFixed(4))`

## AI Usage Declaration
- **Did you use AI to write code?** No.
- **Details:** All HTML, CSS, game loop mechanics, and the Q-Learning algorithm were written manually from scratch on a mobile device over 9+ hours logged on Hackatime.


  
  
  here is the link :       
  
      https://itzinvi-dev.github.io/Snaku-Survival/
