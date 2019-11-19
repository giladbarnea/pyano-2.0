import Glob from "../../Glob";

async function load(reload: boolean) {
    Glob.Store.config().finished_trials_count = 0;
}

export default { load }
