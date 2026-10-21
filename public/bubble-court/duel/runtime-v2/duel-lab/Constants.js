const WINDUP_MS=3000,SLAM_MS=1500,IMPACT_MS=800;
export const RULES=Object.freeze({rows:12,cols:8,energyPerBall:16,pointsPerBall:10,energyMax:100,garbage:4,pendingMax:8,blockPerNormal:3,attackWindupMs:WINDUP_MS,warningMs:WINDUP_MS+IMPACT_MS,dunkMs:SLAM_MS,attackCooldownMs:WINDUP_MS+SLAM_MS,countdownMs:3000,pressureMs:20000,presenceMs:10000,heartbeatMs:1000,tickMs:100});
export const BOARD=Object.freeze({width:360,height:480,radius:18,top:32,step:31.2,launcher:444,danger:390,speed:820,angleLimit:1.25,maxDpr:1.5});
export const PALETTE=Object.freeze({ink:'#102c37',paper:'#fff1cc',teal:'#47d7bd',orange:'#ff9745',gray:'#88969d',balls:['#29c6eb','#ff9850','#bb8af1','#53d6ab']});
export const VISUAL=Object.freeze({particles:20,particleMs:550,events:32});
export const COMBAT=Object.freeze({noticeMs:1100,impactAt:IMPACT_MS,impactMs:280,compactHeight:58,spectacleHeight:230,hazardOutline:'#ffad62',hazardLight:'#ffe8ba',ownColor:'#7bffcf',rivalColor:'#ffac7a',ownFlight:{from:{x:277,y:240},to:{x:365,y:80},arc:70},rivalFlight:{from:{x:365,y:80},to:{x:180,y:320},arc:45}});
export const COMIC=Object.freeze({width:400,height:180,maxDpr:1.5,gatherEnd:200/1500,riseEnd:600/1500,gripStart:740/1500,netPeak:.66,netClearance:6,impact:800/1500,holdEnd:860/1500,hangEnd:1150/1500,rim:{x:242,y:88,rx:32,ry:8},ballRadius:23,netLength:35,netStretch:32,cameraPush:.045,speedLines:8,fragments:8,palette:{sky:'#244944',floor:'#356155',fence:'#87a18b',cream:'#fff1cc',yellow:'#ffe16e',shadow:'#09242f'}});
export const HAND=Object.freeze({openAt:1150/1500,openEnd:1250/1500,withdrawEnd:.98,skin:'#cb8a60',light:'#f0ba87',shadow:'#985b43',ink:'#17313a',sleeve:'#153540',fingerWidth:5.4,fingerOutline:7,gripAngle:.24,gripFlex:.06,maxFlex:.38,fingerOffsets:[10,16,22]});

export const PRACTICE=Object.freeze({shotMs:5000,recoveryMs:8000,pressureMs:35000,openingMs:2500});

export const SPECTACLE=Object.freeze({clipMs:3000,contactMs:1000,followMs:120,launchDelayMs:100,burstMs:320,flightMs:750,releaseImpactMs:2200,releaseEndMs:2600,landingGlowMs:250,fadeMs:400,settleMs:160,sparks:12,bolts:3,maxBalls:4,fps:30,maxDpr:1.5,shakePx:3,flashAlpha:.12,colors:{classic:'#ffe58e',windmill:'#ffad62',blackhole:'#d1adff',cat:'#ffb4cc'},ink:'#13313b',steel:'#879a9e',light:'#fff4ca'});
export const SPECIAL_SPECTACLE=Object.freeze({clipMs:4000,contactMs:1000,flightMs:1100,releaseImpactMs:2200,releaseEndMs:3500,impactBurstMs:900,landingGlowMs:900,impactRadius:46,impactSparks:3});
export const SPECIAL_SOURCE_ANCHORS=Object.freeze({
 windmill:[[0,0],[1000,2200],[1600,4000],[2200,4400],[3100,4600],[3500,5000]],
 blackhole:[[0,0],[1000,5200],[1600,6000],[2200,6200],[3100,6400],[3500,6600]],
 cat:[[0,0],[1000,2750],[1300,2950],[1600,4100],[2200,4500],[3100,4700],[3500,5000]]
});
export const ENDING=Object.freeze({holdMs:180,fadeMs:900,revealMs:1100,revealFadeMs:240,reducedMs:220,dim:.3});
export const MOTION_LAB=Object.freeze({fps:30,speeds:[.5,1],target:{x:.84,y:.77},count:4,defaultMove:'classic'});
// Local workbench only: native action finishes before four visual carriers split.
export const STUDIO=Object.freeze({classic:{transferAt:1600,transferEnd:2200,sourceEnd:2200},special:{transferAt:2350,transferEnd:3100},receiptFadeMs:400,receiptGlowMs:250,sourceBurstMs:400});

export const ATTACK_POSES=Object.freeze({classic:{contact:880,hold:1500,width:400,height:350,top:25,x:274,y:204},windmill:{contact:2200,hold:5000,width:1120,height:580,x:420,y:240},blackhole:{contact:5200,hold:6600,width:1120,height:580,x:884,y:215},cat:{contact:2750,hold:5000,width:1120,height:580,x:520,y:240}});

// Source-world framing for the action-only battle edits. Native lab cameras stay unchanged.
export const CLOSEUP=Object.freeze({width:1120,height:580,
 windmill:{anchors:[[0,390,400,1.8],[700,390,380,1.8],[1900,400,260,1.8],[2600,410,260,1.85]],followAt:2600,offset:{x:-10,y:20},impactAt:4400,wideAt:4000,wide:{x:650,y:370,zoom:1.5},recoverAt:4600,settleAt:5000,settle:{x:400,y:355,zoom:1.5}},
 blackhole:{anchors:[[0,390,340,1.65],[1800,500,270,1.65],[2800,500,250,1.65],[3400,884,210,1.65],[4500,884,205,1.65],[5000,884,205,1.65],[5200,884,280,1.8],[5900,884,280,1.8],[6200,920,340,1.6],[6600,950,365,1.55]]},
 cat:{anchors:[[0,450,340,1.8],[1800,470,270,1.85],[2820,470,270,1.85]],followAt:2820,offset:{x:-50,y:30},impactAt:4500,wideAt:4100,wide:{x:730,y:260,zoom:1.7},recoverAt:4700,settleAt:5000,settle:{x:730,y:280,zoom:1.6},paw:{from:2950,to:4150,x:610,y:220}}
});
