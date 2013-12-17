M.util.init_block_hider = function(Y, config) {
    Y.use('base', 'node', function(Y) {
        M.util.block_hider = M.util.block_hider || (function(){
            var blockhider = function() {
                blockhider.superclass.constructor.apply(this, arguments);
            };
            blockhider.prototype = {
                initializer : function(config) {
                    this.set('block', '#'+this.get('id'));
                    var b = this.get('block'),
                        t = b.one('.title'),
                        a = null;
                    if (t && (a = t.one('.block_action'))) {
                        var hide = Y.Node.create('<img class="block-hider-hide" tabindex="0" alt="'+config.tooltipVisible+'" title="'+config.tooltipVisible+'" />');
                        hide.setAttribute('src', this.get('iconVisible')).on('click', this.updateState, this, true);
                        hide.on('keypress', this.updateStateKey, this, true);
                        var show = Y.Node.create('<img class="block-hider-show" tabindex="0" alt="'+config.tooltipHidden+'" title="'+config.tooltipHidden+'" />');
                        show.setAttribute('src', this.get('iconHidden')).on('click', this.updateState, this, false);
                        show.on('keypress', this.updateStateKey, this, false);
                        a.insert(show, 0).insert(hide, 0);
                    }
                },
                updateState : function(e, hide) {
                    M.util.set_user_preference(this.get('preference'), hide);
                    if (hide) {
                        this.get('block').addClass('hidden');
                    } else {
                        this.get('block').removeClass('hidden');
                    }
                },
                updateStateKey : function(e, hide) {
                    if (e.keyCode === 13) { //allow hide/show via enter key
                        this.updateState(this, hide);
                    }
                }
            };
            Y.extend(blockhider, Y.Base, blockhider.prototype, {
                NAME : 'blockhider',
                ATTRS : {
                    id : {},
                    preference : {},
                    iconVisible : {
                        value : M.util.image_url('t/switch_minus', 'moodle')
                    },
                    iconHidden : {
                        value : M.util.image_url('t/switch_plus', 'moodle')
                    },
                    block : {
                        setter : function(node) {
                            return Y.one(node);
                        }
                    }
                }
            });
            return blockhider;
        })();
        new M.util.block_hider(config);
    });
};
