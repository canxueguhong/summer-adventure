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

    // ===== Question Banks (expanded: 15 per subject = 90 total) =====
    var questionBanks = {
        pinyin: {
            title: '拼音城堡 · 每日练习', color: '#FF8C7A', bg: '#FFF0EE', lang: 'zh-CN', hasAudio: true,
            questions: [
                { difficulty: 1, prompt: '选出正确的声母', display: 'b', speakText: '波', options: [{text:'b',speak:'波'},{text:'d',speak:'得'},{text:'p',speak:'坡'},{text:'q',speak:'七'}], correct: 0, hint: 'b是双唇音，嘴唇先闭合再放开' },
                { difficulty: 1, prompt: '选出正确的韵母', display: 'o', speakText: '哦', options: [{text:'a',speak:'啊'},{text:'o',speak:'哦'},{text:'e',speak:'鹅'},{text:'i',speak:'衣'}], correct: 1, hint: 'o是圆唇音，嘴巴圆圆的' },
                { difficulty: 2, prompt: '"mā" 读哪个字？', display: 'mā', speakText: '妈', options: [{text:'妈',speak:'妈'},{text:'马',speak:'马'},{text:'麻',speak:'麻'},{text:'骂',speak:'骂'}], correct: 0, hint: '一声平，mā是第一声' },
                { difficulty: 2, prompt: '"mǎ" 是第几声？', display: 'mǎ', speakText: '马', options: [{text:'一声',speak:'第一声'},{text:'二声',speak:'第二声'},{text:'三声',speak:'第三声'},{text:'四声',speak:'第四声'}], correct: 2, hint: '三声拐弯，先降后升' },
                { difficulty: 2, prompt: '"huā" 是什么？', display: 'huā', speakText: '花', options: [{text:'花',speak:'花'},{text:'火',speak:'火'},{text:'画',speak:'画'},{text:'红',speak:'红'}], correct: 0, hint: 'h-u-ā，花朵的花' },
                { difficulty: 3, prompt: '哪个含有"ang"？', display: 'ang', speakText: '昂', options: [{text:'羊(yáng)',speak:'羊'},{text:'鱼(yú)',speak:'鱼'},{text:'月(yuè)',speak:'月'},{text:'雨(yǔ)',speak:'雨'}], correct: 0, hint: 'ang是后鼻韵母，羊的韵母就是ang' },
                { difficulty: 2, prompt: '"shū" 是哪个字？', display: 'shū', speakText: '书', options: [{text:'书',speak:'书'},{text:'树',speak:'树'},{text:'鼠',speak:'鼠'},{text:'蔬',speak:'蔬'}], correct: 0, hint: 'sh-ū，一声，书本的书' },
                { difficulty: 2, prompt: '"nǐ" 是哪个字？', display: 'nǐ', speakText: '你', options: [{text:'你',speak:'你'},{text:'尼',speak:'尼'},{text:'泥',speak:'泥'},{text:'逆',speak:'逆'}], correct: 0, hint: 'n-ǐ，三声，你的你' },
                { difficulty: 2, prompt: '"dà" 是第几声？', display: 'dà', speakText: '大', options: [{text:'一声',speak:'第一声'},{text:'二声',speak:'第二声'},{text:'三声',speak:'第三声'},{text:'四声',speak:'第四声'}], correct: 3, hint: '四声降，dà是第四声' },
                { difficulty: 3, prompt: '"péng yǒu" 是什么？', display: 'péng yǒu', speakText: '朋友', options: [{text:'朋友',speak:'朋友'},{text:'葡萄',speak:'葡萄'},{text:'苹果',speak:'苹果'},{text:'皮带',speak:'皮带'}], correct: 0, hint: 'p-éng y-ǒu，好朋友的朋友' },
                { difficulty: 1, prompt: '选出声母"f"', display: 'f', speakText: '佛', options: [{text:'f',speak:'佛'},{text:'t',speak:'特'},{text:'h',speak:'喝'},{text:'g',speak:'哥'}], correct: 0, hint: 'f是上齿咬下唇' },
                { difficulty: 2, prompt: '"guó" 是哪个字？', display: 'guó', speakText: '国', options: [{text:'国',speak:'国'},{text:'果',speak:'果'},{text:'过',speak:'过'},{text:'锅',speak:'锅'}], correct: 0, hint: 'g-u-ó，二声，国家的国' },
                { difficulty: 2, prompt: '"en" 是什么韵母？', display: 'en', speakText: '恩', options: [{text:'前鼻韵母',speak:'前鼻韵母'},{text:'后鼻韵母',speak:'后鼻韵母'},{text:'单韵母',speak:'单韵母'},{text:'复韵母',speak:'复韵母'}], correct: 0, hint: 'en是前鼻韵母，舌尖抵上齿龈' },
                { difficulty: 3, prompt: '"zhī" 是什么？', display: 'zhī', speakText: '知', options: [{text:'整体认读音节',speak:'整体认读音节'},{text:'三拼音节',speak:'三拼音节'},{text:'两拼音节',speak:'两拼音节'},{text:'零声母',speak:'零声母'}], correct: 0, hint: 'zhi是整体认读音节，不需要拼' },
                { difficulty: 2, prompt: '"xiǎo" 是第几声？', display: 'xiǎo', speakText: '小', options: [{text:'一声',speak:'第一声'},{text:'二声',speak:'第二声'},{text:'三声',speak:'第三声'},{text:'四声',speak:'第四声'}], correct: 2, hint: '三声拐弯，大小的"小"' }
            ]
        },
        math: {
            title: '数学森林 · 每日练习', color: '#6BB6E0', bg: '#E8F4FB', lang: null, hasAudio: false,
            questions: [
                { difficulty: 1, prompt: '3 + 4 = ?', equation: '3 + 4 = ?', tfA: 7, options: [{text:'6'},{text:'7'},{text:'8'},{text:'5'}], correct: 1, hint: '3个苹果加4个苹果，数一数' },
                { difficulty: 1, prompt: '9 - 5 = ?', equation: '9 - 5 = ?', tfA: 9, tfB: 5, options: [{text:'3'},{text:'5'},{text:'4'},{text:'6'}], correct: 2, hint: '9个拿走5个，还剩几个？' },
                { difficulty: 2, prompt: '8 + 7 = ?', equation: '8 + 7 = ?', tfA: 8, tfB: 7, options: [{text:'14'},{text:'15'},{text:'16'},{text:'13'}], correct: 1, hint: '8和2凑成10，7分成2和5，10+5=15' },
                { difficulty: 2, prompt: '15 - 8 = ?', equation: '15 - 8 = ?', tfA: 15, tfB: 8, options: [{text:'6'},{text:'8'},{text:'7'},{text:'9'}], correct: 2, hint: '15分成10和5，10-8=2，2+5=7' },
                { difficulty: 3, prompt: '25 - 17 = ?', equation: '25 - 17 = ?', tfA: 25, tfB: 17, options: [{text:'8'},{text:'12'},{text:'7'},{text:'42'}], correct: 0, hint: '个位5-7不够减，从十位借1，15-7=8，1-1=0' },
                { difficulty: 3, prompt: '36 + 28 = ?', equation: '36 + 28 = ?', options: [{text:'54'},{text:'64'},{text:'74'},{text:'68'}], correct: 1, hint: '6+8=14进1，3+2+1=6，结果是64' },
                { difficulty: 2, prompt: '45 + 23 = ?', equation: '45 + 23 = ?', options: [{text:'68'},{text:'78'},{text:'58'},{text:'65'}], correct: 0, hint: '5+3=8，4+2=6，结果是68' },
                { difficulty: 3, prompt: '50 - 26 = ?', equation: '50 - 26 = ?', options: [{text:'34'},{text:'24'},{text:'14'},{text:'26'}], correct: 1, hint: '0-6不够减，借1变10，10-6=4，4-2=2' },
                { difficulty: 3, prompt: '73 + 19 = ?', equation: '73 + 19 = ?', options: [{text:'82'},{text:'92'},{text:'86'},{text:'88'}], correct: 1, hint: '3+9=12进1，7+1+1=9，结果是92' },
                { difficulty: 3, prompt: '82 - 37 = ?', equation: '82 - 37 = ?', options: [{text:'45'},{text:'55'},{text:'35'},{text:'48'}], correct: 0, hint: '2-7不够减，借1变12，12-7=5，7-3=4' },
                { difficulty: 1, prompt: '6 + 3 = ?', equation: '6 + 3 = ?', tfA: 6, options: [{text:'8'},{text:'9'},{text:'7'},{text:'10'}], correct: 1, hint: '6个加3个，数一数' },
                { difficulty: 2, prompt: '12 - 7 = ?', equation: '12 - 7 = ?', tfA: 12, tfB: 7, options: [{text:'4'},{text:'6'},{text:'5'},{text:'7'}], correct: 2, hint: '12分成10和2，10-7=3，3+2=5' },
                { difficulty: 2, prompt: '17 + 6 = ?', equation: '17 + 6 = ?', options: [{text:'22'},{text:'23'},{text:'24'},{text:'21'}], correct: 1, hint: '7+6=13进1，1+1=2，结果是23' },
                { difficulty: 3, prompt: '38 + 45 = ?', equation: '38 + 45 = ?', options: [{text:'73'},{text:'83'},{text:'78'},{text:'88'}], correct: 1, hint: '8+5=13进1，3+4+1=8，结果是83' },
                { difficulty: 3, prompt: '60 - 28 = ?', equation: '60 - 28 = ?', options: [{text:'32'},{text:'42'},{text:'38'},{text:'22'}], correct: 0, hint: '0-8不够减，借1变10，10-8=2，5-2=3' }
            ]
        },
        english: {
            title: '英语星球 · 每日练习', color: '#7BB661', bg: '#EDF5E6', lang: 'en-US', hasAudio: true,
            questions: [
                { difficulty: 1, prompt: 'Which letter says /b/?', display: '/b/', speakText: 'b', options: [{text:'B',speak:'b'},{text:'D',speak:'d'},{text:'P',speak:'p'},{text:'T',speak:'t'}], correct: 0, hint: 'B says /b/, like in "ball"' },
                { difficulty: 1, prompt: 'c-a-t makes what word?', display: 'c-a-t', speakText: 'cat', options: [{text:'cat',speak:'cat'},{text:'cut',speak:'cut'},{text:'cot',speak:'cot'},{text:'cap',speak:'cap'}], correct: 0, hint: 'c-a-t, /k/ /æ/ /t/' },
                { difficulty: 2, prompt: 'What is the first sound of "sun"?', display: 'sun', speakText: 'sun', options: [{text:'/s/',speak:'s'},{text:'/n/',speak:'n'},{text:'/m/',speak:'m'},{text:'/r/',speak:'r'}], correct: 0, hint: 'The first letter is S, it says /s/' },
                { difficulty: 2, prompt: 'Which rhymes with "hat"?', display: 'hat', speakText: 'hat', options: [{text:'cat',speak:'cat'},{text:'dog',speak:'dog'},{text:'sun',speak:'sun'},{text:'pig',speak:'pig'}], correct: 0, hint: 'Rhyming words end with the same sound: -at' },
                { difficulty: 2, prompt: 'd_g — what letter is missing?', display: 'd_g', speakText: 'dog', options: [{text:'o',speak:'o'},{text:'a',speak:'a'},{text:'e',speak:'e'},{text:'u',speak:'u'}], correct: 0, hint: 'd-o-g spells "dog"' },
                { difficulty: 2, prompt: 'Which vowel is in "pig"?', display: 'pig', speakText: 'pig', options: [{text:'i',speak:'i'},{text:'a',speak:'a'},{text:'e',speak:'e'},{text:'o',speak:'o'}], correct: 0, hint: 'p-i-g, the middle letter is i' },
                { difficulty: 2, prompt: 'h-a-t makes what word?', display: 'h-a-t', speakText: 'hat', options: [{text:'hat',speak:'hat'},{text:'hot',speak:'hot'},{text:'hit',speak:'hit'},{text:'hut',speak:'hut'}], correct: 0, hint: 'h-a-t, /h/ /æ/ /t/' },
                { difficulty: 1, prompt: 'Which means "小狗"?', display: '小狗', speakText: 'dog', options: [{text:'dog',speak:'dog'},{text:'cat',speak:'cat'},{text:'bird',speak:'bird'},{text:'fish',speak:'fish'}], correct: 0, hint: 'A dog says "woof woof!"' },
                { difficulty: 3, prompt: 's-u-n makes what word?', display: 's-u-n', speakText: 'sun', options: [{text:'sun',speak:'sun'},{text:'run',speak:'run'},{text:'bun',speak:'bun'},{text:'fun',speak:'fun'}], correct: 0, hint: 's-u-n, /s/ /ʌ/ /n/' },
                { difficulty: 3, prompt: 'I see a ___', display: 'I see a ___', speakText: 'I see a cat', options: [{text:'cat',speak:'cat'},{text:'run',speak:'run'},{text:'big',speak:'big'},{text:'go',speak:'go'}], correct: 0, hint: 'We need a noun (a thing) here' },
                { difficulty: 1, prompt: 'Which letter says /d/?', display: '/d/', speakText: 'd', options: [{text:'D',speak:'d'},{text:'B',speak:'b'},{text:'T',speak:'t'},{text:'G',speak:'g'}], correct: 0, hint: 'D says /d/, like in "dog"' },
                { difficulty: 2, prompt: 'b-a-t makes what word?', display: 'b-a-t', speakText: 'bat', options: [{text:'bat',speak:'bat'},{text:'bit',speak:'bit'},{text:'but',speak:'but'},{text:'bet',speak:'bet'}], correct: 0, hint: 'b-a-t, /b/ /æ/ /t/' },
                { difficulty: 2, prompt: 'What is the last sound of "sun"?', display: 'sun', speakText: 'sun', options: [{text:'/n/',speak:'n'},{text:'/s/',speak:'s'},{text:'/t/',speak:'t'},{text:'/m/',speak:'m'}], correct: 0, hint: 'The last letter is N' },
                { difficulty: 2, prompt: 'p-i-g makes what word?', display: 'p-i-g', speakText: 'pig', options: [{text:'pig',speak:'pig'},{text:'peg',speak:'peg'},{text:'pug',speak:'pug'},{text:'pen',speak:'pen'}], correct: 0, hint: 'p-i-g, /p/ /ɪ/ /g/' },
                { difficulty: 3, prompt: 'I have a ___', display: 'I have a ___', speakText: 'I have a dog', options: [{text:'dog',speak:'dog'},{text:'blue',speak:'blue'},{text:'jump',speak:'jump'},{text:'fast',speak:'fast'}], correct: 0, hint: 'We need a noun (a thing) here' }
            ]
        },
        piano: {
            title: '钢琴音塔 · 每日练习', color: '#B19CD9', bg: '#F0EBF8', lang: null, hasAudio: false,
            questions: [
                { difficulty: 1, prompt: '中央C在哪里？', svgType: 'piano', highlight: 'C', label: 'C', options: [{text:'最左边'},{text:'正中间'},{text:'最右边'},{text:'没有C键'}], correct: 1, hint: '中央C在钢琴的正中间位置' },
                { difficulty: 1, prompt: 'C后面的白键是？', svgType: 'piano', highlight: 'D', label: 'D', options: [{text:'D'},{text:'E'},{text:'B'},{text:'F'}], correct: 0, hint: 'C-D-E-F-G-A-B-C' },
                { difficulty: 1, prompt: '"Do"对应的音名是？', svgType: 'piano', highlight: 'C', label: 'Do=C', options: [{text:'C'},{text:'D'},{text:'E'},{text:'G'}], correct: 0, hint: 'Do-Re-Mi-Fa-Sol 对应 C-D-E-F-G' },
                { difficulty: 2, prompt: '一个八度有几个白键？', svgType: 'piano', highlight: 'C', label: '7个', options: [{text:'5个'},{text:'6个'},{text:'7个'},{text:'8个'}], correct: 2, hint: 'C-D-E-F-G-A-B，数一数' },
                { difficulty: 2, prompt: '1指（大拇指）弹哪个键？', svgType: 'piano', highlight: 'C', label: '1指=C', options: [{text:'C'},{text:'D'},{text:'E'},{text:'F'}], correct: 0, hint: '右手1指通常放在C上' },
                { difficulty: 2, prompt: 'C和D之间的黑键是？', svgType: 'piano', highlight: 'C', label: 'C#', options: [{text:'C#'},{text:'D#'},{text:'F#'},{text:'没有黑键'}], correct: 0, hint: 'C和D之间有一个黑键' },
                { difficulty: 2, prompt: 'E后面的白键是？', svgType: 'piano', highlight: 'F', label: 'F', options: [{text:'F'},{text:'G'},{text:'D'},{text:'B'}], correct: 0, hint: 'E-F之间没有黑键' },
                { difficulty: 2, prompt: 'C和G哪个音更高？', svgType: 'piano', highlight: 'G', label: 'G更高', options: [{text:'C更高'},{text:'G更高'},{text:'一样高'},{text:'无法比较'}], correct: 1, hint: '从左到右音越来越高' },
                { difficulty: 3, prompt: '一个八度有几个黑键？', svgType: 'piano', highlight: 'C', label: '5个', options: [{text:'3个'},{text:'4个'},{text:'5个'},{text:'6个'}], correct: 2, hint: 'C# D# F# G# A#，数一数' },
                { difficulty: 1, prompt: '"Re"对应的音名是？', svgType: 'piano', highlight: 'D', label: 'Re=D', options: [{text:'C'},{text:'D'},{text:'E'},{text:'F'}], correct: 1, hint: 'Do-Re-Mi = C-D-E' },
                { difficulty: 1, prompt: '"Mi"对应的音名是？', svgType: 'piano', highlight: 'E', label: 'Mi=E', options: [{text:'D'},{text:'E'},{text:'F'},{text:'G'}], correct: 1, hint: 'Do-Re-Mi = C-D-E' },
                { difficulty: 2, prompt: 'F后面的白键是？', svgType: 'piano', highlight: 'G', label: 'G', options: [{text:'G'},{text:'A'},{text:'E'},{text:'H'}], correct: 0, hint: 'F-G-A-B-C' },
                { difficulty: 2, prompt: '2指（食指）弹哪个键？', svgType: 'piano', highlight: 'D', label: '2指=D', options: [{text:'C'},{text:'D'},{text:'E'},{text:'F'}], correct: 1, hint: '右手2指通常放在D上' },
                { difficulty: 2, prompt: '"La"对应的音名是？', svgType: 'piano', highlight: 'A', label: 'La=A', options: [{text:'A'},{text:'B'},{text:'G'},{text:'F'}], correct: 0, hint: 'Do-Re-Mi-Fa-Sol-La = C-D-E-F-G-A' },
                { difficulty: 3, prompt: 'B后面的白键是？', svgType: 'piano', highlight: 'C2', label: 'C(高八度)', options: [{text:'C'},{text:'A'},{text:'D'},{text:'没有键了'}], correct: 0, hint: 'B之后回到C，高了一个八度' }
            ]
        },
        chess: {
            title: '象棋王国 · 每日练习', color: '#FFC857', bg: '#FFF8E0', lang: null, hasAudio: false,
            questions: [
                { difficulty: 1, prompt: '国王（King）怎么走？', svgType: 'chess', piece: '王', pieceColor: '#FF8C7A', options: [{text:'任意方向走1格'},{text:'只能横着走'},{text:'斜着走任意格'},{text:'跳着走'}], correct: 0, hint: '国王每次只能走一步' },
                { difficulty: 2, prompt: '车（Rook）怎么走？', svgType: 'chess', piece: '车', pieceColor: '#6BB6E0', options: [{text:'斜着走'},{text:'横竖任意格'},{text:'只能走1格'},{text:'L形走法'}], correct: 1, hint: '车只能走直线' },
                { difficulty: 2, prompt: '象（Bishop）怎么走？', svgType: 'chess', piece: '象', pieceColor: '#7BB661', options: [{text:'横竖走'},{text:'斜着走任意格'},{text:'只能走2格'},{text:'L形走法'}], correct: 1, hint: '象只走对角线' },
                { difficulty: 2, prompt: '马（Knight）怎么走？', svgType: 'chess', piece: '马', pieceColor: '#B19CD9', options: [{text:'直线走'},{text:'L形（2+1）'},{text:'斜线走'},{text:'任意方向1格'}], correct: 1, hint: '马走日字，先走2格再转1格' },
                { difficulty: 3, prompt: '哪个棋子可以跳过其他棋子？', svgType: 'chess', piece: '马', pieceColor: '#B19CD9', options: [{text:'马'},{text:'车'},{text:'象'},{text:'兵'}], correct: 0, hint: '只有马可以跳跃' },
                { difficulty: 1, prompt: '每方有几个兵（Pawn）？', svgType: 'chess', piece: '兵', pieceColor: '#FFC857', options: [{text:'6个'},{text:'7个'},{text:'8个'},{text:'9个'}], correct: 2, hint: '第二排全是兵' },
                { difficulty: 2, prompt: '最厉害的棋子是？', svgType: 'chess', piece: '后', pieceColor: '#FF8C7A', options: [{text:'王'},{text:'后'},{text:'车'},{text:'马'}], correct: 1, hint: '后可以走任意方向任意格' },
                { difficulty: 1, prompt: '棋盘有几个格子？', svgType: 'chess', piece: '盘', pieceColor: '#5C5147', options: [{text:'36个'},{text:'49个'},{text:'64个'},{text:'81个'}], correct: 2, hint: '8×8=64' },
                { difficulty: 2, prompt: '棋盘角落放什么棋子？', svgType: 'chess', piece: '车', pieceColor: '#6BB6E0', options: [{text:'车'},{text:'马'},{text:'象'},{text:'后'}], correct: 0, hint: '四个角都是车' },
                { difficulty: 3, prompt: '国王被攻击但没被将死叫什么？', svgType: 'chess', piece: '军', pieceColor: '#FF8C7A', options: [{text:'将军'},{text:'和棋'},{text:'弃子'},{text:'升变'}], correct: 0, hint: 'King in check but not checkmate' },
                { difficulty: 2, prompt: '后（Queen）怎么走？', svgType: 'chess', piece: '后', pieceColor: '#FF8C7A', options: [{text:'任意方向任意格'},{text:'只能走1格'},{text:'只能斜着走'},{text:'只能横着走'}], correct: 0, hint: '后是最强的棋子，什么方向都能走' },
                { difficulty: 2, prompt: '兵（Pawn）怎么走？', svgType: 'chess', piece: '兵', pieceColor: '#FFC857', options: [{text:'向前走1格'},{text:'任意方向走'},{text:'斜着走'},{text:'L形走法'}], correct: 0, hint: '兵只能向前走，吃子时斜走' },
                { difficulty: 2, prompt: '王和后分别放在哪一列？', svgType: 'chess', piece: '王后', pieceColor: '#FF8C7A', options: [{text:'王在e列，后在d列'},{text:'王在d列，后在e列'},{text:'都在d列'},{text:'都在e列'}], correct: 0, hint: '白后在d列(亮格)，白王在e列' },
                { difficulty: 1, prompt: '棋盘是什么颜色的格子组成的？', svgType: 'chess', piece: '盘', pieceColor: '#5C5147', options: [{text:'黑白相间'},{text:'红黑相间'},{text:'全白'},{text:'全黑'}], correct: 0, hint: '国际象棋棋盘是黑白格交替的' },
                { difficulty: 3, prompt: '每方棋子总数是多少？', svgType: 'chess', piece: '全', pieceColor: '#5C5147', options: [{text:'14个'},{text:'15个'},{text:'16个'},{text:'18个'}], correct: 2, hint: '8兵+2车+2马+2象+1王+1后=16' }
            ]
        },
        reading: {
            title: '阅读花园 · 每日练习', color: '#FF9F43', bg: '#FFF3E6', lang: null, hasAudio: false,
            questions: [
                { difficulty: 1, prompt: '"日"是什么意思？', svgType: 'reading', chars: ['日','是','什么'], highlights: [0], options: [{text:'太阳'},{text:'月亮'},{text:'星星'},{text:'云朵'}], correct: 0, hint: '日就是太阳' },
                { difficulty: 1, prompt: '"水"是什么意思？', svgType: 'reading', chars: ['水','是','什么'], highlights: [0], options: [{text:'水'},{text:'火'},{text:'土'},{text:'木'}], correct: 0, hint: '喝水的水' },
                { difficulty: 2, prompt: '"大"是什么意思？', svgType: 'reading', chars: ['大','是','什么'], highlights: [0], options: [{text:'很大'},{text:'很小'},{text:'不多'},{text:'中间'}], correct: 0, hint: '大象的"大"' },
                { difficulty: 2, prompt: '小兔子___萝卜', svgType: 'reading', chars: ['小兔子','___','萝卜'], highlights: [1], options: [{text:'爱吃'},{text:'讨厌'},{text:'害怕'},{text:'不看'}], correct: 0, hint: '小兔子最喜欢吃萝卜' },
                { difficulty: 2, prompt: '天上有___', svgType: 'reading', chars: ['天上有','___',''], highlights: [1], options: [{text:'白云'},{text:'小鱼'},{text:'草地'},{text:'大树'}], correct: 0, hint: '天上飘着什么？' },
                { difficulty: 3, prompt: '___是森林之王', svgType: 'reading', chars: ['___','是','森林之王'], highlights: [0], options: [{text:'老虎'},{text:'兔子'},{text:'小鸟'},{text:'蚂蚁'}], correct: 0, hint: '谁最威风？' },
                { difficulty: 1, prompt: '"口"是什么意思？', svgType: 'reading', chars: ['口','是','什么'], highlights: [0], options: [{text:'嘴巴'},{text:'眼睛'},{text:'耳朵'},{text:'鼻子'}], correct: 0, hint: '口就是嘴巴' },
                { difficulty: 2, prompt: '"上"是什么意思？', svgType: 'reading', chars: ['上','是','什么'], highlights: [0], options: [{text:'上面'},{text:'下面'},{text:'左边'},{text:'右边'}], correct: 0, hint: '上下左右' },
                { difficulty: 3, prompt: '小鸟在___上唱歌', svgType: 'reading', chars: ['小鸟在','___','唱歌'], highlights: [1], options: [{text:'树'},{text:'水里'},{text:'地下'},{text:'火里'}], correct: 0, hint: '小鸟在哪里唱歌？' },
                { difficulty: 2, prompt: '"多"的反义词是？', svgType: 'reading', chars: ['多的','反义词','是？'], highlights: [2], options: [{text:'少'},{text:'大'},{text:'高'},{text:'好'}], correct: 0, hint: '多是少反义词' },
                { difficulty: 1, prompt: '"月"是什么意思？', svgType: 'reading', chars: ['月','是','什么'], highlights: [0], options: [{text:'月亮'},{text:'太阳'},{text:'星星'},{text:'云朵'}], correct: 0, hint: '月就是月亮' },
                { difficulty: 1, prompt: '"山"是什么意思？', svgType: 'reading', chars: ['山','是','什么'], highlights: [0], options: [{text:'高山'},{text:'大河'},{text:'大海'},{text:'平原'}], correct: 0, hint: '爬山的山' },
                { difficulty: 2, prompt: '"小"的反义词是？', svgType: 'reading', chars: ['小的','反义词','是？'], highlights: [2], options: [{text:'大'},{text:'多'},{text:'高'},{text:'长'}], correct: 0, hint: '小的反义词是大' },
                { difficulty: 2, prompt: '雨后天上有___', svgType: 'reading', chars: ['雨后天上','有','___'], highlights: [2], options: [{text:'彩虹'},{text:'小鱼'},{text:'草地'},{text:'大树'}], correct: 0, hint: '雨后天空会出现什么？' },
                { difficulty: 2, prompt: '太阳从___升起', svgType: 'reading', chars: ['太阳从','___','升起'], highlights: [1], options: [{text:'东边'},{text:'西边'},{text:'南边'},{text:'北边'}], correct: 0, hint: '太阳从东边升起，西边落下' }
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

    // ===== Random Question Selection =====
    function getDailyQuestions(subject) {
        var bank = questionBanks[subject];
        if (!bank) return [];
        var all = bank.questions.slice();
        for (var i = all.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
        }
        return all.slice(0, QUESTIONS_PER_QUIZ);
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
        tasks: { id: 'screen-map', title: '今日任务', scrollTarget: '.task-list' },
        errors: { id: 'screen-report', title: '错题巩固' },
        achievements: { id: 'screen-map', title: '成就墙' }
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

        // Show star collection animation
        showStarAnimation(currentSubject, correctCount, stars, function() {
            // After animation, check if all 6 subjects done today
            if (progress.completed.length >= 6) {
                showCelebration(function() {
                    switchScreen('map');
                });
            } else {
                showToast(CHILD_NAME + '已完成' + progress.completed.length + '/6个关卡，继续加油！');
                setTimeout(function() { switchScreen('map'); }, 1500);
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

    subjectCards.forEach(function(card) {
        card.addEventListener('click', function() { enterQuiz(card.dataset.subject); });
    });

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
    }

    // ===== Prevent Double-Tap Zoom =====
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
    }, { passive: false });

    // ===== Init =====
    function init() {
        setDailyWelcome();
        animateProgressBars();
    }

    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();
