var gulp = require('gulp');
var bower = require('gulp-bower');
var del = require('del');
var plugins = require('gulp-load-plugins')();

function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins);
}

gulp.task('bower', function() {
  return bower();
});

gulp.task('lint-js', getTask('lint-js'));
gulp.task('lint-css', getTask('lint-css'));
gulp.task('libs', ['bower'], getTask('libs'));
gulp.task('ckeditor', ['bower'], getTask('ckeditor'));
gulp.task('scripts', getTask('scripts'));
gulp.task('styles', getTask('styles'));
gulp.task('locales', getTask('locales'));
gulp.task('templates', getTask('templates'));
gulp.task('html', getTask('html'));


//Init editor task
gulp.task('init', getTask('init'));

gulp.task('lint', ['lint-js', 'lint-css'], function () {
  gulp.watch([
    'src/*.js',
    'src/app/*.js'], ['lint-js']);

  gulp.watch(['src/css/*.css'], ['lint-css']);
});

gulp.task('clean', function () {
  return del(['dist/**']);
});

gulp.task('default', [
  'libs',
  'ckeditor',
  'scripts',
  'styles',
  'locales',
  'templates',
  'html'
]);

gulp.task('watch', function () {
  gulp.watch([
    'src/*.js',
    'src/app/*.js',
    'src/app/templates.html'], ['scripts']);

  gulp.watch(['src/css/*.css'], ['styles']);

  gulp.watch(['src/*.html'], ['html']);

  gulp.watch(['src/locales/*.json'], ['locales']);

  gulp.watch([
    'templates/**/*.json',
    'templates/**/*.css',
    'templates/**/*.html'
  ], ['templates']);

  gulp.watch([
    'src/ckeditor/dentifrice/*',
    'src/ckeditor/config.js',
    'src/ckeditor-conf/*.json'], ['ckeditor']);
});
