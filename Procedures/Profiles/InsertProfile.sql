
DROP PROCEDURE IF EXISTS dbo.insertProfile;  
GO  
CREATE procedure [dbo].[insertProfile]  
(  
@username varchar(10),
@watchedRecipe varchar(4000),
@favoriteRecipe varchar(4000), 
@familyRecipe varchar(4000),
@lastWatched varchar(4000)
)  
AS  
BEGIN  
insert into profile(username,watchedRecipe,favoriteRecipe,familyRecipe,lastWatched) values(@username,@watchedRecipe,@favoriteRecipe,@familyRecipe,@lastWatched)  
END  


    