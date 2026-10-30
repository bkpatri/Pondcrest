const esbuild = require('esbuild');
esbuild.buildSync({entryPoints:['src/main.tsx'],bundle:true,minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},nodePaths:(process.env.NODE_PATH||'').split(require('path').delimiter).filter(Boolean),outfile:'assets/app.js',target:['es2020'],legalComments:'eof'});
console.log('Built GitHub Pages assets.');
