var Class = require( 'class.extend' );
var _ = require( 'lodash-node' );
var fs = require( 'fs' );
var SQL = require( 'sql.js' );
var filebuffer = fs.readFileSync( __dirname + '/../share/pokedb.sqlite3' );
var db = new SQL.Database( filebuffer );

var query = function( query ) {
    // console.log( query );
    var statement = db.prepare( query );
    var results = [];
    while ( statement.step() ) {
        results.push( statement.getAsObject() );
    }
    statement.free();

    return results;
};

var queryComplex = function( query, args, test ) {
    var propRegex = /(\S*) \= \?\?\?/g;
    var result;
    var newQuery = '';
    var i = 0;
    var lastIndex = 0;

    while ( result = propRegex.exec( query ) ) {
        var prop = result[ 1 ];
        newQuery += query.substring( lastIndex, result.index );
        if ( args[ i ] && args[ i ].length ) {
            newQuery += '( '
            _.each( args[ i ], function( val, j ) {
                if ( j > 0 ) {
                    newQuery += ' OR ';
                }
                newQuery += ' ' + prop + ' = ' + val + ' ';
            });
            newQuery += ' )';
        } else {
            newQuery += ' ' + prop + ' IS NOT NULL';
        }
        lastIndex = propRegex.lastIndex;
        i++;
    }
    newQuery += query.substring( lastIndex );
    // console.log(newQuery);

    var statement = db.prepare( newQuery );
    var results = [];
    while ( statement.step() ) {
        results.push( statement.getAsObject() );
    }
    statement.free();

    return results;
}

module.exports = {
    query: query,
    queryComplex: queryComplex
};
