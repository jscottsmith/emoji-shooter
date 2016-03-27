import UpdateStore from '../actions/UpdateStore';
import { getOffset } from '../utils';
import _ from 'lodash';

export default class Game {
    static requiredAssets = {
        images: {
            target1: '/images/game/target-1.png',
            target2: '/images/game/target-2.png',
            target3: '/images/game/target-3.png',
            target4: '/images/game/target-4.png',
        },
    };

    constructor(state, canvas, sound) {
        this.state = Object.assign({
            needsRedraw: true,
            mouseX: 0,
            mouseY: 0,
            offset: {
                top: 0,
                left: 0,
            },
            ratio: 1,
        }, state);

        this.sound = sound;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.naturalHeight = 1080;
        this.naturalWidth = 1920;

        this.render = this.render.bind(this);
        this.addListeners();
        this.setSize();
        this.setRatio();
        this.render();
    }

    setRatio() {
        const heightRatio = (this.state.height / this.naturalHeight);
        const widthRatio = (this.state.width / this.naturalWidth);
        const ratio = Math.min(1, heightRatio, widthRatio);
        this.setState({
            ratio
        });
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, {
            needsRedraw: true,
        }, newState);
    }

    setSize() {
        let offset = getOffset(this.canvas);
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.canvas.width = width;
        this.canvas.height = height;

        offset = getOffset(this.canvas);

        this.setState({
            width,
            height,
            offset,
        });
    }

    addListeners() {
        this.render = this.render.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onWindowResize = _.debounce(this.onWindowResize.bind(this), 50);

        window.addEventListener('keydown', this.onKeyPress);
        window.addEventListener('resize', this.onWindowResize);

        this.canvas.addEventListener('touchstart', this.onTouchStart, false);
        this.canvas.addEventListener('touchmove', this.onTouchMove, false);
        this.canvas.addEventListener('touchend', this.onTouchEnd, false);
        this.canvas.addEventListener('mousemove', this.onMouseMove, false);
        this.canvas.addEventListener('mousedown', this.onMouseDown, false);

        TweenLite.ticker.addEventListener('tick', this.render);
    }

    destroy() {
        window.removeEventListener('keydown', this.onKeyPress);
        window.removeEventListener('resize', this.onWindowResize);

        this.canvas.removeEventListener('touchstart', this.onTouchStart, false);
        this.canvas.removeEventListener('touchmove', this.onTouchMove, false);
        this.canvas.removeEventListener('touchend', this.onTouchEnd, false);
        this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
        this.canvas.removeEventListener('mousedown', this.onMouseDown, false);

        TweenLite.ticker.removeEventListener('tick', this.render);
    }

    onMouseMove(event) {
        const mouseX = event.clientX - this.state.offset.left;
        const mouseY = event.clientY - this.state.offset.top;

        this.setState({
            mouseX, mouseY,
        });
    }

    onMouseDown(event) {
        this.sound.play('whip');
        const score = this.state.score + 100;
        UpdateStore.updateScore(score);
    }

    onTouchStart(event) {
        this.onTouchMove(event);
    }

    onTouchMove(event) {
        event.preventDefault();
        event.stopPropagation();
        const touch = event.targetTouches[0];
        const mouseX = touch.pageX - this.state.offset.left;
        const mouseY = touch.pageY - this.state.offset.top;

        this.setState({
            mouseX,
            mouseY,
        });
    }

    onTouchEnd(event) {}

    onKeyPress(event) {
        // if (event.keyCode === 1) {
        // }
    }

    onWindowResize() {
        this.setSize();
        this.setRatio();
    }

    render() {
        this.context.fillStyle = 'plum';
        this.context.fillRect(0, 0, this.state.width, this.state.height);

        const image = this.state.images.target1;
        const width = image.width * this.state.ratio;
        const height = image.height * this.state.ratio;
        const x = (this.state.width - width) / 2;
        const y = (this.state.height - height) / 2;
        

        this.context.drawImage(image, x, y, width, height);
    }
}