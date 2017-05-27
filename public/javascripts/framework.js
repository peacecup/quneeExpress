Q.Node.prototype.type = "Node";
Q.Text.prototype.type = "Text";
Q.Group.prototype.type = "Group";
Q.Edge.prototype.type = "Edge";

var graph;

$(function(){
    Q.addCSSRule(".maximize", "margin: 0px !important;position: fixed !important;top: 0px;bottom: 0px;right: 0px;left: 0px;z-index: 1030;height: auto !important; width: auto !important;");
    graph = new Q.Graph("canvas");

    var styles = {};
    styles[Q.Styles.SELECTION_COLOR] = "#0F0";
    graph.styles = styles;

    graph.originAtCenter = false;
    graph.editable = true;

    graph.onElementCreated = function (element, evt) {
        if (element instanceof Q.Edge) {
            var v = prompt("连线粗度");
            v = parseInt(v);
            if(v){
                element.setStyle(Q.Styles.EDGE_WIDTH, v);
            }else{
                graph.removeElement(element);
            }
            if(element.edgeType && element.edgeType != Q.Consts.EDGE_TYPE_DEFAULT){
                element.setStyle(Q.Styles.EDGE_BUNDLE, false);
            }
            return;
        }
        if (element instanceof Q.Text) {
            element.setStyle(Styles.LABEL_BACKGROUND_COLOR, "#2898E0");
            element.setStyle(Styles.LABEL_COLOR, "#FFF");
            element.setStyle(Styles.LABEL_PADDING, new Q.Insets(3, 5));
            return;
        }
    }

    graph.onLabelEdit = function(element, label, text, elementUI){
        if(!text){
            return false;
        }
        element.name = text;
        //此处调用后台保存
    }

    appendInteractionMenu(graph);

    initToolbar();
    initToolbox();
    initDatas();

//监听面板调整大小事件，同步graph大小
    $('#center_panel').panel({
        onResize: function (w, h) {
            graph.updateViewport();
        }
    });

});

function ensureVisible(node){
    var bounds = graph.getUIBounds(node);
    var viewportBounds = graph.viewportBounds;
    if(!viewportBounds.contains(bounds)){
        graph.sendToTop(node);
        graph.centerTo(node.x, node.y);
    }
}

function setInteractionMode(evt, info){
    graph.interactionMode = info.value;
    currentInteractionMode = info.value;
    if(info.value == Q.Consts.INTERACTION_MODE_CREATE_EDGE){
        graph.edgeUIClass = info.edgeUIClass;
        graph.edgeType = info.edgeType;
    }
}
function initToolbar(){
    var toolbar = document.getElementById("toolbar");
    var buttons = {
        interactionModes:[{name: "默认模式", value:Q.Consts.INTERACTION_MODE_DEFAULT, selected: true, icon:'/images/default_icon.png', action: setInteractionMode},
            {name: '框选模式', value:Q.Consts.INTERACTION_MODE_SELECTION, icon:'/images/rectangle_selection_icon.png', action: setInteractionMode},
            {name: '浏览模式', value:Q.Consts.INTERACTION_MODE_VIEW, icon:'/images/pan_icon.png', action: setInteractionMode}],
        zoom: [{name: "放大", icon:"/images/zoomin_icon.png", action: function(){graph.zoomIn()}},
            {name: "缩小", icon:"/images/zoomout_icon.png", action: function(){graph.zoomOut()}},
            {name: "1:1", action: function(){graph.scale = 1;}},
            {name: '纵览', icon:'/images/overview_icon.png', action: function(){this.zoomToOverview()}},
            {name: '最大化', icon:'/images/fullscreen_icon.png', action: function(){
                if($("#graph_panel").hasClass("maximize")){
                    $("#graph_panel").removeClass("maximize")
                }else{
                    $("#graph_panel").addClass("maximize")
                }
                graph.updateViewport();
            }}],
        find: {name: '查找', type: "input", action: function(evt, info){
            var name = info.input.value;
            if(!name){
                return;
            }
            graph.forEach(function(e){
                if(e instanceof Q.Node && (name == e.name || (e.info && e.info.name == name))){
                    graph.setSelection(e);
                    ensureVisible(e);
                    return false;
                }
            }, graph);
        }}
    };
    createToolBar(buttons, toolbar, graph, false, false);

}

