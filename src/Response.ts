import { ENDPOINTS } from './config';
import fetch from 'isomorphic-fetch';
import FormData from 'isomorphic-form-data';

/**
 * A class representing the response from the Express REST API
 * Contains utility methods for working with files
 * Should not be directly instantiated, and should be returned the main SDK APIs.
 * 
 * @property {string} url The URL used for downloading the document
 * @property {string} id The ID of the document
 * @property {string} key The authentication key used to download the file. Get requests to 'url` must contain a `Authorization: {key}` header
 */
export class Response {

  private blob?: Blob;

  constructor(
    public url?: string,
    public id?: string,
    public key?: string,
    private license?: string
  ) {
  }

  /**
   * Fetches and returns the file as a Blob
   * @returns {Promise<Blob>}
   */
  async getBlob(): Promise<Blob> {
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
   * Deletes the file from the server and destroys the instance
   * @returns {void}
   */
  async deleteFile() {
    await fetch(ENDPOINTS.DELETE.url, {
      method: ENDPOINTS.DELETE.method,
      body: new FormData().append('license', this.license)
    })

    this.blob = undefined;
    this.url = undefined;
    this.key = undefined;
    this.id = undefined;
  }
}