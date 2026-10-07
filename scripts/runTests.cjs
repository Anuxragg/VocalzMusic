const fs = require('node:fs');
const path = require('node:path');

const testsDirectory = path.resolve(__dirname, '../server/test');
const testFiles = fs.readdirSync(testsDirectory)
  .filter((file) => file.endsWith('.test.js'))
  .sort();

for (const file of testFiles) {
  require(path.join(testsDirectory, file));
}
