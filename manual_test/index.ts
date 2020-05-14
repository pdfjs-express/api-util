import Utils from '..';

const createButton = (text: string, onclick: (btn: HTMLButtonElement) => void) => {
  const button = document.createElement('button');
  button.onclick = () => onclick(button)

  button.innerHTML = text;
  document.body.appendChild(button);
}

const setColor = (btn: HTMLButtonElement, color: 'red'|'green') => {
  btn.style.backgroundColor = color;
}

const XFDF = `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><pdf-info xmlns="http://www.pdftron.com/pdfinfo" version="2" import-version="3" /><fields /><annots><square page="0" rect="11.23,726.04,593.68,779.37" color="#000000" flags="print" name="99c4fdb2-8149-5910-3b0e-bd164825d349" title="Guest" subject="Rectangle" date="D:20200514080902-07'00'" width="9.437031125299281" creationdate="D:20200514080901-07'00'"/></annots><pages><defmtx matrix="1,0,0,-1,0,792" /></pages></xfdf>`
const REMOTE_DOC = `https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo-annotated.pdf`;
const KEY = `uOH9d5amBnVrc9N1aCyE`;

const init = async () => {
  createButton('Merge URL - Invalid Key', async (button) => {
    const u = new Utils({
      serverKey: 'test',
      clientKey: 'test'
    });
    u.setFile(REMOTE_DOC)
      .setXFDF(XFDF);
    try {
      await u.merge()
      setColor(button, 'red')
    } catch (e) {
      setColor(button, 'green')
    }
  })

  createButton('Merge URL - Invalid domain', async (button) => {
    await new Utils({
      serverKey: KEY,
      clientKey: KEY
    }).setFile(REMOTE_DOC)
      .setXFDF(XFDF)
      .merge();
    
    
  })
}

init();


