//"use strict"
//var startTime = window.performance.now();

Object.index = function(obj, prop, val) {
	for (var key in obj) {
		if (obj[key][prop] == val) {
			return key;
		}
	}
}

Object.find = function(obj, prop, val) {
	for (var key in obj) {
		if (obj[key][prop] == val) {
			return obj[key];
		}
	}

	return false;
}

Object.maxTime = function(obj, prop) {
	var maxTimeString = "", maxTime;

	for (var key in obj) {
		if (!maxTime || maxTime < new Date(obj[key][prop])) {
			maxTime = new Date(obj[key][prop]);
			maxTimeString = obj[key][prop];
		}
	}
	return maxTimeString;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }

    return size;
};

Object.time = function(obj) {
	var dates = [], key;
	for (key in obj) {
		dates.push(new Date(obj[key].time));
	}

	return dates.length ? dates.sort()[dates.length -1].getTime() /1000 : 0;
};

/* Function Library */
var guidance = (function (undefined) {

	var extractKeys = function (obj) {
		var keys = [];

		for (var key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}

		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if(!(keys = extractKeys(open)).length) break;

			keys.sort(sorter);

			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};

			if (!bucket.length) delete open[key];

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var cost = adjacentNodes[vertex],
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return null;
		} else {
			return predecessors;
		}

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;

		while (u) {
			nodes.push(u);
			predecessor = predecessors[u];
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}

			start = end;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var Guidance = function (map) {
		this.map = map;
	}

	Guidance.prototype.findShortestPath = function (start, end) {
		var result;

		if (Object.prototype.toString.call(start) === '[object Array]') {
			result = findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			result = findShortestPath(this.map, [start, end]);
		} else {
			result = findShortestPath(this.map, toArray(arguments));
		}

		return result;
	}

	Guidance.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return Guidance;
})();

(function($){
    $.fn.serializeObject = function(){

        var self = this,
            json = {},
            push_counters = {},
            patterns = {
                "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
                "push":     /^$/,
                "fixed":    /^\d+$/,
                "named":    /^[a-zA-Z0-9_]+$/
            };


        this.build = function(base, key, value){
            base[key] = value;
            return base;
        };

        this.push_counter = function(key){
            if(push_counters[key] === undefined){
                push_counters[key] = 0;
            }
            return push_counters[key]++;
        };

        $.each($(this).serializeArray(), function(){

            // skip invalid keys
            if(!patterns.validate.test(this.name)){
                return;
            }

            var k,
                keys = this.name.match(patterns.key),
                merge = this.value,
                reverse_key = this.name;

            while((k = keys.pop()) !== undefined){

                // adjust reverse_key
                reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                // push
                if(k.match(patterns.push)){
                    merge = self.build([], self.push_counter(reverse_key), merge);
                }

                // fixed
                else if(k.match(patterns.fixed)){
                    merge = self.build([], k, merge);
                }

                // named
                else if(k.match(patterns.named)){
                    merge = self.build({}, k, merge);
                }
            }

            json = $.extend(true, json, merge);
        });

        return json;
    };
})(jQuery);

var numFormat = function(num) {
	//Seperates the components of the number
	var n = num.toString().split(".");
	//Comma-fies the first part
	n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	//Combines the two sections
	return n.join(".");
}

var letterToNumbers = function(string) {
    string = string.toUpperCase();
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', sum = 0, i;
    for (i = 0; i < string.length; i++) {
        sum += Math.pow(letters.length, i) * (letters.indexOf(string.substr(((i + 1) * -1), 1)) + 1);
    }
    return sum;
}

var sigFormat = function(input, type) {
	if (!input) return "";

	var alpha = /^[a-zA-Z]+$/;
	var numeric = /^[0-9]+$/;
	var format = type == "type" ? options.chain.typeFormat || "" : options.chain.classFormat || "";

	for (var x = 0, l = format.length; x < l; x++) {
		if (format[x].match(alpha)) {
			if (format[x].toUpperCase() == "B" && input == "a") {
				return "";
			} else {
				if (format[x] == format[x].toUpperCase()) {
					format = format.substr(0, x) + input.toUpperCase() + format.substr(x + 1, l);
				} else {
					format = format.substr(0, x) + input + format.substr(x + 1, l);
				}
			}
		} else if (format[x].match(numeric)) {
			if (format[x] == 2 && input == "a") {
				return "";
			} else {
				format = format.substr(0, x) + letterToNumbers(input) + format.substr(x +1, l);
			}
		}
	}

	return format;
}

var sigClass = function(name, type) {
	var id = $.map(tripwire.systems, function(system, id) { return system.name == name ? id : null })[0];
	var system = {
		"name": name,
		"class": id ? tripwire.systems[id].class : null,
		"security":  id ? tripwire.systems[id].security : null,
		"type": type};
	var systemType = null;

	if (system.class == 6 || system.name == "Class-6" || (typeof(tripwire.wormholes[system.type]) != "undefined" && tripwire.wormholes[system.type].leadsTo == "Class 6"))
		systemType = "C6";
	else if (system.class == 5 || system.name == "Class-5" || (typeof(tripwire.wormholes[system.type]) != "undefined" && tripwire.wormholes[system.type].leadsTo == "Class 5"))
		systemType = "C5";
	else if (system.class == 4 || system.name == "Class-4" || (typeof(tripwire.wormholes[system.type]) != "undefined" && tripwire.wormholes[system.type].leadsTo == "Class 4"))
		systemType = "C4";
	else if (system.class == 3 || system.name == "Class-3" || (typeof(tripwire.wormholes[system.type]) != "undefined" && tripwire.wormholes[system.type].leadsTo == "Class 3"))
		systemType = "C3";
	else if (system.class == 2 || system.name == "Class-2" || (typeof(tripwire.wormholes[system.type]) != "undefined" && tripwire.wormholes[system.type].leadsTo == "Class 2"))
		systemType = "C2";
	else if (system.class == 1 || system.name == "Class-1" || (typeof(tripwire.wormholes[system.type]) != "undefined" && tripwire.wormholes[system.type].leadsTo == "Class 1"))
		systemType = "C1";
	else if (system.security >= 0.45 || system.name == "High-Sec" || (typeof(tripwire.wormholes[system.type]) != "undefined" && tripwire.wormholes[system.type].leadsTo == "High-Sec" && !system.security))
		systemType = "HS";
	else if (system.security > 0.0 || system.name == "Low-Sec" || (typeof(tripwire.wormholes[system.type]) != "undefined" && tripwire.wormholes[system.type].leadsTo == "Low-Sec" && !system.security))
		systemType = "LS";
	else if ((system.security <= 0.0 && system.security != null) || system.name == "Null-Sec" || (typeof(tripwire.wormholes[system.type]) != "undefined" && tripwire.wormholes[system.type].leadsTo == "Null-Sec"))
		systemType = "NS";

	return systemType;
}

var isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

var getCookie = function(c_name) {
	var c_value = document.cookie;

	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1) {
		c_start = c_value.indexOf(c_name + "=");
	}

	if (c_start == -1) {
		c_value = null;
	} else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);

		if (c_end == -1) {
			c_end = c_value.length;
		}

		c_value = unescape(c_value.substring(c_start, c_end));
	}

	return c_value;
}

var setCookie = function(c_name, value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? "" : "; expires="+exdate.toUTCString());

	document.cookie = c_name + "=" + c_value + ";" + (document.location.protocol == "https:" ? "secure;" : "");
}

/* Function Library */

var CCPEVE = CCPEVE || false;

// Dialog effects
$("#wrapper").addClass("transition");

$(document).on("dialogopen", ".ui-dialog", function (event, ui) {
	// Add additional full screen overlay for 2nd level dialog
	if ($(".ui-dialog:visible").length == 2 && $(this).hasClass("dialog-modal"))
		$("body").append($("<div id='overlay' class='overlay' />").css("z-index", $(this).css("z-index") - 1));
	else if ($("#overlay"))
		$("#overlay").css("z-index", $(this).css("z-index") - 1);

	if (!$(this).hasClass("dialog-noeffect"))
		$("#wrapper").addClass("blur");
});

$(document).on("dialogclose", ".ui-dialog", function (event, ui) {
	if (!$(".ui-dialog").is(":visible"))
		$("#wrapper").removeClass("blur");

	if ($(".ui-dialog:visible").length == 1)
		$("#overlay").remove();
	else if ($("#overlay"))
		$("#overlay").css("z-index", $(this).css("z-index") - 2);

	//if ($(".ui-dialog:visible").length == 0 && options.buttons.follow && viewingSystemID != tripwire.client.EVE.systemID)
	//	window.location = "?system="+tripwire.client.EVE.systemName;
});
// -------------

var options = new function() {
	this.userID = init.session.userID;
	this.background = null;
	this.favorites = [];
	this.grid = {igb: {}, oog: {}};
	this.masks = {active: init.session.corporationID + ".2"};
	this.chain = {typeFormat: null, classFormat: null, gridlines: true, active: 0, tabs: []};
	this.signatures = {pasteLife: 72};
	this.buttons = {follow: false, chainWidget: {viewing: false, favorites: false}, signaturesWidget: {autoMapper: false}};

	// Saves options in both cookie and database
	this.save = function() {
		setCookie("twOptions", JSON.stringify(this.get()), 365);

		$.ajax({
			url: "options.php",
			data: {mode: "set", options: JSON.stringify(this.get())},
			type: "POST",
			dataType: "JSON"
		});
	}

	// Loads options via passed object else cookie
	this.load = function(data) {
		if (data && typeof(data) != "undefined") {
			this.set(this, data);
		} else if (getCookie("twOptions")) {
			this.set(this, JSON.parse(getCookie("twOptions")));
		}

		this.apply();
	}

	// Gets options from this by exluding types == function
	this.get = function() {
		var data = {};

		for (var x in this) {
			if (typeof(this[x]) != "function")
				data[x] = this[x];
		}

		return data;
	}

	// Sets this from passed object
	this.set = function(local, data) {
		for (var prop in data) {
			if (data[prop] && data[prop].constructor && data[prop].constructor === Object) {
				if (local)
					this.set(local[prop], data[prop]);
					//arguments.callee(local[prop], data[prop]);
			} else if (local && typeof(local[prop]) != "undefined") {
				local[prop] = data[prop];
			}
		}
	}

	this.reset = function() {
		for (var x in this) {
			if (typeof(this[x]) != "function") {
				this[x] = JSON.parse(JSON.stringify(this.reset.defaults[x]));
			}
		}
	}

	// Applies settings
	this.apply = function() {
		// Grid layout
		if (CCPEVE ? !isEmpty(this.grid.igb) : !isEmpty(this.grid.oog)) {
			$.each(CCPEVE ? this.grid.igb : this.grid.oog, function() {
				$("#"+this.id).attr({"data-col": this.col, "data-row": this.row, "data-sizex": this.size_x, "data-sizey": this.size_y})
					.css({width: this.width, height: this.height});
			});
		}

		// Buttons
		if (this.buttons.follow) $("#follow").addClass("active");
		if (this.buttons.chainWidget.home) $("#home").addClass("active");
		if (this.buttons.chainWidget.kspace) $("#k-space").addClass("active");
		if (this.buttons.chainWidget.viewing) $("#show-viewing").addClass("active");
		if (this.buttons.chainWidget.favorites) $("#show-favorite").addClass("active");
		if (this.buttons.chainWidget.evescout) $("#eve-scout").addClass("active");
		if ($.inArray(viewingSystemID, this.favorites) != -1) $("#system-favorite").attr("data-icon", "star").addClass("active");
		if (this.buttons.signaturesWidget.autoMapper) $("#toggle-automapper").addClass("active");

		// Background
		if (this.background) {
			var a = $('<a>', { href:this.background } )[0];
			$("#wrapper").attr("style", "background-image: url(https://" + a.hostname + a.pathname + a.search + ");");
		} else {
			$("#wrapper").attr("style", "");
		}

		// Characters in Options
		$("#dialog-options #characters").html("<img src='https://image.eveonline.com/Character/"+init.session.characterID+"_64.jpg' />");

		// Active mask
		$("#dialog-options input[name='mask']").filter("[value='"+this.masks.active+"']").attr("checked", true);

		// Chain tabs
		$("#chainTabs").html("");
		for (var x in this.chain.tabs) {
			if (this.chain.tabs[x]) {
				var $tab = $("#chainTab .tab").clone();

				$tab.attr("id", x).find(".name").data("tab", this.chain.tabs[x].systemID).html(this.chain.tabs[x].name);
				if (x == this.chain.active) { $tab.addClass("current"); }

				$("#chainTabs").append($tab);
			}
		}

		// Draw chain if Tripwire is initialized
		if (tripwire) {
			chain.redraw();
		}
	}

	this.reset.defaults = JSON.parse(JSON.stringify(this.get()));
	this.load(init && init.session.options ? init.session.options : null);
}

// Init code
var viewingSystem = $("meta[name=system]").attr("content");
var viewingSystemID = $("meta[name=systemID]").attr("content");
var server = $("meta[name=server]").attr("content");

// Current system favorite
//if ($.inArray(viewingSystemID, options.favorites) != -1) $("#system-favorite").attr("data-icon", "star").addClass("active");

// Page cache indicator
if (getCookie("loadedFromBrowserCache") == "true") {
	$("#pageTime").html("Page is Cached");
}

setCookie('loadedFromBrowserCache', true);
// --------------------

// 50ms cost
var grid = $(".gridster ul").gridster({
	widget_selector: "li.gridWidget",
	avoid_overlapped_widgets: false,
	widget_base_dimensions: [50, 50],
	widget_margins: [5, 5],
	autogrow_cols: true,
	helper: "clone",
	draggable: {
		start: function(e, ui) {
			$("div.gridster").width($("div.gridster ul").width());
		}
	},
	resize: {
    	enabled: true,
    	handle_class: "grid-resize",
    	max_size: [30, 30],
    	min_size: [4, 4],
    	start: function(e) {
    		$("div.gridster").width($("div.gridster ul").width());
    	},
    	stop: function(e, ui, $widget) {
    		//var width = parseInt($(".gridster").css("margin-left")) + this.container_width;
    		//console.log(width);
    		//$("#wrapper").css({width: width + "px"})
    		switch ($widget.attr("id")) {
    			case "infoWidget":
    				setTimeout("activity.redraw();", 300);
    				break;
    		}
    	}
	},
	serialize_params: function($w, wgd) {
		return {
			id: $w.attr("id"),
			col: wgd.col,
			row: wgd.row,
			size_x: wgd.size_x,
			size_y: wgd.size_y,
			width: $w.width(),
			height: $w.height()
		}
	}
}).data("gridster").disable();

grid.disable_resize();
$(".grid-resize").addClass("hidden").attr("data-icon", "resize");

$(".gridster").css({visibility: "visible"});
$(".gridster > *").addClass("gridster-transition");

$("#layout").click(function() {
	if (!$(this).hasClass("active")) {
		grid.enable();
		grid.enable_resize();
		$(".grid-resize").removeClass("hidden");

		$(this).addClass("active");
	} else {
		grid.disable();
		grid.disable_resize();
		$(".grid-resize").addClass("hidden");

		$(this).removeClass("active");

		if (CCPEVE)
			options.grid.igb = grid.serialize();
		else
			options.grid.oog = grid.serialize();

		options.save();
	}
});

$("#APIclock").knob({angleArc: 359.9, height: 20, width: 20, max: 60, readOnly: true, displayInput: false, fgColor: "#CCC", bgColor: "#666"});

$("#follow").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active");

	options.buttons.follow = $(this).hasClass("active");
	options.save();
})

$("#home").click(function() {
	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active"), $("#k-space").removeClass("active"), $("#eve-scout").removeClass("active");

	chain.redraw();

	options.buttons.chainWidget.home = $(this).hasClass("active");
	options.buttons.chainWidget.kspace = false;
	options.buttons.chainWidget.evescout = false;
	options.save();
});

$("#k-space").click(function() {
	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active"), $("#home").removeClass("active"), $("#eve-scout").removeClass("active");

	chain.redraw();

	options.buttons.chainWidget.kspace = $(this).hasClass("active");
	options.buttons.chainWidget.home = false;
	options.buttons.chainWidget.evescout = false;
	options.save();
});

$("#show-viewing").click(function() {
	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active");

	chain.redraw();

	options.buttons.chainWidget.viewing = $(this).hasClass("active");
	options.save();
});

$("#show-favorite").click(function() {
	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active");

	chain.redraw();

	options.buttons.chainWidget.favorites = $(this).hasClass("active");
	options.save();
});

$("#eve-scout").click(function() {
	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active"), $("#home").removeClass("active"), $("#k-space").removeClass("active");

	chain.redraw();

	options.buttons.chainWidget.evescout = $(this).hasClass("active");
	options.buttons.chainWidget.home = false;
	options.buttons.chainWidget.kspace = false;
	options.save();
});

$("#system-favorite").click(function() {
	if ($(this).hasClass("active")) {
		$(this).removeClass("active").attr("data-icon", "star-empty");

		options.favorites.splice(options.favorites.indexOf(viewingSystemID), 1);
	} else {
		$(this).attr("data-icon", "star").addClass("active");

		options.favorites.push(viewingSystemID);
	}

	if ($("#show-favorite").hasClass("active"))
		chain.redraw();

	options.save();
});

$("#search").click(function(e) {
	$("#searchSpan").toggle();

	if ($(this).hasClass("active")) {
		$(this).removeClass("active");
		if (tripwire.client.EVE && tripwire.client.EVE.systemName)
			$("#currentSpan").show();
	} else {
		$(this).addClass("active");
		$("#currentSpan").hide();

		$("#searchSpan input[name=system]").focus().select();
	}
});

$("#toggle-automapper").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("active"))
		$(this).removeClass("active");
	else
		$(this).addClass("active");

	options.buttons.signaturesWidget.autoMapper = $(this).hasClass("active");
	options.save();
});

$("#user").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("active")) {
		$(this).removeClass("active");

		$("#login > #panel").css({display: "none"});

		//$("#wrapper").unbind("click");
	} else {
		$(this).addClass("active");

		$("#login > #panel").css({display: "inline"});
		$("#loginForm input[name=username]").focus().select();

		// Click outside closes
		$("#wrapper").click(function(e) {
			$("#login > #panel").css({display: "none"});
			$("#user").removeClass("active");
		});

		$("#login").click(function(e) {
			e.stopPropagation();
		})
	}
});

$("#logout").click(function() {
	window.location = "logout.php";
});

//console.log("stint: "+ (window.performance.now() - startTime));

var activity = new function() {
	this.graph;
	this.options;
	this.view;
	this.span = 24;
	this.columns = [
		{id: "time", label: "Time", role: "domain", type: "string", calc: function(d, r) { return d.getValue(r, 0) + "h"; }},
		{id: "jumps", label: "Jumps", role: "data", type: "number", sourceColumn: 1, column: 1, title: "Jumps"},
		{id: "podkills", label: "Pod Kills", role: "data", type: "number", sourceColumn: 2, column: 2, title: "Pod Kills"},
		{id: "shipkills", label: "Ship Kills", role: "data", type: "number", sourceColumn: 3, column: 3, title: "Ship Kills"},
		{id: "npckills", label: "NPC Kills", role: "data", type: "number", sourceColumn: 4, column: 4, title: "NPC Kills"},
		//{id: "annotationLabel", label: "Test", role: "annotation", type: "string", sourceColumn: 5, title: "Test"},
		//{id: "annotationText", label: "Test", role: "annotationText", type: "string", sourceColumn: 6, title: "Test"}
	];

	this.getData = function(span, cache) {
		var span = typeof(span) !== "undefined" ? span : this.span;
		var cache = typeof(cache) !== "undefined" ? cache : true;

		var json = $.ajax({
					url: "activity_graph.php",
					data: {systemID: viewingSystemID, time: span},
					type: "GET",
					dataType: "JSON",
					async: false,
					cache: cache
				}).responseJSON;

		json.rows.reverse();

		this.view = new google.visualization.DataView(new google.visualization.DataTable(json));
		this.view.setColumns(this.columns);
		return this.view;
	};

	this.selectHandler = function() {
		var selections = activity.graph.getSelection();

		if (selections[0] && selections[0].row == null) {
			var c = selections[0].column;

			if (activity.columns[c].sourceColumn) {
				//activity.columns[c].calc = function() { return null };
				activity.columns[c].label = activity.columns[c].title + " (off)";
				delete activity.columns[c].sourceColumn;
			} else {
				activity.columns[c].sourceColumn = activity.columns[c].column;
				activity.columns[c].label = activity.columns[c].title;
				//delete activity.columns[c].calc;
			}

			activity.view.setColumns(activity.columns);
			activity.options.animation.duration = 0;
			activity.graph.draw(activity.view, activity.options);
			activity.options.animation.duration = 500;
		}
	}

	this.init = function() {
		this.graph = new google.visualization.AreaChart(document.getElementById("activityGraph"));
		this.options = {
			isStacked: false,
			backgroundColor: "transparent",
			hAxis: {textStyle: {color: "#999", fontName: "Verdana", fontSize: 10}, showTextEvery: 3},
			vAxis: {textStyle: {color: "#666", fontName: "Verdana", fontSize: 10}, viewWindowMode: "maximized", viewWindow: {min: 0}, maxValue: 5},
			gridlineColor: "#454545",
			pointSize: 2,
			lineWidth: 1,
			chartArea: {left: "10%", top: "5%", width: "88%", height: "85%"},
			legend: {position: "in", textStyle: {color: "#CCC", fontName: "Verdana", fontSize: 8.5}},
			animation: {duration: 500, easing: "inAndout"},
			tooltip: {showColorCode: true},
			annotations: {style: "line", textStyle: {fontSize: 12, color: "#ccc"}, domain: 0},
			focusTarget: "category"
		}

		google.visualization.events.addListener(this.graph, "select", this.selectHandler);

		this.graph.draw(this.getData(this.span), this.options);
	}

	this.time = function(span) {
		switch(span) {
			case 24:
				this.options.hAxis.showTextEvery = 3;
				break;
			case 48:
				this.options.hAxis.showTextEvery = 6;
				break;
			case 168:
				this.options.hAxis.showTextEvery = 24;
				break;
		}

		this.span = span;
		this.graph.draw(this.getData(span), this.options);
	}

	this.redraw = function() {
		this.graph.draw(this.view, this.options);
	}

	this.refresh = function(cache) {
		this.graph.draw(this.getData(this.span, cache), this.options);
	}

	google.setOnLoadCallback(this.init());
	//this.init();
}

