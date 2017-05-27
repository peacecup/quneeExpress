spa.shell.toolbox = (function() {
	//工具栏主体
	var toolbox = document.createElement('div');
	toolbox.id = "toolbox";
	//配置文件
	var config = {
		//可选的可添加按钮
		save_btn: `<button class="btn btn-default " value="save">保存</button>`,
		reset_btn: `<button class="btn btn-default" value="reset">重置</button>`,
		//按钮样式
		btn_style: {}
	};

	function onBtnClick(evt) {
		var data = {
			save: [],
			update: [],
			del: []
		};
		spa.tempNode.saveNodes.forEach(function(node) {
			if (node instanceof Q.Node) {
				var node_temp = {
					nodeId: node.get("nodeId"),
					x: node.x,
					y: node.y,
					name: node.name
				}
				data.save.push(node_temp);
			}
		})
		spa.tempNode.updateNodes.forEach(function(node) {
			if (node instanceof Q.Node) {
				var node_temp = {
					nodeId: node.get("nodeId"),
					x: node.x,
					y: node.y,
					name: node.name
				}
				data.update.push(node_temp);
			}
		})
		if (evt.target.value == 'save') {
			$.ajax({
				url: "http://localhost:3000/index/save",
				type: 'GET',
				data: data,
				success: function(json) {
					alert("保存成功!");
				},
				error: function() {
					alert("保存失败！");
				}
			})
		} else if (evt.target.value == 'reset') {
			location.reload(true);
		}
	}
	return {
		initToolBox: function() {
			//设置样式
			Q.css(toolbox, config.btn_style);
			//加载内部按钮
			toolbox.innerHTML = config.save_btn += config.reset_btn;
			//将工具栏加入到界面文档
			var textbar = document.getElementById("toolbar");
			textbar.appendChild(toolbox);
			toolbox.onclick = function(event) {
				onBtnClick(event);
			}
		}
	}

})();