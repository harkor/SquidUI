var OctoPrint = OctoPrint;

var env = {};

// Import variables if present (from env.js)
if(window){
  Object.assign(env, window.__env);
}

// Default colors
var brandPrimary =  '#20a8d8';
var brandSuccess =  '#4dbd74';
var brandInfo =     '#63c2de';
var brandWarning =  '#f8cb00';
var brandDanger =   '#f86c6b';

var grayDark =      '#2a2c36';
var gray =          '#55595c';
var grayLight =     '#818a91';
var grayLighter =   '#d1d4d7';
var grayLightest =  '#f8f9fa';

var GCODE_WORKER;

angular
.module('app', [
  'ui.router',
  'oc.lazyLoad',
  'ncy-angular-breadcrumb',
  'angular-loading-bar',
  'plotly',
  'angularMoment',
  'ngFilesizeFilter',
  'filter.duration',
  'ui.bootstrap',
  'angular.filter',
  'angularUtils.directives.dirPagination',
  // 'chart.js'
  // 'bd.sockjs'
  // 'ngWebsocket'
])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.includeSpinner = false;
  cfpLoadingBarProvider.latencyThreshold = 1;
}])
.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
  $rootScope.$on('$stateChangeSuccess',function(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  });
  $rootScope.$state = $state;
  return $rootScope.$stateParams = $stateParams;
}]);

angular
.module('app')
.constant('__env', env)
// .constant('moment', require('moment-timezone'));
;

// if (!angular.merge) {
//
//     angular.merge = (function mergePollyfill() {
//         function setHashKey(obj, h) {
//             if (h) {
//                 obj.$$hashKey = h;
//             } else {
//                 delete obj.$$hashKey;
//             }
//         }
//     });
//
//
//
// }


$.fn.draghover = function(options) {
  return this.each(function() {

    var collection = $(),
        self = $(this);

    self.on('dragenter', function(e) {
      if (collection.length === 0) {
        self.trigger('draghoverstart');
      }
      collection = collection.add(e.target);
    });

    self.on('dragleave drop', function(e) {
      collection = collection.not(e.target);
      if (collection.length === 0) {
        self.trigger('draghoverend');
      }
    });
  });
};
