document.addEventListener('DOMContentLoaded', () => {
    const currentDate = new Date();
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    // 获取所有笔记
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    
    // 更新统计数据
    updateStats(notes);
    
    // 初始加载随机笔记
    loadNotes('random');

    // 绑定筛选按钮事件
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            loadNotes(e.target.dataset.filter);
        });
    });

    // 绑定刷新按钮事件
    document.getElementById('refreshNotes').addEventListener('click', () => {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        loadNotes(activeFilter);
    });

    // 绑定分享按钮事件
    document.getElementById('shareReview').addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '我的笔记回顾',
                    text: generateShareText(),
                    url: window.location.href
                });
            } catch (err) {
                console.log('分享失败:', err);
            }
        } else {
            alert('您的浏览器不支持分享功能');
        }
    });
});

function updateStats(notes) {
    const totalNotes = notes.length;
    const today = new Date().toLocaleDateString();
    const todayNotes = notes.filter(note => 
        new Date(note.timestamp).toLocaleDateString() === today
    ).length;

    // 计算连续天数
    const streakDays = calculateStreakDays(notes);

    document.getElementById('totalNotes').textContent = totalNotes;
    document.getElementById('todayNotes').textContent = todayNotes;
    document.getElementById('streakDays').textContent = streakDays;
}

function calculateStreakDays(notes) {
    if (notes.length === 0) return 0;

    const dates = notes.map(note => new Date(note.timestamp).toLocaleDateString());
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 1;
    const today = new Date().toLocaleDateString();
    let currentDate = new Date(uniqueDates[0]);

    // 如果今天没有笔记，从昨天开始计算
    if (uniqueDates[0] !== today) {
        currentDate = new Date(currentDate.getTime() - 86400000);
    }

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(currentDate.getTime() - 86400000);
        if (prevDate.toLocaleDateString() === uniqueDates[i]) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }

    return streak;
}

function loadNotes(filter) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    let filteredNotes = [];

    switch (filter) {
        case 'random':
            filteredNotes = getRandomNotes(notes, 5);
            break;
        case 'today':
            const today = new Date().toLocaleDateString();
            filteredNotes = notes.filter(note => 
                new Date(note.timestamp).toLocaleDateString() === today
            );
            break;
        case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filteredNotes = notes.filter(note => 
                new Date(note.timestamp) > weekAgo
            );
            break;
        case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filteredNotes = notes.filter(note => 
                new Date(note.timestamp) > monthAgo
            );
            break;
        case 'favorite':
            filteredNotes = notes.filter(note => note.favorite);
            break;
    }

    displayNotes(filteredNotes);
}

function getRandomNotes(notes, count) {
    const shuffled = [...notes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, notes.length));
}

function displayNotes(notes) {
    const container = document.getElementById('reviewNotes');
    container.innerHTML = '';

    if (notes.length === 0) {
        container.innerHTML = '<div class="review-note"><div class="note-content">暂无笔记</div></div>';
        return;
    }

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'review-note';
        
        const timeAgo = getTimeAgo(new Date(note.timestamp));
        
        noteElement.innerHTML = `
            <div class="review-note-date">${new Date(note.timestamp).toLocaleString()}</div>
            <div class="review-note-content">${note.content}</div>
            <div class="review-actions">
                <button class="review-action-btn" onclick="toggleFavorite('${note.timestamp}')">
                    <i class="ri-star-${note.favorite ? 'fill' : 'line'}"></i>
                    <span>${note.favorite ? '取消收藏' : '收藏'}</span>
                </button>
                <button class="review-action-btn" onclick="shareNote('${note.timestamp}')">
                    <i class="ri-share-line"></i>
                    <span>分享</span>
                </button>
            </div>
        `;
        
        container.appendChild(noteElement);
    });
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval}${unit === 'year' ? '年' : 
                                unit === 'month' ? '个月' : 
                                unit === 'week' ? '周' : 
                                unit === 'day' ? '天' : 
                                unit === 'hour' ? '小时' : '分钟'}前`;
        }
    }
    
    return '刚刚';
}

function toggleFavorite(timestamp) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const noteIndex = notes.findIndex(note => note.timestamp === timestamp);
    
    if (noteIndex !== -1) {
        notes[noteIndex].favorite = !notes[noteIndex].favorite;
        localStorage.setItem('notes', JSON.stringify(notes));
        
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        loadNotes(activeFilter);
    }
}

async function shareNote(timestamp) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const note = notes.find(note => note.timestamp === timestamp);
    
    if (note && navigator.share) {
        try {
            await navigator.share({
                title: 'Flomo笔记分享',
                text: note.content,
                url: window.location.href
            });
        } catch (err) {
            console.log('分享失败:', err);
        }
    } else {
        alert('您的浏览器不支持分享功能');
    }
}

function generateShareText() {
    const stats = {
        total: document.getElementById('totalNotes').textContent,
        today: document.getElementById('todayNotes').textContent,
        streak: document.getElementById('streakDays').textContent
    };
    
    return `我的Flomo笔记统计：
总笔记数：${stats.total}
今日新增：${stats.today}
连续天数：${stats.streak}`;
}
