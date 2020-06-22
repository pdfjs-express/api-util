import { readFixture } from './util';
import { ENDPOINTS } from './../src/config';
import APIUtils from '../src/ExpressUtils';
import fetch from 'isomorphic-fetch';

jest.mock('isomorphic-fetch');

const mockNextFetch = (resp) => {
  let params;
  // @ts-ignore
  fetch.mockImplementationOnce((...args) => {
    params = args;
    return Promise.resolve({
      json: () => Promise.resolve(resp)
    })
  })

  return () => {
    return params;
  }
}

const assertFormDataContains = (data, key, value) => {

  const { _streams } = data;
  const i = _streams.findIndex(s => {
    if (typeof s != 'string') return false;
    return s.includes(`name="${key}"`)
  });

  expect(_streams[i + 1]).toEqual(value);
}

const KEYS = { serverKey: '123', clientKey: '456' }
const BLOB = new Buffer([]);
const XFDF = '<xfdf>';

/**
 *  url, id, key, xfdf
 */
describe('API tests', () => {

  describe('valid tests', () => {
    it('can call the merge endpoint', async () => {
      const getParams = mockNextFetch({
        url: 'https://myfile.com',
        id: '1234',
        key: 'aaa||bbb'
      });
  
      const instance = new APIUtils(KEYS);
      instance.setFile(BLOB)
        .setXFDF(XFDF);
      
      const resp = await instance.merge();

      expect(resp).toBeTruthy();
      expect(resp?.id).toBeTruthy();
      expect(resp?.url).toBeTruthy();
      expect(resp?.key).toBeTruthy();
      expect(resp?.deleteFile).toBeTruthy();
  
      const params = getParams();
      expect(params[0]).toEqual(ENDPOINTS.MERGE.url);
    });
  
    it('can call the set endpoint', async () => {
      const getParams = mockNextFetch({
        url: 'https://myfile.com',
        id: '1234',
        key: 'aaa||bbb'
      });
  
      const instance = new APIUtils(KEYS);
      instance.setFile(BLOB)
        .setXFDF(XFDF);
      
      const resp = await instance.set();
      expect(resp).toBeTruthy()
      expect(resp?.id).toBeTruthy()
      expect(resp?.url).toBeTruthy()
      expect(resp?.key).toBeTruthy()
      expect(resp?.deleteFile).toBeTruthy()
  
      const params = getParams();
      expect(params[0]).toEqual(ENDPOINTS.SET.url);
    });
  
    it('can call the extract endpoint', async () => {
      const getParams = mockNextFetch({
        xfdf: 'test'
      });
  
      const instance = new APIUtils(KEYS);
      instance.setFile(BLOB);
      
      const resp = await instance.extract();
      expect(resp).toBeTruthy()
      expect(resp?.xfdf).toBeTruthy()
  
      const params = getParams();
      expect(params[0]).toEqual(ENDPOINTS.EXTRACT.url);
    });
  
    it('can call the delete endpoint', async () => {
      mockNextFetch({
        url: 'https://myfile.com',
        id: '1234',
        key: 'aaa||bbb'
      });
  
      const instance = new APIUtils(KEYS);
      instance.setFile(BLOB)
        .setXFDF(XFDF);
      
      const resp = await instance.merge();
      
      const getParams = mockNextFetch({});
  
      await resp.deleteFile();
  
      const params = getParams();
      expect(params[0]).toEqual(ENDPOINTS.DELETE.url);
      expect(params[1].body).toBeTruthy()
      const data = params[1].body;
      assertFormDataContains(data, 'license', '123');
      assertFormDataContains(data, 'id', '1234');
    })

    it('can call the watermark endpoint', async () => {
      const getParams = mockNextFetch({
        url: 'https://myfile.com',
        id: '1234',
        key: 'aaa||bbb'
      });
  
      const instance = new APIUtils(KEYS);
      instance.setFile(BLOB)
      
      const resp = await instance.watermark({
        text: "Hello world",
        color: "red"
      });
      
      await resp.deleteFile();
  
      const params = getParams();
      expect(params[0]).toEqual(ENDPOINTS.WATERMARK.url);
      expect(params[1].body).toBeTruthy()
      const data = params[1].body;
      assertFormDataContains(data, 'license', '123');
      assertFormDataContains(data, 'text', 'Hello world');
      assertFormDataContains(data, 'color', 'red');
    })

    it('can chain endpoints', async () => { 
      const getParams = mockNextFetch({
        url: 'https://myfile.com',
        id: '1234',
        key: 'aaa||bbb'
      });

      const instance = new APIUtils(KEYS);
      instance.setFile(BLOB)
      instance.setXFDF(XFDF);

      const resp = await instance.merge();
      let params = getParams();
      let data = params[1].body;
      expect(params[0]).toEqual(ENDPOINTS.MERGE.url);
      expect(params[1].body).toBeTruthy()
      assertFormDataContains(data, 'xfdf', XFDF);

      const getParams2 = mockNextFetch({
        url: 'https://myfile2.com',
        id: '4321',
        key: 'bbbb'
      });

      const instance2 = APIUtils.fromResponse(resp);
      const resp2 = await instance2.watermark({
        text: "hello world",
        color: "red"
      })
      params = getParams2();
      data = params[1].body;
      assertFormDataContains(data, 'text', 'hello world')
      assertFormDataContains(data, 'headers', JSON.stringify({ Authorization: 'aaa||bbb' }))
      assertFormDataContains(data, 'color', 'red')

      expect(resp2.key).toEqual('bbbb')
      expect(resp2.id).toEqual('4321')
      expect(resp2.url).toEqual('https://myfile2.com')
    })

    it('can forward headers', async () => {
      const getParams = mockNextFetch({
        url: 'https://myfile.com',
        id: '1234',
        key: 'aaa||bbb'
      });

      const instance = new APIUtils(KEYS);
      instance.setFile(BLOB)
      instance.setXFDF(XFDF);
      const headers = {
        CustomHeader: "abc",
        Auth: '123'
      }
      instance.setHeaders(headers)

      await instance.set();
      const params = getParams();
      const data = params[1].body;
      assertFormDataContains(data, "headers", JSON.stringify(headers))
    })
  })

  describe('error handling', () => {

    it('throws if a large file is added', async () => {
      const instance = new APIUtils(KEYS);
      const file = readFixture('large.pdf');

      expect(() => {
        instance.setFile(file);
      }).toThrow(/That file is too large/)
    })

    it('throws if empty XFDF is pushed', async () => {
      const instance = new APIUtils(KEYS);

      expect(() => {
        instance.setXFDF('');
      }).toThrow(/XFDF must be a string and cannot be empty/)
    })

    it('throws if APIs are called without parameters set', async () => {

      const instance = new APIUtils(KEYS);

      expect(async () => {
        await instance.merge()
      }).rejects.toThrow(/requires properties/)

      expect(async () => {
        await instance.set()
      }).rejects.toThrow(/requires properties/)
    })

    it('throws if keys are not passed', async () => {
      expect(() => {
        // @ts-ignore
        const instance = new APIUtils({});
      }).toThrow(/requires properties/)
    })

    it('throws if invalid file type is set', async () => {

      const instance = new APIUtils(KEYS);

      expect(() => {
        // @ts-ignore
        instance.setFile(23);
      }).toThrow(/File must be of type File/)
    })

  })

})