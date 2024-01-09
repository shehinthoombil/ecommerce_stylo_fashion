var Class = require( 'class.extend' );
var _ = require( 'lodash-node' );

var CRITICAL_MULTIPLIER = 2;

var Move = Class.extend({
    init: function( row ) {
        this.name = row.identifier.toUpperCase();
        this.attackClass = row.damage_class_id;
        this.type = row.type_id;

        this.power = row.power || 10;
    },

    // http://bulbapedia.bulbagarden.net/wiki/Damage
    damage: function( attacker, defender ) {
        var Pokedex = require( './pokedex' );
        var immune = Pokedex.immune( this.type, defender.types );
        if ( immune ) {
            return this.efficacy = 0;
        } else {
            return this.calculate( attacker, defender );
        }
    },

    superEffective: function() {
        return this.efficacy > 1;
    },

    notEffective: function() {
        return efficacy < 1;
    },

    isCritical: function() {
        return this.critical == CRITICAL_MULTIPLIER;
    },

    calculate: function( attacker, defender ) {
        var Pokedex = require( './pokedex' );
        // STAB is the same-type attack bonus. This is equal to 1.5 if the attack is of the same type as the user, and 1 if otherwise.
        var stab = _.contains( attacker.types, this.type ) ? 1.5 : 1;

        // Type can be either 0, 0.25, 0.5, 1, 2, or 4 depending on the type of attack and the type of the defending Pokémon.
        // Multiple types are multiplied with each other.
        this.efficacy = _.reduce( Pokedex.moveEfficacies( this.type, defender.types ), function( total, moveEfficacy ) {
            return total *= ( moveEfficacy / 100 )
        }, 1 );

        this.critical = _.random( 0, 16 ) == 0 ? CRITICAL_MULTIPLIER : 1;

        var modifier = stab * this.efficacy * this.critical * _.random( 0.85, 1 );

        return Math.floor(
            (
                ( ( 2 * attacker.level() + 10 ) / 250 ) *
                ( attacker.attackFor( this.attackClass ) / defender.defenseFor( this.attackClass ) ) *
                this.power +
                2
            ) * modifier
        );
    }
});

module.exports = Move;
