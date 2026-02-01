#!/usr/bin/env node
/**
 * Fix "Parameter 'e' implicitly has an 'any' type" by adding React.SyntheticEvent type.
 * Run from project root: node fix-e-param.js
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Replace (e) => with (e: React.SyntheticEvent) => in function/const declarations only
// Avoid double-typing and avoid replacing (e, x) =>
function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    // Match const name = (e) => - parameter e only
    content = content.replace(/\bconst\s+(\w+)\s*=\s*\((e)\)\s*=>/g, 'const $1 = ($2: React.SyntheticEvent) =>');
    content = content.replace(/\bconst\s+(\w+)\s*=\s*async\s*\((e)\)\s*=>/g, 'const $1 = async ($2: React.SyntheticEvent) =>');
    // (e, param) =>
    content = content.replace(/\bconst\s+(\w+)\s*=\s*\((e),\s*(\w+)\)\s*=>/g, 'const $1 = ($2: React.SyntheticEvent, $3) =>');
    content = content.replace(/\bconst\s+(\w+)\s*=\s*\((e),\s*(\w+),\s*(\w+)\)\s*=>/g, 'const $1 = ($2: React.SyntheticEvent, $3, $4) =>');
    content = content.replace(/\bconst\s+(\w+)\s*=\s*\((e),\s*(\w+),\s*(\w+),\s*(\w+)\)\s*=>/g, 'const $1 = ($2: React.SyntheticEvent, $3, $4, $5) =>');
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed:', filePath);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
            if (f !== 'node_modules') walk(full);
        } else if (/\.(tsx?|jsx?)$/.test(f) && !f.endsWith('.d.ts')) {
            fixFile(full);
        }
    }
}

walk(srcDir);
console.log('Done.');
