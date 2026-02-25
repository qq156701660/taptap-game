// 《数字华容道·诗词版》 - 关卡和诗词系统
// 版本: v1.0.0

class LevelSystem {
    constructor(game) {
        this.game = game;
        this.levels = [];
        this.poems = [];
        this.currentLevel = 1;
        this.currentPoemIndex = 0;
        this.unlockedLevels = new Set([1]);
        this.completedLevels = new Set();
        
        this.init();
    }
    
    init() {
        this.loadLevels();
        this.loadPoems();
        this.loadProgress();
    }
    
    loadLevels() {
        // 定义游戏关卡
        this.levels = [
            {
                id: 1,
                name: '初识数字',
                description: '学习基本数字合成',
                gridSize: 4,
                targetScore: 256,
                targetTile: 64,
                timeLimit: null,
                moveLimit: null,
                difficulty: 'easy',
                rewards: {
                    score: 100,
                    poemFragment: true
                },
                tutorial: '将相同数字的方块移动到一起，它们会合并成更大的数字！'
            },
            {
                id: 2,
                name: '诗词入门',
                description: '解锁第一个诗词字符',
                gridSize: 4,
                targetScore: 512,
                targetTile: 128,
                timeLimit: null,
                moveLimit: 50,
                difficulty: 'easy',
                rewards: {
                    score: 200,
                    poemFragment: true
                },
                tutorial: '合成数字64可以解锁诗词的第一个字符'
            },
            {
                id: 3,
                name: '速度挑战',
                description: '在限定时间内完成目标',
                gridSize: 4,
                targetScore: 1024,
                targetTile: 256,
                timeLimit: 180, // 3分钟
                moveLimit: null,
                difficulty: 'normal',
                rewards: {
                    score: 500,
                    poemFragment: true
                },
                tutorial: '注意时间！要在3分钟内达成目标'
            },
            {
                id: 4,
                name: '精准移动',
                description: '用最少的步数完成',
                gridSize: 4,
                targetScore: 2048,
                targetTile: 512,
                timeLimit: null,
                moveLimit: 30,
                difficulty: 'normal',
                rewards: {
                    score: 1000,
                    poemFragment: true
                },
                tutorial: '每一步都要精打细算，最多只能移动30次'
            },
            {
                id: 5,
                name: '扩大战场',
                description: '5×5网格挑战',
                gridSize: 5,
                targetScore: 2048,
                targetTile: 1024,
                timeLimit: null,
                moveLimit: null,
                difficulty: 'hard',
                rewards: {
                    score: 2000,
                    poemFragment: true
                },
                tutorial: '更大的网格意味着更多的机会和挑战'
            },
            {
                id: 6,
                name: '终极挑战',
                description: '6×6网格大师级',
                gridSize: 6,
                targetScore: 4096,
                targetTile: 2048,
                timeLimit: 300, // 5分钟
                moveLimit: 50,
                difficulty: 'expert',
                rewards: {
                    score: 5000,
                    poemFragment: true,
                    specialReward: true
                },
                tutorial: '这是最难的挑战，需要完美的策略和运气'
            }
        ];
    }
    
    loadPoems() {
        // 定义诗词库
        this.poems = [
            {
                id: 1,
                title: '静夜思',
                author: '李白',
                dynasty: '唐',
                content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
                characters: ['床', '前', '明', '月', '光', '疑', '是', '地', '上', '霜'],
                description: '这首诗歌表达了诗人在寂静的月夜思念家乡的感受。',
                difficulty: 'easy',
                unlockThresholds: [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768]
            },
            {
                id: 2,
                title: '春晓',
                author: '孟浩然',
                dynasty: '唐',
                content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
                characters: ['春', '眠', '不', '觉', '晓', '处', '处', '闻', '啼', '鸟'],
                description: '描绘春天早晨的景色，表达对大自然的热爱。',
                difficulty: 'easy',
                unlockThresholds: [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]
            },
            {
                id: 3,
                title: '登鹳雀楼',
                author: '王之涣',
                dynasty: '唐',
                content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
                characters: ['白', '日', '依', '山', '尽', '黄', '河', '入', '海', '流'],
                description: '通过登高望远的描写，表达了积极向上的精神。',
                difficulty: 'normal',
                unlockThresholds: [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072]
            },
            {
                id: 4,
                title: '江雪',
                author: '柳宗元',
                dynasty: '唐',
                content: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。',
                characters: ['千', '山', '鸟', '飞', '绝', '万', '径', '人', '踪', '灭'],
                description: '描绘冬日江雪的寂静景色，意境深远。',
                difficulty: 'normal',
                unlockThresholds: [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144]
            },
            {
                id: 5,
                title: '将进酒',
                author: '李白',
                dynasty: '唐',
                content: '君不见黄河之水天上来，奔流到海不复回。',
                characters: ['君', '不', '见', '黄', '河', '之', '水', '天', '上', '来'],
                description: '李白豪放诗风的代表作，表达了对人生的豁达态度。',
                difficulty: 'hard',
                unlockThresholds: [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288]
            },
            {
                id: 6,
                title: '水调歌头',
                author: '苏轼',
                dynasty: '宋',
                content: '明月几时有，把酒问青天。不知天上宫阙，今夕是何年。',
                characters: ['明', '月', '几', '时', '有', '把', '酒', '问', '青', '天'],
                description: '中秋望月怀人之作，表达了对人生的深刻思考。',
                difficulty: 'expert',
                unlockThresholds: [2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576]
            }
        ];
        
        // 设置当前诗词
        this.currentPoemIndex = 0;
    }
    
