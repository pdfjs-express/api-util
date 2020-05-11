# PDF.js Express Utilities

This is a package that contains utility functions for working the the PDF.js Express REST API.

It can be used on either the server or the client.

## Installation
This package can be installed via NPM

```
npm i @pdftron/pdfjs-express-utils
```

## Usage
To use the package, import it and instantiate a new instance.

```js
import ExpressUtils from '@pdftron/pdfjs-express-utils'

const utils = new ExpressUtils({
  serverKey: 'your_server_key',
  clientKey: 'your_client_key'
})
```

## Examples

### Merge or Set XFDF into a PDF

```js
import ExpressUtils from '@pdftron/pdfjs-express-utils'

const utils = new ExpressUtils({
  serverKey: 'your_server_key',
  clientKey: 'your_client_key'
})

utils.setFile('https://yourwebsite.com/your_file.pdf'); // can be a URL (server or client)
// utils.setFile(myBlob); // or a Blob object (server or client)
// utils.setFile(myFile); // or a File object (client)
// utils.setFile(fs.readFileSync(path_to_file)) // or a buffer (server)

utils.setXFDF(xfdf_string);

const response = await utils.merge(); // merge XFDF
// const response = await utils.set(); // or set XFDF

const mergedFile = await response.getBlob();
await response.deleteFile(); // remove file from the server
```

### Extract XFDF from a PDF

```js
import ExpressUtils from '@pdftron/pdfjs-express-utils'

const utils = new ExpressUtils({
  serverKey: 'your_server_key',
  clientKey: 'your_client_key'
})

utils.setFile('https://yourwebsite.com/your_file.pdf'); // can be a URL (server or client)
// utils.setFile(myBlob); // or a Blob object (server or client)
// utils.setFile(myFile); // or a File object (client)
// utils.setFile(fs.readFileSync(path_to_file)) // or a buffer (server)

const response = await utils.extract(); // extract XFDF
const {xfdf} = response;
```