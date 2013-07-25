# House controls

This document should outline the API exposed to the front-end by the Express server. In the interest of time, I think it's important that we focus on implementing the house controls more than any data requests (see data.md for more details on that).

Is it better to use socket.io to control the house? or would a RESTful API be easier to implement and maintain?

## The List™

The things we can control in the house, grouped by room.

### Living Room
- Living Room Uplights*
- Living Room Downlights* (1X2)
- Living Room Fan
- Living Room Shades+
- Living Room NorthWindows+
- Living Room SouthWindow+
- Living Room Outlets

### Kitchen
- Kitchen Uplights*
- Kitchen Undercab (w/ Split thing)
- Kitchen Pendant* (4x1)
- Kitchen NorthWindows+
- Kitchen SouthWindow+
- Kitchen Outlets

### Hallway
- Hallway Downlight*


### Studio
- Studio Uplight*
- Studio Fan
- Studio Downlights* (1X3)
- Studio NorthWindows+
- Studio Outlets

### Bedroom
- Bedroom Sconce* (1x4)
- Bedroom Outlets

### Bathroom
- Bathroom Skylight (1x2)
- Bathroom Shower Light
- Bathroom Shower Fan
- Bathroom Mirror Light (1x2)
- Bathroom Downlight
- Bathroom Outlets

### Exterior
- Exterior Core Wash*
- Exterior Front Door Light
- Exterior Back Sconce (1x3)
- Exterior Ramp Light
- Exterior Outlets

*Dimming
+SPDT 