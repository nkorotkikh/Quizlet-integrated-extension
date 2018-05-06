$(function () {
    var dropdown = $("#modules"),
        notifyCheckBox = $("#notify"),
        quizlet = new Quizlet();

    quizlet.getModules(function (modules) {
        for (var i = 0; i < modules.length; i++) {
            dropdown.append($("<option value='" + modules[i].id + "'>" + modules[i].title + "</option>"));
        }

        chrome.storage.local.get(["module_id", "notify"], function (result) {
            dropdown.val(result.module_id);
            notifyCheckBox.prop('checked', result.notify);
        });

        $("#modulesSection").show();
    }, function () { });

    $("#saveBtn").on("click", function () {
        var moduleId = dropdown.val(),
            notify = notifyCheckBox.is(':checked');

        chrome.storage.local.set({
            module_id: moduleId,
            module_title: $('#modules :selected').text(),
            notify: notify
        }, function () { });

        chrome.alarms.clear("LearningAlarm", function () { });
        if (notify) {
            quizlet.getModuleTerms(moduleId, function (terms) {
                chrome.storage.local.set({ terms: terms }, createNotificationsAlarm);
            }, function () { });
        }
    });
});

function createNotificationsAlarm() {
    chrome.alarms.create("LearningAlarm",
        {
            when: Date.now(),
            periodInMinutes: 2
        });
}