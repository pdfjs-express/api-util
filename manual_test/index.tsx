import Utils, { Response } from '../dist';
import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import './index.scss';

const methods = [
  'merge',
  'set',
  'extract',
  'watermark'
]

type ItemType = 'key'|'xfdf'|'file'

const saveItem = (type: ItemType, value: string) => {
  let existing: string = localStorage.getItem(`__${type}`) || '[]';
  existing = JSON.parse(existing)
  // @ts-ignore
  existing.push(value)
  localStorage.setItem(`__${type}`, JSON.stringify(existing));
}

const getItems = (type: ItemType): string[] => {
  let existing: string = localStorage.getItem(`__${type}`) || '[]';
  existing = JSON.parse(existing)
  return existing as unknown as string[];
}

const App = () => {

  const [key, setKey] = useState(null);
  const [file, setFile] = useState(null);
  const [xfdf, setXFDF] = useState(null);

  const [savedKeys, setSavedKeys] = useState(getItems('key'));
  const [savedXFDF, setSavedXFDF] = useState(getItems('xfdf'));
  const [savedFiles, setSavedFiles] = useState(getItems('file'));

  const [method, setMethod] = useState(methods[0]);
  const [result, setResult] = useState<Response>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const keyRef = useRef(null);
  const xfdfRef = useRef(null);
  const fileRefURL = useRef(null);
  const fileRefFile = useRef(null);
  
  const reset = () => {
    keyRef.current.value = '';
    xfdfRef.current.value = ''
    fileRefURL.current.value = ''
    fileRefFile.current.value =''

    setKey('')
    setFile('')
    setXFDF('');
    setError(false)
    setLoading(false)
    setResult(null);
  }

  const go = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const u = new Utils({
        serverKey: key,
        clientKey: key
      });

      if (xfdf) {
        u.setXFDF(xfdf);
      }

      if (file) {
        u.setFile(file)
      }

      let result: Response;

      switch (method) {
        case 'merge':
          result = await u.merge();
          break;
        case 'set':
          result = await u.set();
          break;
        case 'extract':
          result = await u.extract();
          break;
        case 'watermark':
          result = await u.watermark({
            color: 'red',
            opacity: 1,
            rotation: 0,
            position: 'top'
          });
          break;
      }

      setResult(result)
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setLoading(false);
      return;
    }

  }


  const get = async () => {
    try {
      const blob = await result.getBlob();
      var url = URL.createObjectURL(blob);
      window.open(url,'_blank')
    } catch (e) {
      setError(e.message)
    }

  }

  const deleteFile = async () => {
    try {
      setLoading(true);
      await result.deleteFile();
      reset();
      setLoading(false);
    } catch (e) {
      setError(e.message)
    }
  }


  return (
    <div className='app'>
      
      <div className='list'>
        <h2>Input</h2>

        <div className='item'>
          <p>License key: </p>
          <div className='input'>
            <input className='text' ref={keyRef} type='text' onChange={e => setKey(e.target.value)} />
            <button
              className='save'
              onClick={() => {
                saveItem('key', key)
                setSavedKeys(old => [...old, key])
              }}
            >
              Save
            </button>
          </div>
        </div>

        <div className='item'>
          <p>XFDF: </p>
          <div className='input'>
            <textarea
              onChange={e => setXFDF(e.target.value)}
              ref={xfdfRef}
              className='text'
            />
            <button
              className='save'
              onClick={() => {
                saveItem('xfdf', xfdf);
                setSavedXFDF(old => [...old, xfdf])
              }}
            >
              Save
            </button>
          </div>
        </div>

        <div className='item'>
          <p>File:</p>
          <div className='input'>
            <input
              type='file'
              onChange={e => setFile(e.target.files[0])}
              style={{ border: 'none',  minHeight: 0, paddingLeft: 0 }}
              ref={fileRefFile}
              className='text'
            /><br/>
          </div>

          <div className='input'>
            <input className='text' type='text' placeholder={'URL'} onChange={e => setFile(e.target.value)} ref={fileRefURL} />
            <button
              className='save'
              onClick={() => {
                if (typeof file === 'string') {
                  saveItem('file', file);
                  setSavedFiles(old => [...old, file]);
                }
              }}
            >
              Save
            </button>
          </div>
        </div>

        <div className='item'>
          <p>Method</p>
          <div className='input'>
            <select onChange={e => setMethod(e.target.value)} className='text'>
              {
                methods.map(m => (
                  <option>{m}</option>
                ))
              }
            </select>
          </div>
        </div>


        <div className='saved'>
          <h3>Saved:</h3>
          <div className='items'>
            <p>Keys</p>
            {
              savedKeys.map(key => {
                return (
                  <p className='saved-item' onClick={() => { setKey(key); keyRef.current.value = key }}>{key}</p>
                )
              })
            }
          </div>

          <div className='items'>
            <p>XFDF</p>
            {
              savedXFDF.map(xfdf => {
                const shortXFDF = xfdf.slice(0, 100);
                return (
                  <p className='saved-item' onClick={() => { setXFDF(xfdf); xfdfRef.current.value = xfdf }}>{shortXFDF}...</p>
                )
              })
            }
          </div>

          <div className='items'>
            <p>Files</p>
            {
              savedFiles.map(file => {
                return (
                  <p className='saved-item' onClick={() => { setFile(file); fileRefURL.current.value = file }}>{file}</p>
                )
              })
            }
          </div>

        </div>
      </div>


      <div className='list preview'>
        <h2>Review</h2>
        <div className='item'>
          <p>License</p>
          <p className='text'>
            {key}
          </p>
        </div>

        <div className='item'>
          <p>XFDF</p>
          <p className='text'>
            {xfdf}
          </p>
        </div>

        <div className='item'>
          <p>File</p>
          <p className='text'>
            {typeof file === 'string' ? file : file?.name}
          </p>
        </div>

        <div className='controls'>
          <button className='big hollow' onClick={reset}>Reset</button>
          <button className='big' onClick={go}>Go!</button>
        </div>

        {
          loading &&
          <p className='loading'>Loading...</p>
        }
      </div>

      <div className='result list'>
        <h2>Output</h2>
        <div className='item'>
          <p>URL</p>
          <p className='text'>
            {result?.url}
          </p>
        </div>

        <div className='item'>
          <p>XFDF</p>
          <p className='text'>
            {result?.xfdf}
          </p>
        </div>

        <div className='item'>
          <p>Key</p>
          <p className='text'>
            {result?.key}
          </p>
        </div>

        {
          result &&
          <div className='controls'>
            <button className='big' onClick={get}>
              Get
            </button>

            <button className='big' onClick={deleteFile}>
              Delete
            </button>
          </div>
        }

        {
          error &&
          <div className='error'>
            <p>{error}</p>
          </div>
        }
      </div>

  
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'));
