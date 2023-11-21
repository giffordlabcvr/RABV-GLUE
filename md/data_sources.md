# Data Sources

## Rabies Virus Sequence Data Processing

All rabies virus (RABV) sequence data utilized in RABV-GLUE were sourced from [NCBI Nucleotide](https://www.ncbi.nlm.nih.gov/nuccore).

### Validation and Normalization

- **Recovery Process**: In cases where isolate-associated information was missing, a comprehensive investigation of sequences and their associated documentation (e.g., scientific publications) was conducted to recover this information.

- **Taxonomic Nomenclature**: Information about the host species from which RABV isolates were obtained, available in GenBank, was standardized using correct taxonomic nomenclature for the species. This was done in accordance with taxonomic definitions in the [NCBI Taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy) database.

- **Ambiguous Species Identification**: In instances where information about the species of isolation was ambiguous (e.g., the host is given as 'duck' without specifying the exact duck species), correct scientific nomenclature for the species group was used. For example, if the species was listed as 'duck,' 'Anatidae' - the taxonomic family to which ducks belong - was substituted to the highest level of accuracy possible from the available GenBank entry information.

