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
    fi
}

# 도움말 출력 함수
function Print-Help {
    Write-Host "AGT - Automatic Git & Github Tool" -ForegroundColor Cyan
    Write-Host
    Write-Host "Usage: agt <command>" -ForegroundColor Yellow
    Write-Host
    Write-Host "Available Commands:" -ForegroundColor White
    Write-Host "  list     List all open issues in current repository, sorted by issue number"
    Write-Host "  branch   Create and switch to a new feature branch based on issue number"
    Write-Host "           Format: feature-{fe|be}-#{issue-number}"
    Write-Host "  pr       Create a pull request from current feature branch"
    Write-Host
    Write-Host "Command Details:" -ForegroundColor White
    Write-Host "  list:"
    Write-Host "    - Shows all open issues in the current repository"
    Write-Host "    - Issues are sorted by number"
    Write-Host "    - No additional arguments required"
    Write-Host
    Write-Host "  branch:"
    Write-Host "    - Shows list of open issues and prompts for issue number"
    Write-Host "    - Creates a new branch from dev-fe or dev-be based on issue prefix"
    Write-Host "    - Automatically switches to the new branch"
    Write-Host "    - Branch naming convention: feature-fe-#1 or feature-be-#1"
    Write-Host
    Write-Host "  pr:"
    Write-Host "    - Creates a pull request from current feature branch"
    Write-Host "    - PR title will match the issue title"
    Write-Host "    - Adds reviewers from CODEOWNERS automatically"
    Write-Host "    - Uses pull request template from .github/pull_request_template.md"
    Write-Host "    - Automatically links PR with issue for auto-close on merge"
    Write-Host
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  agt list"
    Write-Host "  agt branch"
    Write-Host "  agt pr"
}

# 이슈 목록 출력 함수
function List-Issues {
    Check-GitRepo
    Check-GhCli
    Write-Host "=== Open Issues ===" -ForegroundColor Green
    
    # 이슈 목록 가져와서 정렬
    $issues = gh issue list --json number,title -q '.[] | {number: .number, title: .title}' | ConvertFrom-Json
    $issues | Sort-Object { [int]$_.number } | ForEach-Object {
        Write-Host ("#" + $_.number.ToString().PadRight(3) + " " + $_.title)
    }
}

# 브랜치 생성 함수
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

# PR 생성 함수
function Create-PR {
    Check-GitRepo
    Check-GhCli
    
    # 현재 브랜치 확인
    $currentBranch = git branch --show-current
    
    # feature 브랜치가 아닌 경우 종료
    if ($currentBranch -notmatch '^feature-(fe|be)-#\d+$') {
        Write-Host "Error: Current branch is not a feature branch" -ForegroundColor Red
        exit 1
    }
    
    # 브랜치 정보에서 이슈 번호와 타입 추출
    $issueNumber = [regex]::Match($currentBranch, '#(\d+)$').Groups[1].Value
    $branchType = if ($currentBranch -match 'feature-(fe|be)') { $matches[1] }
    
    # 이슈 제목 가져오기
    $issueTitle = gh issue view $issueNumber --json title -q .title
    
    # base 브랜치 결정
    $baseBranch = "dev-$branchType"
    
    # CODEOWNERS 파일에서 리뷰어 목록 가져오기
    $codeowners = gh api /repos/:owner/:repo/contents/.github/CODEOWNERS --jq '.content' | 
                  [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_))
    $currentUser = gh api /user --jq '.login'
    $reviewers = $codeowners -split "`n" | 
                Where-Object { $_ -match '@[\w-]+' } |