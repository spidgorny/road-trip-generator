const { FuseBox } = require("fuse-box");

const fuse = FuseBox.init({
	homeDir: "src",
	output: "build/$name.js",
});

fuse.dev({
	root: '.'
});

fuse
	.bundle("app")
	.instructions(`> main.ts`)
	.hmr()
	.watch();

fuse.run();
