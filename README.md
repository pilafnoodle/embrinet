https://embri.net/

Greetings!
This is my website for Embri, with a goofy 2D water ripple sim as a visual.

An opacity layer controls how much of each pixel shows through, calculated with this formula:
brightnessArray[i][j] = Math.min(255,lastBrightnessArray[i][j]*((LastBrightnessCoeff * (1 - VertProp)))
                 + ( downBrightness*VertProp*0.6 + upBrightness*VertProp*0.6 + HorizProp*rightBrightness)/(VertProp+HorizProp));

Vertical propagation controls how much pixels grab brightness from neighboring pixels above and below it
Horizontal propagation controls how much pixels grab brightness from the pixel to the right
LastBrightness Coefficient controls how much the last pixel's brightness affects the current one

Currently there is only support for left going fish, I hope to add right going fish as well and do collision math with the ripples.

