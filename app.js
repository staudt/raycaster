"use strict";

const PI = 3.14159265359;
const PI2 = PI/2;
const PI3 = 3*PI/2;
const DR = 0.0174533	// 1 degree in radians
const FOV = 35;
const MAXDOF = 20;	// max depth of field

const BLOCKSIZE = 64;
const BLOCKDIV = 4;
const WALKSPEED = 5;

const Color = core2d.Color;
const Command = core2d.Command;
const TextSprite = core2d.TextSprite;
const Core2D = core2d.Core2D;

const MAP = [
	1,1,1,1,1,1,1,1,1,1,
	1,0,0,0,0,0,0,0,0,1,
	1,0,1,1,0,0,0,0,0,1,
	1,0,0,0,1,0,0,0,0,1,
	1,0,1,0,1,0,0,1,0,1,
	1,0,0,0,0,0,0,0,0,1,
	1,0,0,0,0,0,0,0,0,1,
	1,0,0,1,1,1,0,0,0,1,
	1,0,0,0,0,0,0,0,0,1,
	1,1,1,1,1,1,1,0,1,1,
];
const MAPW = 10;
const MAPH = 10;

function degToRad(a) { return a*PI/180.0; }
function radToDeg(a) { return a*180.0/PI; }
function fixAng(a) { if(a>359) { a-=360; }	if(a<0) { a+=360; }	return a; }
function distance(ax, ay, bx, by) { return Math.sqrt((bx-ax)**2+(by-ay)**2); }

function lightenDarkenColor(color, amount) {
	color = color.slice(1);
	var num = parseInt(color,16);
	var r = (num >> 16) + amount;
	if (r > 255) r = 255;
	else if  (r < 0) r = 0;
	var b = ((num >> 8) & 0x00FF) + amount;
	if (b > 255) b = 255;
	else if  (b < 0) b = 0;
	var g = (num & 0x0000FF) + amount;
	if (g > 255) g = 255;
	else if (g < 0) g = 0;
	return "#" + (g | (b << 8) | (r << 16)).toString(16);
}

function castRay(px, py, ra, xOrder=0) {
			//Vertical
			let rx, ry;
			let xo=0; let yo=0; let mx=0; let my=0; let mp=0; let vx=0; let vy=0;
			let dof=0; let side=0; let disV=100000;
			let Tan=Math.tan(degToRad(ra));
					if(Math.cos(degToRad(ra))> 0.001) { rx=((px>>6)<<6)+64;       ry=(px-rx)*Tan+py; xo= 64; yo=-xo*Tan;} //looking left
			else if(Math.cos(degToRad(ra))<-0.001){ rx=((px>>6)<<6) -0.0001;  ry=(px-rx)*Tan+py; xo=-64; yo=-xo*Tan;} //looking right
			else { rx=px; ry=py; dof=MAXDOF;}  //looking up or down. no hit  
		
			while(dof<MAXDOF) { 
				mx=(rx)>>6; my=(ry)>>6; mp=my*MAPW+mx;                     
				if(mp>0 && mp<MAPW*MAPH && MAP[mp]==1){ dof=MAXDOF; disV=Math.cos(degToRad(ra))*(rx-px)-Math.sin(degToRad(ra))*(ry-py);} //hit
				else{ rx+=xo; ry+=yo; dof+=1;} //check next horizontal
			} 
			vx=rx; vy=ry;

			//Horizontal
			dof=0; let disH=100000;
			Tan=1.0/Tan; 
					if(Math.sin(degToRad(ra))> 0.001){ ry=((py>>6)<<6) -0.0001; rx=(py-ry)*Tan+px; yo=-64; xo=-yo*Tan;} //looking up 
			else if(Math.sin(degToRad(ra))<-0.001){ ry=((py>>6)<<6)+64;     rx=(py-ry)*Tan+px; yo= 64; xo=-yo*Tan;} //looking down
			else{ rx=px; ry=py; dof=MAXDOF;} //looking straight left or right
		
			while(dof<MAXDOF) { 
				mx=(rx)>>6; my=(ry)>>6; mp=my*MAPW+mx;
				if(mp>0 && mp<MAPW*MAPH && MAP[mp]==1){ dof=MAXDOF; disH=Math.cos(degToRad(ra))*(rx-px)-Math.sin(degToRad(ra))*(ry-py);} //hit
				else{ rx+=xo; ry+=yo; dof+=1;} //check next horizontal
			}
			if(disV<disH){ rx=vx; ry=vy; disH=disV; } //horizontal hit first
			
			return { type: 'ray', rx: rx, ry: ry, disH: disH, xOrder: xOrder };
}

