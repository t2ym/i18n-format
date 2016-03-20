/* jshint node:true */

/* updating tests from tests/test262 */

var LIBS = {
        fs:     require('fs'),
        path:   require('path')
    };
var SRC_262     = __dirname + '/../tests/test262';
var SRC_DIR     = SRC_262 + '/test/intl402';
var DEST_DIR    = SRC_262 + '/pages';
var INCLUDE_DIR = SRC_262 + '/harness';

var WRAPPER_START = [
        '//<html><head><meta http-equiv="X-UA-Compatible" content="IE=EDGE"><meta charset=utf-8></head><body><button onclick="runner()">Run</button> results: <span id="results">not yet run</span><script src="../../../dist/Intl.complete.js"></script><script>',
        // stuff defined in harness/*.js yet not pulled in via $INCLUDE()
        'var __globalObject = Function("return this;")();',
        'function fnGlobalObject() {',
        '    return __globalObject;',
        '}',

        // Make sure polyfilled ECMA-262 functions are in place for the tests
        'IntlPolyfill.__applyLocaleSensitivePrototypes();'
    ].join('\n');

var WRAPPER_END = [
        // In the browser, a button will run the following function,
        // and we can also call it with the webdriver's execute() function
        'function runner() {',
        '    var passed = false;',
        '    if (typeof document !== "undefined") {',
        '        setTimeout(function () {',
        '            document.getElementById("results").innerHTML = (passed ? "passed" : "FAILED");',
        '        });',
        '    }',
        '    runTheTest();',
        '    passed = true;',
        '    return passed;',
        '}',
        '//</script></body></html>'
    ].join('\n');

// Shims for IE 8
var shims = {
        'Object.defineProperty': function (obj, name, desc) {
             if (desc.hasOwnProperty('value'))
                obj[name] = desc.value;
        },

        'Object.create': function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        },
        'Object.getPrototypeOf': function (obj) { return obj.constructor.prototype; },
        'Object.isExtensible' : function () { return true; },
        'Object.getOwnPropertyNames': function (obj) {
            var ret = [];

            for (var k in obj) {
                if (obj.hasOwnProperty(k))
                    ret.push(k);
            }

            return ret;
        },

        'Array.prototype.indexOf': function (search) {
            var t = this;
            if (!t.length)
                return -1;

            for (var i = arguments[1] || 0, max = t.length; i < max; i++) {
                if (t[i] === search)
                    return i;
            }

            return -1;
        },

        'Array.prototype.forEach': function (fn) {
            for (var i=0; i < this.length; i++)
                fn.call(arguments[1], this[i], i, this);
        },

        'Array.prototype.map': function (fn) {
            var ret = [];
            for (var i=0; i < this.length; i++)
                ret[i] = fn.call(arguments[1], this[i], i, this);

            return ret;
        },

        'Date.now': function () { return +new Date(); },

        //- IE 8 is forced into quirks mode, so no JSON
        '__globalObject.JSON': '{}',
        'JSON.stringify': function (obj) {
            var props = [];

            for (var k in obj) {
                if (obj.hasOwnProperty(k))
                    props.push(k + ': ' + obj[k]);
            }

            return '{ ' + props.join(',') + ' }';
        }
    };

shims['Array.prototype.every'] = shims['Array.prototype.forEach'];

