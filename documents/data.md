# Data in the house

This document should discuss how we want things to work with data on the frontend. 

The updates are looking a little trickier than just a mega update every ten minutes. It seems that some bits of data should be updated on-the-fly and some bits can be updated as little as once a day.

I propose the following scheme:

#### Instant updates

Pretty much anything that reflects the immediate system status of the house. If a light is on, we want it to be on immediately in the interface. If the house is currently consuming _X_ kW, we want to say it's consuming _X_ kW, not some number from 5 minutes ago.

- Current usage
- Current house status
	- Climate (temp, humidity, etc.)
	- Appliances
- Notifications

#### Interval updates

These intervals are better for pushing incremental usage statistics. I think we should aim to push them more than every 10 minutes (maybe every 5). 

- Statistics over time

#### As-we-go updates

These updates are for things that might need to get updated when things change

- Weather (and other meteorological data)
- Re-calculated goals

### Enter Firebase

Firebase is a realtime backend as a service. They call it "Dropbox for your app's data". They offer a free tier that should be more than enough for our needs (unless we anticipate > 100 iPads in the house).

Firebase provides some nice structure for pushing and watching for updates to various points in the data. It has a javascript API and support for node.

This extra layer of abstraction might seem a little unnecessary at first, but it actually simplifies our backend work quite a bit. Instead of focusing on how to transport data in realtime and building out our own hooks, we can instead focus straight on the structure of our data and the events that are important to us (getting new data from the house, receiving new settings from the user). The server can listen for changes to the controls section as much as the front-end can listen for changes to the data section.

I think this is the right way to go. Especially with the limited time we have left.

Firebase means we can skip worrying about socket.io. It even means we can host the front-end as a static html file completely separate from node if we want to. The only issue is that Firebase requires a connection to the internet (but so does weather data, etc.).

#### Firebase data organization:

I propose something like the following:

- Controls
	- scenes
	- lights
	- outlets
	- HVAC
- Goals (ideally stored as functions mapping Date object -> value, but this would be hard... we just need to find a way to consistently calculate values along a curve shaped by some parameters -- who's working on this?)
	- electric
	- water
- Usage (there's a challenge in figuring out how to aggregate these numbers to avoid piling up > 300,000 10 minute snapshots every year while still providing some useful granularity)
	- records (max and min values?)
	- last 24 hours (10 minute snapshots)
	- 24 hours before last (for comparing in the ring)
	- last week (1 hour snapshots)
	- last month (2 hour snapshots?)
	- last year	(1 day snapshots?)

#### What that looks like:

```javascript
start-home: {
	usage: {
		snapshots: {
			-IKo28nwJLH0Nc5XeFmj: {
				timestamp: '01-01-2013 3:00pm',
				stats: {
					electric: {
						avg_power: 123, // in kW
						total_energy: 123 // in kWH
					},
					water: {
						avg_flow: 123, // in gal
						total_flow: 123 // in gal
					}
				},
				electric: {
					[outletID]: {
						avg_power: 123,
						total_energy: 123
					},
					...
				},
				water: {
					...
				}
			}
			// more 10-minute snapshots
		},
		aggregates: {
			// at the end of each day, the server could sum up each snapshot
			daily: {
				-IKo28nwJLH0Nc5XeFmj: {
					timestamp: '01-01-2013',
					stats: {
						electric: {
							avg_power: 123, // average of all 10-minute snapshots for the day
							total_power: 123 // sum of all totals
						},
						water: {
							// same treatment
						}
					}
				}
				// more daily snapshots
			},
			// and the same for each week and so on
			weekly: {
				...
			},
			etc...
		}
	},
	goals: {
		// we can't actually store functions in Firebase, so we need to figure out how to deterministically generate the same goal line each time based on parameters... this is tricky
		electric: function(timestamp) {
			return number_based_on_timestamp;
		},
		water: {
			...
		},
		behaviors: {
			// not sure how this would be fleshed out yet
		}
	},
	// overview provides details on the status of each fixture in the house
	// we can also use this to control the fixtures.
	// setting lights.2 = 30 would prompt the server to change whichever light with ID = 2 to 30% brightness... something like that
	// this is awesome because if we set up the hooks on the server right, we can use Firebase in a ton of ways in the future (e.g. a RESTful API for an iPhone-based remote)
	overview: {
		lights: {
			[lightID]: 50,
			[lightID]: 20,
			[lightID]: true // on-off only
		},
		fans: {
			[fanID]: 2, // assuming it has multiple speeds [0-3]
		},
		// we can specify which outlets are read-only and which are read/write through Firebase permissions
		outlets: {
			...
		}
	},
	// we can denormalize the fixtures in the house to structure the data conveniently for Firebase
	// see https://www.firebase.com/blog/2013-04-12-denormalizing-is-normal.html for some examples
	fixtures: {
		outlets: {
			[outletID]: {
				title: 'Kitchen outlets',
				room: 'Kitchen',
	            description: "Maybe this could be useful?",
	            type: 'outlets',
			}
		},
		// faucets, etc...
	},
	notifications: {
		// we can have a list of notifications!
	},
}
```

What about...

```javascript
start-home: {
	snapshots: {
		8-1-2013: {
			summary: {
				sunrise: 7 am,
				sunset: 8 pm,
				electric: {
					average: 123,
					total: 123
				},
				water: {
					average: 123,
					total: 123
				},
				climate: {
					humidity: 123,
					temperature: 123,
					// inside and out?
				}
			},
			hourly: {
				// ...
			},
			all: {
				// ...
			}
		}
	}
}
	

---

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