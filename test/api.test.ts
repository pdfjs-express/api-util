import { FormData } from 'isomorphic-form-data';
import { ENDPOINTS } from './../src/config';
import APIUtils from '../src/APIUtils';
import fetch from 'isomorphic-fetch';
import assert from 'assert';

jest.mock('isomorphic-fetch');

const mockNextFetch = (resp) => {
  let params;
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

  assert.equal(_streams[i + 1], value);

}

const KEYS = { serverKey: '123', clientKey: '456' }
const BLOB = new Buffer([]);
const XFDF = '<xfdf>';

/**
 *  url, id, key, xfdf
 */
describe('API tests', () => {

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
    assert.ok(resp);
    assert.ok(resp?.id);
    assert.ok(resp?.url);
    assert.ok(resp?.key);
    assert.ok(resp?.deleteFile);

    const params = getParams();
    assert.equal(params[0], ENDPOINTS.MERGE.url);
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
    assert.ok(resp);
    assert.ok(resp?.id);
    assert.ok(resp?.url);
    assert.ok(resp?.key);
    assert.ok(resp?.deleteFile);

    const params = getParams();
    assert.equal(params[0], ENDPOINTS.SET.url);
  });

  it('can call the extract endpoint', async () => {
    const getParams = mockNextFetch({
      xfdf: 'test'
    });

    const instance = new APIUtils(KEYS);
    instance.setFile(BLOB);
    
    const resp = await instance.extract();
    assert.ok(resp);
    assert.ok(resp?.xfdf);

    const params = getParams();
    assert.equal(params[0], ENDPOINTS.EXTRACT.url);
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
    assert.equal(params[0], ENDPOINTS.DELETE.url);
    assert.ok(params[1].body)
    const data = params[1].body;
    assertFormDataContains(data, 'license', '123');
    assertFormDataContains(data, 'id', '1234');
  })
})