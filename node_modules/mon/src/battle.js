var Class = require( 'class.extend' );
var _ = require( 'lodash-node' );

MONSTER_IDS = _.range( 0, 150 );

var Battle = Class.extend({
    init: function() {
        var Pokedex = require( './pokedex' );
        this.visitor = Pokedex.findById( _.shuffle( MONSTER_IDS )[ 0 ] );
        this.aiBattle = true;
    },

    chooseVisitor: function( name ) {
        var Pokedex = require( './pokedex' );
        this.aiBattle = false;
        this.visitor = Pokedex.findByName( name );
    },

    chooseHome: function( name ) {
        var Pokedex = require( './pokedex' );
        return this.home = Pokedex.findByName( name );
    },

    canUseHome: function( name ) {
        return this.home.findMove( name );
    },

    canUseVisitor: function( name ) {
        return this.visitor.findMove( name );
    },

    useHome: function( name ) {
        this.homeName = name;

        if ( this.aiBattle || this.visitorName ) {
            return this.useMoves();
        }
    },

    useVisitor: function( name ) {
        this.visitorName = name;

        if ( this.homeName ) {
            return this.useMoves();
        }
    },

    useMoves: function() {
        var order;
        var homeSpeed = this.home.speed;
        var visitorSpeed = this.visitor.speed;

        if ( homeSpeed > visitorSpeed ) {
            order = [ 'homeAttack', 'visitorAttack' ];
        } else if ( visitorSpeed > homeSpeed ) {
            order = [ 'visitorAttack', 'homeAttack' ];
        } else {
            // Random
            order = [ 'homeAttack', 'visitorAttack' ];
            if ( _.random( 0, 1 ) == 1 ) {
                order = [ 'visitorAttack', 'homeAttack' ];
            }
        }

        var moves = _.map( order, function( move ) {
            return this[ move ]();
        }, this );

        this.homeName = null;
        this.visitorName = null;
        return moves;
    },

    homeAttack: function( name ) {
        return this.home.attack( name || this.homeName, this.visitor );
    },

    visitorAttack: function( name ) {
        if ( this.aiBattle ) {
            return this.visitor.counterAttack( this.home );
        } else {
            return this.visitor.attack( name || this.visitorName, this.home );
        }
    },

    other: function( pokemon ) {
        if ( pokemon.id == this.home.id ) {
            return this.visitor;
        } else {
            return this.home;
        }
    },

    started: function() {
        return this.visitor && this.home;
    },

    battling: function() {
        return this.visitor.hp && this.home.hp;
    },

    toString: function() {
        return this.home.speed + ' @ ' + this.home.hp + ' vs ' + this.visitor.name + ' @' + this.visitor.speed;
    }
});

module.exports = Battle;
