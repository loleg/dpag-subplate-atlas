Raphael.fn.geneLayers = function (cx, cy, w, h, layers) {
    var paper = this,
        chart = [];
    var settings = {
    		fill: "#fff",
    		stroke: "#444",
    		strokeWidth: 2,
    		strokeHover: "#ee3",
    		highlight: "#888",
    		hover: "#88c",
    		fontSize: 14,
    		textColor: "#aaa"
    	};
    	
    var containerOpts = { 
    	 	fill: settings.fill,
    	 	stroke: settings.stroke,
    	 	"stroke-width": settings.strokeWidth 
    	},
    	layerOpts = { 
    	 	fill: 'white',
    	 	stroke: 'none'
    	},
    	dividerOpts = {
    		stroke: settings.stroke,
    		"stroke-dasharray": "- ",
    	 	"stroke-width": 1
    	};
    
    paper.rect(cx, cy - h, w, h)
    	 .attr(containerOpts);
    
    var totalLayers = 0;
    $.each(layers, function() { totalLayers += this.s; });

    var layerHeight = h / totalLayers;
   
   	// Draws a layer
   	// obj: { n: Title, s: Size, border: false }
    function drawLayer(n, obj) {
    	
		var y = cy - parseInt(n * layerHeight);
		
		// Main shape
		var layer = paper.rect(cx, y, w, parseInt(obj.s * layerHeight));
		layer.attr(layerOpts);
		
		// Check fill
		switch(obj.f) {
		case 1:
			layer.f = "yellow"; break;
		case 2:
			layer.f = "red"; break;
		default:
			layer.f = layerOpts.fill;
		}
		layer.attr({fill: layer.f});
	
		// Optional divider
		if (typeof obj.b == 'undefined' || obj.b) {
			paper.path("M" + cx + " " + y + "L" + (cx + w) + " " + y)
				 .attr(dividerOpts);
		}
		
		// Right hand label
		var txt = 
				paper.text(cx + w + 15, 
							y + (obj.s * layerHeight) / 2, obj.n)
					 .attr({
	        			fill: settings.textColor, stroke: "none",
	        			"font-size": settings.fontSize });
	    
	    // Hover label
	    if (obj.i) {
			var label = paper.set();
			label.push(paper.text(0, 0, obj.i).attr({
				fill: "#000", stroke: "none", "font-size": settings.fontSize }));
			layer.lbl = label.hide();
			layer.ppp = paper.popup(txt.attrs.x + 10, txt.attrs.y, label, "right")
							.attr({ fill:'#fff' }).hide();
		}
		
		// Hover
		layer.mouseover(function() {
			this.stop().animate({fill:settings.hover}, 200);
			this.ppp.show(); this.lbl.show();
		}).mouseout(function() {
			this.stop().animate({fill:this.f}, 200);
			this.ppp.hide(); this.lbl.hide();
		});
		
		return layer;
	}
    
    var currentStep = 0;
    for (var u in layers) {
    	currentStep += layers[u].s;
    	drawLayer(currentStep, layers[u]);
    }
    
    /*	
    function sector(cx, cy, r, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * rad),
            x2 = cx + r * Math.cos(-endAngle * rad),
            y1 = cy + r * Math.sin(-startAngle * rad),
            y2 = cy + r * Math.sin(-endAngle * rad);
        return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    }
    
    function breakTextNicely(text, maxlength) {
		if (text.length < maxlength) return text;
		var tsp = text.split(' '), text = '', tr = '';
		for (var i in tsp) {
			if (tr.length > maxlength) {
				text += tr + '\n'; tr = '';
			}
			tr += tsp[i] + ' ';
			if (i == tsp.length - 1) {
				text += tr;
			}
		}
		return text;
	}
    
    var angle = 0,
        total = labels.length,
        start = 0;
        
    var process = function (label, ident, info) {
        var angleplus = 360 * 1 / total,
            popangle = angle + (angleplus / 2),
            ms = 500,
            delta = 30,
            sectoropts = {fill: settings.fill, stroke: settings.stroke, "stroke-width": settings.strokeWidth};
            
		var shape = sector(cx, cy, r, angle, angle + angleplus, sectoropts);
            
        var squish = (angle < 140 || (angle > 200 && angle < 310)) ? -50 : 0;
        	squish = ((angle > 245 && angle < 265) 
        			 || (angle > 75 && angle < 95)) ? squish * 0.55 : squish;
            
        var txt = paper.text(cx + (r + delta + 20 + label.length * 1.5) * Math.cos(-popangle * rad), 
					 cy + (r + squish + delta + 50) * Math.sin(-popangle * rad), 
					 label).attr({
            			fill: settings.textColor, stroke: "none", opacity: 0.5, 
            			"font-size": settings.fontSize });
		
		var label = paper.set();
		label.push(paper.text(0, 0, breakTextNicely(info, 20)).attr({
			fill: "#000", stroke: "none", "font-size": settings.fontSize }));
		label.hide();
		var ppp = paper.popup(txt.attrs.x, 
			txt.attrs.y + ((txt.attrs.y > cy) ? -15 : 15), label, 
						  (txt.attrs.y > cy) ? "top" : "bottom")
			.attr({ fill:'#fff' }).hide();
            		
		var sli = { 
				id: ident, text: txt, info: ppp, infotxt: label, obj: shape, enabled: false,
				
				Highlight: function(active, color) {
					color = (typeof color == 'undefined' ? settings.highlight : color);
					color = (active ? color : settings.fill);
					this.obj.attr({	fill: color	});
					this.text.stop().animate({opacity: active ? 1 : 0.5}, 200);
					this.highlight = color;
					this.enabled = active;
				},
				
				PlotPoint: function(distance) {
					var default_size = 8,
						d = (distance > 1) ? r/8 : r/16,
						x = cx + (r * distance/4 - d) * Math.cos(-popangle * rad),
						y = cy + (r * distance/4 - d) * Math.sin(-popangle * rad),
						pset = paper.set();
					pset.push(paper.circle(x, y, default_size)
						.attr({ fill: "#f00", "stroke-width": 2 }));
					pset.push(paper.text(x, y, "").attr({
						fill: "#fff", "font-size": 10 }));
					return {
							l: this.id, 
					 		d: distance, 
					 		pp: pset, 
					 		ids: {},
							setText: function(t) { 
								this.pp[1].attr({ text: t });
								this.pp[0].attr({ r: t.length > 1 ? 10 : 8 });
								this.pp[1].ids = this.ids;
								this.pp[1].info = this.info;
							} 
						};
				}
			};
		
		shape.mouseover(function() {
			this.stop().animate({fill:settings.hover}, 200);
			sli.text.stop().animate({opacity: 1}, 200);
			sli.info.show(); //stop().animate({opacity: 1}, 500);
			sli.infotxt.show();
		}).mouseout(function() {
			if (sli.enabled) {
				this.stop().animate({fill:sli.highlight}, 200);
			} else {
				this.stop().animate({fill:settings.fill}, 200);
				sli.text.stop().animate({opacity: 0.5}, 200);
			}
			sli.info.hide(); //stop().animate({opacity: 0}, 500);
			sli.infotxt.hide();
		});
		
        angle += angleplus;
        start += .1;
        
        return sli;
    };
    for (i in labels) {
	    chart.push(process(labels[i].title, labels[i].id, labels[i].info));
    }    
	var circleopts = {stroke: settings.stroke, "stroke-width": settings.strokeWidth};
		p2 = paper.circle(cx, cy, r * 3/4).attr(circleopts),
		p3 = paper.circle(cx, cy, r * 2/4).attr(circleopts),
		p4 = paper.circle(cx, cy, r * 1/4).attr(circleopts);
    for (i in chart) {
	    chart[i].info.toFront();
	    chart[i].infotxt.toFront();
    }
    */
    
    return chart;
};
