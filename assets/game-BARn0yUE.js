const x=12,S=9,p=[[0,14,0,1,1,6,1,1,0,14,0,0],[0,0,0,0,0,2,0,0,0,0,0,0],[0,1,0,14,0,2,0,14,0,1,0,0],[0,0,0,0,0,2,0,0,0,0,0,0],[6,2,2,2,2,2,2,2,2,2,2,6],[0,0,0,0,0,2,0,0,0,0,0,0],[0,1,0,14,0,2,0,14,0,1,0,0],[0,0,0,0,0,2,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0]],y=[[0,1,0,0,0,0,0,0,0,14,0,0],[0,0,0,0,0,74,0,0,0,0,0,1],[1,75,0,0,0,2,0,0,0,75,0,0],[0,0,0,14,0,2,0,14,0,0,0,0],[0,0,0,0,0,2,0,0,0,0,0,0],[0,75,0,0,0,2,0,0,0,75,1,0],[14,0,0,0,0,2,0,0,0,0,0,0],[0,0,0,1,0,2,0,1,0,0,0,14],[0,0,0,0,0,6,0,0,0,0,0,0]],f=[[59,59,59,59,59,59,59,59,59,59,59,59],[59,29,30,31,32,2,45,46,47,48,7,59],[59,7,7,7,7,2,7,12,11,7,7,59],[59,33,34,35,40,2,49,50,51,2,7,59],[59,2,2,2,2,2,2,2,2,2,2,6],[59,36,37,38,39,2,52,53,54,2,7,59],[59,7,11,12,7,2,7,7,7,7,7,59],[59,41,42,43,44,2,55,56,57,58,7,59],[59,59,59,59,59,59,59,59,59,59,59,59]],g=[[59,59,59,59,59,59,59,59,59,59,59,59],[59,8,8,65,7,28,7,61,8,8,7,59],[59,7,11,12,2,2,2,2,7,7,7,59],[59,13,7,7,16,17,18,19,2,66,62,59],[6,2,2,2,20,21,22,23,2,2,2,59],[59,67,7,7,24,25,26,27,2,7,7,59],[59,7,7,8,2,2,2,2,60,68,7,59],[59,8,73,7,7,7,7,7,7,8,7,59],[59,59,59,59,59,59,59,59,59,59,59,59]],m={room1:{id:"room1",name:"Central Hub",map:p,playerStartX:5,playerStartY:7,description:"Welcome! Choose your path to explore different aspects of my profile.",doors:[{x:5,y:0,targetRoom:"room2",targetX:5,targetY:7,description:"Press SPACE to enter the Boss Room"},{x:0,y:4,targetRoom:"room3",targetX:10,targetY:4,description:"Press SPACE to enter the Work Experience Room"},{x:11,y:4,targetRoom:"room4",targetX:1,targetY:4,description:"Press SPACE to enter the Hobbies Room"}]},room2:{id:"room2",name:"Boss Room",map:y,playerStartX:5,playerStartY:7,description:"Face the final challenge - meet the person behind this experience!",doors:[{x:5,y:8,targetRoom:"room1",targetX:5,targetY:1,description:"Press SPACE to return to Central Hub"}]},room3:{id:"room3",name:"Work Experience",map:f,playerStartX:10,playerStartY:4,description:"Explore my professional journey and key accomplishments.",doors:[{x:11,y:4,targetRoom:"room1",targetX:1,targetY:4,description:"Press SPACE to return to Central Hub"}]},room4:{id:"room4",name:"My Hobbies",map:g,playerStartX:1,playerStartY:4,description:"Discover my passions: Reading, Football, and Traveling the world!",doors:[{x:0,y:4,targetRoom:"room1",targetX:10,targetY:4,description:"Press SPACE to return to Central Hub"}]}},E=[2,3,4,5,6,7,13,16,17,18,19,20,21,22,23,24,25,26,27],u={down_idle:[],down_walk:[],up_idle:[],up_walk:[],left_idle:[],left_walk:[],right_idle:[],right_walk:[]},o={x:Math.floor(12/2),y:7,direction:"down",animationState:"idle",currentAnimation:[],frameIndex:0,animationTimer:0,animationSpeed:.15};o.currentAnimation=u.down_idle;function T(t){o.animationTimer+=t,o.animationTimer>=o.animationSpeed&&(o.animationTimer=0,o.frameIndex=(o.frameIndex+1)%o.currentAnimation.length)}function A(t,n){const e=o.currentAnimation[o.frameIndex];if(!e)return;const r=o.x*n,i=o.y*n;if(t.save(),o.direction==="left"){const s=e.width;t.translate(r,i),t.scale(-1,1),t.drawImage(e,-s,0)}else t.drawImage(e,r,i);t.restore()}let a=m.room1;function I(){return a}function h(t){const n=m[t];return n?(console.log(`Changing from ${a.name} to ${n.name}`),a=n,o.x=n.playerStartX,o.y=n.playerStartY,console.log(`Player positioned at (${o.x}, ${o.y}) in ${n.name}`),o.animationState="idle",l(n),!0):(console.error(`Room ${t} not found!`),!1)}function l(t,n){const e=document.createElement("div");e.style.cssText=`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    z-index: 2000;
    border: 3px solid #fff;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.7);
    animation: fadeInOut 3s ease-in-out forwards;
  `;const r=document.createElement("style");r.textContent=`
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
  `,document.head.appendChild(r),e.innerHTML=`
    <div style="font-size: 24px; margin-bottom: 10px;">${t.name}</div>
    <div style="font-size: 16px; opacity: 0.8;">${t.description||""}</div>
  `,document.body.appendChild(e),setTimeout(()=>{document.body.contains(e)&&document.body.removeChild(e),document.head.contains(r)&&document.head.removeChild(r)},2e3)}function P(){const t=o.x,n=o.y,e=a.doors.find(r=>r.x===t&&r.y===n);return e&&(console.log(`Found door at (${t}, ${n}) leading to ${e.targetRoom}`),h(e.targetRoom))?(o.x=e.targetX,o.y=e.targetY,console.log(`Player moved to target position (${e.targetX}, ${e.targetY})`),!0):!1}function _(t,n){return a.doors.find(e=>e.x===t&&e.y===n)||null}function b(){a=m.room1,o.x=a.playerStartX,o.y=a.playerStartY,console.log(`Room system initialized. Starting in ${a.name}`),console.log(`Player starting position: (${o.x}, ${o.y})`),setTimeout(()=>{l(a)},1e3)}function w(t){const n=document.getElementById("gameCanvas"),e=n?n.getContext("2d"):null,r=64,i=t[0].length,s=t.length,d=i*r,c=s*r;return{canvas:n,ctx:e,TILE_SIZE:r,GAME_WIDTH:d,GAME_HEIGHT:c}}function C(t){t.style.transform="",t.style.position="",t.style.left="",t.style.top="",t.width=t.width,t.height=t.height}export{S as M,E as W,o as a,_ as b,P as c,x as d,C as e,A as f,I as g,b as i,u as p,w as s,T as u};
