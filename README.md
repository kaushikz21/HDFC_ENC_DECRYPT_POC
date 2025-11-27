<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# HDFC Encryption/Decryption POC

A progressive [Node.js](http://nodejs.org) framework for building efficient and scalable server-side applications using NestJS.

## Project Setup

### Install Dependencies

```bash
$ pnpm install
```

### Generate Required Files

Before running the project, generate any necessary files (e.g., configuration, keys, etc.):

```bash
$ pnpm run generate
```

### Generate PEM File

Before starting the project, you must generate the PEM file by running the `generate-keys.js` script:

```bash
$ node generate-keys.js
```

### Run the Project

#### Development Mode

```bash
$ pnpm run start
```

#### Watch Mode

```bash
$ pnpm run start:dev
```

#### Production Mode

```bash
$ pnpm run start:prod
```

## Logs

The application logs encryption and decryption activities to the terminal. These logs include details about the process and any errors encountered.

## Example API Request

You can test the encryption/decryption functionality using the following `curl` command:

```bash
curl --location 'http://localhost:3000/payment/initiate' \
--header 'Content-Type: application/json' \
--data '{"amount": 500, "beneficiary": "Test User"}'
```

This will initiate a payment request with the specified amount and beneficiary details.

## Resources

- [NestJS Documentation](https://docs.nestjs.com) - Learn more about the framework.
- [NestJS Devtools](https://devtools.nestjs.com) - Visualize and interact with your application in real-time.
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment) - Steps for deploying your application.

## License

This project is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).