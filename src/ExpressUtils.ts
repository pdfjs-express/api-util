import { Response } from './Response';
import { isClient } from './util/env';
import { throwFileTooLargeError, throwInvalidFileTypeError, throwInvalidXFDFError, throwMissingDataError } from './util/errors';
import { MAX_FILE_SIZE, ENDPOINTS } from './config';
import RequestBuilder from './RequestBuilder';

type ExpressUtilsOptions = {
  serverKey: string,
  clientKey: string
}

export type FileType = string | Blob | File | Buffer | BlobPart;

/**
 * A class for interacting with the PDF.js Express REST APIs
 */
class ExpressUtils {

  // private
  private activeKey: string;
  private activeFile?: FileType;
  private activeXFDF?: string;

  /**
   * Initialize the class
   * @param {Object} options
   * @param {string} options.serverKey Your server side license key. Can be fetched from your profile at https://pdfjs.express
   * @param {string} options.clientKey Your client side license key. Can be fetched from your profile at https://pdfjs.express
   * @example
   * import ExpressUtils from '@pdftron/pdfjs-express-utils'
   * 
   * const util = new ExpressUtils({
   *  serverKey: 'my_server_key',
   *  clientKey: 'my_client_key'
   * })
   */
  constructor({
    serverKey,
    clientKey
  }: ExpressUtilsOptions) {
    if (!serverKey && !clientKey) {
      throwMissingDataError('constructor', ['serverKey', 'clientKey'])
    }

    //@ts-ignore
    this.activeKey = isClient ? clientKey : serverKey;
  }

  /**
   * Sets the file to process. Throws if the file is in memory and is too big (5.5 MB max).
   * @param {string|Blob|File|Buffer} file The file to process. Type must be 'string' (url) if the file is over 5.5mb
   * @returns {ExpressRESTUtil} Returns current instance for function chaining
   */
  setFile(file: FileType) {

    // try to convert to a blob first
    if (isClient && typeof file !== 'string' && !(file instanceof Blob) && !(file instanceof File)) {
      try {
        // @ts-ignore
        file = new Blob(file);
      } catch (e) {}
    }

    let size;
    if (typeof file === 'string') {
      size = 0; // string doesnt have a size
    } else if (isClient && (file instanceof File || file instanceof Blob)) {
      size = file.size;
    } else if (!isClient && file instanceof Buffer) {
      size = file.length;
    } else {
      throwInvalidFileTypeError();
    }

    if (size > MAX_FILE_SIZE) {
      throwFileTooLargeError()
    }

    this.activeFile = file;
    return this;
  }

  /**
   * Sets the XFDF to process. Throws if XFDF is empty or not a string
   * @param {string} xfdf The XFDF to use in the conversion
   * @returns {ExpressRESTUtil} Returns current instance for function chaining
   */
  setXFDF(xfdf: string) {
    if (typeof xfdf !== 'string' || xfdf.trim() === '') {
      throwInvalidXFDFError();
    }
    this.activeXFDF = xfdf;
    return this;
  }

  private done() {
    this.activeFile = undefined;
    this.activeXFDF = undefined;
  }

  /**
   * Calls the PDF.js Express API to merge the current file and XFDF together.
   * @returns {Promise<Response>} Resolves to a Response object
   * @example
   * const instance = new ExpressUtils({ serverKey: '', clientKey: '' });
   * instance.setFile(myFile)
   * instance.setXFDF(xfdfString)
   * const resp = await instance.merge();
   * 
   * const url = resp.url; // the URL of the new file
   * const key = resp.key; // The key used to fetch the file
   * 
   * const blob = await resp.getBlob(); // downloads the 'url' and returns a blob
   */
  async merge(): Promise<Response> {
    if (!this.activeXFDF || !this.activeFile) {
      return throwMissingDataError('merge', ['file, xfdf'])
    }

    const response = await new RequestBuilder()
      .setEndpoint(ENDPOINTS.MERGE)
      .setFile(this.activeFile)
      .setXFDF(this.activeXFDF)
      .setLicense(this.activeKey)
      .make();
    
    this.done();
    return response;
  }

  /**
   * Calls the PDF.js Express API to set the XFDF of a document. This will overwrite any existing annotations/xfdf the document may have.
   * @returns {Promise<Response>} Resolves to a Response object
   * @example
   * const instance = new ExpressUtils({ serverKey: '', clientKey: '' });
   * instance.setFile(myFile)
   * instance.setXFDF(xfdfString)
   * const resp = await instance.set();
   * 
   * const url = resp.url; // the URL of the new file
   * const key = resp.key; // The key used to fetch the file
   * 
   * const blob = await resp.getBlob(); // downloads the 'url' and returns a blob
   */
  async set(): Promise<Response> {
    if (!this.activeXFDF || !this.activeFile) {
      return throwMissingDataError('set', ['file, xfdf'])
    }

    const response = await new RequestBuilder()
      .setEndpoint(ENDPOINTS.SET)
      .setFile(this.activeFile)
      .setXFDF(this.activeXFDF)
      .setLicense(this.activeKey)
      .make();
    
    this.done();
    return response;
  }

  /**
   * Calls the PDF.js Express to extract the xfdf from a document
   * @returns {Promise<Response>} Resolves to a Response object. You can access the xfdf with `response.xfdf`
   * @example
   * const instance = new ExpressUtils({ serverKey: '', clientKey: '' });
   * instance.setFile(myFile)
   * const resp = await instance.extract();
   * const xfdfString = resp.xfdf;
   */
  async extract(): Promise<Response> {
    if (!this.activeFile) {
      return throwMissingDataError('extract', ['file'])
    }

    const response = await new RequestBuilder()
      .setEndpoint(ENDPOINTS.EXTRACT)
      .setFile(this.activeFile)
      .setLicense(this.activeKey)
      .make();
    
    this.done();
    return response;
  }
}

export default ExpressUtils;