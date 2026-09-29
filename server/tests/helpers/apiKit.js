export { seedFixtures, startApi } from './testKit.js';

   const call = async (method, path, { as, body } = {}) => {
     const headers = {};
    const isFormData = body instanceof FormData;
    if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
     if (as) headers.Cookie = `${AUTH_COOKIE_NAME}=${signAccessToken(as._id)}`;

     const response = await fetch(`${baseUrl}${path}`, {
       method,
       headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
     });
     return { status: response.status, body: await response.json() };
   };