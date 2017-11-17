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

var Input = {x:0, y:0, a:false, b:false};
Input.update = function(){
    Input.x = -1 * btn(2) || 1 * btn(3) || 0;
	Input.y = -1 * btn(0) || 1 * btn(1) || 0;
	Input.a = btn(4); 
	Input.b = btn(5);
}

//var GenericProjectile for ship plus enemies, x position, y position + velocity

var Ship = {
	x:120, y:120, 
	dx:0, dy:0, 
	damp: 0.04, 
	accel: .25
};

Ship.cannon = {
	timer: new PoV_Interval(0.3),
	fire: function(){
		if (this.timer.poll()){
			//get ship.analyze() array
			//find each cannon pixel
			//new shot at ship.x + array.x, ship.y + array.y-1
			trace('PEW!!!');
		}
	}
}

Ship.draw = function(){
	spr(0,Ship.x, Ship.y,0,1,0,0,2,1);
}

Ship.update = function(){
	Ship.cannon.timer.update();//should be put in an update list
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

//call each time damage to ship occurs
//if more than 50% damaged, ship destroyed
Ship.analyze = function(tileNumber){
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

var Sky = {};
Sky.update = function(){ //generate stars
	memset(MAP, 0, HLINE);
	for(var addr = MAP; addr < MAP + HLINE; addr++){
		var rnd = Math.random();
		if(rnd > 0.999){poke(addr, 0xf);}
	}
	memcpy(MAP + HLINE, MAP, SCREEN_SIZE - HLINE);
	memcpy(SCREEN, MAP, SCREEN_SIZE);
}

function TIC(){
	cls();
	Input.update();
	Sky.update();
	Ship.update();
}