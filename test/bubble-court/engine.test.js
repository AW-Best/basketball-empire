import * as engine from '../../public/bubble-court/engine.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {neighbors,resolveShot,spendEnergy,initialBoard} from '../../public/bubble-court/engine.js';
test('hex neighbors never wrap across edges',()=>{assert.deepEqual(neighbors(0,0),[[0,1],[1,0]]);});
test('three matching balls pop and disconnected balls drop, charging energy',()=>{let b=Array.from({length:12},()=>Array(8).fill(null));b[0][0]=0;b[1][0]=0;b[2][0]=1;let r=resolveShot(b,0,1,0,0);assert.equal(r.popped.length,3);assert.equal(r.dropped.length,1);assert.equal(r.energy,64);assert.equal(b[2][0],null);});
test('two matching balls stay and give no energy',()=>{let b=Array.from({length:12},()=>Array(8).fill(null));b[0][0]=0;let r=resolveShot(b,0,1,0,0);assert.equal(r.energy,0);assert.equal(b[0][1],0);});
test('energy caps at 100 and dunk only spends a full bar',()=>{assert.deepEqual(spendEnergy(99,0),{energy:99,score:0,fired:false});assert.deepEqual(spendEnergy(100,0),{energy:0,score:2,fired:true});let b=Array.from({length:12},()=>Array(8).fill(null));b[0][0]=0;b[1][0]=0;assert.equal(resolveShot(b,0,1,0,95).energy,100);});
test('new boards contain playable groups and clear launch space',()=>{let b=initialBoard();assert.equal(b.length,12);assert.equal(b[0].length,8);assert.equal(b[0][0],b[0][1]);assert.ok(b.slice(5).flat().every(x=>x===null));});

test('dunk removes only the deepest occupied row, preserving colors for feedback',()=>{const b=Array.from({length:12},()=>Array(8).fill(null));b[0][0]=1;b[4][2]=2;b[4][7]=3;assert.deepEqual(engine.clearBottomRow(b),[{row:4,col:2,color:2},{row:4,col:7,color:3}]);assert.equal(b[0][0],1);assert.ok(b[4].every(v=>v===null));assert.deepEqual(engine.clearBottomRow(Array.from({length:12},()=>Array(8).fill(null))),[]);});
test('dunk cannot activate during flight, another dunk, or game over',()=>{for(const state of [{shot:true},{locked:true},{gameOver:true}])assert.deepEqual(engine.activateDunk({energy:100,score:4,...state}),{energy:100,score:4,fired:false});assert.deepEqual(engine.activateDunk({energy:100,score:4}),{energy:0,score:6,fired:true});assert.equal(engine.activateDunk({energy:99,score:4}).fired,false);});
