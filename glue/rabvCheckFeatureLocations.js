

var referenceNames = glue.getTableColumn(glue.command(["list", "reference"]), "name");

var featuresToCheck = ["N", "P", "M", "G", "L"];

var errors = [];

function spansEndOfFeature(sequenceID, featureName) {
	if(sequenceID == "U22488" && featureName == "N") {
		return false;
	}
	
	return true;
}

glue.logInfo("Checking for feature location errors");

_.each(referenceNames, function(referenceName) {
	glue.inMode("/reference/"+referenceName, function() {
		var showSeqResult = glue.command(["show", "sequence"]).showSequenceResult;
		var sequenceID = showSeqResult["sequence.sequenceID"];
		
		var fLocNames = glue.getTableColumn(glue.command(["list", "feature-location"]), "feature.name");
		_.each(fLocNames, function(fLocName) {
			if(featuresToCheck.indexOf(fLocName) >= 0) {
				glue.log("FINEST", referenceName+":"+fLocName);
				glue.inMode("/feature-location/"+fLocName, function() {
					var aaObjs = glue.tableToObjects(glue.command(["amino-acid"]));
					var firstAaObj = aaObjs[0];
					var lastAaObj = aaObjs[aaObjs.length-1];
					var middleAaObjs = aaObjs.slice(1, aaObjs.length-1);
					if(firstAaObj.aminoAcid != "M") {
						errors.push({
							error:"First amino acid was not M", 
							referenceName:referenceName, 
							featureName:fLocName, 
							fLocStartNt:firstAaObj.refNt,
							fLocEndNt:lastAaObj.refNt+2,
							aaObj: firstAaObj
						});
					}
					_.each(middleAaObjs, function(middleAaObj){
						if(middleAaObj.aminoAcid == "*") {
							errors.push({
								error:"Stop codon at internal location", 
								referenceName:referenceName, 
								featureName:fLocName, 
								fLocStartNt:firstAaObj.refNt,
								fLocEndNt:lastAaObj.refNt+2,
								aaObj: middleAaObj
							});
						}
					});
					if(lastAaObj.aminoAcid != "*" && spansEndOfFeature(sequenceID, fLocName)) {
						errors.push({
							error:"Last amino acid was not *", 
							referenceName:referenceName, 
							featureName:fLocName, 
							fLocStartNt:firstAaObj.refNt,
							fLocEndNt:lastAaObj.refNt+2,
							aaObj: lastAaObj
						});
					}
				});
			}
		});
	});
});
if(errors.length > 0) {
	glue.logInfo("Feature location errors", errors);
	glue.logInfo("number of errors", errors.length);
	throw new Error("Errors detected in coding feature locations");
} else {
	glue.logInfo("No feature location errors found");
}