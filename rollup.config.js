import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/main.ts',
	output: {
		dir: 'build',
		format: 'cjs'
	},
	plugins: [
		typescript(),
		resolve()
	]
};
