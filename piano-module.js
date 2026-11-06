/**
 * 钢琴练习模块 v2 - Simple Piano风格 + 零基础教学
 * 流程: 观看教学视频 → 认识琴键 → 听音练习 → 弹奏练习
 * 使用 Web Audio API 发音 + TTS语音
 */
(function () {
    'use strict';

    var CHILD_NAME = '萧奕琛';

    // ===== TTS 语音功能 =====
    var ttsEnabled = true;

    function speak(text, opts) {
        if (!ttsEnabled || !window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            var u = new SpeechSynthesisUtterance(text);
            u.lang = 'zh-CN';
            u.rate = (opts && opts.rate) || 0.85;
            u.pitch = (opts && opts.pitch) || 1.15;
            u.volume = 1;
            var voices = window.speechSynthesis.getVoices();
            for (var i = 0; i < voices.length; i++) {
                if (voices[i].lang && voices[i].lang.indexOf('zh') === 0 &&
                    (voices[i].name.indexOf('女') >= 0 || voices[i].name.indexOf('Female') >= 0)) {
                    u.voice = voices[i];
                    break;
                }
            }
            window.speechSynthesis.speak(u);
        } catch (e) { /* 忽略 */ }
    }

    function stopSpeak() {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    // ===== 音名 -> 频率 (Hz) =====
    var NOTE_FREQ = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
        'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
        'A5': 880.00
    };

    // 简谱显示 + 唱名
    var NOTE_DISPLAY = {
        'C4': { solfege: 'Do', number: '1', key: 'C', cn: 'C键' },
        'D4': { solfege: 'Re', number: '2', key: 'D', cn: 'D键' },
        'E4': { solfege: 'Mi', number: '3', key: 'E', cn: 'E键' },
        'F4': { solfege: 'Fa', number: '4', key: 'F', cn: 'F键' },
        'G4': { solfege: 'Sol', number: '5', key: 'G', cn: 'G键' },
        'A4': { solfege: 'La', number: '6', key: 'A', cn: 'A键' },
        'B4': { solfege: 'Si', number: '7', key: 'B', cn: 'B键' },
        'C5': { solfege: 'Do', number: '1\'', key: 'C', cn: '高音Do' }
    };

    // 白键列表 (一个八度)
    var WHITE_KEYS = ['C4','D4','E4','F4','G4','A4','B4','C5'];
    // 黑键 (在白键之间)
    var BLACK_KEYS = [
        { note: 'C#4', afterWhite: 0 },  // C和D之间
        { note: 'D#4', afterWhite: 1 },  // D和E之间
        { note: 'F#4', afterWhite: 3 },  // F和G之间
        { note: 'G#4', afterWhite: 4 },  // G和A之间
        { note: 'A#4', afterWhite: 5 }   // A和B之间
    ];

    // ===== 教学视频资源 =====
    var VIDEO_LESSONS = {
        'basic': [
            { title: '认识钢琴键盘', url: 'https://player.bilibili.com/player.html?bvid=BV1iP4y1t7xP&autoplay=0', desc: '钢琴的键盘是怎么排列的' },
            { title: '钢琴指法入门', url: 'https://player.bilibili.com/player.html?bvid=BV1iP4y1t7xP&autoplay=0', desc: '学会正确的手型' }
        ],
        'small_star': [
            { title: '小星星教学', url: 'https://player.bilibili.com/player.html?bvid=BV1iP4y1t7xP&autoplay=0', desc: '跟着老师弹小星星' }
        ],
        'mary': [
            { title: '玛丽有小羊', url: 'https://player.bilibili.com/player.html?bvid=BV1iP4y1t7xP&autoplay=0', desc: '学习玛丽有只小羊羔' }
        ],
        'ode': [
            { title: '欢乐颂', url: 'https://player.bilibili.com/player.html?bvid=BV1iP4y1t7xP&autoplay=0', desc: '世界名曲欢乐颂' }
        ],
        'tiger': [
            { title: '两只老虎', url: 'https://player.bilibili.com/player.html?bvid=BV1iP4y1t7xP&autoplay=0', desc: '一起弹两只老虎' }
        ]
    };

    // ===== 简单曲目 (零基础) =====
    var SONGS = [
        {
            name: '小星星',
            emoji: '⭐',
            videoKey: 'small_star',
            notes: ['C4','C4','G4','G4','A4','A4','G4', 'F4','F4','E4','E4','D4','D4','C4',
                    'G4','G4','F4','F4','E4','E4','D4', 'G4','G4','F4','F4','E4','E4','D4',
                    'C4','C4','G4','G4','A4','A4','G4', 'F4','F4','E4','E4','D4','D4','C4'],
            measures: [
                { notes: ['C4','C4','G4','G4'], label: '第一小节' },
                { notes: ['A4','A4','G4','F4'], label: '第二小节' },
                { notes: ['F4','E4','E4','D4'], label: '第三小节' },
                { notes: ['D4','C4','G4','G4'], label: '第四小节' },
                { notes: ['F4','F4','E4','E4'], label: '第五小节' },
                { notes: ['D4','G4','G4','F4'], label: '第六小节' },
                { notes: ['F4','E4','E4','D4'], label: '第七小节' },
                { notes: ['C4','C4','G4','G4'], label: '第八小节' },
                { notes: ['A4','A4','G4','F4'], label: '第九小节' },
                { notes: ['F4','E4','E4','D4'], label: '第十小节' },
                { notes: ['D4','C4','F4','E4'], label: '尾声' }
            ]
        },
        {
            name: '玛丽有小羊',
            emoji: '🐑',
            videoKey: 'mary',
            notes: ['E4','D4','C4','D4','E4','E4','E4', 'D4','D4','D4','E4','G4','G4',
                    'E4','D4','C4','D4','E4','E4','E4', 'D4','D4','E4','D4','C4'],
            measures: [
                { notes: ['E4','D4','C4','D4'], label: '第一小节' },
                { notes: ['E4','E4','E4','D4'], label: '第二小节' },
                { notes: ['D4','D4','E4','G4'], label: '第三小节' },
                { notes: ['E4','D4','C4','D4'], label: '第四小节' },
                { notes: ['E4','E4','E4','D4'], label: '第五小节' },
                { notes: ['D4','E4','D4','C4'], label: '尾声' }
            ]
        },
        {
            name: '欢乐颂',
            emoji: '🎼',
            videoKey: 'ode',
            notes: ['E4','E4','F4','G4','G4','F4','E4','D4', 'C4','C4','D4','E4','E4','D4','D4',
                    'E4','E4','F4','G4','G4','F4','E4','D4', 'C4','C4','D4','E4','D4','C4','C4'],
            measures: [
                { notes: ['E4','E4','F4','G4'], label: '第一小节' },
                { notes: ['G4','F4','E4','D4'], label: '第二小节' },
                { notes: ['C4','C4','D4','E4'], label: '第三小节' },
                { notes: ['E4','D4','D4','E4'], label: '第四小节' },
                { notes: ['E4','F4','G4','G4'], label: '第五小节' },
                { notes: ['F4','E4','D4','C4'], label: '第六小节' },
                { notes: ['C4','D4','E4','D4'], label: '尾声' }
            ]
        },
        {
            name: '两只老虎',
            emoji: '🐯',
            videoKey: 'tiger',
            notes: ['C4','D4','E4','C4','C4','D4','E4','C4', 'E4','F4','G4','E4','F4','G4',
                    'G4','A4','G4','F4','E4','C4','G4','A4','G4','F4','E4','C4',
                    'C4','G4','C4','C4','G4','C4'],
            measures: [
                { notes: ['C4','D4','E4','C4'], label: '第一小节' },
                { notes: ['C4','D4','E4','C4'], label: '第二小节' },
                { notes: ['E4','F4','G4','E4'], label: '第三小节' },
                { notes: ['F4','G4','G4','A4'], label: '第四小节' },
                { notes: ['G4','F4','E4','C4'], label: '第五小节' },
                { notes: ['G4','A4','G4','F4'], label: '第六小节' },
                { notes: ['E4','C4','C4','G4'], label: '第七小节' },
                { notes: ['C4','G4','C4','C4'], label: '尾声' }
            ]
        }
    ];

    // ===== Audio Context =====
    var audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch(e) { return null; }
        }
        return audioCtx;
    }

    function playNote(noteName, duration) {
        var ctx = getAudioCtx();
        if (!ctx) return;
        var freq = NOTE_FREQ[noteName];
        if (!freq) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (duration || 0.5));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + (duration || 0.5) + 0.05);
    }

    function playMelody(notes, noteDuration, callback) {
        var ctx = getAudioCtx();
        if (!ctx) { if (callback) setTimeout(callback, 1000); return; }
        var t = 0;
        notes.forEach(function(n) {
            var freq = NOTE_FREQ[n];
            if (!freq) { t += (noteDuration || 0.4); return; }
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            var startT = ctx.currentTime + t;
            gain.gain.setValueAtTime(0, startT);
            gain.gain.linearRampToValueAtTime(0.25, startT + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startT + (noteDuration || 0.4));
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startT);
            osc.stop(startT + (noteDuration || 0.4) + 0.05);
            t += (noteDuration || 0.4);
        });
        if (callback) setTimeout(callback, t * 1000);
    }

    // ===== Piano State =====
    var pianoState = {
        stage: 0, // 0=视频, 1=认识琴键, 2=听音, 3=弹奏
        correctCount: 0,
        totalNotes: 0,
        currentNoteIdx: 0,
        songIdx: 0,
        measureStartIdx: 0,
        currentMeasures: [],
        allNotes: [],
        isPlaying: false
    };

    // ===== 每日任务 =====
    function getDailyPianoPractice() {
        var d = new Date();
        var dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
        var songIdx = dayOfYear % SONGS.length;
        var song = SONGS[songIdx];
        var measuresPerDay = 2; // 每天2小节
        var totalMeasures = song.measures.length;
        var measureStart = Math.floor(dayOfYear / SONGS.length) %
            Math.max(1, Math.ceil(totalMeasures / measuresPerDay)) * measuresPerDay;
        if (measureStart >= totalMeasures) measureStart = 0;
        var measures = song.measures.slice(measureStart, measureStart + measuresPerDay);
        if (measures.length === 0) measures = song.measures.slice(0, measuresPerDay);
        return { song: song, measures: measures, songIdx: songIdx, measureStart: measureStart };
    }

    // ===== 工具 =====
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

    // ===== 渲染主入口 =====
    function renderPianoPractice(container, onComplete) {
        var practice = getDailyPianoPractice();
        pianoState.songIdx = practice.songIdx;
        pianoState.measureStartIdx = practice.measureStart;
        pianoState.currentMeasures = practice.measures;
        pianoState.allNotes = [];
        practice.measures.forEach(function(m) { pianoState.allNotes = pianoState.allNotes.concat(m.notes); });
        pianoState.totalNotes = pianoState.allNotes.length;
        pianoState.correctCount = 0;
        pianoState.currentNoteIdx = 0;
        pianoState.stage = 0;

        if (window.speechSynthesis) {
            window.speechSynthesis.getVoices();
        }

        renderPianoStage(container, practice, onComplete);
    }

    function renderPianoStage(container, practice, onComplete) {
        stopSpeak();
        switch (pianoState.stage) {
            case 0: renderVideoStage(container, practice, onComplete); break;
            case 1: renderKeysStage(container, practice, onComplete); break;
            case 2: renderListenStage(container, practice, onComplete); break;
            case 3: renderPlayStage(container, practice, onComplete); break;
            default: renderResultStage(container, practice, onComplete);
        }
    }

    // ===== 阶段1: 教学视频 =====
    function renderVideoStage(container, practice, onComplete) {
        var song = practice.song;
        var videoData = (VIDEO_LESSONS[song.videoKey] && VIDEO_LESSONS[song.videoKey][0]) || VIDEO_LESSONS['basic'][0];

        var progressPct = (pianoState.stage / 4) * 100;

        container.innerHTML =
            '<div class="piano-practice">' +
                '<div class="piano-top-bar">' +
                    '<div class="piano-song-info">' +
                        '<span class="piano-song-emoji">' + song.emoji + '</span>' +
                        '<span class="piano-song-name">' + song.name + '</span>' +
                    '</div>' +
                    '<div class="piano-stage-indicator">1/4 · 看视频</div>' +
                '</div>' +
                '<div class="piano-progress-bar">' +
                    '<div class="piano-progress-fill" style="width:' + progressPct + '%"></div>' +
                '</div>' +
                // 教师角色
                '<div class="piano-teacher-section">' +
                    '<div class="piano-teacher-avatar">👩‍🏫</div>' +
                    '<div class="piano-speech-bubble">' +
                        '<p class="piano-speech-text">先看一段视频,老师教你今天这首曲子!</p>' +
                        '<button class="piano-speech-play" id="pianoSpeechPlay">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                // 视频标题
                '<div class="piano-video-title">' +
                    '<h3 class="piano-scenario-title">' + videoData.title + '</h3>' +
                    '<p class="piano-scenario-subtitle">' + videoData.desc + '</p>' +
                '</div>' +
                // 视频播放器
                '<div class="piano-video-wrapper">' +
                    '<iframe class="piano-video-iframe" src="' + videoData.url + '" ' +
                    'scrolling="no" frameborder="0" allowfullscreen="true"></iframe>' +
                '</div>' +
                '<div class="piano-actions">' +
                    '<button class="piano-continue-btn" id="pianoContinueBtn">看完了,下一步 →</button>' +
                '</div>' +
            '</div>';

        var speechBtn = document.getElementById('pianoSpeechPlay');
        if (speechBtn) {
            speechBtn.addEventListener('click', function() { speak('先看一段视频,老师教你今天这首曲子!'); });
        }

        var continueBtn = document.getElementById('pianoContinueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', function() {
                stopSpeak();
                pianoState.stage = 1;
                renderPianoStage(container, practice, onComplete);
            });
        }

        setTimeout(function() { speak('先看一段视频,老师教你今天这首曲子!'); }, 500);
    }

    // ===== 阶段2: 认识琴键 =====
    var KEYS_TEACHING = [
        { note: 'C4', solfege: 'Do', number: '1', cn: '第一个白键,叫Do,简谱是1' },
        { note: 'D4', solfege: 'Re', number: '2', cn: '右边第二个白键,叫Re,简谱是2' },
        { note: 'E4', solfege: 'Mi', number: '3', cn: '第三个白键,叫Mi,简谱是3' },
        { note: 'F4', solfege: 'Fa', number: '4', cn: '第四个白键,叫Fa,简谱是4' },
        { note: 'G4', solfege: 'Sol', number: '5', cn: '第五个白键,叫Sol,简谱是5' },
        { note: 'A4', solfege: 'La', number: '6', cn: '第六个白键,叫La,简谱是6' },
        { note: 'B4', solfege: 'Si', number: '7', cn: '第七个白键,叫Si,简谱是7' }
    ];
    var keyTeachingIdx = 0;

    function renderKeysStage(container, practice, onComplete) {
        keyTeachingIdx = 0;
        renderKeyTeaching(container, practice, onComplete);
    }

    function renderKeyTeaching(container, practice, onComplete) {
        var progressPct = (pianoState.stage / 4 + (keyTeachingIdx / KEYS_TEACHING.length) * 0.25) * 100;
        var keyInfo = KEYS_TEACHING[keyTeachingIdx];

        // 渲染键盘
        var whiteKeysHtml = WHITE_KEYS.map(function(k) {
            var info = NOTE_DISPLAY[k] || { key: k, solfege: k };
            var isTarget = k === keyInfo.note;
            return '<button class="piano-key ' + (isTarget ? 'target-highlight' : '') +
                '" data-note="' + k + '" data-key="' + (info.key || k) + '">' +
                '<span class="key-label">' + (info.key || k) + '</span>' +
                '<span class="key-solfege">' + (info.solfege || '') + '</span>' +
                '</button>';
        }).join('');

        container.innerHTML =
            '<div class="piano-practice">' +
                '<div class="piano-top-bar">' +
                    '<div class="piano-song-info">' +
                        '<span class="piano-song-emoji">🎹</span>' +
                        '<span class="piano-song-name">认识琴键</span>' +
                    '</div>' +
                    '<div class="piano-stage-indicator">2/4 · 认琴键</div>' +
                '</div>' +
                '<div class="piano-progress-bar">' +
                    '<div class="piano-progress-fill" style="width:' + progressPct + '%"></div>' +
                '</div>' +
                // 教师角色
                '<div class="piano-teacher-section">' +
                    '<div class="piano-teacher-avatar">👩‍🏫</div>' +
                    '<div class="piano-speech-bubble">' +
                        '<p class="piano-speech-text">' + keyInfo.cn + '</p>' +
                        '<button class="piano-speech-play" id="pianoSpeechPlay">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="piano-current-key-info">' +
                    '<div class="piano-key-display">' +
                        '<span class="piano-solfege-large">' + keyInfo.solfege + '</span>' +
                        '<span class="piano-number-large">' + keyInfo.number + '</span>' +
                    '</div>' +
                    '<p class="piano-key-prompt">请在键盘上找到发光的 <b>' + keyInfo.solfege + '</b> 键,然后点一下!</p>' +
                '</div>' +
                '<div class="piano-keyboard piano-keyboard-2">' + whiteKeysHtml + '</div>' +
            '</div>';

        var speechBtn = document.getElementById('pianoSpeechPlay');
        if (speechBtn) {
            speechBtn.addEventListener('click', function() { speak(keyInfo.cn); });
        }

        // 点击键盘
        container.querySelectorAll('.piano-key').forEach(function(key) {
            key.addEventListener('click', function() {
                var note = key.dataset.note;
                playNote(note, 0.4);
                key.classList.add('pressed');
                setTimeout(function() { key.classList.remove('pressed'); }, 200);

                if (note === keyInfo.note) {
                    key.classList.add('correct-key');
                    showToast('对了!这就是 ' + keyInfo.solfege + ' 键!');
                    speak('对了!这就是 ' + keyInfo.solfege + ' 键');
                    setTimeout(function() {
                        key.classList.remove('correct-key', 'target-highlight');
                        keyTeachingIdx++;
                        if (keyTeachingIdx >= KEYS_TEACHING.length) {
                            // 进入下一阶段
                            pianoState.stage = 2;
                            renderPianoStage(container, practice, onComplete);
                        } else {
                            renderKeyTeaching(container, practice, onComplete);
                        }
                    }, 1200);
                } else {
                    key.classList.add('wrong-key');
                    showToast('再找找看,发光的那个键!');
                    setTimeout(function() { key.classList.remove('wrong-key'); }, 400);
                }
            });
        });

        // 自动播放
        setTimeout(function() { speak(keyInfo.cn); }, 500);
    }

    // ===== 阶段3: 听音练习 =====
    var listeningIdx = 0;
    var LISTENING_NOTES = ['C4', 'E4', 'G4', 'A4', 'F4']; // 听音练习的5个音

    function renderListenStage(container, practice, onComplete) {
        listeningIdx = 0;
        renderListening(container, practice, onComplete);
    }

    function renderListening(container, practice, onComplete) {
        var progressPct = (pianoState.stage / 4 + (listeningIdx / LISTENING_NOTES.length) * 0.25) * 100;
        var targetNote = LISTENING_NOTES[listeningIdx];
        var info = NOTE_DISPLAY[targetNote];

        var whiteKeysHtml = WHITE_KEYS.map(function(k) {
            var ki = NOTE_DISPLAY[k] || { key: k, solfege: k };
            return '<button class="piano-key" data-note="' + k + '" data-key="' + (ki.key || k) + '">' +
                '<span class="key-label">' + (ki.key || k) + '</span>' +
                '<span class="key-solfege">' + (ki.solfege || '') + '</span>' +
                '</button>';
        }).join('');

        container.innerHTML =
            '<div class="piano-practice">' +
                '<div class="piano-top-bar">' +
                    '<div class="piano-song-info">' +
                        '<span class="piano-song-emoji">🎧</span>' +
                        '<span class="piano-song-name">听音找键</span>' +
                    '</div>' +
                    '<div class="piano-stage-indicator">3/4 · 听音</div>' +
                '</div>' +
                '<div class="piano-progress-bar">' +
                    '<div class="piano-progress-fill" style="width:' + progressPct + '%"></div>' +
                '</div>' +
                // 教师角色
                '<div class="piano-teacher-section">' +
                    '<div class="piano-teacher-avatar">👩‍🏫</div>' +
                    '<div class="piano-speech-bubble">' +
                        '<p class="piano-speech-text">先听一下老师弹的音,然后在键盘上找到这个键!</p>' +
                        '<button class="piano-speech-play" id="pianoSpeechPlay">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="piano-listen-area">' +
                    '<button class="piano-listen-btn" id="pianoListenBtn">' +
                        '<svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>' +
                        '<span>点我听</span>' +
                    '</button>' +
                    '<p class="piano-listen-hint">听到什么音?在键盘上点一下!</p>' +
                '</div>' +
                '<div class="piano-keyboard piano-keyboard-2">' + whiteKeysHtml + '</div>' +
            '</div>';

        var speechBtn = document.getElementById('pianoSpeechPlay');
        if (speechBtn) {
            speechBtn.addEventListener('click', function() {
                speak('先听一下老师弹的音,然后在键盘上找到这个键!');
            });
        }

        // 听音按钮
        var listenBtn = document.getElementById('pianoListenBtn');
        if (listenBtn) {
            listenBtn.addEventListener('click', function() {
                playNote(targetNote, 0.8);
                listenBtn.classList.add('playing');
                setTimeout(function() { listenBtn.classList.remove('playing'); }, 800);
            });
            // 自动播放一次
            setTimeout(function() { listenBtn.click(); }, 800);
        }

        // 键盘点击
        container.querySelectorAll('.piano-key').forEach(function(key) {
            key.addEventListener('click', function() {
                var note = key.dataset.note;
                playNote(note, 0.4);
                key.classList.add('pressed');
                setTimeout(function() { key.classList.remove('pressed'); }, 200);

                if (note === targetNote) {
                    key.classList.add('correct-key');
                    var successMsgs = ['太厉害了!', '完全正确!', '耳朵真灵!', '你真聪明!'];
                    var successMsg = successMsgs[Math.floor(Math.random() * successMsgs.length)];
                    showToast(successMsg + ' 这个音是 ' + info.solfege + '!');
                    speak(successMsg);
                    setTimeout(function() {
                        key.classList.remove('correct-key');
                        listeningIdx++;
                        if (listeningIdx >= LISTENING_NOTES.length) {
                            pianoState.stage = 3;
                            renderPianoStage(container, practice, onComplete);
                        } else {
                            renderListening(container, practice, onComplete);
                        }
                    }, 1500);
                } else {
                    key.classList.add('wrong-key');
                    showToast('再听听看!');
                    setTimeout(function() { key.classList.remove('wrong-key'); }, 400);
                }
            });
        });

        setTimeout(function() {
            speak('先听一下老师弹的音,然后在键盘上找到这个键!');
        }, 500);
    }

    // ===== 阶段4: 弹奏练习 =====
    function renderPlayStage(container, practice, onComplete) {
        pianoState.currentNoteIdx = 0;
        pianoState.correctCount = 0;
        renderPlaying(container, practice, onComplete);
    }

    function renderPlaying(container, practice, onComplete) {
        var song = practice.song;
        var progressPct = (pianoState.stage / 4 + (pianoState.currentNoteIdx / pianoState.totalNotes) * 0.25) * 100;
        var allNotes = pianoState.allNotes;

        // 渲染乐谱
        var measuresHtml = practice.measures.map(function(m, mi) {
            var notesHtml = m.notes.map(function(n, ni) {
                var globalIdx = mi * 4 + ni;
                var info = NOTE_DISPLAY[n] || { solfege: n, number: '?', key: n };
                return '<div class="piano-note" data-note="' + n + '" data-idx="' + globalIdx + '">' +
                    '<span class="note-number">' + info.number + '</span>' +
                    '<span class="note-solfege">' + info.solfege + '</span>' +
                    '</div>';
            }).join('');
            return '<div class="piano-measure">' +
                '<span class="measure-label">' + m.label + '</span>' +
                '<div class="measure-notes">' + notesHtml + '</div>' +
                '</div>';
        }).join('');

        var whiteKeysHtml = WHITE_KEYS.map(function(k) {
            var info = NOTE_DISPLAY[k] || { key: k, solfege: k };
            return '<button class="piano-key" data-note="' + k + '" data-key="' + (info.key || k) + '">' +
                '<span class="key-label">' + (info.key || k) + '</span>' +
                '<span class="key-solfege">' + (info.solfege || '') + '</span>' +
                '</button>';
        }).join('');

        container.innerHTML =
            '<div class="piano-practice">' +
                '<div class="piano-top-bar">' +
                    '<div class="piano-song-info">' +
                        '<span class="piano-song-emoji">' + song.emoji + '</span>' +
                        '<span class="piano-song-name">' + song.name + '</span>' +
                    '</div>' +
                    '<div class="piano-stage-indicator">4/4 · 弹奏</div>' +
                '</div>' +
                '<div class="piano-progress-bar">' +
                    '<div class="piano-progress-fill" id="pianoProgressFill" style="width:' + progressPct + '%"></div>' +
                '</div>' +
                // 教师角色
                '<div class="piano-teacher-section">' +
                    '<div class="piano-teacher-avatar">👩‍🏫</div>' +
                    '<div class="piano-speech-bubble">' +
                        '<p class="piano-speech-text">现在跟着乐谱弹奏!把今天的小节都弹完吧!</p>' +
                        '<button class="piano-speech-play" id="pianoSpeechPlay">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="piano-sheet">' + measuresHtml + '</div>' +
                '<div class="piano-prompt" id="pianoPrompt">' +
                    '<span class="prompt-icon">🎹</span>' +
                    '<span class="prompt-text">点击键盘上对应的琴键弹奏</span>' +
                '</div>' +
                '<div class="piano-keyboard">' + whiteKeysHtml + '</div>' +
                '<div class="piano-actions piano-actions-secondary">' +
                    '<button class="piano-play-all-btn" id="pianoPlayAll">' +
                        '<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>' +
                        '<span>整段试听</span>' +
                    '</button>' +
                '</div>' +
            '</div>';

        highlightCurrentNote();

        var speechBtn = document.getElementById('pianoSpeechPlay');
        if (speechBtn) {
            speechBtn.addEventListener('click', function() {
                speak('现在跟着乐谱弹奏!把今天的小节都弹完吧!');
            });
        }

        var playAllBtn = document.getElementById('pianoPlayAll');
        if (playAllBtn) {
            playAllBtn.addEventListener('click', function() {
                playMelody(allNotes, 0.4);
                showToast('正在播放整段旋律...');
            });
        }

        container.querySelectorAll('.piano-key').forEach(function(key) {
            key.addEventListener('click', function() {
                handlePianoKey(key, allNotes, container, practice, onComplete);
            });
        });

        setTimeout(function() {
            speak('现在跟着乐谱弹奏!把今天的小节都弹完吧!');
        }, 500);
    }

    function highlightCurrentNote() {
        var notes = document.querySelectorAll('.piano-note');
        notes.forEach(function(n) { n.classList.remove('current', 'done', 'wrong'); });
        for (var i = 0; i < pianoState.currentNoteIdx; i++) {
            if (notes[i]) notes[i].classList.add('done');
        }
        if (notes[pianoState.currentNoteIdx]) {
            notes[pianoState.currentNoteIdx].classList.add('current');
            var noteName = notes[pianoState.currentNoteIdx].dataset.note;
            var info = NOTE_DISPLAY[noteName] || {};
            var prompt = document.getElementById('pianoPrompt');
            if (prompt) {
                prompt.innerHTML =
                    '<span class="prompt-icon">🎹</span>' +
                    '<span class="prompt-text">弹奏 <b>' + (info.solfege || noteName) + '</b> (' + (info.number || '') + ')</span>';
            }
            document.querySelectorAll('.piano-key').forEach(function(k) {
                k.classList.remove('target');
                if (k.dataset.note === noteName) k.classList.add('target');
            });
        }
        var fill = document.getElementById('pianoProgressFill');
        if (fill) {
            var stageProgress = pianoState.currentNoteIdx / Math.max(1, pianoState.totalNotes);
            var pct = (pianoState.stage / 4 + stageProgress * 0.25) * 100;
            fill.style.width = pct + '%';
        }
    }

    function handlePianoKey(keyEl, allNotes, container, practice, onComplete) {
        if (pianoState.currentNoteIdx >= allNotes.length) return;
        var noteName = keyEl.dataset.note;
        playNote(noteName, 0.4);
        keyEl.classList.add('pressed');
        setTimeout(function() { keyEl.classList.remove('pressed'); }, 200);

        var expectedNote = allNotes[pianoState.currentNoteIdx];
        if (noteName === expectedNote) {
            pianoState.correctCount++;
            pianoState.currentNoteIdx++;
            highlightCurrentNote();

            if (pianoState.currentNoteIdx >= allNotes.length) {
                showToast('太棒了! ' + CHILD_NAME + ' 弹完了今天的练习!');
                speak('太棒了,你弹完了今天的练习!');
                setTimeout(function() {
                    pianoState.stage = 4;
                    renderResultStage(container, practice, onComplete);
                }, 1800);
            }
        } else {
            var info = NOTE_DISPLAY[expectedNote] || {};
            showToast('再试试,找 ' + (info.solfege || expectedNote) + ' 键');
            speak('再试试,找 ' + (info.solfege || expectedNote) + ' 键');
            keyEl.classList.add('wrong-key');
            setTimeout(function() { keyEl.classList.remove('wrong-key'); }, 400);
        }
    }

    // ===== 结果 =====
    function renderResultStage(container, practice, onComplete) {
        var total = pianoState.totalNotes;
        var correct = pianoState.correctCount;
        var stars = correct >= total ? 3 : (correct >= total * 0.6 ? 2 : 1);

        var starsHtml = '';
        for (var s = 0; s < 3; s++) {
            starsHtml += s < stars
                ? '<span class="result-star filled">★</span>'
                : '<span class="result-star empty">☆</span>';
        }

        var title = '🎉 今日钢琴完成!';
        var msg = CHILD_NAME + '今天弹完了 ' + practice.song.name + ' 的 ' + practice.measures.length + ' 个小节!';

        container.innerHTML =
            '<div class="piano-result">' +
                '<div class="piano-result-emoji">🎹</div>' +
                '<h2 class="piano-result-title">' + title + '</h2>' +
                '<p class="piano-result-msg">' + msg + '</p>' +
                '<div class="piano-result-stars">' + starsHtml + '</div>' +
                '<div class="piano-result-score">' + correct + ' / ' + total + ' 音</div>' +
                '<button class="piano-result-btn">太棒了!</button>' +
            '</div>';

        var btn = container.querySelector('.piano-result-btn');
        if (btn) {
            btn.addEventListener('click', function() {
                stopSpeak();
                if (onComplete) onComplete(correct, total);
            });
        }

        setTimeout(function() {
            stopSpeak();
            if (onComplete) onComplete(correct, total);
        }, 4000);

        speak(title + ' ' + msg);
    }

    // Expose
    window.PianoModule = {
        renderPianoPractice: renderPianoPractice,
        playNote: playNote,
        playMelody: playMelody,
        getDailyPianoPractice: getDailyPianoPractice,
        speak: speak,
        stopSpeak: stopSpeak,
        SONGS: SONGS
    };
})();
