var express = require('express');
var router = express.Router();
var monk = require('monk');
var db = monk('localhost:27017/logIO');

router.get('/',function(req,res){
	var result = {error:false};
	//获取node节点
	var nodeCollection = db.get("node");
	var edgeCollection = db.get("edge");
	nodeCollection.find({},function(err,data){
		if(err){
			res.json({error:true});
		}else{
			result.nodes= data;
			edgeCollection.find({},function(err,data){
		        if(err){
			        res.json({error:true});
		        }else{
			        result.edges = data;
			        res.json(result);
		        }
	        });
	        
		}
	});
});
router.get('/save',function(req,res){
	var result = {error:false};
	var nodeCollection = db.get("node");
	var tempNode = req.query;
	//update
	for(var nodeindex in tempNode.update){
		var node = tempNode.update[nodeindex];
		if(!node){
			continue;
		};
		nodeCollection.update(
			{'nodeId':node.nodeId},
		    node,
		    function(err,data){
		    	if(err){
		    		result.error = true;
		    	}
		    }
		);
	}
	console.log(0);
	console.log(tempNode.save);
	//insert
	for(var nodeindex in tempNode.save){
		var node = tempNode.save[nodeindex];
		if(!node){
			continue;
		}
		nodeCollection.insert(
		    node,
		    function(err,data){
		    	if(err){
		    		result.error = true;
		    	}
		    }
		);
	}
	res.json(result);
})

module.exports = router;