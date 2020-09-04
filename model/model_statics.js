"use strict";



if (typeof module !== "undefined" && module != null) {
  //node
} else {
  //browser
  var StaticsClass;
}

//This module loads static objects (or arrays) from the server
//Just call TheM.statics.<object_name> and it will fetch "/statics/static_object_name" file from the server


(function (given) {

  let Statics = function (given) {
    let TheM = given;

    return (function (given) { //statics
      console.log("Statics init");
      let _namesOfStaticsLoaded = {};
      let _statics = [];
      let _staticsImmutable = {};
      let _beingUpdated = {};
      const _TTL_STATICS_MS = 2 * 24 * 60 * 60 * 1000;

      Object.defineProperty(_statics, "doInit", {
        get: function () {
          return function (givenName, givenObject, givenTtlMsec) {
            _namesOfStaticsLoaded[givenName] = {
              name: givenName,
              isWorthSaving: false,
              dtsExpires: new Date((new Date()).valueOf() + (givenTtlMsec || _TTL_STATICS_MS))
            };
            _staticsImmutable[givenName] = givenObject;
            console.log("Initialized", givenName);
          };
        }
      });



      Object.defineProperty(_statics, "doUpdate", { //forces update of given object
        enumerable: false,
        configurable: false,
        value: function (givenName) {
          if (_beingUpdated[givenName]) return _beingUpdated[givenName];
          _beingUpdated[givenName] = new Promise(function resolver(resolve, reject) {
            if (typeof givenName !== "string") return reject();
            console.log(`will now update static ${givenName}`);
            _beingUpdated[givenName] = true;
            TheM.common.doCall("GET", `static_${givenName}`, {}, function (data) {
                if (data && data.name && data.payload) {
                  _namesOfStaticsLoaded[givenName] = {
                    name: givenName,
                    isPublic: (data.isPublic === true ? true : false),
                    isWorthSaving: (data.isWorthSaving === true ? true : false),
                    dtsExpires: new Date((new Date()).valueOf() + (data.ttlMsec || _TTL_STATICS_MS))
                  };
                  _staticsImmutable[givenName] = data.payload;

                  Object.defineProperty(_staticsImmutable[givenName], "one", {
                    value: function (given) {
                      for (let el of _staticsImmutable[givenName]) {
                        let found = true;
                        for (let prop in given) {
                          if (!el[prop] || el[prop] != given[prop]) found = false;
                        }
                        if (found) return el;
                      }
                    }
                  });

                  delete _beingUpdated[givenName];
                  TheM.newEvent("modelBank static refreshed", givenName);
                  _statics.doSave();
                  return resolve(data.payload);
                } else {
                  return reject({
                    error: true
                  });
                };
              },
              function () {
                console.error(`Failed fetching static_${givenName}`);
                return reject({
                  error: true
                });
              });
          });
          return _beingUpdated[givenName];
        }
      });

      Object.defineProperty(_statics, "doSave", { //saves statics in the local storage
        enumerable: false,
        configurable: false,
        value: function () {

          setTimeout(() => {
            let tempNamesOfStaticsLoaded = {};
            let tempStaticsImmutable = {};

            //save locally only those objects which are marked as worth saving nad which are public
            for (let name in _namesOfStaticsLoaded)
              if (_namesOfStaticsLoaded[name] &&
                _namesOfStaticsLoaded[name].isWorthSaving &&
                _namesOfStaticsLoaded[name].isPublic &&
                _staticsImmutable[name]) {
                tempNamesOfStaticsLoaded[name] = _namesOfStaticsLoaded[name];
                tempStaticsImmutable[name] = _staticsImmutable[name];
              }
            TheM.common.storeLocally({
              tag: "awsm_statics_v4",
              payload: {
                namesOfStaticsLoaded: tempNamesOfStaticsLoaded,
                staticsImmutable: tempStaticsImmutable
              }
            });
          }, 500);
          return true;
        }
      });

      Object.defineProperty(_statics, "doLoad", { //loads statics from the local storage
        enumerable: false,
        configurable: false,
        value: async function () {
          let data = await TheM.common.retrieveLocally("awsm_statics_v4");
          if (!data || !data.namesOfStaticsLoaded || !data.staticsImmutable) return undefined;
          _namesOfStaticsLoaded = data.namesOfStaticsLoaded;
          _staticsImmutable = data.staticsImmutable;
          return true;
        }
      });

      TheM.on("modelBank logged out", detail => { //removes all the non-public statics from memory on logout
        _namesOfStaticsLoaded = {};
        _staticsImmutable = {}
        _beingUpdated = {};
      });

      TheM.on("modelBank logged in", detail => { //loads locally stored data on login
        _statics.doLoad();
      });

      let handler = {
        get: function (target, nameReguested) {
          if (nameReguested == "window") return;
          if (nameReguested == "children") return;
          if (nameReguested == "doUpdate") return _statics.doUpdate;
          if (nameReguested == "doInit") return _statics.doInit;
          if (nameReguested == "doLoad") return _statics.doLoad;
          if (nameReguested == "doSave") return _statics.doSave;
          for (let name in _namesOfStaticsLoaded)
            if (name === nameReguested && _namesOfStaticsLoaded[name].dtsExpires && _namesOfStaticsLoaded[name].dtsExpires.valueOf() > (new Date()).valueOf()) {
              //if it is known and has not expired yet, return it.
              return _staticsImmutable[nameReguested]
            };
          //unknown or expired - trigger update but return whatever is available now
          if (!_namesOfStaticsLoaded[nameReguested]) _statics.doUpdate(nameReguested);
          return _staticsImmutable[nameReguested];
        }
      };

      _statics.doLoad();

      return new Proxy(_statics, handler);
    })();
  };



  if (typeof module !== "undefined" && module != null) {
    //node
    module.exports = Statics;
  } else {
    StaticsClass = Statics;
  }
})();