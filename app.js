"use strict";

const PI = 3.14159265359;
const PI2 = PI/2;
const PI3 = 3*PI/2;
const DR = 0.0174533	// 1 degree in radians
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

let scene = Core2D.scene().setColor(Color.Navy);

const debug = new TextSprite().setWidth(160).setHeight(16).setRight(scene.right-64).setTop(scene.top);
debug.text = 'debug';

class Player {
	constructor(x=0, y=0, a=0) {
		this.x = x;
		this.y = y;
		this.a = a;
		this.dx = 0;
		this.dy = 0;
		this.calcDeltas();

	}

	calcDeltas() {
		if (this.a < 0) { this.a += 2*PI }
		if (this.a > 2*PI) { this.a -= 2*PI }
		this.dx = Math.cos(this.a)*4;
		this.dy = Math.sin(this.a)*4;
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
		if (this.controller.keyDown(Command.LEFT)) {
			this.player.a -= 0.1;
		} else if (this.controller.keyDown(Command.RIGHT)) {
			this.player.a += 0.1;
		}
		this.player.calcDeltas();

		if (this.controller.keyDown(Command.UP)) {
			this.player.x += this.player.dx;
			this.player.y += this.player.dy;
		} else if (this.controller.keyDown(Command.DOWN)) {
			this.player.x -= this.player.dx;
			this.player.y -= this.player.dy;
		}
	}

	render(context) {
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
		player = this.player;
		const dist = (ax, ay, bx, by, ang) => {
			return Math.sqrt((bx-ax)*(bx-ax) + (by-ay)*(by-ay));
		}

		let mx = 0;let my = 0; let mp = 0; let dof = 0;
		let rx = 0; let ry = 0; let xo = 0; let yo = 0;
		let distH; let distV; let hx; let hy; let vx; let vy; let aTan; let nTan;
		let ra = player.a-DR*30; if (ra<0) { ra+=2*PI; } if (ra>2*PI) {ra-=2*PI; }
		for(let r=0;r<60;r++) {
			// check Horizontal lines
			dof = 0;
			distH=1000000; hx=player.x; hy=player.y;
			aTan = -1/Math.tan(ra);
			if (ra > PI) { ry = ((player.y>>6)<<6)-0.0001;    rx = (player.y-ry)*aTan+player.x; yo = -BLOCKSIZE; xo=-yo*aTan; } // looking up
			if (ra < PI) { ry = ((player.y>>6)<<6)+BLOCKSIZE; rx = (player.y-ry)*aTan+player.x; yo = BLOCKSIZE;  xo=-yo*aTan; } // looking down
			if (ra === 0 || ra === PI) { rx = player.x; ry = player.y; dof = MAXDOF; } // straight left or right
			while(dof < MAXDOF) {
				mx = rx>>6; my=ry>>6; mp=my*MAPW+mx;
				if (mp>0 && mp<MAPW*MAPH && MAP[mp]!=0) { hx=rx; hy=ry; distH=dist(player.x, player.y, hx, hy, ra); dof = MAXDOF; }	// hit a wall
				else { rx += xo; ry += yo; dof += 1; }	// next line
			}

			// check Vertical lines
			dof = 0;
			distV=1000000; vx=player.x; vy=player.y;
			nTan = -Math.tan(ra);
			if (ra > PI2 && ra < PI3) { rx = ((player.x>>6)<<6)-0.0001;    ry = (player.x-rx)*nTan+player.y; xo = -BLOCKSIZE; yo=-xo*nTan; } // looking left
			if (ra < PI2 || ra > PI3) { rx = ((player.x>>6)<<6)+BLOCKSIZE; ry = (player.x-rx)*nTan+player.y; xo = BLOCKSIZE;  yo=-yo*nTan; } // looking right
			if (ra === 0 || ra === PI) { rx = player.x; ry = player.y; dof = MAXDOF; } // straight up and down
			while(dof < MAXDOF) {
				mx = rx>>6; my=ry>>6; mp=my*MAPW+mx;
				if (mp>0 && mp<MAPW*MAPH && MAP[mp]!=0) { vx=rx; vy=ry; distV=dist(player.x, player.y, vx, vy, ra); dof = MAXDOF; }	// hit a wall
				else { rx += xo; ry += yo; dof += 1; }	// next line
			}
			if(distV<distH) { rx = vx; ry = vy; }
			if(distH<distV) { rx = hx; ry = hy; }

			context.strokeStyle = Color.Red;
			context.beginPath();
			context.lineWidth = 1;
			context.moveTo(this.left+player.x/BLOCKDIV, this.top+player.y/BLOCKDIV);
			context.lineTo(this.left+rx/BLOCKDIV, this.top+ry/BLOCKDIV);
			context.stroke();
			debug.text = ra;

			ra = player.a-DR*(30-r); if (ra<0) { ra+=2*PI; } if (ra>2*PI) {ra-=2*PI; }
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
