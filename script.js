window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Particle {
    // blueprint to create individual particle objects
    constructor(effect, x, y, color) {
      this.effect = effect;
      this.x = Math.random() * this.effect.width;
      this.y = 0;
      this.originX = Math.floor(x); //it is good practice to math.floor everything drawn in canvas for better performance.
      this.originY = Math.floor(y);
      this.color = color;
      this.size = this.effect.gap;
      this.vx = 0; //velocity x, horizontal speed. 1px per animation frame.
      this.vy = 0;
      this.ease = 0.8; //speed of animation
      this.friction = 0.95;
      this.dx = 0;
      this.dy = 0;
      this.distance = 0;
      this.force = 0;
      this.angle = 0; //will determine the direction of pixels when they interact with the mouse
    }
    draw(context) {
      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
      this.dx = this.effect.mouse.x - this.x; //dx is distance x
      this.dy = this.effect.mouse.y - this.y;
      this.distance = this.dx * this.dx + this.dy * this.dy;
      this.force = -this.effect.mouse.radius / this.distance;

      if (this.distance < this.effect.mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx); //method returns a numeric value in radians between minus Pi and plus Pi (theta angle). This method expects y coordinate first, x second
        this.vx += this.force * Math.cos(this.angle); //will map the angle with radiants as a value between -1 and +1. It will make particles float along the circle nicely as the mouse interacts.
        this.vy += this.force * Math.sin(this.angle);
      }

      this.x +=
        (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
      this.y +=
        (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }
    warp() {
      this.x = Math.random() * this.effect.width;
      this.y = Math.random() * this.effect.height;
      this.ease = 0.1;
    }
  }

  class Effect {
    // to handle all particles at the same time
    constructor(width, height) {
      //will make sure that the effects is aware of the current canvas dimensions
      this.width = width;
      this.height = height;
      this.particlesArray = [];
      this.image = document.getElementById('image1');
      this.centerX = this.width * 0.5; //to center image
      this.centerY = this.height * 0.5;
      this.x = this.centerX - this.image.width * 0.5; //the img also has width & height properties. This is the second part helping the image getting centered.
      this.y = this.centerY - this.image.height * 0.5;
      this.gap = 2; //high value means more performance but more pixelated image. 5x5 area
      this.mouse = {
        radius: 5000, //mouse size
        x: undefined,
        y: undefined,
      };
      window.addEventListener('mousemove', (event) => {
        this.mouse.x = event.x;
        this.mouse.y = event.y;
      });
    }

    //Below code is the random particles

    // init() { //initialize the effect and fill particlesArray with many particle objects
    //     for (let i = 0; i < 100; i++) { //index will start at 0 as long as index is less than 10, increase index by 1 and form 1 particle
    //         this.particlesArray.push(new Particle(this));
    //     }

    init(context) {
      context.drawImage(this.image, this.x, this.y);
      const pixels = context.getImageData(0, 0, this.width, this.height).data;
      for (let y = 0; y < this.height; y += this.gap) {
        //this loop scans whole canvas from top to bottom for image data that is not 0. In order to pick the visible data, I used .data above. gap is important here because if I have texted 1 instead of gap, it would reduce performance, would scan 1 pixel area. The amount of gap increases the area that is scanned. vertical
        for (let x = 0; x < this.width; x += this.gap) {
          //until scan is reached the width of canvas. horizontal
          const index = (y * this.width + x) * 4; // 4 is because each pixel is represented by 4 positions in the data array. r g b a.
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          const color = 'rgb(' + red + ',' + green + ',' + blue + ')'; //alpha is not written because transparent areas are not important. Background might be white but the canvas is transparent.
          if (alpha > 0) {
            this.particlesArray.push(new Particle(this, x, y, color));
          }
        }
      }
    }

    draw(context) {
      this.particlesArray.forEach((particle) => particle.draw(context));
    }
    update() {
      this.particlesArray.forEach((particle) => particle.update());
    }
    warp() {
      this.particlesArray.forEach((particle) => particle.warp());
    }
  }

  const effect = new Effect(canvas.width, canvas.height);
  effect.init(ctx);

  /* const particle1 = new Particle(); // 'new' will look for a class with that name and automatically trigger its constructor method. Constructor will form one blank object and will assign properties based on the blueprints inside.
     particle1.draw(); */

  function animate() {
    // to make it all animated and interactive
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.draw(ctx);
    effect.update();
    requestAnimationFrame(animate); // will call a function as an argument before the next browser repaint is called.
  }
  animate();

  // demo of drawing below:
  // ctx.fillRect(120, 150, 100, 200); // x & y (position), w & h
  // ctx.drawImage(image1, 0, 0); //3 arguments: the img, x & y coordinates + (optional) w & h of img

  //warp button here
  const warpButton = document.getElementById('warpButton');
  warpButton.addEventListener('click', function () {
    effect.warp();
  });
});
