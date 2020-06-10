# PDF.js Express Utilities

This is a package that contains utility functions for working the the PDF.js Express REST API.

This package requires that you have signed up for [PDF.js Express](https://pdfjs.express) and have enabled the API.

This package is intended to be used alongside the [PDF.js Express SDK](https://pdfjs.express/documentation)

The API can currently perform the following actions:

- Merge annotations into a PDF (XFDF into PDF)
- Set annotations on a PDF (XFDF into PDF)
- Extract annotations from a PDF (XFDF from PDF)
- Add a watermark to a PDF

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

utils
  .setFile('https://yourwebsite.com/your_file.pdf')
  .setXFDF(xfdf_string);

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

const response = await utils.extract(); // extract XFDF
const { xfdf } = response;
```

For more examples, see the tutorials section at the top right of the page.

## Caveats

- The `setFile` API can only accept files in memory if they are less than 5.5 mb in size. If the file is larger than that, the file must be uploaded somewhere that the API can download it and you must pass the URL to `setFile`.