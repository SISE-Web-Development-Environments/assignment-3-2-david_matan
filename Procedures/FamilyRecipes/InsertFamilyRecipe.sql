
DROP PROCEDURE IF EXISTS dbo.insertFamilyRecipe;  
GO  
CREATE procedure [dbo].[insertFamilyRecipe]  
(  
@id varchar(4000),
@username varchar(10),
@title varchar(4000), 
@image varchar(4000), 
@readyInMinutes bigint, 
@aggregateLikes bigint,    
@glutenFree bit,
@vegetarian bit,
@belongs varchar(4000),
@wichtime VARCHAR(4000),
@generations integer,
@ingredients nvarchar(max),
@instructions nvarchar(max),
@servings integer,
@summary varchar(4000)
)  
AS  
BEGIN  
insert into familyrecipes(id,username,title,image,readyInMinutes,aggregateLikes,glutenFree,vegetarian,belongs,wichtime,generations,ingredients,instructions,servings,summary) values( @id,@username,@title,@image,@readyInMinutes,@aggregateLikes,@glutenFree,@vegetarian,@belongs,@wichtime,@generations,@ingredients,@instructions,@servings,@summary)  
END  


  