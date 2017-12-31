'use strict';

angular.module('app')
  .factory('preventTemplateCache', function($injector) {
return {
      'request': function(config) {
        if (config.url.indexOf('views') !== -1) {
          config.url = config.url + '?v=' + '1';
        }
        return config;
      }
    }
  })
.config(function($httpProvider) {
    $httpProvider.interceptors.push('preventTemplateCache');
  });
