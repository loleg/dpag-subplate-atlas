/* Oleg Lavrovsky 2012 */
$(function() { 

// Create a new chart
var width = 600, height = 320;
var chart = Raphael("gene-graph", width, height);

// Setup db access
var path = unescape(document.location.pathname).split('/'),
    $design = path[3],
    $db = $.couch.db(path[1]);
    
function loadGeneSearch() {
    $db.view($design + "/all-genes", {
        descending: false,
        limit: 500,
        reduce: false,
        success: initGeneSearch
    });
};

function loadGeneDetails(id) {
	$db.openDoc(id, {
        success: showGeneDetail
    });
}

loadGeneSearch();

function initGeneSearch(data) {

	var SP_data = data.rows.map(function(r) {return [r.key, r.id];});

	// Load genes
	var geneList = $(".gene-list"), geneArray = [];
	$.each(SP_data, function(i) {
		geneList.append('<li index="' + i + '" id="' + this[1] + '">' + this[0] + '</li>');
		geneArray.push(this[0].toLowerCase());
	});

	// Keyword search field
	$("#gene-searchbox").keyup(function() {
		if (this.value.length < 2) return;
		var searchTerm = $.trim(this.value).toLowerCase(),
			objs = $(".gene-list li").hide().parent();
		for (var i = 0; i < geneArray.length; i++) {
			if (geneArray[i].indexOf(searchTerm) != -1) {
				$("li[index='" + i + "']", objs).show();
			}
		}
	});

	// Click on a gene
	$(".gene-list li").wrapInner('<a href="#"></a>').each(function() {
		$('a', this)
			.attr("href", "#" + $(this).text())
			.click(locateGene);
	});

	// Return to search
	$(".gene-go-search").click(function() {
		$('.gene-search').show();
		$('.gene-result').hide();
		return false;
	});
}

// Gene link
function locateGene() {
	var geneId = $(this).parent().attr('id');
	// TODO: local cache
	loadGeneDetails(geneId);
}

function showGeneDetail(data) {

	$('.gene-search').hide();
	console.log(data); return;
	/*
		AltSymbols: "Rbm25"
		Exp_Adult: "SP:s, L5:s, L6:s-, L4:s-, L3:s-, MZ:s-"
		Exp_E14E15: "na"
		Exp_E18: "na"
		Exp_P4P7: "na"
		FullName: "RNA binding motif protein 25"
		Function: ""
		Ptn_Adult: 2
		Ptn_E14E15: -1
		Ptn_E18: -1
		Ptn_P4P7: -1
		Symbol: "2600011C06Rik"
	*/
	
	//TODO: find similar
	
	var gr = $('.gene-result');
	
	$('.gene-title', gr).html(gene.title);
	/*
	var geneIndex = parseInt($(this).parent().attr('index'));
	if (typeof SP_data[geneIndex] == 'undefined') {
		alert('Data unavailable for gene at index ' + geneIndex);
		return;	
	}
	renderGene(SP_data[geneIndex]);
	
	// test: load an image
	// $('img.gene-img', gr).attr('src', 'img/' + gene.title + '.jpg');
	
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
	*/
}

function renderGene(gene) {

	var genechart = [];
	
	// Clear the chart
	chart.clear();
	
	// Iterate through the four ages
	$.each(SP_ages, function(index) { 
	
		// Parse age levels
		if (typeof gene == 'undefined') {
			alert('Gene undefined in renderGene'); return;
		}
		if (typeof gene[this.name] == 'undefined') {
			alert('Gene missing definition for ' + this.name); return;
		}
		var gdls = getLevelsForGene(gene[this.name]);
		if (gdls.blank) { this.layers.x_blank = true; }
		else if (gdls.na) { this.layers.x_notapplicable = true; }
	
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

});