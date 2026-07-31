/**
 * 暑假幼小衔接通关大冒险 - 交互逻辑 v4
 * - 6学科 × 15题题库（共90道），每次随机抽10题
 * - 答题后自动跳转下一题
 * - 每日欢迎语（含小朋友名字：王孟原）
 * - 完成模块后星星收集动画
 * - 集满6模块触发庆祝动画（撒花+小动物鼓励）
 * - 拼音/英语模块支持点击发音（Web Speech API）
 */

(function () {
    'use strict';

    var CHILD_NAME = '王孟原';
    var SUBJECTS = ['pinyin', 'math', 'english', 'piano', 'chess', 'reading'];
    var QUESTIONS_PER_QUIZ = 10;
    var DATA_VERSION = 'v3_daily';

    // ===== Farm Data Definitions =====
    var FARM_ANIMALS = [
        { id: 'chicken', name: '小鸡', emoji: '🐔', unlockDay: 1, food: 'corn', foodName: '玉米' },
        { id: 'rabbit', name: '小兔', emoji: '🐰', unlockDay: 3, food: 'carrot', foodName: '胡萝卜' },
        { id: 'sheep', name: '小羊', emoji: '🐑', unlockDay: 7, food: 'grass', foodName: '青草' },
        { id: 'cow', name: '奶牛', emoji: '🐮', unlockDay: 15, food: 'hay', foodName: '干草' },
        { id: 'horse', name: '小马', emoji: '🐴', unlockDay: 21, food: 'apple', foodName: '苹果' },
        { id: 'pig', name: '小猪', emoji: '🐷', unlockDay: 30, food: 'slop', foodName: '饲料' }
    ];

    var FARM_FOODS = [
        { id: 'corn', name: '玉米', emoji: '🌽', subject: 'pinyin' },
        { id: 'carrot', name: '胡萝卜', emoji: '🥕', subject: 'math' },
        { id: 'apple', name: '苹果', emoji: '🍎', subject: 'english' },
        { id: 'grass', name: '青草', emoji: '🌿', subject: 'piano' },
        { id: 'hay', name: '干草', emoji: '🌾', subject: 'reading' },
        { id: 'slop', name: '饲料', emoji: '🫘', subject: 'chess' }
    ];

    var FARM_TOOLS = [
        { id: 'seeds', name: '种子', emoji: '🌱', unlockDay: 1 },
        { id: 'watering_can', name: '水壶', emoji: '💧', unlockDay: 5 },
        { id: 'axe', name: '斧头', emoji: '🪓', unlockDay: 10 },
        { id: 'tractor', name: '拖拉机', emoji: '🚜', unlockDay: 21 },
        { id: 'windmill', name: '风车', emoji: '🌬️', unlockDay: 45 },
        { id: 'scarecrow', name: '稻草人', emoji: '🧑‍🌾', unlockDay: 60 }
    ];

    var MILESTONES = [
        { days: 3, title: '坚持3天！', emoji: '🐰', desc: '解锁小兔，可以喂胡萝卜啦' },
        { days: 7, title: '一周打卡！', emoji: '🐑', desc: '解锁小羊，可以喂青草啦' },
        { days: 15, title: '半个月！', emoji: '🐮', desc: '解锁奶牛，可以喂干草啦' },
        { days: 21, title: '21天习惯养成！', emoji: '🐴', desc: '解锁小马和拖拉机！' },
        { days: 30, title: '满月打卡！', emoji: '🐷', desc: '解锁小猪，农场大升级！' },
        { days: 45, title: '45天坚持！', emoji: '🌬️', desc: '解锁风车，自动种植！' },
        { days: 60, title: '60天大师！', emoji: '🧑‍🌾', desc: '解锁稻草人，满级农场！' }
    ];

    // ===== Daily Welcome Messages =====
    var welcomeMessages = [
        CHILD_NAME + '，新的一天开始啦！今天也要加油哦！',
        '早安，' + CHILD_NAME + '！今天你想挑战哪个关卡呢？',
        CHILD_NAME + '小朋友，昨天的知识还记得吗？来复习一下吧！',
        '欢迎回来，' + CHILD_NAME + '！每天进步一点点，你就会越来越棒！',
        CHILD_NAME + '，今天的冒险之旅开始啦！冲鸭！',
        '嘿，' + CHILD_NAME + '！你的小脑袋今天准备好学习了吗？',
        CHILD_NAME + '，坚持就是胜利！每天打卡，越来越厉害！',
        '早上好，' + CHILD_NAME + '！知识就像星星，一颗一颗收集起来就亮了！',
        CHILD_NAME + '，今天又是充满可能的一天！去冒险吧！',
        '欢迎，' + CHILD_NAME + '！每个小冒险家都是从今天的练习开始的！',
        CHILD_NAME + '，你今天笑了吗？笑一笑，学习效率更高哦！',
        CHILD_NAME + '，记住：犯错也没关系，每一次尝试都是进步！',
        '嗨，' + CHILD_NAME + '！今天有6颗星星等着你来收集呢！',
        CHILD_NAME + '，昨天的表现很棒！今天继续加油！',
        CHILD_NAME + '，学习就像种小树，每天浇一点水，它就长大了！',
        CHILD_NAME + '，你是最棒的小冒险家！今天也要闪闪发光哦！',
        CHILD_NAME + '，准备好今天的闯关了吗？让我们一起出发吧！',
        CHILD_NAME + '，每完成一个关卡，你就离学霸更近一步！加油！',
        CHILD_NAME + '，今天的小挑战来啦！你一定可以做到的！',
        CHILD_NAME + '，好奇心是最好的老师！今天去探索新知识吧！',
        CHILD_NAME + '，每个伟大的冒险家都是从第一步开始的！今天迈出你的那一步吧！',
        CHILD_NAME + '，你的大脑就像一块海绵，今天要吸收哪些新知识呢？',
        CHILD_NAME + '，今天的太阳都在为你加油呢！去收集星星吧！',
        CHILD_NAME + '，记住：慢慢来，比较快！今天也要稳稳地闯关！',
        CHILD_NAME + '，每天学一点，假期结束你就是全班最厉害的！',
        CHILD_NAME + '，今天的任务是：开心学习，快乐闯关！出发！',
        CHILD_NAME + '，你昨天收集了好多星星呢！今天继续吧！',
        CHILD_NAME + '，学习是一场马拉松，今天的你已经比昨天更棒了！',
        CHILD_NAME + '，今天的题目在等你挑战呢！准备好了吗？',
        CHILD_NAME + '，每个小小的进步都值得庆祝！今天也要加油哦！',
        CHILD_NAME + '，让我们一起把今天变成最棒的一天！'
    ];

    function getDailyWelcomeMessage() {
        var d = new Date();
        var dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
        return welcomeMessages[dayOfYear % welcomeMessages.length];
    }

    // ===== Speech Synthesis =====
    var synth = window.speechSynthesis;
    var voices = [];
    function loadVoices() { voices = synth ? synth.getVoices() : []; }
    if (synth) {
        loadVoices();
        if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
    }

    function speak(text, lang) {
        if (!synth) { showToast('您的浏览器不支持语音功能'); return; }
        synth.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = lang.startsWith('zh') ? 0.75 : 0.8;
        u.pitch = 1.1;
        var matchVoice = voices.find(function(v) { return v.lang === lang || v.lang.startsWith(lang.split('-')[0]); });
        if (matchVoice) u.voice = matchVoice;
        synth.speak(u);
    }

    // ===== SVG Helpers =====
    function escapeXml(str) {
        return String(str).replace(/[<>&"']/g, function(c) {
            return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c];
        });
    }

    function svgText(display, subtext, color) {
        var sub = subtext ? '<text x="250" y="135" font-size="20" font-weight="500" fill="#5C5147" text-anchor="middle">' + escapeXml(subtext) + '</text>' : '';
        return '<svg viewBox="0 0 500 160" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="250" y="85" font-size="64" font-weight="900" fill="' + (color || '#2D2A26') + '" text-anchor="middle">' + escapeXml(display) + '</text>' + sub + '</svg>';
    }

    function generateTenFrame(x, y, count, color) {
        var parts = '';
        var barW = 14, barH = 40, gap = 4;
        var dotR = 7, dotGap = 16;
        var filled = Math.floor(count / 10);
        var remainder = count % 10;
        var cx = x;
        for (var i = 0; i < filled; i++) {
            parts += '<rect x="' + cx + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="3" fill="' + color + '"/>';
            cx += barW + gap;
        }
        for (var j = 0; j < remainder; j++) {
            parts += '<circle cx="' + (cx + dotR) + '" cy="' + (y + 20) + '" r="' + dotR + '" fill="' + color + '"/>';
            cx += dotGap;
        }
        return parts;
    }

    function svgMath(equation, tenFrameA, tenFrameB) {
        var frames = '';
        if (tenFrameA) {
            frames += generateTenFrame(40, 90, tenFrameA, '#6BB6E0');
            frames += '<text x="172" y="122" font-size="20" font-weight="700" fill="#5C5147">-</text>';
        }
        if (tenFrameB) {
            frames += generateTenFrame(195, 90, tenFrameB, '#D0C8BC');
            frames += '<text x="340" y="122" font-size="20" font-weight="700" fill="#5C5147">=</text>';
            frames += '<text x="370" y="125" font-size="28" font-weight="900" fill="#6BB6E0">?</text>';
        }
        return '<svg viewBox="0 0 500 160" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="250" y="60" font-size="48" font-weight="900" fill="#2D2A26" text-anchor="middle">' + escapeXml(equation) + '</text>' + frames + '</svg>';
    }

    function svgPiano(highlightKey, label) {
        var keys = [
            { x: 40, w: 50, note: 'C', black: false },
            { x: 90, w: 0, note: 'C#', black: true },
            { x: 90, w: 50, note: 'D', black: false },
            { x: 140, w: 0, note: 'D#', black: true },
            { x: 140, w: 50, note: 'E', black: false },
            { x: 190, w: 50, note: 'F', black: false },
            { x: 240, w: 0, note: 'F#', black: true },
            { x: 240, w: 50, note: 'G', black: false },
            { x: 290, w: 0, note: 'G#', black: true },
            { x: 290, w: 50, note: 'A', black: false },
            { x: 340, w: 0, note: 'A#', black: true },
            { x: 340, w: 50, note: 'B', black: false },
            { x: 390, w: 50, note: 'C2', black: false }
        ];
        var whiteKeys = '', blackKeys = '', highlight = '';
        keys.forEach(function(k) {
            if (k.black) {
                blackKeys += '<rect x="' + (k.x - 12) + '" y="40" width="24" height="32" fill="#2D2A26" rx="2"/>';
            } else {
                var isHi = k.note === highlightKey;
                var fill = isHi ? '#B19CD9' : '#FFFFFF';
                whiteKeys += '<rect x="' + k.x + '" y="40" width="' + k.w + '" height="80" fill="' + fill + '" stroke="#2D2A26" stroke-width="1.5" rx="3"/>';
                if (isHi) highlight = '<circle cx="' + (k.x + k.w/2) + '" cy="100" r="8" fill="#B19CD9" opacity="0.4"/><text x="' + (k.x + k.w/2) + '" y="125" font-size="14" font-weight="700" fill="#B19CD9" text-anchor="middle">' + escapeXml(label || k.note) + '</text>';
            }
        });
        return '<svg viewBox="0 0 460 160" fill="none" xmlns="http://www.w3.org/2000/svg">' + whiteKeys + blackKeys + highlight + '</svg>';
    }

    function svgChess(pieceLabel, pieceColor) {
        return '<svg viewBox="0 0 300 160" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="50" y="20" width="200" height="120" fill="#FFC857" fill-opacity="0.15" stroke="#2D2A26" stroke-width="2" rx="8"/>' +
            '<line x1="100" y1="20" x2="100" y2="140" stroke="#2D2A26" stroke-width="1" opacity="0.2"/>' +
            '<line x1="150" y1="20" x2="150" y2="140" stroke="#2D2A26" stroke-width="1" opacity="0.2"/>' +
            '<line x1="200" y1="20" x2="200" y2="140" stroke="#2D2A26" stroke-width="1" opacity="0.2"/>' +
            '<line x1="50" y1="60" x2="250" y2="60" stroke="#2D2A26" stroke-width="1" opacity="0.2"/>' +
            '<line x1="50" y1="100" x2="250" y2="100" stroke="#2D2A26" stroke-width="1" opacity="0.2"/>' +
            '<text x="150" y="95" font-size="56" font-weight="900" fill="' + (pieceColor || '#2D2A26') + '" text-anchor="middle">' + escapeXml(pieceLabel) + '</text>' +
            '</svg>';
    }

    function svgReading(chars, highlights) {
        var parts = '';
        var positions = [60, 190, 320, 450];
        chars.forEach(function(ch, i) {
            var isHi = highlights && highlights.indexOf(i) >= 0;
            var color = isHi ? '#FF9F43' : (i === 1 ? '#2D2A26' : '#5C5147');
            var size = isHi ? 40 : 32;
            parts += '<text x="' + (positions[i] || 250) + '" y="90" font-size="' + size + '" font-weight="900" fill="' + color + '" text-anchor="middle">' + escapeXml(ch) + '</text>';
        });
        return '<svg viewBox="0 0 500 140" fill="none" xmlns="http://www.w3.org/2000/svg">' + parts + '</svg>';
    }

    // ===== Seeded Random (daily rotation) =====
    function seededRand(seed) { var x = Math.sin(seed) * 10000; return x - Math.floor(x); }
    function seededShuffle(arr, seed) {
        var r = arr.slice();
        for (var i = r.length - 1; i > 0; i--) {
            var j = Math.floor(seededRand(seed + i * 7) * (i + 1));
            var t = r[i]; r[i] = r[j]; r[j] = t;
        }
        return r;
    }

    // ===== Question Banks (30 per subject, daily rotation) =====
    var questionBanks = {
        pinyin: {
            title: '拼音城堡 · 每日练习', color: '#FF8C7A', bg: '#FFF0EE', lang: 'zh-CN', hasAudio: true,
            questions: [
                { difficulty: 1, prompt: '选出正确的声母', display: 'b', speakText: '波', options: [{text:'b',speak:'波'},{text:'d',speak:'得'},{text:'p',speak:'坡'},{text:'q',speak:'七'}], correct: 0, hint: 'b是双唇音，嘴唇先闭合再放开' },
                { difficulty: 1, prompt: '选出正确的韵母', display: 'o', speakText: '哦', options: [{text:'a',speak:'啊'},{text:'o',speak:'哦'},{text:'e',speak:'鹅'},{text:'i',speak:'衣'}], correct: 1, hint: 'o是圆唇音，嘴巴圆圆的' },
                { difficulty: 2, prompt: '"mā" 读哪个字？', display: 'mā', speakText: '妈', options: [{text:'妈',speak:'妈'},{text:'马',speak:'马'},{text:'麻',speak:'麻'},{text:'骂',speak:'骂'}], correct: 0, hint: '一声平，mā是第一声' },
                { difficulty: 2, prompt: '"mǎ" 是第几声？', display: 'mǎ', speakText: '马', options: [{text:'一声',speak:'第一声'},{text:'二声',speak:'第二声'},{text:'三声',speak:'第三声'},{text:'四声',speak:'第四声'}], correct: 2, hint: '三声拐弯，先降后升' },
                { difficulty: 2, prompt: '"huā" 是什么？', display: 'huā', speakText: '花', options: [{text:'花',speak:'花'},{text:'火',speak:'火'},{text:'画',speak:'画'},{text:'红',speak:'红'}], correct: 0, hint: 'h-u-a，花朵的花' },
                { difficulty: 3, prompt: '哪个含有"ang"？', display: 'ang', speakText: '昂', options: [{text:'羊',speak:'羊'},{text:'鱼',speak:'鱼'},{text:'月',speak:'月'},{text:'雨',speak:'雨'}], correct: 0, hint: 'ang是后鼻韵母，羊的韵母就是ang' },
                { difficulty: 2, prompt: '"shū" 是哪个字？', display: 'shū', speakText: '书', options: [{text:'书',speak:'书'},{text:'树',speak:'树'},{text:'鼠',speak:'鼠'},{text:'蔬',speak:'蔬'}], correct: 0, hint: 'sh-ū，一声，书本的书' },
                { difficulty: 2, prompt: '"nǐ" 是哪个字？', display: 'nǐ', speakText: '你', options: [{text:'你',speak:'你'},{text:'尼',speak:'尼'},{text:'泥',speak:'泥'},{text:'逆',speak:'逆'}], correct: 0, hint: 'n-ǐ，三声，你的你' },
                { difficulty: 2, prompt: '"dà" 是第几声？', display: 'dà', speakText: '大', options: [{text:'一声',speak:'第一声'},{text:'二声',speak:'第二声'},{text:'三声',speak:'第三声'},{text:'四声',speak:'第四声'}], correct: 3, hint: '四声降，da是第四声' },
                { difficulty: 3, prompt: '"peng you" 是什么？', display: 'peng you', speakText: '朋友', options: [{text:'朋友',speak:'朋友'},{text:'葡萄',speak:'葡萄'},{text:'苹果',speak:'苹果'},{text:'皮带',speak:'皮带'}], correct: 0, hint: 'p-eng y-ou，好朋友' },
                { difficulty: 1, prompt: '选出声母"f"', display: 'f', speakText: '佛', options: [{text:'f',speak:'佛'},{text:'t',speak:'特'},{text:'h',speak:'喝'},{text:'g',speak:'哥'}], correct: 0, hint: 'f是上齿咬下唇' },
                { difficulty: 2, prompt: '"guo" 是哪个字？', display: 'guo', speakText: '国', options: [{text:'国',speak:'国'},{text:'果',speak:'果'},{text:'过',speak:'过'},{text:'锅',speak:'锅'}], correct: 0, hint: 'g-u-o，国家的国' },
                { difficulty: 2, prompt: '"en" 是什么韵母？', display: 'en', speakText: '恩', options: [{text:'前鼻韵母',speak:'前鼻韵母'},{text:'后鼻韵母',speak:'后鼻韵母'},{text:'单韵母',speak:'单韵母'},{text:'复韵母',speak:'复韵母'}], correct: 0, hint: 'en是前鼻韵母' },
                { difficulty: 3, prompt: '"zhi" 是什么？', display: 'zhi', speakText: '知', options: [{text:'整体认读音节',speak:'整体认读音节'},{text:'三拼音节',speak:'三拼音节'},{text:'两拼音节',speak:'两拼音节'},{text:'零声母',speak:'零声母'}], correct: 0, hint: 'zhi是整体认读音节' },
                { difficulty: 2, prompt: '"xiao" 是第几声？', display: 'xiao', speakText: '小', options: [{text:'一声',speak:'第一声'},{text:'二声',speak:'第二声'},{text:'三声',speak:'第三声'},{text:'四声',speak:'第四声'}], correct: 2, hint: '三声拐弯' },
                { difficulty: 1, prompt: '选出声母"m"', display: 'm', speakText: '摸', options: [{text:'n',speak:'讷'},{text:'m',speak:'摸'},{text:'l',speak:'勒'},{text:'r',speak:'日'}], correct: 1, hint: 'm是双唇鼻音' },
                { difficulty: 2, prompt: '"hao" 是哪个字？', display: 'hao', speakText: '好', options: [{text:'好',speak:'好'},{text:'号',speak:'号'},{text:'豪',speak:'豪'},{text:'浩',speak:'浩'}], correct: 0, hint: 'h-ao，三声，好坏的好' },
                { difficulty: 2, prompt: '"tian" 是哪个字？', display: 'tian', speakText: '天', options: [{text:'天',speak:'天'},{text:'田',speak:'田'},{text:'甜',speak:'甜'},{text:'添',speak:'添'}], correct: 0, hint: 't-i-an，天空的天' },
                { difficulty: 3, prompt: '"ying" 是什么？', display: 'ying', speakText: '鹰', options: [{text:'整体认读音节',speak:'整体认读音节'},{text:'三拼音节',speak:'三拼音节'},{text:'两拼音节',speak:'两拼音节'},{text:'零声母',speak:'零声母'}], correct: 0, hint: 'ying是整体认读音节' },
                { difficulty: 1, prompt: '选出韵母"u"', display: 'u', speakText: '乌', options: [{text:'u',speak:'乌'},{text:'v',speak:'迂'},{text:'i',speak:'衣'},{text:'a',speak:'啊'}], correct: 0, hint: 'u嘴巴突出，圆圆的' },
                { difficulty: 2, prompt: '"ke" 是哪个字？', display: 'ke', speakText: '课', options: [{text:'课',speak:'课'},{text:'可',speak:'可'},{text:'客',speak:'客'},{text:'克',speak:'克'}], correct: 0, hint: 'k-e，四声，上课的课' },
                { difficulty: 2, prompt: '"shui" 是哪个字？', display: 'shui', speakText: '水', options: [{text:'水',speak:'水'},{text:'谁',speak:'谁'},{text:'税',speak:'税'},{text:'睡',speak:'睡'}], correct: 0, hint: 'sh-u-i，三声，喝水的水' },
                { difficulty: 3, prompt: '"yuan" 是什么？', display: 'yuan', speakText: '园', options: [{text:'整体认读音节',speak:'整体认读音节'},{text:'三拼音节',speak:'三拼音节'},{text:'两拼音节',speak:'两拼音节'},{text:'零声母',speak:'零声母'}], correct: 0, hint: 'yuan是整体认读音节' },
                { difficulty: 1, prompt: '选出声母"g"', display: 'g', speakText: '哥', options: [{text:'k',speak:'科'},{text:'g',speak:'哥'},{text:'h',speak:'喝'},{text:'j',speak:'鸡'}], correct: 1, hint: 'g是舌根音' },
                { difficulty: 2, prompt: '"bai" 是哪个字？', display: 'bai', speakText: '白', options: [{text:'白',speak:'白'},{text:'百',speak:'百'},{text:'拜',speak:'拜'},{text:'败',speak:'败'}], correct: 0, hint: 'b-ai，二声，白色的白' },
                { difficulty: 2, prompt: '"hou" 是第几声？', display: 'hou', speakText: '猴', options: [{text:'一声',speak:'第一声'},{text:'二声',speak:'第二声'},{text:'三声',speak:'第三声'},{text:'四声',speak:'第四声'}], correct: 1, hint: '二声扬，hou猴是第二声' },
                { difficulty: 3, prompt: '"chun" 含有什么韵母？', display: 'chun', speakText: '春', options: [{text:'un',speak:'un'},{text:'en',speak:'en'},{text:'in',speak:'in'},{text:'an',speak:'an'}], correct: 0, hint: 'ch-un，un是前鼻韵母' },
                { difficulty: 1, prompt: '选出韵母"e"', display: 'e', speakText: '鹅', options: [{text:'a',speak:'啊'},{text:'o',speak:'哦'},{text:'e',speak:'鹅'},{text:'i',speak:'衣'}], correct: 2, hint: 'e嘴巴扁扁的，像鹅的叫声' },
                { difficulty: 2, prompt: '"zuo" 是哪个字？', display: 'zuo', speakText: '做', options: [{text:'做',speak:'做'},{text:'坐',speak:'坐'},{text:'左',speak:'左'},{text:'走',speak:'走'}], correct: 0, hint: 'z-u-o，四声，做事的做' },
                { difficulty: 3, prompt: '"qiu" 的韵母是？', display: 'qiu', speakText: '球', options: [{text:'iu',speak:'iu'},{text:'ou',speak:'ou'},{text:'ao',speak:'ao'},{text:'ie',speak:'ie'}], correct: 0, hint: 'q-iu，iu是复韵母' }
            ]
        },
        math: {
            title: '数学森林 · 每日练习', color: '#6BB6E0', bg: '#E8F4FB', lang: null, hasAudio: false,
            questions: [
                { difficulty: 1, prompt: '3 + 4 = ?', equation: '3 + 4 = ?', tfA: 3, tfB: 4, options: [{text:'6'},{text:'7'},{text:'8'},{text:'5'}], correct: 1, hint: '3个苹果加4个苹果' },
                { difficulty: 1, prompt: '9 - 5 = ?', equation: '9 - 5 = ?', tfA: 9, tfB: 5, options: [{text:'3'},{text:'5'},{text:'4'},{text:'6'}], correct: 2, hint: '9个拿走5个' },
                { difficulty: 1, prompt: '6 + 3 = ?', equation: '6 + 3 = ?', tfA: 6, tfB: 3, options: [{text:'8'},{text:'9'},{text:'7'},{text:'10'}], correct: 1, hint: '6个加3个' },
                { difficulty: 1, prompt: '10 - 4 = ?', equation: '10 - 4 = ?', tfA: 10, tfB: 4, options: [{text:'5'},{text:'6'},{text:'7'},{text:'4'}], correct: 1, hint: '10个拿走4个' },
                { difficulty: 1, prompt: '5 + 5 = ?', equation: '5 + 5 = ?', tfA: 5, tfB: 5, options: [{text:'8'},{text:'10'},{text:'9'},{text:'11'}], correct: 1, hint: '5个加5个' },
                { difficulty: 1, prompt: '7 + 2 = ?', equation: '7 + 2 = ?', tfA: 7, tfB: 2, options: [{text:'8'},{text:'9'},{text:'10'},{text:'7'}], correct: 1, hint: '7个加2个' },
                { difficulty: 1, prompt: '8 - 3 = ?', equation: '8 - 3 = ?', tfA: 8, tfB: 3, options: [{text:'4'},{text:'5'},{text:'6'},{text:'3'}], correct: 1, hint: '8个拿走3个' },
                { difficulty: 1, prompt: '4 + 4 = ?', equation: '4 + 4 = ?', tfA: 4, tfB: 4, options: [{text:'7'},{text:'8'},{text:'9'},{text:'6'}], correct: 1, hint: '4个加4个' },
                { difficulty: 1, prompt: '10 - 7 = ?', equation: '10 - 7 = ?', tfA: 10, tfB: 7, options: [{text:'2'},{text:'3'},{text:'4'},{text:'1'}], correct: 1, hint: '10个拿走7个' },
                { difficulty: 1, prompt: '2 + 6 = ?', equation: '2 + 6 = ?', tfA: 2, tfB: 6, options: [{text:'7'},{text:'8'},{text:'9'},{text:'6'}], correct: 1, hint: '2个加6个' },
                { difficulty: 2, prompt: '8 + 7 = ?', equation: '8 + 7 = ?', tfA: 8, tfB: 7, options: [{text:'14'},{text:'15'},{text:'16'},{text:'13'}], correct: 1, hint: '8和2凑成10，7分成2和5，10+5=15' },
                { difficulty: 2, prompt: '15 - 8 = ?', equation: '15 - 8 = ?', tfA: 15, tfB: 8, options: [{text:'6'},{text:'8'},{text:'7'},{text:'9'}], correct: 2, hint: '15分成10和5，10-8=2，2+5=7' },
                { difficulty: 2, prompt: '9 + 6 = ?', equation: '9 + 6 = ?', tfA: 9, tfB: 6, options: [{text:'14'},{text:'15'},{text:'16'},{text:'13'}], correct: 1, hint: '9和1凑成10，6分成1和5，10+5=15' },
                { difficulty: 2, prompt: '17 - 9 = ?', equation: '17 - 9 = ?', tfA: 17, tfB: 9, options: [{text:'7'},{text:'9'},{text:'8'},{text:'6'}], correct: 2, hint: '17分成10和7，10-9=1，1+7=8' },
                { difficulty: 2, prompt: '7 + 8 = ?', equation: '7 + 8 = ?', tfA: 7, tfB: 8, options: [{text:'14'},{text:'15'},{text:'16'},{text:'13'}], correct: 1, hint: '7和3凑成10，8分成3和5，10+5=15' },
                { difficulty: 2, prompt: '16 - 7 = ?', equation: '16 - 7 = ?', tfA: 16, tfB: 7, options: [{text:'8'},{text:'10'},{text:'9'},{text:'7'}], correct: 2, hint: '16分成10和6，10-7=3，3+6=9' },
                { difficulty: 2, prompt: '10 + 5 = ?', equation: '10 + 5 = ?', tfA: 10, tfB: 5, options: [{text:'14'},{text:'15'},{text:'16'},{text:'13'}], correct: 1, hint: '10加5就是15' },
                { difficulty: 2, prompt: '18 - 8 = ?', equation: '18 - 8 = ?', tfA: 18, tfB: 8, options: [{text:'8'},{text:'10'},{text:'9'},{text:'11'}], correct: 1, hint: '18拿走8个' },
                { difficulty: 2, prompt: '6 + 9 = ?', equation: '6 + 9 = ?', tfA: 6, tfB: 9, options: [{text:'14'},{text:'15'},{text:'16'},{text:'13'}], correct: 1, hint: '6和4凑成10，9分成4和5，10+5=15' },
                { difficulty: 2, prompt: '14 - 6 = ?', equation: '14 - 6 = ?', tfA: 14, tfB: 6, options: [{text:'7'},{text:'9'},{text:'8'},{text:'6'}], correct: 2, hint: '14分成10和4，10-6=4，4+4=8' },
                { difficulty: 2, prompt: '8 + 5 = ?', equation: '8 + 5 = ?', tfA: 8, tfB: 5, options: [{text:'12'},{text:'13'},{text:'14'},{text:'11'}], correct: 1, hint: '8和2凑成10，5分成2和3，10+3=13' },
                { difficulty: 2, prompt: '13 - 7 = ?', equation: '13 - 7 = ?', tfA: 13, tfB: 7, options: [{text:'5'},{text:'7'},{text:'6'},{text:'8'}], correct: 2, hint: '13分成10和3，10-7=3，3+3=6' },
                { difficulty: 3, prompt: '9 + 9 = ?', equation: '9 + 9 = ?', tfA: 9, tfB: 9, options: [{text:'17'},{text:'18'},{text:'19'},{text:'16'}], correct: 1, hint: '9和1凑成10，9分成1和8，10+8=18' },
                { difficulty: 3, prompt: '20 - 11 = ?', equation: '20 - 11 = ?', tfA: 20, tfB: 11, options: [{text:'8'},{text:'10'},{text:'9'},{text:'7'}], correct: 2, hint: '20分成10和10，10-1=9' },
                { difficulty: 3, prompt: '12 + 7 = ?', equation: '12 + 7 = ?', tfA: 12, tfB: 7, options: [{text:'18'},{text:'19'},{text:'20'},{text:'17'}], correct: 1, hint: '2+7=9，10+9=19' },
                { difficulty: 3, prompt: '20 - 13 = ?', equation: '20 - 13 = ?', tfA: 20, tfB: 13, options: [{text:'6'},{text:'8'},{text:'7'},{text:'9'}], correct: 2, hint: '20分成10和10，10-3=7' },
                { difficulty: 3, prompt: '9 + 8 = ?', equation: '9 + 8 = ?', tfA: 9, tfB: 8, options: [{text:'16'},{text:'17'},{text:'18'},{text:'15'}], correct: 1, hint: '9和1凑成10，8分成1和7，10+7=17' },
                { difficulty: 3, prompt: '19 - 10 = ?', equation: '19 - 10 = ?', tfA: 19, tfB: 10, options: [{text:'8'},{text:'10'},{text:'9'},{text:'11'}], correct: 2, hint: '19拿走10个' },
                { difficulty: 3, prompt: '6 + 7 = ?', equation: '6 + 7 = ?', tfA: 6, tfB: 7, options: [{text:'12'},{text:'13'},{text:'14'},{text:'11'}], correct: 1, hint: '6和4凑成10，7分成4和3，10+3=13' },
                { difficulty: 3, prompt: '20 - 15 = ?', equation: '20 - 15 = ?', tfA: 20, tfB: 15, options: [{text:'4'},{text:'6'},{text:'5'},{text:'7'}], correct: 2, hint: '20分成10和10，10-5=5' }
            ]
        },
        english: {
            title: '英语星球 · 每日练习', color: '#7BB661', bg: '#EDF5E6', lang: 'en-US', hasAudio: true,
            questions: [
                { difficulty: 1, prompt: 'Which letter says /b/?', display: '/b/', speakText: 'b', options: [{text:'B',speak:'b'},{text:'D',speak:'d'},{text:'P',speak:'p'},{text:'T',speak:'t'}], correct: 0, hint: 'B says /b/, like in "ball"' },
                { difficulty: 1, prompt: 'c-a-t makes what word?', display: 'c-a-t', speakText: 'cat', options: [{text:'cat',speak:'cat'},{text:'cut',speak:'cut'},{text:'cot',speak:'cot'},{text:'cap',speak:'cap'}], correct: 0, hint: 'c-a-t, /k/ /ae/ /t/' },
                { difficulty: 2, prompt: 'What is the first sound of "sun"?', display: 'sun', speakText: 'sun', options: [{text:'/s/',speak:'s'},{text:'/n/',speak:'n'},{text:'/m/',speak:'m'},{text:'/r/',speak:'r'}], correct: 0, hint: 'The first letter is S' },
                { difficulty: 2, prompt: 'Which rhymes with "hat"?', display: 'hat', speakText: 'hat', options: [{text:'cat',speak:'cat'},{text:'dog',speak:'dog'},{text:'sun',speak:'sun'},{text:'pig',speak:'pig'}], correct: 0, hint: 'Rhyming words end with the same sound: -at' },
                { difficulty: 2, prompt: 'd_g - what letter is missing?', display: 'd_g', speakText: 'dog', options: [{text:'o',speak:'o'},{text:'a',speak:'a'},{text:'e',speak:'e'},{text:'u',speak:'u'}], correct: 0, hint: 'd-o-g spells "dog"' },
                { difficulty: 2, prompt: 'Which vowel is in "pig"?', display: 'pig', speakText: 'pig', options: [{text:'i',speak:'i'},{text:'a',speak:'a'},{text:'e',speak:'e'},{text:'o',speak:'o'}], correct: 0, hint: 'p-i-g, the middle letter is i' },
                { difficulty: 2, prompt: 'h-a-t makes what word?', display: 'h-a-t', speakText: 'hat', options: [{text:'hat',speak:'hat'},{text:'hot',speak:'hot'},{text:'hit',speak:'hit'},{text:'hut',speak:'hut'}], correct: 0, hint: 'h-a-t' },
                { difficulty: 1, prompt: 'Which means "dog"?', display: 'dog', speakText: 'dog', options: [{text:'dog',speak:'dog'},{text:'cat',speak:'cat'},{text:'bird',speak:'bird'},{text:'fish',speak:'fish'}], correct: 0, hint: 'A dog says "woof woof!"' },
                { difficulty: 3, prompt: 's-u-n makes what word?', display: 's-u-n', speakText: 'sun', options: [{text:'sun',speak:'sun'},{text:'run',speak:'run'},{text:'bun',speak:'bun'},{text:'fun',speak:'fun'}], correct: 0, hint: 's-u-n' },
                { difficulty: 3, prompt: 'I see a ___', display: 'I see a ___', speakText: 'I see a cat', options: [{text:'cat',speak:'cat'},{text:'run',speak:'run'},{text:'big',speak:'big'},{text:'go',speak:'go'}], correct: 0, hint: 'We need a noun (a thing)' },
                { difficulty: 1, prompt: 'Which letter says /d/?', display: '/d/', speakText: 'd', options: [{text:'D',speak:'d'},{text:'B',speak:'b'},{text:'T',speak:'t'},{text:'G',speak:'g'}], correct: 0, hint: 'D says /d/, like in "dog"' },
                { difficulty: 2, prompt: 'b-a-t makes what word?', display: 'b-a-t', speakText: 'bat', options: [{text:'bat',speak:'bat'},{text:'bit',speak:'bit'},{text:'but',speak:'but'},{text:'bet',speak:'bet'}], correct: 0, hint: 'b-a-t' },
                { difficulty: 2, prompt: 'What is the last sound of "sun"?', display: 'sun', speakText: 'sun', options: [{text:'/n/',speak:'n'},{text:'/s/',speak:'s'},{text:'/t/',speak:'t'},{text:'/m/',speak:'m'}], correct: 0, hint: 'The last letter is N' },
                { difficulty: 2, prompt: 'p-i-g makes what word?', display: 'p-i-g', speakText: 'pig', options: [{text:'pig',speak:'pig'},{text:'peg',speak:'peg'},{text:'pug',speak:'pug'},{text:'pen',speak:'pen'}], correct: 0, hint: 'p-i-g' },
                { difficulty: 3, prompt: 'I have a ___', display: 'I have a ___', speakText: 'I have a dog', options: [{text:'dog',speak:'dog'},{text:'blue',speak:'blue'},{text:'jump',speak:'jump'},{text:'fast',speak:'fast'}], correct: 0, hint: 'We need a noun' },
                { difficulty: 1, prompt: 'Which letter says /m/?', display: '/m/', speakText: 'm', options: [{text:'M',speak:'m'},{text:'N',speak:'n'},{text:'L',speak:'l'},{text:'R',speak:'r'}], correct: 0, hint: 'M says /m/, like in "mom"' },
                { difficulty: 2, prompt: 'n-e-t makes what word?', display: 'n-e-t', speakText: 'net', options: [{text:'net',speak:'net'},{text:'nut',speak:'nut'},{text:'not',speak:'not'},{text:'nap',speak:'nap'}], correct: 0, hint: 'n-e-t' },
                { difficulty: 2, prompt: 'Which rhymes with "big"?', display: 'big', speakText: 'big', options: [{text:'pig',speak:'pig'},{text:'cat',speak:'cat'},{text:'dog',speak:'dog'},{text:'sun',speak:'sun'}], correct: 0, hint: 'Rhyming words end with -ig' },
                { difficulty: 3, prompt: 'r-u-n makes what word?', display: 'r-u-n', speakText: 'run', options: [{text:'run',speak:'run'},{text:'ran',speak:'ran'},{text:'sun',speak:'sun'},{text:'bun',speak:'bun'}], correct: 0, hint: 'r-u-n' },
                { difficulty: 1, prompt: 'Which means "cat"?', display: 'cat', speakText: 'cat', options: [{text:'cat',speak:'cat'},{text:'dog',speak:'dog'},{text:'bird',speak:'bird'},{text:'fish',speak:'fish'}], correct: 0, hint: 'A cat says "meow!"' },
                { difficulty: 2, prompt: 'Which vowel is in "hat"?', display: 'hat', speakText: 'hat', options: [{text:'a',speak:'a'},{text:'i',speak:'i'},{text:'e',speak:'e'},{text:'o',speak:'o'}], correct: 0, hint: 'h-a-t, the middle letter is a' },
                { difficulty: 2, prompt: 'l-e-g makes what word?', display: 'l-e-g', speakText: 'leg', options: [{text:'leg',speak:'leg'},{text:'log',speak:'log'},{text:'lag',speak:'lag'},{text:'lid',speak:'lid'}], correct: 0, hint: 'l-e-g' },
                { difficulty: 3, prompt: 'She can ___', display: 'She can ___', speakText: 'She can run', options: [{text:'run',speak:'run'},{text:'cat',speak:'cat'},{text:'red',speak:'red'},{text:'sun',speak:'sun'}], correct: 0, hint: 'We need a verb (an action)' },
                { difficulty: 1, prompt: 'Which letter says /s/?', display: '/s/', speakText: 's', options: [{text:'S',speak:'s'},{text:'Z',speak:'z'},{text:'F',speak:'f'},{text:'T',speak:'t'}], correct: 0, hint: 'S says /s/, like in "sun"' },
                { difficulty: 2, prompt: 'Which rhymes with "sun"?', display: 'sun', speakText: 'sun', options: [{text:'run',speak:'run'},{text:'cat',speak:'cat'},{text:'hat',speak:'hat'},{text:'pig',speak:'pig'}], correct: 0, hint: 'Rhyming words end with -un' },
                { difficulty: 3, prompt: 'h-o-t makes what word?', display: 'h-o-t', speakText: 'hot', options: [{text:'hot',speak:'hot'},{text:'hat',speak:'hat'},{text:'hit',speak:'hit'},{text:'hut',speak:'hut'}], correct: 0, hint: 'h-o-t' },
                { difficulty: 2, prompt: 'What is the first sound of "dog"?', display: 'dog', speakText: 'dog', options: [{text:'/d/',speak:'d'},{text:'/g/',speak:'g'},{text:'/o/',speak:'o'},{text:'/m/',speak:'m'}], correct: 0, hint: 'The first letter is D' },
                { difficulty: 1, prompt: 'Which means "fish"?', display: 'fish', speakText: 'fish', options: [{text:'fish',speak:'fish'},{text:'dog',speak:'dog'},{text:'cat',speak:'cat'},{text:'bird',speak:'bird'}], correct: 0, hint: 'A fish swims in water' },
                { difficulty: 2, prompt: 'm-a-p makes what word?', display: 'm-a-p', speakText: 'map', options: [{text:'map',speak:'map'},{text:'mop',speak:'mop'},{text:'mip',speak:'mip'},{text:'mug',speak:'mug'}], correct: 0, hint: 'm-a-p' },
                { difficulty: 3, prompt: 'The ___ is big', display: 'The ___ is big', speakText: 'The dog is big', options: [{text:'dog',speak:'dog'},{text:'run',speak:'run'},{text:'fast',speak:'fast'},{text:'jump',speak:'jump'}], correct: 0, hint: 'We need a noun' }
            ]
        },
        reading: {
            title: '阅读花园 · 每日练习', color: '#FF9F43', bg: '#FFF3E6', lang: null, hasAudio: false,
            questions: [
                { difficulty: 1, prompt: '"日"是什么意思？', svgType: 'reading', chars: ['日','是','什么'], highlights: [0], options: [{text:'太阳'},{text:'月亮'},{text:'星星'},{text:'云朵'}], correct: 0, hint: '日就是太阳' },
                { difficulty: 1, prompt: '"水"是什么意思？', svgType: 'reading', chars: ['水','是','什么'], highlights: [0], options: [{text:'水'},{text:'火'},{text:'土'},{text:'木'}], correct: 0, hint: '喝水的水' },
                { difficulty: 2, prompt: '"大"是什么意思？', svgType: 'reading', chars: ['大','是','什么'], highlights: [0], options: [{text:'很大'},{text:'很小'},{text:'不多'},{text:'中间'}], correct: 0, hint: '大象的大' },
                { difficulty: 2, prompt: '小兔子___萝卜', svgType: 'reading', chars: ['小兔子','___','萝卜'], highlights: [1], options: [{text:'爱吃'},{text:'讨厌'},{text:'害怕'},{text:'不看'}], correct: 0, hint: '小兔子最喜欢吃萝卜' },
                { difficulty: 2, prompt: '天上有___', svgType: 'reading', chars: ['天上有','___',''], highlights: [1], options: [{text:'白云'},{text:'小鱼'},{text:'草地'},{text:'大树'}], correct: 0, hint: '天上飘着什么？' },
                { difficulty: 3, prompt: '___是森林之王', svgType: 'reading', chars: ['___','是','森林之王'], highlights: [0], options: [{text:'老虎'},{text:'兔子'},{text:'小鸟'},{text:'蚂蚁'}], correct: 0, hint: '谁最威风？' },
                { difficulty: 1, prompt: '"口"是什么意思？', svgType: 'reading', chars: ['口','是','什么'], highlights: [0], options: [{text:'嘴巴'},{text:'眼睛'},{text:'耳朵'},{text:'鼻子'}], correct: 0, hint: '口就是嘴巴' },
                { difficulty: 2, prompt: '"上"是什么意思？', svgType: 'reading', chars: ['上','是','什么'], highlights: [0], options: [{text:'上面'},{text:'下面'},{text:'左边'},{text:'右边'}], correct: 0, hint: '上下左右' },
                { difficulty: 3, prompt: '小鸟在___上唱歌', svgType: 'reading', chars: ['小鸟在','___','唱歌'], highlights: [1], options: [{text:'树'},{text:'水里'},{text:'地下'},{text:'火里'}], correct: 0, hint: '小鸟在哪里唱歌？' },
                { difficulty: 2, prompt: '"多"的反义词是？', svgType: 'reading', chars: ['多的','反义词','是？'], highlights: [2], options: [{text:'少'},{text:'大'},{text:'高'},{text:'好'}], correct: 0, hint: '多的反义词' },
                { difficulty: 1, prompt: '"月"是什么意思？', svgType: 'reading', chars: ['月','是','什么'], highlights: [0], options: [{text:'月亮'},{text:'太阳'},{text:'星星'},{text:'云朵'}], correct: 0, hint: '月就是月亮' },
                { difficulty: 1, prompt: '"山"是什么意思？', svgType: 'reading', chars: ['山','是','什么'], highlights: [0], options: [{text:'高山'},{text:'大河'},{text:'大海'},{text:'平原'}], correct: 0, hint: '爬山的山' },
                { difficulty: 2, prompt: '"小"的反义词是？', svgType: 'reading', chars: ['小的','反义词','是？'], highlights: [2], options: [{text:'大'},{text:'多'},{text:'高'},{text:'长'}], correct: 0, hint: '小的反义词' },
                { difficulty: 2, prompt: '雨后天上有___', svgType: 'reading', chars: ['雨后天上','有','___'], highlights: [2], options: [{text:'彩虹'},{text:'小鱼'},{text:'草地'},{text:'大树'}], correct: 0, hint: '雨后天空会出现什么？' },
                { difficulty: 2, prompt: '太阳从___升起', svgType: 'reading', chars: ['太阳从','___','升起'], highlights: [1], options: [{text:'东边'},{text:'西边'},{text:'南边'},{text:'北边'}], correct: 0, hint: '太阳从东边升起' },
                { difficulty: 1, prompt: '"木"是什么意思？', svgType: 'reading', chars: ['木','是','什么'], highlights: [0], options: [{text:'树木'},{text:'石头'},{text:'水'},{text:'火'}], correct: 0, hint: '木就是树木' },
                { difficulty: 2, prompt: '"高"的反义词是？', svgType: 'reading', chars: ['高的','反义词','是？'], highlights: [2], options: [{text:'矮'},{text:'大'},{text:'多'},{text:'长'}], correct: 0, hint: '高的反义词' },
                { difficulty: 2, prompt: '小鱼在___里游', svgType: 'reading', chars: ['小鱼在','___','里游'], highlights: [1], options: [{text:'水'},{text:'天空'},{text:'树上'},{text:'地下'}], correct: 0, hint: '小鱼在哪里游？' },
                { difficulty: 3, prompt: '春天___开了', svgType: 'reading', chars: ['春天','___','开了'], highlights: [1], options: [{text:'花'},{text:'雪'},{text:'叶子'},{text:'果实'}], correct: 0, hint: '春天什么开了？' },
                { difficulty: 1, prompt: '"火"是什么意思？', svgType: 'reading', chars: ['火','是','什么'], highlights: [0], options: [{text:'火焰'},{text:'水'},{text:'风'},{text:'雨'}], correct: 0, hint: '火就是火焰' },
                { difficulty: 2, prompt: '"长"的反义词是？', svgType: 'reading', chars: ['长的','反义词','是？'], highlights: [2], options: [{text:'短'},{text:'大'},{text:'高'},{text:'多'}], correct: 0, hint: '长的反义词' },
                { difficulty: 3, prompt: '秋天___变黄了', svgType: 'reading', chars: ['秋天','___','变黄了'], highlights: [1], options: [{text:'树叶'},{text:'雪花'},{text:'花朵'},{text:'小草'}], correct: 0, hint: '秋天什么变黄了？' },
                { difficulty: 1, prompt: '"手"是什么意思？', svgType: 'reading', chars: ['手','是','什么'], highlights: [0], options: [{text:'手掌'},{text:'脚'},{text:'头'},{text:'肚子'}], correct: 0, hint: '手就是手掌' },
                { difficulty: 2, prompt: '猫喜欢抓___', svgType: 'reading', chars: ['猫喜欢','抓','___'], highlights: [2], options: [{text:'老鼠'},{text:'鱼'},{text:'鸟'},{text:'虫子'}], correct: 0, hint: '猫最喜欢抓什么？' },
                { difficulty: 3, prompt: '"快"的反义词是？', svgType: 'reading', chars: ['快的','反义词','是？'], highlights: [2], options: [{text:'慢'},{text:'大'},{text:'高'},{text:'多'}], correct: 0, hint: '快的反义词' },
                { difficulty: 1, prompt: '"天"是什么意思？', svgType: 'reading', chars: ['天','是','什么'], highlights: [0], options: [{text:'天空'},{text:'大地'},{text:'海洋'},{text:'高山'}], correct: 0, hint: '天就是天空' },
                { difficulty: 2, prompt: '晚上天上有很多___', svgType: 'reading', chars: ['晚上天上','有很多','___'], highlights: [2], options: [{text:'星星'},{text:'白云'},{text:'彩虹'},{text:'太阳'}], correct: 0, hint: '晚上天上有星星' },
                { difficulty: 1, prompt: '"目"是什么意思？', svgType: 'reading', chars: ['目','是','什么'], highlights: [0], options: [{text:'眼睛'},{text:'嘴巴'},{text:'耳朵'},{text:'鼻子'}], correct: 0, hint: '目就是眼睛' },
                { difficulty: 2, prompt: '"白"的反义词是？', svgType: 'reading', chars: ['白的','反义词','是？'], highlights: [2], options: [{text:'黑'},{text:'红'},{text:'蓝'},{text:'绿'}], correct: 0, hint: '白的反义词' },
                { difficulty: 3, prompt: '冬天___飘下来了', svgType: 'reading', chars: ['冬天','___','飘下来了'], highlights: [1], options: [{text:'雪花'},{text:'花瓣'},{text:'树叶'},{text:'雨滴'}], correct: 0, hint: '冬天飘什么？' }
            ]
        }
    };

    // ===== Daily Progress (localStorage) =====
    function getTodayKey() {
        var d = new Date();
        return 'wmy_' + d.getFullYear() + '_' + (d.getMonth() + 1) + '_' + d.getDate();
    }

    function getDailyProgress() {
        try {
            var data = localStorage.getItem(getTodayKey());
            return data ? JSON.parse(data) : { completed: [], stars: 0, subjects: {} };
        } catch (e) {
            return { completed: [], stars: 0, subjects: {} };
        }
    }

    function saveDailyProgress(progress) {
        try { localStorage.setItem(getTodayKey(), JSON.stringify(progress)); } catch (e) {}
    }

    // ===== Data Clear (version-based) =====
    function clearOldDataIfNeeded() {
        try {
            var version = localStorage.getItem('wmy_data_version');
            if (version !== DATA_VERSION) {
                var keys = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (k && k.indexOf('wmy_') === 0) keys.push(k);
                }
                keys.forEach(function(k) { localStorage.removeItem(k); });
                localStorage.setItem('wmy_data_version', DATA_VERSION);
            }
        } catch(e) {}
    }

    // ===== Farm State =====
    function getFarmState() {
        try {
            var data = localStorage.getItem('wmy_farm');
            if (data) return JSON.parse(data);
        } catch(e) {}
        return { animals: {}, food: {}, coins: 0, totalFed: 0 };
    }

    function saveFarmState(state) {
        try { localStorage.setItem('wmy_farm', JSON.stringify(state)); } catch(e) {}
    }

    // ===== Check-in State =====
    function getCheckinState() {
        try {
            var data = localStorage.getItem('wmy_checkin');
            if (data) return JSON.parse(data);
        } catch(e) {}
        return { lastCheckIn: null, streak: 0, history: [], milestonesClaimed: [] };
    }

    function saveCheckinState(state) {
        try { localStorage.setItem('wmy_checkin', JSON.stringify(state)); } catch(e) {}
    }

    function dateStr(d) {
        if (!d) d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    function isConsecutive(prevStr, currStr) {
        if (!prevStr) return false;
        var p = prevStr.split('-'), c = currStr.split('-');
        var prev = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
        var curr = new Date(parseInt(c[0]), parseInt(c[1]) - 1, parseInt(c[2]));
        var diff = (curr - prev) / 86400000;
        return diff === 1;
    }

    function daysBetween(prevStr, currStr) {
        if (!prevStr) return Infinity;
        var p = prevStr.split('-'), c = currStr.split('-');
        var prev = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
        var curr = new Date(parseInt(c[0]), parseInt(c[1]) - 1, parseInt(c[2]));
        return (curr - prev) / 86400000;
    }

    // ===== Wrong Answer Tracking =====
    function getWrongKey(date) {
        if (!date) date = new Date();
        return 'wmy_wrong_' + date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate();
    }

    function saveWrongAnswers(subject, questions, answers) {
        try {
            var key = getWrongKey();
            var data = JSON.parse(localStorage.getItem(key) || '{}');
            if (!data[subject]) data[subject] = [];
            for (var k in answers) {
                var qi = parseInt(k);
                if (answers[qi] !== questions[qi].correct) {
                    data[subject].push({ q: questions[qi], userAns: answers[qi] });
                }
            }
            localStorage.setItem(key, JSON.stringify(data));
        } catch(e) {}
    }

    function getYesterdayWrongAnswers() {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        try { return JSON.parse(localStorage.getItem(getWrongKey(yesterday)) || '{}'); }
        catch(e) { return {}; }
    }

    function hasYesterdayWrong() {
        var wrong = getYesterdayWrongAnswers();
        var total = 0;
        for (var s in wrong) total += wrong[s].length;
        return total > 0;
    }

    function getYesterdayWrongCount() {
        var wrong = getYesterdayWrongAnswers();
        var total = 0;
        for (var s in wrong) total += wrong[s].length;
        return total;
    }

    // ===== Random Question Selection (seeded daily rotation) =====
    function getDailyQuestions(subject) {
        var bank = questionBanks[subject];
        if (!bank) return [];
        var d = new Date();
        var dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
        var seed = dayOfYear + subject.charCodeAt(0) * 100;
        var shuffled = seededShuffle(bank.questions, seed);
        return shuffled.slice(0, QUESTIONS_PER_QUIZ);
    }

    // ===== State =====
    var currentSubject = 'math';
    var currentQIndex = 0;
    var currentQuestions = [];
    var userAnswers = {};
    var showResult = false;
    var correctStreak = 0;
    var autoAdvanceTimer = null;

    // ===== DOM refs =====
    var pageTitle = document.getElementById('pageTitle');
    var sidebarItems = document.querySelectorAll('.sidebar .nav-item');
    var bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    var subjectCards = document.querySelectorAll('.subject-card');
    var quizScreen = document.getElementById('screen-quiz');
    var progressTrackContainer = document.getElementById('progressTrackContainer');
    var questionCard = document.getElementById('questionCard');
    var questionBadge = document.getElementById('questionBadge');
    var difficultyStars = document.getElementById('difficultyStars');
    var streakText = document.getElementById('streakText');
    var mascotText = document.getElementById('mascotText');
    var questionContent = document.getElementById('questionContent');
    var answerGrid = document.getElementById('answerGrid');
    var speakQuestionBtn = document.getElementById('speakQuestionBtn');
    var hintBtn = document.getElementById('hintBtn');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    var nextBtnText = document.getElementById('nextBtnText');

    // ===== Screen switching =====
    var screenConfig = {
        map: { id: 'screen-map', title: '暑假冒险大地图' },
        report: { id: 'screen-report', title: '能力评估报告' },
        quiz: { id: 'screen-quiz', title: '每日练习 · 答题闯关' },
        piano: { id: 'screen-piano', title: '钢琴音塔 · 每日练习' },
        chess: { id: 'screen-chess', title: '象棋王国 · 对战训练' },
        review: { id: 'screen-quiz', title: '错题复习' },
        tasks: { id: 'screen-map', title: '今日任务', scrollTarget: '.task-list' },
        errors: { id: 'screen-report', title: '错题巩固' },
        farm: { id: 'screen-farm', title: '孟原的小农场' }
    };

    function switchScreen(target) {
        var config = screenConfig[target];
        if (!config) return;
        document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
        var screenEl = document.getElementById(config.id);
        if (screenEl) screenEl.classList.add('active');
        pageTitle.textContent = config.title;
        sidebarItems.forEach(function(item) { item.classList.toggle('active', item.dataset.screen === target); });
        bottomNavItems.forEach(function(item) { item.classList.toggle('active', item.dataset.screen === target); });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (config.scrollTarget) {
            setTimeout(function() {
                var el = document.querySelector(config.scrollTarget);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }
        if (target === 'achievements') showToast('成就墙即将开放，敬请期待！');
        if (target === 'farm') renderFarm();
        if (target === 'map' || target === 'tasks') { updateMapStats(); updateSubjectCards(); }
    }

    sidebarItems.forEach(function(item) { item.addEventListener('click', function() { switchScreen(item.dataset.screen); }); });
    bottomNavItems.forEach(function(item) { item.addEventListener('click', function() { switchScreen(item.dataset.screen); }); });

    // ===== Progress Track Generator =====
    function generateProgressTrack(subjectColor, currentIndex, answers) {
        var total = QUESTIONS_PER_QUIZ;
        var spacing = 90, startX = 45, r = 14, rActive = 22;
        var svg = '<svg viewBox="0 0 900 50" class="progress-track-svg" xmlns="http://www.w3.org/2000/svg">';
        for (var i = 0; i < total - 1; i++) {
            var x1 = startX + i * spacing, x2 = startX + (i + 1) * spacing;
            var aDone = answers[i] !== undefined, bDone = answers[i + 1] !== undefined;
            var color = (aDone && bDone) ? '#7BB661' : '#E0D8CC';
            svg += '<line x1="' + x1 + '" y1="25" x2="' + x2 + '" y2="25" stroke="' + color + '" stroke-width="2" stroke-dasharray="4 4"/>';
        }
        for (var j = 0; j < total; j++) {
            var cx = startX + j * spacing;
            var answered = answers[j] !== undefined;
            var isCurrent = j === currentIndex;
            if (answered) {
                svg += '<circle cx="' + cx + '" cy="25" r="' + r + '" fill="#7BB661"/>';
                svg += '<path d="M' + (cx-7) + ' 25L' + (cx-2) + ' 30L' + (cx+7) + ' 20" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
            } else if (isCurrent) {
                svg += '<circle cx="' + cx + '" cy="25" r="' + rActive + '" fill="' + subjectColor + '"/>';
                svg += '<circle cx="' + cx + '" cy="25" r="' + (rActive + 4) + '" fill="none" stroke="' + subjectColor + '" stroke-width="2" stroke-opacity="0.3"/>';
                svg += '<text x="' + cx + '" y="31" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">' + (j + 1) + '</text>';
            } else {
                svg += '<circle cx="' + cx + '" cy="25" r="' + r + '" fill="#F0E6D6"/>';
                svg += '<text x="' + cx + '" y="30" font-size="12" font-weight="600" fill="#5C5147" text-anchor="middle">' + (j + 1) + '</text>';
            }
        }
        svg += '</svg>';
        return svg;
    }

    // ===== Difficulty Stars =====
    function generateStars(level) {
        var svg = '<svg viewBox="0 0 72 24" fill="none">';
        for (var i = 0; i < 3; i++) {
            var x = 12 + i * 24;
            var fill = i < level ? '#FFC857' : '#E0D8CC';
            svg += '<path d="M' + x + ' 2L' + (x+2) + ' 8L' + (x+8) + ' 8.5L' + (x+3.5) + ' 12.5L' + (x+5) + ' 18.5L' + x + ' 15.5L' + (x-5) + ' 18.5L' + (x-3.5) + ' 12.5L' + (x-8) + ' 8.5L' + (x-2) + ' 8L' + x + ' 2Z" fill="' + fill + '"/>';
        }
        svg += '</svg>';
        return svg;
    }

    // ===== Question Content SVG Generator =====
    function generateQuestionSVG(subject, q) {
        if (subject === 'pinyin') return svgText(q.display, q.prompt, '#FF8C7A');
        if (subject === 'math') return svgMath(q.equation, q.tfA, q.tfB);
        if (subject === 'english') return svgText(q.display, q.prompt, '#7BB661');
        if (subject === 'piano') return svgPiano(q.highlight, q.label);
        if (subject === 'chess') return svgChess(q.piece, q.pieceColor);
        if (subject === 'reading') return svgReading(q.chars, q.highlights);
        return svgText(q.display || '', q.prompt);
    }

    // ===== Render Question =====
    function renderQuestion() {
        var bank = questionBanks[currentSubject];
        if (!bank || !currentQuestions.length) return;
        var q = currentQuestions[currentQIndex];
        if (!q) return;

        pageTitle.textContent = bank.title;

        if (progressTrackContainer) {
            progressTrackContainer.innerHTML = generateProgressTrack(bank.color, currentQIndex, userAnswers[currentSubject] || {});
        }
        if (questionCard) {
            questionCard.style.background = bank.bg;
            questionCard.style.boxShadow = '0 4px 20px ' + bank.color + '1F';
        }
        if (questionBadge) {
            questionBadge.style.background = bank.color;
            questionBadge.textContent = '第' + (currentQIndex + 1) + '题';
        }
        if (difficultyStars) {
            difficultyStars.innerHTML = generateStars(q.difficulty);
        }
        if (streakText) {
            streakText.textContent = '连对' + correctStreak + '题';
        }

        var mascotMsgs = ['加油，' + CHILD_NAME + '，你一定能行！', '仔细想一想，' + CHILD_NAME + '，你可以的！', CHILD_NAME + '，慢慢来，不着急！', CHILD_NAME + '，再看看题目吧！'];
        if (mascotText) mascotText.textContent = mascotMsgs[currentQIndex % mascotMsgs.length];

        if (questionContent) {
            questionContent.innerHTML = generateQuestionSVG(currentSubject, q);
        }

        if (speakQuestionBtn) {
            if (bank.hasAudio) {
                speakQuestionBtn.style.display = 'flex';
                speakQuestionBtn.style.color = bank.color;
                speakQuestionBtn.onclick = function() { speak(q.speakText || q.display, bank.lang); };
            } else {
                speakQuestionBtn.style.display = 'none';
            }
        }

        renderAnswerOptions(bank, q);

        if (nextBtnText) {
            nextBtnText.textContent = currentQIndex === QUESTIONS_PER_QUIZ - 1 ? '完成' : '下一题';
        }
        if (prevBtn) {
            prevBtn.style.opacity = currentQIndex === 0 ? '0.5' : '1';
            prevBtn.style.pointerEvents = currentQIndex === 0 ? 'none' : 'auto';
        }

        showResult = false;
    }

    // ===== Render Answer Options =====
    function renderAnswerOptions(bank, q) {
        if (!answerGrid) return;
        answerGrid.innerHTML = '';
        var letters = ['A', 'B', 'C', 'D'];

        q.options.forEach(function(opt, idx) {
            var div = document.createElement('div');
            div.className = 'answer-option';
            div.dataset.option = letters[idx];
            div.dataset.index = idx;
            div.style.borderColor = bank.color + '4D';

            var badge = document.createElement('span');
            badge.className = 'option-badge';
            badge.style.background = bank.color;
            badge.textContent = letters[idx];

            var val = document.createElement('span');
            val.className = 'option-value';
            val.textContent = opt.text;

            div.appendChild(badge);
            div.appendChild(val);

            if (bank.hasAudio && opt.speak) {
                var speakBtn = document.createElement('button');
                speakBtn.className = 'option-speak-btn';
                speakBtn.style.color = bank.color;
                speakBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 9V15H8L13 19V5L8 9H4Z" fill="currentColor"/><path d="M16 8C17.5 9 18 10.5 18 12C18 13.5 17.5 15 16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M19 5C21 7 22 9.5 22 12C22 14.5 21 17 19 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
                speakBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    speak(opt.speak, bank.lang);
                    speakBtn.classList.add('speaking');
                    setTimeout(function() { speakBtn.classList.remove('speaking'); }, 1000);
                });
                div.appendChild(speakBtn);
            }

            div.addEventListener('click', function() {
                if (showResult) return;
                if (bank.hasAudio && opt.speak) {
                    speak(opt.speak, bank.lang);
                }
                selectAnswer(idx, div, bank, q);
            });

            answerGrid.appendChild(div);
        });

        var answered = (userAnswers[currentSubject] || {})[currentQIndex];
        if (answered !== undefined) {
            var opts = answerGrid.querySelectorAll('.answer-option');
            showResult = true;
            if (answered === q.correct) {
                opts[answered].classList.add('correct');
                opts[answered].querySelector('.option-badge').style.background = '#FFFFFF';
                opts[answered].querySelector('.option-value').style.color = '#FFFFFF';
            } else {
                opts[answered].classList.add('wrong');
                opts[q.correct].classList.add('correct');
                opts[q.correct].querySelector('.option-badge').style.background = '#FFFFFF';
                opts[q.correct].querySelector('.option-value').style.color = '#FFFFFF';
            }
        }
    }

    // ===== Select Answer (with auto-advance) =====
    function selectAnswer(idx, optionEl, bank, q) {
        answerGrid.querySelectorAll('.answer-option').forEach(function(o) {
            o.classList.remove('selected');
            var b = o.querySelector('.option-badge');
            var v = o.querySelector('.option-value');
            if (b) { b.style.background = bank.color; b.style.color = '#FFFFFF'; }
            if (v) v.style.color = '#2D2A26';
        });

        optionEl.classList.add('selected');

        setTimeout(function() {
            var opts = answerGrid.querySelectorAll('.answer-option');
            if (!userAnswers[currentSubject]) userAnswers[currentSubject] = {};

            var isCorrect = idx === q.correct;
            if (isCorrect) {
                optionEl.classList.remove('selected');
                optionEl.classList.add('correct');
                optionEl.querySelector('.option-badge').style.background = '#FFFFFF';
                optionEl.querySelector('.option-value').style.color = '#FFFFFF';
                userAnswers[currentSubject][currentQIndex] = idx;
                correctStreak++;
                showToast('答对啦！' + CHILD_NAME + '真棒！');
                if (mascotText) mascotText.textContent = '太棒了！答对啦！';
            } else {
                optionEl.classList.add('wrong');
                var correctOpt = opts[q.correct];
                if (correctOpt) {
                    correctOpt.classList.add('correct');
                    correctOpt.querySelector('.option-badge').style.background = '#FFFFFF';
                    correctOpt.querySelector('.option-value').style.color = '#FFFFFF';
                }
                userAnswers[currentSubject][currentQIndex] = idx;
                correctStreak = 0;
                showToast('没关系，' + CHILD_NAME + '，下次一定行！');
                if (mascotText) mascotText.textContent = '没关系，下次一定行！';
            }

            if (streakText) streakText.textContent = '连对' + correctStreak + '题';
            showResult = true;

            // Auto-advance after 1.8s
            if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
            autoAdvanceTimer = setTimeout(function() {
                autoAdvanceToNext();
            }, 1800);
        }, 400);
    }

    // ===== Auto-advance to next question =====
    function autoAdvanceToNext() {
        var bank = questionBanks[currentSubject];
        if (currentQIndex < currentQuestions.length - 1) {
            currentQIndex++;
            renderQuestion();
        } else {
            completeQuiz();
        }
    }

    // ===== Complete Quiz =====
    function completeQuiz() {
        var answers = userAnswers[currentSubject] || {};
        var correctCount = 0;
        for (var k in answers) {
            var qi = parseInt(k);
            if (answers[qi] === currentQuestions[qi].correct) correctCount++;
        }
        var stars = correctCount * 2;

        // Save to daily progress
        var progress = getDailyProgress();
        if (progress.completed.indexOf(currentSubject) < 0) {
            progress.completed.push(currentSubject);
        }
        progress.subjects[currentSubject] = { correct: correctCount, total: QUESTIONS_PER_QUIZ, stars: stars };
        progress.stars = 0;
        progress.completed.forEach(function(subj) {
            if (progress.subjects[subj]) {
                progress.stars += progress.subjects[subj].stars;
            }
        });
        saveDailyProgress(progress);

        // Save wrong answers for next-day review
        saveWrongAnswers(currentSubject, currentQuestions, answers);
        var foodItem = null;
        for (var fi = 0; fi < FARM_FOODS.length; fi++) {
            if (FARM_FOODS[fi].subject === currentSubject) {
                foodItem = FARM_FOODS[fi];
                break;
            }
        }
        var foodEarned = correctCount;
        var foodMsg = '';
        if (foodItem && foodEarned > 0) {
            var farmState = getFarmState();
            if (!farmState.food[foodItem.id]) farmState.food[foodItem.id] = 0;
            farmState.food[foodItem.id] += foodEarned;
            saveFarmState(farmState);
            foodMsg = ' 获得' + foodItem.emoji + foodItem.name + '×' + foodEarned + '！';
        }

        // Show star collection animation
        showStarAnimation(currentSubject, correctCount, stars, function() {
            // After animation, check if all 6 subjects done today
            if (progress.completed.length >= 6) {
                showCelebration(function() {
                    switchScreen('map');
                    updateCheckinUI();
                });
            } else {
                showToast(CHILD_NAME + '已完成' + progress.completed.length + '/6个关卡' + foodMsg + ' 继续加油！');
                setTimeout(function() { switchScreen('map'); updateCheckinUI(); }, 1500);
            }
        });
    }

    // ===== Star Collection Animation =====
    function showStarAnimation(subject, correctCount, stars, callback) {
        var bank = questionBanks[subject];
        var overlay = document.createElement('div');
        overlay.className = 'star-anim-overlay';

        var starsHtml = '';
        for (var i = 0; i < Math.min(stars, 20); i++) {
            starsHtml += '<div class="star-particle" style="animation-delay:' + (i * 0.08) + 's;">' +
                '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 8.5L21 9.3L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9.3L9.5 8.5L12 2Z" fill="#FFC857" stroke="#E5AB30" stroke-width="1"/></svg>' +
                '</div>';
        }

        overlay.innerHTML =
            '<div class="star-anim-card">' +
                '<div class="star-anim-mascot">' +
                    '<svg viewBox="0 0 80 80" fill="none">' +
                        '<circle cx="20" cy="20" r="10" fill="#FFC857"/><circle cx="60" cy="20" r="10" fill="#FFC857"/>' +
                        '<circle cx="40" cy="42" r="30" fill="#FFC857"/>' +
                        '<circle cx="30" cy="38" r="4" fill="#2D2A26"/><circle cx="50" cy="38" r="4" fill="#2D2A26"/>' +
                        '<path d="M30 48C35 54 38 56 40 56C42 56 45 54 50 48" stroke="#2D2A26" stroke-width="3" stroke-linecap="round" fill="none"/>' +
                        '<circle cx="22" cy="46" r="4" fill="#FF8C7A" fill-opacity="0.5"/><circle cx="58" cy="46" r="4" fill="#FF8C7A" fill-opacity="0.5"/>' +
                    '</svg>' +
                '</div>' +
                '<h2 class="star-anim-title">' + CHILD_NAME + '，太棒了！</h2>' +
                '<p class="star-anim-subtitle">' + bank.title.replace(' · 每日练习', '') + ' 通关！</p>' +
                '<div class="star-anim-score">' +
                    '<span class="score-correct">' + correctCount + '</span><span class="score-sep">/</span><span class="score-total">10</span>' +
                '</div>' +
                '<div class="star-anim-stars">' + starsHtml + '</div>' +
                '<p class="star-anim-stars-text">收集到 ' + stars + ' 颗星星！</p>' +
                '<div class="star-anim-progress">' +
                    '<span>今日已收集 ' + getDailyProgress().completed.length + ' / 6 个关卡</span>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function() { overlay.classList.add('show'); });

        setTimeout(function() {
            overlay.classList.remove('show');
            setTimeout(function() {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (callback) callback();
            }, 400);
        }, 3500);
    }

    // ===== Celebration Animation (Lingokids-style) =====
    function showCelebration(callback) {
        var overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';

        // Confetti pieces
        var confettiHtml = '';
        var colors = ['#FFC857', '#FF8C7A', '#6BB6E0', '#7BB661', '#B19CD9', '#FF9F43'];
        for (var i = 0; i < 80; i++) {
            var left = Math.random() * 100;
            var delay = Math.random() * 2;
            var duration = 2.5 + Math.random() * 2;
            var color = colors[i % colors.length];
            var size = 8 + Math.random() * 8;
            var rotate = Math.random() * 360;
            confettiHtml += '<div class="confetti" style="left:' + left + '%;animation-delay:' + delay + 's;animation-duration:' + duration + 's;background:' + color + ';width:' + size + 'px;height:' + (size * 1.5) + 'px;transform:rotate(' + rotate + 'deg);"></div>';
        }

        // Animal characters
        var animals = [
            { emoji_svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="32" r="24" fill="#FFC857"/><circle cx="20" cy="26" r="3" fill="#2D2A26"/><circle cx="40" cy="26" r="3" fill="#2D2A26"/><path d="M22 36C26 40 30 42 30 42C30 42 34 40 38 36" stroke="#2D2A26" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="18" cy="34" r="3" fill="#FF8C7A" opacity="0.5"/><circle cx="42" cy="34" r="3" fill="#FF8C7A" opacity="0.5"/><circle cx="15" cy="14" r="8" fill="#FFC857"/><circle cx="45" cy="14" r="8" fill="#FFC857"/></svg>', msg: CHILD_NAME + '，你是最棒的冒险家！' },
            { emoji_svg: '<svg viewBox="0 0 60 60" fill="none"><ellipse cx="30" cy="34" rx="22" ry="20" fill="#7BB661"/><circle cx="20" cy="28" r="4" fill="#FFFFFF"/><circle cx="20" cy="28" r="2" fill="#2D2A26"/><circle cx="40" cy="28" r="4" fill="#FFFFFF"/><circle cx="40" cy="28" r="2" fill="#2D2A26"/><path d="M22 40C26 44 34 44 38 40" stroke="#2D2A26" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="14" cy="20" r="6" fill="#7BB661"/><circle cx="46" cy="20" r="6" fill="#7BB661"/></svg>', msg: '六个关卡全部通关，太厉害啦！' },
            { emoji_svg: '<svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="32" r="24" fill="#6BB6E0"/><circle cx="22" cy="28" r="3" fill="#2D2A26"/><circle cx="38" cy="28" r="3" fill="#2D2A26"/><path d="M24 38C28 42 32 42 36 38" stroke="#2D2A26" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M12 22L18 24M48 22L42 24" stroke="#6BB6E0" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="32" r="3" fill="#FF8C7A" opacity="0.5"/><circle cx="44" cy="32" r="3" fill="#FF8C7A" opacity="0.5"/></svg>', msg: CHILD_NAME + '，今天的你闪闪发光！' }
        ];

        var animalsHtml = animals.map(function(a, i) {
            return '<div class="celebration-animal" style="animation-delay:' + (0.3 + i * 0.2) + 's;">' +
                '<div class="animal-avatar">' + a.emoji_svg + '</div>' +
                '<div class="animal-bubble">' + a.msg + '</div>' +
            '</div>';
        }).join('');

        var progress = getDailyProgress();
        var totalStars = progress.stars;

        overlay.innerHTML =
            '<div class="celebration-confetti">' + confettiHtml + '</div>' +
            '<div class="celebration-content">' +
                '<div class="celebration-trophy">' +
                    '<svg viewBox="0 0 100 100" fill="none">' +
                        '<path d="M30 20H70V40C70 55 60 65 50 65C40 65 30 55 30 40V20Z" fill="#FFC857" stroke="#E5AB30" stroke-width="2"/>' +
                        '<path d="M30 25H15C15 35 22 42 30 42" stroke="#FFC857" stroke-width="4" fill="none"/>' +
                        '<path d="M70 25H85C85 35 78 42 70 42" stroke="#FFC857" stroke-width="4" fill="none"/>' +
                        '<rect x="42" y="65" width="16" height="12" fill="#FFC857"/>' +
                        '<rect x="32" y="77" width="36" height="8" rx="4" fill="#FFC857" stroke="#E5AB30" stroke-width="1.5"/>' +
                        '<path d="M40 30L46 36L60 24" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
                    '</svg>' +
                '</div>' +
                '<h1 class="celebration-title">全部通关！</h1>' +
                '<p class="celebration-subtitle">' + CHILD_NAME + '，你今天完成了全部6个关卡的挑战！</p>' +
                '<div class="celebration-stars">' +
                    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 8.5L21 9.3L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9.3L9.5 8.5L12 2Z" fill="#FFC857" stroke="#E5AB30" stroke-width="1"/></svg>' +
                    '<span>' + totalStars + '</span>' +
                    '<span class="celebration-stars-label">颗星星</span>' +
                '</div>' +
                '<div class="celebration-animals">' + animalsHtml + '</div>' +
                '<button class="celebration-btn">太棒了！返回冒险地图</button>' +
            '</div>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function() { overlay.classList.add('show'); });

        var btn = overlay.querySelector('.celebration-btn');
        if (btn) {
            btn.addEventListener('click', function() {
                overlay.classList.remove('show');
                setTimeout(function() {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    if (callback) callback();
                }, 500);
            });
        }

        // Auto-close after 8 seconds if not clicked
        setTimeout(function() {
            if (overlay.parentNode) {
                overlay.classList.remove('show');
                setTimeout(function() {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    if (callback) callback();
                }, 500);
            }
        }, 8000);
    }

    // ===== Enter Quiz =====
    function enterQuiz(subject) {
        if (subject === 'piano') { enterPianoPractice(); return; }
        if (subject === 'chess') { enterChessTraining(); return; }
        var bank = questionBanks[subject];
        if (!bank) return;
        currentSubject = subject;
        currentQIndex = 0;
        currentQuestions = getDailyQuestions(subject);
        if (!userAnswers[subject]) userAnswers[subject] = {};
        correctStreak = 0;
        if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }

        renderQuestion();

        document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
        quizScreen.classList.add('active');
        sidebarItems.forEach(function(item) { item.classList.remove('active'); });
        bottomNavItems.forEach(function(item) { item.classList.remove('active'); });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== Piano Practice Integration =====
    function enterPianoPractice() {
        currentSubject = 'piano';
        document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
        var pianoScreen = document.getElementById('screen-piano');
        if (pianoScreen) pianoScreen.classList.add('active');
        else { quizScreen.classList.add('active'); }
        pageTitle.textContent = '钢琴音塔 · 每日练习';
        sidebarItems.forEach(function(item) { item.classList.remove('active'); });
        bottomNavItems.forEach(function(item) { item.classList.remove('active'); });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        var container = document.getElementById('pianoContainer');
        if (container && window.PianoModule) {
            window.PianoModule.renderPianoPractice(container, function(correct, total) {
                completePianoPractice(correct, total);
            });
        }
    }

    function completePianoPractice(correct, total) {
        var stars = Math.round(correct / total * 20);
        var progress = getDailyProgress();
        if (progress.completed.indexOf('piano') < 0) progress.completed.push('piano');
        progress.subjects['piano'] = { correct: correct, total: total, stars: stars };
        progress.stars = 0;
        progress.completed.forEach(function(subj) {
            if (progress.subjects[subj]) progress.stars += progress.subjects[subj].stars;
        });
        saveDailyProgress(progress);
        // Award farm food
        var farmState = getFarmState();
        if (!farmState.food['grass']) farmState.food['grass'] = 0;
        farmState.food['grass'] += correct;
        saveFarmState(farmState);
        showStarAnimation('piano', correct, stars, function() {
            if (progress.completed.length >= 6) {
                showCelebration(function() { switchScreen('map'); updateCheckinUI(); });
            } else {
                showToast(CHILD_NAME + '弹完了钢琴练习！获得🌿青草×' + correct + '！');
                setTimeout(function() { switchScreen('map'); updateCheckinUI(); }, 1500);
            }
        });
    }

    // ===== Chess Training Integration =====
    function enterChessTraining() {
        currentSubject = 'chess';
        document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
        var chessScreen = document.getElementById('screen-chess');
        if (chessScreen) chessScreen.classList.add('active');
        else { quizScreen.classList.add('active'); }
        pageTitle.textContent = '象棋王国 · 对战训练';
        sidebarItems.forEach(function(item) { item.classList.remove('active'); });
        bottomNavItems.forEach(function(item) { item.classList.remove('active'); });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        var container = document.getElementById('chessContainer');
        if (container && window.ChessModule) {
            window.ChessModule.renderChessTraining(container, function(correct, total, starsCount) {
                completeChessTraining(correct, total, starsCount);
            });
        }
    }

    function completeChessTraining(correct, total, starsCount) {
        var stars = correct * 2;
        var progress = getDailyProgress();
        if (progress.completed.indexOf('chess') < 0) progress.completed.push('chess');
        progress.subjects['chess'] = { correct: correct, total: total, stars: stars };
        progress.stars = 0;
        progress.completed.forEach(function(subj) {
            if (progress.subjects[subj]) progress.stars += progress.subjects[subj].stars;
        });
        saveDailyProgress(progress);
        // Award farm food
        var farmState = getFarmState();
        if (!farmState.food['slop']) farmState.food['slop'] = 0;
        farmState.food['slop'] += correct;
        saveFarmState(farmState);
        showStarAnimation('chess', correct, stars, function() {
            if (progress.completed.length >= 6) {
                showCelebration(function() { switchScreen('map'); updateCheckinUI(); });
            } else {
                showToast(CHILD_NAME + '完成象棋训练！获得🫘饲料×' + correct + '！');
                setTimeout(function() { switchScreen('map'); updateCheckinUI(); }, 1500);
            }
        });
    }

    // ===== Review Mode (yesterday's wrong answers) =====
    var reviewState = { questions: [], currentIdx: 0, correctCount: 0 };
    function startReview() {
        var wrong = getYesterdayWrongAnswers();
        var questions = [];
        for (var subj in wrong) {
            wrong[subj].forEach(function(item) {
                questions.push({ subject: subj, q: item.q, userAns: item.userAns });
            });
        }
        if (questions.length === 0) { showToast('昨天没有错题，直接开始今天的练习吧！'); return; }
        reviewState.questions = questions;
        reviewState.currentIdx = 0;
        reviewState.correctCount = 0;
        renderReviewQuestion();
    }

    function renderReviewQuestion() {
        if (reviewState.currentIdx >= reviewState.questions.length) {
            // Review complete
            var correct = reviewState.correctCount;
            var total = reviewState.questions.length;
            showToast('复习完成！' + correct + '/' + total + '题答对，开始今天的练习吧！');
            setTimeout(function() { switchScreen('map'); }, 2000);
            return;
        }
        var item = reviewState.questions[reviewState.currentIdx];
        var subj = item.subject;
        var q = item.q;
        var bank = questionBanks[subj];
        if (!bank) { reviewState.currentIdx++; renderReviewQuestion(); return; }

        document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
        quizScreen.classList.add('active');
        pageTitle.textContent = '错题复习 · ' + bank.title.split(' ')[0];

        if (progressTrackContainer) {
            progressTrackContainer.innerHTML = '<div style="text-align:center;padding:8px;color:#FF8C7A;font-weight:700;">复习第 ' + (reviewState.currentIdx + 1) + '/' + reviewState.questions.length + ' 题</div>';
        }
        if (questionCard) {
            questionCard.style.background = '#FFF0EE';
            questionCard.style.boxShadow = '0 4px 20px rgba(255,140,122,0.12)';
        }
        if (questionBadge) {
            questionBadge.style.background = '#FF8C7A';
            questionBadge.textContent = '复习' + (reviewState.currentIdx + 1);
        }
        if (difficultyStars) difficultyStars.innerHTML = generateStars(q.difficulty);
        if (mascotText) mascotText.textContent = CHILD_NAME + '，这是昨天的错题，再试一次！';
        if (questionContent) questionContent.innerHTML = generateQuestionSVG(subj, q);
        if (speakQuestionBtn) {
            if (bank.hasAudio) {
                speakQuestionBtn.style.display = 'flex';
                speakQuestionBtn.style.color = '#FF8C7A';
                speakQuestionBtn.onclick = function() { speak(q.speakText || q.display, bank.lang); };
            } else {
                speakQuestionBtn.style.display = 'none';
            }
        }

        // Render answer options
        answerGrid.innerHTML = '';
        var letters = ['A', 'B', 'C', 'D'];
        q.options.forEach(function(opt, idx) {
            var div = document.createElement('div');
            div.className = 'answer-option';
            div.style.borderColor = 'rgba(255,140,122,0.3)';
            var badge = document.createElement('span');
            badge.className = 'option-badge';
            badge.style.background = '#FF8C7A';
            badge.textContent = letters[idx];
            var val = document.createElement('span');
            val.className = 'option-value';
            val.textContent = opt.text;
            div.appendChild(badge);
            div.appendChild(val);
            if (bank.hasAudio && opt.speak) {
                var speakBtn = document.createElement('button');
                speakBtn.className = 'option-speak-btn';
                speakBtn.style.color = '#FF8C7A';
                speakBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 9V15H8L13 19V5L8 9H4Z" fill="currentColor"/><path d="M16 8C17.5 9 18 10.5 18 12C18 13.5 17.5 15 16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
                speakBtn.addEventListener('click', function(e) { e.stopPropagation(); speak(opt.speak, bank.lang); });
                div.appendChild(speakBtn);
            }
            div.addEventListener('click', function() {
                if (showResult) return;
                showResult = true;
                if (idx === q.correct) {
                    div.classList.add('correct');
                    div.querySelector('.option-badge').style.background = '#FFFFFF';
                    div.querySelector('.option-value').style.color = '#FFFFFF';
                    reviewState.correctCount++;
                    showToast('答对了！这个知识点掌握了！');
                } else {
                    div.classList.add('wrong');
                    var correctOpt = answerGrid.querySelectorAll('.answer-option')[q.correct];
                    if (correctOpt) {
                        correctOpt.classList.add('correct');
                        correctOpt.querySelector('.option-badge').style.background = '#FFFFFF';
                        correctOpt.querySelector('.option-value').style.color = '#FFFFFF';
                    }
                    showToast('没关系，记住正确答案：' + q.options[q.correct].text);
                }
                setTimeout(function() {
                    showResult = false;
                    reviewState.currentIdx++;
                    renderReviewQuestion();
                }, 2000);
            });
            answerGrid.appendChild(div);
        });

        if (nextBtnText) nextBtnText.textContent = '下一题';
        if (prevBtn) { prevBtn.style.opacity = '0.5'; prevBtn.style.pointerEvents = 'none'; }
    }

    subjectCards.forEach(function(card) {
        card.addEventListener('click', function() { enterQuiz(card.dataset.subject); });
    });

    // Review button handler
    var reviewBtn = document.getElementById('reviewBtn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', function() { startReview(); });
    }

    // ===== Navigation =====
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (!showResult) { showToast('请先选择一个答案'); return; }
            if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
            autoAdvanceToNext();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentQIndex > 0) {
                if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
                currentQIndex--;
                renderQuestion();
            }
        });
    }

    if (hintBtn) {
        hintBtn.addEventListener('click', function() {
            var q = currentQuestions[currentQIndex];
            showToast('提示：' + (q.hint || '仔细看题目哦'));
        });
    }

    // ===== Task Item Click =====
    document.querySelectorAll('.task-item').forEach(function(item) {
        item.addEventListener('click', function() {
            if (item.classList.contains('completed')) {
                showToast('这个任务已完成啦');
                return;
            }
            var taskName = item.querySelector('.task-name');
            if (taskName) showToast('开始任务：' + taskName.textContent);
        });
    });

    // ===== Toast =====
    var toastTimer = null;
    function showToast(message) {
        var toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = [
                'position: fixed', 'bottom: 90px', 'left: 50%',
                'transform: translateX(-50%) translateY(20px)',
                'background: rgba(45, 42, 38, 0.92)', 'color: #FFFFFF',
                'padding: 12px 24px', 'border-radius: 16px',
                'font-size: 14px', 'font-weight: 500', 'z-index: 99999',
                'opacity: 0', 'transition: opacity 0.3s ease, transform 0.3s ease',
                'pointer-events: none', 'max-width: 90vw', 'text-align: center',
                'box-shadow: 0 4px 20px rgba(0,0,0,0.15)',
                'backdrop-filter: blur(10px)', '-webkit-backdrop-filter: blur(10px)',
                'font-family: inherit'
            ].join(';');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        if (window.innerWidth <= 768) toast.style.bottom = '80px';
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2500);
    }

    // ===== Animate Progress Bars =====
    function animateProgressBars() {
        document.querySelectorAll('.progress-fill, .ability-fill').forEach(function(fill) {
            var w = fill.style.width;
            fill.style.width = '0';
            requestAnimationFrame(function() { setTimeout(function() { fill.style.width = w; }, 100); });
        });
    }

    // ===== Set Daily Welcome Message =====
    function setDailyWelcome() {
        var heroTitle = document.querySelector('.hero-title');
        var heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroTitle) heroTitle.textContent = getDailyWelcomeMessage();
        if (heroSubtitle) {
            var progress = getDailyProgress();
            var done = progress.completed.length;
            if (done === 0) {
                heroSubtitle.textContent = '今天有6个关卡等你挑战，收集星星吧！';
            } else if (done < 6) {
                heroSubtitle.textContent = '已完成' + done + '/6个关卡，继续加油！';
            } else {
                heroSubtitle.textContent = '今天的6个关卡全部完成啦！太棒了！';
            }
        }
        updateMapStats();
        updateHeroProgress();
    }

    // ===== Update Map Stats =====
    function updateMapStats() {
        var progress = getDailyProgress();
        var checkinState = getCheckinState();

        // Calculate total stars today
        var totalStars = progress.stars || 0;
        var completedCount = progress.completed.length;

        // Update stat cards
        var statValues = document.querySelectorAll('.stat-card .stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = totalStars;
            statValues[1].textContent = completedCount + '关';

            // Calculate accuracy
            var totalCorrect = 0, totalAnswered = 0;
            for (var subj in progress.subjects) {
                totalCorrect += progress.subjects[subj].correct || 0;
                totalAnswered += progress.subjects[subj].total || 0;
            }
            var accuracy = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0;
            statValues[2].textContent = accuracy + '%';
            statValues[3].textContent = checkinState.streak + '天';
        }

        // Update hero star chip
        var starChip = document.querySelector('.star-chip .chip-value');
        if (starChip) starChip.textContent = totalStars;

        // Update task list
        updateTaskList(progress);
    }

    // ===== Update Hero Progress =====
    function updateHeroProgress() {
        var progress = getDailyProgress();
        var done = progress.completed.length;
        var heroProgress = document.querySelector('.hero-progress');
        if (heroProgress) {
            var fill = heroProgress.querySelector('.progress-fill');
            var text = heroProgress.querySelector('.progress-text');
            if (fill) fill.style.width = (done / 6 * 100) + '%';
            if (text) text.textContent = done + '/6 完成';
        }
    }

    // ===== Update Task List =====
    function updateTaskList(progress) {
        var taskList = document.querySelector('.task-list');
        if (!taskList) return;

        var subjectNames = {
            pinyin: '拼音城堡', math: '数学森林', english: '英语星球',
            piano: '钢琴音塔', chess: '象棋王国', reading: '阅读花园'
        };
        var subjectColors = {
            pinyin: '#FF8C7A', math: '#6BB6E0', english: '#7BB661',
            piano: '#B19CD9', chess: '#FFC857', reading: '#FF9F43'
        };

        taskList.innerHTML = '';
        SUBJECTS.forEach(function(subj) {
            var done = progress.completed.indexOf(subj) >= 0;
            var item = document.createElement('div');
            item.className = 'task-item ' + (done ? 'completed' : 'pending');
            var subjData = progress.subjects[subj];
            var rewardText = done && subjData
                ? '+' + subjData.stars + '星 已完成'
                : '+10星 待开始';
            var rewardColor = done ? '#7BB661' : '#5C5147';

            item.innerHTML =
                '<div class="task-dot" style="background: ' + (done ? '#7BB661' : subjectColors[subj]) + ';"></div>' +
                '<div class="task-content"><span class="task-name">' + subjectNames[subj] + ' · 每日10题练习</span></div>' +
                '<div class="task-reward"><span style="color: ' + rewardColor + ';">' + rewardText + '</span></div>';

            if (!done) {
                item.addEventListener('click', function() { enterQuiz(subj); });
            } else {
                item.addEventListener('click', function() { enterQuiz(subj); });
            }

            taskList.appendChild(item);
        });
    }

    // ===== Update Subject Cards =====
    function updateSubjectCards() {
        var progress = getDailyProgress();
        var subjectCards = document.querySelectorAll('.subject-card');
        var subjectLevels = {
            pinyin: 'Lv.1 · 声母韵母学习',
            math: 'Lv.1 · 20以内加减法',
            english: 'Lv.1 · 字母发音',
            piano: 'Lv.1 · 基础音名',
            chess: 'Lv.1 · 棋子走法',
            reading: 'Lv.1 · 基础识字'
        };

        subjectCards.forEach(function(card) {
            var subj = card.dataset.subject;
            var subjData = progress.subjects[subj];
            var pct = 0;
            var level = subjectLevels[subj] || 'Lv.1';

            if (subjData) {
                pct = Math.round((subjData.correct / subjData.total) * 100);
                // Level up based on accuracy
                var lv = 1;
                if (pct >= 90) lv = 5;
                else if (pct >= 80) lv = 4;
                else if (pct >= 60) lv = 3;
                else if (pct >= 40) lv = 2;
                level = level.replace('Lv.1', 'Lv.' + lv);
            }

            var percentEl = card.querySelector('.card-percent');
            var fillEl = card.querySelector('.card-progress .progress-fill');
            var subtitleEl = card.querySelector('.card-subtitle');

            if (percentEl) percentEl.textContent = pct + '%';
            if (fillEl) fillEl.style.width = pct + '%';
            if (subtitleEl) subtitleEl.textContent = level;
        });
    }

    // ===== Prevent Double-Tap Zoom =====
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
    }, { passive: false });

    // ===== Date Display =====
    function setDateDisplay() {
        var d = new Date();
        var weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        var dateStr = (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + weekdays[d.getDay()];
        var heroDate = document.getElementById('heroDate');
        if (heroDate) heroDate.textContent = dateStr;
    }

    // ===== Check-in Logic =====
    function updateCheckinUI() {
        var progress = getDailyProgress();
        var checkinState = getCheckinState();
        var today = dateStr();

        var checkinBtn = document.getElementById('checkinBtn');
        var checkinStreak = document.getElementById('checkinStreak');
        var checkinHint = document.getElementById('checkinHint');
        var heroCheckinBadge = document.getElementById('heroCheckinBadge');
        var streakChip = document.querySelector('.streak-chip .chip-value');
        var statStreak = document.querySelectorAll('.stat-card .stat-value');

        var hasCompletedTasks = progress.completed.length > 0;
        var alreadyCheckedIn = checkinState.lastCheckIn === today;

        if (checkinStreak) {
            checkinStreak.textContent = '连续打卡 ' + checkinState.streak + ' 天';
        }
        if (streakChip) {
            streakChip.textContent = checkinState.streak + '天连击';
        }

        // Update stats: 连续学习
        if (statStreak.length >= 4) {
            statStreak[3].textContent = checkinState.streak + '天';
        }

        if (checkinBtn) {
            if (alreadyCheckedIn) {
                checkinBtn.disabled = true;
                checkinBtn.classList.add('checked');
                checkinBtn.textContent = '今日已打卡';
            } else if (hasCompletedTasks) {
                checkinBtn.disabled = false;
                checkinBtn.classList.remove('checked');
                checkinBtn.textContent = '打卡 +1天';
            } else {
                checkinBtn.disabled = true;
                checkinBtn.classList.remove('checked');
                checkinBtn.textContent = '完成学习后打卡';
            }
        }

        if (checkinHint) {
            if (alreadyCheckedIn) {
                checkinHint.textContent = '今天已打卡，明天继续加油！';
            } else if (hasCompletedTasks) {
                checkinHint.textContent = '点击打卡，领取农场奖励！';
            } else {
                checkinHint.textContent = '完成至少1个关卡即可打卡';
            }
        }

        if (heroCheckinBadge) {
            if (checkinState.streak > 0) {
                heroCheckinBadge.textContent = '打卡 ' + checkinState.streak + ' 天';
                heroCheckinBadge.classList.add('show');
            }
        }
    }

    function doCheckin() {
        var checkinState = getCheckinState();
        var today = dateStr();

        if (checkinState.lastCheckIn === today) {
            showToast('今天已经打卡啦！');
            return;
        }

        var prevStreak = checkinState.streak;
        if (isConsecutive(checkinState.lastCheckIn, today)) {
            checkinState.streak = prevStreak + 1;
        } else {
            checkinState.streak = 1;
        }

        checkinState.lastCheckIn = today;
        checkinState.history.push(today);
        if (checkinState.history.length > 90) checkinState.history = checkinState.history.slice(-90);

        // Check for milestone unlocks
        var newMilestones = [];
        if (!checkinState.milestonesClaimed) checkinState.milestonesClaimed = [];
        for (var i = 0; i < MILESTONES.length; i++) {
            var m = MILESTONES[i];
            if (checkinState.streak >= m.days && checkinState.milestonesClaimed.indexOf(m.days) < 0) {
                newMilestones.push(m);
                checkinState.milestonesClaimed.push(m.days);
            }
        }

        // Bonus food for checking in
        var farmState = getFarmState();
        var bonusItems = ['corn', 'carrot', 'apple', 'grass', 'hay', 'slop'];
        var bonusFood = bonusItems[Math.floor(Math.random() * bonusItems.length)];
        if (!farmState.food[bonusFood]) farmState.food[bonusFood] = 0;
        farmState.food[bonusFood] += 2;
        farmState.coins += 5;
        saveFarmState(farmState);

        saveCheckinState(checkinState);

        // Show milestone celebration or check-in success
        if (newMilestones.length > 0) {
            showMilestoneCelebration(newMilestones[0], function() {
                if (newMilestones.length > 1) {
                    showMilestoneCelebration(newMilestones[1], function() {
                        updateCheckinUI();
                        renderFarm();
                    });
                } else {
                    updateCheckinUI();
                    renderFarm();
                }
            });
        } else {
            var foodEmoji = '';
            for (var f = 0; f < FARM_FOODS.length; f++) {
                if (FARM_FOODS[f].id === bonusFood) { foodEmoji = FARM_FOODS[f].emoji; break; }
            }
            showToast('打卡成功！连续' + checkinState.streak + '天！获得' + foodEmoji + '×2 + 5农场币');
            updateCheckinUI();
            renderFarm();
        }
    }

    // ===== Milestone Celebration =====
    function showMilestoneCelebration(milestone, callback) {
        var overlay = document.createElement('div');
        overlay.className = 'milestone-overlay';

        var confettiHtml = '';
        var colors = ['#FFC857', '#FF8C7A', '#6BB6E0', '#7BB661', '#B19CD9', '#FF9F43'];
        for (var i = 0; i < 40; i++) {
            var left = Math.random() * 100;
            var delay = Math.random() * 1.5;
            var duration = 2 + Math.random() * 2;
            var color = colors[i % colors.length];
            var size = 8 + Math.random() * 8;
            confettiHtml += '<div class="confetti" style="left:' + left + '%;animation-delay:' + delay + 's;animation-duration:' + duration + 's;background:' + color + ';width:' + size + 'px;height:' + (size * 1.5) + 'px;transform:rotate(' + (Math.random() * 360) + 'deg);"></div>';
        }

        overlay.innerHTML =
            '<div class="celebration-confetti">' + confettiHtml + '</div>' +
            '<div class="milestone-anim-card">' +
                '<div class="milestone-anim-emoji">' + milestone.emoji + '</div>' +
                '<h2 class="milestone-anim-title">' + milestone.title + '</h2>' +
                '<p class="milestone-anim-desc">' + milestone.desc + '</p>' +
                '<div class="milestone-anim-reward">' +
                    '<span>🎉 新奖励已解锁！</span>' +
                '</div>' +
                '<br>' +
                '<button class="milestone-anim-btn">太棒了！</button>' +
            '</div>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function() { overlay.classList.add('show'); });

        var btn = overlay.querySelector('.milestone-anim-btn');
        if (btn) {
            btn.addEventListener('click', function() {
                overlay.classList.remove('show');
                setTimeout(function() {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    if (callback) callback();
                }, 400);
            });
        }

        setTimeout(function() {
            if (overlay.parentNode) {
                overlay.classList.remove('show');
                setTimeout(function() {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    if (callback) callback();
                }, 400);
            }
        }, 6000);
    }

    // ===== Farm Rendering =====
    function renderFarm() {
        var checkinState = getCheckinState();
        var farmState = getFarmState();
        var streak = checkinState.streak;

        // Update header
        var farmLevel = document.getElementById('farmLevel');
        var farmStreakDisplay = document.getElementById('farmStreakDisplay');
        var farmCoinCount = document.getElementById('farmCoinCount');

        var levelName = '新手农夫';
        if (streak >= 60) levelName = '农场大师';
        else if (streak >= 45) levelName = '资深农夫';
        else if (streak >= 30) levelName = '高级农夫';
        else if (streak >= 21) levelName = '熟练农夫';
        else if (streak >= 15) levelName = '中级农夫';
        else if (streak >= 7) levelName = '初级农夫';
        var levelNum = Math.min(Math.floor(streak / 5) + 1, 13);

        if (farmLevel) farmLevel.textContent = 'Lv.' + levelNum + ' ' + levelName;
        if (farmStreakDisplay) farmStreakDisplay.textContent = '打卡 ' + streak + ' 天';
        if (farmCoinCount) farmCoinCount.textContent = farmState.coins || 0;

        // Render farm scene animals
        var sceneAnimals = document.getElementById('farmAnimals');
        if (sceneAnimals) {
            sceneAnimals.innerHTML = '';
            FARM_ANIMALS.forEach(function(a) {
                var div = document.createElement('div');
                div.className = 'scene-animal';
                if (streak < a.unlockDay) {
                    div.classList.add('locked');
                }
                div.textContent = a.emoji;
                div.dataset.animalId = a.id;
                sceneAnimals.appendChild(div);
            });
        }

        // Render food inventory
        var foodInv = document.getElementById('foodInventory');
        if (foodInv) {
            foodInv.innerHTML = '';
            FARM_FOODS.forEach(function(f) {
                var count = farmState.food[f.id] || 0;
                var div = document.createElement('div');
                div.className = 'food-item' + (count === 0 ? ' empty' : '');
                div.innerHTML =
                    '<span class="food-emoji">' + f.emoji + '</span>' +
                    '<span class="food-count">×' + count + '</span>' +
                    '<span class="food-name">' + f.name + '</span>';
                foodInv.appendChild(div);
            });
        }

        // Render animal grid
        var animalGrid = document.getElementById('animalGrid');
        if (animalGrid) {
            animalGrid.innerHTML = '';
            FARM_ANIMALS.forEach(function(a) {
                var div = document.createElement('div');
                div.className = 'animal-card';
                var locked = streak < a.unlockDay;
                if (locked) div.classList.add('locked');
                var fed = farmState.animals[a.id] && farmState.animals[a.id].lastFed === dateStr();
                if (fed) div.classList.add('fed');

                var hungerPct = fed ? 100 : (locked ? 0 : 100);
                var statusText = locked ? ('打卡' + a.unlockDay + '天解锁') : (fed ? '已喂食 ✓' : '饿了，需要喂食');

                div.innerHTML =
                    '<div class="animal-emoji">' + a.emoji + '</div>' +
                    '<div class="animal-name">' + a.name + '</div>' +
                    '<div class="animal-status">' + statusText + '</div>' +
                    '<div class="animal-hunger-bar"><div class="animal-hunger-fill" style="width:' + hungerPct + '%"></div></div>' +
                    (locked ? '<div class="animal-lock-info">需要食物: ' + a.foodName + '</div>' : '<div class="animal-lock-info">需要' + a.foodName + '</div>');

                if (!locked && !fed) {
                    div.addEventListener('click', function() { tryFeedAnimal(a, div); });
                }

                animalGrid.appendChild(div);
            });
        }

        // Render tools
        var toolGrid = document.getElementById('toolGrid');
        if (toolGrid) {
            toolGrid.innerHTML = '';
            FARM_TOOLS.forEach(function(t) {
                var div = document.createElement('div');
                div.className = 'tool-card';
                var locked = streak < t.unlockDay;
                if (locked) div.classList.add('locked');
                if (!locked) div.classList.add('unlocked');

                div.innerHTML =
                    '<div class="tool-emoji">' + t.emoji + '</div>' +
                    '<div class="tool-name">' + t.name + '</div>' +
                    '<div class="tool-status">' + (locked ? '打卡' + t.unlockDay + '天' : '已解锁') + '</div>';

                toolGrid.appendChild(div);
            });
        }

        // Render milestones
        var milestoneTrack = document.getElementById('milestoneTrack');
        if (milestoneTrack) {
            milestoneTrack.innerHTML = '';
            MILESTONES.forEach(function(m) {
                var div = document.createElement('div');
                div.className = 'milestone-card';
                var unlocked = streak >= m.days;
                var isNext = !unlocked && MILESTONES.indexOf(m) > 0 && streak >= MILESTONES[MILESTONES.indexOf(m) - 1].days;
                if (MILESTONES.indexOf(m) === 0 && !unlocked) isNext = true;
                if (unlocked) div.classList.add('unlocked');
                if (isNext) div.classList.add('current');

                div.innerHTML =
                    '<div class="milestone-check"><svg viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
                    '<div class="milestone-days">' + m.days + '天</div>' +
                    '<div class="milestone-reward">' + m.emoji + '</div>' +
                    '<div class="milestone-desc">' + m.desc + '</div>';

                milestoneTrack.appendChild(div);
            });
        }
    }

    // ===== Feed Animal =====
    function tryFeedAnimal(animal, cardEl) {
        var farmState = getFarmState();
        var foodCount = farmState.food[animal.food] || 0;

        if (foodCount <= 0) {
            // Find the food name
            var foodName = animal.foodName;
            showToast('没有' + foodName + '了！完成练习获取食物吧！');
            return;
        }

        // Consume food
        farmState.food[animal.food] = foodCount - 1;

        // Mark animal as fed
        if (!farmState.animals[animal.id]) farmState.animals[animal.id] = {};
        farmState.animals[animal.id].lastFed = dateStr();
        farmState.totalFed = (farmState.totalFed || 0) + 1;
        farmState.coins = (farmState.coins || 0) + 1;
        saveFarmState(farmState);

        // Visual feedback
        cardEl.classList.add('fed');
        var statusEl = cardEl.querySelector('.animal-status');
        if (statusEl) statusEl.textContent = '已喂食 ✓';
        var fillEl = cardEl.querySelector('.animal-hunger-fill');
        if (fillEl) fillEl.style.width = '100%';

        // Scene animal happy animation
        var sceneAnimals = document.querySelectorAll('.scene-animal');
        sceneAnimals.forEach(function(sa) {
            if (sa.dataset.animalId === animal.id) {
                sa.classList.add('happy');
                setTimeout(function() { sa.classList.remove('happy'); }, 600);

                // Heart particles
                for (var h = 0; h < 3; h++) {
                    var heart = document.createElement('div');
                    heart.className = 'heart-particle';
                    heart.textContent = '❤️';
                    heart.style.left = (20 + h * 15) + 'px';
                    heart.style.top = '-10px';
                    heart.style.animationDelay = (h * 0.15) + 's';
                    sa.appendChild(heart);
                    setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 1000 + h * 150);
                }
            }
        });

        // Update food inventory
        var foodItems = document.querySelectorAll('.food-item');
        FARM_FOODS.forEach(function(f, idx) {
            if (f.id === animal.food && foodItems[idx]) {
                var count = farmState.food[f.id] || 0;
                foodItems[idx].querySelector('.food-count').textContent = '×' + count;
                foodItems[idx].classList.toggle('empty', count === 0);
            }
        });

        // Update coins
        var coinEl = document.getElementById('farmCoinCount');
        if (coinEl) coinEl.textContent = farmState.coins;

        showToast(animal.emoji + animal.name + '吃饱啦！+1农场币');
    }

    // ===== Farm & Checkin Event Listeners =====
    var checkinBtn = document.getElementById('checkinBtn');
    if (checkinBtn) {
        checkinBtn.addEventListener('click', function() {
            if (!checkinBtn.disabled) doCheckin();
        });
    }

    // ===== Init =====
    function init() {
        clearOldDataIfNeeded();
        setDailyWelcome();
        setDateDisplay();
        updateCheckinUI();
        updateSubjectCards();
        animateProgressBars();
        // Check for yesterday's wrong answers and show review banner
        if (hasYesterdayWrong && hasYesterdayWrong()) {
            var count = getYesterdayWrongCount ? getYesterdayWrongCount() : 0;
            var banner = document.getElementById('reviewBanner');
            if (banner) {
                banner.style.display = 'flex';
                var countEl = banner.querySelector('.review-banner-count');
                if (countEl) countEl.textContent = count;
            }
        }
    }

    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();
