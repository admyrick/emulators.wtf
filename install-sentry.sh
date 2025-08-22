#!/usr/bin/env bash

# Install Sentry
npm install @sentry/nextjs

# Initialize Sentry (this will create config files)
npx @sentry/wizard@latest -i nextjs
