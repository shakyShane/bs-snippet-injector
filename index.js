var fs    = require("fs");
var path  = require("path");
var tfunk = require("tfunk");

/**
 * @type {string}
 */
var PLUGIN_NAME = "Snippet Injector";

/**
 * @type
 */
var messages = {
    added: function (path) {
        return tfunk("%Cgreen:Snippet added to %Ccyan:" + path);
    },
    removed: function (path) {
        return tfunk("%Cgreen:Snippet removed from %Ccyan:" + path);
    },
    notFound: function (path) {
        return tfunk("%Cred:ERROR:%R Closing body tag not found in: %Ccyan:" + path);
    }
};

var currentSnippet;
var currentFilePath;

/**
 * Main export
 * @type {{name: string, plugin: plugin}}
 */
module.exports = {
    name: PLUGIN_NAME,
    plugin: function (bs, opts) {

        currentFilePath = path.resolve(opts.file);
        var logger = bs.getLogger(PLUGIN_NAME);
        opts.log = logger;

        opts.log("debug", "Setting events");
        bs.events.on("service:ready", addSnippet.bind(null, bs, opts));
        bs.events.on("service:exit",  removeSnippet.bind(null, bs, opts));
    }
};


/**
 * Add the snippet before a body tag
 * @param {BrowserSync} bs
 * @param {Object} opts - plugin specific options
 */
function addSnippet(bs, opts) {

    opts.log("debug", "Reading the file: %s", currentFilePath);

    var read = fs.readFileSync(currentFilePath, "utf8");
    var found = false;

    var modded = read.replace(/<\/body>(?![\s\S]*<\/body>)/, function () {
        currentSnippet = wrap(bs.options.snippet) + "\n" + arguments[0];
        found = true;
        return currentSnippet;
    });

    if (found) {
        opts.log("debug", "Writing the file: %s", currentFilePath);
        fs.writeFileSync(currentFilePath, modded);
        opts.log("info", messages.added(path.basename(currentFilePath)));
    } else {
        opts.log("info", messages.notFound(path.basename(currentFilePath)));
    }
}

/**
 * @param item snippet
 * @returns {string}
 */
function wrap (item) {
    return "<!-- BS:SNIPPET-->" + item + "<!-- BS:SNIPPET:END-->";
}

/**
 * @param {BrowserSync} bs
 * @param {Object} opts - plugin specific options
 */
function removeSnippet(bs, opts) {
    var read   = fs.readFileSync(currentFilePath, "utf8");
    var modded = read.replace(currentSnippet, "</body>");
    fs.writeFileSync(currentFilePath, modded);
    opts.log("info", messages.removed(path.basename(currentFilePath)));
}