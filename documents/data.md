# Data in the house

This document should discuss how we want things to work with data on the frontend. 

So far I think each data update from the server should look something like this:

```javascript
{
	timestamp: '2012-01-01 ...',
	electric: [
		{
			id: 1, // probably not necessary
			title: 'Kitchen outlets',
			room: 'Kitchen',
			description: "Maybe this could be useful?",
			type: 'outlets',
			stats: {
				avg_wattage: 123,
				min: 3,
				max: 200
			}
		},
		...
	],
	water: [
		{
			title: 'Kitchen sink',
			room: 'Kitchen',
			description: "Probably could be useful.",
			type: 'faucet',
			stats: {
				// these stats could probably be the total usage since the last data update
				// we can then get some better conversion like gal/hour
				avg_flow: 70,
				hot: 20,
				cold: 50,
			}
		},
		...
	]
	stats: {
		currrent: 500,
		min: 20, 
		max: 400
	}
}
```

Every ten minutes or so, one of these bundles of data would be emitted by the server through socket.io. The iPad would then update all of the interface widgets accordingly (possibly through Ractive.js?). On any app refresh from the iPad, we need a solid way to get _all_ of the data loaded again. I figure `socket.on('connection')` is a great way to handle this initial transmission—just a little afraid we might kill the iPad if there's a ton of data to load down the line. We should do some stress tests to see.



## Monitoring

The things we can monitor throughout the house. 

### Electricity

- Kitchen outlets
- Dishwasher
- Refrigerator
- Garbage disposal
- Kitchen lights
- Living room lights
- Studio lights
- Bedroom lights
- Exterior lights
- Living room outlets
- Studio outlets
- Bedroom outlets
- Bathroom outlets
- Exterior outlets
- Laundry
- Cooktop
- Oven
- Water heater
- Water tank pump
- Irrigation pump
- Sump pump
- HRV
- Control system
- Window actuators
- Shade motors
- Car charger
- Dryer

### Water

- Laundry (Cold)
- Laundry (Hot)
- Bathroom sink (Cold)
- Bathroom sink  (Hot)
- Toilet
- Shower (Cold)
- Shower (Hot)
- Fridge
- Kitchen sink (Cold)
- Kitchen sink (Hot)
- Dishwasher
- Irrigation