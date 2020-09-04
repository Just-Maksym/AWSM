"use strict";

var thisDevice = {
  isDeviceReady: false,
  isRegistered: false,
  isEnrolled: false,
  deviceTag: undefined,
  isFingerprintAvailable: false,
  isFingerprintDeviceChecked: false,
  isFirstRun: true,
  isRecoveryMode: false,
  platform: "test_v1",
  deepLink: undefined,
  pushMessToken: undefined,
  data: { //TODO: populate device-specific data here
    platform: "web_test"
  }
};





document.addEventListener("modelBank started", () => {

  TheM.temp.theme = "white";
  for (let prop in document.styleSheets) {
    let css = document.styleSheets[prop];
    if (css && css.href && css.href.includes("dark")) css.disabled = true
  }




    thisDevice.isFirstRun = false;

    console.log("Device init");

 
    thisDevice.isDeviceReady = true;
    TheM.newEvent("modelbank deviceready");



    TheM.newEvent("go", {
      href: "main"
    });


 

});






function doExitTheApp() {
  console.log("will now exit")
}