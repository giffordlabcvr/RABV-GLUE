
var featuresList = [
		             { name: "N",
		            	 displayName: "N"
		             },
		             { name: "P",
		            	 displayName: "P"
		             },
		             { name: "M",
		            	 displayName: "M"
		             },
		             { name: "G",
		            	 displayName: "G"
		             },
		             { name: "L",
		            	 displayName: "L"
		             }
		];

function reportFastaWeb(base64, filePath) {
	glue.log("FINE", "rabvReportingController.reportFastaWeb invoked");
	var fastaDocument;
	glue.inMode("module/rabvFastaUtility", function() {
		fastaDocument = glue.command(["base64-to-nucleotide-fasta", base64]);
	});
	var numSequencesInFile = fastaDocument.nucleotideFasta.sequences.length;
	if(numSequencesInFile == 0) {
		throw new Error("No sequences found in FASTA file");
	}
	var fastaMap = {};
	var resultMap = {};
	var placerResultContainer = {};
	// apply blast recogniser / genotyping together on set, as this is more efficient.
	initResultMap(fastaDocument, fastaMap, resultMap, placerResultContainer);
	// apply report generation to each sequence in the set.
	var rabvReports = _.map(fastaDocument.nucleotideFasta.sequences, function(sequence) {
		return generateSingleFastaReport(_.pick(fastaMap, sequence.id), _.pick(resultMap, sequence.id), filePath);
	});
	var result = {
		rabvWebReport:  { 
			results: rabvReports, 
			placerResult: placerResultContainer.placerResult
		}
	};

	glue.log("FINE", "rabvReportingController.reportFastaWeb result", result);
	
	return result;
}

/**
 * Entry point for generating a report for a fasta file containing a single sequence.
 */
function reportFasta(fastaFilePath) {
	glue.log("FINE", "rabvReportingController.reportFasta invoked, input file:"+fastaFilePath);
	// Load fasta and put in a fastaMap
	var fastaDocument;
	glue.inMode("module/rabvFastaUtility", function() {
		fastaDocument = glue.command(["load-nucleotide-fasta", fastaFilePath]);
	});
	var numSequencesInFile = fastaDocument.nucleotideFasta.sequences.length;
	if(numSequencesInFile == 0) {
		throw new Error("No sequences found in FASTA file");
	}
	if(numSequencesInFile > 1) {
		throw new Error("Please use only one sequence per FASTA file");
	}
	var fastaMap = {};
	var resultMap = {};
	var placerResultContainer = {};
	initResultMap(fastaDocument, fastaMap, resultMap, placerResultContainer);
	var singleFastaReport = generateSingleFastaReport(fastaMap, resultMap, fastaFilePath);
	singleFastaReport.rabvReport["placerResult"] = placerResultContainer.placerResult;
	return singleFastaReport;
}

function initResultMap(fastaDocument, fastaMap, resultMap, placerResultContainer) {
	glue.log("FINE", "rabvReportingController.initResultMap fastaDocument:", fastaDocument);
	_.each(fastaDocument.nucleotideFasta.sequences, function(sequenceObj) {
		fastaMap[sequenceObj.id] = sequenceObj;
	});
	// initialise result map.
	var sequenceObjs = _.values(fastaMap);
	_.each(sequenceObjs, function(sequenceObj) {
		resultMap[sequenceObj.id] = { id: sequenceObj.id };
	});
	// apply recogniser to fastaMap
	recogniseFasta(fastaMap, resultMap);

	glue.log("FINE", "rabvReportingController.initResultMap, result map after recogniser", resultMap);

	// apply genotyping
	genotypeFasta(fastaMap, resultMap, placerResultContainer);

	glue.log("FINE", "rabvReportingController.initResultMap, result map after genotyping", resultMap);
}

function generateQueryToTargetRefSegs(targetRefName, nucleotides) {
	var alignerModule;
	glue.inMode("module/rabvFastaSequenceReporter", function() {
		alignerModule = glue.command(["show", "property", "alignerModuleName"]).moduleShowPropertyResult.propertyValue;
	});
	var alignResult;
	glue.inMode("module/"+alignerModule, function() {
		alignResult = glue.command({align: {
				referenceName: targetRefName,
				sequence: [
				    { 
				    	queryId: "query", 
				    	nucleotides: nucleotides
				    }
				]
			}
		});
		glue.log("FINE", "rabvReportingController.generateQueryToTargetRefSegs, alignResult", alignResult);
	});
	return alignResult.compoundAlignerResult.sequence[0].alignedSegment;
	
}

