var html2js = require('gulp-html-js-template');
var license_opts = {tiny: false, organization: 'Oasiswork'};

module.exports = function (gulp, plugins) {
  return function () {
    gulp.src([
      'src/app/content-mode.js',
      'src/app/layout-mode.js',
      'src/app/drafts-manager.js',
      'src/app/uploadify.js',
      'src/app/editor.js'
    ])
    .pipe(plugins.sourcemaps.init())
  	.pipe(plugins.concat('editor.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(plugins.rename('editor.min.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.license('MPL', license_opts))
    .pipe(plugins.sourcemaps.write("./"))
  	.pipe(gulp.dest('dist/js'));

    gulp.src([
      'src/app/plugins/*.js',
    ])
    .pipe(gulp.dest('dist/js/plugins'));

    gulp.src(['src/_local_settings.js'])
  	.pipe(gulp.dest('dist'));

    gulp.src(['src/app/templates.html'])
    .pipe(plugins.sourcemaps.init())
  	.pipe(html2js())
    .pipe(plugins.license('MPL', license_opts))
    .pipe(gulp.dest('dist/js'))
    .pipe(plugins.rename('templates.min.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.license('MPL', license_opts))
    .pipe(plugins.sourcemaps.write("./"))
  	.pipe(gulp.dest('dist/js'));

    gulp.src(['src/app/init.js'])
    .pipe(plugins.sourcemaps.init())
    .pipe(gulp.dest('dist/js'))
    .pipe(plugins.rename('init.min.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.license('MPL', license_opts))
    .pipe(plugins.sourcemaps.write("./"))
  	.pipe(gulp.dest('dist/js'));

    gulp.src(['src/bootstrap.js'])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.rename('dentifrice.js'))
    .pipe(gulp.dest('dist'))
    .pipe(plugins.rename('dentifrice.min.js'))
    .pipe(plugins.uglify())
    .pipe(plugins.license('MPL', license_opts))
    .pipe(plugins.sourcemaps.write("./"))
  	.pipe(gulp.dest('dist'));
  };
};
