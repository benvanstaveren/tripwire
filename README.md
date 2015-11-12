# README #

This is just some basic info on the source atm - more details on how to setup and the database still to come.

### Tripwire - EVE Online wormhole mapping web tool ###

* [Tripwire database](https://drive.google.com/file/d/0B2nU7w1pM6WrNVc0YThXRGlZV2M/view?usp=sharing)
* [EVE_API database](https://drive.google.com/file/d/0B2nU7w1pM6WrNnRZVE94aExJd2M/view?usp=sharing)
* MIT license
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Setup PHP PDO compatible database (MySQL) -- make sure event scheduler is on
* Import blank Tripwire database and EVE_API database (links above)
* EVE_API database needs 1 row inserted before use:
`INSERT INTO eve_api.cacheTime (type, time) VALUES ('activity', now())`
* Create a `db.inc.php` file in root from `db.inc.example`
* Setup `tools/api_pull.php` under a 3 minute cron
* More to come...

### Contribution guidelines ###

* Base off of master
* Look over issues, branches or get with me to ensure it isn't already being worked on

### Who do I talk to? ###

* Daimian Mercer (Project lead / Creator)
* Tripwire Public in-game channel