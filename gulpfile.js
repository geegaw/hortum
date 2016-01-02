"use strict";

var gulp = require("gulp");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var eslint = require("gulp-eslint");
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

var PUBLIC_CSS = PUBLIC + "/css";


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

gulp.task("watch", function () {
  gulp.watch(SERVER_DIRS,["lint"]);
});

gulp.task("server", function(){
    nodemon({
        script: "server.js",
        ext: "js html",
        env: { "NODE_ENV": "development" },
        tasks: ["babel"],
    })
    .on("restart", function (){
      console.log("restarted!");
    });
});

gulp.task("default", ["server"]);

