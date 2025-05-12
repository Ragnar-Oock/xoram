import {mkdirSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {brotliCompressSync, deflateSync, gzipSync} from 'node:zlib';
import {normalize, parse} from 'node:path';
import {build} from 'vite';

// clear dist folder
rmSync('./dist', {recursive: true});
mkdirSync('./dist');

// get build cases
const cases = readdirSync(normalize('./src'));

let fullReportJSON = {},
	fullReportText = '';

for (const buildCase of cases) {
	console.log(`building : ${buildCase}`);

	const artifact = await build({
		base: `/${buildCase}/`,
		build: {
			outDir: `./dist/${buildCase}/`,
			target: 'es2020',
			rollupOptions: {
				input: {
					main: `./src/${buildCase}/index.js`,
				},
			},
			minify: 'terser', // terser gives better compression results at the cost of build time
			reportCompressedSize: false, // we will compile that ourself just below
			// write: false, // don't write the artefact to disk as we don't need it to persist
			terserOptions: {
				mangle: {
					properties: true,
					module: true,
					toplevel: true,
				},
			},
			modulePreload: false, // let pretend we don't need modulepreload polyfilling
		},
	});

	const {raw, gzip, zstd, brotli} = artifact.output
		.map(({code}) => Buffer.from(code, 'utf-8'))
		.map(buffer => ({
			raw: buffer.length,
			gzip: gzipSync(buffer).length,
			brotli: brotliCompressSync(buffer).length,
			zstd: deflateSync(buffer).length,
		}))
		.reduce((acc, cur) => ({
				raw: acc.raw + cur.raw,
				zstd: acc.zstd + cur.zstd,
				gzip: acc.gzip + cur.gzip,
				brotli: acc.brotli + cur.brotli,
			}),
			{raw: 0, zstd: 0, gzip: 0, brotli: 0});

	const prettyName = parse(buildCase).name;
	fullReportJSON[prettyName] = {raw, gzip, brotli, zstd};
	fullReportText = `${fullReportText}
-----${prettyName}-----

@zoram/core build size report : ${prettyName}
raw    : ${prettySize(raw, 7).join(' | ')}
gzip   : ${prettySize(gzip, 7).join(' | ')}
brotli : ${prettySize(brotli, 7).join(' | ')}
zstd   : ${prettySize(zstd, 7).join(' | ')}

`;
}

console.log(fullReportText);

writeFileSync('./dist/report.json', JSON.stringify(fullReportJSON, null, 2));
writeFileSync('./dist/report.txt', fullReportText);

function prettySize(size, length = 0) {
	return [
		`${size.toString(10).padStart(length, ' ')} B`,
		`${(size / 1024).toFixed(2).padStart(length, ' ')} KiB`,
		`${(size / 1000).toFixed(2).padStart(length, ' ')} KB`,
	];
}