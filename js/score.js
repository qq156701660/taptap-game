// 《数字华容道·诗词版》 - 分数和成就系统
// 版本: v1.0.0

class ScoreSystem {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.bestScore = 0;
        this.combo = 0;
        this.multiplier = 1;
        this.achievements = new Set();
        this.stats = {
            totalGames: 0,
            totalMoves: 0,
            totalTime: 0,
            totalScore: 0,
            maxCombo: 0,
            poemsCompleted: 0,
            tilesCreated: 0,
            tilesMerged: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.setupScoreDisplay();
    }
    
    loadFromStorage() {
        // 从本地存储加载数据
        try {
            const savedData = localStorage.getItem('poem2048_score_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.bestScore = data.bestScore || 0;
                this.stats = data.stats || this.stats;
                this.achievements = new Set(data.achievements || []);
            }
        } catch (error) {
            console.error('加载分数数据失败:', error);
        }
    }
    
    saveToStorage() {
        // 保存数据到本地存储
        const data = {
            bestScore: this.bestScore,
            stats: this.stats,
            achievements: Array.from(this.achievements),
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('poem2048_score_data', JSON.stringify(data));
    }
    
    setupScoreDisplay() {
        // 初始化分数显示
        this.updateScoreDisplay();
        
        // 创建分数动画容器
        const scoreContainer = document.querySelector('.score-display');
        if (scoreContainer) {
            this.scoreAnimationContainer = document.createElement('div');
            this.scoreAnimationContainer.className = 'score-animation-container';
            this.scoreAnimationContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 100;
                overflow: hidden;
            `;
            scoreContainer.appendChild(this.scoreAnimationContainer);
        }
    }
    
    addScore(points, source = 'merge') {
        // 计算实际得分（考虑连击和倍数）
        const actualPoints = Math.floor(points * this.multiplier);
        const oldScore = this.score;
        this.score += actualPoints;
        
        // 更新最高分
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
        }
        
        // 更新统计
        this.stats.totalScore += actualPoints;
        
        // 更新显示
        this.updateScoreDisplay();
        
        // 显示得分动画
        this.showScoreAnimation(actualPoints, source);
        
        // 检查连击
        this.updateCombo(source);
        
        // 检查成就
        this.checkAchievements();
        
        // 自动保存
        this.saveToStorage();
        
        return actualPoints;
    }
    
    updateCombo(source) {
        if (source === 'merge') {
            this.combo++;
            this.multiplier = 1 + (this.combo * 0.1); // 每连击增加10%倍数
            
            // 更新最大连击记录
            if (this.combo > this.stats.maxCombo) {
                this.stats.maxCombo = this.combo;
            }
            
            // 显示连击提示
            if (this.combo >= 3) {
                this.showComboMessage();
            }
        } else {
            // 非合并操作重置连击
            this.resetCombo();
        }
    }
    
    resetCombo() {
        this.combo = 0;
        this.multiplier = 1;
    }
    
    showScoreAnimation(points, source) {
        if (!this.scoreAnimationContainer) return;
        
        const animation = document.createElement('div');
        animation.className = 'score-animation';
        animation.textContent = `+${points}`;
        
        // 根据得分来源设置样式
        let color = '#4CAF50';
        let size = '1.2rem';
        
        switch(source) {
            case 'merge':
                color = '#4CAF50';
                size = '1.4rem';
                break;
            case 'combo':
                color = '#FF9800';
                size = '1.6rem';
                break;
            case 'achievement':
                color = '#9C27B0';
                size = '1.8rem';
                break;
            case 'poem':
                color = '#2196F3';
                size = '1.5rem';
                break;
        }
        
        animation.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: ${size};
            font-weight: bold;
            color: ${color};
            opacity: 0;
            animation: scoreFloat 1s ease forwards;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            z-index: 101;
        `;
        
        this.scoreAnimationContainer.appendChild(animation);
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (animation.parentNode) {
                animation.parentNode.removeChild(animation);
            }
        }, 1000);
        
        // 添加动画样式
        if (!document.querySelector('#score-animation-style')) {
            const style = document.createElement('style');
            style.id = 'score-animation-style';
            style.textContent = `
                @keyframes scoreFloat {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0;
                    }
                    20% {
                        transform: translate(-50%, -100%) scale(1);
                        opacity: 1;
                    }
                    80% {
                        transform: translate(-50%, -150%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -200%) scale(0.5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showComboMessage() {
        const messages = [
            `连击 x${this.combo}!`,
            `太棒了! x${this.combo}`,
            `完美连击! x${this.combo}`,
            `不可思议! x${this.combo}`,
            `大师级操作! x${this.combo}`
        ];
        
        const message = messages[Math.min(this.combo - 3, messages.length - 1)];
        
        const comboMessage = document.createElement('div');
        comboMessage.className = 'combo-message';
        comboMessage.textContent = message;
        comboMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            font-weight: bold;
            color: #FF9800;
            background: rgba(0, 0, 0, 0.7);
            padding: 20px 40px;
            border-radius: 20px;
            border: 3px solid #FF9800;
            z-index: 200;
            opacity: 0;
            animation: comboPop 1s ease forwards;
            text-shadow: 0 2px 10px rgba(255, 152, 0, 0.5);
        `;
        
        document.body.appendChild(comboMessage);
        
        // 动画结束后移除
        setTimeout(() => {
            comboMessage.style.animation = 'comboFadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (comboMessage.parentNode) {
                    comboMessage.parentNode.removeChild(comboMessage);
                }
            }, 500);
        }, 1000);
        
        // 添加动画样式
        if (!document.querySelector('#combo-animation-style')) {
            const style = document.createElement('style');
            style.id = 'combo-animation-style';
            style.textContent = `
                @keyframes comboPop {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.2);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes comboFadeOut {
                    0% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    updateScoreDisplay() {
        // 更新分数显示
        const currentScoreEl = document.getElementById('currentScore');
        const bestScoreEl = document.getElementById('bestScore');
        
        if (currentScoreEl) {
            currentScoreEl.textContent = this.score.toLocaleString();
            
            // 添加分数更新动画
            currentScoreEl.classList.add('score-updated');
            setTimeout(() => {
                currentScoreEl.classList.remove('score-updated');
            }, 300);
        }
        
        if (bestScoreEl) {
            bestScoreEl.textContent = this.bestScore.toLocaleString();
        }
        
        // 更新连击显示（如果有）
        this.updateComboDisplay();
    }
    
    updateComboDisplay() {
        let comboDisplay = document.getElementById('comboDisplay');
        
        if (this.combo >= 2) {
            if (!comboDisplay) {
                comboDisplay = document.createElement('div');
                comboDisplay.id = 'comboDisplay';
                comboDisplay.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 152, 0, 0.9);
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: bold;
                    z-index: 10;
                `;
                document.querySelector('.score-display').appendChild(comboDisplay);
            }
            
            comboDisplay.textContent = `连击 x${this.combo} (${this.multiplier.toFixed(1)}×)`;
            comboDisplay.style.display = 'block';
        } else if (comboDisplay) {
            comboDisplay.style.display = 'none';
        }
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        // 分数相关成就
        if (this.score >= 1000 && !this.achievements.has('score_1000')) {
            this.achievements.add('score_1000');
            newAchievements.push({ id: 'score_1000', name: '千分达人', description: '获得1000分' });
        }
        
        if (this.score >= 5000 && !this.achievements.has('score_5000')) {
            this.achievements.add('score_5000');
            newAchievements.push({ id: 'score_5000', name: '五千分大师', description: '获得5000分' });
        }
        
        if (this.score >= 10000 && !this.achievements.has('score_10000')) {
            this.achievements.add('score_10000');
            newAchievements.push({ id: 'score_10000', name: '万分传奇', description: '获得10000分' });
        }
        
        // 连击成就
        if (this.combo >= 5 && !this.achievements.has('combo_5')) {
            this.achievements.add('combo_5');
            newAchievements.push({ id: 'combo_5', name: '连击高手', description: '达成5连击' });
        }
        
        if (this.combo >= 10 && !this.achievements.has('combo_10')) {
            this.achievements.add('combo_10');
            newAchievements.push({ id: 'combo_10', name: '连击大师', description: '达成10连击' });
        }
        
        // 显示新成就
        newAchievements.forEach(achievement => {
            this.showAchievementUnlock(achievement);
        });
        
        return newAchievements;
    }
    
    showAchievementUnlock(achievement) {
        const achievementMessage = document.createElement('div');
        achievementMessage.className = 'achievement-unlock';
        achievementMessage.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">成就解锁!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        
        achievementMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
            color: white;
            padding: 15px;
            border-radius: 15px;
            border: 3px solid #FFD700;
            z-index: 300;
            min-width: 250px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            animation: achievementSlideIn 0.5s ease forwards, achievementSlideOut 0.5s ease 3s forwards;
        `;
        
        document.body.appendChild(achievementMessage);
        
        // 添加音效
        this.game.playSound('achievement');
        
        // 动画结束后移除
        setTimeout(() => {
            if (achievementMessage.parentNode) {
                achievementMessage.parentNode.removeChild(achievementMessage);
            }
        }, 3500);
        
        // 添加动画样式
        if (!document.querySelector('#achievement-animation-style')) {
            const style = document.createElement('style');
            style.id = 'achievement-animation-style';
            style.textContent = `
                @keyframes achievementSlideIn {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(0); }
                }
                
                @keyframes achievementSlideOut {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
                
                .achievement-icon {
                    font-size: 2.5rem;
                    text-align: center;
                    margin-bottom: 10px;
                    animation: trophySpin 1s ease;
                }
                
                .achievement-title {
                    font-size: 1rem;
                    opacity: 0.9;
                    margin-bottom: 5px;
                }
                
                .achievement-name {
                    font-size: 1.3rem;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .achievement-desc {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                
                @keyframes trophySpin {
                    0% { transform: rotate(0deg) scale(0); }
                    50% { transform: rotate(180deg) scale(1.2); }
                    100% { transform: rotate(360deg) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    recordGameStart() {
        this.stats.totalGames++;
        this.saveToStorage();
    }
    
    recordGameEnd(gameTime, moves, maxTile) {
        this.stats.totalTime += gameTime;
        this.stats.totalMoves += moves;
        
        // 记录最大方块
        if (maxTile > (this.stats.maxTile || 0)) {
            this.stats.maxTile = maxTile;
        }
        
        this.saveToStorage();
    }
    
    recordTileCreated() {
        this.stats.tilesCreated++;
    }
    
    recordTileMerged() {
        this.stats.tilesMerged++;
    }
    
    recordPoemCompleted() {
        this.stats.poemsCompleted++;
        
        // 解锁诗词完成成就
        if (!this.achievements.has('poem_complete')) {
            this.achievements.add('poem_complete');
            this.showAchievementUnlock({
                id: 'poem_complete',
                name: '诗词达人',
                description: '完成一首诗词'
            });
        }
    }
    
    getStats() {
        return {
            ...this.stats,
            averageScore: this.stats.totalGames > 0 ? Math.floor(this.stats.totalScore / this.stats.totalGames) : 0,
            averageMoves: this.stats.totalGames > 0 ? Math.floor(this.stats.totalMoves / this.stats.totalGames) : 0,
            averageTime: this.stats.totalGames > 0 ? Math.floor(this.stats.totalTime / this.stats.totalGames) : 0,
            achievements: this.achievements.size
        };
    }
    
    resetGame() {
        this.score = 0;
        this.combo = 0;
        this.multiplier = 1;
        this.updateScoreDisplay();
    }
    
    exportData() {
        return {
            score: this.score,
            bestScore: this.bestScore,
            stats: this.stats,
            achievements: Array.from(this.achievements)
        };
    }
    
    importData(data) {
        if (data.score !== undefined) this.score = data.score;
        if (data.bestScore !== undefined) this.bestScore = data.bestScore;
        if (data.stats) this.stats = data.stats;
        if (data.achievements) this.achievements = new Set(data.achievements);
        
        this.updateScoreDisplay();
        this.saveToStorage();
    }
}

// 导出分数系统
window.ScoreSystem = ScoreSystem;