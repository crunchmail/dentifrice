var html2js = require('gulp-html-js-template');
var license_opts = {tiny: false, organization: 'Oasiswork'};

module.exports = function (gulp, plugins) {
  return function () {
    gulp.src([
      'src/app/init-functions.js',
      'src/app/initialize.js'
    ])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('init.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(plugins.rename('init.min.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.license('MPL', license_opts))
    .pipe(plugins.sourcemaps.write("./"))
    .pipe(gulp.dest('dist/js'));

    gulp.src([
      'src/bootstrap-functions.js',
      'src/bootstrap-init-editor.js'
    ])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('dentifrice.js'))
    .pipe(gulp.dest('dist'))
    .pipe(plugins.rename('dentifrice.min.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.license('MPL', license_opts))
    .pipe(plugins.sourcemaps.write("./"))
  	.pipe(gulp.dest('dist'));
  };
};
