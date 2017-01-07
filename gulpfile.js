var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var pump = require('pump');

gulp.task('compress', function(cb) {
    pump([
            gulp.src(['./assets/js/*.js', './node_modules/angular/angular.js',
                './node_modules/angular-google-chart/ng-google-chart.js', './node_modules/angular-cookies/angular-cookies.js',
                './node_modules/angularjs-scroll-glue/src/scrollglue.js'
            ]),
            uglify(),
            gulp.dest('./dist/js/')
        ],
        cb
    );
});

gulp.task('minify-css', function() {
    return gulp.src(['assets/css/*.css', './assets/bootstrap/css/*.css'])
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('minify-html', function() {
    return gulp.src('assets/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['compress', 'minify-css', 'minify-html']);