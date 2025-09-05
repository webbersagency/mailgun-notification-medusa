<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Mailgun notifications plugin for Medusa V2
</h1>

<p align="center">
  Send emails using Mailgun.
</p>

<p align="center">
  <a href="#">
    <img src="https://img.shields.io/badge/license-TBD-blue.svg" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
  <br />
  <a href="https://www.mailgun.com/">
    <img src="https://img.shields.io/badge/www-mailgun.com-blue.svg?style=flat" alt="Website" />
  </a>
  <a href="https://webbers.com">
    <img src="https://img.shields.io/badge/www-webbers.com-blue.svg?style=flat" alt="Website" />
  </a>
</p>

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Configuration Options](#configuration-options)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Local Development and Customization](#local-development-and-customization)
- [License](#license)

## Features

## Prerequisites
- Node.js v20 or higher
- Medusa server v2.3.0 or higher
- A [Mailgun](https://www.mailgun.com/) account and API key and domain

> [!NOTE]
> _If you use Mailgun's EU-hosted infrastructure, you need this url as the api_url: https://api.eu.mailgun.net_

## Installation
```bash
pnpm add @webbers/mailgun-notification-medusa
```

## Configuration
Add the provider to the `@medusajs/payment` module in your `medusa-config.ts` file:

```typescript
module.exports = defineConfig({
  projectConfig: {
    // ...
  },
  plugins: [
    // ... other plugins
    '@webbers/pay-payments-medusa'
  ],
  modules: [
    // ... other modules
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve:
              "@webbers/mailgun-notification-medusa/providers/notification-mailgun",
            id: "notification-mailgun",
            options: {
              channels: ["email"],
              apiKey: process.env.MAILGUN_API_KEY,
              domain: process.env.MAILGUN_DOMAIN,
              from_email: process.env.MAILGUN_FROM,
              api_url: process.env.MAILGUN_API_URL, // Only required if using Mailgun's EU-hosted infrastructure
              templates: {
                "<template-name>": {
                  subject: "<subject-function>",
                  template: "<template-function>",
                },
              },
              default_locale: "nl",
            },
          },
        ],
      },
    },
  ]
})
```

## Configuration Options

| Option           | Description                       | Default  |
|------------------|-----------------------------------|----------|
| `apiKey`         | Your Mailgun API key              | Required |
| `domain`         | Your Mailgun domain               | Required |
| `from_email`     | Your from email address           | Required |
| `templates`      | Your email template functions     | Required |
| `default_locale` | The default locale for the emails | Required |
| `api_url`        | The API url of mailgun            | Optional |

## Environment Variables
Create or update your `.env` file with the following variables:

```bash
MAILGUN_API_KEY="<your-mailgun-api-key>"
MAILGUN_DOMAIN="<your-mailgun-domain>"
MAILGUN_FROM="<your-mailgun-from-email>"
MAILGUN_API_URL="<your-api-url>"
```

## Usage
To set up up your email templates two functions are required per template:
- A function that takes a locale as a parameter and returns the subject of the email
- A function that takes the props of the email as a parameter and returns the template of the email
For example you could set it up like this:
1. In the src directory of your medusa server create a directory called `emails`
2. Inside the emails directory create a file called `order-placed.tsx`
3. Inside the order-placed.tsx file add the following code:
```typescript
import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
} from "@react-email/components";

export const getOrderPlacedTemplate = () => (
  <Html>
    <Head />
    <Preview>Your order is confirmed</Preview>
    <Body>
     <Container>
      <Heading>Thanks for your order!</Heading>
      <Text>Order #12345 has been confirmed.</Text>
      <Text>Total: $59.99</Text>
     </Container>
    </Body>
  </Html>
);
export const orderPlacedSubject = (locale: string) => {
switch (locale) {
case "nl":
return "Bestelling bevestigd"
case "en":
return "Order Confirmation"
}
}
```
4. In the `medusa-config.ts` file add the following code:
```typescript
module.exports = defineConfig({
  projectConfig: {
    // ...
  },
  plugins: [
    // ... other plugins
    '@webbers/pay-payments-medusa'
  ],
  modules: [
    // ... other modules
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve:
              "@webbers/mailgun-notification-medusa/providers/notification-mailgun",
            id: "notification-mailgun",
            options: {
              channels: ["email"],
              apiKey: process.env.MAILGUN_API_KEY,
              domain: process.env.MAILGUN_DOMAIN,
              from_email: process.env.MAILGUN_FROM,
              api_url: process.env.MAILGUN_API_URL, // Only required if using Mailgun's EU-hosted infrastructure
              templates: {
                "order-placed": {
                  subject: orderPlacedSubject,
                  template: getOrderPlacedTemplate,
                },
              },
              default_locale: "nl",
            },
          },
        ],
      },
    },
  ]
})
```


## Local development and customization

In case you want to customize and test the plugin locally, refer to
the [Medusa Plugin docs](https://docs.medusajs.com/learn/fundamentals/plugins/create#3-publish-plugin-locally-for-development-and-testing).

## License
TBD
