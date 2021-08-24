// Inicialización de todas las variables de la simulación 
let canvas;

let table;
let balls = [];
let N = 130; // Número de bolas

let sel;
let histo;
let List = [] ;
let sliderm;
let temperatura;
let valSlider = 0;
let newValSlider = 0;

let dt = 1/30; // Tiempo paso de evolución de la simulación 
let bins = 15;
let xi;
let fontsize = 14;
let V = [];
let collisions = 0;
let t = 0;
let savetxt;

function setup() {

  //Declaración de clases 

  canvas = createCanvas(windowWidth, windowHeight);
  frameRate(30);

  table = new Table(-250, -200, 300, 300); //Caja 2D donde se distribuyen las bolas
  histo= new Histo(140, -200, 370, 370);  //Histograma de velocidades 
  fogon= new Fogon(-250, 100 , 300, 70);  //Representación gráfica de un fogón al aumentar la temperatura

  sel = createSelect();
  sel.option('Distribución Uniforme')
  sel.option('Distribución Normal')
  sel.option('Solo una particula')
  sel.position(270, 50)
  //textAlign(CENTER)


  // creacion de un slider
  temperatura = createSlider(0, 30, newValSlider, 3);
  temperatura.position(windowWidth - 1100, windowHeight / 2 + 200);
  temperatura.style('width', '200px');
  valSlider = temperatura.value();

  //Creación de bolas que son agregadas a una lista 
  for(let i = 0; i<N; i++) {
    balls.push(new Ball(10, createVector(random(-220,20),random(-180,80)), createVector(random(-10 - valSlider ,10 + valSlider), random(-10 - valSlider ,10 + valSlider))));
    //Cada bola se crea en la caja con una posición y velocidad aleatoria

    //Condición para que las bolas no aparezcan solapadas cuando se crean  
    for(let j = 0; j < i; j++) {
      let d = dist(balls[i].pos.x, balls[i].pos.y, balls[j].pos.x, balls[j].pos.y);
      if (d <= balls[i].r) {
        balls[i].pos.x += balls[i].r;
      }
    }
  }
 

  temperatura.changed(cambioTemp);
  sel.changed(cambioTemp);
  
 
  // Creación de un botón que permite guardar las velocidades en el instante que se presiona, mediante
  // la función saveASText.
  savetxt = createButton("Guardar");
  savetxt.position(windowWidth - 550, windowHeight / 2 + 200);
  savetxt.mousePressed(saveAsText);
  
  textSize(fontsize);
	textAlign(LEFT, CENTER);

}


function draw() {
  //Función draw es un ciclo que se está corriendo constantemente 

  translate(windowWidth / 3, windowHeight / 2);
  background(220);
  t += dt; // Tiempo transcurrido de la simulación 

  for (let k = 0; k < int(bins); k++){
    List.push(0); // lista con las frecuancias para el histograma. Se define con todas sus entradas 0 
    //                cada vez que empieza un ciclo  
  }


  table.show(); //Muestra la caja 2D
  text("bins= " + bins, 430, -280);
  for (let i = 0; i < balls.length; i++) {
    for (let j = i; j < balls.length; j++) {
      if (i !== j) {
        balls[i].collision(balls[j]); //Función, actualiza la velocidad de las bola i 
        //si cumple que va a chocar con la bola j
      }
    }
    table.collision(balls[i]); //Función, actualiza la velocidad de las bola i 
    //si cumple que va a chocar con una pared de la caja

    balls[i].update(); //Actualiza la posición de las bolas en el tiempo dt con sus respectivas velocidades
    balls[i].show(); //Muestra las bolas 
    V.push(balls[i].vel.mag()); // Agrega las velocidades de cada bola a una lista 
  
    
  }
  xi = (max(V))/bins; //Define el rango de cada bin en el histograma 

  for (let i = 0; i < balls.length; i++){

   for (let k = 0; k < int(bins); k++){

    if (((k)*xi) <= V[i] && V[i] <= (k+1)*xi){
      List[k] += 1;    //Llenamos la lista de frecuencias según el rango de velocidad de cada bin
    }
    
    }
  }
  histo.show(List); //Muestra el histograma 

  let colort = temperatura.value();
  fogon.show(colort);

  text("Collisions = " + nfc(collisions, 0), 300, -280);
  text("time = " + nfc(t, 2), 300, -260);
  
  //Reiniciamos las listas de velocidades y frecuencia 
  V.splice(0, V.length); 
  List.splice(0, List.length);
}

