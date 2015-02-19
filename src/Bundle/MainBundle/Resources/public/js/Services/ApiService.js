(function() {
    "use strict";

    function ApiService($rootScope, $http) {
        this.serializeData = function(obj) {
            if (!angular.isObject(obj) ) {
                return( ( obj== null ) ? "" : obj.toString() );
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
                        query += this.serializeData(innerObj) + '&';
                    }
                } else if(value instanceof Object) {
                    for(subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += this.serializeData(innerObj) + '&';
                    }
                } else if(value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        this.get = function(url) {
            return $http.get(url);
        };

        this.getJsonP = function(url, data) {
            return $http.jsonp(url, {
                params: data
            });
        };

        this.sendRequest = function(url, data) {
            data = data ? this.serializeData(data) : data;
            $http.post(url, data).
                success(function(response, status, headers, config) {
                    if (!response.error && response.message) {
                        $rootScope.$broadcast('popup:show', {type: 'success', 'message': response.message});
                    }else if(response.error) {
                        $rootScope.$broadcast('popup:show', {type: 'danger', 'message': response.error});
                    }
                }).
                error(function(response, status, headers, config) {
                    $rootScope.$broadcast('popup:show', {type: 'danger', 'message': 'ERROR!'});
                });
        };
    };

    angular.module('musicpoll').service('ApiService', ApiService);
})();