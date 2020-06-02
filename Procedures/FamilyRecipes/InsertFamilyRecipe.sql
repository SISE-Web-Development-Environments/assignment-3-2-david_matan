
DROP PROCEDURE IF EXISTS dbo.insertFamilyRecipe;  
GO  
CREATE procedure [dbo].[insertFamilyRecipe]  
(  
@id varchar(4000),
@username varchar(10),
@name varchar(4000), 
@image varchar(4000), 
@time bigint, 
@likes bigint,    
@isGluten bit,
@isVegaterian bit,
@belongs varchar(4000),
@wichtime VARCHAR(4000),
@generations integer,
@ingredients nvarchar(max),
@instructions nvarchar(max),
@totalamount integer
)  
AS  
BEGIN  
insert into familyrecipes(id,username,name,image,time,likes,isGluten,isVegaterian,belongs,wichtime,generations,ingredients,instructions,totalamount) values( @id,@username,@name,@image,@time,@likes,@isGluten,@isVegaterian,@belongs,@wichtime,@generations,@ingredients,@instructions,@totalamount)  
END  


  