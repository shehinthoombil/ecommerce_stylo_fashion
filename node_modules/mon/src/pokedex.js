var _ = require( 'lodash-node' );
var db = require( './db' );
var Pokemon = require( './pokemon' );
var Move = require( './move' );

var ENGLISH = 9;

var DAMAGE_CLASS_STATUS = 1;
var DAMAGE_CLASS_ATTACK = 2;
var DAMAGE_CLASS_SPECIAL = 3;

var MIN_POKEMON_ID = 1; // We could query, but come on.
var MAX_POKEMON_ID = 721; // Later, we can query the DB for max ID

var Pokedex = {
    DAMAGE_CLASS_STATUS: DAMAGE_CLASS_STATUS,

    DAMAGE_CLASS_ATTACK: DAMAGE_CLASS_ATTACK,

    DAMAGE_CLASS_SPECIAL: DAMAGE_CLASS_SPECIAL,

    findById: function( id ) {
        // console.log( 'SELECT * FROM pokemon_species_names WHERE local_language_id  = ' + ENGLISH  + ' AND pokemon_species_id = ' + id + ';' );
        var row = db.query( 'SELECT * FROM pokemon_species_names WHERE local_language_id  = ' + ENGLISH  + ' AND pokemon_species_id = ' + id + ';' )[ 0 ];
        return this.build( id, row.name );
    },

    findByName: function( name ) {
        if ( name == 'random' ) {
            return this.findById( _.rand( MIN_POKEMON_ID, MAX_POKEMON_ID ) );
        } else if ( name.match( /^\d+$/ ) ) {
            return this.findById( name );
        } else {
            var row = db.query( 'SELECT * FROM pokemon_species_names WHERE local_language_id = ' + ENGLISH + ' AND name LIKE \'%' + name + '%\';' )[ 0 ];
            if ( !row ) {
                throw name + ': not a valid Pokemon.'
            }
            return this.build( row.pokemon_species_id, row.name );
        }
    },

    build: function( id, name ) {
        var types = _.map( db.query( 'SELECT * FROM pokemon_types WHERE pokemon_id = ' + id + ';' ), function( row ) {
            return row.type_id;
        });

        return new Pokemon( id, name, types );
    },

    movesFor: function( id ) {
        var pokemonMoveIds = _.map( db.query( 'SELECT * FROM pokemon_moves WHERE pokemon_id = ' + id + ';' ), function( pokemonMove ) {
            return pokemonMove.move_id;
        });
        var moves = db.queryComplex( 'SELECT * FROM moves WHERE id = ??? AND damage_class_id = ??? ORDER BY RANDOM() LIMIT 4;', [ pokemonMoveIds, [ DAMAGE_CLASS_ATTACK, DAMAGE_CLASS_SPECIAL ] ] );

        return _.map( moves, function( row ) {
            return new Move( row );
        });
    },

    movesFromNames: function( moveNames ) {
        return _.map( moveNames, function( name ) {
            var row = db.query( 'SELECT * FROM moves WHERE identifier = \'' + name.toLowerCase() + '\';' )[ 0 ];
            return new Move( row );
        });
    },

    statsFor: function( id ) {
        return db.query( 'SELECT * FROM pokemon_stats WHERE pokemon_id = ' + id + ';' );
    },

    immune: function( damageTypeId, targetTypes ) {
        var results = db.queryComplex( 'SELECT * FROM type_efficacy WHERE damage_type_id = ' + ( damageTypeId || 'NOT NULL' ) + ' AND target_type_id = ??? AND damage_factor = 0;', [ targetTypes ], true );
        return !!results.length;
    },

    moveEfficacies: function( damageTypeId, targetTypes ) {
        return _.map( this.typeScope(), function( row ) {
            return row.damage_factor;
        });
    },

    typeScope: function( damageTypeId, targetTypes ) {
        return db.queryComplex( 'SELECT * FROM type_efficacy WHERE damage_type_id = ' + ( damageTypeId || 'NOT NULL' ) + ' AND target_type_id = ???;', [ targetTypes ] );
    },

    nameScope: function() {
        return db.query( 'SELECT * FROM pokemon_species_names WHERE local_language_id = ' + ENGLISH + ';' );
    }
};

module.exports = Pokedex;