function generateFeaturesWithCoverage(targetRefName, queryToTargetRefSegs) {
	var featuresWithCoverage = []; 
	
	_.each(featuresList, function(feature) {
		glue.inMode("module/rabvFastaSequenceReporter", function() {
			var coveragePercentage = glue.command({
				"alignment-feature-coverage" :{
							"queryToTargetSegs": {
								queryToTargetSegs: {
									alignedSegment: queryToTargetRefSegs
								}
							},
							"targetRefName":targetRefName,
							"relRefName":"REF_MASTER_NC_001542",
							"linkingAlmtName":"AL_UNC_509_REFSEQS_HM",
							"featureName":feature.name
						}
			}).fastaSequenceAlignmentFeatureCoverageResult.coveragePercentage;
			
			var featureCopy = _.clone(feature);
			featureCopy.coveragePct = coveragePercentage;
			featuresWithCoverage.push(featureCopy);
		});
	});
	return featuresWithCoverage;
}

function generateSingleFastaReport(fastaMap, resultMap, fastaFilePath) {
	
	_.each(_.values(resultMap), function(sequenceResult) {
		var genotypingResult = sequenceResult.genotypingResult;
		if(genotypingResult != null) {
			if(genotypingResult.majorCladeCategoryResult.finalClade != null) {
				var targetRefName = genotypingResultToTargetRefName(genotypingResult);
				var nucleotides = fastaMap[sequenceResult.id].sequence;
				var queryToTargetRefSegs = generateQueryToTargetRefSegs(targetRefName, nucleotides);
				var queryNucleotides = fastaMap[sequenceResult.id].sequence;
				sequenceResult.featuresWithCoverage = generateFeaturesWithCoverage(targetRefName, queryToTargetRefSegs);
				
				sequenceResult.targetRefName = targetRefName;
				
				sequenceResult.visualisationHints = visualisationHints(queryNucleotides, targetRefName, genotypingResult, queryToTargetRefSegs);
			}
		}
	});
	
	var results = _.values(resultMap);
	
	var rabvReport = { 
		rabvReport: {
			sequenceDataFormat: "FASTA",
			filePath: fastaFilePath,
			sequenceResult: results[0]
		}
	};
	addOverview(rabvReport);

	glue.log("FINE", "rabvReportingController.generateSingleFastaReport rabvReport:", rabvReport);
	return rabvReport;
}
function visualisationHints(queryNucleotides, targetRefName, genotypingResult, queryToTargetRefSegs) {
	// consider the target ref, subtype ref, genotype ref and master ref as comparison refs.
	var comparisonReferenceNames = ["REF_MASTER_NC_001542"];
	var majorCladeAlmtName = genotypingResult.majorCladeCategoryResult.finalClade;
	if(majorCladeAlmtName != null) {
		glue.inMode("alignment/"+majorCladeAlmtName, function() {
			comparisonReferenceNames.push(glue.command(["show", "reference"]).showReferenceResult.referenceName);
		});
	}
	var minorCladeAlmtName = genotypingResult.minorCladeCategoryResult.finalClade;
	if(minorCladeAlmtName != null) {
		glue.inMode("alignment/"+minorCladeAlmtName, function() {
			comparisonReferenceNames.push(glue.command(["show", "reference"]).showReferenceResult.referenceName);
		});
	}
	comparisonReferenceNames.push(targetRefName);
	var seqs = [];
	var comparisonRefs = [];
	
	// eliminate duplicates and enhance with display names.
	_.each(comparisonReferenceNames, function(refName) {
		glue.inMode("reference/"+refName, function() {
			var seqID = glue.command(["show", "sequence"]).showSequenceResult["sequence.sequenceID"];
			if(seqs.indexOf(seqID) < 0) {
				seqs.push(seqID);
				var refDisplayName = glue.command(["show", "property", "displayName"]).propertyValueResult.value;
				if(refDisplayName == null) {
					refDisplayName = "Closest Reference ("+seqID+")";
				}
				comparisonRefs.push({
					"refName": refName,
					"refDisplayName": refDisplayName
				});
			}
		});
	});
	
	var queryDetails = [];
	
	
	return {
		"features": featuresList,
		"comparisonRefs": comparisonRefs,
		"targetReferenceName":targetRefName,
		"queryNucleotides":queryNucleotides,
		"queryToTargetRefSegments": queryToTargetRefSegs,
		"queryDetails": queryDetails
	};
}

