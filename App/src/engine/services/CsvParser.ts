import 'reflect-metadata';
import { injectable } from 'inversify'
import { parse, Parser } from 'csv-parse/browser/esm';

export type CsvRecords = string[];

export type CsvSettings = {
  delimiter: string;
  minimumColumnsCount?: number;
};

export type CsvRow = {
  lineNumber?: number;
  records: CsvRecords;
};

export type CsvContent = {
  header?: CsvRow;
  rows: CsvRow[];
}

export type CsvIgnoredLine = {
  lineNumber: number;
  content: string;
}

export type CsvParseResult = {
  ignoredLines: CsvIgnoredLine[];
  content: CsvContent;
}

export interface ICsvParser {
  minimumColumnsCount: number;
  delimiter: string;

  parse(text: string): CsvParseResult;
}

@injectable()
export class CsvParser implements ICsvParser {

  settings: CsvSettings = {
    delimiter: ','
  };

  constructor() {

  }

  set minimumColumnsCount(value: number) {
    this.settings.minimumColumnsCount = value;
  }

  set delimiter(value: string) {
    this.settings.delimiter = value;
  }

  get delimiter() {
    return this.settings.delimiter;
  }

  parse(text: string): CsvParseResult {
    const parser: Parser = parse({
      delimiter: this.settings.delimiter,
      columns: false,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: false
    });

    const ignoredLines: CsvIgnoredLine[] = [];
    let header: CsvRow | undefined = undefined;
    const rows: CsvRow[] = [];

    type addRecordFct = (lineNo: number, records: string[]) => void;

    const addHeader: addRecordFct = (lineNo, records) => {
      header = {
        lineNumber: lineNo,
        records: records
      };

      addRecords = addRow;
    }

    const addRow: addRecordFct = (lineNo, records) => {
      rows.push({
        lineNumber: lineNo,
        records: records
      });
    }

    let addRecords: addRecordFct = addHeader;

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null ) {

        const lineNo = Number(record[0]);
        const records: string[] = [];
        delete record[0];

        let idx = 1;
        while (record[idx] !== undefined) {
          records.push(record[idx]);
          idx++;
        }

        addRecords(lineNo, records);
      }
    });

    const lines = text.split(/\r?\n/);
    const length = lines.length;

    for (let lineNo = 0; lineNo < length; lineNo++) {
      const line = lines[lineNo];
      const items = line.split(this.settings.delimiter);

      if (line.trim().length === 0)
        continue;

      if (this.settings.minimumColumnsCount && items.length < this.settings.minimumColumnsCount) {
        ignoredLines.push({
          lineNumber: lineNo,
          content: line.trim()
        });
      }
      else {
        parser.write(`${lineNo}${this.settings.delimiter}${line}`);
        parser.write('\n');
      }
    }

    parser.end();

    return {
      ignoredLines: ignoredLines,
      content: {
        header: header,
        rows: rows
      }
    };
  }
}
