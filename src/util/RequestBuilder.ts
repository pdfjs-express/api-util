import { Endpoint } from '../spec/endpoint';
import { throwMissingDataError } from './errors';
import { FileType } from '../index';
import fetch from 'isomorphic-fetch';
import FormData from 'isomorphic-form-data';

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
    const form = new FormData();

    if (!this.file || !this.license || !this.endpoint) {
      throwMissingDataError('make', ['file', 'endpoint', 'license']);
    }

    form.append('file', this.file);
    form.append('license', this.license);

    if (this.xfdf) {
      form.append('xfdf', this.xfdf);
    }

    return fetch(this.endpoint?.url, {
      method: this.endpoint?.method,
      body: form,
    }).then(resp => resp.json())
  }
}

export default RequestBuilder;