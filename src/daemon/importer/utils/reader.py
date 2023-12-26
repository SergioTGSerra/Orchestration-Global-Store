from csv import DictReader

class CSVReader:

    def __init__(self, path, delimiter=',', start=None, end=None):
        self._path = path
        self._delimiter = delimiter
        self._start = start
        self._end = end

    def read_entities(self, attr, builder, after_create=None):
        entities = {}
        with open(self._path, 'r', encoding='utf-8') as file:
            reader = DictReader(file, delimiter=self._delimiter)
            
            if self._start is not None:
                for _ in range(self._start):
                    next(reader)

            for row in reader:
                if self._end is not None and reader.line_num > self._end:
                    break

                entity = builder(row)
                entities[row[attr]] = entity

                if after_create:
                    after_create(entity, row)

        return entities