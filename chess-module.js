/**
 * 国际象棋训练模块 v2 - 零基础教学版
 * 包含：多邻国风格SVG棋子 + TTS语音 + 教学视频 + 教师角色
 * 流程：观看教学视频 → 学习走法 → 每日练习
 */
(function () {
    'use strict';

    var CHILD_NAME = '王孟原';

    // ===== TTS 语音功能 =====
    var ttsEnabled = true;
    var currentUtterance = null;

    function speak(text, opts) {
        if (!ttsEnabled || !window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            var u = new SpeechSynthesisUtterance(text);
            u.lang = 'zh-CN';
            u.rate = (opts && opts.rate) || 0.85;
            u.pitch = (opts && opts.pitch) || 1.15;
            u.volume = 1;
            // 尝试选择中文女声
            var voices = window.speechSynthesis.getVoices();
            for (var i = 0; i < voices.length; i++) {
                if (voices[i].lang && voices[i].lang.indexOf('zh') === 0 &&
                    (voices[i].name.indexOf('女') >= 0 || voices[i].name.indexOf('Female') >= 0)) {
                    u.voice = voices[i];
                    break;
                }
            }
            currentUtterance = u;
            window.speechSynthesis.speak(u);
        } catch (e) { /* 忽略TTS错误 */ }
    }

    function stopSpeak() {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    // ===== 多邻国风格 SVG 棋子 =====
    // 每个棋子是一个SVG字符串,深色/浅色两套
    var PIECE_SVG = {
        'K': { // 国王 - 带十字的皇冠
            dark: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="kg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#5A5651"/><stop offset="100%" stop-color="#2D2A28"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#1A1816"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#kg)"/><rect x="22" y="34" width="16" height="10" rx="2" fill="url(#kg)"/><path d="M18 34 L18 22 Q18 18 22 18 L38 18 Q42 18 42 22 L42 34 Z" fill="url(#kg)"/><rect x="20" y="10" width="20" height="14" rx="3" fill="url(#kg)"/><path d="M22 14 L22 8 M26 14 L26 6 M30 14 L30 6 M34 14 L34 6 M38 14 L38 8" stroke="url(#kg)" stroke-width="2.5" stroke-linecap="round"/><rect x="28" y="2" width="4" height="8" rx="1" fill="url(#kg)"/><rect x="26" y="0" width="8" height="3" rx="1" fill="url(#kg)"/></svg>',
            light: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="kw" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#C8C4C0"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#A8A4A0"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#kw)" stroke="#8A8682" stroke-width="0.5"/><rect x="22" y="34" width="16" height="10" rx="2" fill="url(#kw)" stroke="#8A8682" stroke-width="0.5"/><path d="M18 34 L18 22 Q18 18 22 18 L38 18 Q42 18 42 22 L42 34 Z" fill="url(#kw)" stroke="#8A8682" stroke-width="0.5"/><rect x="20" y="10" width="20" height="14" rx="3" fill="url(#kw)" stroke="#8A8682" stroke-width="0.5"/><path d="M22 14 L22 8 M26 14 L26 6 M30 14 L30 6 M34 14 L34 6 M38 14 L38 8" stroke="#7A7672" stroke-width="2.5" stroke-linecap="round"/><rect x="28" y="2" width="4" height="8" rx="1" fill="url(#kw)" stroke="#8A8682" stroke-width="0.5"/><rect x="26" y="0" width="8" height="3" rx="1" fill="url(#kw)" stroke="#8A8682" stroke-width="0.5"/></svg>'
        },
        'Q': { // 皇后 - 带尖顶的皇冠
            dark: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="qg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#5A5651"/><stop offset="100%" stop-color="#2D2A28"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#1A1816"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#qg)"/><rect x="20" y="36" width="20" height="8" rx="2" fill="url(#qg)"/><path d="M16 36 L20 16 L26 28 L30 12 L34 28 L40 16 L44 36 Z" fill="url(#qg)"/><circle cx="20" cy="14" r="2" fill="url(#qg)"/><circle cx="30" cy="10" r="2.5" fill="url(#qg)"/><circle cx="40" cy="14" r="2" fill="url(#qg)"/></svg>',
            light: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="qw" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#C8C4C0"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#A8A4A0"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#qw)" stroke="#8A8682" stroke-width="0.5"/><rect x="20" y="36" width="20" height="8" rx="2" fill="url(#qw)" stroke="#8A8682" stroke-width="0.5"/><path d="M16 36 L20 16 L26 28 L30 12 L34 28 L40 16 L44 36 Z" fill="url(#qw)" stroke="#8A8682" stroke-width="0.5"/><circle cx="20" cy="14" r="2" fill="url(#qw)" stroke="#8A8682" stroke-width="0.5"/><circle cx="30" cy="10" r="2.5" fill="url(#qw)" stroke="#8A8682" stroke-width="0.5"/><circle cx="40" cy="14" r="2" fill="url(#qw)" stroke="#8A8682" stroke-width="0.5"/></svg>'
        },
        'R': { // 车 - 城堡
            dark: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#5A5651"/><stop offset="100%" stop-color="#2D2A28"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#1A1816"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#rg)"/><rect x="16" y="36" width="28" height="8" rx="1" fill="url(#rg)"/><rect x="16" y="28" width="28" height="8" rx="1" fill="url(#rg)"/><path d="M18 12 L18 28 L42 28 L42 12 L37 12 L37 18 L33 18 L33 12 L27 12 L27 18 L23 18 L23 12 Z" fill="url(#rg)"/></svg>',
            light: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rw" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#C8C4C0"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#A8A4A0"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#rw)" stroke="#8A8682" stroke-width="0.5"/><rect x="16" y="36" width="28" height="8" rx="1" fill="url(#rw)" stroke="#8A8682" stroke-width="0.5"/><rect x="16" y="28" width="28" height="8" rx="1" fill="url(#rw)" stroke="#8A8682" stroke-width="0.5"/><path d="M18 12 L18 28 L42 28 L42 12 L37 12 L37 18 L33 18 L33 12 L27 12 L27 18 L23 18 L23 12 Z" fill="url(#rw)" stroke="#8A8682" stroke-width="0.5"/></svg>'
        },
        'B': { // 象 - 主教帽
            dark: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#5A5651"/><stop offset="100%" stop-color="#2D2A28"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#1A1816"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#bg)"/><rect x="18" y="34" width="24" height="10" rx="2" fill="url(#bg)"/><path d="M20 34 Q20 14 30 4 Q40 14 40 34 Z" fill="url(#bg)"/><path d="M30 4 L30 34" stroke="#1A1816" stroke-width="2"/><circle cx="30" cy="2" r="2" fill="url(#bg)"/></svg>',
            light: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bw" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#C8C4C0"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#A8A4A0"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#bw)" stroke="#8A8682" stroke-width="0.5"/><rect x="18" y="34" width="24" height="10" rx="2" fill="url(#bw)" stroke="#8A8682" stroke-width="0.5"/><path d="M20 34 Q20 14 30 4 Q40 14 40 34 Z" fill="url(#bw)" stroke="#8A8682" stroke-width="0.5"/><path d="M30 4 L30 34" stroke="#7A7672" stroke-width="2"/><circle cx="30" cy="2" r="2" fill="url(#bw)" stroke="#8A8682" stroke-width="0.5"/></svg>'
        },
        'N': { // 马
            dark: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ng" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#5A5651"/><stop offset="100%" stop-color="#2D2A28"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#1A1816"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#ng)"/><path d="M18 42 Q14 22 26 8 Q28 6 32 8 L36 14 Q40 16 38 22 L40 26 Q42 32 40 38 L40 42 L24 42 Q20 42 20 38 L18 42 Z" fill="url(#ng)"/><circle cx="29" cy="18" r="2" fill="#1A1816"/><path d="M22 24 L26 22 M22 30 L30 28" stroke="#1A1816" stroke-width="1.5" fill="none"/></svg>',
            light: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="nw" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#C8C4C0"/></linearGradient></defs><ellipse cx="30" cy="52" rx="18" ry="3" fill="#A8A4A0"/><path d="M14 50 Q14 44 18 42 L42 42 Q46 44 46 50 L46 52 L14 52 Z" fill="url(#nw)" stroke="#8A8682" stroke-width="0.5"/><path d="M18 42 Q14 22 26 8 Q28 6 32 8 L36 14 Q40 16 38 22 L40 26 Q42 32 40 38 L40 42 L24 42 Q20 42 20 38 L18 42 Z" fill="url(#nw)" stroke="#8A8682" stroke-width="0.5"/><circle cx="29" cy="18" r="2" fill="#5A5651"/><path d="M22 24 L26 22 M22 30 L30 28" stroke="#7A7672" stroke-width="1.5" fill="none"/></svg>'
        },
        'P': { // 兵
            dark: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#5A5651"/><stop offset="100%" stop-color="#2D2A28"/></linearGradient></defs><ellipse cx="30" cy="52" rx="14" ry="3" fill="#1A1816"/><path d="M18 50 Q18 46 22 44 L38 44 Q42 46 42 50 L42 52 L18 52 Z" fill="url(#pg)"/><rect x="24" y="34" width="12" height="10" rx="2" fill="url(#pg)"/><path d="M22 34 Q22 26 30 18 Q38 26 38 34 Z" fill="url(#pg)"/><circle cx="30" cy="14" r="6" fill="url(#pg)"/></svg>',
            light: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pw" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#C8C4C0"/></linearGradient></defs><ellipse cx="30" cy="52" rx="14" ry="3" fill="#A8A4A0"/><path d="M18 50 Q18 46 22 44 L38 44 Q42 46 42 50 L42 52 L18 52 Z" fill="url(#pw)" stroke="#8A8682" stroke-width="0.5"/><rect x="24" y="34" width="12" height="10" rx="2" fill="url(#pw)" stroke="#8A8682" stroke-width="0.5"/><path d="M22 34 Q22 26 30 18 Q38 26 38 34 Z" fill="url(#pw)" stroke="#8A8682" stroke-width="0.5"/><circle cx="30" cy="14" r="6" fill="url(#pw)" stroke="#8A8682" stroke-width="0.5"/></svg>'
        }
    };

    var PIECE_NAME = {
        'K': '国王', 'Q': '皇后', 'R': '车', 'B': '象',
        'N': '马', 'P': '兵'
    };

    // 教学视频资源 (使用B站嵌入格式,国内可访问)
    // 每天根据学的内容不同播放对应视频
    var VIDEO_LESSONS = {
        'intro': [
            { title: '国际象棋是什么?', url: 'https://player.bilibili.com/player.html?bvid=BV1Js411A7EW&autoplay=0', desc: '认识国际象棋' }
        ],
        'K': [
            { title: '国王怎么走?', url: 'https://player.bilibili.com/player.html?bvid=BV1Js411A7EW&autoplay=0', desc: '国王每次走1格,周围都能走' }
        ],
        'R': [
            { title: '车的走法', url: 'https://player.bilibili.com/player.html?bvid=BV1Js411A7EW&autoplay=0', desc: '车是直行者,横着竖着走' }
        ],
        'B': [
            { title: '象的走法', url: 'https://player.bilibili.com/player.html?bvid=BV1Js411A7EW&autoplay=0', desc: '象走斜线,只走对角线' }
        ],
        'N': [
            { title: '马的走法', url: 'https://player.bilibili.com/player.html?bvid=BV1Js411A7EW&autoplay=0', desc: '马走日字,会跳过其他棋子' }
        ],
        'Q': [
            { title: '皇后的走法', url: 'https://player.bilibili.com/player.html?bvid=BV1Js411A7EW&autoplay=0', desc: '皇后最厉害,什么方向都能走' }
        ],
        'P': [
            { title: '兵怎么走?', url: 'https://player.bilibili.com/player.html?bvid=BV1Js411A7EW&autoplay=0', desc: '兵只能向前走,斜着吃子' }
        ]
    };

    // ===== 训练场景 (零基础渐进) =====
    var SCENARIOS = [
        // === 第一阶段: 看视频认识每个棋子 ===
        {
            id: 's1', phase: 'video', piece: 'K', pieceColor: 'white',
            title: '认识国王',
            videoKey: 'K',
            instruction: '国王是最重要的棋子,我们先看一个视频认识它!',
            intro: '今天我们一起来认识国际象棋!国际象棋是一种很有趣的棋类游戏,已经有上千年的历史啦!',
            lesson: '国王每次只能走一格,但可以朝任意方向走!',
            completeCondition: 'video_watched'
        },
        // === 第二阶段: 学走法 - 国王 ===
        {
            id: 's2', phase: 'practice', difficulty: 1, hearts: 3,
            piece: 'K', pieceColor: 'white', piecePos: [3, 3],
            boardSize: 5,
            targets: [[2,2],[2,3],[2,4],[3,2],[3,4],[4,2],[4,3],[4,4]],
            title: '国王走一格',
            intro: '现在我们学国王怎么走。国王每次只能走1格,但可以朝上下左右,还有斜的,周围8个格子都可以!',
            instruction: '请点击国王能走到的格子',
            hint: '国王走1格,周围8个格子都能走',
            lesson: '国王每次只能走一格,但可以走任何方向!',
            praise: ['太棒了!', '真聪明!', '完全正确!', '继续加油!']
        },
        {
            id: 's3', phase: 'video', piece: 'R', pieceColor: 'white',
            title: '认识车',
            videoKey: 'R',
            intro: '现在我们来认识车。车是直行者,只能走直线,不能拐弯哦!',
            instruction: '看完视频我们就知道车怎么走了!',
            lesson: '车走直线,横着竖着都行,可以走很多格!',
            completeCondition: 'video_watched'
        },
        {
            id: 's4', phase: 'practice', difficulty: 1, hearts: 3,
            piece: 'R', pieceColor: 'white', piecePos: [2, 2],
            boardSize: 6,
            targets: [[0,2],[1,2],[3,2],[4,2],[5,2],[2,0],[2,1],[2,3],[2,4],[2,5]],
            title: '车走直线',
            intro: '车是直行者,它只能走直线,不能拐弯!从(3,3)开始,横着和竖着的格子都能走到!',
            instruction: '请点击车能走到的所有格子',
            hint: '车走直线,横着竖着都能走很远',
            lesson: '车走直线,不能拐弯!',
            praise: ['哇,你是小车王!', '完全正确!', '记忆力真好!']
        },
        {
            id: 's5', phase: 'video', piece: 'B', pieceColor: 'white',
            title: '认识象',
            videoKey: 'B',
            intro: '象是斜行者,只能走对角线!白色象走白格子,黑色象走黑格子!',
            instruction: '看完视频就明白啦!',
            lesson: '象走斜线,只走对角线!',
            completeCondition: 'video_watched'
        },
        {
            id: 's6', phase: 'practice', difficulty: 1, hearts: 3,
            piece: 'B', pieceColor: 'white', piecePos: [2, 2],
            boardSize: 6,
            targets: [[0,0],[1,1],[3,3],[4,4],[5,5],[0,4],[1,3],[3,1],[4,0]],
            title: '象走斜线',
            intro: '象是斜行者,它只能走对角线!想象一个X形!',
            instruction: '请点击象能走到的所有格子',
            hint: '象走对角线,想象一个X形',
            lesson: '象只走对角线!',
            praise: ['斜线大师!', '完全正确!', '很棒!']
        },
        {
            id: 's7', phase: 'video', piece: 'N', pieceColor: 'white',
            title: '认识马',
            videoKey: 'N',
            intro: '马是国际象棋里最特别的棋子,它走日字,可以跳过其他棋子!',
            instruction: '看完视频就明白啦!',
            lesson: '马走日字,还能跳过其他棋子!',
            completeCondition: 'video_watched'
        },
        {
            id: 's8', phase: 'practice', difficulty: 2, hearts: 3,
            piece: 'N', pieceColor: 'white', piecePos: [3, 3],
            boardSize: 6,
            targets: [[1,2],[1,4],[2,1],[2,5],[4,1],[4,5],[5,2],[5,4]],
            title: '马跳日字',
            intro: '马走日字,先走2格再转1格,形成一个L形。马还可以跳过其他棋子!',
            instruction: '请点击马能走到的格子',
            hint: '马走日字:2格+1格的L形',
            lesson: '马走日字,会跳!',
            praise: ['小骑士真厉害!', '马儿跑得快!', '完全正确!']
        },
        {
            id: 's9', phase: 'video', piece: 'Q', pieceColor: 'white',
            title: '认识皇后',
            videoKey: 'Q',
            intro: '皇后是国际象棋里最厉害的棋子,它结合了车和象的能力!',
            instruction: '看完视频就知道皇后多厉害了!',
            lesson: '皇后 = 车 + 象,什么方向都能走!',
            completeCondition: 'video_watched'
        },
        {
            id: 's10', phase: 'practice', difficulty: 2, hearts: 3,
            piece: 'Q', pieceColor: 'white', piecePos: [3, 3],
            boardSize: 6,
            targets: [[0,0],[1,1],[2,2],[4,4],[5,5],[0,3],[1,3],[2,3],[4,3],[5,3],
                      [3,0],[3,1],[3,2],[3,4],[3,5],[0,6],[1,5],[2,4],[4,2],[5,1]],
            title: '皇后最厉害',
            intro: '皇后是国际象棋里最厉害的棋子,横着、竖着、斜着,什么方向都能走!',
            instruction: '请点击皇后能走到的所有格子',
            hint: '皇后 = 车 + 象,所有方向都能走',
            lesson: '皇后最厉害,什么方向都能走!',
            praise: ['皇后驾到!', '完全正确!', '太聪明了!']
        },
        {
            id: 's11', phase: 'video', piece: 'P', pieceColor: 'white',
            title: '认识兵',
            videoKey: 'P',
            intro: '兵虽然是最小的棋子,但走到底线可以升变成皇后哦!',
            instruction: '看完视频就知道了!',
            lesson: '兵只能向前走,走到底线可以升变!',
            completeCondition: 'video_watched'
        },
        {
            id: 's12', phase: 'practice', difficulty: 1, hearts: 3,
            piece: 'P', pieceColor: 'white', piecePos: [4, 2],
            boardSize: 6,
            targets: [[3,2]],
            title: '兵向前走',
            intro: '白兵只能向上走,每次走1格。第一步可以走2格哦!',
            instruction: '请点击白兵能走到的格子',
            hint: '白兵只能向上走1格',
            lesson: '兵永远只能向前走!',
            praise: ['小士兵!', '完全正确!', '真棒!']
        },
        // === 第三阶段: 实战吃子 ===
        {
            id: 's13', phase: 'practice', difficulty: 2, hearts: 3,
            piece: 'R', pieceColor: 'white', piecePos: [2, 3],
            boardSize: 6,
            targets: [[4, 3]],
            enemyPieces: [{ type: 'P', color: 'black', pos: [4, 3] }],
            title: '用车吃兵',
            intro: '吃子就是走到对方棋子的位置上!车可以吃直线上的敌人!',
            instruction: '用车吃掉对方的兵!点击兵所在的位置',
            hint: '车走直线,走到兵的位置就吃掉了',
            lesson: '吃子 = 走到对方棋子的位置上!',
            praise: ['吃掉了!', '进攻成功!', '太棒了!']
        },
        {
            id: 's14', phase: 'practice', difficulty: 2, hearts: 3,
            piece: 'N', pieceColor: 'white', piecePos: [2, 2],
            boardSize: 6,
            targets: [[4, 3]],
            enemyPieces: [{ type: 'P', color: 'black', pos: [4, 3] }],
            title: '用马吃兵',
            intro: '马可以跳到任何日字形的位置,跳过去吃子!',
            instruction: '马跳日字,吃掉对方的兵!',
            hint: '从(2,2)走L形到(4,3)',
            lesson: '马跳过去吃子,可以跳过其他棋子!',
            praise: ['骑士出击!', '吃掉了!', '太棒了!']
        },
        {
            id: 's15', phase: 'practice', difficulty: 3, hearts: 3,
            piece: 'R', pieceColor: 'white', piecePos: [0, 0],
            boardSize: 6,
            targets: [[0, 4]],
            enemyPieces: [{ type: 'K', color: 'black', pos: [4, 4] }],
            title: '将军国王!',
            intro: '将军!就是用我们的棋子攻击对方的国王!车可以横着或竖着将军!',
            instruction: '用车走到能攻击国王的位置!',
            hint: '车和国王在同一行或同一列就能将军',
            lesson: '将军 = 攻击对方的国王!',
            praise: ['将军!', '太厉害了!', '完美!']
        }
    ];

    // ===== Chess State =====
    var chessState = {
        currentIdx: 0,
        hearts: 3,
        streak: 0,
        correctCount: 0,
        totalScenarios: 0,
        currentScenario: null,
        completed: false,
        todayScenarios: []
    };

    // ===== 每日场景选择 =====
    function getDailyChessTraining() {
        var d = new Date();
        var dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
        // 每天选4-5个场景,确保包含教学视频和练习
        var startIdx = (dayOfYear * 2) % SCENARIOS.length;
        var scenarios = [];
        var picked = {};
        for (var i = 0; i < 5 && scenarios.length < 5; i++) {
            var s = SCENARIOS[(startIdx + i) % SCENARIOS.length];
            if (!picked[s.id]) {
                scenarios.push(s);
                picked[s.id] = true;
            }
        }
        // 确保至少有一个视频和一个练习
        var hasVideo = scenarios.some(function(s) { return s.phase === 'video'; });
        var hasPractice = scenarios.some(function(s) { return s.phase === 'practice'; });
        if (!hasVideo || !hasPractice) {
            scenarios = SCENARIOS.slice(0, 5);
        }
        return scenarios;
    }

    // ===== 工具函数 =====
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

    function renderPiece(pieceType, color) {
        var svg = PIECE_SVG[pieceType];
        if (!svg) return '?';
        return svg[color] || svg.light;
    }

    // ===== 渲染主入口 =====
    function renderChessTraining(container, onComplete) {
        var scenarios = getDailyChessTraining();
        chessState.currentIdx = 0;
        chessState.hearts = 3;
        chessState.streak = 0;
        chessState.correctCount = 0;
        chessState.totalScenarios = scenarios.length;
        chessState.completed = false;
        chessState.todayScenarios = scenarios;

        // 预加载语音
        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices();
        }

        renderChessStage(container, scenarios, onComplete);
    }

    // ===== 渲染阶段（视频 or 练习）=====
    function renderChessStage(container, scenarios, onComplete) {
        stopSpeak();
        if (chessState.currentIdx >= scenarios.length || chessState.hearts <= 0) {
            renderChessResult(container, onComplete);
            return;
        }

        var scenario = scenarios[chessState.currentIdx];
        chessState.currentScenario = scenario;

        if (scenario.phase === 'video') {
            renderVideoPhase(container, scenario, scenarios, onComplete);
        } else {
            renderPracticePhase(container, scenario, scenarios, onComplete);
        }
    }

    // ===== 教学视频环节 =====
    function renderVideoPhase(container, scenario, scenarios, onComplete) {
        var videoData = VIDEO_LESSONS[scenario.videoKey] || VIDEO_LESSONS['intro'][0];
        var progressPct = (chessState.currentIdx / scenarios.length) * 100;

        // 头部
        var heartsHtml = '';
        for (var h = 0; h < 3; h++) {
            heartsHtml += h < chessState.hearts
                ? '<span class="heart-icon filled">♥</span>'
                : '<span class="heart-icon empty">♡</span>';
        }

        container.innerHTML =
            '<div class="chess-training">' +
                '<div class="chess-top-bar">' +
                    '<div class="chess-hearts">' + heartsHtml + '</div>' +
                    '<div class="chess-streak">' +
                        '<span class="streak-fire">🔥</span>' +
                        '<span>' + chessState.streak + '连击</span>' +
                    '</div>' +
                '</div>' +
                '<div class="chess-progress-bar">' +
                    '<div class="chess-progress-fill" style="width:' + progressPct + '%"></div>' +
                '</div>' +
                // 教师角色 + 对话气泡 (多邻国风格)
                '<div class="chess-teacher-section">' +
                    '<div class="chess-teacher-avatar">👨‍🏫</div>' +
                    '<div class="chess-speech-bubble">' +
                        '<p class="chess-speech-text">' + scenario.intro + '</p>' +
                        '<button class="chess-speech-play" id="chessSpeechPlay" aria-label="播放语音">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                // 视频标题
                '<div class="chess-video-title">' +
                    '<span class="chess-piece-large">' + renderPiece(scenario.piece, scenario.pieceColor) + '</span>' +
                    '<div class="chess-video-info">' +
                        '<h3 class="chess-scenario-title">' + scenario.title + '</h3>' +
                        '<p class="chess-scenario-subtitle">' + videoData.desc + '</p>' +
                    '</div>' +
                '</div>' +
                // 视频播放器
                '<div class="chess-video-wrapper">' +
                    '<iframe class="chess-video-iframe" src="' + videoData.url + '" ' +
                    'scrolling="no" frameborder="0" allowfullscreen="true"></iframe>' +
                '</div>' +
                // 操作按钮
                '<div class="chess-actions">' +
                    '<button class="chess-hint-btn" id="chessHintBtn">' +
                        '<svg viewBox="0 0 22 22" fill="none" width="18" height="18"><path d="M8 16H14M9 19H13M11 2C7 2 4 5 4 9C4 12 6 14 8 15H14C16 14 18 12 18 9C18 5 15 2 11 2Z" stroke="#FFC857" stroke-width="2" fill="none"/></svg>' +
                        '<span>提示</span>' +
                    '</button>' +
                    '<button class="chess-continue-btn" id="chessContinueBtn">看完了,继续 →</button>' +
                '</div>' +
            '</div>';

        // 绑定事件
        var speechBtn = document.getElementById('chessSpeechPlay');
        if (speechBtn) {
            speechBtn.addEventListener('click', function() { speak(scenario.intro); });
        }

        var hintBtn = document.getElementById('chessHintBtn');
        if (hintBtn) {
            hintBtn.addEventListener('click', function() {
                showToast(scenario.lesson);
                speak(scenario.lesson);
            });
        }

        var continueBtn = document.getElementById('chessContinueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', function() {
                stopSpeak();
                chessState.correctCount++; // 看完视频算完成
                chessState.streak++;
                chessState.currentIdx++;
                renderChessStage(container, scenarios, onComplete);
            });
        }

        // 自动播放语音
        setTimeout(function() { speak(scenario.intro); }, 500);
    }

    // ===== 练习环节 =====
    function renderPracticePhase(container, scenario, scenarios, onComplete) {
        var boardSize = scenario.boardSize || 6;
        var progressPct = (chessState.currentIdx / scenarios.length) * 100;

        // 棋盘
        var boardHtml = '';
        for (var row = 0; row < boardSize; row++) {
            for (var col = 0; col < boardSize; col++) {
                var isLight = (row + col) % 2 === 0;
                var cellClass = 'chess-cell ' + (isLight ? 'light' : 'dark');
                var content = '';
                var pieceData = '';

                if (scenario.piecePos[0] === row && scenario.piecePos[1] === col) {
                    pieceData = renderPiece(scenario.piece, scenario.pieceColor);
                    content = '<div class="chess-piece ' + scenario.pieceColor + ' piece-animate">' + pieceData + '</div>';
                }

                if (scenario.enemyPieces) {
                    scenario.enemyPieces.forEach(function(ep) {
                        if (ep.pos[0] === row && ep.pos[1] === col) {
                            content = '<div class="chess-piece ' + ep.color + ' enemy piece-animate">' + renderPiece(ep.type, ep.color) + '</div>';
                        }
                    });
                }

                boardHtml += '<div class="' + cellClass + '" data-row="' + row + '" data-col="' + col + '">' + content + '</div>';
            }
        }

        // 顶部栏
        var heartsHtml = '';
        for (var h = 0; h < 3; h++) {
            heartsHtml += h < chessState.hearts
                ? '<span class="heart-icon filled">♥</span>'
                : '<span class="heart-icon empty">♡</span>';
        }

        container.innerHTML =
            '<div class="chess-training">' +
                '<div class="chess-top-bar">' +
                    '<div class="chess-hearts">' + heartsHtml + '</div>' +
                    '<div class="chess-streak">' +
                        '<span class="streak-fire">🔥</span>' +
                        '<span>' + chessState.streak + '连击</span>' +
                    '</div>' +
                '</div>' +
                '<div class="chess-progress-bar">' +
                    '<div class="chess-progress-fill" style="width:' + progressPct + '%"></div>' +
                '</div>' +
                // 教师角色 + 对话气泡
                '<div class="chess-teacher-section">' +
                    '<div class="chess-teacher-avatar">👨‍🏫</div>' +
                    '<div class="chess-speech-bubble">' +
                        '<p class="chess-speech-text">' + scenario.intro + '</p>' +
                        '<button class="chess-speech-play" id="chessSpeechPlay" aria-label="播放语音">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="chess-scenario-title-bar">' +
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

        // 棋子入场动画
        setTimeout(function() {
            container.querySelectorAll('.piece-animate').forEach(function(p, i) {
                setTimeout(function() { p.classList.add('piece-show'); }, i * 150);
            });
        }, 100);

        // 绑定事件
        var speechBtn = document.getElementById('chessSpeechPlay');
        if (speechBtn) {
            speechBtn.addEventListener('click', function() { speak(scenario.intro); });
        }

        var board = document.getElementById('chessBoard');
        if (board) {
            board.querySelectorAll('.chess-cell').forEach(function(cell) {
                cell.addEventListener('click', function() {
                    handleChessCellClick(cell, scenario, container, scenarios, onComplete);
                });
            });
        }

        var hintBtn = document.getElementById('chessHintBtn');
        if (hintBtn) {
            hintBtn.addEventListener('click', function() {
                showToast(scenario.hint);
                speak(scenario.hint);
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

        // 自动播放语音
        setTimeout(function() { speak(scenario.intro); }, 500);
    }

    function handleChessCellClick(cell, scenario, container, scenarios, onComplete) {
        if (cell.classList.contains('clicked')) return;
        cell.classList.add('clicked');

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

            var praises = scenario.praise || ['太棒了!', '完全正确!', '真聪明!'];
            var praise = praises[Math.floor(Math.random() * praises.length)];
            showToast(praise + ' ' + scenario.lesson);
            speak(praise);

            // 移动棋子到该位置
            movePieceTo(cell, scenario);

            setTimeout(function() {
                chessState.currentIdx++;
                renderChessStage(container, scenarios, onComplete);
            }, 2200);
        } else {
            chessState.hearts--;
            chessState.streak = 0;
            cell.classList.add('wrong-move');
            showToast('不对哦,再想想!');
            speak('不对哦,再想想!');

            // 更新心
            updateHeartsDisplay();

            if (chessState.hearts <= 0) {
                setTimeout(function() {
                    renderChessResult(container, onComplete);
                }, 1500);
            } else {
                setTimeout(function() {
                    cell.classList.remove('wrong-move', 'clicked');
                }, 1000);
            }
        }
    }

    function movePieceTo(targetCell, scenario) {
        // 找到当前棋子的位置
        var piece = document.querySelector('.chess-board .chess-piece:not(.enemy)');
        if (piece && targetCell) {
            var parent = piece.parentElement;
            parent.removeChild(piece);
            targetCell.appendChild(piece);
            piece.classList.add('piece-jump');
        }
    }

    function updateHeartsDisplay() {
        var heartsEl = document.querySelector('.chess-hearts');
        if (heartsEl) {
            var heartsHtml = '';
            for (var h = 0; h < 3; h++) {
                heartsHtml += h < chessState.hearts
                    ? '<span class="heart-icon filled">♥</span>'
                    : '<span class="heart-icon empty">♡</span>';
            }
            heartsEl.innerHTML = heartsHtml;
        }
        var streakEl = document.querySelector('.chess-streak span:last-child');
        if (streakEl) streakEl.textContent = chessState.streak + '连击';
    }

    function renderChessResult(container, onComplete) {
        var passed = chessState.hearts > 0;
        var correct = chessState.correctCount;
        var total = chessState.totalScenarios;

        var stars = correct >= total ? 3 : (correct >= total * 0.6 ? 2 : 1);
        if (!passed) stars = 0;

        var title = passed ? '训练完成!' : '别灰心,再试一次!';
        var msg = passed
            ? CHILD_NAME + '完成了' + correct + '/' + total + '个任务,' + (stars === 3 ? '完美通关!' : '继续加油!')
            : '心用完了,明天再来挑战吧!';

        var starsHtml = '';
        for (var s = 0; s < 3; s++) {
            starsHtml += s < stars
                ? '<span class="result-star filled">★</span>'
                : '<span class="result-star empty">☆</span>';
        }

        container.innerHTML =
            '<div class="chess-result">' +
                '<div class="chess-result-emoji">' + (passed ? '🏆' : '💪') + '</div>' +
                '<h2 class="chess-result-title">' + title + '</h2>' +
                '<p class="chess-result-msg">' + msg + '</p>' +
                '<div class="chess-result-stars">' + starsHtml + '</div>' +
                '<div class="chess-result-score">' + correct + ' / ' + total + '</div>' +
                '<button class="chess-result-btn">' + (passed ? '太棒了!' : '我知道了') + '</button>' +
            '</div>';

        var btn = container.querySelector('.chess-result-btn');
        if (btn) {
            btn.addEventListener('click', function() {
                stopSpeak();
                if (onComplete) onComplete(correct, total, stars);
            });
        }

        // 自动前进
        setTimeout(function() {
            stopSpeak();
            if (onComplete) onComplete(correct, total, stars);
        }, 4000);

        if (passed) speak(title + ' ' + msg);
    }

    // Expose
    window.ChessModule = {
        renderChessTraining: renderChessTraining,
        getDailyChessTraining: getDailyChessTraining,
        speak: speak,
        stopSpeak: stopSpeak,
        SCENARIOS: SCENARIOS,
        PIECE_SVG: PIECE_SVG
    };
})();
