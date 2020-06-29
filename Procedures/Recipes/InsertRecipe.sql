
DROP PROCEDURE IF EXISTS dbo.insertRecipe;  
GO  
CREATE procedure [dbo].[insertRecipe]  
(  
@id varchar(4000),
@username varchar(10),
@title varchar(4000), 
@image varchar(4000), 
@readyInMinutes bigint, 
@aggregateLikes bigint,    
@glutenFree bit,
@vegetarian bit,
@ingredients nvarchar(max),
@instructions nvarchar(max),
@servings integer,
@summary varchar(4000)
)  
AS  
BEGIN  
insert into recipes (id,username,title,image, readyInMinutes,aggregateLikes,glutenFree,vegetarian,ingredients,instructions,servings,summary) values( @id,@username,@title,@image,@readyInMinutes,@aggregateLikes,@glutenFree,@vegetarian,@ingredients,@instructions,@servings,@summary)  
END  


  