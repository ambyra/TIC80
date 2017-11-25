// script: js
// title: pixelship

const DT = 1.0 / 60.0;
const SCREEN = 	0x00000;
const PALETTE = 0x03FC0;
const SPRITE = 	0x04000;
const TILE =	0x06000;
const MAP =		0x08000;

const HLINE = 		120;	//240 half bytes
const TILE_SIZE =	32; 	//64 half byte pixels
const SCREEN_SIZE =	16320;	//240 * 136 half bytes pixels

function PoV_Clamp(num, min, max){
	if(num < min) return min;
	if(num > max) return max;
	return num;
}

function PoV_Interval(delayTime){
	this.delay = delayTime;
	this.elapsed = DT;
	this.update = function(){this.elapsed += DT;}
	this.poll = function(){
		if(this.elapsed > this.delay){this.elapsed = 0;}
		return this.elapsed == 0;
	}
}

var Input = {
	x: 0, y: 0, a: false, b: false,
	update: function(){
		this.x = -1 * btn(2) || 1 * btn(3) || 0;
		this.y = -1 * btn(0) || 1 * btn(1) || 0;
		this.a = btn(4); 
		this.b = btn(5);
	}
};

var Pixels = {};
Pixels.update = function(tileNumber){
	if(!tileNumber){tileNumber = 0;}
	var tileArr = [];
	var tileArrX = [];
	var tileIndex = tileNumber * TILE_SIZE;
	for(var i = 0; i < 32; i += 1){
		var byte = peek(SPRITE + tileIndex + i);
		var left = byte & 0x0F;
		var right = byte >> 4;
		tileArrX.push(left, right);
		if(tileArrX.length > 6) {
			tileArr.push(tileArrX);
			tileArrX = [];
		}
	}
	return tileArr;
}

Pixels.coords = function (tileArray, tileNumber, pixelIndex){
	var coords = [];
	var tOfsX = (tileNumber % 16) * 8;
	var tOfsY = Math.floor(tileNumber / 16) * 8;
	for (var y = 0; y < 8; y++){
		for (var x = 0; x < 8; x++){
			if(tileArray[y][x]==pixelIndex){
				coords.push({x:x + tOfsX, y:y + tOfsY});
			}
		}
	}
	return coords;
}

Projectiles = {
	list: [],
	update: function(){
		this.list = this.list.filter(function(projectile){
			Projectile.update.call(projectile);
			return projectile.timeAlive < projectile.lifeTime;
		});
	}
}

function Projectile(x, y, dx, dy, lifeTime, drawFunc){
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.timeAlive = 0;
	this.lifeTime = lifeTime;
	this.draw = drawFunc;
	Projectiles.list.push(this);
}

Projectile.update = function(){
	this.x += this.dx;
	this.y += this.dy;
	this.timeAlive += DT;
	this.draw();
}

//if more than 50% damaged, ship destroyed
var Ship = {
	x:120, y:120, 
	dx:0, dy:0, 
	damp: 0.04, 
	accel: .25,
	tile0: function(){return Pixels.update(0);},
	tile1: function(){return Pixels.update(1);}
};

Ship.cannon = {
	timer: new PoV_Interval(0.3),
	update: function(){this.timer.update();},
	coords: [],
	updatePixels: function(){
		const laser = 0x6;
		var tile0 = Ship.tile0();
		var arr0 = Pixels.coords(tile0,0,laser);
		var tile1 = Ship.tile1();
		var arr1 = Pixels.coords(tile1,1,laser);
		this.coords = arr0.concat(arr1);
	},
	fire: function(){
		if (!this.timer.poll()){return;}
		this.coords.forEach(function(pixel){
			var projectile = new Projectile(
				Ship.x + pixel.x, 
				Ship.y + pixel.y, 
				0, -2, .5,
				function(){
					line(this.x, this.y - 5 , this.x, this.y + 1, 6);
				}
			);
		});	
	}
}

Ship.battery = {
	update: function(){}
}

Ship.draw = function(){spr(0,Ship.x, Ship.y,0,1,0,0,2,1);}

Ship.update = function(){
	Ship.cannon.update();
	Ship.battery.update();
	Ship.draw();
	Ship.control();

	Ship.dx *= (1-Ship.damp);
	Ship.dy *= (1-Ship.damp);
	Ship.x += Ship.dx;
	Ship.y += Ship.dy;
	Ship.x = PoV_Clamp(Ship.x,0,224);
	Ship.y = PoV_Clamp(Ship.y,70,128);
}

Ship.control = function(){
	Ship.dx += Input.x * Ship.accel;
	Ship.dy += Input.y * Ship.accel;
	if (Input.a){Ship.cannon.fire();}
}

var Sky = {
	idx:0,
	size:0,
};
Sky.update = function(){ //generate stars
	memset(MAP, 0, HLINE);
	for(var addr = MAP; addr < MAP + HLINE; addr++){
		var rnd = Math.random();
		if(rnd > 0.999){poke(addr, 0xf);}
	}
	memcpy(MAP + HLINE, MAP, SCREEN_SIZE - HLINE);
	memcpy(SCREEN, MAP, SCREEN_SIZE);
}

//Ship.cannon.updatePixels();

function TIC(){
	cls();
	Input.update();
	Sky.update();
	Ship.update();
	Projectiles.update();
}

// <PALETTE>
// 000:0000007e25531d2b535f574fab5236008751ff004d83769cff77a8ffa300c2c3c700e756ffccaa29adfffff024fff1e8
// </PALETTE>

// <TILES>
// 000:0000000a000000aa00000aaa0000aaab0006aabb00aaaabb06aaaabbaaaaaabb
// 001:a0000000aa000000aaa00000baaa0000bbaa6000bbaaaa00bbaaaa60bbaaaaaa
// </TILES>