var chain = new function() {
	this.map, this.view, this.options, this.drawing, this.data = {};

	this.newView = function(json) {
		this.view = new google.visualization.DataView(new google.visualization.DataTable(json));
		return this.view;
	};

	this.activity = function(data) {
		/*	function for adding recent activity to chain map nodes	*/
		//var data = typeof(data) !== "undefined" ? data : this.data.activity;

		// Hide all activity colored dots instead of checking each one
		$("#chainMap .nodeActivity > span:not(.invisible)").addClass("invisible");

		// Loop through passed data and show dots by system
		for (var x in data) {
			var systemID = data[x].systemID;
			var shipJumps = data[x].shipJumps;
			var podKills = data[x].podKills;
			var shipKills = data[x].shipKills;
			var npcKills = data[x].npcKills;
			var $node = $("#chainMap [data-nodeid="+systemID+"] > .nodeActivity");

			if (shipJumps > 0) {
				$node.find(".jumps").removeClass("invisible").attr("title", shipJumps+" Jumps");
			}

			if (podKills > 0) {
				$node.find(".pods").removeClass("invisible").attr("title", podKills+" Pod Kills");
			}

			if (shipKills > 0) {
				$node.find(".ships").removeClass("invisible").attr("title", shipKills+" Ship Kills");
			}

			if (npcKills > 0) {
				$node.find(".npcs").removeClass("invisible").attr("title", npcKills+" NPC Kills");
			}
		}

		$("#chainMap .nodeActivity > span[title]").jBox("Tooltip", {position: {y: "bottom"}});

		return data;
	}

	this.occupied = function(data) {
		/*	function for showing occupied icon  */
		//var data = typeof(data) !== "undefined" ? data : this.data.occupied;

		// Hide all icons instead of checking each one
		$("#chainMap [data-icon='user']").addClass("invisible");//.hide();

		// Loop through passed data and show icons
		for (var x in data) {
			$("#chainMap [data-nodeid='"+data[x]+"'] [data-icon='user']").removeClass("invisible");//.show();
		}

		OccupiedToolTips.attach($("#chainMap [data-icon='user']:not(.invisible)"));

		return data;
	}

	this.flares = function(data) {
		/*	function for coloring chain map nodes via flares  */
		//var data = typeof(data) !== "undefined" ? data : this.data.flares;

		// Remove all current node coloring instead of checking each one
		$("#chainMap td.node").removeClass("redNode yellowNode greenNode");

		// Remove all coloring from chain grid
		$("#chainGrid tr").removeClass("red yellow green");

		// Loop through passed data and add classes by system
		if (data) {
			for (var x in data.flares) {
				var systemID = data.flares[x].systemID;
				var flare = data.flares[x].flare;

				var row = ($("#chainMap [data-nodeid="+systemID+"]").parent().addClass(flare+"Node").parent().index() - 1) / 3 * 2;

				if (row > 0) {
					$("#chainGrid tr:eq("+row+")").addClass(flare).next().addClass(flare);
				}
			}
		}

		return data;
	}

	this.grid = function() {
		/*  function for showing/hiding grid lines  */
		if (options.chain.gridlines == false) { $("#chainGrid tr").addClass("hidden"); return false; }

		$("#chainGrid tr").removeClass("hidden");
		//$("#chainGrid").css("width", "100%");

		var rows = $(".google-visualization-orgchart-table tr:has(.node)").length * 2 - 1;

		$("#chainGrid tr:gt("+rows+")").addClass("hidden");
	}

	this.lines = function(data) {
		//var data = typeof(data) !== "undefined" ? data : this.data.lines;

		function drawNodeLine(system, parent, mode, signatureID) {
			/*	function for drawing colored lines  */

			// Find node in chainmap
			//var $node = $("#chainMap [data-nodeid='"+system+"']").parent();
			var $node = $("#chainMap #node"+system).parent();

			if ($node.length == 0) {
				return false;
			}

			// Get node # in this line
			var nodeIndex = Math.ceil(($node[0].cellIndex + 1) / 2 - 1);
			//console.log(nodeIndex)

			// applly to my top line
			var $connector = $($node.parent().prev().children("td.google-visualization-orgchart-lineleft, td.google-visualization-orgchart-lineright")[nodeIndex]).addClass("left-"+mode+" right-"+mode);
			//var $connector = $($node.parent().prev().find("td:not([colspan])")[nodeIndex]).addClass("left-"+mode+" right-"+mode).attr("data-signatureid", signatureID);

			// Find parent node
			//var $parent = $("#chainMap [data-nodeid='"+parent+"']").parent();
			var $parent = $("#chainMap #node"+parent).parent();

			if ($parent.length == 0 || $connector.length == 0)
				return false;

			// Find the col of my top line
			var nodeCol = 0, connectorCell = $connector[0].cellIndex;
			$node.parent().prev().find("td").each(function(index) {
				nodeCol += this.colSpan;

				if (index == connectorCell) {
					return false;
				}
			});

			// Get node # in this line
			var parentIndex = Math.ceil(($parent[0].cellIndex + 1) / 2 - 1);

			// Compensate for non-parent nodes (slight performance hit ~10ms)
			var newparentIndex = parentIndex;
			for (var i = 0; i <= parentIndex; i++) {
				var checkSystem = 0;//$node.parent().prev().prev().prev().find("td:has([data-nodeid]):eq("+i+")").find("[data-nodeid]").data("nodeid");
				$node.parent().prev().prev().prev().find("td > [data-nodeid]").each(function(index) {
					if (index == i) {
						checkSystem = $(this).attr("id").replace("node", "");//$(this).data("nodeid");

						return false;
					}
				});

				if ($.map(data.map.rows, function(node) { return node.c[1].v == checkSystem ? node : null; }).length <= 0) {
					newparentIndex--;
				}
			}
			parentIndex = newparentIndex;

			// Apply to parent bottom line
			var $connecte = $($node.parent().prev().prev().children("td.google-visualization-orgchart-lineleft, td.google-visualization-orgchart-lineright")[parentIndex]).addClass("left-"+mode+" right-"+mode);
			//var $connecte = $($node.parent().prev().prev().find("td:not([colspan])")[parentIndex]).addClass("left-"+mode+" right-"+mode).attr("data-signatureid", signatureID);

			// the beans
			var col = 0, parent = false, me = false;
			$node.parent().prev().prev().find("td").each(function(index, value) {
				col += this.colSpan;

				if (me && parent) {
					// All done - get outta here
					return false;
				} else if (typeof($connecte[0]) != "undefined" && $connecte[0].cellIndex == index) {
					parent = true;

					$(this).addClass("left-"+mode);

					// remove bottom border that points to the right
					if (!me && col != nodeCol) {
						$(this).addClass("bottom-"+mode);
					}

					// parent and node are same - we are done
					if (nodeCol == col) {
						return false;
					}
				} else if (col == nodeCol) {
					me = true;

					$(this).addClass("bottom-"+mode);
				} else if (me || parent) {
					var tempCol = 0, breaker = false, skip = false;

					$node.parent().prev().find("td").each(function(index) {
						tempCol += this.colSpan;

						if (tempCol == col && ($(this).hasClass("google-visualization-orgchart-lineleft") || $(this).hasClass("google-visualization-orgchart-lineright"))) {
							if (parent == false) {
								// Stop looking cuz there is another node between us and parent
								breaker = true;
								$connecte.removeClass("left-"+mode+" right-"+mode);

								return false;
							} else if (parent == true) {
								// Lets make sure there isnt a node between the parent and me
								$connecte.removeClass("left-"+mode+" right-"+mode);

								$node.parent().prev().prev().find("td").each(function(index) {
									if (index >= $connecte[0].cellIndex) {
										// there is a node after parent but before me
										$(this).removeClass("bottom-"+mode);
									}
								});
								skip = true;
							}
						}
					});

					if (breaker) {
						return false;
					}

					if (!skip) {
						//if (system == 18) console.log(mode);
						$(this).addClass("bottom-"+mode);
					}
				}
			});
		}

		for (var x in data.lines) {
			drawNodeLine(data.lines[x][0], data.lines[x][1], data.lines[x][2], data.lines[x][3]);
		}
	}

	this.nodes = function(map) {
		var chain = {cols: [{label: "System", type: "string"}, {label: "Parent", type: "string"}], rows: []};
		var frigTypes = ["Q003", "E004", "L005", "Z006", "M001", "C008", "G008", "A009"];
		var connections = [];

		function topLevel(systemID, id) {
			if (!systemID || !tripwire.systems[systemID])
				return false;

			// System type switch
			var systemType;
			if (tripwire.systems[systemID].class)
				systemType = "<span class='wh'>C" + tripwire.systems[systemID].class + "</span>";
			else if (tripwire.systems[systemID].security >= 0.45)
				systemType = "<span class='hisec'>HS</span>";
			else if (tripwire.systems[systemID].security > 0.0)
				systemType = "<span class='lowsec'>LS</span>";
			else if (tripwire.systems[systemID].security <= 0.0)
				systemType = "<span class='nullsec'>NS</span>";

			var effectClass = null, effect = null;
			if (tripwire.systems[systemID].class) {
				switch(tripwire.systems[systemID].effect) {
					case "Black Hole":
						effectClass = "blackhole";
						break;
					case "Cataclysmic Variable":
						effectClass = "cataclysmic-variable";
						break;
					case "Magnetar":
						effectClass = "magnetar";
						break;
					case "Pulsar":
						effectClass = "pulsar";
						break;
					case "Red Giant":
						effectClass = "red-giant";
						break;
					case "Wolf-Rayet Star":
						effectClass = "wolf-rayet";
						break;
				}

				effect = tripwire.systems[systemID].effect;
			}

			var system = {v: id};
			var chainNode = "<div id='node"+id+"' data-nodeid='"+systemID+"'>"
							+	"<div class='nodeIcons'>"
							+		"<div style='float: left;'>"
							+			"<i class='whEffect' "+(effectClass ? "data-icon='"+effectClass+"' data-tooltip='"+effect+"'" : null)+"></i>"
							+		"</div>"
							+		"<div style='float: right;'>"
							+			"<i data-icon='user' class='invisible'></i>"
							+		"</div>"
							+	"</div>"
							+	"<h4 class='nodeClass'>"+systemType+"</h4>"
							+	"<h4 class='nodeSystem'>"
							+		"<a href='.?system="+tripwire.systems[systemID].name+"'>"+(options.chain.tabs[options.chain.active] && options.chain.tabs[options.chain.active].systemID != 0 ? options.chain.tabs[options.chain.active].name : tripwire.systems[systemID].name)+"</a>"
							+	"</h4>"
							+	"<h4 class='nodeType'>&nbsp;</h4>"
							+	"<div class='nodeActivity'>"
							+		"<span class='jumps invisible'>&#9679;</span>&nbsp;<span class='pods invisible'>&#9679;</span>&nbsp;&nbsp;<span class='ships invisible'>&#9679;</span>&nbsp;<span class='npcs invisible'>&#9679;</span>"
							+	"</div>"
							+"</div>"

			system.f = chainNode;

			return system;
		}

		function findLinks(system) {
			if (system[0] <= 0) return false;

			var parentID = parseInt(system[1]), childID = chainList.length;

			for (var x in chainData) {
				var link = chainData[x];

				if ($.inArray(link.id, usedLinks) == -1) {
					if (link.systemID == system[0]) {
						var node = {};
						node.id = link.id;
						node.life = link.life;
						node.mass = link.mass;
						node.time = link.time;

						node.parent = {};
						node.parent.id = parentID;
						node.parent.systemID = link.systemID;
						node.parent.name = link.system;
						node.parent.type = link.sig2Type;
						node.parent.typeBM = link.type2BM;
						node.parent.classBM = link.class2BM;
						node.parent.nth = link.nth2;

						node.child = {};
						node.child.id = ++childID;
						node.child.systemID = link.connectionID;
						node.child.name = link.connection;
						node.child.type = link.type;
						node.child.typeBM = link.typeBM;
						node.child.classBM = link.classBM;
						node.child.nth = link.nth;

						chainLinks.push(node);
						chainList.push([node.child.systemID, node.child.id, system[2]]);
						usedLinks.push(node.id);
						//usedLinks[system[2]].push(node.id);

						if ($("#show-viewing").hasClass("active") && tripwire.systems[node.child.systemID] && !tripwire.systems[viewingSystemID].class && !tripwire.systems[node.child.systemID].class) {
							var jumps = guidance.findShortestPath(tripwire.map.shortest, [viewingSystemID - 30000000, node.child.systemID - 30000000]).length - 1;

							var calcNode = {};
							calcNode.life = "Gate";
							calcNode.parent = {};
							calcNode.parent.id = node.child.id;
							calcNode.parent.systemID = node.child.systemID;
							calcNode.parent.name = node.child.name;
							calcNode.parent.type = node.child.type;
							calcNode.parent.nth = node.child.nth;

							calcNode.child = {};
							calcNode.child.id = ++childID;
							calcNode.child.systemID = viewingSystemID
							calcNode.child.name = tripwire.systems[viewingSystemID].name;
							calcNode.child.type = jumps;
							calcNode.child.nth = null;

							chainLinks.push(calcNode);
							chainList.push([0, childID]);
						}

						if ($("#show-favorite").hasClass("active") && tripwire.systems[node.child.systemID]) {
							for (x in options.favorites) {
								if (tripwire.systems[options.favorites[x]].regionID >= 11000000 || tripwire.systems[node.child.systemID].regionID >= 11000000)
									continue;

								var jumps = guidance.findShortestPath(tripwire.map.shortest, [options.favorites[x] - 30000000, node.child.systemID - 30000000]).length - 1;

								var calcNode = {};
								calcNode.life = "Gate";
								calcNode.parent = {};
								calcNode.parent.id = node.child.id;
								calcNode.parent.systemID = node.child.systemID;
								calcNode.parent.name = node.child.name;
								calcNode.parent.type = node.child.type;
								calcNode.parent.nth = node.child.nth;

								calcNode.child = {};
								calcNode.child.id = ++childID;
								calcNode.child.systemID = options.favorites[x];
								calcNode.child.name = tripwire.systems[options.favorites[x]].name;
								calcNode.child.type = jumps;
								calcNode.child.nth = null;

								chainLinks.push(calcNode);
								chainList.push([0, childID]);
							}
						}
					} else if (link.connectionID == system[0]) {
						var node = {};
						node.id = link.id;
						node.life = link.life;
						node.mass = link.mass;
						node.time = link.time;

						node.parent = {};
						node.parent.id = parentID;
						node.parent.systemID = link.connectionID;
						node.parent.name = link.connection;
						node.parent.type = link.type;
						node.parent.typeBM = link.typeBM;
						node.parent.classBM = link.classBM;
						node.parent.nth = link.nth;

						node.child = {};
						node.child.id = ++childID;
						node.child.systemID = link.systemID;
						node.child.name = link.system;
						node.child.type = link.sig2Type;
						node.child.typeBM = link.type2BM;
						node.child.classBM = link.class2BM;
						node.child.nth = link.nth2;

						chainLinks.push(node);
						chainList.push([node.child.systemID, node.child.id, system[2]]);
						usedLinks.push(node.id);
						//usedLinks[system[2]].push(node.id);

						if ($("#show-viewing").hasClass("active") && tripwire.systems[node.child.systemID] && !tripwire.systems[viewingSystemID].class && !tripwire.systems[node.child.systemID].class) {
							var jumps = guidance.findShortestPath(tripwire.map.shortest, [viewingSystemID - 30000000, node.child.systemID - 30000000]).length - 1;

							var calcNode = {};
							calcNode.life = "Gate";
							calcNode.parent = {};
							calcNode.parent.id = node.child.id;
							calcNode.parent.systemID = node.child.systemID;
							calcNode.parent.name = node.child.name;
							calcNode.parent.type = node.child.type;
							calcNode.parent.nth = node.child.nth;

							calcNode.child = {};
							calcNode.child.id = ++childID;
							calcNode.child.systemID = viewingSystemID;
							calcNode.child.name = tripwire.systems[viewingSystemID].name;
							calcNode.child.type = jumps;
							calcNode.child.nth = null;

							chainLinks.push(calcNode);
							chainList.push([0, childID]);
						}

						if ($("#show-favorite").hasClass("active") && tripwire.systems[node.child.systemID]) {
							for (x in options.favorites) {
								if (tripwire.systems[options.favorites[x]].regionID >= 11000000 || tripwire.systems[node.child.systemID].regionID >= 11000000)
									continue;

								var jumps = guidance.findShortestPath(tripwire.map.shortest, [options.favorites[x] - 30000000, node.child.systemID - 30000000]).length - 1;

								var calcNode = {};
								calcNode.life = "Gate";
								calcNode.parent = {};
								calcNode.parent.id = node.child.id;
								calcNode.parent.systemID = node.child.systemID;
								calcNode.parent.name = node.child.name;
								calcNode.parent.type = node.child.type;
								calcNode.parent.nth = node.child.nth;

								calcNode.child = {};
								calcNode.child.id = ++childID;
								calcNode.child.systemID = options.favorites[x];
								calcNode.child.name = tripwire.systems[options.favorites[x]].name;
								calcNode.child.type = jumps;
								calcNode.child.nth = null;

								chainLinks.push(calcNode);
								chainList.push([0, childID]);
							}
						}
					}
				}
			}
		}

		if (false && $("#home").hasClass("active")) {
			$("#chainError").hide();

			var row = {c: []};
			var systemID = $.map(tripwire.systems, function(system, id) { return system.name == options.chain.home ? id : null; })[0];

			row.c.push(topLevel(systemID, 1), {v: null});

			chain.rows.push(row);

			var chainList = [[systemID, 1]];
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			for (var i = 0; i < chainList.length; ++i) {
				findLinks(chainList[i]);
			}
		} else if (false && $("#k-space").hasClass("active")) {
			$("#chainError").hide();

			var chainList = [];//$.map(tripwire.systems, function(system, id) { return system.class ? null : [id, 1]; });
			var kspace = $.map(tripwire.systems, function(system, id) { return system.class ? null : id; });
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			var i = 0;
			for (var x in map) {
				if ($.inArray(map[x].systemID, kspace) != -1) {
					i++;
					chain.rows.push({c: [topLevel(map[x].systemID, i), {v: null}]});
					chainList.push([map[x].systemID, i]);
				} else if ($.inArray(map[x].connectionID, kspace) != -1) {
					i++;
					chain.rows.push({c: [topLevel(map[x].connectionID, i), {v: null}]});
					chainList.push([map[x].connectionID, i]);
				}
			}

			for (var i = 0; i < chainList.length; ++i) {
				findLinks(chainList[i]);
			}
		} else if (false && $("#eve-scout").hasClass("active")) {
			$("#chainError").hide();

			var row = {c: []};
			var systemID = 31000005;

			row.c.push(topLevel(systemID, 1), {v: null});

			chain.rows.push(row);

			var chainList = [[systemID, 1]];
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			for (var i = 0; i < chainList.length; ++i) {
				findLinks(chainList[i]);
			}
		} else if ($("#chainTabs .current").length > 0) {
			var systems = $("#chainTabs .current .name").data("tab").toString().split(",");
			var chainList = [];
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			if (systems == 0) {
				var i = 0;
				for (var x in map) {
					if (typeof(tripwire.systems[map[x].systemID].class) == "undefined") {
						i++;
						//usedLinks[map[x].systemID] = [];
						chain.rows.push({c: [topLevel(map[x].systemID, i), {v: null}]});
						chainList.push([map[x].systemID, i, map[x].systemID]);
					} else if (tripwire.systems[map[x].connectionID] && typeof(tripwire.systems[map[x].connectionID].class) == "undefined") {
						i++;
						//usedLinks[map[x].connectionID] = [];
						chain.rows.push({c: [topLevel(map[x].connectionID, i), {v: null}]});
						chainList.push([map[x].connectionID, i, map[x].connectionID]);
					}
				}
			} else {
				for (var x in systems) {
					//usedLinks[systems[x]] = [];
					chain.rows.push({c: [topLevel(systems[x], parseInt(x) + 1), {v: null}]});
					chainList.push([systems[x], parseInt(x) + 1, systems[x]]);
				}
			}

			//var startTime = window.performance.now();
			for (var i = 0; i < chainList.length; i++) {
				findLinks(chainList[i]);
			}
			//console.log("stint: "+ (window.performance.now() - startTime));
		} else {
			$("#chainError").hide();

			var row = {c: []};
			var systemID = viewingSystemID;

			row.c.push(topLevel(systemID, 1), {v: null});

			chain.rows.push(row);

			var chainList = [[systemID, 1]];
			var chainData = map;
			var chainLinks = [];
			var usedLinks = [];

			for (var i = 0; i < chainList.length; ++i) {
				findLinks(chainList[i]);
			}
		}

		for (var x in chainLinks) {
			var node = chainLinks[x];
			var row = {c: []};

			// System type switch
			var systemType;
			var nodeClass = tripwire.systems[node.child.systemID] ? tripwire.systems[node.child.systemID].class : null;
			var nodeSecurity = tripwire.systems[node.child.systemID] ? tripwire.systems[node.child.systemID].security : null;
			if (nodeClass == 6 || node.child.name == "Class-6" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 6"))
				systemType = "<span class='wh'>C6</span>";
			else if (nodeClass == 5 || node.child.name == "Class-5" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 5"))
				systemType = "<span class='wh'>C5</span>";
			else if (nodeClass == 4 || node.child.name == "Class-4" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 4"))
				systemType = "<span class='wh'>C4</span>";
			else if (nodeClass == 3 || node.child.name == "Class-3" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 3"))
				systemType = "<span class='wh'>C3</span>";
			else if (nodeClass == 2 || node.child.name == "Class-2" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 2"))
				systemType = "<span class='wh'>C2</span>";
			else if (nodeClass == 1 || node.child.name == "Class-1" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Class 1"))
				systemType = "<span class='wh'>C1</span>";
			else if (nodeClass > 6)
				systemType = "<span class='wh'>C" + nodeClass + "</span>";
			else if (nodeSecurity >= 0.45 || node.child.name == "High-Sec" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "High-Sec" && !nodeSecurity))
				systemType = "<span class='hisec'>HS</span>";
			else if (nodeSecurity > 0.0 || node.child.name == "Low-Sec" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Low-Sec" && !nodeSecurity))
				systemType = "<span class='lowsec'>LS</span>";
			else if ((nodeSecurity <= 0.0 && nodeSecurity != null) || node.child.name == "Null-Sec" || (typeof(tripwire.wormholes[node.child.type]) != "undefined" && tripwire.wormholes[node.child.type].leadsTo == "Null-Sec"))
				systemType = "<span class='nullsec'>NS</span>";
			else
				systemType = "<span>&nbsp;</span>";

			var effectClass = null, effect = null;
			if (typeof(tripwire.systems[node.child.systemID]) != "undefined") {
				switch(tripwire.systems[node.child.systemID].effect) {
					case "Black Hole":
						effectClass = "blackhole";
						break;
					case "Cataclysmic Variable":
						effectClass = "cataclysmic-variable";
						break;
					case "Magnetar":
						effectClass = "magnetar";
						break;
					case "Pulsar":
						effectClass = "pulsar";
						break;
					case "Red Giant":
						effectClass = "red-giant";
						break;
					case "Wolf-Rayet Star":
						effectClass = "wolf-rayet";
						break;
					default:
						effectClass = null;
						break;
				}

				effect = tripwire.systems[node.child.systemID].effect;
			}

			var child = {v: node.child.id};
			var chainNode = "<div id='node"+node.child.id+"' data-nodeid='"+node.child.systemID+"' data-sigid='"+node.id+"'>"
							+	"<div class='nodeIcons'>"
							+		"<div style='float: left;'>"
							+			"<i class='whEffect' "+(effectClass ? "data-icon='"+effectClass+"' data-tooltip='"+effect+"'" : null)+"></i>"
							+		"</div>"
							+		"<div style='float: right;'>"
							+			"<i data-icon='user' class='invisible'></i>"
							+		"</div>"
							+	"</div>"
							+	"<h4 class='nodeClass'>"+(systemType + sigFormat(node.child.classBM, "class"))+"</h4>"
							+	"<h4 class='nodeSystem'>"
							+ 	(tripwire.systems[node.child.systemID] ? "<a href='.?system="+tripwire.systems[node.child.systemID].name+"'>"+(node.child.name ? node.child.name : tripwire.systems[node.child.systemID].name)+"</a>" : "<a class='invisible'>system</a>")
							+	"</h4>"
							+	"<h4 class='nodeType'>"+(node.child.type + sigFormat(node.child.typeBM, "type") || "&nbsp;")+"</h4>"
							+	"<div class='nodeActivity'>"
							+		"<span class='jumps invisible'>&#9679;</span>&nbsp;<span class='pods invisible'>&#9679;</span>&nbsp;&nbsp;<span class='ships invisible'>&#9679;</span>&nbsp;<span class='npcs invisible'>&#9679;</span>"
							+	"</div>"
							+"</div>"

			child.f = chainNode;

			var parent = {v: node.parent.id};

			row.c.push(child, parent);
			chain.rows.push(row);

			if (node.life == "Critical" && ($.inArray(node.parent.type, frigTypes) != -1 || $.inArray(node.child.type, frigTypes) != -1))
				connections.push(Array(child.v, parent.v, "eol-frig", node.id));
			else if (node.life == "Critical" && node.mass == "Critical")
				connections.push(Array(child.v, parent.v, "eol-critical", node.id));
			else if (node.life == "Critical" && node.mass == "Destab")
				connections.push(Array(child.v, parent.v, "eol-destab", node.id));
			else if ($.inArray(node.parent.type, frigTypes) != -1 || $.inArray(node.child.type, frigTypes) != -1)
				connections.push(Array(child.v, parent.v, "frig", node.id));
			else if (node.life == "Critical")
				connections.push(Array(child.v, parent.v, "eol", node.id));
			else if (node.mass == "Critical")
				connections.push(Array(child.v, parent.v, "critical", node.id));
			else if (node.mass == "Destab")
				connections.push(Array(child.v, parent.v, "destab", node.id));
			else if (node.life == "Gate" || node.parent.type == "GATE" || node.child.type == "GATE")
				connections.push(Array(child.v, parent.v, "gate", node.id));
			//else
			//	connections.push(Array(child.v, parent.v, "", node.id));
		}

		// Apply critical/destab line colors
		connections.reverse(); // so we apply to outer systems first

		//this.data.map = chain;
		//this.data.lines = connections;
		return {"map": chain, "lines": connections};
	}

	this.redraw = function() {
		var data = $.extend(true, {}, this.data);
		data.map = data.rawMap;

		this.draw(data);
	}

	this.draw = function(data) {
		var data = typeof(data) !== "undefined" ? data : {};
		//var startTime = window.performance.now();

		if (data.map) {
			this.drawing = true;

			this.data.rawMap = $.extend(true, {}, data.map);

			if (options.chain.active && options.chain.tabs[options.chain.active] && options.chain.tabs[options.chain.active].evescout == false) {
				for (var i in data.map) {
					if (data.map[i].mask == "273.0") {
						delete data.map[i];
					}
				}
			}

			$.extend(data, this.nodes(data.map)); // 250ms -> <100ms
			$.extend(this.data, data);
			this.map.draw(this.newView(data.map), this.options); // 150ms

			if (options.chain.tabs[options.chain.active]) {
				for (var x in options.chain.tabs[options.chain.active].collapsed) {
					var node = $("#chainMap [data-nodeid='"+options.chain.tabs[options.chain.active].collapsed[x]+"']").attr("id");

					if (node) {
						node = node.split("node")[1];
						this.map.collapse(node - 1, true);
					}
				}
			}

			this.lines(data); // 300ms
			this.grid(); // 4ms

			// Apply current system style
			$("#chainMap [data-nodeid='"+viewingSystemID+"']").parent().addClass("currentNode"); // 1ms

			Tooltips.attach($("#chainMap .whEffect")); // 30ms
			this.drawing = false;
		}

		if (data.activity) // 100ms
			this.data.activity = this.activity(data.activity);

		if (data.occupied) // 3ms
			this.data.occupied = this.occupied(data.occupied);

		if (data.flares) // 20ms
			this.data.flares = this.flares(data.flares);

		if (data.last_modified)
			this.data.last_modified = data.last_modified;

		//console.log("stint: "+ (window.performance.now() - startTime));
	}

	this.collapse = function(c) {
		if (chain.drawing) return false;

		var collapsed = chain.map.getCollapsedNodes();
		options.chain.tabs[options.chain.active].collapsed = [];
		for (x in collapsed) {
			var systemID = $("#chainMap #node"+(collapsed[x] +1)).data("nodeid");
			options.chain.tabs[options.chain.active].collapsed.push(systemID);
		}

		chain.lines(chain.data);

		// Apply current system style
		$("#chainMap [data-nodeid='"+viewingSystemID+"']").parent().addClass("currentNode");

		Tooltips.attach($("#chainMap .whEffect"));

		chain.activity(chain.data.activity);

		chain.occupied(chain.data.occupied);

		chain.flares(chain.data.flares);

		chain.grid();

		options.save();
	}

	this.init = function() {
		this.map = new google.visualization.OrgChart(document.getElementById("chainMap"));
		this.options = {allowHtml: true, allowCollapse: true, size: "medium", nodeClass: "node"};

		google.visualization.events.addListener(this.map, "collapse", this.collapse);

		this.map.draw(new google.visualization.DataView(new google.visualization.DataTable({cols:[{label: "System", type: "string"}, {label: "Parent", type: "string"}]})), this.options);
	}

	//google.setOnLoadCallback(this.init());
	this.init();
}

/* Tripwire Core */
var tripwire = new function() {
	this.client = {signatures: {}};
	this.server = {signatures: {}};
	this.activity = {};
	this.timer;
	this.xhr;
	this.refreshRate = 5000;
	this.connected = true;
	this.ageFormat = "HM";
	this.instance = new Date().getTime() / 1000;//window.name ? window.name : (new Date().getTime() / 1000, window.name = new Date().getTime() / 1000);

	// Command to start/stop tripwire updates
	// ToDo: Include API and Server timers
	this.stop = function() {
		clearTimeout(this.timer);
		return this.timer;
	};

	this.start = function() {
		return this.sync();
	}

	// Command to change Age format
	// ToDo: Cookie change to keep
	this.setAgeFormat = function(format) {
		var format = typeof(format) !== 'undefined' ? format : this.ageFormat;

		$("span[data-age]").each(function() {
			$(this).countdown("option", {format: format});
		});

		return true;
	}

	this.serverTime = function() {
		this.time;

		this.serverTime.getTime = function() {
			return tripwire.serverTime.time;
		}
	}

	// Handles pulling TQ status & player count
	this.serverStatus = function() {
		this.data;
		this.time;

		$.ajax({
			url: "server_status.php",
			dataType: "JSON",
			cache: false
		}).done(function(data) {
			if (!tripwire.serverStatus.data || tripwire.serverStatus.data.players !== data.players || tripwire.serverStatus.data.online !== data.online) {
				$('#serverStatus').html("<span class='"+(data.online && data.players > 0 ? 'stable' : 'critical')+"'>TQ</span>: "+numFormat(data.players));

				if (tripwire.serverStatus.data) {
					$("#serverStatus").effect('pulsate', {times: 5});
				}
			}

			tripwire.serverStatus.data = data;
		}).always(function(data) {
			if (data && data.time > 15) {
				tripwire.serverStatus.time = data.time * 1000;
			} else {
				tripwire.serverStatus.time = 15000;
			}

			setTimeout("tripwire.serverStatus();", tripwire.serverStatus.time);
		});
	}

	// Handles API updates
	this.API = function() {
		this.indicator;
		this.APIrefresh;

		this.API.expire = function() {
			var options = {since: tripwire.API.APIrefresh, until: null, format: "MS", layout: "-{mnn}{sep}{snn}"};
			$("#APItimer").countdown("option", options);
		}

		this.API.refresh = function() {
			$.ajax({
				url: "api_update.php",
				cache: false,
				dataType: "JSON",
				data: "indicator="+tripwire.API.indicator
			}).done(function(data) {
				if (data && data.APIrefresh) {
					tripwire.API.indicator = data.indicator;
					tripwire.API.APIrefresh = new Date(data.APIrefresh);
					activity.refresh(); //Refresh graph

					var options = {until: tripwire.API.APIrefresh, since: null, layout: "{mnn}{sep}{snn}"};
					$("#APItimer").countdown("option", options);
					setTimeout("tripwire.API.refresh();", $.countdown.periodsToSeconds($("#APItimer").countdown('getTimes')) - 30);

					// Node activity
					if (data.chain)
						tripwire.chainMap.parse(data.chain);
				} else if ($("#APItimer").countdown("option", "layout") !== "-{mnn}{sep}{snn}" && $.countdown.periodsToSeconds($("#APItimer").countdown('getTimes')) > 120) {
					setTimeout("tripwire.API.refresh();", ($.countdown.periodsToSeconds($("#APItimer").countdown('getTimes')) - 30) * 1000);
				} else {
					setTimeout("tripwire.API.refresh();", 5000);
				}
			});
		}

		this.API.init = function() {
			$.ajax({
				url: "api_update.php",
				cache: true,
				dataType: "JSON",
				data: "init=true"
			}).done(function(data) {
				tripwire.API.indicator = data.indicator;
				tripwire.API.APIrefresh = new Date(data.APIrefresh);

				$("#APItimer").countdown({until: tripwire.API.APIrefresh, onExpiry: tripwire.API.expire, alwaysExpire: true, compact: true, format: "MS", serverSync: tripwire.serverTime.getTime, onTick: function(t) { $("#APIclock").val(t[5] + 1).trigger("change"); }})
				var timer = $("#APItimer").countdown("option", "layout") === "-{mnn}{sep}{snn}" ? 15 : $.countdown.periodsToSeconds($("#APItimer").countdown('getTimes')) - 30;
				setTimeout("tripwire.API.refresh();", timer * 1000);

				// Node activity
				if (data.chain)
					tripwire.chainMap.parse(data.chain);
			});
		}

		this.API.init();
	}

	this.sync = function(mode, data, successCallback, alwaysCallback) {
		var data = typeof(data) === "object" ? data : {};
		var sigCount = 0;
		var maxTime = 0;

		// Remove old timer to prevent multiple
		if (this.timer) clearTimeout(this.timer);
		if (this.xhr) this.xhr.abort();

		if (mode == 'refresh' || mode == 'change') {
			data.sigCount = Object.size(this.client.signatures);
			data.sigTime = Object.maxTime(this.client.signatures, "time");

			data.chainCount = Object.size(chain.data.rawMap);
			data.chainTime = Object.maxTime(chain.data.rawMap, "time");// chain.data.last_modified;

			data.flareCount = chain.data.flares ? chain.data.flares.flares.length : 0;
			data.flareTime = chain.data.flares ? chain.data.flares.last_modified : 0;

			data.commentCount = Object.size(this.comments.data);
			data.commentTime = Object.maxTime(this.comments.data, "modified");

			data.activity = this.activity;
		} else {
			$.extend(this, $.ajax({url: "//"+ server +"/js/combine.json?v=0.7.0.1", async: false, dataType: "JSON"}).responseJSON);

			//this.wormholes = $.ajax({url: "js/wormholes.json", async: false, dataType: "JSON"}).responseJSON;
			//this.map = $.ajax({url: "js/map.json", async: false, dataType: "JSON"}).responseJSON;
			//this.systems = $.ajax({url: "js/systems.json", async: false, dataType: "JSON"}).responseJSON;
			//this.regions = $.ajax({url: "js/regions.json", async: false, dataType: "JSON"}).responseJSON;
			//this.factions = $.ajax({url: "js/factions.json", async: false, dataType: "JSON"}).responseJSON;
			this.aSystems = $.map(this.systems, function(system) { return system.name; });
			this.aSigSystems = this.aSystems.slice();
			$.merge(this.aSigSystems, ["Null-Sec", "Low-Sec", "High-Sec", "Class-1", "Class-2", "Class-3", "Class-4", "Class-5", "Class-6"]);
		}

		data.mode = mode != "init" ? "refresh" : "init";
		data.systemID = viewingSystemID;
		data.instance = tripwire.instance;

		this.xhr = $.ajax({
			url: "refresh.php",
			data: data,
			type: "POST",
			dataType: "JSON",
			cache: false
		}).done(function(data) {
			if (data) {
				tripwire.server = data;

				if (data.sync) {
					tripwire.serverTime.time = new Date(data.sync);
					tripwire.API();
				}

				if (data.signatures)
					tripwire.parse(data, mode);

				if (data.chain)
					tripwire.chainMap.parse(data.chain);

				if (data.comments)
					tripwire.comments.parse(data.comments)

				tripwire.active(data.activity);
				tripwire.EVE(data.EVE);

				if (data.notify) Notify.trigger(data.notify, "yellow", false);

				data.undo == true ? $("#undo").removeClass("disabled") : $("#undo").addClass("disabled");
				data.redo == true ? $("#redo").removeClass("disabled") : $("#redo").addClass("disabled");
			}

			successCallback ? successCallback(data) : null;
		}).always(function(data, status) {
			tripwire.timer = setTimeout("tripwire.refresh();", tripwire.refreshRate);

			alwaysCallback ? alwaysCallback(data) : null;

			if (status != "success" && status != "abort" && tripwire.connected == true) {
				tripwire.connected = false;
				$("#ConnectionSuccess").click();
				Notify.trigger("Error syncing with server", "red", false, "connectionError");
			} else if (status == "success" && tripwire.connected == false) {
				tripwire.connected = true;
				$("#connectionError").click();
				Notify.trigger("Successfully reconnected with server", "green", 5000, "connectionSuccess");
			}
		});

		return true;
	}

	this.active = function(data) {
		var editSigs = [];
		var editComments = [];

		for (var x in data) {
			var activity = JSON.parse(data[x].activity);
			editSigs.push(parseInt(activity.editSig));
			editComments.push(parseInt(activity.editComment));

			if (activity.editSig) {
				$("#sigTable tr[data-id='"+activity.editSig+"']")
					//.attr('data-tooltip', sig.editing)
					//.attr("title", sig.editing)
					.addClass("editing")
					.find("td")
					.animate({backgroundColor: "#001b47"}, 1000); //35240A - Yellow
			}

			if (activity.editComment && $("#commentWrapper .comment[data-id='"+activity.editComment+"'] .cke").length > 0) {
				$("#commentWrapper .comment[data-id='"+activity.editComment+"']")
					.addClass("editing")
					.find(".commentStatus").html(data[x].characterName + " is editing").fadeIn();
			}
		}

		$("#sigTable tr.editing").each(function() {
			if ($.inArray($(this).data("id"), editSigs) == -1) {
				$("#sigTable tr[data-id='"+$(this).data("id")+"']")
					//.attr('data-tooltip', '')
					//.removeAttr("title")
					.removeClass("editing")
					.find("td")
					.animate({backgroundColor: "#111"}, 1000, null, function() {$(this).css({backgroundColor: ""});});
			}
		});

		$("#commentWrapper .editing").each(function() {
			if ($.inArray($(this).data("id"), editComments) == -1) {
				$("#commentWrapper .editing[data-id='"+$(this).data("id")+"']")
					.removeClass("editing")
					.find(".commentStatus").fadeOut(function() {$(this).html("")});
			}
		});
	}

	this.comments = function() {
		this.comments.data = {};

		this.comments.parse = function(data) {
			for (var x in data) {
				var id = data[x].id;

				if (!Object.find(tripwire.comments.data, "id", id) && $(".comment[data-id='"+id+"']").length == 0) {
					var $comment = $(".comment:last").clone();
					var commentID = $(".comment:visible:last .commentBody").attr("id") ? $(".comment:visible:last .commentBody").attr("id").replace("comment", "") + 1 : 0;

					//data[id].sticky ? $(".comment:first").before($comment) : $(".comment:last").before($comment);
					$(".comment:last").before($comment);
					$comment.attr("data-id", id);

					try {
						$comment.find(".commentBody").html(data[x].comment);
					} catch (err) {
						$comment.find(".commentFooter").show();
						$comment.find(".commentStatus").html("<span class='critical'>" + err.constructor.name + ": " + err.message + "</span>");
						$comment.find(".commentFooter .commentControls").hide();
					}

					$comment.find(".commentModified").html("Edited by " + data[x].modifiedBy + " at " + data[x].modified);
					$comment.find(".commentCreated").html("Posted by " + data[x].createdBy + " at " + data[x].created);
					$comment.find(".commentBody").attr("id", "comment" + commentID);
					$comment.find(".commentSticky").addClass(data[x].sticky ? "active" : "");
					$comment.removeClass("hidden");
					Tooltips.attach($comment.find("[data-tooltip]"));

					//tripwire.comments.data[id] = data[id];
				} else if (Object.find(tripwire.comments.data, "id", id) && Object.find(tripwire.comments.data, "id", id).modified != data[x].modified) {
					var $comment = $(".comment[data-id='"+id+"']");

					try {
						$comment.find(".commentBody").html(data[x].comment);
					} catch (err) {
						$comment.find(".commentFooter").show();
						$comment.find(".commentStatus").html("<span class='critical'>" + err.constructor.name + ": " + err.message + "</span>");
						$comment.find(".commentFooter .commentControls").hide();
					}

					$comment.find(".commentModified").html("Edited by " + data[x].modifiedBy + " at " + data[x].modified);
					$comment.find(".commentSticky").addClass(data[x].sticky ? "active" : "");

					//tripwire.comments.data[id] = data[id];
				}
			}

			for (var x in tripwire.comments.data) {
				var id = tripwire.comments.data[x].id;

				if (!Object.find(data, "id", id)) {
					var $comment = $(".comment[data-id='"+id+"']");
					$comment.remove();
				}
			}

			tripwire.comments.data = data;
		}
	}

	// Handles putting chain together
	this.chainMap = function() {
		this.chainMap.parse = function(data) {
			chain.draw(data);
		}
	}

	// Handles pasting sigs from EVE
	this.pasteSignatures = function() {
		var processing = false;
		var paste;

		var rowParse = function(row) {
			var scanner = {group: "", type: ""};
			var columns = row.split("	"); // Split by tab

			for (var x in columns) {
				if (columns[x].match(/([A-Z]{3}[-]\d{3})/)) {
					scanner.id = columns[x].split("-");
					continue;
				}

				if (columns[x].match(/(\d+[.|,]\d+(%))/) || columns[x].match(/(\d[.|,]?\d+\s(AU|km|m))/i)) { // Exclude scan % || AU
					continue;
				}

				if (columns[x] == "Cosmic Signature" || columns[x] == "Cosmic Anomaly") {
					scanner.scanGroup = columns[x];
					continue;
				}

				if ($.inArray(columns[x], ["Wormhole", "Relic Site", "Gas Site", "Ore Site", "Data Site", "Combat Site"]) != -1) {
					scanner.group = columns[x];
					continue;
				}

				if (columns[x] != "") {
					scanner.type = columns[x];
				}
			}

			if (!scanner.id || scanner.id.length !== 2) {
				return false;
			}

			return scanner;
		}

		this.pasteSignatures.parsePaste = function(data) {
			var rows = data.split("\n");
			var data = {"request": {"signatures": {"add": [], "update": []}}};
			var ids = $.map(tripwire.client.signatures, function(sig) {return viewingSystemID == sig.systemID ? sig.signatureID : sig.sig2ID});

			for (var row in rows) {
				var scanner = rowParse(rows[row]);

				if (scanner.id) {
					if (scanner.group == "Wormhole") {
						type = "Wormhole";
						whType = "???";
						sigName = null;
					} else if (scanner.group == "Combat Site") {
						type = 'Sites';
						sigName = scanner.type;
					} else if (scanner.group == "Gas Site" || scanner.group == "Data Site" || scanner.group == "Relic Site" || scanner.group == "Ore Site") {
						type = scanner.group.replace(' Site', '');
						sigName = scanner.type;
					} else {
						type = null;
						sigName = null;
					}

					if (ids.indexOf(scanner.id[0]) !== -1) {
						// Update signature
						sig = $.map(tripwire.client.signatures, function(sig) {return viewingSystemID == sig.systemID ? (sig.signatureID == scanner.id[0]?sig:null):(sig.sig2ID == scanner.id[0]?sig:null)})[0];

						if (sig && viewingSystemID == sig.systemID) {
							// Parent side
							if ((type && sig.type != type) || (sigName && sig.name != sigName)) {
								if ((type == "Wormhole" && sig.life == null) || type !== "Wormhole") {
									data.request.signatures.update.push({
										id: sig.id,
										side: "parent",
										sigID: scanner.id[0],
										systemID: viewingSystemID,
										systemName: "",
										type: type || sig.type || "???",
										name: sigName || sig.name,
										sig2ID: sig.sig2ID || "???",
										connectionName: sig.connection || null,
										connectionID: sig.connectionID || null,
										whLife: sig.life || "Stable",
										whMass: sig.mass || "Stable",
										lifeLength: sig.lifeLength || 24,
										life: sig.lifeLength || 24
									});
								}
							}
						} else {
							// Child side
							if (sig && ((type && sig.sig2Type != type) || (sigName && sig.name != sigName))) {
								if ((type == "Wormhole" && sig.life == null) || type !== "Wormhole") {
									data.request.signatures.update.push({
										id: sig.id,
										side: "child",
										sig2ID: scanner.id[0],
										systemID: sig.connectionID || null,
										systemName: sig.connectionName || null,
										type: type || sig.sig2Type || "???",
										name: sigName || sig.name,
										connectionName: "",
										connectionID: viewingSystemID,
										whLife: sig.life || "Stable",
										whMass: sig.mass || "Stable",
										lifeLength: sig.lifeLength || 24,
										life: sig.lifeLength || 24
									});
								}
							}
						}
					} else {
						// Add signature
						ids.push(scanner.id[0]);

						data.request.signatures.add.push({
							id: scanner.id[0],
							systemID: viewingSystemID,
							connectionName: "",
							type: type || "???",
							name: sigName,
							life: options.signatures.pasteLife
						});
					}
				}
			}

			if (data.request.signatures.add.length || data.request.signatures.update.length) {
				data.systemID = viewingSystemID;

				var always = function(data) {
					processing = false;
				}

				tripwire.refresh('refresh', data, null, always);
			} else {
				processing = false;
			}
		}

		this.pasteSignatures.init = function() {
			$(document).keydown(function(e)	{
				if ((e.metaKey || e.ctrlKey) && (e.keyCode == 86 || e.keyCode == 91) && !processing) {
					//Abort - user is in input or textarea
					if ($(document.activeElement).is("textarea, input")) return;

					$("#clipboard").focus();
				}
			});

			$("body").on("click", "#fullPaste", function(e) {
				e.preventDefault();

				var rows = paste.split("\n");
				var pasteIDs = [];
				var deletes = [];

				for (var x in rows) {
					if (scan = rowParse(rows[x])) {
						pasteIDs.push(scan.id[0]);
					}
				}

				for (var i in tripwire.client.signatures) {
					var sig = tripwire.client.signatures[i];

					if (sig.systemID == viewingSystemID && $.inArray(sig.signatureID, pasteIDs) == -1 && sig.type !== "GATE" && sig.signatureID !== "???") {
						deletes.push(sig.id);
					} else if (sig.connectionID == viewingSystemID && $.inArray(sig.sig2ID, pasteIDs) == -1 && sig.sig2Type !== "GATE" && sig.sig2ID !== "???") {
						deletes.push(sig.id);
					}
				}

				if (deletes.length > 0) {
					var data = {"request": {"signatures": {"delete": deletes}}};

					tripwire.refresh('refresh', data);
				}
			});

			$("#clipboard").on("paste", function(e) {
				e.preventDefault();
				var data = window.clipboardData ? window.clipboardData.getData("Text") : (e.originalEvent || e).clipboardData.getData('text/plain');

				$("#clipboard").blur();

				processing = true;
				paste = data;
				Notify.trigger("Paste detected<br/>(<a id='fullPaste' href=''>Click to delete missing sigs</a>)");
				tripwire.pasteSignatures.parsePaste(data);
			});
		}

		this.pasteSignatures.init();
	}

	this.autoMapper = function(from, to) {
		// Testing
		//from = $.map(tripwire.systems, function(system, id) { return system.name == from ? id : null; })[0];
		//to = $.map(tripwire.systems, function(system, id) { return system.name == to ? id : null; })[0];
		var pods = [33328, 670];

		// Is auto-mapper toggled?
		if (!$("#toggle-automapper").hasClass("active"))
			return false;

		// Is pilot in a pod?
		if ($.inArray(parseInt(tripwire.client.EVE.shipTypeID), pods) >= 0)
			return false;

		// Is this a gate?
		if (typeof(tripwire.map.shortest[from - 30000000]) != "undefined" && typeof(tripwire.map.shortest[from - 30000000][to - 30000000]) != "undefined")
			return false;

		// Is this an existing connection?
		if ($.map(chain.data.rawMap, function(sig) { return (sig.systemID == from && sig.connectionID == to) || (sig.connectionID == from && sig.systemID == to) ? sig : null })[0])
			return false;

		//console.log('automapper fu!');
		var data = {"request": {"signatures": {"add": [], "update": []}}};
		var sig, toClass = null;

		if (tripwire.systems[to].class)
			toClass = "Class " + tripwire.systems[to].class;
		else if (tripwire.systems[to].security >= 0.45)
			toClass = "High-Sec";
		else if (tripwire.systems[to].security > 0)
			toClass = "Low-Sec";
		else
			toClass = "Null-Sec";

		sig = $.map(chain.data.rawMap, function(sig) { return sig.systemID == from && sig.mass && ((tripwire.wormholes[sig.type] && tripwire.wormholes[sig.type].leadsTo == toClass && sig.connectionID <= 0) || sig.connection == toClass) ? sig : null; })
		if (sig.length) {
			if (sig.length > 1) {
				$("#dialog-msg").dialog({
					autoOpen: true,
					buttons: {
						Cancel: function() {
							$(this).dialog("close");
						},
						Ok: function() {
							var x = $("#dialog-msg #msg [name=sig]:checked").val();

							data.request.signatures.update.push({
								id: sig[x].id,
								side: "parent",
								sigID: sig[x].signatureID,
								systemID: sig[x].systemID,
								systemName: sig[x].system,
								type: "Wormhole",
								whType: sig[x].type,
								sig2ID: sig[x].sig2ID,
								sig2Type: sig[x].sig2Type,
								connectionName: tripwire.systems[to].name,
								connectionID: to,
								whLife: sig[x].life,
								whMass: sig[x].mass,
								lifeLength: sig[x].lifeLength
							});

							data.systemID = viewingSystemID;

							var success = function(data) {
								if (data && data.result == true) {
									$("#dialog-msg").dialog("close");
								}
							}

							tripwire.refresh('refresh', data, success);
						}
					},
					open: function() {
						$("#dialog-msg #msg").html("Which signature would you like to update?<br/><br/>");

						$.each(sig, function(index) {
							$("#dialog-msg #msg").append("<input type='radio' name='sig' value='"+index+"' />"+this.signatureID+"<br/>");
						});
					}
				});
			} else if (sig.length) {
				sig = sig[0];

				data.request.signatures.update.push({
					id: sig.id,
					side: "parent",
					sigID: sig.signatureID,
					systemID: sig.systemID,
					systemName: sig.system,
					type: "Wormhole",
					whType: sig.type,
					sig2ID: sig.sig2ID,
					sig2Type: sig.sig2Type,
					connectionName: tripwire.systems[to].name,
					connectionID: to,
					whLife: sig.life,
					whMass: sig.mass,
					lifeLength: sig.lifeLength
				});
			}
		} else if (sig = $.map(chain.data.rawMap, function(sig) { return sig.systemID == from && sig.connectionID <= 0 && (sig.type == "???" || sig.type == "K162") ? sig : null; })) {
			if (sig.length > 1) {
				$("#dialog-msg").dialog({
					autoOpen: true,
					buttons: {
						Cancel: function() {
							$(this).dialog("close");
						},
						Ok: function() {
							var x = $("#dialog-msg #msg [name=sig]:checked").val();

							data.request.signatures.update.push({
								id: sig[x].id,
								side: "parent",
								sigID: sig[x].signatureID,
								systemID: sig[x].systemID,
								systemName: sig[x].system,
								type: "Wormhole",
								whType: sig[x].type,
								sig2ID: sig[x].sig2ID,
								sig2Type: sig[x].sig2Type,
								connectionName: tripwire.systems[to].name,
								connectionID: to,
								whLife: sig[x].life,
								whMass: sig[x].mass,
								lifeLength: sig[x].lifeLength
							});

							data.systemID = viewingSystemID;

							var success = function(data) {
								if (data && data.result == true) {
									$("#dialog-msg").dialog("close");
								}
							}

							tripwire.refresh('refresh', data, success);
						}
					},
					open: function() {
						$("#dialog-msg #msg").html("Which signature would you like to update?<br/><br/>");

						$.each(sig, function(index) {
							$("#dialog-msg #msg").append("<input type='radio' name='sig' value='"+index+"' /> "+this.signatureID+"<br/>");
						});
					}
				});
			} else if (sig.length) {
				sig = sig[0];

				data.request.signatures.update.push({
					id: sig.id,
					side: "parent",
					sigID: sig.signatureID,
					systemID: sig.systemID,
					systemName: sig.system,
					type: "Wormhole",
					whType: sig.type,
					sig2ID: sig.sig2ID,
					sig2Type: sig.sig2Type,
					connectionName: tripwire.systems[to].name,
					connectionID: to,
					whLife: sig.life,
					whMass: sig.mass,
					lifeLength: sig.lifeLength
				});
			}
		}
		//console.log(sig)

		if (sig.length == 0) {
			data.request.signatures.add.push({
				id: "???",
				systemID: from,
				type: "Wormhole",
				whType: "???",
				class: sigClass(tripwire.systems[from].name, "???"),
				class2: sigClass(tripwire.systems[to].name, null),
				connectionName: "",
				connectionID: to
			});
		}

		if (data.request.signatures.add.length || data.request.signatures.update.length) {
			data.systemID = viewingSystemID;

			tripwire.refresh('refresh', data);
		}
	}

	// Handles data from EVE IGB headers
	this.EVE = function(EVE) {
		if (EVE) {
			// Automapper
			if (this.client.EVE && this.client.EVE.systemID != EVE.systemID) {
				tripwire.autoMapper(this.client.EVE.systemID, EVE.systemID);
			}

			if (options.buttons.follow && (this.client.EVE && this.client.EVE.systemID != EVE.systemID) && $(".ui-dialog:visible").length == 0) {
				//window.location = "?system="+EVE.systemName;
				systemChange(EVE.systemID);
			}

			if (CCPEVE) {
				$("#link").parent().hide();
			} else {
				// Link stuff
				$("#link img").attr("src", "https://image.eveonline.com/Character/"+EVE.characterID+"_32.jpg");
				$("#link #name").html(EVE.characterName);
			}

			if (!$("#search").hasClass("active"))
					$("#currentSpan").show();

			// Update current system
			$("#EVEsystem").html(EVE.systemName).attr("href", ".?system="+EVE.systemName);
		} else {
			// Link stuff
			$("#link img").attr("src", "");
			$("#link #name").html("Open IGB to link data");

			// Update current system
			$("#EVEsystem").html("");
			$("#currentSpan").hide();
		}

		this.client.EVE = EVE;
	}

	this.parse = function(server, mode) {
		if (mode == 'refresh') {
			for (var key in server.signatures) {
				// Check for differences
				if (!this.client.signatures || !this.client.signatures[key]) {
					this.addSig(server.signatures[key], {animate: true});
				} else if (this.client.signatures[key].time !== server.signatures[key].time) {
					var edit = false;
					for (column in server.signatures[key]) {
						if (server.signatures[key][column] != this.client.signatures[key][column] && column != "time" && column != "editing") {
							edit = true;
						}
					}

					if (edit) {
						this.editSig(server.signatures[key]);
					} else {
						this.sigEditing(server.signatures[key]);
					}
				}
			}

			// Sigs needing removal
			for (var key in this.client.signatures) {
				if (!server.signatures[key]) {
					this.deleteSig(key);
				}
			}

			//client and server should now match
			this.client = server;
		} else if (mode == 'init' || mode == 'change') {

			for (var key in server.signatures) {
				this.addSig(server.signatures[key], {animate: false});

				if (server.signatures[key].editing) {
					this.sigEditing(server.signatures[key]);
				}
			}

			// Update current system
			if (server.EVE) {
				$("#EVEsystem").html(server.EVE.systemName).attr("href", ".?system="+server.EVE.systemName);
			}

			this.client = server;
		}
	}

	this.pastEOL = function() {
		var options = {since: $(this).countdown('option', 'until'), format: "HM", layout: "-{hnn}{sep}{mnn}&nbsp;"};
		$(this).countdown("option", options);
	}

	// Hanldes adding to Signatures section
	// ToDo: Use native JS
	this.addSig = function(add, options) {
		var options = options || {};
		var animate = typeof(options.animate) !== 'undefined' ? options.animate : true;

		if (add.mass) {
			var nth = add.systemID == viewingSystemID ? add.nth : add.nth2;
			var sigID = add.systemID == viewingSystemID ? add.signatureID : add.sig2ID;
			var sigtype = add.systemID == viewingSystemID ? add.type : add.sig2Type;
			var sigTypeBM = add.systemID == viewingSystemID ? add.typeBM : add.type2BM;
			var systemID = add.systemID == viewingSystemID ? add.connectionID : add.systemID;
			var name = add.systemID == viewingSystemID ? add.connection : add.system;
			var system = tripwire.systems[systemID] ? "<a href='.?system="+tripwire.systems[systemID].name+"'>"+(name ? name : tripwire.systems[systemID].name)+"</a>" : name;

			switch (add.life) {
				case "Stable":
					var lifeClass = "stable";
					break;
				case "Critical":
					var lifeClass = "critical";
					break;
				default:
					var lifeClass = "";
			}

			switch (add.mass) {
				case "Stable":
					var massClass = "stable";
					break;
				case "Destab":
					var massClass = "destab";
					break;
				case "Critical":
					var massClass = "critical";
					break;
				default:
					var massClass = "";
			}

			var row = "<tr data-id='"+add.id+"' data-tooltip=''>"
				+ "<td>"+sigID+"</td>"
				//+ "<td class='type-tooltip' title=\""+this.whTooltip(add)+"\">"+(nth>1?'&nbsp;&nbsp;&nbsp;':'')+(sigtype)+(nth>1?' '+nth:'')+"</td>"
				+ "<td class='type-tooltip' data-tooltip=\""+this.whTooltip(add)+"\">"+sigtype+sigFormat(sigTypeBM, "type")+"</td>"
				+ "<td class=\"age-tooltip\" data-tooltip='"+this.ageTooltip(add)+"'><span data-age='"+add.lifeTime+"'></span></td>"
				+ "<td>"+system+"</td>"
				+ "<td class='"+lifeClass+"'>"+add.life+"</td>"
				+ "<td class='"+massClass+"'>"+add.mass+"</td>"
				+ "<td><a href='' class='sigDelete'>X</a></td>"
				+ "<td><a href='' class='sigEdit'><</a></td>"
				+ "</tr>";

			var tr = $(row);
		} else {
			var row = "<tr data-id='"+add.id+"' data-tooltip=''>"
				+ "<td>"+add.signatureID+"</td>"
				+ "<td>"+add.type+"</td>"
				+ "<td class='age-tooltip' data-tooltip='"+this.ageTooltip(add)+"'><span data-age='"+add.lifeTime+"'></span></td>"
				+ "<td colspan='3'>"+(add.name?add.name:'')+"</td>"
				+ "<td><a href='' class='sigDelete'>X</a></td>"
				+ "<td><a href='' class='sigEdit'><</a></td>"
				+ "</tr>";

			var tr = $(row);
		}

		Tooltips.attach($(tr).find("[data-tooltip]"));
		//Tooltips.attach($(tr))

		$("#sigTable").append(tr);

		$("#sigTable").trigger("update");

		// Add counter
		if (add.life == "Critical") {
			$(tr).find('span[data-age]').countdown({until: new Date(add.lifeLeft), onExpiry: this.pastEOL, alwaysExpire: true, compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime})
				.countdown('pause')
				.addClass('critical')
				.countdown('resume');
		} else {
			$(tr).find('span[data-age]').countdown({since: new Date(add.lifeTime), compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime})
				.countdown('pause')
				.countdown('resume');
		}

		if (animate) {
			$(tr)
				.find('td')
				.wrapInner('<div class="hidden" />')
				.parent()
				.find('td > div')
				.slideDown(700, function(){
					$set = $(this);
					$set.replaceWith($set.contents());
				});

			$(tr).find("td").animate({backgroundColor: "#004D16"}, 1000).delay(1000).animate({backgroundColor: "#111"}, 1000, null, function() {$(this).css({backgroundColor: ""});});
		}
	}

	// Handles changing Signatures section
	// ToDo: Use native JS
	this.editSig = function(edit) {
		if (edit.mass) {
			var nth = edit.systemID == viewingSystemID ? edit.nth : edit.nth2;
			var sigID = edit.systemID == viewingSystemID ? edit.signatureID : edit.sig2ID;
			var sigtype = edit.systemID == viewingSystemID ? edit.type : edit.sig2Type;
			var sigTypeBM = edit.systemID == viewingSystemID ? edit.typeBM : edit.type2BM;
			var systemID = edit.systemID == viewingSystemID ? edit.connectionID : edit.systemID;
			var name = edit.systemID == viewingSystemID ? edit.connection : edit.system;
			var system = tripwire.systems[systemID] ? "<a href='.?system="+tripwire.systems[systemID].name+"'>"+(name ? name : tripwire.systems[systemID].name)+"</a>" : name;

			switch (edit.life) {
				case "Stable":
					var lifeClass = "stable";
					break;
				case "Critical":
					var lifeClass = "critical";
					break;
				default:
					var lifeClass = "";
			}

			switch (edit.mass) {
				case "Stable":
					var massClass = "stable";
					break;
				case "Destab":
					var massClass = "destab";
					break;
				case "Critical":
					var massClass = "critical";
					break;
				default:
					var massClass = "";
			}

			var row = "<tr data-id='"+edit.id+"' data-tooltip=''>"
				+ "<td>"+sigID+"</td>"
				//+ "<td class='type-tooltip' title=\""+this.whTooltip(edit)+"\">"+(nth>1?'&nbsp;&nbsp;&nbsp;':'')+(sigtype)+(nth>1?' '+nth:'')+"</td>"
				+ "<td class='type-tooltip' data-tooltip=\""+this.whTooltip(edit)+"\">"+sigtype+sigFormat(sigTypeBM, "type")+"</td>"
				+ "<td class=\"age-tooltip\" data-tooltip='"+this.ageTooltip(edit)+"'><span data-age='"+edit.lifeTime+"'></span></td>"
				+ "<td>"+system+"</td>"
				+ "<td class='"+lifeClass+"'>"+edit.life+"</td>"
				+ "<td class='"+massClass+"'>"+edit.mass+"</td>"
				+ "<td><a href='' class='sigDelete'>X</a></td>"
				+ "<td><a href='' class='sigEdit'><</a></td>"
				+ "</tr>";

			var tr = $(row);
		} else {
			var row = "<tr data-id='"+edit.id+"' data-tooltip=''>"
				+ "<td>"+edit.signatureID+"</td>"
				+ "<td>"+edit.type+"</td>"
				+ "<td class='age-tooltip' data-tooltip='"+this.ageTooltip(edit)+"'><span data-age='"+edit.lifeTime+"'></span></td>"
				+ "<td colspan='3'>"+(edit.name?edit.name:'')+"</td>"
				+ "<td><a href='' class='sigDelete'>X</a></td>"
				+ "<td><a href='' class='sigEdit'><</a></td>"
				+ "</tr>";

			var tr = $(row);
		}

		Tooltips.attach($(tr).find("[data-tooltip]"));

		$("#sigTable tr[data-id='"+edit.id+"']").replaceWith(tr);

		//coloring();
		$("#sigTable").trigger("update");
		// Add counter
		if (edit.life == "Critical") {
			$(tr).find('span[data-age]').countdown({until: new Date(edit.lifeLeft), onExpiry: this.pastEOL, alwaysExpire: true, compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime})
				.addClass('critical');
		} else {
			$(tr).find('span[data-age]').countdown({since: new Date(edit.lifeTime), compact: true, format: this.ageFormat, serverSync: this.serverTime.getTime});
		}

		$(tr).effect("pulsate");
	}

	// Handles removing from Signatures section
	this.deleteSig = function(key) {
		var tr = $("#sigTable tr[data-id='"+key+"']");

		//Append empty space to prevent non-coloring
		$(tr).find('td:empty, a:empty').append("&nbsp;");

		$(tr)
			.find('td')
			.wrapInner('<div />')
			.parent()
			.find('td > div').animate({backgroundColor: "#4D0000"}, 1000).delay(1000).animate({backgroundColor: "#111"}, 1000)
			.slideUp(700, function(){
				$(this).parent().parent().remove();
				$("#sigTable").trigger("update");
			});
	}

	// Handles WH Type hover-over tooltip
	// ToDo: Use native JS
	this.whTooltip = function(sig) {
		if (viewingSystemID == sig.systemID) {
			if ($.inArray(sig.type, $.map(tripwire.wormholes, function(item, index) { return index;})) >= 0) {
				var type = sig.type;
				var tooltip = '';
			} else {
				var type = sig.sig2Type;
				var tooltip = "<b>Type:</b> "+type+"<br/>";
			}
		} else {
			if ($.inArray(sig.sig2Type, $.map(tripwire.wormholes, function(item, index) { return index;})) >= 0) {
				var type = sig.sig2Type;
				var tooltip = '';
			} else {
				var type = sig.type;
				var tooltip = "<b>Type:</b> "+type+"<br/>";
			}
		}

		if ($.inArray(type, $.map(tripwire.wormholes, function(item, index) { return index;})) >= 0) {
			var whType = true;
		} else {
			var whType = false;
		}

		tooltip += "<b>Life:</b> "+(whType?tripwire.wormholes[type].life:"Unknown")+"<br/>";

		if (whType) {
			switch (tripwire.wormholes[type].leadsTo.split(" ")[0]) {
				case 'High-Sec':
					tooltip += "<b>Leads To:</b> <span class='hisec'>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
					break;
				case 'Low-Sec':
					tooltip += "<b>Leads To:</b> <span class='lowsec'>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
					break;
				case 'Null-Sec':
					tooltip += "<b>Leads To:</b> <span class='nullsec'>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
					break;
				case 'Class':
					tooltip += "<b>Leads To:</b> <span class='wh'>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
					break;
				default:
					tooltip += "<b>Leads To:</b> <span>"+tripwire.wormholes[type].leadsTo+"</span><br/>";
			}
		} else {
			tooltip += "<b>Leads To:</b> <span>Unknown</span><br/>";
		}

		tooltip += "<b>Max Mass</b>: "+(whType?numFormat(tripwire.wormholes[type].mass):"Unknown")+" Kg<br/>";

		tooltip += "<b>Max Jumpable</b>: "+(whType?numFormat(tripwire.wormholes[type].jump):"Unknown")+" Kg<br/>";

		return tooltip;
	}

	// Handles Age hover-over tooltip
	// ToDo: Use native JS
	this.ageTooltip = function(sig) {
		var date = new Date(sig.lifeTime);
		var localOffset = date.getTimezoneOffset() * 60000;
		date = new Date(date.getTime() + localOffset);

		var tooltip = "<table class=\"age-tooltip-table\"><tr><th>Created:</th><td>"+(date.getMonth()+1)+"/"+date.getDate()+" "+(date.getHours() < 10?'0':'')+date.getHours()+":"+(date.getMinutes() < 10?'0':'')+date.getMinutes()+"</td></tr>";

		if (sig.lifeTime != sig.time) {
			date = new Date(sig.time);
			localOffset = date.getTimezoneOffset() * 60000;
			date = new Date(date.getTime() + localOffset);

			tooltip += "<tr><th>Last Modified:</th><td>"+(date.getMonth()+1)+"/"+date.getDate()+" "+(date.getHours() < 10?'0':'')+date.getHours()+":"+(date.getMinutes() < 10?'0':'')+date.getMinutes()+"</td></tr>";
		}

		tooltip += "</table>";

		return tooltip;
	}

	// Handles when someone is editing a sig
	this.sigEditing = function(sig) {

	}

	this.refresh = function(mode, data, successCallback, alwaysCallback) {
		var mode = mode || 'refresh';

		this.sync(mode, data, successCallback, alwaysCallback);
	}

	this.init = function() {
		this.chainMap(); // Required to call .parse() during init()
		this.comments();
		this.serverTime(); // ?? so we can access inside function to get time?
		this.sync('init'); // Get initial info

		this.serverStatus(); // Get TQ status
		this.pasteSignatures();
		postLoad();
		systemChange(viewingSystemID, "init");
	}

	// Use delayed init to speed up rendering
	setTimeout("tripwire.init();", 50);
}

// Toggle dialog inputs based on sig type
$("#dialog-sigAdd #sigType, #dialog-sigEdit #sigType").change(function() {
	if ($(this).selectmenu("value") == "Wormhole") {
		$(this).closest(".ui-dialog").find(".sig-site").find("td > div, th > div").slideUp(200, function() { $(this).closest(".sig-site").hide(0); });

		$(this).closest(".ui-dialog").find("#sigLife").attr("disabled", "disabled").selectmenu("disable");
		$(this).closest(".ui-dialog").find("#sigName").attr("disabled", "disabled");

		$(this).closest(".ui-dialog").find(".sig-wormhole").find("td > div, th > div").slideDown(200, function() { $(this).closest(".sig-wormhole").show(200); });

		$(this).closest(".ui-dialog").find("#whType").removeAttr("disabled");
		$(this).closest(".ui-dialog").find("#connection").removeAttr("disabled");
		$(this).closest(".ui-dialog").find("#whLife").removeAttr("disabled").selectmenu("enable");
		$(this).closest(".ui-dialog").find("#whMass").removeAttr("disabled").selectmenu("enable");
	} else {
		$(this).closest(".ui-dialog").find(".sig-site").find("td > div, th > div").slideDown(200, function() { $(this).closest(".sig-site").show(200); });

		$(this).closest(".ui-dialog").find("#sigLife").removeAttr("disabled").selectmenu("enable");
		$(this).closest(".ui-dialog").find("#sigName").removeAttr("disabled");

		$(this).closest(".ui-dialog").find(".sig-wormhole").find("td > div, th > div").slideUp(200, function() { $(this).closest(".sig-wormhole").hide(0); });

		$(this).closest(".ui-dialog").find("#whType").attr("disabled", "disabled");
		$(this).closest(".ui-dialog").find("#connection").attr("disabled", "disabled");
		$(this).closest(".ui-dialog").find("#whLife").attr("disabled", "disabled").selectmenu("disable");
		$(this).closest(".ui-dialog").find("#whMass").attr("disabled", "disabled").selectmenu("disable");
	}
});

$("#add-signature").click(function(e) {
	e.preventDefault();

	$("#dialog-sigAdd").dialog({
		autoOpen: false,
		resizable: false,
		minHeight: 150,
		dialogClass: "dialog-noeffect",
		buttons: {
			Add: function() {
				$("#sigAddForm").submit();
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		},
		open: function() {
			$("#sigAddForm #sigID").val('');
			$("#sigAddForm #sigType").selectmenu("value", 'Sites');
			$("#sigAddForm #sigLife").selectmenu("value", 72);
			$("#sigAddForm #sigName").val('');
			$("#sigAddForm #whType").val('');
			$("#sigAddForm #connection").val('');
			$("#sigAddForm #autoAdd")[0].checked = false;
			$("#sigAddForm #autoAdd").button("refresh");
			$("#sigAddForm #whLife").selectmenu("value", 'Stable');
			$("#sigAddForm #whMass").selectmenu("value", 'Stable');

			if (tripwire.client.EVE)
				$("#autoAdd").button("enable");
			else
				$("#autoAdd").button("disable");
		},
		close: function() {
			$("th.critical").removeClass("critical");
			ValidationTooltips.close();
		},
		create: function() {
			$("#autoAdd").button().click(function() {
				$("#sigAddForm #connection").val(tripwire.client.EVE.systemName);
			});

			$("#sigAddForm #sigType, #sigAddForm #sigLife").selectmenu({width: "100px"});
			$("#sigAddForm #whLife, #sigAddForm #whMass").selectmenu({width: "80px"});

			$("#sigAddForm #whType, #sigAddForm #sigID").blur(function(e) {
				if (this.value == "") {
					this.value = "???";
				}
			});
		}
	});

	$("#dialog-sigAdd").dialog("open");
});

$("#sigAddForm").submit(function(e) {
	e.preventDefault();

	$("th.critical").removeClass("critical");
	ValidationTooltips.close();

	// Check for !empty and length == 3
	if ($("#sigAddForm #sigID").val() == '' || $("#sigAddForm #sigID").val().length !== 3) {
		$("#sigAddForm #sigID").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigAddForm #sigID")}).setContent("Must be 3 Letters in length!");
		return;
	}

	// Check for letters only
	if ($("#sigAddForm #sigID").val() !== "???") {
		var i = $("#sigAddForm #sigID").val().length;
		while (i--) {
			if ($("#sigAddForm #sigID").val()[i].toLowerCase() === $("#sigAddForm #sigID").val()[i].toUpperCase()) {
				$("#sigAddForm #sigID").focus().parent().prev("th").addClass("critical");
				ValidationTooltips.open({target: $("#sigAddForm #sigID")}).setContent("Must be only letters!");
				return;
			}
		}

		// Check for existing ID
		if ($.map(tripwire.client.signatures, function(sig) {return viewingSystemID == sig.systemID ?sig.signatureID : sig.sig2ID}).indexOf($("#sigAddForm #sigID").val().toUpperCase()) !== -1) {
			$("#sigAddForm #sigID").focus().parent().prev("th").addClass("critical");
			ValidationTooltips.open({target: $("#sigAddForm #sigID")}).setContent("Signature ID already exists!");
			return;
		}
	}

	// Check for !empty WH type
	if ($("#sigAddForm #sigType").val() == "Wormhole" && $("#sigAddForm #whType").val() == '') {
		$("#sigAddForm #whType").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigAddForm #whType")}).setContent("Must specify a wormhole type!");
		return;
	}

	// Check for valid WH type
	if ($("#sigAddForm #sigType").val() == "Wormhole" && whList.indexOf($("#sigAddForm #whType").val()) == -1) {
		$("#sigAddForm #whType").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigAddForm #whType")}).setContent("Not a valid wormhole type!");
		return;
	}

	// Check for valid Leads To
	if ($("#sigAddForm #sigType").val() == "Wormhole" && $("#sigAddForm #connection").val() && tripwire.aSigSystems.indexOf($("#sigAddForm #connection").val()) == -1) {
		$("#sigAddForm #connection").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigAddForm #connection")}).setContent("Not a valid leads to system!");
		return;
	}

	var form = $(this).serializeObject();
	form.systemID = viewingSystemID;
	form.lifeLength = tripwire.wormholes[form.whType] ? tripwire.wormholes[form.whType].life.split(" ")[0] : 72;
	form.class = sigClass(viewingSystem, form.whType);
	if (Object.index(tripwire.systems, "name", form.connectionName)) {
		form.connectionID = Object.index(tripwire.systems, "name", form.connectionName);
		form.class2 = sigClass(form.connectionName, null);
		form.connectionName = null;
	}

	var data = {"request": {"signatures": {"add": form}}};

	// Prevent duplicate submitting
	$("#sigAddForm input[type=submit]").attr("disabled", true);
	$("#dialog-sigAdd").parent().find(":button:contains('Add')").button("disable");

	var success = function(data) {
		if (data.result == true) {
			$("#dialog-sigAdd").dialog("close");
		}
	}

	var always = function(data) {
		$("#sigAddForm input[type=submit]").removeAttr("disabled");
		$("#dialog-sigAdd").parent().find(":button:contains('Add')").button("enable");
	}

	tripwire.refresh('refresh', data, success, always);
});

$("#sigEditForm").submit(function(e) {
	e.preventDefault();

	$("th.critical").removeClass("critical");
	ValidationTooltips.close();

	// Check for !empty and length == 3
	if ($("#sigEditForm #sigID").val() == '' || $("#sigEditForm #sigID").val().length !== 3) {
		$("#sigEditForm #sigID").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigEditForm #sigID")}).setContent("Must be 3 letters in length!");
		return;
	}

	// Check for letters only
	if ($("#sigEditForm #sigID").val() !== "???") {
		var i = $("#sigEditForm #sigID").val().length;
		while (i--) {
			if ($("#sigEditForm #sigID").val()[i].toLowerCase() === $("#sigEditForm #sigID").val()[i].toUpperCase()) {
				$("#sigEditForm #sigID").focus().parent().prev("th").addClass("critical");
				ValidationTooltips.open({target: $("#sigEditForm #sigID")}).setContent("Must be only letters!");
				return;
			}
		}

		// Check for existing ID
		if ($("#sigEditForm #sigID").val().toUpperCase() !== (viewingSystemID == tripwire.client.signatures[$(this).data("id")].systemID ? tripwire.client.signatures[$(this).data("id")].signatureID : tripwire.client.signatures[$(this).data("id")].sig2ID) && $.map(tripwire.client.signatures, function(sig) {return viewingSystemID == sig.systemID ? sig.signatureID : sig.sig2ID}).indexOf($("#sigEditForm #sigID").val().toUpperCase()) !== -1) {
			$("#sigEditForm #sigID").focus().parent().prev("th").addClass("critical");
			ValidationTooltips.open({target: $("#sigEditForm #sigID")}).setContent("Signature ID already exists! <input type='button' autofocus='true' id='overwrite' value='Overwrite' style='margin-bottom: -4px; margin-top: -4px; font-size: 0.8em;' data-id='"+ $("#sigTable tr:has(td:first-child:contains("+$("#sigEditForm #sigID").val().toUpperCase()+"))").data("id") +"' />");
			$("#overwrite").focus();
			return;
		}
	}

	// Check for empty WH type
	if ($("#sigEditForm #sigType").val() == "Wormhole" && $("#sigEditForm #whType").val() == '') {
		$("#sigEditForm #whType").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigEditForm #whType")}).setContent("Must specify a wormhole type!");
		return;
	}

	// Check for valid WH type
	if ($("#sigEditForm #sigType").val() == "Wormhole" && whList.indexOf($("#sigEditForm #whType").val()) == -1) {
		$("#sigEditForm #whType").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigEditForm #whType")}).setContent("Not a valid wormhole type!");
		return;
	}

	// Check for valid Leads To
	if ($("#sigEditForm #sigType").val() == "Wormhole" && $("#sigEditForm #connection").val() && tripwire.aSigSystems.indexOf($("#sigEditForm #connection").val()) == -1) {
		$("#sigEditForm #connection").focus().parent().prev("th").addClass("critical");
		ValidationTooltips.open({target: $("#sigEditForm #connection")}).setContent("Not a valid leads to system!");
		return;
	}


	var form = $(this).serializeObject();
	form.id = $(this).data("id");
	form.systemID = viewingSystemID; // needed??
	form.lifeLength = tripwire.wormholes[form.whType] ? tripwire.wormholes[form.whType].life.split(" ")[0] : 24;

	form.connectionID = form.connectionName ? Object.index(tripwire.systems, "name", form.connectionName) || null : null;
	form.connectionName = form.connectionID ? (form.side == "parent" ? (tripwire.client.signatures[form.id].connectionID > 0 ? tripwire.client.signatures[form.id].connection : null) : (tripwire.client.signatures[form.id].systemID > 0 ? tripwire.client.signatures[form.id].system : null)) : form.connectionName;
	//form.connectionName = tripwire.systems[form.connectionID] ? (form.side == "parent" ? tripwire.client.signatures[form.id].connection : tripwire.client.signatures[form.id].system) || null : form.connectionName;
	form.whLife = tripwire.client.signatures[form.id].life != form.whLife ? form.whLife : null;
	form.sig2ID = form.side == "parent" ? tripwire.client.signatures[form.id].sig2ID : tripwire.client.signatures[form.id].signatureID;
	form.sig2Type = form.side == "parent" ? tripwire.client.signatures[form.id].sig2Type : tripwire.client.signatures[form.id].type;
	form.class = sigClass(viewingSystem, form.whType);
	form.class2 = sigClass(form.connectionName, form.sig2Type);

	var data = {"request": {"signatures": {"update": form}}};

	// Prevent duplicate submitting
	$("#sigEditForm input[type=submit]").attr("disabled", true);
	$("#dialog-sigEdit").parent().find(":button:contains('Save')").button("disable");

	var success = function(data) {
		if (data.result == true) {
			$("#dialog-sigEdit").dialog("close");
		}
	}

	var always = function(data) {
		$("#sigEditForm input[type=submit]").removeAttr("disabled");
		$("#dialog-sigEdit").parent().find(":button:contains('Save')").button("enable");
	}

	tripwire.refresh('refresh', data, success, always);
});

$("#admin").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("disabled")) {
		return false;
	}

	if (!$("#dialog-admin").hasClass("ui-dialog-content")) {
		var refreshTimer = null;

		function refreshActiveUsers() {
			$("div.ui-dialog[aria-describedby='dialog-admin'] .ui-dialog-traypane").html("Total: " + $("#dialog-admin [data-window='active-users'] #userTable tr[data-id]").length);

			$.ajax({
				url: "admin.php",
				type: "POST",
				data: {mode: "active-users"},
				dataType: "JSON"
			}).success(function(data) {
				if (data && data.results) {
					var rows = data.results;
					for (var i = 0, l = rows.length; i < l; i++) {
						var $row = $("#dialog-admin [data-window='active-users'] #userTable tbody tr[data-id='"+ rows[i].id +"']");
						if ($row.length) {
							$row.find(".account").html(rows[i].accountCharacterName);
							$row.find(".character").html(rows[i].characterName || "&nbsp;");
							$row.find(".system").html(rows[i].systemName || "&nbsp;");
							$row.find(".shipName").html(rows[i].shipName || "&nbsp;");
							$row.find(".shipType").html(rows[i].shipTypeName || "&nbsp;");
							$row.find(".station").html(rows[i].stationName || "&nbsp;");
							$row.find(".login").html(rows[i].lastLogin);
						} else {
							$row = $("#dialog-admin [data-window='active-users'] tr.hidden").clone();
							$row.attr("data-id", rows[i].id);
							$row.find(".account").html(rows[i].accountCharacterName);
							$row.find(".character").html(rows[i].characterName || "&nbsp;");
							$row.find(".system").html(rows[i].systemName || "&nbsp;");
							$row.find(".shipName").html(rows[i].shipName || "&nbsp;");
							$row.find(".shipType").html(rows[i].shipTypeName || "&nbsp;");
							$row.find(".station").html(rows[i].stationName || "&nbsp;");
							$row.find(".login").html(rows[i].lastLogin);
							$row.removeClass("hidden");
							$("#dialog-admin [data-window='active-users'] #userTable tbody").append($row);
						}
					}

					var ids = $.map(data.results, function(user) { return user.id; });
					$("#dialog-admin [data-window='active-users'] #userTable tr[data-id]").each(function() {
						if ($.inArray($(this).data("id").toString(), ids) == -1) {
							$(this).remove();
						}
					});

					$("#dialog-admin [data-window='active-users'] #userTable").trigger("update", [true]);
				} else {
					$("#dialog-admin [data-window='active-users'] #userTable tr[data-id]").remove();
				}

				//var time = window.performance.now();
				//console.log(window.performance.now() - time);
				$("div.ui-dialog[aria-describedby='dialog-admin'] .ui-dialog-traypane").html("Total: " + $("#dialog-admin [data-window='active-users'] #userTable tr[data-id]").length);
			});

			if ($("#dialog-admin").dialog("isOpen") && $("#dialog-admin .menu .active").attr("data-window") == "active-users") {
				refreshTimer = setTimeout(refreshActiveUsers, 3000);
			}
		}

		$("#dialog-admin").dialog({
			autoOpen: true,
			modal: true,
			height: 350,
			width: 800,
			buttons: {
				Close: function() {
					$(this).dialog("close");
				}
			},
			create: function() {
				// menu toggle
				$("#dialog-admin").on("click", ".menu li", function(e) {
					e.preventDefault();
					$menuItem = $(this);
					clearTimeout(refreshTimer);

					$("#dialog-admin .menu .active").removeClass("active");
					$menuItem.addClass("active");
					$("div.ui-dialog[aria-describedby='dialog-admin'] .ui-dialog-traypane").html("");

					$("#dialog-admin .window [data-window]").hide();
					$("#dialog-admin .window [data-window='"+ $menuItem.data("window") +"']").show();

					switch ($menuItem.data("window")) {
						case "active-users":
							refreshActiveUsers();
							break;
					}
				});

				$("#dialog-admin [data-window='active-users'] #userTable").tablesorter({
					sortReset: true,
					widgets: ['saveSort'],
					sortList: [[0,0]]
				});

				// dialog bottom tray
				$($(this)[0].parentElement).find(".ui-dialog-buttonpane").append("<div class='ui-dialog-traypane'></div>");
			},
			open: function() {
				$menuItem = $("#dialog-admin .menu li.active");

				switch ($menuItem.data("window")) {
					case "active-users":
						refreshActiveUsers();
						break;
				}
			},
			close: function() {
				clearTimeout(refreshTimer);
			}
		});
	} else if (!$("#dialog-admin").dialog("isOpen")) {
		$("#dialog-admin").dialog("open");
	}
});

$(".options").click(function(e) {
	e.preventDefault();

	if ($(this).hasClass("disabled"))
		return false;

	$("#dialog-options").dialog({
		autoOpen: false,
		width: 450,
		minHeight: 400,
		modal: true,
		buttons: {
			Save: function() {
				// Options
				var data = {mode: "set", options: JSON.stringify(options)};

				$("#dialog-options").parent().find(".ui-dialog-buttonpane button:contains('Save')").attr("disabled", true).addClass("ui-state-disabled");

				options.chain.typeFormat = $("#dialog-options #typeFormat").val();
				options.chain.classFormat = $("#dialog-options #classFormat").val();

				options.chain.gridlines = JSON.parse($("#dialog-options input[name=gridlines]:checked").val());

				options.signatures.pasteLife = $("#dialog-options #pasteLife").val();

				options.background = $("#dialog-options #background-image").val();

				options.masks.active = $("#dialog-options input[name='mask']:checked").val();

				options.apply();
				options.save(); // Performs AJAX
				tripwire.refresh('refresh');

				$("#dialog-options").dialog("close");
				$("#dialog-options").parent().find(".ui-dialog-buttonpane button:contains('Save')").attr("disabled", false).removeClass("ui-state-disabled");

				// toggle mask admin icon
				$("#dialog-options input[name='mask']:checked").data("admin") ? $("#admin").removeClass("disabled") : $("#admin").addClass("disabled");
			},
			Reset: function() {
				$("#dialog-confirm #msg").html("Settings will be reset to defaults temporarily.<br/><br/><p><em>Save settings to make changes permanent.</em></p>");
				$("#dialog-confirm").dialog("option", {
					buttons: {
						Reset: function() {
							options.reset();
							options.apply();

							$("#dialog-options").dialog("close");
							$(this).dialog("close");
						},
						Cancel: function() {
							$(this).dialog("close");
						}
					}
				}).dialog("open");
			},
			Close: function() {
				$(this).dialog("close");
			}
		},
		open: function() {
			// Get user stats data
			$.ajax({
				url: "user_stats.php",
				type: "POST",
				dataType: "JSON"
			}).done(function(data) {
				for (stat in data) {
					$("#"+stat).text(data[stat]);
				}
			});

			// Get masks
			$.ajax({
				url: "masks.php",
				type: "POST",
				dataType: "JSON"
			}).done(function(response) {
				if (response && response.masks) {
					$("#dialog-options #masks #default").html("");
					$("#dialog-options #masks #personal").html("");
					$("#dialog-options #masks #corporate").html("");

					for (var x in response.masks) {
						var mask = response.masks[x];
						var node = $(''
							+ '<input type="radio" name="mask" id="mask'+x+'" value="'+mask.mask+'" class="selector" data-owner="'+mask.owner+'" data-admin="'+mask.admin+'" />'
							+ '<label for="mask'+x+'"><img src="'+mask.img+'" />'
							+  (mask.optional ? '<i class="closeIcon" onclick="return false;" data-icon="red-giant"><i data-icon="times"></i></i>' : '')
							+ '<span class="selector_label">'+mask.label+'</span></label>');

						$("#dialog-options #masks #"+mask.type).append(node);
					}

					var node = $(''
						+ '<input type="checkbox" name="find" id="findp" value="personal" class="selector" disabled="disabled" />'
						+ '<label for="findp"><i data-icon="search" style="font-size: 3em; margin-left: 16px; margin-top: 16px; display: block;"></i></label>');
					$("#dialog-options #masks #personal").append(node);

					if (init.session.admin == "1") {
						var node = $(''
							+ '<input type="checkbox" name="find" id="findc" value="corporate" class="selector" disabled="disabled" />'
							+ '<label for="findc"><i data-icon="search" style="font-size: 3em; margin-left: 16px; margin-top: 16px; display: block;"></i></label>');
						$("#dialog-options #masks #corporate").append(node);
					}

					$("#dialog-options input[name='mask']").filter("[value='"+response.masks[response.active].mask+"']").attr("checked", true).trigger("change");

					// toggle mask admin icon
					response.masks[response.active].admin ? $("#admin").removeClass("disabled") : $("#admin").addClass("disabled");
				}
			});

			$("#dialog-options #pasteLife").val(options.signatures.pasteLife);
			$("#dialog-options #typeFormat").val(options.chain.typeFormat);
			$("#dialog-options #classFormat").val(options.chain.classFormat);
			$("#dialog-options input[name='gridlines'][value='"+options.chain.gridlines+"']").prop("checked", true);
			$("#dialog-options #background-image").val(options.background);
		},
		create: function() {
			$("#optionsAccordion").accordion({heightStyle: "content", collapsible: true, active: false});

			$("#dialog-pwChange").dialog({
				autoOpen: false,
				resizable: false,
				minHeight: 0,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Save: function() {
						$("#pwForm").submit();
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				close: function() {
					$("#pwForm input[name='password'], #pwForm input[name='confirm']").val("");
					$("#pwError").text("").hide();
				}
			});

			$("#pwChange").click(function() {
				$("#dialog-pwChange").dialog("open");
			});

			$("#pwForm").submit(function(e) {
				e.preventDefault();

				$("#pwError").text("").hide();

				$.ajax({
					url: "options.php",
					type: "POST",
					data: $(this).serialize(),
					dataType: "JSON"
				}).done(function(response) {
					if (response && response.result) {
						$("#dialog-msg #msg").text("Password changed");
						$("#dialog-msg").dialog("open");

						$("#dialog-pwChange").dialog("close");
					} else if (response && response.error) {
						$("#pwError").text(response.error).show("slide", {direction: "up"});
					} else {
						$("#pwError").text("Unknown error").show("slide", {direction: "up"});
					}
				});
			});

			$("#dialog-usernameChange").dialog({
				autoOpen: false,
				resizable: false,
				minHeight: 0,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Save: function() {
						$("#usernameForm").submit();
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				open: function() {
					$("#usernameForm #username").html($("#dialog-options #username").html());
				},
				close: function() {
					$("#usernameForm [name='username']").val("");
					$("#usernameError").text("").hide();
				}
			});

			$("#usernameChange").click(function() {
				$("#dialog-usernameChange").dialog("open");
			});

			$("#usernameForm").submit(function(e) {
				e.preventDefault();

				$("#usernameError").text("").hide();

				$.ajax({
					url: "options.php",
					type: "POST",
					data: $(this).serialize(),
					dataType: "JSON"
				}).done(function(response) {
					if (response && response.result) {
						$("#dialog-msg #msg").text("Username changed");
						$("#dialog-msg").dialog("open");

						$("#dialog-options #username").html(response.result);

						$("#dialog-usernameChange").dialog("close");
					} else if (response && response.error) {
						$("#usernameError").text(response.error).show("slide", {direction: "up"});
					} else {
						$("#usernameError").text("Unknown error").show("slide", {direction: "up"});
					}
				});
			});

			// Mask selections
			$("#masks").on("change", "input.selector:checked", function() {
				if ($(this).data("owner")) {
					$("#maskControls #edit").removeAttr("disabled");
					$("#maskControls #delete").removeAttr("disabled");
				} else {
					$("#maskControls #edit").attr("disabled", "disabled");
					$("#maskControls #delete").attr("disabled", "disabled");
				}

				if ($(this).val() != 0.0 && $(this).val().split(".")[1] == 0) {
					$("#dialog-options #leave").removeAttr("disabled");
				} else {
					$("#dialog-options #leave").attr("disabled", "disabled");
				}
			});

			// Mask join
			$("#dialog-joinMask").dialog({
				autoOpen: false,
				resizable: false,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Add: function() {
						var mask = $("#dialog-joinMask #results input:checked");
						var label = $("#dialog-joinMask #results input:checked+label");

						$.ajax({
							url: "masks.php",
							type: "POST",
							data: {mask: mask.val(), mode: "join"},
							dataType: "JSON"
						}).done(function(response) {
							if (response && response.result) {
								label.css("width", "");
								label.find(".info").remove();
								label.append('<i class="closeIcon" onclick="return false;" data-icon="red-giant"><i data-icon="times"></i></i>');

								$("#dialog-options #masks #"+response.type+" input.selector:last").before(mask).before(label);
								$("#dialog-joinMask").dialog("close");
							}
						});
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				create: function() {
					$("#dialog-joinMask form").submit(function(e) {
						e.preventDefault();

						$("#dialog-joinMask #results").html("");
						$("#dialog-joinMask #loading").show();
						$("#dialog-joinMask input[type='submit']").attr("disabled", "disabled");

						$.ajax({
							url: "masks.php",
							type: "POST",
							data: $(this).serialize(),
							dataType: "JSON"
						}).done(function(response) {
							if (response && response.results) {
								for (var x in response.results) {
									var mask = response.results[x];
									var node = $(''
										+ '<input type="radio" name="mask" id="mask'+mask.mask+'" value="'+mask.mask+'" class="selector" data-owner="false" data-admin="'+mask.admin+'" />'
										+ '<label for="mask'+mask.mask+'" style="width: 100%; margin-left: -5px;">'
										+ '	<img src="'+mask.img+'" />'
										+ '	<span class="selector_label">'+mask.label+'</span>'
										+ '	<div class="info">'
										+ '		'+(mask.characterName ? mask.characterName + '<br/>' : '')
										+ '		'+mask.corporationName+'<br/>'
										+ '		'+mask.allianceName
										+ '	</div>'
										+ '</label>');

									$("#dialog-joinMask #results").append(node);
								}
							} else if (response && response.error) {
								$("#dialog-error #msg").text(response.error);
								$("#dialog-error").dialog("open");
							} else {
								$("#dialog-error #msg").text("Unknown error");
								$("#dialog-error").dialog("open");
							}
						}).always(function() {
							$("#dialog-joinMask #loading").hide();
							$("#dialog-joinMask input[type='submit']").removeAttr("disabled");
						});
					})
				},
				close: function() {
					$("#dialog-joinMask #results").html("");
					$("#dialog-joinMask input[name='name']").val("");
				}
			});

			$("#dialog-options #masks").on("click", "input[name='find']+label", function() {
				$("#dialog-joinMask input[name='find']").val($(this).prev().val());
				$("#dialog-joinMask").dialog("open");
			});

			// Mask leave
			$("#dialog-options #masks").on("click", ".closeIcon", function() {
				var mask = $(this).closest("input.selector+label").prev();

				$("#dialog-confirm #msg").text("Are you sure you want to remove this mask?");

				$("#dialog-confirm").dialog("option", {
					buttons: {
						Remove: function() {
							var send = {mode: "leave", mask: mask.val()};

							$.ajax({
								url: "masks.php",
								type: "POST",
								data: send,
								dataType: "JSON"
							}).done(function(response) {
								if (response && response.result) {
									mask.next().remove();
									mask.remove();

									$("#dialog-confirm").dialog("close");
								} else {
									$("#dialog-confirm").dialog("close");

									$("#dialog-error #msg").text("Unable to delete");
									$("#dialog-error").dialog("open");
								}
							});
						},
						Cancel: function() {
							$(this).dialog("close");
						}
					}
				}).dialog("open");
			});

			// Mask delete
			$("#maskControls #delete").click(function() {
				var mask = $("#masks input.selector:checked");

				$("#dialog-confirm #msg").text("Are you sure you want to delete this mask?");
				$("#dialog-confirm").dialog("option", {
					buttons: {
						Delete: function() {
							var send = {mode: "delete", mask: mask.val()};

							$.ajax({
								url: "masks.php",
								type: "POST",
								data: send,
								dataType: "JSON"
							}).done(function(response) {
								if (response && response.result) {
									mask.next().remove();
									mask.remove();

									$("#dialog-confirm").dialog("close");
								} else {
									$("#dialog-confirm").dialog("close");

									$("#dialog-error #msg").text("Unable to delete");
									$("#dialog-error").dialog("open");
								}
							});
						},
						Cancel: function() {
							$(this).dialog("close");
						}
					}
				}).dialog("open");
			});

			// User Create mask
			$("#dialog-createMask").dialog({
				autoOpen: false,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Create: function() {
						$("#dialog-createMask form").submit();
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				create: function() {
					$("#dialog-createMask #accessList").on("click", "#create_add+label", function() {
						$("#dialog-EVEsearch").dialog("open");
					});

					$("#dialog-createMask form").submit(function(e) {
						e.preventDefault();

						$.ajax({
							url: "masks.php",
							type: "POST",
							data: $(this).serialize(),
							dataType: "JSON"
						}).done(function(response) {
							if (response && response.result) {
								// Get masks
								$.ajax({
									url: "masks.php",
									type: "POST",
									dataType: "JSON"
								}).done(function(response) {
									if (response && response.masks) {
										$("#dialog-options #masks #default").html("");
										$("#dialog-options #masks #personal").html("");
										$("#dialog-options #masks #corporate").html("");

										for (var x in response.masks) {
											var mask = response.masks[x];
											var node = $(''
												+ '<input type="radio" name="mask" id="mask'+x+'" value="'+mask.mask+'" class="selector" data-owner="'+mask.owner+'" data-admin="'+mask.admin+'" />'
												+ '<label for="mask'+x+'"><img src="'+mask.img+'" />'
												+  (mask.optional ? '<i class="closeIcon" onclick="return false;" data-icon="red-giant"><i data-icon="times"></i></i>' : '')
												+ '<span class="selector_label">'+mask.label+'</span></label>');

											$("#dialog-options #masks #"+mask.type).append(node);
										}

										var node = $(''
											+ '<input type="checkbox" name="find" id="findp" value="personal" class="selector" disabled="disabled" />'
											+ '<label for="findp"><i data-icon="search" style="font-size: 3em; margin-left: 16px; margin-top: 16px; display: block;"></i></label>');
										$("#dialog-options #masks #personal").append(node);

										if (init.session.admin == "1") {
											var node = $(''
												+ '<input type="checkbox" name="find" id="findc" value="corporate" class="selector" disabled="disabled" />'
												+ '<label for="findc"><i data-icon="search" style="font-size: 3em; margin-left: 16px; margin-top: 16px; display: block;"></i></label>');
											$("#dialog-options #masks #corporate").append(node);
										}

										$("#dialog-options input[name='mask']").filter("[value='"+response.masks[response.active].mask+"']").attr("checked", true).trigger("change");

										// toggle mask admin icon
										response.masks[response.active].admin ? $("#admin").removeClass("disabled") : $("#admin").addClass("disabled");
									}
								});

								$("#dialog-createMask").dialog("close");
							} else if (response && response.error) {
								$("#dialog-error #msg").text(response.error);
								$("#dialog-error").dialog("open");
							} else {
								$("#dialog-error #msg").text("Unknown error");
								$("#dialog-error").dialog("open");
							}
						});
					});

					$("#dialog-createMask select").selectmenu({width: "100px"});
				},
				open: function() {
					$("#dialog-createMask input[name='name']").val("");
					$("#dialog-createMask #accessList :not(.static)").remove();
				}
			});

			$("#maskControls #create").click(function() {
				$("#dialog-createMask").dialog("open");
			});

			$("#dialog-createMask #accessList").on("click", ".maskRemove", function() {
				$(this).closest("input.selector+label").prev().remove();
				$(this).closest("label").remove();
			});

			$("#dialog-editMask").dialog({
				autoOpen: false,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Save: function() {
						$("#dialog-editMask form").submit();
					},
					Cancel: function() {
						$(this).dialog("close");
					}
				},
				create: function() {
					$("#dialog-editMask #accessList").on("click", ".maskRemove", function() {
						$(this).closest("input.selector+label").prev().attr("name", "deletes[]").hide();
						$(this).closest("label").hide();
					});

					$("#dialog-editMask #accessList").on("click", "#edit_add+label", function() {
						$("#dialog-EVEsearch").dialog("open");
					});

					$("#dialog-editMask form").submit(function(e) {
						e.preventDefault();

						$.ajax({
							url: "masks.php",
							type: "POST",
							data: $(this).serialize(),
							dataType: "JSON"
						}).done(function(response) {
							if (response && response.result) {
								$("#dialog-editMask").dialog("close");
							} else if (response && response.error) {
								$("#dialog-error #msg").text(response.error);
								$("#dialog-error").dialog("open");
							} else {
								$("#dialog-error #msg").text("Unknown error");
								$("#dialog-error").dialog("open");
							}
						});
					});
				},
				open: function() {
					var mask = $("#dialog-options input[name='mask']:checked").val();
					$("#dialog-editMask input[name='mask']").val(mask);
					$("#dialog-editMask #accessList label.static").hide();
					$("#dialog-editMask #loading").show();
					$("#dialog-editMask #name").text($("#dialog-options input[name='mask']:checked+label .selector_label").text());

					$.ajax({
						url: "masks.php",
						type: "POST",
						data: {mode: "edit", mask: mask},
						dataType: "JSON"
					}).done(function(response) {
						if (response && response.results) {
							for (var x in response.results) {
								var result = response.results[x];
								var node = $(''
									+ '<input type="checkbox" checked="checked" onclick="return false" name="" id="edit_'+(result.type == 2 ? result.corporationID : result.characterID)+'_'+result.type+'" value="'+(result.type == 2 ? result.corporationID : result.characterID)+'_'+result.type+'" class="selector" />'
									+ '<label for="edit_'+(result.type == 2 ? result.corporationID : result.characterID)+'_'+result.type+'" style="width: 100%; margin-left: -5px;">'
									+ '	<img src="https://image.eveonline.com/'+(result.type == 2 ? 'Corporation/'+result.corporationID+'_64.png' : 'Character/'+result.characterID+'_64.jpg')+'" />'
									+ '	<span class="selector_label">'+(result.type == 2 ? 'Corporation' : 'Character')+'</span>'
									+ '	<div class="info">'
									+ '		'+(result.type != 2 ? result.characterName + '<br/>' : '')
									+ '		'+result.corporationName+'<br/>'
									+ '		'+result.allianceName
									+ '		<input type="button" class="maskRemove" value="Remove" style="position: absolute; bottom: 3px; right: 3px;" />'
									+ '	</div>'
									+ '</label>');

								$("#dialog-editMask #accessList .static:first").before(node);
							}

							$("#dialog-editMask #accessList label.static").show();
						}
					}).always(function() {
						$("#dialog-editMask #loading").hide();
					});
				},
				close: function() {
					$("#dialog-editMask #accessList :not(.static)").remove();
				}
			});

			$("#maskControls #edit").click(function() {
				$("#dialog-editMask").dialog("open");
			});

			// EVE search dialog
			$("#dialog-EVEsearch").dialog({
				autoOpen: false,
				dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
				buttons: {
					Add: function() {
						if ($("#accessList input[value='"+$("#EVESearchResults input").val()+"']").length) {
							$("#dialog-error #msg").text("Already has access");
							$("#dialog-error").dialog("open");
							return false;
						}

						$("#EVESearchResults .info").append('<input type="button" class="maskRemove" value="Remove" style="position: absolute; bottom: 3px; right: 3px;" />');
						var node = $("#EVESearchResults").html();

						if ($("#dialog-createMask").dialog("isOpen"))
							$("#dialog-createMask #accessList .static:first").before(node);
						else if ($("#dialog-editMask").dialog("isOpen"))
							$("#dialog-editMask #accessList .static:first").before(node);

						$(this).dialog("close");
					},
					Close: function() {
						$(this).dialog("close");
					}
				},
				create: function() {
					$("#EVEsearch").submit(function(e) {
						e.preventDefault();

						$("#EVEsearch #searchSpinner").show();
						$("#EVEsearch input[type='submit']").attr("disabled", "disabled");
						$("#dialog-EVEsearch").parent().find(".ui-dialog-buttonpane button:contains('Add')").attr("disabled", true).addClass("ui-state-disabled");

						$.ajax({
							url: "masks.php",
							type: "POST",
							data: $(this).serialize(),
							dataType: "JSON"
						}).done(function(response) {
							if (response && response.results) {
								var result = response.results[0];
								var node = $(''
									+ '<input type="checkbox" checked="checked" onclick="return false" name="adds[]" id="find_'+(result.type == 2 ? result.corporationID : result.characterID)+'_'+result.type+'" value="'+(result.type == 2 ? result.corporationID : result.characterID)+'_'+result.type+'" class="selector" />'
									+ '<label for="find_'+(result.type == 2 ? result.corporationID : result.characterID)+'_'+result.type+'" style="width: 100%; margin-left: -5px;">'
									+ '	<img src="https://image.eveonline.com/'+(result.type == 2 ? 'Corporation/'+result.corporationID+'_64.png' : 'Character/'+result.characterID+'_64.jpg')+'" />'
									+ '	<span class="selector_label">'+(result.type == 2 ? 'Corporation' : 'Character')+'</span>'
									+ '	<div class="info">'
									+ '		'+(result.type != 2 ? result.characterName + '<br/>' : '')
									+ '		'+result.corporationName+'<br/>'
									+ '		'+result.allianceName
									+ '	</div>'
									+ '</label>');

								$("#EVESearchResults").html(node);
							} else {
								$("#dialog-error #msg").text("No Results");
								$("#dialog-error").dialog("open");
							}
						}).always(function() {
							$("#EVEsearch #searchSpinner").hide();
							$("#EVEsearch input[type='submit']").removeAttr("disabled");
							$("#dialog-EVEsearch").parent().find(".ui-dialog-buttonpane button:contains('Add')").removeAttr("disabled").removeClass("ui-state-disabled");
						});
					});
				},
				close: function() {
					$("#EVEsearch input[name='name']").val("");
					$("#EVESearchResults").html("");
				}
			});
		}
	});

	$("#dialog-options").dialog("open");
});

var whList;
function postLoad() {

	whList = $.map(tripwire.wormholes, function(item, index) { return index;});
	whList.splice(26, 0, "K162");
	whList.push("???", "GATE");

	$("#sigTable").tablesorter({
		sortReset: true,
		widgets: ['saveSort'],
		textExtraction: {
			2: function(node) { return $(node).find("span").data("age"); }
		}
	});

	$(".typesAutocomplete").inlineComplete({list: whList});
	$(".sigSystemsAutocomplete").inlineComplete({list: tripwire.aSigSystems});
	$(".systemsAutocomplete").inlineComplete({list: tripwire.aSystems});

	$("#dialog-error").dialog({
		autoOpen: false,
		resizable: false,
		minHeight: 0,
		dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
		buttons: {
			Ok: function() {
				$(this).dialog("close");
			}
		},
		create: function() {
			if (!CCPEVE) {
				// Effect remove overlay ????
				$(this).dialog("option", "show", {effect: "shake", duration: 150, easing: "easeOutElastic"});
			}
		}
	});

	$("#dialog-msg").dialog({
		autoOpen: false,
		resizable: false,
		minHeight: 0,
		dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
		buttons: {
			Ok: function() {
				$(this).dialog("close");
			}
		}
	});

	$("#dialog-confirm").dialog({
		autoOpen: false,
		resizable: false,
		minHeight: 0,
		dialogClass: "ui-dialog-shadow dialog-noeffect dialog-modal",
		buttons: {
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});
}

//console.log(window.performance.now() - startTime);







/****************************
	FINAL JAVASCRIPT
****************************/

// Notifications
var Notify = new function() {

	this.trigger = function(content, color, stick, id) {
		var color = typeof(color) !== "undefined" ? color : "blue";
		var stick = typeof(stick) !== "undefined" ? stick : 10000;
		var id = typeof(id) !== "undefined" ? id : null;

		new jBox("Notice", {
			id: id,
			content: content,
			offset: {y: 35},
			animation: "flip",
			color: color,
			autoClose: stick
		});
	}
}

// Init valdiation tooltips
var ValidationTooltips = new jBox("Tooltip", {
	trigger: null,
	addClass: "validation-tooltip",
	animation: "flip",
	fade: 0
});

var Tooltips = new jBox("Tooltip", {
	attach: $("[data-tooltip]"),
	getContent: "data-tooltip",
	position: {x: "right", y: "center"},
	outside: "x"
});

var OccupiedToolTips = new jBox("Tooltip", {
	pointer: "top:-3",
	position: {x: "right", y: "center"},
	outside: "x",
	animation: "move",
	repositionOnOpen: true,
	//closeOnMouseleave: true,
	onOpen: function() {
		var tooltip = this;
		var systemID = $(this.source).closest("[data-nodeid]").data("nodeid");

		tooltip.setContent("");

		$.ajax({
			url: "occupants.php",
			dataType: "JSON",
			data: "systemID="+systemID,
			cache: false
		}).done(function(data) {
			var chars = "<table>";

			for (var x in data.occupants) {
				chars += "<tr><td>"+data.occupants[x].characterName+"</td><td style='padding-left: 10px;'>"+data.occupants[x].shipTypeName+"</td></tr>";
			}

			chars += "</table>";
			tooltip.setContent(chars);
		});
	}
});

$("#chainTabs").sortable({
	items: "> .tab",
	axis: "x",
	tolerance: "pointer",
	containment: "parent",
	update: function(e, ui) {
		var result = $("#chainTabs").sortable("toArray");
		var newTabs = [];

		for (var x in result) {
			newTabs.push(options.chain.tabs[result[x]]);
			$("#chainTabs .tab:eq("+x+")").attr("id", x);
		}

		options.chain.active = $(".tab.current").index();
		options.chain.tabs = newTabs;
		options.save();
	}
});

$("#chainTabs").on("click", ".tab", function(e) {
	e.preventDefault();

	if ($(this).hasClass("current")) {
		$("#chainTabs .tab").removeClass("current");
		options.chain.active = null;
	} else {
		$("#chainTabs .tab").removeClass("current");
		$(this).addClass("current");
		options.chain.active = $(this).index();
	}

	options.save();
	chain.redraw();
});

$("#chainTabs").on("click", ".closeTab", function(e) {
	e.stopPropagation();
	var $tab = $(this).closest(".tab");

	$("#dialog-confirm #msg").html("This tab will be removed, are you sure?");
	$("#dialog-confirm").dialog("option", {
		buttons: {
			"Remove Tab": function() {
				var i = $tab.index();

				options.chain.active = $(".tab.current").index();
				options.chain.tabs.splice(i, 1);
				options.save();

				$tab.remove();
				if ($("#chainTabs .tab.current").length == 0) {
					$("#chainTabs .tab:last").click();
				}

				for (var x = 0, l = $("#chainTabs .tab").length; x < l; x++) {
					$("#chainTabs .tab:eq("+x+")").attr("id", x);
				}

				$(this).dialog("close");
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	}).dialog("open");
});

$("#newTab").on("click", function() {
	// check if dialog is open
	if (!$("#dialog-newTab").hasClass("ui-dialog-content")) {
		$("#dialog-newTab").dialog({
			resizable: false,
			minHeight: 0,
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				OK: function() {
					$("#newTab_form").submit();
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				$("#dialog-newTab #name").val(viewingSystem).focus();
				$("#dialog-newTab #system").val(viewingSystem);
			},
			close: function() {
				ValidationTooltips.close();
			},
			create: function() {
				$("#newTab_form").submit(function(e) {
					e.preventDefault();
					var $tab = $("#chainTab .tab").clone();
					var name = $("#dialog-newTab #name").val();
					var systemID = Object.index(tripwire.systems, "name", $("#dialog-newTab #system").val());
					var thera = $("#tabThera")[0].checked ? true : false;

					if (!name) {
						ValidationTooltips.open({target: $("#dialog-newTab #name")}).setContent("Must have a name!");
						return false;
					} else if (!systemID && $("#tabType1")[0].checked) {
						ValidationTooltips.open({target: $("#dialog-newTab #system")}).setContent("Must have a valid system!");
						return false;
					} else if ($("#tabType2")[0].checked) {
						systemID = 0;
					}

					$tab.attr("id", $("#chainTabs .tab").length).find(".name").data("tab", systemID).html(name);
					options.chain.tabs.push({systemID: systemID, name: name, evescout: thera});
					options.save();

					$("#chainTabs").append($tab);

					$("#dialog-newTab").dialog("close");
				});

				$("#dialog-newTab #system").click(function(e) {
					$("#dialog-newTab #tabType1").click();
				});
			}
		});
	} else if (!$("#dialog-newTab").dialog("isOpen")) {
		$("#dialog-newTab").dialog("open");
	}
});

$("#chainTabs").on("click", ".editTab", function(e) {
	e.stopPropagation();

	// check if dialog is open
	if (!$("#dialog-editTab").hasClass("ui-dialog-content")) {
		$("#dialog-editTab").dialog({
			resizable: false,
			minHeight: 0,
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				OK: function() {
					$("#editTab_form").submit();
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				$("#dialog-editTab #name").val(options.chain.tabs[options.chain.active].name).focus();
				$("#dialog-editTab #system").val(options.chain.tabs[options.chain.active].systemID > 0 ? tripwire.systems[options.chain.tabs[options.chain.active].systemID].name : "");
				options.chain.tabs[options.chain.active].systemID > 0 ? $("#dialog-editTab #editTabType1")[0].checked = true : $("#dialog-editTab #editTabType2")[0].checked = true;
				$("#dialog-editTab #editTabThera")[0].checked = options.chain.tabs[options.chain.active].evescout;
			},
			close: function() {
				ValidationTooltips.close();
			},
			create: function() {
				$("#editTab_form").submit(function(e) {
					e.preventDefault();
					var $tab = $("#chainTabs .tab").eq([options.chain.active]);
					var name = $("#dialog-editTab #name").val();
					var systemID = Object.index(tripwire.systems, "name", $("#dialog-editTab #system").val());
					var thera = $("#editTabThera")[0].checked ? true : false;

					if (!name) {
						ValidationTooltips.open({target: $("#dialog-editTab #name")}).setContent("Must have a name!");
						return false;
					} else if (!systemID && $("#editTabType1")[0].checked) {
						ValidationTooltips.open({target: $("#dialog-editTab #system")}).setContent("Must have a valid system!");
						return false;
					} else if ($("#editTabType2")[0].checked) {
						systemID = 0;
					}

					$tab.attr("id", $("#chainTabs .tab").length).find(".name").data("tab", systemID).html(name);
					options.chain.tabs[options.chain.active] = {systemID: systemID, name: name, evescout: thera};
					options.save();
					chain.redraw();

					//$("#chainTabs").append($tab);

					$("#dialog-editTab").dialog("close");
				});

				$("#dialog-editTab #system").click(function(e) {
					$("#dialog-editTab #editTabType1").click();
				});
			}
		});
	} else if (!$("#dialog-editTab").dialog("isOpen")) {
		$("#dialog-editTab").dialog("open");
	}
});

// Signature overwrite
$(document).on("click", "#overwrite", function() {
	var data = {request: {signatures: {"delete": [$(this).data("id")]}}, systemID: viewingSystemID};

	$("#overwrite").attr("disable", true);

	var success = function(data) {
		$("th.critical").removeClass("critical");
		ValidationTooltips.close();

		$("#dialog-sigEdit").parent().find(".ui-button-text:contains(Save)").click();
	}

	var always = function(data) {
		$("#overwrite").removeAttr("disable");
	}

	tripwire.refresh('refresh', data, success, always);
});

// Chain Map Context Menu
$("#chainMap").contextmenu({
	delegate: ".node a",
	uiMenuOptions: {position: {my: "left top-1", at: "right top"}},
	menu: "#igbChainMenu",
	show: {effect: "slideDown", duration: 150},
	select: function(e, ui) {
		var id = $(ui.target[0]).closest("[data-nodeid]").data("nodeid");
		var row = $(ui.target[0]).closest("[data-nodeid]").attr("id").replace("node", "") -1;

		switch(ui.cmd) {
			case "showInfo":
				CCPEVE.showInfo(5, id);
				break;
			case "setDest":
				CCPEVE.setDestination(id);
				break;
			case "addWay":
				CCPEVE.addWaypoint(id);
				break;
			case "showMap":
				CCPEVE.showMap(id);
				break;
			case "red":
				$(ui.target[0]).closest("td").hasClass("redNode") ? $(this).contextmenu("removeFlare", id, ui) : $(this).contextmenu("setFlare", id, ui.cmd, ui);
				break;
			case "yellow":
				$(ui.target[0]).closest("td").hasClass("yellowNode") ? $(this).contextmenu("removeFlare", id, ui) : $(this).contextmenu("setFlare", id, ui.cmd, ui);
				break;
			case "green":
				$(ui.target[0]).closest("td").hasClass("greenNode") ? $(this).contextmenu("removeFlare", id, ui) : $(this).contextmenu("setFlare", id, ui.cmd, ui);
				break;
			case "mass":
				$("#dialog-mass").data("id", $(ui.target[0]).closest("[data-nodeid]").data("sigid")).data("systemID", $(ui.target[0]).closest("[data-nodeid]").data("nodeid")).dialog("open");
				break;
			case "rename":
				$("#dialog-rename").data("id", $(ui.target[0]).closest("[data-nodeid]").data("sigid")).data("systemID", $(ui.target[0]).closest("[data-nodeid]").data("nodeid")).dialog("open");
				break;
			case "collapse":
				chain.map.collapse(row, ($.inArray(id, options.chain.tabs[options.chain.active].collapsed) == -1 ? true : false));
				break;
		}
	},
	beforeOpen: function(e, ui) {
		var sigID = $(ui.target[0]).closest("[data-nodeid]").data("sigid") || null;

		if (CCPEVE) {
			var id = $(ui.target[0]).closest("[data-nodeid]").data("nodeid");

			// Switch to IG menu
			$(this).contextmenu("replaceMenu", "#igbChainMenu");

			// Add check for k-space (disable EVECCP functions)
			if (tripwire.systems[id].regionID >= 11000000) {
				$(this).contextmenu("enableEntry", "setDest", false);
				$(this).contextmenu("enableEntry", "addWay", false);
				$(this).contextmenu("enableEntry", "showMap", false);
			} else {
				$(this).contextmenu("enableEntry", "setDest", true);
				$(this).contextmenu("enableEntry", "addWay", true);
				$(this).contextmenu("enableEntry", "showMap", true);
			}
		} else {
			// Switch to OOG menu
			$(this).contextmenu("replaceMenu", "#oogChainMenu");
		}

		if (sigID) {
			$(this).contextmenu("enableEntry", "rename", true);
			$(this).contextmenu("enableEntry", "mass", true);
		} else {
			$(this).contextmenu("enableEntry", "rename", false);
			$(this).contextmenu("enableEntry", "mass", false);
		}
	},
	create: function(e, ui) {
		$("#dialog-mass").dialog({
			autoOpen: false,
			width: "auto",
			height: "auto",
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				Close: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				var sigID = $(this).data("id");
				var systemID = $(this).data("systemID");
				var sig = Object.find(chain.data.rawMap, "id", sigID);

				$("#dialog-mass").dialog("option", "title", "From "+(sig.systemID == systemID ? tripwire.systems[sig.connectionID].name : tripwire.systems[sig.systemID].name)+" to "+tripwire.systems[systemID].name);

				$("#dialog-mass #massTable tbody tr").remove();

				var data = {signatureID: sigID};

				$.ajax({
					url: "mass.php",
					type: "POST",
					data: data,
					dataType: "JSON"
				}).done(function(data) {
					if (data && data.mass) {
                        var totalMass = 0;
						for (x in data.mass) {
                            totalMass += parseFloat(data.mass[x].mass);
							$("#dialog-mass #massTable tbody").append("<tr><td>"+data.mass[x].characterName+"</td><td>"+(data.mass[x].toID == systemID ? "In" : "Out")+"</td><td>"+data.mass[x].shipType+"</td><td>"+numFormat(data.mass[x].mass)+"Kg</td><td>"+data.mass[x].time+"</td></tr>");
						}
                        $("#dialog-mass #massTable tbody").append("<tr><td></td><td></td><td></td><th>"+ numFormat(totalMass) +"Kg</th><td></td></tr>");
					}
				});
			}
		});

		$("#dialog-rename").dialog({
			autoOpen: false,
			resizable: false,
			minHeight: 0,
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				Save: function() {
					$("#rename_form").submit();
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				var sigID = $(this).data("id");
				var systemID = $(this).data("systemID");
				var sig = Object.find(tripwire.client.chain.map, "id", sigID);

				$(this).find("#name").val(sig.systemID == systemID ? sig.system : sig.connection);
			},
			create: function() {
				$("#rename_form").submit(function(e) {
					e.preventDefault();
					var sigID = $("#dialog-rename").data("id");
					var systemID = $("#dialog-rename").data("systemID");
					var sig = Object.find(tripwire.client.chain.map, "id", sigID);

					$("#dialog-rename").parent().find(":button:contains('Save')").button("disable");

					var data = {"request": {"signatures": {"rename": {id: sigID, name: $("#dialog-rename").find("#name").val(), side: sig.systemID == systemID ? "parent" : "child"}}}};

					var success = function(data) {
						if (data && data.result == true) {
							$("#dialog-rename").dialog("close");
						}
					}

					var always = function(data) {
						$("#dialog-rename").parent().find(":button:contains('Save')").button("enable");
					}

					tripwire.refresh('refresh', data, success, always);
				});
			}
		});

		$.moogle.contextmenu.prototype.setFlare = function(systemID, flare, ui) {
			var data = {"systemID": systemID, "flare": flare};

			$.ajax({
				url: "flares.php",
				type: "POST",
				data: data,
				dataType: "JSON"
			}).done(function(data) {
				if (data && data.result) {
					$(ui.target[0]).closest("td").removeClass("redNode yellowNode greenNode").addClass(flare+"Node");

					chain.data.flares.flares.push({systemID: systemID, flare: flare, time: null});
					chain.flares();
				}
			});
		}

		$.moogle.contextmenu.prototype.removeFlare = function(systemID, ui) {
			var data = {"systemID": systemID};

			$.ajax({
				url: "flares.php",
				type: "POST",
				data: data,
				dataType: "JSON"
			}).done(function(data) {
				if (data && data.result) {
					$(ui.target[0]).closest("td").removeClass("redNode yellowNode greenNode");

					chain.data.flares.flares.splice(Object.index(chain.data.flares.flares, "systemID", systemID), 1);
					chain.flares();
				}
			});
		}
	}
});

$("#sigTable").on("click", ".sigDelete", function(e) {
	e.preventDefault();

	if ($("#dialog-sigEdit").hasClass("ui-dialog-content") && $("#dialog-sigEdit").dialog("isOpen")) {
		$("#dialog-sigEdit").parent().effect("shake", 300);
		return false;
	}

	$(this).closest("tr").addClass("selected");
	//$(this).addClass("invisible");

	// check if dialog is open
	if (!$("#dialog-deleteSig").hasClass("ui-dialog-content")) {
		$("#dialog-deleteSig").dialog({
			resizable: false,
			minHeight: 0,
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				Delete: function() {
					// Prevent duplicate submitting
					$("#dialog-deleteSig").parent().find(":button:contains('Delete')").button("disable");

					var ids = $.map($("#sigTable tr.selected"), function(n) { return $(n).data("id"); });
					var data = {"request": {"signatures": {"delete": ids}}, "systemID": viewingSystemID};

					var success = function(data) {
						if (data && data.result == true) {
							$("#dialog-deleteSig").dialog("close");
						}
					}

					var always = function(data) {
						$("#dialog-deleteSig").parent().find(":button:contains('Delete')").button("enable");
					}

					tripwire.refresh('refresh', data, success, always);
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			close: function() {
				$("#sigTable tr.selected").removeClass("selected");
				//$("#sigTable .sigDelete").removeClass("invisible");
			}
		});
	} else if (!$("#dialog-deleteSig").dialog("isOpen")) {
		$("#dialog-deleteSig").dialog("open");
	}
});

function openSigEdit(e) {
	e.preventDefault();

	if ($("#dialog-deleteSig").hasClass("ui-dialog-content") && $("#dialog-deleteSig").dialog("isOpen")) {
		$("#dialog-deleteSig").parent().effect("shake", 300);
		return false;
	} else if ($("#dialog-sigEdit").hasClass("ui-dialog-content") && $("#dialog-sigEdit").dialog("isOpen")) {
		$("#dialog-sigEdit").parent().effect("shake", 300);
		return false;
	}

	$(this).closest("tr").addClass("selected");

	// check if dialog is open
	if (!$("#dialog-sigEdit").hasClass("ui-dialog-content")) {
		$("#dialog-sigEdit").dialog({
			resizable: false,
			minHeight: 150,
			dialogClass: "ui-dialog-shadow dialog-noeffect",
			buttons: {
				Save: function() {
					$("#sigEditForm").submit();
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				var id = $("#sigTable tr.selected").data("id");
				$("#sigEditForm").data("id", id);
				var sig = tripwire.client.signatures[id];
				tripwire.activity.editSig = id;
				tripwire.refresh('refresh');

				$("#autoEdit")[0].checked = false;
				$("#autoEdit").button("refresh");

				// First check if it is a WH
				if (sig.life || sig.mass) {
					// Check which side we are editing
					if (sig.systemID == viewingSystemID) {
						$("#dialog-sigEdit #sigID").val(sig.signatureID);
						$("#dialog-sigEdit #sigType").selectmenu("value", 'Wormhole');
						$("#dialog-sigEdit #whType").val(sig.type);
						$("#dialog-sigEdit #connection").val(tripwire.systems[sig.connectionID] ? tripwire.systems[sig.connectionID].name : sig.connection);
						$("#dialog-sigEdit #whLife").selectmenu("value", sig.life);
						$("#dialog-sigEdit #whMass").selectmenu("value", sig.mass);

						$("#dialog-sigEdit [name=side]").val("parent");
					} else {
						$("#dialog-sigEdit #sigID").val(sig.sig2ID);
						$("#dialog-sigEdit #sigType").selectmenu("value", 'Wormhole');
						$("#dialog-sigEdit #whType").val(sig.sig2Type);
						$("#dialog-sigEdit #connection").val(tripwire.systems[sig.systemID] ? tripwire.systems[sig.systemID].name : sig.system);
						$("#dialog-sigEdit #whLife").selectmenu("value", sig.life);
						$("#dialog-sigEdit #whMass").selectmenu("value", sig.mass);

						$("#dialog-sigEdit [name=side]").val("child");
					}

					$("#dialog-sigEdit #sigLife").selectmenu("value", 72);
					$("#dialog-sigEdit #sigName").val("");
				} else {
					// Its not a WH
					$("#dialog-sigEdit #sigID").val(sig.signatureID);//.attr("name", "signatureID");
					$("#dialog-sigEdit #sigType").selectmenu("value", (sig.type == '???'?'Sites':sig.type));
					$("#dialog-sigEdit #sigLife").selectmenu("value", sig.lifeLength);
					$("#dialog-sigEdit #sigName").val(sig.name);

					$("#dialog-sigEdit #whType").val("");
					$("#dialog-sigEdit #connection").val("");
					$("#dialog-sigEdit #whLife").selectmenu("value", "Stable");
					$("#dialog-sigEdit #whMass").selectmenu("value", "Stable");

					$("#dialog-sigEdit [name=side]").val("parent");
				}

				if (tripwire.client.EVE)
					$("#autoEdit").button("enable");
				else
					$("#autoEdit").button("disable");
			},
			close: function(e, ui) {
				delete tripwire.activity.editSig;
				tripwire.refresh('refresh');

				$(this).data("id", "");

				$("th.critical").removeClass("critical");
				ValidationTooltips.close();

				$("#sigTable tr.selected").removeClass("selected");
			},
			create: function() {
				$("#autoEdit").button().click(function() {
					$("#sigEditForm #connection").val(tripwire.client.EVE.systemName);
				});

				$("#sigEditForm #sigType, #sigEditForm #sigLife").selectmenu({width: "100px"});
				$("#sigEditForm #whLife, #sigEditForm #whMass").selectmenu({width: "80px"});

				$("#sigEditForm #whType, #sigEditForm #sigID").blur(function(e) {
					if (this.value == "") {
						this.value = "???";
					}
				});
			}
		});
	} else if (!$("#dialog-sigEdit").dialog("isOpen")) {
		$("#dialog-sigEdit").dialog("open");
	}
}

$("#sigTable").on("click", ".sigEdit", openSigEdit);
$("#sigTable tbody").on("dblclick", "tr", openSigEdit);

var CKConfig = {
	skin: "custom",
	height: 100,
	allowedContent: true,
	extraPlugins: "toolbarswitch,autogrow,autolink",
	enterMode: CKEDITOR.ENTER_BR,
	removeDialogTabs: 'link:advanced',
	autoGrow_onStartup: true,
	autoGrow_minHeight: 100,
	toolbar_minToolbar: [
		{name: "basicstyles", items: ["Bold", "Italic", "Underline", "Strike"]},
		{name: "paragraph", items: ["BulletedList", "Outdent", "Indent"]},
		{name: "links", items: ["Link"]},
		{name: "colors", items: ["TextColor", "BGColor"]},
		{name: "styles", items: ["FontSize"]},
		{name: "tools", items: ["Toolbarswitch"]}
	],
	toolbar_maxToolbar: [
		{name: "basicstyles", items: ["Bold", "Italic", "Underline", "Strike", "Subscript", "Superscript"]},
		{name: "paragraph", items: ["NumberedList", "BulletedList", "Outdent", "Indent"]},
		{name: "links", items: ["Link"]},
		{name: "colors", items: ["TextColor", "BGColor"]},
		{name: "styles", items: ["FontSize", "Font"]},
		{name: "tools", items: ["Source", "Toolbarswitch"]}
	],
	toolbar: "minToolbar",
	smallToolbar: "minToolbar",
	maximizedToolbar: "maxToolbar",
	fontSize_style: {
	    element:        'span',
	    styles:         { 'font-size': '#(size)' },
	    overrides:      [ { element :'font', attributes: { 'size': null } } ]
	}
}

$("body").on("dblclick", ".comment", function(e) {
	e.preventDefault();
	document.getSelection().removeAllRanges();
	$(this).find(".commentEdit").click();
})

$("body").on("click", ".commentEdit", function(e) {
	e.preventDefault(); // <a href="javascript: CCPEVE.showInfo(5, 30003276)">Show Info</a>

	// Prevent multiple editors
	if ($(".cke").length) return false;

	var $comment = $(this).closest(".comment");

	$comment.find(".commentToolbar").hide();

	CKEDITOR.replace($comment.find(".commentBody").attr("id"), CKConfig).on("instanceReady", function() {
		$comment.find(".commentStatus").html("");
		$comment.find(".commentFooter").show();
		$comment.find(".commentFooter .commentControls").show();
	});

	tripwire.activity.editComment = $comment.data("id");
	tripwire.refresh('refresh');
});

$("body").on("click", ".commentSave, .commentCancel", function(e) {
	e.preventDefault();
	var $this = $(this);
	if ($this.attr("disabled")) return false;

	var $comment = $this.closest(".comment");
	$this.attr("disabled", "true");

	if ($this.hasClass("commentSave")) {
		var data = {"mode": "save", "commentID": $comment.data("id"), "systemID": viewingSystemID, "comment": CKEDITOR.instances[$comment.find(".commentBody").attr("id")].getData()};

		$.ajax({
			url: "comments.php",
			type: "POST",
			data: data,
			dataType: "JSON"
		}).done(function(data) {
			if (data && data.result == true) {
				$comment.find(".commentModified").html("Edited by " + data.comment.modifiedBy + " at " + data.comment.modifiedDate);
				$comment.find(".commentCreated").html("Posted by " + data.comment.createdBy + " at " + data.comment.createdDate);
				Tooltips.attach($comment.find("[data-tooltip]"));

				CKEDITOR.instances[$comment.find(".commentBody").attr("id")].destroy(false);
				$comment.attr("data-id", data.comment.id);
				$comment.find(".commentToolbar").show();
				$comment.find(".commentFooter").hide();
				$this.removeAttr("disabled");
			}
		});
	} else {
		CKEDITOR.instances[$comment.find(".commentBody").attr("id")].destroy(true);

		if (!$comment.attr("data-id")) {
			$comment.remove();
		} else {
			$comment.find(".commentToolbar").show();
			$comment.find(".commentFooter").hide();
			$this.removeAttr("disabled");
		}
	}

	$comment.find(".commentStatus").html("");

	delete tripwire.activity.editComment;
	tripwire.refresh('refresh');
});

$("body").on("click", ".commentDelete", function(e) {
	e.preventDefault();
	var $comment = $(this).closest(".comment");

	// check if dialog is open
	if (!$("#dialog-deleteComment").hasClass("ui-dialog-content")) {
		$("#dialog-deleteComment").data("comment", $comment).dialog({
			resizable: false,
			minHeight: 0,
			position: {my: "center", at: "center", of: $("#notesWidget")},
			dialogClass: "dialog-noeffect ui-dialog-shadow",
			buttons: {
				Delete: function() {
					// Prevent duplicate submitting
					$("#dialog-deleteComment").parent().find(":button:contains('Delete')").button("disable");

					var $comment = $(this).data("comment");
					var data = {"mode": "delete", "commentID": $comment.data("id")};

					$.ajax({
						url: "comments.php",
						type: "POST",
						data: data,
						dataType: "JSON"
					}).done(function(data) {
						if (data && data.result == true) {
							$("#dialog-deleteComment").dialog("close");
							$comment.remove();
						}
					}).always(function() {
						$("#dialog-deleteComment").parent().find(":button:contains('Delete')").button("enable");
					});
				},
				Cancel: function() {
					$(this).dialog("close");
				}
			}
		});
	} else if (!$("#dialog-deleteComment").dialog("isOpen")) {
		$("#dialog-deleteComment").data("comment", $comment).dialog("open");
	}
});

$("body").on("click", "#add-comment", function(e) {
	e.preventDefault();

	// Prevent multiple editors
	if ($(".cke").length) return false;

	var $comment = $(".comment:last").clone();
	var commentID = $(".comment:visible:last .commentBody").attr("id") ? $(".comment:visible:last .commentBody").attr("id").replace("comment", "") + 1 : 0;
	$(".comment:last").before($comment);

	$comment.find(".commentBody").attr("id", "comment" + commentID);
	$comment.removeClass("hidden").find(".commentEdit").click();
});

$("body").on("click", ".commentSticky", function(e) {
	e.preventDefault();
	var $comment = $(this).closest(".comment");

	var data = {"mode": "sticky", "commentID": $comment.data("id"), "systemID": $comment.find(".commentSticky").hasClass("active") ? viewingSystemID : 0};

	$.ajax({
		url: "comments.php",
		type: "POST",
		data: data,
		dataType: "JSON"
	}).done(function(data) {
		if (data && data.result == true) {
			$comment.find(".commentSticky").hasClass("active") ? $comment.find(".commentSticky").removeClass("active") : $comment.find(".commentSticky").addClass("active");
		}
	});
});

CKEDITOR.on("instanceLoaded", function(cke) {
	cke.editor.on("contentDom", function() {
		cke.editor.on("key", function(e) {
			if (e.data.keyCode == 27) {
				// escape key cancels
				$(cke.editor.element.$).closest(".comment").find(".commentCancel").click();
				return false;
			} else if (e.data.domEvent.$.altKey && e.data.domEvent.$.keyCode == 83) {
				// alt+s saves
				$(cke.editor.element.$).closest(".comment").find(".commentSave").click();
				return false;
			}
		});
	});

	$(".cke_combo__font a")
		.removeClass("cke_combo_button")
		.addClass("cke_button cke_button_off")
		.html('<span class="cke_button_icon">&nbsp;</span>')

	$(".cke_combo__fontsize a")
		.removeClass("cke_combo_button")
		.addClass("cke_button cke_button_off")
		.html('<span class="cke_button_icon">&nbsp;</span>')
});

CKEDITOR.on("instanceReady", function(cke) {
	// ensure focus on init
	cke.editor.focus();

	var s = cke.editor.getSelection(); // getting selection
	var selected_ranges = s.getRanges(); // getting ranges
	var node = selected_ranges[0].startContainer; // selecting the starting node
	var parents = node.getParents(true);

	node = parents[parents.length - 2].getFirst();

	if (!node) return false;

	while (true) {
		var x = node.getNext();
		if (x == null) {
			break;
		}
		node = x;
	}

	s.selectElement(node);
	selected_ranges = s.getRanges();
	selected_ranges[0].collapse(false);  //  false collapses the range to the end of the selected node, true before the node.
	s.selectRanges(selected_ranges);  // putting the current selection there
});

CKEDITOR.on("dialogDefinition", function(ev) {
	if (ev.data.name == 'link') {
		ev.data.definition.getContents('target').get('linkTargetType')['default'] = '_blank';
	}
});

if (window.location.href.indexOf("galileo") != -1) {
	Notify.trigger("This is the test version of Tripwire.<br/>Please use <a href='https://tripwire.cloud-things.com'>Tripwire</a>")
}

//	 New non-refresh code

function systemChange(systemID, mode) {
	if (mode != "init") {
		$("#infoSecurity").removeClass();
		$("#infoStatics").empty();

		viewingSystem = tripwire.systems[systemID].name;
		viewingSystemID = systemID;

		// Reset activity
		activity.refresh(true);

		// Reset signatures
		$("#sigTable tbody").empty()
		tripwire.client.signatures = [];

		// Reset chain map
		chain.redraw();

		// Reset comments
		$("#notesWidget .content .comment:visible").remove();
		tripwire.comments.data = null;

		tripwire.refresh("change");
	}

	document.title = tripwire.systems[systemID].name + " - " + (server == "static.eve-apps.com" ? "Tripwire" : "Galileo");

	$("#infoSystem").text(tripwire.systems[systemID].name);

	// Current system favorite
	$.inArray(viewingSystemID, options.favorites) != -1 ? $("#system-favorite").attr("data-icon", "star").addClass("active") : $("#system-favorite").attr("data-icon", "star-empty").removeClass("active");

	if (tripwire.systems[systemID].class) {
		// Security
		$("#infoSecurity").html("<span class='wh pointer'>Class " + tripwire.systems[systemID].class + "</span>");

		// Effects
		if (tripwire.systems[systemID].effect) {
			var tooltip = "<table cellpadding=\"0\" cellspacing=\"1\">";
			for (var x in tripwire.effects[tripwire.systems[systemID].effect]) {
				var effect = tripwire.effects[tripwire.systems[systemID].effect][x].name;
				var base = tripwire.effects[tripwire.systems[systemID].effect][x].base;
				var bad = tripwire.effects[tripwire.systems[systemID].effect][x].bad;
				var whClass = tripwire.systems[systemID].class > 6 ? 6 : tripwire.systems[systemID].class;
				var modifier = 0;

				switch (Math.abs(base)) {
					case 15:
						modifier = base > 0 ? 7 : -7;
						break;
					case 30:
						modifier = base > 0 ? 14 : -14;
						break;
					case 60:
						modifier = base > 0 ? 28 : -28;
						break;
				}

				tooltip += "<tr><td>" + effect + "</td><td style=\"padding-left: 25px; text-align: right;\" class=\"" + (bad ? "critical" : "stable") + "\">";
				tooltip += base + (modifier * (whClass -1)) + "%</td></tr>";
			}
			tooltip += "</table>";
			$("#infoSecurity").append("&nbsp;<span class='pointer' data-tooltip='" + tooltip + "'>" + tripwire.systems[systemID].effect + "</span>");
			Tooltips.attach($("#infoSecurity [data-tooltip]"));
		}

		// Statics
		for (var x in tripwire.systems[systemID].statics) {
			var type = tripwire.systems[systemID].statics[x];
			var wormhole = tripwire.wormholes[type];
			var color = "wh";

			switch (wormhole.leadsTo) {
				case "High-Sec":
					color = "hisec";
					break;
				case "Low-Sec":
					color = "lowsec";
					break;
				case "Null-Sec":
					color = "nullsec";
					break;
			}

			$("#infoStatics").append("<div><span class='"+ color +"'>&#9679;</span> <b>"+ wormhole.leadsTo +"</b> via <span class='"+ color +"'>"+ type +"</span></div>");
		}

		// Faction
		$("#infoFaction").html("&nbsp;");
	} else {
		// Security
		if (tripwire.systems[systemID].security >= 0.45) {
			$("#infoSecurity").addClass("hisec").text("High-Sec " + tripwire.systems[systemID].security);
		} else if (tripwire.systems[systemID].security > 0.0) {
			$("#infoSecurity").addClass("lowsec").text("Low-Sec " + tripwire.systems[systemID].security);
		} else {
			$("#infoSecurity").addClass("nullsec").text("Null-Sec " + tripwire.systems[systemID].security);
		}

		// Faction
		$("#infoFaction").html(tripwire.systems[systemID].factionID ? tripwire.factions[tripwire.systems[systemID].factionID].name : "&nbsp;");
	}

	// Region
	$("#infoRegion").text(tripwire.regions[tripwire.systems[systemID].regionID].name);



	// Info Links
	$("#infoWidget .infoLink").each(function() {
		this.href = $(this).data("href").replace(/\$systemName/gi, tripwire.systems[systemID].name).replace(/\$systemID/gi, systemID);
	});
}

$("body").on("click", "a[href^='.?system=']", function(e) {
	e.preventDefault();

	var system = $(this).attr("href").replace(".?system=", "");
	var systemID = Object.index(tripwire.systems, "name", system);

	systemChange(systemID);
});

$("#undo").on("click", function() {
	tripwire.refresh("refresh", {undo: true});
});

$("#redo").on("click", function() {
	tripwire.refresh("refresh", {redo: true});
});

$(document).keydown(function(e)	{
	if ((e.metaKey || e.ctrlKey) && (e.keyCode == 89 || e.keyCode == 90)) {
		//Abort - user is in input or textarea
		if ($(document.activeElement).is("textarea, input")) return;

		e.preventDefault();

		if (e.keyCode == 89 && !$("#redo").hasClass("disabled")) {
			$("#redo").click();
			Notify.trigger("Redoing last undo");
		} else if (e.keyCode == 90 && !$("#undo").hasClass("disabled")) {
			$("#undo").click();
			Notify.trigger("Undoing last action");
		}
	}
});
