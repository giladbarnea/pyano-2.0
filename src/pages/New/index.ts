import GLOBAL from "../../GLOBAL";

async function load(reload: boolean) {
    GLOBAL.Store.config().finished_trials_count = 0;
}

export default { load }
