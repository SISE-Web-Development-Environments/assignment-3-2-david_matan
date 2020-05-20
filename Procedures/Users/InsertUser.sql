
DROP PROCEDURE IF EXISTS dbo.insertUser;  
GO  
CREATE procedure [dbo].[insertUser]  
(  
@username varchar(10),
@firstname varchar(4000), 
@lastname varchar(4000), 
@country varchar(50),  
@password varchar(MAX),    
@email varchar(4000),
@url varchar(MAX)    
)  
AS  
BEGIN  
insert into users (username,firstname,lastname,country,password,email,url) values( @username,@firstname,@lastname,@country,@password,@email,@url)  
END  