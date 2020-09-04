"use strict";


var URLPrefix = "templates/";

let socket = {};


TheM.refresh("app started");
let ic;

var theApp = theApp || angular.module("theApp", ["ngRoute", "cleave.js"])
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider, $templateCache) {

    // $locationProvider.hashPrefix("#/");

    // $routeProvider.when("", {
    //   templateUrl: URLPrefix + "111.html"
    // });
    // $routeProvider.when("#", {
    //   templateUrl: URLPrefix + "222.html"
    // });
    // $routeProvider.when("/", {
    //   templateUrl: URLPrefix + "333.html"
    // });
    // $routeProvider.when("#/", {
    //   templateUrl: URLPrefix + "444.html"
    // });


    // $routeProvider.when("/card/:id", {
    //   templateUrl: URLPrefix + "card.html"
    // });








    $routeProvider.when("/:name*", {
      templateUrl: function (params) {
        let givenPath = params.name;
        if (theApp.alternativeRoutes && params.name) {




          try {
            if (theApp.alternativeRoutes[givenPath] && theApp.alternativeRoutes[givenPath].path) return URLPrefix + theApp.alternativeRoutes[givenPath].path;
            if (theApp.alternativeRoutes[givenPath]) return URLPrefix + theApp.alternativeRoutes[givenPath];
          } catch (err) {
            console.error(err);
          }


          let parseGiven = function (givenStr) {
            if (typeof givenStr !== "string") return false;
            let parsed = givenStr.split("/");
            for (let i = parsed.length - 1; i >= 0; i--)
              if (parsed[i] === "") parsed.splice(i, 1);
            return parsed;
          }

          let parsed = parseGiven(givenPath);
          let t = theApp.alternativeRoutes;
          for (let a of parsed) {
            let numberOfProps = 0;
            let lastProp;
            for (let prop in t) {
              numberOfProps++;
              lastProp = prop;
            }
            // if (numberOfProps === 1 && lastProp.startsWith(":")) {
            if (numberOfProps === 1 || lastProp.startsWith(":")) {
              params[lastProp.substring(1, (lastProp.length))] = a;
              t = t[lastProp];
            } else {
              t = t[a];
            }
          }
          if (t.path) return URLPrefix + t.path.toLocaleLowerCase();
        }
        console.error("Failed finding a path");
        console.error(params);
        return URLPrefix + "main.html";
      }
    });






    $routeProvider.otherwise({
      //TODO: instead of returning error.html, return a variable, so branding could control which template to use as a catch-all template
      templateUrl: function (params) {

        console.error("Failed finding a path");
        console.error(params);

        if (theApp.my && theApp.my.errorPage) return URLPrefix + theApp.my.errorPage;

        return URLPrefix + "main.html";
      }
    });



  }]).directive("scroll", ["$document", "$timeout", function ($document, $timeout) {
    return { //required for the main banking screen only 
      link: function (scope, element, attr) {
        element.on("touchend", function (e) {
          setTimeout(() => {
            TheM.temp.chosenAccountIndex = Math.round((document.getElementById("whiteaccountscroller").scrollLeft / document.getElementById("whiteaccountscroller").scrollWidth) * 3);
            TheM.refresh();
          }, 300);
        });
      }
    };
  }]);


 




