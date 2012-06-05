// Parse gene layers for this age
function getLevelsForGene(genedata) {
	if (typeof genedata == 'undefined') {
		alert('Invalid gene data in getLevelsForGene'); return;
	}
	var gene_layers = {},
		genedata = $.trim(genedata).toLowerCase();
	switch (genedata) {
	case '':
	case 'n/a':
		return false;
	}
	$.each(
		genedata.replace(' ','').split(','), 
		function() { 
			var xs = this.split(':');
			if (xs.length == 2) {
				gene_layers[xs[0].toUpperCase()] = xs[1]; 
			}
		});
	return gene_layers;
}

// Returns a number for the level fill
function getGeneFillLevel(code) {
	var f = 0;
	if (typeof code == 'undefined') return f;
	if (code.indexOf('s') != -1) { f = 1; }
	if (code.indexOf('w') != -1) { f = 2; }
	if (code.indexOf('-') != -1) { f += 2; }
//	console.log(code + ' -> ' + f);	
	return f;
}

// Draws gene layer pictogram
Raphael.fn.geneLayers = function (cx, cy, layerWidth, layerHeight, layers, title) {
    var paper = this,
        chart = [];
        
    var settings = {
    		fill: "#fff",
    		stroke: "#444",
    		strokeWidth: 2,
    		strokeHover: "#ee3",
    		highlight: "#888",
    		hover: "#88c",
    		fontSize: 12,
    		textColor: "#777"
    	};
    	
    var containerOpts = { 
    	 	fill: 'none',
    	 	stroke: settings.stroke,
    	 	"stroke-width": settings.strokeWidth 
    	},
    	layerOpts = { 
    	 	fill: '#fff',
    	 	stroke: 'none'
    	},
    	dividerOpts = {
    		stroke: settings.stroke,
    		"stroke-dasharray": "- ",
    	 	"stroke-width": 1
    	},
    	textLayerOpts = {
			fill: settings.textColor, stroke: "none",
			"text-anchor": "start",
			"font-size": settings.fontSize 
		},
		textLabelOpts = {
			fill: '#000', stroke: "none",
			"font-size": settings.fontSize 
		};
    
    // Work out the height ranges
    var totalLayers = 0;
	if (!layers.x_notapplicable) {
		$.each(layers, function() { totalLayers += this.s; });
	}

	// get the total or default height
	var h = totalLayers * layerHeight;
	h = (h == 0) ? 20 * layerHeight : h;
    	    
   	// Draws a layer
   	// obj: { n: Title, s: Size, border: false }
    function drawLayer(n, obj) {
    	
		var y = cy - parseInt(n * layerHeight);
		
		// Main shape
		var layer = paper.rect(cx, y, 
				layerWidth, parseInt(obj.s * layerHeight))
				.attr(layerOpts);
		
		// Right hand label
		var txt = 
			paper.text(0, 0,obj.n)
				 .attr(textLayerOpts)
				 .translate(
					cx + layerWidth + 10, 
					y + 3 + parseInt(obj.s * layerHeight) / 2);
					
		// Check fill pattern
		switch(obj.f) {
		case 1: 
			layer.f = "yellow"; break;
		case 2:
			layer.f = "red"; break;
		case 3:
			layer.f = "blue"; break;
		case 4:
			layer.f = "green"; break;
		default:
			layer.f = layerOpts.fill;
		}
		layer.attr({fill: layer.f});
	
		// Optional divider
		if (typeof obj.b == 'undefined' || obj.b) {
			paper.path("M" + cx + " " + y + "L" + (cx + layerWidth) + " " + y)
				 .attr(dividerOpts);
		}
	    
	    // Hover label
	    if (obj.i) {
			var label = paper.set();
			label.push(paper.text(0, 0, obj.i).attr({
				fill: "#000", stroke: "none", "font-size": settings.fontSize }));
			layer.lbl = label.hide();
			layer.ppp = paper.popup(txt.attrs.x + 13, txt.attrs.y, label, "right")
							.attr({ fill:'#fff' }).hide();
		}
		
		// Hover
		layer.mouseover(function() {
			this.stop().animate({fill:settings.hover}, 200);
			//this.ppp.show(); this.lbl.show();
		}).mouseout(function() {
			this.stop().animate({fill:this.f}, 200);
			//this.ppp.hide(); this.lbl.hide();
		});
		
		return layer;
	}
	
	// Exception if the data says n/a
    if (layers.x_notapplicable) {
    	chart.push(
    		paper.text(0, 0, 'N/A').attr(textLabelOpts)
			.translate(cx + (layerWidth / 2), cy - (h / 2))
        );
    } else {
		// Iterate drawing each layer
		var currentStep = 0;
		for (var u in layers) {
			currentStep += layers[u].s;    	
			chart.push(
				drawLayer(currentStep, layers[u])
			);
		}
	}
	
	// Age label
	chart.push(
		paper.text(0, 0, title).attr(textLabelOpts)
		.translate(cx + (layerWidth / 2), cy + 15)
	);
	
    // Draw containing box
    chart.push(
		paper.rect(cx, cy - h, layerWidth, h).attr(containerOpts)
	);
	
    return chart;
};
