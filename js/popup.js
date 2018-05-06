$(function () {
    var quizlet = new Quizlet();
    quizlet.getUserId(function (userId) {
        toggleAuthorizationUI(userId);

        $("#logout").on("click", function () {
            quizlet.logout(function () {
                toggleAuthorizationUI(undefined);
            });
        });

        $('#authorize').on("click", function () {
            quizlet.authorize(function () {
                quizlet.getUserId(toggleAuthorizationUI);
            },
                function () { });
        });

        $('#options').on("click", function () {
            chrome.tabs.create({ 'url': "/options.html" });
        });
    });
});

function toggleAuthorizationUI(userId) {
    var isAuthorized = false;
    if (userId) {
        isAuthorized = true;
        setCurrentUserText(userId);
    }
    $('#authorize').toggle(!isAuthorized);
    $("#userInfo").toggle(isAuthorized);
}

function setCurrentUserText(userid) {
    $('#currentUser').text("You're logged in as " + userid);
}