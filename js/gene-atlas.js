$(function () {
		
	$.each(ages, function() {
		$.each(this.layers, function() {
			this.i = layerInfo[this.n].t;
		});
	});
	
	chart = Raphael("graph", 900, 650);
	
	chart_e15 = chart.geneLayers(50, 300, 100, 200, ages[0].layers);

});
