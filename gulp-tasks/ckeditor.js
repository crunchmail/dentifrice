module.exports = function (gulp, plugins) {
  return function () {
    gulp.src(['bower_components/ckeditor/**/*', '!bower_components/ckeditor/config.js', '!bower_components/ckeditor/ckeditor.js'])
	  .pipe(gulp.dest('dist/ckeditor'));

    gulp.src(['bower_components/ckeditor/ckeditor.js', 'src/ckeditor/customConfig.js'])
    .pipe(plugins.concat('ckeditor.js'))
	  .pipe(gulp.dest('dist/ckeditor'));

    gulp.src(['src/ckeditor/config.js'])
  	.pipe(gulp.dest('dist/ckeditor'));

  	gulp.src(['src/ckeditor/dentifrice/**'])
  	.pipe(gulp.dest('dist/ckeditor/skins/dentifrice'));

  	gulp.src(['src/ckeditor-conf/*.json'])
  	.pipe(gulp.dest('dist/ckeditor-conf/'));
  };
};
