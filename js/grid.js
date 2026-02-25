// 《数字华容道·诗词版》 - 网格系统
// 版本: v1.0.0

class GridSystem {
    constructor(game) {
        this.game = game;
        this.cellSize = 100;
        this.cellGap = 10;
        this.init();
    }
    
    init() {
        this.updateGridSize();
        this.setupGridStyles();
    }
    
    updateGridSize() {
        // 根据屏幕大小调整网格尺寸
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // 计算合适的单元格大小
        const maxGridWidth = Math.min(500, screenWidth - 40);
        const availableHeight = screenHeight - 300; // 减去头部、诗词区、控制区
        
        this.cellSize = Math.min(
            Math.floor((maxGridWidth - (this.game.gridSize + 1) * this.cellGap) / this.game.gridSize),
            Math.floor((availableHeight - (this.game.gridSize + 1) * this.cellGap) / this.game.gridSize)
        );
        
        // 确保最小单元格大小
        this.cellSize = Math.max(60, this.cellSize);
    }
    
    setupGridStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .game-grid {
                gap: ${this.cellGap}px !important;
            }
            
            .grid-cell {
                width: ${this.cellSize}px;
                height: ${this.cellSize}px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.15s ease;
            }
            
            .grid-cell:hover {
                background: rgba(255, 255, 255, 0.08);
            }
            
            .tile {
                position: absolute;
                width: ${this.cellSize}px;
                height: ${this.cellSize}px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${this.getTileFontSize()}px;
                font-weight: bold;
                border-radius: 8px;
                transition: all 0.15s ease;
                z-index: 1;
                user-select: none;
            }
            
            .tile.new-tile {
                animation: popIn 0.3s ease;
            }
            
            .tile.merged-tile {
                animation: popScale 0.3s ease;
            }
            
