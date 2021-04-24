
let canvas;
let button;

let table;
let balls = [];

let sliderm;

let dt = 1/30;

let fontsize = 14;

let collisions = 0;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  frameRate(30);

  table = new Table(-400, -250, 800, 500);

  button = createButton('Clear');
  button.position(windowWidth - 270, windowHeight / 2 + 150);
  button.mousePressed();
  button.size(70, 20)

  // creacion de un slider
  sliderm = createSlider(30, 200, 30, 1);
  sliderm.position(windowWidth - 300, windowHeight / 2 + 100);
  sliderm.style('width', '200px');
  
  const N = sliderm.value();

  for(let i = 0; i<N; i++) {
    balls.push(new Ball(10, createVector(random(-380,380),random(-230,230)), createVector(random(-30,30), random(-30,30))));

    for(let j = 0; j < i; j++) {
      let d = dist(balls[i].pos.x, balls[i].pos.y, balls[j].pos.x, balls[j].pos.y);
      if (d <= balls[i].r) {
        balls[i].pos.x += 2*balls[i].r;
      }
    }
  }

  textSize(fontsize);
	textAlign(LEFT, CENTER);

}

function draw() {
  translate(windowWidth / 3, windowHeight / 2);
  background(220);



  table.show();

  for (let i = 0; i < balls.length; i++) {
    for (let j = i; j < balls.length; j++) {
      if (i !== j) {
        balls[i].collision(balls[j]);
      }
    }
    table.collision(balls[i]);

    balls[i].update();
    balls[i].show();
    
  }

  text("Collisions = " + nfc(collisions, 0), 300, -240);


}


// creation of billar table
let Table = function (_x, _y, _w, _h) {
  this.x = _x;
	this.y = _y;
	this.w = _w;
	this.h = _h;

  this.show = function () {
    noStroke();
    fill(80);
    rect(this.x, this.y, this.w, this.h);
  }

  this.collision = function (child) {
    if ((child.pos.x < this.x +child.r/2) || (child.pos.x > this.x + this.w -child.r/2) ) {
      child.pos.x -= child.vel.x * dt;
      child.vel.x *= -1;
      // collisions += 1;
    }
    if ((child.pos.y < this.y +child.r/2) || (child.pos.y > this.y + this.h -child.r/2) ) {
      child.pos.y -= child.vel.y * dt;
      child.vel.y *= -1;
      // collisions += 1;
    }
  }
};


// creation of billar ball
let Ball = function (_r, _pos, _vel) {
  this.r = _r;
  this.pos = _pos;
  this.vel = _vel;
  this.mass = 1;
  this.moment = this.mass * this.vel;
  this.energy = 0.5*this.mass*this.vel.magSq();

  this.show = function() {
    noStroke();
    fill(180);
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
  }

  this.update = function () {
    //

    // update the position
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    this.energy = 0.5*this.mass*this.vel.magSq();
  }

  this.collision = function (child) {
    let d = dist(this.pos.x, this.pos.y, child.pos.x, child.pos.y);
    let dv = this.pos.copy().sub(child.pos); 

    let en = (this.energy + child.energy) / 2;

    if (d < (this.r/2 + child.r/2 + (0.1 * child.r/2))) {
      let newMag = sqrt((2*en)/this.mass);
      
      
      this.vel.reflect(dv);
      this.vel.setMag(newMag);
      this.pos.x += 1*this.vel.x * dt;
      this.pos.y += 1*this.vel.y * dt;

      
       child.vel.reflect(dv);
       child.vel.setMag(newMag);
       child.pos.x += 1*child.vel.x * dt;
      child.pos.y += 1*child.vel.y * dt;

       collisions += 0.5;
    }
  }
}

