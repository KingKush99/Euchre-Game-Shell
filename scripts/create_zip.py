import os
import zipfile

def create_project_zip(output_path=None):
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    output_zip = output_path or "/tmp/euchre-paradise-source.zip"
    
    # Exclude directories
    exclude_dirs = {
        "node_modules",
        ".git",
        ".aistudio",
        "dist",
        "build",
        "coverage",
        ".cache",
    }
    
    exclude_files = {
        "euchre-paradise-source.zip",
        ".DS_Store",
    }
    
    print(f"Creating project zip from {root_dir}...")
    file_count = 0
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Prune excluded directories
            dirnames[:] = [d for d in dirnames if d not in exclude_dirs and not d.startswith(".")]
            
            for filename in filenames:
                if filename in exclude_files or filename.endswith(".log"):
                    continue
                filepath = os.path.join(dirpath, filename)
                arcname = os.path.relpath(filepath, root_dir)
                zf.write(filepath, arcname)
                file_count += 1
                
    size_mb = round(os.path.getsize(output_zip) / (1024 * 1024), 2)
    print(f"Successfully packaged {file_count} files into {output_zip} ({size_mb} MB)")
    return output_zip

if __name__ == "__main__":
    create_project_zip()
