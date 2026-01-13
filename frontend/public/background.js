// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchWorldTime") {
        fetch("https://worldtimeapi.org/api/ip")
            .then(res => res.json())
            .then(data => sendResponse({ success: true, data }))
            .catch(err => sendResponse({ success: false, error: err.message }));

        // 表示异步响应
        return true;
    }
});
