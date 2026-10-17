const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('arcade links to the independently served Bubble Court practice mode',()=>{const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');assert.match(html,/href="\/bubble-court\/index.html"/);assert.match(html,/BUBBLE COURT/);});
test('Bubble Court ships explicit fire, relative fine aim and game-over replay controls',()=>{const file=path.join(root,'public/bubble-court/index.html');assert.ok(fs.existsSync(file),'Bubble Court assets must be shipped');const html=fs.readFileSync(file,'utf8');for(const id of ['fine-aim','shoot','game-over','play-again'])assert.ok(html.includes(`id="${id}"`));});
