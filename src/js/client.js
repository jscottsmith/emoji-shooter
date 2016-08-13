///////////////////////////////////
// GLOBAL CONSTANTS 
///////////////////////////////////

const BAD_GUYS = ['🌝', '🌚', '🤖', '👻', '👺', '👹'];

const EMOJI_SPEED           = 1;                // 1
const PROJECTILE_SPEED      = 10;               // 10
const PARTICLE_COUNT        = 50;               // 10
const GENERATOR_DELAY       = 5;                // in 100 ms
const PROJECTILE_EMOJI      = '🔥';
const GUN_EMOJI             = '🔫';             // 1
const GUN_POWER             = 0.05;             // 
const MAX_SHOT_POWER        = 5;                // mousedown max power
const HI_RES                = true;             // allow retina
const DEATH                 = '💀';             

///////////////////////////////////
// UTILITIES 
///////////////////////////////////

function distance(x0, y0, x1, y1) {
    // returns the length of a line segment
    const x = x1 - x0;
    const y = y1 - y0;
    return Math.sqrt(x * x + y * y);
}

function doBoxesIntersect(a, b) {
    return (Math.abs(a.position.x - b.position.x) * 2 < (a.width + b.width)) &&
           (Math.abs(a.position.y - b.position.y) * 2 < (a.height + b.height));
}

function getAngleDeg(x0, y0, x1, y1) {
    // degrees = atan2(deltaY, deltaX) * (180 / PI)
    const y = y1 - y0;
    const x = x1 - x0;
    return Math.atan2(y, x) * (180 / Math.PI);
}

function getAngleRadians(x0, y0, x1, y1) {
    // radians = atan2(deltaY, deltaX)
    const y = y1 - y0;
    const x = x1 - x0;
    return Math.atan2(y, x);
}

function movePointAtAngle(point, angle, distance) {
    return {
        x: point.x - (Math.cos(angle) * distance),
        y: point.y - (Math.sin(angle) * distance),
    };
}


///////////////////////////////////
// Emoji 
///////////////////////////////////

class Emoji {
    constructor(x, y, size, emoji) {
        this.emoji = emoji;
        this.position = {
            x,
            y,
        };
        this.hit = false;
        this.dead = false;
        this.size = size;
        // added width/height for hitcheck
        this.width = size;
        this.height = size;
        this.ctx = document.createElement('canvas').getContext('2d');
        this.ctx.canvas.width = this.size;
        this.ctx.canvas.height = this.size;
        this.draw();
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        this.ctx.textBaseline= 'top';
        this.ctx.font = this.size + 'px sans-serif';
        this.ctx.fillText(this.emoji, 0, 0);

        // test rect
        // this.ctx.fillStyle = 'rgba(255,0,0,0.5)';
        // this.ctx.fillRect(0, 0, this.size, this.size);
    }
}

///////////////////////////////////
// Enemy
///////////////////////////////////

class Enemy extends Emoji {
    constructor(...params) {
        super(...params);
        this.multiplier = 1;
        this.boom = '💥';
    }

    drawHit() {
        this.ctx.textBaseline= 'top';
        this.ctx.font = this.size + 'px sans-serif';
        this.ctx.clearRect(0, 0, this.size, this.size);
        this.ctx.fillText(this.boom, 0, 0);
    }
}

///////////////////////////////////
// Particle
///////////////////////////////////

class Particle extends Emoji {
    constructor(...params) {
        super(...params);
        this.gravity = 0.25;
        this.velocity = {
            x: _.random(-10, 10),
            y: _.random(-10, 10),
        };
    }

    updatePosition() {
        // apply gravity to the particle velocity
        this.velocity.y += this.gravity;

        const { x, y } = this.position;
        const { x: vx, y: vy } = this.velocity;

        this.position = {
            x: x + vx,
            y: y + vy,
        };
    }
}

///////////////////////////////////
// Gun
///////////////////////////////////

