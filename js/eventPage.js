chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.onAlarm.addListener(function () {
        chrome.storage.local.get(['terms'], function (result) {
            if (result.terms) {
                var index = getRandomInt(0, result.terms.length - 1);
                var opt = {
                    type: "basic",
                    title: result.terms[index].term,
                    message: result.terms[index].definition,
                    iconUrl: "images/sign-question-icon.png"
                };
                chrome.notifications.create(opt, function () { });
            }
        });
    });
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}