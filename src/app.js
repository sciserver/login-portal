angular.module('angular-login', [
  // login service
  'loginService',
  // 'angular-login.mock',
  'angular-login.directives',
  // different app sections
  'angular-login.home',
  'angular-login.pages',
  'angular-login.register',
  'angular-login.error',
  // components
  'ngAnimate',
  'ngGrid',
  'angular-login.services'
])
.config(function ($urlRouterProvider, $httpProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);
})
.run(function ($rootScope) {
  /**
   * $rootScope.doingResolve is a flag useful to display a spinner on changing states.
   * Some states may require remote data so it will take awhile to load.
   */
  var resolveDone = function () { $rootScope.doingResolve = false; };
  $rootScope.doingResolve = false;

  $rootScope.$on('$stateChangeStart', function () {
    $rootScope.doingResolve = true;
  });
  $rootScope.$on('$stateChangeSuccess', resolveDone);
  $rootScope.$on('$stateChangeError', resolveDone);
  $rootScope.$on('$statePermissionError', resolveDone);
})
.controller('BodyController', function ($scope, $state, $stateParams, loginService, $http, $timeout, AppAlert, $location) {

  // Expose $state and $stateParams to the <body> tag
  $scope.$state = $state;
  $scope.$stateParams = $stateParams;
  
  $scope.isCollapsed = false; // open by default

  // loginService exposed and a new Object containing login user/pwd
  $scope.ls = loginService;
  $scope.login = {
    working: false,
    wrong: false
  };

  if(typeof $location.search().message !== "undefined") {
    AppAlert.add('info', $location.search().message);
  }

  $scope.loginMe = function () {
    var loginPromise = $http.post('/keystone/v2.0/tokens', 
      {
       "auth": 
       {
         "tenantName": $scope.login.username, 
         "passwordCredentials":
         {
           "username": $scope.login.username, 
           "password": $scope.login.password
         }
       }
      }
    );

    $scope.login.working = true;
    $scope.login.wrong = false;

    loginService.loginUser(loginPromise);
    loginPromise.error(function () {
      $scope.login.wrong = true;
      $timeout(function () { $scope.login.wrong = false; }, 8000);
    });
    loginPromise.finally(function () {
      $scope.login.working = false;
    });
  };
  $scope.logoutMe = function () {
    // loginService.logoutUser($http.get('/logout'));
    loginService.logoutUser();
  };

  $scope.closeAlert = function(alert) {
    AppAlert.closeAlert(alert);
  }

});
