import type { NextConfig } from "next";
import nextra from 'nextra'

const withNextra = nextra({
  // ... Other Nextra config options
})

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true // mandatory, otherwise won't export
  }
};

export default withNextra(nextConfig);
