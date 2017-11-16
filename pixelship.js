// script: js
// title: pixelship

var DT = 1.0 / 60.0;

function PoV_Clamp(num, min, max){
	if(num < min) return min;
	if(num > max) return max;
	return num;
}

function PoV_Interval(delayTime){
	this.delay = delayTime;
	this.elapsed = 0;
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

var Ship = {
	x:120, y:120, 
	dx:0, dy:0, 
	damp:0.04, 
	accel:.25
};

Ship.draw = function(){
	spr(0,Ship.x, Ship.y,0,1,0,0,2,1);
}
Ship.update = function(){
	Ship.draw();

	Ship.dx += Input.x*Ship.accel;
	Ship.dy += Input.y*Ship.accel;

	Ship.dx *= (1-Ship.damp);
	Ship.dy *= (1-Ship.damp);
	
	Ship.x += Ship.dx;
	Ship.y += Ship.dy;

	Ship.x = PoV_Clamp(Ship.x,0,224);
	Ship.y = PoV_Clamp(Ship.y,70,128);

}
Ship.analyze = function(){
	var out=' ';
	for(var i = 0; i < 32; i += 1){
		var byte = peek(0x4000+i);
		var left = (byte & 0x0F).toString(16);
		var right = (byte >> 4).toString(16);
		out += left + right + ' ';
	}
	trace(out);
}

var Sky = {};
Sky.update = function(){
	//generate stars, stored in map
	memset(0x08000, 0, 0x78);
	for(var addr = 0x08000; addr < 0x08078; addr++){
		var rnd = Math.random();
		if(rnd > 0.999){poke(addr,0xf);}
	}
	memcpy(0x08078, 0x08000, 0x03FC0 - 0x78);
	memcpy(0x00000, 0x08000, 0x03FC0);
}

function TIC(){
	cls();
	Input.update();
	Sky.update();
	Ship.update();

}