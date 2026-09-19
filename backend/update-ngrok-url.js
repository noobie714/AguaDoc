// backend/update-ngrok-url.js
// Run this AFTER starting ngrok (ngrok http 5000), any time its URL changes.
// It reads ngrok's own local API and updates .env for you — no manual copy-paste, no typos.
const fs = require('fs');
const path = require('path');

async function main() {
  let data;
  try {
    const res = await fetch('http://127.0.0.1:4040/api/tunnels');
    data = await res.json();
  } catch {
    console.error('❌ Could not reach ngrok. Is "ngrok http 5000" running in another window?');
    process.exit(1);
  }

  const tunnel = data.tunnels?.find(t => t.proto === 'https');
  if (!tunnel) {
    console.error('❌ No active https tunnel found. Is ngrok pointed at port 5000?');
    process.exit(1);
  }
  const url = tunnel.public_url;

  const envPath = path.join(__dirname, '.env');
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  env = env.includes('BACKEND_PUBLIC_URL=')
    ? env.replace(/BACKEND_PUBLIC_URL=.*/g, `BACKEND_PUBLIC_URL=${url}`)
    : env.trim() + `\nBACKEND_PUBLIC_URL=${url}\n`;
  fs.writeFileSync(envPath, env);

  console.log('✅ .env updated with:', url);
  console.log('\n👉 Now paste this into Xendit Dashboard → Settings → Webhooks → Payment Session:');
  console.log(`   ${url}/api/webhooks/xendit`);
  console.log('\n⚠  Restart your backend (Ctrl+C, then node server.js) so it picks up the new .env value.');
}

main();
