/**
 * 钢琴练习模块 - 每日2-4小节渐进式练习
 * 零基础初学者难度，通过练习小节逐步学完一首曲子
 * 使用 Web Audio API 发音
 */
(function () {
    'use strict';

    var CHILD_NAME = '王孟原';

    // 音名 -> 频率 (Hz)
    var NOTE_FREQ = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
        'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99,
        'A5': 880.00
    };

    // 简单曲目 (零基础难度)
    var SONGS = [
        {
            name: '小星星',
            emoji: 'STAR',
            notes: ['C4','C4','G4','G4','A4','A4','G4', 'F4','F4','E4','E4','D4','D4','C4',
                    'G4','G4','F4','F4','E4','E4','D4', 'G4','G4','F4','F4','E4','E4','D4',
                    'C4','C4','G4','G4','A4','A4','G4', 'F4','F4','E4','E4','D4','D4','C4'],
            measures: [ // 每个小节 = 4个音符
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
            emoji: 'LAMB',
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
            emoji: 'JOY',
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
            emoji: 'TIGER',
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

    // 音名显示 (简谱)
    var NOTE_DISPLAY = {
        'C4': { solfege: 'Do', number: '1', key: 'C' },
        'D4': { solfege: 'Re', number: '2', key: 'D' },
        'E4': { solfege: 'Mi', number: '3', key: 'E' },
        'F4': { solfege: 'Fa', number: '4', key: 'F' },
        'G4': { solfege: 'Sol', number: '5', key: 'G' },
        'A4': { solfege: 'La', number: '6', key: 'A' },
        'B4': { solfege: 'Si', number: '7', key: 'B' },
        'C5': { solfege: 'Do\u02b0', number: '1\u02b0', key: 'C2' }
    };

    // 白键列表
    var WHITE_KEYS = ['C4','D4','E4','F4','G4','A4','B4','C5'];

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

    function playMelody(notes, noteDuration) {
        var ctx = getAudioCtx();
        if (!ctx) return;
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
    }

    // ===== Piano State =====
    var pianoState = {
        currentNoteIdx: 0,
        currentMeasures: [],
        correctCount: 0,
        totalNotes: 0,
        songIdx: 0,
        measureStartIdx: 0,
        isPlaying: false
    };

    // ===== Get Daily Piano Practice =====
    function getPianoPracticeDay() {
        var d = new Date();
        var dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
        return dayOfYear;
    }

    function getDailyPianoPractice() {
        var day = getPianoPracticeDay();
        var songIdx = day % SONGS.length;
        var song = SONGS[songIdx];
        // 每天练2-3个小节, 根据天数循环
        var measuresPerDay = 3;
        var totalMeasures = song.measures.length;
        var measureStart = Math.floor(day / SONGS.length) % Math.ceil(totalMeasures / measuresPerDay) * measuresPerDay;
        var measures = song.measures.slice(measureStart, measureStart + measuresPerDay);
        if (measures.length === 0) measures = song.measures.slice(0, measuresPerDay);
        return { song: song, measures: measures, songIdx: songIdx, measureStart: measureStart };
    }

    // ===== Render Piano Practice =====
    function renderPianoPractice(container, onComplete) {
        var practice = getDailyPianoPractice();
        var song = practice.song;
        var allNotes = [];
        practice.measures.forEach(function(m) { allNotes = allNotes.concat(m.notes); });

        pianoState.currentMeasures = practice.measures;
        pianoState.totalNotes = allNotes.length;
        pianoState.currentNoteIdx = 0;
        pianoState.correctCount = 0;
        pianoState.songIdx = practice.songIdx;
        pianoState.measureStartIdx = practice.measureStart;

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
            var info = NOTE_DISPLAY[k] || { key: k };
            return '<button class="piano-key" data-note="' + k + '" data-key="' + info.key + '">' +
                '<span class="key-label">' + (info.key || k) + '</span>' +
                '<span class="key-solfege">' + (info.solfege || '') + '</span>' +
                '</button>';
        }).join('');

        container.innerHTML =
            '<div class="piano-practice">' +
                '<div class="piano-header">' +
                    '<div class="piano-song-info">' +
                        '<span class="piano-song-name">' + song.name + '</span>' +
                        '<span class="piano-song-hint">今日练习 ' + practice.measures.length + ' 个小节</span>' +
                    '</div>' +
                    '<button class="piano-play-all-btn" id="pianoPlayAll">' +
                        '<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>' +
                        '<span>整段试听</span>' +
                    '</button>' +
                '</div>' +
                '<div class="piano-progress-bar">' +
                    '<div class="piano-progress-fill" id="pianoProgressFill" style="width:0%"></div>' +
                '</div>' +
                '<div class="piano-sheet">' + measuresHtml + '</div>' +
                '<div class="piano-prompt" id="pianoPrompt">' +
                    '<span class="prompt-icon">PIANO</span>' +
                    '<span class="prompt-text">点击键盘上对应的琴键弹奏</span>' +
                '</div>' +
                '<div class="piano-keyboard">' + whiteKeysHtml + '</div>' +
            '</div>';

        // Highlight first note
        highlightCurrentNote();

        // Play all button
        var playAllBtn = document.getElementById('pianoPlayAll');
        if (playAllBtn) {
            playAllBtn.addEventListener('click', function() {
                playMelody(allNotes, 0.4);
                showToast('正在播放整段旋律...');
            });
        }

        // Key click handlers
        container.querySelectorAll('.piano-key').forEach(function(key) {
            key.addEventListener('click', function() {
                handlePianoKey(key, allNotes, onComplete);
            });
        });
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
                    '<span class="prompt-icon">PIANO</span>' +
                    '<span class="prompt-text">弹奏 <b>' + (info.solfege || noteName) + '</b> (' + (info.number || '') + ')</span>';
            }
            // Highlight matching key
            document.querySelectorAll('.piano-key').forEach(function(k) {
                k.classList.remove('target');
                if (k.dataset.note === noteName) k.classList.add('target');
            });
        }
        // Update progress bar
        var fill = document.getElementById('pianoProgressFill');
        if (fill) {
            var pct = pianoState.totalNotes > 0 ? (pianoState.currentNoteIdx / pianoState.totalNotes * 100) : 0;
            fill.style.width = pct + '%';
        }
    }

    function handlePianoKey(keyEl, allNotes, onComplete) {
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
                // All notes done!
                showToast('太棒了！' + CHILD_NAME + '弹完了今天的练习！');
                setTimeout(function() {
                    if (onComplete) onComplete(pianoState.correctCount, pianoState.totalNotes);
                }, 1500);
            }
        } else {
            // Wrong key - show hint
            var info = NOTE_DISPLAY[expectedNote] || {};
            showToast('再试试，找 ' + (info.solfege || expectedNote) + ' 键');
            keyEl.classList.add('wrong-key');
            setTimeout(function() { keyEl.classList.remove('wrong-key'); }, 400);
        }
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
    window.PianoModule = {
        renderPianoPractice: renderPianoPractice,
        playNote: playNote,
        playMelody: playMelody,
        getDailyPianoPractice: getDailyPianoPractice,
        SONGS: SONGS
    };
})();