theApp.controller("GeneralController", function ($window, $scope, $routeParams, $location, $rootScope) {

  $scope.$on('$viewContentLoaded', function () {
    $window.scrollTo(0, 0);
  });




  $scope.$on('$routeChangeSuccess', function ($event, next, current) {
    setTimeout(() => TheM.finished(), 300);
  });

  $scope.echo = function (given) { //used for debug
    console.log(given);
  }


  let temp = {};

  $scope.TheM = TheM;
  $scope.moment = moment;
  $scope.temp = temp;
  $scope.thisDevice = thisDevice;
  $scope.routeParams = $routeParams;
  if (typeof ephemeral !== "undefined") $scope.ephemeral = ephemeral;

  $scope.go = function (path, $event) {
    console.log("going to " + path);

    //the following fixes a quirk whereby a single tap gets registered as several consecutive taps. 
    //So, we detect the time in between taps and if it is too short, just ignore the next one
    if ($event) {
      if ($scope.lastTimeStamp && $event.timeStamp)
        if (Math.abs($scope.lastTimeStamp - $event.timeStamp) < 300) {
          $event.preventDefault();
          $scope.lastTimeStamp = $event.timeStamp;
          return;
        }
      $scope.lastTimeStamp = $event.timeStamp;
    }
    $rootScope.askedToGo = path;
    $location.path(decodeURI(path));
  };

  TheM.on("go", detail => {
    $scope.go(detail.detail.href);
  });


  $scope.goBack = function () {
    window.history.back();
  }


  $scope.MathMax = function () {
    return Math.max(...arguments);
  }
  $scope.MathMin = function () {
    return Math.min(...arguments);
  }
  $scope.MathAbs = function () {
    return Math.abs(...arguments);
  }
  $scope.ParseInt = function (given) {
    return parseInt(given);
  }
  $scope.ParseFloat = function (given) {
    return parseFloat(given);
  }


  document.addEventListener("eventModelUpdate", handlermodelUpdate, false);
  document.addEventListener("modelBank some data refreshed", handlermodelUpdate, false);
  document.addEventListener("modelBank logged out", function () {
    console.log("Redirecting to index");
    $window.location.href = "index.html";
  }, false);
  document.addEventListener("modelBank asked to logout", doExitTheApp, false);

  TheM.refresh = function (given, payload) {
    TheM.newEvent(given, payload);

    if (!$scope.$$phase) {
      $scope.$apply()
    }

    return true;
  }






  function handlermodelUpdate(e) {
    if (!$scope.$$phase) {
      $scope.$apply()
    }
  }

  document.addEventListener("modelBank actively rejected login", function () {
    //TODO: react on this
    $location.path(decodeURI(("/noauth")));
  }, true);

  $scope.$on('$locationChangeStart', function (event, next, current) {});

  //if url was like /test/123 
  //it gets matched with paths like /test/:param
  //and $scope.routeParams = {param:123}
  $scope.doParseRouteParams = function (givenStr) {
    let parseGiven = function (givenStr) {
      if (typeof givenStr !== "string") return false;
      let parsed = givenStr.split("/");
      for (let i = parsed.length - 1; i >= 0; i--)
        if (parsed[i] === "") parsed.splice(i, 1);
      return parsed;
    }
    let parsed = parseGiven($routeParams.name);
    let params = {};
    let t = theApp.alternativeRoutes;

    for (let a of parsed) {
      let numberOfProps = 0;
      let lastProp;
      for (let prop in t) {
        numberOfProps++;
        lastProp = prop;
      }
      if (numberOfProps === 1 && lastProp.startsWith(":")) {
        params[lastProp.substr(1)] = a;
        t = t[lastProp];
      } else {
        t = t[a];
      }
    }
    if (t.path) {
      $scope.routeParams = $scope.routeParams;
      for (let prop in params)
        $scope.routeParams[prop] = params[prop];
    }
  }


  $scope.doCopyToClipboardGeneric = function (givenStr) {
    if (cordova && cordova.plugins && cordova.plugins.clipboard && cordova.plugins.clipboard.copy) {
      cordova.plugins.clipboard.copy(givenStr);
      TheM.notificationsOnscreen.add({
        undoable: false,
        error: false,
        text: "Copied to the clipboard",
        TTLsec: 1
      });
    }
    //TODO: if it is a browser, use different technique
  }


  $scope.doShare = function (given) {
    navigator.share(given);
  }

  $scope.currentURL = $location.absUrl();


});


theApp.controller("MainController", function ($scope, $location, $rootScope) {
  if (thisDevice.isRegistered && TheM.user && !TheM.user.isAuthenticated && !TheM.user.doLogin.isWorking) $location.path("/login");

  $rootScope.askedToGo = "/"; //arrived to the main screen

  $scope.$on('$locationChangeStart', function (event, next, current) {
    if (next.endsWith('login') && TheM && TheM.user && TheM.user.isAuthenticated) event.preventDefault();
    if ($rootScope.askedToGo === "/" && !next.endsWith("/#/")) event.preventDefault(); //prevent back button on the main screen
  });

});
 


TheM.refresh("app ready");





var doExitTheApp = function () {};


// theApp.config(['$compileProvider', function ($compileProvider) {
//  $compileProvider.debugInfoEnabled(false);
// }]);