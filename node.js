const Utils = require('./dist/node/index').default;
const fs = require('fs');

const u = new Utils({
  serverKey: 'Z7gSY2QEFmjq9e0eIH2L'
});

(async () => {
  const readStream = fs.createReadStream('houseplan-A.pdf');

  const xfdf = `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><pdf-info xmlns="http://www.pdftron.com/pdfinfo" version="2" import-version="3" /><fields /><annots><square page="0" rect="414.95599999999996,1393.51,635.3059999999999,1546.05" color="#000000" flags="print" name="5616161f-3466-9898-dfea-228357f8c855" title="Guest" subject="Rectangle" date="D:20210713134128-07'00'" width="9.437031125299281" creationdate="D:20210713134127-07'00'"/></annots><pages><defmtx matrix="1,0,0,-1,-309.27599999999995,1630.8" /></pages></xfdf>`
  
  u.setFile(readStream)
    .setXFDF(xfdf);
  
  const response = await u.merge(); // merge XFDF

  const mergedFile = await response.getBlob();
  await response.deleteFile();

  fs.writeFileSync('bug-out.pdf', mergedFile)
})()



