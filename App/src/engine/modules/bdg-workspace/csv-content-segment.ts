export interface CsvContentSegment {
  segmentId: string // foreign key → BdgAccountSegment.id
  filename: string // original CSV filename
  content: string // raw UTF-8 CSV text
}
