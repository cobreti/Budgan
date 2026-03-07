# Requirements

Requires a Node.js version that supports `--experimental-transform-types` (e.g., Node 20+), so TypeScript can run directly without a transpilation step.

## Execute the tool

- Without output file (prints the generated statement object):
```powershell
node --experimental-transform-types statement-generator.ts
```

- With output file (writes CSV to the given path):
```powershell
node --experimental-transform-types statement-generator.ts ../data-files/statement.csv
```


## Run via npm script

You can also run the tool using the npm script defined in `package.json`.

- From this folder (`Tools/StatementGenerator`):
```bash
npm run generate-statement
```

- With output file (writes CSV to the given path):
```bash
npm run generate-statement -- ../data-files/statement.csv
```

- From the project root using `--prefix`:
```bash
npm --prefix Tools/StatementGenerator run generate-statement
npm --prefix Tools/StatementGenerator run generate-statement -- ./data-files/statement.csv
```
