const { task, src, dest } = require('gulp');

task('build:icons', copyIcons);

// Copy node/credential icons into dist, preserving their folder structure.
function copyIcons() {
	return src('nodes/**/*.{png,svg}').pipe(dest('dist/nodes'));
}