class Gun extends Emoji {
    constructor(...params) {
        super(...params);
        this.health = 10;
        this.dead = false;
        this.setupHealthBar();
    }

    reset() {
        this.dead = false;
        this.health = 10;
        this.healthBarEl.style.width = '100%';
    }

    setupHealthBar() {
        this.healthEl = document.createElement('div');
        document.body.appendChild(this.healthEl);

        this.healthBarEl = document.createElement('div');
        this.healthEl.appendChild(this.healthBarEl);

        this.healthEl.style.position = 'absolute';
        this.healthEl.style.border = '2px solid white';
        this.healthEl.style.borderRadius = '0.4em';
        this.healthEl.style.bottom = '1em';
        this.healthEl.style.width = '10em';
        this.healthEl.style.height = '0.4em';
        this.healthEl.style.marginLeft = '-5em';
        this.healthEl.style.left = '50%';

        this.healthBarEl.style.position = 'absolute';
        this.healthBarEl.style.top = '0';
        this.healthBarEl.style.left = '0';
        this.healthBarEl.style.width = '100%';
        this.healthBarEl.style.height = '100%';
        this.healthBarEl.style.background = 'white';
    }

    updateHealthBar() {
        this.health--;

        if (this.health === 0) this.dead = true;

        const percent = this.health * 10 + '%';
        this.healthBarEl.style.width = percent;
    }

    drawHit() {
        this.ctx.textBaseline= 'top';
        this.ctx.font = this.size + 'px sans-serif';
        this.ctx.clearRect(0, 0, this.size, this.size);
        this.ctx.fillText(this.emoji, 0, 0);

        const centerX = this.size / 2;
        const centerY = this.size / 2;
        const radius = this.size / 2;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'rgba(255,0,0,0.2)';
        this.ctx.fill();

        // reset
        this.ctx.fillStyle = 'black';

        this.timeout = setTimeout(() => {
            this.draw();
        }, 200);
    }
}

///////////////////////////////////
// Score Keeper
///////////////////////////////////

class ScoreKeeper {
    constructor(app) {
        this.app = app;
        this.score = 0;
        this.combo = 0;
        // create element
        this.scoreEl = document.createElement('div');
        this.comboEl = document.createElement('div');
        this.totalEl = document.createElement('div');
        document.body.appendChild(this.scoreEl);
        document.body.appendChild(this.comboEl);
        document.body.appendChild(this.totalEl);
        this.setStyle();
    }

    setStyle() {
        this.scoreEl.style.position = 'absolute';
        this.scoreEl.style.color = 'white';
        this.scoreEl.style.fontSize = '15vw';
        this.scoreEl.style.top = '50%';
        this.scoreEl.style.left = '50%';

        this.comboEl.style.position = 'absolute';
        this.comboEl.style.color = '#342f74';
        this.comboEl.style.fontSize = '0'; // size is set in tween, increased with each combo 
        this.comboEl.style.fontWeight = '700';

        this.totalEl.style.position = 'absolute';
        this.totalEl.style.color = 'white';
        this.totalEl.style.fontSize = '1.5em';
        this.totalEl.style.fontWeight = '500';
        this.totalEl.style.textAlign = 'right';
        this.totalEl.style.top = '1em';
        this.totalEl.style.right = '1em';

        // set transform values in Tweenlite so 
        // they are not overwritten during tweens
        TweenLite.set(this.scoreEl, {
            x: '-50%',
            y: '-50%',
        });
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.setScore();
        this.setCombo();
    }

    setHitpoint(point) {
        this.hitpoint = point;
    }

    comboCounter() {
        this.combo++;
        clearTimeout(this.timeout);
        this.tweenCombo();

        this.timeout = setTimeout(() => {
            this.combo = 0;
            this.setCombo();
        }, 1000);
    }

    increaseScore(multiplier) {
        let points = 5;
        points *= multiplier;

        this.comboCounter();
        points = this.combo > 0 ? points * this.combo : points;

        this.score += points

        this.setScore();
        this.setCombo();
        this.tweenScore();
    }

