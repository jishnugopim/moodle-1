if (typeof _yuitest_coverage == "undefined"){
    _yuitest_coverage = {};
    _yuitest_coverline = function(src, line){
        var coverage = _yuitest_coverage[src];
        if (!coverage.lines[line]){
            coverage.calledLines++;
        }
        coverage.lines[line]++;
    };
    _yuitest_coverfunc = function(src, name, line){
        var coverage = _yuitest_coverage[src],
            funcId = name + ":" + line;
        if (!coverage.functions[funcId]){
            coverage.calledFunctions++;
        }
        coverage.functions[funcId]++;
    };
}
_yuitest_coverage["build/moodle-course-formatchooser/moodle-course-formatchooser.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-course-formatchooser/moodle-course-formatchooser.js",
    code: []
};
_yuitest_coverage["build/moodle-course-formatchooser/moodle-course-formatchooser.js"].code=["YUI.add('moodle-course-formatchooser', function (Y, NAME) {","","    var FORMATCHOOSER = function() {","        FORMATCHOOSER.superclass.constructor.apply(this, arguments);","    }","","    Y.extend(FORMATCHOOSER, Y.Base, {","        initializer : function(params) {","            if (params && params.formid) {","                var updatebut = Y.one('#'+params.formid+' #id_updatecourseformat');","                var formatselect = Y.one('#'+params.formid+' #id_format');","                if (updatebut && formatselect) {","                    updatebut.setStyle('display', 'none');","                    formatselect.on('change', function() {","                        updatebut.simulate('click');","                    });","                }","            }","        }","    });","","    M.course = M.course || {};","    M.course.init_formatchooser = function(params) {","        return new FORMATCHOOSER(params);","    }","","","}, '@VERSION@', {\"requires\": [\"base\", \"node\", \"node-event-simulate\"]});"];
_yuitest_coverage["build/moodle-course-formatchooser/moodle-course-formatchooser.js"].lines = {"1":0,"3":0,"4":0,"7":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"22":0,"23":0,"24":0};
_yuitest_coverage["build/moodle-course-formatchooser/moodle-course-formatchooser.js"].functions = {"FORMATCHOOSER:3":0,"(anonymous 2):14":0,"initializer:8":0,"init_formatchooser:23":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-formatchooser/moodle-course-formatchooser.js"].coveredLines = 14;
_yuitest_coverage["build/moodle-course-formatchooser/moodle-course-formatchooser.js"].coveredFunctions = 5;
_yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 1);
YUI.add('moodle-course-formatchooser', function (Y, NAME) {

    _yuitest_coverfunc("build/moodle-course-formatchooser/moodle-course-formatchooser.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 3);
var FORMATCHOOSER = function() {
        _yuitest_coverfunc("build/moodle-course-formatchooser/moodle-course-formatchooser.js", "FORMATCHOOSER", 3);
_yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 4);
FORMATCHOOSER.superclass.constructor.apply(this, arguments);
    }

    _yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 7);
Y.extend(FORMATCHOOSER, Y.Base, {
        initializer : function(params) {
            _yuitest_coverfunc("build/moodle-course-formatchooser/moodle-course-formatchooser.js", "initializer", 8);
_yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 9);
if (params && params.formid) {
                _yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 10);
var updatebut = Y.one('#'+params.formid+' #id_updatecourseformat');
                _yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 11);
var formatselect = Y.one('#'+params.formid+' #id_format');
                _yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 12);
if (updatebut && formatselect) {
                    _yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 13);
updatebut.setStyle('display', 'none');
                    _yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 14);
formatselect.on('change', function() {
                        _yuitest_coverfunc("build/moodle-course-formatchooser/moodle-course-formatchooser.js", "(anonymous 2)", 14);
_yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 15);
updatebut.simulate('click');
                    });
                }
            }
        }
    });

    _yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 22);
M.course = M.course || {};
    _yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 23);
M.course.init_formatchooser = function(params) {
        _yuitest_coverfunc("build/moodle-course-formatchooser/moodle-course-formatchooser.js", "init_formatchooser", 23);
_yuitest_coverline("build/moodle-course-formatchooser/moodle-course-formatchooser.js", 24);
return new FORMATCHOOSER(params);
    }


}, '@VERSION@', {"requires": ["base", "node", "node-event-simulate"]});
