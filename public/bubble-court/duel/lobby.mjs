import {NetworkRoomStore} from './network.mjs';
import {startGame} from './game.mjs';
import {MockRoomStore} from './mock.mjs';
const $=id=>document.getElementById(id);let busy=false,info={urls:[]},inviteLink='';
const infoReady=fetch('/api/bubble/info',{signal:AbortSignal.timeout(2500)}).then(r=>r.json()).then(data=>{info=data;const url=data.urls?.[0];$('lan-address').textContent=data.online?'Online rooms · Play from different networks':url?`On the same Wi-Fi, open: ${url}/bubble-court/duel/`:'';}).catch(()=>{});
async function enter(code){if(code==='DEMO01')return enterDemo();if(busy)return;busy=true;$('create-room').disabled=true;$('lobby-status').textContent='Connecting…';try{const saved=code?JSON.parse(sessionStorage.getItem(`hoopire-net:${code}`)||'null'):null;const response=await fetch(code?`/api/bubble/rooms/${code}/join`:'/api/bubble/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:saved?.token}),signal:AbortSignal.timeout(5000)});const data=await response.json();if(!response.ok)throw Error(data.error||'Could not connect to the room');sessionStorage.setItem(`hoopire-net:${data.roomId}`,JSON.stringify({token:data.token,seat:data.seat}));history.replaceState(null,'',`?room=${data.roomId}`);const store=new NetworkRoomStore(data);$('network-lobby').hidden=true;document.querySelector('.game').hidden=false;
 await infoReady;const base=['localhost','127.0.0.1'].includes(location.hostname)?(info.urls?.[0]||location.origin):location.origin;inviteLink=`${base}/bubble-court/duel/?room=${data.roomId}`;$('invite-code').textContent=data.roomId;$('invite-url').value=inviteLink;
 await startGame(store,data.room);
}catch(error){$('lobby-status').textContent=error.message;}finally{busy=false;$('create-room').disabled=false;}}
$('create-room').onclick=()=>enter();$('join-room').onsubmit=e=>{e.preventDefault();const code=$('room-code').value.trim().toUpperCase();if(/^[A-Z0-9]{6}$/.test(code))enter(code);};$('open-rival').onclick=e=>{e.preventDefault();$('invite').showModal();};$('close-invite').onclick=()=>$('invite').close();$('copy-invite').onclick=async()=>{try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(inviteLink);else{$('invite-url').select();if(!document.execCommand('copy'))throw Error('copy');}$('copy-status').textContent='Copied! Send the link to your rival.';}catch{$('invite-url').select();$('copy-status').textContent='Press and hold the link above to copy it.';}};
async function enterDemo(){
 if(busy)return;busy=true;
 const store=new MockRoomStore();
 history.replaceState(null,'','?room=DEMO01');
 $('network-lobby').hidden=true;document.querySelector('.game').hidden=false;
 await startGame(store,store.snapshot());
}
$('demo-room').onclick=enterDemo;
const code=new URLSearchParams(location.search).get('room')?.toUpperCase();if(code==='DEMO01')enterDemo();else if(code&&/^[A-Z0-9]{6}$/.test(code))enter(code);
