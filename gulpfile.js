var gulp = require("gulp");

var nodemon = require("gulp-nodemon");
var jshint = require("gulp-jshint");
var jscs = require("gulp-jscs");

gulp.task("lint", function () {
  return gulp.src([
    "import/**/*.js"
  ])
  .pipe(jshint())
  .pipe(jshint.reporter("jshint-stylish", {verbose: true}))
  .pipe(jshint.reporter("fail"))
  .pipe(jscs({fix: true}))
  .pipe(jscs.reporter())
  .pipe(jscs.reporter("fail"))
  .pipe(gulp.dest("src"));
});

gulp.task("watch", function () {
  gulp.watch([
    "import/**/*.js"
  ],
  [
    "lint",
  ]);

});

/*
gulp.task("server", function () {
  nodemon({
    script: "tryme.js",
    ext: "js,json",
    watch: [
      "tryme.js"
    ],
    env: { "NODE_ENV": "development-local" }
  });
});

gulp.task("default", ["server"]);
*/