    loadProgress() {
        // 从本地存储加载进度
        try {
            const savedProgress = localStorage.getItem('poem2048_level_progress');
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                this.currentLevel = progress.currentLevel || 1;
                this.currentPoemIndex = progress.currentPoemIndex || 0;
                this.unlockedLevels = new Set(progress.unlockedLevels || [1]);
                this.completedLevels = new Set(progress.completedLevels || []);
                
                // 加载诗词进度
                if (progress.poemProgress) {
                    this.poems.forEach((poem, index) => {
                        if (progress.poemProgress[poem.id]) {
                            poem.unlockedChars = progress.poemProgress[poem.id].unlockedChars || 0;
                            poem.completed = progress.poemProgress[poem.id].completed || false;
                        }
                    });
                }
            }
        } catch (error) {
            console.error('加载关卡进度失败:', error);
        }
    }
    
    saveProgress() {
        // 保存进度到本地存储
        const progress = {
            currentLevel: this.currentLevel,
            currentPoemIndex: this.currentPoemIndex,
            unlockedLevels: Array.from(this.unlockedLevels),
            completedLevels: Array.from(this.completedLevels),
            poemProgress: {},
            lastSaved: new Date().toISOString()
        };
        
        // 保存诗词进度
        this.poems.forEach(poem => {
            progress.poemProgress[poem.id] = {
                unlockedChars: poem.unlockedChars || 0,
                completed: poem.completed || false
            };
        });
        
        localStorage.setItem('poem2048_level_progress', JSON.stringify(progress));
    }
    
    getCurrentLevel() {
        return this.levels.find(level => level.id === this.currentLevel) || this.levels[0];
    }
    
    getCurrentPoem() {
        return this.poems[this.currentPoemIndex] || this.poems[0];
    }
    
    setLevel(levelId) {
        if (this.unlockedLevels.has(levelId)) {
            this.currentLevel = levelId;
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    setPoem(poemIndex) {
        if (poemIndex >= 0 && poemIndex < this.poems.length) {
            this.currentPoemIndex = poemIndex;
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    completeLevel(score, moves, time, maxTile) {
        const level = this.getCurrentLevel();
        const completed = this.checkLevelCompletion(score, moves, time, maxTile);
        
        if (completed) {
            // 标记为完成
            this.completedLevels.add(this.currentLevel);
            
            // 解锁下一关
            const nextLevelId = this.currentLevel + 1;
            if (nextLevelId <= this.levels.length) {
                this.unlockedLevels.add(nextLevelId);
            }
            
            // 发放奖励
            this.giveLevelRewards(level);
            
            // 保存进度
            this.saveProgress();
            
            // 显示完成界面
            this.showLevelComplete(level, score, moves, time, maxTile);
            
            return true;
        }
        
        return false;
    }
    
    checkLevelCompletion(score, moves, time, maxTile) {
        const level = this.getCurrentLevel();
        
        // 检查分数目标
        if (level.targetScore && score < level.targetScore) {
            return false;
        }
        
        // 检查方块目标
        if (level.targetTile && maxTile < level.targetTile) {
            return false;
        }
        
        // 检查时间限制
        if (level.timeLimit && time > level.timeLimit) {
            return false;
        }
        
        // 检查移动限制
        if (level.moveLimit && moves > level.moveLimit) {
            return false;
        }
        
        return true;
    }
    
    giveLevelRewards(level) {
        // 发放关卡奖励
        const rewards = level.rewards || {};
        
        // 分数奖励
        if (rewards.score && this.game.scoreSystem) {
            this.game.scoreSystem.addScore(rewards.score, 'level');
        }
        
        // 诗词碎片奖励
        if (rewards.poemFragment) {
            this.unlockPoemCharacter();
        }
        
        // 特殊奖励
        if (rewards.specialReward) {
            this.giveSpecialReward();
        }
    }
    
    unlockPoemCharacter() {
        const poem = this.getCurrentPoem();
        
        if (!poem.unlockedChars) {
            poem.unlockedChars = 0;
        }
        
        if (poem.unlockedChars < poem.characters.length) {
            poem.unlockedChars++;
            
            // 检查是否完成整首诗词
            if (poem.unlockedChars === poem.characters.length) {
                poem.completed = true;
                this.completePoem(poem);
                
                // 解锁下一首诗词
                const nextPoemIndex = this.currentPoemIndex + 1;
                if (nextPoemIndex < this.poems.length) {
                    // 可以在这里解锁下一首诗词
                }
            }
            
            // 更新游戏中的诗词显示
            if (this.game && this.game.updatePoemDisplay) {
                this.game.updatePoemDisplay();
            }
            
            // 显示解锁提示
            this.showCharacterUnlock(poem.characters[poem.unlockedChars - 1]);
            
            this.saveProgress();
            return true;
        }
        
        return false;
    }
    
    completePoem(poem) {
        // 诗词完成奖励
        if (this.game && this.game.scoreSystem) {
            this.game.scoreSystem.recordPoemCompleted();
            this.game.scoreSystem.addScore(1000, 'poem');
        }
        
        // 显示诗词完成界面
        this.showPoemComplete(poem);
    }
    
    giveSpecialReward() {
        // 发放特殊奖励
        if (this.game && this.game.scoreSystem) {
            // 解锁特殊成就
            if (!this.game.scoreSystem.achievements.has('level_master')) {
                this.game.scoreSystem.achievements.add('level_master');
                this.game.scoreSystem.showAchievementUnlock({
                    id: 'level_master',
                    name: '关卡大师',
                    description: '完成所有关卡'
                });
            }
        }
    }
    
    showLevelComplete(level, score, moves, time, maxTile) {
        // 创建关卡完成界面
        const levelComplete = document.createElement('div');
        levelComplete.className = 'level-complete-overlay';
        levelComplete.innerHTML = `
            <div class="level-complete-container">
                <div class="level-complete-header">
                    <div class="level-complete-icon">🏆</div>
                    <h2>关卡完成！</h2>
                    <div class="level-name">${level.name}</div>
                </div>
                
                <div class="level-stats">
                    <div class="stat-row">
                        <span class="stat-label">得分</span>
                        <span class="stat-value">${score.toLocaleString()}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">移动次数</span>
                        <span class="stat-value">${moves}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">用时</span>
                        <span class="stat-value">${this.formatTime(time)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">最大数字</span>
                        <span class="stat-value">${maxTile.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="level-rewards">
                    <h3>获得奖励</h3>
                    <div class="rewards-list">
                        <div class="reward-item">
                            <span class="reward-icon">⭐</span>
                            <span class="reward-text">${level.rewards.score} 分数</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-icon">📜</span>
                            <span class="reward-text">诗词碎片 x1</span>
                        </div>
                        ${level.rewards.specialReward ? `
                        <div class="reward-item">
                            <span class="reward-icon">🎁</span>
                            <span class="reward-text">特殊奖励</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="level-actions">
                    <button class="level-action-btn continue-btn">继续游戏</button>
                    <button class="level-action-btn next-level-btn">下一关</button>
                    <button class="level-action-btn menu-btn">返回菜单</button>
                </div>
            </div>
        `;
        
        // 样式
        levelComplete.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(levelComplete);
        
        // 添加按钮事件
        levelComplete.querySelector('.continue-btn').onclick = () => {
            document.body.removeChild(levelComplete);
        };
        
        levelComplete.querySelector('.next-level-btn').onclick = () => {
            const nextLevel = this.currentLevel + 1;
            if (this.setLevel(nextLevel)) {
                this.game.restartGame();
            }
            document.body.removeChild(levelComplete);
        };
        
        levelComplete.querySelector('.menu-btn').onclick = () => {
            document.body.removeChild(levelComplete);
            this.game.showMenu();
        };
        
        // 添加音效
        if (this.game && this.game.playSound) {
            this.game.playSound('victory');
        }
    }
    
    showCharacterUnlock(character) {
        // 显示字符解锁提示
        const unlock