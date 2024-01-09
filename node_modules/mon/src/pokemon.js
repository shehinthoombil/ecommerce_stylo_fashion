var Class = require( 'class.extend' );
var Stats = require( './stats' );
var _ = require( 'lodash-node' );

var performDamage = function( self, move, enemy ) {
    var damage = move.damage( self, enemy );
    enemy.hp -= damage;
    if ( enemy.hp < 0 ) {
        enemy.hp = 0
    }
};

var Pokemon = Class.extend({
    init: function( id, name, types ) {
        this.id = id;
        this.name = name.toUpperCase();
        this.types = types;
        this.stats = new Stats( id );
        this.hp = this.stats.hp();
    },

    setStatsFromObj: function( obj ) {
        this.stats = Stats.buildFromObj( obj );
        this.hp = this.stats.hp();
    },

    speed: function() {
        return this.stats.speed();
    },

    level: function() {
        return this.stats.level();
    },

    attackFor: function( attackClass ) {
        return this.stats.attackFor( attackClass );
    },

    defenseFor: function( attackClass ) {
        return this.stats.defenseFor( attackClass );
    },

    spriteUrl: function() {
        return 'http://pokeapi.co/media/img/' + this.id + '.png';
    },

    moves: function() {
        var Pokedex = require( './pokedex' );
        return this._moves = this._moves || Pokedex.movesFor( this.id );
    },

    moveNames: function() {
        return _.map( this.moves(), function( move ) {
            return move.name
        }).join( ', ' );
    },

    setMoves: function( moveArray ) {
        this._moves = moveArray;
        return this._moves;
    },

    findMove: function( name ) {
        return _.find( this._moves, function( move ) {
            return move.name == name.toUpperCase();
        });
    },

    attack: function( name, enemy ) {
        this.lastMove = this.findMove( name );
        performDamage( this, this.lastMove, enemy );
        return this;
    },

    counterAttack: function( enemy ) {
        this.lastMove = _.shuffle( this.moves() )[ 0 ];
        performDamage( this, this.lastMove, enemy );
        return this;
    }
});

module.exports = Pokemon;
