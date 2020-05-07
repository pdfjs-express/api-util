
export const throwFileTooLargeError = () => {
  throw new Error(`That file is too large to upload directly to the API. Please upload the file to a public URL first.`)
}

export const throwInvalidFileTypeError = () => {
  throw new Error(`File must be of type File, Blob, Buffer, or string (url)`)
}

export const throwInvalidXFDFError = () => {
  throw new Error(`XFDF must be a string and cannot be empty`)
}

export const throwMissingDataError = (funcName: string, required: string[]) => {
  throw new Error(`${funcName} requires properties ${required.join(', ')} to be set.`);
}