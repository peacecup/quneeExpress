spa.drag = (function() {
	//获取绝对位置左
	function getElementViewLeft(element) {　　　　
		var actualLeft = element.offsetLeft;　　　　
		var current = element.offsetParent;　　　　
		while (current !== null) {　　　　　　
			actualLeft += current.offsetLeft;　　　　　　
			current = current.offsetParent;　　　　
		}　　　　
		if (document.compatMode == "BackCompat") {　　　　　　
			var elementScrollLeft = document.body.scrollLeft;　　　　
		} else {　　　　　　
			var elementScrollLeft = document.documentElement.scrollLeft;　　　　
		}　　　　
		return actualLeft - elementScrollLeft;　　
	}
	//获取绝对位置右
	　　
	function getElementViewTop(element) {　　　　
		var actualTop = element.offsetTop;　　　　
		var current = element.offsetParent;　　　　
		while (current !== null) {　　　　　　
			actualTop += current.offsetTop;　　　　　　
			current = current.offsetParent;　　　　
		}　　　　
		if (document.compatMode == "BackCompat") {　　　　　　
			var elementScrollTop = document.body.scrollTop;　　　　
		} else {　　　　　　
			var elementScrollTop = document.documentElement.scrollTop;　　　　
		}　　　　
		return actualTop - elementScrollTop;　　
	}

	function initDrag() {
		var img = document.getElementById("a");
		var canvas = document.getElementById("canvas");
		img.onmousedown = function(event) {
			var disX = event.clientX;
			var disY = event.clientY;
			var flag = false;
			if (img.setCapture) {
				img.setCapture();
			}
			img.style.cursor = "not-allowed";
			canvas.onmousemove = function(event) {
				//画板相对于界面的左上位置
				var canvasDisX = getElementViewLeft(canvas);
				var canvasDisY = getElementViewTop(canvas);
				if (event.clientX > canvasDisX && event.clientY > canvasDisY) {
					flag = true;
				}
				return true;
			}
			canvas.onmouseup = function(event) {
				if (flag = true) {
					var p = spa.graph.globalToLocal(event);
					var l = spa.graph.toLogical(p.x, p.y);
					var node = new Q.Node('demo',l.x,l.y);
					//这种写法会触发图元的datachange事件
					//var node = spa.graph.createNode('demo', l.x, l.y);
					spa.currentNodeId+=1;
					node.set('nodeId', spa.currentNodeId.toString());
					spa.model.add(node,spa.currentNodeId);
					img.style.cursor = "pointer";
				}
				canvas.onmousemove = canvas.onmouseup = null;
				//释放全局捕获 releaseCapture();  
				if (img.releaseCapture) {
					img.releaseCapture();
				}
			}
			return false;
		}
	}

	return {
		initDrag: initDrag
	}

})()