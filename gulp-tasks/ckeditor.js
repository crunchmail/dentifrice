module.exports = function (gulp, plugins) {
  return function () {
    gulp.src(['bower_components/ckeditor/**/*', '!bower_components/ckeditor/config.js'])
	  .pipe(gulp.dest('dist/ckeditor'));

    gulp.src(['src/ckeditor/config.js'])
  	.pipe(gulp.dest('dist/ckeditor'));

  	gulp.src(['src/ckeditor/dentifrice/**'])
  	.pipe(gulp.dest('dist/ckeditor/skins/dentifrice'));

  	gulp.src(['src/ckeditor-conf/*.json'])
  	.pipe(gulp.dest('dist/ckeditor-conf/'));
  };
};
