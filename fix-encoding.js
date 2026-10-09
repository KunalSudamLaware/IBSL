const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/designs/[slug]/page.tsx', 'utf-8');
content = content.replace(/\uFFFD/g, ''); // Remove replacement characters
fs.writeFileSync('src/app/(public)/designs/[slug]/page.tsx', content, 'utf8');
