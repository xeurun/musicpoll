(function() {
    "use strict";

    function ApiService($rootScope, $http, $q) {
        //Serialize form data for work with symfony
        var serializeData = function(obj) {
                if (!angular.isObject(obj) ) {
                    return((obj == null) ? "" : obj.toString());
                }
                var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

                for(name in obj) {
                    value = obj[name];
                    if(value instanceof Array) {
                        for(i in value) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += serializeData(innerObj) + '&';
                        }
                    } else if(value instanceof Object) {
                        for(subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += serializeData(innerObj) + '&';
                        }
                    } else if(value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            },
            callWithCustomCallback = function(request, callbacks) {
                var deferred = $q.defer();

                request
                    .success((!angular.isUndefined(callbacks) &&
                                angular.isFunction(callbacks['success'])) ?
                                    callbacks['success'] :
                        function(response, status, headers, config) {
                            if (!response.error && response.message) {
                                $rootScope.$broadcast('popup:show', {type: 'success', message: response.message});
                            }else if(response.error) {
                                $rootScope.$broadcast('popup:show', {type: 'danger', message: response.error});
                            }

                            deferred.resolve(response);
                        }
                    )
                    .error((!angular.isUndefined(callbacks) &&
                                angular.isFunction(callbacks['error'])) ?
                                    callbacks['error'] :
                        function(response, status, headers, config) {
                            $rootScope.$broadcast('popup:show', {type: 'danger', message: 'ERROR!'});

                            deferred.reject(response);
                        }
                    );

                return deferred.promise;
            };

        //Read
        this.jsonp = function(url, data, callbacks) {
            return callWithCustomCallback($http.jsonp(url, {
                params: data
            }), callbacks);
        };

        //Read
        this.get = function(url, data, callbacks) {
            return callWithCustomCallback($http.get(url, {
                params: data
            }), callbacks);
        };

        //Update
        this.put = function(url, data, callbacks) {
            return callWithCustomCallback($http.put(url, data), callbacks);
        };

        //Delete
        this.delete = function(url, data, callbacks) {
            return callWithCustomCallback($http.delete(url, data), callbacks);
        };

        //Create
        this.post = function(url, data, callbacks) {
            return callWithCustomCallback($http.post(url,
                angular.isUndefined(data) ? null : serializeData(data)
            ), callbacks);
        };
    };

    angular.module('musicpoll').service('ApiService', ApiService);
})();