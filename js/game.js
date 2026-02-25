// 《数字华容道·诗词版》 - 游戏核心逻辑
// 版本: v1.0.0

class Poem2048Game {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = 0;
        this.moves = 0;
        this.gameTime = 0;
        this.timer = null;
        this.gameState = 'loading'; // loading, playing, paused, gameover, victory
        this.currentMode = 'classic'; // classic, poem, challenge
        this.currentPoem = null;
        this.unlockedChars = 0;
        this.totalChars = 5;
        
        this.init();
    }
    
    init() {
        console.log('初始化游戏...');
        this.loadGameData();
        this.setupEventListeners();
        this.generateGrid();
        this.addInitialTiles();
        this.updateDisplay();
        this.startTimer();
        this.gameState = 'playing';
        
        // 初始化诗词数据
        this.loadPoemData();
        
        console.log('游戏初始化完成');
    }
    
    loadGameData() {
        // 从本地存储加载游戏数据
        const savedData = localStorage.getItem('poem2048_game_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.bestScore = data.bestScore || 0;
                this.currentMode = data.currentMode || 'classic';
                this.gridSize = data.gridSize || 4;
                
                console.log('游戏数据加载成功');
            } catch (error) {
                console.error('加载游戏数据失败:', error);
            }
        }
    }
    
    saveGameData() {
        // 保存游戏数据到本地存储
        const data = {
            bestScore: this.bestScore,
            currentMode: this.currentMode,
            gridSize: this.gridSize,
            lastPlayed: new Date().toISOString()
        };
        
        localStorage.setItem('poem2048_game_data', JSON.stringify(data));
    }
    
    loadPoemData() {
        // 加载诗词数据
        this.currentPoem = {
            title: '静夜思',
            author: '李白',
            content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
            chars: ['床', '前', '明', '月', '光', '疑', '是', '地', '上', '霜'],
            unlocked: [true, false, false, false, false, false, false, false, false, false]
        };
        
        this.totalChars = this.currentPoem.chars.length;
        this.unlockedChars = this.currentPoem.unlocked.filter(u => u).length;
        
        this.updatePoemDisplay();
    }
    
    setupEventListeners() {
        // 方向按钮事件
        document.getElementById('upBtn').addEventListener('click', () => this.move('up'));
        document.getElementById('downBtn').addEventListener('click', () => this.move('down'));
        document.getElementById('leftBtn').addEventListener('click', () => this.move('left'));
        document.getElementById('rightBtn').addEventListener('click', () => this.move('right'));
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
        
        // 触摸滑动控制
        let touchStartX, touchStartY;
        
        document.addEventListener('touchstart', (e) => {
            if (this.gameState !== 'playing') return;
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (this.gameState !== 'playing' || !touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            // 确定滑动方向
            if (Math.abs(dx) > Math.abs(dy)) {
                // 水平滑动
                if (Math.abs(dx) > 30) {
                    if (dx > 0) this.move('right');
                    else this.move('left');
                }
            } else {
                // 垂直滑动
                if (Math.abs(dy) > 30) {
                    if (dy > 0) this.move('down');
                    else this.move('up');
                }
            }
            
            touchStartX = null;
            touchStartY = null;
            e.preventDefault();
        }, { passive: false });
        
        // 控制按钮事件
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('soundBtn').addEventListener('click', () => this.toggleSound());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareGame());
        
        // 触摸提示关闭
        document.getElementById('closeTouchHint').addEventListener('click', () => {
            document.getElementById('touch-hint').style.display = 'none';
        });
        
        console.log('事件监听器设置完成');
    }
    
    generateGrid() {
        this.grid = [];
        const gridElement = document.getElementById('gameGrid');
        gridElement.innerHTML = '';
        gridElement.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        gridElement.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
        
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = null;
                
                // 创建网格单元格
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridElement.appendChild(cell);
            }
        }
    }
    
    addInitialTiles() {
        // 添加初始的两个方块
        this.addRandomTile();
        this.addRandomTile();
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        // 找到所有空单元格
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === null) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return false;
        
        // 随机选择一个空单元格
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4; // 90%概率生成2，10%概率生成4
        
        this.grid[randomCell.row][randomCell.col] = {
            value: value,
            row: randomCell.row,
            col: randomCell.col,
            merged: false,
            new: true
        };
        
        this.createTileElement(randomCell.row, randomCell.col, value);
        return true;
    }
    
    createTileElement(row, col, value) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.dataset.row = row;
        tile.dataset.col = col;
        tile.textContent = value;
        
        // 设置位置
        tile.style.gridRow = row + 1;
        tile.style.gridColumn = col + 1;
        
        // 添加动画
        tile.classList.add('new-tile');
        
        document.getElementById('gameGrid').appendChild(tile);
        
        // 移除动画类
        setTimeout(() => {
            tile.classList.remove('new-tile');
        }, 300);
    }
    
    move(direction) {
        if (this.gameState !== 'playing') return;
        
        let moved = false;
        const oldGrid = this.cloneGrid();
        
        // 根据方向处理移动
        switch(direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.moves++;
            this.addRandomTile();
            this.updateDisplay();
            this.saveMoveHistory(oldGrid);
            this.checkGameState();
            this.playSound('move');
        } else {
            this.playSound('error');
        }
    }
    
    moveUp() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            // 从第二行开始向上移动
            for (let row = 1; row < this.gridSize; row++) {
                if (this.grid[row][col] !== null) {
                    let currentRow = row;
                    
                    // 向上移动直到遇到障碍
                    while (currentRow > 0 && this.grid[currentRow - 1][col] === null) {
                        this.grid[currentRow - 1][col] = this.grid[currentRow][col];
                        this.grid[currentRow][col] = null;
                        currentRow--;
                        moved = true;
                    }
                    
                    // 检查是否可以合并
                    if (currentRow > 0 && 
                        this.grid[currentRow - 1][col] !== null &&
                        this.grid[currentRow - 1][col].value === this.grid[currentRow][col].value &&
                        !this.grid[currentRow - 1][col].merged) {
                        
                        // 合并方块
                        const newValue = this.grid[currentRow][col].value * 2;
                        this.grid[currentRow - 1][col].value = newValue;
                        this.grid[currentRow - 1][col].merged = true;
                        this.grid[currentRow][col] = null;
                        
                        // 更新分数
                        this.score += newValue;
                        if (this.score > this.bestScore) {
                            this.bestScore = this.score;
                        }
                        
                        // 检查是否解锁诗词字符
                        this.checkPoemUnlock(newValue);
                        
                        moved = true;
                    }
                }
            }
        }
        
        return moved;
    }
    
    moveDown() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
            // 从倒数第二行开始向下移动
            for (let row = this.gridSize - 2; row >= 0; row--) {
                if (this.grid[row][col] !== null) {
                    let currentRow = row;
                    
                    // 向下移动直到遇到障碍
                    while (currentRow < this.gridSize - 1 && this.grid[currentRow + 1][col] === null) {
                        this.grid[currentRow + 1][col] = this.grid[currentRow][col];
                        this.grid[currentRow][col] = null;
                        currentRow++;
                        moved = true;
                    }
                    
                    // 检查是否可以合并
                    if (currentRow < this.gridSize - 1 && 
                        this.grid[currentRow + 1][col] !== null &&
                        this.grid[currentRow + 1][col].value === this.grid[currentRow][col].value &&
                        !this.grid[currentRow + 1][col].merged) {
                        
                        // 合并方块
                        const newValue = this.grid[currentRow][col].value * 2;
                        this.grid[currentRow + 1][col].value = newValue;
                        this.grid[currentRow + 1][col].merged = true;
                        this.grid[currentRow][col] = null;
                        
                        // 更新分数
                        this.score += newValue;
                        if (this.score > this.bestScore) {
                            this.bestScore = this.score;
                        }
                        
                        // 检查是否解锁诗词字符
                        this.checkPoemUnlock(newValue);
                        
                        moved = true;
                    }
                }
            }
        }
        
        return moved;
    }
    
    moveLeft() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            // 从第二列开始向左移动
            for (let col = 1; col < this.gridSize; col++) {
                if (this.grid[row][col] !== null) {
                    let currentCol = col;
                    
                    // 向左移动直到遇到障碍
                    while (currentCol > 0 && this.grid[row][currentCol - 1] === null) {
                        this.grid[row][currentCol - 1] = this.grid[row][currentCol];
                        this.grid[row][currentCol] = null;
                        currentCol--;
                        moved = true;
                    }
                    
                    // 检查是否可以合并
                    if (currentCol > 0 && 
                        this.grid[row][currentCol - 1] !== null &&
                        this.grid[row][currentCol - 1].value === this.grid[row][currentCol].value &&
                        !this.grid[row][currentCol - 1].merged) {
                        
                        // 合并方块
                        const newValue = this.grid[row][currentCol].value * 2;
                        this.grid[row][currentCol - 1].value = newValue;
                        this.grid[row][currentCol - 1].merged = true;
                        this.grid[row][currentCol] = null;
                        
                        // 更新分数
                        this.score += newValue;
                        if (this.score > this.bestScore) {
                            this.bestScore = this.score;
                        }
                        
                        // 检查是否解锁诗词字符
                        this.checkPoemUnlock(newValue);
                        
                        moved = true;
                    }
                }
            }
        }
        
        return moved;
    }
    
    moveRight() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
            // 从倒数第二列开始向右移动
            for (let col = this.gridSize - 2; col >= 0; col--) {
                if (this.grid[row][col] !== null) {
                    let currentCol = col;
                    
                    // 向右移动直到遇到障碍
                    while (currentCol < this.gridSize - 1 && this.grid[row][currentCol + 1] === null) {
                        this.grid[row][currentCol + 1] = this.grid[row][currentCol];
                        this.grid[row][currentCol] = null;
                        currentCol++;
                        moved = true;
                    }
                    
                    // 检查是否可以合并
                    if (currentCol < this.gridSize - 1 && 
                        this.grid[row][currentCol + 1] !== null &&
                        this.grid[row][currentCol + 1].value === this.grid[row][currentCol].value &&
                        !this.grid[row][currentCol + 1].merged) {
                        
                        // 合并方块
                        const newValue = this.grid[row][currentCol].value * 2;
                        this.grid[row][currentCol + 1].value = newValue;
                        this.grid[row][currentCol + 1].merged = true;
                        this.grid[row][currentCol] = null;
                        
                        // 更新分数
                        this.score += newValue;
                        if (this.score > this.bestScore) {
                            this.bestScore = this.score;
                        }
                        
                        // 检查是否解锁诗词字符
                        this.checkPoemUnlock(newValue);
                        
                        moved = true;
                    }
                }
            }
        }
        
        return moved;
    }
    
    checkPoemUnlock(value) {
        // 根据合成数值解锁诗词字符
        const unlockThresholds = [64, 128, 256, 512, 1024, 2048, 4096];
        
        for (let i = 0; i < unlockThresholds.length; i++) {
            if (value === unlockThresholds[i] && this.unlockedChars < this.totalChars) {
                this.unlockedChars++;
                this.currentPoem.unlocked[this.unlockedChars - 1] = true;
                this.updatePoemDisplay();
                this.playSound('unlock');
                
                // 显示解锁提示
                this.showUnlockMessage(this.currentPoem.chars[this.unlockedChars - 1]);
                break;
            }
        }
    }
    
    showUnlockMessage(char) {
        // 创建解锁消息
        const message = document.createElement('div');
        message.className = 'unlock-message';
        message.innerHTML = `
            <div class="unlock-icon">🎉</div>
            <div class="unlock-text">解锁新字符: <span class="unlock-char">${char}</span></div>
        `;
        
        document.body.appendChild(message);
        
        // 动画
        setTimeout(() => {
            message.classList.add('show');
        }, 10);
        
        // 移除
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 3000);
    }
    
    updatePoemDisplay() {
        const poemDisplay = document.getElementById('poemDisplay');
        const poemProgress = document.getElementById('poemProgress');
        
        if (!this.currentPoem) return;
        
        // 更新诗词显示
        const poemLine = poemDisplay.querySelector('.poem-line');
        const poemContent = poemDisplay.querySelector('.poem-content');
        
        poemLine.textContent = `${this.currentPoem.title} · ${this.currentPoem.author}`;
        
        // 更新字符显示
        poemContent.innerHTML = '';
        for (let i = 0; i < this.totalChars; i++) {
            const charSpan = document.createElement('span');
            charSpan.className = `poem-char ${this.currentPoem.unlocked[i] ? 'unlocked' : 'locked'}`;
            charSpan.textContent = this.currentPoem.chars[i];
            poemContent.appendChild(charSpan);
        }
        
        // 更新进度
        poemProgress.textContent = `${this.unlockedChars}/${this.totalChars}`;
    }
    
    cloneGrid() {
        // 深度复制网格状态
        const clonedGrid = [];
        for (let row = 0; row < this.gridSize; row++) {
            clonedGrid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    clonedGrid[row][col] = {
                        value: this.grid[row][col].value,
                        row: this.grid[row][col].row,
                        col: this.grid[row][col].col,
                        merged: this.grid[row][col].merged
                    };
                } else {
                    clonedGrid[row][col] = null;
                }
            }
        }
        return clonedGrid;
    }
    
    saveMoveHistory(oldGrid) {
        // 保存移动历史（用于撤销）
        if (!this.moveHistory) {
            this.moveHistory = [];
        }
        
        this.moveHistory.push({
            grid: oldGrid,
            score: this.score - this.getLastMoveScore(oldGrid),
            moves: this.moves - 1
        });
        
        // 限制历史记录数量
        if (this.moveHistory.length > 10) {
            this.moveHistory.shift();
        }
        
        // 更新撤销按钮状态
        document.getElementById('undoBtn').disabled = this.moveHistory.length === 0;
    }
    
    getLastMoveScore(oldGrid) {
        // 计算上次移动的得分
        let oldScore = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (oldGrid[row][col]) {
                    oldScore += oldGrid[row][col].value;
                }
            }
        }
        
        let currentScore = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    currentScore += this.grid[row][col].value;
                }
            }
        }
        
        return currentScore - oldScore;
    }
    
    undoMove() {
        if (!this.moveHistory || this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        this.grid = lastMove.grid;
        this.score = lastMove.score;
        this.moves = lastMove.moves;
        
        // 重新渲染网格
        this.renderGrid();
        this.updateDisplay();
        
        this.playSound('undo');
    }
    
    renderGrid() {
        // 清除所有方块
        const gridElement = document.getElementById('gameGrid');
        const tiles = gridElement.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // 重新创建方块
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    this.createTileElement(row, col, this.grid[row][col].value);
                }
            }
        }
    }
    
    updateDisplay() {
        // 更新分数显示
        document.getElementById('currentScore').textContent = this.score.toLocaleString();
        document.getElementById('bestScore').textContent = this.bestScore.toLocaleString();
        
        // 更新移动次数
        document.getElementById('moveCount').textContent = this.moves;
        
        // 更新目标数字
        const maxTile = this.getMaxTile();
        document.getElementById('targetNumber').textContent = this.getNextTarget(maxTile);
        
        // 更新数字提示
        this.updateNumberHint();
        
        // 重置合并状态
        this.resetMergedState();
    }
    
    getMaxTile() {
        let max = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] && this.grid[row][col].value > max) {
                    max = this.grid[row][col].value;
                }
            }
        }
        return max;
    }
    
    getNextTarget(currentMax) {
        // 计算下一个目标数字
        const targets = [64, 128, 256, 512, 1024, 2048, 4096, 8192];
        for (const target of targets) {
            if (currentMax < target) {
                return target;
            }
        }
        return 8192;
    }
    
    updateNumberHint() {
        // 更新下一个数字提示
        const hintNumbers = document.querySelectorAll('.hint-number');
        const nextNumbers = this.predictNextNumbers();
        
        hintNumbers.forEach((hint, index) => {
            if (nextNumbers[index]) {
                hint.textContent = nextNumbers[index];
                hint.dataset.value = nextNumbers[index];
                
                // 根据数值设置样式
                const value = nextNumbers[index];
                hint.style.background = this.getTileColor(value);
                hint.style.color = this.getTileTextColor(value);
            }
        });
    }
    
    predictNextNumbers() {
        // 预测接下来可能出现的数字
        const probabilities = [
            { value: 2, weight: 90 },
            { value: 4, weight: 9 },
            { value: 8, weight: 1 }
        ];
        
        // 根据概率分布生成预测
        const results = [];
        let totalWeight = probabilities.reduce((sum, p) => sum + p.weight, 0);
        
        for (let i = 0; i < 3; i++) {
            let random = Math.random() * totalWeight;
            let cumulative = 0;
            
            for (const prob of probabilities) {
                cumulative += prob.weight;
                if (random <= cumulative) {
                    results.push(prob.value);
                    break;
                }
            }
        }
        
        return results;
    }
    
    getTileColor(value) {
        // 根据数值返回对应的颜色
        const colors = {
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e',
            4096: '#3c3a32'
        };
        
        return colors[value] || '#3c3a32';
    }
    
    getTileTextColor(value) {
        // 根据数值返回对应的文字颜色
        return value <= 4 ? '#776e65' : '#f9f6f2';
    }
    
    resetMergedState() {
        // 重置所有方块的合并状态
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col].merged = false;
                }
            }
        }
    }
    
    checkGameState() {
        // 检查游戏是否胜利
        const maxTile = this.getMaxTile();
        if (maxTile >= 2048 && this.gameState === 'playing') {
            this.gameVictory();
            return;
        }
        
        // 检查游戏是否结束
        if (!this.hasValidMoves()) {
            this.gameOver();
            return;
        }
    }
    
    hasValidMoves() {
        // 检查是否还有有效移动
        // 1. 检查是否有空单元格
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === null) {
                    return true;
                }
            }
        }
        
        // 2. 检查是否有可以合并的相邻方块
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const current = this.grid[row][col];
                if (!current) continue;
                
                // 检查右侧
                if (col < this.gridSize - 1) {
                    const right = this.grid[row][col + 1];
                    if (right && right.value === current.value) {
                        return true;
                    }
                }
                
                // 检查下方
                if (row < this.gridSize - 1) {
                    const down = this.grid[row + 1][col];
                    if (down && down.value === current.value) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    gameVictory() {
        this.gameState = 'victory';
        this.stopTimer();
        this.saveGameData();
        
        // 显示胜利界面
        this.showGameOverScreen(true);
        this.playSound('victory');
        
        // 保存成就
        this.saveAchievement('first_2048');
    }
    
    gameOver() {
        this.gameState = 'gameover';
        this.stopTimer();
        this.saveGameData();
        
        // 显示游戏结束界面
        this.showGameOverScreen(false);
        this.playSound('gameover');
    }
    
    showGameOverScreen(isVictory) {
        const gameoverScreen = document.getElementById('gameover-screen');
        const gameoverIcon = document.getElementById('gameoverIcon');
        const gameoverTitle = document.getElementById('gameoverTitle');
        const gameoverMessage = document.getElementById('gameoverMessage');
        const finalScore = document.getElementById('finalScore');
        const finalMoves = document.getElementById('finalMoves');
        const finalTime = document.getElementById('finalTime');
        const finalMaxNumber = document.getElementById('finalMaxNumber');
        const gameoverPoem = document.getElementById('gameoverPoem');
        
        // 设置内容
        if (isVictory) {
            gameoverIcon.textContent = '🎉';
            gameoverTitle.textContent = '游戏胜利！';
            gameoverMessage.textContent = '恭喜你达成了2048目标！';
        } else {
            gameoverIcon.textContent = '😢';
            gameoverTitle.textContent = '游戏结束';
            gameoverMessage.textContent = '没有可移动的方块了';
        }
        
        // 设置统计数据
        finalScore.textContent = this.score.toLocaleString();
        finalMoves.textContent = this.moves;
        finalTime.textContent = this.formatTime(this.gameTime);
        finalMaxNumber.textContent = this.getMaxTile().toLocaleString();
        
        // 设置诗词解锁信息
        if (this.unlockedChars > 0) {
            const unlockedText = this.currentPoem.chars
                .slice(0, this.unlockedChars)
                .join('');
            
            gameoverPoem.innerHTML = `
                <div class="poem-unlocked">
                    <h4><i class="poem-icon">🎁</i> 解锁进度</h4>
                    <div class="unlocked-poem-content">
                        "${unlockedText}..."
                    </div>
                    <div class="poem-progress">
                        已解锁 ${this.unlockedChars}/${this.totalChars} 个字符
                    </div>
                </div>
            `;
            gameoverPoem.style.display = 'block';
        } else {
            gameoverPoem.style.display = 'none';
        }
        
        // 显示界面
        document.querySelectorAll('.screen.active').forEach(screen => {
            screen.classList.remove('active');
        });
        gameoverScreen.classList.add('active');
        
        // 设置按钮事件
        document.getElementById('playAgainBtn').onclick = () => {
            this.restartGame();
            gameoverScreen.classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
        };
        
        document.getElementById('shareScoreBtn').onclick = () => {
            this.shareScore();
        };
        
        document.getElementById('backToMenuBtn').onclick = () => {
            gameoverScreen.classList.remove('active');
            this.showMenu();
        };
    }
    
    shareScore() {
        const shareText = `我在《数字华容道·诗词版》中获得了${this.score}分！\n` +
                         `移动次数: ${this.moves}次\n` +
                         `游戏时间: ${this.formatTime(this.gameTime)}\n` +
                         `最大数字: ${this.getMaxTile()}\n` +
                         `诗词解锁: ${this.unlockedChars}/${this.totalChars}\n` +
                         `快来挑战吧！`;
        
        if (navigator.share) {
            navigator.share({
                title: '数字华容道·诗词版 - 我的成绩',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    alert('成绩已复制到剪贴板，可以分享给朋友了！');
                })
                .catch(() => {
                    prompt('请复制以下文本分享给朋友：', shareText);
                });
        }
    }
    
    startTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            this.gameTime++;
            document.getElementById('gameTime').textContent = this.formatTime(this.gameTime);
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    restartGame() {
        this.stopTimer();
        this.grid = [];
        this.score = 0;
        this.moves = 0;
        this.gameTime = 0;
        this.gameState = 'playing';
        this.moveHistory = [];
        this.unlockedChars = 1; // 保留第一个已解锁的字符
        this.currentPoem.unlocked.fill(false);
        this.currentPoem.unlocked[0] = true;
        
        this.generateGrid();
        this.addInitialTiles();
        this.updateDisplay();
        this.updatePoemDisplay();
        this.startTimer();
        
        document.getElementById('undoBtn').disabled = true;
        
        this.playSound('restart');
    }
    
    showMenu() {
        const menuScreen = document.getElementById('menu-screen');
        
        // 更新菜单中的数据
        document.getElementById('menuBestScore').textContent = this.bestScore.toLocaleString();
        document.getElementById('totalGames').textContent = this.getTotalGames();
        document.getElementById('poemsCollected').textContent = this.getPoemsCollected();
        document.getElementById('totalPlayTime').textContent = this.getTotalPlayTime();
        
        // 显示菜单
        document.querySelectorAll('.screen.active').forEach(screen => {
            screen.classList.remove('active');
        });
        menuScreen.classList.add('active');
        
        // 设置菜单按钮事件
        document.getElementById('closeMenuBtn').onclick = 
        document.getElementById('continueBtn').onclick = () => {
            menuScreen.classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
        };
        
        document.getElementById('newGameBtn').onclick = () => {
            this.restartGame();
            menuScreen.classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
        };
        
        document.getElementById('achievementsBtn').onclick = () => {
            this.showAchievements();
        };
        
        document.getElementById('aboutBtn').onclick = () => {
            this.showAbout();
        };
        
        // 设置游戏模式选择
        document.querySelectorAll('.menu-option').forEach(option => {
            option.onclick = () => {
                document.querySelectorAll('.menu-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                this.currentMode = option.dataset.mode;
                this.saveGameData();
            };
        });
        
        // 设置网格大小选择
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.onclick = () => {
                if (btn.classList.contains('active')) return;
                
                document.querySelectorAll('.size-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                
                this.gridSize = parseInt(btn.dataset.size);
                this.saveGameData();
                this.restartGame();
            };
        });
        
        // 设置难度选择
        document.getElementById('difficultySelect').onchange = (e) => {
            // 这里可以添加难度调整逻辑
            console.log('难度更改为:', e.target.value);
        };
        
        // 设置动画开关
        document.getElementById('animationToggle').onchange = (e) => {
            // 这里可以添加动画开关逻辑
            const enableAnimations = e.target.checked;
            document.documentElement.style.setProperty('--animation-speed', enableAnimations ? '0.3s' : '0s');
        };
    }
    
    showAchievements() {
        // 显示成就界面（简化版）
        alert('成就系统开发中...\n\n已解锁成就：\n✅ 首次游戏\n✅ 达到100分\n✅ 解锁第一个诗词字符');
    }
    
    showAbout() {
        const aboutScreen = document.getElementById('about-screen');
        
        document.querySelectorAll('.screen.active').forEach(screen => {
            screen.classList.remove('active');
        });
        aboutScreen.classList.add('active');
        
        // 设置关于页面按钮事件
        document.getElementById('closeAboutBtn').onclick = 
        document.getElementById('closeAboutActionBtn').onclick = () => {
            aboutScreen.classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
        };
        
        document.getElementById('viewSourceBtn').onclick = () => {
            window.open('https://github.com/qq156701660/taptap-game', '_blank');
        };
        
        document.getElementById('reportIssueBtn').onclick = () => {
            window.open('https://github.com/qq156701660/taptap-game/issues', '_blank');
        };
    }
    
    toggleSound() {
        const soundBtn = document.getElementById('soundBtn');
        const isActive = soundBtn.classList.contains('active');
        
        if (isActive) {
            soundBtn.classList.remove('active');
            soundBtn.innerHTML = '<span>🔇</span> 音效';
            this.soundEnabled = false;
        } else {
            soundBtn.classList.add('active');
            soundBtn.innerHTML = '<span>🔊</span> 音效';
            this.soundEnabled = true;
            this.playSound('click');
        }
        
        localStorage.setItem('poem2048_sound_enabled', this.soundEnabled);
    }
    
    showHint() {
        if (this.gameState !== 'playing') return;
        
        // 寻找最佳移动方向
        const bestMove = this.findBestMove();
        if (bestMove) {
            // 高亮显示建议方向
            const directionBtn = document.getElementById(`${bestMove}Btn`);
            if (directionBtn) {
                directionBtn.classList.add('hint-highlight');
                setTimeout(() => {
                    directionBtn.classList.remove('hint-highlight');
                }, 1000);
            }
            
            this.playSound('hint');
        } else {
            this.playSound('error');
        }
    }
    
    findBestMove() {
        // 简单的AI提示：寻找能产生最大合并的移动
        const directions = ['up', 'down', 'left', 'right'];
        let bestDirection = null;
        let bestScore = -1;
        
        for (const direction of directions) {
            const testGrid = this.cloneGrid();
            let testScore = 0;
            let moved = false;
            
            // 模拟移动
            // 这里简化处理，实际需要完整的移动模拟
            if (direction === 'up' || direction === 'down') {
                // 检查垂直方向是否有合并可能
                for (let col = 0; col < this.gridSize; col++) {
                    for (let row = 0; row < this.gridSize - 1; row++) {
                        const current = testGrid[row][col];
                        const next = testGrid[row + 1][col];
                        if (current && next && current.value === next.value) {
                            testScore += current.value * 2;
                            moved = true;
                        }
                    }
                }
            } else {
                // 检查水平方向
                for (let row = 0; row < this.gridSize; row++) {
                    for (let col = 0; col < this.gridSize - 1; col++) {
                        const current = testGrid[row][col];
                        const next = testGrid[row][col + 1];
                        if (current && next && current.value === next.value) {
                            testScore += current.value * 2;
                            moved = true;
                        }
                    }
                }
            }
            
            if (moved && testScore > bestScore) {
                bestScore = testScore;
                bestDirection = direction;
            }
        }
        
        return bestDirection;
    }
    
    shareGame() {
        const shareData = {
            title: '数字华容道·诗词版',
            text: `我正在玩《数字华容道·诗词版》，融合2048数字合成与中国诗词文化的益智游戏！\n` +
                  `当前分数：${this.score}分\n` +
                  `诗词解锁：${this.unlockedChars}/${this.totalChars}\n` +
                  `快来一起挑战吧！`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => console.log('分享成功'))
                .catch(error => console.log('分享取消:', error));
        } else {
            // 复制到剪贴板
            navigator.clipboard.writeText(shareData.text + '\n' + shareData.url)
                .then(() => {
                    alert('游戏链接已复制到剪贴板，可以分享给朋友了！');
                })
                .catch(() => {
                    prompt('请复制以下文本分享给朋友：', shareData.text + '\n' + shareData.url);
                });
        }
    }
    
    playSound(soundType) {
        if (!this.soundEnabled) return;
        
        // 创建音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 设置音效参数
        let frequency = 440;
        let duration = 0.1;
        
        switch(soundType) {
            case 'move':
                frequency = 523.25; // C5
                break;
            case 'merge':
                frequency = 659.25; // E5
                duration = 0.2;
                break;
            case 'unlock':
                frequency = 783.99; // G5
                duration = 0.3;
                break;
            case 'victory':
                frequency = 1046.50; // C6
                duration = 0.5;
                break;
            case 'gameover':
                frequency = 349.23; // F4
                duration = 0.4;
                break;
            case 'click':
                frequency = 392.00; // G4
                break;
            case 'hint':
                frequency = 587.33; // D5
                break;
            case 'undo':
                frequency = 493.88; // B4
                break;
            case 'restart':
                frequency = 523.25; // C5
                duration = 0.15;
                break;
            case 'error':
                frequency = 311.13; // D#4
                break;
        }
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    getTotalGames() {
        const total = localStorage.getItem('poem2048_total_games') || '0';
        return parseInt(total).toLocaleString();
    }
    
    getPoemsCollected() {
        const poems = localStorage.getItem('poem2048_poems_collected') || '0';
        return `${poems}/50`;
    }
    
    getTotalPlayTime() {
        const time = localStorage.getItem('poem2048_total_play_time') || '0';
        const hours = Math.floor(parseInt(time) / 3600);
        return `${hours}h`;
    }
    
    saveAchievement(achievementId) {
        // 保存成就
        const achievements = JSON.parse(localStorage.getItem('poem2048_achievements') || '{}');
        achievements[achievementId] = true;
        localStorage.setItem('poem2048_achievements', JSON.stringify(achievements));
        
        // 更新游戏统计
        const totalGames = parseInt(localStorage.getItem('poem2048_total_games') || '0') + 1;
        localStorage.setItem('poem2048_total_games', totalGames.toString());
        
        const totalTime = parseInt(localStorage.getItem('poem2048_total_play_time') || '0') + this.gameTime;
        localStorage.setItem('poem2048_total_play_time', totalTime.toString());
        
        // 如果解锁了所有字符，记录诗词收集
        if (this.unlockedChars === this.totalChars) {
            const poemsCollected = parseInt(localStorage.getItem('poem2048_poems_collected') || '0') + 1;
            localStorage.setItem('poem2048_poems_collected', poemsCollected.toString());
        }
    }
}

// 初始化游戏
let game;

document.addEventListener('DOMContentLoaded', () => {
    // 等待加载完成
    setTimeout(() => {
        game = new Poem2048Game();
        console.log('《数字华容道·诗词版》游戏已启动！');
        
        // 注册Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker 注册成功:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker 注册失败:', error);
                });
        }
    }, 1000);
});

// 导出游戏实例供其他模块使用
window.Poem2048Game = Poem2048Game;