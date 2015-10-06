module.exports = function (gulp, plugins) {
	return function () {
  	gulp.src('src/css/*.css')
		.pipe(plugins.csslint({
			'ids': false,
			'box-sizing': false,
			'important': false,
			'adjoining-classes': false,
			'qualified-headings': false
		}))
		.on('error', function () {
			console.log(error.toString());
		})
		.pipe(plugins.csslint.reporter());
	};
};
