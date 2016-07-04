// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**

 */
var QUERY = 'uu';

var xunBoGenerator = {
    loadDownList:function(){

    }
};

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  xunBoGenerator.loadDownList();
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    switch (request.greeting){
        case "all":
            sendResponse({
                elements: localStorage.getItem("targets"),
                properties: localStorage.getItem("properties"),
                targets: localStorage.getItem("targets")
            });
            break;
    }
});;