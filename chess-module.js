/**
 * 国际象棋训练模块 - 多邻国风格交互式训练
 * 通过简单对战场景学习棋子走法和技巧
 * 心系统 + 连击 + 渐进难度
 */
(function () {
    'use strict';

    var CHILD_NAME = '王孟原';

    // 棋子 emoji
    var PIECE_EMOJI = {
        'K': 'KING', 'Q': 'QUEEN', 'R': 'ROOK', 'B': 'BISHOP',
        'N': 'KNIGHT', 'P': 'PAWN'
    };

    var PIECE_NAME = {
        'K': '国王', 'Q': '皇后', 'R': '车', 'B': '象',
        'N': '马', 'P': '兵'
    };

    var PIECE_CN = {
        'K': '王', 'Q': '后', 'R': '车', 'B': '象',
        'N': '马', 'P': '兵'
    };

    // 训练场景
    var SCENARIOS = [
        // === 入门: 认识棋子走法 ===
        {
            id: 's1', difficulty: 1, hearts: 3,
            title: '认识国王',
            instruction: '国王可以朝任意方向走1格。点击国王能走到的格子！',
            piece: 'K', pieceColor: 'white', piecePos: [3, 3],
            targets: [[2,2],[2,3],[2,4],[3,2],[3,4],[4,2],[4,3],[4,4]],
            boardSize: 6,
            hint: '国王走一步，周围8个格子都可以',
            lesson: '国王是最重要的棋子，每次只能走1格'
        },
        {
            id: 's2', difficulty: 1, hearts: 3,
            title: '认识车',
            instruction: '车只能走直线（横或竖）。点击车能走到的格子！',
            piece: 'R', pieceColor: 'white', piecePos: [2, 2],
            targets: [[0,2],[1,2],[3,2],[4,2],[5,2],[2,0],[2,1],[2,3],[2,4],[2,5]],
            boardSize: 6,
            hint: '车走直线，横着竖着都行',
            lesson: '车是直行者，横竖任意格'
        },
        {
            id: 's3', difficulty: 1, hearts: 3,
            title: '认识象',
            instruction: '象只能走斜线。点击象能走到的格子！',
            piece: 'B', pieceColor: 'white', piecePos: [2, 2],
            targets: [[0,0],[1,1],[3,3],[4,4],[5,5],[0,4],[1,3],[3,1],[4,0]],
            boardSize: 6,
            hint: '象走对角线，同色格子上移动',
            lesson: '象是斜行者，只走对角线'
        },
        {
            id: 's4', difficulty: 2, hearts: 3,
            title: '认识马',
            instruction: '马走"日"字（L形：先走2格再转1格）。点击马能走到的格子！',
            piece: 'N', pieceColor: 'white', piecePos: [3, 3],
            targets: [[1,2],[1,4],[2,1],[2,5],[4,1],[4,5],[5,2],[5,4]],
            boardSize: 6,
            hint: '马走日字：2格+1格的L形',
            lesson: '马是唯一能跳过其他棋子的棋子'
        },
        {
            id: 's5', difficulty: 2, hearts: 3,
            title: '认识皇后',
            instruction: '皇后是最强的棋子，可以走任意方向的直线或斜线。点击皇后能走到的格子！',
            piece: 'Q', pieceColor: 'white', piecePos: [3, 3],
            targets: [[0,0],[1,1],[2,2],[4,4],[5,5],[0,3],[1,3],[2,3],[4,3],[5,3],
                      [3,0],[3,1],[3,2],[3,4],[3,5],[0,6],[1,5],[2,4],[4,2],[5,1]],
            boardSize: 6,
            hint: '皇后 = 车 + 象，什么方向都能走',
            lesson: '皇后是最强棋子，横竖斜都可以'
        },
        {
            id: 's6', difficulty: 1, hearts: 3,
            title: '认识兵',
            instruction: '兵只能向前走1格。点击白兵能走到的格子！',
            piece: 'P', pieceColor: 'white', piecePos: [4, 2],
            targets: [[3,2]],
            boardSize: 6,
            hint: '兵只能向前走1格（第一步可走2格）',
            lesson: '兵向前走，斜着吃子'
        },

        // === 进阶: 实战吃子 ===
        {
            id: 's7', difficulty: 2, hearts: 3,
            title: '用车吃兵',
            instruction: '用车吃掉对方的兵！点击兵所在的位置',
            piece: 'R', pieceColor: 'white', piecePos: [2, 3],
            targets: [[4, 3]],
            boardSize: 6,
            enemyPieces: [{ type: 'P', color: 'black', pos: [4, 3] }],
            hint: '车走直线，直接走到兵的位置就吃掉了',
            lesson: '吃子 = 走到对方棋子的格子上'
        },
        {
            id: 's8', difficulty: 2, hearts: 3,
            title: '用象吃兵',
            instruction: '用象斜着走，吃掉对方的兵！',
            piece: 'B', pieceColor: 'white', piecePos: [1, 1],
            targets: [[4, 4]],
            boardSize: 6,
            enemyPieces: [{ type: 'P', color: 'black', pos: [4, 4] }],
            hint: '象走斜线，(1,1)到(4,4)正好在对角线上',
            lesson: '象走斜线吃子'
        },
        {
            id: 's9', difficulty: 3, hearts: 3,
            title: '用马吃兵',
            instruction: '马跳日字，吃掉对方的兵！点击兵的位置',
            piece: 'N', pieceColor: 'white', piecePos: [2, 2],
            targets: [[4, 3]],
            boardSize: 6,
            enemyPieces: [{ type: 'P', color: 'black', pos: [4, 3] }],
            hint: '从(2,2)走L形到(4,3)：先走2格再转1格',
            lesson: '马跳日字吃子，可以跳过其他棋子'
        },
        {
            id: 's10', difficulty: 3, hearts: 3,
            title: '皇后吃子',
            instruction: '皇后可以走任意方向！吃掉对方的兵',
            piece: 'Q', pieceColor: 'white', piecePos: [2, 2],
            targets: [[5, 5]],
            boardSize: 6,
            enemyPieces: [{ type: 'P', color: 'black', pos: [5, 5] }],
            hint: '皇后走斜线，(2,2)到(5,5)是对角线',
            lesson: '皇后走斜线吃子'
        },

        // === 高级: 战术训练 ===
        {
            id: 's11', difficulty: 3, hearts: 3,
            title: '将军！',
            instruction: '用车走到能攻击国王的位置！点击正确的格子',
            piece: 'R', pieceColor: 'white', piecePos: [0, 0],
            targets: [[0, 4]],
            boardSize: 6,
            enemyPieces: [{ type: 'K', color: 'black', pos: [4, 4] }],
            hint: '车走直线到国王同一行或同一列',
            lesson: '将军 = 攻击对方的国王'
        },
        {
            id: 's12', difficulty: 3, hearts: 3,
            title: '双兵前进',
            instruction: '兵只能向前走。点击白兵能走到的格子',
            piece: 'P', pieceColor: 'white', piecePos: [3, 2],
            targets: [[2, 2]],
            boardSize: 6,
            enemyPieces: [{ type: 'P', color: 'black', pos: [1, 3] }],
            hint: '白兵向上走1格',
            lesson: '兵永远只能向前走'
        },
        {
            id: 's13', difficulty: 2, hearts: 3,
            title: '马的跳跃',
            instruction: '马可以跳过其他棋子！点击马能走到的格子',
            piece: 'N', pieceColor: 'white', piecePos: [2, 2],
            targets: [[0,1],[0,3],[1,0],[1,4],[3,0],[3,4],[4,1],[4,3]],
            boardSize: 5,
            enemyPieces: [
                { type: 'P', color: 'black', pos: [2, 3] },
                { type: 'P', color: 'black', pos: [3, 2] }
            ],
            hint: '马不受阻挡，可以跳过去',
            lesson: '马是唯一能跳跃的棋子'
        },
        {
            id: 's14', difficulty: 3, hearts: 3,
            title: '保护国王',
            instruction: '国王走到安全的位置！点击国王能走到的安全格子',
            piece: 'K', pieceColor: 'white', piecePos: [3, 3],
            targets: [[2,2],[2,4],[4,2],[4,4]],
            boardSize: 6,
            enemyPieces: [{ type: 'R', color: 'black', pos: [0, 3] }],
            hint: '车在第3列，避开第3列的格子',
            lesson: '国王要避开对方攻击的格子'
        },
        {
            id: 's15', difficulty: 3, hearts: 3,
            title: '将军！',
            instruction: '用象走到能攻击国王的位置！点击正确的格子',
            piece: 'B', pieceColor: 'white', piecePos: [1, 1],
            targets: [[3, 3]],
            boardSize: 5,
            enemyPieces: [{ type: 'K', color: 'black', pos: [4, 4] }],
            hint: '象走斜线，(1,1)到(3,3)在国王的对角线上',
            lesson: '象可以沿斜线将军'
        }
    ];

    // ===== Chess State =====
    var chessState = {
        scenarioIdx: 0,
        hearts: 3,
        streak: 0,
        correctCount: 0,
        totalScenarios: 0,
        currentScenario: null,
        completed: false
    };

    // ===== Get Daily Chess Training =====
    function getDailyChessTraining() {
        var d = new Date();
        var dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
        // 每天选5个场景, 从不同难度中选
        var startIdx = (dayOfYear * 5) % SCENARIOS.length;
        var scenarios = [];
        for (var i = 0; i < 5; i++) {
            scenarios.push(SCENARIOS[(startIdx + i) % SCENARIOS.length]);
        }
        return scenarios;
    }

    // ===== Render Chess Training =====
    function renderChessTraining(container, onComplete) {
        var scenarios = getDailyChessTraining();
        chessState.scenarioIdx = 0;
        chessState.hearts = 3;
        chessState.streak = 0;
        chessState.correctCount = 0;
        chessState.totalScenarios = scenarios.length;
        chessState.completed = false;

        renderChessScenario(container, scenarios, onComplete);
    }

    function renderChessScenario(container, scenarios, onComplete) {
        if (chessState.scenarioIdx >= scenarios.length || chessState.hearts <= 0) {
            // Training complete or failed
            renderChessResult(container, onComplete);
            return;
        }

        var scenario = scenarios[chessState.scenarioIdx];
        chessState.currentScenario = scenario;

        var boardSize = scenario.boardSize || 6;
        var boardHtml = '';
        for (var row = 0; row < boardSize; row++) {
            for (var col = 0; col < boardSize; col++) {
                var isLight = (row + col) % 2 === 0;
                var cellClass = 'chess-cell ' + (isLight ? 'light' : 'dark');
                var content = '';
                var isPiece = false;
                var isEnemy = false;

                if (scenario.piecePos[0] === row && scenario.piecePos[1] === col) {
                    content = '<span class="chess-piece ' + scenario.pieceColor + '">' + PIECE_EMOJI[scenario.piece] + '</span>';
                    isPiece = true;
                }

                if (scenario.enemyPieces) {
                    scenario.enemyPieces.forEach(function(ep) {
                        if (ep.pos[0] === row && ep.pos[1] === col) {
                            content = '<span class="chess-piece ' + ep.color + ' enemy">' + PIECE_EMOJI[ep.type] + '</span>';
                            isEnemy = true;
                        }
                    });
                }

                boardHtml += '<div class="' + cellClass + '" data-row="' + row + '" data-col="' + col + '">' + content + '</div>';
            }
        }

        // Hearts
        var heartsHtml = '';
        for (var h = 0; h < 3; h++) {
            heartsHtml += h < chessState.hearts ? 'HEART' : 'EMPTY';
        }

        // Progress dots
        var dotsHtml = '';
        for (var d = 0; d < scenarios.length; d++) {
            dotsHtml += d < chessState.scenarioIdx ? 'DONE' : (d === chessState.scenarioIdx ? 'CURRENT' : 'PENDING');
        }

        container.innerHTML =
            '<div class="chess-training">' +
                '<div class="chess-top-bar">' +
                    '<div class="chess-hearts">' + heartsHtml + '</div>' +
                    '<div class="chess-streak">' +
                        '<span class="streak-fire">FIRE</span>' +
                        '<span>' + chessState.streak + '连击</span>' +
                    '</div>' +
                '</div>' +
                '<div class="chess-progress-dots">' + dotsHtml + '</div>' +
                '<div class="chess-scenario-info">' +
                    '<h3 class="chess-scenario-title">' + scenario.title + '</h3>' +
                    '<p class="chess-scenario-instruction">' + scenario.instruction + '</p>' +
                '</div>' +
                '<div class="chess-board" id="chessBoard" style="grid-template-columns: repeat(' + boardSize + ', 1fr)">' + boardHtml + '</div>' +
                '<div class="chess-actions">' +
                    '<button class="chess-hint-btn" id="chessHintBtn">' +
                        '<svg viewBox="0 0 22 22" fill="none" width="18" height="18"><path d="M8 16H14M9 19H13M11 2C7 2 4 5 4 9C4 12 6 14 8 15H14C16 14 18 12 18 9C18 5 15 2 11 2Z" stroke="#FFC857" stroke-width="2" fill="none"/></svg>' +
                        '<span>提示</span>' +
                    '</button>' +
                '</div>' +
            '</div>';

        // Cell click handlers
        var board = document.getElementById('chessBoard');
        if (board) {
            board.querySelectorAll('.chess-cell').forEach(function(cell) {
                cell.addEventListener('click', function() {
                    handleChessCellClick(cell, scenario, container, scenarios, onComplete);
                });
            });
        }

        // Hint button
        var hintBtn = document.getElementById('chessHintBtn');
        if (hintBtn) {
            hintBtn.addEventListener('click', function() {
                showToast(scenario.hint);
                // Highlight targets briefly
                if (board) {
                    scenario.targets.forEach(function(t) {
                        var cell = board.querySelector('[data-row="' + t[0] + '"][data-col="' + t[1] + '"]');
                        if (cell) {
                            cell.classList.add('hint-glow');
                            setTimeout(function() { cell.classList.remove('hint-glow'); }, 2000);
                        }
                    });
                }
            });
        }
    }

    function handleChessCellClick(cell, scenario, container, scenarios, onComplete) {
        var row = parseInt(cell.dataset.row);
        var col = parseInt(cell.dataset.col);
        var isCorrect = false;

        for (var i = 0; i < scenario.targets.length; i++) {
            if (scenario.targets[i][0] === row && scenario.targets[i][1] === col) {
                isCorrect = true;
                break;
            }
        }

        if (isCorrect) {
            chessState.correctCount++;
            chessState.streak++;
            cell.classList.add('correct-move');

            // Show lesson
            showToast('正确！' + scenario.lesson);

            setTimeout(function() {
                chessState.scenarioIdx++;
                renderChessScenario(container, scenarios, onComplete);
            }, 1500);
        } else {
            chessState.hearts--;
            chessState.streak = 0;
            cell.classList.add('wrong-move');

            // Update hearts display
            var heartsEl = document.querySelector('.chess-hearts');
            if (heartsEl) {
                var heartsHtml = '';
                for (var h = 0; h < 3; h++) {
                    heartsHtml += h < chessState.hearts ? 'HEART' : 'EMPTY';
                }
                heartsEl.innerHTML = heartsHtml;
            }
            // Update streak display
            var streakEl = document.querySelector('.chess-streak span:last-child');
            if (streakEl) streakEl.textContent = chessState.streak + '连击';

            showToast('不对哦，再想想！');

            if (chessState.hearts <= 0) {
                setTimeout(function() {
                    renderChessResult(container, onComplete);
                }, 1500);
            } else {
                setTimeout(function() { cell.classList.remove('wrong-move'); }, 600);
            }
        }
    }

    function renderChessResult(container, onComplete) {
        var passed = chessState.hearts > 0;
        var correct = chessState.correctCount;
        var total = chessState.totalScenarios;

        var stars = correct >= total ? 3 : (correct >= total * 0.6 ? 2 : 1);
        if (!passed) stars = 0;

        var title = passed ? '训练完成！' : '别灰心，再试一次！';
        var msg = passed
            ? CHILD_NAME + '答对了' + correct + '/' + total + '道题，' + (stars === 3 ? '完美通关！' : '继续加油！')
            : '心用完了，明天再来挑战吧！';

        container.innerHTML =
            '<div class="chess-result">' +
                '<div class="chess-result-emoji">' + (passed ? 'TROPHY' : 'RETRY') + '</div>' +
                '<h2 class="chess-result-title">' + title + '</h2>' +
                '<p class="chess-result-msg">' + msg + '</p>' +
                '<div class="chess-result-stars">' +
                    (stars >= 1 ? 'STAR_F' : 'STAR_E') +
                    (stars >= 2 ? 'STAR_F' : 'STAR_E') +
                    (stars >= 3 ? 'STAR_F' : 'STAR_E') +
                '</div>' +
                '<div class="chess-result-score">' + correct + ' / ' + total + '</div>' +
                '<button class="chess-result-btn">' + (passed ? '太棒了！' : '我知道了') + '</button>' +
            '</div>';

        var btn = container.querySelector('.chess-result-btn');
        if (btn) {
            btn.addEventListener('click', function() {
                if (onComplete) onComplete(correct, total, stars);
            });
        }

        // Auto-advance
        setTimeout(function() {
            if (onComplete) onComplete(correct, total, stars);
        }, 4000);
    }

    function showToast(msg) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        if (window._toastTimer) clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2500);
    }

    // Expose
    window.ChessModule = {
        renderChessTraining: renderChessTraining,
        getDailyChessTraining: getDailyChessTraining,
        SCENARIOS: SCENARIOS
    };
})();
