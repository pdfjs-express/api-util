import Utils from '..';

const SERVICE_URL = 'https://d24tmkhit7.execute-api.us-east-1.amazonaws.com/staging/xfdf';

const createButton = (text, onclick) => {
  const button = document.createElement('button');
  button.onclick = () => onclick

  button.innerHTML = text;
  document.body.appendChild(button);
}

const init = async () => {

  createButton('Merge URL', async () => {
    const u = new Utils({
      serverKey: 'test',
      clientKey: 'test'
    });
  })
}

init();


