
var clusterAssignments;

glue.inMode("module/rabvClusterPickerRunner", function() {
	clusterAssignments = glue.tableToObjects(glue.command(["run", "cluster-picker", 
	              "-a", "AL_UNC_509_REFSEQS_HM", 
	              "--treeFileName", "trees/raxml509RefseqsPhylogenyMidpointRerooted.tree", "NEWICK_BOOTSTRAPS"]));
});

_.each(clusterAssignments, function(caObj) {
	if(caObj.clusterIndex != null) {
		var seqModPath = "sequence/"+caObj.sourceName+"/"+caObj.sequenceID;
		glue.inMode(seqModPath, function() {
			glue.command(["set", "field", "--noCommit", "cluster", caObj.clusterIndex]);
		});
	}
});

glue.command(["commit"]);
