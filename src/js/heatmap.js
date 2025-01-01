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
        "在更深的理解了「长期主义」这句话之后，会发现奇绩就在身体力行的践行用「惠人达己，守正出奇」的方法去「培养中国的早期创业者」。💡",
        "今天读完《认知觉醒》，让我深刻理解到：所谓的自我提升，本质上是大脑的认知升级，而不是简单的知识累积。要从「无知」到「知道」，再到「做到」。📚",
        "复盘过去的失败经历，发现最大的问题不是能力不足，而是对自己的定位不够清晰。要先「知己」，才能「知彼」，最后才能「百战不殆」。🎯",
        "偶然间想明白了一个道理：真正的学习不是为了找到答案，而是为了培养发现问题和解决问题的能力。这才是终身学习的核心。✨",
        "今天和团队讨论时有个重要发现：高效能团队的关键不在于个人能力的简单叠加，而在于团队共识的达成和协作模式的优化。🤝",
        "反思近期的工作方式，意识到所谓的「忙碌」往往是因为没有做好优先级管理。真正的高效是做对的事，而不是把事情做对。⚡️",
        "读完《原则》这本书，深感：人生的进步往往来自于对失败的深刻复盘和总结。每一次失败都是一次提升认知的机会。📖",
        "今天参加了一个关于可持续发展的讨论，让我意识到：真正的创新不仅要解决当下的问题，更要为未来负责。🌱",
        "和导师深入交流后明白：所谓的经验，不是年限的累积，而是深度思考后的认知升级。要从「量变」到「质变」。🎓",
        "今天重新思考了「价值」这个概念：真正的价值不在于你掌握了多少资源，而在于你能为他人解决多少问题。💫",
        "复盘这几年的创业经历，最大的感悟是：创业不是为了证明自己比别人强，而是为了解决真实的问题，创造真实的价值。🚀",
        "今天读到一句话很有触动：「最好的投资就是投资自己」。但真正的自我投资不是盲目学习，而是有针对性的能力构建。💎",
        "观察了很多成功案例后发现：真正的创新往往来自于对既有认知的突破，而不是简单的模仿和改良。要敢于质疑，勇于尝试。🔍",
        "今天和一位老友讨论人生规划，达成共识：与其追求完美的规划，不如培养持续学习和适应变化的能力。这才是真正的核心竞争力。🌟",
        "深入思考后发现：所谓的「工作生活平衡」，本质上是对人生价值的重新定义和时间分配的智慧选择。要平衡好「急」与「远」。⚖️"
    ];

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

    function generateRandomNotes() {
        let notes = [];
        for (let i = 0; i < 30; i++) {
            const randomContent = sampleContents[Math.floor(Math.random() * sampleContents.length)];
            notes.push({
                content: randomContent,
                timestamp: randomDate()
            });
        }
        notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return notes;
    }

    localStorage.clear();
    const randomNotes = generateRandomNotes();
    localStorage.setItem('flomo-notes', JSON.stringify(randomNotes));

    function addNoteToDOM(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
            <div class="note-content">${note.content.replace(/\n/g, '<br>')}</div>
            <div class="note-time">${note.timestamp}</div>
        `;
        notesContainer.appendChild(noteElement);
    }

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        notesContainer.innerHTML = '';
        notes.forEach(note => addNoteToDOM(note));
        updateStats();
    }

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

        let notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        notes.unshift(note);
        localStorage.setItem('flomo-notes', JSON.stringify(notes));

        addNoteToDOM(note);
        updateStats();

        noteInput.value = '';
        noteInput.focus();
    }

    function updateStats() {
        const notes = JSON.parse(localStorage.getItem('flomo-notes') || '[]');
        noteCountElement.textContent = notes.length;
        
        const totalChars = notes.reduce((total, note) => {
            return total + note.content.trim().length;
        }, 0);
        wordCountElement.textContent = totalChars;

        updateAnalytics(notes);
    }

    function updateAnalytics(notes) {
        const dateMap = new Map();
        const monthMap = new Map();
        
        notes.forEach(note => {
            const date = new Date(note.timestamp);
            const hour = date.getHours();
            const month = date.getMonth() + 1;
            const dateKey = `${month}-${hour}`;
            
            const wordCount = note.content.trim().length;
            dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + wordCount);
            monthMap.set(month, (monthMap.get(month) || 0) + wordCount);
        });

        const heatmapData = Array.from(dateMap).map(([date, value]) => {
            const [month, hour] = date.split('-').map(Number);
            return [month - 1, hour, value];
        });

        let maxWords = Math.max(...Array.from(monthMap.values()));
        let topMonth = '';
        monthMap.forEach((words, month) => {
            if (words === maxWords) {
                topMonth = month;
            }
        });

        if (topMonth) {
            topMonthElement.textContent = `${topMonth}月`;
        }

        const avgWords = Math.round(Array.from(dateMap.values()).reduce((a, b) => a + b, 0) / dateMap.size);
        avgWordsPerDayElement.textContent = `${avgWords}字`;

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
                    const month = params.data[0] + 1;
                    const hour = params.data[1];
                    return `${month}月 ${hour}:00<br/>写作字数：${params.data[2]} 字`;
                }
            },
            grid: {
                top: '15%',
                left: '10%',
                right: '5%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                data: Array.from({length: 12}, (_, i) => i + 1),
                splitArea: {
                    show: true
                },
                axisLabel: {
                    formatter: '{value}月',
                    margin: 15,
                    fontSize: 12
                }
            },
            yAxis: {
                type: 'category',
                data: Array.from({length: 24}, (_, i) => `${String(i).padStart(2, '0')}:00`),
                splitArea: {
                    show: true
                },
                axisLabel: {
                    margin: 15,
                    fontSize: 12
                }
            },
            visualMap: {
                min: 0,
                max: Math.max(...heatmapData.map(item => item[2])),
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '5%',
                itemWidth: 15,
                itemHeight: 80,
                text: ['多', '少'],
                textStyle: {
                    fontSize: 12
                },
                inRange: {
                    color: ['#f3f4f6', '#9be9a8', '#40c463', '#30a14e', '#216e39']
                }
            },
            series: [{
                name: '写作字数',
                type: 'heatmap',
                data: heatmapData,
                label: {
                    show: false
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

        heatmapChart.setOption(option);
    }

    loadNotes();
    noteInput.focus();

    saveButton.addEventListener('click', saveNote);
    noteInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            saveNote();
        }
    });

    window.addEventListener('resize', () => {
        heatmapChart.resize();
    });

    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful');
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }

    // 下拉刷新功能
    let startY = 0;
    const pullToRefresh = document.querySelector('.pull-to-refresh');
    
    document.addEventListener('touchstart', e => {
        startY = e.touches[0].pageY;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        const y = e.touches[0].pageY;
        const diff = y - startY;
        
        if (diff > 0 && window.scrollY === 0) {
            pullToRefresh.classList.add('active');
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchend', e => {
        if (pullToRefresh.classList.contains('active')) {
            pullToRefresh.classList.remove('active');
            loadNotes();
        }
    });

    // 快速操作按钮
    document.getElementById('quickNote').addEventListener('click', () => {
        noteInput.focus();
    });

    document.getElementById('quickPhoto').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // 这里可以添加拍照功能的实现
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            alert('无法访问相机');
        }
    });

    document.getElementById('quickVoice').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // 这里可以添加语音记录功能的实现
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            alert('无法访问麦克风');
        }
    });

    document.getElementById('quickShare').addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Flomo笔记',
                    text: '我的思考记录',
                    url: window.location.href
                });
            } catch (err) {
                console.log('分享失败:', err);
            }
        } else {
            alert('您的浏览器不支持分享功能');
        }
    });

    // 优化移动端的图表展示
    function updateChartSize() {
        const width = window.innerWidth;
        if (width <= 768) {
            heatmapChart.setOption({
                grid: {
                    left: '15%',
                    right: '5%',
                    top: '10%',
                    bottom: '15%'
                },
                visualMap: {
                    itemWidth: 10,
                    itemHeight: 60
                }
            });
        }
        heatmapChart.resize();
    }

    window.addEventListener('resize', updateChartSize);
    updateChartSize();
});
