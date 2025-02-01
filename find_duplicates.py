import os
import re
from pathlib import Path
from collections import defaultdict
import ast
import tokenize
from typing import Dict, List, Tuple

def extract_functions_from_ts(content: str) -> Dict[str, str]:
    """Extract functions from TypeScript/JavaScript content using regex."""
    # Pattern for function declarations, arrow functions, and methods
    patterns = [
        r'(?:function\s+(\w+)\s*\([^)]*\)\s*{([^}]+)})',  # Regular functions
        r'(?:const\s+(\w+)\s*=\s*(?:function)?\s*\([^)]*\)\s*(?:=>)?\s*{([^}]+)})',  # Arrow/const functions
        r'(?:(\w+)\s*:\s*(?:function)?\s*\([^)]*\)\s*(?:=>)?\s*{([^}]+)})',  # Object methods
        r'(?:(\w+)\s*=\s*\([^)]*\)\s*(?:=>)\s*{([^}]+)})'  # Class methods
    ]
    
    functions = {}
    for pattern in patterns:
        matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
        for match in matches:
            func_name = match.group(1)
            func_body = match.group(2).strip()
            # Normalize the function body
            normalized_body = normalize_content(func_body)
            if normalized_body:  # Only add if body is not empty
                functions[func_name] = normalized_body
    
    return functions

def normalize_content(content: str) -> str:
    """Normalize code content by removing whitespace, comments, and making case-insensitive."""
    # Remove comments (both // and /* */ style)
    content = re.sub(r'//.*?\n|/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove whitespace and make lowercase
    content = ''.join(content.split()).lower()
    return content

def get_file_content(filepath: str) -> str:
    """Get file content with different encodings."""
    encodings = ['utf-8', 'latin-1', 'cp1252']
    for encoding in encodings:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    return None

def find_duplicate_functions(shared_dir: str, similarity_threshold: float = 0.9):
    """Find duplicate functions across files in the shared directory."""
    # Dictionary to store function bodies and their locations
    function_locations = defaultdict(list)
    
    # Walk through all files
    for root, _, filenames in os.walk(shared_dir):
        for filename in filenames:
            if filename.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(root, filename)
                try:
                    content = get_file_content(filepath)
                    if content:
                        functions = extract_functions_from_ts(content)
                        for func_name, func_body in functions.items():
                            function_locations[func_body].append((filepath, func_name))
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

    # Print results
    print("\n=== Duplicate Functions ===")
    duplicates_found = False
    
    for func_body, locations in function_locations.items():
        if len(locations) > 1:
            duplicates_found = True
            print("\nDuplicate function found:")
            for filepath, func_name in locations:
                rel_path = Path(filepath).relative_to(shared_dir)
                print(f"  - {rel_path} -> function: {func_name}")
            print("-" * 80)

    if not duplicates_found:
        print("No duplicate functions found.")

if __name__ == "__main__":
    shared_dir = "shared"
    
    if not os.path.exists(shared_dir):
        print(f"Error: '{shared_dir}' directory not found!")
    else:
        print(f"Scanning for duplicate functions in '{shared_dir}' directory...")
        find_duplicate_functions(shared_dir)