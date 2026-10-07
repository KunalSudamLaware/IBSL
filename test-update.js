async function test() {
  const FormData = (await import('formdata-node')).FormData;
  const { fileFromPath } = await import('formdata-node/file-from-path');
  const fs = require('fs');
  fs.writeFileSync('test.dwg', 'dummy dwg content');

  const form = new FormData();
  form.append('title', 'Luxury Villa Retreat');
  form.append('slug', 'luxury-villa-retreat');
  
  const res = await fetch('http://localhost:3000/api/admin/designs/cm1l8y8n000003b9b4y4z9u8m', { // we need a valid ID!
    method: 'PUT',
    body: form
  }).catch(e => console.error(e));

  if (res) {
    console.log(res.status);
    const json = await res.text();
    console.log(json);
  }
}
test();
