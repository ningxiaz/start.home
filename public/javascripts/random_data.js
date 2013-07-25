// this does nothing so far...

function RandomData(start_date, end_date, num_entries) {
	start_date = moment(start_date);
	end_date   = moment(end_date);

	step = end_date - start_date;
	step /= num_entries;

	var entries = [];

	var first_entry = {
		breakers: {
			'Kitchen outlets': Math.random(),

		}
	}

	for (var i = 1; i < num_entries; i++) {
		var new_entry = {

		}
		start_date.add('ms', step).format()

	};
}	

RandomData(moment().startOf('year'), moment().endOf('year'), 100);