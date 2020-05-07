import { throwFileTooLargeError, throwInvalidFileTypeError, throwInvalidXFDFError, throwMissingDataError } from './util/errors';
import { MAX_FILE_SIZE, ENDPOINTS } from './config';
import RequestBuilder from './util/RequestBuilder';

type ExpressRESTUtilConstructorOptions = {
  serverKey: string,
  clientKey: string
}

export type FileType = string | Blob | File | Buffer;

/**
 * A class for interacting with the PDF.js Express REST APIs
 */
class ExpressRESTUtil {

  // private
  private serverKey: string;
  private clientKey: string;
  private activeFile?: FileType;
  private activeXFDF?: string;
  private lastKey?: string;

  /**
   * Initialize the class
   * @param {Object} options
   * @param {string} options.serverKey Your server side license key. Can be fetched from your profile at https://pdfjs.express
   * @param {string} options.clientKey Your client side license key. Can be fetched from your profile at https://pdfjs.express
   */
  constructor({
    serverKey,
    clientKey
  }: ExpressRESTUtilConstructorOptions) {
    this.serverKey = serverKey;
    this.clientKey = clientKey;
  }

  /**
   * Sets the file to process. Throws if the file is local and is too big.
   * @param {string|Blob|File|Buffer} file The file to process
   * @returns {ExpressRESTUtil} Returns current instance for function chaining
   */
  setFile(file: FileType) {

    let size;
    if (typeof file === 'string') {
      size = 0; // string doesnt have a size
    } else if (file instanceof File || file instanceof Blob) {
      size = file.size;
    } else if (file instanceof Buffer) {
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
   */
  async merge() {
    if (!this.activeXFDF || !this.activeFile) {
      throwMissingDataError('merge', ['file, xfdf'])
      return;
    }

    const data = await new RequestBuilder()
      .setEndpoint(ENDPOINTS.MERGE)
      .setFile(this.activeFile)
      .setXFDF(this.activeXFDF)
      .make();

    this.done();
  }
}

export default ExpressRESTUtil;