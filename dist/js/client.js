(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

///////////////////////////////////
// GLOBAL CONSTANTS
///////////////////////////////////

var BAD_GUYS = ['🌝', '🌚', '🤖', '👻', '👺', '👹'];

var EMOJI_SPEED = 1; // 1
var PROJECTILE_SPEED = 10; // 10
var PARTICLE_COUNT = 50; // 10
var GENERATOR_DELAY = 5; // in 100 ms
var PROJECTILE_EMOJI = '🔥';
var GUN_EMOJI = '🔫'; // 1
var GUN_POWER = 0.05; //
var MAX_SHOT_POWER = 5; // mousedown max power
var HI_RES = true; // allow retina
var DEATH = '💀';

///////////////////////////////////
// UTILITIES
///////////////////////////////////

function distance(x0, y0, x1, y1) {
    // returns the length of a line segment
    var x = x1 - x0;
    var y = y1 - y0;
    return Math.sqrt(x * x + y * y);
}

function doBoxesIntersect(a, b) {
    return Math.abs(a.position.x - b.position.x) * 2 < a.width + b.width && Math.abs(a.position.y - b.position.y) * 2 < a.height + b.height;
}

function getAngleDeg(x0, y0, x1, y1) {
    // degrees = atan2(deltaY, deltaX) * (180 / PI)
    var y = y1 - y0;
    var x = x1 - x0;
    return Math.atan2(y, x) * (180 / Math.PI);
}

function getAngleRadians(x0, y0, x1, y1) {
    // radians = atan2(deltaY, deltaX)
    var y = y1 - y0;
    var x = x1 - x0;
    return Math.atan2(y, x);
}

function movePointAtAngle(point, angle, distance) {
    return {
        x: point.x - Math.cos(angle) * distance,
        y: point.y - Math.sin(angle) * distance
    };
}

///////////////////////////////////
// Emoji
///////////////////////////////////

var Emoji = function () {
    function Emoji(x, y, size, emoji) {
        _classCallCheck(this, Emoji);

        this.emoji = emoji;
        this.position = {
            x: x,
            y: y
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

    _createClass(Emoji, [{
        key: 'draw',
        value: function draw() {
            this.ctx.clearRect(0, 0, this.size, this.size);
            this.ctx.textBaseline = 'top';
            this.ctx.font = this.size + 'px sans-serif';
            this.ctx.fillText(this.emoji, 0, 0);

            // test rect
            // this.ctx.fillStyle = 'rgba(255,0,0,0.5)';
            // this.ctx.fillRect(0, 0, this.size, this.size);
        }
    }]);

    return Emoji;
}();

///////////////////////////////////
// Enemy
///////////////////////////////////

var Enemy = function (_Emoji) {
    _inherits(Enemy, _Emoji);

    function Enemy() {
        var _Object$getPrototypeO;

        _classCallCheck(this, Enemy);

        for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
            params[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Enemy)).call.apply(_Object$getPrototypeO, [this].concat(params)));

        _this.multiplier = 1;
        _this.boom = '💥';
        return _this;
    }

    _createClass(Enemy, [{
        key: 'drawHit',
        value: function drawHit() {
            this.ctx.textBaseline = 'top';
            this.ctx.font = this.size + 'px sans-serif';
            this.ctx.clearRect(0, 0, this.size, this.size);
            this.ctx.fillText(this.boom, 0, 0);
        }
    }]);

    return Enemy;
}(Emoji);

///////////////////////////////////
// Particle
///////////////////////////////////

var Particle = function (_Emoji2) {
    _inherits(Particle, _Emoji2);

    function Particle() {
        var _Object$getPrototypeO2;

        _classCallCheck(this, Particle);

        for (var _len2 = arguments.length, params = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            params[_key2] = arguments[_key2];
        }

        var _this2 = _possibleConstructorReturn(this, (_Object$getPrototypeO2 = Object.getPrototypeOf(Particle)).call.apply(_Object$getPrototypeO2, [this].concat(params)));

        _this2.gravity = 0.25;
        _this2.velocity = {
            x: _.random(-10, 10),
            y: _.random(-10, 10)
        };
        return _this2;
    }

    _createClass(Particle, [{
        key: 'updatePosition',
        value: function updatePosition() {
            // apply gravity to the particle velocity
            this.velocity.y += this.gravity;

            var _position = this.position;
            var x = _position.x;
            var y = _position.y;
            var _velocity = this.velocity;
            var vx = _velocity.x;
            var vy = _velocity.y;

            this.position = {
                x: x + vx,
                y: y + vy
            };
        }
    }]);

    return Particle;
}(Emoji);

///////////////////////////////////
// Gun
///////////////////////////////////

var Gun = function (_Emoji3) {
    _inherits(Gun, _Emoji3);

    function Gun() {
        var _Object$getPrototypeO3;

        _classCallCheck(this, Gun);

        for (var _len3 = arguments.length, params = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            params[_key3] = arguments[_key3];
        }

        var _this3 = _possibleConstructorReturn(this, (_Object$getPrototypeO3 = Object.getPrototypeOf(Gun)).call.apply(_Object$getPrototypeO3, [this].concat(params)));

        _this3.health = 10;
        _this3.dead = false;
        _this3.setupHealthBar();
        return _this3;
    }

    _createClass(Gun, [{
        key: 'reset',
        value: function reset() {
            this.dead = false;
            this.health = 10;
            this.healthBarEl.style.width = '100%';
        }
    }, {
        key: 'setupHealthBar',
        value: function setupHealthBar() {
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
    }, {
        key: 'updateHealthBar',
        value: function updateHealthBar() {
            this.health--;

            if (this.health === 0) this.dead = true;

            var percent = this.health * 10 + '%';
            this.healthBarEl.style.width = percent;
        }
    }, {
        key: 'drawHit',
        value: function drawHit() {
            var _this4 = this;

            this.ctx.textBaseline = 'top';
            this.ctx.font = this.size + 'px sans-serif';
            this.ctx.clearRect(0, 0, this.size, this.size);
            this.ctx.fillText(this.emoji, 0, 0);

            var centerX = this.size / 2;
            var centerY = this.size / 2;
            var radius = this.size / 2;

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = 'rgba(255,0,0,0.2)';
            this.ctx.fill();

            // reset
            this.ctx.fillStyle = 'black';

            this.timeout = setTimeout(function () {
                _this4.draw();
            }, 200);
        }
    }]);

    return Gun;
}(Emoji);

///////////////////////////////////
// Score Keeper
///////////////////////////////////

var ScoreKeeper = function () {
    function ScoreKeeper(app) {
        _classCallCheck(this, ScoreKeeper);

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

    _createClass(ScoreKeeper, [{
        key: 'setStyle',
        value: function setStyle() {
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
                y: '-50%'
            });
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.score = 0;
            this.combo = 0;
            this.setScore();
            this.setCombo();
        }
    }, {
        key: 'setHitpoint',
        value: function setHitpoint(point) {
            this.hitpoint = point;
        }
    }, {
        key: 'comboCounter',
        value: function comboCounter() {
            var _this5 = this;

            this.combo++;
            clearTimeout(this.timeout);
            this.tweenCombo();

            this.timeout = setTimeout(function () {
                _this5.combo = 0;
                _this5.setCombo();
            }, 1000);
        }
    }, {
        key: 'increaseScore',
        value: function increaseScore(multiplier) {
            var points = 5;
            points *= multiplier;

            this.comboCounter();
            points = this.combo > 0 ? points * this.combo : points;

            this.score += points;

            this.setScore();
            this.setCombo();
            this.tweenScore();
        }
    }, {
        key: 'setScore',
        value: function setScore() {
            this.scoreEl.innerText = this.score;
            this.totalEl.innerText = this.score;
        }
    }, {
        key: 'setCombo',
        value: function setCombo() {
            this.comboEl.innerText = 'x' + this.combo;
        }
    }, {
        key: 'tweenCombo',
        value: function tweenCombo() {
            var fontSize = this.combo / 4 + 3;
            this.comboEl.style.fontSize = fontSize + 'em';

            var top = this.hitpoint.y / this.app.dpr;
            var left = this.hitpoint.x / this.app.dpr;
            this.comboEl.style.top = top + 'px';
            this.comboEl.style.left = left + 'px';

            TweenLite.fromTo(this.comboEl, 1, {
                opacity: 1,
                scale: 0.5
            }, {
                opacity: 0,
                scale: 1,
                ease: Power3.easeOut
            });
        }
    }, {
        key: 'tweenScore',
        value: function tweenScore() {
            var _this6 = this;

            var tweenOut = function tweenOut() {
                TweenLite.to(_this6.scoreEl, 0.6, {
                    opacity: 0,
                    scale: 1.5,
                    // color: 'purple',
                    ease: Power1.easeOut
                });
            };

            TweenLite.fromTo(this.scoreEl, 0.2, {
                opacity: 0,
                scale: 0.8
            }, {
                opacity: 1,
                scale: 1,
                ease: Power1.easeIn,
                onComplete: tweenOut
            });
        }
    }]);

    return ScoreKeeper;
}();

///////////////////////////////////
// Game
///////////////////////////////////

var Game = function () {
    function Game() {
        _classCallCheck(this, Game);

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
                y: window.innerHeight / 2 * this.dpr
            },
            hit: false
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

    _createClass(Game, [{
        key: 'setupRestart',
        value: function setupRestart() {
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
    }, {
        key: 'handleRestart',
        value: function handleRestart() {
            this.enemies = [];
            this.projectiles = [];
            this.particles = [];
            this.gameOverEmojis = [];

            this.scoreKeeper.reset();
            this.gun.reset();
            this.hideRestart();
            this.gameOver = false;
        }
    }, {
        key: 'hideRestart',
        value: function hideRestart() {
            TweenLite.fromTo(this.restartBtn, 0.3, {
                x: '-50%',
                y: '-50%',
                scale: 1
            }, {
                scale: 0,
                ease: Power2.easeOut,
                display: 'none'
            });
        }
    }, {
        key: 'showRestart',
        value: function showRestart() {
            TweenLite.fromTo(this.restartBtn, 0.3, {
                x: '-50%',
                y: '-50%',
                scale: 0,
                display: 'block'
            }, {
                scale: 1,
                ease: Power2.easeOut
            });
        }
    }, {
        key: 'setupGun',
        value: function setupGun() {
            // gun
            var gunSize = 75 * this.dpr;
            var x = window.innerWidth * this.dpr - gunSize;
            var y = window.innerHeight / 2 * this.dpr;
            this.gun = new Gun(x, y, gunSize, GUN_EMOJI);
        }
    }, {
        key: 'setupKeys',
        value: function setupKeys() {
            this.keys = {
                space: false,
                up: false,
                down: false
            };
        }
    }, {
        key: 'demo',
        value: function demo() {
            var _this7 = this;

            var _crosshairs$position = this.crosshairs.position;
            var x = _crosshairs$position.x;
            var y = _crosshairs$position.y;

            var i = 10;
            this.generator(0, y);

            var interval = setInterval(function () {

                _this7.shoot(x, y);
                i--;
                i > 0 ? i-- : clearInterval(interval);
            }, 300);
        }
    }, {
        key: 'setupListeners',
        value: function setupListeners() {
            window.addEventListener('resize', this.setCanvasSize);
            window.addEventListener('mousedown', this.handleMousedown);
            window.addEventListener('mouseup', this.handleClick);
            window.addEventListener('mousemove', this.handleMouse);
            window.addEventListener('keydown', this.handleKeydown);
            window.addEventListener('keyup', this.handleKeyup);
        }
    }, {
        key: 'handleKeydown',
        value: function handleKeydown(event) {
            // key event
            switch (event.keyCode) {
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
    }, {
        key: 'handleKeyup',
        value: function handleKeyup(event) {
            if (event.keyCode === 27) {
                this.isPaused = !this.isPaused;
            }

            // key events
            switch (event.keyCode) {
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
    }, {
        key: 'triggerKeyEvents',
        value: function triggerKeyEvents() {
            // triggers on each tick

            if (this.keys.space && this.tick % 5 === 0) {
                var _crosshairs$position2 = this.crosshairs.position;
                var x = _crosshairs$position2.x;
                var y = _crosshairs$position2.y;

                this.shoot(x, y);
            }

            if (this.keys.down && this.crosshairs.position.y > 0) {
                this.crosshairs.position.y -= 10 * this.dpr;
            }

            if (this.keys.up && this.crosshairs.position.y < this.canvas.height) {
                this.crosshairs.position.y += 10 * this.dpr;
            }

            if (this.keys.left && this.crosshairs.position.x > 0) {
                this.crosshairs.position.x -= 10 * this.dpr;
            }

            if (this.keys.right && this.crosshairs.position.x < this.canvas.width) {
                this.crosshairs.position.x += 10 * this.dpr;
            }
        }
    }, {
        key: 'handleMousedown',
        value: function handleMousedown(event) {
            this.mousedown = true;
            this.shotPower = 1;
            this.crosshairs.hit = false;
        }
    }, {
        key: 'handleMouse',
        value: function handleMouse(event) {
            var x = event.clientX * this.dpr;
            var y = event.clientY * this.dpr;
            this.crosshairs.position = {
                x: x,
                y: y
            };
        }
    }, {
        key: 'handleClick',
        value: function handleClick(event) {
            this.mousedown = false;

            var x = event.clientX * this.dpr;
            var y = event.clientY * this.dpr;
            this.shoot(x, y);
        }
    }, {
        key: 'drawCrosshairs',
        value: function drawCrosshairs() {
            // check if the crosshairs are over an emoji
            this.crosshairsHit();

            var _crosshairs$position3 = this.crosshairs.position;
            var x = _crosshairs$position3.x;
            var y = _crosshairs$position3.y;

            var size = this.crosshairs.hit ? 30 * this.dpr : 40 * this.dpr;
            var inner = this.crosshairs.hit ? 15 * this.dpr : 20 * this.dpr;

            // marked hit incorrectly when mousedown
            var color = this.crosshairs.hit ? 'violet' : 'white';
            var lineWidth = this.crosshairs.hit ? this.dpr * 4 : this.dpr * 2;

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

            var centerX = x;
            var centerY = y;
            var radius = this.shotPower * this.dpr * 5 + size;

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = 'transparent';
            this.ctx.fill();
            this.ctx.lineWidth = 2 * this.dpr;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, ' + (this.shotPower - 1) / MAX_SHOT_POWER + ')';
            // console.log(`${(this.shotPower - 1) / 100}`);

            this.ctx.stroke();
        }
    }, {
        key: 'setCanvasSize',
        value: function setCanvasSize() {
            this.canvas.width = window.innerWidth * this.dpr;
            this.canvas.height = window.innerHeight * this.dpr;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';

            // update gun position
            this.gun.position.x = window.innerWidth * this.dpr - this.gun.size;
        }
    }, {
        key: 'updateGun',
        value: function updateGun() {
            var _gun$position = this.gun.position;
            var x1 = _gun$position.x;
            var y1 = _gun$position.y;
            var _crosshairs$position4 = this.crosshairs.position;
            var x2 = _crosshairs$position4.x;
            var y2 = _crosshairs$position4.y;

            this.gun.rotation = getAngleDeg(x2, y2, x1, y1);

            // move along y axis
            var deltaY = y2 - y1;
            this.gun.position.y += deltaY * GUN_POWER;
        }
    }, {
        key: 'shoot',
        value: function shoot(x, y) {
            if (this.gun.dead) return;

            // size based on shot power
            var size = 25 * this.shotPower * this.dpr;

            // point clicked
            // adjusted for size
            x = x - size / 2;
            y = y - size / 2;

            // origin of projectile
            // adjusted for size
            var _gun$position2 = this.gun.position;
            var x1 = _gun$position2.x;
            var y1 = _gun$position2.y;

            x1 -= size / 2 * this.dpr;
            y1 -= size / 2 * this.dpr; // offset 22 to acount for gun barrel position

            var projectile = new Emoji(x1, y1, size, PROJECTILE_EMOJI);
            projectile.power = this.shotPower;

            // set the projectile angle
            projectile.angle = getAngleRadians(x, y, x1, y1);

            // store it
            this.projectiles.push(projectile);
        }
    }, {
        key: 'generator',
        value: function generator(x, y) {
            var enemies = BAD_GUYS;
            var i = _.random(0, enemies.length - 1);
            var size = _.random(50 * this.dpr, 100 * this.dpr);

            // for the demo in the beginning
            if (typeof x === 'undefined' || typeof y === 'undefined') {
                x = -size;
                y = _.random(0, this.canvas.height - size);
            }
            var enemy = new Enemy(x, y, size, enemies[i]);

            this.enemies.push(enemy);
        }
    }, {
        key: 'addGameOverEmojis',
        value: function addGameOverEmojis() {
            if (this.tick % 10 === 0) {
                var size = _.random(50 * this.dpr, 100 * this.dpr);
                var x = _.random(-size, this.canvas.width);
                var death = new Emoji(x, -size, size, DEATH);

                this.gameOverEmojis.push(death);
            }
        }
    }, {
        key: 'drawGameOver',
        value: function drawGameOver() {
            var _this8 = this;

            this.gameOverEmojis.forEach(function (g, i) {
                _this8.ctx.drawImage(g.ctx.canvas, g.position.x, g.position.y, g.size, g.size);
                g.position.y += 2 * _this8.dpr;
                if (g.position.y > _this8.canvas.height) _this8.gameOverEmojis.splice(i, 1);
            });
        }
    }, {
        key: 'drawBackground',
        value: function drawBackground() {
            var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            gradient.addColorStop(0, '#17BEB6');
            gradient.addColorStop(1, '#342f74');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }, {
        key: 'drawEnemies',
        value: function drawEnemies() {
            var _this9 = this;

            this.enemies.forEach(function (e, i) {
                if (e.hit) e.drawHit();

                _this9.ctx.drawImage(e.ctx.canvas, e.position.x, e.position.y, e.size, e.size);

                // update position, mark dead if off the canvas
                e.position.x += e.size * 0.05 * EMOJI_SPEED;
                if (e.position.x > _this9.canvas.width) {
                    e.dead = true;
                }
            });
        }
    }, {
        key: 'drawProjectiles',
        value: function drawProjectiles() {
            var _this10 = this;

            this.projectiles.forEach(function (p, i) {
                _this10.ctx.drawImage(p.ctx.canvas, p.position.x, p.position.y, p.size, p.size);
                _this10.projectileHitTest(p);

                // update with trajectory
                var nextPosition = movePointAtAngle(p.position, p.angle, PROJECTILE_SPEED * _this10.dpr);
                p.position = nextPosition;

                // mark dead if off canvas
                if (p.position.x < 0 - p.position.size || p.position.y < 0 - p.position.size || p.position.x > _this10.canvas.width || p.position.y > _this10.canvas.height) {
                    p.dead = true;
                }
            });
        }
    }, {
        key: 'drawParticles',
        value: function drawParticles() {
            var _this11 = this;

            this.particles.map(function (p) {
                _this11.ctx.drawImage(p.ctx.canvas, p.position.x, p.position.y, p.size, p.size);
                p.updatePosition();

                if (p.position.x < 0 || p.position.x > _this11.canvas.width || p.position.y < 0 || p.position.y > _this11.canvas.height) {
                    p.dead = true;
                }
            });
        }
    }, {
        key: 'drawGun',
        value: function drawGun() {
            var _gun = this.gun;
            var position = _gun.position;
            var size = _gun.size;
            var ctx = _gun.ctx;

            this.ctx.save();
            var offsetX = -10 * this.dpr;
            var offsetY = -15 * this.dpr;
            var tx = position.x + offsetX;
            var ty = position.y + offsetY;

            this.ctx.translate(tx, ty);

            this.ctx.rotate(this.gun.rotation * Math.PI / 180);
            this.ctx.drawImage(ctx.canvas, offsetX, offsetY, size, size);
            this.ctx.restore();
        }
    }, {
        key: 'removeDead',
        value: function removeDead() {
            var _this12 = this;

            // cleans up dead items
            this.enemies.forEach(function (e, i) {
                if (e.dead) _this12.enemies.splice(i, 1);
            });

            this.particles.map(function (p, i) {
                if (p.dead) {
                    _this12.particles.splice(i, 1);
                }
            });

            this.projectiles.forEach(function (p, i) {
                if (p.dead) _this12.projectiles.splice(i, 1);
            });
        }
    }, {
        key: 'gunHitTest',
        value: function gunHitTest() {
            var _this13 = this;

            this.enemies.forEach(function (enemy) {
                if (!_this13.gun.dead && !enemy.hit && doBoxesIntersect(_this13.gun, enemy)) {

                    // set enemy to hit and draw a big boom
                    enemy.hit = true;
                    enemy.draw();

                    // then mark enemy dead after a short timeout
                    setTimeout(function () {
                        enemy.dead = true;
                    }, 100);

                    _this13.gun.drawHit();
                    _this13.gun.updateHealthBar();
                }
            });
        }
    }, {
        key: 'projectileHitTest',
        value: function projectileHitTest(projectile) {
            var _this14 = this;

            var _loop = function _loop(i) {
                var enemy = _this14.enemies[i];

                // check projectil/enemy hits
                if (!enemy.hit && doBoxesIntersect(projectile, enemy)) {
                    // set enemy to hit and draw a big boom
                    enemy.hit = true;
                    enemy.draw();

                    // then mark enemy dead after a short timeout
                    setTimeout(function () {
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
                    _this14.explode(projectile.position.x, projectile.position.y);

                    // set hitpoint for where to display multiplier
                    // then add to score
                    _this14.scoreKeeper.setHitpoint({
                        x: projectile.position.x,
                        y: projectile.position.y
                    });
                    _this14.scoreKeeper.increaseScore(enemy.multiplier);
                }
            };

            for (var i = 0; i < this.enemies.length; i++) {
                _loop(i);
            }
        }
    }, {
        key: 'explode',
        value: function explode(x, y) {
            // needs starting x, y position
            var i = 0;
            while (i < PARTICLE_COUNT) {
                var size = _.random(10 * this.dpr, 20 * this.dpr); // remove power because it caused significant jank
                var particle = new Particle(x, y, size, '💥', this);
                this.particles.push(particle);
                i++;
            }
        }
    }, {
        key: 'crosshairsHit',
        value: function crosshairsHit() {
            var _crosshairs$position5 = this.crosshairs.position;
            var x = _crosshairs$position5.x;
            var y = _crosshairs$position5.y;

            for (var i = 0; i < this.enemies.length; i++) {
                var e = this.enemies[i];
                this.ctx.rect(e.position.x, e.position.y, e.width, e.height);

                if (this.ctx.isPointInPath(x, y)) {
                    this.crosshairs.hit = true;
                    return;
                }
                this.crosshairs.hit = false;
            }
        }
    }, {
        key: 'render',
        value: function render() {
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
    }]);

    return Game;
}();

var Info = function () {
    function Info(game) {
        _classCallCheck(this, Info);

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

    _createClass(Info, [{
        key: 'setInfo',
        value: function setInfo() {
            this.infoBox.innerHTML = '\n            <h1>🌚🔥🔥🔥🔥🔥🔥🔫</h1>\n            <p>\n                <strong>Aim</strong> with the mouse or arrow keys.\n            </p>\n            <p>\n                <strong>Fire</strong> by clicking or with the spacebar.\n            </p>\n            <p>\n                <strong>Powerup</strong> by clicking and holding the mouse down.\n            </p>\n            <p>\n                <strong>Esc</strong> to pause.\n            </p>\n            <p>\n                Hitting emojis hurts. <strong>Don\'t die</strong>.\n            </p>\n        ';
        }
    }, {
        key: 'setStyle',
        value: function setStyle() {
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
                y: '-100%'
            });
        }
    }, {
        key: 'tweenOpen',
        value: function tweenOpen() {
            var _this15 = this;

            TweenLite.to(this.infoBox, 0.4, {
                display: 'block',
                y: '-50%',
                opacity: 1,
                ease: Power2.easeOut,
                onComplete: function onComplete() {
                    _this15.state.isOpen = true;
                    _this15.game.isPaused = true;
                }
            });
        }
    }, {
        key: 'tweenClose',
        value: function tweenClose() {
            var _this16 = this;

            TweenLite.to(this.infoBox, 0.4, {
                display: 'none',
                y: '-100%',
                opacity: 0,
                ease: Power2.easeOut,
                onComplete: function onComplete() {
                    _this16.state.isOpen = false;
                    _this16.game.isPaused = false;
                }
            });
        }
    }, {
        key: 'handleClick',
        value: function handleClick() {
            this.state.isOpen ? this.tweenClose() : this.tweenOpen();
        }
    }]);

    return Info;
}();

window.onload = function () {
    var game = new Game();
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7QUNJQSxJQUFNLFFBQVEsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXRELElBQU0sV0FBVyxHQUFhLENBQUM7QUFBQyxBQUNoQyxJQUFNLGdCQUFnQixHQUFRLEVBQUU7QUFBQyxBQUNqQyxJQUFNLGNBQWMsR0FBVSxFQUFFO0FBQUMsQUFDakMsSUFBTSxlQUFlLEdBQVMsQ0FBQztBQUFDLEFBQ2hDLElBQU0sZ0JBQWdCLEdBQVEsSUFBSSxDQUFDO0FBQ25DLElBQU0sU0FBUyxHQUFlLElBQUk7QUFBQyxBQUNuQyxJQUFNLFNBQVMsR0FBZSxJQUFJO0FBQUMsQUFDbkMsSUFBTSxjQUFjLEdBQVUsQ0FBQztBQUFDLEFBQ2hDLElBQU0sTUFBTSxHQUFrQixJQUFJO0FBQUMsQUFDbkMsSUFBTSxLQUFLLEdBQW1CLElBQUk7Ozs7OztBQUFDLEFBTW5DLFNBQVMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTs7QUFFOUIsUUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNuQzs7QUFFRCxTQUFTLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDNUIsV0FBTyxBQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENB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V0FBVyxHQUFHLEtBQUssQ0FBQztBQUM3QixnQkFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQy9CLGdCQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3JCLGdCQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzdCLGdCQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNsQixnQkFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckMsZ0JBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0IsZ0JBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbEIsZ0JBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDN0IsZ0JBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ3JDLGdCQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2xCLGdCQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzdCLGdCQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7OztBQUFDLEFBR2xC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QUFJLEVBQUUsQ0FBQztDQUMzQixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBHTE9CQUwgQ09OU1RBTlRTIFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuY29uc3QgQkFEX0dVWVMgPSBbJ/CfjJ0nLCAn8J+MmicsICfwn6SWJywgJ/CfkbsnLCAn8J+RuicsICfwn5G5J107XG5cbmNvbnN0IEVNT0pJX1NQRUVEICAgICAgICAgICA9IDE7ICAgICAgICAgICAgICAgIC8vIDFcbmNvbnN0IFBST0pFQ1RJTEVfU1BFRUQgICAgICA9IDEwOyAgICAgICAgICAgICAgIC8vIDEwXG5jb25zdCBQQVJUSUNMRV9DT1VOVCAgICAgICAgPSA1MDsgICAgICAgICAgICAgICAvLyAxMFxuY29uc3QgR0VORVJBVE9SX0RFTEFZICAgICAgID0gNTsgICAgICAgICAgICAgICAgLy8gaW4gMTAwIG1zXG5jb25zdCBQUk9KRUNUSUxFX0VNT0pJICAgICAgPSAn8J+UpSc7XG5jb25zdCBHVU5fRU1PSkkgICAgICAgICAgICAgPSAn8J+Uqyc7ICAgICAgICAgICAgIC8vIDFcbmNvbnN0IEdVTl9QT1dFUiAgICAgICAgICAgICA9IDAuMDU7ICAgICAgICAgICAgIC8vIFxuY29uc3QgTUFYX1NIT1RfUE9XRVIgICAgICAgID0gNTsgICAgICAgICAgICAgICAgLy8gbW91c2Vkb3duIG1heCBwb3dlclxuY29uc3QgSElfUkVTICAgICAgICAgICAgICAgID0gdHJ1ZTsgICAgICAgICAgICAgLy8gYWxsb3cgcmV0aW5hXG5jb25zdCBERUFUSCAgICAgICAgICAgICAgICAgPSAn8J+SgCc7ICAgICAgICAgICAgIFxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVVRJTElUSUVTIFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZnVuY3Rpb24gZGlzdGFuY2UoeDAsIHkwLCB4MSwgeTEpIHtcbiAgICAvLyByZXR1cm5zIHRoZSBsZW5ndGggb2YgYSBsaW5lIHNlZ21lbnRcbiAgICBjb25zdCB4ID0geDEgLSB4MDtcbiAgICBjb25zdCB5ID0geTEgLSB5MDtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xufVxuXG5mdW5jdGlvbiBkb0JveGVzSW50ZXJzZWN0KGEsIGIpIHtcbiAgICByZXR1cm4gKE1hdGguYWJzKGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueCkgKiAyIDwgKGEud2lkdGggKyBiLndpZHRoKSkgJiZcbiAgICAgICAgICAgKE1hdGguYWJzKGEucG9zaXRpb24ueSAtIGIucG9zaXRpb24ueSkgKiAyIDwgKGEuaGVpZ2h0ICsgYi5oZWlnaHQpKTtcbn1cblxuZnVuY3Rpb24gZ2V0QW5nbGVEZWcoeDAsIHkwLCB4MSwgeTEpIHtcbiAgICAvLyBkZWdyZWVzID0gYXRhbjIoZGVsdGFZLCBkZWx0YVgpICogKDE4MCAvIFBJKVxuICAgIGNvbnN0IHkgPSB5MSAtIHkwO1xuICAgIGNvbnN0IHggPSB4MSAtIHgwO1xuICAgIHJldHVybiBNYXRoLmF0YW4yKHksIHgpICogKDE4MCAvIE1hdGguUEkpO1xufVxuXG5mdW5jdGlvbiBnZXRBbmdsZVJhZGlhbnMoeDAsIHkwLCB4MSwgeTEpIHtcbiAgICAvLyByYWRpYW5zID0gYXRhbjIoZGVsdGFZLCBkZWx0YVgpXG4gICAgY29uc3QgeSA9IHkxIC0geTA7XG4gICAgY29uc3QgeCA9IHgxIC0geDA7XG4gICAgcmV0dXJuIE1hdGguYXRhbjIoeSwgeCk7XG59XG5cbmZ1bmN0aW9uIG1vdmVQb2ludEF0QW5nbGUocG9pbnQsIGFuZ2xlLCBkaXN0YW5jZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHBvaW50LnggLSAoTWF0aC5jb3MoYW5nbGUpICogZGlzdGFuY2UpLFxuICAgICAgICB5OiBwb2ludC55IC0gKE1hdGguc2luKGFuZ2xlKSAqIGRpc3RhbmNlKSxcbiAgICB9O1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBFbW9qaSBcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmNsYXNzIEVtb2ppIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCBzaXplLCBlbW9qaSkge1xuICAgICAgICB0aGlzLmVtb2ppID0gZW1vamk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSB7XG4gICAgICAgICAgICB4LFxuICAgICAgICAgICAgeSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oaXQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWFkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIC8vIGFkZGVkIHdpZHRoL2hlaWdodCBmb3IgaGl0Y2hlY2tcbiAgICAgICAgdGhpcy53aWR0aCA9IHNpemU7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gc2l6ZTtcbiAgICAgICAgdGhpcy5jdHggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmN0eC5jYW52YXMud2lkdGggPSB0aGlzLnNpemU7XG4gICAgICAgIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgPSB0aGlzLnNpemU7XG4gICAgICAgIHRoaXMuZHJhdygpO1xuICAgIH1cbiAgICBcbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5zaXplLCB0aGlzLnNpemUpO1xuICAgICAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmU9ICd0b3AnO1xuICAgICAgICB0aGlzLmN0eC5mb250ID0gdGhpcy5zaXplICsgJ3B4IHNhbnMtc2VyaWYnO1xuICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCh0aGlzLmVtb2ppLCAwLCAwKTtcblxuICAgICAgICAvLyB0ZXN0IHJlY3RcbiAgICAgICAgLy8gdGhpcy5jdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDAsMCwwLjUpJztcbiAgICAgICAgLy8gdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5zaXplLCB0aGlzLnNpemUpO1xuICAgIH1cbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEVuZW15XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5jbGFzcyBFbmVteSBleHRlbmRzIEVtb2ppIHtcbiAgICBjb25zdHJ1Y3RvciguLi5wYXJhbXMpIHtcbiAgICAgICAgc3VwZXIoLi4ucGFyYW1zKTtcbiAgICAgICAgdGhpcy5tdWx0aXBsaWVyID0gMTtcbiAgICAgICAgdGhpcy5ib29tID0gJ/CfkqUnO1xuICAgIH1cblxuICAgIGRyYXdIaXQoKSB7XG4gICAgICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZT0gJ3RvcCc7XG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSB0aGlzLnNpemUgKyAncHggc2Fucy1zZXJpZic7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnNpemUsIHRoaXMuc2l6ZSk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KHRoaXMuYm9vbSwgMCwgMCk7XG4gICAgfVxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gUGFydGljbGVcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmNsYXNzIFBhcnRpY2xlIGV4dGVuZHMgRW1vamkge1xuICAgIGNvbnN0cnVjdG9yKC4uLnBhcmFtcykge1xuICAgICAgICBzdXBlciguLi5wYXJhbXMpO1xuICAgICAgICB0aGlzLmdyYXZpdHkgPSAwLjI1O1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0ge1xuICAgICAgICAgICAgeDogXy5yYW5kb20oLTEwLCAxMCksXG4gICAgICAgICAgICB5OiBfLnJhbmRvbSgtMTAsIDEwKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB1cGRhdGVQb3NpdGlvbigpIHtcbiAgICAgICAgLy8gYXBwbHkgZ3Jhdml0eSB0byB0aGUgcGFydGljbGUgdmVsb2NpdHlcbiAgICAgICAgdGhpcy52ZWxvY2l0eS55ICs9IHRoaXMuZ3Jhdml0eTtcblxuICAgICAgICBjb25zdCB7IHgsIHkgfSA9IHRoaXMucG9zaXRpb247XG4gICAgICAgIGNvbnN0IHsgeDogdngsIHk6IHZ5IH0gPSB0aGlzLnZlbG9jaXR5O1xuXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSB7XG4gICAgICAgICAgICB4OiB4ICsgdngsXG4gICAgICAgICAgICB5OiB5ICsgdnksXG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gR3VuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5jbGFzcyBHdW4gZXh0ZW5kcyBFbW9qaSB7XG4gICAgY29uc3RydWN0b3IoLi4ucGFyYW1zKSB7XG4gICAgICAgIHN1cGVyKC4uLnBhcmFtcyk7XG4gICAgICAgIHRoaXMuaGVhbHRoID0gMTA7XG4gICAgICAgIHRoaXMuZGVhZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldHVwSGVhbHRoQmFyKCk7XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuZGVhZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmhlYWx0aCA9IDEwO1xuICAgICAgICB0aGlzLmhlYWx0aEJhckVsLnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgIH1cblxuICAgIHNldHVwSGVhbHRoQmFyKCkge1xuICAgICAgICB0aGlzLmhlYWx0aEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5oZWFsdGhFbCk7XG5cbiAgICAgICAgdGhpcy5oZWFsdGhCYXJFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLmhlYWx0aEVsLmFwcGVuZENoaWxkKHRoaXMuaGVhbHRoQmFyRWwpO1xuXG4gICAgICAgIHRoaXMuaGVhbHRoRWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICB0aGlzLmhlYWx0aEVsLnN0eWxlLmJvcmRlciA9ICcycHggc29saWQgd2hpdGUnO1xuICAgICAgICB0aGlzLmhlYWx0aEVsLnN0eWxlLmJvcmRlclJhZGl1cyA9ICcwLjRlbSc7XG4gICAgICAgIHRoaXMuaGVhbHRoRWwuc3R5bGUuYm90dG9tID0gJzFlbSc7XG4gICAgICAgIHRoaXMuaGVhbHRoRWwuc3R5bGUud2lkdGggPSAnMTBlbSc7XG4gICAgICAgIHRoaXMuaGVhbHRoRWwuc3R5bGUuaGVpZ2h0ID0gJzAuNGVtJztcbiAgICAgICAgdGhpcy5oZWFsdGhFbC5zdHlsZS5tYXJnaW5MZWZ0ID0gJy01ZW0nO1xuICAgICAgICB0aGlzLmhlYWx0aEVsLnN0eWxlLmxlZnQgPSAnNTAlJztcblxuICAgICAgICB0aGlzLmhlYWx0aEJhckVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgdGhpcy5oZWFsdGhCYXJFbC5zdHlsZS50b3AgPSAnMCc7XG4gICAgICAgIHRoaXMuaGVhbHRoQmFyRWwuc3R5bGUubGVmdCA9ICcwJztcbiAgICAgICAgdGhpcy5oZWFsdGhCYXJFbC5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICAgICAgdGhpcy5oZWFsdGhCYXJFbC5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG4gICAgICAgIHRoaXMuaGVhbHRoQmFyRWwuc3R5bGUuYmFja2dyb3VuZCA9ICd3aGl0ZSc7XG4gICAgfVxuXG4gICAgdXBkYXRlSGVhbHRoQmFyKCkge1xuICAgICAgICB0aGlzLmhlYWx0aC0tO1xuXG4gICAgICAgIGlmICh0aGlzLmhlYWx0aCA9PT0gMCkgdGhpcy5kZWFkID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBwZXJjZW50ID0gdGhpcy5oZWFsdGggKiAxMCArICclJztcbiAgICAgICAgdGhpcy5oZWFsdGhCYXJFbC5zdHlsZS53aWR0aCA9IHBlcmNlbnQ7XG4gICAgfVxuXG4gICAgZHJhd0hpdCgpIHtcbiAgICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lPSAndG9wJztcbiAgICAgICAgdGhpcy5jdHguZm9udCA9IHRoaXMuc2l6ZSArICdweCBzYW5zLXNlcmlmJztcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuc2l6ZSwgdGhpcy5zaXplKTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFRleHQodGhpcy5lbW9qaSwgMCwgMCk7XG5cbiAgICAgICAgY29uc3QgY2VudGVyWCA9IHRoaXMuc2l6ZSAvIDI7XG4gICAgICAgIGNvbnN0IGNlbnRlclkgPSB0aGlzLnNpemUgLyAyO1xuICAgICAgICBjb25zdCByYWRpdXMgPSB0aGlzLnNpemUgLyAyO1xuXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5hcmMoY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsMCwwLDAuMiknO1xuICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG5cbiAgICAgICAgLy8gcmVzZXRcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcblxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZHJhdygpO1xuICAgICAgICB9LCAyMDApO1xuICAgIH1cbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFNjb3JlIEtlZXBlclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuY2xhc3MgU2NvcmVLZWVwZXIge1xuICAgIGNvbnN0cnVjdG9yKGFwcCkge1xuICAgICAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgICAgIHRoaXMuY29tYm8gPSAwO1xuICAgICAgICAvLyBjcmVhdGUgZWxlbWVudFxuICAgICAgICB0aGlzLnNjb3JlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGhpcy5jb21ib0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMudG90YWxFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuc2NvcmVFbCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jb21ib0VsKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnRvdGFsRWwpO1xuICAgICAgICB0aGlzLnNldFN0eWxlKCk7XG4gICAgfVxuXG4gICAgc2V0U3R5bGUoKSB7XG4gICAgICAgIHRoaXMuc2NvcmVFbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHRoaXMuc2NvcmVFbC5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIHRoaXMuc2NvcmVFbC5zdHlsZS5mb250U2l6ZSA9ICcxNXZ3JztcbiAgICAgICAgdGhpcy5zY29yZUVsLnN0eWxlLnRvcCA9ICc1MCUnO1xuICAgICAgICB0aGlzLnNjb3JlRWwuc3R5bGUubGVmdCA9ICc1MCUnO1xuXG4gICAgICAgIHRoaXMuY29tYm9FbC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHRoaXMuY29tYm9FbC5zdHlsZS5jb2xvciA9ICcjMzQyZjc0JztcbiAgICAgICAgdGhpcy5jb21ib0VsLnN0eWxlLmZvbnRTaXplID0gJzAnOyAvLyBzaXplIGlzIHNldCBpbiB0d2VlbiwgaW5jcmVhc2VkIHdpdGggZWFjaCBjb21ibyBcbiAgICAgICAgdGhpcy5jb21ib0VsLnN0eWxlLmZvbnRXZWlnaHQgPSAnNzAwJztcblxuICAgICAgICB0aGlzLnRvdGFsRWwuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICB0aGlzLnRvdGFsRWwuc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICB0aGlzLnRvdGFsRWwuc3R5bGUuZm9udFNpemUgPSAnMS41ZW0nO1xuICAgICAgICB0aGlzLnRvdGFsRWwuc3R5bGUuZm9udFdlaWdodCA9ICc1MDAnO1xuICAgICAgICB0aGlzLnRvdGFsRWwuc3R5bGUudGV4dEFsaWduID0gJ3JpZ2h0JztcbiAgICAgICAgdGhpcy50b3RhbEVsLnN0eWxlLnRvcCA9ICcxZW0nO1xuICAgICAgICB0aGlzLnRvdGFsRWwuc3R5bGUucmlnaHQgPSAnMWVtJztcblxuICAgICAgICAvLyBzZXQgdHJhbnNmb3JtIHZhbHVlcyBpbiBUd2VlbmxpdGUgc28gXG4gICAgICAgIC8vIHRoZXkgYXJlIG5vdCBvdmVyd3JpdHRlbiBkdXJpbmcgdHdlZW5zXG4gICAgICAgIFR3ZWVuTGl0ZS5zZXQodGhpcy5zY29yZUVsLCB7XG4gICAgICAgICAgICB4OiAnLTUwJScsXG4gICAgICAgICAgICB5OiAnLTUwJScsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnNjb3JlID0gMDtcbiAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgIHRoaXMuc2V0U2NvcmUoKTtcbiAgICAgICAgdGhpcy5zZXRDb21ibygpO1xuICAgIH1cblxuICAgIHNldEhpdHBvaW50KHBvaW50KSB7XG4gICAgICAgIHRoaXMuaGl0cG9pbnQgPSBwb2ludDtcbiAgICB9XG5cbiAgICBjb21ib0NvdW50ZXIoKSB7XG4gICAgICAgIHRoaXMuY29tYm8rKztcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgIHRoaXMudHdlZW5Db21ibygpO1xuXG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb21ibyA9IDA7XG4gICAgICAgICAgICB0aGlzLnNldENvbWJvKCk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgIH1cblxuICAgIGluY3JlYXNlU2NvcmUobXVsdGlwbGllcikge1xuICAgICAgICBsZXQgcG9pbnRzID0gNTtcbiAgICAgICAgcG9pbnRzICo9IG11bHRpcGxpZXI7XG5cbiAgICAgICAgdGhpcy5jb21ib0NvdW50ZXIoKTtcbiAgICAgICAgcG9pbnRzID0gdGhpcy5jb21ibyA+IDAgPyBwb2ludHMgKiB0aGlzLmNvbWJvIDogcG9pbnRzO1xuXG4gICAgICAgIHRoaXMuc2NvcmUgKz0gcG9pbnRzXG5cbiAgICAgICAgdGhpcy5zZXRTY29yZSgpO1xuICAgICAgICB0aGlzLnNldENvbWJvKCk7XG4gICAgICAgIHRoaXMudHdlZW5TY29yZSgpO1xuICAgIH1cblxuICAgIHNldFNjb3JlKCkge1xuICAgICAgICB0aGlzLnNjb3JlRWwuaW5uZXJUZXh0ID0gdGhpcy5zY29yZTtcbiAgICAgICAgdGhpcy50b3RhbEVsLmlubmVyVGV4dCA9IHRoaXMuc2NvcmU7XG4gICAgfVxuXG4gICAgc2V0Q29tYm8oKSB7XG4gICAgICAgIHRoaXMuY29tYm9FbC5pbm5lclRleHQgPSBgeCR7dGhpcy5jb21ib31gO1xuICAgIH1cblxuICAgIHR3ZWVuQ29tYm8oKSB7XG4gICAgICAgIGNvbnN0IGZvbnRTaXplID0gdGhpcy5jb21ibyAvIDQgKyAzO1xuICAgICAgICB0aGlzLmNvbWJvRWwuc3R5bGUuZm9udFNpemUgPSBgJHtmb250U2l6ZX1lbWA7XG5cbiAgICAgICAgY29uc3QgdG9wID0gdGhpcy5oaXRwb2ludC55IC8gdGhpcy5hcHAuZHByO1xuICAgICAgICBjb25zdCBsZWZ0ID0gdGhpcy5oaXRwb2ludC54IC8gdGhpcy5hcHAuZHByO1xuICAgICAgICB0aGlzLmNvbWJvRWwuc3R5bGUudG9wID0gYCR7dG9wfXB4YDtcbiAgICAgICAgdGhpcy5jb21ib0VsLnN0eWxlLmxlZnQgPSBgJHtsZWZ0fXB4YDtcblxuICAgICAgICBUd2VlbkxpdGUuZnJvbVRvKHRoaXMuY29tYm9FbCwgMSwge1xuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIHNjYWxlOiAwLjUsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgICAgIGVhc2U6IFBvd2VyMy5lYXNlT3V0LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0d2VlblNjb3JlKCkge1xuICAgICAgICBjb25zdCB0d2Vlbk91dCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBUd2VlbkxpdGUudG8odGhpcy5zY29yZUVsLCAwLjYsIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgIHNjYWxlOiAxLjUsXG4gICAgICAgICAgICAgICAgLy8gY29sb3I6ICdwdXJwbGUnLFxuICAgICAgICAgICAgICAgIGVhc2U6IFBvd2VyMS5lYXNlT3V0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBUd2VlbkxpdGUuZnJvbVRvKHRoaXMuc2NvcmVFbCwgMC4yLCB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgc2NhbGU6IDAuOCxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIxLmVhc2VJbixcbiAgICAgICAgICAgIG9uQ29tcGxldGU6IHR3ZWVuT3V0XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEdhbWUgXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5jbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gc2V0dXAgYSBjYW52YXNcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuZHByID0gSElfUkVTID8gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSA6IDE7XG4gICAgICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5jdHguc2NhbGUodGhpcy5kcHIsIHRoaXMuZHByKTtcblxuICAgICAgICAvLyBnYW1lIHN0YXRlXG4gICAgICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5nYW1lT3ZlciA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgLy8gYXJyYXlzXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdO1xuICAgICAgICB0aGlzLnByb2plY3RpbGVzID0gW107XG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XG4gICAgICAgIHRoaXMuZ2FtZU92ZXJFbW9qaXMgPSBbXTtcblxuICAgICAgICAvLyBjcm9zc2hhaXJzXG4gICAgICAgIHRoaXMuY3Jvc3NoYWlycyA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgeDogMTAwLCBcbiAgICAgICAgICAgICAgICB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyICogdGhpcy5kcHIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGl0OiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNob3RQb3dlciA9IDE7IC8vIHN0b3JlIHRoZSBpbiBwcm9qZWN0aWxlc1xuICAgICAgICB0aGlzLm1vdXNlZG93biA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgLy8gbWV0aG9kIGJpbmRpbmdcbiAgICAgICAgdGhpcy5oYW5kbGVNb3VzZWRvd24gPSB0aGlzLmhhbmRsZU1vdXNlZG93bi5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZUtleWRvd24gPSB0aGlzLmhhbmRsZUtleWRvd24uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zZXRDYW52YXNTaXplID0gdGhpcy5zZXRDYW52YXNTaXplLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaGFuZGxlUmVzdGFydCA9IHRoaXMuaGFuZGxlUmVzdGFydC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZUNsaWNrID0gdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZU1vdXNlID0gdGhpcy5oYW5kbGVNb3VzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZUtleXVwID0gdGhpcy5oYW5kbGVLZXl1cC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2hvb3QgPSB0aGlzLnNob290LmJpbmQodGhpcyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNldHVwR3VuKCk7XG4gICAgICAgIHRoaXMuc2V0dXBLZXlzKCk7XG4gICAgICAgIHRoaXMuc2V0Q2FudmFzU2l6ZSgpO1xuICAgICAgICB0aGlzLnNldHVwTGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuc2V0dXBSZXN0YXJ0KCk7XG4gICAgICAgIFxuICAgICAgICAvLyByZW5kZXIgYW5kIHRpY2tcbiAgICAgICAgdGhpcy50aWNrID0gMDtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlbW8gc2hpdFxuICAgICAgICB0aGlzLmRlbW8oKTtcblxuICAgICAgICAvLyBpbmZvIC8gc2NvcmVcbiAgICAgICAgdGhpcy5pbmZvID0gbmV3IEluZm8odGhpcyk7XG4gICAgICAgIHRoaXMuc2NvcmVLZWVwZXIgPSBuZXcgU2NvcmVLZWVwZXIodGhpcyk7XG4gICAgfVxuXG4gICAgc2V0dXBSZXN0YXJ0KCkge1xuICAgICAgICB0aGlzLnJlc3RhcnRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnJlc3RhcnRCdG4pO1xuXG4gICAgICAgIHRoaXMucmVzdGFydEJ0bi5zdHlsZS5ib3JkZXIgPSAnbm9uZSc7XG4gICAgICAgIHRoaXMucmVzdGFydEJ0bi5zdHlsZS5vdXRsaW5lID0gJ25vbmUnO1xuICAgICAgICB0aGlzLnJlc3RhcnRCdG4uc3R5bGUuYmFja2dyb3VuZCA9ICd3aGl0ZSc7XG4gICAgICAgIHRoaXMucmVzdGFydEJ0bi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB0aGlzLnJlc3RhcnRCdG4uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICB0aGlzLnJlc3RhcnRCdG4uc3R5bGUudG9wID0gJzUwJSc7XG4gICAgICAgIHRoaXMucmVzdGFydEJ0bi5zdHlsZS5sZWZ0ID0gJzUwJSc7XG4gICAgICAgIHRoaXMucmVzdGFydEJ0bi5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoLTUwJSwgLTUwJSwgMCknO1xuICAgICAgICB0aGlzLnJlc3RhcnRCdG4uc3R5bGUucGFkZGluZyA9ICcxZW0gMmVtJztcbiAgICAgICAgdGhpcy5yZXN0YXJ0QnRuLnN0eWxlLmZvbnRXZWlnaHQgPSAnNTAwJztcbiAgICAgICAgdGhpcy5yZXN0YXJ0QnRuLnN0eWxlLnpJbmRleCA9ICcxMDAnO1xuICAgICAgICB0aGlzLnJlc3RhcnRCdG4uaW5uZXJUZXh0ID0gJ1JFU1RBUlQnO1xuXG4gICAgICAgIHRoaXMucmVzdGFydEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGFuZGxlUmVzdGFydCk7XG4gICAgfVxuXG4gICAgaGFuZGxlUmVzdGFydCgpIHtcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gW107XG4gICAgICAgIHRoaXMucHJvamVjdGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5nYW1lT3ZlckVtb2ppcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuc2NvcmVLZWVwZXIucmVzZXQoKTtcbiAgICAgICAgdGhpcy5ndW4ucmVzZXQoKTtcbiAgICAgICAgdGhpcy5oaWRlUmVzdGFydCgpO1xuICAgICAgICB0aGlzLmdhbWVPdmVyID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaGlkZVJlc3RhcnQoKSB7XG4gICAgICAgIFR3ZWVuTGl0ZS5mcm9tVG8odGhpcy5yZXN0YXJ0QnRuLCAwLjMsIHtcbiAgICAgICAgICAgIHg6ICctNTAlJyxcbiAgICAgICAgICAgIHk6ICctNTAlJyxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzY2FsZTogMCxcbiAgICAgICAgICAgIGVhc2U6IFBvd2VyMi5lYXNlT3V0LFxuICAgICAgICAgICAgZGlzcGxheTogJ25vbmUnLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzaG93UmVzdGFydCgpIHtcbiAgICAgICAgVHdlZW5MaXRlLmZyb21Ubyh0aGlzLnJlc3RhcnRCdG4sIDAuMywge1xuICAgICAgICAgICAgeDogJy01MCUnLFxuICAgICAgICAgICAgeTogJy01MCUnLFxuICAgICAgICAgICAgc2NhbGU6IDAsXG4gICAgICAgICAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgICAgIGVhc2U6IFBvd2VyMi5lYXNlT3V0LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXR1cEd1bigpIHtcbiAgICAgICAgLy8gZ3VuXG4gICAgICAgIGNvbnN0IGd1blNpemUgPSA3NSAqIHRoaXMuZHByO1xuICAgICAgICBjb25zdCB4ID0gd2luZG93LmlubmVyV2lkdGggKiB0aGlzLmRwciAtIGd1blNpemU7XG4gICAgICAgIGNvbnN0IHkgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyICogdGhpcy5kcHI7XG4gICAgICAgIHRoaXMuZ3VuID0gbmV3IEd1bih4LCB5LCBndW5TaXplLCBHVU5fRU1PSkkpO1xuICAgIH1cblxuICAgIHNldHVwS2V5cygpIHtcbiAgICAgICAgdGhpcy5rZXlzID0ge1xuICAgICAgICAgICAgc3BhY2U6IGZhbHNlLFxuICAgICAgICAgICAgdXA6IGZhbHNlLFxuICAgICAgICAgICAgZG93bjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIGRlbW8oKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSB9ID0gdGhpcy5jcm9zc2hhaXJzLnBvc2l0aW9uO1xuICAgICAgICBsZXQgaSA9IDEwO1xuICAgICAgICB0aGlzLmdlbmVyYXRvcigwLCB5KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnNob290KHgsIHkpO1xuICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgaSA+IDAgPyBpLS0gOiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgfSwgMzAwKTtcbiAgICB9XG4gICAgXG4gICAgc2V0dXBMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnNldENhbnZhc1NpemUpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZWRvd24pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuaGFuZGxlQ2xpY2spO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5oYW5kbGVNb3VzZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlkb3duKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5oYW5kbGVLZXl1cCk7XG4gICAgfVxuXG5cbiAgICBoYW5kbGVLZXlkb3duKGV2ZW50KSB7XG4gICAgICAgIC8vIGtleSBldmVudFxuICAgICAgICBzd2l0Y2goZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMuc3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMudXAgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMuZG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUtleXVwKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAyNykge1xuICAgICAgICAgICAgdGhpcy5pc1BhdXNlZCA9ICF0aGlzLmlzUGF1c2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8ga2V5IGV2ZW50c1xuICAgICAgICBzd2l0Y2goZXZlbnQua2V5Q29kZSkge1xuICAgICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMuc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLnVwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5yaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMuZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMubGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJpZ2dlcktleUV2ZW50cygpIHtcbiAgICAgICAgLy8gdHJpZ2dlcnMgb24gZWFjaCB0aWNrXG5cbiAgICAgICAgaWYgKHRoaXMua2V5cy5zcGFjZSAmJlxuICAgICAgICAgICAgdGhpcy50aWNrICUgNSA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3QgeyB4LCB5IH0gPSB0aGlzLmNyb3NzaGFpcnMucG9zaXRpb247XG4gICAgICAgICAgICB0aGlzLnNob290KHgsIHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMua2V5cy5kb3duICYmIFxuICAgICAgICAgICAgdGhpcy5jcm9zc2hhaXJzLnBvc2l0aW9uLnkgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3NzaGFpcnMucG9zaXRpb24ueSAtPSAxMCAqIHRoaXMuZHByO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMua2V5cy51cCAmJlxuICAgICAgICAgICAgdGhpcy5jcm9zc2hhaXJzLnBvc2l0aW9uLnkgPCB0aGlzLmNhbnZhcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY3Jvc3NoYWlycy5wb3NpdGlvbi55ICs9IDEwICogdGhpcy5kcHI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5rZXlzLmxlZnQgJiZcbiAgICAgICAgICAgIHRoaXMuY3Jvc3NoYWlycy5wb3NpdGlvbi54ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5jcm9zc2hhaXJzLnBvc2l0aW9uLnggLT0gMTAgKiB0aGlzLmRwcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmtleXMucmlnaHQgJiZcbiAgICAgICAgICAgIHRoaXMuY3Jvc3NoYWlycy5wb3NpdGlvbi54IDwgdGhpcy5jYW52YXMud2lkdGgpIHtcbiAgICAgICAgICAgIHRoaXMuY3Jvc3NoYWlycy5wb3NpdGlvbi54ICs9IDEwICogdGhpcy5kcHI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZWRvd24oZXZlbnQpIHtcbiAgICAgICAgdGhpcy5tb3VzZWRvd24gPSB0cnVlO1xuICAgICAgICB0aGlzLnNob3RQb3dlciA9IDE7XG4gICAgICAgIHRoaXMuY3Jvc3NoYWlycy5oaXQgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgaGFuZGxlTW91c2UoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgeCA9IGV2ZW50LmNsaWVudFggKiB0aGlzLmRwcjtcbiAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFkgKiB0aGlzLmRwcjtcbiAgICAgICAgdGhpcy5jcm9zc2hhaXJzLnBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeCxcbiAgICAgICAgICAgIHksXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIGhhbmRsZUNsaWNrKGV2ZW50KSB7XG4gICAgICAgIHRoaXMubW91c2Vkb3duID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgeCA9IGV2ZW50LmNsaWVudFggKiB0aGlzLmRwcjtcbiAgICAgICAgY29uc3QgeSA9IGV2ZW50LmNsaWVudFkgKiB0aGlzLmRwcjtcbiAgICAgICAgdGhpcy5zaG9vdCh4LCB5KTtcbiAgICB9XG4gICAgXG4gICAgZHJhd0Nyb3NzaGFpcnMoKSB7XG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSBjcm9zc2hhaXJzIGFyZSBvdmVyIGFuIGVtb2ppXG4gICAgICAgIHRoaXMuY3Jvc3NoYWlyc0hpdCgpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgeyB4LCB5IH0gPSB0aGlzLmNyb3NzaGFpcnMucG9zaXRpb247XG4gICAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmNyb3NzaGFpcnMuaGl0ID8gMzAgKiB0aGlzLmRwciA6IDQwICogdGhpcy5kcHI7XG4gICAgICAgIGNvbnN0IGlubmVyID0gdGhpcy5jcm9zc2hhaXJzLmhpdCA/IDE1ICogdGhpcy5kcHIgOiAyMCAqIHRoaXMuZHByO1xuXG4gICAgICAgIC8vIG1hcmtlZCBoaXQgaW5jb3JyZWN0bHkgd2hlbiBtb3VzZWRvd25cbiAgICAgICAgY29uc3QgY29sb3IgPSB0aGlzLmNyb3NzaGFpcnMuaGl0ID8gJ3Zpb2xldCcgOiAnd2hpdGUnO1xuICAgICAgICBjb25zdCBsaW5lV2lkdGggPSB0aGlzLmNyb3NzaGFpcnMuaGl0ID8gdGhpcy5kcHIgKiA0IDogdGhpcy5kcHIgKiAyO1xuICAgICAgICBcbiAgICAgICAgLy8gZHJhdyBsaW5lc1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oeCAtIHNpemUsIHkpO1xuICAgICAgICB0aGlzLmN0eC5saW5lVG8oeCAtIHNpemUgKyBpbm5lciwgeSk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oeCArIHNpemUgLSBpbm5lciwgeSk7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyh4ICsgc2l6ZSwgeSk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oeCwgeSAtIHNpemUpO1xuICAgICAgICB0aGlzLmN0eC5saW5lVG8oeCwgeSAtIHNpemUgKyBpbm5lcik7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oeCwgeSArIHNpemUpO1xuICAgICAgICB0aGlzLmN0eC5saW5lVG8oeCwgeSArIHNpemUgLSBpbm5lcik7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuXG4gICAgICAgIC8vIGRvbnQgZHJhdyBwb3dlciBpZiBtb3VzZSBpcyBub3QgZG93blxuICAgICAgICBpZiAoIXRoaXMubW91c2Vkb3duKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY2VudGVyWCA9IHg7XG4gICAgICAgIGNvbnN0IGNlbnRlclkgPSB5O1xuICAgICAgICBjb25zdCByYWRpdXMgPSB0aGlzLnNob3RQb3dlciAqIHRoaXMuZHByICogNSArIHNpemU7XG5cbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuY3R4LmFyYyhjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICd0cmFuc3BhcmVudCc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gMiAqIHRoaXMuZHByO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGByZ2JhKDI1NSwgMjU1LCAyNTUsICR7KHRoaXMuc2hvdFBvd2VyIC0gMSkgLyBNQVhfU0hPVF9QT1dFUn0pYDtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYCR7KHRoaXMuc2hvdFBvd2VyIC0gMSkgLyAxMDB9YCk7XG5cbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfVxuXG4gICAgc2V0Q2FudmFzU2l6ZSgpIHtcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAqIHRoaXMuZHByO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKiB0aGlzLmRwcjtcbiAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG4gICAgICAgIFxuICAgICAgICAvLyB1cGRhdGUgZ3VuIHBvc2l0aW9uXG4gICAgICAgIHRoaXMuZ3VuLnBvc2l0aW9uLnggPSB3aW5kb3cuaW5uZXJXaWR0aCAqIHRoaXMuZHByIC0gdGhpcy5ndW4uc2l6ZTtcbiAgICB9XG4gICAgXG4gICAgdXBkYXRlR3VuKCkge1xuICAgICAgICBjb25zdCB7IHg6IHgxLCB5OiB5MSB9ID0gdGhpcy5ndW4ucG9zaXRpb247XG4gICAgICAgIGNvbnN0IHsgeDogeDIsIHk6IHkyIH0gPSB0aGlzLmNyb3NzaGFpcnMucG9zaXRpb247XG4gICAgICAgIHRoaXMuZ3VuLnJvdGF0aW9uID0gZ2V0QW5nbGVEZWcoeDIsIHkyLCB4MSwgeTEpO1xuXG4gICAgICAgIC8vIG1vdmUgYWxvbmcgeSBheGlzXG4gICAgICAgIGNvbnN0IGRlbHRhWSA9IHkyIC0geTE7XG4gICAgICAgIHRoaXMuZ3VuLnBvc2l0aW9uLnkgKz0gZGVsdGFZICogR1VOX1BPV0VSO1xuICAgIH1cbiAgICBcbiAgICBzaG9vdCh4LCB5KSB7XG4gICAgICAgIGlmICh0aGlzLmd1bi5kZWFkKSByZXR1cm47XG5cbiAgICAgICAgLy8gc2l6ZSBiYXNlZCBvbiBzaG90IHBvd2VyXG4gICAgICAgIGNvbnN0IHNpemUgPSAyNSAqIHRoaXMuc2hvdFBvd2VyICogdGhpcy5kcHI7XG5cbiAgICAgICAgLy8gcG9pbnQgY2xpY2tlZFxuICAgICAgICAvLyBhZGp1c3RlZCBmb3Igc2l6ZVxuICAgICAgICB4ID0geCAtIHNpemUgLyAyO1xuICAgICAgICB5ID0geSAtIHNpemUgLyAyO1xuICAgICAgICBcbiAgICAgICAgLy8gb3JpZ2luIG9mIHByb2plY3RpbGVcbiAgICAgICAgLy8gYWRqdXN0ZWQgZm9yIHNpemVcbiAgICAgICAgbGV0IHsgeDogeDEsIHk6IHkxIH0gPSB0aGlzLmd1bi5wb3NpdGlvbjtcbiAgICAgICAgeDEgLT0gc2l6ZSAvIDIgKiB0aGlzLmRwcjtcbiAgICAgICAgeTEgLT0gc2l6ZSAvIDIgKiB0aGlzLmRwcjsgLy8gb2Zmc2V0IDIyIHRvIGFjb3VudCBmb3IgZ3VuIGJhcnJlbCBwb3NpdGlvblxuICAgICAgICBcbiAgICAgICAgY29uc3QgcHJvamVjdGlsZSA9IG5ldyBFbW9qaSh4MSwgeTEsIHNpemUsIFBST0pFQ1RJTEVfRU1PSkkpO1xuICAgICAgICBwcm9qZWN0aWxlLnBvd2VyID0gdGhpcy5zaG90UG93ZXI7XG5cbiAgICAgICAgLy8gc2V0IHRoZSBwcm9qZWN0aWxlIGFuZ2xlXG4gICAgICAgIHByb2plY3RpbGUuYW5nbGUgPSBnZXRBbmdsZVJhZGlhbnMoeCwgeSwgeDEsIHkxKTtcblxuICAgICAgICAvLyBzdG9yZSBpdFxuICAgICAgICB0aGlzLnByb2plY3RpbGVzLnB1c2gocHJvamVjdGlsZSk7XG4gICAgfVxuICAgIFxuICAgIGdlbmVyYXRvcih4LCB5KSB7XG4gICAgICAgIGNvbnN0IGVuZW1pZXMgPSBCQURfR1VZUztcbiAgICAgICAgY29uc3QgaSA9IF8ucmFuZG9tKDAsIGVuZW1pZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIGNvbnN0IHNpemUgPSBfLnJhbmRvbSg1MCAqIHRoaXMuZHByLCAxMDAgKiB0aGlzLmRwcik7XG5cbiAgICAgICAgLy8gZm9yIHRoZSBkZW1vIGluIHRoZSBiZWdpbm5pbmdcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgeSA9PT0gJ3VuZGVmaW5lZCcpICB7XG4gICAgICAgICAgICB4ID0gLXNpemU7XG4gICAgICAgICAgICB5ID0gXy5yYW5kb20oMCwgdGhpcy5jYW52YXMuaGVpZ2h0IC0gc2l6ZSk7XG4gICAgICAgIH0gICBcbiAgICAgICAgY29uc3QgZW5lbXkgPSBuZXcgRW5lbXkoeCwgeSwgc2l6ZSwgZW5lbWllc1tpXSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmVuZW1pZXMucHVzaChlbmVteSk7XG4gICAgfVxuXG4gICAgYWRkR2FtZU92ZXJFbW9qaXMoKSB7XG4gICAgICAgIGlmICh0aGlzLnRpY2sgJSAxMCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IF8ucmFuZG9tKDUwICogdGhpcy5kcHIsIDEwMCAqIHRoaXMuZHByKTtcbiAgICAgICAgICAgIGNvbnN0IHggPSBfLnJhbmRvbSgtc2l6ZSwgdGhpcy5jYW52YXMud2lkdGgpO1xuICAgICAgICAgICAgY29uc3QgZGVhdGggPSBuZXcgRW1vamkoeCwgLXNpemUsIHNpemUsIERFQVRIKTtcblxuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlckVtb2ppcy5wdXNoKGRlYXRoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRyYXdHYW1lT3ZlcigpIHtcbiAgICAgICAgdGhpcy5nYW1lT3ZlckVtb2ppcy5mb3JFYWNoKChnLCBpKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoZy5jdHguY2FudmFzLCBnLnBvc2l0aW9uLngsIGcucG9zaXRpb24ueSwgZy5zaXplLCBnLnNpemUpO1xuICAgICAgICAgICAgZy5wb3NpdGlvbi55ICs9IDIgKiB0aGlzLmRwcjtcbiAgICAgICAgICAgIGlmIChnLnBvc2l0aW9uLnkgPiB0aGlzLmNhbnZhcy5oZWlnaHQpIHRoaXMuZ2FtZU92ZXJFbW9qaXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkcmF3QmFja2dyb3VuZCgpIHtcbiAgICAgICAgY29uc3QgZ3JhZGllbnQgPSB0aGlzLmN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgMCk7XG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCAnIzE3QkVCNicpO1xuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMSwgJyMzNDJmNzQnKTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpOyBcbiAgICB9XG4gICAgXG4gICAgZHJhd0VuZW1pZXMoKSB7XG4gICAgICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKChlLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5oaXQpIGUuZHJhd0hpdCgpO1xuXG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoZS5jdHguY2FudmFzLCBlLnBvc2l0aW9uLngsIGUucG9zaXRpb24ueSwgZS5zaXplLCBlLnNpemUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyB1cGRhdGUgcG9zaXRpb24sIG1hcmsgZGVhZCBpZiBvZmYgdGhlIGNhbnZhc1xuICAgICAgICAgICAgZS5wb3NpdGlvbi54ICs9IGUuc2l6ZSAqIDAuMDUgKiBFTU9KSV9TUEVFRDtcbiAgICAgICAgICAgIGlmIChlLnBvc2l0aW9uLnggPiB0aGlzLmNhbnZhcy53aWR0aCkge1xuICAgICAgICAgICAgICAgIGUuZGVhZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXdQcm9qZWN0aWxlcygpIHtcbiAgICAgICAgdGhpcy5wcm9qZWN0aWxlcy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UocC5jdHguY2FudmFzLCBwLnBvc2l0aW9uLngsIHAucG9zaXRpb24ueSwgcC5zaXplLCBwLnNpemUpO1xuICAgICAgICAgICAgdGhpcy5wcm9qZWN0aWxlSGl0VGVzdChwKTtcblxuICAgICAgICAgICAgLy8gdXBkYXRlIHdpdGggdHJhamVjdG9yeVxuICAgICAgICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gbW92ZVBvaW50QXRBbmdsZShwLnBvc2l0aW9uLCBwLmFuZ2xlLCBQUk9KRUNUSUxFX1NQRUVEICogdGhpcy5kcHIpO1xuICAgICAgICAgICAgcC5wb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gbWFyayBkZWFkIGlmIG9mZiBjYW52YXNcbiAgICAgICAgICAgIGlmIChwLnBvc2l0aW9uLnggPCAwIC0gcC5wb3NpdGlvbi5zaXplIHx8IFxuICAgICAgICAgICAgICAgIHAucG9zaXRpb24ueSA8IDAgLSBwLnBvc2l0aW9uLnNpemUgfHwgXG4gICAgICAgICAgICAgICAgcC5wb3NpdGlvbi54ID4gdGhpcy5jYW52YXMud2lkdGggICB8fCBcbiAgICAgICAgICAgICAgICBwLnBvc2l0aW9uLnkgPiB0aGlzLmNhbnZhcy5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBwLmRlYWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgICAgIFxuICAgIGRyYXdQYXJ0aWNsZXMoKSB7XG4gICAgICAgIHRoaXMucGFydGljbGVzLm1hcChwID0+IHtcbiAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShwLmN0eC5jYW52YXMsIHAucG9zaXRpb24ueCwgcC5wb3NpdGlvbi55LCBwLnNpemUsIHAuc2l6ZSk7XG4gICAgICAgICAgICBwLnVwZGF0ZVBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmIChwLnBvc2l0aW9uLnggPCAwIHx8XG4gICAgICAgICAgICAgICAgcC5wb3NpdGlvbi54ID4gdGhpcy5jYW52YXMud2lkdGggfHxcbiAgICAgICAgICAgICAgICBwLnBvc2l0aW9uLnkgPCAwIHx8XG4gICAgICAgICAgICAgICAgcC5wb3NpdGlvbi55ID4gdGhpcy5jYW52YXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgcC5kZWFkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZHJhd0d1bigpIHtcbiAgICAgICAgY29uc3QgeyBwb3NpdGlvbiwgc2l6ZSwgY3R4IH0gPSB0aGlzLmd1bjtcbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgICBjb25zdCBvZmZzZXRYID0gLTEwICogdGhpcy5kcHI7XG4gICAgICAgIGNvbnN0IG9mZnNldFkgPSAtMTUgKiB0aGlzLmRwcjtcbiAgICAgICAgY29uc3QgdHggPSBwb3NpdGlvbi54ICsgb2Zmc2V0WDtcbiAgICAgICAgY29uc3QgdHkgPSBwb3NpdGlvbi55ICsgb2Zmc2V0WTtcblxuICAgICAgICB0aGlzLmN0eC50cmFuc2xhdGUodHgsIHR5KTtcblxuICAgICAgICB0aGlzLmN0eC5yb3RhdGUodGhpcy5ndW4ucm90YXRpb24gKiBNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGN0eC5jYW52YXMsIG9mZnNldFgsIG9mZnNldFksIHNpemUsIHNpemUpO1xuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfVxuICAgICAgICBcbiAgICByZW1vdmVEZWFkKCkge1xuICAgICAgICAvLyBjbGVhbnMgdXAgZGVhZCBpdGVtc1xuICAgICAgICB0aGlzLmVuZW1pZXMuZm9yRWFjaCgoZSwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUuZGVhZCkgdGhpcy5lbmVtaWVzLnNwbGljZShpLCAxKTsgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMubWFwKChwLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAocC5kZWFkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucHJvamVjdGlsZXMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKHAuZGVhZCkgdGhpcy5wcm9qZWN0aWxlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGd1bkhpdFRlc3QoKSB7XG4gICAgICAgIHRoaXMuZW5lbWllcy5mb3JFYWNoKGVuZW15ID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5ndW4uZGVhZCAmJiBcbiAgICAgICAgICAgICAgICAhZW5lbXkuaGl0ICYmXG4gICAgICAgICAgICAgICAgZG9Cb3hlc0ludGVyc2VjdCh0aGlzLmd1biwgZW5lbXkpKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgZW5lbXkgdG8gaGl0IGFuZCBkcmF3IGEgYmlnIGJvb21cbiAgICAgICAgICAgICAgICBlbmVteS5oaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGVuZW15LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyB0aGVuIG1hcmsgZW5lbXkgZGVhZCBhZnRlciBhIHNob3J0IHRpbWVvdXRcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW5lbXkuZGVhZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSwgMTAwKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ3VuLmRyYXdIaXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmd1bi51cGRhdGVIZWFsdGhCYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgcHJvamVjdGlsZUhpdFRlc3QocHJvamVjdGlsZSkge1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBlbmVteSA9IHRoaXMuZW5lbWllc1tpXTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgcHJvamVjdGlsL2VuZW15IGhpdHNcbiAgICAgICAgICAgIGlmICghZW5lbXkuaGl0ICYmXG4gICAgICAgICAgICAgICAgZG9Cb3hlc0ludGVyc2VjdChwcm9qZWN0aWxlLCBlbmVteSkpIHtcbiAgICAgICAgICAgICAgICAvLyBzZXQgZW5lbXkgdG8gaGl0IGFuZCBkcmF3IGEgYmlnIGJvb21cbiAgICAgICAgICAgICAgICBlbmVteS5oaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGVuZW15LmRyYXcoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyB0aGVuIG1hcmsgZW5lbXkgZGVhZCBhZnRlciBhIHNob3J0IHRpbWVvdXRcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW5lbXkuZGVhZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBwcm9qZWN0aWxlIGlzIGRlYWQgaW1tZWRpYXRldGx5XG4gICAgICAgICAgICAgICAgaWYgKHByb2plY3RpbGUucG93ZXIgPiAyLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQFRPRE8gY29uc3RhbnRzL2NsZWFudXBcbiAgICAgICAgICAgICAgICAgICAgLy8gcG93ZXJmdWxsIHNoaXQgbGl2ZXMgb25cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0aWxlLmRlYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIGV4cGxvc2lvbiBhdCB0aGUgcG9pbnRcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvZGUocHJvamVjdGlsZS5wb3NpdGlvbi54LCBwcm9qZWN0aWxlLnBvc2l0aW9uLnkpO1xuXG4gICAgICAgICAgICAgICAgLy8gc2V0IGhpdHBvaW50IGZvciB3aGVyZSB0byBkaXNwbGF5IG11bHRpcGxpZXJcbiAgICAgICAgICAgICAgICAvLyB0aGVuIGFkZCB0byBzY29yZVxuICAgICAgICAgICAgICAgIHRoaXMuc2NvcmVLZWVwZXIuc2V0SGl0cG9pbnQoeyBcbiAgICAgICAgICAgICAgICAgICAgeDogcHJvamVjdGlsZS5wb3NpdGlvbi54LCBcbiAgICAgICAgICAgICAgICAgICAgeTogcHJvamVjdGlsZS5wb3NpdGlvbi55XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zY29yZUtlZXBlci5pbmNyZWFzZVNjb3JlKGVuZW15Lm11bHRpcGxpZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuIFxuICAgIGV4cGxvZGUoeCwgeSkge1xuICAgICAgICAvLyBuZWVkcyBzdGFydGluZyB4LCB5IHBvc2l0aW9uXG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCBQQVJUSUNMRV9DT1VOVCkge1xuICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IF8ucmFuZG9tKDEwICogdGhpcy5kcHIsIDIwICogdGhpcy5kcHIpOyAvLyByZW1vdmUgcG93ZXIgYmVjYXVzZSBpdCBjYXVzZWQgc2lnbmlmaWNhbnQgamFua1xuICAgICAgICAgICAgY29uc3QgcGFydGljbGUgPSBuZXcgUGFydGljbGUoeCwgeSwgc2l6ZSwgJ/CfkqUnLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2gocGFydGljbGUpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgICAgICBcbiAgICBjcm9zc2hhaXJzSGl0KCkge1xuICAgICAgICBjb25zdCB7IHgsIHkgfSA9IHRoaXMuY3Jvc3NoYWlycy5wb3NpdGlvbjtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuZW5lbWllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZSA9IHRoaXMuZW5lbWllc1tpXTtcbiAgICAgICAgICAgIHRoaXMuY3R4LnJlY3QoZS5wb3NpdGlvbi54LCBlLnBvc2l0aW9uLnksIGUud2lkdGgsIGUuaGVpZ2h0KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMuY3R4LmlzUG9pbnRJblBhdGgoeCwgeSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyb3NzaGFpcnMuaGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNyb3NzaGFpcnMuaGl0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnRpY2srKztcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJlbmRlcik7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyS2V5RXZlbnRzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNQYXVzZWQpIHJldHVybjtcblxuICAgICAgICBpZiAodGhpcy5nYW1lT3Zlcikge1xuICAgICAgICAgICAgdGhpcy5hZGRHYW1lT3ZlckVtb2ppcygpO1xuICAgICAgICAgICAgdGhpcy5kcmF3R2FtZU92ZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1vdXNlZG93biAmJiB0aGlzLnNob3RQb3dlciA8PSBNQVhfU0hPVF9QT1dFUikge1xuICAgICAgICAgICAgLy8gcG93ZXIgdXBcbiAgICAgICAgICAgIHRoaXMuc2hvdFBvd2VyICs9IDAuMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnRpY2sgJSAoR0VORVJBVE9SX0RFTEFZICogNikgPT09IDApIHRoaXMuZ2VuZXJhdG9yKCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmRyYXdCYWNrZ3JvdW5kKCk7XG4gICAgICAgIHRoaXMuZHJhd0VuZW1pZXMoKTsgICAgICAgIFxuICAgICAgICB0aGlzLmRyYXdQcm9qZWN0aWxlcygpO1xuICAgICAgICB0aGlzLmRyYXdQYXJ0aWNsZXMoKTtcblxuICAgICAgICBpZiAoIXRoaXMuZ3VuLmRlYWQpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0d1bigpO1xuICAgICAgICAgICAgdGhpcy5kcmF3Q3Jvc3NoYWlycygpO1xuICAgICAgICAgICAgdGhpcy5ndW5IaXRUZXN0KCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUd1bigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gamFua3kgZ2FtZW92ZXIgZmxhZ1xuICAgICAgICAgICAgLy8gc2hvdWxkIHVzZSBldmVudCBzeXN0ZW1cbiAgICAgICAgICAgIC8vIHRvIGhhbmRsZSB0aGVzZSB0aGluZ3NcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zaG93UmVzdGFydCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJlbW92ZURlYWQoKTtcbiAgICB9XG59XG5cbmNsYXNzIEluZm8ge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGlzT3BlbjogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmluZm9CdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHRoaXMuaW5mb0JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5pbmZvQnRuKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmluZm9Cb3gpO1xuXG4gICAgICAgIHRoaXMuaW5mb0J0bi5pbm5lclRleHQgPSAnPyc7XG4gICAgICAgIHRoaXMuaGFuZGxlQ2xpY2sgPSB0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaW5mb0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2spO1xuICAgICAgICB0aGlzLmluZm9Cb3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrKTtcbiAgICAgICAgdGhpcy5zZXRTdHlsZSgpO1xuICAgICAgICB0aGlzLnNldEluZm8oKTtcbiAgICB9XG5cbiAgICBzZXRJbmZvKCkge1xuICAgICAgICB0aGlzLmluZm9Cb3guaW5uZXJIVE1MID0gYFxuICAgICAgICAgICAgPGgxPvCfjJrwn5Sl8J+UpfCflKXwn5Sl8J+UpfCflKXwn5SrPC9oMT5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+QWltPC9zdHJvbmc+IHdpdGggdGhlIG1vdXNlIG9yIGFycm93IGtleXMuXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPkZpcmU8L3N0cm9uZz4gYnkgY2xpY2tpbmcgb3Igd2l0aCB0aGUgc3BhY2ViYXIuXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPlBvd2VydXA8L3N0cm9uZz4gYnkgY2xpY2tpbmcgYW5kIGhvbGRpbmcgdGhlIG1vdXNlIGRvd24uXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPkVzYzwvc3Ryb25nPiB0byBwYXVzZS5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIEhpdHRpbmcgZW1vamlzIGh1cnRzLiA8c3Ryb25nPkRvbid0IGRpZTwvc3Ryb25nPi5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgYDtcbiAgICB9XG5cbiAgICBzZXRTdHlsZSgpIHtcbiAgICAgICAgdGhpcy5pbmZvQnRuLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgdGhpcy5pbmZvQnRuLnN0eWxlLmJvdHRvbSA9ICcwLjJlbSc7XG4gICAgICAgIHRoaXMuaW5mb0J0bi5zdHlsZS5yaWdodCA9ICcwLjVlbSc7XG4gICAgICAgIHRoaXMuaW5mb0J0bi5zdHlsZS5mb250V2VpZ2h0ID0gJzUwMCc7XG4gICAgICAgIHRoaXMuaW5mb0J0bi5zdHlsZS5mb250U2l6ZSA9ICcyLjVlbSc7XG4gICAgICAgIHRoaXMuaW5mb0J0bi5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG5cbiAgICAgICAgdGhpcy5pbmZvQm94LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgdGhpcy5pbmZvQm94LnN0eWxlLnBhZGRpbmcgPSAnMmVtJztcbiAgICAgICAgdGhpcy5pbmZvQm94LnN0eWxlLnRvcCA9ICc1MCUnO1xuICAgICAgICB0aGlzLmluZm9Cb3guc3R5bGUubGVmdCA9ICc1MCUnO1xuICAgICAgICB0aGlzLmluZm9Cb3guc3R5bGUud2lkdGggPSAnMzBlbSc7XG4gICAgICAgIC8vIHRoaXMuaW5mb0JveC5zdHlsZS5oZWlnaHQgPSAnODAlJztcbiAgICAgICAgdGhpcy5pbmZvQm94LnN0eWxlLmJhY2tncm91bmQgPSAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KSc7XG4gICAgICAgIHRoaXMuaW5mb0JveC5zdHlsZS5vcGFjaXR5ID0gJzAnO1xuICAgICAgICB0aGlzLmluZm9Cb3guc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgICAgICBUd2VlbkxpdGUuc2V0KHRoaXMuaW5mb0JveCwge1xuICAgICAgICAgICAgeDogJy01MCUnLFxuICAgICAgICAgICAgeTogJy0xMDAlJyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdHdlZW5PcGVuKCkge1xuICAgICAgICBUd2VlbkxpdGUudG8odGhpcy5pbmZvQm94LCAwLjQsIHtcbiAgICAgICAgICAgIGRpc3BsYXk6ICdibG9jaycsXG4gICAgICAgICAgICB5OiAnLTUwJScsXG4gICAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXQsXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5pc09wZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5pc1BhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0d2VlbkNsb3NlKCkge1xuICAgICAgICBUd2VlbkxpdGUudG8odGhpcy5pbmZvQm94LCAwLjQsIHtcbiAgICAgICAgICAgIGRpc3BsYXk6ICdub25lJyxcbiAgICAgICAgICAgIHk6ICctMTAwJScsXG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXQsXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWUuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKCkge1xuICAgICAgICB0aGlzLnN0YXRlLmlzT3BlbiA/IHRoaXMudHdlZW5DbG9zZSgpIDogdGhpcy50d2Vlbk9wZW4oKTtcbiAgICB9XG59XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY29uc3QgZ2FtZSA9IG5ldyBHYW1lKCk7XG59O1xuIl19
