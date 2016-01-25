## Task

Convert a bunch of CSVs into newline delimited JSON and calculate an average of the 'age' field

-----------------------------------------------------------------

## Description

- `argv[2]` will be a path to a directory containing csvs with paths like `20161001/00001.csv`
- `argv[3]` will the destination directory to write the files with `jsonl` file extension (i.e. convert the csv to json and write from `20161001/00001.csv` => `20161001/00001.jsonl`)
- for each day, write to stdout (`console.log`) the average of the `age` field, prefixed with the same date format (i.e. 20161001: 42.5)
- their are no column headers on the csv, the fields are `name,city,state,age`. Write a json record on each line with name, city, state, age as field names.

## Hints
- While there is a good library for handling JSON, for simplicity sake, you don't need to worry about escaping anything (splitting by comma should work)
- Make sure you create the records with the same order of fields, `{"name", "city", "state", "age"}` as we just compare strings and don't parse the JSON for comparison
- The result directory will be created for you, but the directories for each day will not, so remember to create them!
- When writing the sums to stdout, make sure you order the dates lexigraphically
