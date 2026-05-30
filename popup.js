document.addEventListener('DOMContentLoaded', async () => {
    const tabList = document.getElementById('tabList');
    const clearAllBtn = document.getElementById('clearAll');
    
    function getDateLabel(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);
        
        if (dateOnly.getTime() === today.getTime()) {
            return '今天';
        } else if (dateOnly.getTime() === yesterday.getTime()) {
            return '昨天';
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
            });
        }
    }
    
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function formatRelativeTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return `${Math.floor(diff / 60000)} 分钟前`;
        } else {
            return formatTime(timestamp);
        }
    }
    
    function createDateHeader(dateLabel) {
        const header = document.createElement('div');
        header.className = 'date-header';
        
        const label = document.createElement('span');
        label.className = 'date-label';
        label.textContent = dateLabel;
        
        header.appendChild(label);
        return header;
    }
    
    function createTabItem(tab, index) {
        const item = document.createElement('div');
        item.className = 'tab-item';
        item.dataset.index = index;
        
        const favicon = document.createElement('img');
        favicon.className = 'favicon';
        favicon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23ccc"/></svg>';
        favicon.onerror = () => {
            favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23ccc"/></svg>';
        };
        
        const info = document.createElement('div');
        info.className = 'tab-info';
        
        const title = document.createElement('div');
        title.className = 'tab-title';
        title.textContent = tab.title || '无标题';
        title.title = tab.title || '无标题';
        
        const url = document.createElement('div');
        url.className = 'tab-url';
        url.textContent = tab.url;
        url.title = tab.url;
        
        info.appendChild(title);
        info.appendChild(url);
        
        const time = document.createElement('div');
        time.className = 'tab-time';
        if (tab.closedTime) {
            const timeText = document.createElement('div');
            timeText.className = 'time-text';
            timeText.textContent = formatTime(tab.closedTime);
            
            const relativeText = document.createElement('div');
            relativeText.className = 'relative-time';
            relativeText.textContent = formatRelativeTime(tab.closedTime);
            
            time.appendChild(timeText);
            time.appendChild(relativeText);
        }
        
        const actions = document.createElement('div');
        actions.className = 'tab-actions';
        
        const openBtn = document.createElement('button');
        openBtn.className = 'open-btn';
        openBtn.textContent = '打开';
        openBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await browser.tabs.create({ url: tab.url });
            window.close();
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await deleteStoredTab(index);
            await renderTabs();
        });
        
        actions.appendChild(openBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(favicon);
        item.appendChild(info);
        item.appendChild(time);
        item.appendChild(actions);
        
        item.addEventListener('click', async () => {
            await browser.tabs.create({ url: tab.url });
            window.close();
        });
        
        return item;
    }
    
    async function loadStoredTabs() {
        const result = await browser.storage.local.get('closedTabs');
        return result.closedTabs || [];
    }
    
    async function deleteStoredTab(index) {
        const result = await browser.storage.local.get('closedTabs');
        const closedTabs = result.closedTabs || [];
        closedTabs.splice(index, 1);
        await browser.storage.local.set({ closedTabs });
    }
    
    async function renderTabs() {
        tabList.innerHTML = '';
        
        const tabs = await loadStoredTabs();
        
        if (tabs.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty';
            empty.textContent = '暂无已关闭的网页';
            tabList.appendChild(empty);
            return;
        }
        
        tabs.sort((a, b) => (b.closedTime || 0) - (a.closedTime || 0));
        
        let currentDateLabel = null;
        
        tabs.forEach((tab, index) => {
            if (tab.closedTime) {
                const dateLabel = getDateLabel(tab.closedTime);
                
                if (dateLabel !== currentDateLabel) {
                    const header = createDateHeader(dateLabel);
                    tabList.appendChild(header);
                    currentDateLabel = dateLabel;
                }
            }
            
            const item = createTabItem(tab, index);
            tabList.appendChild(item);
        });
    }
    
    clearAllBtn.addEventListener('click', async () => {
        if (confirm('确定要清空所有历史记录吗？')) {
            await browser.storage.local.set({ closedTabs: [] });
            await renderTabs();
        }
    });
    
    await renderTabs();
});
