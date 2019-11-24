import Glob from "../../Glob";
import * as util from '../../util'

async function load(reload: boolean) {
    const { exam, test } = Glob.BigConfig;
    Glob.BigConfig.last_page = "new";
    if ( reload ) {
        util.reloadPage();
    }
    // exam.finished_trials_count = 0;
    // test.finished_trials_count = 0;
    // current_test.finished_trials_count = 0;
    
    
}

export default { load }
