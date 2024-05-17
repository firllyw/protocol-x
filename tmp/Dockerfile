# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies 
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# bind port 
EXPOSE 3000

# Start the API server
CMD [ "node", "app.js" ]