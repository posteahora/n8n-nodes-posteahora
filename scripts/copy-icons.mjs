// Copy node/credential icons into dist, preserving folder structure.
// Replaces the former `gulp build:icons` task (gulp pulled in a vulnerable,
// unmaintained dependency tree — braces/micromatch/chokidar — for a one-file
// copy). Uses only Node's standard library; no dependencies.
import { cpSync, existsSync, statSync } from 'node:fs';

if (existsSync('nodes')) {
	cpSync('nodes', 'dist/nodes', {
		recursive: true,
		filter(src) {
			try {
				if (statSync(src).isDirectory()) return true;
			} catch {
				return false;
			}
			return /\.(png|svg)$/i.test(src);
		},
	});
}
