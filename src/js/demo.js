document.addEventListener('DOMContentLoaded', () => {
    const noteInput = document.getElementById('noteInput');
    const saveButton = document.getElementById('saveNote');
    const notesContainer = document.getElementById('notesContainer');
    const noteCountElement = document.getElementById('noteCount');
    const wordCountElement = document.getElementById('wordCount');
    const topMonthElement = document.getElementById('topMonth');
    const avgWordsPerDayElement = document.getElementById('avgWordsPerDay');
    
    // Initialize ECharts
    const heatmapChart = echarts.init(document.getElementById('heatmap'));
    
    // Sample content for random notes
    const sampleContents = [
        "今天的阳光真好，照在身上暖暖的，让人感觉很舒服。☀️",
        "读完了一本很棒的书，收获满满。📚",
        "和朋友聊天时突然想到一个有趣的点子。💡",
        "工作中遇到了一个难题，但经过思考终于解决了。✨",
        "今天学习了一个新技能，感觉自己又进步了。📈",
        "看到路边的小花开得很漂亮，停下来拍了张照片。🌸",
        "突然想到一个项目的改进方案，赶紧记录下来。📝",
        "这个周末要去爬山，期待已久的活动终于要开始了。🏃‍♂️",
        "昨晚做了一个很奇妙的梦，现在回想起来还觉得有趣。🌙",
        "找到了一个提高效率的好方法，要坚持使用。⚡️",
        "今天的晚霞特别美，整个天空都染上了红色。🌅",
        "和家人视频，听到他们都很好，心里很温暖。❤️",
        "完成了一个重要的项目，感觉特别有成就感。🎯",
        "发现了一家很棒的咖啡店，以后可以常来。☕️",
        "整理房间时翻到了很多回忆，感慨时光飞逝。📸",
        "今天尝试了一个新的食谱，味道出乎意料的好。🍳",
        "清晨的第一缕阳光照进窗户，开启美好的一天。🌄",
        "记录一下今天的心情：平静且充满希望。✨",
        "突然很想去旅行，列一个旅行清单吧。✈️",
        "下班路上看到一只可爱的小猫，心情瞬间变好。🐱"
    ];

    // Generate random date between 2020 and 2024
    function randomDate() {
        const start = new Date(2020, 0, 1);
        const end = new Date(2024, 11, 31);
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    // Generate random notes
    function generateRandomNotes() {
        let notes = [];
        for (let i = 0; i < 30; i++) {
            const randomContent = sampleContents[Math.floor(Math.random() * sampleContents.length)];
            notes.push({
                content: randomContent,
                timestamp: randomDate()
            });
        }
        // Sort notes by timestamp in descending order
        notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return notes;
    }

    // Clear existing notes and generate new ones
    localStorage.clear(); // Clear all localStorage data
    const randomNotes = generateRandomNotes();
    localStorage.setItem('flomo-notes', JSON.stringify(randomNotes));

    // Load notes and update stats
    loadNotes();
    updateStats();

    // Focus on textarea when page loads
    noteInput.focus();

    // Save note when button is clicked
    saveButton.addEventListener('click', saveNote);

    // Save note when Ctrl+Enter is pressed
    noteInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            saveNote();
        }
    });

    function saveNote() {
        const content = noteInput.value.trim();
        if (!content) return;

        const note = {
            content: content,
            timestamp: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
        };

        // Get existing notes
        let notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        notes.unshift(note);
        localStorage.setItem('flomo-notes', JSON.stringify(notes));

        // Add new note to DOM
        addNoteToDOM(note);
        updateStats();

        // Clear input
        noteInput.value = '';
        noteInput.focus();
    }

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        notesContainer.innerHTML = ''; // Clear existing notes
        notes.forEach(note => addNoteToDOM(note));
        updateStats();
    }

    function addNoteToDOM(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
            <div class="note-content">${note.content.replace(/\n/g, '<br>')}</div>
            <div class="note-time">${note.timestamp}</div>
        `;

        notesContainer.appendChild(noteElement);
    }

    function updateStats() {
        const notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        // Update note count
        noteCountElement.textContent = notes.length;
        
        // Calculate total character count
        const totalChars = notes.reduce((total, note) => {
            return total + note.content.trim().length;
        }, 0);
        wordCountElement.textContent = totalChars;

        // Update analytics
        updateAnalytics(notes);
    }

    function updateAnalytics(notes) {
        // Prepare data for heatmap
        const dateMap = new Map();
        const monthMap = new Map();
        
        notes.forEach(note => {
            const date = new Date(note.timestamp);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            const wordCount = note.content.trim().length;
            
            dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + wordCount);
            monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + wordCount);
        });

        // Convert data for heatmap
        const heatmapData = Array.from(dateMap).map(([date, value]) => {
            return [date, value];
        });

        // Find top month
        let topMonth = '';
        let maxWords = 0;
        monthMap.forEach((words, month) => {
            if (words > maxWords) {
                maxWords = words;
                topMonth = month;
            }
        });

        // Calculate average words per day
        const totalDays = dateMap.size || 1;
        const totalWords = Array.from(dateMap.values()).reduce((a, b) => a + b, 0);
        const avgWords = Math.round(totalWords / totalDays);

        // Update info
        if (topMonth) {
            const [year, month] = topMonth.split('-');
            topMonthElement.textContent = `${year}年${month}月`;
        }
        avgWordsPerDayElement.textContent = `${avgWords}字`;

        // Configure and render heatmap
        const option = {
            title: {
                top: 10,
                left: 'center',
                text: '字数统计热力图',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                position: 'top',
                formatter: function (params) {
                    return `${params.data[0]}<br/>写作字数：${params.data[1]} 字`;
                },
                textStyle: {
                    fontSize: 14
                },
                padding: [10, 15]
            },
            visualMap: {
                min: 0,
                max: Math.max(...Array.from(dateMap.values())),
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: 20,
                itemWidth: 15,
                itemHeight: 120,
                text: ['多', '少'],
                textStyle: {
                    fontSize: 12
                },
                inRange: {
                    color: ['#f3f4f6', '#9be9a8', '#40c463', '#30a14e', '#216e39']
                }
            },
            calendar: {
                top: 80,
                left: 40,
                right: 40,
                bottom: 80,
                cellSize: [18, 18], // 调整单元格大小
                range: getCalendarRange(),
                itemStyle: {
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                yearLabel: { 
                    show: true,
                    fontSize: 12,
                    margin: 40
                },
                dayLabel: {
                    firstDay: 1,
                    nameMap: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                    fontSize: 12,
                    margin: 5
                },
                monthLabel: {
                    show: true,
                    nameMap: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                    fontSize: 12,
                    margin: 5
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#fff',
                        width: 2
                    }
                }
            },
            series: [{
                type: 'heatmap',
                coordinateSystem: 'calendar',
                calendarIndex: 0,
                data: heatmapData,
                label: {
                    show: false
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.2)'
                    }
                }
            }]
        };

        heatmapChart.setOption(option);
    }

    function getCalendarRange() {
        const notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        if (notes.length === 0) return '2024';

        const dates = notes.map(note => new Date(note.timestamp));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        return [
            `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`,
            `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`
        ];
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        heatmapChart.resize();
    });
});
