import {mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {brotliCompressSync, deflateSync, gzipSync} from 'node:zlib'

// clear dist folder
rmSync('./dist', { recursive: true });
mkdirSync('./dist');

await exec('vite', [`build`], { stdio: 'inherit' });

const built = readFileSync('./dist/core-size-check.iife.js');


const raw = built.length
const gzip = gzipSync(built).length
const brotli = brotliCompressSync(built).length
const zstd = deflateSync(built).length



const reportJSON = {
    raw: [`${raw.toString(10)}B`, `${(raw / 1024).toFixed(2)}KiB`, `${(raw / 1000).toFixed(2)}KB`],
    gzip: [`${gzip.toString(10)}B`, `${(gzip / 1024).toFixed(2)}KiB`, `${(gzip / 1000).toFixed(2)}KB`],
    brotli: [`${brotli.toString(10)}B`, `${(brotli / 1024).toFixed(2)}KiB`, `${(brotli / 1000).toFixed(2)}KB`],
    zstd: [`${zstd.toString(10)}B`, `${(zstd / 1024).toFixed(2)}KiB`, `${(zstd / 1000).toFixed(2)}KB`],
}

const report = `
@zoram/core minimal build size report
raw   : ${reportJSON.raw.join(' | ')}
gzip  : ${reportJSON.gzip.join(' | ')}
brotli: ${reportJSON.brotli.join(' | ')}
zstd  : ${reportJSON.zstd.join(' | ')}
`;

console.log(report);

writeFileSync('./dist/report.json', JSON.stringify(reportJSON));

/**
 * run command in sub process, stolen from Vue's build scripts
 *
 * @param {string} command
 * @param {string[]} args
 * @param {object} [options]
 */
export async function exec(command, args, options) {
    return new Promise((resolve, reject) => {
        const _process = spawn(command, args, {
            stdio: [
                'ignore', // stdin
                'pipe', // stdout
                'pipe', // stderr
            ],
            ...options,
            shell: process.platform === 'win32',
        })

        /**
         * @type {Buffer[]}
         */
        const stderrChunks = []
        /**
         * @type {Buffer[]}
         */
        const stdoutChunks = []

        _process.stderr?.on('data', chunk => {
            stderrChunks.push(chunk)
        })

        _process.stdout?.on('data', chunk => {
            stdoutChunks.push(chunk)
        })

        _process.on('error', error => {
            reject(error)
        })

        _process.on('exit', code => {
            const ok = code === 0
            const stderr = Buffer.concat(stderrChunks).toString().trim()
            const stdout = Buffer.concat(stdoutChunks).toString().trim()

            if (ok) {
                const result = {ok, code, stderr, stdout}
                resolve(result)
            } else {
                reject(
                    new Error(
                        `Failed to execute command: ${command} ${args.join(' ')}: ${stderr}`,
                    ),
                )
            }
        })
    })
}