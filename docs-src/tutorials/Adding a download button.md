## Adding a download button

This code adds a download button to the header. When the button is clicked, it merges the annotations into the document and triggers a file download.

**Relevant PDF.js Express APIs**

- [setHeaderItems](https://pdfjs.express/documentation/ui-customization/customizing-header)
- [exportAnnotations](https://pdfjs.express/api/CoreControls.AnnotationManager.html#exportAnnotations__anchor)
- [getFileData](https://pdfjs.express/api/CoreControls.Document.html#getFileData__anchor)

```js

import WebViewer from '@pdftron/pdfjs-express'
import ExpressUtils from '@pdftron/pdfjs-express-utils'
import { saveAs } from 'file-saver';

WebViewer({
  path: '/path/to/lib',
  licenseKey: 'Insert license key here', // optional
}, document.getElementById('viewer')).then((instance) => {

  const utils = new ExpressUtils({
    serverKey: 'your_server_key',
    clientKey: 'your_client_key'
  });

  const { docViewer, annotManager } = instance;

  instance.setHeaderItems((header) => {
    header.push({
      type: 'actionButton',
      img: '',
      onClick: async () => {
        const xfdf = await annotManager.exportAnnotations({ links: false, widgets: false });
        const fileData = await docViewer.getDocument().getFileData({});
        const resp = await utils.setFile(fileData).setXFDF(xfdf).merge();
        const mergedBlob = await resp.getBlob();
        saveAs(mergedBlob, 'myfile.pdf')
        await resp.deleteFile();
      }
    });
  });
})

```