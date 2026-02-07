
$indexFile = "c:\Users\Blair\Downloads\Homemaker Suite\app\public\library_index.json"
$contentBase = "c:\Users\Blair\Downloads\Homemaker Suite\app\public\content"

if (-not (Test-Path $indexFile)) {
    Write-Error "Index file not found!"
    exit
}

$json = Get-Content $indexFile -Raw | ConvertFrom-Json
$missingFiles = @()

foreach ($folder in $json.PSObject.Properties.Name) {
    echo "Checking folder: $folder"
    foreach ($file in $json.$folder) {
        $fullPath = Join-Path $contentBase $folder $file
        if (-not (Test-Path $fullPath)) {
            $missingFiles += "$folder/$file"
            echo "MISSING: $folder/$file"
        }
    }
}

if ($missingFiles.Count -eq 0) {
    echo "All files in index found on disk."
} else {
    echo "Found $($missingFiles.Count) missing files."
}
