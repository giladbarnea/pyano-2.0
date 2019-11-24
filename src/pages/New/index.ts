import Glob from "../../Glob";
// import * as util from '../../util'
import * as util from '../../util'
import sidebar from "../sidebar";

async function load(reload: boolean) {
    const { exam, test } = Glob.BigConfig;
    Glob.BigConfig.last_page = "new";
    if ( reload ) {
        util.reloadPage();
    }
    sidebar.select("new", { changeTitle : true })
    
    // exam.finished_trials_count = 0;
    // test.finished_trials_count = 0;
    // current_test.finished_trials_count = 0;
    
    
}

export default { load }
