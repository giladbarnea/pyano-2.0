import Glob from "../../Glob";

async function load(reload: boolean) {
    const { current_exam, current_test } = Glob.Store.config("all");
    current_exam.finished_trials_count = 0;
    current_test.finished_trials_count = 0;
}

export default { load }
