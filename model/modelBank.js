"use strict";
console.log("modelBank v3 started");



if (typeof module !== "undefined" && module != null) {
  //node
  var events = require("events");
  var request = require("request");
} else {
  var TheM = {};
}

(function (given) {

//   const backEndURL = "http://192.168.43.249:4000/";
// const backEndURL = "http://192.168.233.200:4000/";
        const backEndURL = "https://online.lockedcard.com/";


  class ClassTheM {
    constructor(given) {
      let _TheM = {};
      let _loading = 0;
      let _loadingwhat = [];
      let _browser = true;
      let _id = given;
      let _isAsyncOk = false; //turns true when socket connection starts 
      let _crm;
      let _user;
      let _fxrates;
      let _fundsTransfer;
      let _statics;
      let _restrictions;
      let _genericRequests;
      let _messages;
      let _remittance;
      let _alerts;
      let _splitBillAccounts;
      // let _family;
      // let _chores;
      let _invites;
      let _parts = [];
      _TheM.temp = {};

      let isiOS = false; //iOS does not support webworkers, so data is stored in localStorage
      if (typeof thisDevice !== "undefined" && thisDevice.platform && thisDevice.platform.includes("ios")) isiOS = true;

      let localStorageWorker;
      let storables = {};
      let retrievables = {};


      if (typeof module !== "undefined" && module != null) { //node
        _browser = false;
        _TheM.eventEmitter = new events.EventEmitter();
      } else { //browser
        _browser = true;
      }

      Object.defineProperty(_TheM, "id", {
        configurable: false,
        enumerable: false,
        get: function () {
          return _id;
        }
      });

      Object.defineProperty(_TheM, "browser", {
        configurable: false,
        enumerable: false,
        get: function () {
          return _browser;
        }
      });

      Object.defineProperty(_TheM, "loading", {
        configurable: true,
        enumerable: false,
        get: function () {
          return _loadingwhat.length;
        },
        set: function (given) {
          // if (typeof given === "number") _loading = given;
          return _loadingwhat.length;
        }
      });

      Object.defineProperty(_TheM, "loadingwhat", {
        configurable: true,
        enumerable: false,
        get: function () {
          return _loadingwhat;
        },
        set: function (given) {
          _loadingwhat = given;
        }
      });

      Object.defineProperty(_TheM, "newEvent", {
        configurable: false,
        enumerable: false,
        value: function (given, payload) {
          if (_browser) {
            if (given) console.log("EVENT: " + JSON.stringify(given)); //, " payload:" + JSON.stringify(payload || {}));
            document.dispatchEvent(new CustomEvent(given, {
              detail: payload
            }));
            document.dispatchEvent(new CustomEvent("modelBank some data refreshed"));
            if (payload && _TheM.notificationsOnscreen) _TheM.notificationsOnscreen.add(payload);
          } else {
            if (given) console.log(`TheM EVENT:   ` + JSON.stringify(given)); //+ " payload:" + JSON.stringify(payload || {})
            if (given) _TheM.eventEmitter.emit(given, payload)
          }
        }
      });

      _TheM.refresh = function (given, payload) {
        _TheM.newEvent(given, payload);
        return true;

      }

      Object.defineProperty(_TheM, "on", {
        configurable: false,
        enumerable: false,
        value: function (givenEventName, givenFunction, givenFlag) {
          //givenEventName can be string or array of strings
          if (givenFlag !== true && givenFlag !== false) givenFlag = false;
          let eventNames = [];
          if (typeof givenEventName === "string") eventNames.push(givenEventName);
          if (Array.isArray(givenEventName)) eventNames.push(...givenEventName);

          if (_browser) {
            for (let eventName of eventNames)
              document.addEventListener(eventName, givenFunction, givenFlag);
          } else {
            for (let eventName of eventNames)
              _TheM.eventEmitter.on(eventName, givenFunction);
          }
        }
      });

      _TheM.common = (function (par) { //TheM.common contains various utility functions
        let _common = {};
        let _token;
        let _dtslastCall;

        Object.defineProperty(_common, "GetRandomSTR", {
          configurable: false,
          enumerable: false,
          value: function (GivenLength) {
            let str = "";
            while (str.length < GivenLength) {
              str += Math.random().toString(36).substr(2, GivenLength);
            }
            return str.substring(0, GivenLength);
          }
        });

        Object.defineProperty(_common, "CleanUpAmount", {
          configurable: false,
          enumerable: false,
          value: function (GivenDirty) {
            GivenDirty = GivenDirty || 0;
            GivenDirty = (GivenDirty + "").replace(/^0+/, "").replace(/[^\d.-]/g, "");
            if (Math.round(GivenDirty) !== +(GivenDirty)) {
              GivenDirty = (+(GivenDirty)).toFixed(2);
            }
            if (isNaN(GivenDirty)) {
              GivenDirty = "0";
            };
            return GivenDirty;
          }
        });

        Object.defineProperty(_common, "toNameFormat", { //converts JEAN-JACK RUSSAU to Jean-Jack Russau
          configurable: false,
          enumerable: false,
          value: function (given) {
            given = given || "";
            let resp = "";
            for (let i = given.length; i--;)
              if (i === 0 || (i > 0 && (given[i - 1] === " " || given[i - 1] === "-"))) {
                resp = given[i].toUpperCase() + resp;
              } else {
                resp = given[i] + resp
              }
            return resp;

          }
        });

        Object.defineProperty(_common, "toAmount", {
          configurable: false,
          enumerable: false,
          value: function (GivenDirty) {
            GivenDirty = GivenDirty || 0;
            GivenDirty = (GivenDirty + "").replace(/^0+/, "").replace(/[^\d.-]/g, "");
            if (Math.round(GivenDirty) !== +(GivenDirty)) {
              GivenDirty = (+(GivenDirty)).toFixed(2);
            }
            GivenDirty = parseFloat(GivenDirty);
            if (isNaN(GivenDirty)) {
              GivenDirty = 0;
            };
            return parseFloat(GivenDirty.toFixed(2));
          }
        });

        Object.defineProperty(_common, "isDate", { //returns true if givenDts is a date
          configurable: false,
          enumerable: false,
          value: function (givenDts) {
            if (!givenDts) return false;
            return (givenDts instanceof Date && !isNaN(givenDts.valueOf()));
          }
        });

        Object.defineProperty(_common, "isArray", { //returns true if givenArray is an array
          configurable: false,
          enumerable: false,
          value: function (givenArray) {
            if (Object.prototype.toString.call(givenArray) === "[object Array]") return true
            return false;
          }
        });

        Object.defineProperty(_common, "DeDupAndAdd", {
          configurable: false,
          enumerable: false,
          value: function (GivenOld, GivenNew, propertyName) {
            //merges two arrays. checks dublicates by checking propertyName fields.
            if ((!GivenOld) || (!GivenNew)) return false;

            propertyName = propertyName || "id";

            for (let EE = 0; EE < GivenNew.length; EE++) {
              let Found = false;
              if (GivenNew[EE] && GivenNew[EE][propertyName]) {
                for (let RR = 0; RR < GivenOld.length; RR++) {
                  if (GivenOld[RR]) {
                    if (GivenOld[RR][propertyName] && GivenNew[EE][propertyName] && GivenOld[RR][propertyName] === GivenNew[EE][propertyName]) {
                      GivenOld[RR] = owl.deepCopy(GivenNew[EE]); //replace object if ID found
                      Found = true;
                    }
                  }
                }
                if (!Found) {
                  GivenOld.push(GivenNew[EE]); //add the record as it is new
                }
              }
            }
            return true;
          }
        });

        Object.defineProperty(_common, "MergeObjects", {
          configurable: false,
          enumerable: false,
          value: function (GivenOld, GivenNew) {
            //copies all properties of GivenNew into GivenOld

            //http://www.oranlooney.com/deep-copy-javascript/
            //GNUL 
            if (GivenNew) {
              for (let prop in GivenNew) {
                if (!prop.startsWith("$")) GivenOld[prop] = owl.deepCopy(GivenNew[prop]);
              }
            } else {
              if (!GivenOld) return undefined;
              return owl.deepCopy(GivenOld);
            }
          }
        });

        Object.defineProperty(_common, "removeInternal", {
          configurable: false,
          enumerable: false,
          value: function (given) {
            function hop(what) {
              for (let el in what)
                if (el.startsWith("$") || el.startsWith("_")) {
                  delete what[el];
                } else if (Array.isArray(what[el])) {
                hop(what[el]);
              } else if (typeof what[el] === "object") hop(what[el]);
            }
            hop(given);
          }
        });

        Object.defineProperty(_common, "isSimilar", {
          configurable: false,
          enumerable: false,
          value: function (given1, given2) {
            //returns true if both objects appear to be similar via stringifying
            if (!given1 && !given2) return true;
            if (!given1 && given2) return false;
            if (given1 && !given2) return false;
            let temp1 = _common.MergeObjects(given1);
            let temp2 = _common.MergeObjects(given2);
            temp1.$$hashKey = undefined;
            temp2.$$hashKey = undefined;
            return JSON.stringify(temp1) === JSON.stringify(temp2);
          }
        });

        Object.defineProperty(_common, "takeNewToken", {
          configurable: false,
          enumerable: false,
          value: function (givenToken) {
            _token = givenToken;
          }
        });


        if (par.browser && !localStorageWorker && !isiOS) {
          localStorageWorker = new Worker("./model/modelBank_webworker.js");
          localStorageWorker.onmessage = function (event) {

            if (event.data) {
              if (event.data.type === "store" && event.data.storableId) {
                if (storables[event.data.storableId]) {
                  console.log("stored " + event.data.tag);
                  storables[event.data.storableId]();
                }

              } else if (event.data.type === "retrieve") {
                if (retrievables[event.data.retrievableId]) {
                  console.log("restored " + event.data.tag);
                  if (retrievables[event.data.retrievableId].objectToPopulate) {
                    for (const prop of Object.getOwnPropertyNames(retrievables[event.data.retrievableId].objectToPopulate)) {
                      delete retrievables[event.data.retrievableId].objectToPopulate[prop];
                    }
                    Object.assign(retrievables[event.data.retrievableId].objectToPopulate, event.data.payload);
                  }
                  retrievables[event.data.retrievableId].resolve(event.data.payload);
                  TheM.newEvent("modelBank retrieved data");
                }

              }
            }


          }
        }

        Object.defineProperty(_common, "storeLocally", {
          configurable: false,
          enumerable: false,
          value: function (tag, payload) {
            //Stores them in indexedDB if it is a browser.
            //If not a browser, does nothing
            return new Promise(function (resolve, reject) {

              let _tag = tag;
              let _payload = payload;
              if (tag.tag) _tag = tag.tag;
              if (tag.payload) _payload = tag.payload;

              if (!par.browser) return resolve();
              let randomId = TheM.common.GetRandomSTR(40);
              storables[randomId] = resolve;
              let storable = {
                type: "store",
                tag: "test_"+_tag, //!!!!!!!!!!!!!!!!!!!!!!!!!!
                storableId: randomId,
                payload: _payload
              }
              localStorageWorker.postMessage(JSON.parse(JSON.stringify(storable)));
            });

          }
        });



        Object.defineProperty(_common, "retrieveLocally", {
          configurable: false,
          enumerable: false,
          value: async function (givenTag, objectToPopulate) {
            return new Promise(function (resolve, reject) {
              if (!par.browser) return resolve();
              let randomId = TheM.common.GetRandomSTR(40);
              retrievables[randomId] = {
                resolve: resolve,
                objectToPopulate: objectToPopulate
              };
              let retrievable = {
                type: "retrieve",
                tag: "test_"+givenTag, //!!!!!!!!!!!!!!!!!!!!!!!!!!
                retrievableId: randomId
              }
              localStorageWorker.postMessage(retrievable);
            });

          }
        });

        Object.defineProperty(_common, "removeThis", {
          configurable: false,
          enumerable: false,
          value: function (givenArray, givenElement) { //removes given element from the given array
            if (!givenArray || !givenElement) return undefined;
            let i = givenArray.length;
            while (i--) {
              if (givenArray[i] === givenElement) {
                givenArray.splice(i, 1);
                return true;
              }
            }
            return false;
          }
        });

        Object.defineProperty(_common, "isAccessAllowed", {
          configurable: false,
          enumerable: false,
          value: function (rightsArray, givenAWSMUserId, role) {
            //write  -- can change content, but not ownership or access rights
            //invite -- can add or invite others into the object, but can not remove others
            //manage -- can manage access rights 
            //delete -- can delete the object 
            if (!rightsArray || !Array.isArray(rightsArray)) return false;
            givenAWSMUserId = givenAWSMUserId || TheM.user.AWSMUserId;
            role = role || "read";

            for (let rec of rightsArray)
              if (rec && rec.AWSMUserId === givenAWSMUserId && !rec.isDeleted)
                if (rec.role.toLowerCase().includes(role.toLowerCase())) return true;

            return false;
          }
        });

        Object.defineProperty(_common, "fixDts", { //traverses given object and converts any string properties starting with "dts" into a Date type
          configurable: false,
          enumerable: false,
          value: function (given) {
            function hop(what) {
              for (let el in what)
                if (el.startsWith("dts") || el.startsWith("DTS")) {
                  if (Object.getOwnPropertyDescriptor(what, el).set ||
                    Object.getOwnPropertyDescriptor(what, el).writable)
                    if (what[el] !== null) {
                      what[el] = new Date(what[el]);
                    } else {
                      what[el] = undefined;
                    }
                } else if (_common.isArray(what[el])) {
                hop(what[el]);
              } else if (typeof what[el] === "object") hop(what[el]);
            }
            hop(given);
          }
        });

        /**
         * seconds since last server call was made
         */
        Object.defineProperty(_common, "secsSinceLastCall", {
          get: function () {
            return parseInt(((new Date()) - _dtslastCall) / 1000);
          }
        });


        Object.defineProperty(_common, "backEndURL", {
          get: function () {
            return backEndURL;
          }
        });

        Object.defineProperty(_common, "isAsyncOk", {
          set: function (given) {
            if (given === true || given === false) _isAsyncOk = given;
          },
          get: function () {
            return _isAsyncOk;
          }
        });

        if (!par.browser) {
          Object.defineProperty(_common, "doCall", { //node
            configurable: false,
            enumerable: false,
            value: function (RequestType, FunctionName, Payload, callback, errorcallback) {
              par.loading++;
              let temp_dtslastCall = new Date();

              console.log("Doing a back-end call " + RequestType + " " + FunctionName);
              request({
                method: RequestType,
                uri: backEndURL + FunctionName,
                json: true,
                body: Payload,
                headers: {
                  "token": _token
                }
              }, function (error, response, body) {
                par.loading--;
                _dtslastCall = new Date(temp_dtslastCall);
                if (!error && response.statusCode == 200) {
                  console.log("Back-end replied for " + FunctionName);
                  callback(body);
                } else {
                  //if (errorcallback) console.error("ERROR making a call to back-end", response);
                  if (errorcallback) errorcallback(request.statusText); // error occurred
                }
              });
            }
          });
        }


        if (par.browser) {
          Object.defineProperty(_common, "doCall", { //browser
            configurable: false,
            enumerable: false,
            value: async function (RequestType, FunctionName, Payload, callback, errorcallback) {
              try {
                let temp = _common.GetRandomSTR(6) + "_" + FunctionName;
                par.loadingwhat[temp] = temp;
                par.loading++;

                const reqParams = {
                  method: RequestType,
                  mode: "cors",
                  cache: "no-cache",
                  headers: {
                    "token": _token,
                    "isasyncok": _isAsyncOk,
                    "Content-type": "application/json;charset=UTF-8"
                  }
                }
                if (RequestType.toUpperCase() !== "GET" && Payload) reqParams.body = JSON.stringify(Payload);

                const response = await fetch(backEndURL + FunctionName, reqParams);
                par.loading--;
                delete TheM.loadingwhat[temp];
                _dtslastCall = new Date();

                let responseJSON;
                if (response.status === 200) {
                  responseJSON = await response.json();
                  if (responseJSON.wrongToken) {
                    par.newEvent("modelBank asked to logout");
                    if (errorcallback) errorcallback({
                      error: true
                    }); // status is not 200 OK
                  }
                  if (callback) return callback(responseJSON);
                  return (responseJSON);
                } else if (response.status === 401) {
                  par.newEvent("modelBank asked to logout"); //not authorized
                }
                // status is not 200 OK
                if (errorcallback) return errorcallback({
                  error: true
                });
                return {
                  error: true
                }
              } catch (err) {
                console.error(err);
                if (errorcallback) return errorcallback({
                  error: true
                });
              }
            }
          });
        }


        if (par.browser) {
          Object.defineProperty(_common, "doCallAsync", {
            configurable: false,
            enumerable: false,
            value: function (RequestType, FunctionName, Payload) {
              return new Promise(async (resolve, reject) => {
                try {
                  let temp = _common.GetRandomSTR(6) + "_" + FunctionName;
                  par.loadingwhat[temp] = temp;
                  par.loading++;

                  const reqParams = {
                    method: RequestType,
                    mode: "cors",
                    cache: "no-cache",
                    headers: {
                      "token": _token,
                      "Content-type": "application/json;charset=UTF-8"
                    }
                  }
                  if (RequestType.toUpperCase() !== "GET" && Payload) reqParams.body = JSON.stringify(Payload);

                  const response = await fetch(backEndURL + FunctionName, reqParams);
                  par.loading--;
                  delete TheM.loadingwhat[temp];
                  _dtslastCall = new Date();

                  let responseJSON;
                  if (response.status === 200) {
                    responseJSON = await response.json();
                    if (responseJSON.wrongToken) {
                      par.newEvent("modelBank asked to logout");
                      if (errorcallback) errorcallback({
                        error: true
                      }); // status is not 200 OK
                    }
                    return resolve(responseJSON);
                  } else if (response.status === 401) {
                    par.newEvent("modelBank asked to logout"); //not authorized
                  }
                  // status is not 200 OK
                  return reject({
                    error: true
                  });
                } catch (err) {
                  console.error(err);
                  return reject({
                    error: true
                  });
                }
              });
            }
          });
        }



        const owl = function () {
          function e() {}

          function t(t) {
            return "object" == typeof t ? (e.prototype = t, new e) : t
          }

          function n(e) {
            if ("object" != typeof e) return e;
            let n = e.valueOf();
            if (e != n) return new e.constructor(n);
            if (e instanceof e.constructor && e.constructor !== Object) {
              let r = t(e.constructor.prototype);
              for (let o in e) e.hasOwnProperty(o) && (r[o] = e[o])
            } else {
              let r = {};
              for (let o in e) r[o] = e[o]
            }
            return r
          }

          function r(e) {
            for (let t in e) this[t] = e[t]
          }

          function o() {
            this.copiedObjects = [];
            let thisPass = this;
            this.recursiveDeepCopy = function (e) {
              return thisPass.deepCopy(e)
            }, this.depth = 0
          }

          function c(e, t) {
            let n = new o;
            return t && (n.maxDepth = t), n.deepCopy(e)
          }

          let u = [];
          return r.prototype = {
            constructor: r,
            canCopy: function () {
              return !1
            },
            create: function () {},
            populate: function () {}
          }, o.prototype = {
            constructor: o,
            maxDepth: 256,
            cacheResult: function (e, t) {
              this.copiedObjects.push([e, t])
            },
            getCachedResult: function (e) {
              for (let t = this.copiedObjects, n = t.length, r = 0; n > r; r++)
                if (t[r][0] === e) return t[r][1];
              return void 0
            },
            deepCopy: function (e) {
              if (null === e) return null;
              if ("object" != typeof e) return e;
              let t = this.getCachedResult(e);
              if (t) return t;
              for (let n = 0; n < u.length; n++) {
                let r = u[n];
                if (r.canCopy(e)) return this.applyDeepCopier(r, e)
              }
              throw new Error("no DeepCopier is able to copy " + e)
            },
            applyDeepCopier: function (e, t) {
              let n = e.create(t);
              if (this.cacheResult(t, n), this.depth++, this.depth > this.maxDepth) throw new Error("Exceeded max recursion depth in deep copy.");
              return e.populate(this.recursiveDeepCopy, t, n), this.depth--, n
            }
          }, c.DeepCopier = r, c.deepCopiers = u, c.register = function (e) {
            e instanceof r || (e = new r(e)), u.unshift(e)
          }, c.register({
            canCopy: function () {
              return !0
            },
            create: function (e) {
              return e instanceof e.constructor ? t(e.constructor.prototype) : {}
            },
            populate: function (e, t, n) {
              for (let r in t) t.hasOwnProperty(r) && (n[r] = e(t[r]));
              return n
            }
          }), c.register({
            canCopy: function (e) {
              return e instanceof Array
            },
            create: function (e) {
              return new e.constructor
            },
            populate: function (e, t, n) {
              for (let r = 0; r < t.length; r++) n.push(e(t[r]));
              return n
            }
          }), c.register({
            canCopy: function (e) {
              return e instanceof Date
            },
            create: function (e) {
              return new Date(e)
            }
          }), c.register({

            create: function (e) {
              return e === document ? document : e.cloneNode(!1)
            },
            populate: function (e, t, n) {
              if (t === document) return document;
              if (t.childNodes && t.childNodes.length)
                for (let r = 0; r < t.childNodes.length; r++) {
                  let o = e(t.childNodes[r]);
                  n.appendChild(o)
                }
            }
          }), {
            DeepCopyAlgorithm: o,
            copy: n,
            clone: t,
            deepCopy: c
          }
        }();

        return _common;
      })(_TheM);



      Object.defineProperty(_TheM, "statics", {
        configurable: false,
        enumerable: false,
        get: function () {
          if (!_statics)
            if (!_browser) {
              const StaticsClass = require("./model_statics");
              _statics = new StaticsClass(_TheM);
            } else {
              _statics = new StaticsClass(_TheM);
            }
          return _statics;
        }
      });


      _TheM.finished = function () {}


      Object.defineProperty(_TheM, "doAddPart", {
        configurable: true,
        enumerable: false,
        value: function (givenPartName, givenPartClass) {
          Object.defineProperty(_TheM, givenPartName, {
            configurable: false,
            enumerable: false,
            get: function () {
              if (!_parts[givenPartName])
                if (!_browser) {
                  const partClass = require("./model_" + givenPartName);
                  _parts[givenPartName] = new partClass(_TheM);
                  if (givenPartName === "user") _user = _parts[givenPartName];
                } else {
                  _parts[givenPartName] = new givenPartClass(_TheM);
                  if (givenPartName === "user") _user = _parts[givenPartName];
                }
              return _parts[givenPartName];
            }
          });
        }
      });


      let handler = {
        get: function (target, nameRequested) {
          // if (_TheM[nameRequested] && _TheM[nameRequested].doUpdate) _TheM[nameRequested].doUpdate();
          if (!_TheM[nameRequested] && _parts[nameRequested]) return _parts[nameRequested];
          return _TheM[nameRequested];
        },
        set: function (givenElement, index, value) {
          return (_TheM[index] = value) || true;
        }
      }
      return new Proxy(_TheM, handler);

    } //end of ClassTheM constructor

    echo(given) {
      console.log(given);
      return true;
    }
  }

  if (typeof module !== "undefined" && module != null) {
    //node
    module.exports = ClassTheM;
  } else {
    TheM = new ClassTheM();
    TheM.newEvent("modelBank started");
  }

})();







