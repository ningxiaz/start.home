function RandomData(options) {

	// setup the options!
	var options     = options             || {},
		start_date  = options.start_date  || 'Jan 1 2012',
		end_date    = options.end_date    || 'Jan 1 2013',
		cutoff      = options.cutoff      || 'July 2, 2012',
		count       = options.count       || 100,
		step		= options.step		  || null; // see http://momentjs.com/docs/durations/creating/

	start_date = moment(start_date);
	end_date   = moment(end_date);
	cutoff     = moment(cutoff);

	var range   = dateRange(start_date, end_date, count),
		entries = range.map(buildSnapshot);

	return entries;

	// returns an array of [count] dates between [start] and [end] (inclusive)
	function dateRange(start, end, count) {
		var range;

		range = [];
		count--;

		if (step) {
			step = moment.duration(step)

			do {
				range.push(start.clone());
				start.add(step);
			} while (start <= end);

		} else {
			step = moment.duration((end - start) / count);

			for (var i = 0; i <= count; i++) {
				range.push(start.clone().add(i*step.as('ms')))
			};
		}

		return range;
	}

	// makes an array of dummy data for each outlet (only 10 of 26) or water
	// meter in the house for a single snapshot
	function makeArray(consumer) {
		var electric_meters = [
			{ title: 'Kitchen outlets',     room: 'Kitchen',     type: 'outlets'   },
			{ title: 'Dishwasher',          room: 'Kitchen',     type: 'appliance' },
			{ title: 'Refrigerator',        room: 'Kitchen',     type: 'appliance' },
			{ title: 'Garbage disposal',    room: 'Kitchen',     type: 'appliance' },
			{ title: 'Kitchen lights',      room: 'Kitchen',     type: 'lights'    },
			{ title: 'Living room lights',  room: 'Kitchen',     type: 'lights'    },
			{ title: 'Studio lights',       room: 'Studio',      type: 'lights'    },
			{ title: 'Bedroom lights',      room: 'Bedroom',     type: 'lights'    },
			{ title: 'Exterior lights',     room: 'Outside',     type: 'lights'    },
			{ title: 'Living room outlets', room: 'Living room', type: 'outlets'   }
		];

		var water_meters = [
			{ title: 'Laundry',       room: 'Laundry',  type: 'appliance', has_temp: true  },
			{ title: 'Bathroom sink', room: 'Bathroom', type: 'faucet',    has_temp: true  },
			{ title: 'Toilet',        room: 'Bathroom', type: 'bathroom',  has_temp: false },
			{ title: 'Shower',        room: 'Bathroom', type: 'bathroom',  has_temp: true  },
			{ title: 'Fridge',        room: 'Kitchen',  type: 'appliance', has_temp: false },
			{ title: 'Kitchen sink',  room: 'Kitchen',  type: 'faucet',    has_temp: true  },
			{ title: 'Dishwasher',    room: 'Kitchen',  type: 'appliance', has_temp: false },
			{ title: 'Irrigation',    room: 'Outside',  type: 'appliance', has_temp: false }
		];

		var meters = (consumer == 'electric') ? electric_meters : water_meters;

		return meters.map(function(meter) {
			return generateConsumptionDatum(meter.title, 
											meter.room, 
											meter.type, 
											consumer,
											meter.has_temp)
		})
	}

	// returns a fake datum
	function generateConsumptionDatum(title, room, type, consumer, has_temp) {
		var stats;

		if (consumer == 'electric') {
			// electric-specific stats
			stats = {
				avg_wattage: Math.random(),
			}
		} else if (consumer == 'water') {
			// water-specific stats
			stats = {
				avg_flow: Math.random(),
			}

			if (has_temp) {
				stats.hot = Math.random();
				stats.cold = Math.random();
			}
		}

		return {
			title: title,
			room: room,
			description: "A randomly generated datum",
			type: type,
			stats: stats
		}
	}

	// builds a snapshot for a specific timestamp
	// if [date] occurs after cutoff, this only creates a random target
	function buildSnapshot(date) {
		if (date <= cutoff) {
			var electric = makeArray('electric'),
				water    = makeArray('water'),
				stats    = {
					total_wattage: electric.reduce(function(prev, curr) {
						return prev + curr.stats.avg_wattage;
					}, 0),

					total_flow: water.reduce(function(prev, curr) {
						return prev + curr.stats.avg_flow;
					}, 0),
				},

				target = {
						wattage: stats.total_wattage + Math.random() - .5,
						flow:    stats.total_flow    + Math.random() - .5,
				}

			target.wattage_was_met = (target.wattage >= stats.total_wattage);
			target.flow_was_met = (target.flow >= stats.total_flow);

			return {
				timestamp: date.format(),
				electric:  electric,
				water:     water,
				stats:     stats,
				target:    target
			}
		} else {
			return {
				timestamp: date.format(),
				target: {
					wattage: Math.random() * 5,
					flow:    Math.random() * 5
				}
			}
		}
	}
}