var bs = require("/Users/shakyshane/sites/os-browser-sync");

bs.use(require("./index"));

bs({
    "plugins": {
        "snippet-injector": {
            "file": "./index.html"
        }
    }
});