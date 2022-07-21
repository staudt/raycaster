"use strict";

const PI = 3.14159265359;
const PI2 = PI/2;
const PI3 = 3*PI/2;
const DR = 0.0174533	// 1 degree in radians
const FOV = 40;
const MAXDOF = 20;	// max depth of field

const BLOCKSIZE = 64;
const BLOCKDIV = 4;

const Color = core2d.Color;
const Command = core2d.Command;
const TextSprite = core2d.TextSprite;
const Core2D = core2d.Core2D;

const MAP = [
	1,1,1,1,1,1,1,1,1,1,
	1,0,0,0,0,0,0,0,0,1,
	1,0,1,1,0,0,0,0,0,1,
	1,0,1,0,0,0,0,0,0,1,
	1,0,1,0,0,0,0,1,0,1,
	1,0,0,0,0,0,0,0,0,1,
	1,0,0,0,0,0,0,0,0,1,
	1,0,0,1,1,1,0,0,0,1,
	1,0,0,0,0,0,0,0,0,1,
	1,1,1,1,1,1,1,0,1,1,
];
const MAPW = 10;
const MAPH = 10;

function degToRad(a) { 	return a*PI/180.0; }
function fixAng(a) { if(a>359) { a-=360; }	if(a<0) { a+=360; }	return a; }
function distance(ax, ay, bx, by, ang) { return Math.cos(degToRad(ang))*(bx-ax)-Math.sin(degToRad(ang))*(by-ay); }

