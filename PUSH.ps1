$ErrorActionPreference='Stop'
$source=$PSScriptRoot
$publish='D:\DETLENG2\humanpotential-detleng-publish'
$remote='https://github.com/Navid-Ishaq/humanpotential-detleng.git'
$files=@('index.html','styles.css','app.js','content.js','journey-data.js','README.md','TESTING.md','CNAME','PUSH.ps1','assets/fonts/NotoNaskhArabic.ttf','assets/fonts/OFL.txt','assets/favicon.svg','assets/potential-dawn.png','assets/potential-doors.png','assets/potential-lantern.png')
foreach($file in $files){if(!(Test-Path -LiteralPath (Join-Path $source $file))){throw "Missing file: $file"}}
if(!(Test-Path -LiteralPath $publish)){git clone $remote $publish;if($LASTEXITCODE -ne 0){throw 'Clone failed.'}}
Set-Location -LiteralPath $publish
$origin=git remote get-url origin
if($LASTEXITCODE -ne 0 -or $origin -ne $remote){throw 'Unexpected repository.'}
$changes=git status --porcelain
if($LASTEXITCODE -ne 0){throw 'Cannot read Git status.'}
if($changes){throw 'Publish checkout has uncommitted changes. Review first.'}
git checkout main
if($LASTEXITCODE -ne 0){throw 'Cannot select main.'}
git pull --rebase origin main
if($LASTEXITCODE -ne 0){throw 'Pull failed.'}
foreach($file in $files){$dest=Join-Path $publish $file;New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force | Out-Null;Copy-Item -LiteralPath (Join-Path $source $file) -Destination $dest -Force}
git add -- $files
if($LASTEXITCODE -ne 0){throw 'Staging failed.'}
git diff --cached --quiet
$diffCode=$LASTEXITCODE
if($diffCode -eq 1){git commit -m "Build multilingual guided Human Potential journey";if($LASTEXITCODE -ne 0){throw 'Commit failed.'}}elseif($diffCode -ne 0){throw 'Git diff failed.'}
git push origin main
if($LASTEXITCODE -ne 0){throw 'Push failed.'}
Write-Host 'Human Potential push complete!' -ForegroundColor Green