function cambioTemp() {
  let valSlider = temperatura.value();
  balls.splice(0,balls.length);

  let item = sel.value();

  if (item == "Distribución Uniforme"){
    for(let i = 0; i<N; i++) {
      balls.push(new Ball(10, createVector(random(-230,30),random(-180,80)), createVector(random(-10 - valSlider ,10 + valSlider), random(-10 - valSlider ,10 + valSlider))));
  
      for(let j = 0; j < i; j++) {
        let d = dist(balls[i].pos.x, balls[i].pos.y, balls[j].pos.x, balls[j].pos.y);
        if (d <= balls[i].r) {
          balls[i].pos.x += balls[i].r;
        }
      }
    }
  }

  if (item == "Distribución Normal"){
    for(let i = 0; i<N; i++) {
      balls.push(new Ball(10, createVector(random(-230,30),random(-180,80)), createVector(randomGaussian(0,3+(valSlider/2)), randomGaussian(0,3+(valSlider/2)))));
  
      for(let j = 0; j < i; j++) {
        let d = dist(balls[i].pos.x, balls[i].pos.y, balls[j].pos.x, balls[j].pos.y);
        if (d <= balls[i].r) {
          balls[i].pos.x += balls[i].r;
        }
      }
    }
  } 
  
  if (item == "Solo una particula"){
    for(let i = 0; i<N; i++) {
      if (i==0){
      balls.push(new Ball(10, createVector(random(-230,30),random(-180,80)), createVector(45 + valSlider,45 + valSlider)));
      }
      else{
        balls.push(new Ball(10, createVector(random(-230,30),random(-180,80)), createVector(0,0)));
      }
      for(let j = 0; j < i; j++) {
        let d = dist(balls[i].pos.x, balls[i].pos.y, balls[j].pos.x, balls[j].pos.y);
        if (d <= balls[i].r) {
          balls[i].pos.x += balls[i].r;
        }
      }
    }
  } 


t = 0;
collisions = 0;

}

function saveAsText() { //Esta función sirve para guardar las velocidades en un archivo txt 
  let textToSave = [];
  for (let i = 0; i < balls.length; i++) {
    textToSave.push(balls[i].vel.mag()); //Lista con todas las velocidades
  }
  
  save(textToSave, "output.txt"); //Guarda archivo txt con la lista 
}
// caja de las particulas del gas
let Table = function (_x, _y, _w, _h) { //Clase que define la caja 2D
  //Posición
  this.x = _x;
	this.y = _y;
	this.w = _w;
	this.h = _h;

  this.show = function () { //Muestra la caja con su color y posición 
    noStroke();
    fill(80);
    rect(this.x, this.y, this.w, this.h);
  }
  
  this.collision = function (child) { //Esta función se le ingresa una bola con todas sus variables de clase
    //y se busca si la bola va chocar con una pared y según su choque se cambia su velocidad en dirección contraria
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

// Histograma de las velocidades
let Histo = function (_x, _y, _w, _h) {
  this.x = _x;
	this.y = _y;
	this.w = _w;
  this.h = _h;
  

  this.show = function (_val) {
    this.val = _val;
    noStroke();
    fill(176,224,230);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    rect(this.x+26, this.y+this.h-50, this.w-26, 2); //eje x
    textStyle(BOLD);
    text('velocidades',this.x+this.w/2 -15 , this.y+this.h -20);
    fill(0);
    rect(this.x+26, this.y, 2, this.h-50); //eje y
    text('N',this.x+5 ,this.y+this.h/2 - 10);

    fill(80);

  
  for (var j = 0; j < this.val.length; j++) {
    rect(j * 20 + 180, 120 - 10*this.val[j], 20, 10*this.val[j]);
  }


    
    
  }
};

// funcion que simula el fogon
let Fogon = function (_x, _y, _w, _h) {
  this.x = _x;
	this.y = _y;
	this.w = _w;
  this.h = _h;
  

  this.show = function (_val) {
    this.val = _val;
    noStroke();
    fill(255,200-this.val*5,0);
    rect(this.x, this.y, this.w, this.h);

    fill(80)   
  }
};


// Creacion de las particulas del gas
let Ball = function (_r, _pos, _vel) {
  //Variables de una bola 
  this.r = _r; //radio
  this.pos = _pos;
  this.vel = _vel;
  this.mass = 1; // masa por defecto 1


  this.show = function() { // Muestra la bola en su posición y color
    noStroke();
    fill(180);
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
  }

  this.update = function () { 
    //

    // Actualiza la posición de las bolas en un tiempo dt
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;


  }
  // Colision y conservacion del momento
  this.collision = function (child) {
    
    let d = dist(this.pos.x, this.pos.y, child.pos.x, child.pos.y); //Distancia entre bolas 
    let r_ij = this.pos.copy().sub(child.pos).normalize(); //vector de posición relativa normalizado
    
    let v_ij = this.vel.copy().sub(child.vel); ////vector de velocidad relativa normalizado
  

    if (d < (this.r/2 + child.r/2 )) {//Condición de choque entre bolas 
    
      let overlap = this.r - d;
      
      let q = -2*this.mass*child.mass*v_ij.dot(r_ij)/(this.mass + child.mass); //Momento de intercambio entre bolas

      // Actualización de velocidades
      this.vel.x += q*r_ij.x; 
      this.vel.y += q*r_ij.y;

      this.pos.x += overlap*r_ij.x ; //Se cambia la posición por un factor pequeño 
      //                               para evitar que las bolas se solapen y vuelvan a chocar
      //                               por errores númericos 
      this.pos.y += overlap*r_ij.y ;

      
       child.vel.x -=  q*r_ij.x;
       child.vel.y -= q*r_ij.y;

       child.pos.x += -overlap*r_ij.x ;
       child.pos.y += -overlap*r_ij.y ;

       collisions += 0.5;
       
    }
  }
}

