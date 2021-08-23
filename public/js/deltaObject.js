function mapFromArray(array, prop) {
    var map = {};
    if (array == null || typeof array == "undefined") return {};
    else if (array.length == 0) return {}
    for (var i=0; i < array.length; i++) {
        map[ array[i][prop] ] = array[i];
    }
    return map;
}


function getDelta(o, n, comparator)  {
    var delta = {
        added: [],
        deleted: [],
        changed: []
    };
    var mapO = mapFromArray(o, 'id');
    var mapN = mapFromArray(n, 'id');    
    for (var id in mapO) {
        if (!mapN.hasOwnProperty(id)) {
            delta.deleted.push(mapO[id]);
        } else if (!comparator(mapN[id], mapO[id])){
            delta.changed.push(mapN[id]);
        }
    }
    
    for (var id in mapN) {
        if (!mapO.hasOwnProperty(id)) {
            delta.added.push( mapN[id] )
        }
    }
    return delta;
}