function lightenDarkenColor(col, amt) {
	var usePound = false;
	if (col[0] == "#") {
			col = col.slice(1);
			usePound = true;
	}
	var num = parseInt(col,16);
	var r = (num >> 16) + amt;
	if (r > 255) r = 255;
	else if  (r < 0) r = 0;
	var b = ((num >> 8) & 0x00FF) + amt;
	if (b > 255) b = 255;
	else if  (b < 0) b = 0;
	var g = (num & 0x0000FF) + amt;
	if (g > 255) g = 255;
	else if (g < 0) g = 0;
	return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

let scene = Core2D.scene().setColor(Color.Navy);

const debug = new TextSprite().setWidth(160).setHeight(16).setRight(scene.right-64).setTop(scene.top);
debug.text = 'debug';

class Player {
	constructor() {
		this.x = 150;
		this.y = 500;
		this.a = 90;
		this.dx = Math.cos(degToRad(this.a));
		this.dy = -Math.sin(degToRad(this.a));
	}
}

class MapView extends core2d.Sprite {
	constructor(player, x=0, y=0) {
		super(x, y);
		this.player = player;
		this.setWidth(BLOCKSIZE/BLOCKDIV*10);
		this.setHeight(BLOCKSIZE/BLOCKDIV*10);
		this.setColor(Color.White);
		this.controller = Core2D.getController();
	}

	update() {
		let player = this.player;
		if (this.controller.keyDown(Command.LEFT)) {
			player.a += 5; player.a=fixAng(player.a); player.dx=Math.cos(degToRad(player.a)); player.dy=-Math.sin(degToRad(player.a));
		} else if (this.controller.keyDown(Command.RIGHT)) {
			player.a -= 5; player.a=fixAng(player.a); player.dx=Math.cos(degToRad(player.a)); player.dy=-Math.sin(degToRad(player.a));
		}

		if (this.controller.keyDown(Command.UP)) {
			player.x += player.dx*5; player.y += player.dy*5;
		} else if (this.controller.keyDown(Command.DOWN)) {
			player.x -= player.dx*5;	player.y -= player.dy;
		}
	}

	render(context) {
		player = this.player;

		context.fillStyle = Color.Black;
		context.fillRect(this.x, this.y, this.width, this.height);

		for(let y=0; y<MAPH;++y) {
			for(let x=0; x<MAPW;++x) {
				if (MAP[y*MAPW+x]===1) {
					context.fillStyle = Color.Blue;
				} else {
					context.fillStyle = Color.Gray;
				}
				context.fillRect(this.left+1+(BLOCKSIZE/BLOCKDIV*x), this.top+1+(BLOCKSIZE/BLOCKDIV*y), BLOCKSIZE/BLOCKDIV-1, BLOCKSIZE/BLOCKDIV-1);
			}
		}
		
		// raycasting
		let mx,my,mp,dof,side; let vx,vy,rx,ry,ra,xo,yo,disV,disH; 
 		ra=fixAng(player.a+FOV); 

		 for(let r=0;r<FOV*2;r++) {
			//---Vertical--- 
			dof=0; side=0; disV=100000;
			let Tan=Math.tan(degToRad(ra));
					if(Math.cos(degToRad(ra))> 0.001) { rx=((player.x>>6)<<6)+64;       ry=(player.x-rx)*Tan+player.y; xo= 64; yo=-xo*Tan;} //looking left
			else if(Math.cos(degToRad(ra))<-0.001){ rx=((player.x>>6)<<6) -0.0001;  ry=(player.x-rx)*Tan+player.y; xo=-64; yo=-xo*Tan;} //looking right
			else { rx=player.x; ry=player.y; dof=MAXDOF;}  //looking up or down. no hit  
		
			while(dof<MAXDOF) { 
				mx=(rx)>>6; my=(ry)>>6; mp=my*MAPW+mx;                     
				if(mp>0 && mp<MAPW*MAPH && MAP[mp]==1){ dof=MAXDOF; disV=Math.cos(degToRad(ra))*(rx-player.x)-Math.sin(degToRad(ra))*(ry-player.y);} //hit
				else{ rx+=xo; ry+=yo; dof+=1;} //check next horizontal
			} 
			vx=rx; vy=ry;

			//---Horizontal---
			dof=0; disH=100000;
			Tan=1.0/Tan; 
					if(Math.sin(degToRad(ra))> 0.001){ ry=((player.y>>6)<<6) -0.0001; rx=(player.y-ry)*Tan+player.x; yo=-64; xo=-yo*Tan;} //looking up 
			else if(Math.sin(degToRad(ra))<-0.001){ ry=((player.y>>6)<<6)+64;     rx=(player.y-ry)*Tan+player.x; yo= 64; xo=-yo*Tan;} //looking down
			else{ rx=player.x; ry=player.y; dof=MAXDOF;} //looking straight left or right
		
			while(dof<MAXDOF) { 
				mx=(rx)>>6; my=(ry)>>6; mp=my*MAPW+mx;
				if(mp>0 && mp<MAPW*MAPH && MAP[mp]==1){ dof=MAXDOF; disH=Math.cos(degToRad(ra))*(rx-player.x)-Math.sin(degToRad(ra))*(ry-player.y);} //hit
				else{ rx+=xo; ry+=yo; dof+=1;} //check next horizontal
			}
			if(disV<disH){ rx=vx; ry=vy; disH=disV; } //horizontal hit first
			
			// 2d line
			context.strokeStyle = Color.Red;
			context.beginPath();
			context.lineWidth = 1;
			context.moveTo(this.left+player.x/BLOCKDIV, this.top+player.y/BLOCKDIV);
			context.lineTo(this.left+rx/BLOCKDIV, this.top+ry/BLOCKDIV);
			context.stroke();
			debug.text = disH;

			// 3d line
			let lineH = (BLOCKSIZE*scene.height)/(disH); if(lineH>scene.height) { lineH=scene.height;} //line height and limit
			let lineOff = scene.height/2 - (lineH>>1);
			let lineWidth = (Math.ceil(scene.width/FOV))/2;

			context.strokeStyle = lightenDarkenColor('#666666', parseInt(-disH/10));
			context.beginPath();
			context.lineWidth = lineWidth+1;
			context.moveTo(r*lineWidth, lineOff);
			context.lineTo(r*lineWidth, lineOff+lineH);
			context.stroke();

			ra=fixAng(ra-1);
		}

		//Draw Player
		context.fillStyle = Color.Yellow;
		context.fillRect(this.left+this.player.x/BLOCKDIV-4, this.top+this.player.y/BLOCKDIV-4, 8, 8);
		context.strokeStyle = Color.Yellow;
		context.beginPath();
		context.lineWidth = 3;
		context.moveTo(this.left+this.player.x/BLOCKDIV, this.top+this.player.y/BLOCKDIV);
		context.lineTo((this.left+this.player.x/BLOCKDIV)+this.player.dx*3, (this.top+this.player.y/BLOCKDIV)+this.player.dy*3);
		context.stroke();
	}
}

let player = new Player(80, 80);
let mapView = new MapView(player).setRight(scene.width-BLOCKSIZE/BLOCKDIV).setBottom(scene.height-BLOCKSIZE/BLOCKDIV);

scene.add(mapView);
scene.add(debug);

Core2D.setName("RayCaster");
Core2D.setAutoScale(false);
Core2D.init(scene);