/*
 * Given a genotypingResult with a non-null final major clade, return the name of the "target" reference
 */
function genotypingResultToTargetRefName(genotypingResult) {
	var targetRefSourceName;
	var targetRefSequenceID;
	var subtypeFinalClade = genotypingResult.minorCladeCategoryResult.finalClade;
	if(subtypeFinalClade != null) {
		targetRefSourceName = genotypingResult.minorCladeCategoryResult.closestTargetSourceName;
		targetRefSequenceID = genotypingResult.minorCladeCategoryResult.closestTargetSequenceID;
	} else {
		targetRefSourceName = genotypingResult.majorCladeCategoryResult.closestTargetSourceName;
		targetRefSequenceID = genotypingResult.majorCladeCategoryResult.closestTargetSequenceID;
	}
	var targetRefOptions = glue.tableToObjects(glue.command([
         "list", "reference", 
         "--whereClause", "sequence.source.name = '"+targetRefSourceName+"' and sequence.sequenceID = '"+targetRefSequenceID+"'"]));
	return targetRefOptions[0].name;
}

/*
 * This function takes a fastaMap of id -> { id, nucleotideFasta }, and a result map of id -> ? 
 * and runs max likelihood genotyping on the subset of sequences that have been identified as forward RABV.
 * The the genotyping result object is recorded in the result map for each sequence.
 */
function genotypeFasta(fastaMap, resultMap, placerResultContainer) {
	var genotypingFastaMap = {};
	_.each(_.values(resultMap), function(resultObj) {
		if(resultObj.isForwardRabv && !resultObj.isReverseRabv) {
			genotypingFastaMap[resultObj.id] = fastaMap[resultObj.id];
		} 
	});
	if(!_.isEmpty(genotypingFastaMap)) {

		// run the placer and generate a placer result document
		var placerResultDocument;
		glue.inMode("module/rabvMaxLikelihoodPlacer", function() {
			placerResultDocument = glue.command({
				"place": {
					"fasta-document": {
						"fastaCommandDocument": {
							"nucleotideFasta" : {
								"sequences": _.values(genotypingFastaMap)
							}
						}
					}
				}
			});
		});
		placerResultContainer.placerResult = placerResultDocument;
		
		
		// list the query summaries within the placer result document
		var placementSummaries;
		glue.inMode("module/rabvMaxLikelihoodPlacer", function() {
			placementSummaries = glue.tableToObjects(glue.command({
				"list": {
					"query-from-document": {
						"placerResultDocument": placerResultDocument
					}
				}
			}));
		});

		// for each query in the placer results.
		_.each(placementSummaries, function(placementSummaryObj) {
			var queryName = placementSummaryObj.queryName;
			
			var placements;
			
			// list the placements for that query.
			glue.inMode("module/rabvMaxLikelihoodPlacer", function() {
				placements = glue.tableToObjects(glue.command({
					"list": {
						"placement-from-document": {
							"queryName": queryName,
							"placerResultDocument": placerResultDocument
						}
					}
				}));
			});

			resultMap[queryName].placements = placements;
		});
		
		
		var genotypingResults;
		glue.inMode("module/rabvMaxLikelihoodGenotyper", function() {
			genotypingResults = glue.command({
				"genotype": {
					"placer-result-document": {
						"placerResultDocument": placerResultDocument, 
						"documentResult" : true
					}
				}
			}).genotypingDocumentResult.queryGenotypingResults;
		});
		glue.log("FINE", "rabvReportingController.genotypeFasta genotypingResults:", genotypingResults);
		_.each(genotypingResults, function(genotypingResult) {
			genotypingResult.majorCladeCategoryResult = _.find(genotypingResult.queryCladeCategoryResult, 
					function(cladeCategoryResult) { return cladeCategoryResult.categoryName == "major_clade"; });
			genotypingResult.minorCladeCategoryResult = _.find(genotypingResult.queryCladeCategoryResult, 
					function(cladeCategoryResult) { return cladeCategoryResult.categoryName == "minor_clade"; });
			if(genotypingResult.majorCladeCategoryResult.finalCladeRenderedName == null) {
				genotypingResult.majorCladeCategoryResult.shortRenderedName = "unknown";
			} else {
				genotypingResult.majorCladeCategoryResult.shortRenderedName = 
					genotypingResult.majorCladeCategoryResult.finalCladeRenderedName;
			}
			if(genotypingResult.minorCladeCategoryResult.finalCladeRenderedName == null) {
				genotypingResult.minorCladeCategoryResult.shortRenderedName = "unknown";
			} else {
				genotypingResult.minorCladeCategoryResult.shortRenderedName = 
					genotypingResult.minorCladeCategoryResult.finalCladeRenderedName;
			}
				
				
			glue.log("FINE", "rabvReportingController.genotypeFasta majorCladeCategoryResult", genotypingResult.majorCladeCategoryResult);
			glue.log("FINE", "rabvReportingController.genotypeFasta minorCladeCategoryResult", genotypingResult.minorCladeCategoryResult);
			
			
			resultMap[genotypingResult.queryName].genotypingResult = genotypingResult;
		});
	}
}