    setScore() {
        this.scoreEl.innerText = this.score;
        this.totalEl.innerText = this.score;
    }

    setCombo() {
        this.comboEl.innerText = `x${this.combo}`;
    }

    tweenCombo() {
        const fontSize = this.combo / 4 + 3;
        this.comboEl.style.fontSize = `${fontSize}em`;

        const top = this.hitpoint.y / this.app.dpr;
        const left = this.hitpoint.x / this.app.dpr;
        this.comboEl.style.top = `${top}px`;
        this.comboEl.style.left = `${left}px`;

        TweenLite.fromTo(this.comboEl, 1, {
            opacity: 1,
            scale: 0.5,
        }, {
            opacity: 0,
            scale: 1,
            ease: Power3.easeOut,
        });
    }

    tweenScore() {
        const tweenOut = () => {
                TweenLite.to(this.scoreEl, 0.6, {
                opacity: 0,
                scale: 1.5,
                // color: 'purple',
                ease: Power1.easeOut,
            });
        }

        TweenLite.fromTo(this.scoreEl, 0.2, {
            opacity: 0,
            scale: 0.8,
        }, {
            opacity: 1,
            scale: 1,
            ease: Power1.easeIn,
            onComplete: tweenOut
        });
    }
}

///////////////////////////////////
// Game 
///////////////////////////////////

class Game {
    constructor() {
        // setup a canvas
        this.canvas = document.getElementById('canvas');
        this.dpr = HI_RES ? window.devicePixelRatio || 1 : 1;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(this.dpr, this.dpr);

        // game state
        this.isPaused = false;
        this.gameOver = false;
        
        // arrays
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.gameOverEmojis = [];

        // crosshairs
        this.crosshairs = {
            position: {
                x: 100, 
                y: window.innerHeight / 2 * this.dpr,
            },
            hit: false,
        };

        this.shotPower = 1; // store the in projectiles
        this.mousedown = false;
        
        // method binding
        this.handleMousedown = this.handleMousedown.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.setCanvasSize = this.setCanvasSize.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouse = this.handleMouse.bind(this);
        this.handleKeyup = this.handleKeyup.bind(this);
        this.render = this.render.bind(this);
        this.shoot = this.shoot.bind(this);
        
        this.setupGun();
        this.setupKeys();
        this.setCanvasSize();
        this.setupListeners();
        this.setupRestart();
        
        // render and tick
        this.tick = 0;
        this.render();
        
        // demo shit
        this.demo();

        // info / score
        this.info = new Info(this);
        this.scoreKeeper = new ScoreKeeper(this);
    }

    setupRestart() {
        this.restartBtn = document.createElement('button');
        document.body.appendChild(this.restartBtn);

        this.restartBtn.style.border = 'none';
        this.restartBtn.style.outline = 'none';
        this.restartBtn.style.background = 'white';
        this.restartBtn.style.display = 'none';
        this.restartBtn.style.position = 'absolute';
        this.restartBtn.style.top = '50%';
        this.restartBtn.style.left = '50%';
        this.restartBtn.style.transform = 'translate3d(-50%, -50%, 0)';
        this.restartBtn.style.padding = '1em 2em';
        this.restartBtn.style.fontWeight = '500';
        this.restartBtn.style.zIndex = '100';
        this.restartBtn.innerText = 'RESTART';

        this.restartBtn.addEventListener('click', this.handleRestart);
    }

    handleRestart() {
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.gameOverEmojis = [];

        this.scoreKeeper.reset();
        this.gun.reset();
        this.hideRestart();
        this.gameOver = false;
    }

    hideRestart() {
        TweenLite.fromTo(this.restartBtn, 0.3, {
            x: '-50%',
            y: '-50%',
            scale: 1,
        }, {
            scale: 0,
            ease: Power2.easeOut,
            display: 'none',
        });
    }

