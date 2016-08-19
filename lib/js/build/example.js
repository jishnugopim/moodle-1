define(["exports", "jquery", "core/ajax", "core/localstorage"], function (exports, _jquery, _ajax, _localstorage) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.itIsTooBright = exports.showMeTheLight = undefined;

    var _jquery2 = _interopRequireDefault(_jquery);

    var ajax = _interopRequireWildcard(_ajax);

    var storage = _interopRequireWildcard(_localstorage);

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function showMeTheLight() {
        (0, _jquery2.default)('nav').show();
    };
    function itIsTooBright() {
        (0, _jquery2.default)('nav').hide();
    };

    exports.showMeTheLight = showMeTheLight;
    exports.itIsTooBright = itIsTooBright;
});
//# sourceMappingURL=example.js.map
