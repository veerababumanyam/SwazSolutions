const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign(
  {id: 1, email: 'test@example.com', name: 'Test User'},
  'placeholder-not-used',
  {expiresIn: '24h'}
);

console.log('Token generated:', token.substring(0, 50) + '...');

const data = JSON.stringify({
  username: 'quicktest123',
  display_name: 'Quick Test',
  published: false
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/profiles',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
