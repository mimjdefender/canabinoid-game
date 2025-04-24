# Create audio directory if it doesn't exist
$audioDir = ".\audio"
if (-not (Test-Path $audioDir)) {
    New-Item -ItemType Directory -Path $audioDir
}

# Download URLs (these are example URLs - we'll need to replace with actual ones)
$urls = @{
    "bgm.mp3" = "https://incompetech.com/music/royalty-free/mp3-royaltyfree/FloatingCities.mp3"
    "shoot.mp3" = "https://freesound.org/data/previews/151/151022_2703725-lq.mp3"
    "hit.mp3" = "https://freesound.org/data/previews/171/171671_2437358-lq.mp3"
    "miss.mp3" = "https://freesound.org/data/previews/244/244954_4486188-lq.mp3"
    "switch.mp3" = "https://freesound.org/data/previews/264/264828_4486188-lq.mp3"
}

# Download each file
foreach ($file in $urls.Keys) {
    $url = $urls[$file]
    $output = Join-Path $audioDir $file
    Write-Host "Downloading $file..."
    Invoke-WebRequest -Uri $url -OutFile $output
}

Write-Host "All audio files downloaded successfully!" 