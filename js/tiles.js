// 《数字华容道·诗词版》 - 方块管理系统
// 版本: v1.0.0

class TileManager {
    constructor(game, gridSystem) {
        this.game = game;
        this.gridSystem = gridSystem;
        this.tiles = new Map(); // 使用Map存储方块引用
        this.init();
    }
    
    init() {
        console.log('方块管理系统初始化');
    }
    
    createTile(row, col, value) {
        const tileId = `${row}-${col}`;
        
        // 如果已存在方块，先移除
        if (this.tiles.has(tileId)) {
            this.removeTile(row, col);
        }
        
        // 创建方块元素
        const tileElement = document.createElement('div');
        tileElement.className = `tile tile-${value}`;
        tileElement.id = `tile-${tileId}`;
        tileElement.dataset.row = row;
        tileElement.dataset.col = col;
        tileElement.dataset.value = value;
        tileElement.textContent = value;
        
        // 设置初始位置
        this.gridSystem.updateTilePosition(tileElement, row, col);
        
        // 添加到网格
        document.getElementById('gameGrid').appendChild(tileElement);
        
        // 存储引用
        this.tiles.set(tileId, {
            element: tileElement,
            row: row,
            col: col,
            value: value,
            merged: false,
            new: true
        });
        
        // 添加新方块动画
        tileElement.classList.add('new-tile');
        setTimeout(() => {
            tileElement.classList.remove('new-tile');
        }, 300);
        
        return tileElement;
    }
    
    moveTile(fromRow, fromCol, toRow, toCol) {
        const fromId = `${fromRow}-${fromCol}`;
        const toId = `${toRow}-${toCol}`;
        
        if (!this.tiles.has(fromId)) {
            console.warn(`尝试移动不存在的方块: ${fromId}`);
            return false;
        }
        
        const tile = this.tiles.get(fromId);
        
        // 更新位置
        tile.row = toRow;
        tile.col = toCol;
        
        // 更新元素属性
        tile.element.dataset.row = toRow;
        tile.element.dataset.col = toCol;
        tile.element.id = `tile-${toId}`;
        
        // 动画移动
        this.gridSystem.animateTileMove(tile.element, fromRow, fromCol, toRow, toCol);
        
        // 更新存储
        this.tiles.delete(fromId);
        this.tiles.set(toId, tile);
        
        return true;
    }
    
    mergeTiles(sourceRow, sourceCol, targetRow, targetCol) {
        const sourceId = `${sourceRow}-${sourceCol}`;
        const targetId = `${targetRow}-${targetCol}`;
        
        if (!this.tiles.has(sourceId) || !this.tiles.has(targetId)) {
            console.warn(`尝试合并不存在的方块: ${sourceId} -> ${targetId}`);
            return false;
        }
        
        const sourceTile = this.tiles.get(sourceId);
        const targetTile = this.tiles.get(targetId);
        
        // 检查是否可以合并
        if (sourceTile.value !== targetTile.value) {
            console.warn(`方块值不匹配: ${sourceTile.value} != ${targetTile.value}`);
            return false;
        }
        
        if (targetTile.merged) {
            console.warn('目标方块已合并');
            return false;
        }
        
        // 计算新值
        const newValue = sourceTile.value * 2;
        
        // 更新目标方块
        targetTile.value = newValue;
        targetTile.merged = true;
        targetTile.element.textContent = newValue;
        targetTile.element.className = `tile tile-${newValue}`;
        targetTile.element.dataset.value = newValue;
        
        // 添加合并动画
        this.gridSystem.animateTileMerge(targetTile.element, newValue);
        
        // 移除源方块
        this.removeTile(sourceRow, sourceCol);
        
        // 检查是否解锁诗词字符
        this.checkPoemUnlock(newValue);
        
        return newValue;
    }
    
    removeTile(row, col) {
        const tileId = `${row}-${col}`;
        
        if (this.tiles.has(tileId)) {
            const tile = this.tiles.get(tileId);
            
            // 动画移除
            this.gridSystem.removeTile(tile.element);
            
            // 从存储中移除
            this.tiles.delete(tileId);
            
            return true;
        }
        
        return false;
    }
    
    checkPoemUnlock(value) {
        // 委托给游戏主逻辑处理
        if (this.game && this.game.checkPoemUnlock) {
            this.game.checkPoemUnlock(value);
        }
    }
    
    updateTileValue(row, col, newValue) {
        const tileId = `${row}-${col}`;
        
        if (this.tiles.has(tileId)) {
            const tile = this.tiles.get(tileId);
            tile.value = newValue;
            tile.element.textContent = newValue;
            tile.element.className = `tile tile-${newValue}`;
            tile.element.dataset.value = newValue;
            
            // 添加更新动画
            tile.element.classList.add('merged-tile');
            setTimeout(() => {
                tile.element.classList.remove('merged-tile');
            }, 300);
            
            return true;
        }
        
        return false;
    }
    
    getTile(row, col) {
        const tileId = `${row}-${col}`;
        return this.tiles.get(tileId) || null;
    }
    
    getAllTiles() {
        return Array.from(this.tiles.values());
    }
    
    getTileCount() {
        return this.tiles.size;
    }
    
    clearAllTiles() {
        // 移除所有方块元素
        this.getAllTiles().forEach(tile => {
            if (tile.element.parentNode) {
                tile.element.parentNode.removeChild(tile.element);
            }
        });
        
        // 清空存储
        this.tiles.clear();
    }
    
