export const server = (process.env.REACT_APP_API_URL || "http://localhost:8000").replace(/\/+$/, "");
export const backend_url = `${server}/`;

export const imageUrl = value => {
  const url=typeof value==='object' ? value?.url : value;
  if(!url || typeof url!=='string') return '/placeholder.svg';
  if(/^https?:\/\//i.test(url)) return url;
  return backend_url + url.replace(/^\/?uploads\//,'').replace(/^\/+/,'');
};
