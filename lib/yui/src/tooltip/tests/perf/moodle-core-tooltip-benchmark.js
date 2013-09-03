YUI.add('moodle-core-tooltip-benchmark', function (Y) {
    var suite = Y.BenchmarkSuite = new Benchmark.Suite();

    suite.add('new M.core.tooltip().destroy()', function() {
        var tooltip = new M.core.tooltip();
        tooltip.destroy();
    });

    suite.add('new M.core.exception().destroy()', function() {
        var tooltip = new M.core.exception({message: 'foo'});
        tooltip.destroy();
    });

    suite.add('new Y.Panel.destroy()', function() {
        var tooltip = new Y.Panel();
        tooltip.destroy();
    });

    
}, '@VERSION@', {requires: ['node-core']});
