# books-info
A web app that gets information about books based on Goodreads API

run mysql server with name 'root' and pw 'root'.. and create table searches with 2 columns n 'searches' and 'insertTime' by the query CREATE TABLE ... , you can use mysql workbench for this (can download from here: - link for download - ).

add cleardb mysql, get connection details (how to do it: in cleardb addon documentation) and configured the connection in server.js.
important to do : restart all dynos in "More" near "Open app" after every update/commit.
chnges to mysql connection to mysql pull, since the app was crashing when 2 users connect in the same time, and also it had an issue with reconnecting after a crash.