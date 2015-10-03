angular.module('post.blocker', [])
    .service('postBlockerSvc', function ($http, $log, disableIScheduleSvc, clearFormSvc) {

        var self = this;
        self.scope = {};

        self.getScope = function (scope) {
            self.scope = scope;
        };
});
