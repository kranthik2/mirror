const gulp = require('gulp');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const pump = require('pump');
const uglifycss = require('gulp-uglifycss');

gulp.task('compress', function(cb) {
  pump([
      gulp.src(['assets/js/*.js', 'node_modules/angular/angular.js',
        'node_modules/angular-google-chart/ng-google-chart.js', 'node_modules/angular-cookies/angular-cookies.js',
        'node_modules/angularjs-scroll-glue/src/scrollglue.js'
      ]),
      uglify(),
      gulp.dest('dist/js/')
    ],
    cb
  );
});

gulp.task('minify-html', function() {
  gulp.src('assets/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', function() {
  gulp.src(['assets/css/main.css', 'assets/bootstrap/css/*.css'])
    .pipe(uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('default', ['compress', 'minify-css', 'minify-html']);