class Player {
	constructor() {
		this.x = 150;
		this.y = 500;
		this.a = 90;
		this.dx = Math.cos(degToRad(this.a));
		this.dy = -Math.sin(degToRad(this.a));
	}
}

class Dino extends core2d.Sprite {
	constructor(x, y) {
		super();
		this.x = x;
		this.y = y;
		this.setImage('dino');
	}
}

class Renderer extends core2d.Sprite {
	constructor(x=0, y=0) {
		super(x, y);
		this.setWidth(scene.width);
		this.setHeight(scene.height);
		this.controller = Core2D.getController();
	}

	update() {
		if (this.controller.keyDown(Command.LEFT)) {
			player.a += 3; player.a=fixAng(player.a); player.dx=Math.cos(degToRad(player.a)); player.dy=-Math.sin(degToRad(player.a));
		} else if (this.controller.keyDown(Command.RIGHT)) {
			player.a -= 3; player.a=fixAng(player.a); player.dx=Math.cos(degToRad(player.a)); player.dy=-Math.sin(degToRad(player.a));
		}

		if (this.controller.keyDown(Command.UP)) {
			let destBlock = parseInt((player.y+player.dy*(WALKSPEED+24))/BLOCKSIZE)*MAPH + Math.floor((player.x+player.dx*(WALKSPEED+24))/BLOCKSIZE);
			if(MAP[destBlock]===0) { player.x += player.dx*WALKSPEED; player.y += player.dy*WALKSPEED; }
		} else if (this.controller.keyDown(Command.DOWN)) {
			let destBlock = parseInt((player.y-player.dy*(WALKSPEED+24))/BLOCKSIZE)*MAPH + Math.floor((player.x-player.dx*(WALKSPEED+24))/BLOCKSIZE);
			if(MAP[destBlock]===0) { player.x -= player.dx*WALKSPEED;	player.y -= player.dy*WALKSPEED; }
		}
	}

	render(context) {
		var gradient = context.createLinearGradient(0, 0, 0, scene.centerY);
		gradient.addColorStop(1, "#ffffff");
		gradient.addColorStop(0, "#55ceff");
		context.fillStyle = gradient;
		context.fillRect(scene.left, scene.top, scene.width, scene.centerY);
		var gradient = context.createLinearGradient(0, scene.centerY, 0, scene.bottom);
		gradient.addColorStop(0, "#201000");
		gradient.addColorStop(1, "#964B00");
		context.fillStyle = gradient;
		context.fillRect(scene.left, scene.centerY, scene.width, scene.bottom);
		// cast rays
		let renderQueue = [];
		let ra=fixAng(player.a+FOV); 
		for(let r=0;r<FOV*2;++r) {
			renderQueue.push(castRay(player.x, player.y, ra, r));
			ra=fixAng(ra-1);
		}

		// add creatures
		for (let creature of MAPCREATURES) {
			renderQueue.push({type: 'creature', obj: creature, disH: distance(player.x, player.y, creature.x, creature.y)});
		}
		
		// sort renderQueue from furthest to closest
		renderQueue.sort((a, b) => (a.disH < b.disH) ? 1 : -1)
		// render Queue
		for(let i=0;i<renderQueue.length;i++) {
			if(renderQueue[i].type === 'ray') {
				let ray = renderQueue[i];
				let lineH = (BLOCKSIZE*scene.height)/(ray.disH);
				if(lineH>scene.height) { lineH=scene.height;} //line height and limit
				if(lineH>1) {
					let lineOff = scene.height/2 - (lineH>>1);
					let lineWidth = (Math.ceil(scene.width/FOV))/2;
					let colorDist = parseInt(-ray.disH/8); if (colorDist < -66) { colorDist=-66; }

					context.strokeStyle = lightenDarkenColor('#964B00', colorDist);
					context.beginPath();
					context.lineWidth = lineWidth+1;
					context.moveTo(ray.xOrder*lineWidth, lineOff);
					context.lineTo(ray.xOrder*lineWidth, lineOff+lineH);
					context.stroke();
				}
			} else if (renderQueue[i].type === 'creature') {
				let disH = renderQueue[i].disH;
				debug.text = renderQueue[i].obj.x;
				let sx = renderQueue[i].obj.x-player.x;
				let sy = renderQueue[i].obj.y-player.y;
				let sz = 0;
				let a = sy * Math.cos(degToRad(player.a)) + sx * Math.sin(degToRad(player.a));
				let b = sx * Math.cos(degToRad(player.a)) - sy * Math.sin(degToRad(player.a));
				sx=a; sy=b;

				if (sy > 0) {	// void drawing in reverse position
					let w = (BLOCKSIZE*scene.height)/(disH);
					let h = (BLOCKSIZE*scene.height)/(disH);
					sx = (sx*(scene.width-BLOCKSIZE)/sy)+(scene.width/2);
					sy = (sz*(scene.width-BLOCKSIZE)/sy)+(scene.height/2);

					context.drawImage(renderQueue[i].obj._animation.image, sx-w/2, sy-h/2+20, w, h);
				}
			}
		}
	}

}

