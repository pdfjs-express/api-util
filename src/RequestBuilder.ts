import { getFetch } from './util/fetch';
import { isServer } from './util/env';
import { Response } from './Response';
import { Endpoint } from './spec/endpoint';
import { throwMissingDataError } from './util/errors';
import { FileType } from './ExpressUtils';
class RequestBuilder {

  private file?: FileType;
  private xfdf?: string;
  private license?: string;
  private endpoint?: Endpoint;
  private otherData?: Record<string, any>
  private headers?: Record<string, string>
  
  setFile(file: FileType) {
    this.file = file;
    return this;
  }

  setData(data: Record<string, any>) {
    this.otherData = data;
    return this;
  }

  setHeaders(headers: Record<string, string>): RequestBuilder {
    if (!headers) return this;
    try {
      const keys = Object.keys(headers);
      if (keys.length === 0) return this;
    } catch (e) {
      return this;
    }

    this.headers = headers;
    return this;
  }

  setXFDF(xfdf: string) {
    this.xfdf = xfdf;
    return this;
  }

  setLicense(license: string = '') {
    this.license = license;
    return this;
  }

  setEndpoint(endpoint: Endpoint) {
    this.endpoint = endpoint;
    return this;
  }

  async make() {
    const fd: typeof FormData = isServer ? require('form-data') : window.FormData;
    const form = new fd();

    if (!this.file || !this.endpoint) {
      throwMissingDataError('make', ['file', 'endpoint']);
    }

    form.append('file', this.file as any);
    if (this.license) {
      form.append('license', this.license);
    }

    if (this.otherData) {
      Object.keys(this.otherData).forEach((key) => {
        form.append(key, this.otherData[key])
      })
    }

    if (this.headers) {
      form.append('headers', JSON.stringify(this.headers));
    }

    if (this.xfdf) {
      form.append('xfdf', this.xfdf);
    }

    let json;
    try {
      const fetch = getFetch();
      const data = await fetch(this.endpoint?.url, {
        method: this.endpoint?.method,
        body: form as unknown as FormData,
      });
      json = await data.json();
    } catch (e) {
      throw e;
    }

    const error = json.error || json.message;

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