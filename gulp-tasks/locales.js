module.exports = function (gulp, plugins) {
  return function () {
    gulp.src(['locales/*.json'])
    .pipe(gulp.dest('dist/locales'));
  };
};
