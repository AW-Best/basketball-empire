import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {rematchControls} from '../../public/bubble-court/duel/rematch.mjs';
import {MOVES} from '../../public/bubble-court/duel/moves.mjs';
import {dunkCue,attackCopy} from '../../public/bubble-court/duel/feedback.mjs';
const root=new URL('../../',import.meta.url);
test('English game entry, instructions, dynamic UI and API errors contain no untranslated Chinese',async()=>{
 const files=['public/bubble-court/duel/index.html',...['game','lobby','network','rematch','feedback','ending','moves'].map(n=>`public/bubble-court/duel/${n}.mjs`),...['session','http','server'].map(n=>`src/bubble-duel-${n}.mjs`),'cloudflare/bubble-duel-room.mjs'];
 for(const file of files){const text=await readFile(new URL(file,root),'utf8');assert.doesNotMatch(text,/\p{Script=Han}/u,file);}
 const html=await readFile(new URL(files[0],root),'utf8');assert.match(html,/<html lang="en">/);assert.match(html,/How to play/i);
});
test('English labels preserve attack ownership and explicit rematch consent',()=>{
 assert.equal(rematchControls({},'A').label,'Play Again');
 assert.equal(rematchControls({rematch:{from:'B'}},'A').label,'Accept Rematch');
 assert.equal(rematchControls({rematch:{from:'A'}},'A').disabled,true);
 assert.deepEqual(MOVES.map(m=>m.name),['Two-Hand Slam','Windmill','Black Hole','Giant Cat']);
 assert.equal(attackCopy({count:4},true).direction,'YOU → RIVAL');assert.equal(attackCopy({count:4},false).direction,'RIVAL → YOU');
 assert.match(dunkCue({at:0,count:4},0,false,'Player B').message,/Player B/);
});
