import { Response } from './Response';
import { Endpoint } from './spec/endpoint';
import { throwMissingDataError } from './util/errors';
import { FileType } from './ExpressUtils';
import fetch from 'isomorphic-fetch';
import ISOFormData from 'isomorphic-form-data';

class RequestBuilder {

  private file?: FileType;
  private xfdf?: string;
  private license?: string;
  private endpoint?: Endpoint;
  
  setFile(file: FileType) {
    this.file = file;
    return this;
  }

  setXFDF(xfdf: string) {
    this.xfdf = xfdf;
    return this;
  }

  setLicense(license: string) {
    this.license = license;
    return this;
  }

  setEndpoint(endpoint: Endpoint) {
    this.endpoint = endpoint;
    return this;
  }

  async make() {
    const form = new ISOFormData();

    if (!this.file || !this.license || !this.endpoint) {
      throwMissingDataError('make', ['file', 'endpoint', 'license']);
    }

    form.append('file', this.file);
    form.append('license', this.license);

    if (this.xfdf) {
      form.append('xfdf', this.xfdf);
    }

    let json;
    try {
      const data = await fetch(this.endpoint?.url, {
        method: this.endpoint?.method,
        body: form as unknown as FormData,
      });
      json = await data.json();
    } catch (e) {
      throw e;
    }

    const error = json.error;

    if (error) {
      throw new Error(error.message || error)
    }

    const { url, id, key, xfdf } = json;

    return new Response({
      url,
      id,
      key,
      license: this.license,
      xfdf: xfdf || this.xfdf
    });
  }
}

export default RequestBuilder;