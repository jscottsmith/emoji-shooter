import alt from '../alt';
import UpdateStore from '../actions/UpdateStore';

class AppStore {
    constructor() {
        this.score = 0;

        this.bindListeners({
            updateScore: UpdateStore.UPDATE_SCORE,
        });
    }

    updateScore(score) {
        this.score = score;
    }
}

export default alt.createStore(AppStore, 'AppStore');
