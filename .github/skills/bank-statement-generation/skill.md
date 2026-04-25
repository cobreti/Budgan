---
Name: bank-statement-generation
Description: Generate bank statements in CSV format using random data for transactions, including card number, transaction date, inscription date, descriptions, and amounts.
allowed-tools:
  - file-system
  - Node.js
  - date-time
  - random-data-generation
  - text-processing
  - csv-generation
  - markdown-processing
---

# Bank Statement Generation Skill

This skill generates bank statements in CSV format using random data for transactions, including card number, transaction date, inscription date, descriptions, and amounts. The generated bank statement can be used for testing the application.
The order of the columns in the CSV file should be: Card Number, Transaction Date, Inscription Date, Description, Amount unless specified otherwise by the user.
The generated CSV file should be saved with a name in the format "bank_statement_<timestamp>.csv" where <timestamp> is the current date and time in the format "YYYYMMDD_HHMMSS". The file should be saved in the ./Tools/data-files directory unless specified otherwise by the user
The skill should return the path to the generated CSV file.
The bank statement should contains a header row with the name of the columns. The header row should be the first row of the CSV file.

## card number

The card number must the same for the whole statement.

## dates

Transactions should appear in chronological order based on the transaction dates.
The Transaction date should be anything within the last year unless specified otherwise by the user.
The Inscription date should be the first non holiday date after the transaction date unless specified otherwise by the user.

## description

The description should be a value taken randomly from the file [descriptions.md](./data/descriptions.md) unless specified otherwise by the user.

## amount

The amount should be a random number between 1 and 1000 unless specified otherwise by the user. The amount should be rounded to 2 decimal places.
The amount can be negative if it's an expense or positive if it's an income.


# generated files cleanup

Keep only the generated csv file.  Discard any other files created during the process.
