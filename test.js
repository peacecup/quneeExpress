
var monk = require('monk');
var db = monk('localhost:27017/logIO');
var result = {error:false};
	//获取node节点
	var nodeCollection = db.get("node");
	nodeCollection.find({},function(err,data){
		if(err){
			console.log(err);
		}else{
			console.log(data);
		}
	});