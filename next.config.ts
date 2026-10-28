import type { NextConfig } from "next";
const nextConfig: NextConfig = {
 reactStrictMode: true,
 async headers(){return [{source:"/:path*",headers:[{key:"Referrer-Policy",value:"no-referrer"},{key:"X-Content-Type-Options",value:"nosniff"},{key:"Cache-Control",value:"no-store"}]}];}
};
export default nextConfig;
