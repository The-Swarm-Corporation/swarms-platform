#!/bin/bash

# Log file location
LOG_FILE="conversion.log"

# Find all .jsx files and rename them to .tsx
find . -name "*.jsx" | while read file; do
    newfile="${file%.jsx}.tsx"
    mv "$file" "$newfile"
    echo "Renamed $file to $newfile" >> $LOG_FILE
done

echo "Conversion complete. See $LOG_FILE for details."
