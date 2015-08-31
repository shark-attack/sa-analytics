var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var flatten = require('gulp-flatten');

gulp.task('default', ['channelperf', 'channelview']);

gulp.task('channelperf', ['d3'], function () {
    return gulp.src('src/sa-channel-performance.es6')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('sa-channel-performance.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src'));
});

gulp.task('channelview', ['d3'], function () {
    return gulp.src('src/sa-channel-view.es6')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('sa-channel-view.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src'));
});

gulp.task('d3', function () {
    return gulp.src('node_modules/d3/d3.min.js')
        .pipe(flatten())
        .pipe(gulp.dest('src'))
});