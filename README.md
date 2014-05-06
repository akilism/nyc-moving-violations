nyc-moving-violations
=====================
[uturn.wolvesintheserverroom.com](http://uturn.wolvesintheserverroom.com)

### Precinct by precinct break down of moving violation summonses from the NYPD.



#### There's a really basic api to call if you want the data:

* All precincts, all violations by year.
`http://uturn.wolvesintheserverroom.com/api/precincts/`

* A single precinct by ID all violations by month.
`http://uturn.wolvesintheserverroom.com/api/precinct/:id/`

* You can also filter precincts by year and / or violation. 
`http://uturn.wolvesintheserverroom.com/api/precinct/:id?year=year&violation=violation`

* Example:
`http://uturn.wolvesintheserverroom.com/api/precinct/083?year=2013&violation=Speeding`
