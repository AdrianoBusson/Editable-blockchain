# Editable-blockchain
Editable blockchain using chameleon hashes and cuckoo filter for data privacy compliance.
By Adriano Busson

To run blockchain: /blockchain: node index.js - 
To run frontend: frontend/server: node index.js


The prototype was implemented in Node.js (version 20 LTS), using the Express framework to expose REST APIs. The cryptographic implementation of the chameleon hash followed the Ateniese and Medeiros scheme, with 1,024-bit parameters for the multiplicative group. 

The Cuckoo Filter was implemented in pure JavaScript, with buckets stored in ArrayBuffer to reduce memory-management overhead. The test environment consisted of a machine with an Intel Core i7-12700 processor, 16 GB of RAM, NVMe SSD storage, and Ubuntu 22.04 LTS.


For reproducibility, the source code, tests, and a synthetic dataset of 100 JSON records is published on GitHub github.com/AdrianoBusson/Editable-blockchain under the MIT license.
