-- Create a new table called 'TableName' in schema 'SchemaName'
-- Drop the table if it already exists

DROP TABLE IF EXISTS FamilyRecipe.familyrecipes 
GO
-- Create the table in the specified schema
CREATE TABLE familyrecipes 
(

    id [VARCHAR](4000) NOT NULL PRIMARY KEY, -- primary key column
    username [VARCHAR](10) NOT NULL,
    name [VARCHAR](4000) NOT NULL,
    image [VARCHAR](4000) NOT NULL, 
    time bigint NOT NULL,
    likes bigint NOT NULL,
    isGluten BIT NOT NULL,
    isVegaterian BIT NOT NULL,
    belongs [VARCHAR](4000) NOT NULL,
    wichtime [VARCHAR](4000) NOT NULL,
    generations INT,
    ingredients[NVARCHAR](MAX) NOT NULL,
    instructions[NVARCHAR](MAX) NOT NULL,
    totalamount INTEGER NOT NULL

    -- specify more columns here
);
GO