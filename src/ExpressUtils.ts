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

export type WatermarkOptions = {
  text?: string;
  color?: string,
  position?: 'center' | 'top' | 'bottom';
  scale?: number;
  fontSize?: number;
  opacity?: number;
  rotation?: number;
}

/**
 * A class for interacting with the PDF.js Express REST APIs
 */
class ExpressUtils {

  // private
  private activeKey: string;
  private activeFile?: FileType;
  private activeXFDF?: string;
  private activeHeaders?: Record<string, string>

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
    clientKey,
  }: ExpressUtilsOptions) {
    if (!serverKey && !clientKey) {
      throwMissingDataError('constructor', ['serverKey', 'clientKey'])
    }

    //@ts-ignore
    this.activeKey = isClient ? clientKey : serverKey;
    this.activeHeaders = {};
  }

  /**
   * Sets the file to process. Throws if the file is in memory and is too big (5.5 MB max).
   * @param {string|Blob|File|Buffer} file The file to process. Type must be 'string' (url) if the file is over 5.5mb
   * @returns {ExpressUtils} Returns current instance for function chaining
   */
  setFile(file: FileType) {

    // try to convert to a blob first
    if (isClient && typeof file !== 'string' && !(file instanceof Blob) && !(file instanceof File)) {
      try {
        // @ts-ignore
        file = new Blob([file], { type: 'application/pdf' });
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
   * Sets headers to be passed when the API downloads your document. Only used when 'file' is a URL.
   * @param {Object} headers An object representing the headers to forward
   * @returns {ExpressUtils} Returns current instance for function chaining
   */
  setHeaders(headers: Record<string, string>) {
    this.activeHeaders = headers;
    return this
  }

  /**
   * Sets the XFDF to process. Throws if XFDF is empty or not a string
   * @param {string} xfdf The XFDF to use in the conversion
   * @returns {ExpressUtils} Returns current instance for function chaining
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
    this.activeHeaders = undefined;
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
      .setHeaders(this.activeHeaders)
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
      .setHeaders(this.activeHeaders)
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
      .setHeaders(this.activeHeaders)
      .make();
    
    this.done();
    return response;
  }

  /**
   * Calls the PDF.js Express to apply a watermark to the document
   * @param {Object} options
   * @param {string} [options.text] The text to apply as the watermark
   * @param {string} [options.color] The color to set the text to. Must be a valid CSS color. Defaults to 'blue'
   * @param {string} [options.position] The position of the watermark. Must be 'center', 'top', or 'bottom'. Defaults to 'center'
   * @param {number} [options.scale] The scale of the watermark relative to the document. Must be a number between 0 and 1. Ignored if fontSize is set. Defaults to 0.5
   * @param {number} [options.fontSize] The font size to use. Overrides the 'scale' option
   * @param {number} [options.opacity] The opacity of the watermark. Must be value between 0 and 1. Defaults to 0.3
   * @param {number} [options.rotation] The rotation of the watermark in degrees. Defaults to 45
   * @returns {Promise<Response>} Resolves to a Response object.
   * @example
   * const instance = new ExpressUtils({ serverKey: '', clientKey: '' });
   * instance.setFile(myFile)
   * const resp = await instance.watermark({
   *   text: "Property of Joe",
   *   color: "red"
   * });
   */
  async watermark(options: WatermarkOptions): Promise<Response> {
    if (!this.activeFile) {
      return throwMissingDataError('extract', ['file'])
    }

    const response = await new RequestBuilder()
      .setEndpoint(ENDPOINTS.WATERMARK)
      .setFile(this.activeFile)
      .setLicense(this.activeKey)
      .setData(options)
      .setHeaders(this.activeHeaders)
      .make();
    
    this.done();
    return response;
  }

  /**
   * Creates a new instance of the utility request from the response of another
   * @param response The response object from a previous API request
   * @returns {ExpressUtils}
   */
  static fromResponse(response: Response) {
    const inst = new ExpressUtils({
      serverKey: response.license,
      clientKey: response.license
    });

    inst.setFile(response.url);
    inst.setHeaders({
      Authentication: response.key
    })

    return inst
  }
}

export default ExpressUtils;