    highlightTile(row, col, duration = 1000) {
        const tile = this.getTile(row, col);
        if (tile) {
            const originalBoxShadow = tile.element.style.boxShadow;
            tile.element.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
            tile.element.style.zIndex = '10';
            
            setTimeout(() => {
                tile.element.style.boxShadow = originalBoxShadow;
                tile.element.style.zIndex = '1';
            }, duration);
        }
    }
    
    pulseTile(row, col) {
        const tile = this.getTile(row, col);
        if (tile) {
            tile.element.style.animation = 'pulseScale 0.5s ease';
            
            setTimeout(() => {
                tile.element.style.animation = '';
            }, 500);
        }
    }
    
    getMaxTileValue() {
        let maxValue = 0;
        this.getAllTiles().forEach(tile => {
            if (tile.value > maxValue) {
                maxValue = tile.value;
            }
        });
        return maxValue;
    }
    
    getTileSum() {
        let sum = 0;
        this.getAllTiles().forEach(tile => {
            sum += tile.value;
        });
        return sum;
    }
    
    getEmptyCells() {
        const emptyCells = [];
        const gridSize = this.game.gridSize;
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (!this.getTile(row, col)) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        return emptyCells;
    }
    
    hasEmptyCells() {
        return this.getEmptyCells().length > 0;
    }
    
    canMerge() {
        const gridSize = this.game.gridSize;
        
        // 检查水平方向
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize - 1; col++) {
                const tile1 = this.getTile(row, col);
                const tile2 = this.getTile(row, col + 1);
                
                if (tile1 && tile2 && tile1.value === tile2.value) {
                    return true;
                }
            }
        }
        
        // 检查垂直方向
        for (let col = 0; col < gridSize; col++) {
            for (let row = 0; row < gridSize - 1; row++) {
                const tile1 = this.getTile(row, col);
                const tile2 = this.getTile(row + 1, col);
                
                if (tile1 && tile2 && tile1.value === tile2.value) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    isGameOver() {
        return !this.hasEmptyCells() && !this.canMerge();
    }
    
    suggestBestMove() {
        // 分析当前局面，建议最佳移动方向
        const directions = ['up', 'down', 'left', 'right'];
        const scores = {};
        
        // 这里可以添加更复杂的AI算法
        // 目前使用简单启发式：优先向空单元格多的方向移动
        
        directions.forEach(direction => {
            let score = 0;
            const emptyCells = this.getEmptyCells();
            
            // 简单评分：空单元格数量
            score += emptyCells.length * 10;
            
            // 奖励能产生合并的移动
            if (this.canMergeInDirection(direction)) {
                score += 50;
            }
            
            scores[direction] = score;
        });
        
        // 返回最高分的移动方向
        let bestDirection = null;
        let bestScore = -1;
        
        for (const [direction, score] of Object.entries(scores)) {
            if (score > bestScore) {
                bestScore = score;
                bestDirection = direction;
            }
        }
        
        return bestDirection;
    }
    
    canMergeInDirection(direction) {
        // 检查指定方向是否有合并可能
        const gridSize = this.game.gridSize;
        
        switch(direction) {
            case 'up':
                for (let col = 0; col < gridSize; col++) {
                    for (let row = 0; row < gridSize - 1; row++) {
                        const tile1 = this.getTile(row, col);
                        const tile2 = this.getTile(row + 1, col);
                        if (tile1 && tile2 && tile1.value === tile2.value) {
                            return true;
                        }
                    }
                }
                break;
                
            case 'down':
                for (let col = 0; col < gridSize; col++) {
                    for (let row = gridSize - 1; row > 0; row--) {
                        const tile1 = this.getTile(row, col);
                        const tile2 = this.getTile(row - 1, col);
                        if (tile1 && tile2 && tile1.value === tile2.value) {
                            return true;
                        }
                    }
                }
                break;
                
            case 'left':
                for (let row = 0; row < gridSize; row++) {
                    for (let col = 0; col < gridSize - 1; col++) {
                        const tile1 = this.getTile(row, col);
                        const tile2 = this.getTile(row, col + 1);
                        if (tile1 && tile2 && tile1.value === tile2.value) {
                            return true;
                        }
                    }
                }
                break;
                
            case 'right':
                for (let row = 0; row < gridSize; row++) {
                    for (let col = gridSize - 1; col > 0; col--) {
                        const tile1 = this.getTile(row, col);
                        const tile2 = this.getTile(row, col - 1);
                        if (tile1 && tile2 && tile1.value === tile2.value) {
                            return true;
                        }
                    }
                }
                break;
        }
        
        return false;
    }
    
    exportState() {
        // 导出当前方块状态
        const state = [];
        this.getAllTiles().forEach(tile => {
            state.push({
                row: tile.row,
                col: tile.col,
                value: tile.value,
                merged: tile.merged
            });
        });
        return state;
    }
    
    importState(state) {
        // 导入方块状态
        this.clearAllTiles();
        
        state.forEach(tileData => {
            this.createTile(tileData.row, tileData.col, tileData.value);
            const tile = this.getTile(tileData.row, tileData.col);
            if (tile) {
                tile.merged = tileData.merged || false;
            }
        });
    }
}

// 导出方块管理器
window.TileManager = TileManager;