/* eslint-disable @typescript-eslint/no-var-requires */
const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin')
const withVanillaExtract = createVanillaExtractPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['raw.githubusercontent.com'],
  },
  // experimental: {
  // appDir: true,
  // serverComponentsExternalPackages: ["@effect/io"],
  // },
}

module.exports = withVanillaExtract(nextConfig)
