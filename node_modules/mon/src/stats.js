var Class = require( 'class.extend' );
var _ = require( 'lodash-node' );

var HP = 1;
var ATTACK = 2;
var DEFENSE = 3;
var SPATK = 4;
var SPDEF = 5;
var SPEED = 6;
var IV = 32;
var EV = 255;
var MAX_EV = 510;
var LEVEL = 50;
var STATS = [ HP, ATTACK, DEFENSE, SPATK, SPDEF, SPEED ];

var Stats = Class.extend({
    init: function( id ) {
        var Pokedex = require( './pokedex' );

        this.ivs = _.reduce( STATS, function( memo, stat ) {
            memo[ stat ] = _.random( IV );
            return memo;
        }, {} );

        var evValues = [];
        while ( !evValues.length || _.reduce( evValues, function( memo, val ) { return memo + val; } ) > MAX_EV ) {
            evValues = _.map( STATS, function() {
                return _.random( EV );
            });
        }

        this.evs = _.reduce( evValues, function( memo, val, i ) {
            memo[ STATS[ i ] ] = val;
            return memo;
        }, {} );

        this.base = _.reduce( Pokedex.statsFor( id ), function( base, row ) {
            base[ row.stat_id ] = row.base_stat;
            return base;
        }, {} );

        this.current = _.reduce( STATS, function( memo, stat, i ) {
            memo[ STATS[ i ] ] = this.calculateStat( stat );
            return memo;
        }, {}, this );
    },

    attackFor: function( attackClass ) {
        return this.current[ attackClass ];
    },

    defenseFor: function( attackClass ) {
        var Pokedex = require( './pokedex' );
        var defenseClass = ( attackClass == Pokedex.DAMAGE_CLASS_ATTACK ) ? DEFENSE : SPDEF;
        return this.current[ defenseClass ];
    },

    level: function() {
        return LEVEL;
    },

    hp: function() {
        return this.current[ HP ];
    },

    attack: function() {
        return this.current[ ATTACK ];
    },

    specialAttack: function() {
        return this.current[ SPATK ];
    },

    defense: function() {
        return this.current[ DEFENSE ];
    },

    specialDefense: function() {
        return this.current[ SPDEF ];
    },

    speed: function() {
        return this.current[ SPEED ];
    },

    calculateStat: function( stat ) {
        var beforeBump = ( stat == HP ) ? 100 : 0;
        var finalBump = ( stat == HP ) ? 10 : 5;

        return Math.floor(
            ( ( ( this.ivs[ stat ] + ( 2 * this.base[ stat ] ) + ( this.evs[ stat ] / 4 ) + beforeBump ) * LEVEL ) / 100 ) + finalBump
        );
    }
});

Stats.buildFromObj = function( obj ) {
    // Use any ID - we override all important values anyways
    return _.extend( new Stats( 1 ), obj );
};

module.exports = Stats;
