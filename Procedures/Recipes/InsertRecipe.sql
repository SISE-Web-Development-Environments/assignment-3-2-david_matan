
DROP PROCEDURE IF EXISTS dbo.insertRecipe;  
GO  
CREATE procedure [dbo].[insertRecipe]  
(  
@id varchar(4000),
@username varchar(10),
@name varchar(4000), 
@image varchar(4000), 
@time bigint, 
@likes bigint,    
@isGluten bit,
@isVegaterian bit,
@ingredients nvarchar(max),
@instructions nvarchar(max),
@totalamount integer
)  
AS  
BEGIN  
insert into recipes (id,username,name,image,time,likes,isGluten,isVegaterian,ingredients,instructions,totalamount) values( @id,@username,@name,@image,@time,@likes,@isGluten,@isVegaterian,@ingredients,@instructions,@totalamount)  
END  


  