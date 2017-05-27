spa.shell.draw = (function() {

	function addListener() {
		spa.model.dataChangeDispatcher.addListener({
			onEvent: function(evt) {
				//使用evt的source选项会缺少客户属性
				var node = spa.model.getById(evt.source.id);
				spa.tempNode.updateNodes[node.get("nodeId")] = node;
			}
		});
		spa.model.listChangeDispatcher.addListener({
			onEvent: function(evt) {
				//使用evt的source选项会缺少客户属性
				var node = spa.model.get(evt.index);
				if (evt.kind == "add") {
					spa.tempNode.saveNodes[spa.tempNode.saveNodes.length] = node;
				} else if (evt.kind == "remove") {
					spa.tempNode.delNodes[spa.tempNode.delNodes.length] = node;
				}
			}
		});
		spa.model.selectionChangeDispatcher.addListener(function(evt) {
			Q.log(evt.data[0].id);
		});
	}

	function translateToQuneeElement(json) {
		Q.forEach(json.nodes, toQuneeNode);
		Q.forEach(json.edges, toQuneeEdge);
	};

	function toQuneeNode(data) {
		spa.graph.callLater(function() {
			var node = spa.graph.createNode(data.name, Number(data.x) || 0, Number(data.y) || 0);
			node.set('nodeId', data.nodeId);
			node.image = Q.Graphs.server;
			spa.model.add(node, data.nodeId);
			spa.currentNodeId = Number(data.nodeId);
		})
	};

	function toQuneeEdge(data) {
		var from = spa.model.get(data.from);
		var to = spa.model.get(data.to);
		var edge = spa.graph.createEdge(data.name, from, to);
		edge.setStyle(Q.Styles.EDGE_LINE_DASH, [8, 4, 0.01, 4]);
		edge.setStyle(Q.Styles.LINE_CAP, "round");
		edge.setStyle(Q.Styles.EDGE_LINE_DASH_OFFSET, -2);
	};
	return {
		initGraph: function() {
			$.ajax({
				url: "http://localhost:3000/index",
				type: 'GET',
				success: function(json) {
					translateToQuneeElement(json);
					addListener();
				},
				error: function(err) {
					console.log(err);
				}
			})
		}
	}
})()