            .tile-2 { background: #eee4da; color: #776e65; }
            .tile-4 { background: #ede0c8; color: #776e65; }
            .tile-8 { background: #f2b179; color: #f9f6f2; }
            .tile-16 { background: #f59563; color: #f9f6f2; }
            .tile-32 { background: #f67c5f; color: #f9f6f2; }
            .tile-64 { background: #f65e3b; color: #f9f6f2; }
            .tile-128 { background: #edcf72; color: #f9f6f2; font-size: ${this.getTileFontSize() * 0.85}px; }
            .tile-256 { background: #edcc61; color: #f9f6f2; font-size: ${this.getTileFontSize() * 0.85}px; }
            .tile-512 { background: #edc850; color: #f9f6f2; font-size: ${this.getTileFontSize() * 0.85}px; }
            .tile-1024 { background: #edc53f; color: #f9f6f2; font-size: ${this.getTileFontSize() * 0.7}px; }
            .tile-2048 { background: #edc22e; color: #f9f6f2; font-size: ${this.getTileFontSize() * 0.7}px; }
            .tile-4096 { background: #3c3a32; color: #f9f6f2; font-size: ${this.getTileFontSize() * 0.7}px; }
            .tile-8192 { background: #1c1b19; color: #f9f6f2; font-size: ${this.getTileFontSize() * 0.7}px; }
            
            .hint-highlight {
                animation: pulseHighlight 1s ease;
                box-shadow: 0 0 20px #4CAF50 !important;
            }
            
            .unlock-message {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.8);
                background: rgba(33, 150, 243, 0.95);
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                padding: 25px;
                text-align: center;
                z-index: 100;
                opacity: 0;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                min-width: 250px;
            }
            
            .unlock-message.show {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            .unlock-icon {
                font-size: 3rem;
                margin-bottom: 15px;
                animation: bounce 0.5s ease infinite;
            }
            
            .unlock-text {
                font-size: 1.2rem;
                color: white;
                margin-bottom: 10px;
            }
            
            .unlock-char {
                font-size: 2rem;
                font-weight: bold;
                color: #ffd700;
                font-family: 'Ma Shan Zheng', cursive;
                display: inline-block;
                animation: float 2s ease-in-out infinite;
            }
            
            @keyframes popIn {
                0% { transform: scale(0); opacity: 0; }
                70% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes popScale {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            @keyframes pulseHighlight {
                0%, 100% { box-shadow: 0 0 0 rgba(76, 175, 80, 0); }
                50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    getTileFontSize() {
        // 根据单元格大小计算字体大小
        if (this.cellSize <= 70) return 24;
        if (this.cellSize <= 90) return 28;
        if (this.cellSize <= 110) return 32;
        return 36;
    }
    
    updateTilePosition(tileElement, row, col) {
        // 更新方块位置
        const x = col * (this.cellSize + this.cellGap);
        const y = row * (this.cellSize + this.cellGap);
        
        tileElement.style.transform = `translate(${x}px, ${y}px)`;
    }
    
    animateTileMove(tileElement, fromRow, fromCol, toRow, toCol) {
        // 动画移动方块
        const fromX = fromCol * (this.cellSize + this.cellGap);
        const fromY = fromRow * (this.cellSize + this.cellGap);
        const toX = toCol * (this.cellSize + this.cellGap);
        const toY = toRow * (this.cellSize + this.cellGap);
        
        tileElement.style.transition = 'transform 0.15s ease';
        tileElement.style.transform = `translate(${toX}px, ${toY}px)`;
        
        // 动画完成后重置过渡
        setTimeout(() => {
            tileElement.style.transition = '';
        }, 150);
    }
    
    animateTileMerge(tileElement, newValue) {
        // 动画合并效果
        tileElement.classList.add('merged-tile');
        tileElement.textContent = newValue;
        tileElement.className = `tile tile-${newValue} merged-tile`;
        
        setTimeout(() => {
            tileElement.classList.remove('merged-tile');
        }, 300);
    }
    
    removeTile(tileElement) {
        // 移除方块（用于合并）
        tileElement.style.opacity = '0';
        tileElement.style.transform += ' scale(0)';
        
        setTimeout(() => {
            if (tileElement.parentNode) {
                tileElement.parentNode.removeChild(tileElement);
            }
        }, 150);
    }
    
    highlightCell(row, col) {
        // 高亮显示单元格
        const cell = this.getCellElement(row, col);
        if (cell) {
            cell.style.background = 'rgba(76, 175, 80, 0.3)';
            cell.style.boxShadow = 'inset 0 0 10px rgba(76, 175, 80, 0.5)';
            
            setTimeout(() => {
                cell.style.background = '';
                cell.style.boxShadow = '';
            }, 500);
        }
    }
    
    getCellElement(row, col) {
        // 获取单元格元素
        return document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
    }
    
    shakeGrid() {
        // 震动网格效果（用于错误操作）
        const grid = document.getElementById('gameGrid');
        grid.style.animation = 'shake 0.5s ease';
        
        setTimeout(() => {
            grid.style.animation = '';
        }, 500);
    }
    
    celebrateVictory() {
        // 胜利庆祝效果
        this.createConfetti();
        this.pulseGrid();
    }
    
    createConfetti() {
        // 创建五彩纸屑效果
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 2px;
                top: -20px;
                left: ${Math.random() * 100}%;
                animation: fall ${1 + Math.random() * 2}s linear forwards;
                z-index: 1000;
            `;
            
            document.getElementById('gameGrid').appendChild(confetti);
            
            // 移除动画完成后的元素
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }
        
        // 添加下落动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            document.head.removeChild(style);
        }, 3000);
    }
    
    pulseGrid() {
        // 网格脉动效果
        const grid = document.getElementById('gameGrid');
        grid.style.animation = 'pulse 1s ease 3';
        
        setTimeout(() => {
            grid.style.animation = '';
        }, 3000);
    }
}

// 导出网格系统
window.GridSystem = GridSystem;