"use strict";

console.log("started test");

var ephemeral = {};

var ControllersCollecton = {};

var RedefineRouting;

var testData;



testData = {}




TheM.on("app ready", function () {

  //routes specific to this branding
  let parseGiven = function (givenStr) {
    if (typeof givenStr !== "string") return false;
    let parsed = givenStr.split("/");
    for (let i = parsed.length - 1; i >= 0; i--)
      if (parsed[i] === "") parsed.splice(i, 1);
    return parsed;
  }

  theApp.my = {};

  theApp.my.addPath = function (givenStr, givenPath) {
    if (typeof givenStr !== "string") return false;
    let parsed = parseGiven(givenStr);

    let t = theApp.alternativeRoutes;
    for (let a of parsed) {
      t[a] = t[a] || {};
      t = t[a];
    }
    t.path = givenPath;
  }


  theApp.alternativeRoutes = theApp.alternativeRoutes || {};

  TheM.newEvent("routing ready");

});





TheM.on("routing ready", function () {


  for (let prop in ControllersCollecton)
    window.theApp.controller(prop, ControllersCollecton[prop]);






  RedefineRouting = function () {
    console.log("routing being redefined");

    console.log("routing for test");
    theApp.my.errorPage = "test/main.html";
    theApp.my.addPath("/main", "test/main.html");
    theApp.my.addPath("/page", "test/page.html");

    //Create a new file test/mypage.html
    //Add the path to it like this
    //theApp.my.addPath("/mypage", "test/mypage.html");

    //Create a link on any other page like this
    //  <box ng-click="go('mypage');">

  }
  RedefineRouting();


  TheM.on("RedefineRouting", () => {
    theApp.run(function ($templateCache) {
      $templateCache.removeAll()
    });
    RedefineRouting();
  });

});



TheM.on("modelBank do toggle CSS", detail => {
  if (!detail || !detail.detail || !detail.detail.name || !detail.detail.hasOwnProperty("value")) return;
  let givenName = detail.detail.name;
  let givenValue = detail.detail.value;


  let doAddCss = function (givenName) {
    if (css && css.href && css.href.includes(givenName)) return true;
    try {
      let head = document.getElementsByTagName("head")[0];
      let style = document.createElement("link");
      style.href = `./css/${givenName}.css`;
      style.type = "text/css";
      style.rel = "stylesheet";
      head.append(style);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  let found = false;
  for (let prop in document.styleSheets) {
    let css = document.styleSheets[prop];
    if (css && css.href && css.href.includes(givenName)) {
      found = true;
      css.disabled = givenValue;
      return
    }
  }
  if (!found) {
    doAddCss(GivenName);
  }


});