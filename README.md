# RABV-GLUE: Comparative Genomic Analysis of Rabies Virus

## Overview

RABV-GLUE is a sequence-oriented resource for comparative genomic analysis of rabies virus (RABV), developed using the GLUE software framework. It provides a freely accessible, public-facing platform that offers a phylogenetically-structured collection of all publicly available RABV sequence data. Sequence data are richly annotated with gene features and isolate-associated information.

GLUE (**G**enes **L**inked by **U**nderlying **E**volution) is a data-centric bioinformatics environment for virus sequence data, with a focus on variation, evolution and sequence interpretation.

You can learn more about it on the [GLUE web site](http://glue-tools.cvr.gla.ac.uk).

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Installation](#installation)
- [Usage](#usage)
- [Data Sources](#data-sources)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Key Features

- **GLUE Framework Integration**: Built on the GLUE software framework, RABV-GLUE offers an extensible platform for efficient, standardized, and reproducible computational genomic analysis of influenza viruses.

- **Phylogenetic Structure**: The data in RABV-GLUE is organized in a phylogenetically-structured manner, allowing users to explore evolutionary relationships easily.

- **Automated Updates**: RABV-GLUE provides an automatically-updated collection of influenza sequence data, ensuring users have access to the latest information for their analyses.

- **Rich Annotations**: Each sequence is annotated with gene features, enabling rigorous comparative genomic analysis related to conservation, adaptation, structural context, and genotype-to-phenotype associations.

- **Automated Genotyping**: RABV-GLUE can perform automated genotyping of RABV sequences (including subgenomic sequences) using GLUE's maximum likelihood clade assignment (MLCA) algorithm, as described [here](https://doi.org/10.1186/s12859-018-2459-9).

- **Web user interface**: RABV-GLUE's open source code incorporates a [web user interface](https://github.com/giffordlabcvr/RABV-GLUE-WEB) (see instance hosted [here](http://rabv-glue.cvr.gla.ac.uk)) that supports browsing of the RABV-GLUE sequence database, and includes an analysis tool that provides genotyping, analysis and visualisation of submitted FASTA sequences.

An analysis tool providing genotyping, analysis and visualisation of submitted FASTA sequences.

## Installation

If you have not done so already, install the GLUE software framework by following the [installation instructions](http://glue-tools.cvr.gla.ac.uk/#/installation) on the GLUE web site: 

Start the GLUE command line interpreter, and at the GLUE command prompt, run the 'rabvProject.glue' file as follows:

`GLUE> run file rabvProject.glue`


## Usage

For detailed instructions on how to use RABV-GLUE for your comparative genomic analysis, refer to the GLUE software environment's [reference documentation](http://glue-tools.cvr.gla.ac.uk/).

## Data Sources

RABV-GLUE relies on the following data sources:

- [NCBI Nucleotide](https://www.ncbi.nlm.nih.gov/nuccore)
- [NCBI Taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy)

For more information on the data sources and how they are integrated, see [Data Sources](./md/data_sources.md).

## Contributing

We welcome contributions from the community! If you're interested in contributing to RABV-GLUE, please review our [Contribution Guidelines](./md/CONTRIBUTING.md).

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./md/code_of_conduct.md) 

## License

The project is licensed under the [GNU Affero General Public License v. 3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Contact

For questions, issues, or feedback, please contact us at [robert.gifford@glasgow.ac.uk](mailto:robert.gifford@glasgow.ac.uk) or open an issue on the [GitHub repository](https://github.com/giffordlabcvr/RABV-GLUE/issues).

