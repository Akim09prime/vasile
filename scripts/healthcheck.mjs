// @ts-check
import { env } from 'node:process';
import { request } from 'node:http';

// Simple healthcheck script to ensure critical pages are up.
// Fails with exit code 1 if any check fails.

const PORT = env.PORT || 9002;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const CHECKS = [
    { path: '/', expectedText: 'CARVELLO' },
    { path: '/ro/portofoliu', expectedText: 'Portofoliu' },
    { path: '/api/diag/runtime', expectedText: '"ok":true' },
    { path: '/api/diag/firestore-public-test', expectedText: '"ok":true' },
    { path: '/api/public/portfolio', expectedText: '"ok":true' },
];

async function runCheck(path, expectedText) {
    const url = `${BASE_URL}${path}`;
    console.log(`[Healthcheck] Checking ${url}...`);

    return new Promise((resolve, reject) => {
        const req = request(url, { method: 'GET', timeout: 5000 }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Status code ${res.statusCode} for ${path}`));
            }

            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                if (expectedText && !data.includes(expectedText)) {
                    return reject(new Error(`Expected text "${expectedText}" not found in response from ${path}`));
                }
                console.log(`[Healthcheck] ✅ OK: ${path}`);
                resolve(true);
            });
        });

        req.on('error', (err) => reject(new Error(`Request to ${path} failed: ${err.message}`)));
        req.end();
    });
}

async function main() {
    console.log('--- Starting Healthchecks ---');
    try {
        await Promise.all(CHECKS.map(check => runCheck(check.path, check.expectedText)));
        console.log('--- ✅ All Healthchecks Passed ---');
        process.exit(0);
    } catch (error) {
        console.error('--- ❌ Healthcheck Failed ---');
        console.error(error.message);
        process.exit(1);
    }
}

main();
