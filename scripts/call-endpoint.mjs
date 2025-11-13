const [,, url, method = 'GET', payload = '{}'] = process.argv;

if (!url) {
	console.error('Usage: node scripts/call-endpoint.mjs <url> [method] [json-payload]');
	process.exit(1);
}

async function main() {
	const res = await fetch(url, {
		method,
		headers: { 'Content-Type': 'application/json' },
		body: method === 'GET' || method === 'HEAD' ? undefined : payload
	});
	const text = await res.text();
	console.log('status', res.status);
	console.log('body', text);
}

main().catch(err => {
	console.error('Request error:', err);
	process.exit(1);
});
