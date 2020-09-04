"use strict";
console.log("started localStorage worker");
//webworker for storing data in indexedDB
importScripts("../js/lib/lz-string.min.js");


let request = indexedDB.open("modelBankTest", 2);
let db;
let objectStore;
let queue = [];

request.onerror = function (event) {
  //User has not given us permission to use the storage
  //TODO handle this
};

request.onsuccess = function (event) {
  db = event.target.result;
};




request.onupgradeneeded = function (event) {
  let db = event.target.result;
  objectStore = db.createObjectStore("tags", {
    keyPath: "tag"
  });

}



self.addEventListener("modelBank new element in storage worker queue", () => {

  if (!db) return; //wait until database is ready

  //once it is ready, start processing tasks in the queue one by one

  while (queue.length > 0) {
    let task = queue.shift();

    if (task.type === "store") {

      let objectStore = db.transaction(["tags"], "readwrite").objectStore("tags");

      let compressed = (task.payload ? LZString.compressToUTF16(JSON.stringify(task.payload)) : undefined);

      let request = objectStore.put({
        tag: task.tag,
        payload: compressed
      });

      request.onsuccess = function () { //acknowledge recording
        self.postMessage(task);
      };
      request.onerror = function (event) { //return nothing
        self.postMessage(task);
      };


    } else if (task.type === "retrieve") {

      let objectStore = db.transaction(["tags"], "readonly").objectStore("tags");
      let request = objectStore.get(task.tag);
      request.onsuccess = function (event) { //acknowledge recording

        try {
          let compressed = event.target.result.payload;

          let uncompressed = (compressed ? LZString.decompressFromUTF16(compressed) : undefined);
          uncompressed = (uncompressed ? JSON.parse(uncompressed) : undefined);

          task.payload = uncompressed;
        } catch (err) {}

        self.postMessage(task);
      };
      request.onerror = function (event) { //return nothing
        self.postMessage(task);
      };
    }
  }
});






self.addEventListener("message", function (e) {

  if (!e.data) return;
  queue.push(e.data);

  self.dispatchEvent(new Event("modelBank new element in storage worker queue"));

}, false);


setTimeout(() => {
  self.dispatchEvent(new Event("modelBank new element in storage worker queue"));
}, 100);