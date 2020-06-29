-- Create a new table called 'Recipe' in schema 'Recipes'
-- Drop the table if it already exists
DROP TABLE IF EXISTS recipes 
GO

-- Create the table in the specified schema
CREATE TABLE recipes
(
    id [VARCHAR](4000) NOT NULL PRIMARY KEY, -- primary key column
    username [VARCHAR](10) NOT NULL,
    title [VARCHAR](4000) NOT NULL,
    image [VARCHAR](4000) NOT NULL, 
    readyInMinutes bigint NOT NULL,
    aggregateLikes bigint NOT NULL,
    glutenFree BIT NOT NULL,
    vegetarian BIT NOT NULL,
    ingredients[NVARCHAR](MAX) NOT NULL,
    instructions[NVARCHAR](MAX) NOT NULL,
    servings INTEGER NOT NULL,
    summary [VARCHAR](4000)

);
GO