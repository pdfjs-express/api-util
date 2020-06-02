## Loading user annotations

This code extracts and loads annotations for any document a user opens.

```js
import WebViewer from '@pdftron/pdfjs-express'
import ExpressUtils from '@pdftron/pdfjs-express-utils'

WebViewer({
  path: '/path/to/lib',
  licenseKey: 'Insert license key here', // optional
  disableFlattenedAnnotations: true // disables rendering flattened annotations
}, document.getElementById('viewer')).then((instance) => {

  const utils = new ExpressUtils({
    serverKey: 'your_server_key',
    clientKey: 'your_client_key'
  });

  const { docViewer, annotManager } = instance;

  docViewer.on('documentLoaded', async () => {
    const data = await docViewer.getDocument().getFileData();
    u.setFile(data);
    const resp = await u.extract();
    const xfdf = resp.xfdf;
    annotManager.importAnnotations(xfdf);
  })
})
```