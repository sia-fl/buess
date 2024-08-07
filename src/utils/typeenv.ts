import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'node:process';

// 加载 .env 文件中的环境变量
dotenv.config();

const env = process.env;
const outputDir = path.resolve(process.cwd(), 'src');
const outputFilePath = path.join(outputDir, 'const.ts');

const envVariables = Object.keys(env).reduce((acc, key) => {
  if (key.startsWith('VITE_') || ['MONGODB_URL'].includes(key)) {
    const variableString = `export const ${key} = ${JSON.stringify(env[key])};\n`;
    console.log(`Exporting ${key}`);
    return acc + variableString;
  }
  return acc;
}, '');

fs.writeFileSync(outputFilePath, envVariables);
console.log(`Environment constants generated at ${outputFilePath}`);
