module.exports = function (gulp, plugins) {
  return function () {
    gulp.src([
  		'templates/**/*.json',
      'templates/**/*.css',
  		'templates/**/*.html'
  	])
  	.pipe(gulp.dest('dist/templates'));
  };
};
