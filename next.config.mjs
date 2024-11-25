/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  /*   reactStrictMode: false,  only disable this in development mode if you understand the consequences, 
   as Strict Mode helps detect issues in your codebase. change to true after fully completed*/
  eslint: {
    // ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.yourprint.in",
      },
      {
        protocol: "https",
        hostname: "99customizedjewellery.com",
      },
      {
        protocol: "https",
        hostname: "tailwindui.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
