function featureSourceRef(sequenceID, majorClade, minorClade) {
	if(majorClade == 'Asian' && minorClade == 'SEA3') {
		return "REF_Asian_SEA3_KX148255"
	}
	if(sequenceID != "NC_001542") {
		return "REF_Bats_EF-E2_JQ685925";
	}
	return "REF_MASTER_NC_001542";
}


var featuresToInherit = ["N", "P", "M", "G", "L"];

var referenceNames = glue.getTableColumn(glue.command(["list", "reference"]), "name");

//remove all feature locations
_.each(referenceNames, function(referenceName) {
	glue.inMode("/reference/"+referenceName, function() {
		glue.command(["remove", "feature-location", "-r", "whole_genome"]);
	});
});
		
// add explicit feature locations
glue.command(["run", "file", "glue/rabvExplicitFeatureLocations.glue"]);

// if explicit feature locations are missing, inherit via the unconstrained alignment
_.each(referenceNames, function(referenceName) {
	var sourceName;
	var sequenceID;
	glue.inMode("/reference/"+referenceName, function() {
		var showSeqResult = glue.command(["show", "sequence"]).showSequenceResult;
		sourceName = showSeqResult["sequence.source.name"];
		sequenceID = showSeqResult["sequence.sequenceID"];
	});
	var seqLength;
	var majorClade;
	var minorClade;
	glue.inMode("/sequence/"+sourceName+"/"+sequenceID, function() {
		seqLength = glue.command(["show", "length"]).lengthResult.length;
		majorClade = glue.command(["show", "property", "major_clade"]).propertyValueResult.value;
		minorClade = glue.command(["show", "property", "minor_clade"]).propertyValueResult.value;
	});

	glue.log("FINEST", "Creating missing feature locations for "+referenceName+":"+seqLength+":"+majorClade+":"+minorClade);

	var sourceRef = featureSourceRef(sequenceID, majorClade, minorClade);
	
	glue.inMode("/reference/"+referenceName, function() {
		var existingFLocNames = glue.getTableColumn(glue.command(["list", "feature-location"]), "feature.name");
		_.each(featuresToInherit, function(featureName) {
			if(existingFLocNames.indexOf(featureName) == -1) {
				glue.command(["inherit","feature-location","--spanGaps",
				              "AL_UNC_509_REFSEQS_HM",
				              "--relRefName", sourceRef, featureName]);
			}
		});

		glue.command(["add", "feature-location", "whole_genome"]);
		glue.inMode("/feature-location/whole_genome", function() {
			glue.command(["add", "segment", 1, seqLength]);
		});
		
		var existingFLocNames2 = glue.getTableColumn(glue.command(["list", "feature-location"]), "feature.name");
		if(existingFLocNames2.indexOf("N") >= 0) {
			var startOfN;
			glue.inMode("/feature-location/N", function() {
				startOfN = glue.tableToObjects(glue.command(["list", "segment"]))[0].refStart;
			});
			if(startOfN > 1) {
				glue.command(["add", "feature-location", "3UTR"]);
				glue.inMode("/feature-location/3UTR", function() {
					glue.command(["add", "segment", 1, startOfN - 1]);
				});
			}
		}
		if(existingFLocNames2.indexOf("L") >= 0) {
			var endOfL;
			glue.inMode("/feature-location/L", function() {
				endOfL = glue.tableToObjects(glue.command(["list", "segment"]))[0].refEnd;
			});
			if(endOfL < seqLength) {
				glue.command(["add", "feature-location", "5UTR"]);
				glue.inMode("/feature-location/5UTR", function() {
					glue.command(["add", "segment", endOfL+1, seqLength]);
				});
			}
		}
		
	});
});

