M.util.in_array = function(item, array){
    /*jshint eqeqeq:false*/
    var i;
    for (i = 0; i<array.length; i++){
        if (item == array[i]){
            return true;
        }
    }
    return false;
};
