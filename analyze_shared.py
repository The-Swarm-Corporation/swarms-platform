import os
import re
from pathlib import Path
from typing import Dict, Set, List

class FileAnalyzer:
    def __init__(self, root_dir: str, project_root: str):
        self.root_dir = Path(root_dir).resolve()
        self.project_root = Path(project_root).resolve()
        self.files: Dict[str, Set[str]] = {}  # file -> set of files that import it
        self.all_files: Set[str] = set()
        self.used_files: Set[str] = set()
        self.unused_files: Set[str] = set()

    def normalize_path(self, path: str) -> str:
        """Normalize a path to use forward slashes and no extension."""
        return str(Path(path)).replace('\\', '/')

    def scan_files(self):
        """Scan all files in the directory and build relationships."""
        print("Scanning shared directory...")
        # First, collect all files in shared directory
        for file_path in self.root_dir.rglob('*'):
            if file_path.is_file() and file_path.suffix in ['.ts', '.tsx', '.js', '.jsx', '.css']:
                rel_path = self.normalize_path(file_path.relative_to(self.root_dir))
                self.all_files.add(rel_path)
                self.files[rel_path] = set()

        print("Scanning project for imports...")
        # Then scan the entire project for imports
        for file_path in self.project_root.rglob('*'):
            if file_path.is_file() and file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                self._process_file_imports(file_path)

    def _process_file_imports(self, file_path: Path):
        """Process imports from a single file."""
        try:
            content = file_path.read_text(encoding='utf-8')
            rel_file_path = self.normalize_path(file_path.relative_to(self.project_root))
            
            # Common import patterns
            patterns = [
                # import statements
                r'import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+[\'"]([^\'"\s]+)[\'"]',
                # require statements
                r'require\([\'"]([^\'"\s]+)[\'"]\)',
                # dynamic imports
                r'import\([\'"]([^\'"\s]+)[\'"]\)',
                # from ... import statements
                r'from\s+[\'"]([^\'"\s]+)[\'"]',
            ]

            for pattern in patterns:
                matches = re.finditer(pattern, content)
                for match in matches:
                    import_path = match.group(1)
                    
                    # Handle different import formats
                    if import_path.startswith('@/shared/'):
                        import_path = import_path.replace('@/shared/', '')
                    elif import_path.startswith('@shared/'):
                        import_path = import_path.replace('@shared/', '')
                    elif import_path.startswith('shared/'):
                        import_path = import_path.replace('shared/', '')
                    elif import_path.startswith('.'):
                        # Handle relative imports
                        try:
                            full_path = (file_path.parent / import_path).resolve()
                            if str(self.root_dir) in str(full_path):
                                import_path = str(full_path.relative_to(self.root_dir))
                            else:
                                continue
                        except Exception:
                            continue
                    else:
                        continue

                    # Clean up the path
                    import_path = self.normalize_path(import_path)
                    import_path = re.sub(r'\.(ts|tsx|js|jsx)$', '', import_path)

                    # Try to find the actual file
                    found_file = self._find_matching_file(import_path)
                    if found_file:
                        self.files[found_file].add(rel_file_path)

        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    def _find_matching_file(self, import_path: str) -> str:
        """Find the actual file that matches an import path."""
        # Try direct file with extensions
        for ext in ['.ts', '.tsx', '.js', '.jsx', '.css']:
            file_path = f"{import_path}{ext}"
            if file_path in self.files:
                return file_path
            
            # Try with /index
            index_path = f"{import_path}/index{ext}"
            if index_path in self.files:
                return index_path
        
        return ""

    def analyze_usage(self):
        """Analyze file usage and populate used/unused files."""
        print("Analyzing file usage...")
        # First, mark all files that are directly imported
        for imported_file, importing_files in self.files.items():
            if importing_files:
                self.used_files.add(imported_file)
                
        # Then check for files that are dependencies of used files
        changed = True
        while changed:
            changed = False
            for file in self.used_files.copy():
                file_no_ext = re.sub(r'\.(ts|tsx|js|jsx|css)$', '', file)
                # Check for related files (like CSS files for components)
                for potential_file in self.all_files:
                    if potential_file not in self.used_files:
                        potential_no_ext = re.sub(r'\.(ts|tsx|js|jsx|css)$', '', potential_file)
                        if file_no_ext == potential_no_ext:
                            self.used_files.add(potential_file)
                            changed = True

        # Calculate unused files
        self.unused_files = self.all_files - self.used_files

    def generate_report(self) -> str:
        """Generate a detailed report of file usage."""
        report = []
        report.append("=== File Usage Analysis Report ===\n")
        
        report.append("=== Used Files ===")
        for file in sorted(self.used_files):
            used_by = self.files.get(file, set())
            report.append(f"\n{file}")
            if used_by:
                report.append("Used by:")
                for user in sorted(used_by):
                    report.append(f"  - {user}")
        
        report.append("\n=== Unused Files ===")
        for file in sorted(self.unused_files):
            report.append(f"  - {file}")
        
        return "\n".join(report)

def main():
    # Adjust these paths to your project structure
    project_root = "."  # Root of your project
    shared_dir = "./shared"  # Path to shared folder
    
    analyzer = FileAnalyzer(shared_dir, project_root)
    analyzer.scan_files()
    analyzer.analyze_usage()
    
    print("\nGenerating report...")
    report = analyzer.generate_report()
    
    # Write report to file
    with open('file_usage_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("\nReport generated in 'file_usage_report.txt'")
    print(f"Total files: {len(analyzer.all_files)}")
    print(f"Used files: {len(analyzer.used_files)}")
    print(f"Unused files: {len(analyzer.unused_files)}")

if __name__ == "__main__":
    main()