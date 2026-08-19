const fs = require('fs');
const path = require('path');

const dir = './';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace old favicon or insert new one
    if (content.includes('href="/favicon.png"')) {
        content = content.replace('href="/favicon.png"', 'href="/favicon-new.png"');
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${file}`);
    } else if (!content.includes('href="/favicon-new.png"')) {
        content = content.replace('<head>', '<head>\n    <link rel="icon" href="/favicon-new.png" type="image/png">');
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Skipped ${file}`);
    }
});