    showRestart() {
        TweenLite.fromTo(this.restartBtn, 0.3, {
            x: '-50%',
            y: '-50%',
            scale: 0,
            display: 'block',
        }, {
            scale: 1,
            ease: Power2.easeOut,
        });
    }

    setupGun() {
        // gun
        const gunSize = 75 * this.dpr;
        const x = window.innerWidth * this.dpr - gunSize;
        const y = window.innerHeight / 2 * this.dpr;
        this.gun = new Gun(x, y, gunSize, GUN_EMOJI);
    }

    setupKeys() {
        this.keys = {
            space: false,
            up: false,
            down: false,
        };
    }
    
    demo() {
        const { x, y } = this.crosshairs.position;
        let i = 10;
        this.generator(0, y);
        
        const interval = setInterval(() => {
            
            this.shoot(x, y);
            i--;
            i > 0 ? i-- : clearInterval(interval);
        }, 300);
    }
    
    setupListeners() {
        window.addEventListener('resize', this.setCanvasSize);
        window.addEventListener('mousedown', this.handleMousedown);
        window.addEventListener('mouseup', this.handleClick);
        window.addEventListener('mousemove', this.handleMouse);
        window.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('keyup', this.handleKeyup);
    }


    handleKeydown(event) {
        // key event
        switch(event.keyCode) {
            case 32:
                this.keys.space = true;
                break;
            case 40:
                this.keys.up = true;
                break;
            case 39:
                this.keys.right = true;
                break;
            case 38:
                this.keys.down = true;
                break;
            case 37:
                this.keys.left = true;
                break;
        }
    }

    handleKeyup(event) {
        if (event.keyCode === 27) {
            this.isPaused = !this.isPaused;
        }

        // key events
        switch(event.keyCode) {
            case 32:
                this.keys.space = false;
                break;
            case 40:
                this.keys.up = false;
                break;
            case 39:
                this.keys.right = false;
                break;
            case 38:
                this.keys.down = false;
                break;
            case 37:
                this.keys.left = false;
                break;
        }
    }

    triggerKeyEvents() {
        // triggers on each tick

        if (this.keys.space &&
            this.tick % 5 === 0) {
            const { x, y } = this.crosshairs.position;
            this.shoot(x, y);
        }

        if (this.keys.down && 
            this.crosshairs.position.y > 0) {
            this.crosshairs.position.y -= 10 * this.dpr;
        }

        if (this.keys.up &&
            this.crosshairs.position.y < this.canvas.height) {
            this.crosshairs.position.y += 10 * this.dpr;
        }

        if (this.keys.left &&
            this.crosshairs.position.x > 0) {
            this.crosshairs.position.x -= 10 * this.dpr;
        }

        if (this.keys.right &&
            this.crosshairs.position.x < this.canvas.width) {
            this.crosshairs.position.x += 10 * this.dpr;
        }
    }

    handleMousedown(event) {
        this.mousedown = true;
        this.shotPower = 1;
        this.crosshairs.hit = false;
    }
    
    handleMouse(event) {
        const x = event.clientX * this.dpr;
        const y = event.clientY * this.dpr;
        this.crosshairs.position = {
            x,
            y,
        };
    }
    
    handleClick(event) {
        this.mousedown = false;

        const x = event.clientX * this.dpr;
        const y = event.clientY * this.dpr;
        this.shoot(x, y);
    }
    
