(function () {

	// --- HTML TOOLS ---

	// grabs useful elements from the html
	// *color*_input refers to checkboxes
	var blue_input = document.getElementById("blue");
	var yellow_input = document.getElementById("yellow");
	var red_input = document.getElementById("red");
	var green_input = document.getElementById("green");
	var brown_input = document.getElementById("brown");
	var orange_input = document.getElementById("orange");

	var step_time_input = document.getElementById("step_time");
	var rows_input = document.getElementById("rows");
	var columns_input = document.getElementById("columns");
	var factor_input = document.getElementById("factor");

	var canvas = document.getElementById("canvas");
	var play_toggle_button = document.getElementById("play_toggle_button");
	var message = document.getElementById("message");
	var selection = document.getElementById("selection");



	// presets is a list of precoded images (found in presets.js) to play the game of life, along with the categories to use
	// the for loop iterates through, adding presets to the corresponding categories, and adding those choices to the select html element
	var presets = ["Divine",jesus,helix,flareon,hail,"Flags",america,mexico,china,japan,france,italy,germany,california,"Bands",smashing,peppers,led,guns,sex_pistols];

	var optgroup;
	for(var i = 0;i < presets.length; i++){
		if (typeof(presets[i])=="string"){
			optgroup = document.createElement("optgroup");
			optgroup.label = presets[i];
			selection.appendChild(optgroup);
			presets = presets.slice(0,i).concat(presets.slice(i+1,presets.length));
			i -= 1
		}
		else{
			var option = document.createElement("option");
			option.text = presets[i].name;
			optgroup.appendChild(option);
		}
	}

	var step_time = parseInt(step_time_input.value);
	var rows = parseInt(rows_input.value);
	var columns = parseInt(columns_input.value);
	var factor = parseInt(factor_input.value);

	// --- END OF HTML TOOLS ---


	// game_border is the width of the black border around the game
	// cell_border is the width of the grey borders around cells
	var game_border = 10;
	var cell_border = 2;

	// dictionary mapping strings to the HTML element pointer
	var color_input_array = {'blue':blue_input,'yellow':yellow_input,'red':red_input,'green':green_input,'brown':brown_input,'orange':orange_input};

	// dictionary mapping color name to color to be changed to when clicked or upon genocide
	var next_color_dict = {"black":blue,"blue":yellow,"yellow":red,"red":green,"green":brown,"brown":orange,"orange":white,"white":black};

	// chooses random element from a list
	function randomFrom(list){
		return list[Math.floor(Math.random() * list.length)];
	}

	function get_next_color(previous_color){
		var next_color = next_color_dict[previous_color.name];
		if(['white','black'].indexOf(next_color.name) > -1){
			return next_color;
		}
		if(color_input_array[next_color.name].checked){
			return next_color;
		}
		return get_next_color(next_color);
	}


	// provided code - draws rectangles of given color
	var context = canvas.getContext('2d');
	function apply_color(context, color) {
		if (color) {
			context.strokeStyle = 'rgba(' + color.red + ',' + color.green + ',' + color.blue + ', 1)';
		}
	}

	function apply_fill_color(context, color) {
		if (color) {
			context.fillStyle = 'rgba(' + color.red + ',' + color.green + ',' + color.blue + ', 1)';
			context.fill();
		}
	}

	function draw_rectangle(context, x, y, width, length, line_width, line_color, fill_color) {
		context.beginPath();
		context.rect(x, y, width, length);
		context.lineWidth = line_width;
		apply_color(context, line_color);
		apply_fill_color(context, fill_color);
		context.closePath();
		context.stroke();
	}


	// dictionary mapping [row,column] to square element
	// Square takes as input a row and column
	var squares = {};
	var Square = function (i,j) {
		return {
			i:i,
			j:j,
			counts: {},

			neighbors: function(){
				return find_neighbors(i,j);
			},

			reset_counts: function(){
				this.num_neighbors = 0;
				this.counts = {};
				for(var i = 0;i<all_colors.length;i++){
					this.counts[all_colors[i].name] = 0;
				}
			},

			apply_color: function(color){
				if(color === undefined){
					color = white;
				}
				this.color = color;
				this.redraw();
			},

			redraw: function(){
				var x = j*factor+game_border+cell_border/2;
				var y = i*factor+game_border+cell_border/2;
				draw_rectangle(context,x,y,factor,factor,cell_border,grey,this.color);
			},

			// follows rules of Game of Life with multiple species/colors, which matches Game of Life with only 1 color
			update: function(){
				if (this.color.name != "white" && (this.counts[this.color.name] < 2 || this.num_neighbors > 3)){
					this.apply_color(white);
				}
				var color = false;
				for (var i = 1; i < all_colors.length; i++){
					if(this.counts[all_colors[i].name] == 3){
						if (color){
							return;
						}
						color = all_colors[i];
					}
				}
				if (color){
					this.apply_color(color);
				}
			}
		}
	}


	// does the given function for each i, j in rows, columns, usually used for doing a function on every square in the visible grid
	function doForAll(f){
		for (var i = 0; i < rows; i++){
			for (var j = 0; j < columns; j++){
				f(i,j);
			}
		}
	}


	// takes as input a row and column, and outputs 2d neighbors within the visible grid
	function find_neighbors(i,j){
		var neighbor_list = [];
		var iter_rows = neighbor_helper(i,rows);
		var iter_columns = neighbor_helper(j,columns);

		for (var row = 0; row < iter_rows.length; row ++){
			for (var column = 0; column <  iter_columns.length; column ++){
				var neighbor = [iter_rows[row],iter_columns[column]];
				if (neighbor[0] != i || neighbor[1] != j){
					neighbor_list.push(neighbor);
				}
			}
		}
		return neighbor_list;
	}

	function neighbor_helper(index,max){
		var list = [index];
		if (index){
			list.push(index-1);
		}
		if(max-index-1){
			list.push(index+1);
		}
		return list;
	}


	// resizes the canvas to match the size of the board
	// adds a listener for mouseclicks
	// draws the border, then fills squares
	function build_world(){
		var width = factor*columns+game_border+cell_border;
		var height = factor*rows+game_border+cell_border;

		canvas.width = width + game_border;
		canvas.height = height + game_border;

		canvas.addEventListener("mousedown", manual, false);

		draw_rectangle(context, game_border/2, game_border/2, width, height, game_border, black, white);

		fill_squares();
	}


	// if a square doesn't exist, draw it and color it white
	// otherwise, just redraw it with the same color it was
	function fill_squares(){
		doForAll(function(i,j) {
			if(!squares[[i,j]]){
				var square = Square(i,j);
				square.apply_color(white);
				squares[[i,j]] = square;
			}
			else{
				squares[[i,j]].redraw();
			}
		});
	}


	// manages click events - colors that square to the next color in the dictionary
	function manual(event){
		var x = event.layerX-game_border;
		var y = event.layerY-game_border;
		var column = Math.floor(x/factor);
		var row = Math.floor(y/factor);
		if (x%factor >= cell_border && y%factor >= cell_border){
			var square = squares[[row,column]];
			square.apply_color(get_next_color(square.color));
			message.innerHTML = "Playing God, I see";
		}
	}


	// handles each step - finds neighbors for each square, then updates each square
	function step() {
		doForAll(function(i,j){
			var key = [i,j];
			var square = squares[key];
			var neighbors = square.neighbors();
			square.reset_counts();
			for(var n = 0;n < neighbors.length;n++){
				var neighbor = squares[neighbors[n]];
				if (neighbor.color != white){
					square.counts[neighbor.color.name] ++;
					square.num_neighbors ++;
				}
		}
		});

		doForAll(function(i,j){
			squares[[i,j]].update()
		});
				
	}


	// handles play/pause toggler
	var interval;
	function play(){
		interval = setInterval(function(){step()}, step_time);
		play_toggle_button.innerHTML = "Pause";
		message.innerHTML = "Playing";
	}

	function pause(){
		clearInterval(interval);
	    play_toggle_button.innerHTML = "Play";
		message.innerHTML = "Paused";
	}

	function play_toggle(){
	    if (play_toggle_button.innerHTML=="Play"){
	    	play()
	    }
	    else {
	    	pause();
	    }
	}


	// randomizes all visible squares
	function randomize(){
		pause();
		var active_colors = [white,black];
		for(var i = 2;i < all_colors.length;i++){
			if(color_input_array[all_colors[i].name].checked){
				active_colors.push(all_colors[i]);
			}
		}
		doForAll(function(i,j){
			squares[[i,j]].apply_color(randomFrom(active_colors));
		});
		
		message.innerHTML = "Random World Initiated";
	}


	// colors all visible squares to the next color as determined by the top left square
	function genocide(){
		pause();
		var genocide_color = get_next_color(squares[[0,0]].color);
		doForAll(function(i,j){
			squares[[i,j]].apply_color(genocide_color);
		})
		message.innerHTML = "Genocide!"
	}


	// if each input value is an integer, updates the value, and rebuilds the world if necessary
	function update_values(){
		if (parseInt(step_time_input.value)>0){
			step_time = parseInt(step_time_input.value);
			play_toggle();
			play_toggle();
		}
		else{
			step_time_input.value = step_time;
		}

		if (parseInt(rows_input.value)>0 && parseInt(columns_input.value)>0){
			rows = parseInt(rows_input.value);
			columns = parseInt(columns_input.value);
			build_world();
		}
		else{
			rows_input.value = rows;
			columns_input.value = columns;
		}

		if (parseInt(factor_input.value)>0){
			factor = parseInt(factor_input.value);
			build_world();
		}
		else{
			factor_input.value = factor;
		}
		message.innerHTML = "Values Updated";
	}


	// loads the selected picture
	function load_preset(){
		var preset = presets[selection.selectedIndex];
		if (play_toggle_button.innerHTML=="Pause") {
			pause();
		}
		squares = {};
		step_time_input.value = preset.step_time;
		rows_input.value = preset.rows;
		columns_input.value = preset.columns;
		factor_input.value = preset.factor;
		check_colors(preset.checked_colors);
		update_values();

		doForAll(function(i,j){
			var color = preset.squares[[i,j]]
			squares[[i,j]].apply_color(color);
		});

		message.innerHTML = preset.name+" Loaded";
	}


	// updates checked colors according to the preset
	function check_colors(checked_colors){
		for(var color_name in color_input_array){
			color_input_array[color_name].checked = false;
		}
		for (var i = 0;i<checked_colors.length;i++){
			color_input_array[checked_colors[i].name].checked = true;
		}
	}


	// logs squares dictionary to console if the square isn't white
	function log(){
		var string = "\t{";

		doForAll(function(i,j){
			var key = i+','+j;
			var color_name = squares[key].color.name;
			if (color_name != "white"){
				string += '"'+key+'":'+color_name+',';
			}
		});

		string += '},';
		console.log(string);
		message.innerHTML = "Preset Data Logged to Console";
	}

	// initializes the world and randomizes it
	build_world();

	play_toggle_button.onclick = play_toggle;
	document.getElementById("step_button").onclick = step;
	document.getElementById("log_button").onclick = log;
	document.getElementById("load_button").onclick = load_preset;
	document.getElementById("update_values_button").onclick = update_values;
	document.getElementById("randomize_button").onclick = randomize;
	document.getElementById("genocide_button").onclick = genocide;


	// if true, carries out tests at the end of the code
	var testing = false;
	if (testing){
		var rows = 10;
		var columns = 10;

		// check genocide
		var genocide_test = "passed";
		genocide();
		doForAll(function(i,j){
			if(squares[[i,j]].color != squares[[0,0]].color){
				genocide_test = "failed";
			}
		})

		// check find_neighbors
		var neighbors_test = "passed";
		function check_neighbors(){
			if(found_neighbors.length != correct_neighbors.length){
				return "failed";
			}
			for(var i = 0; i < found_neighbors.length; i++){
				if(!(found_neighbors[i]) in correct_neighbors){
					neighbors_test = "failed";
				}
			}
		}
		var found_neighbors = find_neighbors(5,5);
		var correct_neighbors = [[4,4],[4,5],[4,6],[5,4],[5,6],[6,4],[6,5],[6,6]];
		check_neighbors();
		found_neighbors = find_neighbors(0,0);
		var correct_neighbors = [[0,1],[1,0],[1,1]];
		check_neighbors();
		found_neighbors = find_neighbors(9,9);
		var correct_neighbors = [[8,8],[8,9],[9,8]];
		check_neighbors();


		// check methods of Square
		var squares_test = "passed";
		var test_square = Square(6,5);
		if (test_square.i != 6){
			squares_test = "failed"
		}
		if (test_square.j != 5){
			squares_test = "failed"
		}
		test_square.counts[white] = 3;
		test_square.reset_counts();
		for(var color in test_square.counts){
			if (test_square.counts[color]){
				squares_test = "failed"
			}
		}

		// check doForAll
		var doForAll_value = 0;
		doForAll(function(i,j){doForAll_value++});
		doForAll_test = (doForAll_value == 100) ? "passed" : "failed";

		update_values();

		console.log("genocide test: "+genocide_test);
		console.log("neighbors test: "+neighbors_test);
		console.log("squares test: "+squares_test);
		console.log("doForAll test: "+doForAll_test);
	}

	randomize();
})();