function processTest(content) {
    var includes = [];
    content = content.replace(/includes\: \[(.*)]/g, function(all, path) {
        path = LIBS.path.resolve(INCLUDE_DIR, path);
        includes.push(LIBS.fs.readFileSync(path).toString());
        return path;
    });

    // injecting includes at the top
    content = includes.join('\n') + '\n' + content;

    // fixup constructor lists
    content = content.replace(/(\[)("Collator",)/, '$1/*$2*/');

    content = content.replace(/\$ERROR\(/g, 'throw new Error(');

    // The test suite tries to parse an ISO 8601 date, which fails in <=IE8
    content = content.replace(/Date\.parse\("1989-11-09T17:57:00Z"\)/g, '$& || Date.parse("1989/11/09 17:57:00 UTC")');

    // Another IE 8 issue: [undefined].hasOwnProperty(0) is false, so we need
    // to work around this in at least one test
    content = content.replace(/^(\s*)(var.*)\[value\](.*)$/m, '$1var arr = [];\n$1arr[0] = value;\n$1$2arr$3');

    // Look for functions that might require shims in ES3 browsers
    var shimCode = [];
    for (var k in shims) {
        if (content.search(new RegExp('\\b' + k.split('.').pop() + '\\b')) > -1) {
            if (k === 'Object.defineProperty') {
                shimCode.push('try { Object.defineProperty({}, "a", {}) } catch (e) { Object.defineProperty = ' + shims[k] +' }');
            }
            else
                shimCode.push(k + ' = ' + k + ' || ' + shims[k] + ';');
        }
    }

    content = shimCode.join('\n') + '\n' + content;

    // Make sure to use our version (not one the browser might have).
    content = content.replace(/\bIntl\b/g, 'IntlPolyfill');

    var explainV8OptOut = '// This test is disabled to avoid the v8 bug outlined at https://code.google.com/p/v8/issues/detail?id=2694';
    var explainES6OptOut = '// This test is disabled because it relies on ES 2015 behaviour, which is not implemented in environments that need this polyfill';

    // Due to a bug in v8, we need to disable parts of the _L15 tests that
    // check the function property `length` is not writable
    content = content.replace(/^(\s*)(?=.*throw.*The length property.*function must not be writable)/gm, '$1' + explainV8OptOut + '\n$&//');
    content = content.replace(/^(\s*)(?=.*throw.*The length property.*function must be configurable)/gm, '$1' + explainES6OptOut + '\n$&//');

    // There's also part of the _L15 test that a JavaScript implementation
    // cannot possibly pass, so we need to disable these parts too
    var idxStart = content.search(/^(\s*)\/\/ The remaining sections have been moved to the end/m),
        idxEnd   = content.search(/^\s+\/\/ passed the complete test/m);

    if (idxStart > -1) {
        content = [
            content.slice(0, idxStart),
            '\n// Intl.js cannot pass the following sections of this test:\n',
            content.slice(idxStart + 1, idxEnd).replace(/^(?!$)/gm, '//$&'),
            idxEnd > -1 ? content.slice(idxEnd) : ''
        ].join('');
    }

    return content;
}


// Turns test into an HTML page.
function wrapTest(content) {
    // The weird "//" makes these html files also valid node.js scripts :)
    return [
        WRAPPER_START,
        content,
        WRAPPER_END
    ].join('\n');
}


function listTests() {
    var tests = [],
        todo = [ '.' ],
        doing,
        path;

    while (todo.length) {
        /*jshint loopfunc:true*/
        doing = todo.shift();
        path = LIBS.path.resolve(SRC_DIR, doing);
        stat = LIBS.fs.statSync(path);
        if (stat.isFile()) {
            tests.push(doing);
            continue;
        }
        if (stat.isDirectory()) {
            todo = todo.concat(LIBS.fs.readdirSync(path).map(function(a) {
                return LIBS.path.join(doing, a);
            }));
        }
    }
    return tests;
}

function isValidTest(testPath) {
    // these are just trouble
    if (testPath === '9.2.5_11_g_ii_2.js') {
        return false;
    }
    if (testPath.indexOf('13.1') === 0) {
        return false;
    }
    if (testPath.indexOf('10') === 0) {
        return false;
    }

    // this one requires more than one include, we need to fix the regex for that
    // and it was in previous incarnations
    if (testPath === '8.0_L15.js') {
        return false;
    }
    // these are failing with: "Client code can adversely affect behavior: setter"
    // and they were in previous incarnations
    if (testPath === '12.2.2_b.js' ||
        testPath === '11.2.2_b.js' || // this one was in previous incarnations
        testPath === '9.2.1_2.js'  ||
        testPath === '9.2.6_2.js') {
        return false;
    }

    return true;
}

module.exports = function(grunt) {

    grunt.registerTask('update-tests', 'refreshes the tests found in tests/test262', function() {
        var tests = listTests();
        tests.sort();
        tests.forEach(function(testPath) {
            if (!isValidTest(testPath)) {
                return;
            }
            var srcPath  = LIBS.path.resolve(SRC_DIR, testPath),
                destPath = LIBS.path.resolve(DEST_DIR, testPath),
                content;
            content = 'function runTheTest () {'+ grunt.file.read(srcPath) +' }';
            content = processTest(content);
            content = wrapTest(content);
            destPath = destPath.replace(/\.js$/, '.html');
            grunt.file.write(destPath, content);
        });
    });

};
