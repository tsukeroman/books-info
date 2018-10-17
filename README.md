# books-info
Books-Info is a web app that provides information about books based on Goodreads API.
________________________________________

I deployed Books-Info to Heroku, you can visit the app at:
https://books-info-app.herokuapp.com/

The app was developed in Javascript. The server is written in Node.js with Express, and it uses a templating engine (EJS) to view the content to the client. The app uses a MySQL database.
The app interacts with a third party API - Goodreads's API.
________________________________________

In order to run the app you have to run the following command in the terminal from the the root folder: 
(I assume that you use linux, or that you run git-bash on windows)

$ npm start   

I pushed the app with all the dependencies installed, so it should be enough, but if you are having any problems with running the app, run the following commands from the root folder:

$ npm install   
$ npm start   

*** Notice that the app runs on port 3000, so you should validate that this port is not in use *** 
*** Also, very important to note, in order to run the app on your PC, you need to have MySQL installed and to follow the following steps:
( It is very simple to do with MySQL Workbench, which you can download 
  at https://www.mysql.com/products/workbench/ )

1. Run MySQL server on the PC
2. Create a user with the name 'root' and the password 'root'
3. create a database with the name 'books-info' for the 'root' user
4. Create a table named 'searches' with 'search' and 'insertTime' columns 
   ( you can do this by running the following query:
   'CREATE TABLE searches(search varchar(255), insertTime bigint)' )

If you already have a user with the name root, what you can do is to go to the server.js file
and to replace the password on line 20 with the one you use for this user.

Since the app can't work without the database, the last steps are very important.
________________________________________

The main page of the app cosists of a search box with a 'View' button, and two lists on the right, the list of the last 10 searches and the list of the 3 most searched books. 
The search will return the book with the closest name to the search value, so the more accurate will be the search value, the more accurate will be the result.
________________________________________

The app is responsive to sreen size changes, when the screen width is less then 750px, the right column of the search lists will move to the bottom of the page, under the search form. 
________________________________________

This is a development version of the app. In order to deploy it, I followed these steps:
- I added "engines" field to server's package.json, so the deployment platform will know what versions of NPM and Node to use.
- I added a Procfile to the root of the app, Heroku needs it.
- I added ClearDB MySQL addon to the resources of the app in Heroku, and I've replaced connection details with the new details that I got from ClearDB (there is a documentation about how to get these details).
- I replaced MySQL 'createConnection' method with 'createPool' (both on the deployment and the development versions), since pool can support multiple connections at the same time, while connection crashed everytime.