const MAX_STORED_TABS = 100;

const tabInfoMap = new Map();

async function saveClosedTab(tabInfo) {
    if (!tabInfo || !tabInfo.url || tabInfo.url.startsWith('about:') || tabInfo.url.startsWith('moz-extension:')) {
        return;
    }

    const closedTabInfo = {
        url: tabInfo.url,
        title: tabInfo.title || tabInfo.url,
        favIconUrl: tabInfo.favIconUrl || null,
        closedTime: Date.now()
    };

    try {
        const result = await browser.storage.local.get('closedTabs');
        const closedTabs = result.closedTabs || [];
        
        closedTabs.unshift(closedTabInfo);
        
        if (closedTabs.length > MAX_STORED_TABS) {
            closedTabs.length = MAX_STORED_TABS;
        }
        
        await browser.storage.local.set({ closedTabs });
        console.log('已记录关闭的标签页:', closedTabInfo.title);
    } catch (error) {
        console.error('保存关闭标签页失败:', error);
    }
}

browser.tabs.onCreated.addListener((tab) => {
    if (tab.url) {
        tabInfoMap.set(tab.id, {
            url: tab.url,
            title: tab.title,
            favIconUrl: tab.favIconUrl
        });
    }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        tabInfoMap.set(tabId, {
            url: tab.url,
            title: tab.title,
            favIconUrl: tab.favIconUrl
        });
    } else if (changeInfo.url || changeInfo.title || changeInfo.favIconUrl) {
        const existingInfo = tabInfoMap.get(tabId) || {};
        tabInfoMap.set(tabId, {
            url: changeInfo.url || existingInfo.url || tab.url,
            title: changeInfo.title || existingInfo.title || tab.title,
            favIconUrl: changeInfo.favIconUrl || existingInfo.favIconUrl || tab.favIconUrl
        });
    }
});

browser.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    const tabInfo = tabInfoMap.get(tabId);
    
    if (tabInfo) {
        await saveClosedTab(tabInfo);
        tabInfoMap.delete(tabId);
    } else {
        console.log('未找到标签页信息:', tabId);
    }
});

async function initializeTabInfo() {
    try {
        const tabs = await browser.tabs.query({});
        for (const tab of tabs) {
            if (tab.url && !tab.url.startsWith('about:') && !tab.url.startsWith('moz-extension:')) {
                tabInfoMap.set(tab.id, {
                    url: tab.url,
                    title: tab.title,
                    favIconUrl: tab.favIconUrl
                });
            }
        }
        console.log('已初始化', tabInfoMap.size, '个标签页信息');
    } catch (error) {
        console.error('初始化标签页信息失败:', error);
    }
}

initializeTabInfo();
