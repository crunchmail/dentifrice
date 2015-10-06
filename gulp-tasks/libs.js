module.exports = function (gulp, plugins) {
  return function () {
    gulp.src([
  		'bower_components/jquery-color/jquery.color.js',
  		'bower_components/jquery-ui/ui/core.js',
  		'bower_components/jquery-ui/ui/widget.js',
  		'bower_components/jquery-ui/ui/mouse.js',
  		'bower_components/jquery-ui/ui/resizable.js',
  		'bower_components/jquery-ui/ui/sortable.js'
  	])
    .pipe(plugins.sourcemaps.init())
  	.pipe(plugins.concat('jquery-ui-bundle.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(plugins.rename('jquery-ui-bundle.min.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write("./"))
    .pipe(gulp.dest('dist/js'));

    gulp.src(['bower_components/lodash/dist/lodash.min.js'])
    .pipe(gulp.dest('dist/js'));

    gulp.src(['bower_components/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('dist/js'));

    gulp.src(['node_modules/i18next-client/i18next.min.js'])
    .pipe(gulp.dest('dist/js'));

    gulp.src(['bower_components/font-awesome/css/font-awesome.css'])
    .pipe(gulp.dest('dist/css'));

    gulp.src([
  		'bower_components/font-awesome/fonts/FontAwesome.otf',
  		'bower_components/font-awesome/fonts/fontawesome-webfont.eot',
  		'bower_components/font-awesome/fonts/fontawesome-webfont.svg',
  		'bower_components/font-awesome/fonts/fontawesome-webfont.ttf',
  		'bower_components/font-awesome/fonts/FontAwesome.otf',
  		'bower_components/font-awesome/fonts/fontawesome-webfont.woff',
  		'bower_components/font-awesome/fonts/fontawesome-webfont.woff2',
  	])
  	.pipe(gulp.dest('dist/fonts/'));
  };
};
