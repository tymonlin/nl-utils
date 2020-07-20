/**
 * Created by linchunhui on 15/12/30.
 */
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var ngmin = require('gulp-ngmin');
var stripDebug = require('gulp-strip-debug');
gulp.task('build', function() {
    return gulp.src('./nl-utils.js')
        .pipe(ngmin({dynamic: false}))
        .pipe(stripDebug())
        .pipe(uglify({mangle: true}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./'))
});