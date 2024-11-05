# 현재 디렉토리가 git 저장소인지 확인하는 함수
function Check-GitRepo {
    if (-not (Test-Path .git)) {
        Write-Host "Error: Not a git repository. Please run 'git init' first." -ForegroundColor Red
        exit 1
    fi
}

# GitHub CLI가 설치되어 있는지 확인하는 함수
function Check-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Host "Error: GitHub CLI is not installed. Please install it first." -ForegroundColor Red
        exit 1
    }
}

# 이슈 목록 출력 함수
function List-Issues {
    Check-GitRepo
    Check-GhCli
    Write-Host "=== Open Issues ===" -ForegroundColor Green
    
    # JSON 형식으로 이슈를 가져와서 정렬 후 출력
    $issues = gh issue list --json number,title -q '.[] | {number: .number, title: .title}' | ConvertFrom-Json
    $issues | Sort-Object {[int]$_.number} | ForEach-Object {
        Write-Host ("#" + $_.number.ToString().PadRight(3) + " " + $_.title)
    }
}

# 나머지 함수들은 이전과 동일...
function Create-Branch {
    Check-GitRepo
    Check-GhCli
    
    # 이슈 목록 출력
    List-Issues
    
    # 이슈 번호 입력 받기
    $issueNumber = Read-Host "Select issue number"
    
    # 이슈 정보 가져오기
    try {
        $issueTitle = gh issue view $issueNumber --json title -q .title
    }
    catch {
        Write-Host "Error: Failed to fetch issue information. Please check the issue number." -ForegroundColor Red
        exit 1
    }
    
    # 이슈 제목에서 FE/BE 구분 추출
    if ($issueTitle -match "\[FE\]") {
        $type = "fe"
        $sourceBranch = "dev-fe"
    }
    elseif ($issueTitle -match "\[BE\]") {
        $type = "be"
        $sourceBranch = "dev-be"
    }
    else {
        Write-Host "Error: Issue title must start with [FE] or [BE]" -ForegroundColor Red
        exit 1
    }
    
    # 브랜치 이름 생성
    $branchName = "feature-$type-#$issueNumber"
    
    # source 브랜치 존재 여부 확인
    if (-not (git rev-parse --verify $sourceBranch 2>$null)) {
        Write-Host "Error: Source branch '$sourceBranch' does not exist" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Creating and switching to branch: $branchName from $sourceBranch" -ForegroundColor Cyan
    
    # source 브랜치로 전환
    git checkout $sourceBranch
    
    # source 브랜치 최신화
    git pull origin $sourceBranch
    
    # 새 브랜치 생성 및 전환
    git checkout -b $branchName
    
    Write-Host "Successfully created and switched to branch: $branchName" -ForegroundColor Green
}

# 메인 로직
switch ($args[0]) {
    "list" { 
        List-Issues 
    }
    "branch" { 
        Create-Branch 
    }
    default { 
        Write-Host "Usage: agt {list|branch}" -ForegroundColor Yellow
        exit 1
    }
}