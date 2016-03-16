<?php

namespace core;

class test {
    public static function pre_page_header_print(\core\hook\facade $f) {
        \core\notification::success('This item will work and will prevent execution of further callables.');
        $f->halt();
    }

    public static function another_page_header_print() {
        \core\notification::error('I should not have been called');
    }
}
