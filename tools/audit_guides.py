import os
import re
import csv

def audit_guides(root_dir):
    results = []
    
    # regex for frontmatter
    frontmatter_re = re.compile(r'^---\n(.*?)\n---', re.DOTALL | re.MULTILINE)
    # regex for image links
    img_re = re.compile(r'!\[.*?\]\((.*?)\)')
    
    for dir_name in os.listdir(root_dir):
        if re.match(r'^\d+', dir_name): # Numbered directories
            dir_path = os.path.join(root_dir, dir_name)
            if os.path.isdir(dir_path):
                for filename in os.listdir(dir_path):
                    if filename.endswith('.md'):
                        file_path = os.path.join(dir_path, filename)
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                            # 1. Check Frontmatter
                            fm_match = frontmatter_re.match(content)
                            has_metadata = 1 if fm_match else 0
                            
                            # 2. Word Count
                            word_count = len(content.split())
                            
                            # 3. Image Count
                            images = img_re.findall(content)
                            img_count = len(images)
                            
                            # 4. Resources section
                            has_resources = 1 if 'References' in content or 'Resources' in content else 0
                            
                            # 5. Rating (Calculated heuristic 1-5)
                            # Weight: metadata(1), word count(2), images(1), resources(1)
                            score = 0
                            if has_metadata: score += 1
                            if word_count > 500: score += 2
                            elif word_count > 200: score += 1
                            if img_count > 0: score += 1
                            if has_resources: score += 1
                            
                            results.append({
                                'Module': dir_name,
                                'File': filename,
                                'Has_Metadata': has_metadata,
                                'Word_Count': word_count,
                                'Img_Count': img_count,
                                'Has_Resources': has_resources,
                                'Quality_Score': max(1, score)
                            })
                            
    return results

if __name__ == "__main__":
    root = r"C:\Users\Blair\Downloads\Homemaker Suite"
    audit_data = audit_guides(root)
    
    output_path = r"C:\Users\Blair\.gemini\antigravity\brain\0a4b4cde-8b76-4a92-a067-19f58e114e03\guides_audit_report.csv"
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Module', 'File', 'Has_Metadata', 'Word_Count', 'Img_Count', 'Has_Resources', 'Quality_Score']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in audit_data:
            writer.writerow(row)
            
    print(f"Audit complete. Report saved to {output_path}")
    print(f"Total guides audited: {len(audit_data)}")
    
    # Print summary
    avg_score = sum(r['Quality_Score'] for r in audit_data) / len(audit_data)
    print(f"Average Quality Score: {avg_score:.2f}/5")
