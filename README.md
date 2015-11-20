proj1
=====

Game of Life

download to test

Highlights:


User-selected step time, square side length, rows, and columns
proj1.js lines 325-354
makes sure input values are integers


log data to console button
proj1.js lines 391-406
outputs to console dictionary mapping row,column to color index for all squares that are alive


17 fun-filled preset hard-coded starting positions
presets.js
proj1.js lines 357-377


multi-color functionality
presets.js
proj1.js
follows same rules as regular Conway when using only one color
cells die from overcrowding by any species
cells only live/are born due to members of own species



Challenges:
code was written in one file under a single anonymous function in order to prevent user access to ANY variables via the console
multi-color was a fun and unique idea I came up with. it follows the same rules as regular Conway, with some extra rules for interaction between different colors
the hardest part was coming up with the preset conditions
the random thing was easy, of course, but I think I misunderstood the directions until someone explained it to me. a random board satisfies the "several starting positions" requirement
still, even after I saw that I didn't need the hard-coded starting positions, I kept going because it was fun
I also wrote a supplemental python code to take as input ANY image, and it will convert it to a preset instance that can easily be imported by the game board
Handling mouse clicks was very very tricky for me
I decided to challenge myself by using a border for the game board in addition to a border for each cell. this was really tough to account for sometimes.
also, when zooming in or out using google chrome, the clicking gave unexpected results, but everything works fine even when zoomed using safari



How To Use:
hopefully, all the buttons are easy to see and use
the user can specify a step time, number of rows, number of columns, and side length of a square
the user can also select colors to use, randomize the board using those colors or genocide the board to make all squares one color
clicking a tile cycles through available colors for that square
you can log the data for squares that are not white to the console to be used for presets
finally, you can load presets using the drop-down and selection button