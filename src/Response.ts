import { ENDPOINTS } from './config';
import fetch from 'isomorphic-fetch';
import FormData from 'isomorphic-form-data';
import { throwInvalidRequestError } from './util/errors';

/**
 * A class representing the response from the Express REST API
 * Contains utility methods for working with files
 * Should not be directly instantiated, and should be returned the main SDK APIs.
 * 
 * @property {string} url The URL used for downloading the document
 * @property {string} id The ID of the document
 * @property {string} key The authentication key used to download the file. Get requests to 'url` must contain a `Authorization: {key}` header
 * @property {string} [xfdf] The xfdf for the document
 */
export class Response {

  private blob?: Blob;
  public url?: string
  public id?: string
  public key?: string
  public xfdf?: string
  private license?: string

  constructor({ 
    url,
    id,
    key,
    license,
    xfdf
  }) {
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
  async getBlob(): Promise<Blob> {

    if (!this.url) {
      throwInvalidRequestError('getBlob', 'There is no output file to fetch')
    }

    if (this.blob) {
      return this.blob;
    }

    const blob = await fetch(this.url, {
      method: 'get',
      headers: {
        Authorization: this.key
      }
    }).then(resp => resp.blob());

    this.blob = blob;
    return blob;
  }

  /**
   * Deletes the file from the server and destroys the instance.
   * If delete is not called, the file will still becoming inaccessible after 3 hours,
   * and will be permanently deleted after ~24 hours.
   * 
   * Deleting a file does not count as a transaction
   * @returns {void}
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

    const data = new FormData();
    data.append('license', this.license);
    data.append('id', this.id);

    await fetch(ENDPOINTS.DELETE.url, {
      method: ENDPOINTS.DELETE.method,
      body: data
    })

    this.blob = undefined;
    this.url = undefined;
    this.key = undefined;
    this.id = undefined;
  }
}