// General comparison function for convenience
function compare(x, y) {
  if (x === y) {
    return 0;
  }
  return x > y ? 1 : -1;
}

var seqObjs = glue.tableToObjects(
		glue.command(
			["list", "sequence", "-s", "cluster", "-w", "source.name = 'ncbi-refseqs'", 
			 "sequenceID", "gb_length", "major_clade", "minor_clade", "cluster", "collection_year", "gb_create_date"]));


var maxCluster = 0;
_.each(seqObjs, function(seqObj) {
	if(seqObj.cluster > maxCluster) {
		maxCluster = seqObj.cluster;
	}
});

var nextCluster = maxCluster+1;
_.each(seqObjs, function(seqObj) {
	if(seqObj.cluster == null) {
		seqObj.cluster = maxCluster;
		maxCluster++;
	}
});

_.each(seqObjs, function(seqObj) {
	if(seqObj.collection_year == null) {
		seqObj.collection_year = parseInt(seqObj.gb_create_date.substring(7,11));
	}
});


var clusterToSeqs = new Array(nextCluster);

_.each(seqObjs, function(seqObj) {
	var clusterIdx = seqObj.cluster;
	var seqs = clusterToSeqs[clusterIdx];
	if(seqs == null) {
		seqs = [];
		clusterToSeqs[clusterIdx] = seqs;
	}
	seqs.push(seqObj);
});

var refCommands = [];

_.each(clusterToSeqs, function(seqs) {
	if(seqs != null) {
		seqs.sort(function(so1, so2) {
			// prefer full length genomes if they exist.
			if(so1.gb_length >= 9000 && so2.gb_length < 9000) {
				return -1;
			}
			if(so2.gb_length >= 9000 && so1.gb_length < 9000) {
				return 1;
			}
			if(so1.sequenceID.indexOf("NC_") == 0 && so2.sequenceID.indexOf("NC_") != 0 ) {
				return -1;
			}
			if(so2.sequenceID.indexOf("NC_") == 0 && so1.sequenceID.indexOf("NC_") != 0 ) {
				return 1;
			}
			// otherwise prefer the earlier collected
			var dateComp = compare(so1.collection_year, so2.collection_year);
			if(dateComp != 0) {
				return dateComp;
			}
			// otherwise prefer based on sequenceID
			return compare(so1.sequenceID, so2.sequenceID);
		});
		var refseq = seqs[0];
		var refseqName = "REF_"+refseq.major_clade;
		if(refseq.minor_clade != null) {
			refseqName = refseqName+"_"+refseq.minor_clade;
		}
		refseqName = refseqName+"_"+refseq.sequenceID;
		refCommands.push("create reference "+refseqName+" ncbi-refseqs "+refseq.sequenceID);
	}
});

refCommands.sort();

var cmdString = "\n";
_.each(refCommands, function(cmd) {
	cmdString = cmdString+ cmd +"\n";
})

glue.logInfo(cmdString);


