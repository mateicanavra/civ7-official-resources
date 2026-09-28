import { createResource } from '../../vendor/solid-js/dist/solid.js';

function asyncLoad(url) {
  const request = new XMLHttpRequest();
  const promise = new Promise(function(resolve, reject) {
    request.onload = () => {
      if (request.status == 0 || request.status == 200) {
        resolve(request.responseText);
      } else {
        reject(`${url} - ${request.statusText}`);
      }
    };
    request.onerror = () => reject(`${url} - ${request.statusText}`);
    request.onabort = () => reject(`${url} - Aborted`);
  });
  request.open("GET", url);
  request.send();
  return promise;
}
function createJsonResource(filename) {
  return createResource(async () => {
    const response = await asyncLoad(filename);
    return JSON.parse(response);
  });
}

export { asyncLoad, createJsonResource };
//# sourceMappingURL=async-load.js.map
