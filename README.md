# CarParkGoWhere

Welcome to to the repository for NTU SC2006 Software Engineering Team 46 group project - CarParkGoWhere.

![[CarparkGoWhere.png]]

With high vehicle ownership numbers in Singapore, we face a significant parking problem, particularly in densely populated areas such as the Central Business District area and even at typical HDB car parks after working hours. 

With CarParkGoWhere, we aim to reduce the hassle of having to drive around and search for a free parking space near your destination.

# Table of Contents
- [#CarParkGoWhere]]
- [[#Setup Instructions]]
	- [[#Front-end]]
	- [[#Backend]]
		- Setting up the database
- Pre-configured users
- Documentation
- Web App Design
- Backend
- Design Principle
- Tech Stack
- External APIs
- Contributions

## Setup Instructions

### Front-end
1. Install node.js
2. Install the required modules
```
npm install bcrypt buffer-crc32 connect-mongo cookie-parser debug ejs express express-flash express-session method-override mongodb mongoose nodemailer otp-generator passport passport-local proj4 uid2 dotenv nodemon
	
```

And you are done for frontend.

### Backend
1. Download and install MongoDB [here](https://www.mongodb.com/try/download/community)
2. Open MongoDB Compass
3. Create a database called CarParkGoWhere
4. Create 2 collections called "userdatas" and "userhistories"
5. Import 
