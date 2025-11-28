// Script to generate bcrypt hash for admin password
const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nCopy this hash to your auth-schema.sql file');
