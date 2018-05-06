function Quizlet() {
    var self = this,
        client_id = "XXX",
        secret_key = "XXX",
        redirect_uri = "https://XXX.chromiumapp.org/quizlet",
        auth_params = {
            client_id: client_id,
            response_type: "code",
            scope: "read",
            secret_key: secret_key,
            state: "state",
            redirect_uri: redirect_uri
        },
        get_token_url = "https://api.quizlet.com/oauth/token",
        authorize_url = "https://quizlet.com/authorize" + '?' + $.param(auth_params);

    self.authorize = function (successCallback, failCallback) {
        chrome.identity.launchWebAuthFlow(
            {
                'url': authorize_url,
                'interactive': true
            },
            function (redirect_url) {
                requestAccessToken(
                    redirect_url,
                    function (data) {
                        chrome.storage.local.set({ access_token: data.access_token, user_id: data.user_id }, function () { });
                        successCallback(data);
                    },
                    function () { failCallback(); });
            });
    };

    self.getAccessToken = function (callback) {
        chrome.storage.local.get(['access_token'], function (result) {
            callback(result.access_token);;
        });
    };

    self.getUserId = function (callback) {
        chrome.storage.local.get(['user_id'], function (result) {
            callback(result.user_id);
        });
    };

    self.getModules = function (successCallback, failCallback) {
        chrome.storage.local.get(['user_id', 'access_token'], function (result) {
            if (result.user_id) {
                $.ajax(
                    "https://api.quizlet.com/2.0/users/" + result.user_id,
                    {
                        method: "GET",
                        headers: {
                            authorization: "Bearer " + result.access_token,
                        },
                        contentType: "application/json; charset=UTF-8"
                    }
                ).done(
                    function (data) {
                        successCallback(data.sets);
                    }
                ).fail(function () {
                    failCallback();
                });
            } else {
                failCallback();
            }
        });
    };

    self.getModuleTerms = function (moduleId, successCallback, failCallback) {
        chrome.storage.local.get(['access_token'], function (result) {
            if (result.access_token) {
                $.ajax(
                    "https://api.quizlet.com/2.0/sets/" + moduleId + "/terms",
                    {
                        method: "GET",
                        headers: {
                            authorization: "Bearer " + result.access_token,
                        },
                        contentType: "application/json; charset=UTF-8"
                    }
                ).done(
                    function (data) {
                        successCallback(data);
                    }
                ).fail(function () {
                    failCallback();
                });
            } else {
                failCallback();
            }
        });
    };

    self.logout = function (callback) {
        chrome.storage.local.clear(function () {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
            callback();
        });
    };

    function requestAccessToken(redirect_url, successCallback, failCallback) {
        var auth_token = getUrlQueryParam(redirect_url, "code");
        $.ajax(
            get_token_url,
            {
                method: "POST",
                headers: {
                    authorization: "Basic " + btoa(client_id + ":" + secret_key)
                },
                data: {
                    grant_type: "authorization_code",
                    code: auth_token,
                    redirect_uri: redirect_uri,
                },
            }
        ).done(
            function (data) {
                successCallback(data);
            }
        ).fail(failCallback);
    }

    function getUrlQueryParam(url, paramName) {
        var queryString = url.split('?')[1];
        var paramValue;
        queryString.split('&').forEach(element => {
            var param = element.split('=');
            if (param[0] == paramName) {
                paramValue = param[1];
            }
        });
        return paramValue;
    }
}