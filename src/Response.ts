import { getFetch } from './util/fetch';
import { isServer } from './util/env';
import { ENDPOINTS } from './config';
import { throwInvalidRequestError } from './util/errors';


type ResponseOptions = {
  url: string,
  id: string,
  key: string,
  license: string,
  xfdf: string
}


/**
 * A class representing a response from the API. Should not be created directly, but should be retrieved from methods in the ExpressUtils class.
 * @property {string} url The URL that you can download the file from
 * @property {string} id The ID of the file
 * @property {string} key The key used for authenticating the request when downloading the file from 'url'
 * @property {string} xfdf The XFDF returned from the response. Only set if calling an endpoint that extracts XFDF
 * @property {string} license The license that was passed to the API
 */
export class Response {

  private blob?: Blob | ArrayBuffer;
  public url?: string
  public id?: string
  public key?: string
  public xfdf?: string
  public license?: string

  constructor({ 
    url,
    id,
    key,
    license,
    xfdf,
  }: ResponseOptions) {
    this.url = url;
    this.id = id;
    this.key = key;
    this.license = license;
    this.xfdf = xfdf;
  }

  /**
   * Fetches and returns the file as a Blob
   * @returns {Promise<Blob>}
   */
  async getBlob(): Promise<Blob | ArrayBuffer> {

    if (!this.url) {
      throwInvalidRequestError('getBlob', 'There is no output file to fetch')
    }

    if (this.blob) {
      return this.blob;
    }

    const fetch = getFetch();
    let blob: Blob | ArrayBuffer = await fetch(this.url, {
      method: 'get',
      headers: {
        Authorization: this.key
      },
    }).then((resp: any) => {
      if (isServer) {
        return resp.buffer();
      }
      return resp.blob()
    });

    blob = (blob as Blob).slice(0, (blob as Blob).size, "application/pdf")
    this.blob = blob;

    return blob;
  }

  /**
   * Deletes the file from the server and destroys the instance.
   * If delete is not called, the file will still becoming inaccessible after 3 hours,
   * and will be permanently deleted after ~24 hours.
   * 
   * Deleting a file does not count as a transaction
   * @returns {Promise<void>}
   * @example
   * const instance = new APIUtils({ serverKey: '', clientKey: '' });
   * instance.setFile(myFile)
   * instance.setXFDF(xfdfString)
   * const resp = await instance.set();
   * const blob = await resp.getBlob(); // get the blob for your apps usage
   * await resp.deleteFile(); // delete the file
   */
  async deleteFile() {

    if (!this.id) {
      throwInvalidRequestError('deleteFile', 'There is no temporary file to delete')
    }
    const FormData = isServer ? require('form-data') : window.FormData;
    const data = new FormData();
    if (this.license) {
      data.append('license', this.license);
    }
    data.append('id', this.id);
    const fetch = getFetch();
    await fetch(ENDPOINTS.DELETE.url, {
      method: ENDPOINTS.DELETE.method,
      body: data as unknown as FormData
    })

    this.blob = undefined;
    this.url = undefined;
    this.key = undefined;
    this.id = undefined;
  }
}