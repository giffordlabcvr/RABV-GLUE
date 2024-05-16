# RABV-GLUE: Phylogenomic Analysis of Rabies Virus

## Overview

RABV-GLUE is a sequence-oriented resource for comparative genomic analysis of rabies virus (RABV), developed using the [GLUE](https://github.com/giffordlabcvr/gluetools) software framework.

This **RABV-GLUE** base project can be extended with additional layers, openly availabe via GitHub, including:

  - **[NCBI-RABV-GLUE](https://github.com/giffordlabcvr/NCBI-RABV-GLUE)**: extends RABV-GLUE through the incorporation of all RABV sequence data published in NCBI GenBank.
  - **[RABV-GLUE-WEB](https://github.com/giffordlabcvr/RABV-GLUE-WEB)**: a web interface that can be used to create a RABV-GLUE web-server.

A web instance of RABV-GLUE incorporating both these extension layers is hosted by the University of Glasgow, and can be accessed here **[here](http://rabv-glue.cvr.gla.ac.uk/)**.

RABV-GLUE has been developed with an explicit focus on supporting genomic surveillance of rabies virus, as described [here](https://doi.org/10.1371/journal.ppat.1010023). Effective and coordinated surveillance of RABV is essential to achieve the aims of [Zero by 30](https://www.who.int/publications/i/item/9789241513838) a global strategic plan to end human deaths from dog-mediated rabies by 2030.

Sequence data are richly annotated with gene features and isolate-associated information. RABV-GLUE also contains reference sequences for all major and minor lineages of RABV, and heirarchically ordered multiple sequence alignments.

While the primary focus of RABV-GLUE development is genomic surveillance, it possesses the versatility to facilitate a diverse array of comparative genomic analyses for RABV.

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

- **Web user interface**: The [RABV-GLUE-WEB](https://github.com/giffordlabcvr/RABV-GLUE-WEB) extension project defines a web user interface that supports online browsing of the RABV-GLUE sequence database, and provides web access to an in-built sequence analysis tool (provides genotyping, analysis and visualisation of submitted FASTA sequences).


## Installation

If you have not done so already, install the GLUE software framework by following the [installation instructions](http://glue-tools.cvr.gla.ac.uk/#/installation) on the GLUE web site: 

Note the RABV-GLUE project has a layered structure. This approach simplifies project management because it allows data items that are likely to be used across a wide range of analysis contexts to be maintained separately from those only required for more specialized purposes. The ‘base’ layer of RABV-GLUE contains only a minimal set of essential data items required for comparative analysis.

To build the base (or 'core') project, download the RABV-GLUE repository, navigate into the top-level directory, and start the GLUE command line interpreter, e.g.:

```
rob$ gluetools.sh

GLUE Version 1.1.107
Copyright (C) 2015-2020 The University of Glasgow
This program comes with ABSOLUTELY NO WARRANTY. This is free software, and you
are welcome to redistribute it under certain conditions. For details see
GNU Affero General Public License v3: http://www.gnu.org/licenses/

Mode path: /
GLUE>
```

At the GLUE command prompt, run the 'buildCoreProject.glue' file as follows:

`GLUE> run file rabvProject.glue`

This will build the base project, which contains a minimal set of RABV 'reference' sequences. The base project can be extended to incorporate all RABV sequences in GenBank by downloading the extension project [NCBI-RABV-GLUE](https://github.com/giffordlabcvr/NCBI-RABV-GLUE).

From within the NCBI-RABV-GLUE project, run the 'ncbiRabvProjectBuild.glue' to build the extension layer:

`GLUE> run file ncbiRabvProjectBuild.glue`

## Usage

GLUE contains an interactive command line environment focused on the development and use of GLUE projects by bioinformaticians. This provides a range of productivity-oriented features such as automatic command completion, command history and interactive paging through tabular data. 

For detailed instructions on how to use RABV-GLUE for your comparative genomic analysis, refer to the GLUE software environment's [reference documentation](http://glue-tools.cvr.gla.ac.uk/).

## Data Sources

RABV-GLUE relies on the following data sources:

- [NCBI Nucleotide](https://www.ncbi.nlm.nih.gov/nuccore)
- [NCBI Taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy)

## Contributing

We welcome contributions from the community! If you're interested in contributing to RABV-GLUE, please review our [Contribution Guidelines](./md/CONTRIBUTING.md).

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./md/code_of_conduct.md) 

## License

The project is licensed under the [GNU Affero General Public License v. 3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Contact

For questions, issues, or feedback, please contact us at [gluetools@gmail.com](mailto:gluetools@gmail.com) or open an issue on the [GitHub repository](https://github.com/giffordlabcvr/RABV-GLUE/issues).

