export function neighbors(r,c){const shift=r%2?1:-1;return [[r,c-1],[r,c+1],[r-1,c],[r-1,c+shift],[r+1,c],[r+1,c+shift]].filter(([a,b])=>a>=0&&a<12&&b>=0&&b<8);}
function flood(b,seeds,color){const seen=new Set(),out=[],q=[...seeds];while(q.length){const [r,c]=q.pop(),k=r*8+c;if(seen.has(k)||b[r][c]===null||(color!==undefined&&b[r][c]!==color))continue;seen.add(k);out.push([r,c]);q.push(...neighbors(r,c));}return out;}
export function resolveShot(b,r,c,color,energy){if(b[r]?.[c]!==null)return {popped:[],dropped:[],energy};b[r][c]=color;const match=flood(b,[[r,c]],color);if(match.length<3)return {popped:[],dropped:[],energy};match.forEach(([a,d])=>b[a][d]=null);const anchored=new Set(flood(b,b[0].map((_,i)=>[0,i])).map(([a,d])=>a*8+d)),dropped=[];b.forEach((row,a)=>row.forEach((v,d)=>{if(v!==null&&!anchored.has(a*8+d)){dropped.push([a,d]);b[a][d]=null;}}));return {popped:match,dropped,energy:Math.min(100,energy+match.length*16+dropped.length*16)};}
export function spendEnergy(energy,score){return energy>=100?{energy:0,score:score+2,fired:true}:{energy,score,fired:false};}
export function initialBoard(){return Array.from({length:12},(_,r)=>Array.from({length:8},(_,c)=>r<5?(Math.floor(c/2)+Math.floor(r/2))%4:null));}
export function touchesLaunch(board,top,step,radius,line){return board.some((row,r)=>row.some(v=>v!==null&&top+r*step+radius>=line));}

// Reserve a dunk only while the board is idle; its impact clears the row later.
export function activateDunk({energy,score,shot=false,locked=false,gameOver=false}){return shot||locked||gameOver?{energy,score,fired:false}:spendEnergy(energy,score);}
export function clearBottomRow(board){const row=board.findLastIndex(cells=>cells.some(color=>color!==null));if(row<0)return [];const cleared=[];board[row].forEach((color,col)=>{if(color!==null){cleared.push({row,col,color});board[row][col]=null;}});return cleared;}