function initToolbox(){
    var toolbox = document.getElementById("toolbox");

    createToolBar({a: [
        {name: '普通连线', value:Q.Consts.INTERACTION_MODE_CREATE_EDGE, icon:'/images/edge_icon.png', action: setInteractionMode},
        {name: '正交直线', value:Q.Consts.INTERACTION_MODE_CREATE_EDGE, icon:'/images/edge_orthogonal_icon.png', action: setInteractionMode, edgeType: Q.Consts.EDGE_TYPE_ORTHOGONAL_HORIZONTAL}]}, toolbox, graph,  "btn-group-vertical", false);

    createDNDImage(toolbox, "/images/node_icon.png", "终端", {type: "Node", label: "Mac", image: "Q.Graphs.node"});
    createDNDImage(toolbox, "/images/exchanger_icon.png", "交换机", {type: "Node", label: "交换机", image: "Q.Graphs.exchanger2"});
    createDNDImage(toolbox, "/images/server_icon.png", "服务器", {type: "Node", label: "服务器", image: "Q.Graphs.server"});
}

function initDatas(){
    Q.loadJSON("testData.json", function(json){
        var topoNodes = json.nodes;
        var relations = json.relations;
        initTopology(topoNodes,relations);

        graph.callLater(function(){
            var layouter = new Q.TreeLayouter(graph);
            layouter.doLayout();
            graph.moveToCenter();
        })

        var datas = [];
        var map = {};
        graph.graphModel.forEachByBreadthFirst(function(d){
            var name = d.name || d.type;
            var data = {text: name, id: d.id, iconCls: getTreeIcon(d)};
            map[d.id] = data;
            var parent = d.parent;
            if(!parent){
                datas.push(data);
                return;
            }
            parent = map[parent.id];
            var children = parent.children;
            if(!children){
                children = parent.children = [];
            }
            children.push(data);
        });
        $('#tree').tree({
            data: datas
        });

        syncSelectionTreeAndGraph("tree", graph);
        syncDataTreeAndGraph("tree", graph);
    });
}

function getTreeIcon(d){
    return d instanceof Q.Edge ? "edge_icon" : "node_icon";
}
function syncDataTreeAndGraph(treeId, graph){
    treeId = "#" + treeId;
    graph.listChangeDispatcher.addListener(function(evt){
        var data = evt.data;
        switch (evt.kind) {
            case Q.ListEvent.KIND_ADD :
                var treeData = {data:[{id: data.id, text: data.name, iconCls: getTreeIcon(data)}]};
                $(treeId).tree('append', treeData);
                break;
            case Q.ListEvent.KIND_REMOVE :
                Q.forEach(data, function(node){
                    var node = $(treeId).tree('find', node.id);
                    if(node){
                        $(treeId).tree('remove', node.target);
                    }
                });
                break;
            case Q.ListEvent.KIND_CLEAR :
                break;
        }
    });
}

function syncSelectionTreeAndGraph(treeId, graph){
    treeId = "#" + treeId;
    var selectionAjdusting;
    graph.selectionChangeDispatcher.addListener(function(evt){
        if(selectionAjdusting){
            return;
        }
        selectionAjdusting = true;
        var selection = [];
        graph.selectionModel.forEach(function(node){
            var node = $(treeId).tree('find', node.id);
            if(node){
                selection.push(node.target);
            }
        });
        $(treeId).tree('select', selection);
        selectionAjdusting = false;
    });
    $(treeId).tree({onSelect: function(){
        if(selectionAjdusting){
            return;
        }
        selectionAjdusting = true;
        var selected = $(treeId).tree("getSelected");
        if(selected){
            var node = graph.getElement(selected.id);
            graph.selectionModel.set(node);
            if(node){
                ensureVisible(node);
            }
        }
        selectionAjdusting = false;
    }});
}

function initTopology(topoNodes,topoRelations)
{
    var map = {};
    for(var i=0;i<topoNodes.length;i++)
    {
        var node = topoNodes[i];
        var qNode = new Q.Node();
        qNode.name=node.name;
        qNode.location = new Q.Point(node.x,node.y);
        graph.graphModel.add(qNode);
        map[node.id] = qNode;
    }
    for(var i=0;i<topoNodes.length;i++)
    {
        var node = topoNodes[i];
        var parent = node.parent;
        if(parent){
            parent = map[parent];
            if(parent){
                map[node.id].parent = parent;
            }
        }
    }
    for(var i=0;i<topoRelations.length;i++)
    {
        var relation = topoRelations[i];
        var nodeFrom = map[relation.from];
        var nodeTo = map[relation.to];
        if(nodeFrom && nodeTo){
            var edge = graph.createEdge(nodeFrom, nodeTo);
            edge.info = relation;
        }
    }
}