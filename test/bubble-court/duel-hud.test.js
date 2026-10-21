import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CombatFeedback} from '../../public/bubble-court/duel/feedback.mjs';
test('ordinary clear reports points and energy in the HUD, including a cracked hazard',()=>{
 for(const gray of [0,2]){const f=new CombatFeedback('A');f.play({id:1,roundId:1,type:'pop',seat:'A',at:1000,normal:3,gray,energy:48});const s=f.sample(1100);assert.equal(s.placement,'hud');assert.match(s.detail,/\+30 pts/);assert.match(s.detail,/\+48 energy/);if(gray)assert.match(s.detail,/2.*junk/);}
});
test('feedback has its own reserved row outside the board and receiver uses the game width',async()=>{
 const root=new URL('../../public/bubble-court/duel/',import.meta.url),html=await readFile(new URL('index.html',root),'utf8'),css=await readFile(new URL('network.css',root),'utf8');
 const hud=html.indexOf('id="feedback-hud"'),notice=html.indexOf('id="combat-notice"'),board=html.indexOf('<section class="board-wrap"');assert.ok(hud>=0&&hud<notice&&notice<board,'HUD must be outside and before the board');
 assert.match(css,/#feedback-hud\{[^}]*height:32px/);assert.match(css,/\.game\.incoming-cinema \.court-slot\{[^}]*position:static/);
 // The same fixed overlay now serves both mock and online play.
 const receiverRule=css.match(/body\[data-mode\] \.court-slot \.court\.receiving\{([^}]*)\}/);assert.ok(receiverRule,'shared receiver overlay must cover both game modes');
 const receiver=receiverRule[1];assert.match(receiver,/position:absolute/);assert.match(receiver,/width:100%/);assert.match(receiver,/left:0/);assert.doesNotMatch(receiver,/100vw|420px|position:fixed/);
});
