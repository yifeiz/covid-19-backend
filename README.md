# COVID-19 Backend

Backend for the COVID-19 project

## Prerequisites

If you haven't already installed node, please get that setup:

We highly recommend that you use nvm to make sure that we are all using the same node and npm versions across the field.

Installation link can be found here for

- [Unix/Linux](https://github.com/nvm-sh/nvm)
- [Windows](https://github.com/coreybutler/nvm-windows)

If you'd like to avoid the above package managers, you can install node [here](https://nodejs.org/en/download/releases/), and make sure to select node versions above 10.18.1 (Latest version should be fine)

## Setting up Google Cloud

Firstly you will need to set up the [Google Cloud SDK](https://cloud.google.com/sdk/docs/quickstarts) for the flatten project.

To test locally, you will need to set up a service account key. Obtain a JSON key, and run `export GOOGLE_APPLICATION_CREDENTIALS="[PATH]"`.

## Running

After making sure you have node, npm, and the Cloud SDK set up on your system, you can run `npm install` to get dependencies, and then `npm start` in the root directory to start the project.

## Additional Tools

The following tools may be very helpful to you, please check them out.

- [Robo3T](https://robomongo.org/) : Helpful mongo db GUI
- [Postman](https://www.postman.com/) : Let's you test API endpoints easily
