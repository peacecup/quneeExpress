spa.shell = (function() {
	var graph = new Q.Graph('canvas');
	return {
		initModule:function(){
			spa.shell.draw.initGraph();
            spa.shell.toolbox.initToolBox();
            spa.drag.initDrag();
		}
	}
})();