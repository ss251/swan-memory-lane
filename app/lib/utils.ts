const isDev = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
const localUrl = `http://localhost:${port}`;

export const BASE_URL = isDev 
  ? localUrl 
  : 'https://swan-memory-lane.vercel.app'; // Update this with your actual deployed URL

export const BANNER_IMG = `${BASE_URL}/api/og?type=banner`;
export const ICON_IMG = `${BASE_URL}/images/swan-icon.svg`; 