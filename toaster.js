// script: js
// tic80 game.tic -code game.js

var DT=1.0/60.0;

function PoV_Clamp(num, min, max){
	if(num<min) return min;
	if(num>max) return max;
	return num;
}

//PoV_Timer
function PoV_Timer(delay){
	this.delay=delay;
	this.elapsed=0;
	this.enabled=false;

	this.update=function(){
		this.elapsed+=DT;
		this.enabled=this.elapsed>this.delay;
	}
	this.reset=function(){
		this.elapsed=0;
		this.enabled=false;
	}
}

var press={up:0, down:1, left:2, right:3, shoot:4, jump:5}
var Control={x:0,y:0,shoot:false,jump:false}

Control.update=function(){
	Control.x=-1 * btn(press.left) || 1 * btn(press.right) || 0;
	Control.y=-1 * btn(press.up) || 1 * btn(press.down) || 0;
	Control.shoot=btn(press.shoot); 
	Control.jump=btn(press.jump);
}

Control.getRotation=function(){
	return btn(press.left) * 3 || 
		btn(press.right) * 1 || 
		btn(press.down) *  2 || 0;
}

//Toast
Toast.delay=new PoV_Timer(0.4);
Toast.lifetime=0.5;
Toast.velocity=1.7;
Toast.gravity=0;
Toast.slices={
	list:[],
	inAir:0,
	maxInAir:2
}

function Toast (x, y, dx, dy){
	this.x = x;
	this.y = y;
	this.dx = dx * Toast.velocity;
	this.dy = dy * Toast.velocity;
	this.sprite = {};
	this.sprite.current = Toast.sprite.current;
	this.sprite.rotation = 0;
	this.timealive = 0;
	Toast.slices.list.push(this);
}

Toast.shoot=function(x, y, dx, dy, rotation){
    if (!Toast.delay.enabled){return;}
	Toaster.dx += -dx * 3;
	Toaster.dy = -dy * 5;
	toast = new Toast(x, y, dx, dy);
	toast.sprite.rotation = rotation;
	Toast.delay.reset();
}

Toast.draw=function() {
		spr(this.sprite.current, 
			this.x, this.y, 
			0, 1, 0, 
			this.sprite.rotation);
	}
	
Toast.update=function() {
        Toast.delay.update();
        for (var i = 0; i < Toast.slices.list.length; i++) {
			var slice=Toast.slices.list[i];
			slice.timealive+=DT;
			if (slice.timealive > Toast.lifetime) {
				Toast.slices.list.shift();
				return;
			}
			slice.x +=slice.dx;
			slice.y += slice.dy;
			Toast.draw.call(slice);
        }
    }

Toast.sprite={
	current:290,
	toast:288,
	bagel:289,
	poptart:290
}

var Toaster={
	x:8,
	y:100,
	dx:0,
	dy:0,
	jumpforce:5,
	accel:0.27,
	damp:0.13,
	gravity:.3
}

Toaster.sprite={ 
	curr:256,
	ground:256,
	air:258,
	up:0,
	right:1,
	down:2,
	left:3,
	flip:0,
	rotate:0
}

Toaster.state={
	curr:2,
	ground:1,
	air:2
}

Toaster.draw = function(){
	spr(Toaster.sprite.curr,
	Toaster.x, Toaster.y,
	0, 1,
	Toaster.sprite.flip,
	Toaster.sprite.rotate,
	2, 2)
}

Toaster.update = function(){
	Toaster.draw();

	Toaster.x += Toaster.dx;
	Toaster.y += Toaster.dy;

	Toaster.sprite.flip = (Toaster.dx < 0) * 1 || 0;

	//temporary ground
	if (Toaster.y > 100){
		Toaster.y = 100;
		Toaster.state.curr = Toaster.state.ground;
	}

	if (Toaster.state.curr == Toaster.state.ground){
		Toast.slices.inAir = 0;

		Toaster.sprite.curr=Toaster.sprite.ground;
		//t.sprite.rotate=t.sprite.up;

		Toaster.dx = Toaster.dx + Toaster.accel * Control.x;
		Toaster.dx *= 1 - Toaster.damp;
		Toaster.dy = 0;

		if (Control.jump){
			Toaster.state.curr = Toaster.state.air;
			Toaster.dy -= Toaster.jumpforce;
		}

		if (Control.shoot){
			Toast.shoot(Toaster.x + 5 - Toaster.sprite.flip * 2,
				Toaster.y -1, 0, -1, 0);
		}
	}

	if (Toaster.state.curr==Toaster.state.air){
		Toaster.sprite.curr=Toaster.sprite.air;

		Toaster.dy += Toaster.gravity;
		Toaster.dy = PoV_Clamp(Toaster.dy,-7,7);

		//shoot

	}
}

function TIC(){
	cls();
	map(0,0,32,16);

	Control.update();
	Toaster.update();
	Toast.update();
	
}
