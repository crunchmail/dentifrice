module.exports = function (gulp, plugins) {
  return function () {
    gulp.src(['src/css/editor.css'])
    .pipe(gulp.dest('dist/css'));

    gulp.src(['src/css/init.css'])
    .pipe(gulp.dest('dist/css'));

    gulp.src(['src/css/bootstrap.css'])
    .pipe(plugins.rename('dentifrice.css'))
  	.pipe(gulp.dest('dist/css'));
  };
};
