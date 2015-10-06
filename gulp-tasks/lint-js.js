module.exports = function (gulp, plugins) {
	return function () {
  	gulp.src([
    	'src/*.js',
    	'src/app/*.js',
			'src/app/plugins/*.js'
  	])
		.pipe(plugins.jshint())
		.on('error', function () {
			console.log(error.toString());
		})
		.pipe(plugins.jshint.reporter('default'));
	};
};
