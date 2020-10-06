class GeoPolitical {
  constructor() {
    var $this = this;

    function dRand(count, sides) {
      var count = count || 1;
      var sides = sides || 6;
      var total = 0;
      for (var i = 0; i < count; i++) {
        total += random(1, sides);
      }
      return total;
    }
    const SEED = 0;
    var srand = new Math.seedrandom(SEED);

    this.generateCharacterStats = function() {
      var rolls = [0, 0, 0, 0, 0, 0];
      var stats = {
        'str': 0,
        'dex': 0,
        'con': 0,
        'int': 0,
        'wis': 0,
        'cha': 0
      }
      var abilityModifierTotal = -10;
      while (rolls[5] < 12 || abilityModifierTotal <= -3) {
        rolls = [];
        for (var i = 0; i < 6; i++) {
          rolls.push(dRand(3, 6));
        }
        rolls.sort((a, b) => a - b);
        abilityModifierTotal = rolls.reduce((t, r) => abilityModifier(r) + t, 0);
        if (rolls[5] < 12 || abilityModifierTotal <= -3) {
          console.log('rerolling');
        }
      }
      stats.str = rolls[5];
      stats.dex = rolls[4];
      stats.con = rolls[3];
      stats.int = rolls[2];
      stats.wis = rolls[1];
      stats.cha = rolls[0];
      console.log(stats);
    };

    function random(min, max) {
      min = min || 1;
      max = max || 100;
      return Math.round(srand() * (max - min) + min);
    }
    this.percentile = function() {
      return random(1, 100);
    };

    function abilityModifier(score) {
      return Math.floor(score / 2) - 5;
    }
    this.generatePopulationCenter = function() {
      var config = {
        'size_percentiles': [],
        'max_levels': {
          'barbarian': {
            'type': 'pc',
            'die': 4,
            'count': 1
          },
          'bard': {
            'type': 'pc',
            'die': 6,
            'count': 1
          },
          'cleric': {
            'type': 'pc',
            'die': 6,
            'count': 1
          },
          'druid': {
            'type': 'pc',
            'die': 6,
            'count': 1
          },
          'fighter': {
            'type': 'pc',
            'die': 8,
            'count': 1
          },
          'monk': {
            'type': 'pc',
            'die': 4,
            'count': 1
          },
          'paladin': {
            'type': 'pc',
            'die': 3,
            'count': 1
          },
          'ranger': {
            'type': 'pc',
            'die': 3,
            'count': 1
          },
          'rogue': {
            'type': 'pc',
            'die': 8,
            'count': 1
          },
          'sorcerer': {
            'type': 'pc',
            'die': 4,
            'count': 1
          },
          'wizard': {
            'type': 'pc',
            'die': 4,
            'count': 1
          },
          'adept': {
            'type': 'npc',
            'npcPercent': .005,
            'die': 6,
            'count': 1
          },
          'aristocrat': {
            'type': 'npc',
            'npcPercent': .005,
            'die': 4,
            'count': 1
          },
          'commoner': {
            'type': 'npc',
            'npcPercent': .91,
            'die': 4,
            'count': 4
          },
          'expert': {
            'type': 'npc',
            'npcPercent': .03,
            'die': 4,
            'count': 3
          },
          'warrior': {
            'type': 'npc',
            'npcPercent': .05,
            'die': 4,
            'count': 2
          }
        },
        'thorp': {
          'community_size_modifier': -3,
          'community_size_modifier_count': 1,
          'min_population': 20,
          'max_population': 80,
          'power_center_modifier': 2
        },
        'hamlet': {
          'community_size_modifier': -2,
          'community_size_modifier_count': 1,
          'min_population': 81,
          'max_population': 400,
          'power_center_modifier': 2
        },
        'village': {
          'community_size_modifier': -1,
          'community_size_modifier_count': 1,
          'min_population': 401,
          'max_population': 900,
          'power_center_modifier': 2
        },
        'small_town': {
          'community_size_modifier': 0,
          'community_size_modifier_count': 1,
          'min_population': 901,
          'max_population': 2000,
          'power_center_modifier': 2
        },
        'large_town': {
          'community_size_modifier': 3,
          'community_size_modifier_count': 1,
          'min_population': 2001,
          'max_population': 5000,
          'power_center_modifier': 2
        },
        'small_city': {
          'community_size_modifier': 6,
          'community_size_modifier_count': 2,
          'min_population': 5001,
          'max_population': 12000,
          'power_center_modifier': 2
        },
        'large_city': {
          'community_size_modifier': 9,
          'community_size_modifier_count': 3,
          'min_population': 12001,
          'max_population': 25000,
          'power_center_modifier': 2
        },
        'metropolis': {
          'community_size_modifier': 12,
          'community_size_modifier_count': 4,
          'min_population': 25001,
          'max_population': 50000,
          'power_center_modifier': 2
        }
      };
      //
      var sizePercentile = this.percentile();
      console.log('sizePercentile:' + sizePercentile);
      var community_size;
      if (sizePercentile <= 10) {
        community_size = 'thorp';
      } else if (sizePercentile <= 30) {
        community_size = 'hamlet';
      } else if (sizePercentile <= 50) {
        community_size = 'village';
      } else if (sizePercentile <= 70) {
        community_size = 'small_town';
      } else if (sizePercentile <= 85) {
        community_size = 'large_town';
      } else if (sizePercentile <= 95) {
        community_size = 'small_city';
      } else if (sizePercentile <= 99) {
        community_size = 'large_city';
      } else {
        community_size = 'metropolis';
      }
      var populationClasses = {};
      var populationTotal = random(config[community_size].min_population, config[community_size].max_population);
      var runningPopulationTotal = 0;
      //generate pc classes and npc classes above level 1
      Object.entries(config.max_levels).forEach(([className, dice]) => {
        populationClasses[className] = {};
        var max_level_count = config[community_size].community_size_modifier_count;
        for (var mlc = 0; mlc < max_level_count; mlc++) {
          var maxLevel = config[community_size].community_size_modifier;
          for (var i = 0; i < dice.count; i++) {
            maxLevel += random(1, dice.die);
            //console.log(maxLevel);
            for (var nLevel = maxLevel, cLevel = 1; nLevel > 1; nLevel /= 2, cLevel *= 2) {
              //don't calculate level 1 npc classes this way
              if (dice.type == 'npc' && Math.round(nLevel) == 1) {
                continue;
              }
              populationClasses[className][Math.round(nLevel)] = populationClasses[className][Math.round(nLevel)] || 0;
              populationClasses[className][Math.round(nLevel)] += cLevel;
              runningPopulationTotal += cLevel;
              this.generateCharacterStats();
            }
          }
        }
      });
      //generate the lvl 1 npc classes
      var remainingPopulation = populationTotal - runningPopulationTotal;
      Object.entries(config.max_levels).forEach(([className, dice]) => {
        if (dice.type == 'npc') {
          populationClasses[className][1] = Math.round(remainingPopulation * dice.npcPercent);
        }
      });
      console.log(populationClasses);
    };
  }
}