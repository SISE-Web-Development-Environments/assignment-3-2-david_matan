-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists

DROP TABLE IF EXISTS Users.users 
GO
-- Create the table in the specified schema
CREATE TABLE users
(
    username [VARCHAR](10) NOT NULL PRIMARY KEY, -- primary key column
    firstname [VARCHAR](4000) NOT NULL,
    lastname [VARCHAR](4000) NOT NULL, 
    country [VARCHAR](50) NOT NULL,
    password [VARCHAR](MAX) NOT NULL,
    email [VARCHAR](4000) NOT NULL ,
    CONSTRAINT AK_TransactionID UNIQUE(email),
    url [VARCHAR](MAX) NOT NULL 

    -- specify more columns here
);
GO