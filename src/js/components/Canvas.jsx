import React from 'react';
import Game from './Game';
import { preloadImages } from '../utils/preload';
import _ from 'lodash';

// libraries
import '../libs/gsap';
import '../libs/Howler.js';

const sprite = require('../../../build/sounds/sprite.json');

class Canvas extends React.Component {
    componentDidMount() {
        // wait for the initial render
        // to begin setup the canvas so 
        // the element is in the DOM
        this.loadImages();
    }

    componentWillReceiveProps(nextProps) {
        const score = nextProps.score;
        this.game.setState({
            score
        });
    }

    componentWillUnmount() {
        this.game.destroy();
    }

    setScore() {
        // set score prop to state
        // to pass to the game canvas
        const score = this.props.score;
        this.setState({
            score
        });
    }

    loadImages() {
        // Preload required assets 
        // save to state then setup
        const images = Game.requiredAssets.images;

        this.loadPromise = preloadImages(images).then((images) => {
            this.setState({
                images,
            });
            this.instantiateSound();
            this.setScore();
            this.setupCanvas();
        });
    }

    instantiateSound() {
        // change urls to src for howler 2.0 sprite
        sprite.src = sprite.urls;
        delete sprite.urls;
        this.sound = new Howl(sprite);
    }

    setupCanvas() {
        this.canvas = this.refs.game;

        // instantiate new game with state, canvas, and sound
        this.game = new Game(this.state, this.canvas, this.sound);
    }

    render() {
        return (
            <canvas ref="game" id="game" />
        );
    }
}

export default Canvas;