class MapView extends core2d.Sprite {
	constructor(x=0, y=0) {
		super(x, y);
		this
			.setWidth(BLOCKSIZE/BLOCKDIV*10)
			.setHeight(BLOCKSIZE/BLOCKDIV*10)
			.setRight(scene.width-BLOCKSIZE/BLOCKDIV)
			.setBottom(scene.height-BLOCKSIZE/BLOCKDIV);
	}

	render(context) {
		context.fillStyle = Color.Black;
		context.fillRect(this.x, this.y, this.width, this.height);
		// map
		for(let y=0; y<MAPH;++y) {
			for(let x=0; x<MAPW;++x) {
				if (MAP[y*MAPW+x]===1) { context.fillStyle = Color.Blue; }
				else { context.fillStyle = Color.Gray; }
				context.fillRect(this.left+1+(BLOCKSIZE/BLOCKDIV*x), this.top+1+(BLOCKSIZE/BLOCKDIV*y), BLOCKSIZE/BLOCKDIV-1, BLOCKSIZE/BLOCKDIV-1);
			}
		}
		// field of view
		let ray = castRay(player.x, player.y, fixAng(player.a+FOV));
		context.strokeStyle = Color.Red;
		context.beginPath();
		context.lineWidth = 1;
		context.moveTo(this.left+ray.rx/BLOCKDIV, this.top+ray.ry/BLOCKDIV);
		context.lineTo(this.left+player.x/BLOCKDIV, this.top+player.y/BLOCKDIV);
		ray = castRay(player.x, player.y, fixAng(player.a-FOV));
		context.lineTo(this.left+ray.rx/BLOCKDIV, this.top+ray.ry/BLOCKDIV);
		context.stroke();
		//Draw Player
		context.fillStyle = Color.Yellow;
		context.fillRect(this.left+player.x/BLOCKDIV-3, this.top+player.y/BLOCKDIV-3, 6, 6);

		//Draw Creatures
		for (let creature of MAPCREATURES) {
			context.fillStyle = Color.Red;
			context.fillRect(this.left+creature.x/BLOCKDIV-3, this.top+creature.y/BLOCKDIV-3, 6, 6);
			}
	}
}

let scene = Core2D.scene();

let player = new Player();
let renderer = new Renderer();
scene.add(renderer);
let mapView = new MapView();
scene.add(mapView);

const debug = new TextSprite().setWidth(160).setHeight(16).setRight(scene.right-64).setTop(scene.top);
scene.add(debug);

const MAPCREATURES = [
	new Dino(100, 400),
	new Dino(400, 400)
];

Core2D.setName("RayCaster");
Core2D.setKeepAspect(true);
Core2D.setAutoScale(true);
Core2D.init(scene);