    drawCrosshairs() {
        // check if the crosshairs are over an emoji
        this.crosshairsHit();
        
        const { x, y } = this.crosshairs.position;
        const size = this.crosshairs.hit ? 30 * this.dpr : 40 * this.dpr;
        const inner = this.crosshairs.hit ? 15 * this.dpr : 20 * this.dpr;

        // marked hit incorrectly when mousedown
        const color = this.crosshairs.hit ? 'violet' : 'white';
        const lineWidth = this.crosshairs.hit ? this.dpr * 4 : this.dpr * 2;
        
        // draw lines
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y);
        this.ctx.lineTo(x - size + inner, y);
        this.ctx.stroke();
        this.ctx.moveTo(x + size - inner, y);
        this.ctx.lineTo(x + size, y);
        this.ctx.stroke();
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x, y - size + inner);
        this.ctx.stroke();
        this.ctx.moveTo(x, y + size);
        this.ctx.lineTo(x, y + size - inner);
        this.ctx.stroke();

        // dont draw power if mouse is not down
        if (!this.mousedown) return;

        const centerX = x;
        const centerY = y;
        const radius = this.shotPower * this.dpr * 5 + size;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'transparent';
        this.ctx.fill();
        this.ctx.lineWidth = 2 * this.dpr;
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${(this.shotPower - 1) / MAX_SHOT_POWER})`;
        // console.log(`${(this.shotPower - 1) / 100}`);

        this.ctx.stroke();
    }

    setCanvasSize() {
        this.canvas.width = window.innerWidth * this.dpr;
        this.canvas.height = window.innerHeight * this.dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        
        // update gun position
        this.gun.position.x = window.innerWidth * this.dpr - this.gun.size;
    }
    
    updateGun() {
        const { x: x1, y: y1 } = this.gun.position;
        const { x: x2, y: y2 } = this.crosshairs.position;
        this.gun.rotation = getAngleDeg(x2, y2, x1, y1);

        // move along y axis
        const deltaY = y2 - y1;
        this.gun.position.y += deltaY * GUN_POWER;
    }
    
    shoot(x, y) {
        if (this.gun.dead) return;

        // size based on shot power
        const size = 25 * this.shotPower * this.dpr;

        // point clicked
        // adjusted for size
        x = x - size / 2;
        y = y - size / 2;
        
        // origin of projectile
        // adjusted for size
        let { x: x1, y: y1 } = this.gun.position;
        x1 -= size / 2 * this.dpr;
        y1 -= size / 2 * this.dpr; // offset 22 to acount for gun barrel position
        
        const projectile = new Emoji(x1, y1, size, PROJECTILE_EMOJI);
        projectile.power = this.shotPower;

        // set the projectile angle
        projectile.angle = getAngleRadians(x, y, x1, y1);

        // store it
        this.projectiles.push(projectile);
    }
    
    generator(x, y) {
        const enemies = BAD_GUYS;
        const i = _.random(0, enemies.length - 1);
        const size = _.random(50 * this.dpr, 100 * this.dpr);

        // for the demo in the beginning
        if (typeof x === 'undefined' || typeof y === 'undefined')  {
            x = -size;
            y = _.random(0, this.canvas.height - size);
        }   
        const enemy = new Enemy(x, y, size, enemies[i]);
        
        this.enemies.push(enemy);
    }

    addGameOverEmojis() {
        if (this.tick % 10 === 0) {
            const size = _.random(50 * this.dpr, 100 * this.dpr);
            const x = _.random(-size, this.canvas.width);
            const death = new Emoji(x, -size, size, DEATH);

            this.gameOverEmojis.push(death);
        }
    }

    drawGameOver() {
        this.gameOverEmojis.forEach((g, i) => {
            this.ctx.drawImage(g.ctx.canvas, g.position.x, g.position.y, g.size, g.size);
            g.position.y += 2 * this.dpr;
            if (g.position.y > this.canvas.height) this.gameOverEmojis.splice(i, 1);
        });
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, '#17BEB6');
        gradient.addColorStop(1, '#342f74');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); 
    }
    
    drawEnemies() {
        this.enemies.forEach((e, i) => {
            if (e.hit) e.drawHit();

            this.ctx.drawImage(e.ctx.canvas, e.position.x, e.position.y, e.size, e.size);
            
            // update position, mark dead if off the canvas
            e.position.x += e.size * 0.05 * EMOJI_SPEED;
            if (e.position.x > this.canvas.width) {
                e.dead = true;
            }
        });
    }

    drawProjectiles() {
        this.projectiles.forEach((p, i) => {
            this.ctx.drawImage(p.ctx.canvas, p.position.x, p.position.y, p.size, p.size);
            this.projectileHitTest(p);

            // update with trajectory
            const nextPosition = movePointAtAngle(p.position, p.angle, PROJECTILE_SPEED * this.dpr);
            p.position = nextPosition;
            
            // mark dead if off canvas
            if (p.position.x < 0 - p.position.size || 
                p.position.y < 0 - p.position.size || 
                p.position.x > this.canvas.width   || 
                p.position.y > this.canvas.height) {
                p.dead = true;
            }
        });
    }
        
    drawParticles() {
        this.particles.map(p => {
            this.ctx.drawImage(p.ctx.canvas, p.position.x, p.position.y, p.size, p.size);
            p.updatePosition();

            if (p.position.x < 0 ||
                p.position.x > this.canvas.width ||
                p.position.y < 0 ||
                p.position.y > this.canvas.height) {
                p.dead = true;
            }
        });
    }

    drawGun() {
        const { position, size, ctx } = this.gun;
        this.ctx.save();
        const offsetX = -10 * this.dpr;
        const offsetY = -15 * this.dpr;
        const tx = position.x + offsetX;
        const ty = position.y + offsetY;

        this.ctx.translate(tx, ty);

        this.ctx.rotate(this.gun.rotation * Math.PI / 180);
        this.ctx.drawImage(ctx.canvas, offsetX, offsetY, size, size);
        this.ctx.restore();
    }
        
    removeDead() {
        // cleans up dead items
        this.enemies.forEach((e, i) => {
            if (e.dead) this.enemies.splice(i, 1); 
        });
        
        this.particles.map((p, i) => {
            if (p.dead) {
                this.particles.splice(i, 1);
            }
        });
        
        this.projectiles.forEach((p, i) => {
            if (p.dead) this.projectiles.splice(i, 1);
        });
    }

    gunHitTest() {
        this.enemies.forEach(enemy => {
            if (!this.gun.dead && 
                !enemy.hit &&
                doBoxesIntersect(this.gun, enemy)) {

                // set enemy to hit and draw a big boom
                enemy.hit = true;
                enemy.draw();
                
                // then mark enemy dead after a short timeout
                setTimeout(() => {
                    enemy.dead = true;
                }, 100);

                this.gun.drawHit();
                this.gun.updateHealthBar();
            }
        });
    }
                                 
    projectileHitTest(projectile) {
        for(let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];

            // check projectil/enemy hits
            if (!enemy.hit &&
                doBoxesIntersect(projectile, enemy)) {
                // set enemy to hit and draw a big boom
                enemy.hit = true;
                enemy.draw();
                
                // then mark enemy dead after a short timeout
                setTimeout(() => {
                    enemy.dead = true;
                }, 100);
                
                // projectile is dead immediatetly
                if (projectile.power > 2.5) {
                    // @TODO constants/cleanup
                    // powerfull shit lives on
                } else {
                    projectile.dead = true;
                }
                
                // trigger explosion at the point
                this.explode(projectile.position.x, projectile.position.y);

                // set hitpoint for where to display multiplier
                // then add to score
                this.scoreKeeper.setHitpoint({ 
                    x: projectile.position.x, 
                    y: projectile.position.y
                });
                this.scoreKeeper.increaseScore(enemy.multiplier);
            }
        }
    }
 
    explode(x, y) {
        // needs starting x, y position
        let i = 0;
        while (i < PARTICLE_COUNT) {
            const size = _.random(10 * this.dpr, 20 * this.dpr); // remove power because it caused significant jank
            const particle = new Particle(x, y, size, '💥', this);
            this.particles.push(particle);
            i++;
        }
    }
        
    crosshairsHit() {
        const { x, y } = this.crosshairs.position;
        for(let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            this.ctx.rect(e.position.x, e.position.y, e.width, e.height);
            
            if (this.ctx.isPointInPath(x, y)) {
                this.crosshairs.hit = true;
                return;
            }
            this.crosshairs.hit = false;
        }
    }
    
    render() {
        this.tick++;
        window.requestAnimationFrame(this.render);

        this.triggerKeyEvents();

        if (this.isPaused) return;

        if (this.gameOver) {
            this.addGameOverEmojis();
            this.drawGameOver();
            return;
        }

        if (this.mousedown && this.shotPower <= MAX_SHOT_POWER) {
            // power up
            this.shotPower += 0.1;
        }

        if (this.tick % (GENERATOR_DELAY * 6) === 0) this.generator();
        
        this.drawBackground();
        this.drawEnemies();        
        this.drawProjectiles();
        this.drawParticles();

        if (!this.gun.dead) {
            this.drawGun();
            this.drawCrosshairs();
            this.gunHitTest();
            this.updateGun();
        } else {
            // janky gameover flag
            // should use event system
            // to handle these things
            this.gameOver = true;
            this.showRestart();
        }
        
        this.removeDead();
    }
}

class Info {
    constructor(game) {
        this.game = game;
        this.state = {
            isOpen: false
        };

        this.infoBtn = document.createElement('span');
        this.infoBox = document.createElement('div');

        document.body.appendChild(this.infoBtn);
        document.body.appendChild(this.infoBox);

        this.infoBtn.innerText = '?';
        this.handleClick = this.handleClick.bind(this);
        this.infoBtn.addEventListener('click', this.handleClick);
        this.infoBox.addEventListener('click', this.handleClick);
        this.setStyle();
        this.setInfo();
    }

    setInfo() {
        this.infoBox.innerHTML = `
            <h1>🌚🔥🔥🔥🔥🔥🔥🔫</h1>
            <p>
                <strong>Aim</strong> with the mouse or arrow keys.
            </p>
            <p>
                <strong>Fire</strong> by clicking or with the spacebar.
            </p>
            <p>
                <strong>Powerup</strong> by clicking and holding the mouse down.
            </p>
            <p>
                <strong>Esc</strong> to pause.
            </p>
            <p>
                Hitting emojis hurts. <strong>Don't die</strong>.
            </p>
        `;
    }

    setStyle() {
        this.infoBtn.style.position = 'absolute';
        this.infoBtn.style.bottom = '0.2em';
        this.infoBtn.style.right = '0.5em';
        this.infoBtn.style.fontWeight = '500';
        this.infoBtn.style.fontSize = '2.5em';
        this.infoBtn.style.color = 'white';

        this.infoBox.style.position = 'absolute';
        this.infoBox.style.padding = '2em';
        this.infoBox.style.top = '50%';
        this.infoBox.style.left = '50%';
        this.infoBox.style.width = '30em';
        // this.infoBox.style.height = '80%';
        this.infoBox.style.background = 'rgba(255, 255, 255, 0.95)';
        this.infoBox.style.opacity = '0';
        this.infoBox.style.display = 'none';

        TweenLite.set(this.infoBox, {
            x: '-50%',
            y: '-100%',
        });
    }

    tweenOpen() {
        TweenLite.to(this.infoBox, 0.4, {
            display: 'block',
            y: '-50%',
            opacity: 1,
            ease: Power2.easeOut,
            onComplete: () => {
                this.state.isOpen = true;
                this.game.isPaused = true;
            },
        });
    }

    tweenClose() {
        TweenLite.to(this.infoBox, 0.4, {
            display: 'none',
            y: '-100%',
            opacity: 0,
            ease: Power2.easeOut,
            onComplete: () => {
                this.state.isOpen = false;
                this.game.isPaused = false;
            },
        });
    }

    handleClick() {
        this.state.isOpen ? this.tweenClose() : this.tweenOpen();
    }
}

window.onload = () => {
    const game = new Game();
};
