import os
import subprocess
import glob

folders = [
    ("src/assets/images", "*.jpg", 800, 6),
    ("public/themes", "*.jpg", 800, 6),
    ("public/tiers", "*.jpg", 800, 6),
]

total_before = 0
total_after = 0

for folder, pattern, max_size, quality in folders:
    if not os.path.exists(folder):
        continue
    files = glob.glob(os.path.join(folder, pattern))
    print(f"Optimizing {len(files)} images in {folder}...")
    for f in files:
        size_before = os.path.getsize(f)
        total_before += size_before
        tmp_out = f + ".tmp.jpg"
        
        cmd = [
            "ffmpeg", "-y", "-i", f,
            "-vf", f"scale='min({max_size},iw)':-2",
            "-q:v", str(quality),
            tmp_out
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res.returncode == 0 and os.path.exists(tmp_out):
            size_after = os.path.getsize(tmp_out)
            if size_after < size_before:
                os.replace(tmp_out, f)
                total_after += size_after
            else:
                os.remove(tmp_out)
                total_after += size_before
        else:
            if os.path.exists(tmp_out):
                os.remove(tmp_out)
            total_after += size_before

mb_before = round(total_before / (1024 * 1024), 2)
mb_after = round(total_after / (1024 * 1024), 2)
print(f"Image Optimization Complete: {mb_before} MB -> {mb_after} MB (Saved {round(mb_before - mb_after, 2)} MB)")
