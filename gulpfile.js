var gulp = require('gulp');
var pug = require('gulp-pug');


gulp.task('pug', function buildHTML() {
    var html = gulp.src('./src/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('./build'))
    return html
 });