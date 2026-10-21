import {test} from 'node:test';import assert from 'node:assert/strict';import {handShape} from '../../public/bubble-court/duel-lab/slam/hand.mjs';
test('thumb stays short and opens outward without a hooked return',()=>{for(const open of [0,.5,1]){const h=handShape(open,.3);assert.ok(h.thumbTip.x>=-17);assert.ok(h.thumbTip.y<0);assert.equal(h.fingers.length,4);assert.ok(!h.thumb.includes('Q'));}});
test('release fingers spread while wrist stays narrow',()=>{const a=handShape(0,.8),b=handShape(1,0);assert.ok(b.span>a.span);assert.ok(b.wristWidth<=12);});