Date.prototype.addDays = function (days) {
  // let dat = new Date(this.valueOf());
  this.setDate(this.getDate() + days);
  return this;
}
Date.prototype.addMinutes = function (h) {
  this.setMinutes(this.getMinutes() + h);
  return this;
};
Date.prototype.addSeconds = function (h) {
  this.setSeconds(this.getSeconds() + h);
  return this;
};


//TODO: all the Array.prototype stuff below must be removed

// Array Remove - By John Resig (MIT Licensed)
// Array.prototype.remove = function (from, to) {
//   let rest = this.slice((to || from) + 1 || this.length);
//   this.length = from < 0 ? this.length + from : from;
//   return this.push.apply(this, rest);
//   //// Remove the second item from the array
//   //array.remove(1);
//   //// Remove the second-to-last item from the array
//   //array.remove(-2);
//   //// Remove the second and third items from the array
//   //array.remove(1,2);
//   //// Remove the last and second-to-last items from the array
//   //array.remove(-2,-1);
// };

// Array.prototype.min = function () {
//   return Math.min.apply(Math, this);
// };


// Array.prototype.addIfNew = function (given) {
//   let found = false;
//   for (let el of this)
//     if (el == given) found = true;
//   if (!found) this.push(given);
// }


// Array.prototype.removeThis = function (obj) {
//   let i = this.length;
//   while (i--) {
//     if (this[i] === obj) {
//       this.remove(i);
//       return true;
//     }
//   }
//   return false;
// }