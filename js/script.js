/* Author:

*/

// Create a new chart
var width = 600, height = 300;
var chart = Raphael("gene-graph", width, height);

initGeneSearch();

function initGeneSearch() {

	// Load genes
	var geneList = $(".gene-list");
	$.each(SP_data, function(i) {
		geneList.append('<li index="' + i + '">' + this["Gene Symbol"] + '</li>');
	});

	// Keyword search field
	$("#gene-searchbox").on("keyup", function() {
		var searchterm = $.trim(this.value);
		$(".gene-list li").hide().find("a:contains('" + searchterm + "')").parent().show();
	});

	$(".gene-list li").wrapInner('<a href="#"></a>').each(function() {
		$('a', this).attr("href", "#" + $(this).text()).click(locateGene);
	});

	$(".gene-go-search a").click(function() {

		$('.gene-search').show();
		$('.gene-result').hide();
		return false;
	
	});
}

// Gene link
function locateGene() {

	$('.gene-search').hide();
	
	var gene = {
		title: $(this).text(),
		functs: [ 'unknown' ],
		similar: [ 'Abca8a', 'Acvr2a' ]
	};
	
	var gr = $('.gene-result');
	
	$('.gene-title', gr).html(gene.title);
	
	var geneIndex = parseInt($(this).parent().attr('index'));
	renderGene(SP_data[geneIndex]);
	
	//test
	$('img.gene-img', gr).attr('src', 'img/' + gene.title + '.jpg');
	
	$('ul.gene-functions', gr).empty();
	$.each(gene.functs, function() {
		$('ul.gene-functions', gr).append('<li>' + this + '</li>');
	});
	
	$('ul.gene-similar', gr).empty();
	$.each(gene.similar, function() {
		$('ul.gene-similar', gr).append('<li><a href="#">' + this + '</a></li>');
	});
	$('ul.gene-similar a', gr).click(locateGene);
	
	gr.removeClass("hidden").show();
}

function renderGene(gene) {

	var genechart = [];
	
	// Clear the chart
	chart.clear();
	
	// Iterate through the four ages
	$.each(SP_ages, function(index) { 
	
		// Parse age levels
		var gdls = getLevelsForGene(gene[this.name]);
		if (!gdls) {
			this.layers.x_notapplicable = true;
		}
	
		// Add layer info
		$.each(this.layers, function() {
			if (typeof SP_layers[this.n] == 'undefined') {
				alert("Layer " + this.n + " missing definition"); return;
			}
			this.i = SP_layers[this.n].t;
			if (gdls) {
				this.f = getGeneFillLevel(gdls[this.n]);
			}
		});
							 
		// Create chart for this age
		genechart.push(
			// cx, cy, w, layerHeight
			chart.geneLayers(parseInt(index * width / 4.4) + 1, 
							 parseInt(height * 0.9), 
							 parseInt(width / 6), 
							 parseInt(height / 24), 
							 this.layers, this.name)
		);

	});

}
