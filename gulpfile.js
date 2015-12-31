"use strict";

var gulp = require("gulp");
var eslint = require("gulp-eslint");

var libDir = "./lib/**/*.js";
var importDir = "import/**/*.js";

var DIRS = [
    libDir,
    importDir
];

gulp.task("lint", function () {
    return gulp.src(DIRS)
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

gulp.task("watch", function () {
  gulp.watch(DIRS,["lint"]);
});


gulp.task("default", ["watch"]);

