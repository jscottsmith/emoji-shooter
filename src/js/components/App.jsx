import React, {PropTypes} from 'react';
import Canvas from './Canvas';
import AppStore from '../stores/AppStore';
import UpdateStore from '../actions/UpdateStore';

class App extends React.Component {
    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
        this.state = AppStore.getState();
    }

    componentDidMount() {
        AppStore.listen(this.onChange);
    }

    componentWillUnmount() {
        AppStore.unlisten(this.onChange);
    }

    onChange() {
        const { score } = AppStore.getState();
        this.setState({
            score,
        });
    }

    handleClick() {
        const score = this.state.score + 1;
        UpdateStore.updateScore(score);
    }

    render() {
        const { score } = this.state;
        
        return (
            <main>
                <div className="score">
                    <h1>{score}</h1>
                    <button onClick={this.handleClick.bind(this)}>+1</button>
                </div>
                <Canvas score={this.state.score} />
            </main>
        );
    }
}

export default App;