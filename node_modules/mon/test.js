var Mon = require( './src' );
var _ = require( 'lodash-node' );

var battle = new Mon.Battle();
battle.chooseHome( 'Charizard' );

while ( battle.battling() ) {
  var move = _.shuffle( battle.home.moves() )[ 0 ];
  var moves = battle.useHome( move.name );
  _.each( moves, function( pokemon ) {
    console.log( '> ' + pokemon.name + ' used ' + pokemon.lastMove.name );
  });

  console.log( battle.home.name, battle.home.hp );
  console.log( battle.visitor.name, battle.visitor.hp );
}
