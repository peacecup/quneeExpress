var spa = (function() {
	var graph = new Q.Graph('canvas');
	return {
		graph: graph,
		model: graph.graphModel,
		currentNodeId: 0,
		tempNode: {
			updateNodes:[],
			saveNodes:[],
			delNodes:[],
		},
		init: function() {
			spa.shell.initModule();
		}
	}
})();