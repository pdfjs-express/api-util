# Chaining API calls

If you come into a scenerio where you want to chain API calls (for instance, merge XFDF into a document and then watermark it), you can use the static `fromResponse` function to create a new instance of the Utility class from the output of the last API call.

```js
const instance = new ExpressUtils({ serverKey: '', clientKey: '' });
instance.setFile(myFile)
instance.setXFDF(xfdfString)
const resp = await instance.merge();

// This instance will be automatically loaded with the result of 'merge', as well as the license key
const chainedInstance = ExpressUtils.fromResponse(resp)

const resp2 = await instance.watermark({
  text: "Property of Joe",
  color: "red"
})

// This blob will contain the merged XFDF and will be watermarked
const watermarkedBlob = await resp2.getBlob()
```