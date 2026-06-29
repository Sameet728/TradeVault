const fs = require('fs');
const path = require('path');
const dir = './src/actions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import
  content = content.replace(/import \{ auth \} from '@\/lib\/auth';/g, "import { auth } from '@clerk/nextjs/server';");
  
  // Replace session auth
  content = content.replace(/const session = await auth\(\);\n\s*if \(\!session\?\.user\?\.id\) return [^;]+;/g, match => {
    return match.replace(/const session = await auth\(\);/g, 'const { userId } = await auth();')
                .replace(/!session\?\.user\?\.id/g, '!userId');
  });

  // Replace session.user.id
  content = content.replace(/session\.user\.id/g, 'userId');

  // Replace Types.ObjectId(userId) for mongoose queries where it was added
  content = content.replace(/new Types\.ObjectId\(userId\)/g, 'userId');

  fs.writeFileSync(filePath, content);
  console.log('Processed', file);
}

// Also fix src/app/(dashboard)/layout.tsx and settings/page.tsx
const extraFiles = [
  './src/app/(dashboard)/layout.tsx',
  './src/app/(dashboard)/settings/page.tsx',
];

for (const filePath of extraFiles) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import \{ auth \} from '@\/lib\/auth';/g, "import { auth } from '@clerk/nextjs/server';");
    
    content = content.replace(/const session = await auth\(\);\n\s*if \(\!session\?\.user\?\.id\) ([^;]+);/g, match => {
      return match.replace(/const session = await auth\(\);/g, 'const { userId } = await auth();')
                  .replace(/!session\?\.user\?\.id/g, '!userId');
    });
    content = content.replace(/const session = await auth\(\);/g, 'const { userId } = await auth();');
    content = content.replace(/!session\?\.user\?\.id/g, '!userId');
    content = content.replace(/session\.user\.id/g, 'userId');
    content = content.replace(/session\?.user\?.name/g, '""');
    content = content.replace(/session\?.user\?.image/g, '""');

    fs.writeFileSync(filePath, content);
    console.log('Processed', filePath);
  }
}
