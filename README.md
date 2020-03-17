# COVID-19 Backend

Backend for the covid-19 project

## Prerequisites

If you haven't already installed node, please get that setup:

We highly recommend that you use nvm to make sure that we are all using the same node and npm versions across the field.

Installation link can be found here for

- [Unix/linux](https://github.com/nvm-sh/nvm)
- [Windows](https://github.com/coreybutler/nvm-windows)

If you'd like to avoid the above package managers, you can install node [here](https://nodejs.org/en/download/releases/), and make sure to select node versions above 10.18.1 (Latest version should be fine)

After making sure you have node and npm on your system, you can run 'npm start' in the root directory to start the project.

### Installing local Mongo

Highly encourage everyone to use a local mongo db. There is a sandbox mongodb in the cloud (mongodb atlas), but for any local testing, please use a local db. Installation steps found [here](https://docs.mongodb.com/manual/administration/install-community/).

### .env

You might notice that the current index.js base is using some tags with 'process.env.PORT', or 'process.env.DBPASSWORD'. DO NOT commit .env ever; this may contain sensitive information, so keep that local. Your .env file might look like something below:

```
PORT = 8080
DBPASSWORD = "AStrongPassword"
CLOUDDB = false
```

Note: by default, this project is going to be using port 80, which potentially is not allowed depending on your user permissions. Either run the project under a sudo user, or define a port above 1024 shown above.

## Additional Tools

The following tools may be very helpful to you, please check them out.

- [Robo3T](https://robomongo.org/) : Helpful mongo db GUI
- [Postman](https://www.postman.com/) : Let's you test API endpoints easily
