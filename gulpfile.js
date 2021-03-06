"use strict";

var gulp = require("gulp");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var eslint = require("gulp-eslint");
var less = require("gulp-less");
var minifyCSS = require("gulp-minify-css");
var nodemon = require("gulp-nodemon");

var libDir = "./lib/**/*.js";
var importDir = "./import/**/*.js";

var SERVER_DIRS = [
    "server.js",
    libDir,
    importDir
];


var PUBLIC = "./public";

var PUBLIC_JS = PUBLIC + "/js";
var PUBLIC_JS_COMPONENTS = PUBLIC_JS + "/components";
var PUBLIC_JS_FILES = PUBLIC_JS + "/**/*.js";

var PUBLIC_CSS = PUBLIC + "/css";

var PUBLIC_LESS = PUBLIC + "/less";
var PUBLIC_LESS_FILES = PUBLIC_LESS + "/**/*.less"; 

var WATCH_PUBLIC = [ PUBLIC_JS_FILES, PUBLIC_LESS_FILES, !PUBLIC_JS_COMPONENTS+"/**/*.js" ];

gulp.task("stylesheets", function () {
    gulp.src(PUBLIC_LESS + "/*.less")
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest(PUBLIC_CSS));
});

gulp.task("lint", function () {
    return gulp.src(SERVER_DIRS)
          .pipe(eslint({
            extends: "eslint:recommended",
            ecmaFeatures: {
                modules: true,
                jsx: true,
            },
            rules: {
                camelcase: 1,
                quotes: [2, "double"],
                "no-console": 0,
                "comma-dangle": [2, "always-multiline"],
            },
            fix: true,
            globals: {
                jQuery:false,
                "$":true,
                Exception: true,
            },
            envs: [
                "es6",
                "amd",
                "node",
            ]
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError()
    );
});

gulp.task("babel", function(){
    return gulp.src(SERVER_DIRS)
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(gulp.dest("dist"));
});

gulp.task("concat-components", function() {
  return gulp.src([PUBLIC_JS_COMPONENTS+"/**/*.min.js", "!"+PUBLIC_JS_COMPONENTS+"/components.min.js"])
    .pipe(concat("components.min.js"))
    .pipe(gulp.dest(PUBLIC_JS_COMPONENTS+"/"));
});

gulp.task("watch-server", function () {
  gulp.watch(SERVER_DIRS,["lint"]);
});

gulp.task("watch-public", function () {
  gulp.watch(WATCH_PUBLIC,["stylesheets"]);
});

gulp.task("server", function(){
    nodemon({
        script: "server.js",
        ext: "js less html",
        env: { "NODE_ENV": "development" },
        tasks: ["stylesheets", "lint"],
    })
});

gulp.task("default", ["server"]);