/*
 * Use the fastaUtility module to reverse complement a FASTA string
 */
function reverseComplement(fastaString) {
	var reverseComplement;
	glue.inMode("module/rabvFastaUtility", function() {
		var reverseComplementResult = 
			glue.command(["reverse-complement", "string", 
			              "--fastaString", fastaString]);
		reverseComplement = reverseComplementResult.reverseComplementFastaResult.reverseComplement;
	});
	return reverseComplement;
}

/*
 * This function takes a fastaMap of id -> { id, nucleotideFasta }, and a result map of id -> ? 
 * and runs BLAST recogniser, to determine whether the sequence is RABV, and if so, whether 
 * it is in the forward direction or reverse complement.
 * The result map will have isForwardRabv set to true if a forward hit was found, false otherwise
 * It will have isReverseRabv set to true if a reverse hit was found, false otherwise
 */
function recogniseFasta(fastaMap, resultMap) {
	var sequenceObjs = _.values(fastaMap);
	_.each(_.values(resultMap), function(resultObj) {
		resultObj.isForwardRabv = false;
		resultObj.isReverseRabv = false;
	});
	var fastaDocument = {
		"nucleotideFasta" : {
			"sequences" : sequenceObjs
		}
	};
	var recogniserResults;
	glue.inMode("module/rabvSequenceRecogniser", function() {
		recogniserResults = glue.tableToObjects(glue.command({
				"recognise": {
					"fasta-document": {
						"fastaCommandDocument": fastaDocument
					}
				}
		}));
	});
	glue.log("FINE", "rabvReportingController.reportFasta recogniserResults:", recogniserResults);
	_.each(recogniserResults, function(recogniserResult) {
		if(recogniserResult.direction == 'FORWARD') {
			resultMap[recogniserResult.querySequenceId].isForwardRabv = true;
		} else if(recogniserResult.direction == 'REVERSE') {
			resultMap[recogniserResult.querySequenceId].isReverseRabv = true;
		} 
	});
}

function addOverview(rabvReport) {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; // January is 0!
	var yyyy = today.getFullYear();
	if(dd < 10) {
	    dd = '0'+dd
	} 
	if(mm < 10) {
	    mm = '0'+mm
	} 
	rabvReport.rabvReport.reportGenerationDate = dd + '/' + mm + '/' + yyyy;
	rabvReport.rabvReport.engineVersion = 
		glue.command(["glue-engine","show-version"]).glueEngineShowVersionResult.glueEngineVersion;
	rabvReport.rabvReport.projectVersion = 
		glue.command(["show","setting","project-version"]).projectShowSettingResult.settingValue;
	
}

