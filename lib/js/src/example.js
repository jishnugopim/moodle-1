import $ from "jquery";
import * as ajax from "core/ajax";
import * as storage from "core/localstorage";

function showMeTheLight() {
    $('nav').show();
};
function itIsTooBright() {
    $('nav').hide();
};

export {
    showMeTheLight,
    itIsTooBright
};
