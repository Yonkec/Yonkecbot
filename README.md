# YonkecBot
#### Video Demo:  (https://youtu.be/JN0r2QvZCWY)
#### Description:

Discord Bot that currently has 4 functions:



### **#[text query for OpenAI Davinci]**      

will query OpenAI and return a completion using DaVinci-003

### **&[text query for Dall-E]**       

will query OpenAI and return an image completion via DALL-E

### **$random [lower] [upper] @user-to-challenge** 

accepts a lower integer bound, an upper integer bound,
and an @mention of the user in the channel you wish to challenge, then initiates an automated LeetRoll between
the two of you.  The outcomes are recorded in a database for future reference

### **$top** 

outputs the current LeetRoll leaderboard


Most of what I want to say about the project is contained within comments spread throughout the program itself.  There are probably 1-2 full pages worth of comments there to peruse.  You can open up bot.js and review all of that to get an idea of my thoughts / intentions / rationale behind the decisions I made.  

This is a Node.js programm that was written, as may be expected, in javascript.  Supporting this I also leverage a sqlite3 database simply titled bot.db where I store the leaderboard information.  I also utilize OpenAI to perform various queries, Eris for Discord support, as well as the much improved Discord.JS library.

The biggest challenge by far was getting my leaderboard table to populate and look presentable.  I was amazed at how limited that functionality is to format information as a table in discord.  

One final note - as this bot relies on multiple API tokens to function - it will not be usable for anyone unless they do two things:

Create their own Discord developer account / bot, and obtain the token for that.  You will also need to create an OpenAI account and obtain an API key / provide funding as charges are incurred for those queries.  Once you have both keys they need to be placed into a .ENV file located in the root directory, and formatted as below:

OPENAI_API_KEY=[INSERT KEY HERE]
DISCORD_BOT_TOKEN=[INSERT KEY HERE]

Without doing this the bot will be unable to connect to either Discord or OpenAI and perform any of its functions.


